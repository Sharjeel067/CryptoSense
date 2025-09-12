import express from 'express';
import { CryptoService } from '../services/cryptoService';

const router = express.Router();
const cryptoService = CryptoService.getInstance();

// Get AI analysis for a cryptocurrency
router.get('/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const { interval = '1h' } = req.query;

    const analysis = await cryptoService.analyzeMarket(
      symbol.toUpperCase(),
      interval as string
    );

    res.json(analysis);
  } catch (error) {
    console.error('Error in analysis route:', error);
    res.status(500).json({ error: 'Failed to analyze market data' });
  }
});

export default router; 