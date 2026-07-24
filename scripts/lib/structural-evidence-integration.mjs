// AgentOps-5e-followup-baseline-lint-integrate-implement · Phase 2 helper.
//
// Deterministic integration adapter for scripts/structural-evidence-check.mjs.
// Design: .agent/design_memos/2026-07-24_AgentOps-5e-followup-baseline-lint-integrate-design.md
// DECISION: .agent/decisions/2026-07-24_run_06_DECISION.md
//
// Responsibilities:
//   - Write sanitized capture context JSON to disk (atomic temp+rename).
//   - Compute SHA-256 content hash of the validator script.
//   - Spawn the validator via `spawnSync` with a 5-second timeout.
//   - Validate exit / artifact existence / artifact JSON / artifact schema.
//   - Normalize the result into a stable envelope for the harness.
//   - Never retry. Never throw. Never mutate report.md. Never touch
//     baselines. Never affect legacy checks.push / classify / process exit.
//
// Consumer contract: harness treats returned envelope as display-only
// telemetry. Envelope MUST NEVER be pushed into legacy `checks[]`.

import { spawnSync } from "node:child_process";
import {
  existsSync,
  readFileSync,
  writeFileSync,
  renameSync,
  mkdirSync,
} from "node:fs";
import { dirname } from "node:path";
import { createHash } from "node:crypto";
import process from "node:process";

const CONTEXT_SCHEMA_VERSION = "0.1-phase2";
const SUMMARY_SCHEMA_VERSION = "0.1-phase1";
const DEFAULT_TIMEOUT_MS = 5000;
const BLOCKING_MODE = "telemetry_only";

// Set of exit codes we treat as "artifact expected".
const ARTIFACT_EXPECTED_EXITS = new Set([0, 1]);

// Verdicts we treat as strictly recognized. Anything else in the artifact is
// normalized to tool_error `artifact_invalid_verdict`.
const RECOGNIZED_VERDICTS = new Set([
  "green",
  "amber",
  "red",
  "not_evaluable",
]);

