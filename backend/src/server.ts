import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import expressWs from 'express-ws';
import { WebSocket } from 'ws';
import analysisRoutes from './routes/analysis';
import { LiveAnalysisService } from './services/liveAnalysisService';
import { CryptoService } from './services/cryptoService';

dotenv.config();

// Initialize Express with WebSocket support
const app = express();
// Add WebSocket capability to Express app
const wsInstance = expressWs(app);
// Access the extended app instance with proper TypeScript support
const appWithWs = app as unknown as expressWs.Application;

const port = process.env.PORT || 3001;

// Get live analysis service
const liveAnalysisService = LiveAnalysisService.getInstance();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/analysis', analysisRoutes);

// Historical data endpoint
app.get('/api/historical/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const { interval = '1h', limit = '100' } = req.query;
    const cryptoService = CryptoService.getInstance();

    const historicalData = await cryptoService.getHistoricalData(
      symbol.toUpperCase(),
      interval as string,
      parseInt(limit as string)
    );

    res.json(historicalData);
  } catch (error) {
    console.error('Error in historical data route:', error);
    res.status(500).json({ error: 'Failed to fetch historical data' });
  }
});

// WebSocket route for live analysis - using appWithWs instead of app
appWithWs.ws('/api/live/:symbol', async (ws: WebSocket, req: express.Request) => {
  const { symbol } = req.params;
  const { interval = '1h' } = req.query;
  let session: any = null;
   
  console.log(`WebSocket connection established for ${symbol} with interval ${interval}`);
   
  try {
    // Start a live analysis session
    session = await liveAnalysisService.analyzeMarketLive(
      symbol.toUpperCase(),
      interval as string
    );
     
    // Send a welcome message
    ws.send(JSON.stringify({ message: 'Connected to live analysis', symbol }));
     
    // Handle messages from client
    ws.on('message', async (msg: any) => {
      try {
        // Parse the message
        const message = JSON.parse(msg.toString());
        console.log('Received message:', message);
               
        // Send the message to the live analysis service
        const response = await liveAnalysisService.sendMessage(session, {
          input: typeof message === 'string' ? message : 
                 message.text || message.input || JSON.stringify(message),
          end_of_turn: true
        });
        
        ws.send(JSON.stringify(response));
      } catch (error) {
        console.error('Error processing message:', error);
        ws.send(JSON.stringify({ error: 'Failed to process message' }));
      }
    });

    // Handle errors
    ws.on('error', (error) => {
      console.error(`WebSocket error for ${symbol}:`, error);
      ws.send(JSON.stringify({ error: 'WebSocket error occurred' }));
    });
     
  } catch (error) {
    console.error('Error in live analysis route:', error);
    ws.send(JSON.stringify({ error: 'Failed to start live analysis' }));
    ws.close();
  }
   
  // Handle connection close
  ws.on('close', () => {
    console.log(`WebSocket connection closed for ${symbol}`);
    if (session) {
      // Mark session as terminated
      session = null;
    }
  });

  // Set up a ping interval to keep the connection alive
  const pingInterval = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.ping();
    }
  }, 30000);

  // Clean up the ping interval when the connection closes
  ws.on('close', () => {
    clearInterval(pingInterval);
  });
});

// Basic health check route
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});