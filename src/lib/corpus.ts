import bundleJson from "@/data/web_bundle.json";
import type {
  CorpusBundle,
  JdRecord,
  Archetype,
  ArchetypeProfile,
  SkillStat,
  CompanyProfile,
  DeepDiveEligibleCompany,
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

export function buildCompanyProfile(
  company: string,
  topN = 20,
): CompanyProfile | null {
  if (!company) return null;
  const norm = company.trim().toLowerCase();
  const inCo = bundle.records.filter(
    (r) => r.company.trim().toLowerCase() === norm,
  );
  const n = inCo.length;
  if (n < 3) return null;

  const skillJdCounts = new Map<string, number>();
  for (const r of inCo) {
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
      pct: Math.round((count / n) * 1000) / 10,
    }));

  const archetypeDist: Record<string, number> = {};
  const seniorityDist: Record<string, number> = {};
  for (const r of inCo) {
    archetypeDist[r.archetype] = (archetypeDist[r.archetype] || 0) + 1;
    seniorityDist[r.seniority] = (seniorityDist[r.seniority] || 0) + 1;
  }

  return {
    company: inCo[0].company,
    n_jds: n,
    top_skills,
    archetype_distribution: archetypeDist,
    seniority_distribution: seniorityDist,
    titles_sample: inCo.slice(0, 10).map((r) => r.title),
  };
}

export function pickCompanyEvidence(
  company: string,
  archetype: Archetype,
  n = 5,
): JdRecord[] {
  if (!company) return [];
  const norm = company.trim().toLowerCase();
  const inCo = bundle.records.filter(
    (r) => r.company.trim().toLowerCase() === norm,
  );
  const inArch = inCo.filter((r) => r.archetype === archetype);
  const outArch = inCo.filter((r) => r.archetype !== archetype);
  inArch.sort((a, b) => b.canonical_skills.length - a.canonical_skills.length);
  outArch.sort((a, b) => b.canonical_skills.length - a.canonical_skills.length);
  return [...inArch, ...outArch].slice(0, n);
}

export function getDeepDiveEligibleCompanies(
  minJds = 5,
): DeepDiveEligibleCompany[] {
  const counts = new Map<string, number>();
  for (const r of bundle.records) {
    if (!r.company) continue;
    counts.set(r.company, (counts.get(r.company) || 0) + 1);
  }
  return [...counts.entries()]
    .filter(([, n]) => n >= minJds)
    .sort((a, b) => b[1] - a[1])
    .map(([name, n_jds]) => ({ name, n_jds }));
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
