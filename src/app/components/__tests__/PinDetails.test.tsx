import React from 'react';
import { render, screen } from '@testing-library/react';
import PinDetails from '../PinDetails';
import { MapPin } from '../../types';

// Sample pins for testing
const templePinWithPrice: MapPin = {
  id: '1',
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
  },
  rating: 4.7,
  openingHours: ['Monday: 6:00 AM – 5:00 PM', 'Tuesday: 6:00 AM – 5:00 PM'],
  notes: 'Beautiful temple in Asakusa. Very crowded on weekends.'
};

const restaurantPin: MapPin = {
  id: '2',
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
  },
  rating: 4.2,
  phoneNumber: '+81-3-1234-5678',
  website: 'https://example.com'
};

const pinWithoutPrice: MapPin = {
  id: '3',
  name: 'Tokyo Station',
  address: '1 Chome Marunouchi, Chiyoda City, Tokyo',
  position: { lat: 35.6812, lng: 139.7671 },
  isSelected: false,
  types: ['train_station', 'transit_station'],
  placeId: 'jkl012'
};

describe('PinDetails Component', () => {
  it('renders temple details correctly', () => {
    render(<PinDetails pin={templePinWithPrice} />);
    
    // Basic details
    expect(screen.getByText('Senso-ji Temple')).toBeInTheDocument();
    expect(screen.getByText('2 Chome-3-1 Asakusa, Taito City, Tokyo')).toBeInTheDocument();
    
    // Type
    expect(screen.getByText('Temple')).toBeInTheDocument();
    
    // Price info - should show "Free entry"
    expect(screen.getByText('Entrance Fee')).toBeInTheDocument();
    expect(screen.getByText('¥0')).toBeInTheDocument();
    expect(screen.getByText('Free entry')).toBeInTheDocument();
    
    // Rating
    expect(screen.getByText('4.7')).toBeInTheDocument();
    
    // Opening hours
    expect(screen.getByText('Monday: 6:00 AM – 5:00 PM')).toBeInTheDocument();
    expect(screen.getByText('Tuesday: 6:00 AM – 5:00 PM')).toBeInTheDocument();
    
    // Notes
    expect(screen.getByText(/Beautiful temple in Asakusa/)).toBeInTheDocument();
  });

  it('renders restaurant details correctly', () => {
    render(<PinDetails pin={restaurantPin} />);
    
    // Basic details
    expect(screen.getByText('Sushi Restaurant')).toBeInTheDocument();
    expect(screen.getByText('Ginza, Chuo City, Tokyo')).toBeInTheDocument();
    
    // Type
    expect(screen.getByText('Restaurant')).toBeInTheDocument();
    
    // Price info
    expect(screen.getByText('Average Cost')).toBeInTheDocument();
    expect(screen.getByText('Typical meal:')).toBeInTheDocument();
    expect(screen.getByText('¥5,000')).toBeInTheDocument();
    expect(screen.getByText('Average cost per person')).toBeInTheDocument();
    
    // Rating
    expect(screen.getByText('4.2')).toBeInTheDocument();
    
    // Contact info
    expect(screen.getByText('Website')).toBeInTheDocument();
    expect(screen.getByText('Call')).toBeInTheDocument();
  });

  it('handles pins without price information', () => {
    render(<PinDetails pin={pinWithoutPrice} />);
    
    // Basic details
    expect(screen.getByText('Tokyo Station')).toBeInTheDocument();
    
    // Type
    expect(screen.getByText('Train Station')).toBeInTheDocument();
    
    // Price info should not be present
    expect(screen.queryByText('Price Information')).not.toBeInTheDocument();
    expect(screen.queryByText('Entrance Fee:')).not.toBeInTheDocument();
  });

  it('renders nothing when pin is null', () => {
    const { container } = render(<PinDetails pin={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('handles different price formats correctly', () => {
    // Pin with price range
    const accommodationPin: MapPin = {
      id: '4',
      name: 'Luxury Hotel',
      address: 'Shinjuku, Tokyo',
      position: { lat: 35.6894, lng: 139.6917 },
      isSelected: false,
      types: ['lodging', 'hotel'],
      placeId: 'mno345',
      price: {
        range: {
          min: 25000,
          max: 50000
        },
        currency: '¥'
      }
    };
    
    // Pin with price level
    const shoppingPin: MapPin = {
      id: '5',
      name: 'Ginza Shopping Mall',
      address: 'Ginza, Tokyo',
      position: { lat: 35.6726, lng: 139.7654 },
      isSelected: false,
      types: ['shopping_mall'],
      placeId: 'pqr678',
      price: {
        level: 3,
        currency: '¥'
      }
    };
    
    // Render accommodation pin
    const { rerender } = render(<PinDetails pin={accommodationPin} />);
    
    // Check price range
    expect(screen.getByText('Stay Price')).toBeInTheDocument();
    expect(screen.getByText('Price range:')).toBeInTheDocument();
    expect(screen.getByText(/¥25,000 - ¥50,000/)).toBeInTheDocument();
    
    // Re-render with shopping pin
    rerender(<PinDetails pin={shoppingPin} />);
    
    // Check price level
    expect(screen.getByText('Typical Cost')).toBeInTheDocument();
    expect(screen.getByText('Price level:')).toBeInTheDocument();
    expect(screen.getByText('¥¥¥¥')).toBeInTheDocument();
  });

  it('handles different currencies correctly', () => {
    // Pin with USD currency
    const usdPin: MapPin = {
      ...templePinWithPrice,
      price: {
        entranceFee: 12,
        currency: '$'
      }
    };
    
    render(<PinDetails pin={usdPin} />);
    
    // Check currency symbol is displayed correctly
    expect(screen.getByText('$12')).toBeInTheDocument();
  });
}); 