// AgentOps-5e-followup-phase3-classify-json-hardening-implement · handler.
//
// Pure, dependency-injected classify handler. Consumed by the Next.js
// route (`src/app/api/classify/route.ts`) with real dependencies and by
// deterministic tests (`scripts/test-classify-route.mjs`) with mocked
// dependencies. No side effects beyond what deps.logger performs.
//
// Guarantees (per DECISION 2026-07-24_run_11):
//   - exactly ONE provider call per classify request (single
//     deps.generateObject call; `maxRetries: 0` passed; no retry loop;
//     no second model call; no fallback provider)
//   - `experimental_repairText` NEVER set (silent repair prohibited)
//   - manual JSON.parse of unrestricted free-form provider text is
//     absent (generateObject validates against the schema; result
//     comes back as a typed object)
//   - raw model output NEVER returned to client
//   - raw model output NEVER logged by default (only bounded structured
//     metadata + correlation_id)
//   - success response shape preserved (archetype, company_preferences,
//     level_hint, reasoning) at the FIELD + TYPE level (not
//     byte-identical)
//   - client error bodies contain ONLY { error, category, correlation_id }
//
// Errors are mapped through the approved taxonomy:
//   invalid_request_json      → 400
//   invalid_request_shape     → 400
//   provider_rate_limited     → 429
//   provider_timeout          → 504
//   provider_request_failed   → 502
//   structured_output_invalid → 502
//   schema_validation_failed  → 502
//   internal_error            → 500
//
// Notes on provider-error classification:
//   The ai SDK exports typed errors (NoObjectGeneratedError,
//   NoOutputGeneratedError, RetryError). For provider-side failures
//   the SDK usually wraps them but exact discrimination between
//   "timeout" and "generic upstream" and "rate-limited" requires the
//   underlying error's status/name. We use conservative typed checks
//   where reliable and fall back to `provider_request_failed` (502)
//   when the exact class cannot be identified safely from the
//   installed types alone. We do NOT invent brittle string matching.

import { NoObjectGeneratedError, NoOutputGeneratedError } from "ai";
import { classificationSchema } from "./classify-schema.mjs";

// Bounded to avoid unusual payload sizes leaking into observability.
const MAX_TARGET_INPUT_CHARS = 8000;

function truncate(str, max = 200) {
  if (typeof str !== "string") return null;
  if (str.length <= max) return str;
  return str.slice(0, max);
}

function safeMessage(err) {
  if (!err) return null;
  if (typeof err === "string") return truncate(err, 200);
  const msg = err.message;
  if (typeof msg === "string") return truncate(msg, 200);
  return null;
}

// Zod v4 issue shape: { code, path: (string|number)[], message, expected?, received? }
function summarizeZodIssues(issues) {
  if (!Array.isArray(issues)) return { paths: [], expected: [], received: [] };
  const paths = [];
  const expected = [];
  const received = [];
  for (const issue of issues) {
    if (Array.isArray(issue.path)) {
      paths.push(issue.path.map((p) => String(p)).join("."));
    }
    if (issue.expected !== undefined) {
      expected.push(String(issue.expected));
    }
    if (issue.received !== undefined) {
      received.push(String(issue.received));
    }
  }
  return { paths, expected, received };
}

// Conservative provider-error classification. Falls back to
// `provider_request_failed` when a specific class cannot be safely
// identified from installed SDK types.
function classifyProviderError(err) {
  if (!err) return "provider_request_failed";
  // Named typed errors from the ai SDK.
  if (
    (typeof NoObjectGeneratedError !== "undefined" &&
      NoObjectGeneratedError.isInstance &&
      NoObjectGeneratedError.isInstance(err)) ||
    err?.name === "NoObjectGeneratedError" ||
    err?.constructor?.name === "NoObjectGeneratedError"
  ) {
    return "structured_output_invalid";
  }
  if (
    (typeof NoOutputGeneratedError !== "undefined" &&
      NoOutputGeneratedError.isInstance &&
      NoOutputGeneratedError.isInstance(err)) ||
    err?.name === "NoOutputGeneratedError" ||
    err?.constructor?.name === "NoOutputGeneratedError"
  ) {
    return "structured_output_invalid";
  }
  // Standard error name/code shapes for well-known transport failures.
  if (err?.name === "AbortError") return "provider_timeout";
  if (err?.code === "ETIMEDOUT" || err?.code === "ECONNABORTED") {
    return "provider_timeout";
  }
  // Some SDK error surfaces expose an HTTP status.
  const status = typeof err?.status === "number" ? err.status : null;
  if (status === 429) return "provider_rate_limited";
  if (status === 504) return "provider_timeout";
  if (status && status >= 500 && status <= 599) return "provider_request_failed";
  // Conservative default — do NOT invent brittle string matching on
  // err.message. Reviewers may extend this later under a separate loop.
  return "provider_request_failed";
}

