/**
 * Presentation routes: lock to one viewport height so shared slides never
 * rely on page scroll (Teams screen share).
 */
export default function PresentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-dvh max-h-dvh min-h-0 overflow-hidden">{children}</div>
  );
}
