import React, { useState, FormEvent, useEffect } from 'react';
import { PointOfInterest } from '../types';

interface SearchProps {
  onSearch: (query: string) => Promise<void>;
  isLoading: boolean;
  results: PointOfInterest[];
  hasMoreResults: boolean;
  onLoadMore: () => Promise<void>;
  onSelectResult: (poi: PointOfInterest) => void;
  onViewTrip: () => void;
}

const Search: React.FC<SearchProps> = ({
  onSearch,
  isLoading,
  results,
  hasMoreResults,
  onLoadMore,
  onSelectResult,
  onViewTrip
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [addedLocations, setAddedLocations] = useState<{[placeId: string]: boolean}>({});
  
  // Reset added locations when results change
  useEffect(() => {
    setAddedLocations({});
  }, [results]);
  
  // Debug search results
  useEffect(() => {
    console.log('Search results:', results.length, results.map(r => r.name));
  }, [results]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      console.log('Searching for:', searchTerm.trim());
      await onSearch(searchTerm);
    }
  };
  
  const handleSelectResult = (result: PointOfInterest) => {
    console.log('Selected search result:', result.name);
    onSelectResult(result);
    
    // Mark this result as added
    setAddedLocations(prev => ({
      ...prev,
      [result.placeId]: true
    }));
  };

  function formatPrice(poi: PointOfInterest): React.ReactNode {
    const { price, types = [] } = poi;
    
    if (!price) return null;
    
    // Set appropriate label based on place type
    let priceLabel = '';
    
    if (types.some(t => ['restaurant', 'cafe', 'food', 'bakery', 'meal_takeaway'].includes(t))) {
      priceLabel = 'Meal: ';
    } else if (types.some(t => ['lodging', 'hotel', 'guest_house'].includes(t))) {
      priceLabel = 'Room: ';
    } else if (types.some(t => ['tourist_attraction', 'museum', 'zoo', 'aquarium', 'amusement_park'].includes(t))) {
      priceLabel = 'Entry: ';
    }
    
    // Display entrance fee if available (likely an attraction)
    if (price.entranceFee) {
      return (
        <span className="tag tag-green">
          {priceLabel || 'Entrance: '}{price.currency || '¥'}{price.entranceFee}
        </span>
      );
    }
    
    // Display exact price if available
    if (price.value) {
      return (
        <span className="tag tag-green">
          {priceLabel}{price.currency || '¥'}{price.value}
        </span>
      );
    }
    
    // Display price range if available
    if (price.range?.min && price.range?.max) {
      return (
        <span className="tag tag-green">
          {priceLabel}{price.currency || '¥'}{price.range.min} - {price.currency || '¥'}{price.range.max}
        </span>
      );
    }
    
    // Fallback to price level
    if (price.level !== undefined) {
      return (
        <span className="tag tag-green">
          {priceLabel}{Array(price.level + 1).fill('¥').join('')}
          {price.formattedPrice && ` (${price.formattedPrice})`}
        </span>
      );
    }
    
    return null;
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search for places in Japan..."
            className="form-input flex-grow"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading || !searchTerm.trim()}
          >
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        </form>
        <div className="mt-2 flex justify-end">
          <button
            onClick={onViewTrip}
            className="text-blue-600 text-sm hover:text-blue-800 font-medium flex items-center"
          >
            View your saved trip locations 
            {Object.keys(addedLocations).length > 0 && (
              <span className="ml-2 bg-blue-600 text-white rounded-full h-5 w-5 inline-flex items-center justify-center text-xs">
                {Object.keys(addedLocations).length}
              </span>
            )}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex-grow overflow-y-auto">
        {results.length === 0 ? (
          <div className="p-4 text-center text-gray-700">
            {isLoading ? 'Searching...' : 'No results found. Try searching for places in Japan.'}
          </div>
        ) : (
          <ul className="divide-y">
            {results.map((result) => (
              <li
                key={result.placeId}
                className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => handleSelectResult(result)}
              >
                <h3>{result.name}</h3>
                <p className="text-gray-700">{result.address}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {result.types?.slice(0, 2).map((type) => (
                    <span
                      key={type}
                      className="tag tag-gray"
                    >
                      {type.replace(/_/g, ' ')}
                    </span>
                  ))}
                  
                  {formatPrice(result)}
                  
                  {result.rating && (
                    <span className="tag tag-yellow">
                      {result.rating} ★
                    </span>
                  )}
                  
                  {result.additionalInfo?.estimatedDuration && (
                    <span className="tag tag-gray">
                      {result.additionalInfo.estimatedDuration}
                    </span>
                  )}
                </div>
                
                {result.price?.description && (
                  <p className="text-sm mt-1 text-gray-600">
                    {result.price.description}
                  </p>
                )}
                
                <button 
                  className={`mt-2 px-3 py-1 text-sm rounded-md ${
                    addedLocations[result.placeId] 
                      ? 'bg-green-600 text-white' 
                      : 'text-blue-600 border border-blue-500 hover:bg-blue-50'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent the li onClick from firing
                    handleSelectResult(result);
                  }}
                >
                  {addedLocations[result.placeId] ? 'Added to Trip ✓' : 'Add to Trip'}
                </button>
              </li>
            ))}
          </ul>
        )}

        {hasMoreResults && (
          <div className="p-4 flex justify-center">
            <button
              onClick={onLoadMore}
              disabled={isLoading}
              className="btn btn-secondary"
            >
              {isLoading ? 'Loading...' : 'Load more results'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search; 