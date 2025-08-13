// Budget configuration for Motion app
// Supports multiple currencies and display formats

export interface BudgetTier {
  id: 'budget' | 'moderate' | 'premium';
  label: string;
  symbol: string;
  description: string;
  ranges: {
    [currency: string]: {
      min: number;
      max: number;
      perPerson: boolean;
    };
  };
}

export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
  regions: string[];
}

// Currency configurations
export const CURRENCIES: Record<string, CurrencyConfig> = {
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    regions: ['United States', 'US', 'USA', 'San Francisco', 'New York', 'Los Angeles', 'Chicago', 'Miami']
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    regions: ['Germany', 'France', 'Spain', 'Italy', 'Netherlands', 'Belgium', 'Austria', 'Portugal']
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    regions: ['United Kingdom', 'UK', 'London', 'Manchester', 'Edinburgh', 'Birmingham']
  },
  JPY: {
    code: 'JPY',
    symbol: '¥',
    name: 'Japanese Yen',
    regions: ['Japan', 'Tokyo', 'Osaka', 'Kyoto', 'Hiroshima']
  },
  CAD: {
    code: 'CAD',
    symbol: 'C$',
    name: 'Canadian Dollar',
    regions: ['Canada', 'Toronto', 'Vancouver', 'Montreal', 'Calgary']
  },
  AUD: {
    code: 'AUD',
    symbol: 'A$',
    name: 'Australian Dollar',
    regions: ['Australia', 'Sydney', 'Melbourne', 'Brisbane', 'Perth']
  }
};

// Budget tier configurations with currency-specific ranges
export const BUDGET_TIERS: BudgetTier[] = [
  {
    id: 'budget',
    label: 'Budget',
    symbol: '$',
    description: 'Cost-conscious',
    ranges: {
      USD: { min: 0, max: 30, perPerson: true },
      EUR: { min: 0, max: 26, perPerson: true },
      GBP: { min: 0, max: 24, perPerson: true },
      JPY: { min: 0, max: 3000, perPerson: true },
      CAD: { min: 0, max: 35, perPerson: true },
      AUD: { min: 0, max: 38, perPerson: true }
    }
  },
  {
    id: 'moderate',
    label: 'Moderate',
    symbol: '$$',
    description: 'Balanced spend',
    ranges: {
      USD: { min: 30, max: 70, perPerson: true },
      EUR: { min: 26, max: 60, perPerson: true },
      GBP: { min: 24, max: 56, perPerson: true },
      JPY: { min: 3000, max: 7000, perPerson: true },
      CAD: { min: 35, max: 80, perPerson: true },
      AUD: { min: 38, max: 85, perPerson: true }
    }
  },
  {
    id: 'premium',
    label: 'Premium',
    symbol: '$$$',
    description: 'Elevated picks',
    ranges: {
      USD: { min: 70, max: 200, perPerson: true },
      EUR: { min: 60, max: 170, perPerson: true },
      GBP: { min: 56, max: 160, perPerson: true },
      JPY: { min: 7000, max: 20000, perPerson: true },
      CAD: { min: 80, max: 230, perPerson: true },
      AUD: { min: 85, max: 240, perPerson: true }
    }
  }
];

// Helper functions
export function detectCurrencyFromLocation(location: string): string {
  const locationLower = location.toLowerCase();
  
  for (const [code, config] of Object.entries(CURRENCIES)) {
    if (config.regions.some(region => locationLower.includes(region.toLowerCase()))) {
      return code;
    }
  }
  
  return 'USD'; // Default fallback
}

export function getBudgetRange(tierId: 'budget' | 'moderate' | 'premium', currency: string = 'USD'): {
  min: number;
  max: number;
  perPerson: boolean;
  symbol: string;
} {
  const tier = BUDGET_TIERS.find(t => t.id === tierId);
  if (!tier || !tier.ranges[currency]) {
    // Fallback to USD if currency not found
    const fallback = tier?.ranges.USD || { min: 20, max: 80, perPerson: true };
    return {
      ...fallback,
      symbol: CURRENCIES[currency]?.symbol || '$'
    };
  }
  
  return {
    ...tier.ranges[currency],
    symbol: CURRENCIES[currency].symbol
  };
}

export function formatBudgetDisplay(
  tierId: 'budget' | 'moderate' | 'premium',
  currency: string = 'USD',
  format: 'symbol' | 'range' | 'both' = 'symbol'
): string {
  const tier = BUDGET_TIERS.find(t => t.id === tierId);
  if (!tier) return '$';

  if (format === 'symbol') {
    return tier.symbol;
  }

  const range = getBudgetRange(tierId, currency);
  const rangeText = `${range.symbol}${range.min}-${range.max}${range.perPerson ? ' per person' : ''}`;

  if (format === 'range') {
    return rangeText;
  }

  // format === 'both'
  return `${tier.symbol} (${rangeText})`;
}

export function getBudgetPromptText(
  tierId: 'budget' | 'moderate' | 'premium',
  currency: string = 'USD',
  groupSize: number = 1
): string {
  const range = getBudgetRange(tierId, currency);
  const tier = BUDGET_TIERS.find(t => t.id === tierId);
  
  const totalMin = range.perPerson ? range.min * groupSize : range.min;
  const totalMax = range.perPerson ? range.max * groupSize : range.max;
  
  return `Budget: ${tier?.label} (${range.symbol}${totalMin}-${totalMax} total for ${groupSize} people) - ${tier?.description}`;
}
