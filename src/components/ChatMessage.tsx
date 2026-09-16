import { ReactNode } from 'react'
import { Copy, ThumbsUp, ThumbsDown, RotateCcw } from 'lucide-react'
import { AnthropicAsterisk } from './Sidebar'

interface ChatMessageProps {
  role: 'user' | 'assistant'
  content: ReactNode
}

export default function ChatMessage({ role, content }: ChatMessageProps) {
  if (role === 'user') {
    return (
      <div className="flex justify-end mb-6">
        <div className="max-w-[72%] bg-[#faf9f5] border border-[#e8e6dc] shadow-ring-subtle rounded-2xl px-4 py-3 text-[#141413] font-serif text-[15px] leading-[1.6]">
          {content}
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-3 mb-6 group">
      {/* Asterisk icon */}
      <div className="w-7 h-7 flex-shrink-0 flex items-center justify-center mt-0.5">
        <AnthropicAsterisk size={18} />
      </div>

      {/* Message content — Georgia serif body, max 72ch */}
      <div className="flex-1 min-w-0 max-w-[72ch]">
        <div className="text-[#141413] font-serif text-[15px] leading-[1.6]">{content}</div>

        {/* Action row */}
        <div className="flex items-center gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
          {[
            { icon: Copy,       title: 'Copy' },
            { icon: ThumbsUp,   title: 'Good response' },
            { icon: ThumbsDown, title: 'Bad response' },
            { icon: RotateCcw,  title: 'Regenerate' },
          ].map(({ icon: Icon, title }) => (
            <button
              key={title}
              title={title}
              className="p-1.5 rounded-md text-[#87867f] hover:text-[#141413] hover:bg-[#141413]/5 transition-all hover:scale-105 active:translate-y-[1px]"
            >
              <Icon size={14} />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
