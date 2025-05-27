import type { LoginRequest, User, LoginResponse, RegisterRequest, RegisterResponse } from "../types/userTypes";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export async function loginUser(credentials: LoginRequest): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Login failed');
  }
  return data as LoginResponse;
}

export async function registerUser(credentials: RegisterRequest): Promise<RegisterResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Registration failed');
  }
  return data as RegisterResponse;
}


export async function fetchUserProfile(token: string): Promise<{ user: User }> {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch user profile');
  }
  return data as { user: User };
}