function atomicWriteJson(path, obj) {
  const dir = dirname(path);
  if (dir && dir !== "." && !existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  const tmp = `${path}.tmp-${process.pid}`;
  writeFileSync(tmp, JSON.stringify(obj, null, 2) + "\n", "utf8");
  renameSync(tmp, path);
}

function computeCheckerHash(validatorPath) {
  const text = readFileSync(validatorPath, "utf8");
  const hex = createHash("sha256").update(text).digest("hex");
  return `sha256:${hex}`;
}

function buildEnvelope(overrides) {
  return {
    evaluation_status: "not_run",
    verdict: null,
    blocking_mode: BLOCKING_MODE,
    schema_version: SUMMARY_SCHEMA_VERSION,
    context_schema_version: CONTEXT_SCHEMA_VERSION,
    checker_path: null,
    checker_hash: null,
    exit_code: null,
    duration_ms: 0,
    summary_path: null,
    context_path: null,
    context_supplied: false,
    capture_context: null,
    affected_legacy_verdict: false,
    tool_error: null,
    stdout_summary: null,
    stderr_summary: null,
    red_reasons: [],
    amber_reasons: [],
    not_evaluable_reasons: [],
    ...overrides,
  };
}

function truncateStream(text, max = 500) {
  if (!text) return null;
  const trimmed = String(text).replace(/\s+/g, " ").trim();
  if (trimmed.length === 0) return null;
  return trimmed.length > max ? trimmed.slice(0, max) : trimmed;
}

// -------- Pure capture-completeness derivation (2026-07-24_run_07 fix) --------
//
// Circular-dependency correction: the initial Phase 2 implementation
// derived `capture_complete` from two harness-side structural-content
// booleans (an evidence-heading regex hit and a section-marker-hit
// count). That made a fully captured but structurally broken report
// look "not_evaluable" instead of RED — masking exactly the regression
// the validator exists to detect.
//
// This helper derives capture sufficiency from TRANSPORT / MECHANISM facts
// ONLY (category A). It MUST NOT reference any content-derived signal:
//   - the harness-side "has evidence" boolean (evidence-heading regex hit)
//   - the harness-side section-marker-hit count
//   - the section-marker enumeration
//   - any regex targeting evidence structure
//   - the structural validator's output
//   - Appendix presence
//   - citation count
// Signals in that list are all category B (structural content). Their
// absence indicates a report regression, not a capture failure.
//
// Complete capture + missing Appendix → structural RED (evaluable).
// Complete capture + zero citations   → structural RED (evaluable).
// Genuinely truncated / failed capture → not_evaluable.
//
// Also maps the harness `capture.scope` (CSS selector strings or
// `"body_fallback"`) into the validator-accepted scope set
// `{"main section", "body"}`.
export function deriveCaptureCompleteness({
  completionState,
  reportText,
  selectedLength,
  scope,
  fallbackUsed,
  reportCaptureError = null,
} = {}) {
  const mechanismReached =
    completionState === "success" &&
    reportCaptureError === null &&
    typeof reportText === "string" &&
    reportText.length > 0 &&
    Number.isFinite(selectedLength) &&
    selectedLength > 0 &&
    typeof scope === "string" &&
    scope !== "unset";
  // Scope mapping: fallback captures the whole page body (which strictly
  // includes the report region). Any specific selector match came from
  // one of the CANDIDATE_SELECTORS — all of which target a report
  // container. Both cases yield an accepted validator scope; the specific
  // selector is retained separately in metadata for observability.
  const captureScopeForContext = fallbackUsed ? "body" : "main section";
  return {
    captureComplete: mechanismReached,
    expectedSectionsCaptured: mechanismReached,
    captureScopeForContext,
  };
}

// Small pure helper for combined telemetry — exported so harness code and
// tests can reuse identical rules.
export function combineTelemetryVerdict(qi, structural) {
  const qiHasToolError = qi && qi.evaluation_status === "tool_error";
  const stHasToolError = structural && structural.evaluation_status === "tool_error";
  if (qiHasToolError || stHasToolError) return "tool_error";
  const qiVerdict = qi ? qi.verdict : null;
  const stVerdict = structural ? structural.verdict : null;
  if (qiVerdict === "red" || stVerdict === "red") return "red";
  if (qiVerdict === "amber" || stVerdict === "amber") return "amber";
  if (qiVerdict === "not_evaluable" || stVerdict === "not_evaluable") {
    if (qiVerdict === "green" && stVerdict === "green") return "green";
    return "not_evaluable";
  }
  if (qiVerdict === "green" && stVerdict === "green") return "green";
  // Anything else (nulls from not_run subsystems, unknown verdicts): fall
  // through to not_evaluable so the harness never silently claims GREEN.
  return "not_evaluable";
}

// Main entry.
// Args:
//   validatorPath      absolute path to scripts/structural-evidence-check.mjs
//   reportPath         absolute path to captured report.md (may not exist)
//   reportSaved        whether harness actually saved a report.md
//   outputPath         absolute path to write structural_evidence_summary.json
//   contextPath        absolute path to write structural_evidence_context.json
//   captureContext     harness-derived capture facts (see below)
//   timeoutMs          optional override for the child timeout (default 5000)
//   summaryPathRelative optional relative summary path label for envelope
//   contextPathRelative optional relative context path label for envelope
//
// captureContext shape (all fields required):
//   {
//     capture_scope: string,
//     fallback_used: boolean,
//     completion_state: string,
//     capture_complete: boolean,
//     report_capture_error: string | null,
//     report_char_count: integer >= 0,
//     expected_sections_captured: boolean,
//     source: string,
//   }
export function runStructuralEvidence({
  validatorPath,
  reportPath,
  reportSaved,
  outputPath,
  contextPath,
  captureContext,
  timeoutMs = DEFAULT_TIMEOUT_MS,
  summaryPathRelative = null,
  contextPathRelative = null,
} = {}) {
  const started = Date.now();

  // Preflight: report absent (harness never wrote it) → not_run.
  if (!reportSaved || !existsSync(reportPath)) {
    return buildEnvelope({
      evaluation_status: "not_run",
      not_evaluable_reasons: ["report_md_not_saved"],
      duration_ms: Date.now() - started,
    });
  }

  // Compute checker hash (tool_error but continue).
  let checkerHash = null;
  let checkerHashError = null;
  try {
    checkerHash = computeCheckerHash(validatorPath);
  } catch (err) {
    checkerHashError = truncateStream(err && err.message);
  }

  // Write sanitized context artifact (tool_error but skip validator invocation).
  const contextObj = {
    schema_version: CONTEXT_SCHEMA_VERSION,
    ...captureContext,
  };
  try {
    atomicWriteJson(contextPath, contextObj);
  } catch (err) {
    return buildEnvelope({
      evaluation_status: "tool_error",
      checker_path: validatorPath,
      checker_hash: checkerHash,
      tool_error: {
        reason: "context_write_failed",
        detail: truncateStream(err && err.message),
      },
      duration_ms: Date.now() - started,
      context_path: contextPathRelative,
      capture_context: contextObj,
      context_supplied: true,
    });
  }

  // Spawn validator with timeout. `killSignal: 'SIGKILL'` ensures a hung
  // validator is terminated. `timeout` triggers `res.signal === 'SIGTERM'`
  // on Node — we detect timeout via the `signal` field or by elapsed time.
  let res;
  try {
    res = spawnSync(
      process.execPath,
      [
        validatorPath,
        "--report", reportPath,
        "--output", outputPath,
        "--context", contextPath,
      ],
      {
        encoding: "utf8",
        timeout: timeoutMs,
        killSignal: "SIGKILL",
      },
    );
  } catch (err) {
    return buildEnvelope({
      evaluation_status: "tool_error",
      checker_path: validatorPath,
      checker_hash: checkerHash,
      tool_error: {
        reason: "validator_spawn_failed",
        detail: truncateStream(err && err.message),
      },
      duration_ms: Date.now() - started,
      context_path: contextPathRelative,
      capture_context: contextObj,
      context_supplied: true,
    });
  }

  const durationMs = Date.now() - started;

  // Node marks timeouts via `res.signal` (usually 'SIGKILL' or 'SIGTERM')
  // and returns `status === null`.
  const timedOut =
    res.status === null &&
    (res.signal === "SIGKILL" || res.signal === "SIGTERM" || durationMs >= timeoutMs);
  if (timedOut) {
    return buildEnvelope({
      evaluation_status: "tool_error",
      checker_path: validatorPath,
      checker_hash: checkerHash,
      exit_code: null,
      tool_error: {
        reason: "validator_timeout",
        detail: `timed_out_after_${timeoutMs}ms signal=${res.signal || "none"}`,
      },
      duration_ms: durationMs,
      context_path: contextPathRelative,
      capture_context: contextObj,
      context_supplied: true,
      stdout_summary: truncateStream(res.stdout),
      stderr_summary: truncateStream(res.stderr),
    });
  }

  const exitCode = res.status;

  // Exit 2 = validator-declared tool_error.
  if (exitCode === 2) {
    return buildEnvelope({
      evaluation_status: "tool_error",
      checker_path: validatorPath,
      checker_hash: checkerHash,
      exit_code: 2,
      tool_error: {
        reason: "validator_exit_2",
        detail: truncateStream(res.stderr),
      },
      duration_ms: durationMs,
      context_path: contextPathRelative,
      capture_context: contextObj,
      context_supplied: true,
      stdout_summary: truncateStream(res.stdout),
      stderr_summary: truncateStream(res.stderr),
    });
  }

  // Unknown / unexpected exit code.
  if (!ARTIFACT_EXPECTED_EXITS.has(exitCode)) {
    return buildEnvelope({
      evaluation_status: "tool_error",
      checker_path: validatorPath,
      checker_hash: checkerHash,
      exit_code: exitCode,
      tool_error: {
        reason: "validator_unexpected_exit",
        detail: `exit=${exitCode}`,
      },
      duration_ms: durationMs,
      context_path: contextPathRelative,
      capture_context: contextObj,
      context_supplied: true,
      stdout_summary: truncateStream(res.stdout),
      stderr_summary: truncateStream(res.stderr),
    });
  }

  // Artifact must exist for exit 0/1.
  if (!existsSync(outputPath)) {
    return buildEnvelope({
      evaluation_status: "tool_error",
      checker_path: validatorPath,
      checker_hash: checkerHash,
      exit_code: exitCode,
      tool_error: {
        reason: `artifact_missing_after_exit_${exitCode}`,
        detail: null,
      },
      duration_ms: durationMs,
      context_path: contextPathRelative,
      capture_context: contextObj,
      context_supplied: true,
      stdout_summary: truncateStream(res.stdout),
      stderr_summary: truncateStream(res.stderr),
    });
  }

  // Parse artifact.
  let parsed;
  try {
    parsed = JSON.parse(readFileSync(outputPath, "utf8"));
  } catch (err) {
    return buildEnvelope({
      evaluation_status: "tool_error",
      checker_path: validatorPath,
      checker_hash: checkerHash,
      exit_code: exitCode,
      tool_error: {
        reason: "summary_invalid_json",
        detail: truncateStream(err && err.message),
      },
      duration_ms: durationMs,
      context_path: contextPathRelative,
      capture_context: contextObj,
      context_supplied: true,
      summary_path: summaryPathRelative,
      stdout_summary: truncateStream(res.stdout),
      stderr_summary: truncateStream(res.stderr),
    });
  }

  // Validate artifact schema.
  const schemaOk =
    parsed &&
    typeof parsed === "object" &&
    !Array.isArray(parsed) &&
    typeof parsed.schema_version === "string" &&
    typeof parsed.verdict === "string" &&
    RECOGNIZED_VERDICTS.has(parsed.verdict);
  if (!schemaOk) {
    return buildEnvelope({
      evaluation_status: "tool_error",
      checker_path: validatorPath,
      checker_hash: checkerHash,
      exit_code: exitCode,
      tool_error: {
        reason: "summary_invalid_schema",
        detail: "missing/invalid schema_version or verdict",
      },
      duration_ms: durationMs,
      context_path: contextPathRelative,
      capture_context: contextObj,
      context_supplied: true,
      summary_path: summaryPathRelative,
      stdout_summary: truncateStream(res.stdout),
      stderr_summary: truncateStream(res.stderr),
    });
  }

  // Exit-code / verdict cross-check (defence in depth). Exit 1 must map to
  // verdict=red; exit 0 must NOT be red. Mismatches become tool_error.
  if (exitCode === 1 && parsed.verdict !== "red") {
    return buildEnvelope({
      evaluation_status: "tool_error",
      checker_path: validatorPath,
      checker_hash: checkerHash,
      exit_code: exitCode,
      tool_error: {
        reason: "exit_verdict_mismatch",
        detail: `exit=1 verdict=${parsed.verdict}`,
      },
      duration_ms: durationMs,
      context_path: contextPathRelative,
      capture_context: contextObj,
      context_supplied: true,
      summary_path: summaryPathRelative,
      stdout_summary: truncateStream(res.stdout),
      stderr_summary: truncateStream(res.stderr),
    });
  }
  if (exitCode === 0 && parsed.verdict === "red") {
    return buildEnvelope({
      evaluation_status: "tool_error",
      checker_path: validatorPath,
      checker_hash: checkerHash,
      exit_code: exitCode,
      tool_error: {
        reason: "exit_verdict_mismatch",
        detail: `exit=0 verdict=red`,
      },
      duration_ms: durationMs,
      context_path: contextPathRelative,
      capture_context: contextObj,
      context_supplied: true,
      summary_path: summaryPathRelative,
      stdout_summary: truncateStream(res.stdout),
      stderr_summary: truncateStream(res.stderr),
    });
  }

  // Success — validator produced a recognized verdict.
  const evalStatus =
    parsed.verdict === "not_evaluable" ? "not_evaluable" : "completed";

  // Emit hash tool_error separately if hash compute failed (surface but keep
  // the verdict; DECISION Q11 says "continue with verdict from artifact").
  const toolError = checkerHashError
    ? {
        reason: "checker_hash_compute_failed",
        detail: checkerHashError,
      }
    : null;

  return buildEnvelope({
    evaluation_status: toolError ? "tool_error" : evalStatus,
    verdict: toolError ? null : parsed.verdict,
    checker_path: validatorPath,
    checker_hash: checkerHash,
    exit_code: exitCode,
    tool_error: toolError,
    duration_ms: durationMs,
    summary_path: summaryPathRelative,
    context_path: contextPathRelative,
    context_supplied: true,
    capture_context: parsed.capture_context || contextObj,
    red_reasons: Array.isArray(parsed.red_reasons) ? parsed.red_reasons : [],
    amber_reasons: Array.isArray(parsed.amber_reasons)
      ? parsed.amber_reasons
      : [],
    not_evaluable_reasons: Array.isArray(parsed.not_evaluable_reasons)
      ? parsed.not_evaluable_reasons
      : [],
    stdout_summary: truncateStream(res.stdout),
    stderr_summary: truncateStream(res.stderr),
  });
}
