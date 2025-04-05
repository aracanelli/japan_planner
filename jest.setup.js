import '@testing-library/jest-dom';

// Mock localStorage and sessionStorage
const localStorageMock = (function() {
  let store = {};
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn(key => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    })
  };
})();

const sessionStorageMock = (function() {
  let store = {};
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn(key => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    })
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });
Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock });

// Mock Google Maps API
class MockLatLng {
  constructor(lat, lng) {
    this.lat = lat;
    this.lng = lng;
  }
  
  lat() { return this.lat; }
  lng() { return this.lng; }
}

window.google = {
  maps: {
    LatLng: MockLatLng,
    places: {
      AutocompleteService: jest.fn(() => ({
        getPlacePredictions: jest.fn()
      })),
      PlacesService: jest.fn(() => ({
        getDetails: jest.fn(),
        textSearch: jest.fn()
      }))
    },
    DirectionsService: jest.fn(() => ({
      route: jest.fn()
    })),
    TravelMode: {
      DRIVING: 'DRIVING',
      WALKING: 'WALKING',
      TRANSIT: 'TRANSIT'
    }
  }
};

// Suppress console errors during tests
const originalConsoleError = console.error;
console.error = jest.fn((...args) => {
  if (
    args[0]?.includes?.('Warning:') ||
    args[0]?.includes?.('Error:') ||
    args[0]?.includes?.('Failed prop type')
  ) {
    return;
  }
  originalConsoleError(...args);
}); 