/// <reference types="vite/client" />

import type { CalibrationProfile } from './calibrationProfile'

const BASE_URL = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL    = 'llama-3.3-70b-versatile'

function apiKey(): string {
  const k = (import.meta.env.VITE_GROQ_API_KEY as string | undefined)?.trim()
  if (!k) throw new Error(
    'VITE_GROQ_API_KEY is not set.\n' +
    'Create prototype/.env with: VITE_GROQ_API_KEY=gsk_...\n' +
    'Then restart the dev server.'
  )
  return k
}

/** Stream a chat completion. Calls onChunk for each text delta; resolves with full text. */
export async function streamResponse(
  userPrompt: string,
  onChunk: (delta: string) => void
): Promise<string> {
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey()}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are a helpful, knowledgeable assistant. Give clear, well-structured responses. For code tasks prefer Python with a brief explanation before the code. Be specific and practical.',
        },
        { role: 'user', content: userPrompt },
      ],
      stream: true,
    }),
  })

  if (!res.ok) throw new Error(`Groq ${res.status}: ${await res.text()}`)

  const reader  = res.body!.getReader()
  const decoder = new TextDecoder()
  let fullText  = ''

  outer: while (true) {
    const { done, value } = await reader.read()
    if (done) break
    for (const line of decoder.decode(value, { stream: true }).split('\n')) {
      if (!line.startsWith('data: ')) continue
      const payload = line.slice(6).trim()
      if (payload === '[DONE]') break outer
      try {
        const delta = (JSON.parse(payload) as any).choices?.[0]?.delta?.content ?? ''
        if (delta) { fullText += delta; onChunk(delta) }
      } catch { /* partial SSE chunk — skip */ }
    }
  }

  return fullText
}

export interface GeneratedChecklistItem {
  id: string
  type: 'ai-suggested'
  priority: 'p1' | 'p2' | 'p3'
  title: string
  description: string
  hasRunCheckButton: boolean
  runCheckResult: string
}

export interface GeneratedChecklist {
  calibration: string
  items: GeneratedChecklistItem[]
}

/**
 * Build a calibration context string from a profile.
 * Sent to the LLM so question depth and terminology match the user's actual level.
 */
function profileContext(profile?: CalibrationProfile): string {
  if (!profile) return ''
  const depths = Object.entries(profile.domainDepths)
    .map(([d, l]) => `${d}: ${l}`)
    .join(', ')
  return `
User profile:
- Role: ${profile.role}
- Domain expertise: ${depths || 'not specified'}
- Verification rigor (from past sessions): ${profile.verificationRigor}
- Prompt specificity: ${profile.promptSpecificity}
- Sessions completed: ${profile.sessionCount}

Adjust question depth to match: a novice needs concrete test cases spelled out; an expert
needs the non-obvious failure modes they might not have considered.`
}

/**
 * After getting the main response, ask Groq to produce 6 targeted evaluation questions
 * specific to the actual content — not generic guidance.
 *
 * Each description must include concrete verification steps drawn from the response:
 * specific values to test, exact edge cases the implementation is vulnerable to,
 * or regression scenarios — so the user can think through and verify, not just acknowledge.
 */
export async function generateChecklist(
  userPrompt: string,
  assistantResponse: string,
  profile?: CalibrationProfile
): Promise<GeneratedChecklist> {
  const system = `You are an expert at helping people critically evaluate AI-generated content.
${profileContext(profile)}

Given the user's question and the AI's response, generate exactly 6 evaluation checklist items.

CRITICAL RULES for each item:
- "title": A short, orienting question (the user's frame for thinking through this item).
- "description": 2-3 sentences of SPECIFIC verification steps drawn from the actual response.
  Do NOT write generic guidance. Reference the actual values, claims, or logic paths from the
  response. Tell the user exactly what to test or check and what a failure looks like.
- "priority": one of "p1", "p2", or "p3".
    p1 = verifies factual correctness of specific claims that could directly mislead a decision.
         Assign p1 to items that check named figures, cited sources, compliance claims, or
         specific calculations. Item 5 (hasRunCheckButton) is always p1.
    p2 = checks completeness, context quality, or important assumptions.
    p3 = catches missed nuances, counterarguments, or good-practice improvements.
  Assign at least 2 items as p1. Never assign more than 3 as p1.
- Item 5: always most analytically demanding, hasRunCheckButton true, priority p1,
  references a specific external source with a realistic runCheckResult.
- "calibration" is a short expertise label e.g. "Research analyst" or "Financial analyst".

Return ONLY a JSON object — no prose:
{
  "calibration": "...",
  "items": [
    { "title": "Question?", "description": "...", "priority": "p1", "hasRunCheckButton": false, "runCheckResult": "" },
    { "title": "Question?", "description": "...", "priority": "p1", "hasRunCheckButton": false, "runCheckResult": "" },
    { "title": "Question?", "description": "...", "priority": "p2", "hasRunCheckButton": false, "runCheckResult": "" },
    { "title": "Question?", "description": "...", "priority": "p2", "hasRunCheckButton": false, "runCheckResult": "" },
    { "title": "Most analytically demanding?", "description": "...", "priority": "p1", "hasRunCheckButton": true, "runCheckResult": "Validated against [source] — [finding]." },
    { "title": "Question?", "description": "...", "priority": "p3", "hasRunCheckButton": false, "runCheckResult": "" }
  ]
}`

  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey()}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: `User's question:\n${userPrompt}\n\nAI's response:\n${assistantResponse}` },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    }),
  })

  if (!res.ok) throw new Error(`Groq checklist ${res.status}: ${await res.text()}`)

  const raw     = await res.json()
  const content = (raw.choices[0].message.content as string).trim()

  let parsed: any
  try {
    parsed = JSON.parse(content)
  } catch {
    const m = content.match(/\{[\s\S]*\}/)
    if (!m) throw new Error('Could not parse checklist JSON from Groq')
    parsed = JSON.parse(m[0])
  }

  const items: GeneratedChecklistItem[] = ((parsed.items ?? []) as any[])
    .slice(0, 6)
    .map((item, i) => ({
      id:                String(i + 1),
      type:              'ai-suggested' as const,
      priority:          (['p1','p2','p3'].includes(item.priority) ? item.priority : 'p2') as 'p1'|'p2'|'p3',
      title:             String(item.title        ?? `Item ${i + 1}`),
      description:       String(item.description  ?? ''),
      hasRunCheckButton: !!item.hasRunCheckButton,
      runCheckResult:    String(item.runCheckResult ?? ''),
    }))

  return { calibration: String(parsed.calibration ?? 'General'), items }
}
