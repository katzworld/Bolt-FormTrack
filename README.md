# Bolt-FormTrack

[Edit in StackBlitz next generation editor ⚡️](https://stackblitz.com/~/github.com/katzworld/Bolt-FormTrack)

# Formation Flight Tracker

A real-time drone formation tracking system built with React, TypeScript, and Leaflet. This application provides a visual interface for monitoring multiple drones in formation, displaying their positions, telemetry data, and relative distances from a control tower position.

![Formation Flight Tracker](https://images.pexels.com/photos/442587/pexels-photo-442587.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2)

## Features

- 🗺️ Real-time map visualization using OpenStreetMap
- 📡 Serial port communication for live telemetry data
- 🛩️ Multi-drone tracking with individual status displays
- 🗼 Control tower position tracking and relative distance calculations
- 📊 Detailed telemetry data including:
  - Latitude/Longitude
  - Altitude
  - Ground Speed
  - Course Heading
  - Distance from Tower
  - Bearing from Tower

## Technologies Used

- React 18
- TypeScript
- Vite
- Leaflet Maps
- Web Serial API
- TailwindCSS
- Lucide Icons

## Prerequisites

- Modern web browser with Web Serial API support (Chrome, Edge)
- Node.js 18+ installed
- Compatible serial device for telemetry data

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/formation-flight-tracker.git
   cd formation-flight-tracker
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to the provided local URL

## Serial Data Format

The application expects serial data in the following format:

```
--- My GPS Data ---
GPS Latitude: [LAT]
GPS Longitude: [LON]
GPS Altitude: [ALT] m
GPS Speed: [SPEED] km/h

ID: [DRONE_ID]
Name: [DRONE_NAME]
Location: [LAT], [LON]
Altitude: [ALT] m
Speed: [SPEED] km/h
Course: [COURSE]°
Last Update: [TIME] ms ago
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- OpenStreetMap for providing the map tiles
- Leaflet.js team for the mapping library
- React team for the excellent framework
- All contributors who help improve this project
