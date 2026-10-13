import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Clock, Building2, Sparkles } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import PrivacyBanner from '../components/PrivacyBanner'
import CommentThread from '../components/CommentThread'
import ChecklistItem from '../components/ChecklistItem'
import { CHECKLIST_ITEMS, ITEM_3_SEED_NOTE, ChecklistItemData } from '../data/checklist'
import { RESEARCH_CHECKLIST_ITEMS, RESEARCH_ITEM_3_SEED_NOTE, RESEARCH_MANAGER_COMMENT } from '../data/researchChecklist'
import { MANAGER_COMMENT } from '../data/managerComment'
import {
  LOAN_RISK_CHECKLIST_ITEMS,
  LOAN_RISK_ITEM_3_SEED_NOTE,
  LOAN_RISK_MANAGER_COMMENT,
} from '../data/loanRiskChecklist'
import { ORG_CHECKLIST_ITEMS, ORG_NAME } from '../data/orgChecks'
import { EvaluationProvider } from '../context/EvaluationContext'

// ── Component ─────────────────────────────────────────────────────────────────

interface ManagerViewProps {
  scenario: 'investment' | 'research'
}

export default function ManagerView({ scenario }: ManagerViewProps) {
  const today = new Date().toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  })

  // Read active evaluation session from localStorage if present
  const [activeLog] = useState<any>(() => {
    try {
      const raw = localStorage.getItem('claude_eval_active_log')
      if (raw) return JSON.parse(raw)
    } catch {}
    return null
  })

  const isInvestment = scenario === 'investment'

  // Detect if active task is about loan risk / repayment / charge off
  const isLoanRisk = Boolean(
    activeLog?.taskDesc &&
      /loan|repayment|charge[- ]off|charged[- ]off|delinquency|underwriting|credit risk|lending/i.test(
        activeLog.taskDesc
      )
  )

  // 1. Task description
  let taskDesc = isInvestment
    ? 'Investment due diligence — market opportunity and key risks for NovaPay Series B.'
    : 'Research summary — sleep deprivation effects on adult cognitive performance.'
  if (activeLog?.taskDesc) {
    taskDesc = activeLog.taskDesc
  }

  // 2. Task badge
  let taskBadge = isInvestment ? 'Investment research' : 'Research'
  if (isLoanRisk) {
    taskBadge = 'Credit Risk & Portfolio Analytics'
  } else if (activeLog?.taskBadge) {
    taskBadge = activeLog.taskBadge
  }

  // 3. Calibration label
  let calibLabel = isInvestment
    ? 'Business Analyst — Investment Research'
    : 'Researcher / Analyst'
  if (isLoanRisk) {
    calibLabel = 'Credit Risk Analyst — Portfolio Strategy'
  } else if (activeLog?.calibrationLabel) {
    calibLabel = activeLog.calibrationLabel
  }

  // 4. AI items
  let aiItems: ChecklistItemData[] = isInvestment ? CHECKLIST_ITEMS : RESEARCH_CHECKLIST_ITEMS
  if (isLoanRisk) {
    aiItems = LOAN_RISK_CHECKLIST_ITEMS
  } else if (activeLog?.aiChecklistData && activeLog.aiChecklistData.length > 0) {
    aiItems = activeLog.aiChecklistData.filter(
      (item: any) => !ORG_CHECKLIST_ITEMS.some((o) => o.id === item.id)
    )
  }

  // 5. Manager comment
  let managerComment = isInvestment ? MANAGER_COMMENT : RESEARCH_MANAGER_COMMENT
  if (isLoanRisk) {
    managerComment = LOAN_RISK_MANAGER_COMMENT
  } else if (activeLog?.managerComment) {
    managerComment = activeLog.managerComment
  }

  const backPath = isInvestment ? '/' : '/research'

  // 6. States mapping (checked & notes)
  const aiStates: Record<string, { checked: boolean; note: string }> = {}
  aiItems.forEach((item) => {
    const found = activeLog?.checklistItems?.find((s: any) => s.id === item.id)
    const defaultNote =
      item.id === '3'
        ? isLoanRisk
          ? LOAN_RISK_ITEM_3_SEED_NOTE
          : isInvestment
          ? ITEM_3_SEED_NOTE
          : RESEARCH_ITEM_3_SEED_NOTE
        : ''
    aiStates[item.id] = {
      checked: found !== undefined ? found.checked : true,
      note: found?.note || defaultNote,
    }
  })

  const orgStates: Record<string, { checked: boolean; note: string }> = {}
  ORG_CHECKLIST_ITEMS.forEach((item) => {
    const found = activeLog?.checklistItems?.find((s: any) => s.id === item.id)
    orgStates[item.id] = {
      checked: found !== undefined ? found.checked : true,
      note: found?.note || '',
    }
  })

  const allStates = { ...orgStates, ...aiStates }
  const totalItems = ORG_CHECKLIST_ITEMS.length + aiItems.length
  const completedCount = Object.values(allStates).filter((s) => s.checked).length
  const seedNotes = Object.fromEntries(Object.entries(allStates).map(([k, v]) => [k, v.note]))

  return (
    <EvaluationProvider
      orgChecklistData={ORG_CHECKLIST_ITEMS}
      checklistData={aiItems}
      calibrationLabel={calibLabel}
      managerPath="#"
      seedNotes={seedNotes}
    >
      <div className="flex min-h-[100dvh] h-[100dvh] bg-[#f5f4ed] overflow-hidden">
        <Sidebar />

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Header */}
          <header className="h-12 flex-shrink-0 flex items-center justify-between px-4 border-b border-[#e8e6dc] bg-[#f5f4ed]">
            <Link
              to={backPath}
              className="flex items-center gap-1.5 text-sm font-serif text-[#5e5d59] hover:text-[#c96442] transition-colors"
            >
              <ArrowLeft size={14} />
              Back to conversation
            </Link>
            <span className="text-xs font-serif text-[#87867f]">Manager view</span>
          </header>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-2xl mx-auto px-6 py-8">

              <PrivacyBanner juniorName="Manya" />

              {/* Log header */}
              <div className="mt-7 mb-6">
                <h1 className="text-2xl font-bold text-[#141413] font-serif">
                  Evaluation log: Manya
                </h1>
                <div className="flex items-center gap-3 mt-2 flex-wrap font-serif">
                  <span className="flex items-center gap-1.5 text-xs text-[#5e5d59]">
                    <Clock size={12} className="text-[#87867f]" /> {today}
                  </span>
                  <span className="text-xs text-[#87867f]">·</span>
                  <span className="text-xs text-[#5e5d59]">Task type: {taskBadge}</span>
                  <span className="text-xs text-[#87867f]">·</span>
                  <span className="flex items-center gap-1 text-xs text-[#4a7c59] font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#4a7c59]" />
                    {completedCount} of {totalItems} complete
                  </span>
                </div>
              </div>

              {/* Task card */}
              <div className="mb-6 bg-[#faf9f5] border border-[#e8e6dc] shadow-ring-card rounded-xl p-4 font-serif">
                <p className="text-xs text-[#5e5d59] uppercase tracking-wider font-semibold mb-1.5">Task</p>
                <p className="text-sm text-[#141413] leading-[1.6]">{taskDesc}</p>
                <p className="text-xs text-[#5e5d59] mt-2">
                  AI check calibration: <span className="text-[#141413] font-semibold">{calibLabel}</span>
                </p>
              </div>

              {/* Checklist divider */}
              <div className="flex items-center gap-3 mb-5 font-serif">
                <div className="h-px flex-1 bg-[#e8e6dc]" />
                <span className="text-xs text-[#87867f] uppercase tracking-wider font-medium">Checklist</span>
                <div className="h-px flex-1 bg-[#e8e6dc]" />
              </div>

              {/* ── Org checks ──────────────────────────────────────────── */}
              <div className="mb-4">
                <div className="flex items-center gap-1.5 px-0.5 mb-2.5">
                  <Building2 size={11} className="text-[#c96442] flex-shrink-0" />
                  <span className="text-[11px] font-serif font-bold text-[#c96442] uppercase tracking-wider">
                    Required by {ORG_NAME}
                  </span>
                </div>
                <div className="flex flex-col gap-2.5">
                  {ORG_CHECKLIST_ITEMS.map((item) => (
                    <ChecklistItem
                      key={item.id}
                      item={item}
                      readOnly
                      checkedOverride={allStates[item.id]?.checked ?? true}
                      noteOverride={allStates[item.id]?.note ?? ''}
                    />
                  ))}
                </div>
              </div>

              <div className="h-px bg-[#e8e6dc] mb-4" />

              {/* ── AI-suggested checks ─────────────────────────────────── */}
              <div className="mb-8">
                <div className="flex items-center gap-1.5 px-0.5 mb-2.5">
                  <Sparkles size={11} className="text-[#87867f] flex-shrink-0" />
                  <span className="text-[11px] font-serif font-semibold text-[#5e5d59] uppercase tracking-wider">
                    Suggested for this task
                  </span>
                </div>
                <div className="flex flex-col gap-2.5">
                  {aiItems.map((item) => (
                    <ChecklistItem
                      key={item.id}
                      item={item}
                      readOnly
                      checkedOverride={aiStates[item.id]?.checked ?? true}
                      noteOverride={aiStates[item.id]?.note ?? ''}
                    />
                  ))}
                </div>
              </div>

              {/* Comments divider */}
              <div className="flex items-center gap-3 mb-6 font-serif">
                <div className="h-px flex-1 bg-[#e8e6dc]" />
                <span className="text-xs text-[#87867f] uppercase tracking-wider font-medium">Comments</span>
                <div className="h-px flex-1 bg-[#e8e6dc]" />
              </div>

              <CommentThread seedComment={managerComment} />

              <div className="h-10" />
            </div>
          </div>
        </div>
      </div>
    </EvaluationProvider>
  )
}
