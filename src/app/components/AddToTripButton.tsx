'use client';

import { useState, useEffect } from 'react';
import { MapPin, TripPlan, PointOfInterest } from '../types';
import { useTripPlanner } from '../hooks/useTripPlanner';

interface AddToTripButtonProps {
  pin: MapPin | PointOfInterest;
}

const AddToTripButton: React.FC<AddToTripButtonProps> = ({ pin }) => {
  const { allTrips, addLocationToDay, addMultiDayAccommodation } = useTripPlanner();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [isHotel, setIsHotel] = useState(false);

  // Determine if this is accommodation based on types
  useEffect(() => {
    const types = pin.types || [];
    setIsHotel(types.some(t => 
      ['lodging', 'hotel', 'guest_house', 'accommodation', 'ryokan'].includes(t.toLowerCase())
    ));
  }, [pin]);

  // Get the selected trip
  const selectedTrip = selectedTripId 
    ? allTrips.find(trip => trip.id === selectedTripId)
    : null;

  const selectedDay = selectedTrip && selectedDayId
    ? selectedTrip.days.find(day => day.id === selectedDayId)
    : null;

  // Handle adding to trip
  const handleAddToTrip = () => {
    if (!selectedTripId || !selectedDayId) return;
    
    if (isHotel && endDate) {
      // Add as multi-day accommodation
      addMultiDayAccommodation(
        pin, 
        selectedDay?.date || '', 
        endDate,
        pin.price?.value || pin.price?.entranceFee || 0
      );
    } else {
      // Add as regular location
      addLocationToDay(selectedDayId, pin);
    }
    
    setIsOpen(false);
    
    // Show success message
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-5 right-5 bg-green-600 text-white px-4 py-3 rounded-md shadow-lg z-50 animate-fadeIn';
    toast.textContent = `Added ${pin.name} to your trip plan`;
    document.body.appendChild(toast);
    
    // Remove the toast after 3 seconds
    setTimeout(() => {
      toast.classList.replace('animate-fadeIn', 'animate-fadeOut');
      setTimeout(() => toast.remove(), 500);
    }, 3000);
  };

  if (allTrips.length === 0) {
    return (
      <a 
        href="/trip-planner" 
        target="_blank"
        onClick={(e) => {
          // This path is for creating a new trip, so we don't need
          // to set any active trip, the page will show the create new trip form
          console.log('Navigating to create a new trip plan');
        }}
        className="block w-full py-2 px-4 bg-blue-600 text-white text-center rounded-md hover:bg-blue-700 transition"
      >
        Create a Trip Plan
      </a>
    );
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="block w-full py-2 px-4 bg-blue-600 text-white text-center rounded-md hover:bg-blue-700 transition"
      >
        Add to Trip Plan
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-semibold mb-4">Add to Trip Plan</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Trip
              </label>
              <select
                value={selectedTripId || ''}
                onChange={(e) => {
                  setSelectedTripId(e.target.value);
                  setSelectedDayId(null);
                  setEndDate(null);
                }}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">Select a trip</option>
                {allTrips.map((trip) => (
                  <option key={trip.id} value={trip.id}>
                    {trip.name} ({new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()})
                  </option>
                ))}
              </select>
            </div>

            {selectedTrip && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Day
                </label>
                <select
                  value={selectedDayId || ''}
                  onChange={(e) => {
                    setSelectedDayId(e.target.value);
                    // If hotel, default end date to the current day
                    if (isHotel && e.target.value) {
                      const day = selectedTrip.days.find(d => d.id === e.target.value);
                      if (day) setEndDate(day.date);
                    }
                  }}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select a day</option>
                  {selectedTrip.days.map((day) => (
                    <option key={day.id} value={day.id}>
                      Day {day.dayNumber}: {new Date(day.date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {isHotel && selectedDay && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date (for multi-day stay)
                </label>
                <select
                  value={endDate || ''}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  {selectedTrip?.days
                    .filter(day => new Date(day.date) >= new Date(selectedDay.date))
                    .map((day) => (
                      <option key={day.id} value={day.date}>
                        {new Date(day.date).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </option>
                    ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  This will add the hotel to all days in the range
                </p>
              </div>
            )}

            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAddToTrip}
                disabled={!selectedTripId || !selectedDayId || (isHotel && !endDate)}
                className={`px-4 py-2 rounded-md transition ${
                  !selectedTripId || !selectedDayId || (isHotel && !endDate)
                    ? 'bg-blue-300 text-white cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                Add to Trip
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AddToTripButton; 