#!/usr/bin/env node
// scripts/quote-integrity-check.mjs
// AgentOps-5c · quote-integrity integration prototype.
//
// Deterministic quote-integrity checker for AI Career Radar reports.
// - No LLM / API / network.
// - No edit-distance matching.
// - No LLM judge.
// - Reads report.md + cleaned served corpus JSON read-only.
// - Emits quote_integrity_summary.json to --out path.
// - Source of truth = cleaned served corpus body (web_bundle.records[].body),
//   NOT raw live job pages, NOT legal/original web text.
//
// CLI:
//   node scripts/quote-integrity-check.mjs \
//     --report <path> \
//     --corpus src/data/web_bundle.json \
//     --out    <path> \
//     [--fixture <id>] [--source-run-id <id>] [--help]

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

const USAGE = `usage:
  node scripts/quote-integrity-check.mjs \\
    --report <report.md path> \\
    --corpus <web_bundle.json path> \\
    --out <quote_integrity_summary.json path> \\
    [--fixture <A|B|C|D|E>] [--source-run-id <id>] [--help]`;

function parseArgs(argv) {
  const out = {};
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--help" || a === "-h") {
      out.help = true;
      continue;
    }
    if (a.startsWith("--")) {
      const key = a.slice(2);
      const val = argv[i + 1];
      if (val !== undefined && !val.startsWith("--")) {
        out[key] = val;
        i++;
      } else {
        out[key] = true;
      }
    }
  }
  return out;
}

const args = parseArgs(process.argv);
if (args.help) {
  console.log(USAGE);
  process.exit(0);
}

if (!args.report || !args.corpus || !args.out) {
  console.error("error: --report, --corpus, and --out are required\n");
  console.error(USAGE);
  process.exit(2);
}

// -------- corpus loader --------
function loadCorpus(path) {
  const raw = JSON.parse(readFileSync(path, "utf8"));
  const records = Array.isArray(raw) ? raw : raw.records || [];
  const byId = new Map();
  for (const r of records) {
    if (r && typeof r === "object" && r.id && r.body) byId.set(r.id, r);
  }
  return { records, byId };
}

// -------- text normalization --------
// Tier A: preserve case; normalize whitespace, curly quotes, dashes, ellipsis, and pipe-newline artifact.
function normalize(s) {
  return String(s)
    .replace(/[“”]/g, '"') // curly double → straight
    .replace(/[‘’]/g, "'") // curly single → straight
    .replace(/[–—]/g, "-") // en/em dash → hyphen
    .replace(/…/g, "...")            // Unicode ellipsis → literal
    .replace(/\|/g, "\n")                    // pipe-newline artifact
    .replace(/\s+/g, " ")
    .trim();
}

// Tier B: lowercase after normalize.
function normalizeCI(s) {
  return normalize(s).toLowerCase();
}

// -------- Evidence Appendix extraction --------
function extractAppendix(text) {
  const idx = text.indexOf("Evidence Appendix");
  if (idx === -1) return { present: false, entries: [] };
  const tail = text.slice(idx + "Evidence Appendix".length);
  const lines = tail.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const entries = [];
  for (const line of lines) {
    if (/^JD_ID/i.test(line)) continue;
    // Footer emoji row terminates the table.
    if (/^[\u{1F4CB}\u{2B07}️\u{1F4CA}↺]/u.test(line)) break;
    const parts = line.split("\t").map((p) => p.trim()).filter(Boolean);
    if (parts.length >= 3 && /^jd_/i.test(parts[0])) {
      entries.push({ jd_id: parts[0], company: parts[1], title: parts.slice(2).join(" ") });
      continue;
    }
    if (parts.length === 1 && /^jd_/i.test(parts[0])) {
      const alt = line.split(/\s{2,}|\|/).map((p) => p.trim()).filter(Boolean);
      if (alt.length >= 3) entries.push({ jd_id: alt[0], company: alt[1], title: alt.slice(2).join(" ") });
    }
  }
  return { present: true, entries };
}

// -------- Evidence quote extraction (primary citation-bearing pattern) --------
// Evidence quote: "TEXT" — Company, jd_XXXXXX.
function extractEvidenceQuotes(text) {
  const re = /Evidence quote:\s*["“]([^"”\n]{5,})["”]\s*[—–\-]\s*([^,\n]{1,120}?),\s*(jd_\d{4,})/g;
  const results = [];
  let m;
  while ((m = re.exec(text)) !== null) {
    results.push({
      raw: m[0],
      quote: m[1],
      cited_company: m[2].trim(),
      cited_jd_id: m[3],
      citation_pattern: "evidence_quote_with_company_and_jd_id",
    });
  }
  return results;
}

// -------- Informational: all double-quoted spans --------
function extractAllDoubleQuoted(text) {
  const re = /["“]([^"”\n]{4,})["”]/g;
  const spans = [];
  let m;
  while ((m = re.exec(text)) !== null) spans.push(m[1]);
  return spans;
}

