/**
 * Storage Service
 * Handles localStorage persistence for conversations
 */

// Constants
const STORAGE_PREFIX = 'kuku-coach:';
const CONVERSATION_KEY = `${STORAGE_PREFIX}conversations`;
const SESSION_LIST_KEY = `${STORAGE_PREFIX}session-list`;

/**
 * Saves a conversation to localStorage
 * @param id Conversation ID
 * @param data Conversation data
 */
export function saveConversation(id: string, data: any): void {
  try {
    // Store the individual conversation
    const key = `${CONVERSATION_KEY}:${id}`;
    localStorage.setItem(key, JSON.stringify(data));
    
    // Update the session list
    updateSessionList(id, data);
    
    console.log(`Saved conversation: ${id}`);
  } catch (error) {
    console.error('Error saving conversation:', error);
  }
}

/**
 * Retrieves a conversation from localStorage
 * @param id Conversation ID
 * @returns Conversation data or null if not found
 */
export function getConversation(id: string): any {
  try {
    const key = `${CONVERSATION_KEY}:${id}`;
    const data = localStorage.getItem(key);
    
    if (!data) {
      return null;
    }
    
    return JSON.parse(data);
  } catch (error) {
    console.error('Error retrieving conversation:', error);
    return null;
  }
}

/**
 * Retrieves all conversations from localStorage
 * @returns Array of all conversations
 */
export function getAllConversations(): any[] {
  try {
    // Get session list
    const sessionList = getSessionList();
    
    // Retrieve all conversations
    return sessionList.map(id => getConversation(id)).filter(Boolean);
  } catch (error) {
    console.error('Error retrieving all conversations:', error);
    return [];
  }
}

/**
 * Clears a specific conversation from localStorage
 * @param id Conversation ID
 */
export function clearConversation(id: string): void {
  try {
    // Remove the conversation
    const key = `${CONVERSATION_KEY}:${id}`;
    localStorage.removeItem(key);
    
    // Update session list
    removeFromSessionList(id);
    
    console.log(`Cleared conversation: ${id}`);
  } catch (error) {
    console.error('Error clearing conversation:', error);
  }
}

/**
 * Clears all conversations from localStorage
 */
export function clearAllConversations(): void {
  try {
    // Get all session IDs
    const sessionList = getSessionList();
    
    // Remove all conversations
    sessionList.forEach(id => {
      const key = `${CONVERSATION_KEY}:${id}`;
      localStorage.removeItem(key);
    });
    
    // Clear session list
    localStorage.removeItem(SESSION_LIST_KEY);
    
    console.log('Cleared all conversations');
  } catch (error) {
    console.error('Error clearing all conversations:', error);
  }
}

// Helper Functions

/**
 * Gets the list of conversation IDs
 * @returns Array of conversation IDs
 */
function getSessionList(): string[] {
  try {
    const list = localStorage.getItem(SESSION_LIST_KEY);
    return list ? JSON.parse(list) : [];
  } catch (error) {
    console.error('Error getting session list:', error);
    return [];
  }
}

/**
 * Updates the session list with a new or updated conversation
 * @param id Conversation ID
 * @param data Conversation data
 */
function updateSessionList(id: string, data: any): void {
  try {
    const list = getSessionList();
    
    // Add to list if not already present
    if (!list.includes(id)) {
      list.push(id);
      localStorage.setItem(SESSION_LIST_KEY, JSON.stringify(list));
    }
  } catch (error) {
    console.error('Error updating session list:', error);
  }
}

/**
 * Removes a conversation from the session list
 * @param id Conversation ID
 */
function removeFromSessionList(id: string): void {
  try {
    const list = getSessionList();
    const updatedList = list.filter(sessionId => sessionId !== id);
    localStorage.setItem(SESSION_LIST_KEY, JSON.stringify(updatedList));
  } catch (error) {
    console.error('Error removing from session list:', error);
  }
} 