const CATEGORY_HTTP = {
  invalid_request_json: 400,
  invalid_request_shape: 400,
  provider_rate_limited: 429,
  provider_timeout: 504,
  provider_request_failed: 502,
  structured_output_invalid: 502,
  schema_validation_failed: 502,
  internal_error: 500,
};

const CATEGORY_CLIENT_MESSAGE = {
  invalid_request_json: "Invalid request body.",
  invalid_request_shape: "Missing or invalid required field.",
  provider_rate_limited: "Rate limited. Try again shortly.",
  provider_timeout: "Upstream classifier timed out.",
  provider_request_failed: "Upstream classifier unavailable.",
  structured_output_invalid: "Classifier returned an invalid response.",
  schema_validation_failed: "Classifier response did not match required shape.",
  internal_error: "Internal server error.",
};

function jsonResponse(status, obj) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function successResponse(object) {
  // Exact field-order canonicalization for stability, though callers do
  // not depend on byte-order (compatibility is field/type-only).
  return jsonResponse(200, {
    archetype: object.archetype,
    company_preferences: object.company_preferences,
    level_hint: object.level_hint,
    reasoning: object.reasoning,
  });
}

function failureResponse(category, correlationId) {
  const status = CATEGORY_HTTP[category] ?? 500;
  return jsonResponse(status, {
    error: CATEGORY_CLIENT_MESSAGE[category] ?? "Internal server error.",
    category,
    correlation_id: correlationId,
  });
}

/**
 * Handle one classify request.
 *
 * @param {object} args
 * @param {Request} args.req
 * @param {object} args.deps
 * @param {(opts: any) => Promise<any>} args.deps.generateObject
 * @param {unknown} args.deps.model
 * @param {unknown} [args.deps.schema] optional override (defaults to imported classificationSchema)
 * @param {string} args.deps.systemPrompt
 * @param {() => string} args.deps.generateCorrelationId
 * @param {(event: object) => void} [args.deps.logger] optional; defaults to no-op
 * @returns {Promise<Response>}
 */
