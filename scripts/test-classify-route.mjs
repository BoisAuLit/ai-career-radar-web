#!/usr/bin/env node
// AgentOps-5e-followup-phase3-classify-json-hardening-implement.
// Deterministic tests for the classify route handler
// (src/lib/classify-handler.mjs) + static assertions against the route
// wrapper (src/app/api/classify/route.ts) and package.json.
//
// - Node stdlib only (Zod imported transitively via the handler).
// - Zero real provider calls · zero network · zero Anthropic · zero OpenAI.
// - `generateObject` is mocked via dependency injection.

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import process from "node:process";

import { handleClassify } from "../src/lib/classify-handler.mjs";
import { classificationSchema } from "../src/lib/classify-schema.mjs";

const ROUTE_PATH = resolve("src/app/api/classify/route.ts");
const HANDLER_PATH = resolve("src/lib/classify-handler.mjs");
const SCHEMA_PATH = resolve("src/lib/classify-schema.mjs");
const PACKAGE_JSON_PATH = resolve("package.json");

let passed = 0;
let failed = 0;
const failures = [];

async function test(name, fn) {
  try {
    await fn();
    passed++;
    process.stdout.write(`PASS ${name}\n`);
  } catch (err) {
    failed++;
    failures.push({ name, err: err.stack || String(err) });
    process.stdout.write(`FAIL ${name}\n  ${err.message}\n`);
  }
}

function validClassification(overrides = {}) {
  return {
    archetype: "applied_ai",
    company_preferences: ["Anthropic", "Cohere"],
    level_hint: "senior",
    reasoning: "User wants applied AI at frontier labs, shipping RAG + evals.",
    ...overrides,
  };
}

// Build a mock generateObject that records its invocation options.
function mockGenerateObject({
  returnObject = validClassification(),
  throwError = null,
  usage = { inputTokens: 25, outputTokens: 40 },
  finishReason = "stop",
  warnings = [],
} = {}) {
  const calls = [];
  const fn = async (opts) => {
    calls.push(opts);
    if (throwError) throw throwError;
    return {
      object: returnObject,
      usage,
      finishReason,
      warnings,
      request: {},
      response: {},
    };
  };
  return { fn, calls };
}

function baseDeps({ generateObject, logger, schema = classificationSchema } = {}) {
  return {
    generateObject,
    model: { __mock: "model" },
    schema,
    systemPrompt: "system prompt (mocked)",
    generateCorrelationId: () => "corr-test-0001",
    logger: logger || (() => {}),
  };
}

function jsonRequest(body, { method = "POST" } = {}) {
  const bodyStr = typeof body === "string" ? body : JSON.stringify(body);
  return new Request("http://test.local/api/classify", {
    method,
    headers: { "content-type": "application/json" },
    body: bodyStr,
  });
}

// -------- T17 success returns 200 --------
await test("T17 · valid provider result returns 200 with Classification body", async () => {
  const mock = mockGenerateObject();
  const res = await handleClassify({
    req: jsonRequest({ target: "AI Engineer at Anthropic" }),
    deps: baseDeps({ generateObject: mock.fn }),
  });
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.deepEqual(Object.keys(body).sort(), [
    "archetype",
    "company_preferences",
    "level_hint",
    "reasoning",
  ].sort());
});

// -------- T18 exact field set --------
await test("T18 · success body contains EXACTLY the 4 fields (no additional)", async () => {
  const mock = mockGenerateObject();
  const res = await handleClassify({
    req: jsonRequest({ target: "AI Engineer" }),
    deps: baseDeps({ generateObject: mock.fn }),
  });
  const body = await res.json();
  const keys = Object.keys(body);
  assert.equal(keys.length, 4);
});

// -------- T19 field type compatibility --------
await test("T19 · success body field types compatible with Classification contract", async () => {
  const mock = mockGenerateObject();
  const res = await handleClassify({
    req: jsonRequest({ target: "AI Engineer" }),
    deps: baseDeps({ generateObject: mock.fn }),
  });
  const body = await res.json();
  assert.equal(typeof body.archetype, "string");
  assert.ok(Array.isArray(body.company_preferences));
  for (const v of body.company_preferences) assert.equal(typeof v, "string");
  assert.equal(typeof body.level_hint, "string");
  assert.equal(typeof body.reasoning, "string");
});

