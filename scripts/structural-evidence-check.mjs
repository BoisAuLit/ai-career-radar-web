#!/usr/bin/env node
// AgentOps-5e-followup-baseline-lint-implement · phase 1 standalone CLI.
//
// Deterministic structural-evidence validator for AI Career Radar reports.
// - No network, no LLM, no report rewriting, no retries.
// - Zero dependencies (Node stdlib only).
// - Independent of scripts/quote-integrity-check.mjs; parser semantics for
//   the recognized `Evidence quote:` line and the `## Evidence Appendix`
//   heading mirror the checker but the checker file is NOT modified.
// - Emits a structural_evidence_summary.json artifact via temp+rename.
// - Verdict precedence: tool_error > not_evaluable > RED > AMBER > GREEN.
// - Exit codes:
//     0 — GREEN, AMBER, or not_evaluable telemetry generated
//     1 — RED structural result generated
//     2 — tool/config/input error (nothing overwritten)
//
// CLI:
//   node scripts/structural-evidence-check.mjs \
//     --report <report.md path> \
//     --output <structural_evidence_summary.json path> \
//     [--fixture <A|B|C|D|E>] [--source-run-id <id>] [--help]

import {
  readFileSync,
  writeFileSync,
  renameSync,
  mkdirSync,
  existsSync,
  unlinkSync,
} from "node:fs";
import { dirname, join } from "node:path";
import process from "node:process";

const SCHEMA_VERSION = "0.1-phase1";
const IMPL_ID = "structural-evidence-check.mjs@0.1-phase1";

const USAGE = `usage:
  node scripts/structural-evidence-check.mjs \\
    --report <report.md path> \\
    --output <structural_evidence_summary.json path> \\
    [--fixture <A|B|C|D|E>] [--source-run-id <id>] [--help]

exit codes:
  0 — GREEN, AMBER, or not_evaluable (telemetry emitted)
  1 — RED structural result (telemetry emitted)
  2 — tool/config/input error (nothing overwritten)`;

function printUsage(stream = process.stdout) {
  stream.write(USAGE + "\n");
}

function fatalCli(message) {
  process.stderr.write(`structural-evidence-check: ${message}\n`);
  printUsage(process.stderr);
  process.exit(2);
}

// -------- Argument parsing --------
function parseArgs(argv) {
  const knownFlags = new Set([
    "--report",
    "--output",
    "--fixture",
    "--source-run-id",
    "--help",
    "-h",
  ]);
  const out = { report: null, output: null, fixture: null, sourceRunId: null };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--help" || a === "-h") {
      printUsage();
      process.exit(0);
    }
    if (!knownFlags.has(a)) {
      fatalCli(`unknown argument: ${a}`);
    }
    if (a === "--report") {
      const v = argv[++i];
      if (!v || v.startsWith("--")) fatalCli(`missing value for ${a}`);
      out.report = v;
    } else if (a === "--output") {
      const v = argv[++i];
      if (!v || v.startsWith("--")) fatalCli(`missing value for ${a}`);
      out.output = v;
    } else if (a === "--fixture") {
      const v = argv[++i];
      if (!v || v.startsWith("--")) fatalCli(`missing value for ${a}`);
      if (!/^[A-E]$/.test(v)) fatalCli(`invalid --fixture: ${v}`);
      out.fixture = v;
    } else if (a === "--source-run-id") {
      const v = argv[++i];
      if (!v || v.startsWith("--")) fatalCli(`missing value for ${a}`);
      out.sourceRunId = v;
    }
  }
  if (!out.report) fatalCli("missing required --report");
  if (!out.output) fatalCli("missing required --output");
  return out;
}

