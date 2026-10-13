/// <reference types="vite/client" />

import type { CalibrationProfile } from './calibrationProfile'
import { getGroqApiKey } from './apiKey'
import { getSimulatedResponse, simulateStream, getSimulatedChecklist } from './simulationEngine'
import type { GeneratedChecklist } from './api'
import type { ChecklistItemData } from '../data/checklist'

const BASE_URL = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL    = 'llama-3.3-70b-versatile'

/** Stream a chat completion. Calls onChunk for each text delta; resolves with full text. */
export async function streamResponse(
  userPrompt: string,
  onChunk: (delta: string) => void
): Promise<string> {
  const key = getGroqApiKey()

  // If no API key is provided, use seamless realistic simulation engine
  if (!key) {
    const simulatedText = getSimulatedResponse(userPrompt)
    return simulateStream(simulatedText, onChunk)
  }

  // Live Groq API call
  try {
    const res = await fetch(BASE_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
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

    if (!res.ok) {
      if (res.status === 401) {
        throw new Error('Groq API authentication failed (invalid API key). Please check your key in settings or clear it to use Demo Mode.')
      }
      if (res.status === 429) {
        throw new Error('Groq rate limit exceeded. Please wait a moment or switch to Demo Mode.')
      }
      throw new Error(`Groq API error (${res.status}): ${await res.text()}`)
    }

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
  } catch (err) {
    if (err instanceof TypeError && err.message.includes('fetch')) {
      throw new Error('Could not connect to Groq API. Please check your internet connection or switch to Demo Mode.')
    }
    throw err
  }
}

/**
 * Build a calibration context string from a profile and extracted prompt signals.
 * Sent to the LLM so question depth, terminology, and failure modes match the user's actual level.
 */
function profileContext(profile?: CalibrationProfile): string {
  if (!profile) return ''
  const depths = Object.entries(profile.domainDepths)
    .map(([d, l]) => `${d}: ${l}`)
    .join(', ')

  const signals = profile.promptSignals
    ? `\n- Prompt Signals: Domain=${profile.promptSignals.detectedDomain}, FactualDensity=${profile.promptSignals.factualDensity}, Specificity=${profile.promptSignals.promptSpecificity}`
    : ''

  return `
User profile & context:
- Role: ${profile.role}
- Domain expertise: ${depths || 'not specified'}
- Verification rigor: ${profile.verificationRigor}
- Prompt specificity: ${profile.promptSpecificity}
- Completed evaluation sessions: ${profile.sessionCount}${signals}

Adjust question depth to match: a novice needs concrete test queries spelled out; an expert
needs structural failure modes and non-obvious incentive misalignments.`
}

/**
 * Produce 6 targeted evaluation questions specific to the actual content,
 * strictly governed by the Checklist Prioritization Logic:
 *   P1: Critical (Truth — could fail externally)
 *   P2: Important (Completeness — could mislead)
 *   P3: Best Practice (Quality — could be sharper)
 */
export async function generateChecklist(
  userPrompt: string,
  assistantResponse: string,
  profile?: CalibrationProfile
): Promise<GeneratedChecklist> {
  const key = getGroqApiKey()

  // If no API key is provided, use calibrated simulation engine
  if (!key) {
    await new Promise((r) => setTimeout(r, 600))
    return getSimulatedChecklist(userPrompt, assistantResponse, profile)
  }

  const system = `You are an expert at helping professionals critically evaluate AI-generated content.
${profileContext(profile)}

Given the user's prompt and the AI's response, generate exactly 6 evaluation checklist items.

CHECKLIST PRIORITIZATION LOGIC ("Priority directs attention"):
- P1 — Critical (Truth — could fail externally):
  Verifies factual correctness of named figures, cited sources, math/calculations, or regulatory claims.
  If factually inaccurate, this claim could fail externally before an investment committee, client, or regulator.
  Assign P1 to Items 1, 2, and 5. Priority category: "truth".
  Item 5 is always the most analytically demanding check with hasRunCheckButton: true and an authoritative runCheckResult.

- P2 — Important (Completeness — could mislead):
  Verifies completeness, missing baseline assumptions, unstated risks, survivor bias, or omitted competitors.
  Even if facts are true, omitting this context could mislead strategic decision-making.
  Assign P2 to Items 3 and 4. Priority category: "completeness".

- P3 — Best Practice (Quality — could be sharper):
  Catches omitted nuances, counterarguments, alternative analytical frameworks, or quality refinements.
  Assign P3 to Item 6. Priority category: "quality".

CRITICAL CONTENT RULES:
- "title": A short, orienting question framing the cognitive check.
- "description": 2-3 sentences of SPECIFIC verification steps referencing the exact numbers, entities, or claims from the response text. Never write generic boilerplate.
- For loan / credit risk / lending domains:
  * P1 (Truth) must test accounting/regulatory standards (e.g. GAAP/CECL charge-off definitions vs 30-89 DPD delinquency), vintage seasoning survival curves, and ECOA/CFPB Fair Lending disparate impact compliance.
  * P2 (Completeness) must test endogenous interest-rate pricing bias vs root behavioral drivers (DTI, utilization), and collections triage distinguishing self-cure vs imminent roll-to-loss.
  * P3 (Quality) must test macroeconomic cycle sensitivity / stress-testing.
- "calibration": A concise expertise label matching the role and domain (e.g., "Credit Risk Analyst — Portfolio Strategy", "Business Analyst — Investment Research").

Return ONLY a valid JSON object matching this schema:
{
  "calibration": "...",
  "items": [
    { "title": "...", "description": "...", "priority": "p1", "priorityCategory": "truth", "hasRunCheckButton": false, "runCheckResult": "" },
    { "title": "...", "description": "...", "priority": "p1", "priorityCategory": "truth", "hasRunCheckButton": false, "runCheckResult": "" },
    { "title": "...", "description": "...", "priority": "p2", "priorityCategory": "completeness", "hasRunCheckButton": false, "runCheckResult": "" },
    { "title": "...", "description": "...", "priority": "p2", "priorityCategory": "completeness", "hasRunCheckButton": false, "runCheckResult": "" },
    { "title": "...", "description": "...", "priority": "p1", "priorityCategory": "truth", "hasRunCheckButton": true, "runCheckResult": "Validated against [source] — [finding]." },
    { "title": "...", "description": "...", "priority": "p3", "priorityCategory": "quality", "hasRunCheckButton": false, "runCheckResult": "" }
  ]
}`

  try {
    const res = await fetch(BASE_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: `User's prompt:\n${userPrompt}\n\nAI's response:\n${assistantResponse}` },
        ],
        temperature: 0.25,
        response_format: { type: 'json_object' },
      }),
    })

    if (!res.ok) {
      console.warn(`Groq checklist failed with status ${res.status}. Falling back to simulated checklist.`)
      return getSimulatedChecklist(userPrompt, assistantResponse, profile)
    }

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

    const items: ChecklistItemData[] = ((parsed.items ?? []) as any[])
      .slice(0, 6)
      .map((item, i) => {
        const priority = (['p1','p2','p3'].includes(item.priority) ? item.priority : (i === 0 || i === 1 || i === 4 ? 'p1' : i === 5 ? 'p3' : 'p2')) as 'p1'|'p2'|'p3'
        const priorityCategory = (['truth','completeness','quality'].includes(item.priorityCategory)
          ? item.priorityCategory
          : priority === 'p1' ? 'truth' : priority === 'p3' ? 'quality' : 'completeness') as 'truth'|'completeness'|'quality'

        return {
          id:                String(i + 1),
          type:              'ai-suggested' as const,
          priority,
          priorityCategory,
          title:             String(item.title        ?? `Item ${i + 1}`),
          description:       String(item.description  ?? ''),
          hasRunCheckButton: i === 4 || !!item.hasRunCheckButton,
          runCheckResult:    String(item.runCheckResult ?? ''),
        }
      })

    return { calibration: String(parsed.calibration ?? 'Calibrated Analyst'), items }
  } catch (err) {
    console.warn('Groq checklist generation error:', err, 'Falling back to simulated checklist.')
    return getSimulatedChecklist(userPrompt, assistantResponse, profile)
  }
}
