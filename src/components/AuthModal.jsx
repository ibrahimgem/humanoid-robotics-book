import React, { useState } from 'react';
import './AuthModal.css';

const AuthModal = ({ isOpen, onClose, mode = 'login' }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  // Profile questions for signup
  const [softwareExperience, setSoftwareExperience] = useState('');
  const [hardwareExperience, setHardwareExperience] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState('');
  const [learningGoals, setLearningGoals] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(1); // For multi-step signup

  if (!isOpen) return null;

  const totalSteps = mode === 'signup' ? 2 : 1; // Multi-step for signup, single for login

  const validateForm = () => {
    if (mode === 'login') {
      if (!email || !password) {
        setError('Please fill in all required fields');
        return false;
      }
      if (!/\S+@\S+\.\S+/.test(email)) {
        setError('Please enter a valid email address');
        return false;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters long');
        return false;
      }
      return true;
    } else {
      // For signup, validation depends on the current step
      if (currentStep === 1) {
        if (!name || !email || !password) {
          setError('Please fill in all required fields');
          return false;
        }
        if (!/\S+@\S+\.\S+/.test(email)) {
          setError('Please enter a valid email address');
          return false;
        }
        if (password.length < 6) {
          setError('Password must be at least 6 characters long');
          return false;
        }
        return true;
      } else {
        // Step 2 validation
        if (!softwareExperience || !hardwareExperience || !experienceLevel || !preferredLanguage || !learningGoals) {
          setError('Please fill in all profile fields');
          return false;
        }
        return true;
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form before submission
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const authContext = await import('../contexts/AuthContext');
      const { useAuth } = authContext;

      // Get the auth context from the React context
      // Since we can't directly use hooks in this component, we'll call the API directly
      // but update the context properly after successful authentication
      const apiService = await import('../services/api');
      let response;

      if (mode === 'signup') {
        // Include profile data in signup
        response = await apiService.default.register({
          email,
          password,
          name,
          software_experience: softwareExperience,
          hardware_experience: hardwareExperience,
          experience_level: experienceLevel,
          preferred_language: preferredLanguage,
          learning_goals: learningGoals
        });

        // If registration is successful, update the auth context
        if (response.access_token) {
          // Store the token
          localStorage.setItem('auth_token', response.access_token);

          // Update the global auth state by dispatching an event
          window.dispatchEvent(new CustomEvent('authUpdate', {
            detail: {
              user: {
                id: response.user_id,
                email: response.email,
                name: name,
                profile: response.profile
              }
            }
          }));
        }
      } else {
        response = await apiService.default.login({
          email,
          password
        });

        // If login is successful, update the auth context
        if (response.access_token) {
          // Store the token
          localStorage.setItem('auth_token', response.access_token);

          // Update the global auth state by dispatching an event
          window.dispatchEvent(new CustomEvent('authUpdate', {
            detail: {
              user: {
                id: response.user_id,
                email: response.email,
                name: response.email.split('@')[0],
                profile: response.profile
              }
            }
          }));
        }
      }

      onClose();
    } catch (err) {
      setError(err.message || `Failed to ${mode === 'signup' ? 'register' : 'login'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepContent = () => {
    if (mode === 'login') {
      return (
        <>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              disabled={isLoading}
            />
          </div>
        </>
      );
    }

    // Signup mode - show different content based on step
    if (currentStep === 1) {
      return (
        <>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              disabled={isLoading}
            />
          </div>
        </>
      );
    } else {
      return (
        <>
          <div className="form-group">
            <label htmlFor="softwareExperience">Software Experience</label>
            <select
              id="softwareExperience"
              value={softwareExperience}
              onChange={(e) => setSoftwareExperience(e.target.value)}
              required
              disabled={isLoading}
            >
              <option value="">Select your software experience</option>
              <option value="none">No experience</option>
              <option value="beginner">Beginner (1-2 years)</option>
              <option value="intermediate">Intermediate (3-5 years)</option>
              <option value="advanced">Advanced (5+ years)</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="hardwareExperience">Hardware Experience</label>
            <select
              id="hardwareExperience"
              value={hardwareExperience}
              onChange={(e) => setHardwareExperience(e.target.value)}
              required
              disabled={isLoading}
            >
              <option value="">Select your hardware experience</option>
              <option value="none">No experience</option>
              <option value="beginner">Beginner (1-2 years)</option>
              <option value="intermediate">Intermediate (3-5 years)</option>
              <option value="advanced">Advanced (5+ years)</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="experienceLevel">Experience Level</label>
            <select
              id="experienceLevel"
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value)}
              required
              disabled={isLoading}
            >
              <option value="">Select your experience level</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="preferredLanguage">Preferred Language</label>
            <select
              id="preferredLanguage"
              value={preferredLanguage}
              onChange={(e) => setPreferredLanguage(e.target.value)}
              required
              disabled={isLoading}
            >
              <option value="">Select your preferred language</option>
              <option value="en">English</option>
              <option value="ur">Urdu</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="learningGoals">Learning Goals</label>
            <textarea
              id="learningGoals"
              value={learningGoals}
              onChange={(e) => setLearningGoals(e.target.value)}
              placeholder="What are your learning goals for robotics and AI?"
              rows="3"
              required
              disabled={isLoading}
            />
          </div>
        </>
      );
    }
  };

  const renderStepIndicator = () => {
    if (mode === 'login') return null;

    return (
      <div className="step-indicator">
        <div className={`step ${currentStep >= 1 ? 'active' : ''}`}></div>
        <div className={`step ${currentStep >= 2 ? 'active' : ''}`}></div>
      </div>
    );
  };

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <div className="auth-modal-header">
          <h2>
            {mode === 'signup'
              ? currentStep === 1
                ? 'Create Account'
                : 'Profile Information'
              : 'Sign In'
            }
          </h2>
          <button className="auth-modal-close" onClick={onClose}>×</button>
        </div>

        <form className="auth-modal-form" onSubmit={handleSubmit}>
          {renderStepIndicator()}

          {renderStepContent()}

          {error && <div className="auth-error">{error}</div>}

          <div className="auth-form-actions">
            {mode === 'signup' && currentStep > 1 && (
              <button
                type="button"
                className="auth-back-btn"
                onClick={handleBack}
                disabled={isLoading}
              >
                Back
              </button>
            )}

            {mode === 'signup' && currentStep < totalSteps ? (
              <button
                type="button"
                className="auth-next-btn"
                onClick={handleNext}
                disabled={isLoading ||
                  (currentStep === 1 && (!name || !email || !password))}
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                className="auth-submit-btn"
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : (mode === 'signup' ? 'Complete Sign Up' : 'Sign In')}
              </button>
            )}
          </div>
        </form>

        <div className="auth-modal-footer">
          <p>
            {mode === 'signup'
              ? 'Already have an account? '
              : "Don't have an account? "}
            <button
              className="auth-toggle-mode"
              onClick={() => window.location.reload()} // Simple way to toggle, in real app you'd have a prop to change mode
            >
              {mode === 'signup' ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;