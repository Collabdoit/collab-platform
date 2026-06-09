// ─── Token Pricing Engine ─────────────────────────────────
// Handles cost calculation, budget enforcement, and token packages

// Anthropic API costs (USD per 1K tokens)
const COST_PER_1K_INPUT = 0.003;
const COST_PER_1K_OUTPUT = 0.015;

// Business margin
const MARKUP = 0.30; // 30% markup on actual costs
const MAX_OVERAGE = 0.10; // Server allows 10% overage max

// Currency
const USD_TO_SAR = 3.75;

// ─── Token Packages ───────────────────────────────────────

export interface TokenPackage {
  id: string;
  nameAr: string;
  nameEn: string;
  tokens: number;
  priceSAR: number;
  tier: string;
  popular?: boolean;
  features: string[];
}

export const TOKEN_PACKAGES: TokenPackage[] = [
  {
    id: 'trial',
    nameAr: 'تجربة',
    nameEn: 'Trial',
    tokens: 10_000,
    priceSAR: 0,
    tier: 'FREE',
    features: ['10,000 رمز مجاني', 'جميع الموظفين متاحين للمقابلة', 'مهام محدودة'],
  },
  {
    id: 'basic',
    nameAr: 'أساسي',
    nameEn: 'Basic',
    tokens: 100_000,
    priceSAR: 49,
    tier: 'STARTER',
    features: ['100,000 رمز', 'موظفين المستوى المبتدئ', '~25 مهمة شهرياً'],
  },
  {
    id: 'growth',
    nameAr: 'متقدم',
    nameEn: 'Growth',
    tokens: 500_000,
    priceSAR: 199,
    tier: 'GROWTH',
    popular: true,
    features: ['500,000 رمز', 'جميع المستويات', '~125 مهمة شهرياً', 'أولوية في التنفيذ'],
  },
  {
    id: 'pro',
    nameAr: 'احترافي',
    nameEn: 'Pro',
    tokens: 2_000_000,
    priceSAR: 649,
    tier: 'ENTERPRISE',
    features: ['2,000,000 رمز', 'جميع المستويات', '~500 مهمة شهرياً', 'أولوية قصوى', 'دعم مخصص'],
  },
];

// ─── Cost Calculation ─────────────────────────────────────

export function calculateTokenCost(inputTokens: number, outputTokens: number): {
  actualCostUSD: number;
  markedUpCostUSD: number;
  costSAR: number;
  totalTokens: number;
} {
  const inputCost = (inputTokens / 1000) * COST_PER_1K_INPUT;
  const outputCost = (outputTokens / 1000) * COST_PER_1K_OUTPUT;
  const actualCostUSD = inputCost + outputCost;
  const markedUpCostUSD = actualCostUSD * (1 + MARKUP);
  const costSAR = markedUpCostUSD * USD_TO_SAR;

  return {
    actualCostUSD,
    markedUpCostUSD,
    costSAR,
    totalTokens: inputTokens + outputTokens,
  };
}

// ─── Budget Enforcement ───────────────────────────────────

export interface BudgetCheck {
  tokensBudget: number;
  tokensUsed: number;
  tokensRemaining: number;
  maxAllowed: number; // budget + overage
  overageUsed: number; // percentage of overage consumed
  canExecute: boolean;
  usagePercent: number;
  warningLevel: 'normal' | 'warning' | 'critical' | 'blocked';
}

export function checkTokenBudget(
  tokensBudget: number,
  tokensUsed: number,
  estimatedTokens: number = 4000, // average task token usage
  maxOverage: number = MAX_OVERAGE
): BudgetCheck {
  const maxAllowed = Math.floor(tokensBudget * (1 + maxOverage));
  const tokensRemaining = maxAllowed - tokensUsed;
  const canExecute = tokensUsed + estimatedTokens <= maxAllowed;
  const usagePercent = tokensBudget > 0 ? (tokensUsed / tokensBudget) * 100 : 0;
  
  // Calculate how much of the overage band has been consumed
  const overageBand = maxAllowed - tokensBudget;
  const overageConsumed = Math.max(0, tokensUsed - tokensBudget);
  const overageUsed = overageBand > 0 ? (overageConsumed / overageBand) * 100 : 0;

  let warningLevel: BudgetCheck['warningLevel'] = 'normal';
  if (usagePercent >= 110) warningLevel = 'blocked';
  else if (usagePercent >= 100) warningLevel = 'critical';
  else if (usagePercent >= 80) warningLevel = 'warning';

  return {
    tokensBudget,
    tokensUsed,
    tokensRemaining: Math.max(0, tokensRemaining),
    maxAllowed,
    overageUsed,
    canExecute,
    usagePercent: Math.min(usagePercent, 110),
    warningLevel,
  };
}

// ─── Salary Negotiation Helpers ───────────────────────────

export interface NegotiationResult {
  accepted: boolean;
  counterOffer?: number;
  responseType: 'accept_happy' | 'accept_reluctant' | 'counter' | 'reject';
}

export function evaluateOffer(
  proposedSalary: number,
  baseSalary: number,
  minSalary: number
): NegotiationResult {
  if (proposedSalary < minSalary) {
    return {
      accepted: false,
      counterOffer: minSalary,
      responseType: 'reject',
    };
  }

  if (proposedSalary >= baseSalary) {
    return {
      accepted: true,
      responseType: 'accept_happy',
    };
  }

  // Between min and base: gradient of acceptance
  const ratio = (proposedSalary - minSalary) / (baseSalary - minSalary);
  
  if (ratio >= 0.6) {
    // 60%+ of the range → accept happily
    return {
      accepted: true,
      responseType: 'accept_happy',
    };
  }

  if (ratio >= 0.3) {
    // 30-60% of range → accept reluctantly
    return {
      accepted: true,
      responseType: 'accept_reluctant',
    };
  }

  // 0-30% of range → counter-offer
  const counterOffer = Math.round(minSalary + (baseSalary - minSalary) * 0.5);
  return {
    accepted: false,
    counterOffer,
    responseType: 'counter',
  };
}

// ─── Formatting Helpers ───────────────────────────────────

export function formatTokens(tokens: number): string {
  if (tokens >= 1_000_000) return `${(tokens / 1_000_000).toFixed(1)}M`;
  if (tokens >= 1_000) return `${(tokens / 1_000).toFixed(0)}K`;
  return tokens.toString();
}

export function formatSAR(amount: number): string {
  return `${amount.toLocaleString('ar-SA')} ر.س`;
}

export { MAX_OVERAGE, MARKUP, USD_TO_SAR };
