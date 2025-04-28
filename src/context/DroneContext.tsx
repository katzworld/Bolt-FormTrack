import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSerialContext } from './SerialContext';
import { parseSerialData } from '../utils/dataParser';

export interface GpsData {
  latitude: number;
  longitude: number;
  altitude: number;
  speed: number;
}

export interface DroneData {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  altitude: number;
  speed: number;
  course: number;
  lastUpdate: number;
  distance?: number;
  courseTo?: number;
  relativeAltitude?: number;
}

interface DroneContextType {
  drones: Record<string, DroneData>;
  myGpsData: GpsData | null;
  rawData: string;
  activeDroneId: string | null;
  setActiveDroneId: (id: string | null) => void;
}

const DroneContext = createContext<DroneContextType | undefined>(undefined);

interface DroneProviderProps {
  children: ReactNode;
}

export const DroneProvider: React.FC<DroneProviderProps> = ({ children }) => {
  const { reader, isConnected } = useSerialContext();
  const [drones, setDrones] = useState<Record<string, DroneData>>({});
  const [myGpsData, setMyGpsData] = useState<GpsData | null>(null);
  const [rawData, setRawData] = useState<string>('');
  const [activeDroneId, setActiveDroneId] = useState<string | null>(null);

  // Handle serial data reading
  useEffect(() => {
    if (!reader || !isConnected) return;

    let buffer = '';
    let isCancelled = false;

    const readData = async () => {
      try {
        while (reader && !isCancelled) {
          const { value, done } = await reader.read();
          if (done) break;
          
          buffer += value;
          
          // Process complete messages (split by double newlines)
          const messages = buffer.split('\n\n');
          buffer = messages.pop() || ''; // Keep the last incomplete message
          
          for (const message of messages) {
            if (!message.trim()) continue;
            
            setRawData(prev => {
              const lines = [...prev.split('\n'), message];
              return lines.slice(-20).join('\n'); // Keep last 20 lines
            });
            
            const parsedData = parseSerialData(message);
            if (parsedData) {
              const { myGps, peers } = parsedData;
              
              if (myGps) {
                console.log('Setting GPS data:', myGps);
                setMyGpsData(myGps);
              }
              
              if (peers && peers.length > 0) {
                console.log('Setting drone data:', peers);
                setDrones(prev => {
                  const newDrones = { ...prev };
                  for (const peer of peers) {
                    if (myGps) {
                      peer.distance = calculateDistance(
                        myGps.latitude, myGps.longitude,
                        peer.latitude, peer.longitude
                      );
                      peer.relativeAltitude = peer.altitude - myGps.altitude;
                    }
                    newDrones[peer.id] = peer;
                  }
                  return newDrones;
                });
              }
            }
          }
        }
      } catch (error) {
        console.error('Error reading from serial port:', error);
      }
    };

    readData();

    return () => {
      isCancelled = true;
    };
  }, [reader, isConnected]);

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

    return parseFloat(distance.toFixed(2));
  };

  return (
    <DroneContext.Provider value={{ 
      drones, 
      myGpsData, 
      rawData,
      activeDroneId,
      setActiveDroneId
    }}>
      {children}
    </DroneContext.Provider>
  );
};

export const useDroneContext = () => {
  const context = useContext(DroneContext);
  if (context === undefined) {
    throw new Error('useDroneContext must be used within a DroneProvider');
  }
  return context;
};