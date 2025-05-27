import { UserRepository } from '../repositories/userRepository';
import { PasswordHash } from '../utils/passwordHash';
import { JwtUtils } from '../config/jwt';
import { CreateUserRequest, LoginRequest, UserResponse } from '../models/User';

export class AuthService {
  /**
   * Registra novo usuário
   */
  static async register(userData: CreateUserRequest): Promise<{ user: UserResponse; token: string }> {
    // Verificar se usuário já existe
    const existingUser = await UserRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('Email já está em uso');
    }

    // Criptografar senha
    const password_hash = await PasswordHash.hash(userData.password);

    // Criar usuário
    const user = await UserRepository.create({
      ...userData,
      password_hash
    });

    // Gerar token
    const token = JwtUtils.generateToken({
      userId: user.id,
      email: user.email
    });

    // Retornar sem a senha
    const userResponse: UserResponse = {
      id: user.id,
      email: user.email,
      name: user.name,
      created_at: user.created_at
    };

    return { user: userResponse, token };
  }

  /**
   * Realiza login
   */
  static async login(loginData: LoginRequest): Promise<{ user: UserResponse; token: string }> {
    // Buscar usuário
    const user = await UserRepository.findByEmail(loginData.email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Verificar senha
    const isPasswordValid = await PasswordHash.compare(loginData.password, user.password_hash);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Gerar token
    const token = JwtUtils.generateToken({
      userId: user.id,
      email: user.email
    });

    // Retornar sem a senha
    const userResponse: UserResponse = {
      id: user.id,
      email: user.email,
      name: user.name,
      created_at: user.created_at
    };

    return { user: userResponse, token };
  }

  /**
   * Busca usuário pelo ID
   */
  static async getUserById(id: number): Promise<UserResponse | null> {
    const user = await UserRepository.findById(id);
    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      created_at: user.created_at
    };
  }
}