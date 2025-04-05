import { useState, useEffect, useCallback } from 'react';
import { TripPlan, TripDay, ScheduledLocation, PointOfInterest, CustomExpense } from '../types';
import { v4 as uuidv4 } from 'uuid';

// Define type for budget categories
type BudgetCategory = 'accommodation' | 'food' | 'activities' | 'transportation' | 'shopping' | 'other';

// Type for budget structure
interface Budget {
  accommodation: number;
  food: number;
  activities: number;
  transportation: number;
  shopping: number;
  other: number;
}

// Default budget categories
const DEFAULT_BUDGET: Budget = {
  accommodation: 0,
  food: 0,
  activities: 0,
  transportation: 0,
  shopping: 0,
  other: 0
};

// Helper to create a new empty day
const createEmptyDay = (date: string, dayNumber: number): TripDay => ({
  id: uuidv4(),
  date,
  dayNumber,
  locations: [],
  customExpenses: [],
  budget: { ...DEFAULT_BUDGET },
  notes: '',
});

// Helper to create an empty trip
const createEmptyTrip = (name: string, startDate: string, endDate: string): TripPlan => {
  console.log(`Creating trip with dates: ${startDate} to ${endDate}`);
  
  // Parse dates without timezone adjustments
  const start = parseLocalDate(startDate);
  const end = parseLocalDate(endDate);
  
  // Log the calculated dates
  console.log(`Parsed start date: ${start.toISOString()}`);
  console.log(`Parsed end date: ${end.toISOString()}`);
  
  const days: TripDay[] = [];
  let dayNumber = 1;
  
  // Create a new date object to avoid modifying the original
  let currentDate = new Date(start.getTime());
  
  // Force time to midnight to avoid any time-of-day issues
  currentDate.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  
  // Ensure end date is inclusive
  const endTime = end.getTime() + (24 * 60 * 60 * 1000 - 1); // Add almost 24 hours
  
  while (currentDate.getTime() <= endTime) {
    // Format date as YYYY-MM-DD to avoid timezone issues
    const dateString = formatDateYYYYMMDD(currentDate);
    console.log(`Creating day ${dayNumber}: ${dateString}`);
    
    days.push(createEmptyDay(dateString, dayNumber));
    
    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
    dayNumber++;
  }
  
  // Use the formatted YYYY-MM-DD strings for consistency
  const formattedStartDate = formatDateYYYYMMDD(start);
  const formattedEndDate = formatDateYYYYMMDD(end);
  
  console.log(`Created trip with ${days.length} days from ${formattedStartDate} to ${formattedEndDate}`);
  
  return {
    id: uuidv4(),
    name,
    startDate: formattedStartDate,
    endDate: formattedEndDate,
    days,
    currency: 'JPY',
    notes: '',
  };
};

// Parse a date string as a local date without timezone adjustments
const parseLocalDate = (dateString: string): Date => {
  // For input date strings like "2023-08-15" from date picker
  if (!dateString) {
    console.error('Invalid date string provided to parseLocalDate:', dateString);
    return new Date(); // Return current date as fallback
  }
  
  try {
    // Handle YYYY-MM-DD format from HTML date inputs
    if (dateString.includes('-')) {
      const [year, month, day] = dateString.split('-').map(Number);
      
      // Ensure we have valid numbers
      if (isNaN(year) || isNaN(month) || isNaN(day)) {
        throw new Error(`Invalid date components: year=${year}, month=${month}, day=${day}`);
      }
      
      // Month is 0-indexed in JavaScript Date
      const date = new Date(year, month - 1, day);
      
      // Log for debugging
      console.log(`Parsed date: ${dateString} -> ${date.toISOString().split('T')[0]}`);
      
      return date;
    }
    
    // Fallback to standard Date parsing with timezone correction
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date format');
    }
    
    // Correct for timezone
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() + userTimezoneOffset);
  } catch (e) {
    console.error('Error parsing date:', e, dateString);
    return new Date(); // Return current date as fallback
  }
};

