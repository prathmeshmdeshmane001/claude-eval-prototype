import type { ChecklistItemData } from './checklist'

export const LOAN_RISK_CHECKLIST_ITEMS: ChecklistItemData[] = [
  {
    id: '1',
    priority: 'p1',
    priorityCategory: 'truth',
    title: 'Are the criteria for "weak repayment" and charge-off aligned with GAAP/CECL and credit bureau definitions?',
    description: 'Verify whether the analysis distinguishes 30–89 DPD (early delinquency) from 120–180 DPD (formal charge-off). In consumer and commercial lending, treating rolling delinquency and unrecoverable charge-offs as the same target variable distorts loss forecasting and capital reserve requirements under CECL standards.',
  },
  {
    id: '2',
    priority: 'p1',
    priorityCategory: 'truth',
    title: 'Are repayment patterns adjusted for loan vintage seasoning and survival curves?',
    description: 'Check whether default rates account for loan age. Loans originated in the last 6–12 months naturally exhibit lower cumulative charge-offs because peak default hazard occurs between months 14–26. Recommending credit expansion on unseasoned recent vintages without Kaplan-Meier survival curves is a known origin of severe credit shock.',
  },
  {
    id: '3',
    priority: 'p2',
    priorityCategory: 'completeness',
    title: 'Does the model isolate root risk drivers from endogenous interest rate and loan grade effects?',
    description: 'Assess if high interest rates and low credit grades are treated as independent causal predictors of default. Because risk-based pricing intentionally assigns higher rates to weaker borrowers, higher APRs inherently correlate with weak repayment (endogenous reverse causality). Confirm that behavioral fundamentals (DTI, revolving utilization, credit inquiries) are isolated.',
  },
  {
    id: '4',
    priority: 'p2',
    priorityCategory: 'completeness',
    title: 'How does the recovery triage strategy distinguish self-curing borrowers from imminent charge-offs?',
    description: 'Examine the active loan recovery logic: between 25% and 40% of 30-DPD delinquent loans historically cure without outreach. Deploying aggressive early collections on self-curing borrowers wastes operational bandwidth and damages customer retention, while failing to trigger high-probability roll-to-loss accounts.',
  },
  {
    id: '5',
    priority: 'p1',
    priorityCategory: 'truth',
    title: 'Do proposed future underwriting changes comply with ECOA Fair Lending and Disparate Impact regulations?',
    description: 'Altering future lending decision criteria based on borrower characteristics requires testing for disparate impact under the Equal Credit Opportunity Act (ECOA) and CFPB guidance. Verify that variables such as geographic proxies, employment tenure, or thin-file alternative data pass the four-fifths (80%) adverse action ratio rule across protected classes.',
    hasRunCheckButton: true,
    runCheckResult: 'Fair lending disparate impact analysis complete: Adverse Action ratio across protected demographic proxies is 0.88 (exceeds the 0.80 CFPB four-fifths rule threshold); no proxy violation detected.',
  },
  {
    id: '6',
    priority: 'p3',
    priorityCategory: 'quality',
    title: 'Have the identified repayment patterns been stress-tested across interest rate and macroeconomic cycles?',
    description: 'Repayment characteristics identified during benign macroeconomic periods (low unemployment, stimulative liquidity) can reverse during rate hiking cycles. Check whether debt-service sensitivity and floating-rate debt exposure have been incorporated into the forward underwriting thresholds.',
  },
]

export const LOAN_RISK_RESPONSE_TEXT = `### Executive Summary: Credit Risk & Recovery Strategy

The objective is to identify loan and borrower characteristics predictive of weak repayment, translate these empirical patterns into tightened forward underwriting policies, and deploy an early-warning recovery triage model to arrest delinquency before accounts reach the 120–180 Days Past Due (DPD) statutory charge-off threshold.

### 1. Key Loan Characteristics Linked to Weak Repayment

Historical credit portfolio performance reveals four primary clusters strongly correlated with elevated default probability and weak repayment:

- **Debt-to-Income (DTI) & Revolving Utilization Concentration**: Borrowers with DTI exceeding **36%** combined with revolving credit utilization above **75%** exhibit a **3.4x higher roll-to-loss rate**. These borrowers possess zero liquidity buffer against minor income shocks.
- **Loan Term & Amount Disparity**: **60-month term loans** experience a **42% higher cumulative charge-off rate** compared to 36-month loans at equivalent credit scores, primarily driven by extended exposure to macroeconomic volatility and slower principal amortization.
- **Credit Inquiry Velocity**: More than **3 hard inquiries within the 6 months** preceding origination is the single strongest behavioral indicator of credit seeking distress, elevating first-year default probability by **64%**.
- **Unverified Income in High-Amount Bands**: Loans above $25,000 where income was unverified or self-reported show an annualized default rate of **19.8%**, compared to 9.2% for verified W-2/tax documentation cohorts.

### 2. Forward Underwriting Adjustments (Origination Policy)

To safeguard portfolio quality without severely contracting origination volume, future lending decisions should implement the following policy adjustments:

1. **Term Restrictions on Elevated DTI**: Disallow 60-month terms for any applicant with DTI > 34% or revolving utilization > 70%.
2. **Dynamic Risk-Based Pricing & Adverse Selection Guardrails**: Tighten APR floors on subordinate credit grades (Grades D through G) to ensure risk premiums compensate for higher expected loss rates under CECL standards.
3. **Automated Verification Triggers**: Mandate automated bank-aggregation verification (e.g. Plaid/fintech income feeds) for all loan requests exceeding $15,000 where DTI > 30%.
4. **Inquiry Velocity Caps**: Implement automated hard-stops on applicants with >3 inquiries in the past 90 days unless tied exclusively to auto or mortgage shopping windows.

### 3. Active Loan Recovery Prioritization (Pre-Charge-off Triage)

Rather than treating all delinquent accounts uniformly, recovery operations should be prioritized by **Net Recoverable Yield** ($ Balance Exposure × Probability of Roll-to-Loss):

- **Tier 1: 1–29 DPD (Early Warning & Self-Cure Filtering)**:
  - Estimate self-cure probability using borrower payment history and recent credit bureau score drops.
  - Apply lightweight digital nudges (SMS/Email) to preserve borrower goodwill; avoid expensive manual collector touches on high-cure probability profiles.
- **Tier 2: 30–59 DPD (Critical Intervention Window)**:
  - Prioritize accounts displaying simultaneous credit deterioration on external tradelines.
  - Offer structured short-term forbearance (1–3 month interest-only or payment deferral) to prevent roll-over into 60+ DPD.
- **Tier 3: 60–89 DPD (Intensive Workout & Mitigation)**:
  - Route accounts directly to senior loss-mitigation specialists for loan re-amortization or settlement workouts before the formal 120-day charge-off trigger.`
