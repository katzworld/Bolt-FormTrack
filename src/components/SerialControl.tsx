import React, { useState } from 'react';
import { useSerialContext } from '../context/SerialContext';
import { Usb, WifiOff, Wifi } from 'lucide-react';

export const SerialControl: React.FC = () => {
  const { connect, disconnect, isConnected, error } = useSerialContext();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await connect();
    } catch (err) {
      console.error('Failed to connect:', err);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center">
          <Usb className="mr-2 h-5 w-5" />
          Serial Connection
        </h2>
        <div className="flex items-center">
          {isConnected ? (
            <span className="flex items-center text-green-400 text-sm">
              <Wifi className="mr-1 h-4 w-4" />
              Connected
            </span>
          ) : (
            <span className="flex items-center text-red-400 text-sm">
              <WifiOff className="mr-1 h-4 w-4" />
              Disconnected
            </span>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-2 bg-red-900 bg-opacity-30 border border-red-700 rounded text-red-300 text-sm">
          {error}
        </div>
      )}

      <div className="flex space-x-2">
        {!isConnected ? (
          <button
            onClick={handleConnect}
            disabled={isConnecting}
            className={`flex-1 py-2 px-4 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium flex items-center justify-center ${
              isConnecting ? 'opacity-75 cursor-not-allowed' : ''
            }`}
          >
            {isConnecting ? 'Connecting...' : 'Connect to Device'}
          </button>
        ) : (
          <button
            onClick={disconnect}
            className="flex-1 py-2 px-4 rounded-md bg-red-600 hover:bg-red-700 text-white font-medium flex items-center justify-center"
          >
            Disconnect
          </button>
        )}
      </div>
    </div>
  );
};