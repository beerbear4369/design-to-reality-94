/**
 * WebSocket Service Index
 * Manages WebSocket connection and event handlers
 */

// Type definitions
export type EventHandler = (data: any) => void;

export interface WebSocketService {
  connect: () => void;
  disconnect: () => void;
  isConnected: () => boolean;
  on: (event: string, handler: EventHandler) => void;
  off: (event: string, handler: EventHandler) => void;
  emit: (event: string, data?: any) => void;
}

class MockWebSocketService implements WebSocketService {
  private connected: boolean = false;
  private eventHandlers: Map<string, Set<EventHandler>> = new Map();
  private reconnectInterval: number | null = null;
  
  /**
   * Simulates connecting to WebSocket server
   */
  connect(): void {
    if (this.connected) return;
    
    console.log('WebSocket: Connecting...');
    
    // Simulate connection delay
    setTimeout(() => {
      this.connected = true;
      console.log('WebSocket: Connected');
      this.triggerEvent('connect', {});
    }, 300);
  }
  
  /**
   * Simulates disconnecting from WebSocket server
   */
  disconnect(): void {
    if (!this.connected) return;
    
    console.log('WebSocket: Disconnecting...');
    
    this.connected = false;
    if (this.reconnectInterval) {
      clearInterval(this.reconnectInterval);
      this.reconnectInterval = null;
    }
    
    this.triggerEvent('disconnect', {});
    console.log('WebSocket: Disconnected');
  }
  
  /**
   * Returns connection status
   */
  isConnected(): boolean {
    return this.connected;
  }
  
  /**
   * Registers an event handler
   * @param event Event name
   * @param handler Handler function
   */
  on(event: string, handler: EventHandler): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    
    this.eventHandlers.get(event)?.add(handler);
  }
  
  /**
   * Removes an event handler
   * @param event Event name
   * @param handler Handler function
   */
  off(event: string, handler: EventHandler): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.delete(handler);
    }
  }
  
  /**
   * Emits an event to the mock server
   * @param event Event name
   * @param data Event data
   */
  emit(event: string, data: any = {}): void {
    if (!this.connected) {
      console.warn('WebSocket: Cannot emit event, not connected');
      return;
    }
    
    console.log(`WebSocket: Emitting ${event}`, data);
    
    // Process event based on type
    switch (event) {
      case 'client:start-recording':
        // Simulate server acknowledging recording start
        setTimeout(() => {
          this.triggerEvent('server:recording-started', {});
        }, 100);
        break;
        
      case 'client:audio-data':
        // Process audio chunk in real app, but do nothing here
        break;
        
      case 'client:stop-recording':
        // Simulate server processing after recording stops
        setTimeout(() => {
          this.triggerEvent('server:thinking', {});
          
          // Simulate AI thinking time (2 seconds)
          setTimeout(() => {
            // Send text response
            this.triggerEvent('server:response', {
              text: this.getRandomResponse(),
              messageId: `msg-${Date.now()}`
            });
            
            // Send audio response shortly after
            setTimeout(() => {
              this.triggerEvent('server:audio-response', {
                audioUrl: `/mock-audio/response-${Math.floor(Math.random() * 5) + 1}.mp3`,
                messageId: `msg-${Date.now()}`
              });
            }, 200);
          }, 2000);
        }, 500);
        break;
        
      default:
        console.warn(`WebSocket: Unhandled event type ${event}`);
    }
  }
  
  /**
   * Triggers an event to all registered handlers
   * @param event Event name
   * @param data Event data
   */
  private triggerEvent(event: string, data: any): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in ${event} handler:`, error);
        }
      });
    }
  }
  
  /**
   * Returns a random mock response
   */
  private getRandomResponse(): string {
    const responses = [
      "It sounds like you're experiencing quite a bit of stress. Let's explore some strategies that might help you manage these feelings better.",
      "I understand how challenging that can be. Have you tried setting aside specific times during the day to address work concerns?",
      "That's a common experience many professionals face. What have you found helpful in the past when dealing with similar situations?",
      "I hear your frustration. Let's break this down into smaller, more manageable parts and see if we can identify some practical next steps.",
      "It takes courage to acknowledge these feelings. Would it help to explore some mindfulness techniques that could help in the moment?",
      "Thank you for sharing that with me. Have you noticed any patterns or specific triggers that precede these feelings?",
      "That's really insightful. Building on that awareness, what small change might you be able to implement this week?",
      "Many people in similar situations have found it helpful to establish clearer boundaries. Is that something you'd be open to exploring?",
      "I appreciate your openness. Let's work together to develop a plan that addresses this challenge in a sustainable way."
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  }
}

// Export singleton instance
export const webSocketService = new MockWebSocketService(); 