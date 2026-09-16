import { useState, useEffect } from 'react'
import { Check, ChevronDown, ChevronUp, CheckCircle2, ExternalLink } from 'lucide-react'
import { useEvaluation } from '../context/EvaluationContext'
import { ChecklistItemData } from '../data/checklist'

/** Renders the run-check confirmation, formatting `backtick` spans inline. */
function RunCheckResult({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-1.5 mt-2.5 text-xs text-[#4a7c59] bg-[#4a7c59]/10 border border-[#4a7c59]/25 rounded-lg px-2.5 py-1.5 font-serif">
      <CheckCircle2 size={13} className="flex-shrink-0 mt-0.5 text-[#4a7c59]" />
      <span className="leading-relaxed">
        {text.split('`').map((seg, i) =>
          i % 2 === 1
            ? <code key={i} className="font-mono bg-[#4a7c59]/15 px-1 py-0.5 rounded text-[#4a7c59] font-semibold">{seg}</code>
            : seg
        )}
      </span>
    </div>
  )
}

interface ChecklistItemProps {
  item: ChecklistItemData
  /** read-only mode used in manager view */
  readOnly?: boolean
  /** override checked state (for manager view) */
  checkedOverride?: boolean
  /** override note (for manager view) */
  noteOverride?: string
}

export default function ChecklistItem({
  item,
  readOnly = false,
  checkedOverride,
  noteOverride,
}: ChecklistItemProps) {
  const { checklistItems, toggleItem, addNote } = useEvaluation()
  const state = checklistItems.find((i) => i.id === item.id)!

  const checked = readOnly && checkedOverride !== undefined ? checkedOverride : state.checked
  const note    = readOnly && noteOverride    !== undefined ? noteOverride    : state.note

  // Auto-expand note textarea when a note already exists
  const [noteExpanded, setNoteExpanded] = useState(note !== '')
  const [hasRunCheck,  setHasRunCheck]  = useState(false)

  useEffect(() => {
    if (note !== '') setNoteExpanded(true)
  }, [note])

  const isOrg = item.type === 'org'

  return (
    <div
      className={`
        rounded-xl border transition-all duration-200 shadow-ring-subtle
        ${isOrg
          ? checked
            ? 'border-[#c96442]/30 bg-[#faf9f5]'
            : 'border-[#c96442]/30 bg-[#faf9f5] hover:border-[#c96442]/60'
          : checked
            ? 'border-[#e8e6dc] bg-[#f5f4ed]/70'
            : 'border-[#e8e6dc] bg-[#faf9f5] hover:border-[#d6d3c7] hover:shadow-ring-card'}
      `}
    >
      <div className="p-3.5">
        <div className="flex gap-3">
          {/* Checkbox */}
          {!readOnly ? (
            <button
              onClick={() => toggleItem(item.id)}
              className={`
                mt-0.5 flex-shrink-0 rounded-md border transition-all duration-150 flex items-center justify-center
                ${checked
                  ? 'bg-[#c96442] border-[#c96442]'
                  : 'border-[#87867f]/60 hover:border-[#c96442] bg-[#ffffff]'}
              `}
              style={{ width: 18, height: 18 }}
              aria-checked={checked}
            >
              {checked && <Check size={11} className="text-[#faf9f5]" strokeWidth={3} />}
            </button>
          ) : (
            <div
              className={`mt-0.5 w-[18px] h-[18px] flex-shrink-0 rounded-md border flex items-center justify-center
                ${checked ? 'bg-[#c96442] border-[#c96442]' : 'border-[#87867f]/50 bg-[#ffffff]'}`}
            >
              {checked && <Check size={11} className="text-[#faf9f5]" strokeWidth={3} />}
            </div>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-2 justify-between">
              <p className={`text-sm font-serif font-semibold leading-snug flex-1 ${checked ? 'text-[#5e5d59] line-through decoration-[#87867f]' : 'text-[#141413]'}`}>
                {item.title}
              </p>
              {item.priority === 'p1' && (
                <span className="text-[10px] font-mono font-semibold tracking-wide px-1.5 py-0.5 rounded border border-[#c96442]/30 text-[#c96442] bg-[#c96442]/10 flex-shrink-0 mt-0.5 select-none">
                  P1
                </span>
              )}
              {item.priority === 'p2' && (
                <span className="text-[10px] font-mono font-semibold tracking-wide px-1.5 py-0.5 rounded border border-[#87867f]/30 text-[#5e5d59] bg-[#87867f]/10 flex-shrink-0 mt-0.5 select-none">
                  P2
                </span>
              )}
            </div>
            <p className="text-xs font-serif text-[#5e5d59] mt-0.5 leading-relaxed">{item.description}</p>

            {/* Action row */}
            {!readOnly && (
              <div className="flex items-center gap-3 mt-2.5 flex-wrap">
                {/* Add note toggle */}
                <button
                  onClick={() => setNoteExpanded((v) => !v)}
                  className="flex items-center gap-1 text-xs font-serif text-[#5e5d59] hover:text-[#141413] transition-colors"
                >
                  {noteExpanded
                    ? <><ChevronUp size={12} /> Hide note</>
                    : <><ChevronDown size={12} /> {note ? 'View note' : '+ Add note'}</>}
                </button>

                {/* Run check button — item 5 only */}
                {item.hasRunCheckButton && !hasRunCheck && (
                  <button
                    onClick={() => setHasRunCheck(true)}
                    className="flex items-center gap-1 text-xs font-serif font-medium text-[#c96442] hover:text-[#b85938] border border-[#c96442]/30 hover:border-[#c96442]/70 rounded-md px-2 py-0.5 bg-[#ffffff] hover:bg-[#c96442]/5 transition-all active:translate-y-[1px]"
                  >
                    <ExternalLink size={11} />
                    Run check
                  </button>
                )}
              </div>
            )}

            {/* Run check result */}
            {item.hasRunCheckButton && hasRunCheck && (
              <RunCheckResult text={item.runCheckResult ?? 'Cross-referenced against available documentation — no significant discrepancies found.'} />
            )}

            {/* Read-only run check indicator */}
            {readOnly && item.hasRunCheckButton && checked && (
              <RunCheckResult text={item.runCheckResult ?? 'Cross-referenced against available documentation — no significant discrepancies found.'} />
            )}

            {/* Note textarea / display */}
            {noteExpanded && (
              <div className="mt-2.5">
                {readOnly ? (
                  note ? (
                    <div className="text-xs font-serif text-[#5e5d59] bg-[#ffffff] rounded-lg px-3 py-2 leading-relaxed border border-[#e8e6dc]">
                      {note}
                    </div>
                  ) : null
                ) : (
                  <textarea
                    value={note}
                    onChange={(e) => addNote(item.id, e.target.value)}
                    placeholder="Add a note about what you found…"
                    rows={3}
                    className="w-full text-xs font-serif text-[#141413] bg-[#ffffff] border border-[#e8e6dc] rounded-lg px-3 py-2 resize-none placeholder:text-[#87867f] focus:outline-none focus:ring-2 focus:ring-[#c96442]/30 focus:border-[#c96442] transition-all leading-relaxed"
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
