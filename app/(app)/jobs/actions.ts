"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ZodError } from "zod";

import { requireSession } from "@/lib/auth/session";
import { parseJobPosting } from "@/lib/ai/job-parser";
import { createJobPosting as createJobPostingRepo } from "@/lib/db/repositories/job-postings";
import {
  jobPostingFormSchema,
  jobPostingInputFromFormData,
  rawJobPostingSchema,
  type JobPostingData,
} from "@/lib/validation/job-posting";

export type ParseJobPostingState =
  | {
      rawText: string;
      extracted?: JobPostingData;
      error?: string;
    }
  | undefined;

export type CreateJobPostingState =
  | {
      error?: string;
      fieldErrors?: Record<string, string>;
    }
  | undefined;

function fieldErrorsFromZod(error: ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !errors[key]) {
      errors[key] = issue.message;
    }
  }
  return errors;
}

const PARSE_ERROR = "Não foi possível analisar a vaga. Tente novamente.";

export async function parseJobPostingAction(
  _prevState: ParseJobPostingState,
  formData: FormData,
): Promise<ParseJobPostingState> {
  await requireSession();

  const rawInput = formData.get("rawText");
  const rawText = typeof rawInput === "string" ? rawInput : "";

  const result = rawJobPostingSchema.safeParse({ rawText });
  if (!result.success) {
    return { rawText, error: result.error.issues[0].message };
  }

  try {
    const extracted = await parseJobPosting(result.data.rawText);
    return { rawText, extracted };
  } catch (error) {
    console.error("Job posting parsing failed", error);
    return { rawText, error: PARSE_ERROR };
  }
}

export async function createJobPostingAction(
  _prevState: CreateJobPostingState,
  formData: FormData,
): Promise<CreateJobPostingState> {
  const session = await requireSession();

  const result = jobPostingFormSchema.safeParse(
    jobPostingInputFromFormData(formData),
  );

  if (!result.success) {
    return { fieldErrors: fieldErrorsFromZod(result.error) };
  }

  await createJobPostingRepo(session.user.id, result.data);
  revalidatePath("/jobs");
  redirect("/jobs");
}
