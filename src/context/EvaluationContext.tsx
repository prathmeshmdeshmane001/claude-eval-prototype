import React, { createContext, useContext, useState } from 'react'
import type { ChecklistItemData } from '../data/checklist'

export interface ChecklistItemState {
  id: string
  checked: boolean
  note: string
}

export type ConversationPhase = 'demo' | 'streaming' | 'generating_checklist' | 'ready'

interface EvaluationContextValue {
  checklistData: ChecklistItemData[]
  checklistItems: ChecklistItemState[]
  calibrationLabel: string
  managerPath: string
  toggleItem: (id: string) => void
  addNote: (id: string, note: string) => void
  isShared: boolean
  setShared: () => void
  completedCount: number
  /** Total P1 items */
  p1Total: number
  /** Checked P1 items */
  p1CompletedCount: number
  /** True when all P1 items are checked — gates the share button */
  allP1Done: boolean
  conversationPhase: ConversationPhase
  setConversationPhase: (p: ConversationPhase) => void
  /** Replace AI-suggested items + reset their state; org items are preserved */
  updateChecklistData: (items: ChecklistItemData[], calibration?: string) => void
  /** Whether the current prompt was flagged high-stakes by the user */
  isHighStakes: boolean
  setHighStakes: (v: boolean) => void
}

const EvaluationContext = createContext<EvaluationContextValue | null>(null)

interface EvaluationProviderProps {
  children: React.ReactNode
  /** Company-wide required checks — shown first, never replaced by Groq */
  orgChecklistData?: ChecklistItemData[]
  /** Initial AI-suggested checklist items */
  checklistData: ChecklistItemData[]
  calibrationLabel: string
  managerPath: string
  seedNotes?: Record<string, string>
}

export function EvaluationProvider({
  children,
  orgChecklistData = [],
  checklistData: initialAiData,
  calibrationLabel: initialCalibrationLabel,
  managerPath,
  seedNotes = {},
}: EvaluationProviderProps) {
  const [aiChecklistData,   setAiChecklistData]   = useState<ChecklistItemData[]>(initialAiData)
  const [calibrationLabel,  setCalibrationLabel]  = useState(initialCalibrationLabel)
  const [checklistItems,    setChecklistItems]     = useState<ChecklistItemState[]>([
    ...orgChecklistData.map((item) => ({ id: item.id, checked: false, note: '' })),
    ...initialAiData.map((item) => ({ id: item.id, checked: false, note: seedNotes[item.id] ?? '' })),
  ])
  const [isShared,          setIsSharedState]      = useState(false)
  const [conversationPhase, setConversationPhase]  = useState<ConversationPhase>('demo')
  const [isHighStakes,      setHighStakes]         = useState(false)

  // Merged list exposed to consumers — org checks always first
  const checklistData: ChecklistItemData[] = [...orgChecklistData, ...aiChecklistData]

  const toggleItem = (id: string) =>
    setChecklistItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
    )

  const addNote = (id: string, note: string) =>
    setChecklistItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, note } : item))
    )

  const updateChecklistData = (items: ChecklistItemData[], calibration?: string) => {
    setAiChecklistData(items)
    setChecklistItems((prev) => {
      const orgStates = prev.filter((s) => orgChecklistData.some((o) => o.id === s.id))
      return [
        ...orgStates,
        ...items.map((item) => ({ id: item.id, checked: false, note: '' })),
      ]
    })
    if (calibration) setCalibrationLabel(calibration)
    setIsSharedState(false)
  }

  const completedCount    = checklistItems.filter((i) => i.checked).length
  const p1Total           = checklistData.filter((i) => i.priority === 'p1').length
  const p1CompletedCount  = checklistItems.filter((s) =>
    s.checked && checklistData.find((i) => i.id === s.id)?.priority === 'p1'
  ).length
  const allP1Done = p1Total > 0 && p1CompletedCount === p1Total

  return (
    <EvaluationContext.Provider
      value={{
        checklistData,
        checklistItems,
        calibrationLabel,
        managerPath,
        toggleItem,
        addNote,
        isShared,
        setShared: () => setIsSharedState(true),
        completedCount,
        p1Total,
        p1CompletedCount,
        allP1Done,
        conversationPhase,
        setConversationPhase,
        updateChecklistData,
        isHighStakes,
        setHighStakes,
      }}
    >
      {children}
    </EvaluationContext.Provider>
  )
}

export function useEvaluation() {
  const ctx = useContext(EvaluationContext)
  if (!ctx) throw new Error('useEvaluation must be used within EvaluationProvider')
  return ctx
}
