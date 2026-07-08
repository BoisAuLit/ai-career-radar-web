#!/usr/bin/env node
/**
 * scripts/check-web-bundle-stats.mjs
 *
 * Drift check: verifies `src/lib/web-bundle-stats.ts` matches
 * `src/data/web_bundle.json`. Exits 0 on PASS, 1 on mismatch,
 * 2 on catastrophic error (e.g. missing file, parse failure).
 *
 * Read paths (no writes anywhere):
 *   - src/data/web_bundle.json — canonical corpus, parsed as JSON.
 *   - src/lib/web-bundle-stats.ts — parsed as TEXT via regex.
 *     Explicitly NOT loaded via a TS transpiler; keeps this
 *     script Node stdlib only and dependency-free.
 *
 * Policy note: `evidenceQuotesPerReport` is a fixed report-shape
 * constant (5), not derived from the bundle. Script asserts the
 * helper value equals the local policy constant below; any
 * change to that policy requires both a helper edit AND a
 * script edit, so silent drift is impossible.
 *
 * Invoke:
 *   node scripts/check-web-bundle-stats.mjs
 *   npm run check:web-bundle-stats
 */

import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
);
const BUNDLE_PATH = path.join(REPO_ROOT, "src/data/web_bundle.json");
const HELPER_PATH = path.join(REPO_ROOT, "src/lib/web-bundle-stats.ts");

const POLICY_EVIDENCE_QUOTES_PER_REPORT = 5;

function formatSnapshotDate(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(d);
}

function computeExpected(bundle) {
  const records = Array.isArray(bundle.records) ? bundle.records : [];
  const nRecordsField = typeof bundle.n_records === "number" ? bundle.n_records : null;
  const totalJds = nRecordsField ?? records.length;
  const nRecordsMatchesLen =
    nRecordsField === null || nRecordsField === records.length;
  const appliedAiJds = records.filter((r) => r && r.archetype === "applied_ai")
    .length;
  const trackedCompanies = new Set(
    records
      .map((r) => (r && typeof r.company === "string" ? r.company.trim() : ""))
      .filter((s) => s.length > 0)
  ).size;
  const corpusGeneratedAt = String(bundle.generated_at ?? "");
  const corpusSnapshotDate = formatSnapshotDate(corpusGeneratedAt);
  return {
    values: {
      totalJds,
      appliedAiJds,
      trackedCompanies,
      evidenceQuotesPerReport: POLICY_EVIDENCE_QUOTES_PER_REPORT,
      corpusGeneratedAt,
      corpusSnapshotDate,
    },
    diagnostic: {
      nRecordsField,
      recordsLen: records.length,
      nRecordsMatchesLen,
    },
  };
}

function extractHelper(text) {
  const num = (name) => {
    const m = text.match(new RegExp(`\\b${name}\\s*:\\s*(-?\\d+)`));
    return m ? Number(m[1]) : null;
  };
  const str = (name) => {
    const m = text.match(new RegExp(`\\b${name}\\s*:\\s*"([^"]*)"`));
    return m ? m[1] : null;
  };
  return {
    totalJds: num("totalJds"),
    appliedAiJds: num("appliedAiJds"),
    trackedCompanies: num("trackedCompanies"),
    evidenceQuotesPerReport: num("evidenceQuotesPerReport"),
    corpusGeneratedAt: str("corpusGeneratedAt"),
    corpusSnapshotDate: str("corpusSnapshotDate"),
  };
}

async function main() {
  let bundle;
  try {
    bundle = JSON.parse(await readFile(BUNDLE_PATH, "utf8"));
  } catch (err) {
    console.error(
      `check-web-bundle-stats: could not read/parse bundle at ${BUNDLE_PATH}`
    );
    console.error(err);
    process.exit(2);
  }

  let helperText;
  try {
    helperText = await readFile(HELPER_PATH, "utf8");
  } catch (err) {
    console.error(
      `check-web-bundle-stats: could not read helper at ${HELPER_PATH}`
    );
    console.error(err);
    process.exit(2);
  }

  const { values: expected, diagnostic } = computeExpected(bundle);
  const actual = extractHelper(helperText);

  const fields = [
    "totalJds",
    "appliedAiJds",
    "trackedCompanies",
    "evidenceQuotesPerReport",
    "corpusGeneratedAt",
    "corpusSnapshotDate",
  ];

  console.log("web-bundle-stats drift check");
  console.log(`  bundle:  ${path.relative(REPO_ROOT, BUNDLE_PATH)}`);
  console.log(`  helper:  ${path.relative(REPO_ROOT, HELPER_PATH)}`);
  console.log("");

  const mismatches = [];
  for (const f of fields) {
    const e = expected[f];
    const a = actual[f];
    const ok = e === a;
    console.log(`  ${ok ? "✓" : "✗"} ${f}`);
    console.log(`      expected: ${JSON.stringify(e)}`);
    console.log(`      actual:   ${JSON.stringify(a)}`);
    if (!ok) mismatches.push({ field: f, expected: e, actual: a });
  }

  if (!diagnostic.nRecordsMatchesLen) {
    console.log("");
    console.log(
      `  ! diagnostic: bundle.records.length (${diagnostic.recordsLen}) !== bundle.n_records (${diagnostic.nRecordsField})`
    );
  }

  console.log("");
  if (mismatches.length === 0) {
    console.log("PASS: WEB_BUNDLE_STATS matches src/data/web_bundle.json");
    process.exit(0);
  } else {
    console.log(
      `FAIL: ${mismatches.length} field${mismatches.length === 1 ? "" : "s"} drifted`
    );
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("check-web-bundle-stats: unexpected error");
  console.error(err);
  process.exit(2);
});
