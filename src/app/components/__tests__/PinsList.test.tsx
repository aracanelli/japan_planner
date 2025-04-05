import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PinsList from '../PinsList';
import { MapPin } from '../../types';

// Mock the ClientOnly component
jest.mock('../ClientOnly', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Sample pins for testing
const mockPins: MapPin[] = [
  {
    id: '1',
    name: 'Tokyo Tower',
    address: '4 Chome-2-8 Shibakoen, Minato City, Tokyo',
    position: { lat: 35.6586, lng: 139.7454 },
    isSelected: false,
    types: ['tourist_attraction', 'landmark'],
    placeId: 'abc123',
    price: {
      entranceFee: 1000,
      currency: '¥'
    }
  },
  {
    id: '2',
    name: 'Senso-ji Temple',
    address: '2 Chome-3-1 Asakusa, Taito City, Tokyo',
    position: { lat: 35.7147, lng: 139.7966 },
    isSelected: false,
    types: ['temple', 'place_of_worship'],
    placeId: 'def456',
    price: {
      entranceFee: 0,
      currency: '¥',
      description: 'Free entry'
    }
  },
  {
    id: '3',
    name: 'Sushi Restaurant',
    address: 'Ginza, Chuo City, Tokyo',
    position: { lat: 35.6721, lng: 139.7636 },
    isSelected: true,
    types: ['restaurant', 'food'],
    placeId: 'ghi789',
    price: {
      value: 5000,
      currency: '¥',
      description: 'Average cost per person'
    }
  },
  {
    id: '4',
    name: 'Tokyo Station',
    address: '1 Chome Marunouchi, Chiyoda City, Tokyo',
    position: { lat: 35.6812, lng: 139.7671 },
    isSelected: false,
    types: ['train_station', 'transit_station'],
    placeId: 'jkl012',
    isStation: true
  },
];

// Mock functions
const mockOnPinSelect = jest.fn();
const mockOnPinRemove = jest.fn();
const mockOnSearchClick = jest.fn();
const mockOnResetData = jest.fn();
const mockOnPinUpdate = jest.fn();

describe('PinsList Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear localStorage before each test
    localStorage.clear();
  });

  it('renders the list of pins correctly', () => {
    render(
      <PinsList
        pins={mockPins}
        onPinSelect={mockOnPinSelect}
        onPinRemove={mockOnPinRemove}
        onSearchClick={mockOnSearchClick}
        onResetData={mockOnResetData}
        onPinUpdate={mockOnPinUpdate}
      />
    );

    // Check if pins are rendered (excluding station pins)
    expect(screen.getByText('Tokyo Tower')).toBeInTheDocument();
    expect(screen.getByText('Senso-ji Temple')).toBeInTheDocument();
    expect(screen.getByText('Sushi Restaurant')).toBeInTheDocument();
    
    // Station pins should be filtered out
    expect(screen.queryByText('Tokyo Station')).not.toBeInTheDocument();
    
    // Check headings and counts - use getAllByText and check at least one element exists
    expect(screen.getAllByText(/Attractions \(\d+\)/)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Temples & Shrines \(\d+\)/)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Dining \(\d+\)/)[0]).toBeInTheDocument();
  });

  it('filters pins by type when a filter is selected', async () => {
    render(
      <PinsList
        pins={mockPins}
        onPinSelect={mockOnPinSelect}
        onPinRemove={mockOnPinRemove}
        onSearchClick={mockOnSearchClick}
        onResetData={mockOnResetData}
        onPinUpdate={mockOnPinUpdate}
      />
    );

    // Find all filter buttons in the filter section
    const filterButtons = screen.getAllByRole('button', { name: /Dining/i });
    // Find the button filter in the filter section (not the heading)
    const diningFilterButton = filterButtons[0];
    fireEvent.click(diningFilterButton);
    
    // Only restaurant should be visible
    expect(screen.getByText('Sushi Restaurant')).toBeInTheDocument();
    expect(screen.queryByText('Tokyo Tower')).not.toBeInTheDocument();
    expect(screen.queryByText('Senso-ji Temple')).not.toBeInTheDocument();
    
    // Click All to show all pins again
    const allFilter = screen.getByText('All');
    fireEvent.click(allFilter);
    
    // All non-station pins should be visible again
    expect(screen.getByText('Tokyo Tower')).toBeInTheDocument();
    expect(screen.getByText('Senso-ji Temple')).toBeInTheDocument();
    expect(screen.getByText('Sushi Restaurant')).toBeInTheDocument();
  });

  it('calls onPinSelect when a pin is clicked', () => {
    render(
      <PinsList
        pins={mockPins}
        onPinSelect={mockOnPinSelect}
        onPinRemove={mockOnPinRemove}
        onSearchClick={mockOnSearchClick}
        onResetData={mockOnResetData}
        onPinUpdate={mockOnPinUpdate}
      />
    );

    // Click on Tokyo Tower
    const tokyoTower = screen.getByText('Tokyo Tower');
    fireEvent.click(tokyoTower);
    
    // Check if onPinSelect was called with the correct pin ID
    expect(mockOnPinSelect).toHaveBeenCalledWith('1');
  });

  it('calls onPinRemove when remove button is clicked', () => {
    render(
      <PinsList
        pins={mockPins}
        onPinSelect={mockOnPinSelect}
        onPinRemove={mockOnPinRemove}
        onSearchClick={mockOnSearchClick}
        onResetData={mockOnResetData}
        onPinUpdate={mockOnPinUpdate}
      />
    );

    // Find all remove buttons (they have an aria-label of "Remove pin")
    const removeButtons = screen.getAllByLabelText('Remove pin');
    
    // Click the first remove button (Tokyo Tower)
    fireEvent.click(removeButtons[0]);
    
    // Check if onPinRemove was called with the correct pin ID
    expect(mockOnPinRemove).toHaveBeenCalledWith('1');
  });

  it('shows the edit modal when edit button is clicked', async () => {
    render(
      <PinsList
        pins={mockPins}
        onPinSelect={mockOnPinSelect}
        onPinRemove={mockOnPinRemove}
        onSearchClick={mockOnSearchClick}
        onResetData={mockOnResetData}
        onPinUpdate={mockOnPinUpdate}
      />
    );

    // Find all edit buttons (they have an aria-label of "Edit location")
    const editButtons = screen.getAllByLabelText('Edit location');
    
    // Click the first edit button (Tokyo Tower)
    fireEvent.click(editButtons[0]);
    
    // Check if the edit modal is shown
    await waitFor(() => {
      expect(screen.getByText('Edit Location')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Tokyo Tower')).toBeInTheDocument();
    });
  });

  it('calls onPinUpdate with updated pin when save is clicked in edit modal', async () => {
    const user = userEvent.setup();
    
    render(
      <PinsList
        pins={mockPins}
        onPinSelect={mockOnPinSelect}
        onPinRemove={mockOnPinRemove}
        onSearchClick={mockOnSearchClick}
        onResetData={mockOnResetData}
        onPinUpdate={mockOnPinUpdate}
      />
    );

    // Find all edit buttons (they have an aria-label of "Edit location")
    const editButtons = screen.getAllByLabelText('Edit location');
    
    // Click the first edit button (Tokyo Tower)
    fireEvent.click(editButtons[0]);
    
    // Wait for the edit modal to appear
    await waitFor(() => {
      expect(screen.getByText('Edit Location')).toBeInTheDocument();
    });
    
    // Edit the name
    const nameInput = screen.getByDisplayValue('Tokyo Tower');
    await user.clear(nameInput);
    await user.type(nameInput, 'Tokyo Skytree');
    
    // Edit the entrance fee
    const entranceFeeInput = screen.getByDisplayValue('1000');
    await user.clear(entranceFeeInput);
    await user.type(entranceFeeInput, '2000');
    
    // Click save button
    const saveButton = screen.getByText('Save Changes');
    fireEvent.click(saveButton);
    
    // Check if onPinUpdate was called with the updated pin
    await waitFor(() => {
      expect(mockOnPinUpdate).toHaveBeenCalledWith(expect.objectContaining({
        id: '1',
        name: 'Tokyo Skytree',
        price: expect.objectContaining({
          entranceFee: 2000
        })
      }));
    });
  });

  it('formats price correctly for different pin types', () => {
    render(
      <PinsList
        pins={mockPins}
        onPinSelect={mockOnPinSelect}
        onPinRemove={mockOnPinRemove}
        onSearchClick={mockOnSearchClick}
        onResetData={mockOnResetData}
        onPinUpdate={mockOnPinUpdate}
      />
    );

    // Check if prices are formatted correctly
    // Tokyo Tower should show entrance fee (¥1,000)
    const priceElements = screen.getAllByText(/¥1,000/);
    expect(priceElements.length).toBeGreaterThan(0);
    
    // Sushi Restaurant should show average price (¥5,000)
    const restaurantPrice = screen.getAllByText(/¥5,000/);
    expect(restaurantPrice.length).toBeGreaterThan(0);
  });

  it('shows empty state when no pins are provided', () => {
    render(
      <PinsList
        pins={[]}
        onPinSelect={mockOnPinSelect}
        onPinRemove={mockOnPinRemove}
        onSearchClick={mockOnSearchClick}
        onResetData={mockOnResetData}
        onPinUpdate={mockOnPinUpdate}
      />
    );

    // Check empty state
    expect(screen.getByText('No saved locations yet.')).toBeInTheDocument();
    expect(screen.getByText('Search for places and add them to your trip plan.')).toBeInTheDocument();
    
    // Check if "Go to Search" button is shown
    const searchButton = screen.getByText('Go to Search');
    expect(searchButton).toBeInTheDocument();
    
    // Click on "Go to Search" button
    fireEvent.click(searchButton);
    expect(mockOnSearchClick).toHaveBeenCalled();
  });

  it('shows StorageCheck component when localStorage has more pins than displayed', () => {
    // Set up localStorage with more pins than displayed
    const extraPin = {
      id: '5',
      name: 'Shinjuku Gyoen',
      address: 'Shinjuku, Tokyo',
      position: { lat: 35.6851, lng: 139.7094 },
      isSelected: false,
      types: ['park'],
      placeId: 'mno345'
    };
    
    const localStoragePins = [...mockPins, extraPin];
    localStorage.setItem('japan-planner-pins', JSON.stringify(localStoragePins));
    
    render(
      <PinsList
        pins={mockPins} // Not including the extra pin
        onPinSelect={mockOnPinSelect}
        onPinRemove={mockOnPinRemove}
        onSearchClick={mockOnSearchClick}
        onResetData={mockOnResetData}
        onPinUpdate={mockOnPinUpdate}
      />
    );

    // Storage check should show the message
    expect(screen.getByText(/There appear to be saved locations that aren't showing/)).toBeInTheDocument();
    
    // Check if "Fix Saved Locations" button is shown
    const fixButton = screen.getByText('Fix Saved Locations');
    expect(fixButton).toBeInTheDocument();
    
    // Click on "Fix Saved Locations" button
    fireEvent.click(fixButton);
    expect(mockOnResetData).toHaveBeenCalled();
  });

  it('correctly handles the "Reset All Data" button', () => {
    render(
      <PinsList
        pins={mockPins}
        onPinSelect={mockOnPinSelect}
        onPinRemove={mockOnPinRemove}
        onSearchClick={mockOnSearchClick}
        onResetData={mockOnResetData}
        onPinUpdate={mockOnPinUpdate}
      />
    );

    // Find the Reset button
    const resetButton = screen.getByText('Reset');
    expect(resetButton).toBeInTheDocument();
    
    // Click Reset button
    fireEvent.click(resetButton);
    expect(mockOnResetData).toHaveBeenCalled();
  });
}); 