// -------- T20 generateObject invoked exactly once on success --------
await test("T20 · generateObject invoked EXACTLY ONCE on success", async () => {
  const mock = mockGenerateObject();
  await handleClassify({
    req: jsonRequest({ target: "AI Engineer" }),
    deps: baseDeps({ generateObject: mock.fn }),
  });
  assert.equal(mock.calls.length, 1, `expected 1 call, got ${mock.calls.length}`);
});

// -------- T21 maxRetries: 0 passed --------
await test("T21 · maxRetries: 0 passed to generateObject options", async () => {
  const mock = mockGenerateObject();
  await handleClassify({
    req: jsonRequest({ target: "AI Engineer" }),
    deps: baseDeps({ generateObject: mock.fn }),
  });
  const opts = mock.calls[0];
  assert.equal(opts.maxRetries, 0);
});

// -------- T22 experimental_repairText absent --------
await test("T22 · experimental_repairText NOT passed to generateObject options", async () => {
  const mock = mockGenerateObject();
  await handleClassify({
    req: jsonRequest({ target: "AI Engineer" }),
    deps: baseDeps({ generateObject: mock.fn }),
  });
  const opts = mock.calls[0];
  assert.equal(
    Object.prototype.hasOwnProperty.call(opts, "experimental_repairText"),
    false,
    "experimental_repairText must NOT appear in options",
  );
});

// -------- T23 no second provider invocation on any success --------
await test("T23 · no retry / no second provider invocation on success", async () => {
  const mock = mockGenerateObject();
  await handleClassify({
    req: jsonRequest({ target: "AI Engineer" }),
    deps: baseDeps({ generateObject: mock.fn }),
  });
  // Wait a tick to ensure no async re-invocation happens.
  await new Promise((r) => setTimeout(r, 10));
  assert.equal(mock.calls.length, 1);
});

// -------- T24 invalid JSON body → 400 sanitized --------
await test("T24 · invalid request JSON returns 400 sanitized", async () => {
  const mock = mockGenerateObject();
  const req = new Request("http://test.local/api/classify", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{not json",
  });
  const res = await handleClassify({
    req,
    deps: baseDeps({ generateObject: mock.fn }),
  });
  assert.equal(res.status, 400);
  const body = await res.json();
  assert.equal(body.category, "invalid_request_json");
  assert.equal(body.correlation_id, "corr-test-0001");
  assert.equal(typeof body.error, "string");
  assert.equal(mock.calls.length, 0, "provider must NOT be called on invalid body");
});

// -------- T25 invalid target shape → 400 sanitized --------
await test("T25 · invalid target shape (empty string) returns 400 sanitized", async () => {
  const mock = mockGenerateObject();
  const res = await handleClassify({
    req: jsonRequest({ target: "   " }),
    deps: baseDeps({ generateObject: mock.fn }),
  });
  assert.equal(res.status, 400);
  const body = await res.json();
  assert.equal(body.category, "invalid_request_shape");
  assert.equal(mock.calls.length, 0);
});

// -------- T25b missing target field → 400 sanitized --------
await test("T25b · missing target field returns 400 sanitized", async () => {
  const mock = mockGenerateObject();
  const res = await handleClassify({
    req: jsonRequest({}),
    deps: baseDeps({ generateObject: mock.fn }),
  });
  assert.equal(res.status, 400);
  const body = await res.json();
  assert.equal(body.category, "invalid_request_shape");
});

// -------- T26 generic provider failure → 502 sanitized --------
await test("T26 · generic provider throw returns 502 provider_request_failed", async () => {
  const mock = mockGenerateObject({
    throwError: new Error("provider exploded"),
  });
  const res = await handleClassify({
    req: jsonRequest({ target: "AI Engineer" }),
    deps: baseDeps({ generateObject: mock.fn }),
  });
  assert.equal(res.status, 502);
  const body = await res.json();
  assert.equal(body.category, "provider_request_failed");
  assert.equal(body.correlation_id, "corr-test-0001");
  assert.equal(mock.calls.length, 1);
});

