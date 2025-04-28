import React from 'react';
import { SerialControl } from './SerialControl';
import { DroneList } from './DroneList';
import { useSerialContext } from '../context/SerialContext';
import { useDroneContext } from '../context/DroneContext';
import { MessageSquareText, MapPin } from 'lucide-react';

export const ControlPanel: React.FC = () => {
  const { isConnected } = useSerialContext();
  const { rawData } = useDroneContext();
  
  return (
    <div className="w-full md:w-96 bg-gray-800 border-t md:border-t-0 md:border-l border-gray-700 flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <SerialControl />
      </div>
      
      <div className="flex-grow flex flex-col overflow-hidden">
        <div className="flex-grow overflow-auto p-4">
          <DroneList />
        </div>
        
        <details className="border-t border-gray-700">
          <summary className="p-4 cursor-pointer flex items-center text-sm font-medium text-gray-300 hover:text-white">
            <MessageSquareText className="w-4 h-4 mr-2" />
            Serial Data Log
          </summary>
          <div className="p-4 pt-0 bg-gray-900 overflow-auto max-h-48 text-xs font-mono">
            <pre className="whitespace-pre-wrap break-all">{rawData || 'No data received yet'}</pre>
          </div>
        </details>
      </div>
    </div>
  );
};