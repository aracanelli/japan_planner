import { renderHook, act } from '@testing-library/react';
import { useMapPins } from '../useMapPins';
import { MapPin } from '../../types';
import '@testing-library/jest-dom';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = String(value);
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    key: jest.fn((index: number) => Object.keys(store)[index] || null),
    length: jest.fn(() => Object.keys(store).length),
  };
})();

// Mock sessionStorage
const sessionStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = String(value);
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    key: jest.fn((index: number) => Object.keys(store)[index] || null),
    length: jest.fn(() => Object.keys(store).length),
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });
Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock });

describe('useMapPins hook', () => {
  const mockPins: MapPin[] = [
    {
      id: '1',
      name: 'Tokyo Tower',
      address: 'Tokyo',
      position: { lat: 35.6586, lng: 139.7454 },
      isSelected: false,
      types: ['tourist_attraction'],
      placeId: 'abc123',
    },
    {
      id: '2',
      name: 'Sushi Restaurant',
      address: 'Tokyo',
      position: { lat: 35.6721, lng: 139.7636 },
      isSelected: false,
      types: ['restaurant'],
      placeId: 'def456',
      price: {
        value: 5000,
        currency: '¥'
      }
    }
  ];
  
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
  });
  
  it('initializes with empty pins', () => {
    const { result } = renderHook(() => useMapPins());
    expect(result.current.pins).toEqual([]);
  });
  
  it('loads pins from localStorage if available', () => {
    localStorage.setItem('japan-planner-pins', JSON.stringify(mockPins));
    
    const { result } = renderHook(() => useMapPins());
    expect(result.current.pins).toEqual(mockPins);
    expect(localStorage.getItem).toHaveBeenCalledWith('japan-planner-pins');
  });
  
  it('adds a new pin', () => {
    const { result } = renderHook(() => useMapPins());
    
    const newPin: MapPin = {
      id: '3',
      name: 'Kyoto Temple',
      address: 'Kyoto',
      position: { lat: 35.0116, lng: 135.7681 },
      isSelected: false,
      types: ['temple'],
      placeId: 'ghi789'
    };
    
    act(() => {
      result.current.addPin(newPin);
    });
    
    expect(result.current.pins).toEqual([newPin]);
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'japan-planner-pins',
      JSON.stringify([newPin])
    );
  });
  
  it('removes a pin', () => {
    localStorage.setItem('japan-planner-pins', JSON.stringify(mockPins));
    
    const { result } = renderHook(() => useMapPins());
    
    act(() => {
      result.current.removePin('1');
    });
    
    expect(result.current.pins).toEqual([mockPins[1]]);
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'japan-planner-pins',
      JSON.stringify([mockPins[1]])
    );
  });
  
  it('updates a pin', () => {
    localStorage.setItem('japan-planner-pins', JSON.stringify(mockPins));
    
    const { result } = renderHook(() => useMapPins());
    
    const updatedPin: MapPin = {
      ...mockPins[0],
      name: 'Updated Tokyo Tower',
      price: {
        entranceFee: 1000,
        currency: '¥'
      }
    };
    
    act(() => {
      result.current.updatePin(updatedPin);
    });
    
    expect(result.current.pins).toEqual([updatedPin, mockPins[1]]);
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'japan-planner-pins',
      JSON.stringify([updatedPin, mockPins[1]])
    );
  });
  
  it('selects a pin', () => {
    localStorage.setItem('japan-planner-pins', JSON.stringify(mockPins));
    
    const { result } = renderHook(() => useMapPins());
    
    act(() => {
      result.current.togglePinSelection('1');
    });
    
    const expectedPins = [
      { ...mockPins[0], isSelected: true },
      { ...mockPins[1], isSelected: false }
    ];
    
    expect(result.current.pins).toEqual(expectedPins);
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'japan-planner-pins',
      JSON.stringify(expectedPins)
    );
  });
  
  it('clears all pins', () => {
    localStorage.setItem('japan-planner-pins', JSON.stringify(mockPins));
    
    const { result } = renderHook(() => useMapPins());
    
    act(() => {
      result.current.clearPins();
    });
    
    expect(result.current.pins).toEqual([]);
    expect(localStorage.removeItem).toHaveBeenCalledWith('japan-planner-pins');
  });
  
  it('resets pins to a specified array', () => {
    localStorage.setItem('japan-planner-pins', JSON.stringify(mockPins));
    
    const { result } = renderHook(() => useMapPins());
    
    const newPins: MapPin[] = [
      {
        id: '3',
        name: 'Osaka Castle',
        address: 'Osaka',
        position: { lat: 34.6873, lng: 135.5262 },
        isSelected: false,
        types: ['castle'],
        placeId: 'jkl012',
      }
    ];
    
    act(() => {
      result.current.clearPins();
      result.current.addPin(newPins[0]);
    });
    
    expect(result.current.pins).toEqual(newPins);
  });

  it('cleans up temporary station pins', () => {
    // Create pins with one regular pin and one station pin
    const regularPin: MapPin = {
      id: '1',
      name: 'Tokyo Tower',
      address: 'Tokyo',
      position: { lat: 35.6586, lng: 139.7454 },
      isSelected: false,
      types: ['tourist_attraction'],
      placeId: 'abc123',
    };
    
    const stationPin: MapPin = {
      id: 'station-yamanote-tokyo',
      name: 'Tokyo Station (Yamanote Line)',
      address: 'Train Station on Yamanote Line',
      position: { lat: 35.6812, lng: 139.7671 },
      isSelected: false,
      types: ['transit_station', 'train_station'],
      placeId: 'station-yamanote-tokyo',
      isStation: true
    };
    
    // Setup session storage with station position
    sessionStorage.setItem(
      'station-yamanote-tokyo-position', 
      JSON.stringify({ lat: 35.6812, lng: 139.7671 })
    );
    
    // Setup pins array with both regular and station pins
    localStorage.setItem('japan-planner-pins', JSON.stringify([regularPin, stationPin]));
    
    const { result } = renderHook(() => useMapPins());
    
    // Verify both pins are loaded
    expect(result.current.pins).toHaveLength(2);
    
    // Call the cleanup function
    act(() => {
      result.current.cleanupTemporaryPins();
    });
    
    // Verify only the regular pin remains
    expect(result.current.pins).toHaveLength(1);
    expect(result.current.pins[0].id).toBe(regularPin.id);
    
    // Verify session storage item was removed
    expect(sessionStorage.removeItem).toHaveBeenCalledWith('station-yamanote-tokyo-position');
  });
}); 