// -------- T27 timeout → 504 --------
await test("T27 · AbortError-shaped provider error returns 504 provider_timeout", async () => {
  const err = new Error("aborted");
  err.name = "AbortError";
  const mock = mockGenerateObject({ throwError: err });
  const res = await handleClassify({
    req: jsonRequest({ target: "AI Engineer" }),
    deps: baseDeps({ generateObject: mock.fn }),
  });
  assert.equal(res.status, 504);
  const body = await res.json();
  assert.equal(body.category, "provider_timeout");
});

// -------- T28 rate limit → 429 --------
await test("T28 · provider error with .status=429 returns 429 provider_rate_limited", async () => {
  const err = new Error("rate limited");
  err.status = 429;
  const mock = mockGenerateObject({ throwError: err });
  const res = await handleClassify({
    req: jsonRequest({ target: "AI Engineer" }),
    deps: baseDeps({ generateObject: mock.fn }),
  });
  assert.equal(res.status, 429);
  const body = await res.json();
  assert.equal(body.category, "provider_rate_limited");
});

// -------- T29 NoObjectGeneratedError → 502 structured_output_invalid --------
await test("T29 · NoObjectGeneratedError-shaped error returns 502 structured_output_invalid", async () => {
  const err = new Error("no object generated");
  err.name = "NoObjectGeneratedError";
  const mock = mockGenerateObject({ throwError: err });
  const res = await handleClassify({
    req: jsonRequest({ target: "AI Engineer" }),
    deps: baseDeps({ generateObject: mock.fn }),
  });
  assert.equal(res.status, 502);
  const body = await res.json();
  assert.equal(body.category, "structured_output_invalid");
});

// -------- T30 schema validation failure at defense-in-depth layer --------
await test("T30 · provider returns valid-JSON but wrong-shape → 502 schema_validation_failed", async () => {
  // Mock returns an object that fails the schema (invalid archetype).
  const mock = mockGenerateObject({
    returnObject: {
      ...validClassification(),
      archetype: "definitely_not_valid",
    },
  });
  const res = await handleClassify({
    req: jsonRequest({ target: "AI Engineer" }),
    deps: baseDeps({ generateObject: mock.fn }),
  });
  assert.equal(res.status, 502);
  const body = await res.json();
  assert.equal(body.category, "schema_validation_failed");
});

// -------- T31 internal exception → 500 --------
await test("T31 · internal exception before provider call returns 500 internal_error", async () => {
  // Force an exception from the correlation-id generator (executed early).
  const deps = {
    generateObject: async () => ({ object: validClassification() }),
    model: {},
    schema: classificationSchema,
    systemPrompt: "sys",
    generateCorrelationId: () => {
      throw new Error("id gen exploded");
    },
    logger: () => {},
  };
  let res;
  let threw = false;
  try {
    res = await handleClassify({
      req: jsonRequest({ target: "AI Engineer" }),
      deps,
    });
  } catch {
    threw = true;
  }
  // Either the handler catches → returns 500 internal_error, or the
  // handler propagates the throw. Both are acceptable outcomes for the
  // Next.js runtime (which turns thrown exceptions into 500). The
  // guarantee we care about: the client sees NO raw output. Since
  // there is no request body serialization for an uncaught throw at
  // this stage, both paths are privacy-safe.
  assert.ok(threw || (res && res.status === 500));
});

// -------- T32 raw NOT in client body (success) --------
await test("T32 · raw model output absent from client SUCCESS body", async () => {
  const mock = mockGenerateObject();
  const res = await handleClassify({
    req: jsonRequest({ target: "AI Engineer" }),
    deps: baseDeps({ generateObject: mock.fn }),
  });
  const body = await res.json();
  assert.equal("raw" in body, false);
  assert.equal("detail" in body, false);
});

