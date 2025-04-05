import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MapPin } from '../../types';
import { EditPinModal } from '../PinsList';

// Mock test pin
const mockPin: MapPin = {
  id: '1',
  name: 'Tokyo Tower',
  address: '4 Chome-2-8 Shibakoen, Minato City, Tokyo',
  position: { lat: 35.6586, lng: 139.7454 },
  isSelected: false,
  types: ['tourist_attraction', 'landmark'],
  placeId: 'abc123',
  price: {
    entranceFee: 1000,
    currency: '¥',
    description: 'Adult entrance fee'
  }
};

const mockAvailableTypes = [
  { value: 'tourist_attraction', label: 'Tourist Attraction' },
  { value: 'temple', label: 'Temple/Shrine' },
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'cafe', label: 'Cafe' },
  { value: 'lodging', label: 'Accommodation' },
  { value: 'shopping_mall', label: 'Shopping' },
  { value: 'other', label: 'Other' }
];

const mockOnSave = jest.fn();
const mockOnCancel = jest.fn();

describe('EditPinModal Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly when open with a pin', () => {
    render(
      <EditPinModal
        isOpen={true}
        pin={mockPin}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
        availableTypes={mockAvailableTypes}
      />
    );

    // Check if modal title is rendered
    expect(screen.getByText('Edit Location')).toBeInTheDocument();
    
    // Check if pin data is pre-filled
    expect(screen.getByDisplayValue('Tokyo Tower')).toBeInTheDocument();
    expect(screen.getByDisplayValue('1000')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Adult entrance fee')).toBeInTheDocument();
    
    // Check if buttons are rendered
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Save Changes')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    render(
      <EditPinModal
        isOpen={false}
        pin={mockPin}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
        availableTypes={mockAvailableTypes}
      />
    );

    // Modal should not be visible
    expect(screen.queryByText('Edit Location')).not.toBeInTheDocument();
  });

  it('shows the correct inputs based on pin type', async () => {
    // Restaurant pin
    const restaurantPin: MapPin = {
      ...mockPin,
      id: '3',
      name: 'Sushi Restaurant',
      types: ['restaurant', 'food'],
      price: {
        value: 5000,
        currency: '¥',
        description: 'Average cost per person'
      }
    };

    render(
      <EditPinModal
        isOpen={true}
        pin={restaurantPin}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
        availableTypes={mockAvailableTypes}
      />
    );

    // Check that restaurant-specific fields are shown
    expect(screen.getByText('Average Meal Cost')).toBeInTheDocument();
    expect(screen.getByDisplayValue('5000')).toBeInTheDocument();
  });

  it('updates input values when typing', async () => {
    const user = userEvent.setup();
    
    render(
      <EditPinModal
        isOpen={true}
        pin={mockPin}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
        availableTypes={mockAvailableTypes}
      />
    );

    // Edit the name
    const nameInput = screen.getByDisplayValue('Tokyo Tower');
    await user.clear(nameInput);
    await user.type(nameInput, 'Tokyo Skytree');
    expect(nameInput).toHaveValue('Tokyo Skytree');
    
    // Edit the entrance fee
    const entranceFeeInput = screen.getByDisplayValue('1000');
    await user.clear(entranceFeeInput);
    await user.type(entranceFeeInput, '2000');
    expect(entranceFeeInput).toHaveValue('2000');
    
    // Edit the description
    const descriptionInput = screen.getByDisplayValue('Adult entrance fee');
    await user.clear(descriptionInput);
    await user.type(descriptionInput, 'Adult ticket price');
    expect(descriptionInput).toHaveValue('Adult ticket price');
  });

  it('calls onSave with updated pin data when save button is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <EditPinModal
        isOpen={true}
        pin={mockPin}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
        availableTypes={mockAvailableTypes}
      />
    );

    // Edit the name
    const nameInput = screen.getByDisplayValue('Tokyo Tower');
    await user.clear(nameInput);
    await user.type(nameInput, 'Tokyo Skytree');
    
    // Edit the entrance fee
    const entranceFeeInput = screen.getByDisplayValue('1000');
    await user.clear(entranceFeeInput);
    await user.type(entranceFeeInput, '2000');
    
    // Change currency to USD
    const currencySelect = screen.getByDisplayValue('¥ (JPY)');
    await user.selectOptions(currencySelect, '$ (USD)');
    
    // Click save button
    const saveButton = screen.getByText('Save Changes');
    fireEvent.click(saveButton);
    
    // Check if onSave was called with the updated pin
    expect(mockOnSave).toHaveBeenCalledWith(expect.objectContaining({
      id: '1',
      name: 'Tokyo Skytree',
      price: expect.objectContaining({
        entranceFee: 2000,
        currency: '$',
        description: 'Adult entrance fee'
      })
    }));
  });

  it('calls onCancel when cancel button is clicked', () => {
    render(
      <EditPinModal
        isOpen={true}
        pin={mockPin}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
        availableTypes={mockAvailableTypes}
      />
    );

    // Click cancel button
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    
    // Check if onCancel was called
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('calls onCancel when backdrop is clicked', () => {
    render(
      <EditPinModal
        isOpen={true}
        pin={mockPin}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
        availableTypes={mockAvailableTypes}
      />
    );

    // Click backdrop (the semi-transparent overlay)
    const backdrop = screen.getByText('Edit Location').parentElement?.parentElement?.previousSibling;
    if (backdrop) {
      fireEvent.click(backdrop);
      expect(mockOnCancel).toHaveBeenCalled();
    }
  });

  it('handles changing location type', async () => {
    const user = userEvent.setup();
    
    render(
      <EditPinModal
        isOpen={true}
        pin={mockPin}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
        availableTypes={mockAvailableTypes}
      />
    );

    // Change type to Restaurant
    const typeSelect = screen.getByDisplayValue('Tourist Attraction');
    await user.selectOptions(typeSelect, 'Restaurant');
    
    // Now we should see the restaurant-specific field
    expect(screen.getByText('Average Meal Cost')).toBeInTheDocument();
    
    // Click save button
    const saveButton = screen.getByText('Save Changes');
    fireEvent.click(saveButton);
    
    // Check if onSave was called with updated type
    expect(mockOnSave).toHaveBeenCalledWith(expect.objectContaining({
      types: expect.arrayContaining(['restaurant'])
    }));
  });

  it('handles missing price data correctly', () => {
    // Pin without price data
    const pinWithoutPrice: MapPin = {
      ...mockPin,
      price: undefined
    };

    render(
      <EditPinModal
        isOpen={true}
        pin={pinWithoutPrice}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
        availableTypes={mockAvailableTypes}
      />
    );

    // Check that price inputs are empty
    const entranceFeeInput = screen.queryByPlaceholderText('0');
    if (entranceFeeInput) {
      expect(entranceFeeInput).toHaveValue('');
    }
    
    const descriptionInput = screen.getByLabelText('Price Notes');
    expect(descriptionInput).toHaveValue('');
  });
}); 