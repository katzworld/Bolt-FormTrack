import React from 'react';
import { useDroneContext } from '../context/DroneContext';
import { Plane, Compass, Clock, Wifi } from 'lucide-react';

export const DroneList: React.FC = () => {
  const { drones, myGpsData, activeDroneId, setActiveDroneId } = useDroneContext();

  if (Object.keys(drones).length === 0) {
    return (
      <div className="text-center py-6 text-gray-400">
        <Plane className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p>No drones detected.</p>
        <p className="text-sm mt-2">Connect to a serial device to see drones.</p>
      </div>
    );
  }

  const formatTimeSince = (ms: number) => {
    if (ms < 1000) return `${ms} ms ago`;
    if (ms < 60000) return `${Math.floor(ms / 1000)} seconds ago`;
    return `${Math.floor(ms / 60000)} minutes ago`;
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold flex items-center">
        <Plane className="mr-2 h-5 w-5" />
        Detected Drones
      </h2>

      <div className="space-y-3">
        {Object.entries(drones).map(([id, drone]) => {
          const isActive = id === activeDroneId;
          const isStale = drone.lastUpdate > 30000; // 30 seconds

          return (
            <div 
              key={id}
              className={`p-3 rounded-lg border ${
                isActive 
                  ? 'bg-blue-900 bg-opacity-30 border-blue-700' 
                  : 'bg-gray-800 border-gray-700 hover:border-gray-600'
              } cursor-pointer transition-colors`}
              onClick={() => setActiveDroneId(id)}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="font-medium text-lg flex items-center">
                  {drone.name}
                  <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                    isStale ? 'bg-yellow-800 text-yellow-300' : 'bg-green-800 text-green-300'
                  }`}>
                    {id}
                  </span>
                </div>
                <div className="flex items-center text-xs text-gray-400">
                  <Clock className="w-3 h-3 mr-1" />
                  {formatTimeSince(drone.lastUpdate)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center">
                  <Compass className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                  <span className="text-gray-300">{drone.latitude.toFixed(6)}, {drone.longitude.toFixed(6)}</span>
                </div>
                <div className="flex justify-between">
                  <div className="flex items-center">
                    <span className="text-gray-400 mr-1">Alt:</span>
                    <span className="text-gray-300">{drone.altitude} m</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-400 mr-1">Speed:</span>
                    <span className="text-gray-300">{drone.speed} km/h</span>
                  </div>
                </div>
                
                {myGpsData && (
                  <div className="flex items-center col-span-2 mt-1 text-xs text-gray-400">
                    <span className="mr-2">Distance: {drone.distance || '?'} m</span>
                    <span>Relative Alt: {drone.relativeAltitude || '?'} m</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};