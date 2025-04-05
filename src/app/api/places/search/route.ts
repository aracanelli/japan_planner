import { NextResponse } from 'next/server';

// Add static export configuration
export const dynamic = 'force-static';
export const revalidate = false;

// For static export, return some example search results for Japan
export async function GET() {
  return NextResponse.json({
    results: [
      {
        place_id: "ChIJ5yWa-_GLGGARKLfmcEDDzh0",
        name: "Tokyo Tower",
        formatted_address: "4-2-8 Shibakoen, Minato City, Tokyo 105-0011, Japan",
        geometry: {
          location: {
            lat: 35.6585805,
            lng: 139.7454329
          }
        },
        photos: [
          {
            photo_reference: "example_photo_reference",
            height: 1080,
            width: 1920
          }
        ],
        types: ["tourist_attraction", "point_of_interest"],
        rating: 4.5,
        user_ratings_total: 25000,
        icon: "https://maps.gstatic.com/mapfiles/place_api/icons/v1/png_71/generic_business-71.png"
      },
      {
        place_id: "ChIJL2vNz8uLGGARZYDfj5oP7Jg",
        name: "Sensō-ji",
        formatted_address: "2 Chome-3-1 Asakusa, Taito City, Tokyo 111-0032, Japan",
        geometry: {
          location: {
            lat: 35.7147651,
            lng: 139.7966553
          }
        },
        photos: [
          {
            photo_reference: "example_photo_reference",
            height: 1080,
            width: 1920
          }
        ],
        types: ["place_of_worship", "tourist_attraction", "point_of_interest"],
        rating: 4.6,
        user_ratings_total: 30000,
        icon: "https://maps.gstatic.com/mapfiles/place_api/icons/v1/png_71/worship_buddhist-71.png"
      },
      {
        place_id: "ChIJ_zjB3u-LGGARhIOhDF2PBRs",
        name: "Meiji Jingu",
        formatted_address: "1-1 Yoyogikamizonocho, Shibuya City, Tokyo 151-8557, Japan",
        geometry: {
          location: {
            lat: 35.6764073,
            lng: 139.6993553
          }
        },
        photos: [
          {
            photo_reference: "example_photo_reference",
            height: 1080,
            width: 1920
          }
        ],
        types: ["place_of_worship", "tourist_attraction", "point_of_interest"],
        rating: 4.7,
        user_ratings_total: 28000,
        icon: "https://maps.gstatic.com/mapfiles/place_api/icons/v1/png_71/worship_shinto-71.png"
      }
    ],
    _static: true,
    _note: "This is example data for the desktop application. Connect to the internet for live data."
  });
} 