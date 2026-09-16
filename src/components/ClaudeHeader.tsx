import { ChevronDown, Share2 } from 'lucide-react'
import { Link } from 'react-router-dom'

interface ClaudeHeaderProps {
  title?: string
  /** Path for the "Open manager view" demo link */
  managerPath?: string
}

export default function ClaudeHeader({
  title = 'Python: top users by spend',
  managerPath,
}: ClaudeHeaderProps) {
  return (
    <header className="h-12 flex-shrink-0 flex items-center justify-between px-4 border-b border-[#e8e6dc] bg-[#f5f4ed]">
      <button className="flex items-center gap-1.5 text-sm font-serif text-[#141413] hover:text-[#c96442] transition-colors group">
        <span className="font-semibold tracking-tight truncate max-w-xs">{title}</span>
        <ChevronDown size={14} className="text-[#87867f] group-hover:text-[#c96442] flex-shrink-0" />
      </button>

      <div className="flex items-center gap-3">
        {managerPath && (
          <Link
            to={managerPath}
            className="text-xs font-serif text-[#5e5d59] hover:text-[#c96442] transition-colors"
          >
            Open manager view →
          </Link>
        )}
        <button className="flex items-center gap-1.5 text-xs font-medium text-[#5e5d59] hover:text-[#141413] bg-[#faf9f5] hover:bg-[#ffffff] border border-[#e8e6dc] shadow-ring-subtle rounded-lg px-3 py-1.5 transition-all hover:scale-[1.02] active:translate-y-[1px]">
          <Share2 size={13} className="text-[#87867f]" />
          <span>Share</span>
        </button>
      </div>
    </header>
  )
}
