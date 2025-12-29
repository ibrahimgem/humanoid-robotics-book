/**
 * API Configuration for the RAG AI Chatbot
 *
 * This file centralizes API endpoint configuration for different environments.
 * Update the BACKEND_URL when deploying to production.
 */

// Determine the backend URL based on environment
const getBackendUrl = () => {
  // Check if we're running in a browser
  if (typeof window !== 'undefined') {
    // Production: Use HuggingFace Spaces URL
    if (window.location.hostname === 'ibrahimgem.github.io') {
      return 'https://ibrahimgem-rag-chatbot.hf.space';
    }
  }

  // Development: Use local backend
  return 'http://localhost:8000';
};

export const API_CONFIG = {
  BACKEND_URL: getBackendUrl(),
  ENDPOINTS: {
    SESSION: '/api/session',
    CHAT: '/api/chat',
    QUERY_MODE: '/api/query-mode',
    INGEST: '/api/ingest',
    HEALTH: '/health',
  }
};

// Helper function to build full API URLs
export const getApiUrl = (endpoint) => {
  return `${API_CONFIG.BACKEND_URL}${endpoint}`;
};

// Export for convenience
export const BACKEND_URL = API_CONFIG.BACKEND_URL;
