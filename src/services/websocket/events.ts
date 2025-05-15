/**
 * WebSocket Events
 * Defines event names and types for WebSocket communication
 */

// Client-to-Server Events
export const CLIENT_EVENTS = {
  START_RECORDING: 'client:start-recording',
  AUDIO_DATA: 'client:audio-data',
  STOP_RECORDING: 'client:stop-recording',
};

// Server-to-Client Events
export const SERVER_EVENTS = {
  RECORDING_STARTED: 'server:recording-started',
  THINKING: 'server:thinking',
  RESPONSE: 'server:response',
  AUDIO_RESPONSE: 'server:audio-response',
  ERROR: 'server:error',
};

// Connection Events
export const CONNECTION_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  RECONNECT: 'reconnect',
  RECONNECT_ATTEMPT: 'reconnect_attempt',
};

// Event Data Types
export interface AudioDataEvent {
  chunk: Blob | ArrayBuffer;
  timestamp: number;
}

export interface ResponseEvent {
  text: string;
  messageId: string;
}

export interface AudioResponseEvent {
  audioUrl: string;
  messageId: string;
}

export interface ErrorEvent {
  code: string;
  message: string;
} 