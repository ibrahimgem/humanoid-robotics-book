---
title: Auth Buttons Demo
sidebar_position: 2
---

# Auth Buttons Demo

This page showcases the beautiful signup and signin buttons created for the Humanoid Robotics Book project with a futuristic robotics theme.

## Component Showcase

Our auth button components include:

### 1. SignupButton

A modern signup button with a plus sign icon, featuring:

- Cyberpunk-inspired gradient styling (blue to cyan)
- Hover and active animations
- Loading state with spinner
- Multiple variants (primary, secondary, ghost)
- Responsive sizing (small, medium, large)

### 2. SigninButton

A sleek signin button with an arrow icon, featuring:

- Cyberpunk-inspired gradient styling (cyan to blue)
- Hover and active animations
- Loading state with spinner
- Multiple variants (primary, secondary, ghost)
- Responsive sizing (small, medium, large)

### 3. AuthButtons

A combined component showing both signup and signin buttons together:

- Proper spacing between buttons
- Consistent styling
- Shared properties across both buttons
- Responsive layout

## Design Features

The auth buttons feature:

- **Futuristic Robotics Theme**: Cyberpunk-inspired color palette with cyans, blues, and purples
- **Smooth Animations**: Subtle scaling animations using Framer Motion
- **Responsive Design**: Works perfectly on mobile, tablet, and desktop devices
- **Accessibility First**: Proper ARIA attributes and keyboard navigation
- **Type-Safe**: Fully typed with TypeScript interfaces

## Usage

To use the auth buttons in your application:

```jsx
import { SignupButton, SigninButton, AuthButtons } from './components/auth';

// Individual buttons
<SignupButton
  onClick={() => console.log('Sign up clicked')}
  variant="primary"
  size="md"
/>

<SigninButton
  onClick={() => console.log('Sign in clicked')}
  variant="secondary"
  size="md"
/>

// Combined buttons
<AuthButtons
  onSignupClick={() => console.log('Sign up clicked')}
  onSigninClick={() => console.log('Sign in clicked')}
  variant="primary"
  size="md"
/>
```

You can see the buttons in action on our [Auth Buttons Demo Page](/auth-buttons-demo).