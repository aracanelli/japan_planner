import { NextRequest, NextResponse } from 'next/server';

// Static export configuration
export const dynamic = 'force-static';
export const revalidate = false;

// Define types for exchange rates
type SupportedCurrency = 'JPY' | 'CAD' | 'USD' | 'EUR' | 'GBP';
type ExchangeRateMap = {
  [key in SupportedCurrency]: {
    [key in SupportedCurrency]?: number;
  };
};

// Exchange rates as of current date (normally would fetch from an API)
const EXCHANGE_RATES: ExchangeRateMap = {
  'JPY': {
    'CAD': 0.00967, // 1 JPY = 0.00967 CAD (15000 JPY ≈ 145.04 CAD)
    'USD': 0.0067,
    'EUR': 0.0062,
    'GBP': 0.0053
  },
  'CAD': {
    'JPY': 103.43, // 1 CAD = 103.43 JPY
    'USD': 0.74,
    'EUR': 0.68,
    'GBP': 0.58
  },
  'USD': {
    'JPY': 149.25,
    'CAD': 1.35
  },
  'EUR': {
    'JPY': 161.29,
    'CAD': 1.47
  },
  'GBP': {
    'JPY': 188.68,
    'CAD': 1.72
  }
};

// For static export, we'll return a static JSON representation of all possible conversions
// Client-side code will handle the actual conversion
export async function GET() {
  // Return the static exchange rates table
  return NextResponse.json({ 
    rates: EXCHANGE_RATES,
    // Include some example conversions for common amounts
    examples: {
      "1000_JPY_to_CAD": {
        amount: 1000,
        from: "JPY",
        to: "CAD",
        result: 9.67,
        formatted: "C$9.67"
      },
      "5000_JPY_to_CAD": {
        amount: 5000,
        from: "JPY",
        to: "CAD",
        result: 48.35,
        formatted: "C$48.35"
      },
      "10000_JPY_to_CAD": {
        amount: 10000,
        from: "JPY",
        to: "CAD",
        result: 96.70,
        formatted: "C$96.70"
      },
      "15000_JPY_to_CAD": {
        amount: 15000,
        from: "JPY",
        to: "CAD",
        result: 145.05,
        formatted: "C$145.05"
      }
    }
  });
}

// Helper function to format currency - kept for reference
function formatCurrency(amount: number, currency: SupportedCurrency): string {
  switch (currency) {
    case 'JPY':
      return `¥${Math.round(amount).toLocaleString()}`;
    case 'CAD':
      return `C$${amount.toFixed(2)}`;
    case 'USD':
      return `$${amount.toFixed(2)}`;
    case 'EUR':
      return `€${amount.toFixed(2)}`;
    case 'GBP':
      return `£${amount.toFixed(2)}`;
    default:
      return `${amount.toFixed(2)} ${currency}`;
  }
} 