import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Auth context
const AuthContext = createContext();

// Auth reducer
const authReducer = (state, action) => {
  console.log('Auth reducer action:', action.type, action.payload);
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        loading: true,
        error: null
      };
    case 'LOGIN_SUCCESS':
      console.log('Login success, updating state:', action.payload);
      return {
        ...state,
        loading: false,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        error: null
      };
    case 'LOGIN_FAILURE':
      console.log('Login failure, updating state:', action.payload);
      return {
        ...state,
        loading: false,
        isAuthenticated: false,
        user: null,
        token: null,
        error: action.payload
      };
    case 'REGISTER_START':
      return {
        ...state,
        loading: true,
        error: null
      };
    case 'REGISTER_SUCCESS':
      return {
        ...state,
        loading: false,
        error: null
      };
    case 'REGISTER_FAILURE':
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    case 'LOGOUT':
      console.log('Logout, clearing state');
      localStorage.removeItem('token');
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
        error: null
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    default:
      return state;
  }
};

// Initial state
const initialState = {
  isAuthenticated: false,
  user: null,
  token: null,
  loading: false,
  error: null
};

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check if user is authenticated on app load
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Verify token with backend
      fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Token invalid');
        }
        return response.json();
      })
      .then(data => {
        if (data.user) {
          console.log('🔍 User data from /me:', data.user);
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: {
              user: data.user,
              token: token
            }
          });
          
          // Handle return URL from query params
          const urlParams = new URLSearchParams(window.location.search);
          const returnUrl = urlParams.get('returnUrl');
          if (returnUrl && window.location.pathname === '/auth') {
            window.location.href = decodeURIComponent(returnUrl);
          }
        } else {
          localStorage.removeItem('token');
        }
      })
      .catch(error => {
        console.error('Token verification failed:', error);
        localStorage.removeItem('token'); // Clear invalid token
      });
    }
  }, []);

  // Login function
  const login = async (email, password) => {
    console.log('🔐 Frontend login attempt:', { email, passwordProvided: !!password });
    dispatch({ type: 'LOGIN_START' });
    
    try {
      console.log('📡 Making API request to /api/auth/login');
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      console.log('📡 Login response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.log('❌ Login failed:', errorData);
        dispatch({
          type: 'LOGIN_FAILURE',
          payload: errorData.error || 'Login failed'
        });
        return { success: false, error: errorData.error };
      }

      const data = await response.json();
      console.log('✅ Login response data:', data);

      if (data.token && data.user) {
        console.log('💾 Storing token in localStorage');
        localStorage.setItem('token', data.token);
        
        console.log('🔄 Updating auth context state');
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: {
            user: data.user,
            token: data.token
          }
        });
        
        console.log('✅ Login successful, user authenticated');
        
        return { success: true, user: data.user };
      } else {
        console.log('❌ Invalid response format:', data);
        dispatch({
          type: 'LOGIN_FAILURE',
          payload: 'Invalid response from server'
        });
        return { success: false, error: 'Invalid response from server' };
      }
    } catch (error) {
      console.error('💥 Login error:', error);
      const errorMessage = 'Network error. Please try again.';
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  };

  // Register function with automatic login
  const register = async (email, password, name) => {
    console.log('Register attempt:', { email, name });
    dispatch({ type: 'REGISTER_START' });
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password, name })
      });

      console.log('Register response status:', response.status);
      const data = await response.json();
      console.log('Register response data:', data);

      if (response.ok) {
        dispatch({
          type: 'REGISTER_SUCCESS'
        });
        console.log('Registration successful');
        
        // Automatically log in the user after successful registration
        console.log('🔄 Auto-logging in user after registration...');
        const loginResult = await login(email, password);
        
        return loginResult;
      } else {
        console.log('Registration failed:', data.error);
        dispatch({
          type: 'REGISTER_FAILURE',
          payload: data.error || 'Registration failed'
        });
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = 'Network error. Please try again.';
      dispatch({
        type: 'REGISTER_FAILURE',
        payload: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    dispatch({ type: 'LOGOUT' });
    
    // Redirect to auth page
    window.location.href = '/auth';
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
