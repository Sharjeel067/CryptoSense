import axios from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';

export class CryptoService {
  private static instance: CryptoService;
  private apiUrl: string;
  private genAI: GoogleGenerativeAI | null = null;

  private constructor() {
    this.apiUrl = process.env.CRYPTO_API_URL || 'https://api.binance.com/api/v3';
    const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyB59FwhsB07HFjzSIlcasL2Qv-P6dcbu18';
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
    }
  }

  public static getInstance(): CryptoService {
    if (!CryptoService.instance) {
      CryptoService.instance = new CryptoService();
    }
    return CryptoService.instance;
  }

  async getHistoricalData(symbol: string, interval: string, limit: number = 500) {
    try {
      // Convert single coin names to trading pairs
      const tradingPair = this.formatSymbol(symbol);
      
      console.log(`Fetching data for trading pair: ${tradingPair}, interval: ${interval}, limit: ${limit}`);
      
      const response = await axios.get(`${this.apiUrl}/klines`, {
        params: {
          symbol: tradingPair,
          interval,
          limit,
        },
      });
      
      console.log(`Successfully fetched data for ${tradingPair}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.error('API Error:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          requestParams: {
            symbol: this.formatSymbol(symbol),
            interval,
            limit
          }
        });
      } else {
        console.error('Error fetching historical data:', error);
      }
      throw error;
    }
  }

  // Helper method to format symbols properly
  private formatSymbol(symbol: string): string {
    // Standardize the symbol format
    const formattedSymbol = symbol.toUpperCase().trim();
    
    // Check if symbol already includes a trading pair
    if (formattedSymbol.includes('USDT') || 
        formattedSymbol.includes('BUSD') || 
        formattedSymbol.includes('USD') || 
        formattedSymbol.endsWith('BTC') || 
        formattedSymbol.endsWith('ETH')) {
      return formattedSymbol;
    }
    
    // Default to USDT pairing
    return `${formattedSymbol}USDT`;
  }

  async analyzeMarket(symbol: string, interval: string) {
    try {
      if (!this.genAI) {
        throw new Error('Gemini API key not configured');
      }

      const historicalData = await this.getHistoricalData(symbol, interval);
      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

      const prompt = `
        You are an expert cryptocurrency trader. Analyze the following candlestick data for ${symbol} with ${interval} interval.
        Consider the following aspects:
        1. Price action and trend
        2. Support and resistance levels
        3. Volume analysis
        4. Technical indicators (if visible)
        5. Market sentiment
        
        Based on your analysis, provide:
        1. A clear trading suggestion (BUY, SELL, or HOLD)
        2. Your confidence level in the suggestion (0-100%)
        3. Detailed reasoning for your suggestion
        4. Key support and resistance levels
        5. Potential price targets
        
        Data: ${JSON.stringify(historicalData)}
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Parse the response and structure it
      const analysis = {
        suggestion: this.extractSuggestion(text),
        confidence: this.extractConfidence(text),
        reasoning: this.extractReasoning(text),
        timestamp: new Date().toISOString(),
      };

      return analysis;
    } catch (error) {
      console.error('Error analyzing market:', error);
      throw error;
    }
  }

  private extractSuggestion(text: string): 'BUY' | 'SELL' | 'HOLD' {
    if (text.includes('BUY')) return 'BUY';
    if (text.includes('SELL')) return 'SELL';
    return 'HOLD';
  }

  private extractConfidence(text: string): number {
    const confidenceMatch = text.match(/confidence:?\s*(\d+)%/i);
    return confidenceMatch ? parseInt(confidenceMatch[1]) : 50;
  }

  private extractReasoning(text: string): string {
    const reasoningMatch = text.match(/reasoning:?\s*([\s\S]*?)(?=\n\n|$)/i);
    return reasoningMatch ? reasoningMatch[1].trim() : 'No detailed reasoning provided.';
  }
}