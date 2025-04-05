import { NextRequest, NextResponse } from 'next/server';

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

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const amount = searchParams.get('amount');
  const fromCurrency = searchParams.get('from') || 'JPY';
  const toCurrency = searchParams.get('to') || 'CAD';

  console.log(`Converting ${amount} ${fromCurrency} to ${toCurrency}`);

  if (!amount) {
    console.log('Error: Amount is required');
    return NextResponse.json({ error: 'Amount is required' }, { status: 400 });
  }

  // Parse amount and validate
  const numericAmount = parseFloat(amount);
  if (isNaN(numericAmount)) {
    console.log('Error: Invalid amount format');
    return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
  }

  console.log(`Parsed amount: ${numericAmount}`);

  try {
    // Validate currencies
    const from = fromCurrency as SupportedCurrency;
    const to = toCurrency as SupportedCurrency;
    
    // Get the exchange rate
    if (!EXCHANGE_RATES[from] || !EXCHANGE_RATES[from][to]) {
      console.log(`Error: Conversion rate not available for ${from} to ${to}`);
      return NextResponse.json({ 
        error: `Conversion rate not available for ${from} to ${to}` 
      }, { status: 400 });
    }

    const rate = EXCHANGE_RATES[from][to] as number;
    console.log(`Exchange rate: 1 ${from} = ${rate} ${to}`);
    
    const convertedAmount = numericAmount * rate;
    console.log(`Converted amount: ${numericAmount} ${from} = ${convertedAmount} ${to}`);
    
    const formatted = formatCurrency(convertedAmount, to);
    console.log(`Formatted result: ${formatted}`);

    const response = {
      original: {
        amount: numericAmount,
        currency: from
      },
      converted: {
        amount: convertedAmount,
        currency: to,
        formatted: formatted
      },
      rate: rate
    };
    
    console.log('Response payload:', JSON.stringify(response));
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Currency conversion error:', error);
    return NextResponse.json(
      { error: 'Failed to convert currency' },
      { status: 500 }
    );
  }
}

// Helper function to format currency
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