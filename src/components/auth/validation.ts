// validation.ts
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): string[] => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return errors;
};

export const validatePasswordMatch = (password: string, confirmPassword: string): boolean => {
  return password === confirmPassword;
};

export const validateSoftwareSkills = (skills: string): string | null => {
  if (!skills.trim()) {
    return 'Software skills description is required';
  }
  if (skills.trim().length < 10) {
    return 'Please provide more details about your software skills';
  }
  return null;
};

export const validateHardwareExperience = (experience: string): string | null => {
  if (!experience.trim()) {
    return 'Hardware experience description is required';
  }
  if (experience.trim().length < 10) {
    return 'Please provide more details about your hardware experience';
  }
  return null;
};

export const validateMLBackground = (background: string): string | null => {
  if (!background.trim()) {
    return 'ML background description is required';
  }
  if (background.trim().length < 10) {
    return 'Please provide more details about your ML background';
  }
  return null;
};

export const validateInterests = (interests: string[]): string | null => {
  if (interests.length === 0) {
    return 'Please select at least one interest';
  }
  if (interests.length < 2) {
    return 'Please select at least 2 interests to help us personalize your experience';
  }
  return null;
};

// Form validation schemas
export const signupValidation = {
  email: (email: string) => validateEmail(email) ? null : 'Please enter a valid email address',
  password: (password: string) => {
    const errors = validatePassword(password);
    return errors.length > 0 ? errors[0] : null; // Return first error
  },
  confirmPassword: (password: string, confirmPassword: string) =>
    validatePasswordMatch(password, confirmPassword) ? null : 'Passwords do not match'
};

export const signinValidation = {
  email: (email: string) => validateEmail(email) ? null : 'Please enter a valid email address',
  password: (password: string) => {
    if (!password) return 'Password is required';
    return null;
  }
};

export const onboardingValidation = {
  softwareSkills: (skills: string) => validateSoftwareSkills(skills),
  hardwareExperience: (experience: string) => validateHardwareExperience(experience),
  mlBackground: (background: string) => validateMLBackground(background),
  interests: (interests: string[]) => validateInterests(interests)
};

// Error message utilities
export const getErrorMessage = (error: any): string => {
  if (typeof error === 'string') {
    return error;
  }

  if (error && typeof error === 'object' && error.message) {
    return error.message;
  }

  if (error && typeof error === 'object' && error.error) {
    return error.error;
  }

  return 'An unexpected error occurred. Please try again.';
};

// API error handling
export const handleApiError = async (response: Response): Promise<string> => {
  try {
    const data = await response.json();
    return data.error || data.message || 'An error occurred';
  } catch (e) {
    return response.statusText || 'An error occurred';
  }
};