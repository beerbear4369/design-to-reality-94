import { useState, useEffect, useCallback, useRef } from 'react';
import { webSocketService, EventHandler } from '@/services/websocket';
import { CONNECTION_EVENTS } from '@/services/websocket/events';

/**
 * Custom hook for WebSocket communication
 * Provides a React interface for the WebSocket service
 */
export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  
  // Handle connection status
  useEffect(() => {
    // Connect to WebSocket on mount
    webSocketService.connect();
    
    // Set up event handlers
    const handleConnect = () => {
      setIsConnected(true);
      setError(null);
      reconnectAttempts.current = 0;
    };
    
    const handleDisconnect = () => {
      setIsConnected(false);
      
      // Attempt to reconnect with exponential backoff
      if (reconnectAttempts.current < maxReconnectAttempts) {
        const backoffTime = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 10000);
        
        console.log(`WebSocket disconnected. Attempting to reconnect in ${backoffTime}ms...`);
        setTimeout(() => {
          reconnectAttempts.current += 1;
          webSocketService.connect();
        }, backoffTime);
      } else {
        setError(new Error('Failed to connect to WebSocket server after multiple attempts'));
      }
    };
    
    // Register handlers
    webSocketService.on(CONNECTION_EVENTS.CONNECT, handleConnect);
    webSocketService.on(CONNECTION_EVENTS.DISCONNECT, handleDisconnect);
    
    // Cleanup on unmount
    return () => {
      webSocketService.off(CONNECTION_EVENTS.CONNECT, handleConnect);
      webSocketService.off(CONNECTION_EVENTS.DISCONNECT, handleDisconnect);
      webSocketService.disconnect();
    };
  }, []);
  
  /**
   * Subscribe to WebSocket events with automatic cleanup
   * @param event The event name to subscribe to
   * @param handler The handler function for the event
   * @returns An unsubscribe function to clean up the subscription
   */
  const subscribe = useCallback(<T>(event: string, handler: (data: T) => void) => {
    const typedHandler = handler as EventHandler;
    webSocketService.on(event, typedHandler);
    
    // Return an unsubscribe function
    return () => {
      webSocketService.off(event, typedHandler);
    };
  }, []);
  
  /**
   * Emit an event to the WebSocket server
   * @param event The event name to emit
   * @param data The data to send with the event
   */
  const emit = useCallback((event: string, data?: any) => {
    if (!isConnected) {
      console.warn('Cannot emit event, not connected to WebSocket server');
      return;
    }
    
    webSocketService.emit(event, data);
  }, [isConnected]);
  
  return {
    isConnected,
    error,
    subscribe,
    emit
  };
} 