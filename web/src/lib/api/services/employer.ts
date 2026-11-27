import type { AvailabilityStatus, CandidateProfile } from "./candidate";
import { professionalsService, type ProfessionalProfile } from "./professionals";

type WorkArrangement = CandidateProfile["preferredWorkArrangement"];
export interface SearchCriteria {
  query: string;
  category: string;
  qualification: string;
  location: string;
  minExperience: number;
  availability: AvailabilityStatus | "";
  workArrangement: WorkArrangement | "";
}
export interface MatchReason { label: string; type: "positive" | "neutral"; }
export interface MatchedCandidate {
  id: string;
  userId: number;
  name: string;
  role: string;
  qualification: string;
  experienceYears: number;
  location: string;
  professionalSummary: string;
  skills: string[];
  availability: AvailabilityStatus;
  workArrangement: WorkArrangement;
  isVerified: boolean;
  isActive: boolean;
  matchScore: number;
  matchReasons: MatchReason[];
  isSaved: boolean;
}
export interface MatchingConfig { immediateAvailabilityBoost: number; highExperienceBoost: number; locationMatchBoost: number; minExperienceWeight: number; }
export const DEFAULT_MATCHING_CONFIG: MatchingConfig = { immediateAvailabilityBoost: 20, highExperienceBoost: 15, locationMatchBoost: 15, minExperienceWeight: 1 };

const savedIds = new Set<string>();
const normalize = (value: string) => value.toLowerCase().replaceAll("_", " ").replaceAll("-", " ");

function mapProfile(profile: ProfessionalProfile): MatchedCandidate {
  const qualifications = profile.qualifications ?? [];
  const experience = profile.work_experiences ?? [];
  const qualification = qualifications.find((item) => item.qualification_type === "education")?.qualification_level
    ?? qualifications.find((item) => item.qualification_type === "education")?.title ?? "Not listed";
  const category = profile.professional_category === "nurse" ? "Registered Nurse" : profile.professional_category === "midwife" ? "Midwife" : profile.professional_category === "caregiver" ? "Caregiver" : "Healthcare Professional";
  const name = typeof profile.full_name === "string" ? profile.full_name : `Professional #${profile.id}`;
  const availability: AvailabilityStatus = profile.availability_status;
  const workArrangement: WorkArrangement = profile.employment_preference === "part_time" ? "Part-time" : profile.employment_preference === "contract" ? "Contract" : profile.employment_preference === "temporary" ? "Shift Work" : "Full-time";
  return {
    id: String(profile.id), userId: profile.user, name, role: category, qualification,
    experienceYears: experience.length, location: profile.current_location,
    professionalSummary: profile.professional_summary, skills: profile.skills,
    availability, workArrangement, isVerified: profile.verification_status === "verified",
    isActive: profile.availability_status === "available", matchScore: 0, matchReasons: [],
    isSaved: savedIds.has(String(profile.id)),
  };
}

export const employerService = {
  searchCandidates: async (criteria: SearchCriteria, config: MatchingConfig = DEFAULT_MATCHING_CONFIG): Promise<MatchedCandidate[]> => {
    const profiles = await professionalsService.candidates();
    const query = criteria.query.trim().toLowerCase();
    return profiles.map(mapProfile).filter((candidate) => {
      if (criteria.category && normalize(candidate.role) !== normalize(criteria.category)) return false;
      if (criteria.qualification && !normalize(candidate.qualification).includes(normalize(criteria.qualification))) return false;
      if (criteria.location && normalize(candidate.location) !== normalize(criteria.location)) return false;
      if (candidate.experienceYears < criteria.minExperience) return false;
      if (criteria.availability && candidate.availability !== criteria.availability) return false;
      if (criteria.workArrangement && candidate.workArrangement !== criteria.workArrangement) return false;
      return !query || [candidate.name, candidate.role, candidate.qualification, candidate.professionalSummary, ...candidate.skills].some((item) => item.toLowerCase().includes(query));
    }).map((candidate) => {
      let score = 50 + candidate.experienceYears * config.minExperienceWeight;
      const reasons: MatchReason[] = [];
      if (candidate.availability === "available") { score += config.immediateAvailabilityBoost; reasons.push({ label: "Available now", type: "positive" }); }
      if (candidate.experienceYears >= 5) { score += config.highExperienceBoost; reasons.push({ label: "5+ years experience", type: "positive" }); }
      if (criteria.location && normalize(candidate.location) === normalize(criteria.location)) { score += config.locationMatchBoost; reasons.push({ label: "Preferred location", type: "positive" }); }
      return { ...candidate, matchScore: Math.min(score, 100), matchReasons: reasons };
    }).sort((left, right) => right.matchScore - left.matchScore);
  },
  toggleSaveCandidate: async (id: string): Promise<{ success: boolean }> => {
    if (savedIds.has(id)) savedIds.delete(id); else savedIds.add(id);
    return { success: true };
  },
};
