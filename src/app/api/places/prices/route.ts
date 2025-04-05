import { NextResponse } from 'next/server';

// Add static export configuration
export const dynamic = 'force-static';
export const revalidate = false;

// For static export, return example price data
export async function GET() {
  return NextResponse.json({
    results: [
      {
        placeId: "ChIJ5yWa-_GLGGARKLfmcEDDzh0",
        name: "Tokyo Tower",
        price: {
          value: 1200,
          entranceFee: 1200,
          currency: "JPY",
          description: "Adult admission fee",
          source: "Official price"
        }
      },
      {
        placeId: "ChIJL2vNz8uLGGARZYDfj5oP7Jg",
        name: "Sensō-ji",
        price: {
          value: 0,
          entranceFee: 0,
          currency: "JPY",
          description: "Free entry",
          source: "Official information"
        }
      },
      {
        placeId: "ChIJa2jp_4YvAWARZnpRaPS1vH4",
        name: "Universal Studios Japan",
        price: {
          value: 8600,
          entranceFee: 8600,
          currency: "JPY",
          description: "1-Day Studio Pass (Adult)",
          source: "Official website"
        }
      },
      {
        placeId: "ChIJQZeJ_K_UImARBxb9ZPxvI9k",
        name: "Tokyo Disneyland",
        price: {
          value: 9400,
          entranceFee: 9400,
          currency: "JPY",
          description: "1-Day Passport (Adult)",
          source: "Official website"
        }
      }
    ],
    _static: true,
    _note: "This is example price data for the desktop application."
  });
} 