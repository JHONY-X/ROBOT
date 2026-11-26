import { backendApiRequest } from "./backend-request";
import { professionalsService, type ProfessionalProfile } from "./professionals";

export type VerificationStatus = "Unverified" | "Pending Review" | "Verified" | "Rejected";
export type AvailabilityStatus = "Immediate" | "1 Week" | "1 Month" | "Not Available";
export interface CandidateProfile {
  id?: string;
  fullName: string;
  profilePhotoUrl?: string;
  phone: string;
  email?: string;
  professionalCategory: string;
  qualificationLevel: string;
  educationBackground: string;
  certifications: string;
  yearsOfExperience: number;
  previousEmployment: string;
  professionalSummary: string;
  skills: string[];
  currentLocation: string;
  preferredLocation: string;
  employmentPreferences: string;
  availability: AvailabilityStatus;
  preferredWorkArrangement: "Full-time" | "Part-time" | "Contract" | "Shift Work";
  documents: { name: string; type: string }[];
  consentGiven: boolean;
  status: VerificationStatus;
  dateOfBirth?: string;
  gender?: "male" | "female";
  profilePicture?: File | null;
  licenseFile?: File | null;
  idFrontFile?: File | null;
  idBackFile?: File | null;
  crimeLetterFile?: File | null;
  educationInstitution?: string;
  educationDocument?: File | null;
}

const displayStatus = (status: ProfessionalProfile["verification_status"]): VerificationStatus => ({
  pending: "Pending Review", verified: "Verified", rejected: "Rejected",
}[status] ?? "Unverified");

const apiAvailability = (status: AvailabilityStatus): ProfessionalProfile["availability_status"] =>
  status === "Not Available" ? "unavailable" : "available";
const apiEmploymentPreference = (value: CandidateProfile["preferredWorkArrangement"]): ProfessionalProfile["employment_preference"] => {
  if (value === "Part-time") return "part_time";
  if (value === "Contract") return "contract";
  if (value === "Shift Work") return "temporary";
  return "full_time";
};

function toApiInput(profile: CandidateProfile) {
  const requiredFiles = {
    profile_picture: profile.profilePicture,
    license: profile.licenseFile,
    id_front: profile.idFrontFile,
    id_back: profile.idBackFile,
    crime_letter: profile.crimeLetterFile,
  };
  if (Object.values(requiredFiles).some((file) => !file)) {
    throw new Error("Upload a profile photo, professional license, both ID sides, and a crime clearance letter.");
  }
  if (!profile.dateOfBirth || !profile.gender) throw new Error("Enter your date of birth and gender to create your profile.");
  return {
    profile_picture: requiredFiles.profile_picture!,
    date_of_birth: profile.dateOfBirth,
    gender: profile.gender,
    professional_category: /nurse/i.test(profile.professionalCategory) ? "nurse" : /midwife/i.test(profile.professionalCategory) ? "midwife" : /caregiver/i.test(profile.professionalCategory) ? "caregiver" : "other",
    professional_summary: profile.professionalSummary,
    skills: profile.skills,
    current_location: profile.currentLocation,
    preferred_location: profile.preferredLocation,
    license: requiredFiles.license!,
    id_front: requiredFiles.id_front!,
    id_back: requiredFiles.id_back!,
    crime_letter: requiredFiles.crime_letter!,
    availability_status: apiAvailability(profile.availability),
    employment_preference: apiEmploymentPreference(profile.preferredWorkArrangement),
    consent_to_data_processing: profile.consentGiven,
  };
}

async function toViewProfile(profile: ProfessionalProfile): Promise<CandidateProfile> {
  let account: { account?: { name?: string; email?: string; phone?: string } } | null = null;
  try { account = await backendApiRequest<typeof account>("/api/auth/me"); } catch { /* Profile data remains usable without account metadata. */ }
  const level = profile.qualifications?.find((item) => item.qualification_type === "education");
  const experiences = profile.work_experiences ?? [];
  const availability: AvailabilityStatus = profile.availability_status === "unavailable" ? "Not Available" : "Immediate";
  return {
    id: String(profile.id),
    fullName: account?.account?.name ?? `Professional #${profile.user}`,
    phone: account?.account?.phone ?? "",
    email: account?.account?.email,
    professionalCategory: profile.professional_category,
    qualificationLevel: level?.qualification_level ?? "",
    educationBackground: level?.title ?? "",
    certifications: (profile.qualifications ?? []).filter((item) => item.qualification_type === "certification").map((item) => item.title).join(", "),
    yearsOfExperience: experiences.length,
    previousEmployment: experiences.map((item) => item.organization_name).join(", "),
    professionalSummary: profile.professional_summary,
    skills: profile.skills,
    currentLocation: profile.current_location,
    preferredLocation: profile.preferred_location ?? "",
    employmentPreferences: profile.employment_preference,
    availability,
    preferredWorkArrangement: profile.employment_preference === "part_time" ? "Part-time" : profile.employment_preference === "contract" ? "Contract" : profile.employment_preference === "temporary" ? "Shift Work" : "Full-time",
    documents: [],
    consentGiven: profile.consent_to_data_processing,
    status: displayStatus(profile.verification_status),
    profilePhotoUrl: profile.profile_picture,
  };
}

export const candidateService = {
  submitProfile: async (profile: CandidateProfile) => {
    if (!profile.educationDocument || !profile.educationInstitution?.trim() || !profile.educationBackground.trim()) {
      throw new Error("Add your education details and certificate before submitting.");
    }
    let created: ProfessionalProfile;
    try {
      created = await professionalsService.createProfile(toApiInput(profile));
    } catch (error) {
      // A profile may have been created even if a subsequent qualification upload failed.
      if (!(error instanceof Error) || !error.message.toLowerCase().includes("already have a professional profile")) throw error;
      created = await professionalsService.myProfile();
      await professionalsService.patchMyProfile(toApiInput(profile));
    }
    if (!profile.educationDocument || !profile.educationInstitution?.trim()) {
      throw new Error("Add your education institution and certificate before submitting.");
    }
    const qualificationLevel = /diploma/i.test(profile.qualificationLevel) ? "diploma" : /certificate/i.test(profile.qualificationLevel) ? "certificate" : /msc|md|master/i.test(profile.qualificationLevel) ? "master" : "bachelor";
    await professionalsService.createQualification({
      qualification_type: "education",
      title: profile.educationBackground.trim(),
      institution: profile.educationInstitution.trim(),
      field_of_study: profile.professionalCategory,
      qualification_level: qualificationLevel,
      document_file: profile.educationDocument,
    });
    return created;
  },
  getMyProfile: async () => toViewProfile(await professionalsService.myProfile()),
  updateAvailability: (availability: AvailabilityStatus) => professionalsService.patchMyProfile({ availability_status: apiAvailability(availability) }),
};
