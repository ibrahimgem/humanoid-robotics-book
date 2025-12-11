import React from 'react';
import './Homepage.css';

const Homepage = () => {
  return (
    <div className="homepage-container">
      <header className="homepage-header">
        <nav className="navbar">
          <div className="logo">🤖 Humanoid Robotics</div>
          <ul className="nav-links">
            <li><a href="#home">Home</a></li>
            <li><a href="#chapters">Chapters</a></li>
            <li><a href="#chat">Chat</a></li>
            <li><a href="#profile">Profile</a></li>
          </ul>
        </nav>
      </header>

      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Master Humanoid Robotics</h1>
          <p className="hero-subtitle">Interactive learning with AI-powered personalization</p>
          <div className="hero-buttons">
            <button className="btn btn-primary">Start Learning</button>
            <button className="btn btn-secondary">Explore Chapters</button>
          </div>
        </div>
      </section>

      <section className="features-section">
        <div className="feature-card">
          <h3>🤖 AI-Powered Learning</h3>
          <p>Get personalized content based on your experience level</p>
        </div>
        <div className="feature-card">
          <h3>🌐 Multi-Language Support</h3>
          <p>Content available in multiple languages including Urdu</p>
        </div>
        <div className="feature-card">
          <h3>💬 Interactive Chat</h3>
          <p>Ask questions and get instant answers from our AI assistant</p>
        </div>
      </section>

      <section className="cta-section">
        <h2>Ready to dive into humanoid robotics?</h2>
        <p>Join thousands of learners mastering this cutting-edge field</p>
        <button className="btn btn-primary">Create Account</button>
      </section>

      <footer className="homepage-footer">
        <p>© 2025 Humanoid Robotics Book. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Homepage;