import resume from "../resume.json";

export async function GET() {
  return new Response(JSON.stringify(resume, null, 2));
}
