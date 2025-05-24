import bcrypt from 'bcryptjs';

export class PasswordHash {
  private static readonly SALT_ROUNDS = 12;

  /**
   * Gera hash da senha
   */
  static async hash(password: string): Promise<string> {
    return await bcrypt.hash(password, this.SALT_ROUNDS);
  }

  /**
   * Compara senha com hash
   */
  static async compare(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }
}
