'use client';

import React from 'react';
import AddToTripButton from './AddToTripButton';

interface StationDetailsProps {
  station: {
    id: string;
    name: string;
    line: {
      name: string;
      color: string;
    };
    position: {
      lat: number;
      lng: number;
    };
  };
  onClose: () => void;
}

const StationDetails: React.FC<StationDetailsProps> = ({ station, onClose }) => {
  // Create a location object from the station that can be used with the AddToTripButton
  const stationAsPoi = {
    id: `station-${station.id}`,
    name: `${station.name} Station`,
    address: `${station.line.name} Line`,
    position: station.position,
    placeId: `station-${station.id}`,
    types: ['train_station', 'transit_station', 'transportation'],
    isStation: true
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
      <h2 className="text-xl font-semibold mb-2">{station.name} Station</h2>
      
      <div className="flex items-center text-gray-600 mb-3">
        <span className="mr-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </span>
        <span 
          className="text-sm flex items-center" 
          style={{ color: station.line.color }}
        >
          <span 
            className="inline-block w-3 h-3 rounded-full mr-1 border border-gray-300" 
            style={{ backgroundColor: station.line.color }}
          ></span>
          {station.line.name} Line
        </span>
      </div>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          This is a train station on the {station.line.name} Line. You can add it to your trip plan
          for transportation planning.
        </p>
      </div>
      
      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-700 mb-1">Trip Planning</h3>
        <p className="text-sm text-gray-600 mb-2">
          Add this station to your trip plan to:
        </p>
        <ul className="text-sm text-gray-600 list-disc pl-5 mb-2">
          <li>Plan train trips between destinations</li>
          <li>Mark as a transportation point in your itinerary</li>
          <li>Calculate transportation costs</li>
        </ul>
      </div>
      
      <div className="mt-4">
        <AddToTripButton pin={stationAsPoi} />
      </div>
      
      <button
        onClick={onClose}
        className="mt-4 w-full py-2 px-4 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
      >
        Close
      </button>
    </div>
  );
};

export default StationDetails; 