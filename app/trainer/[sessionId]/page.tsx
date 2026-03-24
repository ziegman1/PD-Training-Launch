/** Sole app entry for `TrainerConsoleView` / private facilitator UI. */
import { notFound } from "next/navigation";
import { SessionTrainer } from "@/components/launch/routes/SessionTrainer";
import { resolveSession } from "@/data/sessions/resolveSession";
import { presentationPath } from "@/lib/launchDelivery";

type PageProps = {
  params: Promise<{ sessionId: string }>;
};

export default async function TrainerPage({ params }: PageProps) {
  const { sessionId } = await params;
  const session = resolveSession(sessionId);
  if (!session) notFound();
  return (
    <SessionTrainer
      session={session}
      presentPath={presentationPath(sessionId)}
    />
  );
}
