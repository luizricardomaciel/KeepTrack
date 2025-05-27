import React, { createContext, useState, useEffect, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import type { User, LoginRequest, RegisterRequest } from '../types/userTypes';
import { loginUser, fetchUserProfile, registerUser } from '../api/authService';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean; // For initial auth check and login/register process
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: (credentials: LoginRequest) => Promise<void>;
  register: (credentials: RegisterRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Start as true for initial check
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const validateToken = async () => {
      if (token) {
        try {
          const { user: profile } = await fetchUserProfile(token);
          setUser(profile);
          setIsAuthenticated(true);
          localStorage.setItem('token', token); // Refresh token in storage if needed, or ensure it's set
        } catch (err) {
          console.error('Token validation failed:', err);
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
          setIsAuthenticated(false);
        }
      }
      setIsLoading(false);
    };
    validateToken();
  }, [token]);

  const login = async (credentials: LoginRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await loginUser(credentials);
      setUser(data.user);
      setToken(data.token);
      setIsAuthenticated(true);
      localStorage.setItem('token', data.token);
      navigate('/home');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      console.error('Login failed:', errorMessage);
      setError(errorMessage);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (credentials: RegisterRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await registerUser(credentials);
      // Optionally, log the user in directly after registration
      setUser(data.user);
      setToken(data.token);
      setIsAuthenticated(true);
      localStorage.setItem('token', data.token);
      navigate('/home'); // Or navigate to '/login' and show a success message
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      console.error('Registration failed:', errorMessage);
      setError(errorMessage);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem('token');
    setError(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, isLoading, error, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;