# Japan Trip Planner

A web application for planning trips to Japan, finding points of interest, and calculating distances between locations.

## Features

- Search for places and attractions in Japan
- View detailed information about locations (price, ratings, etc.)
- Pin locations on a map
- Calculate walking, driving, and transit distances between locations
- Save locations for your trip

## Technology Stack

- Next.js 14
- TypeScript
- Google Maps API
- Google Places API
- Google Directions API
- TailwindCSS
- React Query

## Getting Started

### Prerequisites

- Node.js 18 or later
- A Google Maps API key with the following APIs enabled:
  - Maps JavaScript API
  - Places API
  - Directions API

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/japan-planner.git
cd japan-planner
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory and add your Google Maps API key:
```
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. Search for places in Japan using the search tab
2. Click on search results to add them to your saved locations
3. Select two locations on the map to calculate distances between them
4. Choose between walking, driving, or transit modes

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Google Maps API
- Next.js Team
- TailwindCSS Team
