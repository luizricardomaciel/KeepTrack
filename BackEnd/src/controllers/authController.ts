import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { CreateUserRequest, LoginRequest } from '../models/User';

export class AuthController {
  /**
   * POST /api/auth/register
   */
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const userData: CreateUserRequest = req.body;
      const result = await AuthService.register(userData);
      
      res.status(201).json({
        message: 'Usuário criado com sucesso',
        user: result.user,
        token: result.token
      });
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Erro ao criar usuário'
      });
    }
  }

  /**
   * POST /api/auth/login
   */
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const loginData: LoginRequest = req.body;
      const result = await AuthService.login(loginData);
      
      res.json({
        message: 'Login realizado com sucesso',
        user: result.user,
        token: result.token
      });
    } catch (error) {
      res.status(401).json({
        error: error instanceof Error ? error.message : 'Erro ao fazer login'
      });
    }
  }

  /**
   * GET /api/auth/me
   */
  static async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const user = await AuthService.getUserById(userId);
      
      if (!user) {
        res.status(404).json({ error: 'Usuário não encontrado' });
        return;
      }
      
      res.json({ user });
    } catch (error) {
      res.status(500).json({
        error: 'Erro ao buscar perfil do usuário'
      });
    }
  }

  /**
   * POST /api/auth/logout
   */
  static async logout(req: Request, res: Response): Promise<void> {
    // Com JWT, logout é feito no frontend removendo o token
    // Aqui podemos apenas confirmar a operação
    res.json({ message: 'Logout realizado com sucesso' });
  }
}