import axios, { AxiosError } from 'axios';
import { PointOfInterest, RouteInfo, TravelMode, SearchResult } from '../types';

// Base URL for API requests
const API_BASE_URL = '/api';

export const searchPlaces = async (
  query: string, 
  location?: { lat: number; lng: number }, 
  nextPageToken?: string
): Promise<SearchResult> => {
  try {
    const params: Record<string, string> = { query };
    
    if (location) {
      params.location = `${location.lat},${location.lng}`;
    }
    
    if (nextPageToken) {
      params.pagetoken = nextPageToken;
    }
    
    const response = await axios.get(`${API_BASE_URL}/places/search`, { params });
    return response.data;
  } catch (error) {
    console.error('Error searching places:', error);
    throw error;
  }
};

export const getPlaceDetails = async (placeId: string): Promise<Partial<PointOfInterest>> => {
  try {
    // Add a timeout to prevent long-running requests
    const response = await axios.get(`${API_BASE_URL}/places/details`, {
      params: { placeId },
      timeout: 5000 // 5 second timeout
    });
    
    // If response is empty or has no data property, return empty object
    if (!response || !response.data) {
      return {};
    }
    
    return response.data;
  } catch (error) {
    // If it's a timeout error, provide a clearer message
    if (axios.isAxiosError(error) && error.code === 'ECONNABORTED') {
      return {}; // Return empty object instead of throwing
    }
    
    // For other errors, log but don't throw to prevent app crashes
    console.error('Error getting place details:', error);
    return {}; // Return empty object instead of throwing
  }
};

// New function to fetch price information
export const getPlacePriceInfo = async (
  placeId: string,
  name?: string,
  placeType?: string
): Promise<any> => {
  try {
    const params: Record<string, string> = { placeId };
    
    if (name) {
      params.name = name;
    }
    
    if (placeType) {
      params.type = placeType;
    }
    
    const response = await axios.get(`${API_BASE_URL}/places/prices`, {
      params,
      timeout: 6000 // 6 second timeout (slightly longer for price scraping)
    });
    
    if (!response || !response.data) {
      return {};
    }
    
    return response.data;
  } catch (error) {
    console.error('Error getting price information:', error);
    return {}; // Return empty object instead of throwing
  }
};

// Function to convert currency
export const convertCurrency = async (
  amount: number,
  fromCurrency: string = 'JPY',
  toCurrency: string = 'CAD'
): Promise<{
  original: { amount: number; currency: string };
  converted: { amount: number; currency: string; formatted: string };
  rate: number;
}> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/currency/convert`, {
      params: {
        amount: amount.toString(),
        from: fromCurrency,
        to: toCurrency
      },
      timeout: 3000 // 3 second timeout
    });
    
    if (!response || !response.data) {
      // Return fallback conversion if API fails
      return {
        original: { amount, currency: fromCurrency },
        converted: { 
          amount: amount * (fromCurrency === 'JPY' ? 0.00967 : 103.43), 
          currency: toCurrency,
          formatted: formatCurrency(amount * (fromCurrency === 'JPY' ? 0.00967 : 103.43), toCurrency)
        },
        rate: fromCurrency === 'JPY' ? 0.00967 : 103.43
      };
    }
    
    return response.data;
  } catch (error) {
    console.error('Error converting currency:', error);
    // Return fallback conversion if API fails
    return {
      original: { amount, currency: fromCurrency },
      converted: { 
        amount: amount * (fromCurrency === 'JPY' ? 0.00967 : 103.43), 
        currency: toCurrency,
        formatted: formatCurrency(amount * (fromCurrency === 'JPY' ? 0.00967 : 103.43), toCurrency)
      },
      rate: fromCurrency === 'JPY' ? 0.00967 : 103.43
    };
  }
};

// Helper function to format currency fallback
function formatCurrency(amount: number, currency: string): string {
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

export const calculateRoute = async (
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number },
  mode: TravelMode
): Promise<RouteInfo> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/route`, {
      params: {
        originLat: origin.lat,
        originLng: origin.lng,
        destLat: destination.lat,
        destLng: destination.lng,
        mode
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error calculating route:', error);
    throw error;
  }
}; 