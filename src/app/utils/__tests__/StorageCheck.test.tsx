import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import StorageCheck from '../../components/StorageCheck';
import { MapPin } from '../../types';

describe('StorageCheck Component', () => {
  const mockPin1: MapPin = {
    id: '1',
    name: 'Tokyo Tower',
    address: 'Tokyo',
    position: { lat: 35.6586, lng: 139.7454 },
    isSelected: false,
    types: ['tourist_attraction'],
    placeId: 'abc123',
  };
  
  const mockPin2: MapPin = {
    id: '2',
    name: 'Sushi Restaurant',
    address: 'Tokyo',
    position: { lat: 35.6721, lng: 139.7636 },
    isSelected: false,
    types: ['restaurant'],
    placeId: 'def456',
  };
  
  const stationPin: MapPin = {
    id: '3',
    name: 'Tokyo Station',
    address: 'Tokyo',
    position: { lat: 35.6809, lng: 139.7671 },
    isSelected: false,
    types: ['train_station'],
    placeId: 'ghi789',
    isStation: true,
  };
  
  const mockOnResetData = jest.fn();
  
  beforeEach(() => {
    // Clear localStorage and any mock calls before each test
    localStorage.clear();
    mockOnResetData.mockClear();
  });
  
  it('should not display modal when no pins in localStorage', () => {
    render(<StorageCheck displayPins={[mockPin1, mockPin2]} onResetData={mockOnResetData} />);
    
    // Modal should not be displayed
    expect(screen.queryByText('Fix Saved Locations')).not.toBeInTheDocument();
  });
  
  it('should not display modal when localStorage pins match display pins', () => {
    // Set localStorage with the same pins as display pins
    localStorage.setItem('japan-planner-pins', JSON.stringify([mockPin1, mockPin2]));
    
    render(<StorageCheck displayPins={[mockPin1, mockPin2]} onResetData={mockOnResetData} />);
    
    // Modal should not be displayed
    expect(screen.queryByText('Fix Saved Locations')).not.toBeInTheDocument();
  });
  
  it('should display modal when there are missing pins', () => {
    // Set localStorage with more pins than display pins
    localStorage.setItem('japan-planner-pins', JSON.stringify([mockPin1, mockPin2, {
      id: '4',
      name: 'Missing Pin',
      address: 'Missing Address',
      position: { lat: 35.0, lng: 135.0 },
      isSelected: false,
      types: ['park'],
      placeId: 'jkl012',
    }]));
    
    render(<StorageCheck displayPins={[mockPin1]} onResetData={mockOnResetData} />);
    
    // Modal should be displayed
    expect(screen.getByText('Fix Saved Locations')).toBeInTheDocument();
    expect(screen.getByText(/You have 2 saved locations but only 1 is displayed/)).toBeInTheDocument();
  });
  
  it('should not count station pins as missing pins', () => {
    // Set localStorage with a mixture of regular pins and station pins
    localStorage.setItem('japan-planner-pins', JSON.stringify([mockPin1, stationPin]));
    
    render(<StorageCheck displayPins={[mockPin1]} onResetData={mockOnResetData} />);
    
    // Modal should not be displayed because station pins should be ignored
    expect(screen.queryByText('Fix Saved Locations')).not.toBeInTheDocument();
  });
  
  it('should call onResetData when "Reset All Data" button is clicked', () => {
    // Set localStorage with more pins than display pins to trigger modal
    localStorage.setItem('japan-planner-pins', JSON.stringify([mockPin1, mockPin2]));
    
    render(<StorageCheck displayPins={[mockPin1]} onResetData={mockOnResetData} />);
    
    // Find and click the Reset All Data button
    const resetButton = screen.getByText('Reset All Data');
    fireEvent.click(resetButton);
    
    // Check if the onResetData callback was called
    expect(mockOnResetData).toHaveBeenCalledTimes(1);
  });
  
  it('should call onResetData with the correct pins when fixing data', () => {
    // Set localStorage with more pins than display pins
    localStorage.setItem('japan-planner-pins', JSON.stringify([mockPin1, mockPin2]));
    
    render(<StorageCheck displayPins={[mockPin1]} onResetData={mockOnResetData} />);
    
    // Find and click the Fix button
    const fixButton = screen.getByText('Fix');
    fireEvent.click(fixButton);
    
    // Check if the onResetData callback was called with the display pins
    expect(mockOnResetData).toHaveBeenCalledWith([mockPin1]);
  });
}); 