import resume from "../resume.json";
import { format } from "date-fns";

export async function GET() {
  const lines: string[] = [];

  lines.push(`# ${resume.basics.name}`);
  lines.push(`**${resume.basics.label}**`);
  lines.push("");
  lines.push(resume.basics.summary);
  lines.push("");
  lines.push("---");
  lines.push("");
  lines.push("## Work Experience");
  lines.push("");

  for (const work of resume.work) {
    const start = format(new Date(work.startDate), "MMM yyyy");
    const end =
      "endDate" in work && work.endDate
        ? format(new Date(work.endDate), "MMM yyyy")
        : "Present";

    const nameStr = work.url ? `[${work.name}](${work.url})` : work.name;
    lines.push(`### ${work.position} - ${nameStr}`);
    lines.push(`*${start} - ${end}*`);
    lines.push("");
    lines.push(work.summary);

    if ("highlights" in work && work.highlights && work.highlights.length > 0) {
      lines.push("");
      for (const h of work.highlights) {
        lines.push(`- ${h}`);
      }
    }

    lines.push("");
  }

  lines.push("---");
  lines.push("");
  lines.push("## Education");
  lines.push("");

  for (const edu of resume.education) {
    lines.push(
      `- **${edu.institution}** - ${edu.studyType} (${edu.startDate} - ${edu.endDate})`,
    );
  }

  lines.push("");
  lines.push("## Languages");
  lines.push("");

  for (const lang of resume.languages) {
    lines.push(`- **${lang.language}**: ${lang.fluency}`);
  }

  lines.push("");

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}