// -------- Matching tiers --------
function matchTiered(quote, record) {
  if (!record) return { status: "unresolved_source_id" };
  const bodyRaw = record.body || "";
  // Tier 1 — verbatim
  if (bodyRaw.includes(quote)) return { status: "verbatim" };
  const bodyNorm = normalize(bodyRaw);
  const quoteNorm = normalize(quote);
  // Tier 2 — normalized
  if (bodyNorm.includes(quoteNorm)) return { status: "normalized" };
  const bodyCI = bodyNorm.toLowerCase();
  const quoteCI = quoteNorm.toLowerCase();
  // Tier 3 — case-insensitive normalized
  if (bodyCI.includes(quoteCI)) return { status: "case_insensitive" };
  return { status: "unmatched" };
}

// Ellipsis-fragment matcher (5c approved refinement)
function splitEllipsisFragments(quote) {
  // Split on Unicode ellipsis OR literal ... (with optional surrounding spaces)
  return quote
    .split(/\s*(?:\.\.\.|…)\s*/)
    .map((f) => f.trim())
    .filter(Boolean);
}

function isMeaningfulFragment(fragment) {
  const nonSpaceChars = fragment.replace(/\s+/g, "").length;
  const wordCount = fragment.split(/\s+/).filter(Boolean).length;
  return nonSpaceChars >= 12 && wordCount >= 3;
}

function matchEllipsisFragments(quote, record) {
  if (!record) return { status: "unresolved_source_id", fragments: [] };
  const fragments = splitEllipsisFragments(quote);
  const meaningful = fragments.filter(isMeaningfulFragment);
  if (meaningful.length < 2) {
    // Ellipsis present but only one meaningful fragment — fall back to tier1-3 on whole quote.
    return null;
  }
  const perFrag = meaningful.map((f) => {
    const r = matchTiered(f, record);
    return { fragment_len: f.length, tier: r.status };
  });
  const allMatched = perFrag.every((r) =>
    r.tier === "verbatim" || r.tier === "normalized" || r.tier === "case_insensitive"
  );
  if (allMatched) {
    return { status: "ellipsis_fragments", fragments: perFrag };
  }
  return { status: "unmatched_ellipsis_fragment", fragments: perFrag };
}

