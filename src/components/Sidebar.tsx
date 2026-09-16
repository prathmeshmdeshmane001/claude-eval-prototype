import { useState } from 'react'
import {
  Plus, Search, MessageSquare, Briefcase, LayoutGrid,
  BookMarked, Code2, Palette, Download, PanelLeftClose, PanelLeftOpen,
} from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

/** Terracotta Anthropic starburst asterisk — reused by ChatMessage */
export function AnthropicAsterisk({ size = 20, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <line x1="12" y1="2.5" x2="12" y2="21.5" stroke="#c96442" strokeWidth="2.4" strokeLinecap="round" />
      <line x1="2.5" y1="12" x2="21.5" y2="12" stroke="#c96442" strokeWidth="2.4" strokeLinecap="round" />
      <line x1="5.05" y1="5.05" x2="18.95" y2="18.95" stroke="#c96442" strokeWidth="2.4" strokeLinecap="round" />
      <line x1="18.95" y1="5.05" x2="5.05" y2="18.95" stroke="#c96442" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  )
}

const NAV_ICONS = [
  { icon: Plus,           label: 'New chat' },
  { icon: Search,         label: 'Search' },
  { icon: MessageSquare,  label: 'Chats',   active: true },
  { icon: Briefcase,      label: 'Projects' },
  { icon: LayoutGrid,     label: 'Apps' },
  { icon: BookMarked,     label: 'Starred' },
  { icon: Code2,          label: 'Code' },
  { icon: Palette,        label: 'Creative' },
]

const CONVERSATIONS = [
  {
    title: 'Python: top users by spend',
    badge: 'Code',
    path: '/',
    matchPaths: ['/', '/manager-view'],
  },
  {
    title: 'Sleep & cognitive performance',
    badge: 'Research',
    path: '/research',
    matchPaths: ['/research', '/research-manager'],
  },
]

export default function Sidebar() {
  const location = useLocation()
  const [expanded, setExpanded] = useState(false)

  const isConvoActive = (paths: string[]) =>
    paths.some((p) => location.pathname === p)

  return (
    <aside
      className={`
        flex-shrink-0 flex flex-col bg-[#eceae1] border-r border-[#e8e6dc]
        transition-all duration-200 overflow-hidden select-none
        ${expanded ? 'w-56' : 'w-12'}
      `}
    >
      {/* Expand / collapse toggle */}
      <div className={`flex items-center py-3 px-2 ${expanded ? 'justify-between' : 'justify-center'}`}>
        {expanded && (
          <div className="flex items-center gap-1.5 ml-1">
            <AnthropicAsterisk size={16} />
            <span className="text-sm font-serif font-semibold text-[#141413]">Claude</span>
          </div>
        )}
        <button
          onClick={() => setExpanded((v) => !v)}
          title={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-[#5e5d59] hover:text-[#141413] hover:bg-[#141413]/5 transition-colors flex-shrink-0"
        >
          {expanded ? <PanelLeftClose size={15} /> : <PanelLeftOpen size={15} />}
        </button>
      </div>

      {/* Nav icons */}
      <div className="flex flex-col gap-0.5 px-2 flex-1">
        {NAV_ICONS.map(({ icon: Icon, label, active }) => (
          <button
            key={label}
            title={!expanded ? label : undefined}
            className={`
              h-8 flex items-center gap-2.5 rounded-lg px-2 transition-all whitespace-nowrap
              ${active || (label === 'Chats' && (location.pathname === '/' || location.pathname === '/research'))
                ? 'text-[#141413] bg-[#faf9f5] shadow-ring-subtle font-medium'
                : 'text-[#5e5d59] hover:text-[#141413] hover:bg-[#141413]/5'}
            `}
          >
            <Icon size={15} className={`flex-shrink-0 ${(active || (label === 'Chats' && (location.pathname === '/' || location.pathname === '/research'))) ? 'text-[#c96442]' : ''}`} />
            {expanded && <span className="text-xs font-serif">{label}</span>}
          </button>
        ))}

        {/* Conversation list — only visible when expanded */}
        {expanded && (
          <div className="mt-3 pt-3 border-t border-[#e8e6dc]">
            <p className="text-[10px] font-serif text-[#87867f] uppercase tracking-wider px-2 mb-1.5 font-medium">
              Recents
            </p>
            <div className="flex flex-col gap-0.5">
              {CONVERSATIONS.map((conv) => {
                const active = isConvoActive(conv.matchPaths)
                return (
                  <Link
                    key={conv.path}
                    to={conv.path}
                    className={`
                      group flex items-start gap-2 rounded-lg px-2 py-2 transition-all
                      ${active ? 'bg-[#faf9f5] shadow-ring-subtle text-[#141413]' : 'text-[#5e5d59] hover:bg-[#141413]/5 hover:text-[#141413]'}
                    `}
                  >
                    <AnthropicAsterisk size={12} className="mt-0.5 flex-shrink-0 opacity-70" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-serif leading-snug truncate">{conv.title}</p>
                      <span className={`text-[10px] font-serif mt-0.5 ${active ? 'text-[#c96442] font-semibold' : 'text-[#87867f]'}`}>
                        {conv.badge}
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Bottom: update + user avatar */}
      <div className={`flex items-center pb-3 px-2 ${expanded ? 'gap-2' : 'flex-col gap-2'}`}>
        <button
          title="Updates"
          className="w-8 h-8 flex items-center justify-center rounded-lg text-[#5e5d59] hover:text-[#141413] hover:bg-[#141413]/5 transition-colors relative flex-shrink-0"
        >
          <Download size={14} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#c96442]" />
        </button>

        <div className="w-7 h-7 rounded-full bg-[#faf9f5] border border-[#e8e6dc] shadow-ring-subtle flex items-center justify-center text-xs font-serif font-bold text-[#5e5d59] select-none flex-shrink-0">
          M
        </div>

        {expanded && (
          <span className="text-xs font-serif text-[#5e5d59] truncate font-medium">Manya</span>
        )}
      </div>
    </aside>
  )
}
