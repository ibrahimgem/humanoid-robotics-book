import React from 'react';
import { motion } from 'framer-motion';

interface SigninButtonProps {
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  fullWidth?: boolean;
}

const SigninButton: React.FC<SigninButtonProps> = ({
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
  fullWidth = false,
}) => {
  // Define button styles based on variant
  const getButtonStyles = () => {
    const baseStyles = `
      inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200
      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900
      disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
      ${fullWidth ? 'w-full' : 'w-auto'}
    `;

    const sizeClasses = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg'
    };

    const variantStyles = {
      primary: `
        bg-gradient-to-r from-cyan-600 to-blue-500 hover:from-cyan-700 hover:to-blue-600
        text-white focus:ring-cyan-500
        transform hover:scale-[1.02] active:scale-[0.98]
      `,
      secondary: `
        bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600
        text-white focus:ring-purple-500
        transform hover:scale-[1.02] active:scale-[0.98]
      `,
      ghost: `
        bg-transparent border border-cyan-500 text-cyan-400 hover:bg-cyan-500/10
        focus:ring-cyan-500
      `
    };

    return `${baseStyles} ${sizeClasses[size as keyof typeof sizeClasses]} ${variantStyles[variant as keyof typeof variantStyles]} ${className}`;
  };

  return (
    <motion.button
      whileHover={variant !== 'ghost' ? { scale: 1.02 } : {}}
      whileTap={variant !== 'ghost' ? { scale: 0.98 } : {}}
      onClick={onClick}
      disabled={disabled || loading}
      className={getButtonStyles()}
      aria-label="Sign in"
      role="button"
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <svg
            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Signing in...
        </div>
      ) : (
        <>
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
            />
          </svg>
          Sign In
        </>
      )}
    </motion.button>
  );
};

export default SigninButton;