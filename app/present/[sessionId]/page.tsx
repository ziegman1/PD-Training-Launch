/**
 * Teams screen share: audience-facing deck only (`presentationLock`).
 * Do not mount trainer notes or `TrainerConsoleView` on this route.
 */
import { notFound } from "next/navigation";
import { SessionPresentation } from "@/components/launch/routes/SessionPresentation";
import { resolveSession } from "@/data/sessions/resolveSession";

type PageProps = {
  params: Promise<{ sessionId: string }>;
};

export default async function PresentPage({ params }: PageProps) {
  const { sessionId } = await params;
  const session = await resolveSession(sessionId);
  if (!session) notFound();
  return <SessionPresentation session={session} />;
}