// -------- Structural constants --------
const APPENDIX_HEADING = "## Evidence Appendix";
const GAP_SECTION_HEADING_PATTERN = /^##\s+Your top 5 gaps\b/im;
const EVIDENCE_QUOTE_REGEX =
  /Evidence quote:\s*["“]([^"”\n]{5,})["”]\s*[—–\-]\s*([^,\n]{1,120}?),\s*(jd_\d{4,})/g;
const REQUIRED_GAP_COUNT = 5;
const MIN_CITATION_LINE_COUNT = 5;

// Explicit synthetic markers for tests only — allow deterministic
// classification of insufficient/empty capture. These are opt-in by
// test fixtures; they never affect real reports because real reports
// never contain these tokens.
const EXPLICIT_TRUNCATION_MARKER = "<!-- STRUCTURAL_EVIDENCE_TRUNCATED -->";

// -------- Section extraction --------
function extractGapSection(text) {
  const m = text.match(GAP_SECTION_HEADING_PATTERN);
  if (!m) return null;
  const start = m.index + m[0].length;
  // Section ends at next `## ` heading (any subsequent H2) or EOF.
  const tail = text.slice(start);
  const nextHeading = tail.search(/^##\s+/m);
  const sectionEnd = nextHeading < 0 ? tail.length : nextHeading;
  return {
    start,
    end: start + sectionEnd,
    text: tail.slice(0, sectionEnd),
  };
}

function parseGaps(sectionText) {
  // Numbered items: line-start `1.` .. `9.` followed by whitespace.
  // We record the position of each numbered heading and slice items.
  const lines = sectionText.split(/\r?\n/);
  const numberedIndexes = [];
  for (let i = 0; i < lines.length; i++) {
    const m = /^(\d+)\.\s+\S/.exec(lines[i]);
    if (m) numberedIndexes.push({ lineIdx: i, gapNumber: Number(m[1]) });
  }
  // Build per-gap blocks by slicing between numbered items.
  const gaps = [];
  for (let k = 0; k < numberedIndexes.length; k++) {
    const cur = numberedIndexes[k];
    const nextLine = k + 1 < numberedIndexes.length
      ? numberedIndexes[k + 1].lineIdx
      : lines.length;
    const block = lines.slice(cur.lineIdx, nextLine).join("\n");
    gaps.push({ gapNumber: cur.gapNumber, block });
  }
  return gaps;
}

// -------- Citation parsing --------
function extractEvidenceQuoteMatches(text) {
  const results = [];
  // Fresh regex per call (avoid stale lastIndex).
  const re = new RegExp(EVIDENCE_QUOTE_REGEX.source, "g");
  let m;
  while ((m = re.exec(text)) !== null) {
    results.push({
      raw: m[0],
      quote: m[1],
      cited_company: m[2].trim(),
      cited_jd_id: m[3],
    });
  }
  return results;
}

// A single line that *looks like* an attempted Evidence quote citation
// but does not match the exact recognized shape. Used to detect
// "malformed required citation line" RED conditions.
function looksLikeMalformedCitation(line) {
  // "Evidence quote:" prefix present but does not match the exact regex.
  if (!/^\s*Evidence quote:/.test(line)) return false;
  const re = new RegExp(EVIDENCE_QUOTE_REGEX.source);
  return !re.test(line);
}

// -------- Appendix parsing --------
function extractAppendix(text) {
  const idx = text.indexOf(APPENDIX_HEADING);
  if (idx === -1) return { present: false, heading_exact: false, rows: [], malformed_rows: [], duplicate_rows: [], conflicting_rows: [] };
  // Confirm exact heading (start of line).
  const headingLineStart = text.lastIndexOf("\n", idx) + 1;
  const headingLineEnd = text.indexOf("\n", idx);
  const headingLine = text.slice(headingLineStart, headingLineEnd === -1 ? text.length : headingLineEnd).trim();
  const heading_exact = headingLine === APPENDIX_HEADING;

  const tail = text.slice(idx + APPENDIX_HEADING.length);
  const lines = tail.split(/\r?\n/).map((l) => l.replace(/\s+$/, "")); // trim trailing whitespace only

  const rows = [];
  const malformed = [];
  const seen = new Map(); // jd_id -> [company, title]
  const dupIdentical = [];
  const conflicting = [];

  for (const rawLine of lines) {
    const trimmedLeft = rawLine.replace(/^\s+/, "");
    if (!trimmedLeft) continue; // blank line
    // Optional header row starting with JD_ID or jd_id header.
    if (/^JD_ID\b/i.test(trimmedLeft)) continue;
    // Stop the table when a new `## ` heading appears.
    if (/^##\s+/.test(trimmedLeft)) break;

    // Canonical row: tab-separated with exactly 3 columns.
    const parts = trimmedLeft.split("\t");
    if (parts.length === 3 && /^jd_\d{4,}$/i.test(parts[0]) && parts[1] && parts[2]) {
      const jdId = parts[0];
      const company = parts[1].trim();
      const title = parts[2].trim();
      const rowSig = `${jdId}\t${company}\t${title}`;
      if (seen.has(jdId)) {
        const prev = seen.get(jdId);
        if (prev.company === company && prev.title === title) {
          dupIdentical.push({ jd_id: jdId, company, title });
        } else {
          conflicting.push({
            jd_id: jdId,
            previous: { company: prev.company, title: prev.title },
            current: { company, title },
          });
        }
      } else {
        seen.set(jdId, { company, title });
        rows.push({ jd_id: jdId, company, title });
      }
      continue;
    }

    // Not a canonical row; treat as malformed if it looks jd-like.
    if (/^jd_\d/i.test(trimmedLeft)) {
      malformed.push({ raw: rawLine });
    }
    // Non jd-like lines (prose paragraphs) are ignored deterministically
    // to allow harmless surrounding text.
  }

  return {
    present: true,
    heading_exact,
    rows,
    malformed_rows: malformed,
    duplicate_rows: dupIdentical,
    conflicting_rows: conflicting,
  };
}

// -------- Verdict aggregation --------
function computeVerdict(body, appendix) {
  const red = [];
  const amber = [];
  const notEvaluable = [];

  const { gapSectionPresent, gaps, citationsInGapSection, malformedCitationLines } = body;

  // Structure checks
  if (!gapSectionPresent) {
    red.push("gap_section_missing_or_unrecognized");
  } else {
    if (gaps.length !== REQUIRED_GAP_COUNT) {
      red.push(`observed_gap_count_${gaps.length}_not_5`);
    }
    // Per-gap coverage
    const uncovered = gaps.filter((g) => g.citations.length === 0).map((g) => g.gapNumber);
    if (uncovered.length > 0) {
      red.push(`uncovered_gaps=${uncovered.join(",")}`);
    }
  }
  if (citationsInGapSection.length < MIN_CITATION_LINE_COUNT) {
    red.push(`citation_line_count=${citationsInGapSection.length}_lt_${MIN_CITATION_LINE_COUNT}`);
  }
  if (malformedCitationLines.length > 0) {
    red.push("malformed_required_citation_line");
  }

  // Appendix checks
  if (!appendix.present) {
    red.push("evidence_appendix_missing");
  } else {
    if (!appendix.heading_exact) {
      red.push("evidence_appendix_heading_not_exact");
    }
    if (appendix.malformed_rows.length > 0) {
      red.push(`malformed_appendix_rows=${appendix.malformed_rows.length}`);
    }
    if (appendix.conflicting_rows.length > 0) {
      red.push(`conflicting_appendix_rows=${appendix.conflicting_rows.length}`);
    }
    if (appendix.duplicate_rows.length > 0) {
      amber.push(`duplicate_identical_appendix_rows=${appendix.duplicate_rows.length}`);
    }
  }

  // Body ↔ Appendix consistency
  const bodyJdIds = Array.from(
    new Set(citationsInGapSection.map((c) => c.cited_jd_id))
  );
  const appendixJdIds = appendix.present ? appendix.rows.map((r) => r.jd_id) : [];
  const missingFromAppendix = bodyJdIds.filter((id) => !appendixJdIds.includes(id));
  const appendixNotCited = appendixJdIds.filter((id) => !bodyJdIds.includes(id));

  if (missingFromAppendix.length > 0) {
    red.push(`body_cited_jd_ids_missing_from_appendix=${missingFromAppendix.join(",")}`);
  }
  if (appendixNotCited.length > 0) {
    amber.push(`appendix_entries_not_cited=${appendixNotCited.join(",")}`);
  }

  // Within-gap redundancy (identical duplicate citation line within same gap)
  for (const g of gaps) {
    const seen = new Map();
    for (const c of g.citations) {
      const sig = `${c.cited_jd_id}${c.quote}`;
      seen.set(sig, (seen.get(sig) || 0) + 1);
    }
    const identicalDupCount = Array.from(seen.values()).reduce(
      (n, v) => n + (v > 1 ? v - 1 : 0),
      0
    );
    g.redundant_identical_citation_count = identicalDupCount;
    if (identicalDupCount > 0) {
      amber.push(`identical_duplicate_citation_within_gap_${g.gapNumber}`);
    }
  }

  // Redundant excess citations: >5 total AND all extras are identical to a
  // prior citation in the same gap (already accounted for above) OR the
  // extras concentrated in one gap with no new information.
  if (citationsInGapSection.length > MIN_CITATION_LINE_COUNT) {
    // Only flag AMBER if extras are duplicates; otherwise extra distinct
    // citations remain GREEN per DECISION Q7.
    const totalIdenticalDup = gaps.reduce(
      (n, g) => n + (g.redundant_identical_citation_count || 0),
      0
    );
    if (totalIdenticalDup > 0) {
      amber.push(
        `redundant_excess_citations_total=${citationsInGapSection.length}_gt_${MIN_CITATION_LINE_COUNT}`
      );
    }
  }

  // Verdict precedence: not_evaluable > RED > AMBER > GREEN (tool_error
  // handled before this function).
  let verdict = "green";
  if (notEvaluable.length > 0) verdict = "not_evaluable";
  else if (red.length > 0) verdict = "red";
  else if (amber.length > 0) verdict = "amber";

  return {
    verdict,
    red_reasons: red,
    amber_reasons: amber,
    not_evaluable_reasons: notEvaluable,
    bodyJdIds,
    appendixJdIds,
    missingFromAppendix,
    appendixNotCited,
  };
}

// -------- Atomic write --------
function atomicWriteJson(outputPath, obj) {
  const dir = dirname(outputPath);
  if (dir && dir !== "." && !existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  const tmp = `${outputPath}.tmp-${process.pid}`;
  writeFileSync(tmp, JSON.stringify(obj, null, 2) + "\n", "utf8");
  renameSync(tmp, outputPath);
}

// -------- Main --------
function main(argv) {
  const args = parseArgs(argv);

  // Read report (tool_error if missing/unreadable).
  let reportText;
  try {
    reportText = readFileSync(args.report, "utf8");
  } catch (err) {
    process.stderr.write(
      `structural-evidence-check: cannot read --report ${args.report}: ${err.message}\n`
    );
    process.exit(2);
  }

  const startedAt = Date.now();

  // not_evaluable: empty body OR explicit truncation marker present.
  if (reportText.trim().length === 0) {
    const artifact = baseArtifact(args, reportText, startedAt, {
      verdict: "not_evaluable",
      not_evaluable_reasons: ["report_body_empty"],
    });
    tryEmit(args.output, artifact);
    process.stdout.write(
      `structural-evidence-check verdict=not_evaluable reason=empty_body\n`
    );
    process.exit(0);
  }
  if (reportText.includes(EXPLICIT_TRUNCATION_MARKER)) {
    const artifact = baseArtifact(args, reportText, startedAt, {
      verdict: "not_evaluable",
      not_evaluable_reasons: ["explicit_truncation_marker"],
    });
    tryEmit(args.output, artifact);
    process.stdout.write(
      `structural-evidence-check verdict=not_evaluable reason=truncation_marker\n`
    );
    process.exit(0);
  }

  // Extract gap section + parse gaps + citations.
  const section = extractGapSection(reportText);
  const gapSectionPresent = section !== null;
  const gapObjs = gapSectionPresent ? parseGaps(section.text) : [];
  const citationsInGapSection = gapSectionPresent
    ? extractEvidenceQuoteMatches(section.text)
    : [];

  // Detect malformed required citation lines: lines starting with
  // `Evidence quote:` in gap section that do NOT match recognized shape.
  const malformedCitationLines = [];
  if (gapSectionPresent) {
    for (const line of section.text.split(/\r?\n/)) {
      if (looksLikeMalformedCitation(line)) {
        malformedCitationLines.push(line.trim().slice(0, 120));
      }
    }
  }

  // Attribute citations to gaps by re-scanning each gap block.
  for (const g of gapObjs) {
    g.citations = extractEvidenceQuoteMatches(g.block);
    g.cited_jd_ids = Array.from(new Set(g.citations.map((c) => c.cited_jd_id)));
    g.covered = g.citations.length > 0;
  }

  const body = {
    gapSectionPresent,
    gaps: gapObjs,
    citationsInGapSection,
    malformedCitationLines,
  };

  const appendix = extractAppendix(reportText);

  const { verdict, red_reasons, amber_reasons, not_evaluable_reasons, bodyJdIds, appendixJdIds, missingFromAppendix, appendixNotCited } = computeVerdict(body, appendix);

  const artifact = baseArtifact(args, reportText, startedAt, {
    verdict,
    red_reasons,
    amber_reasons,
    not_evaluable_reasons,
    body,
    appendix,
    bodyJdIds,
    appendixJdIds,
    missingFromAppendix,
    appendixNotCited,
  });

  tryEmit(args.output, artifact);

  const line = `structural-evidence-check verdict=${verdict} gaps=${gapObjs.length}/${REQUIRED_GAP_COUNT} citations=${citationsInGapSection.length} covered=${gapObjs.filter((g) => g.covered).length}/${REQUIRED_GAP_COUNT} appendix=${appendix.present ? appendix.rows.length : "absent"} red=${red_reasons.length} amber=${amber_reasons.length}\n`;
  process.stdout.write(line);

  if (verdict === "red") process.exit(1);
  process.exit(0);
}

function tryEmit(output, artifact) {
  try {
    atomicWriteJson(output, artifact);
  } catch (err) {
    process.stderr.write(
      `structural-evidence-check: cannot write --output ${output}: ${err.message}\n`
    );
    process.exit(2);
  }
}

function baseArtifact(args, reportText, startedAt, extras) {
  const duration_ms = Date.now() - startedAt;
  const per_gap = (extras.body?.gaps || []).map((g) => ({
    gap_number: g.gapNumber,
    present: true,
    citation_count: g.citations.length,
    cited_jd_ids: g.cited_jd_ids || [],
    covered: g.covered,
    redundant_identical_citation_count: g.redundant_identical_citation_count || 0,
  }));
  const covered_gap_count = per_gap.filter((g) => g.covered).length;
  const uncovered_gap_numbers = per_gap.filter((g) => !g.covered).map((g) => g.gap_number);

  return {
    schema_version: SCHEMA_VERSION,
    verdict: extras.verdict,
    blocking_mode: "telemetry_only",
    report_path: args.report,
    checker_commit: IMPL_ID,
    generated_at: new Date(startedAt).toISOString(),
    duration_ms,
    fixture: args.fixture || null,
    source_run_id: args.sourceRunId || null,
    required_gap_count: REQUIRED_GAP_COUNT,
    observed_gap_count: (extras.body?.gaps || []).length,
    recognized_citation_line_count: (extras.body?.citationsInGapSection || []).length,
    unique_cited_jd_count: extras.bodyJdIds ? extras.bodyJdIds.length : 0,
    per_gap,
    covered_gap_count,
    uncovered_gap_numbers,
    appendix: extras.appendix
      ? {
          present: extras.appendix.present,
          heading_exact: extras.appendix.heading_exact,
          row_count: extras.appendix.rows.length,
          unique_jd_count: extras.appendixJdIds ? extras.appendixJdIds.length : 0,
          jd_ids: extras.appendixJdIds || [],
          malformed_rows: extras.appendix.malformed_rows || [],
          duplicate_rows: extras.appendix.duplicate_rows || [],
          conflicting_rows: extras.appendix.conflicting_rows || [],
        }
      : { present: false, heading_exact: false, row_count: 0, unique_jd_count: 0, jd_ids: [], malformed_rows: [], duplicate_rows: [], conflicting_rows: [] },
    body_appendix: {
      missing_from_appendix: extras.missingFromAppendix || [],
      appendix_not_cited: extras.appendixNotCited || [],
    },
    parser_ambiguities: [],
    red_reasons: extras.red_reasons || [],
    amber_reasons: extras.amber_reasons || [],
    not_evaluable_reasons: extras.not_evaluable_reasons || [],
    tool_errors: [],
    source_rewritten: false,
    network_used: false,
    llm_used: false,
  };
}

main(process.argv);
