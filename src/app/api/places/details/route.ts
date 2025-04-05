import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { PointOfInterest } from '../../../types';

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const GOOGLE_MAPS_API_URL = 'https://maps.googleapis.com/maps/api/place';

interface PriceInfo {
  level?: number;
  value?: number;
  currency?: string;
  range?: {
    min?: number;
    max?: number;
  };
  description?: string;
  formattedPrice?: string;
  ticketInfo?: string;
  entranceFee?: number;
  source?: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const placeId = searchParams.get('placeId');

  if (!placeId) {
    return NextResponse.json({ error: 'Place ID is required' }, { status: 400 });
  }

  try {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      console.error('Google Maps API key is missing');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // Make API call to Google Places API
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/place/details/json?placeid=${placeId}&key=${apiKey}&fields=name,formatted_address,geometry,place_id,types,photos,rating,price_level,reviews,website,formatted_phone_number,editorial_summary,opening_hours`
    );

    // Check if Google API returned a valid response
    if (!response.data) {
      console.error('Google Places API returned empty response');
      return NextResponse.json({}, { status: 200 });
    }

    if (response.data.status !== 'OK') {
      console.error(`Google Places API error: ${response.data.status} - ${response.data.error_message || 'Unknown error'}`);
      return NextResponse.json({}, { status: 200 });
    }

    // If result is missing, return empty object
    if (!response.data.result) {
      console.log(`No details found for place ID: ${placeId}`);
      return NextResponse.json({}, { status: 200 });
    }

    // Continue with the normal processing
    const result = response.data.result;
    
    // Debug log
    console.log('Place data:', JSON.stringify({
      name: result.name,
      price_level: result.price_level,
      reviews: result.reviews ? result.reviews.length : 0,
      types: result.types
    }));

    // Extract price information
    let price: PriceInfo | undefined = undefined;
    
    // Always initialize price object with default values, even if no price_level
    price = {
      level: result.price_level,
      currency: '¥', // Default to Yen for Japan
      formattedPrice: formatPriceLevel(result.price_level),
      source: 'Google Places'
    };
    
    // Check for review-based price data
    if (result.reviews && result.reviews.length > 0) {
      price.description = extractPriceFromReviews(result.reviews);
      
      // Try to extract numeric price values from reviews
      const extractedPrices = extractPriceValues(result.reviews);
      if (extractedPrices.length > 0) {
        // Calculate average if multiple prices found
        const avgPrice = extractedPrices.reduce((sum, val) => sum + val, 0) / extractedPrices.length;
        price.value = Math.round(avgPrice);

        // Set min/max if we have multiple prices
        if (extractedPrices.length > 1) {
          price.range = {
            min: Math.min(...extractedPrices),
            max: Math.max(...extractedPrices)
          };
        }
      }

      // Check if it's likely an attraction with entrance fee
      if (isAttraction(result.types)) {
        price.ticketInfo = extractTicketInfo(result.reviews);
        
        // Try to extract entrance fee specifically
        const entranceFee = extractEntranceFee(result.reviews);
        if (entranceFee) {
          price.entranceFee = entranceFee;
        }
      }
      
      // Handle hotel price estimation
      if (isAccommodation(result.types)) {
        const roomPrices = extractRoomPrices(result.reviews);
        if (roomPrices.length > 0) {
          price.value = Math.round(roomPrices.reduce((sum, val) => sum + val, 0) / roomPrices.length);
          if (roomPrices.length > 1) {
            price.range = {
              min: Math.min(...roomPrices),
              max: Math.max(...roomPrices)
            };
          }
        }
      }
      
      // Handle restaurant price estimation
      if (isRestaurant(result.types)) {
        const mealPrices = extractMealPrices(result.reviews);
        if (mealPrices.length > 0) {
          price.value = Math.round(mealPrices.reduce((sum, val) => sum + val, 0) / mealPrices.length);
          if (mealPrices.length > 1) {
            price.range = {
              min: Math.min(...mealPrices),
              max: Math.max(...mealPrices)
            };
          }
        }
      }
    }

    // Get additional information from reviews and editorial summary
    const additionalInfo = extractAdditionalInfo(result.reviews, result.editorial_summary);

    // Format the response
    const details: PointOfInterest = {
      id: result.place_id,
      name: result.name,
      address: result.formatted_address,
      position: {
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng
      },
      placeId: result.place_id,
      types: result.types || [],
      price,
      rating: result.rating,
      openingHours: result.opening_hours?.weekday_text,
      website: result.website,
      phoneNumber: result.formatted_phone_number,
      photos: result.photos?.map((photo: any) => 
        `${GOOGLE_MAPS_API_URL}/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${GOOGLE_MAPS_API_KEY}`
      ),
      additionalInfo
    };
    
    // Debug log
    console.log('Formatted price data:', JSON.stringify(price));

    return NextResponse.json(details);
  } catch (error) {
    console.error('Place details error:', error);
    return NextResponse.json(
      { error: 'Failed to get place details' },
      { status: 500 }
    );
  }
}

// Helper functions to extract price information from reviews
function extractPriceFromReviews(reviews: any[] = []): string | undefined {
  if (!reviews || reviews.length === 0) return undefined;
  
  // Keywords related to price in reviews
  const priceKeywords = ['price', 'cost', 'fee', 'ticket', 'admission', 'entrance', 'expensive', 'cheap', '円', '¥', 'yen'];
  
  // Find sentences containing price information
  for (const review of reviews) {
    if (!review.text) continue;
    
    const sentences = review.text.split(/[.!?。]+/);
    for (const sentence of sentences) {
      // Check if sentence contains price keywords
      if (priceKeywords.some(keyword => sentence.toLowerCase().includes(keyword))) {
        return sentence.trim();
      }
    }
  }
  
  return undefined;
}

function extractPriceValues(reviews: any[] = []): number[] {
  if (!reviews || reviews.length === 0) return [];
  
  const prices: number[] = [];
  const priceRegex = /(\d{3,})\s*(yen|円|¥)/gi;
  
  for (const review of reviews) {
    if (!review.text) continue;
    
    const matches = [...review.text.matchAll(priceRegex)];
    for (const match of matches) {
      if (match[1]) {
        const price = parseInt(match[1]);
        if (!isNaN(price) && price > 0 && price < 100000) { // Reasonable price range
          prices.push(price);
        }
      }
    }
  }
  
  return prices;
}

function formatPriceLevel(level: number | undefined): string | undefined {
  if (level === undefined) return undefined;
  
  switch(level) {
    case 0: return 'Free';
    case 1: return 'Inexpensive';
    case 2: return 'Moderate';
    case 3: return 'Expensive';
    case 4: return 'Very Expensive';
    default: return undefined;
  }
}

function extractTicketInfo(reviews: any[] = []): string | undefined {
  if (!reviews || reviews.length === 0) return undefined;
  
  const ticketKeywords = ['ticket', 'admission', 'entrance fee', 'entry fee'];
  
  for (const review of reviews) {
    if (!review.text) continue;
    
    const sentences = review.text.split(/[.!?。]+/);
    for (const sentence of sentences) {
      if (ticketKeywords.some(keyword => sentence.toLowerCase().includes(keyword))) {
        return sentence.trim();
      }
    }
  }
  
  return undefined;
}

function extractEntranceFee(reviews: any[] = []): number | undefined {
  if (!reviews || reviews.length === 0) return undefined;
  
  const entranceFeeRegex = /(entrance|admission|entry)\s+fee\s*(?:is|was|:)?\s*(\d{3,})\s*(?:yen|円|¥)/i;
  
  for (const review of reviews) {
    if (!review.text) continue;
    
    const match = review.text.match(entranceFeeRegex);
    if (match && match[2]) {
      const fee = parseInt(match[2]);
      if (!isNaN(fee) && fee > 0 && fee < 10000) { // Reasonable entrance fee range
        return fee;
      }
    }
  }
  
  return undefined;
}

function isAttraction(types: string[] = []): boolean {
  const attractionTypes = [
    'tourist_attraction', 
    'museum', 
    'art_gallery', 
    'aquarium', 
    'amusement_park', 
    'zoo', 
    'park'
  ];
  
  return types.some(type => attractionTypes.includes(type));
}

function isRestaurant(types: string[] = []): boolean {
  const restaurantTypes = [
    'restaurant',
    'food',
    'cafe',
    'bakery',
    'meal_takeaway',
    'meal_delivery'
  ];
  
  return types.some(type => restaurantTypes.includes(type));
}

function isAccommodation(types: string[] = []): boolean {
  const accommodationTypes = [
    'lodging',
    'hotel',
    'guest_house',
    'hostel',
    'ryokan'
  ];
  
  return types.some(type => accommodationTypes.includes(type));
}

function extractRoomPrices(reviews: any[] = []): number[] {
  if (!reviews || reviews.length === 0) return [];
  
  const prices: number[] = [];
  const roomPriceRegex = /(?:room|night|per night|nightly).*?(\d{3,})\s*(?:yen|円|¥)/i;
  
  for (const review of reviews) {
    if (!review.text) continue;
    
    const match = review.text.match(roomPriceRegex);
    if (match && match[1]) {
      const price = parseInt(match[1]);
      if (!isNaN(price) && price > 1000 && price < 100000) { // Reasonable room price range
        prices.push(price);
      }
    }
  }
  
  return prices;
}

function extractMealPrices(reviews: any[] = []): number[] {
  if (!reviews || reviews.length === 0) return [];
  
  const prices: number[] = [];
  const mealPriceRegex = /(?:meal|dish|course|menu|set|lunch|dinner).*?(\d{3,})\s*(?:yen|円|¥)/i;
  
  for (const review of reviews) {
    if (!review.text) continue;
    
    const match = review.text.match(mealPriceRegex);
    if (match && match[1]) {
      const price = parseInt(match[1]);
      if (!isNaN(price) && price > 100 && price < 50000) { // Reasonable meal price range
        prices.push(price);
      }
    }
  }
  
  return prices;
}

function extractAdditionalInfo(reviews: any[] = [], editorialSummary: any = null): any {
  const info: any = {};
  
  if (editorialSummary?.overview) {
    // Extract best time to visit
    const timeRegex = /best time to visit|recommend visiting|best season|popular time/i;
    if (timeRegex.test(editorialSummary.overview)) {
      const sentences = editorialSummary.overview.split(/[.!?。]+/);
      for (const sentence of sentences) {
        if (timeRegex.test(sentence)) {
          info.bestTimeToVisit = sentence.trim();
          break;
        }
      }
    }
  }
  
  if (reviews && reviews.length > 0) {
    // Extract accessibility information
    const accessibilityKeywords = ['accessibility', 'wheelchair', 'accessible', 'disability'];
    for (const review of reviews) {
      if (!review.text) continue;
      
      const sentences = review.text.split(/[.!?。]+/);
      for (const sentence of sentences) {
        if (accessibilityKeywords.some(keyword => sentence.toLowerCase().includes(keyword))) {
          info.accessibility = sentence.trim();
          break;
        }
      }
      
      // Check for duration information
      if (!info.estimatedDuration) {
        const durationRegex = /(?:spent|took|requires|need|needs|recommended)\s+(?:about|around)?\s*(\d+)[- ]*(hour|hr|minute|min|day)/i;
        const match = review.text.match(durationRegex);
        if (match) {
          info.estimatedDuration = `${match[1]} ${match[2]}${match[1] !== '1' ? 's' : ''}`;
        }
      }
    }
  }
  
  return Object.keys(info).length > 0 ? info : undefined;
} 