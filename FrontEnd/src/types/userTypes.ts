// C:/WorkHome/AlphaEdtech/React/KeepTrack/FrontEnd/src/types/userTypes.ts
export interface User {
  id: number;
  email: string;
  name: string;
  created_at: string; // Assuming ISO string from backend JSON
}

// From BackEnd/src/models/User.ts
export interface LoginRequest {
  email: string;
  password: string;
}

// Expected response from backend login
export interface LoginResponse {
  message: string;
  user: User;
  token: string;
}

// For frontend registration form
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

// Expected response from backend registration
export interface RegisterResponse {
  message: string;
  user: User;
  token: string; // Backend sends token upon successful registration
}