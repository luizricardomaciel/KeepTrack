import jwt from "jsonwebtoken";

export interface JwtPayload {
  userId: number;
  email: string;
}

export class JwtUtils {
  private static readonly secret =
    process.env.JWT_SECRET || "sua_chave_secreta_aqui";
  private static readonly expiresIn: number = parseInt(
    process.env.JWT_EXPIRES_IN || "604800"
  ); // 7 dias em segundos

  /**
   * Gera token JWT
   */
  static generateToken(payload: JwtPayload): string {
    return jwt.sign(payload, this.secret, { expiresIn: this.expiresIn });
  }

  /**
   * Verifica e decodifica token JWT
   */
  static verifyToken(token: string): JwtPayload {
    return jwt.verify(token, this.secret) as JwtPayload;
  }
}
