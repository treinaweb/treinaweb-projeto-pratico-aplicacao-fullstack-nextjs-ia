import { requireSession } from "@/lib/auth/session";
import { getOrCreateProfile } from "@/lib/db/repositories/candidate-profile";
import { listWorkExperiences } from "@/lib/db/repositories/work-experience";
import { listEducations } from "@/lib/db/repositories/education";
import { listCourses } from "@/lib/db/repositories/courses";
import { listProjects } from "@/lib/db/repositories/projects";
import { listProfileLinks } from "@/lib/db/repositories/links";
import { listSkills } from "@/lib/db/repositories/skills";
import { listLanguages } from "@/lib/db/repositories/languages";

import { PageHeader } from "@/components/layout/page-header";
import { PersonalInfoForm } from "@/components/profile/personal-info-form";
import { WorkExperienceSection } from "@/components/profile/work-experience-section";
import { EducationSection } from "@/components/profile/education-section";
import { CourseSection } from "@/components/profile/course-section";
import { ProjectSection } from "@/components/profile/project-section";
import { LinkSection } from "@/components/profile/link-section";
import { SkillSection } from "@/components/profile/skill-section";
import { LanguageSection } from "@/components/profile/language-section";

export default async function ProfilePage() {
  const session = await requireSession();
  const userId = session.user.id;

  const [
    profile,
    workExperiences,
    educations,
    courses,
    projects,
    links,
    skills,
    languages,
  ] = await Promise.all([
    getOrCreateProfile(userId),
    listWorkExperiences(userId),
    listEducations(userId),
    listCourses(userId),
    listProjects(userId),
    listProfileLinks(userId),
    listSkills(userId),
    listLanguages(userId),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <PageHeader
        title="Meu perfil"
        description="Seus dados profissionais, usados em todos os currículos e entrevistas."
      />

      <PersonalInfoForm profile={profile} />
      <WorkExperienceSection items={workExperiences} />
      <EducationSection items={educations} />
      <CourseSection items={courses} />
      <ProjectSection items={projects} />
      <LinkSection items={links} />
      <SkillSection items={skills} />
      <LanguageSection items={languages} />
    </div>
  );
}
