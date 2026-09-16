import { useState } from 'react'
import { Building2, ChevronRight, ChevronLeft, ChevronDown } from 'lucide-react'
import type { CalibrationProfile, ExpertiseLevel, TimeInRole } from '../lib/calibrationProfile'
import { ORG_NAME, ORG_CHECKLIST_ITEMS } from '../data/orgChecks'

// ── Role config ───────────────────────────────────────────────────────────────

const ROLES = [
  'Business Analyst',
  'Associate',
  'Engagement Manager',
  'Senior Manager',
  'Associate Principal',
  'Research Analyst',
  'Data Analyst',
  'Knowledge Expert',
]

/** Sensible domain defaults for each role — user adjusts in Step 2 */
const ROLE_DOMAIN_DEFAULTS: Record<string, Record<string, ExpertiseLevel>> = {
  'Business Analyst': {
    'financial-analysis': 'novice',
    'market-research':    'novice',
    'strategy':           'novice',
  },
  'Associate': {
    'financial-analysis': 'practitioner',
    'market-research':    'practitioner',
    'strategy':           'practitioner',
    'data-statistics':    'novice',
  },
  'Engagement Manager': {
    'financial-analysis': 'practitioner',
    'market-research':    'practitioner',
    'strategy':           'expert',
    'venture-investment': 'practitioner',
    'operations':         'novice',
  },
  'Senior Manager': {
    'financial-analysis': 'expert',
    'strategy':           'expert',
    'market-research':    'practitioner',
    'operations':         'practitioner',
  },
  'Associate Principal': {
    'financial-analysis': 'expert',
    'strategy':           'expert',
    'market-research':    'expert',
    'operations':         'practitioner',
    'venture-investment': 'practitioner',
  },
  'Research Analyst': {
    'market-research':    'practitioner',
    'data-statistics':    'practitioner',
    'financial-analysis': 'novice',
  },
  'Data Analyst': {
    'data-statistics':    'practitioner',
    'technology':         'practitioner',
    'financial-analysis': 'novice',
  },
  'Knowledge Expert': {
    'market-research':    'expert',
    'data-statistics':    'practitioner',
    'strategy':           'practitioner',
  },
}

// ── Domain config ─────────────────────────────────────────────────────────────

const DOMAINS = [
  { key: 'financial-analysis',  label: 'Financial analysis' },
  { key: 'market-research',     label: 'Market research' },
  { key: 'strategy',            label: 'Strategy & consulting' },
  { key: 'venture-investment',  label: 'Venture & investment' },
  { key: 'data-statistics',     label: 'Data & statistics' },
  { key: 'technology',          label: 'Technology evaluation' },
  { key: 'legal-compliance',    label: 'Legal & compliance' },
  { key: 'operations',          label: 'Operations' },
]

const LEVEL_LABELS: Record<ExpertiseLevel, string> = {
  novice:       'Learning',
  practitioner: 'Practitioner',
  expert:       'Expert',
}

const TIME_OPTIONS = [
  { value: '<6m'  as const, label: 'Less than 6 months',  sub: 'Still building foundational knowledge' },
  { value: '6m-2y'as const, label: '6 months – 2 years',  sub: 'Comfortable, growing in depth' },
  { value: '2y+'  as const, label: '2+ years',             sub: 'Confident and experienced' },
]

// ── Sub-components ────────────────────────────────────────────────────────────

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-1.5 mt-5">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i < current ? 'bg-[#c96442] w-6' : 'bg-[#e8e6dc] w-3'}`} />
      ))}
      <span className="text-xs font-serif text-[#87867f] ml-1">Step {current} of {total}</span>
    </div>
  )
}

