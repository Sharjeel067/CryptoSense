'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createChart, IChartApi, HistogramData, Time } from 'lightweight-charts';
import { useTheme } from 'next-themes';
import { connectToBinanceKline } from '@/lib/websocket';

interface CryptoChartProps {
  symbol: string;
  interval: string;
}

interface CandleData {
  time: Time;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface Analysis {
  suggestion: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  reasoning: string;
  timestamp: string;
}

const CryptoChart: React.FC<CryptoChartProps> = ({ symbol, interval }) => {
  const { theme } = useTheme();
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<any>(null);
  const currentCandleRef = useRef<CandleData | null>(null);
  const [lastCandleTime, setLastCandleTime] = useState<Time | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [historicalData, setHistoricalData] = useState<CandleData[]>([]);
  const [isChartReady, setIsChartReady] = useState(false);
  const [shouldUseBinance, setShouldUseBinance] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const fetchHistoricalData = useCallback(async () => {
    try {
      const backendUrl = `http://localhost:3001/api/historical/${symbol}?interval=${interval}&limit=100`;
      const response = await fetch(backendUrl);
      
      if (response.ok) {
        const data = await response.json();
        const formattedData = data.map((item: any[]) => ({
          time: item[0] / 1000 as Time,
          open: parseFloat(item[1]),
          high: parseFloat(item[2]),
          low: parseFloat(item[3]),
          close: parseFloat(item[4]),
        }));
        setHistoricalData(formattedData);
        setConnectionError(null); 
      } else {
        setShouldUseBinance(true);
        const binanceUrl = `https://api.binance.com/api/v3/klines?symbol=${symbol.toUpperCase()}&interval=${interval}&limit=100`;
        const binanceResponse = await fetch(binanceUrl);
        
        if (!binanceResponse.ok) {
          throw new Error(`Binance API error: ${binanceResponse.statusText}`);
        }
        
        const binanceData = await binanceResponse.json();
        
        if (binanceData.length === 0) {
          throw new Error(`No data available for ${symbol}`);
        }
        
        const formattedData = binanceData.map((item: any[]) => ({
          time: item[0] / 1000 as Time,
          open: parseFloat(item[1]),
          high: parseFloat(item[2]),
          low: parseFloat(item[3]),
          close: parseFloat(item[4]),
        }));
        setHistoricalData(formattedData);
        setConnectionError(null); 
      }
    } catch (error) {
      console.error('Error fetching historical data:', error);
      setConnectionError(`Error loading data for ${symbol}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      setHistoricalData([]);
    }
  }, [symbol, interval]);

  const closeWebSockets = useCallback(() => {
    // No need for cleanup as the WebSocket manager handles it
  }, [symbol]);

  const resetChart = useCallback(() => {
    if (chartRef.current) {
      console.log('Removing existing chart');
      chartRef.current.remove();
      chartRef.current = null;
      candleSeriesRef.current = null;
    }
    setIsChartReady(false);
  }, []);

  useEffect(() => {
    console.log(`Symbol or interval changed: ${symbol} ${interval}`);
    
    setHistoricalData([]);
    setLastCandleTime(null);
    currentCandleRef.current = null;
    setAnalysis(null);
    setAnalysisError(null);
    setShouldUseBinance(false);
    setConnectionError(null);
    
    resetChart();
    
    fetchHistoricalData();
    
    const timer = setTimeout(() => {
      setShouldUseBinance(true);
    }, 1000);
    
    return () => {
      clearTimeout(timer);
    };
  }, [symbol, interval, fetchHistoricalData, resetChart]);

  useEffect(() => {
    if (historicalData.length > 0 && chartContainerRef.current && !chartRef.current) {
      console.log(`Initializing chart with ${historicalData.length} candles`);
      initChart();
    }
  }, [historicalData]);

  useEffect(() => {
    if (isChartReady && shouldUseBinance && historicalData.length > 0) {
      console.log(`Connecting to WebSockets for ${symbol}`);
      
      const ws = connectToBinanceKline(symbol, interval, {
        onOpen: () => {
          console.log(`Kline WebSocket connected for ${symbol}`);
          setConnectionError(null);
        },
        onMessage: (data) => {
          if (!data.k) return;
          
          const kline = data.k;
          const newCandleTime = Math.floor(kline.t / 1000) as Time;
          const currentPrice = parseFloat(kline.c);
          
          const currentCandle: CandleData = {
            time: newCandleTime,
            open: parseFloat(kline.o),
            high: parseFloat(kline.h),
            low: parseFloat(kline.l),
            close: currentPrice
          };

          if (!lastCandleTime || newCandleTime > lastCandleTime) {
            console.log('New candle period started:', newCandleTime);
            
            if (currentCandleRef.current && candleSeriesRef.current && isChartReady) {
              try {
                candleSeriesRef.current.update(currentCandleRef.current);
              } catch (e) {
                console.error('Error updating last candle:', e);
              }
            }

            setLastCandleTime(newCandleTime);
            currentCandleRef.current = currentCandle;
            
            if (candleSeriesRef.current && isChartReady) {
              try {
                candleSeriesRef.current.update(currentCandle);
              } catch (e) {
                console.error('Error adding new candle:', e);
              }
            }
          } else {
            if (currentCandleRef.current) {
              currentCandleRef.current = {
                time: newCandleTime,
                open: currentCandleRef.current.open,
                high: Math.max(parseFloat(kline.h), currentCandleRef.current.high),
                low: Math.min(parseFloat(kline.l), currentCandleRef.current.low),
                close: currentPrice
              };

              if (candleSeriesRef.current && isChartReady) {
                try {
                  candleSeriesRef.current.update(currentCandleRef.current);
                  chartRef.current?.timeScale().scrollToPosition(0, false);
                } catch (e) {
                  console.error('Error updating current candle:', e);
                }
              }
            }
          }

          if (chartRef.current && isChartReady) {
            try {
              chartRef.current.timeScale().scrollToRealTime();
            } catch (e) {
              console.error('Error scrolling chart:', e);
            }
          }
        },
        onError: () => {
          setConnectionError(`WebSocket connection error for ${symbol}`);
        },
        onClose: (event) => {
          if (!event.wasClean) {
            setConnectionError(`WebSocket connection closed for ${symbol}`);
          }
        },
        reconnectAttempts: 3
      });
      
      if (!ws) {
        setConnectionError(`Failed to connect to WebSocket for ${symbol}`);
      }
    }
    
    // No need for cleanup as the WebSocket manager handles it
  }, [isChartReady, shouldUseBinance, symbol, interval, historicalData, lastCandleTime]);

  const initChart = () => {
    if (!chartContainerRef.current || chartRef.current || historicalData.length === 0) {
      return;
    }

    const isDarkMode = theme === 'dark';
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: isDarkMode ? '#0f172a' : '#ffffff' },
        textColor: isDarkMode ? '#e2e8f0' : '#334155',
      },
      grid: {
        vertLines: { color: isDarkMode ? '#1e293b' : '#e2e8f0' },
        horzLines: { color: isDarkMode ? '#1e293b' : '#e2e8f0' },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        rightOffset: 5,
        barSpacing: 10,
      },
      handleScroll: {
        vertTouchDrag: false,
      },
      crosshair: {
        mode: 0, 
      },
    });

    const candleSeries = chart.addCandlestickSeries({
      upColor: '#10b981',
      downColor: '#ef4444',
      borderUpColor: '#10b981',
      borderDownColor: '#ef4444',
      wickUpColor: '#10b981',
      wickDownColor: '#ef4444',
    });

    candleSeries.setData(historicalData);

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;

    setIsChartReady(true);
    
    chart.timeScale().fitContent();

    const handleResize = () => {
      if (chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current?.clientWidth || 800,
          height: chartContainerRef.current?.clientHeight || 400,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  };

  useEffect(() => {
    if (chartRef.current) {
      const isDarkMode = theme === 'dark';
      chartRef.current.applyOptions({
        layout: {
          background: { color: isDarkMode ? '#0f172a' : '#ffffff' },
          textColor: isDarkMode ? '#e2e8f0' : '#334155',
        },
        grid: {
          vertLines: { color: isDarkMode ? '#1e293b' : '#e2e8f0' },
          horzLines: { color: isDarkMode ? '#1e293b' : '#e2e8f0' },
        },
      });
    }
  }, [theme]);

  useEffect(() => {
    return () => {
      closeWebSockets();
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [closeWebSockets]);

  const fetchAnalysis = useCallback(async () => {
    if (!symbol) return;
    
    try {
      setLoadingAnalysis(true);
      const response = await fetch(`http://localhost:3001/api/analysis/${symbol}`);
      if (!response.ok) {
        throw new Error('Failed to fetch analysis');
      }
      const data = await response.json();
      
      if (Array.isArray(data) && data.length > 0) {
        setAnalysis(data[0]);
      } else {
        setAnalysis(data);
      }
      
      setLoadingAnalysis(false);
    } catch (error) {
      console.error('Error fetching analysis:', error);
      setAnalysisError('Failed to fetch market analysis');
      setLoadingAnalysis(false);
    }
  }, [symbol]);

  useEffect(() => {
    fetchAnalysis();
    
    const intervalId = setInterval(fetchAnalysis, 60000); 
    
    return () => {
      clearInterval(intervalId);
    };
  }, [symbol, fetchAnalysis]);

  return (
    <div className="space-y-4">
      <div className="w-full h-[400px] bg-white dark:bg-slate-900 rounded-lg shadow-lg p-4" ref={chartContainerRef}>
        {historicalData.length === 0 && !connectionError && (
          <div className="h-full flex items-center justify-center">
            <div className="text-slate-500 dark:text-slate-400">Loading chart data...</div>
          </div>
        )}
        {connectionError && (
          <div className="h-full flex items-center justify-center">
            <div className="text-red-500 dark:text-red-400 text-center">
              <div className="mb-2 font-semibold">{connectionError}</div>
              <button 
                onClick={() => {
                  setConnectionError(null);
                  resetChart();
                  fetchHistoricalData();
                  setTimeout(() => setShouldUseBinance(true), 1000);
                }}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
              >
                Retry Connection
              </button>
            </div>
          </div>
        )}
      </div>
      
      <div className="p-4 bg-white dark:bg-slate-900 rounded-lg shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Market Analysis</h2>
          {analysis && (
            <span className={`px-3 py-1 rounded-full text-sm ${
              analysis.suggestion === 'BUY' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100' :
              analysis.suggestion === 'SELL' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100' :
              'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-100'
            }`}>
              {analysis.suggestion}
            </span>
          )}
        </div>
        
        {loadingAnalysis && (
          <div className="text-slate-500 dark:text-slate-400">Loading analysis...</div>
        )}
        
        {analysisError && (
          <div className="text-red-500 dark:text-red-400">
            {analysisError}
            {shouldUseBinance && <span> - Using Binance data</span>}
          </div>
        )}
        
        {analysis && !loadingAnalysis && (
          <div>
            <div className="mb-2">
              <span className="text-sm text-slate-500 dark:text-slate-400">Confidence: </span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">{analysis.confidence}%</span>
            </div>
            <div className="mb-2">
              <span className="text-sm text-slate-500 dark:text-slate-400">Last Updated: </span>
              <span className="text-slate-700 dark:text-slate-300">{new Date(analysis.timestamp).toLocaleString()}</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-slate-100">Analysis Reasoning</h3>
              <p className="text-slate-700 dark:text-slate-300">{analysis.reasoning}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CryptoChart; 