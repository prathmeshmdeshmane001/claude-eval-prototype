import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter'
// @ts-ignore — hljs python import
import python from 'react-syntax-highlighter/dist/esm/languages/hljs/python'
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs'

SyntaxHighlighter.registerLanguage('python', python)

// Warm charcoal styling for code editor blocks within warm parchment
const codeStyle = {
  ...atomOneDark,
  'hljs': {
    ...atomOneDark['hljs'],
    background: '#1a1918',
    color: '#eae8df',
  },
}

interface CodeBlockProps {
  code: string
  language?: string
}

export default function CodeBlock({ code, language = 'python' }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  return (
    <div className="rounded-xl overflow-hidden border border-[#2e2c29] shadow-ring-card mt-4 bg-[#1a1918]">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#141413] border-b border-[#2e2c29]">
        <span className="text-xs text-[#87867f] font-mono uppercase tracking-wider">{language}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-[#87867f] hover:text-[#faf9f5] transition-colors"
        >
          {copied ? (
            <>
              <Check size={12} className="text-[#4a7c59]" />
              <span className="text-[#4a7c59] font-medium">Copied</span>
            </>
          ) : (
            <>
              <Copy size={12} />
              <span>Copy code</span>
            </>
          )}
        </button>
      </div>

      {/* Code */}
      <SyntaxHighlighter
        language={language}
        style={codeStyle}
        customStyle={{
          margin: 0,
          padding: '1rem 1.25rem',
          fontSize: '0.8125rem',
          lineHeight: '1.6',
          background: '#1a1918',
          fontFamily: "'JetBrains Mono', Menlo, Monaco, Consolas, monospace",
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  )
}