// -------- Company + role checks --------
function checkCompany(citedCompany, record) {
  if (!record) return "unknown";
  const norm = (s) => (s || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  const a = norm(citedCompany);
  const b = norm(record.company);
  if (!a || !b) return "unknown";
  if (a === b || a.includes(b) || b.includes(a)) return "pass";
  return "fail";
}

function checkRole(record) {
  if (!record || !record.title) return "unknown";
  return "pass";
}

// -------- Duplicate detection --------
function countDuplicates(items) {
  const seen = new Map();
  for (const it of items) {
    const key = normalizeCI(it.quote);
    seen.set(key, (seen.get(key) || 0) + 1);
  }
  let dupCount = 0;
  for (const v of seen.values()) if (v > 1) dupCount += v - 1;
  return dupCount;
}

// -------- Main --------
const report = readFileSync(args.report, "utf8");
const { records, byId } = loadCorpus(args.corpus);

const appendix = extractAppendix(report);
const evidenceQuotes = extractEvidenceQuotes(report);
const allDoubleQuoted = extractAllDoubleQuoted(report);
const duplicates = countDuplicates(evidenceQuotes);

const counts = {
  quote_candidates: allDoubleQuoted.length,
  evidence_entries: appendix.entries.length,
  evidence_quotes_with_citation: evidenceQuotes.length,
  verbatim_matches: 0,
  normalized_matches: 0,
  case_insensitive_matches: 0,
  ellipsis_fragment_matches: 0,
  missing_source_id: 0,
  unresolved_source_id: 0,
  wrong_company: 0,
  wrong_role: 0,
  fabricated_or_unmatched_quotes: 0,
  duplicates,
  appendix_entries_not_cited: 0,
};

const red_reasons = [];
const amber_reasons = [];
const sample_items = [];

for (const eq of evidenceQuotes) {
  const rec = byId.get(eq.cited_jd_id);
  let matchRes = matchTiered(eq.quote, rec);

  // Escalate to ellipsis matcher only if we already failed AND quote actually contains ellipsis.
  if (
    matchRes.status === "unmatched" &&
    (eq.quote.includes("...") || eq.quote.includes("…"))
  ) {
    const ellRes = matchEllipsisFragments(eq.quote, rec);
    if (ellRes) matchRes = ellRes;
  }

  const companyCheck = checkCompany(eq.cited_company, rec);
  const roleCheck = checkRole(rec);

  if (!rec) {
    counts.unresolved_source_id++;
    red_reasons.push(`unresolved_source_id: ${eq.cited_jd_id}`);
  } else {
    switch (matchRes.status) {
      case "verbatim":
        counts.verbatim_matches++;
        break;
      case "normalized":
        counts.normalized_matches++;
        amber_reasons.push(`normalized-only match for ${eq.cited_jd_id}`);
        break;
      case "case_insensitive":
        counts.case_insensitive_matches++;
        amber_reasons.push(`case-insensitive-only match for ${eq.cited_jd_id}`);
        break;
      case "ellipsis_fragments":
        counts.ellipsis_fragment_matches++;
        amber_reasons.push(`ellipsis-fragment stitched match for ${eq.cited_jd_id}`);
        break;
      case "unmatched_ellipsis_fragment":
        counts.fabricated_or_unmatched_quotes++;
        red_reasons.push(`unmatched_ellipsis_fragment for ${eq.cited_jd_id}`);
        break;
      case "unmatched":
      default:
        counts.fabricated_or_unmatched_quotes++;
        red_reasons.push(`unmatched quote for ${eq.cited_jd_id}`);
        break;
    }
    if (companyCheck === "fail") {
      counts.wrong_company++;
      red_reasons.push(`wrong_company: cited "${eq.cited_company}" vs corpus "${rec.company}" for ${eq.cited_jd_id}`);
    }
  }

  sample_items.push({
    quote_snippet_60: normalize(eq.quote).slice(0, 60),
    quote_char_length: eq.quote.length,
    citation_pattern: eq.citation_pattern,
    match_status: matchRes.status,
    source_id: eq.cited_jd_id,
    company_check: companyCheck,
    role_check: roleCheck,
    corpus_company: rec?.company || null,
    corpus_title: rec?.title || null,
    corpus_archetype: rec?.archetype || null,
    ellipsis_fragments: matchRes.fragments || undefined,
  });
}

// Appendix vs evidence quote consistency.
const appendixIds = new Set(appendix.entries.map((e) => e.jd_id));
const quotedIds = new Set(evidenceQuotes.map((e) => e.cited_jd_id));
const inAppendixNotQuoted = [...appendixIds].filter((id) => !quotedIds.has(id));
const inQuotedNotAppendix = [...quotedIds].filter((id) => !appendixIds.has(id));
counts.appendix_entries_not_cited = inAppendixNotQuoted.length;
if (inQuotedNotAppendix.length > 0) {
  red_reasons.push(`cited in evidence but missing from appendix: ${inQuotedNotAppendix.join(", ")}`);
}
if (inAppendixNotQuoted.length > 0) {
  amber_reasons.push(`in appendix but not cited by any Evidence quote: ${inAppendixNotQuoted.join(", ")}`);
}

// Duplicate detection → AMBER-only per 5a/5b DECISIONs.
if (counts.duplicates > 0) {
  amber_reasons.push(`duplicate evidence quotes: ${counts.duplicates}`);
}

// Missing Evidence Appendix while report claims evidence → RED.
if (!appendix.present && /evidence[- ]?grounded|evidence quote:/i.test(report)) {
  red_reasons.unshift("Evidence Appendix missing while report contains evidence/citation language");
}

// Verdict rollup.
let verdict = "green";
if (red_reasons.length > 0) verdict = "red";
else if (amber_reasons.length > 0) verdict = "amber";
if (appendix.present && appendix.entries.length === 0) {
  amber_reasons.push("Evidence Appendix header present but no parseable entries");
  if (verdict === "green") verdict = "amber";
}

const limitations = [
  "Integration prototype; not wired into scripts/report-regression-local.mjs.",
  "v1 ground truth = cleaned served corpus (web_bundle.records[].body); NOT raw live JD pages.",
  "Role check is a loose containment placeholder; only confirms corpus record has a title.",
  "Body newlines in corpus are stored as '|' pipes; normalized to newlines before matching.",
  "Only 'Evidence quote:' pattern is treated as citation-bearing; other double-quoted spans are informational.",
  "No edit-distance matching (5a DECISION #1).",
  "No LLM judge (5a DECISION #6).",
  "No semantic equivalence in v1.",
];

const out = {
  schema_version: "0.2-integration-prototype",
  status: "integration_prototype",
  fixture_id: args.fixture || null,
  source_run_id: args["source-run-id"] || null,
  source_report_path: args.report,
  corpus_path: args.corpus,
  corpus_record_count: records.length,
  ground_truth: "cleaned_served_corpus",
  verdict,
  counts,
  red_reasons,
  amber_reasons,
  sample_items,
  appendix_entries: appendix.entries,
  cross_check: {
    in_appendix_not_quoted: inAppendixNotQuoted,
    in_quoted_not_appendix: inQuotedNotAppendix,
  },
  limitations,
};

mkdirSync(dirname(args.out), { recursive: true });
writeFileSync(args.out, JSON.stringify(out, null, 2));
console.log("wrote", args.out);
console.log("verdict:", verdict);
console.log("counts:", counts);
