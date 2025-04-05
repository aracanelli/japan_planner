import React, { useEffect, useState, useMemo } from 'react';
import { MapPin } from '../types';
import ClientOnly from './ClientOnly';
import StorageCheck from './StorageCheck';
import PriceCurrency from './PriceCurrency';
import AddToTripButton from './AddToTripButton';

interface PinsListProps {
  pins: MapPin[];
  onPinSelect: (id: string) => void;
  onPinRemove: (id: string) => void;
  onSearchClick: () => void;
  onResetData?: () => void;
  onPinUpdate?: (updatedPin: MapPin) => void;
}

interface GroupedPins {
  [key: string]: MapPin[];
}

// Add this new component for the modal input fields outside the main component
const EditPinModal = ({ 
  isOpen, 
  pin, 
  onSave, 
  onCancel, 
  availableTypes 
}: { 
  isOpen: boolean; 
  pin: MapPin | null; 
  onSave: (pin: MapPin) => void; 
  onCancel: () => void; 
  availableTypes: Array<{ value: string; label: string }>;
}) => {
  // Create local state that's independent of the parent component
  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');
  const [type, setType] = useState('');
  const [entranceFee, setEntranceFee] = useState('');
  const [priceValue, setPriceValue] = useState('');
  const [currency, setCurrency] = useState('¥');
  const [priceDescription, setPriceDescription] = useState('');
  
  // Initialize fields when pin changes
  useEffect(() => {
    if (pin) {
      setName(pin.name);
      setNotes(pin.notes || '');
      setEntranceFee(pin.price?.entranceFee ? pin.price.entranceFee.toString() : '');
      setPriceValue(pin.price?.value ? pin.price.value.toString() : '');
      setCurrency(pin.price?.currency || '¥');
      setPriceDescription(pin.price?.description || '');
      
      // Set initial type
      if (pin.types && pin.types.length > 0) {
        const matchedType = availableTypes.find(t => pin.types.includes(t.value));
        setType(matchedType ? matchedType.value : 'other');
      } else {
        setType('other');
      }
    }
  }, [pin, availableTypes]);
  
  if (!isOpen || !pin) return null;
  
  const handleSave = () => {
    // Build updated types array
    let updatedTypes = pin.types || [];
    
    if (type !== 'other' && !updatedTypes.includes(type)) {
      updatedTypes = updatedTypes.filter(t => 
        !availableTypes.some(availType => availType.value === t)
      );
      updatedTypes = [type, ...updatedTypes];
    }
    
    // Build updated price object
    let updatedPrice = pin.price || {};
    
    // Update entrance fee
    if (entranceFee) {
      const entranceFeeNumber = parseFloat(entranceFee.replace(/[^\d.-]/g, ''));
      if (!isNaN(entranceFeeNumber)) {
        updatedPrice = {
          ...updatedPrice,
          entranceFee: entranceFeeNumber
        };
      }
    } else if (updatedPrice.entranceFee !== undefined) {
      delete updatedPrice.entranceFee;
    }
    
    // Update price value
    if (priceValue) {
      const priceValueNumber = parseFloat(priceValue.replace(/[^\d.-]/g, ''));
      if (!isNaN(priceValueNumber)) {
        updatedPrice = {
          ...updatedPrice,
          value: priceValueNumber
        };
      }
    } else if (updatedPrice.value !== undefined) {
      delete updatedPrice.value;
    }
    
    // Update currency and description
    updatedPrice = {
      ...updatedPrice,
      currency,
      description: priceDescription || undefined
    };
    
    // Remove description if empty
    if (!updatedPrice.description) {
      delete updatedPrice.description;
    }
    
    // Create updated pin and call onSave
    const updatedPin = {
      ...pin,
      name,
      notes,
      types: updatedTypes,
      price: Object.keys(updatedPrice).length > 0 ? updatedPrice : undefined
    };
    
    onSave(updatedPin);
  };
  
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onCancel} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
          <div className="p-4 bg-blue-50 border-b">
            <h3 className="text-lg font-medium">Edit Location</h3>
          </div>
          
          <div className="p-4 max-h-[80vh] overflow-y-auto">
            {/* Name */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="edit-name">Name</label>
              <input
                id="edit-name"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Location name"
              />
            </div>
            
            {/* Type */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="edit-type">Location Type</label>
              <select
                id="edit-type"
                value={type}
                onChange={e => setType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                {availableTypes.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Changing the type will affect how this location is categorized in filters.
              </p>
            </div>
            
            {/* Price Information */}
            <div className="mb-4 border p-3 rounded-md bg-blue-50">
              <h4 className="font-medium text-sm mb-2">Price Information</h4>
              
              {/* Currency */}
              <div className="mb-3">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-medium text-gray-700">Currency</label>
                  <select
                    value={currency}
                    onChange={e => setCurrency(e.target.value)}
                    className="px-2 py-1 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="¥">¥ (JPY)</option>
                    <option value="$">$ (USD)</option>
                    <option value="€">€ (EUR)</option>
                    <option value="£">£ (GBP)</option>
                  </select>
                </div>
              </div>
              
              {/* Entrance Fee (for attractions) */}
              {(type === 'tourist_attraction' || type === 'museum' || type === 'temple') && (
                <div className="mb-3">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Entrance Fee
                  </label>
                  <div className="flex items-center">
                    <span className="bg-green-100 px-2 py-2 border border-r-0 border-green-200 rounded-l-md text-green-700">
                      {currency}
                    </span>
                    <input
                      type="text"
                      value={entranceFee}
                      onChange={e => setEntranceFee(e.target.value)}
                      className="flex-1 px-3 py-2 border border-green-200 rounded-r-md focus:ring-green-500 focus:border-green-500"
                      placeholder="0"
                    />
                  </div>
                </div>
              )}
              
              {/* Price Value */}
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  {type === 'restaurant' || type === 'cafe' 
                    ? 'Average Meal Cost' 
                    : type === 'lodging' 
                      ? 'Nightly Rate' 
                      : type === 'shopping_mall' 
                        ? 'Typical Cost' 
                        : 'Price Value'}
                </label>
                <div className="flex items-center">
                  <span className="bg-green-100 px-2 py-2 border border-r-0 border-green-200 rounded-l-md text-green-700">
                    {currency}
                  </span>
                  <input
                    type="text"
                    value={priceValue}
                    onChange={e => setPriceValue(e.target.value)}
                    className="flex-1 px-3 py-2 border border-green-200 rounded-r-md focus:ring-green-500 focus:border-green-500"
                    placeholder="0"
                  />
                </div>
                {(type === 'restaurant' || type === 'cafe') && (
                  <p className="text-xs text-green-600 mt-1">
                    Estimated cost per person for a typical meal
                  </p>
                )}
                {type === 'lodging' && (
                  <p className="text-xs text-green-600 mt-1">
                    Typical cost per night
                  </p>
                )}
                {type === 'shopping_mall' && (
                  <p className="text-xs text-green-600 mt-1">
                    Estimated average purchase cost
                  </p>
                )}
              </div>
              
              {/* Price Notes */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Price Notes
                </label>
                <input
                  type="text"
                  value={priceDescription}
                  onChange={e => setPriceDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-green-200 rounded-md focus:ring-green-500 focus:border-green-500"
                  placeholder="e.g., Student discount available"
                />
                <p className="text-xs text-green-600 mt-1">
                  Additional notes about pricing, discounts, or special rates
                </p>
              </div>
            </div>
            
            {/* Notes */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Personal Notes
              </label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Add your personal notes about this location"
                rows={4}
              />
            </div>
            
            {/* Original Info */}
            <div className="text-gray-600 text-sm mb-4">
              <p>Original address: {pin.address}</p>
              {pin.types && pin.types.length > 0 && (
                <p>Original type: {pin.types[0].replace(/_/g, ' ')}</p>
              )}
            </div>
            
            {/* Buttons */}
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Add this component at the top of the file, below the imports
const AddToTripIcon: React.FC<{ pin: MapPin }> = ({ pin }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  
  return (
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="text-green-500 hover:text-green-700 p-1 rounded-full hover:bg-green-50 z-10"
        title="Add to Trip Plan"
        aria-label="Add to Trip Plan"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
        </svg>
      </button>
      
      {showDropdown && (
        <div className="absolute right-0 top-7 bg-white shadow-lg rounded-md p-2 z-50 w-64">
          <AddToTripButton pin={pin} />
        </div>
      )}
    </div>
  );
};

const PinsList: React.FC<PinsListProps> = ({ 
  pins, 
  onPinSelect, 
  onPinRemove, 
  onSearchClick, 
  onResetData,
  onPinUpdate = (updatedPin: MapPin) => {} // Default empty function if not provided
}) => {
  // Filter out station pins and count only regular pins that are selected
  const filteredPins = pins.filter(pin => !pin.isStation);
  const selectedCount = filteredPins.filter(pin => pin.isSelected).length;
  const [selectedType, setSelectedType] = useState<string>('All');
  const [editingPin, setEditingPin] = useState<MapPin | null>(null);
  const [multiSelectMode, setMultiSelectMode] = useState<boolean>(false);
  
  // Reset multi-select mode when no pins are selected
  useEffect(() => {
    if (selectedCount === 0) {
      setMultiSelectMode(false);
    }
  }, [selectedCount]);
  
  // Define available location types
  const availableTypes = [
    { value: 'tourist_attraction', label: 'Tourist Attraction' },
    { value: 'temple', label: 'Temple/Shrine' },
    { value: 'restaurant', label: 'Restaurant' },
    { value: 'cafe', label: 'Cafe' },
    { value: 'lodging', label: 'Accommodation' },
    { value: 'shopping_mall', label: 'Shopping' },
    { value: 'museum', label: 'Museum' },
    { value: 'park', label: 'Park/Nature' },
    { value: 'train_station', label: 'Transportation' },
    { value: 'other', label: 'Other' }
  ];

  // Handle pin selection with modified behavior
  const handlePinSelect = (id: string) => {
    const pin = filteredPins.find(p => p.id === id);
    const isCurrentlySelected = pin?.isSelected;
    
    // If pin is already selected, always allow deselecting it
    if (isCurrentlySelected) {
      onPinSelect(id);
      return;
    }
    
    // If no pins are selected, always allow selecting the first pin
    if (selectedCount === 0) {
      onPinSelect(id);
      return;
    }
    
    // If one pin is selected, only allow selecting another if in multi-select mode
    if (selectedCount === 1 && multiSelectMode) {
      onPinSelect(id);
      // Automatically turn off multi-select mode after selecting the second pin
      setMultiSelectMode(false);
    } else if (selectedCount === 1 && !multiSelectMode) {
      // If not in multi-select mode, deselect the current pin and select the new one
      const currentSelectedPin = filteredPins.find(p => p.isSelected);
      if (currentSelectedPin) {
        onPinSelect(currentSelectedPin.id); // Deselect current pin
      }
      onPinSelect(id); // Select new pin
    }
  };

  // Handle edit pin
  const handleEditPin = (pin: MapPin) => {
    setEditingPin(pin);
  };

  // Handle save edit
  const handleSaveEdit = (updatedPin: MapPin) => {
    onPinUpdate(updatedPin);
    setEditingPin(null);
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingPin(null);
  };

  // Group pins by type (excluding station pins)
  const groupedPins = useMemo(() => {
    // Create an object to hold the groups
    const groups: GroupedPins = {};
    
    // Process the pins
    filteredPins.forEach(pin => {
      // Determine the pin's primary type
      let primaryType = 'Other';
      
      if (pin.types && pin.types.length > 0) {
        if (pin.types.some(t => ['restaurant', 'cafe', 'food', 'bakery', 'meal_takeaway'].includes(t))) {
          primaryType = 'Dining';
        } else if (pin.types.some(t => ['lodging', 'hotel', 'guest_house'].includes(t))) {
          primaryType = 'Accommodation';
        } else if (pin.types.some(t => ['tourist_attraction', 'museum', 'gallery', 'art_gallery'].includes(t))) {
          primaryType = 'Attractions';
        } else if (pin.types.some(t => ['shopping_mall', 'store', 'shop', 'market'].includes(t))) {
          primaryType = 'Shopping';
        } else if (pin.types.some(t => ['park', 'natural_feature', 'nature'].includes(t))) {
          primaryType = 'Nature';
        } else if (pin.types.some(t => ['transit_station', 'train_station', 'subway_station', 'bus_station'].includes(t))) {
          primaryType = 'Transportation';
        } else if (pin.types.some(t => ['temple', 'shrine', 'place_of_worship', 'church'].includes(t))) {
          primaryType = 'Temples & Shrines';
        }
      }
      
      // Add the pin to the appropriate group
      if (!groups[primaryType]) {
        groups[primaryType] = [];
      }
      
      groups[primaryType].push(pin);
    });
    
    return groups;
  }, [filteredPins]);

  // Format price information
  const formatPrice = (pin: MapPin): React.ReactNode => {
    const { price, types = [] } = pin;
    
    if (!price) return null;
    
    // Determine place type category
    const isRestaurant = types.some(t => ['restaurant', 'cafe', 'food', 'bakery', 'meal_takeaway'].includes(t));
    const isAccommodation = types.some(t => ['lodging', 'hotel', 'guest_house'].includes(t));
    const isAttraction = types.some(t => ['tourist_attraction', 'museum', 'zoo', 'aquarium', 'amusement_park', 'temple', 'shrine'].includes(t));
    const isShopping = types.some(t => ['shopping_mall', 'store', 'shop', 'market'].includes(t));
    
    // Set appropriate label based on place type
    let priceLabel = '';
    
    if (isRestaurant) {
      priceLabel = 'Avg: ';
    } else if (isAccommodation) {
      priceLabel = 'Stay: ';
    } else if (isAttraction) {
      priceLabel = 'Entry: ';
    } else if (isShopping) {
      priceLabel = 'Cost: ';
    }
    
    const currency = price.currency || '¥';
    
    // Display entrance fee for attractions
    if (price.entranceFee !== undefined && isAttraction) {
      return (
        <span className="tag tag-green">
          <PriceCurrency 
            value={price.entranceFee} 
            originCurrency={currency}
            showConversion={true}
            className="font-normal"
          />
        </span>
      );
    }
    
    // Display value (price) if available - prioritize this for restaurants/shopping
    if (price.value !== undefined) {
      return (
        <span className="tag tag-green">
          {priceLabel}
          <PriceCurrency 
            value={price.value} 
            originCurrency={currency}
            showConversion={true}
            className="font-normal"
          />
        </span>
      );
    }
    
    // Display price range if available - good for accommodations
    if (price.range?.min && price.range?.max) {
      return (
        <span className="tag tag-green">
          {priceLabel}
          <PriceCurrency 
            value={price.range.min} 
            originCurrency={currency}
            showConversion={false}
            className="font-normal"
          /> - <PriceCurrency 
            value={price.range.max} 
            originCurrency={currency}
            showConversion={true}
            className="font-normal"
          />
        </span>
      );
    }
    
    // Display price level as a fallback
    if (price.level !== undefined) {
      const priceSymbol = currency === '¥' ? '¥' : '$';
      return (
        <span className="tag tag-green">
          {priceLabel}{Array(price.level + 1).fill(priceSymbol).join('')}
        </span>
      );
    }
    
    // If we have price info but none of the above formats, show a generic price tag
    if (price.description) {
      return (
        <span className="tag tag-green">
          {price.description}
        </span>
      );
    }
    
    return null;
  };

  // Render individual pin
  const renderPin = (pin: MapPin) => (
    <li key={pin.id} className={`p-4 ${pin.isSelected ? 'bg-blue-50' : ''} relative`}>
      <div className="flex items-start min-w-0">
        <div 
          className="flex-grow cursor-pointer min-w-0 pr-16" // Increased padding to accommodate two buttons
          onClick={() => handlePinSelect(pin.id)}
        >
          <div className="flex justify-between">
            <h3 className="break-words pr-2">{pin.name}</h3>
          </div>
          <p className="text-gray-700 truncate">{pin.address}</p>
          
          <div className="mt-2 flex flex-wrap gap-1">
            {pin.types?.slice(0, 1).map((type) => (
              <span
                key={type}
                className="tag tag-gray"
              >
                {type.replace(/_/g, ' ')}
              </span>
            ))}
            
            {formatPrice(pin)}
            
            {pin.additionalInfo?.estimatedDuration && (
              <span className="tag tag-gray">
                {pin.additionalInfo.estimatedDuration}
              </span>
            )}
          </div>
          
          {pin.price?.ticketInfo && (
            <p className="text-sm mt-1 text-gray-600">
              {pin.price.ticketInfo}
            </p>
          )}
          
          {pin.notes && (
            <p className="text-sm mt-1 italic text-blue-600">
              Note: {pin.notes}
            </p>
          )}
        </div>
        
        <div className="absolute right-4 top-4 flex space-x-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEditPin(pin);
            }}
            className="text-blue-500 hover:text-blue-700 p-1 rounded-full hover:bg-blue-50 z-10"
            title="Edit location"
            aria-label="Edit location"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </button>
          
          <AddToTripIcon pin={pin} />
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm(`Remove ${pin.name} from saved locations?`)) {
                onPinRemove(pin.id);
              }
            }}
            className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 z-10"
            title="Remove location"
            aria-label="Remove location"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </li>
  );

  // Empty state
  if (filteredPins.length === 0) {
    return (
      <div className="p-4 text-center text-gray-700">
        <p>No saved locations yet.</p>
        <p className="mt-2">Search for places and add them to your trip plan.</p>
        <button
          onClick={onSearchClick}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Go to Search
        </button>
        
        <ClientOnly>
          <StorageCheck displayPins={filteredPins} onResetData={onResetData || (() => {})} />
        </ClientOnly>
        
        {onResetData && (
          <button 
            onClick={onResetData}
            className="mt-4 px-4 py-2 text-sm text-red-600 hover:underline block mx-auto"
          >
            Reset All Data
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header with action buttons */}
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-lg font-medium">
          Saved Locations 
          <span className="ml-1 text-gray-500">({filteredPins.length})</span>
        </h2>
        
        <div className="flex space-x-2">
          <button 
            onClick={onSearchClick}
            className="btn btn-primary text-sm"
          >
            Add Place
          </button>
          {onResetData && (
            <button 
              onClick={onResetData}
              className="text-xs text-red-600 hover:underline flex-shrink-0 self-center ml-4"
              title="Clear all saved locations"
            >
              Reset
            </button>
          )}
        </div>
      </div>
      
      {/* Type filter */}
      <div className="p-4 border-b">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedType('All')}
            className={`tag ${selectedType === 'All' ? 'tag-blue' : 'tag-gray'}`}
          >
            All
          </button>
          
          {Object.keys(groupedPins).map(type => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`tag ${selectedType === type ? 'tag-blue' : 'tag-gray'}`}
            >
              {type} ({groupedPins[type].length})
            </button>
          ))}
        </div>
        
        <div className="mt-2 text-sm text-blue-700 flex justify-between items-center">
          <span>
            {selectedCount === 0 && "Click on a location to select it."}
            {selectedCount === 1 && !multiSelectMode && "Location selected."}
            {selectedCount === 1 && multiSelectMode && "Select a second location to get directions."}
            {selectedCount === 2 && "Two locations selected for directions."}
          </span>
          
          {selectedCount === 1 && !multiSelectMode && (
            <button
              onClick={() => setMultiSelectMode(true)}
              className="px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700"
            >
              Get Directions To Another Location
            </button>
          )}
        </div>
      </div>
      
      <ClientOnly>
        <StorageCheck displayPins={filteredPins} onResetData={onResetData || (() => {})} />
      </ClientOnly>
      
      {/* Render pins based on selected type */}
      <div className="flex-1 overflow-y-auto">
        {selectedType === 'All' ? (
          // When "All" is selected, render all grouped pins
          Object.entries(groupedPins).map(([type, typePins]) => (
            <div key={type} className="mb-6">
              <h2 className="px-4 py-2 font-medium sticky top-0 z-10 bg-blue-100 text-blue-800">
                {type} ({typePins.length})
              </h2>
              <ul className="divide-y">
                {typePins.map(renderPin)}
              </ul>
            </div>
          ))
        ) : (
          // When a specific type is selected, render only those pins
          groupedPins[selectedType] ? (
            <div>
              <h2 className="px-4 py-2 font-medium sticky top-0 z-10 bg-blue-100 text-blue-800">
                {selectedType} ({groupedPins[selectedType].length})
              </h2>
              <ul className="divide-y">
                {groupedPins[selectedType].map(renderPin)}
              </ul>
            </div>
          ) : (
            <div className="p-4 text-center text-gray-700">
              <p>No locations match the selected filter.</p>
              <button
                onClick={() => setSelectedType('All')}
                className="mt-2 px-3 py-1 bg-blue-600 text-white text-sm rounded-md"
              >
                Show All Locations
              </button>
            </div>
          )
        )}
      </div>
      
      {/* Edit Modal */}
      <EditPinModal
        isOpen={editingPin !== null}
        pin={editingPin}
        onSave={handleSaveEdit}
        onCancel={handleCancelEdit}
        availableTypes={availableTypes}
      />
    </div>
  );
};

export default PinsList; 