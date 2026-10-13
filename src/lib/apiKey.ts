/**
 * Utilities for managing LLM API keys.
 * Supports localStorage for client-side persistence and import.meta.env for build/env vars.
 */

const STORAGE_KEY = 'claude_eval_groq_api_key'

export function getGroqApiKey(): string {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(STORAGE_KEY)?.trim()
    if (stored) return stored
  }
  const envKey = (import.meta.env.VITE_GROQ_API_KEY as string | undefined)?.trim()
  return envKey || ''
}

export function setGroqApiKey(key: string): void {
  if (typeof window === 'undefined') return
  const clean = key.trim()
  if (clean) {
    localStorage.setItem(STORAGE_KEY, clean)
  } else {
    localStorage.removeItem(STORAGE_KEY)
  }
  window.dispatchEvent(new Event('groq_api_key_changed'))
}

export function clearGroqApiKey(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
  window.dispatchEvent(new Event('groq_api_key_changed'))
}

export function hasGroqApiKey(): boolean {
  return !!getGroqApiKey()
}
