import { useState, useEffect } from 'react'
import { ChevronDown, Share2, Zap, Key } from 'lucide-react'
import { Link } from 'react-router-dom'
import { hasGroqApiKey } from '../lib/apiKey'
import ApiKeyModal from './ApiKeyModal'

interface ClaudeHeaderProps {
  title?: string
  /** Path for the "Open manager view" demo link */
  managerPath?: string
}

export default function ClaudeHeader({
  title = 'Python: top users by spend',
  managerPath,
}: ClaudeHeaderProps) {
  const [isKeyModalOpen, setKeyModalOpen] = useState(false)
  const [hasKey, setHasKey]               = useState(() => hasGroqApiKey())

  useEffect(() => {
    const handleKeyChange = () => setHasKey(hasGroqApiKey())
    window.addEventListener('groq_api_key_changed', handleKeyChange)
    return () => window.removeEventListener('groq_api_key_changed', handleKeyChange)
  }, [])

  return (
    <>
      <header className="h-12 flex-shrink-0 flex items-center justify-between px-4 border-b border-[#e8e6dc] bg-[#f5f4ed]">
        <button className="flex items-center gap-1.5 text-sm font-serif text-[#141413] hover:text-[#c96442] transition-colors group">
          <span className="font-semibold tracking-tight truncate max-w-xs">{title}</span>
          <ChevronDown size={14} className="text-[#87867f] group-hover:text-[#c96442] flex-shrink-0" />
        </button>

        <div className="flex items-center gap-2.5">
          {/* AI Mode Selector / Status */}
          <button
            onClick={() => setKeyModalOpen(true)}
            className={`flex items-center gap-1.5 text-xs font-serif rounded-lg px-2.5 py-1 border transition-all hover:scale-[1.02] active:translate-y-[1px] ${
              hasKey
                ? 'bg-[#4a7c59]/10 border-[#4a7c59]/30 text-[#4a7c59] hover:bg-[#4a7c59]/15'
                : 'bg-[#faf9f5] border-[#e8e6dc] shadow-ring-subtle text-[#5e5d59] hover:text-[#141413] hover:bg-[#ffffff]'
            }`}
            title="Configure AI Engine (Groq LLM or Simulated)"
          >
            {hasKey ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-[#4a7c59] animate-pulse" />
                <span className="font-medium">Live (Groq)</span>
              </>
            ) : (
              <>
                <Zap size={12} className="text-[#c96442]" />
                <span className="font-medium">Demo AI</span>
              </>
            )}
          </button>

          {managerPath && (
            <Link
              to={managerPath}
              className="text-xs font-serif text-[#5e5d59] hover:text-[#c96442] transition-colors"
            >
              Open manager view →
            </Link>
          )}

          <button className="flex items-center gap-1.5 text-xs font-serif font-medium text-[#5e5d59] hover:text-[#141413] bg-[#faf9f5] hover:bg-[#ffffff] border border-[#e8e6dc] shadow-ring-subtle rounded-lg px-3 py-1.5 transition-all hover:scale-[1.02] active:translate-y-[1px]">
            <Share2 size={13} className="text-[#87867f]" />
            <span>Share</span>
          </button>
        </div>
      </header>

      <ApiKeyModal isOpen={isKeyModalOpen} onClose={() => setKeyModalOpen(false)} />
    </>
  )
}
