import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from './AuthModal';
import './NavbarAuth.css';

const NavbarAuth = () => {
  const { user, logout } = useAuth();
  const [showAuthModal, setShowAuthModal] = React.useState(false);
  const [authMode, setAuthMode] = React.useState('login'); // 'login' or 'signup'

  const handleLogout = () => {
    logout();
  };

  const openAuthModal = (mode) => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  return (
    <div className="navbar-auth">
      {user ? (
        <div className="navbar-user-menu">
          <span className="navbar-user-name">{user.name || user.email.split('@')[0]}</span>
          <button className="navbar-logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      ) : (
        <div className="navbar-auth-buttons">
          <button
            className="navbar-auth-btn navbar-signup-btn"
            onClick={() => openAuthModal('signup')}
          >
            Sign Up
          </button>
          <button
            className="navbar-auth-btn navbar-login-btn"
            onClick={() => openAuthModal('login')}
          >
            Sign In
          </button>
        </div>
      )}

      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          mode={authMode}
        />
      )}
    </div>
  );
};

export default NavbarAuth;