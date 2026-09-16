import type { CalibrationProfile } from './calibrationProfile'

const STORAGE_KEY = 'meridian_eval_profile_v1'

export function loadProfile(): CalibrationProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as CalibrationProfile) : null
  } catch {
    return null
  }
}

export function saveProfile(profile: CalibrationProfile): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
}

export function clearProfile(): void {
  localStorage.removeItem(STORAGE_KEY)
}
