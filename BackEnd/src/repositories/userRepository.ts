import { pool } from "../config/database";
import { User, CreateUserRequest } from "../models/User";

export class UserRepository {
  /**
   * Busca usuário por email
   */
  static async findByEmail(email: string): Promise<User | null> {
    const query = "SELECT * FROM users WHERE email = $1";
    const result = await pool.query(query, [email]);
    return result.rows[0] || null;
  }

  /**
   * Busca usuário por ID
   */
  static async findById(id: number): Promise<User | null> {
    const query = "SELECT * FROM users WHERE id = $1";
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  /**
   * Cria novo usuário
   */
  static async create(
    userData: CreateUserRequest & { password_hash: string }
  ): Promise<User> {
    const query = `
      INSERT INTO users (name, email, password_hash) 
      VALUES ($1, $2, $3) 
      RETURNING *
    `;

    const values = [userData.name, userData.email, userData.password_hash];
    const result = await pool.query(query, values);

    return result.rows[0];
  }

  /**
   * Atualiza dados do usuário
   */
  static async update(
    id: number,
    userData: Partial<User>
  ): Promise<User | null> {
    const fields = Object.keys(userData).filter((key) => key !== "id");
    const values = fields.map((field) => userData[field as keyof User]);

    if (fields.length === 0) return null;

    const setClause = fields
      .map((field, index) => `${field} = $${index + 2}`)
      .join(", ");
    const query = `
      UPDATE users 
      SET ${setClause}, updated_at = NOW() 
      WHERE id = $1 
      RETURNING *
    `;

    const result = await pool.query(query, [id, ...values]);
    return result.rows[0] || null;
  }

  /**
   * Deleta usuário
   */
  static async delete(id: number): Promise<boolean> {
    const query = "DELETE FROM users WHERE id = $1";
    const result = await pool.query(query, [id]);
    return (result?.rowCount ?? 0) > 0;
  }
}
