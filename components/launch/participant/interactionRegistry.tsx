import type { ComponentType } from "react";
import type { AudienceLaunchSlide, InteractionType } from "@/types/launch";
import { NoneBlock } from "@/components/launch/participant/interactions/NoneBlock";
import { ReflectionBlock } from "@/components/launch/participant/interactions/ReflectionBlock";
import { ExerciseBlock } from "@/components/launch/participant/interactions/ExerciseBlock";
import { DiscussionBlock } from "@/components/launch/participant/interactions/DiscussionBlock";
import { FillInBlock } from "@/components/launch/participant/interactions/FillInBlock";
import { PairShareBlock } from "@/components/launch/participant/interactions/PairShareBlock";
import { BibleStudyBlock } from "@/components/launch/participant/interactions/BibleStudyBlock";

type InteractionComponent = ComponentType<{ slide: AudienceLaunchSlide }>;

/**
 * Map interaction types to UI blocks. Add new types here (and in `InteractionType`)
 * without touching ParticipantLayer shell.
 */
export const participantInteractionRegistry: Record<
  InteractionType,
  InteractionComponent
> = {
  none: NoneBlock,
  reflection: ReflectionBlock,
  exercise: ExerciseBlock,
  discussion: DiscussionBlock,
  fillIn: FillInBlock,
  pairShare: PairShareBlock,
  prayer: NoneBlock,
  bibleStudy: BibleStudyBlock,
};

export function getParticipantInteraction(
  type: InteractionType,
): InteractionComponent {
  return participantInteractionRegistry[type] ?? NoneBlock;
}
