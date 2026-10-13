import { CHECKLIST_ITEMS, ChecklistItemData } from '../data/checklist'
import { RESEARCH_CHECKLIST_ITEMS } from '../data/researchChecklist'
import { INVESTMENT_RESPONSE_PARAGRAPHS } from '../data/conversation'
import { RESEARCH_RESPONSE_PARAGRAPHS } from '../data/researchConversation'
import type { CalibrationProfile } from './calibrationProfile'
import type { GeneratedChecklist } from './api'

/** Format paragraph objects into Markdown */
function paragraphsToMarkdown(paragraphs: Array<{ heading?: string | null; text: string }>): string {
  return paragraphs
    .map((p) => {
      if (p.heading) {
        return `### ${p.heading}\n\n${p.text}`
      }
      return p.text
    })
    .join('\n\n')
}

/**
 * Returns a high-fidelity simulated response for prompts when live LLM API is not configured.
 */
export function getSimulatedResponse(prompt: string): string {
  const p = prompt.toLowerCase()

  // 1. NovaPay / Fintech due diligence
  if (p.includes('novapay') || (p.includes('series b') && p.includes('payment')) || (p.includes('embedded') && p.includes('smb'))) {
    return paragraphsToMarkdown(INVESTMENT_RESPONSE_PARAGRAPHS)
  }

  // 2. Sleep / Cognitive performance research
  if (p.includes('sleep') || p.includes('cognitive') || p.includes('deprivation') || p.includes('memory')) {
    return paragraphsToMarkdown(RESEARCH_RESPONSE_PARAGRAPHS)
  }

  // 3. Code / Python tasks
  if (p.includes('python') || p.includes('code') || p.includes('script') || p.includes('function') || p.includes('algorithm') || p.includes('dataframe')) {
    return [
      '### Solution Architecture',
      '',
      'To address this requirement cleanly, we can structure the implementation using Python with type annotations and robust error handling. The solution focuses on readability, vectorization where applicable, and clear boundary checks.',
      '',
      '```python',
      'import pandas as pd',
      'from typing import Dict, List, Optional',
      '',
      'def analyze_user_metrics(',
      '    df: pd.DataFrame,',
      '    top_n: int = 10,',
      '    min_transactions: int = 5',
      ') -> pd.DataFrame:',
      '    """',
      '    Computes top users ranked by spend while filtering for minimum activity.',
      '    ',
      '    Parameters:',
      '        df: Input DataFrame containing user_id, amount, and transaction_date',
      '        top_n: Number of leading users to return',
      '        min_transactions: Minimum transactions threshold',
      '    """',
      '    # 1. Clean and aggregate user metrics',
      '    aggregated = (',
      '        df.groupby(\'user_id\')',
      '        .agg(',
      '            total_spend=(\'amount\', \'sum\'),',
      '            txn_count=(\'amount\', \'count\'),',
      '            avg_order_value=(\'amount\', \'mean\')',
      '        )',
      '        .reset_index()',
      '    )',
      '',
      '    # 2. Apply activity gating',
      '    qualified = aggregated[aggregated[\'txn_count\'] >= min_transactions]',
      '',
      '    # 3. Rank by aggregate expenditure',
      '    ranked = qualified.sort_values(by=\'total_spend\', ascending=False).head(top_n)',
      '',
      '    # 4. Format presentation columns',
      '    ranked[\'total_spend\'] = ranked[\'total_spend\'].round(2)',
      '    ranked[\'avg_order_value\'] = ranked[\'avg_order_value\'].round(2)',
      '    ',
      '    return ranked',
      '```',
      '',
      '### Key Considerations',
      '',
      '- **Aggregation Efficiency**: Uses single-pass `.groupby().agg()` to avoid redundant DataFrame scans.',
      '- **Outlier Handling**: Incorporates average order value to identify skewed single-transaction spikes vs. sustainable repeat volume.',
      '- **Edge Cases**: Empty DataFrames or users falling below `min_transactions` are filtered gracefully without raising zero-division errors.',
    ].join('\n')
  }

  // 4. Financial / Strategy / Market analysis
  if (p.includes('market') || p.includes('valuation') || p.includes('strategy') || p.includes('revenue') || p.includes('growth') || p.includes('saas') || p.includes('investment')) {
    return [
      '### Executive Overview',
      '',
      'An evaluation of the strategic landscape reveals a substantial addressable market characterized by strong structural tailwinds, alongside key execution vulnerabilities that require rigorous diligence.',
      '',
      '### Market Dynamics & Opportunity',
      '',
      '- **Addressable Demand**: The total addressable opportunity across core regional segments is estimated at **$18.5 billion**, demonstrating an annual expansion rate of **16.4%** through 2028.',
      '- **Adoption Drivers**: Accelerating digitization, localized regulatory shifts, and high legacy switching friction are opening favorable customer acquisition windows.',
      '- **Differentiation Vector**: Winning entrants focus on proprietary API integrations and automated compliance workflows rather than commoditized pricing competition.',
      '',
      '### Operating Metrics & Unit Economics',
      '',
      '1. **Customer Acquisition Cost (CAC)**: Payback periods currently average 9 to 12 months in top tiers.',
      '2. **Gross Margin Realization**: Blended gross margin runs between 42% and 58%, varying by payments mix and direct software attach rate.',
      '3. **Net Revenue Retention (NRR)**: Benchmark platforms sustain 114–128% NRR through product cross-selling.',
      '',
      '### Strategic Risks & Sensitivity',
      '',
      '- **Regulatory Scrutiny**: Tightening cross-border licensing mandates impose capital reserve compliance deadlines within the next 18 months.',
      '- **Concentration Risk**: The top decile of enterprise merchants accounts for over 45% of total processed gross volume, presenting downside risk in the event of platform churn.',
    ].join('\n')
  }

  // 5. Default high-quality structured response
  return [
    '### Comprehensive Analysis',
    '',
    'Based on your inquiry, here is a detailed breakdown evaluating the core objectives, structural requirements, and practical implementation path.',
    '',
    '### Key Findings & Structural Breakdown',
    '',
    '- **Primary Objective**: Clarifying the core drivers, operational constraints, and measurable deliverables necessary for reliable execution.',
    '- **Methodological Standard**: Prioritizing verified reference data, reproducibility across environments, and clear governance boundaries.',
    '- **Comparative Baseline**: Aligning outcomes against established industry benchmarks to ensure defensibility during senior stakeholder reviews.',
    '',
    '### Recommended Action Plan',
    '',
    '1. **Phase 1: Verification & Audit**: Reconcile core claims against primary source documentation and empirical data sets.',
    '2. **Phase 2: Edge-Case Evaluation**: Stress-test assumptions under volatile baseline conditions and boundary constraints.',
    '3. **Phase 3: Operational Governance**: Implement recurring audit controls to ensure ongoing compliance and cross-team transparency.',
  ].join('\n')
}

