import { NextResponse } from 'next/server';

// Add static export configuration
export const dynamic = 'force-static';
export const revalidate = false;

// For static export, return example place details
export async function GET() {
  return NextResponse.json({
    result: {
      place_id: "ChIJ5yWa-_GLGGARKLfmcEDDzh0",
      name: "Tokyo Tower",
      formatted_address: "4-2-8 Shibakoen, Minato City, Tokyo 105-0011, Japan",
      formatted_phone_number: "+81 3-3433-5111",
      website: "https://www.tokyotower.co.jp/",
      rating: 4.5,
      user_ratings_total: 25000,
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
      opening_hours: {
        weekday_text: [
          "Monday: 9:00 AM – 10:45 PM",
          "Tuesday: 9:00 AM – 10:45 PM",
          "Wednesday: 9:00 AM – 10:45 PM",
          "Thursday: 9:00 AM – 10:45 PM",
          "Friday: 9:00 AM – 10:45 PM",
          "Saturday: 9:00 AM – 10:45 PM",
          "Sunday: 9:00 AM – 10:45 PM"
        ],
        open_now: true
      },
      price_level: 3,
      vicinity: "4-2-8 Shibakoen, Minato City",
      reviews: [
        {
          author_name: "Sample Reviewer",
          rating: 5,
          text: "Beautiful landmark with amazing views of Tokyo."
        }
      ],
      url: "https://maps.google.com/?cid=12421583413548963339"
    },
    _static: true,
    _note: "This is example data for the desktop application. Connect to the internet for live data."
  });
} 