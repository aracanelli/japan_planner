import { NextResponse } from 'next/server';

// Static export configuration
export const dynamic = 'force-static';
export const revalidate = false;

// For static export, we'll return example routes
export async function GET() {
  // Return static example route data
  return NextResponse.json({
    status: "OK",
    routes: [
      {
        summary: "Example Route - Tokyo Station to Shinjuku Station",
        legs: [
          {
            distance: {
              text: "6.2 km",
              value: 6200
            },
            duration: {
              text: "23 mins",
              value: 1380
            },
            start_address: "Tokyo Station, Japan",
            end_address: "Shinjuku Station, Japan",
            steps: [
              {
                travel_mode: "TRANSIT",
                distance: { text: "6.2 km", value: 6200 },
                duration: { text: "23 mins", value: 1380 },
                html_instructions: "Take the JR Yamanote Line from Tokyo to Shinjuku",
                transit_details: {
                  departure_stop: { name: "Tokyo" },
                  arrival_stop: { name: "Shinjuku" },
                  line: { 
                    name: "JR Yamanote Line",
                    short_name: "JY",
                    color: "#9ACD32"
                  }
                }
              }
            ]
          }
        ]
      }
    ],
    _static: true,
    _note: "This is example data. In desktop mode, please use external maps for accurate directions."
  });
} 