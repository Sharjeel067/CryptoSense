import { useEffect, useState } from 'react';

// WebSocket data interface
interface WebSocketData {
  k: {
    t: number; // Kline start time
    o: string; // Open price
    h: string; // High price
    l: string; // Low price
    c: string; // Close price
  };
}

export const useWebSocket = (url: string) => {
  const [data, setData] = useState<WebSocketData | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const ws = new WebSocket(url);

    ws.onopen = () => {
      console.log('WebSocket Connected');
    };

    ws.onmessage = (event) => {
      try {
        const newData = JSON.parse(event.data);
        setData(newData);
      } catch (err) {
        setError(err as Error);
      }
    };

    ws.onerror = (event) => {
      setError(new Error('WebSocket error'));
    };

    ws.onclose = () => {
      console.log('WebSocket Disconnected');
    };

    return () => {
      ws.close();
    };
  }, [url]);

  return { data, error };
}; 