import type { WorkbookSectionDefinition } from "@/types/launch";

type Props = {
  section: WorkbookSectionDefinition;
  sectionIndex: number;
  sectionTotal: number;
};

export function WorkbookSectionHeader({
  section,
  sectionIndex,
  sectionTotal,
}: Props) {
  return (
    <header className="border-b border-launch-steel/15 pb-8 md:pb-10">
      <p className="launch-eyebrow text-launch-gold/90">
        Section {sectionIndex + 1} of {sectionTotal}
        {section.sectionEyebrow ? ` · ${section.sectionEyebrow}` : ""}
      </p>
      <h1 className="mt-3 text-balance text-2xl font-bold leading-tight tracking-tight text-launch-primary md:text-3xl">
        {section.title}
      </h1>
      {section.subtitle?.trim() ? (
        <p className="mt-4 text-base leading-relaxed text-launch-muted md:text-lg">
          {section.subtitle}
        </p>
      ) : null}
      {section.attribution?.trim() ? (
        <p
          className={`max-w-prose text-sm leading-relaxed text-launch-muted/70 md:text-[0.9375rem] ${
            section.subtitle?.trim() ? "mt-3" : "mt-4"
          }`}
        >
          {section.attribution.trim()}
        </p>
      ) : null}
    </header>
  );
}
