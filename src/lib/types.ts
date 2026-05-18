export type Archetype =
  | "applied_ai"
  | "agent_engineering"
  | "llm_infra"
  | "eval"
  | "research_engineer"
  | "forward_deployed"
  | "ml_engineer"
  | "other";

export type Seniority =
  | "junior"
  | "mid"
  | "senior"
  | "staff"
  | "principal"
  | "unknown";

export interface JdRecord {
  id: string;
  company: string;
  title: string;
  location: string;
  source_url: string;
  seniority: Seniority;
  archetype: Archetype;
  years_min: number | null;
  canonical_skills: string[];
  raw_skills: string[];
  body: string;
}

export interface CorpusBundle {
  version: number;
  generated_at: string;
  n_records: number;
  aliases: Record<string, string[]>;
  records: JdRecord[];
}

export interface Classification {
  archetype: Archetype;
  company_preferences: string[];
  level_hint: Seniority;
  reasoning: string;
}

export interface SkillStat {
  skill: string;
  n_jds: number;
  pct: number;
}

export interface ArchetypeProfile {
  archetype: Archetype;
  n_jds_in_archetype: number;
  top_skills: SkillStat[];
  seniority_distribution: Record<string, number>;
  top_companies: Record<string, number>;
}

export interface CompanyProfile {
  company: string;
  n_jds: number;
  top_skills: SkillStat[];
  archetype_distribution: Record<string, number>;
  seniority_distribution: Record<string, number>;
  titles_sample: string[];
}

export interface DeepDiveEligibleCompany {
  name: string;
  n_jds: number;
  archetype_distribution: Record<string, number>;
}
