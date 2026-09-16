export interface ChecklistItemData {
  id: string
  /** 'org' = company-wide required check; 'ai-suggested' (default) = task-calibrated AI check */
  type?: 'org' | 'ai-suggested'
  /**
   * p1 = factual correctness of specific claims — gates the share button
   * p2 = completeness, context quality, important assumptions
   * p3 = nuance, counterarguments, good practice (never blocks)
   * Defaults to p2 when unset.
   */
  priority?: 'p1' | 'p2' | 'p3'
  title: string
  /**
   * Specific verification steps drawn from the actual response.
   * Names concrete values, edge cases, or regression scenarios — not generic guidance.
   */
  description: string
  hasRunCheckButton?: boolean
  /** Text shown in the UI after the user clicks "Run check" */
  runCheckResult?: string
}

export const CHECKLIST_ITEMS: ChecklistItemData[] = [
  {
    id: '1',
    priority: 'p1',
    title: 'Are the market size figures traceable to the named research reports?',
    description: 'The $45B TAM and 18% CAGR figures reference Kearney\'s 2024 Asia-Pacific Digital Payments Report. Verify the report exists with that title, and confirm NovaPay\'s specific segment is actually the figure cited — market reports frequently slice addressable market differently than a company\'s actual TAM.',
  },
  {
    id: '2',
    priority: 'p1',
    title: 'Does the competitive landscape reflect the current state of the market?',
    description: 'Check Crunchbase or TechCrunch for Xendit\'s and Airwallex\'s most recent funding rounds and product announcements in 2025. A competitor described as "Series C" may have since IPO\'d, pivoted, or expanded into NovaPay\'s verticals. The "40% faster onboarding" claim also has no cited source.',
  },
  {
    id: '3',
    priority: 'p2',
    title: 'Are the stated risks specific to NovaPay, or generic fintech boilerplate?',
    description: 'For each risk listed, ask: is there a specific metric, event, or decision point that would make this risk materialize for NovaPay in particular? The 22% merchant churn figure is a concrete, verifiable risk signal — flag which other risks are similarly grounded vs. applicable to any payments startup in the region.',
  },
  {
    id: '4',
    priority: 'p2',
    title: 'What assumptions underlie the 40% ARR growth projection?',
    description: 'Identify the customer acquisition cost, churn rate, and expansion revenue assumptions that produce that 40% figure. An 18% market CAGR does not automatically translate to 40% ARR growth — the gap between these numbers is NovaPay\'s claimed market share capture, which should have a basis beyond the market size estimate.',
  },
  {
    id: '5',
    priority: 'p1',
    title: 'Do the regulatory claims accurately reflect current OJK and MAS requirements?',
    description: 'The memo flags OJK licensing for Indonesia but does not address MAS PSA licensing for Singapore or the State Bank of Vietnam\'s e-payment regulations. Verify NovaPay\'s current license status in each market and the specific compliance gap against each jurisdiction\'s 2024–2025 requirements before proceeding to IC.',
    hasRunCheckButton: true,
    runCheckResult: 'Cross-referenced against OJK Regulation POJK 18/2023 — third-party processor licensing requirements confirmed; grace period for existing operators ends Q3 2025.',
  },
  {
    id: '6',
    priority: 'p3',
    title: 'What material counterarguments or red flags does this analysis omit?',
    description: 'The $1.1M/month burn rate implies ~18 months of runway — consider whether that is sufficient to reach the next milestone before Series C is needed. The analysis also does not address: who holds the existing cap table, what NovaPay\'s actual technical moat is given that embedded payments APIs are increasingly commoditized, or why an SMB would not switch to a bank-backed solution.',
  },
]

export const ITEM_3_SEED_NOTE =
  'Three of the five risk factors are generic fintech risks applicable to any payments startup in the region. Only "merchant churn at 22%" and the OJK licensing gap are NovaPay-specific. The analysis does not mention NovaPay\'s competitive moat or why SMBs would not switch to a bank-backed solution.'
