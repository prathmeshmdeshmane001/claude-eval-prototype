import { useState, useRef, useEffect, type ReactNode } from 'react'
import { Send, AlertCircle, AlertTriangle } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import ClaudeHeader from '../components/ClaudeHeader'
import ChatMessage from '../components/ChatMessage'
import CodeBlock from '../components/CodeBlock'
import EvaluationPanel from '../components/EvaluationPanel'
import { useEvaluation } from '../context/EvaluationContext'
import { INVESTMENT_PROMPT, INVESTMENT_RESPONSE_PARAGRAPHS } from '../data/conversation'
import { RESEARCH_PROMPT, RESEARCH_RESPONSE_PARAGRAPHS } from '../data/researchConversation'
import { streamResponse, generateChecklist } from '../lib/api'
import { inferPromptSignals, DEMO_INVESTMENT_PROFILE, DEMO_RESEARCH_PROFILE } from '../lib/calibrationProfile'
import { useUserProfile } from '../context/UserProfileContext'

// ── Hardcoded demo responses ─────────────────────────────────────────────────

function ParagraphResponseContent({ paragraphs }: { paragraphs: Array<{ heading?: string | null; text: string }> }) {
  return (
    <div className="font-serif">
      {paragraphs.map((para, i) => (
        <div key={i} className="mb-4 last:mb-0">
          {para.heading && (
            <p className="text-xs font-semibold text-[#5e5d59] uppercase tracking-wider mb-1.5 font-serif">
              {para.heading}
            </p>
          )}
          <p className="text-[15px] leading-[1.6] text-[#141413]">{para.text}</p>
        </div>
      ))}
    </div>
  )
}

// ── Live (streamed) response renderer ───────────────────────────────────────

function renderInline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((seg, k) => {
    if (seg.startsWith('**') && seg.endsWith('**'))
      return <strong key={k} className="font-bold text-[#141413]">{seg.slice(2, -2)}</strong>
    if (seg.startsWith('`') && seg.endsWith('`'))
      return <code key={k} className="font-mono text-[0.82em] bg-[#eae8df] text-[#141413] rounded px-1.5 py-0.5 border border-[#e8e6dc]">{seg.slice(1, -1)}</code>
    return seg
  })
}

