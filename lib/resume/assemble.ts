import type { FullProfile } from "@/lib/db/repositories/candidate-profile";
import {
  resumeContentSchema,
  type ResumeContent,
  type ResumeDraft,
} from "@/lib/validation/resume";

// Characters the PDF's built-in fonts (WinAnsi encoding) can draw: printable
// ASCII, Latin-1, and the Windows-1252 extras (curly quotes, dashes, bullet…).
const WIN_ANSI_EXTRAS = "€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ";

function isWinAnsi(char: string) {
  const code = char.codePointAt(0) ?? 0;
  return (
    code === 0x0a ||
    (code >= 0x20 && code <= 0x7e) ||
    (code >= 0xa0 && code <= 0xff) ||
    WIN_ANSI_EXTRAS.includes(char)
  );
}

// Cleans AI-written text so it renders in the PDF.
function cleanText(text: string) {
  return Array.from(text.normalize("NFC"))
    .filter(isWinAnsi)
    .join("")
    .replace(/[ \t]+/g, " ")
    .trim();
}

function cleanList(items: string[]) {
  return items.map(cleanText).filter((item) => item !== "");
}

function iso(date: Date) {
  return date.toISOString();
}

function isoOrNull(date: Date | null) {
  return date ? date.toISOString() : null;
}

// Picks profile rows by the ids the AI chose, in the AI's order, ignoring
// unknown and repeated ids.
function pick<T extends { id: string }, R>(
  rows: T[],
  refs: { id: string }[],
  build: (row: T, index: number) => R,
): R[] {
  const byId = new Map(rows.map((row) => [row.id, row]));
  const seen = new Set<string>();
  const result: R[] = [];
  refs.forEach((ref, index) => {
    const row = byId.get(ref.id);
    if (!row || seen.has(ref.id)) return;
    seen.add(ref.id);
    result.push(build(row, index));
  });
  return result;
}

const ids = (values: string[]) => values.map((id) => ({ id }));

export function assembleResume({
  draft,
  profile,
  user,
}: {
  draft: ResumeDraft;
  profile: FullProfile;
  user: { name: string; email: string };
}): ResumeContent {
  const profileSkills = new Map(
    profile.skills.map((skill) => [skill.name.trim().toLowerCase(), skill.name]),
  );
  const skills: string[] = [];
  for (const name of draft.skills) {
    const match = profileSkills.get(name.trim().toLowerCase());
    if (match && !skills.includes(match)) skills.push(match);
  }

  const content: ResumeContent = {
    language: draft.language,
    contact: {
      name: user.name,
      email: user.email,
      phone: profile.phone,
      location: profile.location,
      links: profile.links.map(({ label, url }) => ({ label, url })),
    },
    headline: cleanText(draft.headline),
    summary: cleanText(draft.summary),
    experiences: pick(profile.workExperiences, draft.experiences, (row, i) => ({
      company: row.company,
      role: row.role,
      startDate: iso(row.startDate),
      endDate: isoOrNull(row.endDate),
      highlights: cleanList(draft.experiences[i].highlights),
    })),
    education: pick(profile.educations, ids(draft.educationIds), (row) => ({
      institution: row.institution,
      degree: row.degree,
      startDate: iso(row.startDate),
      endDate: isoOrNull(row.endDate),
    })),
    courses: pick(profile.courses, ids(draft.courseIds), (row) => ({
      name: row.name,
      institution: row.institution,
      completedAt: isoOrNull(row.completedAt),
      workloadHours: row.workloadHours,
    })),
    projects: pick(profile.projects, draft.projects, (row, i) => ({
      name: row.name,
      description: cleanText(draft.projects[i].description),
      link: row.link,
    })),
    skills,
    languages: pick(profile.languages, ids(draft.languageIds), (row) => ({
      name: row.name,
      proficiency: row.proficiency,
    })),
  };

  return resumeContentSchema.parse(content);
}

// The profile must have something a resume can be built from.
export function profileHasResumeContent(profile: FullProfile) {
  return (
    profile.workExperiences.length > 0 ||
    profile.educations.length > 0 ||
    profile.projects.length > 0 ||
    profile.skills.length > 0
  );
}
