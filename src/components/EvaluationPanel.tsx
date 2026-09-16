import { useState, useEffect } from 'react'
import {
  CheckCircle2, Share2, Loader2, Building2, Sparkles,
  Check, Pencil, ChevronRight, ChevronLeft, AlertTriangle,
} from 'lucide-react'
import { useEvaluation } from '../context/EvaluationContext'
import { useUserProfile } from '../context/UserProfileContext'
import ChecklistItem from './ChecklistItem'
import ShareModal from './ShareModal'
import { ORG_NAME } from '../data/orgChecks'
import type { ExpertiseLevel } from '../lib/calibrationProfile'

const DOMAIN_SHORT: Record<string, string> = {
  'financial-analysis': 'Finance',
  'market-research':    'Market',
  'strategy':           'Strategy',
  'venture-investment': 'Venture',
  'data-statistics':    'Data',
  'technology':         'Tech',
  'legal-compliance':   'Legal',
  'operations':         'Ops',
}

const LEVEL_SHORT: Record<ExpertiseLevel, string> = {
  novice:       'L',
  practitioner: 'P',
  expert:       'E',
}

function ChecklistSkeleton() {
  return (
    <div className="flex flex-col gap-2.5 animate-pulse">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-[#e8e6dc] bg-[#faf9f5] shadow-ring-subtle p-3.5">
          <div className="flex gap-3">
            <div className="w-[18px] h-[18px] rounded-md bg-[#e8e6dc] flex-shrink-0 mt-0.5" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-[#e8e6dc] rounded w-3/4" />
              <div className="h-2.5 bg-[#e8e6dc]/60 rounded w-1/2" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function EvaluationPanel() {
  const {
    checklistData, completedCount, isShared, calibrationLabel, conversationPhase,
    p1Total, p1CompletedCount, allP1Done, isHighStakes,
  } = useEvaluation()
  const { profile, openEditor } = useUserProfile()

  const [showModal,  setShowModal]  = useState(false)
  const [collapsed,  setCollapsed]  = useState(false)
  const [p1Visible,  setP1Visible]  = useState(false)

  useEffect(() => {
    if (allP1Done) {
      const t = setTimeout(() => setP1Visible(true), 60)
      return () => clearTimeout(t)
    } else {
      setP1Visible(false)
    }
  }, [allP1Done])

  const orgItems = checklistData.filter((i) => i.type === 'org')
  const aiItems  = checklistData.filter((i) => i.type !== 'org')
  const total    = checklistData.length
  const pct      = total ? Math.round((completedCount / total) * 100) : 0

  const isGenerating = conversationPhase === 'generating_checklist'
  const isStreaming  = conversationPhase === 'streaming'
  const showProgress = !isGenerating && !isStreaming

  return (
    <>
      <aside
        className={`
          flex-shrink-0 flex flex-col border-l border-[#e8e6dc] bg-[#f5f4ed]
          overflow-hidden transition-all duration-300 ease-in-out select-none
          ${collapsed ? 'w-11' : 'w-[380px]'}
        `}
      >
        {/* ── Collapsed strip ──────────────────────────────────────────── */}
        {collapsed && (
          <div className="flex flex-col items-center w-full h-full py-3">
            {/* Expand button */}
            <button
              onClick={() => setCollapsed(false)}
              title="Expand checklist"
              className="w-8 h-8 flex items-center justify-center rounded-lg text-[#5e5d59] hover:text-[#141413] hover:bg-[#141413]/5 transition-colors flex-shrink-0"
            >
              <ChevronLeft size={14} />
            </button>

            {/* Vertical label */}
            <div className="flex-1 flex items-center justify-center my-3">
              <span
                className="text-[11px] font-serif font-semibold text-[#5e5d59] uppercase tracking-widest select-none"
                style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
              >
                Checklist
              </span>
            </div>

            {/* Status at bottom */}
            {total > 0 && !isGenerating && !isStreaming && (
              <div className="flex flex-col items-center gap-2 flex-shrink-0">
                <div
                  className={`w-2.5 h-2.5 rounded-full transition-colors duration-300 ${
                    allP1Done ? 'bg-[#4a7c59]' : 'bg-[#c96442]'
                  }`}
                  title={allP1Done ? 'Critical checks cleared' : `${p1CompletedCount} of ${p1Total} critical done`}
                />
                <span className="text-[10px] font-mono text-[#5e5d59] tabular-nums">
                  {completedCount}/{total}
                </span>
              </div>
            )}

            {(isGenerating || isStreaming) && (
              <Loader2 size={13} className="animate-spin text-[#c96442] flex-shrink-0" />
            )}
          </div>
        )}

        {/* ── Expanded panel ───────────────────────────────────────────── */}
        {!collapsed && (
          <div className="flex flex-col flex-1 overflow-y-auto min-h-0">

            {/* Panel header */}
            <div className="px-5 pt-5 pb-4 border-b border-[#e8e6dc] bg-[#f5f4ed] flex-shrink-0">
              <div className="flex items-center justify-between mb-0.5">
                <h2 className="text-base font-bold text-[#141413] font-serif tracking-tight">Evaluation Checklist</h2>
                <button
                  onClick={() => setCollapsed(true)}
                  title="Collapse checklist"
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-[#5e5d59] hover:text-[#141413] hover:bg-[#141413]/5 transition-colors flex-shrink-0"
                >
                  <ChevronRight size={14} />
                </button>
              </div>

              <p className="text-xs font-serif mt-0.5">
                <span className="text-[#5e5d59]">AI checks calibrated for:{' '}</span>
                {isGenerating
                  ? <span className="text-[#87867f] italic">generating…</span>
                  : <span className="text-[#141413] font-semibold">{calibrationLabel}</span>
                }
              </p>

              {/* Profile summary */}
              {profile && (
                <div className="mt-3 pt-3 border-t border-[#e8e6dc]">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-serif font-semibold text-[#141413] truncate">{profile.label}</p>
                      {Object.keys(profile.domainDepths).length > 0 && (
                        <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                          {Object.entries(profile.domainDepths).slice(0, 3).map(([domain, level]) => (
                            <span
                              key={domain}
                              className="text-[10px] font-mono text-[#5e5d59] bg-[#faf9f5] border border-[#e8e6dc] shadow-ring-subtle rounded px-1.5 py-0.5 leading-none"
                            >
                              {DOMAIN_SHORT[domain] ?? domain} · {LEVEL_SHORT[level]}
                            </span>
                          ))}
                          {Object.keys(profile.domainDepths).length > 3 && (
                            <span className="text-[10px] font-mono text-[#87867f]">
                              +{Object.keys(profile.domainDepths).length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={openEditor}
                      className="flex items-center gap-1 text-[11px] font-serif text-[#5e5d59] hover:text-[#141413] bg-[#faf9f5] hover:bg-[#ffffff] border border-[#e8e6dc] shadow-ring-subtle rounded-lg px-2 py-1 transition-all hover:scale-105 active:translate-y-[1px] flex-shrink-0"
                    >
                      <Pencil size={10} />
                      Edit
                    </button>
                  </div>
                </div>
              )}

              {/* Progress bars */}
              {showProgress && total > 0 && (conversationPhase === 'demo' || isHighStakes) && (
                <div className="mt-3.5 space-y-2.5">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        {allP1Done
                          ? <Check size={11} className="text-[#4a7c59]" strokeWidth={3} />
                          : <span className="w-1.5 h-1.5 rounded-full bg-[#c96442] inline-block" />
                        }
                        <span className="text-xs font-serif text-[#5e5d59]">
                          {allP1Done
                            ? <span className="text-[#4a7c59] font-semibold">Critical checks cleared</span>
                            : <><span className="text-[#141413] font-semibold">{p1CompletedCount}</span> of {p1Total} critical</>
                          }
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-[#5e5d59] font-semibold">P1</span>
                    </div>
                    <div className="h-1.5 bg-[#e8e6dc] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${allP1Done ? 'bg-[#4a7c59]' : 'bg-[#c96442]'}`}
                        style={{ width: `${p1Total ? Math.round((p1CompletedCount / p1Total) * 100) : 0}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-serif text-[#5e5d59]">
                        <span className="text-[#141413] font-semibold">{completedCount}</span> of {total} total
                      </span>
                      <span className="text-xs font-mono text-[#5e5d59]">{pct}%</span>
                    </div>
                    <div className="h-1.5 bg-[#e8e6dc] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#5e5d59] rounded-full transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Not-high-stakes placeholder — only after a real prompt is submitted */}
            {!isHighStakes && conversationPhase === 'ready' && (
              <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 gap-3 text-center">
                <div className="w-10 h-10 rounded-full bg-[#faf9f5] border border-[#e8e6dc] shadow-ring-subtle flex items-center justify-center">
                  <AlertTriangle size={18} className="text-[#c96442]" />
                </div>
                <p className="text-xs font-serif text-[#5e5d59] leading-relaxed max-w-[260px]">
                  Mark your prompt as <span className="text-[#141413] font-semibold">High stakes</span> in the input to generate a verification checklist.
                </p>
              </div>
            )}

            {/* Checklist content — demo always, live only when high stakes or mid-flight */}
            {(conversationPhase === 'demo' || isHighStakes || isStreaming || isGenerating) && (
              <>
                <div className="flex-1 px-4 py-4 flex flex-col gap-3">
                  {orgItems.length > 0 && (
                    <div>
                      <div className="flex items-center gap-1.5 px-0.5 mb-2">
                        <Building2 size={11} className="text-[#c96442] flex-shrink-0" />
                        <span className="text-[11px] font-serif font-bold text-[#c96442] uppercase tracking-wider">
                          Required by {ORG_NAME}
                        </span>
                      </div>
                      <div className="flex flex-col gap-2">
                        {orgItems.map((item) => <ChecklistItem key={item.id} item={item} />)}
                      </div>
                    </div>
                  )}

                  {orgItems.length > 0 && <div className="h-px bg-[#e8e6dc]" />}

                  <div>
                    <div className="flex items-center gap-1.5 px-0.5 mb-2">
                      <Sparkles size={11} className="text-[#87867f] flex-shrink-0" />
                      <span className="text-[11px] font-serif font-semibold text-[#5e5d59] uppercase tracking-wider">
                        Suggested for this task
                      </span>
                    </div>

                    {isStreaming && (
                      <div className="flex flex-col items-center justify-center py-10 gap-3">
                        <Loader2 size={20} className="animate-spin text-[#c96442]" />
                        <p className="text-xs font-serif text-center text-[#5e5d59]">Waiting for response…</p>
                      </div>
                    )}
                    {isGenerating && (
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2 text-xs font-serif text-[#5e5d59] mb-1">
                          <Loader2 size={13} className="animate-spin text-[#c96442]" />
                          Generating evaluation questions…
                        </div>
                        <ChecklistSkeleton />
                      </div>
                    )}
                    {!isStreaming && !isGenerating && (
                      <div className="flex flex-col gap-2">
                        {aiItems.map((item) => <ChecklistItem key={item.id} item={item} />)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom: shared / accomplishment / hint */}
                {isShared && (
                  <div className="mx-4 mb-4 flex items-start gap-2 bg-[#4a7c59]/10 border border-[#4a7c59]/25 rounded-xl px-4 py-3 flex-shrink-0">
                    <CheckCircle2 size={15} className="text-[#4a7c59] flex-shrink-0 mt-0.5" />
                    <p className="text-xs font-serif text-[#4a7c59] leading-relaxed">
                      Evaluation log shared with your team lead. Your conversation remains private.
                    </p>
                  </div>
                )}

                {allP1Done && !isShared && !isGenerating && !isStreaming && (
                  <div className="px-4 pb-5 flex-shrink-0">
                    <div className={`flex items-start gap-3 bg-[#4a7c59]/10 border border-[#4a7c59]/25 rounded-xl px-4 py-3.5 mb-3 transition-all duration-500 ease-out ${p1Visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                      <div className="w-5 h-5 rounded-full bg-[#4a7c59]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check size={11} className="text-[#4a7c59]" strokeWidth={3} />
                      </div>
                      <div>
                        <p className="text-xs font-serif font-bold text-[#4a7c59]">Critical checks cleared</p>
                        <p className="text-xs font-serif text-[#4a7c59]/80 mt-0.5 leading-relaxed">
                          You've verified the claims that matter most for this output.
                          {completedCount < total && ' P2 items can be reviewed independently.'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowModal(true)}
                      className={`w-full flex items-center justify-center gap-2 bg-[#c96442] hover:bg-[#b85938] hover:shadow-btn-lift active:translate-y-[1px] text-[#faf9f5] text-sm font-serif font-semibold rounded-lg px-4 py-2.5 transition-all duration-300 ${p1Visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
                    >
                      <Share2 size={14} />
                      Share evaluation log with team
                    </button>
                  </div>
                )}

                {!allP1Done && !isShared && !isGenerating && !isStreaming && total > 0 && (
                  <div className="px-4 pb-5 flex-shrink-0">
                    <div className="w-full flex items-center justify-center gap-2 text-xs font-serif text-[#5e5d59] border border-dashed border-[#e8e6dc] bg-[#faf9f5] rounded-xl px-4 py-2.5 shadow-ring-subtle">
                      <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded border border-[#c96442]/30 text-[#c96442] bg-[#c96442]/10">P1</span>
                      Complete all critical checks to share
                    </div>
                  </div>
                )}
              </>
            )}

          </div>
        )}
      </aside>

      {showModal && <ShareModal onClose={() => setShowModal(false)} />}
    </>
  )
}
