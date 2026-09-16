export const INVESTMENT_PROMPT =
  'Summarize the market opportunity and key risks for a potential Series B investment in NovaPay, an embedded payments startup targeting SMBs across Southeast Asia.'

export const INVESTMENT_RESPONSE_PARAGRAPHS: Array<{ heading?: string; text: string }> = [
  {
    heading: 'Company Overview',
    text: 'NovaPay (founded 2021) is an embedded payments platform that enables SMBs across Indonesia, Vietnam, and Singapore to accept and disburse payments through a single API integration. The company targets the retail, F&B, and logistics verticals, and claims 40% faster merchant onboarding relative to incumbent processors through pre-built POS integrations.',
  },
  {
    heading: 'Market Opportunity',
    text: 'The Southeast Asian SMB payments market is estimated at $45 billion in total addressable value, with a projected CAGR of 18% through 2028 according to Kearney\'s 2024 Asia-Pacific Digital Payments Report. Approximately 68 million SMBs in the region remain underserved by traditional banking infrastructure, creating a large greenfield for embedded finance solutions.',
  },
  {
    heading: 'Competitive Landscape',
    text: 'NovaPay\'s primary competitors are Xendit (Indonesia-focused, Series C), Airwallex (enterprise-tier, raised $300M in 2023), and an expanding field of bank-backed regional solutions. NovaPay\'s stated differentiation is vertical-specific integrations for retail and F&B, positioning it below Airwallex\'s enterprise ceiling and above Xendit\'s developer-first, API-only model.',
  },
  {
    heading: 'Financial Snapshot',
    text: 'The company reported $12M ARR as of Q3 2024, growing at approximately 40% year-over-year. Gross margins are estimated at 32%, below the SaaS median but consistent with payments infrastructure businesses at this stage. Current burn rate is $1.1M/month, implying roughly 18 months of runway at the pre-Series B cash position.',
  },
  {
    heading: 'Key Risks',
    text: 'Regulatory risk is material: Indonesia\'s OJK introduced new licensing requirements for third-party payment processors in 2023, and NovaPay\'s current operating structure may require restructuring to comply by the Q3 2025 deadline. Merchant churn in the Indonesia segment ran at 22% annualized in 2024, significantly above the 8–12% benchmark for comparable embedded payments platforms. Broader competitive pressure from well-capitalized incumbents and thin payment-processing margins may compress unit economics as the company scales.',
  },
]
