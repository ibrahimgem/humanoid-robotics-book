import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on component mount
    const token = localStorage.getItem('auth_token');
    if (token) {
      // In a real implementation, you would verify the token with your backend
      // For now, we'll just set a mock user if token exists
      try {
        // Decode JWT token to get user info (simplified)
        const tokenParts = token.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
          setUser({
            id: payload.userId || 'mock-user-id',
            email: payload.email || 'mock@example.com',
            name: payload.name || 'Mock User'
          });
        }
      } catch (e) {
        console.error('Error decoding token:', e);
        localStorage.removeItem('auth_token');
      }
    }

    // Listen for auth update events from other components
    const handleAuthUpdate = (event) => {
      setUser(event.detail.user);
    };

    window.addEventListener('authUpdate', handleAuthUpdate);

    setLoading(false);

    // Cleanup event listener on unmount
    return () => {
      window.removeEventListener('authUpdate', handleAuthUpdate);
    };
  }, []);

  const login = async (email, password) => {
    try {
      const apiService = await import('../services/api.js');
      const response = await apiService.default.login({ email, password });

      if (response.access_token) {
        localStorage.setItem('auth_token', response.access_token);
        setUser({
          id: response.user_id,
          email: response.email,
          name: response.email.split('@')[0],
          profile: response.profile
        });
        return { success: true };
      }
      return { success: false, error: 'Invalid response from server' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const register = async (userData) => {
    try {
      const apiService = await import('../services/api.js');
      const response = await apiService.default.register(userData);

      if (response.access_token) {
        localStorage.setItem('auth_token', response.access_token);
        setUser({
          id: response.user_id,
          email: response.email,
          name: userData.name || response.email.split('@')[0],
          profile: response.profile
        });
        return { success: true };
      }
      return { success: false, error: 'Invalid response from server' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};