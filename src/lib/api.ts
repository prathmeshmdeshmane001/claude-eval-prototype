/**
 * API abstraction layer.
 *
 * In production, these functions call a backend BFF (Backend-for-Frontend) that:
 *  - Holds LLM API credentials server-side (never in the browser bundle)
 *  - Attaches user identity / session from the auth layer
 *  - Writes evaluation logs to the database
 *  - Enforces org-level rate limits and audit logging
 *
 * In this demo, the implementations in groqClient.ts are called directly.
 * Swap the imports below for real fetch('/api/...') calls when adding a backend.
 */

import { streamResponse as _streamResponse, generateChecklist as _generateChecklist } from './groqClient'
import type { CalibrationProfile } from './calibrationProfile'
import type { ChecklistItemData } from '../data/checklist'

export interface GeneratedChecklist {
  calibration: string
  calibrationProfile?: Partial<CalibrationProfile>
  items: ChecklistItemData[]
}

/**
 * Stream an LLM response token-by-token.
 * Production: POST /api/stream  →  SSE stream back to client via the BFF.
 */
export async function streamResponse(
  userPrompt: string,
  onChunk: (delta: string) => void
): Promise<string> {
  return _streamResponse(userPrompt, onChunk)
}

/**
 * Generate a task-calibrated evaluation checklist for a completed response.
 * Production: POST /api/checklist  →  BFF calls LLM, persists result, returns items.
 */
export async function generateChecklist(
  userPrompt: string,
  assistantResponse: string,
  profile?: CalibrationProfile
): Promise<GeneratedChecklist> {
  return _generateChecklist(userPrompt, assistantResponse, profile)
}

/**
 * Persist a completed evaluation log (all items checked + notes).
 * Production: POST /api/evaluation-logs  →  writes to DB, returns log ID for sharing.
 * Demo: no-op, returns a fake share URL.
 */
export async function saveEvaluationLog(_payload: {
  userId: string
  prompt: string
  response: string
  items: Array<{ id: string; checked: boolean; note: string }>
}): Promise<{ logId: string; shareUrl: string }> {
  // Demo stub — replace with real API call
  return { logId: crypto.randomUUID(), shareUrl: '/manager-view' }
}
