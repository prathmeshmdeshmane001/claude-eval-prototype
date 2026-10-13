import { useState, useEffect } from 'react'
import { X, Key, Check, Zap, ExternalLink, Trash2 } from 'lucide-react'
import { getGroqApiKey, setGroqApiKey, clearGroqApiKey } from '../lib/apiKey'

interface ApiKeyModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function ApiKeyModal({ isOpen, onClose }: ApiKeyModalProps) {
  const [currentKey, setCurrentKey] = useState('')
  const [inputVal, setInputVal]     = useState('')
  const [saved, setSaved]           = useState(false)

  useEffect(() => {
    if (isOpen) {
      const k = getGroqApiKey()
      setCurrentKey(k)
      setInputVal(k)
      setSaved(false)
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setGroqApiKey(inputVal)
    setCurrentKey(inputVal.trim())
    setSaved(true)
    setTimeout(() => {
      onClose()
    }, 600)
  }

  const handleClear = () => {
    clearGroqApiKey()
    setCurrentKey('')
    setInputVal('')
    setSaved(true)
    setTimeout(() => {
      onClose()
    }, 600)
  }

  const isLive = !!currentKey

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#141413]/40 backdrop-blur-sm select-none"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-md bg-[#faf9f5] border border-[#e8e6dc] shadow-ring-elevated rounded-2xl p-6 relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#e8e6dc] mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#c96442]/10 border border-[#c96442]/20 flex items-center justify-center text-[#c96442]">
              <Key size={16} />
            </div>
            <div>
              <h2 className="text-base font-serif font-bold text-[#141413]">AI Engine Settings</h2>
              <p className="text-[11px] font-serif text-[#87867f]">Configure live Groq LLM or simulated mode</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-[#87867f] hover:text-[#141413] hover:bg-[#141413]/5 transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* Current status pill */}
        <div className={`flex items-center gap-2 px-3 py-2 rounded-xl mb-4 text-xs font-serif ${
          isLive
            ? 'bg-[#4a7c59]/10 border border-[#4a7c59]/25 text-[#4a7c59]'
            : 'bg-[#faf9f5] border border-[#e8e6dc] shadow-ring-subtle text-[#5e5d59]'
        }`}>
          {isLive ? (
            <>
              <span className="w-2 h-2 rounded-full bg-[#4a7c59] animate-pulse" />
              <span><strong>Live Mode Active</strong>: Powered by Groq (Llama 3.3 70B)</span>
            </>
          ) : (
            <>
              <Zap size={14} className="text-[#c96442]" />
              <span><strong>Simulated AI Active</strong>: Zero setup required; instant calibrated responses</span>
            </>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-serif font-semibold text-[#5e5d59] uppercase tracking-wider">
                Groq API Key (Optional)
              </label>
              <a
                href="https://console.groq.com/keys"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-[11px] font-serif text-[#c96442] hover:underline"
              >
                <span>Get free key</span>
                <ExternalLink size={10} />
              </a>
            </div>
            <input
              type="password"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="gsk_..."
              className="w-full bg-[#ffffff] border border-[#e8e6dc] rounded-xl px-3.5 py-2.5 text-xs font-mono text-[#141413] placeholder:text-[#87867f] focus:outline-none focus:ring-2 focus:ring-[#c96442]/30 focus:border-[#c96442] transition-all shadow-ring-subtle"
            />
            <p className="text-[11px] font-serif text-[#87867f] mt-1.5 leading-relaxed">
              Your key is saved locally in your browser. Leave blank to use built-in realistic simulation.
            </p>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-1.5 bg-[#c96442] hover:bg-[#b85938] hover:shadow-btn-lift active:translate-y-[1px] text-[#faf9f5] text-xs font-serif font-semibold rounded-lg px-3 py-2.5 transition-all"
            >
              {saved ? (
                <>
                  <Check size={14} />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save & Connect</span>
              )}
            </button>

            {isLive && (
              <button
                type="button"
                onClick={handleClear}
                className="flex items-center gap-1 text-xs font-serif text-[#5e5d59] hover:text-red-700 bg-[#ffffff] hover:bg-red-50 border border-[#e8e6dc] shadow-ring-subtle rounded-lg px-3 py-2.5 transition-all"
                title="Disconnect key and use Simulated Mode"
              >
                <Trash2 size={13} />
                <span>Reset to Demo</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
