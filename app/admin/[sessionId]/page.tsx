import { notFound } from "next/navigation";
import { AdminSessionEditor } from "@/components/admin/AdminSessionEditor";
import { isEditableSessionId } from "@/lib/admin/sessionFiles";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ sessionId: string }>;
};

export default async function AdminSessionPage({ params }: PageProps) {
  const { sessionId } = await params;
  if (!isEditableSessionId(sessionId)) notFound();
  return (
    <div>
      <h1 className="mb-6 text-xl font-bold capitalize text-launch-primary">
        Edit {sessionId}
      </h1>
      <AdminSessionEditor sessionId={sessionId} />
    </div>
  );
}
