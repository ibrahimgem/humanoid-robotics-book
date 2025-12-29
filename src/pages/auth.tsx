import React from 'react';
import { AuthProvider, AuthContainer } from '@site/src/components/auth';

export default function AuthPage() {
  return (
    <AuthProvider>
      <div className="auth-page">
        <AuthContainer
          initialAuthState="signin"
          onAuthSuccess={(user) => {
            console.log('Authentication successful:', user);
            // Handle successful authentication
          }}
          onVerificationComplete={() => {
            console.log('Email verification complete');
            // Handle verification completion
          }}
          onOnboardingComplete={(data) => {
            console.log('Onboarding complete:', data);
            // Handle onboarding completion
          }}
        />
      </div>
    </AuthProvider>
  );
}