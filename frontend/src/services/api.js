/**
 * API service layer for chatbot communication
 * Provides methods to interact with the backend RAG chatbot API
 */

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

class ApiService {
  constructor() {
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  /**
   * Send a query to the RAG system
   * @param {string} message - The user's query message
   * @param {string} sessionId - The chat session ID
   * @param {string} queryMode - The query mode ('global' or 'local')
   * @param {string} [selectedText] - The selected text (for local queries)
   * @returns {Promise<Object>} The API response
   */
  async sendQuery(message, sessionId, queryMode = 'global', selectedText = null) {
    try {
      const requestBody = {
        message,
        session_id: sessionId,
        query_mode: queryMode,
      };

      if (queryMode === 'local' && selectedText) {
        requestBody.selected_text = selectedText;
      }

      const response = await fetch(`${API_BASE_URL}/chat/query`, {
        method: 'POST',
        headers: this.defaultHeaders,
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error sending query:', error);
      throw error;
    }
  }

  /**
   * Get chat session details and history
   * @param {string} sessionId - The chat session ID
   * @returns {Promise<Object>} The session details
   */
  async getSession(sessionId) {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/sessions/${sessionId}`, {
        method: 'GET',
        headers: this.defaultHeaders,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting session:', error);
      throw error;
    }
  }

  /**
   * Get session context including last selected text
   * @param {string} sessionId - The chat session ID
   * @returns {Promise<Object>} The session context
   */
  async getSessionContext(sessionId) {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/session-context/${sessionId}`, {
        method: 'GET',
        headers: this.defaultHeaders,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting session context:', error);
      throw error;
    }
  }

  /**
   * Update the query mode for a session
   * @param {string} sessionId - The chat session ID
   * @param {string} mode - The new query mode ('global' or 'local')
   * @returns {Promise<Object>} The API response
   */
  async updateSessionMode(sessionId, mode) {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/session-mode/${sessionId}`, {
        method: 'PUT',
        headers: this.defaultHeaders,
        body: JSON.stringify({ mode }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating session mode:', error);
      throw error;
    }
  }

  /**
   * Delete a chat session
   * @param {string} sessionId - The chat session ID
   * @returns {Promise<Object>} The API response
   */
  async deleteSession(sessionId) {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: this.defaultHeaders,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting session:', error);
      throw error;
    }
  }

  /**
   * Check if the API is healthy
   * @returns {Promise<boolean>} Health status
   */
  async healthCheck() {
    try {
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        headers: this.defaultHeaders,
      });

      if (!response.ok) {
        return false;
      }

      const healthData = await response.json();
      return healthData.status === 'healthy';
    } catch (error) {
      console.error('Error checking health:', error);
      return false;
    }
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;