import React, { useEffect, useState, useCallback, useRef } from 'react';
import { connectToBinanceTicker } from '@/lib/websocket';

interface TradingAnalysisProps {
  symbol: string;
}

interface PriceData {
  price: string;
  timestamp: number;
}

const TradingAnalysis: React.FC<TradingAnalysisProps> = ({ symbol }) => {
  const [priceData, setPriceData] = useState<PriceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  const currentSymbolRef = useRef(symbol);

  // Handle real-time price updates
  const handlePriceUpdate = useCallback((data: any) => {
    if (data.c) {
      console.log(`Price update for ${currentSymbolRef.current}: ${data.c}`);
      setPriceData({
        price: data.c,
        timestamp: data.E
      });
      
      // Once we receive price data, ensure we mark the connection as connected
      setConnectionStatus('connected');
      setLoading(false);
    }
  }, []);

  // Connect to WebSocket when symbol changes
  useEffect(() => {
    // Update the current symbol ref
    currentSymbolRef.current = symbol;
    
    if (!symbol) return;
    
    // Reset price data when symbol changes to prevent showing old price
    setPriceData(null);
    setLoading(true);
    setConnectionStatus('connecting');
    
    console.log(`TradingAnalysis: Connecting to price feed for ${symbol}`);
    
    const connection = connectToBinanceTicker(symbol, {
      onOpen: () => {
        console.log(`Price ticker connected for ${symbol}`);
        // Don't set loading to false until we receive actual data
      },
      onMessage: handlePriceUpdate,
      onError: () => {
        console.error(`Price ticker error for ${symbol}`);
        if (currentSymbolRef.current === symbol) {
          setConnectionStatus('error');
          setLoading(false);
        }
      },
      onClose: (event) => {
        console.log(`Price ticker closed for ${symbol}, wasClean: ${event.wasClean}`);
        // Only update state if this is still the current symbol
        if (currentSymbolRef.current === symbol && !event.wasClean) {
          setConnectionStatus('error');
          setLoading(false);
        }
      },
      reconnectAttempts: 3
    });
    
    if (!connection) {
      console.error(`Failed to establish connection for ${symbol}`);
      setConnectionStatus('error');
      setLoading(false);
    }
    
    // No cleanup needed as WebSocket manager handles it
  }, [symbol, handlePriceUpdate]); // Removed connectionStatus to prevent loops

  const handleRetry = useCallback(() => {
    if (!symbol) return;
    
    setPriceData(null);
    setLoading(true);
    setConnectionStatus('connecting');
    
    // Close existing connection and try again
    connectToBinanceTicker(symbol, {
      onOpen: () => {
        console.log(`Retry: Price ticker connected for ${symbol}`);
        // Don't set loading to false yet, wait for data
      },
      onMessage: handlePriceUpdate,
      onError: () => {
        setConnectionStatus('error');
        setLoading(false);
      },
      onClose: () => {
        setConnectionStatus('error');
        setLoading(false);
      },
      reconnectAttempts: 3
    });
  }, [symbol, handlePriceUpdate]);

  if (loading) {
    return (
      <div className="p-4 bg-white dark:bg-slate-900 rounded-lg shadow">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold dark:text-white">Real-time Price</h2>
          <span className="px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
            {symbol}
          </span>
        </div>
        <div className="flex justify-center items-center py-4">
          <div className="animate-pulse text-slate-500 dark:text-slate-400">
            Connecting to {symbol}...
          </div>
        </div>
      </div>
    );
  }

  if (connectionStatus === 'error') {
    return (
      <div className="p-4 bg-white dark:bg-slate-900 rounded-lg shadow">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold dark:text-white">Real-time Price</h2>
          <span className="px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
            {symbol}
          </span>
        </div>
        <div className="flex flex-col items-center justify-center py-4">
          <div className="text-center mb-3 text-slate-700 dark:text-slate-300">
            Unable to connect to price feed for {symbol}
          </div>
          <button 
            onClick={handleRetry}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!priceData) {
    return (
      <div className="p-4 bg-white dark:bg-slate-900 rounded-lg shadow">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold dark:text-white">Real-time Price</h2>
          <span className="px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
            {symbol}
          </span>
        </div>
        <div className="py-4 text-center text-slate-700 dark:text-slate-300">
          Waiting for {symbol} price data...
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white dark:bg-slate-900 rounded-lg shadow">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Real-time Price</h2>
        <span className="px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
          {symbol}
        </span>
      </div>
      <div className="mb-4">
        <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          ${parseFloat(priceData.price).toFixed(2)}
        </div>
        <div className="text-sm text-slate-500 dark:text-slate-400">
          Last Updated: {new Date(priceData.timestamp).toLocaleString()}
        </div>
      </div>
    </div>
  );
};

export default TradingAnalysis;