function LiveResponse({ text, streaming }: { text: string; streaming: boolean }) {
  const parts = text.split(/(```(?:\w+)?\n[\s\S]*?```)/g)
  let key = 0

  const nodes: ReactNode[] = parts.flatMap((part): ReactNode[] => {
    const codeMatch = part.match(/^```(\w*)\n([\s\S]*)```$/)
    if (codeMatch) {
      return [<CodeBlock key={key++} code={codeMatch[2]} language={codeMatch[1] || 'text'} />]
    }

    const result: ReactNode[] = []
    const lines = part.split('\n')
    let listBuf: string[] = []
    let paraBuf: string[] = []

    const flushPara = () => {
      const t = paraBuf.join(' ').trim()
      if (t) result.push(
        <p key={key++} className="text-[15px] font-serif leading-[1.6] text-[#141413] mb-3">{renderInline(t)}</p>
      )
      paraBuf = []
    }

    const flushList = () => {
      if (!listBuf.length) return
      result.push(
        <ul key={key++} className="mb-3 space-y-1.5 font-serif">
          {listBuf.map((item, k) => (
            <li key={k} className="text-[15px] leading-[1.6] text-[#141413] flex gap-2">
              <span className="text-[#c96442] flex-shrink-0 select-none">•</span>
              <span>{renderInline(item)}</span>
            </li>
          ))}
        </ul>
      )
      listBuf = []
    }

    for (const line of lines) {
      const heading = line.match(/^(#{1,3})\s+(.+)/)
      const bullet  = line.match(/^[\*\-]\s+(.+)/)
      const num     = line.match(/^\d+\.\s+(.+)/)

      if (heading) {
        flushPara(); flushList()
        const lvl = heading[1].length
        const cls = lvl === 1
          ? 'text-lg font-serif font-bold text-[#141413] mt-5 mb-2'
          : lvl === 2
          ? 'text-base font-serif font-semibold text-[#141413] mt-4 mb-1.5'
          : 'text-xs font-serif font-semibold text-[#5e5d59] uppercase tracking-wider mt-3 mb-1.5'
        result.push(<p key={key++} className={cls}>{renderInline(heading[2])}</p>)
      } else if (bullet || num) {
        flushPara()
        listBuf.push((bullet ?? num)![1])
      } else if (line.trim() === '') {
        flushPara(); flushList()
      } else {
        if (listBuf.length) flushList()
        paraBuf.push(line)
      }
    }

    flushPara(); flushList()
    return result
  })

  return (
    <div className="font-serif">
      {nodes}
      {streaming && <span className="inline-block w-1 h-4 bg-[#c96442] animate-pulse ml-0.5 translate-y-0.5" />}
    </div>
  )
}

// ── Input bar ───────────────────────────────────────────────────────────────

interface InputBarProps {
  value: string
  onChange: (v: string) => void
  onSubmit: () => void
  disabled: boolean
  isHighStakes: boolean
  onToggleHighStakes: () => void
}

function InputBar({ value, onChange, onSubmit, disabled, isHighStakes, onToggleHighStakes }: InputBarProps) {
  const ref = useRef<HTMLTextAreaElement>(null)

  // Auto-resize
  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [value])

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSubmit()
    }
  }

  return (
    <div className="flex-shrink-0 px-4 pb-4">
      <div className={`bg-[#faf9f5] border rounded-2xl px-4 py-3 flex flex-col gap-2 transition-all duration-200 ${
        disabled
          ? 'border-[#e8e6dc] opacity-60'
          : isHighStakes
          ? 'border-[#c96442] shadow-ring-card focus-within:ring-2 focus-within:ring-[#c96442]/30'
          : 'border-[#e8e6dc] shadow-ring-subtle focus-within:border-[#c96442] focus-within:ring-2 focus-within:ring-[#c96442]/20'
      }`}>
        <textarea
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Write a message…"
          rows={1}
          disabled={disabled}
          className="flex-1 bg-transparent font-serif text-[15px] text-[#141413] placeholder:text-[#87867f] resize-none focus:outline-none leading-[1.6] max-h-40 overflow-y-auto"
          style={{ minHeight: '1.5rem' }}
        />
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onToggleHighStakes}
            disabled={disabled}
            className={`flex items-center gap-1.5 text-xs font-serif font-medium rounded-lg px-2.5 py-1 border transition-all active:translate-y-[1px] ${
              isHighStakes
                ? 'text-[#c96442] border-[#c96442]/50 bg-[#c96442]/10 hover:bg-[#c96442]/15'
                : 'text-[#5e5d59] border-[#e8e6dc] bg-[#ffffff] hover:text-[#141413] hover:border-[#87867f]'
            }`}
          >
            <AlertTriangle size={11} className={isHighStakes ? 'text-[#c96442]' : 'text-[#87867f]'} />
            High stakes
          </button>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xs font-mono text-[#5e5d59] bg-[#ffffff] rounded-lg px-2 py-1 border border-[#e8e6dc] shadow-ring-subtle">
              Opus 4.7
            </span>
            <button
              onClick={onSubmit}
              disabled={disabled || !value.trim()}
              className="w-7 h-7 flex items-center justify-center rounded-full bg-[#c96442] hover:bg-[#b85938] hover:shadow-btn-lift active:translate-y-[1px] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <Send size={13} className="text-[#faf9f5]" />
            </button>
          </div>
        </div>
      </div>
      <p className="text-xs font-serif text-[#87867f] text-center mt-2">
        AI responses can contain mistakes — use the checklist to verify.
      </p>
    </div>
  )
}

// ── Main view ────────────────────────────────────────────────────────────────

interface ConversationViewProps {
  scenario: 'investment' | 'research'
}

