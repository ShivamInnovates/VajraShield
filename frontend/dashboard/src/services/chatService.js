/**
 * VajraShield Chatbot Service
 * 
 * Connects FloatingChat component to the chatbot API backend.
 * Handles message sending, context gathering, and session management.
 */

import authService from './authService';

const API_BASE_URL = process.env.REACT_APP_CHATBOT_API_URL || 'http://localhost:8002';

class ChatService {
  constructor() {
    this.sessionId = this._getOrCreateSessionId();
  }

  /**
   * Get or create a session ID for chat continuity.
   */
  _getOrCreateSessionId() {
    let sessionId = sessionStorage.getItem('chat_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('chat_session_id', sessionId);
    }
    return sessionId;
  }

  /**
   * Send a message to the chatbot API.
   * 
   * @param {string} message - User's message
   * @param {string} txnId - Optional transaction ID for context
   * @returns {Promise<Object>} - { response, context_used, timestamp }
   */
  async sendMessage(message, txnId = null) {
    try {
      const token = authService.getToken();
      
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({
          message,
          session_id: this.sessionId,
          txn_id: txnId,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      return {
        response: data.response,
        context: data.context_used,
        timestamp: data.timestamp,
      };
    } catch (error) {
      console.error('Chat API error:', error);
      return {
        response: "I'm having trouble connecting to the backend. Please check if the chatbot API is running on port 8001.",
        error: error.message,
      };
    }
  }

  /**
   * Get transaction details for context.
   */
  async getTransaction(txnId) {
    try {
      const response = await fetch(`${API_BASE_URL}/transaction/${txnId}`);
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error('Transaction fetch error:', error);
      return null;
    }
  }

  /**
   * Get summary data for dashboard.
   */
  async getSummary() {
    try {
      const response = await fetch(`${API_BASE_URL}/summary`);
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error('Summary fetch error:', error);
      return null;
    }
  }

  /**
   * Search transactions.
   */
  async searchTransactions(filters) {
    try {
      const params = new URLSearchParams(filters);
      const response = await fetch(`${API_BASE_URL}/search?${params}`);
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error('Search error:', error);
      return null;
    }
  }

  /**
   * Check API health.
   */
  async checkHealth() {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      if (!response.ok) return { status: 'unhealthy' };
      return await response.json();
    } catch (error) {
      return { status: 'disconnected', error: error.message };
    }
  }

  /**
   * Reset session (start new conversation).
   */
  resetSession() {
    sessionStorage.removeItem('chat_session_id');
    this.sessionId = this._getOrCreateSessionId();
  }
}

export default new ChatService();
