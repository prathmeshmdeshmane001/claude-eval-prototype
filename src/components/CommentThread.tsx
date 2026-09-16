import { useState } from 'react'
import { Send } from 'lucide-react'

interface SeedComment {
  author: string
  initials: string
  timestamp: string
  text: string
}

interface Comment {
  id: number
  author: string
  initials: string
  timestamp: string
  text: string
}

interface CommentThreadProps {
  seedComment: SeedComment
}

export default function CommentThread({ seedComment }: CommentThreadProps) {
  const [comments, setComments] = useState<Comment[]>([
    { id: 1, ...seedComment },
  ])
  const [draft, setDraft] = useState('')

  const submit = () => {
    if (!draft.trim()) return
    setComments((prev) => [
      ...prev,
      { id: Date.now(), author: 'Priya', initials: 'P', timestamp: 'Just now', text: draft.trim() },
    ])
    setDraft('')
  }

  return (
    <section>
      <div className="flex flex-col gap-4 mb-5">
        {comments.map((c) => (
          <div key={c.id} className="flex gap-3">
            <div className="w-7 h-7 rounded-full bg-[#faf9f5] border border-[#e8e6dc] shadow-ring-subtle flex items-center justify-center text-xs font-serif font-bold text-[#5e5d59] flex-shrink-0">
              {c.initials}
            </div>
            <div className="flex-1">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-sm font-serif font-semibold text-[#141413]">{c.author}</span>
                <span className="text-xs font-serif text-[#87867f]">{c.timestamp}</span>
              </div>
              <p className="text-sm font-serif text-[#5e5d59] leading-[1.6]">{c.text}</p>
            </div>
          </div>
        ))}
      </div>

      {/* New comment input */}
      <div className="flex gap-3 items-start">
        <div className="w-7 h-7 rounded-full bg-[#faf9f5] border border-[#e8e6dc] shadow-ring-subtle flex items-center justify-center text-xs font-serif font-bold text-[#5e5d59] flex-shrink-0 mt-0.5">
          P
        </div>
        <div className="flex-1 relative">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submit() }}
            placeholder="Add a follow-up check or comment…"
            rows={2}
            className="w-full bg-[#faf9f5] border border-[#e8e6dc] shadow-ring-subtle rounded-xl px-3 py-2.5 pr-10 text-sm font-serif text-[#141413] placeholder:text-[#87867f] resize-none focus:outline-none focus:ring-2 focus:ring-[#c96442]/30 focus:border-[#c96442] transition-colors leading-[1.6]"
          />
          <button
            onClick={submit}
            disabled={!draft.trim()}
            className="absolute right-2.5 bottom-2.5 p-1 rounded-md text-[#87867f] hover:text-[#c96442] disabled:opacity-30 transition-all hover:scale-105 active:translate-y-[1px]"
          >
            <Send size={14} />
          </button>
        </div>
      </div>
      <p className="text-xs font-serif text-[#87867f] mt-1.5 ml-10">⌘↵ to send</p>
    </section>
  )
}
