import type { ReactNode } from "react";

type BaseLayoutProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Immersive shell: navy → deep charcoal → black gradient, high-contrast type.
 */
export function BaseLayout({ children, className = "" }: BaseLayoutProps) {
  return (
    <div
      className={`launch-gradient-bg min-h-dvh min-w-0 font-sans text-launch-primary antialiased ${className}`}
    >
      {children}
    </div>
  );
}
