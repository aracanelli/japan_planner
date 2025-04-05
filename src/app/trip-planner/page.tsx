'use client';

import { useState, useEffect } from 'react';
import { useTripPlanner } from '../hooks/useTripPlanner';
import { PointOfInterest, TripDay, ScheduledLocation, TripPlan, CustomExpense } from '../types';
import { v4 as uuidv4 } from 'uuid';
import Link from 'next/link';
import CustomExpensesSection from './CustomExpensesSection';
import BudgetSummary from './BudgetSummary';

// Helper function to format dates without timezone adjustment
const formatDateWithoutTimezoneAdjustment = (dateString: string) => {
  if (!dateString) return '';
  
  // For YYYY-MM-DD format from the date picker
  if (dateString.includes('-')) {
    const [year, month, day] = dateString.split('-').map(Number);
    return `${month}/${day}/${year}`;
  }
  
  // Fallback to regular Date handling with timezone correction
  try {
    const date = new Date(dateString);
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
    const localDate = new Date(date.getTime() + userTimezoneOffset);
    
    const year = localDate.getFullYear();
    const month = localDate.getMonth() + 1;
    const day = localDate.getDate();
    
    // Format as MM/DD/YYYY
    return `${month}/${day}/${year}`;
  } catch (e) {
    console.error('Error formatting date:', e);
    return dateString;
  }
};

