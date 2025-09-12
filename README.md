# Crypto Trading Assistant

A web application that provides real-time cryptocurrency trading insights using AI-powered analysis. The application combines live crypto market data with Google's Gemini LLM to provide trading suggestions based on technical analysis.

## Features

- Real-time cryptocurrency price tracking
- Interactive candlestick charts
- AI-powered trading suggestions
- Technical analysis insights
- Support and resistance level identification
- Historical data analysis

## Tech Stack

- Frontend: Next.js
- Backend: Node.js with Express
- Database: MongoDB (for storing historical data)
- Real-time Data: WebSocket connections
- Charting: TradingView Lightweight Charts
- AI: Google Gemini LLM
- API: Binance/CoinGecko/CryptoCompare

## Project Structure

```
my-crypto-assistant/
├── frontend/                 # Next.js frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Next.js pages
│   │   ├── styles/         # CSS/SCSS files
│   │   ├── utils/          # Helper functions
│   │   └── hooks/          # Custom React hooks
│   ├── public/             # Static assets
│   └── package.json
├── backend/                 # Node.js backend
│   ├── src/
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── models/         # Data models
│   │   ├── utils/          # Helper functions
│   │   └── config/         # Configuration files
│   ├── package.json
│   └── .env                # Environment variables
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MongoDB
- API keys for:
  - Crypto Exchange API
  - Google Gemini API

### Installation

1. Clone the repository
2. Install dependencies for both frontend and backend
3. Set up environment variables
4. Start the development servers

## Development

The project is divided into two main parts:

1. Frontend: Handles the user interface and visualization
2. Backend: Manages data processing, API integrations, and AI analysis

## License

MIT 