import { useState, useCallback, useEffect } from 'react';
import { MapPin, PointOfInterest, RouteInfo, TravelMode } from '../types';
import { calculateRoute } from '../services/mapService';
import { v4 as uuidv4 } from 'uuid';

// Utility function to save pins to localStorage
const savePinsToStorage = (pins: MapPin[]) => {
  try {
    if (pins.length === 0) {
      localStorage.removeItem('japan-planner-pins');
      return;
    }
    
    // Convert to a simpler format for storage to avoid circular references
    const simplifiedPins = pins.map(pin => ({
      ...pin,
      isSelected: !!pin.isSelected
    }));
    
    localStorage.setItem('japan-planner-pins', JSON.stringify(simplifiedPins));
  } catch (e) {
    console.error('Failed to save pins to localStorage:', e);
  }
};

// Utility function to clear pins from localStorage
const clearPinsStorage = () => {
  try {
    localStorage.removeItem('japan-planner-pins');
  } catch (e) {
    console.error('Failed to clear pins storage:', e);
  }
};

export const useMapPins = () => {
  const [pins, setPins] = useState<MapPin[]>([]);
  const [selectedPins, setSelectedPins] = useState<MapPin[]>([]);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
  
  /**
   * Load pins from localStorage on mount and handle cleanup on unmount
   * The cleanup function removes any temporary station pin positions from sessionStorage
   * to prevent memory leaks and stale data between sessions
   */
  useEffect(() => {
    try {
      const storedPins = localStorage.getItem('japan-planner-pins');
      if (storedPins) {
        const parsedPins = JSON.parse(storedPins);
        if (Array.isArray(parsedPins) && parsedPins.length > 0) {
          // Validate the parsed pins to ensure they have required fields
          const validPins = parsedPins.filter(pin => 
            pin && 
            pin.id && 
            pin.name && 
            pin.position && 
            pin.position.lat !== undefined && 
            pin.position.lng !== undefined
          );
          setPins(validPins);
        }
      }
    } catch (e) {
      console.error('Error loading pins from localStorage:', e);
      setError('Failed to load saved locations');
    }

    // Return cleanup function
    return () => {
      // Clear any temporary station pins from session storage
      const sessionStorageKeys = Object.keys(sessionStorage);
      const stationPositionKeys = sessionStorageKeys.filter(key => key.startsWith('station-') && key.endsWith('-position'));
      stationPositionKeys.forEach(key => {
        sessionStorage.removeItem(key);
      });
    };
  }, []);

  // Save pins to localStorage when pins change
  useEffect(() => {
    savePinsToStorage(pins);
  }, [pins]);

  const addPin = useCallback((poi: PointOfInterest) => {
    // Basic validation to ensure we have minimum required data
    if (!poi.name || !poi.position || !poi.placeId) {
      console.error('Invalid POI data:', poi);
      return false;
    }

    // Check if pin already exists
    if (pins.some(pin => pin.placeId === poi.placeId)) {
      setError('This location is already saved');
      return false;
    }

    const newPin: MapPin = {
      ...poi,
      id: uuidv4(), // Generate unique ID
      isSelected: false
    };

    setPins(prevPins => [...prevPins, newPin]);
    return true;
  }, [pins]);

  const removePin = useCallback((id: string) => {
    setPins(prevPins => prevPins.filter(pin => pin.id !== id));
    
    // Also remove from selected pins if needed
    setSelectedPins(prevSelected => prevSelected.filter(pin => pin.id !== id));
    
    // Clear route info if one of the selected pins was removed
    if (selectedPins.some(pin => pin.id === id)) {
      setRouteInfo(null);
    }
  }, [selectedPins]);

  const togglePinSelection = useCallback((id: string) => {
    // Check if this is a station pin (stations have IDs that start with "station-")
    const isStationPin = id.startsWith('station-');
    
    // Find the pin in our current pins array
    const pin = pins.find(p => p.id === id);
    
    if (!pin) {
      // If pin not found but it's a station pin, we need to add it to our pins collection temporarily
      if (isStationPin) {
        // Extract station information from the ID
        const parts = id.split('-');
        if (parts.length >= 4) {
          const lineName = parts[1];
          const stationName = parts[2];
          
          // Try to get the stored position from sessionStorage
          let position = { lat: 35.6812, lng: 139.7671 }; // Default to Tokyo Station if not found
          try {
            const storedPosition = sessionStorage.getItem(`${id}-position`);
            if (storedPosition) {
              position = JSON.parse(storedPosition);
            }
          } catch (e) {
            console.error('Failed to retrieve station position:', e);
          }
          
          // Create a temporary station pin
          const stationPin: MapPin = {
            id: id,
            name: `${stationName} Station (${lineName} Line)`,
            position: position,
            address: `Train Station on ${lineName} Line`,
            isSelected: true,
            types: ['transit_station', 'train_station'],
            placeId: id,
            isStation: true // Add flag to identify station pins
          };
          
          // Add the pin to our pins collection
          setPins(prev => [...prev, stationPin]);
          setSelectedPins(prev => [...prev, stationPin]);
          
          return;
        } else {
          console.error('Invalid station ID format:', id);
          return;
        }
      } else {
        console.error('Pin not found:', id);
        return;
      }
    }

    // If already selected, remove from selection
    if (pin.isSelected) {
      setSelectedPins(prev => prev.filter(p => p.id !== id));
      setPins(prev => prev.map(p => p.id === id ? { ...p, isSelected: false } : p));
      setRouteInfo(null);
      return;
    }

    // If we already have 2 selected pins, deselect the oldest one
    if (selectedPins.length >= 2) {
      const oldestPin = selectedPins[0];
      setPins(prev => prev.map(p => p.id === oldestPin.id ? { ...p, isSelected: false } : p));
      setSelectedPins(prev => prev.slice(1));
    }

    // Set the current pin as selected
    // First update the pins array to reflect the selection
    setPins(prev => prev.map(p => p.id === id ? { ...p, isSelected: true } : p));
    
    // Then update the selected pins array with the newly selected pin
    // Create a new reference with isSelected = true to avoid sharing the same reference
    const selectedPin = { ...pin, isSelected: true };
    setSelectedPins(prev => [...prev, selectedPin]);
  }, [pins, selectedPins]);

  const calculateDistanceAndDuration = async (mode: TravelMode = 'DRIVING') => {
    if (selectedPins.length !== 2) {
      console.error('Need exactly 2 pins selected to calculate distance');
      return;
    }

    setIsCalculatingRoute(true);

    try {
      // Fix type error by ensuring we pass the position property
      const result = await calculateRoute(
        { lat: selectedPins[0].position.lat, lng: selectedPins[0].position.lng },
        { lat: selectedPins[1].position.lat, lng: selectedPins[1].position.lng },
        mode
      );
      setRouteInfo(result);
    } catch (error) {
      console.error('Error calculating distance:', error);
      setRouteInfo(null);
    } finally {
      setIsCalculatingRoute(false);
    }
  };

  const clearSelection = useCallback(() => {
    setPins(prev => prev.map(p => ({ ...p, isSelected: false })));
    setSelectedPins([]);
    setRouteInfo(null);
  }, []);

  // Get selected pins
  const getSelectedPins = useCallback(() => {
    return pins.filter(pin => pin.isSelected);
  }, [pins]);

  // Clear all pins
  const clearPins = useCallback(() => {
    setPins([]);
    setSelectedPins([]);
    setRouteInfo(null);
    clearPinsStorage();
  }, []);

  // Update a pin with edited data
  const updatePin = useCallback((updatedPin: MapPin) => {
    setPins(prevPins => 
      prevPins.map(pin => 
        pin.id === updatedPin.id ? { ...pin, ...updatedPin } : pin
      )
    );
  }, []);

  /**
   * Removes temporary station pins from the pins state and cleans up
   * associated sessionStorage entries. This is useful when switching views
   * or when temporary transit information is no longer needed.
   * 
   * Station pins are created temporarily when selecting transit stations
   * along routes and should be cleaned up to prevent cluttering the saved locations.
   */
  const cleanupTemporaryPins = useCallback(() => {
    // Remove any temporary station pins from the pins array
    setPins(prevPins => prevPins.filter(pin => !pin.isStation));
    
    // Clear any temporary station positions from sessionStorage
    const sessionStorageKeys = Object.keys(sessionStorage);
    const stationPositionKeys = sessionStorageKeys.filter(key => key.startsWith('station-') && key.endsWith('-position'));
    stationPositionKeys.forEach(key => {
      sessionStorage.removeItem(key);
    });
  }, []);

  return {
    pins,
    selectedPins,
    routeInfo,
    error,
    isCalculatingRoute,
    addPin,
    removePin,
    togglePinSelection,
    calculateDistanceAndDuration,
    clearSelection,
    getSelectedPins,
    clearPins,
    updatePin,
    cleanupTemporaryPins
  };
}; 