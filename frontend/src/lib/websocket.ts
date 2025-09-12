/**
 * WebSocket connection manager for crypto data streams
 * Handles proper lifecycle management and cleanup of WebSocket connections
 */

export interface WebSocketOptions {
  onOpen?: (event: Event) => void;
  onMessage?: (data: any) => void;
  onError?: (error: Event) => void;
  onClose?: (event: CloseEvent) => void;
  reconnectAttempts?: number;
  reconnectDelay?: number;
}

class WebSocketManager {
  private connections: Map<string, WebSocket> = new Map();
  private reconnectTimeouts: Map<string, NodeJS.Timeout> = new Map();
  private reconnectAttempts: Map<string, number> = new Map();
  
  /**
   * Creates a new WebSocket connection or returns an existing one
   */
  connect(url: string, key: string, options: WebSocketOptions = {}): WebSocket | null {
    // Always close existing connection first
    this.close(key);
    
    try {
      console.log(`[WebSocket] Creating new connection: ${key}`);
      const ws = new WebSocket(url);
      this.connections.set(key, ws);
      this.reconnectAttempts.set(key, 0);
      
      // Configure WebSocket event handlers
      ws.onopen = (event) => {
        console.log(`[WebSocket] Connected: ${key}`);
        this.reconnectAttempts.set(key, 0);
        if (options.onOpen) options.onOpen(event);
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (options.onMessage) options.onMessage(data);
        } catch (error) {
          console.error(`[WebSocket] Error parsing message: ${key}`, error);
        }
      };
      
      ws.onerror = (event) => {
        console.error(`[WebSocket] Error: ${key}`);
        if (options.onError) options.onError(event);
      };
      
      ws.onclose = (event) => {
        console.log(`[WebSocket] Closed: ${key}. Code: ${event.code}, Clean: ${event.wasClean}`);
        this.connections.delete(key);
        
        if (options.onClose) options.onClose(event);
        
        // Only attempt to reconnect if the closure wasn't clean and we haven't exceeded attempts
        const maxAttempts = options.reconnectAttempts || 3;
        const currentAttempts = this.reconnectAttempts.get(key) || 0;
        
        if (!event.wasClean && currentAttempts < maxAttempts) {
          const nextAttempt = currentAttempts + 1;
          this.reconnectAttempts.set(key, nextAttempt);
          
          // Exponential backoff
          const delay = Math.min(1000 * Math.pow(2, nextAttempt), options.reconnectDelay || 10000);
          
          console.log(`[WebSocket] Reconnecting ${key} (${nextAttempt}/${maxAttempts}) in ${delay}ms`);
          
          // Schedule reconnection
          const timeout = setTimeout(() => {
            this.reconnectTimeouts.delete(key);
            this.connect(url, key, options);
          }, delay);
          
          this.reconnectTimeouts.set(key, timeout);
        }
      };
      
      return ws;
    } catch (error) {
      console.error(`[WebSocket] Failed to create connection: ${key}`, error);
      return null;
    }
  }
  
  /**
   * Gets an existing WebSocket connection
   */
  get(key: string): WebSocket | undefined {
    return this.connections.get(key);
  }
  
  /**
   * Checks if a connection with the given key exists
   */
  has(key: string): boolean {
    return this.connections.has(key);
  }
  
  /**
   * Gets all connection keys
   */
  getConnectionKeys(): string[] {
    return Array.from(this.connections.keys());
  }
  
  /**
   * Closes connections that match a specific prefix, except for the one to keep
   */
  closeConnectionsByPrefix(prefix: string, keyToKeep?: string): void {
    const keysToClose = this.getConnectionKeys().filter(key => 
      key.startsWith(prefix) && (!keyToKeep || key !== keyToKeep)
    );
    
    keysToClose.forEach(key => {
      console.log(`[WebSocket] Closing connection by prefix (${prefix}): ${key}`);
      this.close(key);
    });
  }
  
  /**
   * Closes a specific WebSocket connection
   */
  close(key: string): void {
    // Clear any pending reconnect attempts
    if (this.reconnectTimeouts.has(key)) {
      clearTimeout(this.reconnectTimeouts.get(key)!);
      this.reconnectTimeouts.delete(key);
    }
    
    // Close the connection if it exists
    if (this.connections.has(key)) {
      const ws = this.connections.get(key)!;
      
      // Only close if the connection is still open or connecting
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        console.log(`[WebSocket] Closing connection: ${key}`);
        
        // Use a wrapper to catch any potential errors during close
        try {
          // Remove handlers to prevent events during close
          ws.onopen = null;
          ws.onmessage = null;
          ws.onerror = null;
          ws.onclose = null;
          
          ws.close();
        } catch (error) {
          console.error(`[WebSocket] Error closing connection: ${key}`, error);
        }
      }
      
      this.connections.delete(key);
    }
  }
  
  /**
   * Closes all active WebSocket connections
   */
  closeAll(): void {
    console.log(`[WebSocket] Closing all connections (${this.connections.size})`);
    
    // Get all keys to avoid modification during iteration
    const keys = Array.from(this.connections.keys());
    
    // Close each connection
    keys.forEach(key => this.close(key));
    
    // Clear all reconnect timeouts
    this.reconnectTimeouts.forEach(timeout => clearTimeout(timeout));
    this.reconnectTimeouts.clear();
    
    // Ensure maps are empty
    this.connections.clear();
    this.reconnectAttempts.clear();
  }
}

// Create a singleton instance for the application
export const webSocketManager = new WebSocketManager();

/**
 * Connect to a Binance kline (candlestick) WebSocket stream
 */
export function connectToBinanceKline(
  symbol: string,
  interval: string,
  options: WebSocketOptions = {}
): WebSocket | null {
  if (!symbol || !interval) {
    console.error('[WebSocket] Cannot connect to kline: Missing symbol or interval');
    return null;
  }
  
  const key = `kline_${symbol.toLowerCase()}_${interval}`;
  
  // Close any previous kline connections except the one we're creating
  webSocketManager.closeConnectionsByPrefix('kline_', key);
  
  const url = `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@kline_${interval}`;
  
  console.log(`[WebSocket] Connecting to kline for ${symbol} @ ${interval}`);
  return webSocketManager.connect(url, key, options);
}

/**
 * Connect to a Binance ticker WebSocket stream
 */
export function connectToBinanceTicker(
  symbol: string,
  options: WebSocketOptions = {}
): WebSocket | null {
  if (!symbol) {
    console.error('[WebSocket] Cannot connect to ticker: No symbol provided');
    return null;
  }
  
  const key = `ticker_${symbol.toLowerCase()}`;
  
  // Close any previous ticker connections except the one we're creating
  webSocketManager.closeConnectionsByPrefix('ticker_', key);
  
  const url = `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@ticker`;
  
  console.log(`[WebSocket] Connecting to ticker for ${symbol}`);
  return webSocketManager.connect(url, key, options);
}

/**
 * Close all Binance WebSocket connections
 */
export function closeAllConnections(): void {
  webSocketManager.closeAll();
}
