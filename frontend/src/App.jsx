import React, { useState, useEffect } from 'react';
import Homepage from './components/Homepage';
import FloatingChatbot from './components/FloatingChatbot';
import PersonalizeButton from './components/PersonalizeButton';
import TranslateButton from './components/TranslateButton';
import UrduContent from './components/UrduContent';
import PersonalizationChips from './components/PersonalizationChips';
import TranslationChips from './components/TranslationChips';
import apiService from './services/api';
import './App.css';

const App = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [content, setContent] = useState('This is sample content about humanoid robotics. It discusses the fundamentals of building and programming robots that mimic human movements and behaviors.');
  const [originalContent, setOriginalContent] = useState(content);
  const [isUrduMode, setIsUrduMode] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (token) {
          const profile = await apiService.getProfile();
          setUser(profile);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        // Token might be invalid, remove it
        localStorage.removeItem('auth_token');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleContentChange = (newContent, isUrdu = false) => {
    setContent(newContent);
    setIsUrduMode(isUrdu);
  };

  const handleRegister = async (userData) => {
    try {
      const response = await apiService.register(userData);
      localStorage.setItem('auth_token', response.access_token);
      setUser(response.profile);
      return response;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const handleLogin = async (loginData) => {
    try {
      const response = await apiService.login(loginData);
      localStorage.setItem('auth_token', response.access_token);
      setUser(response.profile);
      return response;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
  };

  if (isLoading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner">🤖</div>
        <p>Loading Humanoid Robotics Book...</p>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <nav className="main-nav">
          <div className="logo">🤖 Humanoid Robotics Book</div>
          <div className="nav-actions">
            {user ? (
              <div className="user-info">
                <span>Welcome, {user.email || 'User'}!</span>
                <button onClick={handleLogout} className="logout-btn">Logout</button>
              </div>
            ) : (
              <div className="auth-buttons">
                <button onClick={() => document.getElementById('login-modal').style.display = 'block'}>
                  Login
                </button>
                <button onClick={() => document.getElementById('register-modal').style.display = 'block'}>
                  Register
                </button>
              </div>
            )}
          </div>
        </nav>
      </header>

      <main className="app-main">
        <div className="content-area">
          <h1>Chapter: Introduction to Humanoid Robotics</h1>

          <div className="feature-buttons">
            <PersonalizeButton
              chapterId="intro-to-humanoid-robotics"
              content={content}
              onContentChange={handleContentChange}
            />
            <TranslateButton
              content={content}
              onContentChange={handleContentChange}
            />
          </div>

          <div className="content-display">
            {isUrduMode ? (
              <UrduContent content={content} isUrdu={true} />
            ) : (
              <div className="english-content">
                <p>{content}</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <FloatingChatbot />

      {/* Modals for auth */}
      <div id="login-modal" className="modal">
        <div className="modal-content">
          <span className="close" onClick={() => document.getElementById('login-modal').style.display = 'none'}>&times;</span>
          <h2>Login</h2>
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            handleLogin({
              email: formData.get('email'),
              password: formData.get('password')
            });
          }}>
            <input name="email" type="email" placeholder="Email" required />
            <input name="password" type="password" placeholder="Password" required />
            <button type="submit">Login</button>
          </form>
        </div>
      </div>

      <div id="register-modal" className="modal">
        <div className="modal-content">
          <span className="close" onClick={() => document.getElementById('register-modal').style.display = 'none'}>&times;</span>
          <h2>Register</h2>
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            handleRegister({
              email: formData.get('email'),
              password: formData.get('password'),
              software_experience: formData.get('software_experience'),
              hardware_experience: formData.get('hardware_experience'),
              experience_level: formData.get('experience_level'),
              preferred_language: formData.get('preferred_language'),
              learning_goals: formData.get('learning_goals')
            });
          }}>
            <input name="email" type="email" placeholder="Email" required />
            <input name="password" type="password" placeholder="Password" required />
            <select name="experience_level">
              <option value="">Select Experience Level</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
            <input name="learning_goals" type="text" placeholder="Learning Goals" />
            <button type="submit">Register</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default App;