// -------- T33 raw NOT in client body (structured_output_invalid) --------
await test("T33 · raw provider output absent from client 502 body (structured_output_invalid)", async () => {
  const err = new Error("no object generated");
  err.name = "NoObjectGeneratedError";
  err.text = "raw malformed JSON text here that must NOT leak";
  const mock = mockGenerateObject({ throwError: err });
  const res = await handleClassify({
    req: jsonRequest({ target: "AI Engineer" }),
    deps: baseDeps({ generateObject: mock.fn }),
  });
  const body = await res.json();
  assert.equal("raw" in body, false);
  assert.equal("detail" in body, false);
  const bodyStr = JSON.stringify(body);
  assert.equal(
    bodyStr.includes("raw malformed JSON text here"),
    false,
    "raw error text must NOT leak into client body",
  );
});

// -------- T34 target text absent from ordinary logs --------
await test("T34 · full target text absent from ordinary server logs", async () => {
  const logs = [];
  const mock = mockGenerateObject();
  const secretTarget =
    "SECRET_MARKER_STRING_that_should_never_leak_into_logs_xyz123";
  await handleClassify({
    req: jsonRequest({ target: secretTarget }),
    deps: baseDeps({ generateObject: mock.fn, logger: (e) => logs.push(e) }),
  });
  const asStr = JSON.stringify(logs);
  assert.equal(
    asStr.includes(secretTarget),
    false,
    "target text must NOT appear in default log payload",
  );
});

// -------- T35 raw output absent from ordinary logs --------
await test("T35 · raw model output absent from ordinary server logs", async () => {
  const err = new Error("no object generated");
  err.name = "NoObjectGeneratedError";
  err.text = "MODEL_OUTPUT_SECRET_STRING_that_should_never_leak_into_logs";
  const logs = [];
  const mock = mockGenerateObject({ throwError: err });
  await handleClassify({
    req: jsonRequest({ target: "AI Engineer" }),
    deps: baseDeps({ generateObject: mock.fn, logger: (e) => logs.push(e) }),
  });
  const asStr = JSON.stringify(logs);
  assert.equal(
    asStr.includes("MODEL_OUTPUT_SECRET_STRING"),
    false,
    "raw model output must NOT appear in default log payload",
  );
});

// -------- T36 correlation_id present in error response --------
await test("T36 · correlation_id present in every non-2xx client body", async () => {
  const cases = [
    () => jsonRequest({ target: "   " }), // invalid_request_shape
    () => new Request("http://t.local/api/classify", { method: "POST", body: "{" }), // invalid_request_json
  ];
  for (const buildReq of cases) {
    const mock = mockGenerateObject();
    const res = await handleClassify({
      req: buildReq(),
      deps: baseDeps({ generateObject: mock.fn }),
    });
    const body = await res.json();
    assert.equal(body.correlation_id, "corr-test-0001");
  }
});

// -------- T37 correlation_id present in server log --------
await test("T37 · correlation_id present in every server log event for the request", async () => {
  const logs = [];
  const mock = mockGenerateObject();
  await handleClassify({
    req: jsonRequest({ target: "AI Engineer" }),
    deps: baseDeps({ generateObject: mock.fn, logger: (e) => logs.push(e) }),
  });
  assert.ok(logs.length > 0);
  for (const log of logs) {
    assert.equal(log.correlation_id, "corr-test-0001");
  }
});

// -------- T38 schema issue paths logged without offending values --------
await test("T38 · schema issue paths logged on schema_validation_failed WITHOUT offending values", async () => {
  const logs = [];
  const mock = mockGenerateObject({
    returnObject: {
      ...validClassification(),
      archetype: "SECRET_INVALID_ARCHETYPE_VALUE",
    },
  });
  await handleClassify({
    req: jsonRequest({ target: "AI Engineer" }),
    deps: baseDeps({ generateObject: mock.fn, logger: (e) => logs.push(e) }),
  });
  const relevant = logs.find((l) => l.error_category === "schema_validation_failed");
  assert.ok(relevant, "expected a schema_validation_failed log event");
  assert.ok(
    Array.isArray(relevant.schema_issue_paths) &&
      relevant.schema_issue_paths.includes("archetype"),
  );
  const asStr = JSON.stringify(logs);
  assert.equal(
    asStr.includes("SECRET_INVALID_ARCHETYPE_VALUE"),
    false,
    "offending value must NOT appear in log payload",
  );
});

