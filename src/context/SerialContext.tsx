import React, { createContext, useContext, useState, ReactNode, useCallback, useRef } from 'react';

interface SerialContextType {
  port: SerialPort | null;
  reader: ReadableStreamDefaultReader<Uint8Array> | null;
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  error: string | null;
  sendData: (data: string) => Promise<void>;
}

const SerialContext = createContext<SerialContextType | undefined>(undefined);

interface SerialProviderProps {
  children: ReactNode;
}

export const SerialProvider: React.FC<SerialProviderProps> = ({ children }) => {
  const [port, setPort] = useState<SerialPort | null>(null);
  const [reader, setReader] = useState<ReadableStreamDefaultReader<Uint8Array> | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const writerRef = useRef<WritableStreamDefaultWriter<Uint8Array> | null>(null);

  const connect = useCallback(async () => {
    // Check if Web Serial API is supported
    if (!navigator.serial) {
      setError('Web Serial API is not supported in your browser. Try Chrome or Edge.');
      return;
    }

    try {
      setError(null);
      
      // Request a port
      const selectedPort = await navigator.serial.requestPort();
      await selectedPort.open({ baudRate: 115200 });
      
      setPort(selectedPort);
      
      // Set up the reader
      const textDecoder = new TextDecoderStream();
      const readableStreamClosed = selectedPort.readable.pipeTo(textDecoder.writable);
      const newReader = textDecoder.readable.getReader();
      setReader(newReader);
      
      // Set up the writer
      const writer = selectedPort.writable.getWriter();
      writerRef.current = writer;
      
      setIsConnected(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect to serial port';
      setError(errorMessage);
      console.error('Serial connection error:', err);
    }
  }, []);

  const disconnect = useCallback(async () => {
    if (reader) {
      try {
        await reader.cancel();
      } catch (err) {
        console.error('Error canceling reader:', err);
      }
      setReader(null);
    }

    if (writerRef.current) {
      try {
        await writerRef.current.close();
      } catch (err) {
        console.error('Error closing writer:', err);
      }
      writerRef.current = null;
    }

    if (port) {
      try {
        await port.close();
      } catch (err) {
        console.error('Error closing port:', err);
      }
      setPort(null);
    }

    setIsConnected(false);
  }, [port, reader]);

  const sendData = useCallback(async (data: string) => {
    if (!writerRef.current) {
      throw new Error('Serial connection not established');
    }

    const encoder = new TextEncoder();
    const dataArray = encoder.encode(data + '\n');
    await writerRef.current.write(dataArray);
  }, []);

  return (
    <SerialContext.Provider value={{ 
      port, 
      reader, 
      isConnected, 
      connect, 
      disconnect, 
      error, 
      sendData 
    }}>
      {children}
    </SerialContext.Provider>
  );
};

export const useSerialContext = () => {
  const context = useContext(SerialContext);
  if (context === undefined) {
    throw new Error('useSerialContext must be used within a SerialProvider');
  }
  return context;
};