export default function ConversationView({ scenario }: ConversationViewProps) {
  const { profile: userProfile } = useUserProfile()
  const { managerPath, isShared, conversationPhase, setConversationPhase, updateChecklistData, setHighStakes } =
    useEvaluation()

  // Live conversation state
  const [inputDraft,    setInputDraft]    = useState('')
  const [livePrompt,    setLivePrompt]    = useState<string | null>(null)
  const [liveResponse,  setLiveResponse]  = useState('')
  const [apiError,      setApiError]      = useState<string | null>(null)
  const [highStakesDraft, setHighStakesDraft] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const isLive    = conversationPhase !== 'demo'
  const isBusy    = conversationPhase === 'streaming' || conversationPhase === 'generating_checklist'

  // Scroll to bottom as response streams in
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [liveResponse])

  const handleSubmit = async () => {
    const prompt = inputDraft.trim()
    if (!prompt || isBusy) return

    const submittedHighStakes = highStakesDraft
    setInputDraft('')
    setApiError(null)
    setLivePrompt(prompt)
    setLiveResponse('')
    setHighStakes(submittedHighStakes)
    setConversationPhase('streaming')

    const baseProfile = userProfile ?? (scenario === 'investment' ? DEMO_INVESTMENT_PROFILE : DEMO_RESEARCH_PROFILE)
    const profile = inferPromptSignals(prompt, baseProfile)

    try {
      const fullResponse = await streamResponse(prompt, (delta) =>
        setLiveResponse((prev) => prev + delta)
      )

      if (submittedHighStakes) {
        setConversationPhase('generating_checklist')
        const { calibration, items } = await generateChecklist(prompt, fullResponse, profile)
        updateChecklistData(items, calibration)
      }
      setConversationPhase('ready')

    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      setApiError(msg)
      setConversationPhase('demo')
    }
  }

  const demoPrompt   = scenario === 'investment' ? INVESTMENT_PROMPT : RESEARCH_PROMPT
  const demoParagraphs = scenario === 'investment' ? INVESTMENT_RESPONSE_PARAGRAPHS : RESEARCH_RESPONSE_PARAGRAPHS
  const demoResponse = <ParagraphResponseContent paragraphs={demoParagraphs} />
  const headerTitle  = scenario === 'investment' ? 'NovaPay — Series B due diligence' : 'Sleep & cognitive performance'

  return (
    <div className="flex min-h-[100dvh] h-[100dvh] bg-[#f5f4ed] overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <ClaudeHeader title={livePrompt ? livePrompt.slice(0, 48) + (livePrompt.length > 48 ? '…' : '') : headerTitle}
          managerPath={isShared ? managerPath : undefined}
        />

        <div className="flex flex-1 overflow-hidden">
          {/* Chat column */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-2xl mx-auto px-6 py-8">

                {/* API error banner */}
                {apiError && (
                  <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/25 rounded-xl px-4 py-3 mb-6 text-xs font-serif text-red-700">
                    <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                    <pre className="whitespace-pre-wrap font-mono">{apiError}</pre>
                  </div>
                )}

                {/* Demo messages (shown until user submits a real prompt) */}
                {!isLive && (
                  <>
                    <ChatMessage role="user"      content={demoPrompt} />
                    <ChatMessage role="assistant" content={demoResponse} />
                  </>
                )}

                {/* Live messages */}
                {isLive && livePrompt && (
                  <>
                    <ChatMessage role="user" content={livePrompt} />
                    {(liveResponse || conversationPhase === 'streaming') && (
                      <ChatMessage
                        role="assistant"
                        content={
                          <LiveResponse
                            text={liveResponse}
                            streaming={conversationPhase === 'streaming'}
                          />
                        }
                      />
                    )}
                  </>
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>

            <InputBar
              value={inputDraft}
              onChange={setInputDraft}
              onSubmit={handleSubmit}
              disabled={isBusy}
              isHighStakes={highStakesDraft}
              onToggleHighStakes={() => setHighStakesDraft((v) => !v)}
            />
          </div>

          {/* Evaluation panel */}
          <EvaluationPanel />
        </div>
      </div>
    </div>
  )
}