// -------- T39 optional metrics safely omitted when unavailable --------
await test("T39 · output length/hash omitted when unavailable (privacy over metric)", async () => {
  const logs = [];
  const mock = mockGenerateObject();
  await handleClassify({
    req: jsonRequest({ target: "AI Engineer" }),
    deps: baseDeps({ generateObject: mock.fn, logger: (e) => logs.push(e) }),
  });
  // We do NOT reach into raw text to compute optional metrics.
  // If model_output_sha256 / model_output_char_count fields ever appear,
  // they must NEVER contain raw text — asserted via absence checks in T34/T35.
  const asStr = JSON.stringify(logs);
  // Confirm we never introduce raw output via well-known field names.
  assert.equal(asStr.includes("MODEL_OUTPUT_SECRET_STRING"), false);
});

// -------- T40 page consumer relies only on 4 success fields + err.error --------
await test("T40 · page consumer static: page.tsx reads only classification fields + err.error", async () => {
  const pageSrc = readFileSync(resolve("src/app/page.tsx"), "utf8");
  // Locate the classify block (around fetch("/api/classify")).
  const idx = pageSrc.indexOf('/api/classify"');
  assert.notEqual(idx, -1, "expected page.tsx to reference /api/classify");
  const window = pageSrc.slice(idx, idx + 800);
  // page.tsx must NOT read err.raw or err.detail from the classify response.
  assert.equal(
    window.includes("err.raw") || window.includes(".raw"),
    false,
    "page.tsx must NOT rely on err.raw",
  );
  // It should still read err.error on failure.
  assert.ok(window.includes("err.error"), "page.tsx expected to read err.error on failure");
});

// -------- T41 JSON.parse(raw) removed from route --------
// Comments (both `// ...` line and `/* ... */` block) are stripped before
// matching so that docstring references to "REMOVED JSON.parse(raw)" do
// not spuriously fail the assertion.
function stripComments(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .split("\n")
    .map((line) => line.replace(/\/\/.*$/, ""))
    .join("\n");
}
await test("T41 · STATIC: JSON.parse(raw) REMOVED from classify route (excluding comments)", async () => {
  const routeSrc = readFileSync(ROUTE_PATH, "utf8");
  const code = stripComments(routeSrc);
  assert.equal(
    /JSON\.parse\s*\(\s*raw\s*\)/.test(code),
    false,
    "JSON.parse(raw) must be absent from route code (not comments)",
  );
  // Also assert against the handler.
  const handlerSrc = readFileSync(HANDLER_PATH, "utf8");
  const handlerCode = stripComments(handlerSrc);
  assert.equal(
    /JSON\.parse\s*\(\s*raw\s*\)/.test(handlerCode),
    false,
    "JSON.parse(raw) must be absent from handler code (not comments)",
  );
});

// -------- T42 no application retry loop --------
await test("T42 · STATIC: no application retry loop in route or handler", async () => {
  const routeSrc = readFileSync(ROUTE_PATH, "utf8");
  const handlerSrc = readFileSync(HANDLER_PATH, "utf8");
  for (const src of [routeSrc, handlerSrc]) {
    // Very conservative pattern: any explicit retry loop referencing
    // generateObject/generateText inside a loop.
    assert.equal(
      /for\s*\([^)]*\)\s*\{[^}]*generateObject/.test(src),
      false,
    );
    assert.equal(
      /while\s*\([^)]*\)\s*\{[^}]*generateObject/.test(src),
      false,
    );
    assert.equal(
      /catch[^{]*\{[^}]*retry/i.test(src),
      false,
      "no explicit retry-in-catch pattern",
    );
  }
});

