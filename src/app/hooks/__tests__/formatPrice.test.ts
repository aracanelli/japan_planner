import { MapPin } from '../../types';
import '@testing-library/jest-dom';

// Recreate the formatPrice function from PinsList.tsx for isolated testing
const formatPrice = (pin: MapPin): string | null => {
  const { price, types = [] } = pin;
  
  if (!price) return null;
  
  // Determine place type category
  const isRestaurant = types.some(t => ['restaurant', 'cafe', 'food', 'bakery', 'meal_takeaway'].includes(t));
  const isAccommodation = types.some(t => ['lodging', 'hotel', 'guest_house'].includes(t));
  const isAttraction = types.some(t => ['tourist_attraction', 'museum', 'zoo', 'aquarium', 'amusement_park', 'temple', 'shrine'].includes(t));
  const isShopping = types.some(t => ['shopping_mall', 'store', 'shop', 'market'].includes(t));
  
  // Set appropriate label based on place type
  let priceLabel = '';
  
  if (isRestaurant) {
    priceLabel = 'Avg: ';
  } else if (isAccommodation) {
    priceLabel = 'Stay: ';
  } else if (isAttraction) {
    priceLabel = 'Entry: ';
  } else if (isShopping) {
    priceLabel = 'Cost: ';
  }
  
  const currency = price.currency || '¥';
  
  // Display entrance fee for attractions
  if (price.entranceFee !== undefined && isAttraction) {
    return `${priceLabel}${currency}${price.entranceFee.toLocaleString()}`;
  }
  
  // Display value (price) if available - prioritize this for restaurants/shopping
  if (price.value !== undefined) {
    return `${priceLabel}${currency}${price.value.toLocaleString()}`;
  }
  
  // Display price range if available - good for accommodations
  if (price.range?.min && price.range?.max) {
    return `${priceLabel}${currency}${price.range.min.toLocaleString()}-${currency}${price.range.max.toLocaleString()}`;
  }
  
  // Display price level as a fallback
  if (price.level !== undefined) {
    const priceSymbol = currency === '¥' ? '¥' : '$';
    return `${priceLabel}${Array(price.level + 1).fill(priceSymbol).join('')}`;
  }
  
  // If we have price info but none of the above formats, show a generic price tag
  if (price.description) {
    return price.description;
  }
  
  return null;
};

describe('formatPrice function', () => {
  // Test for attraction with entrance fee
  it('formats attraction entrance fee correctly', () => {
    const attractionPin: MapPin = {
      id: '1',
      name: 'Tokyo Tower',
      address: 'Tokyo',
      position: { lat: 35.6586, lng: 139.7454 },
      isSelected: false,
      types: ['tourist_attraction'],
      placeId: 'abc123',
      price: {
        entranceFee: 1000,
        currency: '¥'
      }
    };
    
    expect(formatPrice(attractionPin)).toBe('Entry: ¥1,000');
  });
  
  // Test for restaurant with value
  it('formats restaurant price value correctly', () => {
    const restaurantPin: MapPin = {
      id: '2',
      name: 'Sushi Restaurant',
      address: 'Tokyo',
      position: { lat: 35.6721, lng: 139.7636 },
      isSelected: false,
      types: ['restaurant'],
      placeId: 'def456',
      price: {
        value: 5000,
        currency: '¥'
      }
    };
    
    expect(formatPrice(restaurantPin)).toBe('Avg: ¥5,000');
  });
  
  // Test for accommodation with price range
  it('formats accommodation price range correctly', () => {
    const hotelPin: MapPin = {
      id: '3',
      name: 'Luxury Hotel',
      address: 'Tokyo',
      position: { lat: 35.6894, lng: 139.6917 },
      isSelected: false,
      types: ['lodging'],
      placeId: 'ghi789',
      price: {
        range: {
          min: 20000,
          max: 40000
        },
        currency: '¥'
      }
    };
    
    expect(formatPrice(hotelPin)).toBe('Stay: ¥20,000-¥40,000');
  });
  
  // Test for shopping mall with price level
  it('formats shopping price level correctly', () => {
    const shoppingPin: MapPin = {
      id: '4',
      name: 'Shopping Mall',
      address: 'Tokyo',
      position: { lat: 35.6726, lng: 139.7654 },
      isSelected: false,
      types: ['shopping_mall'],
      placeId: 'jkl012',
      price: {
        level: 2,
        currency: '¥'
      }
    };
    
    expect(formatPrice(shoppingPin)).toBe('Cost: ¥¥¥');
  });
  
  // Test for location with only description
  it('uses description when no other price info is available', () => {
    const templePin: MapPin = {
      id: '5',
      name: 'Temple',
      address: 'Tokyo',
      position: { lat: 35.7147, lng: 139.7966 },
      isSelected: false,
      types: ['temple'],
      placeId: 'mno345',
      price: {
        description: 'Free entry'
      }
    };
    
    expect(formatPrice(templePin)).toBe('Free entry');
  });
  
  // Test for different currency
  it('formats prices with different currencies correctly', () => {
    const usdPin: MapPin = {
      id: '6',
      name: 'American Restaurant',
      address: 'Tokyo',
      position: { lat: 35.6586, lng: 139.7454 },
      isSelected: false,
      types: ['restaurant'],
      placeId: 'pqr678',
      price: {
        value: 25,
        currency: '$'
      }
    };
    
    expect(formatPrice(usdPin)).toBe('Avg: $25');
    
    // Test price level with non-yen currency
    const expensivePin: MapPin = {
      ...usdPin,
      price: {
        level: 3,
        currency: '$'
      }
    };
    
    expect(formatPrice(expensivePin)).toBe('Avg: $$$$');
  });
  
  // Test multiple types (prioritization)
  it('prioritizes the most relevant type for price formatting', () => {
    const multiTypePin: MapPin = {
      id: '7',
      name: 'Museum Cafe',
      address: 'Tokyo',
      position: { lat: 35.6586, lng: 139.7454 },
      isSelected: false,
      types: ['museum', 'cafe', 'tourist_attraction'],
      placeId: 'stu901',
      price: {
        entranceFee: 1500,
        value: 800,
        currency: '¥'
      }
    };
    
    // Should prioritize entranceFee for attraction
    expect(formatPrice(multiTypePin)).toBe('Entry: ¥1,500');
  });
  
  // Test null price
  it('returns null for pins without price information', () => {
    const pinWithoutPrice: MapPin = {
      id: '8',
      name: 'Park',
      address: 'Tokyo',
      position: { lat: 35.6721, lng: 139.7636 },
      isSelected: false,
      types: ['park'],
      placeId: 'vwx234'
    };
    
    expect(formatPrice(pinWithoutPrice)).toBeNull();
  });
}); 