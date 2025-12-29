import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SignupForm from './SignupForm';
import SigninForm from './SigninForm';
import EmailVerification from './EmailVerification';
import PasswordResetRequest from './PasswordResetRequest';
import PasswordResetConfirm from './PasswordResetConfirm';
import OnboardingQuestionnaire from './OnboardingQuestionnaire';

type AuthState =
  | 'signup'
  | 'signin'
  | 'email-verification'
  | 'forgot-password'
  | 'reset-password'
  | 'onboarding';

interface AuthContainerProps {
  initialAuthState?: AuthState;
  onAuthSuccess?: (user: any) => void;
  onVerificationComplete?: () => void;
  onOnboardingComplete?: (data: any) => void;
}

const AuthContainer: React.FC<AuthContainerProps> = ({
  initialAuthState = 'signin',
  onAuthSuccess,
  onVerificationComplete,
  onOnboardingComplete
}) => {
  const [authState, setAuthState] = useState<AuthState>(initialAuthState);
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Listen for auth toggle events
  useEffect(() => {
    const handleAuthToggle = (e: CustomEvent) => {
      setAuthState(e.detail as AuthState);
      setError('');
    };

    const eventListener = (e: Event) => handleAuthToggle(e as CustomEvent);
    document.addEventListener('authToggle', eventListener);

    return () => {
      document.removeEventListener('authToggle', eventListener);
    };
  }, []);

  // Handle successful authentication
  const handleAuthSuccess = () => {
    if (authState === 'signup') {
      setAuthState('email-verification');
    } else {
      onAuthSuccess?.({});
    }
  };

  // Handle successful onboarding
  const handleOnboardingComplete = (data: any) => {
    onOnboardingComplete?.(data);
  };

  // Handle verification complete
  const handleVerificationComplete = () => {
    onVerificationComplete?.();
  };

  // Handle error
  const handleError = (errorMessage: string) => {
    setError(errorMessage);
  };

  // Handle email for verification
  const handleEmailSet = (emailValue: string) => {
    setEmail(emailValue);
  };

  // Handle reset token
  const handleResetToken = (token: string) => {
    setResetToken(token);
    setAuthState('reset-password');
  };

  const renderCurrentView = () => {
    switch (authState) {
      case 'signup':
        return (
          <SignupForm
            onSuccess={handleAuthSuccess}
            onError={handleError}
          />
        );
      case 'signin':
        return (
          <SigninForm
            onSuccess={handleAuthSuccess}
            onError={handleError}
          />
        );
      case 'email-verification':
        return (
          <EmailVerification
            email={email}
            onResend={() => {}}
            onVerified={handleVerificationComplete}
          />
        );
      case 'forgot-password':
        return (
          <PasswordResetRequest
            onSuccess={() => setAuthState('signin')}
            onError={handleError}
          />
        );
      case 'reset-password':
        return (
          <PasswordResetConfirm
            token={resetToken}
            onSuccess={() => setAuthState('signin')}
            onError={handleError}
          />
        );
      case 'onboarding':
        return (
          <OnboardingQuestionnaire
            onComplete={handleOnboardingComplete}
            onError={handleError}
          />
        );
      default:
        return (
          <SigninForm
            onSuccess={handleAuthSuccess}
            onError={handleError}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center p-4">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
      </div>

      {/* Floating robot elements */}
      <div className="absolute top-20 left-10 w-16 h-16 opacity-20">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <path d="M50 15 L65 30 L85 30 L85 60 L65 60 L50 75 L35 60 L15 60 L15 30 L35 30 Z" fill="currentColor" className="text-cyan-400" />
          <circle cx="40" cy="40" r="5" fill="currentColor" className="text-white" />
          <circle cx="60" cy="40" r="5" fill="currentColor" className="text-white" />
          <path d="M45 55 Q50 60 55 55" stroke="currentColor" className="text-white" strokeWidth="2" fill="none" />
        </svg>
      </div>

      <div className="absolute bottom-20 right-10 w-12 h-12 opacity-20 rotate-45">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <rect x="20" y="20" width="60" height="60" rx="5" fill="currentColor" className="text-purple-400" />
          <circle cx="40" cy="40" r="3" fill="currentColor" className="text-white" />
          <circle cx="60" cy="40" r="3" fill="currentColor" className="text-white" />
          <rect x="45" y="55" width="10" height="15" rx="2" fill="currentColor" className="text-white" />
        </svg>
      </div>

      <div className="absolute top-1/3 right-1/4 w-8 h-8 opacity-20">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle cx="50" cy="30" r="15" fill="currentColor" className="text-blue-400" />
          <rect x="40" y="45" width="20" height="30" rx="2" fill="currentColor" className="text-blue-400" />
          <rect x="35" y="75" width="10" height="15" rx="2" fill="currentColor" className="text-blue-400" />
          <rect x="55" y="75" width="10" height="15" rx="2" fill="currentColor" className="text-blue-400" />
        </svg>
      </div>

      {/* Main content */}
      <div className="relative z-10 w-full max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center mr-3">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Humanoid Robotics
            </h1>
          </div>
          <p className="text-xl text-gray-400">
            {authState === 'signup' && 'Join our robotics community'}
            {authState === 'signin' && 'Welcome back to the future of robotics'}
            {authState === 'email-verification' && 'Verify your account to get started'}
            {authState === 'forgot-password' && 'Reset your password'}
            {authState === 'reset-password' && 'Create your new password'}
            {authState === 'onboarding' && 'Tell us about your robotics background'}
          </p>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-900/30 border border-red-700 rounded-lg text-red-400 text-center"
          >
            {error}
          </motion.div>
        )}

        <motion.div
          key={authState}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {renderCurrentView()}
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center text-gray-500 text-sm"
        >
          <p>© 2025 Humanoid Robotics. Building the future, one robot at a time.</p>
          <div className="flex justify-center space-x-6 mt-4">
            <a href="#" className="hover:text-cyan-400 transition-colors">Privacy</a>
            <a href="#" className="hover:text-cyan-400 transition-colors">Terms</a>
            <a href="#" className="hover:text-cyan-400 transition-colors">Support</a>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthContainer;