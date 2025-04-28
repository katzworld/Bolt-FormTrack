import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import { useDroneContext } from '../context/DroneContext';
import { Compass, Wifi, Radio } from 'lucide-react';

// Fix for default marker icons in Leaflet with Vite
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface DroneMarkerProps {
  droneId: string;
  lat: number;
  lng: number;
  name: string;
  altitude: number;
  speed: number;
  course: number;
  lastUpdate: number;
  towerLat?: number;
  towerLng?: number;
}

const MapController: React.FC = () => {
  const map = useMap();
  const { drones, activeDroneId } = useDroneContext();
  const userInteractedRef = useRef(false);

  useEffect(() => {
    const handleInteraction = () => {
      userInteractedRef.current = true;
    };

    map.on('zoom', handleInteraction);
    map.on('drag', handleInteraction);

    return () => {
      map.off('zoom', handleInteraction);
      map.off('drag', handleInteraction);
    };
  }, [map]);
  
  useEffect(() => {
    if (activeDroneId && drones[activeDroneId] && !userInteractedRef.current) {
      const { latitude, longitude } = drones[activeDroneId];
      map.setView([latitude, longitude], 18);
    }
  }, [map, drones, activeDroneId]);

  return null;
};

const ATCMarker: React.FC<{ lat: number; lng: number; altitude: number; speed: number }> = ({
  lat, lng, altitude, speed
}) => {
  const atcIcon = L.divIcon({
    className: 'atc-marker',
    html: `<div class="w-6 h-6 bg-red-500 rounded-md border-2 border-white flex items-center justify-center text-white relative">
            <div class="absolute w-1 h-4 bg-white left-1/2 -top-3 transform -translate-x-1/2"></div>
            <div class="absolute w-4 h-1 bg-white top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
            <div class="absolute w-3 h-1 bg-white top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-45"></div>
            <div class="absolute w-3 h-1 bg-white top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -rotate-45"></div>
          </div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -24],
  });

  return (
    <Marker position={[lat, lng]} icon={atcIcon}>
      <Popup className="atc-popup">
        <div className="text-gray-800 min-w-[200px]">
          <div className="flex items-center justify-between border-b border-gray-200 pb-2 mb-2">
            <h3 className="text-lg font-bold flex items-center">
              <Radio className="w-4 h-4 mr-2" />
              ATC Location
            </h3>
          </div>
          
          <div className="grid grid-cols-1 gap-2 text-sm">
            <div className="bg-gray-50 p-2 rounded">
              <div className="font-medium mb-1">Location</div>
              <div>{lat.toFixed(6)}, {lng.toFixed(6)}</div>
            </div>
            
            <div className="bg-gray-50 p-2 rounded">
              <div className="font-medium mb-1">Altitude</div>
              <div>{altitude.toFixed(1)} m</div>
            </div>
            
            <div className="bg-gray-50 p-2 rounded">
              <div className="font-medium mb-1">Ground Speed</div>
              <div>{speed.toFixed(1)} km/h</div>
            </div>
          </div>
        </div>
      </Popup>
    </Marker>
  );
};

const calculateBearing = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) -
           Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);

  let θ = Math.atan2(y, x);
  θ = θ * 180 / Math.PI;
  return (θ + 360) % 360;
};

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
           Math.cos(φ1) * Math.cos(φ2) *
           Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance);
};

const DroneMarker: React.FC<DroneMarkerProps> = ({ 
  droneId, lat, lng, name, altitude, speed, course, lastUpdate, towerLat, towerLng
}) => {
  const { setActiveDroneId } = useDroneContext();
  
  const droneIcon = L.divIcon({
    className: 'drone-marker',
    html: `<div class="w-5 h-5 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center text-white text-xs relative" style="transform: rotate(${course}deg);">
            <div class="absolute w-4 h-4 flex items-center justify-center">
              <div class="absolute w-3 h-1 bg-white" style="clip-path: polygon(0 0, 100% 50%, 0 100%);"></div>
              <div class="absolute w-2 h-0.5 bg-white -left-1"></div>
              <div class="absolute w-1 h-3 bg-white" style="left: -0.1rem;"></div>
            </div>
          </div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10],
  });

  const formatTimeSince = (ms: number) => {
    if (ms < 1000) return `${ms} ms ago`;
    if (ms < 60000) return `${Math.floor(ms / 1000)} seconds ago`;
    return `${Math.floor(ms / 60000)} minutes ago`;
  };

  const towerInfo = towerLat && towerLng ? {
    distance: calculateDistance(towerLat, towerLng, lat, lng),
    bearing: Math.round(calculateBearing(towerLat, towerLng, lat, lng))
  } : null;

  return (
    <Marker 
      position={[lat, lng]} 
      icon={droneIcon}
      eventHandlers={{
        click: () => {
          setActiveDroneId(droneId);
        },
      }}
    >
      <Popup className="drone-popup">
        <div className="text-gray-800 min-w-[250px]">
          <div className="flex items-center justify-between border-b border-gray-200 pb-2 mb-2">
            <h3 className="text-lg font-bold">{name}</h3>
            <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">{droneId}</span>
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="col-span-2 bg-gray-50 p-2 rounded">
              <div className="font-medium mb-1">Location</div>
              <div>{lat.toFixed(6)}, {lng.toFixed(6)}</div>
            </div>
            
            {towerInfo && (
              <div className="col-span-2 bg-blue-50 p-2 rounded">
                <div className="font-medium mb-1 text-blue-800">From Tower</div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-blue-600">Distance:</span>
                    <span className="ml-1">{towerInfo.distance}m</span>
                  </div>
                  <div>
                    <span className="text-blue-600">Bearing:</span>
                    <span className="ml-1">{towerInfo.bearing}°</span>
                  </div>
                </div>
              </div>
            )}
            
            <div className="bg-gray-50 p-2 rounded">
              <div className="font-medium mb-1">Altitude</div>
              <div>{altitude} m</div>
            </div>
            
            <div className="bg-gray-50 p-2 rounded">
              <div className="font-medium mb-1">Speed</div>
              <div>{speed} km/h</div>
            </div>
            
            <div className="bg-gray-50 p-2 rounded">
              <div className="font-medium mb-1">Course</div>
              <div>{course}°</div>
            </div>
            
            <div className="bg-gray-50 p-2 rounded">
              <div className="font-medium mb-1">Last Update</div>
              <div>{formatTimeSince(lastUpdate)}</div>
            </div>
          </div>
        </div>
      </Popup>
    </Marker>
  );
};

