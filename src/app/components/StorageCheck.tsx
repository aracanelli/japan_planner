import React, { useEffect, useState } from 'react';
import { MapPin } from '../types';

interface StorageCheckProps {
  displayPins: MapPin[];
  onResetData: () => void;
}

const StorageCheck = ({ displayPins, onResetData }: StorageCheckProps) => {
  const [hasMissingPins, setHasMissingPins] = useState(false);
  const [storedPinsCount, setStoredPinsCount] = useState(0);
  const [displayPinsCount, setDisplayPinsCount] = useState(0);
  
  useEffect(() => {
    // Check localStorage for pins
    try {
      const storedData = localStorage.getItem('japan-planner-pins');
      if (storedData) {
        const parsedPins = JSON.parse(storedData);
        if (Array.isArray(parsedPins)) {
          // Filter out station pins from the stored pins
          const nonStationStoredPins = parsedPins.filter(pin => !pin.isStation);
          
          // Set counter for display purposes
          setStoredPinsCount(nonStationStoredPins.length);
          setDisplayPinsCount(displayPins.length);
          
          // Check if the number of non-station pins is greater than the displayed pins
          setHasMissingPins(nonStationStoredPins.length > displayPins.length);
          
          console.log(`StorageCheck: ${parsedPins.length} pins in storage, ${nonStationStoredPins.length} non-station pins, ${displayPins.length} displayed, missing: ${nonStationStoredPins.length > displayPins.length}`);
        }
      }
    } catch (error) {
      console.error('Error checking localStorage:', error);
    }
  }, [displayPins]);
  
  if (!hasMissingPins) return null;
  
  return (
    <div className="mt-4 p-3 border border-orange-300 bg-orange-50 rounded-md">
      <p className="text-sm text-orange-800">
        There appear to be saved locations that aren't showing.
        You have {storedPinsCount} saved locations but only {displayPinsCount} {displayPinsCount === 1 ? 'is' : 'are'} displayed.
      </p>
      <div className="flex mt-2 space-x-2">
        <button
          onClick={() => onResetData()}
          className="px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white text-sm rounded-md"
        >
          Fix Saved Locations
        </button>
        <button
          onClick={() => onResetData()}
          className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-sm rounded-md"
        >
          Reset All Data
        </button>
        <button
          onClick={() => setHasMissingPins(false)}
          className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm rounded-md"
        >
          Fix
        </button>
      </div>
    </div>
  );
};

export default StorageCheck; 