import { GoogleGenerativeAI } from '@google/generative-ai';

interface LiveSessionConfig {
  response_modalities: string[];
  system_instruction?: {
    parts: Array<{
      text: string;
    }>;
  };
}

interface LiveClientContent {
  input: string;
  end_of_turn?: boolean;
}

export class LiveAnalysisService {
  private static instance: LiveAnalysisService;
  private genAI: GoogleGenerativeAI | null = null;
  private model = 'gemini-pro';

  private constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
    }
  }

  public static getInstance(): LiveAnalysisService {
    if (!LiveAnalysisService.instance) {
      LiveAnalysisService.instance = new LiveAnalysisService();
    }
    return LiveAnalysisService.instance;
  }

  async startLiveSession(config: LiveSessionConfig) {
    if (!this.genAI) {
      throw new Error('Gemini API key not configured');
    }

    try {
      const model = this.genAI.getGenerativeModel({ model: this.model });
      const chat = model.startChat({
        history: config.system_instruction ? [{
          role: 'user',
          parts: [{ text: config.system_instruction.parts[0].text }]
        }] : []
      });

      return chat;
    } catch (error) {
      console.error('Error starting live session:', error);
      throw error;
    }
  }

  async sendMessage(session: any, content: LiveClientContent) {
    try {
      const result = await session.sendMessage(content.input);
      const response = await result.response;
      return {
        text: response.text(),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  // Helper method to format symbols properly
  private formatSymbol(symbol: string): string {
    // Check if symbol already includes a trading pair
    if (symbol.includes('USDT') || symbol.includes('BUSD') || 
        symbol.includes('USD') || symbol.endsWith('BTC') || 
        symbol.endsWith('ETH')) {
      return symbol;
    }
    
    // Default to USDT pairing
    return `${symbol}USDT`;
  }

  async analyzeMarketLive(symbol: string, interval: string) {
    if (!this.genAI) {
      throw new Error('Gemini API key not configured');
    }

    // Format the symbol to ensure it's a valid trading pair
    const tradingPair = this.formatSymbol(symbol);
    console.log(`Starting live analysis for trading pair: ${tradingPair}`);

    const config: LiveSessionConfig = {
      response_modalities: ['TEXT'],
      system_instruction: {
        parts: [{
          text: `You are an expert cryptocurrency trader analyzing ${tradingPair} with ${interval} interval.
               
               Provide real-time analysis focusing on:
               1. Current price action and trend
               2. Key support and resistance levels
               3. Trading volume analysis
               4. Technical indicators
               5. Market sentiment
               
               Format your response with:
               - Clear trading suggestion (BUY/SELL/HOLD)
               - Confidence level (0-100%)
               - Detailed reasoning
               - Key price levels to watch`
        }]
      }
    };

    try {
      const session = await this.startLiveSession(config);
      return session;
    } catch (error) {
      console.error('Error in live market analysis:', error);
      throw error;
    }
  }
}