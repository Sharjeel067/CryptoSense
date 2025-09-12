'use client';

import { useState, useEffect } from 'react';
import CryptoChart from '@/components/CryptoChart';
import TradingAnalysis from '@/components/TradingAnalysis';

export default function Home() {
  const [symbol, setSymbol] = useState<string>('BTCUSDT');
  const [interval, setInterval] = useState<string>('1m');
  const [symbols, setSymbols] = useState<string[]>([]);
  const [filteredSymbols, setFilteredSymbols] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  const intervals = ['1m', '5m', '15m', '30m', '1h', '4h', '1d'];

  useEffect(() => {
    const fetchSymbols = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('https://api.binance.com/api/v3/exchangeInfo');
        const data = await response.json();
        
        // Extract symbols and filter for USDT pairs to keep the list manageable
        const allSymbols = data.symbols
          .filter((sym: any) => sym.status === 'TRADING')
          .map((sym: any) => sym.symbol)
          .sort();
          
        setSymbols(allSymbols);
        setFilteredSymbols(allSymbols);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching trading pairs:', error);
        setIsLoading(false);
      }
    };

    fetchSymbols();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = symbols.filter(s => 
        s.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredSymbols(filtered);
    } else {
      setFilteredSymbols(symbols);
    }
  }, [searchTerm, symbols]);

  return (
    <div className="flex flex-col md:flex-row gap-6">
      <div className="w-full md:w-3/4 space-y-4">
        <div className="flex flex-wrap gap-3 mb-2">
          <div className="relative w-64">
            <div 
              className="flex items-center justify-between px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 cursor-pointer"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <span>{symbol}</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
            
            {isDropdownOpen && (
              <div className="absolute z-10 mt-1 w-full bg-white dark:bg-slate-800 shadow-lg rounded-lg border border-slate-300 dark:border-slate-700 max-h-60 overflow-y-auto">
                <div className="sticky top-0 bg-white dark:bg-slate-800 p-2 border-b border-slate-300 dark:border-slate-700">
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    placeholder="Search pairs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                
                {isLoading ? (
                  <div className="p-3 text-center text-slate-500 dark:text-slate-400">Loading pairs...</div>
                ) : filteredSymbols.length === 0 ? (
                  <div className="p-3 text-center text-slate-500 dark:text-slate-400">No matches found</div>
                ) : (
                  filteredSymbols.map((sym) => (
                    <div
                      key={sym}
                      className={`px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer ${sym === symbol ? 'bg-primary-100 dark:bg-primary-900' : ''}`}
                      onClick={() => {
                        setSymbol(sym);
                        setIsDropdownOpen(false);
                        setSearchTerm('');
                      }}
                    >
                      {sym}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
          
          <select 
            value={interval}
            onChange={(e) => setInterval(e.target.value)}
            className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
          >
            {intervals.map(int => (
              <option key={int} value={int}>{int}</option>
            ))}
          </select>
        </div>
        
        <CryptoChart symbol={symbol} interval={interval} />
      </div>
      
      <div className="w-full md:w-1/4">
        <TradingAnalysis symbol={symbol} />
      </div>
    </div>
  );
}
