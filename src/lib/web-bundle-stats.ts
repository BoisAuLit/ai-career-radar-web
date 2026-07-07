/**
 * Display-only stats about the checked-in corpus at
 * `src/data/web_bundle.json`. Numbers are *primitive constants*
 * pre-computed at authoring time from the on-disk bundle to
 * avoid shipping the 1.4 MB JSON into any client bundle.
 *
 * Source of truth: `src/data/web_bundle.json`.
 * Bundle `generated_at`: 2026-05-14T02:17:04+00:00.
 * Computed on 2026-06-30 by reading the bundle with
 * `python3 -c "import json; …"`.
 *
 * When the corpus is regenerated, refresh these constants by
 * re-running the same one-liner and updating the values below.
 */
export const WEB_BUNDLE_STATS = {
  /** Total JD records in the bundle (`bundle.n_records`). */
  totalJds: 443,
  /** Records where `archetype === "applied_ai"`. */
  appliedAiJds: 47,
  /** Distinct `record.company` values (trimmed). */
  trackedCompanies: 35,
  /**
   * Fixed report-shape constant: every generated career report
   * includes 5 evidence quotes. Not derived from the bundle;
   * a policy constant surfaced here so grep-and-edit stays in
   * one place.
   */
  evidenceQuotesPerReport: 5,
  /**
   * Bundle `generated_at` as-is from `web_bundle.json`. Kept
   * as a display string so UI can render without pulling the
   * JSON at runtime and without a `new Date()` parse. Refresh
   * when the served bundle is regenerated.
   */
  corpusGeneratedAt: "2026-05-14T02:17:04+00:00",
  /**
   * Human-readable label derived by hand from `corpusGeneratedAt`
   * above. Used for the visible "Corpus snapshot: …" disclosure
   * in product UI. Refresh alongside `corpusGeneratedAt`.
   */
  corpusSnapshotDate: "May 14, 2026",
} as const;
