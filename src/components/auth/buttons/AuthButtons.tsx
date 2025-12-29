import React from 'react';
import { motion } from 'framer-motion';
import SignupButton from './SignupButton';
import SigninButton from './SigninButton';

interface AuthButtonsProps {
  onSignupClick?: () => void;
  onSigninClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  showIcons?: boolean;
  buttonSpacing?: 'sm' | 'md' | 'lg';
}

const AuthButtons: React.FC<AuthButtonsProps> = ({
  onSignupClick,
  onSigninClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
  showIcons = true,
  buttonSpacing = 'md',
}) => {
  const spacingClasses = {
    sm: 'space-x-2',
    md: 'space-x-4',
    lg: 'space-x-6',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`flex items-center ${spacingClasses[buttonSpacing as keyof typeof spacingClasses]} ${className}`}
    >
      <SignupButton
        onClick={onSignupClick}
        variant={variant}
        size={size}
        disabled={disabled}
        loading={loading && !onSigninClick} // Only show loading when signup is in progress
        fullWidth={false}
      />
      <SigninButton
        onClick={onSigninClick}
        variant={variant}
        size={size}
        disabled={disabled}
        loading={loading && !onSignupClick} // Only show loading when signin is in progress
        fullWidth={false}
      />
    </motion.div>
  );
};

export default AuthButtons;