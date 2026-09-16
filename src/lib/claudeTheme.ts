/** Color tokens, fonts, and spacing — Claude Warm Parchment design system */
export const theme = {
  colors: {
    // Primary surfaces
    pageBg:      '#f5f4ed', // Pergaminho (Canvas)
    sidebarBg:   '#eceae1', // Warm sidebar paper
    surface:     '#faf9f5', // Marfim (Ivory card surface)
    card:        '#ffffff', // Highlight card
    inputBg:     '#faf9f5', // Input background
    codeBg:      '#1a1918', // Warm charcoal for code
    userBubble:  '#eae8df', // User bubble paper tint

    // Typography
    textPrimary:   '#141413', // Quase Preto (Primary text)
    textSecondary: '#5e5d59', // Cinza Oliva (Secondary / muted text)
    textMuted:     '#87867f', // Cinza Pedra (Subtle captions)

    // Brand & CTAs
    accent:      '#c96442', // Terracotta
    accentHover: '#b85938', // Terracotta hover
    coral:       '#d97757', // Coral decorative

    // Status
    success:     '#4a7c59', // Botanical Green (Validation)
    successBg:   'rgba(74, 124, 89, 0.08)',

    // Borders
    border:      '#e8e6dc', // Borda Creme
    borderSubtle:'#f0eee6', // Subtle border
  },
  shadows: {
    ringSubtle:   '0 0 0 1px #e8e6dc, 0 2px 12px rgba(20, 20, 19, 0.04)',
    ringCard:     '0 0 0 1px #e8e6dc, 0 4px 16px rgba(20, 20, 19, 0.05)',
    ringElevated: '0 0 0 1px #e8e6dc, 0 8px 24px rgba(20, 20, 19, 0.08)',
    btnLift:      '0 2px 8px rgba(201, 100, 66, 0.25)',
  },
  fonts: {
    serif: "Georgia, 'Times New Roman', serif",
    sans:  "Georgia, system-ui, -apple-system, sans-serif",
    mono:  "'JetBrains Mono', Menlo, Monaco, Consolas, monospace",
  },
} as const
