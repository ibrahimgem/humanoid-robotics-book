import React, { createContext, useContext, useReducer, ReactNode } from 'react';

interface AuthState {
  user: any | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  currentView: 'signin' | 'signup' | 'email-verification' | 'forgot-password' | 'reset-password' | 'onboarding';
  email: string;
  resetToken: string;
}

interface AuthAction {
  type:
    | 'SET_LOADING'
    | 'SET_ERROR'
    | 'CLEAR_ERROR'
    | 'SET_USER'
    | 'LOGOUT'
    | 'SET_VIEW'
    | 'SET_EMAIL'
    | 'SET_RESET_TOKEN'
    | 'SET_CURRENT_VIEW';
  payload?: any;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  currentView: 'signin',
  email: '',
  resetToken: '',
};

const AuthContext = createContext<{
  state: AuthState;
  dispatch: React.Dispatch<AuthAction>;
} | undefined>(undefined);

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
        error: null,
      };
    case 'SET_ERROR':
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'LOGOUT':
      return {
        ...initialState,
        currentView: 'signin',
      };
    case 'SET_VIEW':
      return {
        ...state,
        currentView: action.payload,
      };
    case 'SET_EMAIL':
      return {
        ...state,
        email: action.payload,
      };
    case 'SET_RESET_TOKEN':
      return {
        ...state,
        resetToken: action.payload,
      };
    default:
      return state;
  }
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  return (
    <AuthContext.Provider value={{ state, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Action creators
export const setLoading = (isLoading: boolean) => ({
  type: 'SET_LOADING',
  payload: isLoading,
});

export const setError = (error: string) => ({
  type: 'SET_ERROR',
  payload: error,
});

export const clearError = () => ({
  type: 'CLEAR_ERROR',
});

export const setUser = (user: any) => ({
  type: 'SET_USER',
  payload: user,
});

export const logout = () => ({
  type: 'LOGOUT',
});

export const setCurrentView = (view: AuthState['currentView']) => ({
  type: 'SET_VIEW',
  payload: view,
});

export const setEmail = (email: string) => ({
  type: 'SET_EMAIL',
  payload: email,
});

export const setResetToken = (token: string) => ({
  type: 'SET_RESET_TOKEN',
  payload: token,
});