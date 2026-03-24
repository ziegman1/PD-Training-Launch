/**
 * Teams-first delivery: one URL per surface. Facilitator shares `/present/...` only;
 * `/trainer/...` and `/workbook/...` stay private or companion.
 */
export function presentationPath(sessionId: string): string {
  return `/present/${sessionId}`;
}

export function trainerSupportPath(sessionId: string): string {
  return `/trainer/${sessionId}`;
}

export function participantWorkbookPath(sessionId: string): string {
  return `/workbook/${sessionId}`;
}
