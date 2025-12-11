/**
 * API service layer for chatbot communication and feature integration
 * Provides methods to interact with the backend RAG chatbot API and other features
 */

const API_BASE_URL = (typeof window !== 'undefined' && window.API_CONFIG?.BASE_URL) || 'http://localhost:8000';

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

  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} Registration response
   */
  async register(userData) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: this.defaultHeaders,
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  }

  /**
   * Login a user
   * @param {Object} loginData - User login data (email and password)
   * @returns {Promise<Object>} Login response
   */
  async login(loginData) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: this.defaultHeaders,
        body: JSON.stringify(loginData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error logging in user:', error);
      throw error;
    }
  }

  /**
   * Get user profile
   * @returns {Promise<Object>} User profile data
   */
  async getProfile() {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'GET',
        headers: {
          ...this.defaultHeaders,
          'Authorization': `Bearer ${token}`
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting profile:', error);
      throw error;
    }
  }

  /**
   * Update user profile
   * @param {Object} profileData - Profile data to update
   * @returns {Promise<Object>} Updated profile data
   */
  async updateProfile(profileData) {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          ...this.defaultHeaders,
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  /**
   * Personalize chapter content
   * @param {string} chapterId - The chapter ID
   * @param {string} content - The chapter content to personalize
   * @param {string} difficultyLevel - Optional difficulty override
   * @returns {Promise<Object>} Personalized content response
   */
  async personalizeChapter(chapterId, content, difficultyLevel = null) {
    try {
      const token = localStorage.getItem('auth_token');
      const requestBody = {
        chapter_id: chapterId,
        content: content,
      };

      if (difficultyLevel) {
        requestBody.difficulty_override = difficultyLevel;
      }

      const response = await fetch(`${API_BASE_URL}/personalize/chapter`, {
        method: 'POST',
        headers: {
          ...this.defaultHeaders,
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error personalizing chapter:', error);
      throw error;
    }
  }

  /**
   * Translate content to Urdu
   * @param {string} text - The text to translate
   * @param {string} sourceLang - Source language (default: 'en')
   * @param {string} targetLang - Target language (default: 'ur')
   * @returns {Promise<Object>} Translation response
   */
  async translateToUrdu(text, sourceLang = 'en', targetLang = 'ur') {
    try {
      const token = localStorage.getItem('auth_token');
      const requestBody = {
        text: text,
        source_lang: sourceLang,
        target_lang: targetLang,
      };

      const response = await fetch(`${API_BASE_URL}/translate/urdu`, {
        method: 'POST',
        headers: {
          ...this.defaultHeaders,
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error translating to Urdu:', error);
      throw error;
    }
  }
}


// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;