// Components will be defined below
const TripPlanner = () => {
  const {
    tripPlan,
    allTrips,
    isLoading,
    createTrip,
    updateTripDetails,
    addLocationToDay,
    removeLocationFromDay,
    addMultiDayAccommodation,
    updateScheduledLocation,
    updateDayNotes,
    getTotalBudget,
    resetTripPlanner,
    switchTrip,
    deleteTrip,
    duplicateTrip,
    addCustomExpense,
    updateCustomExpense,
    removeCustomExpense,
    getCustomExpensesByCategory,
    getTotalExpensesByCategory
  } = useTripPlanner();
  
  const [showNewTripForm, setShowNewTripForm] = useState(!tripPlan);
  const [showTripsList, setShowTripsList] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [newTripName, setNewTripName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  useEffect(() => {
    if (tripPlan) {
      setShowNewTripForm(false);
      setShowTripsList(false);
    }
  }, [tripPlan]);
  
  // Initialize edit form with current trip data
  const initializeEditForm = () => {
    if (tripPlan) {
      setNewTripName(tripPlan.name);
      setStartDate(tripPlan.startDate);
      setEndDate(tripPlan.endDate);
      setShowEditForm(true);
    }
  };
  
  // Handle create new trip
  const handleCreateTrip = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTripName && startDate && endDate) {
      createTrip(newTripName, startDate, endDate);
      setShowNewTripForm(false);
      setNewTripName('');
      setStartDate('');
      setEndDate('');
    }
  };
  
  // Handle update trip details
  const handleUpdateTrip = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTripName && startDate && endDate && tripPlan) {
      updateTripDetails({
        name: newTripName,
        startDate,
        endDate
      });
      setShowEditForm(false);
    }
  };
  
  const handleDeleteTrip = (tripId: string) => {
    if (confirm('Are you sure you want to delete this trip? This action cannot be undone.')) {
      deleteTrip(tripId);
    }
  };
  
  const handleDuplicateTrip = (tripId: string) => {
    duplicateTrip(tripId);
    setShowTripsList(false);
  };
  
  // Function to collect all custom expenses from all days
  const getAllCustomExpenses = () => {
    if (!tripPlan) return [];
    
    return tripPlan.days.flatMap(day => day.customExpenses);
  };
  
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
  }
  
  if (showNewTripForm || (!tripPlan && allTrips.length === 0)) {
    return (
      <div className="container mx-auto p-4 max-w-3xl">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Create New Trip Plan</h1>
            {allTrips.length > 0 && (
              <button
                onClick={() => {
                  setShowNewTripForm(false);
                  setShowTripsList(true);
                }}
                className="px-4 py-2 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition duration-150"
              >
                View All Trips
              </button>
            )}
          </div>
          
          <form onSubmit={handleCreateTrip} className="space-y-4">
            <div>
              <label htmlFor="tripName" className="block text-sm font-medium text-gray-700 mb-1">
                Trip Name
              </label>
              <input
                type="text"
                id="tripName"
                value={newTripName}
                onChange={(e) => setNewTripName(e.target.value)}
                placeholder="Japan Trip 2023"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  id="startDate"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  id="endDate"
                  value={endDate}
                  min={startDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
            
            <div className="flex justify-between pt-4">
              <Link
                href="/"
                className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition duration-150"
              >
                Back to Map
              </Link>
              <button
                type="submit"
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-150"
                disabled={!newTripName || !startDate || !endDate}
              >
                Create Trip
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }
  
  if (showEditForm && tripPlan) {
    return (
      <div className="container mx-auto p-4 max-w-3xl">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Edit Trip Plan</h1>
          </div>
          
          <form onSubmit={handleUpdateTrip} className="space-y-4">
            <div>
              <label htmlFor="tripName" className="block text-sm font-medium text-gray-700 mb-1">
                Trip Name
              </label>
              <input
                type="text"
                id="tripName"
                value={newTripName}
                onChange={(e) => setNewTripName(e.target.value)}
                placeholder="Japan Trip 2023"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  id="startDate"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  id="endDate"
                  value={endDate}
                  min={startDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
            
            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => setShowEditForm(false)}
                className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition duration-150"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-150"
                disabled={!newTripName || !startDate || !endDate}
              >
                Update Trip
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }
  
  if (showTripsList) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Your Trip Plans</h1>
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  setShowNewTripForm(true);
                  setShowTripsList(false);
                }}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-150"
              >
                Create New Trip
              </button>
              <Link
                href="/"
                className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition duration-150"
              >
                Back to Map
              </Link>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {allTrips.map((trip) => (
              <div 
                key={trip.id} 
                className={`border rounded-lg p-4 ${tripPlan?.id === trip.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-lg">{trip.name}</h3>
                    <p className="text-sm text-gray-600">
                      {formatDateWithoutTimezoneAdjustment(trip.startDate)} - {formatDateWithoutTimezoneAdjustment(trip.endDate)}
                      <span className="ml-2">({trip.days.length} days)</span>
                    </p>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        switchTrip(trip.id);
                        setShowTripsList(false);
                      }}
                      className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      {tripPlan?.id === trip.id ? 'Current' : 'View'}
                    </button>
                    <button
                      onClick={() => handleDuplicateTrip(trip.id)}
                      className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                    >
                      Duplicate
                    </button>
                    {allTrips.length > 1 && (
                      <button
                        onClick={() => handleDeleteTrip(trip.id)}
                        className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
                
                {tripPlan?.id === trip.id && (
                  <div className="mt-2 text-xs text-blue-600 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Current active trip
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  if (!tripPlan) {
    return null; // This should not happen because we handle all cases above
  }
  
  const totalBudget = getTotalBudget();
  const totalBudgetValue = Object.values(totalBudget).reduce((sum: number, value: number) => sum + value, 0);
  const allCustomExpenses = getAllCustomExpenses();
  
  return (
    <div className="container mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">{tripPlan.name}</h1>
            {allTrips.length > 1 && (
              <button 
                onClick={() => setShowTripsList(true)}
                className="mt-1 text-sm text-blue-600 hover:text-blue-800"
              >
                Switch Trip
              </button>
            )}
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={initializeEditForm}
              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition duration-150"
            >
              Edit
            </button>
            <button 
              onClick={() => handleDuplicateTrip(tripPlan.id)}
              className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition duration-150"
            >
              Duplicate
            </button>
            <button 
              onClick={() => {
                if (confirm('Create a new trip? Your current trip data will be saved.')) {
                  setShowNewTripForm(true);
                }
              }}
              className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition duration-150"
            >
              New Trip
            </button>
            <Link 
              href="/"
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition duration-150"
            >
              Back to Map
            </Link>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-4 mb-6">
          <div className="flex items-center">
            <div className="text-gray-600 mr-4">Dates:</div>
            <div className="font-medium">
              {formatDateWithoutTimezoneAdjustment(tripPlan.startDate)} to {formatDateWithoutTimezoneAdjustment(tripPlan.endDate)}
              <span className="ml-2 text-sm text-gray-500">({tripPlan.days.length} days)</span>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="text-gray-600 mr-4">Currency:</div>
            <div className="font-medium">
              {tripPlan.currency === 'JPY' ? 'Japanese Yen (¥)' : 'Canadian Dollar ($)'}
            </div>
          </div>
          
          <div className="p-4 border rounded-md">
            <h3 className="font-semibold text-sm text-gray-500 uppercase mb-2">Trip Notes</h3>
            <textarea
              value={tripPlan.notes || ''}
              onChange={(e) => updateTripDetails({ notes: e.target.value })}
              placeholder="Add general trip notes here..."
              className="w-full h-16 p-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
        
        {/* Budget Summary */}
        <BudgetSummary 
          budget={totalBudget}
          customExpenses={allCustomExpenses}
          currency={tripPlan.currency}
        />
        
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Daily Planner</h2>
          <div className="space-y-6">
            {tripPlan.days.map((day) => (
              <DayCard
                key={day.id}
                day={day}
                onAddLocation={addLocationToDay}
                onRemoveLocation={removeLocationFromDay}
                onUpdateLocation={updateScheduledLocation}
                onUpdateNotes={updateDayNotes}
                currency={tripPlan.currency}
                addCustomExpense={addCustomExpense}
                updateCustomExpense={updateCustomExpense}
                removeCustomExpense={removeCustomExpense}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

interface DayCardProps {
  day: TripDay;
  onAddLocation: (dayId: string, poi: PointOfInterest, options?: Partial<ScheduledLocation>) => any;
  onRemoveLocation: (dayId: string, locationId: string) => void;
  onUpdateLocation: (dayId: string, locationId: string, updates: Partial<ScheduledLocation>) => void;
  onUpdateNotes: (dayId: string, notes: string) => void;
  currency: string;
  addCustomExpense: (dayId: string, expense: Omit<CustomExpense, 'id'>) => any;
  updateCustomExpense: (dayId: string, expenseId: string, updates: Partial<CustomExpense>) => void;
  removeCustomExpense: (dayId: string, expenseId: string) => void;
}

const DayCard: React.FC<DayCardProps> = ({
  day,
  onAddLocation,
  onRemoveLocation,
  onUpdateLocation,
  onUpdateNotes,
  currency,
  addCustomExpense,
  updateCustomExpense,
  removeCustomExpense
}) => {
  const [showAddLocation, setShowAddLocation] = useState(false);
  
  // Use timezone-safe formatting for day date
  const formattedDate = formatDateWithoutTimezoneAdjustment(day.date);
  
  // Get day of week without timezone issues
  const getDayOfWeek = (dateString: string) => {
    if (dateString.includes('-')) {
      const [year, month, day] = dateString.split('-').map(Number);
      // JavaScript months are 0-indexed
      const date = new Date(year, month - 1, day);
      return date.toLocaleDateString('en-US', { weekday: 'long' });
    }
    return new Date(dateString).toLocaleDateString('en-US', { weekday: 'long' });
  };
  
  const dayOfWeek = getDayOfWeek(day.date);
  const formattedDayDate = `${dayOfWeek}, ${formattedDate}`;
  
  const totalDayBudget = Object.values(day.budget).reduce((sum: number, value: number) => sum + value, 0);
  
  // Debug log for date formatting
  console.log('Day date:', day.date, 'Formatted as:', formattedDayDate);
  
  return (
    <div className="border rounded-lg shadow-sm overflow-hidden">
      <div className="bg-blue-50 p-4 flex justify-between items-center">
        <div>
          <h3 className="font-bold">Day {day.dayNumber}: {formattedDayDate}</h3>
          <p className="text-sm text-gray-600 mt-1">
            {day.locations.length} locations planned
          </p>
        </div>
        <div className="text-right">
          <p className="font-semibold text-green-600">
            {currency === 'JPY' ? '¥' : '$'}{totalDayBudget.toLocaleString()}
          </p>
          <button
            onClick={() => setShowAddLocation(!showAddLocation)}
            className="mt-2 px-3 py-1 text-xs bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-150"
          >
            {showAddLocation ? 'Cancel' : 'Add Location'}
          </button>
        </div>
      </div>
      
      <div className="p-4">
        {showAddLocation && (
          <div className="mb-4 p-3 border border-blue-200 rounded-md bg-blue-50">
            <h4 className="font-semibold mb-2">Add Location From Map</h4>
            <p className="text-sm text-gray-600 mb-3">
              From the map page, save a location and then add it to your plan from the saved locations menu.
            </p>
            <div className="flex justify-between">
              <Link
                href="/"
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-150"
              >
                Go to Map
              </Link>
              <button
                onClick={() => setShowAddLocation(false)}
                className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition duration-150"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
        
        <div className="mb-4">
          <label htmlFor={`day-notes-${day.id}`} className="block text-sm font-medium text-gray-600 mb-1">
            Day Notes
          </label>
          <textarea
            id={`day-notes-${day.id}`}
            value={day.notes || ''}
            onChange={(e) => onUpdateNotes(day.id, e.target.value)}
            placeholder="Add notes for this day..."
            className="w-full h-16 p-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        
        {day.locations.length > 0 ? (
          <div className="space-y-3">
            {day.locations.map((location) => (
              <LocationCard
                key={location.id}
                location={location}
                dayId={day.id}
                onRemove={onRemoveLocation}
                onUpdate={onUpdateLocation}
                currency={currency}
              />
            ))}
          </div>
        ) : (
          <div className="py-4 text-center text-gray-500 italic">
            No locations planned for this day
          </div>
        )}
        
        {/* Custom Expenses Section */}
        <CustomExpensesSection
          expenses={day.customExpenses}
          dayId={day.id}
          onAddExpense={(dayId, expense) => {
            // Set the date to the current day's date
            const expenseWithDate = {
              ...expense,
              date: day.date
            };
            addCustomExpense(dayId, expenseWithDate);
          }}
          onUpdateExpense={updateCustomExpense}
          onRemoveExpense={removeCustomExpense}
          currency={currency}
        />
      </div>
    </div>
  );
};

interface LocationCardProps {
  location: ScheduledLocation;
  dayId: string;
  onRemove: (dayId: string, locationId: string) => void;
  onUpdate: (dayId: string, locationId: string, updates: Partial<ScheduledLocation>) => void;
  currency: string;
}

const LocationCard: React.FC<LocationCardProps> = ({
  location,
  dayId,
  onRemove,
  onUpdate,
  currency
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedLocation, setEditedLocation] = useState(location);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'budget') {
      setEditedLocation({
        ...editedLocation,
        [name]: parseFloat(value) || 0
      });
    } else {
      setEditedLocation({
        ...editedLocation,
        [name]: value
      });
    }
  };
  
  const handleSave = () => {
    onUpdate(dayId, location.id, editedLocation);
    setIsEditing(false);
  };
  
  const handleCancel = () => {
    setEditedLocation(location);
    setIsEditing(false);
  };
  
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'accommodation':
        return '🏨';
      case 'food':
        return '🍴';
      case 'activities':
        return '🎭';
      case 'transportation':
        return '🚆';
      case 'shopping':
        return '🛍️';
      default:
        return '📌';
    }
  };
  
  return (
    <div className="border rounded-md p-3 hover:bg-gray-50">
      {!isEditing ? (
        <>
          <div className="flex justify-between items-start">
            <div className="flex items-start space-x-2">
              <div className="text-xl">{getCategoryIcon(location.category)}</div>
              <div>
                <h4 className="font-semibold">{location.poi.name}</h4>
                <p className="text-xs text-gray-500">{location.poi.address}</p>
                
                {location.timeSlot?.startTime && (
                  <p className="text-xs mt-1">
                    ⏰ {location.timeSlot.startTime}
                    {location.timeSlot.endTime && ` - ${location.timeSlot.endTime}`}
                  </p>
                )}
                
                {location.notes && (
                  <p className="text-sm mt-1 italic bg-gray-50 p-1 rounded">
                    {location.notes}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex flex-col items-end">
              <span className="font-semibold text-green-600">
                {currency === 'JPY' ? '¥' : '$'}{location.budget.toLocaleString()}
              </span>
              <div className="mt-1 space-x-1">
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                >
                  Edit
                </button>
                <button
                  onClick={() => onRemove(dayId, location.id)}
                  className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
          
          {location.stayMultipleDays && (
            <div className="mt-2 text-xs bg-blue-50 p-1 rounded text-blue-700">
              Multi-day stay until {formatDateWithoutTimezoneAdjustment(location.stayEndDate || '')}
            </div>
          )}
        </>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Category
              </label>
              <select
                name="category"
                value={editedLocation.category}
                onChange={handleChange}
                className="w-full p-2 text-sm border border-gray-200 rounded-md"
              >
                <option value="accommodation">Accommodation</option>
                <option value="food">Food</option>
                <option value="activities">Activities</option>
                <option value="transportation">Transportation</option>
                <option value="shopping">Shopping</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Budget
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 text-sm border border-r-0 border-gray-300 bg-gray-50 text-gray-500 rounded-l-md">
                  {currency === 'JPY' ? '¥' : '$'}
                </span>
                <input
                  type="number"
                  name="budget"
                  value={editedLocation.budget}
                  onChange={handleChange}
                  className="w-full p-2 text-sm border border-gray-200 rounded-r-md"
                />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Start Time
              </label>
              <input
                type="time"
                name="startTime"
                value={editedLocation.timeSlot?.startTime || ''}
                onChange={(e) => setEditedLocation({
                  ...editedLocation,
                  timeSlot: {
                    ...editedLocation.timeSlot,
                    startTime: e.target.value
                  }
                })}
                className="w-full p-2 text-sm border border-gray-200 rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                End Time
              </label>
              <input
                type="time"
                name="endTime"
                value={editedLocation.timeSlot?.endTime || ''}
                onChange={(e) => setEditedLocation({
                  ...editedLocation,
                  timeSlot: {
                    ...editedLocation.timeSlot,
                    endTime: e.target.value
                  }
                })}
                className="w-full p-2 text-sm border border-gray-200 rounded-md"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Notes
            </label>
            <textarea
              name="notes"
              value={editedLocation.notes || ''}
              onChange={handleChange}
              className="w-full p-2 text-sm border border-gray-200 rounded-md"
              rows={2}
            />
          </div>
          
          {editedLocation.category === 'accommodation' && (
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={`multi-day-${location.id}`}
                checked={editedLocation.stayMultipleDays || false}
                onChange={(e) => setEditedLocation({
                  ...editedLocation,
                  stayMultipleDays: e.target.checked
                })}
                className="h-4 w-4 text-blue-600 rounded border-gray-300"
              />
              <label htmlFor={`multi-day-${location.id}`} className="text-xs text-gray-700">
                Multi-day stay
              </label>
              
              {editedLocation.stayMultipleDays && (
                <input
                  type="date"
                  value={editedLocation.stayEndDate || ''}
                  onChange={(e) => {
                    console.log(`Setting stay end date to: ${e.target.value}`);
                    setEditedLocation({
                      ...editedLocation,
                      stayEndDate: e.target.value
                    });
                  }}
                  className="ml-2 p-1 text-xs border border-gray-200 rounded"
                />
              )}
            </div>
          )}
          
          <div className="flex justify-end space-x-2 mt-3">
            <button
              onClick={handleCancel}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TripPlanner; 