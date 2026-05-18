import { getDeepDiveEligibleCompanies } from "@/lib/corpus";

export async function GET(): Promise<Response> {
  const companies = getDeepDiveEligibleCompanies(5);
  return Response.json({ companies });
}
