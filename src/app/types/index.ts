export interface PointOfInterest {
  id: string;
  name: string;
  address: string;
  position: {
    lat: number;
    lng: number;
  };
  placeId: string;
  types: string[];
  price?: {
    level?: number;
    value?: number;
    currency?: string;
    range?: {
      min?: number;
      max?: number;
    };
    description?: string;
    formattedPrice?: string;
    ticketInfo?: string;
    entranceFee?: number;
    source?: string;
  };
  rating?: number;
  openingHours?: string[];
  photos?: string[];
  website?: string;
  phoneNumber?: string;
  additionalInfo?: {
    accessibility?: string;
    bestTimeToVisit?: string;
    estimatedDuration?: string;
    popularTimes?: { day: string; busy: number[] }[];
  };
}

export interface MapPin extends PointOfInterest {
  isSelected: boolean;
  notes?: string;
  isStation?: boolean;
}

export type TravelMode = 'WALKING' | 'DRIVING' | 'TRANSIT';

export interface RouteInfo {
  distance: string;
  duration: string;
  mode: TravelMode;
}

export interface SearchResult {
  places: PointOfInterest[];
  nextPageToken?: string;
}

export interface SavedLocation {
  id: string;
  name: string;
  pins: PointOfInterest[];
}

// New interface for custom expenses
export interface CustomExpense {
  id: string;
  name: string;
  amount: number;
  category: 'accommodation' | 'food' | 'activities' | 'transportation' | 'shopping' | 'other';
  date: string; // ISO format date string
  notes?: string;
  isPaid?: boolean;
}

// New types for trip planner functionality
export interface TripDay {
  id: string;
  date: string;  // ISO format date string
  dayNumber: number;
  locations: ScheduledLocation[];
  customExpenses: CustomExpense[]; // New field for custom expenses
  notes?: string;
  weather?: {
    condition?: string;
    temperature?: number;
    icon?: string;
  };
  budget: {
    accommodation: number;
    food: number;
    activities: number;
    transportation: number;
    shopping: number;
    other: number;
  };
}

export interface ScheduledLocation {
  id: string;
  poi: PointOfInterest;
  timeSlot?: {
    startTime?: string; // "HH:MM" format
    endTime?: string;   // "HH:MM" format
  };
  category: 'accommodation' | 'food' | 'activities' | 'transportation' | 'shopping' | 'other';
  stayMultipleDays?: boolean;
  stayEndDate?: string; // ISO format date string for multi-day stays
  budget: number;
  notes?: string;
  isCompleted?: boolean;
}

export interface TripPlan {
  id: string;
  name: string;
  startDate: string; // ISO format date string
  endDate: string;   // ISO format date string
  days: TripDay[];
  currency: string;
  totalBudget?: number;
  notes?: string;
} 