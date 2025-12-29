// humanoid-robotics-theme.ts
export const humanoidRoboticsTheme = {
  colors: {
    primary: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9',
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
    },
    secondary: {
      50: '#fdf2f8',
      100: '#fce7f3',
      200: '#fbcfe8',
      300: '#f9a8d4',
      400: '#f472b6',
      500: '#ec4899',
      600: '#db2777',
      700: '#be185d',
      800: '#9d174d',
      900: '#831843',
    },
    accent: {
      blue: '#0ea5e9',
      cyan: '#06b6d4',
      purple: '#8b5cf6',
      pink: '#ec4899',
      green: '#10b981',
      amber: '#f59e0b',
    },
    neutral: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
      950: '#030712',
    }
  },
  gradients: {
    primary: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)',
    secondary: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
    accent: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
    background: 'linear-gradient(135deg, #030712 0%, #111827 100%)',
  },
  shadows: {
    soft: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    medium: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    large: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  },
  animations: {
    fadeIn: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    },
    slideIn: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -20 },
    },
    scaleIn: {
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.95 },
    },
    float: {
      y: [0, -10, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    },
    pulse: {
      scale: [1, 1.02, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  }
};

export const authAnimations = {
  formSlide: {
    initial: { opacity: 0, x: 50, scale: 0.95 },
    animate: { opacity: 1, x: 0, scale: 1 },
    exit: { opacity: 0, x: -50, scale: 0.95 },
    transition: { duration: 0.4, ease: 'easeOut' }
  },
  buttonHover: {
    scale: 1.02,
    transition: { duration: 0.2 }
  },
  inputFocus: {
    scale: 1.01,
    boxShadow: '0 0 0 3px rgba(56, 189, 248, 0.3)',
    transition: { duration: 0.2 }
  }
};