function DomainRow({
  domain, selected, onToggle, isLast, isDefault,
}: {
  domain: { key: string; label: string }
  selected: ExpertiseLevel | undefined
  onToggle: (level: ExpertiseLevel) => void
  isLast: boolean
  isDefault: boolean
}) {
  return (
    <div className={`flex items-center justify-between px-4 py-2.5 ${!isLast ? 'border-b border-[#e8e6dc]' : ''} ${selected ? 'bg-[#c96442]/[0.03]' : ''}`}>
      <div className="flex items-center gap-2 flex-1 mr-4 min-w-0">
        <span className={`text-sm font-serif ${selected ? 'text-[#141413] font-medium' : 'text-[#5e5d59]'}`}>
          {domain.label}
        </span>
        {isDefault && !selected && (
          <span className="text-[10px] font-serif text-[#87867f] italic flex-shrink-0">suggested</span>
        )}
      </div>
      <div className="flex gap-1.5 flex-shrink-0">
        {(['novice', 'practitioner', 'expert'] as ExpertiseLevel[]).map((level) => (
          <button
            key={level}
            onClick={() => onToggle(level)}
            className={`text-xs font-serif px-2.5 py-1 rounded-md border transition-all duration-150 ${
              selected === level
                ? 'border-[#c96442] bg-[#c96442]/10 text-[#c96442] font-semibold'
                : 'border-[#e8e6dc] text-[#5e5d59] hover:border-[#87867f] hover:text-[#141413] bg-[#ffffff]'
            }`}
          >
            {LEVEL_LABELS[level]}
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

interface OnboardingModalProps {
  onComplete: (profile: CalibrationProfile) => void
  initialProfile?: CalibrationProfile
  onCancel?: () => void
}

export default function OnboardingModal({ onComplete, initialProfile, onCancel }: OnboardingModalProps) {
  const isEditMode = !!initialProfile

  const [step,        setStep]  = useState<1 | 2>(1)
  const [role,        setRole]  = useState(initialProfile?.role ?? 'Business Analyst')
  const [timeInRole,  setTime]  = useState<TimeInRole | null>(initialProfile?.timeInRole ?? null)
  const [domainDepths, setDepths] = useState<Record<string, ExpertiseLevel>>(
    initialProfile?.domainDepths ?? ROLE_DOMAIN_DEFAULTS['Business Analyst'] ?? {}
  )

  const handleRoleChange = (newRole: string) => {
    setRole(newRole)
    setDepths(ROLE_DOMAIN_DEFAULTS[newRole] ?? {})
  }

  const toggleDomain = (key: string, level: ExpertiseLevel) => {
    setDepths((prev) => {
      if (prev[key] === level) { const next = { ...prev }; delete next[key]; return next }
      return { ...prev, [key]: level }
    })
  }

  const finish = () => {
    if (!timeInRole) return
    const verificationRigor: ExpertiseLevel =
      timeInRole === '<6m' ? 'novice' : timeInRole === '6m-2y' ? 'practitioner' : 'expert'
    const timeLabel =
      timeInRole === '<6m' ? '< 6 months' : timeInRole === '6m-2y' ? '6mo – 2yr' : '2+ years'

    onComplete({
      label:             `${role} · ${timeLabel}`,
      role,
      timeInRole,
      domainDepths,
      verificationRigor,
      promptSpecificity: initialProfile?.promptSpecificity ?? 'novice',
      sessionCount:      initialProfile?.sessionCount ?? 0,
      lastUpdated:       new Date().toISOString(),
    })
  }

  const roleDefaults = ROLE_DOMAIN_DEFAULTS[role] ?? {}

  return (
    <div className="fixed inset-0 z-50 bg-[#f5f4ed] overflow-y-auto min-h-[100dvh]">
      <div className="min-h-full flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">

          {/* Org header */}
          <div className="flex items-center gap-2 mb-8">
            <div className="w-6 h-6 rounded-md bg-[#c96442]/15 flex items-center justify-center flex-shrink-0">
              <Building2 size={13} className="text-[#c96442]" />
            </div>
            <span className="text-sm font-serif font-medium text-[#5e5d59]">{ORG_NAME}</span>
          </div>

          {/* ── Step 1 ───────────────────────────────────────────────── */}
          {step === 1 && (
            <>
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-[#141413] font-serif leading-snug">
                  {isEditMode ? 'Update your profile' : <span>Set up your<br />evaluation profile</span>}
                </h1>
                <p className="text-sm font-serif text-[#5e5d59] mt-2 leading-relaxed">
                  {isEditMode
                    ? 'Changes take effect on your next submission.'
                    : 'Takes 2 minutes. Helps calibrate AI verification questions to your actual level — not just your title.'}
                </p>
                <StepIndicator current={1} total={2} />
              </div>

              {/* Org context banner */}
              <div className="flex items-start gap-3 bg-[#faf9f5] border border-[#e8e6dc] shadow-ring-subtle rounded-xl px-4 py-3.5 mb-7">
                <Building2 size={14} className="text-[#c96442] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-serif font-semibold text-[#141413]">
                    {ORG_NAME} has configured {ORG_CHECKLIST_ITEMS.length} org-wide checks
                  </p>
                  <p className="text-xs font-serif text-[#5e5d59] mt-0.5 leading-relaxed">
                    These apply to all analysts. You're adding your own context on top — so checklist
                    questions match where you actually are, not a generic template.
                  </p>
                </div>
              </div>

              {/* Role dropdown */}
              <div className="mb-6">
                <label className="block text-xs font-serif font-semibold text-[#5e5d59] uppercase tracking-wider mb-2">
                  Your role
                </label>
                <div className="relative">
                  <select
                    value={role}
                    onChange={(e) => handleRoleChange(e.target.value)}
                    className="w-full bg-[#faf9f5] border border-[#e8e6dc] shadow-ring-subtle rounded-xl px-4 py-2.5 pr-20 text-sm font-serif text-[#141413] appearance-none focus:outline-none focus:ring-2 focus:ring-[#c96442]/30 focus:border-[#c96442] transition-colors cursor-pointer"
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                  {/* Custom chevron */}
                  <ChevronDown size={13} className="absolute right-10 top-1/2 -translate-y-1/2 text-[#87867f] pointer-events-none" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-[#87867f] pointer-events-none">
                    ·
                  </span>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-serif text-[#5e5d59] bg-[#ffffff] border border-[#e8e6dc] rounded px-1.5 py-0.5 pointer-events-none" style={{ right: '2.75rem' }}>
                    From {ORG_NAME}
                  </span>
                </div>
                {role && ROLE_DOMAIN_DEFAULTS[role] && (
                  <p className="text-xs font-serif text-[#87867f] mt-1.5 px-0.5">
                    Domain defaults will be pre-filled for <span className="text-[#141413] font-medium">{role}</span> — you'll adjust them in the next step.
                  </p>
                )}
              </div>

              {/* Time in role */}
              <div className="mb-8">
                <label className="block text-xs font-serif font-semibold text-[#5e5d59] uppercase tracking-wider mb-2">
                  How long in this role?
                </label>
                <div className="flex flex-col gap-2">
                  {TIME_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setTime(opt.value)}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl border text-left transition-all duration-150 ${
                        timeInRole === opt.value
                          ? 'border-[#c96442] bg-[#faf9f5] shadow-ring-card'
                          : 'border-[#e8e6dc] bg-[#faf9f5] hover:border-[#87867f] shadow-ring-subtle'
                      }`}
                    >
                      <div>
                        <p className={`text-sm font-serif font-medium ${timeInRole === opt.value ? 'text-[#141413] font-semibold' : 'text-[#5e5d59]'}`}>
                          {opt.label}
                        </p>
                        <p className="text-xs font-serif text-[#87867f] mt-0.5">{opt.sub}</p>
                      </div>
                      <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ml-4 transition-all ${
                        timeInRole === opt.value ? 'border-[#c96442] bg-[#c96442]' : 'border-[#87867f]/40'
                      }`} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2.5">
                {isEditMode && onCancel && (
                  <button
                    onClick={onCancel}
                    className="px-4 py-2.5 text-sm font-serif text-[#5e5d59] hover:text-[#141413] bg-[#faf9f5] hover:bg-[#ffffff] border border-[#e8e6dc] shadow-ring-subtle rounded-lg transition-all flex-shrink-0"
                  >
                    Cancel
                  </button>
                )}
                <button
                  onClick={() => setStep(2)}
                  disabled={!timeInRole || !role}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#c96442] hover:bg-[#b85938] hover:shadow-btn-lift active:translate-y-[1px] disabled:opacity-40 disabled:cursor-not-allowed text-[#faf9f5] text-sm font-serif font-semibold rounded-lg px-4 py-2.5 transition-all"
                >
                  Continue
                  <ChevronRight size={14} />
                </button>
              </div>
            </>
          )}

          {/* ── Step 2 ───────────────────────────────────────────────── */}
          {step === 2 && (
            <>
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-[#141413] font-serif leading-snug">
                  Your domain expertise
                </h1>
                <p className="text-sm font-serif text-[#5e5d59] mt-2 leading-relaxed">
                  Pre-filled for <span className="text-[#141413] font-semibold">{role}</span> — adjust to match your actual experience.
                  Unselected means it's not a primary part of your work.
                </p>
                <StepIndicator current={2} total={2} />
              </div>

              {/* Domain table */}
              <div className="border border-[#e8e6dc] bg-[#faf9f5] shadow-ring-card rounded-xl overflow-hidden mb-3">
                <div className="flex items-center justify-between px-4 py-2 border-b border-[#e8e6dc] bg-[#f5f4ed]">
                  <span className="text-xs font-serif font-semibold text-[#5e5d59] flex-1">Area</span>
                  <div className="flex gap-1.5">
                    {(['novice', 'practitioner', 'expert'] as ExpertiseLevel[]).map((l) => (
                      <span key={l} className="text-[11px] font-serif text-[#5e5d59] font-medium w-[78px] text-center">
                        {LEVEL_LABELS[l]}
                      </span>
                    ))}
                  </div>
                </div>
                {DOMAINS.map((domain, i) => (
                  <DomainRow
                    key={domain.key}
                    domain={domain}
                    selected={domainDepths[domain.key]}
                    onToggle={(level) => toggleDomain(domain.key, level)}
                    isLast={i === DOMAINS.length - 1}
                    isDefault={domain.key in roleDefaults && !(domain.key in domainDepths)}
                  />
                ))}
              </div>

              <p className="text-xs font-serif text-[#87867f] mb-7 px-0.5">
                {Object.keys(domainDepths).length === 0
                  ? 'Select at least one area to continue.'
                  : `${Object.keys(domainDepths).length} area${Object.keys(domainDepths).length !== 1 ? 's' : ''} selected.`}
              </p>

              <div className="flex gap-2.5">
                <button
                  onClick={() => setStep(1)}
                  className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-serif text-[#5e5d59] hover:text-[#141413] bg-[#faf9f5] hover:bg-[#ffffff] border border-[#e8e6dc] shadow-ring-subtle rounded-lg transition-all flex-shrink-0"
                >
                  <ChevronLeft size={14} />
                  Back
                </button>
                <button
                  onClick={finish}
                  disabled={Object.keys(domainDepths).length === 0}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#c96442] hover:bg-[#b85938] hover:shadow-btn-lift active:translate-y-[1px] disabled:opacity-40 disabled:cursor-not-allowed text-[#faf9f5] text-sm font-serif font-semibold rounded-lg px-4 py-2.5 transition-all"
                >
                  {isEditMode ? 'Save changes' : 'Finish setup'}
                  <ChevronRight size={14} />
                </button>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  )
}
