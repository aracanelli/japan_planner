import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { PointOfInterest } from '../../../types';

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const GOOGLE_MAPS_API_URL = 'https://maps.googleapis.com/maps/api/place';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const location = searchParams.get('location');
    const pagetoken = searchParams.get('pagetoken');

    if (!query && !pagetoken) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    // Prepare the parameters for the Google Places API call
    const params: any = {
      key: GOOGLE_MAPS_API_KEY,
    };

    if (pagetoken) {
      params.pagetoken = pagetoken;
    } else {
      params.query = `${query} japan`;
      
      // Use provided location or default to Tokyo
      params.location = location || '35.6762,139.6503';
      params.radius = '50000'; // 50km radius
    }

    // Make the API call to Google Places API
    const response = await axios.get(`${GOOGLE_MAPS_API_URL}/textsearch/json`, { params });
    const data = response.data;

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      throw new Error(`Google API error: ${data.status}, ${data.error_message}`);
    }

    // Transform the response to our desired format
    const places: PointOfInterest[] = data.results.map((place: any) => {
      // Extract price level if available
      let price = undefined;
      if (place.price_level !== undefined) {
        price = {
          level: place.price_level,
          currency: '¥' // Default to Yen for Japan
        };
      }

      return {
        id: place.place_id, // Use place_id as our ID
        name: place.name,
        address: place.formatted_address,
        position: {
          lat: place.geometry.location.lat,
          lng: place.geometry.location.lng
        },
        placeId: place.place_id,
        types: place.types || [],
        price,
        rating: place.rating,
        photos: place.photos?.map((photo: any) => 
          `${GOOGLE_MAPS_API_URL}/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${GOOGLE_MAPS_API_KEY}`
        )
      };
    });

    return NextResponse.json({
      places,
      nextPageToken: data.next_page_token
    });
  } catch (error) {
    console.error('Place search error:', error);
    return NextResponse.json(
      { error: 'Failed to search places' },
      { status: 500 }
    );
  }
} 