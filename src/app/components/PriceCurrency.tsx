import React, { useState, useEffect } from 'react';

interface PriceCurrencyProps {
  value: number;
  originCurrency?: string;
  showConversion?: boolean;
  entranceFee?: boolean;
  className?: string;
}

// Manual conversion rates for direct calculation
const MANUAL_RATES = {
  'JPY': {
    'CAD': 0.00967  // 1 JPY = 0.00967 CAD
  },
  'CAD': {
    'JPY': 103.43  // 1 CAD = 103.43 JPY
  }
};

const PriceCurrency: React.FC<PriceCurrencyProps> = ({ 
  value, 
  originCurrency = 'JPY', 
  showConversion = true,
  entranceFee = false,
  className = ''
}) => {
  const [isConverted, setIsConverted] = useState<boolean>(false);

  // For debugging - log actual value being received
  useEffect(() => {
    console.log(`PriceCurrency component received: value=${value}, currency=${originCurrency}`);
  }, [value, originCurrency]);

  // Toggle between currencies
  const toggleCurrency = () => {
    if (!showConversion) return;
    console.log(`Toggle currency from ${isConverted ? 'CAD to JPY' : 'JPY to CAD'}`);
    setIsConverted(prev => !prev);
  };

  // Calculate CAD value directly
  const getCADValue = (): string => {
    if (typeof value !== 'number' || isNaN(value)) {
      console.error('Invalid value for conversion:', value);
      return 'Invalid value';
    }
    
    // Simple direct calculation
    const convertedAmount = value * MANUAL_RATES.JPY.CAD;
    console.log(`Converted ${value} JPY to ${convertedAmount.toFixed(2)} CAD`);
    return `C$${convertedAmount.toFixed(2)}`;
  };

  // Format the JPY value
  const getJPYValue = (): string => {
    if (typeof value !== 'number' || isNaN(value)) {
      return 'Invalid value';
    }
    
    return `¥${Math.round(value).toLocaleString()}`;
  };

  // Build the css classes
  const baseClasses = `inline-flex items-center text-green-700 ${className}`;
  
  return (
    <button
      onClick={toggleCurrency}
      className={`${baseClasses} ${showConversion ? 'cursor-pointer hover:underline' : ''}`}
      disabled={!showConversion}
      title={showConversion ? "Click to toggle between JPY and CAD" : ""}
    >
      {entranceFee && <span className="mr-1">Entrance:</span>}
      
      {/* Directly display values based on conversion state */}
      {isConverted ? (
        <>
          {getCADValue()}
          <span className="text-xs ml-1 text-green-600">CAD</span>
        </>
      ) : (
        <>
          {getJPYValue()}
          <span className="text-xs ml-1 text-green-600">JPY</span>
        </>
      )}
      
      {showConversion && (
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-3 w-3 ml-1 text-green-600" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" 
          />
        </svg>
      )}
    </button>
  );
};

export default PriceCurrency; 