# Authentication Components

The Humanoid Robotics Book project includes beautiful, modern authentication components designed with a futuristic robotics theme. These components provide a complete authentication flow including signup, signin, email verification, password reset, and onboarding.

## Overview

Our auth components include:

- **SignupForm**: Beautiful email and password registration form
- **SigninForm**: Sleek sign-in form with email and password
- **EmailVerification**: Email verification component with resend functionality
- **PasswordResetRequest**: Password reset request form
- **PasswordResetConfirm**: Password reset confirmation form
- **OnboardingQuestionnaire**: 4-step onboarding questionnaire to personalize the user experience
- **AuthContainer**: Main container that manages the authentication flow

## Features

- Modern, responsive design with humanoid robotics theme
- Smooth animations and transitions using Framer Motion
- Comprehensive validation and error handling
- Accessible and user-friendly interface
- API integration ready
- TypeScript support

## Getting Started

### Installation

First, install the required dependencies:

```bash
npm install framer-motion
```

### Basic Usage

To use the complete authentication flow, wrap your application with the `AuthProvider` and use the `AuthContainer`:

```jsx
import { AuthProvider, AuthContainer } from './components/auth';

function App() {
  return (
    <AuthProvider>
      <AuthContainer
        initialAuthState="signin"
        onAuthSuccess={(user) => {
          // Handle successful authentication
          console.log('User authenticated:', user);
        }}
        onVerificationComplete={() => {
          // Handle email verification completion
          console.log('Email verified');
        }}
        onOnboardingComplete={(data) => {
          // Handle onboarding completion
          console.log('Onboarding completed:', data);
        }}
      />
    </AuthProvider>
  );
}
```

### Using Individual Components

You can also use individual components as needed:

```jsx
import { SignupForm, SigninForm, EmailVerification } from './components/auth';

function MyAuthPage() {
  const [currentView, setCurrentView] = useState('signin');

  return (
    <div className="auth-container">
      {currentView === 'signin' && (
        <SigninForm
          onSuccess={() => console.log('Sign in successful')}
          onError={(error) => console.error('Sign in error:', error)}
        />
      )}
      {currentView === 'signup' && (
        <SignupForm
          onSuccess={() => setCurrentView('verification')}
          onError={(error) => console.error('Sign up error:', error)}
        />
      )}
      {currentView === 'verification' && (
        <EmailVerification
          email="user@example.com"
          onVerified={() => console.log('Email verified')}
        />
      )}
    </div>
  );
}
```

## API Integration

The components are designed to work with your backend API. Update the API endpoints in each component to match your backend implementation:

- `/api/auth/signup` - User registration
- `/api/auth/signin` - User login
- `/api/auth/verify/resend` - Resend verification email
- `/api/auth/reset-password/request` - Request password reset
- `/api/auth/reset-password/confirm` - Confirm password reset
- `/api/onboarding/complete` - Complete onboarding questionnaire

## Theming

The components use a futuristic robotics theme with customizable colors and animations. You can access the theme values:

```jsx
import { humanoidRoboticsTheme, authAnimations } from './components/auth';

// Use theme colors
const customStyle = {
  background: humanoidRoboticsTheme.gradients.primary,
  color: humanoidRoboticsTheme.colors.neutral[50]
};

// Use animations
<motion.div
  initial={authAnimations.slideIn.initial}
  animate={authAnimations.slideIn.animate}
>
  {/* Content */}
</motion.div>
```

## Onboarding Flow

The onboarding questionnaire consists of 4 steps:

1. **Software Skills**: Collect information about the user's programming and development experience
2. **Hardware Experience**: Gather details about electronics and robotics experience
3. **ML Background**: Understand the user's machine learning and AI background
4. **Interests**: Allow users to select topics they're interested in for personalization

The onboarding data is used to customize the content and recommendations for each user.

## Accessibility

All auth components follow accessibility best practices:

- Proper ARIA attributes
- Keyboard navigation support
- Sufficient color contrast
- Semantic HTML structure
- Screen reader compatibility

## Security Considerations

- Passwords are never stored or logged locally
- All API calls should use HTTPS in production
- Input validation prevents XSS attacks
- Secure authentication flow implementation