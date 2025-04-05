import { NextRequest, NextResponse } from 'next/server';

// Catch-all route handler to prevent 404 errors
export async function GET(request: NextRequest) {
  // Simply return a 200 OK response with empty data
  // This prevents 404 errors if any component still tries to call the API
  return NextResponse.json({
    status: 'ok',
    message: 'Using client-side conversion instead of API'
  });
} 