// Format a date as YYYY-MM-DD string
const formatDateYYYYMMDD = (date: Date): string => {
  try {
    if (!date || isNaN(date.getTime())) {
      throw new Error('Invalid date object');
    }
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    const formatted = `${year}-${month}-${day}`;
    console.log(`Formatted date: ${date.toString()} -> ${formatted}`);
    
    return formatted;
  } catch (e) {
    console.error('Error formatting date as YYYY-MM-DD:', e, date);
    // Return current date as fallback
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }
};

// Helper to determine location category from POI type
const determineCategoryFromPOI = (poi: PointOfInterest): 'accommodation' | 'food' | 'activities' | 'transportation' | 'shopping' | 'other' => {
  const types = poi.types || [];
  
  if (types.some(t => ['lodging', 'hotel', 'guest_house'].includes(t))) {
    return 'accommodation';
  }
  
  if (types.some(t => ['restaurant', 'cafe', 'food', 'bakery', 'meal_takeaway'].includes(t))) {
    return 'food';
  }
  
  if (types.some(t => ['tourist_attraction', 'museum', 'zoo', 'aquarium', 'amusement_park', 'temple', 'shrine', 'park'].includes(t))) {
    return 'activities';
  }
  
  if (types.some(t => ['train_station', 'subway_station', 'bus_station', 'airport'].includes(t))) {
    return 'transportation';
  }
  
  if (types.some(t => ['shopping_mall', 'store', 'shop', 'market'].includes(t))) {
    return 'shopping';
  }
  
  return 'other';
};

// Helper to estimate budget from POI
const estimateBudgetFromPOI = (poi: PointOfInterest, category: 'accommodation' | 'food' | 'activities' | 'transportation' | 'shopping' | 'other'): number => {
  if (!poi.price) return 0;
  
  if (category === 'accommodation' && poi.price.value) {
    return poi.price.value;
  }
  
  if (category === 'activities' && poi.price.entranceFee) {
    return poi.price.entranceFee;
  }
  
  if (category === 'food' && poi.price.value) {
    return poi.price.value;
  }
  
  // Default values based on category
  if (poi.price.value) {
    return poi.price.value;
  }
  
  return 0;
};

