# Japan Planner

A comprehensive trip planning application for Japan travel. Plan your journey, find attractions, calculate routes, and manage your travel budget all in one place.

## Features

- **Interactive Map**: Explore Japan with an interactive map interface
- **Points of Interest**: Search and save attractions, restaurants, hotels, and more
- **Route Planning**: Calculate routes between locations with multiple transportation options
- **Trip Planner**: Create and manage detailed day-by-day trip itineraries
- **Budget Management**: Track expenses for accommodation, food, activities, and more
- **Currency Conversion**: View prices in JPY or CAD with automatic conversion
- **Multi-day Stays**: Easily manage hotel bookings across multiple days

## Technologies Used

- Next.js 13+ with App Router
- React 18
- TypeScript
- Tailwind CSS
- Google Maps API integration
- Jest for testing

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn
- Google Maps API key

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/aracanelli/japan_planner.git
   cd japan-planner
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env.local` file in the root directory with your Google Maps API key:
   ```
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
   ```

4. Start the development server:
   ```
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Map Navigation
- Click on the map to add pins
- Search for specific locations using the search bar
- Save points of interest for your trip

### Trip Planning
- Create a new trip with dates
- Add saved locations to specific days
- Track your budget for each day and category
- Add notes for days and locations

## License

This project is licensed under the MIT License.

## Acknowledgments

- Google Maps API
- Next.js Team
- TailwindCSS Team
