import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { PointOfInterest } from '../../../types';

// API keys
const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
const GOOGLE_MAPS_API_URL = 'https://maps.googleapis.com/maps/api/place';

// External API for price data (placeholder - will need real API keys)
const PRICE_API_ENABLED = false; // Set to true when you have working API keys
const TRIPADVISOR_API_KEY = process.env.TRIPADVISOR_API_KEY;
const TRAVEL_PAYOUTS_API_KEY = process.env.TRAVEL_PAYOUTS_API_KEY;

interface PriceResponse {
  entranceFee?: number;
  averageMealCost?: number;
  roomRate?: number;
  currency?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  source?: string;
  description?: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const placeId = searchParams.get('placeId');
  const name = searchParams.get('name');
  const placeType = searchParams.get('type');

  if (!placeId && !name) {
    return NextResponse.json({ error: 'Place ID or name is required' }, { status: 400 });
  }

  try {
    // 1. First, try to get price from Google Places API
    let priceData: PriceResponse = {};
    let googleData = await fetchGooglePlaceDetails(placeId as string);
    
    if (googleData.price) {
      priceData = {
        entranceFee: googleData.price.entranceFee,
        averageMealCost: googleData.price.value,
        currency: googleData.price.currency || '¥',
        priceRange: googleData.price.range,
        source: 'Google Places',
        description: googleData.price.description
      };
    }

    // 2. If no price or only basic price info from Google, try specialized APIs
    if (PRICE_API_ENABLED && (!priceData.entranceFee && !priceData.averageMealCost)) {
      try {
        if (isAttraction(placeType)) {
          // Try to get attraction pricing from TripAdvisor or similar API
          const attractionPrice = await fetchAttractionPrice(name as string);
          if (attractionPrice) {
            priceData.entranceFee = attractionPrice.price;
            priceData.currency = attractionPrice.currency;
            priceData.source = attractionPrice.source;
          }
        } 
        else if (isRestaurant(placeType)) {
          // Try to get restaurant pricing from food-related APIs
          const restaurantPrice = await fetchRestaurantPrice(name as string);
          if (restaurantPrice) {
            priceData.averageMealCost = restaurantPrice.averageCost;
            priceData.currency = restaurantPrice.currency;
            priceData.source = restaurantPrice.source;
          }
        }
        else if (isAccommodation(placeType)) {
          // Try to get hotel pricing from travel APIs
          const hotelPrice = await fetchHotelPrice(name as string);
          if (hotelPrice) {
            priceData.roomRate = hotelPrice.averageRate;
            priceData.priceRange = hotelPrice.priceRange;
            priceData.currency = hotelPrice.currency;
            priceData.source = hotelPrice.source;
          }
        }
      } catch (apiError) {
        console.error('Error fetching from specialized price APIs:', apiError);
        // Continue with just Google data if specialized APIs fail
      }
    }

    // 3. Use AI-generated estimates as fallback based on place type and location
    if (!priceData.entranceFee && !priceData.averageMealCost && !priceData.roomRate) {
      priceData = generateEstimatedPrices(placeType, googleData.types, name || undefined);
    }

    return NextResponse.json(priceData);
  } catch (error) {
    console.error('Price data fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to get price information' },
      { status: 500 }
    );
  }
}

