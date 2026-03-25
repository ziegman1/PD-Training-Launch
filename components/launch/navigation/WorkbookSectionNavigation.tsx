"use client";

type Props = {
  sectionIndex: number;
  sectionTotal: number;
  onPrev: () => void;
  onNext: () => void;
};

export function WorkbookSectionNavigation({
  sectionIndex,
  sectionTotal,
  onPrev,
  onNext,
}: Props) {
  const last = sectionIndex >= sectionTotal - 1;
  const first = sectionIndex <= 0;

  return (
    <div className="flex items-center justify-center gap-2 py-4 md:gap-3">
      <button
        type="button"
        onClick={onPrev}
        disabled={first}
        className="min-w-[6.5rem] rounded-full border border-launch-neutral px-4 py-2 text-sm font-semibold text-launch-secondary transition-all duration-200 ease-out hover:border-launch-steel/50 hover:text-launch-primary disabled:cursor-not-allowed disabled:opacity-30"
      >
        Prev
      </button>
      <span className="font-mono text-xs text-launch-muted">
        {sectionIndex + 1} / {sectionTotal}
      </span>
      <button
        type="button"
        onClick={onNext}
        disabled={last}
        className="min-w-[6.5rem] rounded-full bg-launch-gold px-4 py-2 text-sm font-semibold text-launch-navy transition-all duration-200 ease-out hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-30"
      >
        Next
      </button>
    </div>
  );
}
