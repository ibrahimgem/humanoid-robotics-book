# Humanoid Robotics Auth Components

Beautiful, modern authentication components designed specifically for the Humanoid Robotics Book project with a futuristic robotics theme.

## Components Included

### 1. SignupForm
- Beautiful email and password signup form
- Real-time validation
- Loading states and error handling
- Smooth animations and transitions

### 2. SigninForm
- Sleek sign-in form with email and password
- "Remember me" functionality
- Forgot password link
- Loading states and error handling

### 3. EmailVerification
- Email verification component
- Resend verification email functionality
- Countdown timer for resend availability
- Success feedback

### 4. PasswordResetRequest
- Password reset request form
- Email validation
- Success state after submission
- Back to sign-in functionality

### 5. PasswordResetConfirm
- Password reset confirmation form
- New password and confirm password fields
- Success state after reset
- Back to sign-in functionality

### 6. OnboardingQuestionnaire
- 4-step onboarding questionnaire
- Software skills assessment
- Hardware experience evaluation
- ML background questions
- Interest selection
- Progress tracking

### 7. AuthContainer
- Main container component that manages auth state
- Handles transitions between different auth views
- Implements the humanoid robotics theme
- Provides consistent styling and animations

### 8. Auth Buttons
- Beautiful standalone signup and signin buttons
- Combined auth buttons component
- Multiple variants (primary, secondary, ghost)
- Multiple sizes (sm, md, lg)
- Loading states and animations
- Fully responsive design
- Cyberpunk-themed styling with cyan, blue, purple, and amber colors

## Features

- **Modern Design**: Sleek, futuristic interface with a humanoid robotics theme
- **Responsive**: Works perfectly on mobile, tablet, and desktop
- **Animations**: Smooth transitions and micro-interactions using Framer Motion
- **Validation**: Comprehensive client-side validation
- **Accessibility**: Built with accessibility best practices
- **Error Handling**: Proper error states and user feedback
- **TypeScript**: Fully typed with TypeScript
- **Customizable**: Easy to theme and customize

## Theme & Styling

The components use a humanoid robotics theme with:
- Cyberpunk-inspired color palette (cyans, blues, purples)
- Futuristic gradients and shadows
- Robotics-inspired icons and elements
- Smooth animations and transitions
- Responsive design for all devices

## API Integration

The components are designed to work with Better Auth and can be easily integrated with your backend API:

- `/api/auth/signup` - User registration
- `/api/auth/signin` - User login
- `/api/auth/verify/resend` - Resend verification email
- `/api/auth/reset-password/request` - Request password reset
- `/api/auth/reset-password/confirm` - Confirm password reset
- `/api/onboarding/complete` - Complete onboarding questionnaire

## Usage

### Installation

```bash
npm install framer-motion
```

### Basic Usage

```jsx
import { AuthProvider, AuthContainer } from './components/auth';

function App() {
  return (
    <AuthProvider>
      <AuthContainer
        initialAuthState="signin"
        onAuthSuccess={(user) => {
          // Handle successful authentication
        }}
        onVerificationComplete={() => {
          // Handle email verification completion
        }}
        onOnboardingComplete={(data) => {
          // Handle onboarding completion
        }}
      />
    </AuthProvider>
  );
}
```

## Architecture

The auth components follow a modular architecture:

```
src/components/auth/
├── index.ts                    # Export file
├── AuthContainer.tsx          # Main container component
├── SignupForm.tsx             # Signup form
├── SigninForm.tsx             # Signin form
├── EmailVerification.tsx      # Email verification
├── PasswordResetRequest.tsx   # Password reset request
├── PasswordResetConfirm.tsx   # Password reset confirmation
├── OnboardingQuestionnaire.tsx # Onboarding questionnaire
├── AuthContext.tsx            # Auth state management
├── theme.ts                   # Theme configuration
├── validation.ts              # Validation utilities
├── buttons/                   # Auth button components
│   ├── SignupButton.tsx       # Standalone signup button
│   ├── SigninButton.tsx       # Standalone signin button
│   ├── AuthButtons.tsx        # Combined auth buttons component
│   ├── AuthButtonsDemo.tsx    # Demo page for buttons
│   ├── README.md              # Buttons documentation
│   └── index.ts               # Buttons export file
├── AuthIntegration.md         # Integration guide
└── README.md                  # This file
```

## Customization

### Theme

You can customize the theme by modifying the `theme.ts` file or by overriding the CSS variables.

### Validation

Validation rules can be customized in the `validation.ts` file.

### Animations

Animations can be customized in the `theme.ts` file using the `authAnimations` object.

## Dependencies

- React (v18+)
- TypeScript
- Framer Motion (for animations)
- Tailwind CSS (recommended for styling)

## Accessibility

All components follow accessibility best practices:
- Proper ARIA attributes
- Keyboard navigation support
- Sufficient color contrast
- Semantic HTML structure
- Screen reader compatibility

## Security

- Passwords are never stored or logged
- All API calls use HTTPS in production
- Input validation prevents XSS attacks
- Secure authentication flow

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see the LICENSE file for details.