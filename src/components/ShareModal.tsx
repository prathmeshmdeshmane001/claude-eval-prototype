import { X, ShieldCheck } from 'lucide-react'
import { useEvaluation } from '../context/EvaluationContext'

interface ShareModalProps {
  onClose: () => void
}

export default function ShareModal({ onClose }: ShareModalProps) {
  const { setShared } = useEvaluation()

  const handleShare = () => {
    setShared()
    onClose()
  }

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center select-none"
      style={{ backdropFilter: 'blur(4px)', backgroundColor: 'rgba(20, 20, 19, 0.45)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      {/* Modal card */}
      <div className="w-[440px] bg-[#faf9f5] border border-[#e8e6dc] shadow-ring-elevated rounded-2xl p-6 mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-[#141413] font-serif">Share evaluation log</h3>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-[#87867f] hover:text-[#141413] hover:bg-[#141413]/5 transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* Privacy notice — visually prominent */}
        <div className="flex gap-3 bg-[#f5f4ed] border border-[#c96442]/30 shadow-ring-subtle rounded-xl p-4 mb-5">
          <ShieldCheck size={18} className="text-[#c96442] flex-shrink-0 mt-0.5" />
          <div className="space-y-2">
            <div>
              <p className="text-sm font-serif font-semibold text-[#c96442] mb-0.5">Your conversation stays private</p>
              <p className="text-xs font-serif text-[#5e5d59] leading-relaxed">
                Sharing the log will share <strong className="text-[#141413]">only your evaluation checklist and notes</strong> with
                your team lead. Your conversation with Claude will not be shared.
              </p>
            </div>
            <p className="text-xs font-serif text-[#5e5d59] leading-relaxed border-t border-[#e8e6dc] pt-2">
              <strong className="text-[#141413]">You decide whether to share this log.</strong> Nothing is shared with your team unless you choose to — clicking "Share log" below is the only thing that triggers it.
            </p>
          </div>
        </div>

        {/* Recipient */}
        <div className="mb-5">
          <label className="block text-xs font-serif font-semibold text-[#5e5d59] mb-1.5 uppercase tracking-wider">Share with</label>
          <select className="w-full bg-[#ffffff] border border-[#e8e6dc] shadow-ring-subtle rounded-xl px-3 py-2.5 text-sm font-serif text-[#141413] appearance-none focus:outline-none focus:ring-2 focus:ring-[#c96442]/30 focus:border-[#c96442] transition-colors cursor-pointer">
            <option>Priya — Engagement Manager</option>
          </select>
        </div>

        {/* What's included */}
        <div className="mb-5 border border-[#e8e6dc] bg-[#ffffff] shadow-ring-subtle rounded-xl p-3.5">
          <p className="text-xs font-serif text-[#5e5d59] mb-2 font-semibold uppercase tracking-wider">What will be shared</p>
          <ul className="space-y-1.5">
            {['Checklist completion status (6/6 items)', 'Your notes on individual items', 'Timestamp of evaluation'].map((line) => (
              <li key={line} className="flex items-center gap-2 text-xs font-serif text-[#5e5d59]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4a7c59] flex-shrink-0" />
                {line}
              </li>
            ))}
          </ul>
          <div className="mt-2.5 pt-2.5 border-t border-[#e8e6dc]">
            <p className="text-xs font-serif text-[#87867f] mb-1.5 font-semibold uppercase tracking-wider">What will NOT be shared</p>
            <ul className="space-y-1.5">
              {['Your original prompt', "Claude's response and code", 'The conversation transcript'].map((line) => (
                <li key={line} className="flex items-center gap-2 text-xs font-serif text-[#87867f]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#87867f] flex-shrink-0" />
                  {line}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleShare}
            className="flex-1 bg-[#c96442] hover:bg-[#b85938] hover:shadow-btn-lift active:translate-y-[1px] text-[#faf9f5] text-sm font-serif font-semibold rounded-lg py-2.5 transition-all"
          >
            Share log
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-sm font-serif text-[#5e5d59] hover:text-[#141413] transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
