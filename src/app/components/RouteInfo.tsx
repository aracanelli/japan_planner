import React from 'react';
import { MapPin, RouteInfo as RouteInfoType } from '../types';

interface RouteInfoProps {
  selectedPins: MapPin[];
  routeInfo?: RouteInfoType | null;
  onCalculateRoute: (mode: 'WALKING' | 'DRIVING' | 'TRANSIT') => void;
  isCalculating?: boolean;
}

const RouteInfo: React.FC<RouteInfoProps> = ({
  selectedPins,
  routeInfo,
  onCalculateRoute,
  isCalculating = false
}) => {
  const canCalculate = selectedPins.length === 2;
  
  return (
    <div className="card">
      <h3 className="mb-4">Route Information</h3>
      
      {!canCalculate ? (
        <p className="text-gray-700">
          Select two locations on the map to calculate the route between them.
        </p>
      ) : (
        <>
          <div className="mb-4">
            <p className="font-medium">From:</p>
            <p className="text-gray-800">{selectedPins[0]?.name}</p>
            
            <p className="font-medium mt-2">To:</p>
            <p className="text-gray-800">{selectedPins[1]?.name}</p>
          </div>
          
          {/* Google Maps button for any route */}
          <a
            href={`https://www.google.com/maps/dir/?api=1&origin=${selectedPins[0].position.lat},${selectedPins[0].position.lng}&destination=${selectedPins[1].position.lat},${selectedPins[1].position.lng}&travelmode=transit`}
            target="_blank" 
            rel="noopener noreferrer"
            className="block w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white text-center rounded-md transition duration-200 mb-2"
          >
            <span className="mr-2">🚆</span> Get Directions in Google Maps
          </a>
          
          <p className="text-xs text-gray-600 text-center mt-2">
            Google Maps provides the most accurate transit routes in Japan
          </p>
          
          {routeInfo && (
            <div className="mt-4 p-3 bg-gray-50 rounded-md">
              <div className="flex items-center justify-between">
                <div>
                  <span className="inline-block px-2 py-1 text-sm bg-blue-100 text-blue-800 rounded">
                    {routeInfo.mode}
                  </span>
                </div>
                <div>
                  <span className="font-medium">{routeInfo.distance}</span>
                  <span className="mx-1">•</span>
                  <span>{routeInfo.duration}</span>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default RouteInfo; 