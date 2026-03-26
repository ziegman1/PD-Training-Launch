import { notFound } from "next/navigation";
import { SessionWorkbook } from "@/components/launch/routes/SessionWorkbook";
import { resolveSession } from "@/data/sessions/resolveSession";

type PageProps = {
  params: Promise<{ sessionId: string }>;
};

export default async function WorkbookPage({ params }: PageProps) {
  const { sessionId } = await params;
  const session = await resolveSession(sessionId);
  if (!session) notFound();
  return <SessionWorkbook session={session} />;
}