export const useTripPlanner = () => {
  const [allTrips, setAllTrips] = useState<TripPlan[]>([]);
  const [currentTripId, setCurrentTripId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Get the current trip
  const currentTrip = currentTripId 
    ? allTrips.find(trip => trip.id === currentTripId) || null
    : null;
  
  // Load all trips data from localStorage on initial render
  useEffect(() => {
    const loadTripsData = () => {
      setIsLoading(true);
      try {
        // Load all trips
        const savedTrips = localStorage.getItem('japan_trip_plans');
        if (savedTrips) {
          const parsedTrips = JSON.parse(savedTrips);
          setAllTrips(parsedTrips);
          
          // Load current trip ID
          const activeTrip = localStorage.getItem('japan_active_trip_id');
          if (activeTrip) {
            setCurrentTripId(activeTrip);
          } else if (parsedTrips.length > 0) {
            // Default to first trip if no active trip is set
            setCurrentTripId(parsedTrips[0].id);
          }
        }
      } catch (error) {
        console.error('Error loading trip plans:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadTripsData();
  }, []);
  
  // Save all trips data to localStorage whenever it changes
  useEffect(() => {
    if (allTrips.length > 0) {
      localStorage.setItem('japan_trip_plans', JSON.stringify(allTrips));
    }
  }, [allTrips]);
  
  // Save current trip ID to localStorage whenever it changes
  useEffect(() => {
    if (currentTripId) {
      localStorage.setItem('japan_active_trip_id', currentTripId);
    }
  }, [currentTripId]);
  
  // Create a new trip plan
  const createTrip = useCallback((name: string, startDate: string, endDate: string) => {
    const newTrip = createEmptyTrip(name, startDate, endDate);
    setAllTrips(prevTrips => [...prevTrips, newTrip]);
    setCurrentTripId(newTrip.id);
    return newTrip;
  }, []);
  
  // List all trips
  const getAllTrips = useCallback(() => {
    return allTrips;
  }, [allTrips]);
  
  // Switch to a different trip
  const switchTrip = useCallback((tripId: string) => {
    if (allTrips.some(trip => trip.id === tripId)) {
      setCurrentTripId(tripId);
      return true;
    }
    return false;
  }, [allTrips]);
  
  // Delete a trip
  const deleteTrip = useCallback((tripId: string) => {
    setAllTrips(prevTrips => {
      const newTrips = prevTrips.filter(trip => trip.id !== tripId);
      
      // If we're deleting the current trip, switch to the first available or null
      if (tripId === currentTripId) {
        if (newTrips.length > 0) {
          setCurrentTripId(newTrips[0].id);
        } else {
          setCurrentTripId(null);
          localStorage.removeItem('japan_active_trip_id');
        }
      }
      
      // If we've deleted all trips, remove from localStorage
      if (newTrips.length === 0) {
        localStorage.removeItem('japan_trip_plans');
      }
      
      return newTrips;
    });
  }, [currentTripId]);
  
  // Update trip details (name, dates, etc.)
  const updateTripDetails = useCallback((details: Partial<TripPlan>) => {
    if (!currentTripId) return;
    
    setAllTrips(prevTrips => {
      return prevTrips.map(trip => {
        if (trip.id === currentTripId) {
          const updatedTrip = { ...trip, ...details };
          
          // If start or end date changed, we need to regenerate the days
          if ((details.startDate && details.startDate !== trip.startDate) || 
              (details.endDate && details.endDate !== trip.endDate)) {
            
            const start = details.startDate ? parseLocalDate(details.startDate) : parseLocalDate(trip.startDate);
            const end = details.endDate ? parseLocalDate(details.endDate) : parseLocalDate(trip.endDate);
            
            // Keep track of existing day data by date
            const existingDaysByDate = trip.days.reduce((acc, day) => {
              acc[day.date] = day;
              return acc;
            }, {} as Record<string, TripDay>);
            
            const newDays: TripDay[] = [];
            let dayNumber = 1;
            let currentDate = new Date(start);
            
            // Create days for the new date range
            while (currentDate <= end) {
              const dateString = formatDateYYYYMMDD(currentDate);
              
              // Check if we have existing data for this date
              if (existingDaysByDate[dateString]) {
                const existingDay = existingDaysByDate[dateString];
                newDays.push({
                  ...existingDay,
                  dayNumber: dayNumber,
                });
              } else {
                // Create a new empty day
                newDays.push(createEmptyDay(dateString, dayNumber));
              }
              
              currentDate.setDate(currentDate.getDate() + 1);
              dayNumber++;
            }
            
            return {
              ...updatedTrip,
              startDate: formatDateYYYYMMDD(start),
              endDate: formatDateYYYYMMDD(end),
              days: newDays
            };
          }
          
          return updatedTrip;
        }
        return trip;
      });
    });
  }, [currentTripId]);
  
  // Duplicate an existing trip
  const duplicateTrip = useCallback((tripId: string, newName?: string) => {
    const tripToDuplicate = allTrips.find(trip => trip.id === tripId);
    if (!tripToDuplicate) return;
    
    const duplicatedTrip: TripPlan = {
      ...JSON.parse(JSON.stringify(tripToDuplicate)), // Deep clone
      id: uuidv4(),
      name: newName || `${tripToDuplicate.name} (Copy)`,
    };
    
    setAllTrips(prevTrips => [...prevTrips, duplicatedTrip]);
    setCurrentTripId(duplicatedTrip.id);
    return duplicatedTrip;
  }, [allTrips]);
  
  // Add a location to a specific day
  const addLocationToDay = useCallback((dayId: string, poi: PointOfInterest, options?: Partial<ScheduledLocation>) => {
    if (!currentTripId) return;
    
    const category = options?.category || determineCategoryFromPOI(poi);
    const budget = options?.budget || estimateBudgetFromPOI(poi, category);
    
    const newLocation: ScheduledLocation = {
      id: uuidv4(),
      poi,
      category,
      budget,
      ...(options || {})
    };
    
    setAllTrips(prevTrips => {
      return prevTrips.map(trip => {
        if (trip.id === currentTripId) {
          return {
            ...trip,
            days: trip.days.map(day => {
              if (day.id === dayId) {
                const budgetCategory = category as keyof Budget;
                return {
                  ...day,
                  locations: [...day.locations, newLocation],
                  budget: {
                    ...day.budget,
                    [budgetCategory]: day.budget[budgetCategory] + budget
                  }
                };
              }
              return day;
            })
          };
        }
        return trip;
      });
    });
    
    return newLocation;
  }, [currentTripId]);
  
  // Remove a location from a day
  const removeLocationFromDay = useCallback((dayId: string, locationId: string) => {
    if (!currentTripId) return;
    
    setAllTrips(prevTrips => {
      return prevTrips.map(trip => {
        if (trip.id === currentTripId) {
          return {
            ...trip,
            days: trip.days.map(day => {
              if (day.id === dayId) {
                const locationToRemove = day.locations.find(loc => loc.id === locationId);
                
                if (locationToRemove) {
                  const budgetCategory = locationToRemove.category as keyof Budget;
                  return {
                    ...day,
                    locations: day.locations.filter(loc => loc.id !== locationId),
                    budget: {
                      ...day.budget,
                      [budgetCategory]: 
                        Math.max(0, day.budget[budgetCategory] - locationToRemove.budget)
                    }
                  };
                }
              }
              return day;
            })
          };
        }
        return trip;
      });
    });
  }, [currentTripId]);
  
  // Add a location to multiple days (for accommodations)
  const addMultiDayAccommodation = useCallback((
    poi: PointOfInterest, 
    startDateStr: string, 
    endDateStr: string,
    budget: number = 0
  ) => {
    if (!currentTripId || !currentTrip) return;
    
    // Parse dates correctly without timezone issues
    const startDate = parseLocalDate(startDateStr);
    const endDate = parseLocalDate(endDateStr);
    
    // Get all days in the date range
    const daysInRange = currentTrip.days.filter(day => {
      const dayDate = parseLocalDate(day.date);
      return dayDate >= startDate && dayDate <= endDate;
    });
    
    // If no days in range, return early
    if (daysInRange.length === 0) return;
    
    const firstDay = daysInRange[0];
    const lastDay = daysInRange[daysInRange.length - 1];
    
    // Calculate daily budget (divide total by number of days)
    const dailyBudget = budget / daysInRange.length;
    
    setAllTrips(prevTrips => {
      return prevTrips.map(trip => {
        if (trip.id === currentTripId) {
          // Clone days to avoid mutation
          const updatedDays = [...trip.days];
          
          // Create a location for the first day with multi-day marker
          const firstDayLocation: ScheduledLocation = {
            id: uuidv4(),
            poi,
            category: 'accommodation',
            budget: dailyBudget,
            stayMultipleDays: true,
            stayEndDate: formatDateYYYYMMDD(endDate),
            timeSlot: {},
            notes: ''
          };
          
          // Find and update days
          daysInRange.forEach(day => {
            const dayIndex = updatedDays.findIndex(d => d.id === day.id);
            if (dayIndex === -1) return;
            
            const updatedDay = { ...updatedDays[dayIndex] };
            
            // For the first day, add the location with multi-day info
            if (day.id === firstDay.id) {
              updatedDay.locations = [...updatedDay.locations, firstDayLocation];
            } 
            // For all days, update the budget
            updatedDay.budget = {
              ...updatedDay.budget,
              accommodation: updatedDay.budget.accommodation + dailyBudget
            };
            
            updatedDays[dayIndex] = updatedDay;
          });
          
          return {
            ...trip,
            days: updatedDays
          };
        }
        return trip;
      });
    });
  }, [currentTripId, currentTrip]);
  
  // Update a scheduled location
  const updateScheduledLocation = useCallback((dayId: string, locationId: string, updates: Partial<ScheduledLocation>) => {
    if (!currentTripId) return;
    
    setAllTrips(prevTrips => {
      return prevTrips.map(trip => {
        if (trip.id === currentTripId) {
          return {
            ...trip,
            days: trip.days.map(day => {
              if (day.id === dayId) {
                const locationIndex = day.locations.findIndex(loc => loc.id === locationId);
                
                if (locationIndex !== -1) {
                  const oldLocation = day.locations[locationIndex];
                  const newLocation = { ...oldLocation, ...updates };
                  
                  // Calculate budget difference
                  const budgetDiff = 
                    (updates.budget !== undefined) ? updates.budget - oldLocation.budget : 0;
                  
                  // Calculate category difference
                  const categoryChanged = updates.category && updates.category !== oldLocation.category;
                  
                  const updatedLocations = [...day.locations];
                  updatedLocations[locationIndex] = newLocation;
                  
                  const updatedBudget = { ...day.budget };
                  
                  if (categoryChanged && updates.category) {
                    // Remove from old category, add to new category
                    const oldCategory = oldLocation.category as keyof Budget;
                    const newCategory = updates.category as keyof Budget;
                    updatedBudget[oldCategory] -= oldLocation.budget;
                    updatedBudget[newCategory] += newLocation.budget;
                  } else if (budgetDiff !== 0) {
                    // Just update the budget for the same category
                    const category = oldLocation.category as keyof Budget;
                    updatedBudget[category] += budgetDiff;
                  }
                  
                  return {
                    ...day,
                    locations: updatedLocations,
                    budget: updatedBudget
                  };
                }
              }
              return day;
            })
          };
        }
        return trip;
      });
    });
  }, [currentTripId]);
  
  // Update notes for a day
  const updateDayNotes = useCallback((dayId: string, notes: string) => {
    if (!currentTripId) return;
    
    setAllTrips(prevTrips => {
      return prevTrips.map(trip => {
        if (trip.id === currentTripId) {
          return {
            ...trip,
            days: trip.days.map(day => 
              day.id === dayId ? { ...day, notes } : day
            )
          };
        }
        return trip;
      });
    });
  }, [currentTripId]);
  
  // Calculate total budget for the trip
  const getTotalBudget = useCallback(() => {
    if (!currentTrip) return DEFAULT_BUDGET;
    
    return currentTrip.days.reduce((total, day) => {
      Object.keys(day.budget).forEach(category => {
        const budgetCategory = category as keyof Budget;
        total[budgetCategory] += day.budget[budgetCategory];
      });
      return total;
    }, { ...DEFAULT_BUDGET });
  }, [currentTrip]);
  
  // Reset the trip planner completely
  const resetTripPlanner = useCallback(() => {
    localStorage.removeItem('japan_trip_plans');
    localStorage.removeItem('japan_active_trip_id');
    setAllTrips([]);
    setCurrentTripId(null);
  }, []);
  
  // Add a custom expense to a specific day
  const addCustomExpense = useCallback((dayId: string, expense: Omit<CustomExpense, 'id'>) => {
    if (!currentTrip) return null;
    
    const newExpense: CustomExpense = {
      ...expense,
      id: uuidv4()
    };
    
    setAllTrips(prevTrips => {
      return prevTrips.map(trip => {
        if (trip.id !== currentTripId) return trip;
        
        return {
          ...trip,
          days: trip.days.map(day => {
            if (day.id !== dayId) return day;
            
            // Add expense to day and update budget
            const newExpenses = [...day.customExpenses, newExpense];
            const newBudget = { ...day.budget };
            
            // Update budget category
            newBudget[newExpense.category] = (newBudget[newExpense.category] || 0) + newExpense.amount;
            
            return {
              ...day,
              customExpenses: newExpenses,
              budget: newBudget
            };
          })
        };
      });
    });
    
    return newExpense;
  }, [currentTrip, currentTripId]);
  
  // Update a custom expense
  const updateCustomExpense = useCallback((dayId: string, expenseId: string, updates: Partial<CustomExpense>) => {
    if (!currentTrip) return false;
    
    setAllTrips(prevTrips => {
      return prevTrips.map(trip => {
        if (trip.id !== currentTripId) return trip;
        
        return {
          ...trip,
          days: trip.days.map(day => {
            if (day.id !== dayId) return day;
            
            const expenseIndex = day.customExpenses.findIndex(e => e.id === expenseId);
            if (expenseIndex === -1) return day;
            
            const oldExpense = day.customExpenses[expenseIndex];
            const updatedExpense = { ...oldExpense, ...updates };
            const newExpenses = [...day.customExpenses];
            newExpenses[expenseIndex] = updatedExpense;
            
            // Recalculate budget if amount or category changed
            const newBudget = { ...day.budget };
            
            if (updates.amount !== undefined || updates.category !== undefined) {
              // Remove old expense from budget
              newBudget[oldExpense.category] = Math.max(0, (newBudget[oldExpense.category] || 0) - oldExpense.amount);
              
              // Add updated expense to budget
              const category = updates.category || oldExpense.category;
              const amount = updates.amount !== undefined ? updates.amount : oldExpense.amount;
              newBudget[category] = (newBudget[category] || 0) + amount;
            }
            
            return {
              ...day,
              customExpenses: newExpenses,
              budget: newBudget
            };
          })
        };
      });
    });
    
    return true;
  }, [currentTrip, currentTripId]);
  
  // Remove a custom expense
  const removeCustomExpense = useCallback((dayId: string, expenseId: string) => {
    if (!currentTrip) return false;
    
    setAllTrips(prevTrips => {
      return prevTrips.map(trip => {
        if (trip.id !== currentTripId) return trip;
        
        return {
          ...trip,
          days: trip.days.map(day => {
            if (day.id !== dayId) return day;
            
            const expense = day.customExpenses.find(e => e.id === expenseId);
            if (!expense) return day;
            
            // Update budget
            const newBudget = { ...day.budget };
            newBudget[expense.category] = Math.max(0, (newBudget[expense.category] || 0) - expense.amount);
            
            return {
              ...day,
              customExpenses: day.customExpenses.filter(e => e.id !== expenseId),
              budget: newBudget
            };
          })
        };
      });
    });
    
    return true;
  }, [currentTrip, currentTripId]);
  
  // Get custom expenses by category
  const getCustomExpensesByCategory = useCallback(() => {
    if (!currentTrip) return {};
    
    const categories: Record<BudgetCategory, CustomExpense[]> = {
      accommodation: [],
      food: [],
      activities: [],
      transportation: [],
      shopping: [],
      other: []
    };
    
    currentTrip.days.forEach(day => {
      day.customExpenses.forEach(expense => {
        categories[expense.category].push(expense);
      });
    });
    
    return categories;
  }, [currentTrip]);
  
  // Get total expenses by category
  const getTotalExpensesByCategory = useCallback(() => {
    if (!currentTrip) return DEFAULT_BUDGET;
    
    const totals = { ...DEFAULT_BUDGET };
    
    currentTrip.days.forEach(day => {
      // Add scheduled location expenses
      day.locations.forEach(location => {
        totals[location.category] += location.budget;
      });
      
      // Add custom expenses
      day.customExpenses.forEach(expense => {
        totals[expense.category] += expense.amount;
      });
    });
    
    return totals;
  }, [currentTrip]);
  
  return {
    tripPlan: currentTrip,
    allTrips,
    isLoading,
    createTrip,
    getAllTrips,
    switchTrip,
    deleteTrip,
    duplicateTrip,
    updateTripDetails,
    addLocationToDay,
    removeLocationFromDay,
    addMultiDayAccommodation,
    updateScheduledLocation,
    updateDayNotes,
    getTotalBudget,
    resetTripPlanner,
    addCustomExpense,
    updateCustomExpense,
    removeCustomExpense,
    getCustomExpensesByCategory,
    getTotalExpensesByCategory
  };
}; 