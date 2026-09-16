import type { ChecklistItemData } from './checklist'

export const RESEARCH_CHECKLIST_ITEMS: ChecklistItemData[] = [
  {
    id: '1',
    priority: 'p1',
    title: 'Can you trace each specific statistic to a primary source?',
    description: 'The response likely cites figures like "20–25% reduction in decision quality" and "17–19 hours of wakefulness equivalent to 0.05% BAC." For each number: search for it directly before including it in any document. Statistics that can\'t be traced to a named study should be treated as unverified.',
  },
  {
    id: '2',
    priority: 'p1',
    title: 'If Claude names a study or author, does it exist and say what Claude claims?',
    description: 'Search the exact author name + keyword in Google Scholar or PubMed. LLMs frequently hallucinate plausible-sounding citations — the journal name, year, and finding may each be wrong independently. A study existing doesn\'t mean it says what the summary claims.',
  },
  {
    id: '3',
    priority: 'p2',
    title: 'How many times does the text say "studies show" without naming a study?',
    description: 'Count each instance of "research suggests", "studies show", "evidence indicates" without an attached citation. Each is an unverifiable claim that could be cherry-picked, outdated, or fabricated. Flag them in the document before sharing — a reader may treat them as established fact.',
  },
  {
    id: '4',
    priority: 'p2',
    title: 'Is there any signal about when this research was published?',
    description: 'Sleep science has had significant updates since 2015 — chronic restriction models, individual variability findings, and replication results. If the response doesn\'t indicate publication years, assume the findings could be 10+ years old. Check whether any referenced consensus positions have been revised.',
  },
  {
    id: '5',
    priority: 'p1',
    title: 'Do the core claims hold up against a systematic review or meta-analysis?',
    description: 'The "two weeks of 6h sleep ≈ 48h total deprivation" equivalence and cognitive impairment thresholds are specific enough to verify. Search PubMed: "sleep restriction cognitive performance meta-analysis". A single study supporting a claim is weaker than a systematic review — note which you found.',
    hasRunCheckButton: true,
    runCheckResult: 'Validated against PubMed search: "sleep deprivation cognitive performance meta-analysis" — Van Dongen et al. (2003) confirmed as primary source for cumulative deficit model.',
  },
  {
    id: '6',
    priority: 'p3',
    title: 'What important nuances or counterarguments does this summary leave out?',
    description: 'Consider: chronotype differences (night owls vs. morning types respond differently), task-type dependency (creative vs. procedural tasks are affected differently), recovery sleep effects, and individual variability. A summary that ignores these presents a more uniform picture than the literature supports.',
  },
]

export const RESEARCH_ITEM_3_SEED_NOTE =
  'Found 3 instances of "studies show" / "research suggests" without citations. The "20–25% decision quality drop" figure is very specific — needs a source. The "two weeks ≈ 48 hours total" equivalence appears to reference Van Dongen et al. (2003), but this should be cited explicitly.'

export const RESEARCH_MANAGER_COMMENT = {
  author: 'Priya',
  role: 'Engagement Manager',
  initials: 'P',
  timestamp: 'Today at 3:12 PM',
  text: "Good catch on the attribution gaps. For item 5 — the Van Dongen et al. (2003) paper in Sleep is likely the source for both the '17-19 hours' threshold and the 'two weeks ≈ 48 hours' equivalence. Worth searching PubMed directly: try \"Van Dongen sleep restriction cognitive performance\".",
}
