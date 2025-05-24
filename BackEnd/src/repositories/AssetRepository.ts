import { pool } from "../config/database";
import { Asset, CreateAssetRequest, UpdateAssetRequest } from "../models/Assets";

export class AssetRepository {
  /**
   * Cria um novo ativo
   */
  static async create(assetData: CreateAssetRequest & { user_id: number }): Promise<Asset> {
    const { name, description, user_id } = assetData;
    const query = `
      INSERT INTO assets (name, description, user_id)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    const result = await pool.query(query, [name, description, user_id]);
    return result.rows[0];
  }

  /**
   * Busca um ativo pelo ID e user_id (para garantir que o usuário só acesse seus próprios ativos)
   */
  static async findById(id: number, userId: number): Promise<Asset | null> {
    const query = "SELECT * FROM assets WHERE id = $1 AND user_id = $2;";
    const result = await pool.query(query, [id, userId]);
    return result.rows[0] || null;
  }

  /**
   * Lista todos os ativos de um usuário específico
   */
  static async findAllByUserId(userId: number): Promise<Asset[]> {
    const query = "SELECT * FROM assets WHERE user_id = $1 ORDER BY name ASC;";
    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  /**
   * Atualiza um ativo
   */
  static async update(
    id: number,
    userId: number,
    assetData: UpdateAssetRequest
  ): Promise<Asset | null> {
    const fields = Object.keys(assetData) as (keyof UpdateAssetRequest)[];
    const values = fields.map((field) => assetData[field]);

    if (fields.length === 0) {
      // Se não há campos para atualizar, busca e retorna o ativo existente
      return this.findById(id, userId);
    }

    const setClause = fields
      .map((field, index) => `${field} = $${index + 3}`) // $1 é id, $2 é userId
      .join(", ");

    const query = `
      UPDATE assets
      SET ${setClause}, updated_at = NOW()
      WHERE id = $1 AND user_id = $2
      RETURNING *;
    `;
    const result = await pool.query(query, [id, userId, ...values]);
    return result.rows[0] || null;
  }

  /**
   * Deleta um ativo
   */
  static async delete(id: number, userId: number): Promise<boolean> {
    const query = "DELETE FROM assets WHERE id = $1 AND user_id = $2;";
    const result = await pool.query(query, [id, userId]);
    return (result?.rowCount ?? 0) > 0;
  }
}