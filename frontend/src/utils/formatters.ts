// Utility functions for formatting based on user preferences

export interface FormatPreferences {
  distance_unit: 'miles' | 'kilometers';
  budget_display: 'symbols' | 'numbers';
  currency: string;
  time_format: '12h' | '24h';
}

// Budget formatting - Budget: 10-30, Moderate: 31-55, Premium: 55+
export const formatBudget = (cost: number, preferences: FormatPreferences) => {
  const symbol = getCurrencySymbol(preferences.currency);
  
  if (preferences.budget_display === 'symbols') {
    if (cost >= 55) return symbol + symbol + symbol; // Premium
    if (cost >= 31) return symbol + symbol; // Moderate  
    return symbol; // Budget (10-30)
  } else {
    // Numbers format
    if (cost >= 55) return `${symbol}55+`; // Premium
    if (cost >= 31) return `${symbol}31-55`; // Moderate
    return `${symbol}10-30`; // Budget
  }
};

// Distance formatting
export const formatDistance = (distance: number, preferences: FormatPreferences) => {
  if (preferences.distance_unit === 'kilometers') {
    const km = distance * 1.60934; // Convert miles to km
    return `${km.toFixed(1)} km`;
  }
  return `${distance.toFixed(1)} mi`;
};

// Currency symbol mapping
export const getCurrencySymbol = (currency: string): string => {
  const currencySymbols: { [key: string]: string } = {
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'JPY': '¥',
    'CAD': 'C$',
    'AUD': 'A$',
    'CHF': 'Fr',
    'CNY': '¥',
    'INR': '₹',
    'KRW': '₩',
    'BRL': 'R$',
    'MXN': '$',
    'SEK': 'kr',
    'NOK': 'kr',
    'DKK': 'kr',
    'PLN': 'zł',
    'CZK': 'Kč',
    'HUF': 'Ft',
    'RUB': '₽',
    'TRY': '₺',
    'ZAR': 'R',
    'SGD': 'S$',
    'HKD': 'HK$',
    'NZD': 'NZ$'
  };
  return currencySymbols[currency] || currency;
};

// Time formatting
export const formatTime = (date: Date, format: '12h' | '24h'): string => {
  if (format === '24h') {
    return date.toLocaleTimeString('en-GB', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  }
  return date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
};

// Duration formatting with preferences
export const formatDuration = (hours: number, preferences?: FormatPreferences) => {
  if (hours <= 2) return `${hours} hour${hours === 1 ? '' : 's'}`;
  if (hours <= 6) return `${hours} hours`;
  return 'Full day';
};

// Price formatting with currency
export const formatPrice = (amount: number, currency: string): string => {
  const symbol = getCurrencySymbol(currency);
  return `${symbol}${amount.toFixed(2)}`;
};

// Format scheduled date for display
export const formatScheduledDate = (dateString: string, preferences?: FormatPreferences): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  // Helper function to get day with ordinal suffix
  const getDayWithOrdinal = (day: number): string => {
    if (day > 3 && day < 21) return `${day}th`;
    switch (day % 10) {
      case 1: return `${day}st`;
      case 2: return `${day}nd`;
      case 3: return `${day}rd`;
      default: return `${day}th`;
    }
  };
  
  // If it's today
  if (diffDays === 0) {
    return `Today`;
  }
  
  // If it's tomorrow
  if (diffDays === 1) {
    return `Tomorrow`;
  }
  
  // For all other dates, format as "Aug 7th, Tuesday"
  const monthName = date.toLocaleDateString('en-US', { month: 'short' });
  const dayWithOrdinal = getDayWithOrdinal(date.getDate());
  const weekday = date.toLocaleDateString('en-US', { weekday: 'long' });
  
  return `${monthName} ${dayWithOrdinal}, ${weekday}`;
};
