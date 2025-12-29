import React from 'react';
import Head from '@docusaurus/Head';
import { SignupButton, SigninButton, AuthButtons } from '../components/auth';

export default function AuthButtonsDemoPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', backgroundColor: '#0f172a' }}>
      <Head>
        <title>Auth Buttons Demo - Humanoid Robotics Book</title>
        <meta name="description" content="Demo of beautiful auth buttons for the Humanoid Robotics Book" />
      </Head>

      <div style={{ maxWidth: '600px', width: '100%', textAlign: 'center' }}>
        <h1 style={{ color: 'white', fontSize: '2.5rem', marginBottom: '2rem' }}>Auth Buttons Demo</h1>

        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ color: 'cyan', marginBottom: '1rem' }}>Individual Buttons</h2>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <SignupButton onClick={() => alert('Sign up clicked!')} />
            <SigninButton onClick={() => alert('Sign in clicked!')} />
          </div>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ color: 'cyan', marginBottom: '1rem' }}>Combined Auth Buttons</h2>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <AuthButtons
              onSignupClick={() => alert('Sign up clicked!')}
              onSigninClick={() => alert('Sign in clicked!')}
            />
          </div>
        </div>

        <div>
          <h2 style={{ color: 'cyan', marginBottom: '1rem' }}>Different Variants</h2>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <SignupButton variant="primary" onClick={() => alert('Primary signup clicked!')} />
            <SignupButton variant="secondary" onClick={() => alert('Secondary signup clicked!')} />
            <SignupButton variant="ghost" onClick={() => alert('Ghost signup clicked!')} />
          </div>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1rem', flexWrap: 'wrap' }}>
            <SigninButton variant="primary" onClick={() => alert('Primary sign in clicked!')} />
            <SigninButton variant="secondary" onClick={() => alert('Secondary sign in clicked!')} />
            <SigninButton variant="ghost" onClick={() => alert('Ghost sign in clicked!')} />
          </div>
        </div>
      </div>
    </div>
  );
}