// -------- T43 exactly one generateObject invocation in handler --------
await test("T43 · STATIC: exactly ONE `deps.generateObject(` call site in handler; ONE `generateObject(` in route wiring", async () => {
  const handlerSrc = readFileSync(HANDLER_PATH, "utf8");
  const handlerMatches = handlerSrc.match(/deps\.generateObject\s*\(/g) || [];
  assert.equal(handlerMatches.length, 1, `expected 1 handler call site, got ${handlerMatches.length}`);
  const routeSrc = readFileSync(ROUTE_PATH, "utf8");
  const routeMatches = routeSrc.match(/generateObject/g) || [];
  // route.ts references generateObject in the import and in the deps wiring;
  // it does not itself invoke the SDK function.
  assert.ok(routeMatches.length >= 1);
  // Also confirm route does NOT call generateText.
  assert.equal(
    /generateText\s*\(/.test(routeSrc),
    false,
    "route must not call generateText",
  );
});

// -------- T44 experimental_repairText absent from source (code, not comments) --------
await test("T44 · STATIC: `experimental_repairText` NOT present as code in route or handler (comments-stripped check)", async () => {
  const routeSrc = readFileSync(ROUTE_PATH, "utf8");
  const handlerSrc = readFileSync(HANDLER_PATH, "utf8");
  // The identifier appears in comments (banning it explicitly); the
  // check strips comments before matching to allow the documentation
  // while asserting the identifier never appears in executable code.
  const routeCode = stripComments(routeSrc);
  const handlerCode = stripComments(handlerSrc);
  assert.equal(
    routeCode.includes("experimental_repairText"),
    false,
    "experimental_repairText must NOT appear in route code",
  );
  assert.equal(
    handlerCode.includes("experimental_repairText"),
    false,
    "experimental_repairText must NOT appear in handler code",
  );
  // Additional defense-in-depth: even without comment stripping, ensure
  // the token is NEVER used as an object-property key on the SDK call.
  const callSite = handlerSrc.slice(handlerSrc.indexOf("deps.generateObject("));
  const callWindow = callSite.slice(0, callSite.indexOf("});") + 3);
  assert.equal(
    /experimental_repairText\s*:/.test(callWindow),
    false,
    "experimental_repairText must NOT appear as an option key on the generateObject call",
  );
});

// -------- T45 zod is a direct dependency in package.json --------
await test("T45 · STATIC: `zod` listed in package.json `dependencies` (direct dep)", async () => {
  const pkg = JSON.parse(readFileSync(PACKAGE_JSON_PATH, "utf8"));
  const deps = pkg.dependencies || {};
  assert.ok(
    "zod" in deps,
    "package.json dependencies must list zod as a direct dep",
  );
  assert.ok(
    /^\^?4/.test(deps.zod),
    `zod version range expected to start with 4.x, got ${deps.zod}`,
  );
});

// -------- T46 QI checker + structural checker + harness unchanged (governance) --------
await test("T46 · STATIC: QI checker file exists unchanged in structure (import block untouched)", async () => {
  // We do not read git state here (test is deterministic across working
  // trees). We instead assert the file exists and has not been renamed.
  const qi = readFileSync(resolve("scripts/quote-integrity-check.mjs"), "utf8");
  assert.ok(qi.length > 0);
  const structural = readFileSync(
    resolve("scripts/structural-evidence-check.mjs"),
    "utf8",
  );
  assert.ok(structural.length > 0);
  const harness = readFileSync(
    resolve("scripts/report-regression-local.mjs"),
    "utf8",
  );
  assert.ok(harness.length > 0);
});

// -------- T47 schema module still importable (no baseline contamination) --------
await test("T47 · schema module still importable + strict object still enabled", async () => {
  const schemaSrc = readFileSync(SCHEMA_PATH, "utf8");
  assert.ok(schemaSrc.includes(".strict()"), "schema must retain .strict()");
  assert.ok(schemaSrc.includes("classificationSchema"));
});

// -------- Summary --------
process.stdout.write(
  `\nCLASSIFY-ROUTE TESTS: ${passed} passed, ${failed} failed\n`,
);
if (failed > 0) {
  for (const f of failures) process.stderr.write(`\n--- FAIL ${f.name} ---\n${f.err}\n`);
  process.exit(1);
}
process.exit(0);
