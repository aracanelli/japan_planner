import { useState, useCallback } from 'react';
import { PointOfInterest } from '../types';
import { searchPlaces, getPlaceDetails, getPlacePriceInfo } from '../services/mapService';

// Helper to check if a POI is valid
const isValidPOI = (poi: any): poi is PointOfInterest => {
  return (
    poi && 
    typeof poi === 'object' && 
    typeof poi.name === 'string' && 
    poi.position && 
    typeof poi.position.lat === 'number' && 
    typeof poi.position.lng === 'number' &&
    typeof poi.placeId === 'string'
  );
};

// Function to get the primary type of a place
const getPrimaryType = (types: string[] = []): string | null => {
  if (!types || types.length === 0) return null;
  
  // Define type priorities
  const typePriorities = [
    'restaurant', 'cafe', 'bar', 'food',        // Food first
    'tourist_attraction', 'museum', 'temple',   // Attractions
    'lodging', 'hotel',                         // Accommodation
    'shopping_mall', 'store',                   // Shopping
  ];
  
  // Return the first matching type from our priority list
  for (const priorityType of typePriorities) {
    if (types.includes(priorityType)) {
      return priorityType;
    }
  }
  
  // If no priority match, return the first type
  return types[0];
};

export const useSearch = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchResults, setSearchResults] = useState<PointOfInterest[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [nextPageToken, setNextPageToken] = useState<string | undefined>(undefined);
  
  const search = useCallback(async (term: string) => {
    if (!term) return;
    
    setSearchTerm(term);
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await searchPlaces(term);
      
      if (result && result.places && Array.isArray(result.places)) {
        const validPlaces = result.places.filter(isValidPOI);
        setSearchResults(validPlaces);
        setNextPageToken(result.nextPageToken);
      } else {
        console.error('Invalid search result format');
        setError('Invalid search response format. Please try again.');
      }
    } catch (err) {
      setError('Failed to search for places. Please try again.');
      console.error('Search error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const fetchNextPage = useCallback(async () => {
    if (!nextPageToken || isLoading) return;
    
    setIsLoading(true);
    
    try {
      const result = await searchPlaces(searchTerm, undefined, nextPageToken);
      
      if (result && result.places && Array.isArray(result.places)) {
        const validPlaces = result.places.filter(isValidPOI);
        setSearchResults(prev => [...prev, ...validPlaces]);
        setNextPageToken(result.nextPageToken);
      } else {
        console.error('Invalid next page result format');
        setError('Invalid search response format. Please try again.');
      }
    } catch (err) {
      setError('Failed to load more results. Please try again.');
      console.error('Fetch next page error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [nextPageToken, isLoading, searchTerm]);
  
  const getDetails = useCallback(async (placeId: string): Promise<PointOfInterest | null> => {
    try {
      // First get the basic place details
      const details = await getPlaceDetails(placeId);
      
      if (!isValidPOI(details)) {
        if (details && Object.keys(details).length === 0) {
          // Empty response from the API - normal for some locations
          console.log(`No detailed information available for place ID: ${placeId}`);
          return null;
        } else {
          console.error('Invalid POI details received');
          return null;
        }
      }
      
      // Now get enhanced price information
      try {
        // Get primary place type for better price lookup
        const primaryType = getPrimaryType(details.types);
        
        // Fetch price data
        const priceInfo = await getPlacePriceInfo(placeId, details.name, primaryType || undefined);
        
        // If we got price data, enhance the place details
        if (priceInfo && Object.keys(priceInfo).length > 0) {
          // Create a new price object or use existing one
          const enhancedPrice = details.price || {};
          
          // Add entrance fee for attractions
          if (priceInfo.entranceFee !== undefined) {
            enhancedPrice.entranceFee = priceInfo.entranceFee;
          }
          
          // Add average meal cost for restaurants
          if (priceInfo.averageMealCost !== undefined) {
            enhancedPrice.value = priceInfo.averageMealCost;
          }
          
          // Add room rate for accommodations
          if (priceInfo.roomRate !== undefined) {
            enhancedPrice.value = priceInfo.roomRate;
          }
          
          // Add price range if available
          if (priceInfo.priceRange) {
            enhancedPrice.range = priceInfo.priceRange;
          }
          
          // Add currency and description
          if (priceInfo.currency) {
            enhancedPrice.currency = priceInfo.currency;
          }
          
          if (priceInfo.description) {
            enhancedPrice.description = priceInfo.description;
          }
          
          // Set enhanced price on the details object
          details.price = enhancedPrice;
          
          // Add a note about the price source - check if notes property exists on the MapPin interface
          if (priceInfo.source && 'notes' in details && details.notes) {
            details.notes += `\nPrice data from: ${priceInfo.source}`;
          } else if (priceInfo.source) {
            // Use type assertion since we know the details will be used as a MapPin eventually
            (details as any).notes = `Price data from: ${priceInfo.source}`;
          }
          
          console.log('Enhanced price information:', enhancedPrice);
        }
      } catch (priceError) {
        console.warn('Error fetching price information:', priceError);
        // Continue with original details even if price enhancement fails
      }
      
      return details;
    } catch (err) {
      console.error('Get details error:', err);
      return null;
    }
  }, []);
  
  const clearSearch = useCallback(() => {
    setSearchResults([]);
    setSearchTerm('');
    setNextPageToken(undefined);
    setError(null);
  }, []);
  
  return {
    searchTerm,
    isLoading,
    error,
    searchResults,
    hasMoreResults: !!nextPageToken,
    search,
    fetchNextPage,
    getDetails,
    clearSearch
  };
}; 