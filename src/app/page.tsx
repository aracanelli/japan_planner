'use client';

import { useState, useCallback, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Map from './components/Map';
import Search from './components/Search';
import PinsList from './components/PinsList';
import { useSearch } from './hooks/useSearch';
import { useMapPins } from './hooks/useMapPins';
import { PointOfInterest, TravelMode } from './types';
import { resetAllData, checkAndFixDataIssues } from './reset';
import ClientOnly from './components/ClientOnly';
import Link from 'next/link';

// Create a client
const queryClient = new QueryClient();

export default function Home() {
  return (
    <QueryClientProvider client={queryClient}>
      <ClientOnly>
        <JapanPlanner />
      </ClientOnly>
    </QueryClientProvider>
  );
}

function JapanPlanner() {
  const [activeTab, setActiveTab] = useState<'search' | 'saved'>('search');
  const [currentRouteMode, setCurrentRouteMode] = useState<TravelMode | undefined>(undefined);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
  
  // Check for data issues when component mounts
  useEffect(() => {
    checkAndFixDataIssues();
  }, []);
  
  const { 
    search, 
    isLoading: isSearching, 
    searchResults, 
    hasMoreResults, 
    fetchNextPage, 
    getDetails 
  } = useSearch();
  
  const { 
    pins, 
    selectedPins, 
    routeInfo, 
    addPin, 
    removePin, 
    togglePinSelection, 
    calculateDistance, 
    clearSelection,
    updatePin
  } = useMapPins();

  const handleSearch = useCallback(async (query: string) => {
    await search(query);
  }, [search]);

  const handleResetData = useCallback(() => {
    // Use our reset utility which handles cleanup more thoroughly
    resetAllData();
    
    // Show confirmation toast before page refreshes
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-5 right-5 bg-red-600 text-white px-4 py-3 rounded-md shadow-lg z-50 animate-fadeIn';
    toast.textContent = `All saved locations have been cleared`;
    document.body.appendChild(toast);
  }, []);

  const handleSelectSearchResult = useCallback(async (poi: PointOfInterest) => {
    console.log('Selecting result:', poi.name, poi);
    
    // Prevent issues if the incoming POI is invalid
    if (!poi || !poi.name || !poi.position || !poi.placeId) {
      console.error('Received invalid POI data:', poi);
      
      // Show an error toast
      const toast = document.createElement('div');
      toast.className = 'fixed bottom-5 right-5 bg-red-600 text-white px-4 py-3 rounded-md shadow-lg z-50 animate-fadeIn';
      toast.textContent = `Error: Cannot add this location`;
      document.body.appendChild(toast);
      
      // Remove the toast after 3 seconds
      setTimeout(() => {
        toast.classList.replace('animate-fadeIn', 'animate-fadeOut');
        setTimeout(() => toast.remove(), 500);
      }, 3000);
      
      return;
    }
    
    // Get more details if needed
    let locationToAdd = poi;
    let detailsAvailable = false;
    let hasPriceInfo = false;
    
    try {
      // Show loading toast
      const loadingToast = document.createElement('div');
      loadingToast.className = 'fixed bottom-5 right-5 bg-blue-600 text-white px-4 py-3 rounded-md shadow-lg z-50 animate-fadeIn';
      loadingToast.textContent = `Getting details for ${poi.name}...`;
      document.body.appendChild(loadingToast);
      
      const details = await getDetails(poi.placeId);
      
      // Remove loading toast
      loadingToast.remove();
      
      // Only use details if they're valid and have all required fields
      if (details && details.name && details.position && details.placeId) {
        console.log('Got details for:', details.name, details);
        locationToAdd = details;
        detailsAvailable = true;
        
        // Check if we have price information
        hasPriceInfo = !!(details.price?.entranceFee || 
                        details.price?.value || 
                        (details.price?.range?.min && details.price?.range?.max));
      } else {
        console.log('No detailed information available, using original POI');
      }
    } catch (error) {
      console.error('Error getting details:', error);
    }
    
    // Add the pin with either the details or the original POI
    addPin(locationToAdd);
    
    // Create success toast
    const successToast = document.createElement('div');
    
    if (detailsAvailable) {
      if (hasPriceInfo) {
        successToast.className = 'fixed bottom-5 right-5 bg-green-600 text-white px-4 py-3 rounded-md shadow-lg z-50 animate-fadeIn';
        successToast.innerHTML = `<div class="flex items-center">
          <span class="text-green-300 mr-2">💰</span>
          <div>
            <p>Added <strong>${locationToAdd.name}</strong></p>
            <p class="text-sm opacity-80">With price information</p>
          </div>
        </div>`;
      } else {
        successToast.className = 'fixed bottom-5 right-5 bg-blue-600 text-white px-4 py-3 rounded-md shadow-lg z-50 animate-fadeIn';
        successToast.innerHTML = `Added <strong>${locationToAdd.name}</strong> with enhanced details`;
      }
    } else {
      successToast.className = 'fixed bottom-5 right-5 bg-blue-600 text-white px-4 py-3 rounded-md shadow-lg z-50 animate-fadeIn';
      successToast.innerHTML = `Added <strong>${locationToAdd.name}</strong>`;
    }
    
    document.body.appendChild(successToast);
    
    // Remove the toast after 3 seconds
    setTimeout(() => {
      successToast.classList.replace('animate-fadeIn', 'animate-fadeOut');
      setTimeout(() => successToast.remove(), 500);
    }, 3000);
    
    // Automatically switch to the saved tab
    setActiveTab('saved');
  }, [addPin, getDetails, setActiveTab]);

  const handleCalculateRoute = async (mode: TravelMode) => {
    if (selectedPins.length !== 2) return;
    
    try {
      // Just set the current route mode without calculating distance or showing info
      setCurrentRouteMode(mode);
    } catch (error) {
      console.error('Error setting route mode:', error);
    }
  };

  return (
    <main className="flex h-screen overflow-hidden bg-gray-50">
      {/* Left sidebar */}
      <div className="w-1/3 h-full flex flex-col border-r">
        <div className="border-b">
          <div className="flex">
            <button
              className={`flex-1 py-4 text-center ${
                activeTab === 'search' ? 'bg-white border-b-2 border-blue-600 text-blue-700' : 'bg-gray-50 text-gray-700'
              }`}
              onClick={() => setActiveTab('search')}
            >
              Search
            </button>
            <button
              className={`flex-1 py-4 text-center ${
                activeTab === 'saved' ? 'bg-white border-b-2 border-blue-600 text-blue-700' : 'bg-gray-50 text-gray-700'
              }`}
              onClick={() => setActiveTab('saved')}
            >
              Saved Locations{typeof window !== 'undefined' ? ` (${pins.length})` : ''}
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-hidden">
          {activeTab === 'search' ? (
            <Search
              onSearch={handleSearch}
              isLoading={isSearching}
              results={searchResults}
              hasMoreResults={hasMoreResults}
              onLoadMore={fetchNextPage}
              onSelectResult={handleSelectSearchResult}
              onViewTrip={() => setActiveTab('saved')}
            />
          ) : (
            <PinsList
              pins={pins}
              onPinSelect={togglePinSelection}
              onPinRemove={removePin}
              onSearchClick={() => setActiveTab('search')}
              onResetData={handleResetData}
              onPinUpdate={updatePin}
            />
          )}
        </div>
      </div>
      
      {/* Map container */}
      <div className="flex-1 h-full relative">
        <Map
          pins={pins}
          selectedPins={selectedPins}
          onPinSelect={togglePinSelection}
          routeMode={currentRouteMode}
          routeInfo={routeInfo}
          onCalculateRoute={handleCalculateRoute}
          isCalculating={isCalculatingRoute}
          />
        
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <Link
            href="/trip-planner"
            onClick={() => {
              // Ensure the active trip ID is loaded from localStorage
              const activeTrip = localStorage.getItem('japan_active_trip_id');
              if (activeTrip) {
                // We don't need to do anything special as the trip-planner page
                // will automatically load the active trip from localStorage
                console.log('Navigating to active trip:', activeTrip);
              }
            }}
            className="bg-blue-600 text-white rounded-md shadow-md px-4 py-2 hover:bg-blue-700 transition-colors"
          >
            Trip Planner
          </Link>
          {selectedPins.length > 0 && (
            <button
              onClick={clearSelection}
              className="bg-white rounded-md shadow-md px-4 py-2 text-gray-800 btn"
            >
              Clear Selection
            </button>
          )}
        </div>
    </div>
    </main>
  );
}
