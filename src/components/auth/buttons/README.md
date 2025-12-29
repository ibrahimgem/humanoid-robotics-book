# Auth Buttons

Beautiful, modern signup and signin buttons for the Humanoid Robotics Book project. These buttons match the humanoid robotics/cyberpunk theme with the color palette (cyan, blue, purple, amber) and include hover effects and smooth animations.

## Components

### SignupButton
A standalone signup button with a plus sign icon that creates new accounts.

### SigninButton
A standalone signin button with an arrow icon that allows users to log in.

### AuthButtons
A combined component that shows both signup and signin buttons together.

## Features

- **Theme Consistency**: Matches the humanoid robotics/cyberpunk theme with cyan, blue, purple, and amber colors
- **Animations**: Smooth hover effects and transitions using Framer Motion
- **Responsive**: Works on all device sizes
- **Accessible**: Proper ARIA attributes and keyboard navigation
- **Flexible**: Multiple variants (primary, secondary, ghost) and sizes (sm, md, lg)
- **Loading States**: Visual feedback during async operations
- **TypeScript**: Full type safety

## Usage

### Individual Buttons

```tsx
import { SignupButton, SigninButton } from '@/components/auth/buttons';

// Basic usage
<SignupButton onClick={() => console.log('Sign up clicked')} />
<SigninButton onClick={() => console.log('Sign in clicked')} />

// With loading state
<SignupButton loading={isLoading} onClick={handleSignup} />
<SigninButton loading={isLoading} onClick={handleSignin} />

// Different variants
<SignupButton variant="secondary" onClick={handleSignup} />
<SigninButton variant="ghost" onClick={handleSignin} />

// Different sizes
<SignupButton size="lg" onClick={handleSignup} />
<SigninButton size="sm" onClick={handleSignin} />
```

### Combined Buttons

```tsx
import { AuthButtons } from '@/components/auth/buttons';

// Basic usage
<AuthButtons
  onSignupClick={handleSignup}
  onSigninClick={handleSignin}
/>

// With loading state
<AuthButtons
  onSignupClick={handleSignup}
  onSigninClick={handleSignin}
  loading={isLoading}
  variant="secondary"
/>
```

## Props

### SignupButton & SigninButton Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onClick` | `() => void` | - | Function to call when button is clicked |
| `variant` | `'primary' \| 'secondary' \| 'ghost'` | `'primary'` | Visual style of the button |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Size of the button |
| `disabled` | `boolean` | `false` | Whether the button is disabled |
| `loading` | `boolean` | `false` | Whether to show loading state |
| `className` | `string` | `''` | Additional CSS classes |
| `fullWidth` | `boolean` | `false` | Whether to make the button full width |

### AuthButtons Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onSignupClick` | `() => void` | - | Function to call when signup button is clicked |
| `onSigninClick` | `() => void` | - | Function to call when signin button is clicked |
| `variant` | `'primary' \| 'secondary' \| 'ghost'` | `'primary'` | Visual style of the buttons |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Size of the buttons |
| `disabled` | `boolean` | `false` | Whether the buttons are disabled |
| `loading` | `boolean` | `false` | Whether to show loading state |
| `className` | `string` | `''` | Additional CSS classes |
| `buttonSpacing` | `'sm' \| 'md' \| 'lg'` | `'md'` | Spacing between buttons |

## Styling

The buttons use the following color palette:
- **Primary**: Gradient from blue-600 to cyan-500
- **Secondary**: Gradient from purple-600 to pink-500
- **Ghost**: Cyan-500 border with transparent background

Animations include:
- Smooth hover scaling (1.02)
- Active state scaling (0.98)
- Loading spinner with smooth transitions
- Framer Motion animations for enhanced UX

## Accessibility

- Proper ARIA labels for screen readers
- Focus states with visible focus rings
- Keyboard navigable
- Sufficient color contrast
- Loading states with visual indicators