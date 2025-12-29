import React from 'react';
import Head from '@docusaurus/Head';
import { AuthProvider, AuthContainer } from '../components/auth';

export default function AuthDemoPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <Head>
        <title>Authentication Demo - Humanoid Robotics Book</title>
        <meta name="description" content="Demo of beautiful auth components for the Humanoid Robotics Book" />
      </Head>

      <AuthProvider>
        <AuthContainer
          initialAuthState="signin"
          onAuthSuccess={(user) => {
            console.log('Authentication successful:', user);
            alert('Authentication successful!');
          }}
          onVerificationComplete={() => {
            console.log('Email verification complete');
            alert('Email verification complete!');
          }}
          onOnboardingComplete={(data) => {
            console.log('Onboarding complete:', data);
            alert('Onboarding complete!');
          }}
        />
      </AuthProvider>
    </div>
  );
}