// Helper function to fetch price details from Google Places API
async function fetchGooglePlaceDetails(placeId: string): Promise<any> {
  try {
    const response = await axios.get(`/api/places/details?placeId=${placeId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching Google place details:', error);
    return {};
  }
}

// Function to fetch attraction price information from external API
async function fetchAttractionPrice(name: string): Promise<any> {
  if (!TRIPADVISOR_API_KEY) return null;
  
  try {
    // This would be replaced with actual API call when you have API keys
    // const response = await axios.get(`https://api.tripadvisor.com/attractions?name=${encodeURIComponent(name)}&key=${TRIPADVISOR_API_KEY}`);
    // return response.data;
    
    // Placeholder response
    return {
      price: 1500, // Example price in yen
      currency: '¥',
      source: 'TripAdvisor'
    };
  } catch (error) {
    console.error('Error fetching attraction price:', error);
    return null;
  }
}

// Function to fetch restaurant price information from external API
async function fetchRestaurantPrice(name: string): Promise<any> {
  // This would be replaced with actual API call when you have API keys
  // Placeholder response
  return {
    averageCost: 2500, // Example price in yen
    currency: '¥',
    source: 'Restaurant price data'
  };
}

// Function to fetch hotel price information from external API
async function fetchHotelPrice(name: string): Promise<any> {
  if (!TRAVEL_PAYOUTS_API_KEY) return null;
  
  try {
    // This would be replaced with actual API call when you have API keys
    // Placeholder response
    return {
      averageRate: 15000, // Example price in yen
      priceRange: {
        min: 12000,
        max: 20000
      },
      currency: '¥',
      source: 'Hotel price data'
    };
  } catch (error) {
    console.error('Error fetching hotel price:', error);
    return null;
  }
}

// Generate realistic price estimates based on place types
function generateEstimatedPrices(placeType: string | null, types: string[] = [], name?: string): PriceResponse {
  const response: PriceResponse = {
    currency: '¥',
    source: 'Estimated'
  };

  // Check for specific popular attractions by name
  if (name) {
    const nameLower = name.toLowerCase();
    
    // Popular theme parks
    if (nameLower.includes('universal studios') || nameLower.includes('usj')) {
      response.entranceFee = 8600;
      response.description = 'Adult 1-Day Studio Pass (prices may vary by season)';
      return response;
    }
    
    if (nameLower.includes('disney') && (nameLower.includes('sea') || nameLower.includes('disneysea'))) {
      response.entranceFee = 9400;
      response.description = 'Adult 1-Day Passport for Tokyo DisneySea (varies by season)';
      return response;
    }
    
    if (nameLower.includes('disney') && nameLower.includes('land')) {
      response.entranceFee = 9400;
      response.description = 'Adult 1-Day Passport for Tokyo Disneyland (varies by season)';
      return response;
    }
    
    // Popular temples and shrines
    if (nameLower.includes('fushimi inari')) {
      response.entranceFee = 0;
      response.description = 'Free entrance (donations appreciated)';
      return response;
    }
    
    if (nameLower.includes('kinkaku') || nameLower.includes('golden pavilion')) {
      response.entranceFee = 500;
      response.description = 'Standard entrance fee';
      return response;
    }
    
    if (nameLower.includes('senso-ji') || nameLower.includes('sensoji')) {
      response.entranceFee = 0;
      response.description = 'Free entrance (paid areas within the complex)';
      return response;
    }
    
    // Popular museums
    if (nameLower.includes('ghibli museum')) {
      response.entranceFee = 1000;
      response.description = 'Adult admission (requires advance reservation)';
      return response;
    }
    
    if (nameLower.includes('teamlab') || nameLower.includes('team lab')) {
      response.entranceFee = 3200;
      response.description = 'Adult admission (weekday price)';
      return response;
    }
    
    // Popular shopping areas estimate
    if (nameLower.includes('ginza')) {
      response.averageMealCost = 3000;
      response.description = 'Higher-end shopping and dining area';
      return response;
    }
    
    if (nameLower.includes('akihabara')) {
      response.averageMealCost = 1200;
      response.description = 'Electronics and anime shopping district';
      return response;
    }
    
    // Famous hotels
    if (nameLower.includes('park hyatt tokyo')) {
      response.roomRate = 60000;
      response.priceRange = { min: 50000, max: 120000 };
      response.description = 'Luxury hotel featured in "Lost in Translation"';
      return response;
    }
    
    if (nameLower.includes('ryokan')) {
      response.roomRate = 25000;
      response.priceRange = { min: 15000, max: 40000 };
      response.description = 'Traditional Japanese inn, typically includes dinner and breakfast';
      return response;
    }
    
    // Popular restaurants
    if (nameLower.includes('sushi') || nameLower.includes('sashimi')) {
      response.averageMealCost = 4000;
      response.priceRange = { min: 1200, max: 20000 };
      response.description = 'Varies greatly by restaurant quality';
      return response;
    }
    
    if (nameLower.includes('ramen')) {
      response.averageMealCost = 1000;
      response.description = 'Average ramen meal cost';
      return response;
    }
  }

  // If no specific match by name, fall back to type-based estimates
  if (isAttraction(placeType) || (types && types.some(t => isAttractionType(t)))) {
    if (types && types.includes('museum')) {
      response.entranceFee = 1000; // Average museum fee in Japan
      response.description = 'Estimated museum entrance fee';
    } else if (types && types.includes('amusement_park')) {
      response.entranceFee = 8000; // Updated average theme park fee
      response.description = 'Estimated theme park entrance fee';
    } else if (types && (types.includes('temple') || types.includes('shrine'))) {
      response.entranceFee = 500; // Many temples have nominal fees
      response.description = 'Estimated temple/shrine entrance fee';
    } else if (types && types.includes('art_gallery')) {
      response.entranceFee = 1200;
      response.description = 'Estimated art gallery admission';
    } else if (types && types.includes('aquarium')) {
      response.entranceFee = 2400;
      response.description = 'Estimated aquarium admission';
    } else if (types && types.includes('zoo')) {
      response.entranceFee = 800;
      response.description = 'Estimated zoo admission';
    } else {
      response.entranceFee = 1500; // Generic attraction fee
      response.description = 'Estimated attraction fee';
    }
  } 
  else if (isRestaurant(placeType) || (types && types.some(t => isRestaurantType(t)))) {
    if (types && types.includes('cafe')) {
      response.averageMealCost = 800;
      response.description = 'Estimated cost for coffee and light meal';
    } else if (types && types.includes('bar')) {
      response.averageMealCost = 3000;
      response.description = 'Estimated cost for drinks and food';
    } else {
      response.averageMealCost = 2000;
      response.priceRange = { min: 1500, max: 3000 };
      response.description = 'Estimated cost per person for a typical meal';
    }
  }
  else if (isAccommodation(placeType) || (types && types.some(t => isAccommodationType(t)))) {
    response.roomRate = 15000;
    response.priceRange = { min: 10000, max: 25000 };
    response.description = 'Estimated nightly rate';
  }

  return response;
}

// Helper functions to categorize place types
function isAttraction(type: string | null): boolean {
  if (!type) return false;
  const attractionTypes = ['tourist_attraction', 'museum', 'zoo', 'aquarium', 'amusement_park', 'park', 'temple', 'shrine'];
  return attractionTypes.includes(type);
}

function isAttractionType(type: string): boolean {
  const attractionTypes = [
    'tourist_attraction', 'museum', 'zoo', 'aquarium', 'amusement_park', 
    'park', 'temple', 'shrine', 'gallery', 'art_gallery'
  ];
  return attractionTypes.includes(type);
}

function isRestaurant(type: string | null): boolean {
  if (!type) return false;
  const restaurantTypes = ['restaurant', 'cafe', 'bar', 'food', 'bakery', 'meal_takeaway'];
  return restaurantTypes.includes(type);
}

function isRestaurantType(type: string): boolean {
  const restaurantTypes = ['restaurant', 'cafe', 'bar', 'food', 'bakery', 'meal_takeaway'];
  return restaurantTypes.includes(type);
}

function isAccommodation(type: string | null): boolean {
  if (!type) return false;
  const accommodationTypes = ['lodging', 'hotel', 'guest_house'];
  return accommodationTypes.includes(type);
}

function isAccommodationType(type: string): boolean {
  const accommodationTypes = ['lodging', 'hotel', 'guest_house'];
  return accommodationTypes.includes(type);
} 