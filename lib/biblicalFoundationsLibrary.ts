/**
 * Curated passage lists for the participant workbook (“Biblical Foundations for Support Raising”).
 * Edit `data/biblical-foundations-library.json` when the source document changes—do not paraphrase
 * references in code.
 */
import raw from "@/data/biblical-foundations-library.json";

export type BibleStudyLibraryCategory = {
  id: string;
  title: string;
  passages: string[];
};

export const BIBLICAL_FOUNDATIONS_LIBRARY = raw as BibleStudyLibraryCategory[];
