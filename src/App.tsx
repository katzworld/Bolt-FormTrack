import React from 'react';
import { MapSection } from './components/MapSection';
import { ControlPanel } from './components/ControlPanel';
import { SerialProvider } from './context/SerialContext';
import { DroneProvider } from './context/DroneContext';

function App() {
  return (
    <SerialProvider>
      <DroneProvider>
        <div className="min-h-screen flex flex-col bg-gray-900 text-white">
          <header className="bg-gray-800 p-4 shadow-md">
            <div className="container mx-auto flex justify-between items-center">
              <h1 className="text-2xl font-bold flex items-center">
                <span className="mr-2">Drone Tracker</span>
              </h1>
            </div>
          </header>

          <main className="flex-grow flex flex-col md:flex-row">
            <MapSection />
            <ControlPanel />
          </main>

          <footer className="bg-gray-800 py-2 px-4 text-xs text-gray-400 text-center">
            <div className="container mx-auto">
              Drone Tracker &copy; {new Date().getFullYear()}
            </div>
          </footer>
        </div>
      </DroneProvider>
    </SerialProvider>
  );
}

export default App;