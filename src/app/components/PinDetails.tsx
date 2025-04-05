import React, { useState, useEffect } from 'react';
import { MapPin, PointOfInterest } from '../types';
import PriceCurrency from './PriceCurrency';
import AddToTripButton from './AddToTripButton';

interface PinDetailsProps {
  pin: MapPin;
  onClose: () => void;
  onRemovePin?: (id: string) => void;
  onUpdatePin?: (id: string, updates: Partial<MapPin>) => void;
  isReadOnly?: boolean;
}

const PinDetails: React.FC<PinDetailsProps> = ({ pin, onClose, onRemovePin, onUpdatePin, isReadOnly }) => {
  if (!pin) return null;
  
  const { name, address, types, price, rating, openingHours, website, phoneNumber, notes } = pin;
  
  // Format type for display
  const formattedType = types && types.length > 0 
    ? types[0].replace(/_/g, ' ').replace(/^(.)|\s+(.)/g, (match: string) => match.toUpperCase())
    : 'Location';
    
  // Determine place type category
  const isRestaurant = types?.some(t => ['restaurant', 'cafe', 'food', 'bakery', 'meal_takeaway'].includes(t));
  const isAccommodation = types?.some(t => ['lodging', 'hotel', 'guest_house'].includes(t));
  const isAttraction = types?.some(t => ['tourist_attraction', 'museum', 'zoo', 'aquarium', 'amusement_park', 'temple', 'shrine'].includes(t));
  const isShopping = types?.some(t => ['shopping_mall', 'store', 'shop', 'market'].includes(t));
    
  // Price display helpers
  const hasPriceInfo = price && (
    price.entranceFee !== undefined || 
    price.value !== undefined || 
    price.description !== undefined ||
    (price.range?.min !== undefined && price.range?.max !== undefined) ||
    price.level !== undefined
  );
  
  // Get appropriate price label based on location type
  const getPriceLabel = (): string => {
    if (isRestaurant) return 'Average Cost';
    if (isAccommodation) return 'Stay Price';
    if (isAttraction) return 'Entrance Fee';
    if (isShopping) return 'Typical Cost';
    return 'Price';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
      <h2 className="text-xl font-semibold mb-2">{name}</h2>
      
      <div className="flex items-center text-gray-600 mb-3">
        <span className="mr-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </span>
        <span className="text-sm">{formattedType}</span>
      </div>
      
      {address && (
        <div className="mb-3">
          <h3 className="text-sm font-medium text-gray-700 mb-1">Address</h3>
          <p className="text-sm text-gray-600">{address}</p>
        </div>
      )}
      
      {hasPriceInfo && (
        <div className="mb-3 p-3 bg-green-50 rounded border border-green-100">
          <h3 className="text-sm font-medium text-green-800 mb-2">{getPriceLabel()}</h3>
          
          {isAttraction && price?.entranceFee !== undefined && (
            <p className="text-sm mb-1">
              <span className="font-medium">Entrance:</span>{' '}
              <PriceCurrency 
                value={price.entranceFee} 
                originCurrency={price.currency || 'JPY'} 
                entranceFee={false}
              />
            </p>
          )}
          
          {price?.value !== undefined && (
            <p className="text-sm mb-1">
              <span className="font-medium">{isRestaurant ? 'Typical meal:' : 'Standard price:'}</span>{' '}
              <PriceCurrency 
                value={price.value} 
                originCurrency={price.currency || 'JPY'} 
              />
            </p>
          )}
          
          {price?.range?.min !== undefined && price?.range?.max !== undefined && (
            <p className="text-sm mb-1">
              <span className="font-medium">Price range:</span>{' '}
              <PriceCurrency 
                value={price.range.min} 
                originCurrency={price.currency || 'JPY'} 
                showConversion={false}
              /> - <PriceCurrency 
                value={price.range.max} 
                originCurrency={price.currency || 'JPY'} 
              />
            </p>
          )}
          
          {price?.level !== undefined && (
            <p className="text-sm mb-1">
              <span className="font-medium">Price level:</span>{' '}
              <span className="text-green-700">{Array(price.level + 1).fill(price.currency || '¥').join('')}</span>
            </p>
          )}
          
          {price?.description && (
            <div className="text-sm text-green-800 mt-2 py-2 border-t border-green-100">
              <p className="italic">{price.description}</p>
            </div>
          )}
          
          {/* Source information */}
          {price?.source && (
            <div className="text-xs text-green-600 mt-1">
              Source: {price.source}
            </div>
          )}
          
          <p className="text-xs text-green-600 mt-2">
            Click on prices to toggle between JPY and CAD
          </p>
        </div>
      )}
      
      {rating && (
        <div className="mb-3">
          <h3 className="text-sm font-medium text-gray-700 mb-1">Rating</h3>
          <div className="flex items-center">
            <span className="text-yellow-500 mr-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </span>
            <span className="text-sm">{rating}</span>
          </div>
        </div>
      )}
      
      {openingHours && openingHours.length > 0 && (
        <div className="mb-3">
          <h3 className="text-sm font-medium text-gray-700 mb-1">Opening Hours</h3>
          <ul className="text-sm text-gray-600">
            {openingHours.map((hours, index) => (
              <li key={index}>{hours}</li>
            ))}
          </ul>
        </div>
      )}
      
      {notes && (
        <div className="mb-3">
          <h3 className="text-sm font-medium text-gray-700 mb-1">Personal Notes</h3>
          <p className="text-sm text-gray-600">{notes}</p>
        </div>
      )}
      
      <div className="flex flex-wrap gap-2 mt-4">
        {website && (
          <a 
            href={website} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Website
          </a>
        )}
        
        {phoneNumber && (
          <a 
            href={`tel:${phoneNumber}`} 
            className="inline-flex items-center px-3 py-1 text-xs bg-green-100 text-green-800 rounded-full hover:bg-green-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            Call
          </a>
        )}
      </div>
      
      {!isReadOnly && (
        <div className="mt-4">
          <AddToTripButton pin={pin} />
        </div>
      )}
      
      <button
        onClick={onClose}
        className="mt-4 w-full py-2 px-4 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
      >
        Close
      </button>
    </div>
  );
};

export default PinDetails; 