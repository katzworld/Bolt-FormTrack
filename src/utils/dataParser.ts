import { DroneData, GpsData } from '../context/DroneContext';

interface ParsedData {
  myGps: GpsData | null;
  peers: DroneData[];
}

export const parseSerialData = (data: string): ParsedData | null => {
  if (!data) return null;

  const parsedData: ParsedData = {
    myGps: null,
    peers: []
  };

  // Handle different formats of data
  try {
    // Looking for GPS data section with more flexible matching
    const gpsMatch = data.match(/GPS Latitude:\s*([\d.-]+)\s*GPS Longitude:\s*([\d.-]+)\s*GPS Altitude:\s*([\d.-]+)\s*m\s*GPS Speed:\s*([\d.-]+)\s*km\/h/);
    
    if (gpsMatch) {
      const [_, lat, lon, alt, speed] = gpsMatch;
      parsedData.myGps = {
        latitude: parseFloat(lat),
        longitude: parseFloat(lon),
        altitude: parseFloat(alt),
        speed: parseFloat(speed)
      };
      console.log('Parsed GPS:', parsedData.myGps);
    }

    // Looking for peer information with more flexible matching
    const peerMatches = data.matchAll(/ID:\s*([A-Za-z0-9]+)(.*?)(?=ID:|$)/gs);
    
    for (const match of peerMatches) {
      const [fullMatch, peerId, peerInfo] = match;
      
      const nameMatch = peerInfo.match(/Name:\s*([^\n]+)/);
      const locationMatch = peerInfo.match(/Location:\s*([\d.-]+),\s*([\d.-]+)/);
      const altitudeMatch = peerInfo.match(/Altitude:\s*([\d.-]+)\s*m/);
      const speedMatch = peerInfo.match(/Speed:\s*([\d.-]+)\s*km\/h/);
      const courseMatch = peerInfo.match(/Course:\s*([\d.-]+)°/);
      const lastUpdateMatch = peerInfo.match(/Last Update:\s*(\d+)\s*ms ago/);
      
      if (nameMatch && locationMatch) {
        const peer: DroneData = {
          id: peerId.trim(),
          name: nameMatch[1].trim(),
          latitude: parseFloat(locationMatch[1]),
          longitude: parseFloat(locationMatch[2]),
          altitude: altitudeMatch ? parseFloat(altitudeMatch[1]) : 0,
          speed: speedMatch ? parseFloat(speedMatch[1]) : 0,
          course: courseMatch ? (parseFloat(courseMatch[1]) % 360) : 0, // Normalize course to 0-359 degrees
          lastUpdate: lastUpdateMatch ? parseInt(lastUpdateMatch[1]) : 0
        };
        
        // Add distance and relative altitude if available
        const distanceMatch = peerInfo.match(/Distance:\s*([\d.-]+)\s*m/);
        const relAltMatch = peerInfo.match(/Relative Altitude:\s*([\d.-]+)\s*m/);
        
        if (distanceMatch) {
          peer.distance = parseFloat(distanceMatch[1]);
        }
        
        if (relAltMatch) {
          peer.relativeAltitude = parseFloat(relAltMatch[1]);
        }
        
        console.log('Parsed Peer:', peer);
        parsedData.peers.push(peer);
      }
    }

    return parsedData;
  } catch (error) {
    console.error('Error parsing serial data:', error);
    return null;
  }
};