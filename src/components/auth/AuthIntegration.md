# Humanoid Robotics Auth Components Integration Guide

This guide explains how to integrate the beautiful auth components into your Docusaurus application.

## Installation

First, install the required dependencies:

```bash
npm install framer-motion
```

## Basic Usage

### 1. Wrap your application with AuthProvider

```jsx
import React from 'react';
import { AuthProvider } from './components/auth';
import { AuthContainer } from './components/auth';

function App() {
  return (
    <AuthProvider>
      <AuthContainer
        initialAuthState="signin"
        onAuthSuccess={(user) => {
          console.log('Authentication successful:', user);
          // Redirect to dashboard or main app
        }}
        onVerificationComplete={() => {
          console.log('Email verification complete');
          // Redirect to onboarding or main app
        }}
        onOnboardingComplete={(data) => {
          console.log('Onboarding complete:', data);
          // Redirect to main app
        }}
      />
    </AuthProvider>
  );
}
```

### 2. Using individual components

You can also use individual components as needed:

```jsx
import { SignupForm, SigninForm, EmailVerification } from './components/auth';

// In your component
function MyAuthPage() {
  const [currentView, setCurrentView] = useState('signin');

  return (
    <div className="auth-container">
      {currentView === 'signin' && (
        <SigninForm
          onSuccess={() => setCurrentView('dashboard')}
          onError={(error) => console.error(error)}
        />
      )}
      {currentView === 'signup' && (
        <SignupForm
          onSuccess={() => setCurrentView('verification')}
          onError={(error) => console.error(error)}
        />
      )}
      {currentView === 'verification' && (
        <EmailVerification
          email="user@example.com"
          onVerified={() => setCurrentView('onboarding')}
        />
      )}
    </div>
  );
}
```

## API Integration

The components are designed to work with the backend API endpoints:

- `/api/auth/signup` - User registration
- `/api/auth/signin` - User login
- `/api/auth/verify/resend` - Resend verification email
- `/api/auth/reset-password/request` - Request password reset
- `/api/auth/reset-password/confirm` - Confirm password reset
- `/api/onboarding/complete` - Complete onboarding questionnaire

## Customization

### Theme Customization

You can customize the theme using the provided theme object:

```jsx
import { humanoidRoboticsTheme } from './components/auth';

// Use the theme colors in your custom components
const customStyle = {
  background: humanoidRoboticsTheme.gradients.primary,
  color: humanoidRoboticsTheme.colors.neutral[50]
};
```

### Validation

The components include comprehensive validation:

```jsx
import { validateEmail, validatePassword, signupValidation } from './components/auth';

// Use validation functions in your custom forms
const isValidEmail = validateEmail('user@example.com');
const passwordErrors = validatePassword('mypassword');
```

## Animation Configuration

The components use framer-motion for smooth animations. You can customize animations using the `authAnimations` object:

```jsx
import { authAnimations } from './components/auth';

// Use in your custom components
<motion.div
  initial={authAnimations.formSlide.initial}
  animate={authAnimations.formSlide.animate}
  exit={authAnimations.formSlide.exit}
  transition={authAnimations.formSlide.transition}
>
  {/* Your content */}
</motion.div>
```

## Error Handling

The components provide comprehensive error handling:

```jsx
import { getErrorMessage, handleApiError } from './components/auth';

// Handle API errors
try {
  const response = await fetch('/api/auth/signup', { /* ... */ });
  if (!response.ok) {
    const errorMessage = await handleApiError(response);
    console.error(errorMessage);
  }
} catch (error) {
  const errorMessage = getErrorMessage(error);
  console.error(errorMessage);
}
```

## Onboarding Flow

The onboarding questionnaire includes 4 steps:

1. Software Skills - Describe programming and development experience
2. Hardware Experience - Describe electronics and robotics experience
3. ML Background - Describe machine learning and AI experience
4. Interests - Select topics of interest for personalization

## Responsive Design

All components are fully responsive and work on mobile, tablet, and desktop devices. The design adapts to different screen sizes automatically.

## Accessibility

The components follow accessibility best practices:
- Proper ARIA attributes
- Keyboard navigation support
- Sufficient color contrast
- Semantic HTML structure
- Screen reader compatibility

## Security Considerations

- Passwords are never stored or logged
- All API calls use HTTPS in production
- Input validation prevents XSS attacks
- Secure authentication flow