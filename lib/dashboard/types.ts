import type { InterviewAnalysisContent } from "@/lib/validation/interview-analysis";

export type Criteria = InterviewAnalysisContent["criteria"];

export type PostingRef = { title: string; company: string | null };

// Plain snapshot of the candidate's data that every dashboard rule reads.
// Lists are ordered newest first.
export type DashboardSummary = {
  profile: {
    hasHeadline: boolean;
    hasSummary: boolean;
    counts: {
      workExperiences: number;
      educations: number;
      courses: number;
      projects: number;
      links: number;
      skills: number;
      languages: number;
    };
  };
  jobPostings: {
    id: string;
    title: string;
    company: string | null;
    createdAt: Date;
    resumeCount: number;
  }[];
  resumes: {
    id: string;
    createdAt: Date;
    posting: PostingRef;
    interviewCount: number;
  }[];
  interviews: {
    id: string;
    status: "IN_PROGRESS" | "COMPLETED";
    createdAt: Date;
    completedAt: Date | null;
    posting: PostingRef;
    hasAnswers: boolean;
    analysis: {
      overallScore: number;
      // null when the stored content doesn't parse; the score still counts.
      criteria: Criteria | null;
      createdAt: Date;
    } | null;
  }[];
};