export const MapSection: React.FC = () => {
  const { drones, myGpsData } = useDroneContext();
  const defaultCenter = myGpsData?.latitude && myGpsData?.longitude 
    ? [myGpsData.latitude, myGpsData.longitude] 
    : [39.4367, -76.3231];
  
  return (
    <div className="relative w-full h-[70vh] md:h-auto md:flex-grow">
      <MapContainer 
        center={defaultCenter as [number, number]} 
        zoom={18} 
        style={{ height: '100%', width: '100%' }} 
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ZoomControl position="bottomright" />
        <MapController />
        
        {myGpsData && (
          <ATCMarker
            lat={myGpsData.latitude}
            lng={myGpsData.longitude}
            altitude={myGpsData.altitude}
            speed={myGpsData.speed}
          />
        )}
        
        {Object.entries(drones).map(([id, drone]) => (
          <DroneMarker
            key={id}
            droneId={id}
            lat={drone.latitude}
            lng={drone.longitude}
            name={drone.name}
            altitude={drone.altitude}
            speed={drone.speed}
            course={drone.course}
            lastUpdate={drone.lastUpdate}
            towerLat={myGpsData?.latitude}
            towerLng={myGpsData?.longitude}
          />
        ))}
      </MapContainer>
      
      <div className="absolute top-4 right-4 bg-gray-800 bg-opacity-70 p-2 rounded-md text-xs text-white flex items-center space-x-2">
        <Compass className="h-4 w-4" />
        <span>
          {myGpsData ? `${myGpsData.latitude.toFixed(6)}, ${myGpsData.longitude.toFixed(6)}` : 'No GPS data'}
        </span>
      </div>
      
      <div className="absolute bottom-4 left-4 bg-gray-800 bg-opacity-70 p-2 rounded-md text-xs text-white flex items-center space-x-2">
        <Wifi className="h-4 w-4" />
        <span>
          {Object.keys(drones).length} drone{Object.keys(drones).length !== 1 ? 's' : ''} connected
        </span>
      </div>
    </div>
  );
};