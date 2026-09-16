import type { ChecklistItemData } from './checklist'

export const ORG_NAME = 'McKinsey'

export const ORG_CHECKLIST_ITEMS: ChecklistItemData[] = [
  {
    id: 'org-1',
    type: 'org',
    priority: 'p1',
    title: 'Has this analysis been reviewed for confidential or market-sensitive information?',
    description: `Confirm no non-public deal terms, client names, or proprietary financial figures appear in AI-generated outputs before sharing externally, per ${ORG_NAME} policy.`,
  },
  {
    id: 'org-2',
    type: 'org',
    priority: 'p1',
    title: 'Is this AI-assisted work logged per our AI-use policy?',
    description: `${ORG_NAME} requires human evaluation records for AI-generated content used in client deliverables, investment memos, or strategic recommendations.`,
  },
]

export const ORG_DEMO_STATES: Record<string, { checked: boolean; note: string }> = {
  'org-1': { checked: true, note: '' },
  'org-2': { checked: true, note: '' },
}
