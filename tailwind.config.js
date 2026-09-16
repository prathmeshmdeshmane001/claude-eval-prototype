/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Claude Warm Parchment tokens
        'parchment-bg':      '#f5f4ed', // Pergaminho (Primary Canvas)
        'parchment-surface': '#faf9f5', // Marfim (Ivory Surface / Cards)
        'parchment-card':    '#ffffff', // Card Highlight
        'parchment-input':   '#faf9f5', // Input field
        'parchment-bubble':  '#eae8df', // User message bubble
        'parchment-text':    '#141413', // Quase Preto (Primary typography)
        'parchment-text2':   '#5e5d59', // Cinza Oliva (Secondary / muted text)
        'parchment-text3':   '#87867f', // Cinza Pedra (Subtle captions / metadata)
        'parchment-accent':  '#c96442', // Terracotta (Primary CTA & Brand)
        'parchment-accent-h':'#b85938', // Terracotta hover
        'parchment-coral':   '#d97757', // Coral (Decorative accent)
        'parchment-border':  '#e8e6dc', // Borda Creme (Paper border stroke)
        'parchment-border-s':'#f0eee6', // Subtle paper border
        'parchment-success': '#4a7c59', // Botanical Green (Validation)
        'parchment-success-bg':'rgba(74, 124, 89, 0.08)',
        'parchment-code':    '#1a1918', // Warm charcoal for code

        // Legacy compatibility aliases mapped to warm parchment
        'claude-bg':      '#f5f4ed',
        'claude-sidebar': '#eceae1',
        'claude-surface': '#faf9f5',
        'claude-input':   '#faf9f5',
        'claude-code':    '#1a1918',
        'claude-bubble':  '#eae8df',
        'claude-text':    '#141413',
        'claude-text2':   '#5e5d59',
        'claude-text3':   '#87867f',
        'claude-accent':  '#c96442',
        'claude-border':  '#e8e6dc',
        'claude-success': '#4a7c59',
      },
      fontFamily: {
        serif: ['Georgia', '"Times New Roman"', 'serif'],
        sans:  ['Georgia', 'system-ui', '-apple-system', 'sans-serif'],
        mono:  ['"JetBrains Mono"', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'ring-subtle': '0 0 0 1px #e8e6dc, 0 2px 12px rgba(20, 20, 19, 0.04)',
        'ring-card':   '0 0 0 1px #e8e6dc, 0 4px 16px rgba(20, 20, 19, 0.05)',
        'ring-elevated':'0 0 0 1px #e8e6dc, 0 8px 24px rgba(20, 20, 19, 0.08)',
        'btn-lift':    '0 2px 8px rgba(201, 100, 66, 0.25)',
      },
    },
  },
  plugins: [],
}