export async function handleClassify({ req, deps }) {
  const correlationId = deps.generateCorrelationId();
  const logger = deps.logger || (() => {});
  const schema = deps.schema || classificationSchema;
  const startTs = Date.now();

  const logBase = {
    route: "/api/classify",
    provider: "anthropic",
    correlation_id: correlationId,
  };

  logger({ event: "classify.request.received", ...logBase, ts: startTs });

  // Step 1 — parse request body as JSON.
  let body;
  try {
    body = await req.json();
  } catch (err) {
    const durationMs = Date.now() - startTs;
    logger({
      event: "classify.error",
      ...logBase,
      duration_ms: durationMs,
      error_category: "invalid_request_json",
      http_status: 400,
      ts: Date.now(),
      short_error: safeMessage(err),
    });
    return failureResponse("invalid_request_json", correlationId);
  }

  // Step 2 — request-shape validation. Target must be a non-empty string
  // after trim; the trim here is a validity check (rejecting empty
  // requests), not a mutation of stored state. Bound the size defensively.
  const targetRaw = body && typeof body.target === "string" ? body.target : null;
  const targetTrimmedLength = targetRaw ? targetRaw.trim().length : 0;
  if (
    !targetRaw ||
    targetTrimmedLength === 0 ||
    targetRaw.length > MAX_TARGET_INPUT_CHARS
  ) {
    const durationMs = Date.now() - startTs;
    logger({
      event: "classify.error",
      ...logBase,
      duration_ms: durationMs,
      error_category: "invalid_request_shape",
      http_status: 400,
      target_length: targetRaw ? targetRaw.length : 0,
      ts: Date.now(),
    });
    return failureResponse("invalid_request_shape", correlationId);
  }

  // Step 3 — invoke the provider exactly ONCE via generateObject.
  // `maxRetries: 0` disables SDK transport retry; `experimental_repairText`
  // is NOT set so no silent repair occurs. No manual JSON.parse. No
  // retry loop. No second call. No fallback provider.
  let providerResult;
  logger({
    event: "classify.provider.request.start",
    ...logBase,
    ts: Date.now(),
  });
  try {
    providerResult = await deps.generateObject({
      model: deps.model,
      schema,
      schemaName: "Classification",
      schemaDescription:
        "Classification of a user's target role into an AI engineering archetype.",
      system: deps.systemPrompt,
      messages: [
        { role: "user", content: `User says they want: "${targetRaw}"` },
      ],
      maxRetries: 0,
      // experimental_repairText intentionally omitted — silent repair
      // is prohibited by the approved design (DECISION 2026-07-24_run_11).
    });
  } catch (err) {
    const durationMs = Date.now() - startTs;
    const category = classifyProviderError(err);
    const structuredLog = {
      event: "classify.error",
      ...logBase,
      duration_ms: durationMs,
      error_category: category,
      http_status: CATEGORY_HTTP[category],
      ts: Date.now(),
      short_error: safeMessage(err),
    };
    // When the SDK surfaces schema issue paths (e.g. via a ZodError
    // property on NoObjectGeneratedError.cause), record structured
    // metadata WITHOUT logging the offending values.
    const zodIssues =
      err?.cause?.issues || err?.issues || err?.cause?.errors || null;
    if (Array.isArray(zodIssues) && zodIssues.length > 0) {
      const { paths, expected, received } = summarizeZodIssues(zodIssues);
      structuredLog.schema_issue_paths = paths;
      structuredLog.schema_expected_type_names = expected;
      structuredLog.schema_received_type_names = received;
      structuredLog.structured_output_rejected = true;
    } else {
      structuredLog.structured_output_rejected =
        category === "structured_output_invalid";
    }
    // Char count / SHA-256 of raw model output are OMITTED when the
    // typed SDK error does not safely expose the text without our
    // needing to reach into raw content — do NOT weaken privacy just
    // to satisfy an optional metric.
    logger(structuredLog);
    return failureResponse(category, correlationId);
  }

  // Step 4 — record success metadata + apply defense-in-depth schema
  // validation on the returned object. generateObject already validates
  // against the schema, but re-validating with the same schema gives
  // us a locally-provable typed rejection path if a future SDK update
  // regresses the guarantee.
  const parsed = schema.safeParse(providerResult.object);
  if (!parsed.success) {
    const durationMs = Date.now() - startTs;
    const { paths, expected, received } = summarizeZodIssues(
      parsed.error?.issues,
    );
    logger({
      event: "classify.schema.validation.result",
      ...logBase,
      duration_ms: durationMs,
      error_category: "schema_validation_failed",
      http_status: 502,
      structured_output_rejected: true,
      schema_issue_paths: paths,
      schema_expected_type_names: expected,
      schema_received_type_names: received,
      ts: Date.now(),
    });
    return failureResponse("schema_validation_failed", correlationId);
  }

  const durationMs = Date.now() - startTs;
  const usage = providerResult.usage || {};
  logger({
    event: "classify.provider.response.received",
    ...logBase,
    duration_ms: durationMs,
    "usage.input_tokens": typeof usage.inputTokens === "number" ? usage.inputTokens : null,
    "usage.output_tokens":
      typeof usage.outputTokens === "number" ? usage.outputTokens : null,
    finish_reason: providerResult.finishReason ?? null,
    warnings_count: Array.isArray(providerResult.warnings)
      ? providerResult.warnings.length
      : 0,
    output_existed: true,
    structured_output_rejected: false,
    http_status: 200,
    ts: Date.now(),
  });
  logger({
    event: "classify.response.sent",
    ...logBase,
    duration_ms: durationMs,
    http_status: 200,
    ts: Date.now(),
  });

  return successResponse(parsed.data);
}
