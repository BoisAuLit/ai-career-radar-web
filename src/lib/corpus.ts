import bundleJson from "@/data/web_bundle.json";
import type {
  CorpusBundle,
  JdRecord,
  Archetype,
  ArchetypeProfile,
  SkillStat,
} from "./types";

const bundle = bundleJson as unknown as CorpusBundle;

export function getBundleInfo() {
  return {
    n_records: bundle.n_records,
    generated_at: bundle.generated_at,
    n_canonical_skills: Object.keys(bundle.aliases).length,
  };
}

export function getAllRecords(): JdRecord[] {
  return bundle.records;
}

export function getRecordsByArchetype(archetype: Archetype): JdRecord[] {
  return bundle.records.filter((r) => r.archetype === archetype);
}

export function buildArchetypeProfile(
  archetype: Archetype,
  topN = 20,
): ArchetypeProfile {
  const inArch = getRecordsByArchetype(archetype);
  const n = inArch.length;

  const skillJdCounts = new Map<string, number>();
  for (const r of inArch) {
    const seen = new Set<string>();
    for (const skill of r.canonical_skills) {
      if (seen.has(skill)) continue;
      seen.add(skill);
      skillJdCounts.set(skill, (skillJdCounts.get(skill) || 0) + 1);
    }
  }

  const top_skills: SkillStat[] = [...skillJdCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([skill, count]) => ({
      skill,
      n_jds: count,
      pct: n > 0 ? Math.round((count / n) * 1000) / 10 : 0,
    }));

  const seniorityDist: Record<string, number> = {};
  const companyDist: Record<string, number> = {};
  for (const r of inArch) {
    seniorityDist[r.seniority] = (seniorityDist[r.seniority] || 0) + 1;
    if (r.company) {
      companyDist[r.company] = (companyDist[r.company] || 0) + 1;
    }
  }

  const top_companies: Record<string, number> = {};
  for (const [co, c] of [...Object.entries(companyDist)]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)) {
    top_companies[co] = c;
  }

  return {
    archetype,
    n_jds_in_archetype: n,
    top_skills,
    seniority_distribution: seniorityDist,
    top_companies,
  };
}

export function pickEvidenceJds(
  archetype: Archetype,
  preferredCompanies: string[] = [],
  n = 5,
): JdRecord[] {
  const candidates = getRecordsByArchetype(archetype);
  const prefSet = new Set(preferredCompanies.map((c) => c.toLowerCase()));

  const preferred = candidates.filter((r) =>
    prefSet.has(r.company.toLowerCase()),
  );
  const rest = candidates.filter(
    (r) => !prefSet.has(r.company.toLowerCase()),
  );

  preferred.sort((a, b) => b.canonical_skills.length - a.canonical_skills.length);
  rest.sort((a, b) => b.canonical_skills.length - a.canonical_skills.length);

  const pool = [...preferred, ...rest];
  const selected: JdRecord[] = [];
  const seenCompanies = new Set<string>();

  for (const r of pool) {
    if (seenCompanies.has(r.company)) continue;
    selected.push(r);
    seenCompanies.add(r.company);
    if (selected.length >= n) break;
  }
  if (selected.length < n) {
    for (const r of pool) {
      if (selected.includes(r)) continue;
      selected.push(r);
      if (selected.length >= n) break;
    }
  }
  return selected;
}
