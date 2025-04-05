import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const origin = searchParams.get('origin');
    const destination = searchParams.get('destination');
    const mode = searchParams.get('mode') || 'driving';

    if (!origin || !destination) {
      return NextResponse.json(
        { error: 'Origin and destination parameters are required' },
        { status: 400 }
      );
    }

    const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
    
    if (!GOOGLE_MAPS_API_KEY) {
      console.error('Google Maps API key is missing');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Set up the base params for Google Directions API
    let baseParams = {
      origin,
      destination,
      key: GOOGLE_MAPS_API_KEY,
      language: 'en',
      region: 'jp'
    };

    // For transit mode, try multiple approaches
    if (mode === 'transit') {
      console.log('Attempting to find transit directions with Japan-specific approach');
      
      // Japan-specific transit approach
      // For Japan, the Google Maps Directions API has specific requirements
      try {
        // First try the standard approach with Japan region specified
        console.log('Trying standard Japan transit approach');
        
        // Convert coordinates to strings with 6 decimal places for consistency
        const originLatLng = origin.split(',').map(coord => parseFloat(coord).toFixed(6)).join(',');
        const destinationLatLng = destination.split(',').map(coord => parseFloat(coord).toFixed(6)).join(',');
        
        console.log(`Formatted coordinates: Origin: ${originLatLng}, Destination: ${destinationLatLng}`);
        
        // Use axios directly with region=jp and all other Japanese parameters
        const response = await axios.get(
          'https://maps.googleapis.com/maps/api/directions/json',
          { 
            params: {
              ...baseParams,
              origin: originLatLng,
              destination: destinationLatLng,
              mode: 'transit',
              region: 'jp',
              language: 'en',
              departure_time: 'now',
              transit_routing_preference: 'fewer_transfers',
              alternatives: true
            }
          }
        );
        
        if (response.data.status === 'OK' && response.data.routes && response.data.routes.length > 0) {
          console.log('Found transit route with standard approach');
          
          // Check if this route contains actual transit steps or just walking
          const steps = response.data.routes[0].legs[0].steps;
          const hasTransitStep = steps.some((step: any) => step.travel_mode === 'TRANSIT');
          
          if (hasTransitStep) {
            console.log('Route contains transit steps. Using this route.');
            
            // Log transit details for debugging
            steps.forEach((step: any, index: number) => {
              if (step.travel_mode === 'TRANSIT') {
                console.log(`Transit step ${index}:`, 
                  step.transit_details?.line?.name || 'Unknown line',
                  step.transit_details?.line?.short_name || '',
                  'from', step.transit_details?.departure_stop?.name || 'Unknown station',
                  'to', step.transit_details?.arrival_stop?.name || 'Unknown station'
                );
              }
            });
            
            return NextResponse.json(response.data);
          } else {
            console.log('Route does not contain transit steps. Trying alternative approach.');
          }
        } else {
          console.log('Standard transit approach failed with status:', response.data.status);
        }
        
        // If the standard approach failed, try with modified parameters for Japan
        console.log('Trying Japan-specific transit approach with modified parameters');
        const japanResponse = await axios.get(
          'https://maps.googleapis.com/maps/api/directions/json',
          { 
            params: {
              origin: originLatLng,
              destination: destinationLatLng,
              key: GOOGLE_MAPS_API_KEY,
              mode: 'transit',
              region: 'jp',
              language: 'ja', // Use Japanese for better transit data
              departure_time: Math.floor(Date.now() / 1000),
              transit_mode: 'rail',
              alternatives: true
            }
          }
        );
        
        if (japanResponse.data.status === 'OK' && japanResponse.data.routes && japanResponse.data.routes.length > 0) {
          console.log('Found transit route with Japan-specific approach');
          
          // Check for transit steps in this response
          const japanSteps = japanResponse.data.routes[0].legs[0].steps;
          const hasJapanTransitStep = japanSteps.some((step: any) => step.travel_mode === 'TRANSIT');
          
          if (hasJapanTransitStep) {
            console.log('Japan-specific route contains transit steps. Using this route.');
            return NextResponse.json(japanResponse.data);
          } else {
            console.log('Japan-specific route does not contain transit steps.');
          }
        } else {
          console.log('Japan-specific approach failed with status:', japanResponse.data.status);
        }
        
        // If both approaches failed, try with tomorrow morning (good for Japan late-night queries)
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(10, 0, 0, 0); // 10:00 AM tomorrow
        
        console.log('Trying with tomorrow morning departure time:', tomorrow.toISOString());
        const tomorrowResponse = await axios.get(
          'https://maps.googleapis.com/maps/api/directions/json',
          { 
            params: {
              origin: originLatLng,
              destination: destinationLatLng,
              key: GOOGLE_MAPS_API_KEY,
              mode: 'transit',
              region: 'jp',
              language: 'en',
              departure_time: Math.floor(tomorrow.getTime() / 1000),
              alternatives: true
            }
          }
        );
        
        if (tomorrowResponse.data.status === 'OK' && tomorrowResponse.data.routes && tomorrowResponse.data.routes.length > 0) {
          console.log('Found transit route with tomorrow departure time');
          
          // Check for transit steps
          const tomorrowSteps = tomorrowResponse.data.routes[0].legs[0].steps;
          const hasTomorrowTransitStep = tomorrowSteps.some((step: any) => step.travel_mode === 'TRANSIT');
          
          if (hasTomorrowTransitStep) {
            console.log('Tomorrow route contains transit steps. Using this route.');
            return NextResponse.json(tomorrowResponse.data);
          } else {
            console.log('Tomorrow route does not contain transit steps.');
          }
        } else {
          console.log('Tomorrow approach failed with status:', tomorrowResponse.data.status);
        }
        
        // All transit approaches failed, fall back to walking
        console.log('All transit approaches failed. Falling back to walking directions.');
        const walkingResponse = await axios.get(
          'https://maps.googleapis.com/maps/api/directions/json',
          { 
            params: {
              origin: originLatLng,
              destination: destinationLatLng,
              key: GOOGLE_MAPS_API_KEY,
              mode: 'walking'
            }
          }
        );
        
        if (walkingResponse.data.status === 'OK') {
          console.log('Found walking route as fallback');
          
          // Add fallback flag
          const responseWithFallbackFlag = {
            ...walkingResponse.data,
            _fallback_mode: 'walking'
          };
          
          return NextResponse.json(responseWithFallbackFlag);
        } else {
          return NextResponse.json({
            status: 'ZERO_RESULTS',
            routes: [],
            error_message: 'No transit or walking routes found between these locations'
          });
        }
      } catch (error) {
        console.error('Error in transit routing:', error);
        return NextResponse.json({
          status: 'ERROR',
          routes: [],
          error_message: 'Error processing transit directions'
        }, { status: 500 });
      }
    } else {
      // For non-transit modes, use a simple request
      console.log(`Making ${mode} directions request`);
      const response = await axios.get(
        'https://maps.googleapis.com/maps/api/directions/json',
        { 
          params: {
            ...baseParams,
            mode
          }
        }
      );
      
      return NextResponse.json(response.data);
    }
  } catch (error: any) {
    console.error('Error fetching directions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch directions', message: error.message },
      { status: 500 }
    );
  }
} 