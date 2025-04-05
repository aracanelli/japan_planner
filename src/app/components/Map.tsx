import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, DirectionsRenderer, Polyline } from '@react-google-maps/api';
import { MapPin, TravelMode } from '../types';
import { 
  DEFAULT_CENTER, 
  mapOptions, 
  TOKYO_TRAIN_LINES, 
  JAPAN_INTERCITY_LINES,
  OSAKA_TRAIN_LINES,
  KYOTO_TRAIN_LINES,
  NAGOYA_TRAIN_LINES
} from '../constants/mapConstants';
import PinDetails from './PinDetails';
import StationDetails from './StationDetails';

// Map container style
const containerStyle = {
  width: '100%',
  height: '100%'
};

interface MapProps {
  pins: MapPin[];
  selectedPins: MapPin[];
  onPinSelect: (id: string) => void;
  routeMode?: TravelMode;
  routeInfo?: any | null;
  onCalculateRoute?: (mode: TravelMode) => Promise<void>;
  isCalculating?: boolean;
}

// Add interface for station markers
interface StationMarker {
  id: string;
  name: string;
  position: google.maps.LatLngLiteral;
  line: {
    name: string;
    color: string;
  };
}

const Map: React.FC<MapProps> = ({ 
  pins, 
  selectedPins, 
  onPinSelect, 
  routeMode,
  routeInfo = null,
  onCalculateRoute = () => Promise.resolve(),
  isCalculating = false
}) => {
  const [activeInfoWindow, setActiveInfoWindow] = useState<string | null>(null);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [showTransitFailurePanel, setShowTransitFailurePanel] = useState(false);
  const [showTransitDetails, setShowTransitDetails] = useState(false);
  const [transitSteps, setTransitSteps] = useState<any[]>([]);
  const [showLegend, setShowLegend] = useState(true);
  const [mapView, setMapView] = useState<'tokyo' | 'japan' | 'osaka' | 'kyoto' | 'nagoya'>('tokyo');
  const [stationMarkers, setStationMarkers] = useState<StationMarker[]>([]);
  const [selectedStation, setSelectedStation] = useState<StationMarker | null>(null);
  const [selectedPin, setSelectedPin] = useState<MapPin | null>(null);
  const [showPinDetails, setShowPinDetails] = useState(false);
  const [showStationDetails, setShowStationDetails] = useState(false);
  const mapRef = useRef<google.maps.Map | null>(null);
  
  // Load Google Maps API
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: ['places']
  });
  
  // Debug pins
  useEffect(() => {
    if (!isLoaded) return;
    
    // When pins change, make sure we update marker visibility
    if (pins.length > 0 && mapRef.current) {
      // Force a re-render of the map when pins change
      const center = mapRef.current.getCenter();
      if (center) {
        google.maps.event.trigger(mapRef.current, 'resize');
        mapRef.current.setCenter(center);
      }
    }
  }, [pins, isLoaded]);

  // Set map center based on the selected view
  useEffect(() => {
    if (!isLoaded || !mapRef.current) return;
    
    let center = DEFAULT_CENTER;
    let zoom = 12;
    
    switch (mapView) {
      case 'japan':
        center = { lat: 36.5, lng: 138.0 }; // Center of Japan
        zoom = 6;
        break;
      case 'osaka':
        center = { lat: 34.6937, lng: 135.5023 }; // Osaka
        zoom = 12;
        break;
      case 'kyoto':
        center = { lat: 35.0116, lng: 135.7681 }; // Kyoto
        zoom = 12;
        break;
      case 'nagoya':
        center = { lat: 35.1815, lng: 136.9066 }; // Nagoya
        zoom = 12;
        break;
      default:
        center = DEFAULT_CENTER; // Tokyo
        zoom = 12;
    }
    
    mapRef.current.setCenter(center);
    mapRef.current.setZoom(zoom);
  }, [mapView, isLoaded]);

  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  const formatPriceInfo = (pin: MapPin) => {
    // Implementation of formatPriceInfo function
    return null;
  };

  // Function to get appropriate color for transit line
  const getTransitLineColor = (line: { vehicle?: { type?: string }, color?: string }) => {
    if (!line) return '#1A73E8';
    if (line.color) return line.color;
    
    // Default colors based on vehicle type
    switch(line.vehicle?.type?.toUpperCase()) {
      case 'SUBWAY':
      case 'METRO_RAIL': return '#0277BD';
      case 'RAIL': return '#E65100';
      case 'BUS': return '#2E7D32';
      case 'TRAM': return '#6A1B9A';
      default: return '#1A73E8';
    }
  };

  // Add function to handle station selection
  const handleStationSelect = useCallback((station: StationMarker) => {
    // Create a temporary MapPin from the station data
    const stationPin: MapPin = {
      id: `station-${station.id}`,
      name: `${station.name} Station (${station.line.name})`,
      position: station.position,
      address: `Train Station on ${station.line.name} Line`,
      isSelected: true,
      types: ['transit_station', 'train_station'],
      placeId: `station-${station.id}`,
      isStation: true,
    };
    
    // Set the selected station
    setSelectedStation(station);
    setShowStationDetails(true);
    
    // Store the station position in sessionStorage for later retrieval
    try {
      sessionStorage.setItem(`station-${station.id}-position`, JSON.stringify(station.position));
    } catch (e) {
      console.error('Failed to store station position:', e);
    }
    
    // Call the onPinSelect function with the station ID
    onPinSelect(stationPin.id);
  }, [onPinSelect]);

  // Generate station markers when map view changes
  useEffect(() => {
    if (!isLoaded) return;
    
    const newStationMarkers: StationMarker[] = [];
    
    // Helper function to add stations from a train line to the markers array
    const addStationsFromLine = (
      line: { 
        name: string; 
        color: string; 
        stations: Array<{ 
          name: string; 
          position: google.maps.LatLngLiteral 
        }> 
      }, 
      viewFilter: string
    ) => {
      line.stations.forEach((station, index) => {
        // Only add stations if we're in the right view
        if (mapView === viewFilter || mapView === 'japan') {
          newStationMarkers.push({
            id: `${line.name}-${station.name}-${index}`,
            name: station.name,
            position: station.position,
            line: {
              name: line.name,
              color: line.color
            }
          });
        }
      });
    };
    
    // Add stations from each line
    if (mapView === 'japan') {
      JAPAN_INTERCITY_LINES.forEach(line => {
        addStationsFromLine(line, 'japan');
      });
    }
    
    TOKYO_TRAIN_LINES.forEach(line => {
      addStationsFromLine(line, 'tokyo');
    });
    
    OSAKA_TRAIN_LINES.forEach(line => {
      addStationsFromLine(line, 'osaka');
    });
    
    KYOTO_TRAIN_LINES.forEach(line => {
      addStationsFromLine(line, 'kyoto');
    });
    
    NAGOYA_TRAIN_LINES.forEach(line => {
      addStationsFromLine(line, 'nagoya');
    });
    
    setStationMarkers(newStationMarkers);
  }, [mapView, isLoaded]);

  if (loadError) {
    return <div className="flex items-center justify-center h-full">Error loading maps. Please check your API key.</div>;
  }

  if (!isLoaded) {
    return <div className="flex items-center justify-center h-full">Loading maps...</div>;
  }

  return (
    <div className="relative h-full w-full">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={DEFAULT_CENTER}
        zoom={12}
        options={mapOptions}
        onLoad={onMapLoad}
      >
        {/* Intercity Shinkansen Lines (visible when zoomed out) */}
        {mapView === 'japan' && JAPAN_INTERCITY_LINES.map((line) => (
          <React.Fragment key={line.name}>
            {/* Draw the train line */}
            <Polyline
              path={line.stations.map(station => station.position)}
              options={{
                strokeColor: line.color,
                strokeWeight: 6,
                strokeOpacity: 0.8,
                zIndex: 10
              }}
            />
            
            {/* Add station markers - replaced with clickable markers */}
          </React.Fragment>
        ))}

        {/* Tokyo Train Lines */}
        {(mapView === 'tokyo' || mapView === 'japan') && TOKYO_TRAIN_LINES.map((line) => (
          <React.Fragment key={line.name}>
            {/* Draw the train line */}
            <Polyline
              path={line.stations.map(station => station.position)}
              options={{
                strokeColor: line.color,
                strokeWeight: mapView === 'japan' ? 3 : 5,
                strokeOpacity: 0.8,
                zIndex: 10
              }}
            />
            
            {/* Station markers are now added through stationMarkers state */}
          </React.Fragment>
        ))}

        {/* Osaka Train Lines */}
        {(mapView === 'osaka' || mapView === 'japan') && OSAKA_TRAIN_LINES.map((line) => (
          <React.Fragment key={line.name}>
            {/* Draw the train line */}
            <Polyline
              path={line.stations.map(station => station.position)}
              options={{
                strokeColor: line.color,
                strokeWeight: mapView === 'japan' ? 3 : 5,
                strokeOpacity: 0.8,
                zIndex: 10
              }}
            />
            
            {/* Station markers are now added through stationMarkers state */}
          </React.Fragment>
        ))}

        {/* Kyoto Train Lines */}
        {(mapView === 'kyoto' || mapView === 'japan') && KYOTO_TRAIN_LINES.map((line) => (
          <React.Fragment key={line.name}>
            {/* Draw the train line */}
            <Polyline
              path={line.stations.map(station => station.position)}
              options={{
                strokeColor: line.color,
                strokeWeight: mapView === 'japan' ? 3 : 5,
                strokeOpacity: 0.8,
                zIndex: 10
              }}
            />
            
            {/* Station markers are now added through stationMarkers state */}
          </React.Fragment>
        ))}

        {/* Nagoya Train Lines */}
        {(mapView === 'nagoya' || mapView === 'japan') && NAGOYA_TRAIN_LINES.map((line) => (
          <React.Fragment key={line.name}>
            {/* Draw the train line */}
            <Polyline
              path={line.stations.map(station => station.position)}
              options={{
                strokeColor: line.color,
                strokeWeight: mapView === 'japan' ? 3 : 5,
                strokeOpacity: 0.8,
                zIndex: 10
              }}
            />
            
            {/* Station markers are now added through stationMarkers state */}
          </React.Fragment>
        ))}

        {/* Render all station markers as clickable */}
        {stationMarkers.map((station) => (
          <Marker
            key={station.id}
            position={station.position}
            onClick={() => handleStationSelect(station)}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              scale: 5,
              fillColor: station.line.color,
              fillOpacity: 1,
              strokeColor: '#FFFFFF',
              strokeWeight: 2
            }}
            title={`${station.name} Station (${station.line.name})`}
            zIndex={50}
          >
            {activeInfoWindow === station.id && (
              <InfoWindow onCloseClick={() => setActiveInfoWindow(null)}>
                <div className="info-window p-2">
                  <h3 className="font-bold">{station.name} Station</h3>
                  <p className="text-sm">{station.line.name} Line</p>
                  <div className="mt-2">
                    <button 
                      onClick={() => {
                        // Create a MapPin for the station to use in routing
                        const stationPin: MapPin = {
                          id: `station-${station.id}`,
                          name: `${station.name} Station (${station.line.name})`,
                          position: station.position,
                          address: `Train Station on ${station.line.name} Line`,
                          isSelected: true,
                          types: ['transit_station', 'train_station'],
                          placeId: `station-${station.id}`,
                        };
                        
                        // Store the station position in sessionStorage for later retrieval
                        try {
                          sessionStorage.setItem(`station-${station.id}-position`, JSON.stringify(station.position));
                        } catch (e) {
                          console.error('Failed to store station position:', e);
                        }
                        
                        // Call onPinSelect to select this station for directions
                        onPinSelect(`station-${station.id}`);
                        
                        // Close the info window
                        setActiveInfoWindow(null);
                      }}
                      className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded"
                    >
                      Use for Directions
                    </button>
                  </div>
                </div>
              </InfoWindow>
            )}
          </Marker>
        ))}

        {/* User pins */}
        {pins.map((pin) => (
          <Marker
            key={pin.id}
            position={pin.position}
            icon={{
              url: pin.isSelected 
                ? '/pin-selected.svg'
                : '/pin-default.svg',
              scaledSize: new window.google.maps.Size(36, 36),
            }}
            onClick={() => {
              onPinSelect(pin.id);
              setSelectedPin(pin);
              setShowPinDetails(true);
            }}
          />
        ))}

        {directions && (
          <DirectionsRenderer
            directions={directions}
            options={{
              suppressMarkers: true,
              polylineOptions: {
                strokeColor: '#3B82F6',
                strokeWeight: 5,
                strokeOpacity: 0.7,
                zIndex: 20 // Make routes appear on top of train lines
              }
            }}
          />
        )}
      </GoogleMap>
      
      {/* City/Region Selection Controls */}
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-md p-2">
        <div className="flex flex-col space-y-1">
          <button
            onClick={() => setMapView('japan')}
            className={`px-3 py-1 text-sm rounded-md ${mapView === 'japan' ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
          >
            All Japan
          </button>
          <button
            onClick={() => setMapView('tokyo')}
            className={`px-3 py-1 text-sm rounded-md ${mapView === 'tokyo' ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
          >
            Tokyo
          </button>
          <button
            onClick={() => setMapView('osaka')}
            className={`px-3 py-1 text-sm rounded-md ${mapView === 'osaka' ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
          >
            Osaka
          </button>
          <button
            onClick={() => setMapView('kyoto')}
            className={`px-3 py-1 text-sm rounded-md ${mapView === 'kyoto' ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
          >
            Kyoto
          </button>
          <button
            onClick={() => setMapView('nagoya')}
            className={`px-3 py-1 text-sm rounded-md ${mapView === 'nagoya' ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
          >
            Nagoya
          </button>
        </div>
      </div>
      
      {/* Train Lines Legend */}
      {showLegend && (
        <div className="absolute top-4 left-4 bg-white rounded-lg shadow-md p-3 max-w-xs max-h-[60vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium text-sm">
              {mapView === 'japan' ? 'Japan Rail Network' : 
               mapView === 'tokyo' ? 'Tokyo Train Lines' :
               mapView === 'osaka' ? 'Osaka Train Lines' :
               mapView === 'kyoto' ? 'Kyoto Train Lines' :
               'Nagoya Train Lines'}
            </h3>
            <button 
              onClick={() => setShowLegend(false)}
              className="text-gray-500 hover:text-gray-700 text-xs"
            >
              Hide
            </button>
          </div>
          
          <div className="space-y-2">
            {/* Show Shinkansen lines in Japan view */}
            {mapView === 'japan' && JAPAN_INTERCITY_LINES.map(line => (
              <div key={line.name} className="flex items-center">
                <div
                  className="w-4 h-4 rounded-full mr-2"
                  style={{ backgroundColor: line.color }}
                ></div>
                <span className="text-xs">{line.name} <span className="text-gray-500">({line.description})</span></span>
              </div>
            ))}
            
            {/* Show Tokyo lines when in Tokyo or Japan view */}
            {(mapView === 'tokyo' || mapView === 'japan') && (
              <>
                {mapView === 'japan' && <div className="text-xs font-medium mt-3 mb-1">Tokyo Area:</div>}
                {TOKYO_TRAIN_LINES.map(line => (
                  <div key={line.name} className="flex items-center">
                    <div
                      className="w-4 h-4 rounded-full mr-2"
                      style={{ backgroundColor: line.color }}
                    ></div>
                    <span className="text-xs">{line.name} {mapView === 'tokyo' && `(${line.stations.length} stations)`}</span>
                  </div>
                ))}
              </>
            )}
            
            {/* Show Osaka lines when in Osaka or Japan view */}
            {(mapView === 'osaka' || mapView === 'japan') && (
              <>
                {mapView === 'japan' && <div className="text-xs font-medium mt-3 mb-1">Osaka Area:</div>}
                {OSAKA_TRAIN_LINES.map(line => (
                  <div key={line.name} className="flex items-center">
                    <div
                      className="w-4 h-4 rounded-full mr-2"
                      style={{ backgroundColor: line.color }}
                    ></div>
                    <span className="text-xs">{line.name} {mapView === 'osaka' && `(${line.stations.length} stations)`}</span>
                  </div>
                ))}
              </>
            )}
            
            {/* Show Kyoto lines when in Kyoto or Japan view */}
            {(mapView === 'kyoto' || mapView === 'japan') && (
              <>
                {mapView === 'japan' && <div className="text-xs font-medium mt-3 mb-1">Kyoto Area:</div>}
                {KYOTO_TRAIN_LINES.map(line => (
                  <div key={line.name} className="flex items-center">
                    <div
                      className="w-4 h-4 rounded-full mr-2"
                      style={{ backgroundColor: line.color }}
                    ></div>
                    <span className="text-xs">{line.name} {mapView === 'kyoto' && `(${line.stations.length} stations)`}</span>
                  </div>
                ))}
              </>
            )}
            
            {/* Show Nagoya lines when in Nagoya or Japan view */}
            {(mapView === 'nagoya' || mapView === 'japan') && (
              <>
                {mapView === 'japan' && <div className="text-xs font-medium mt-3 mb-1">Nagoya Area:</div>}
                {NAGOYA_TRAIN_LINES.map(line => (
                  <div key={line.name} className="flex items-center">
                    <div
                      className="w-4 h-4 rounded-full mr-2"
                      style={{ backgroundColor: line.color }}
                    ></div>
                    <span className="text-xs">{line.name} {mapView === 'nagoya' && `(${line.stations.length} stations)`}</span>
                  </div>
                ))}
              </>
            )}
          </div>
          
          <div className="mt-3 text-xs text-gray-500">
            <div className="flex items-center mb-1">
              <div className="w-4 h-4 flex items-center justify-center mr-2">
                <div className="w-2 h-2 bg-white border border-gray-400 rounded-full"></div>
              </div>
              <span>Train Station</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 mr-2 flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#D00" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 22s-8-4.5-8-11.8C4 5.5 7.5 2 12 2s8 3.5 8 8.2c0 7.3-8 11.8-8 11.8z" />
                  <circle cx="12" cy="10" r="3" fill="white" />
                </svg>
              </div>
              <span>Your Saved Location</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Toggle Legend Button (when hidden) */}
      {!showLegend && (
        <button
          onClick={() => setShowLegend(true)}
          className="absolute top-4 left-4 bg-white rounded-lg shadow-md px-3 py-2 text-sm"
        >
          Show Train Lines
        </button>
      )}
      
      {/* Transit Failure Panel */}
      {showTransitFailurePanel && (
        <div className="absolute left-4 right-4 bottom-4 md:w-1/3 md:right-auto bg-white rounded-lg shadow-lg overflow-hidden max-h-[60vh] flex flex-col">
          <div className="bg-red-600 text-white px-4 py-2 flex justify-between items-center">
            <h3 className="font-medium">Transit Not Available</h3>
            <button 
              onClick={() => setShowTransitFailurePanel(false)}
              className="text-white hover:text-gray-200"
            >
              <span>×</span>
            </button>
          </div>
          <div className="p-4">
            <p className="mb-3">
              Our app has limited access to Japan's transit data. For the best transit directions:
            </p>
            
            {selectedPins.length === 2 && (
              <div className="mb-4">
                <a 
                  href={`https://www.google.com/maps/dir/?api=1&origin=${selectedPins[0].position.lat},${selectedPins[0].position.lng}&destination=${selectedPins[1].position.lat},${selectedPins[1].position.lng}&travelmode=transit`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white text-center rounded-md transition duration-200 mb-3"
                >
                  <span className="mr-2">🚆</span> Open in Google Maps
                </a>
                <p className="text-xs text-gray-600 text-center">
                  Google Maps has direct access to complete Japan transit data
                </p>
              </div>
            )}
            
            <p className="mb-2 text-sm">
              You can also check these Japan-specific transit services:
            </p>
            <div className="flex space-x-2 mb-4">
              <a 
                href="https://www.hyperdia.com/en/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex-1 py-1.5 px-3 bg-gray-100 hover:bg-gray-200 text-gray-800 text-center rounded-md text-sm"
              >
                Hyperdia
              </a>
              <a 
                href="https://www.jorudan.co.jp/english/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex-1 py-1.5 px-3 bg-gray-100 hover:bg-gray-200 text-gray-800 text-center rounded-md text-sm"
              >
                Jorudan
              </a>
            </div>
            
            <div className="flex justify-between">
              <button 
                onClick={() => {
                  setShowTransitFailurePanel(false);
                  // Call the parent component's route mode handler
                  if (onPinSelect) {
                    // Trigger re-selection of the same pins to change mode
                    onPinSelect(selectedPins[0].id);
                    onPinSelect(selectedPins[1].id);
                  }
                }} 
                className="px-3 py-1.5 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 text-sm"
              >
                Try Again
              </button>
              <button 
                onClick={() => setShowTransitFailurePanel(false)} 
                className="px-3 py-1.5 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Route Calculation Control Panel */}
      {selectedPins.length === 2 && (
        <div className="absolute left-4 bottom-4 bg-white rounded-lg shadow-lg p-3">
          <div className="flex flex-col space-y-2">
            <h3 className="text-sm font-medium text-gray-700 mb-1">Get Directions</h3>
            
            {/* Google Maps buttons for different travel modes */}
            <div className="grid grid-cols-3 gap-2 mb-2">
              <a
                href={`https://www.google.com/maps/dir/?api=1&origin=${selectedPins[0].position.lat},${selectedPins[0].position.lng}&destination=${selectedPins[1].position.lat},${selectedPins[1].position.lng}&travelmode=transit`}
                target="_blank" 
                rel="noopener noreferrer"
                className="py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white text-center rounded-md transition duration-200 text-sm flex items-center justify-center"
                onClick={() => onCalculateRoute('TRANSIT')}
              >
                <span className="mr-1">🚆</span> Transit
              </a>
              <a
                href={`https://www.google.com/maps/dir/?api=1&origin=${selectedPins[0].position.lat},${selectedPins[0].position.lng}&destination=${selectedPins[1].position.lat},${selectedPins[1].position.lng}&travelmode=walking`}
                target="_blank" 
                rel="noopener noreferrer"
                className="py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white text-center rounded-md transition duration-200 text-sm flex items-center justify-center"
                onClick={() => onCalculateRoute('WALKING')}
              >
                <span className="mr-1">🚶</span> Walk
              </a>
              <a
                href={`https://www.google.com/maps/dir/?api=1&origin=${selectedPins[0].position.lat},${selectedPins[0].position.lng}&destination=${selectedPins[1].position.lat},${selectedPins[1].position.lng}&travelmode=driving`}
                target="_blank" 
                rel="noopener noreferrer"
                className="py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white text-center rounded-md transition duration-200 text-sm flex items-center justify-center"
                onClick={() => onCalculateRoute('DRIVING')}
              >
                <span className="mr-1">🚗</span> Drive
              </a>
            </div>
            
            <p className="text-xs text-gray-600 text-center mb-2">
              Google Maps provides the most accurate routes in Japan
            </p>
            
            <button 
              onClick={() => {
                // Deselect both pins
                if (selectedPins.length > 0) {
                  onPinSelect(selectedPins[0].id);
                  if (selectedPins.length > 1) {
                    onPinSelect(selectedPins[1].id);
                  }
                }
              }}
              className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm w-full"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {showPinDetails && selectedPin && (
        <div className="absolute bottom-10 left-0 right-0 p-4 flex justify-center z-50">
          <div className="max-h-[80vh] overflow-y-auto">
            <PinDetails 
              pin={selectedPin} 
              onClose={() => setShowPinDetails(false)}
              isReadOnly={false}
            />
          </div>
        </div>
      )}

      {showStationDetails && selectedStation && (
        <div className="absolute bottom-10 left-0 right-0 p-4 flex justify-center z-50">
          <div className="max-h-[80vh] overflow-y-auto">
            <StationDetails 
              station={selectedStation} 
              onClose={() => {
                setShowStationDetails(false);
                setActiveInfoWindow(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Map;