/**
 * Simulates token-by-token streaming with natural timing.
 */
export async function simulateStream(
  fullText: string,
  onChunk: (delta: string) => void
): Promise<string> {
  const tokens = fullText.match(/(\S+\s*|\n+)/g) || [fullText]

  let accumulated = ''
  for (const token of tokens) {
    accumulated += token
    onChunk(token)
    await new Promise((resolve) => setTimeout(resolve, Math.floor(Math.random() * 14) + 10))
  }

  return accumulated
}

/**
 * Returns a calibrated 6-item evaluation checklist strictly following:
 *   P1: Critical (Truth — could fail externally)
 *   P2: Important (Completeness — could mislead)
 *   P3: Best Practice (Quality — could be sharper)
 */
export function getSimulatedChecklist(
  prompt: string,
  _response: string,
  profile?: CalibrationProfile
): GeneratedChecklist {
  const p = prompt.toLowerCase()

  // NovaPay match
  if (p.includes('novapay') || (p.includes('series b') && p.includes('payment'))) {
    return {
      calibration: profile?.label ?? 'Business Analyst — Investment Research',
      items: CHECKLIST_ITEMS,
    }
  }

  // Sleep / research match
  if (p.includes('sleep') || p.includes('cognitive')) {
    return {
      calibration: profile?.label ?? 'Researcher / Analyst',
      items: RESEARCH_CHECKLIST_ITEMS,
    }
  }

  // Code match
  if (p.includes('python') || p.includes('code') || p.includes('script')) {
    const items: ChecklistItemData[] = [
      {
        id: '1',
        priority: 'p1',
        priorityCategory: 'truth',
        title: 'Does the implementation handle empty DataFrames or missing key fields?',
        description: 'Verify boundary behavior when passing zero rows or DataFrames missing the required identifiers. Confirm that no unhandled KeyError or ZeroDivisionError is raised.',
      },
      {
        id: '2',
        priority: 'p1',
        priorityCategory: 'truth',
        title: 'Are memory allocations and vectorization optimized for production scale?',
        description: 'Check whether intermediate grouped objects copy data unnecessarily. For large datasets, verify that memory consumption scales linearly with row count rather than quadratic grouping overhead.',
      },
      {
        id: '3',
        priority: 'p2',
        priorityCategory: 'completeness',
        title: 'Are the sorting and ranking ties broken deterministically?',
        description: 'When multiple rows share identical aggregate values, verify if an explicit secondary sort key is specified to guarantee stable, deterministic ordering across runs.',
      },
      {
        id: '4',
        priority: 'p2',
        priorityCategory: 'completeness',
        title: 'Are parameter type annotations and return schemas explicitly validated?',
        description: 'Confirm that function arguments enforce expected types and that numeric outputs maintain consistent floating-point rounding for downstream serialization.',
      },
      {
        id: '5',
        priority: 'p1',
        priorityCategory: 'truth',
        title: 'Run automated type check and lint verification against PEP 8 rules',
        description: 'Cross-reference type hints and formatting against static typecheck and linting tools to guarantee runtime compatibility.',
        hasRunCheckButton: true,
        runCheckResult: 'Static type analysis complete: 0 type errors detected; all parameter boundaries and return schemas validated.',
      },
      {
        id: '6',
        priority: 'p3',
        priorityCategory: 'quality',
        title: 'What logging or observability considerations are missing for production?',
        description: 'Assess whether production execution requires execution time telemetry, structured log events, or alerts for dropped filtered records.',
      },
    ]

    return {
      calibration: profile?.label ?? 'Data / Software Analyst',
      items,
    }
  }

  // General calibrated checklist
  const items: ChecklistItemData[] = [
    {
      id: '1',
      priority: 'p1',
      priorityCategory: 'truth',
      title: 'Are the specific figures, metrics, and claims traceable to primary sources?',
      description: 'Review the quantitative claims in the response and verify whether each is grounded in verified documentation or empirical telemetry rather than estimated approximations.',
    },
    {
      id: '2',
      priority: 'p1',
      priorityCategory: 'truth',
      title: 'Are critical baseline assumptions clearly stated and defensible?',
      description: 'Identify the underlying conditions required for the response recommendations to remain valid. Flag any implicit dependencies that could fail under changed operating environments.',
    },
    {
      id: '3',
      priority: 'p2',
      priorityCategory: 'completeness',
      title: 'Does the response address the primary edge cases and failure modes?',
      description: 'Check whether low-probability, high-impact failure scenarios have been considered, or if the analysis assumes ideal steady-state conditions throughout.',
    },
    {
      id: '4',
      priority: 'p2',
      priorityCategory: 'completeness',
      title: 'Is the depth and technical terminology calibrated to the intended audience?',
      description: 'Ensure that explanations neither oversimplify crucial domain mechanics nor introduce unnecessary jargon that obscures operational clarity.',
    },
    {
      id: '5',
      priority: 'p1',
      priorityCategory: 'truth',
      title: 'Cross-reference core compliance and benchmark claims against industry standard',
      description: 'Verify specific regulatory and benchmark thresholds cited in the text against authoritative published guidelines.',
      hasRunCheckButton: true,
      runCheckResult: 'Benchmark verification complete: cited metrics align with published industry standards; no factual discrepancies flagged.',
    },
    {
      id: '6',
      priority: 'p3',
      priorityCategory: 'quality',
      title: 'What counterarguments or alternative interpretations were omitted?',
      description: 'Evaluate whether credible alternative methodologies or contrasting perspectives exist that would alter the recommended course of action.',
    },
  ]

  return {
    calibration: profile?.label ?? 'Strategic Analyst',
    items,
  }
}
