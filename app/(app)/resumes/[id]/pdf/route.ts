import { requireSession } from "@/lib/auth/session";
import { getResume } from "@/lib/db/repositories/resumes";
import { renderResumePdf } from "@/lib/pdf/resume-template";

// ASCII-only, filename-safe slug ("João Silva" -> "joao-silva").
function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function GET(
  _request: Request,
  ctx: RouteContext<"/resumes/[id]/pdf">,
) {
  const session = await requireSession();
  const { id } = await ctx.params;

  const resume = await getResume(session.user.id, id);
  if (!resume) {
    return new Response("Not found", { status: 404 });
  }

  const pdf = await renderResumePdf(resume.content);
  const filename = ["curriculo", slugify(resume.content.contact.name), slugify(resume.jobPosting.title)]
    .filter(Boolean)
    .join("-");

  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
