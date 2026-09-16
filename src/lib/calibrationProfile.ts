/**
 * CalibrationProfile — replaces the flat `calibrationLabel` string.
 *
 * Built from three sources (in increasing signal quality):
 *  1. Static prior      — role + self-reported domain expertise at onboarding
 *  2. Prompt-time       — vocabulary, constraint specificity, and framing in the live prompt
 *  3. Longitudinal      — patterns across prior evaluation sessions:
 *                         which item types they catch vs. miss, note depth, etc.
 *
 * The profile is sent to the LLM when generating the checklist so question depth,
 * terminology, and which failure modes to emphasise match the user's actual level —
 * not just their job title.
 */

export type ExpertiseLevel = 'novice' | 'practitioner' | 'expert'
export type TimeInRole = '<6m' | '6m-2y' | '2y+'

export interface CalibrationProfile {
  /** Stored so the onboarding form can pre-fill on edit */
  timeInRole?: TimeInRole
  /** Human-readable label used in UI ("Business Analyst — Investment Research") */
  label: string

  /** Designated role from HR / account system */
  role: string

  /**
   * Self-reported or inferred depth per domain.
   * Key examples: 'financial-analysis', 'market-research', 'statistics', 'southeast-asia'
   */
  domainDepths: Record<string, ExpertiseLevel>

  /**
   * How rigorously this user engages with verification steps.
   * Inferred from: note quality, which items they annotate vs. click-through,
   * whether their notes identify specific issues or just acknowledge the item.
   * Updated after each completed evaluation session.
   */
  verificationRigor: ExpertiseLevel

  /**
   * How precisely they scope their prompts.
   * Inferred from: constraint specificity, use of named entities/metrics, iteration patterns.
   * Updated at prompt-submission time.
   */
  promptSpecificity: ExpertiseLevel

  /** Number of completed evaluation sessions — affects longitudinal weight */
  sessionCount: number

  /** ISO timestamp of last update */
  lastUpdated: string
}

/**
 * Derive a CalibrationProfile from a role string.
 * Used for new users before any interaction history exists.
 */
export function profileFromRole(role: string): CalibrationProfile {
  return {
    label: role,
    role,
    domainDepths: {},
    verificationRigor: 'novice',
    promptSpecificity: 'novice',
    sessionCount: 0,
    lastUpdated: new Date().toISOString(),
  }
}

/**
 * Infer prompt-time expertise signals from the user's actual prompt text.
 * Runs client-side before the LLM call to calibrate checklist generation.
 *
 * Signals used:
 *  - Named entities, metrics, or specific constraints → higher promptSpecificity
 *  - Scoped framing ("for a Series B investment in X") → practitioner+
 *  - Vague verbs ("tell me about X") → lower specificity
 */
export function inferPromptSignals(
  prompt: string,
  base: CalibrationProfile
): CalibrationProfile {
  const lower = prompt.toLowerCase()

  // Specificity signals
  const hasNamedEntity  = /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+/.test(prompt)   // Named company/product
  const hasMetric       = /\d+%|\$\d+|\bseries [abc]\b|cagr|tam|arr|mrr/i.test(lower)
  const hasConstraints  = /(must|should|ensure|as of|for the purpose of|in the context of)/i.test(lower)
  const isVague         = /^(tell me about|what is|explain|summarize|describe)\s+\w+$/i.test(prompt.trim())

  const specificitySignals = [hasNamedEntity, hasMetric, hasConstraints].filter(Boolean).length
  const promptSpecificity: ExpertiseLevel =
    isVague            ? 'novice' :
    specificitySignals >= 2 ? 'expert' :
    specificitySignals === 1 ? 'practitioner' :
    base.promptSpecificity

  return { ...base, promptSpecificity }
}

/**
 * Update the profile after a completed evaluation session.
 * In production this is persisted to the user's profile in the database.
 *
 * `itemOutcomes` — for each checklist item: did the user check it, add a note?
 */
export function updateFromSession(
  profile: CalibrationProfile,
  itemOutcomes: Array<{ checked: boolean; hasNote: boolean; noteLength: number }>
): CalibrationProfile {
  const checked = itemOutcomes.filter((i) => i.checked).length
  const total   = itemOutcomes.length
  const noted   = itemOutcomes.filter((i) => i.hasNote).length
  const avgNoteLength = itemOutcomes.reduce((s, i) => s + i.noteLength, 0) / (noted || 1)

  // Heuristic: thorough evaluators check everything and leave substantive notes
  const rigorScore =
    (checked / total)                      * 0.5 +
    (noted   / total)                      * 0.3 +
    Math.min(avgNoteLength / 200, 1)       * 0.2

  const verificationRigor: ExpertiseLevel =
    rigorScore >= 0.7 ? 'expert'       :
    rigorScore >= 0.4 ? 'practitioner' :
    'novice'

  return {
    ...profile,
    verificationRigor,
    sessionCount: profile.sessionCount + 1,
    lastUpdated: new Date().toISOString(),
  }
}

// ── Demo profiles ─────────────────────────────────────────────────────────────

export const DEMO_INVESTMENT_PROFILE: CalibrationProfile = {
  label: 'Business Analyst — Investment Research',
  role: 'Business Analyst',
  domainDepths: {
    'financial-analysis': 'practitioner',
    'market-research':    'practitioner',
    'southeast-asia':     'novice',
    'venture':            'novice',
  },
  verificationRigor: 'practitioner',
  promptSpecificity: 'practitioner',
  sessionCount: 12,
  lastUpdated: '2026-05-28T09:00:00Z',
}

export const DEMO_RESEARCH_PROFILE: CalibrationProfile = {
  label: 'Researcher / Analyst',
  role: 'Research Analyst',
  domainDepths: {
    'statistics':         'practitioner',
    'academic-research':  'practitioner',
    'health-sciences':    'novice',
  },
  verificationRigor: 'practitioner',
  promptSpecificity: 'novice',
  sessionCount: 18,
  lastUpdated: '2026-05-29T14:30:00Z',
}
