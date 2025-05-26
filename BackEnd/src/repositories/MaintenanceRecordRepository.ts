import { pool } from "../config/database";
import {
  MaintenanceRecord,
  CreateMaintenanceRecordRequest,
  UpdateMaintenanceRecordRequest,
} from "../models/MaintenanceRecord";

export class MaintenanceRecordRepository {
  /**
   * Cria um novo registro de manutenção
   * Nota: asset_id deve ser validado no serviço para garantir que pertence ao usuário logado.
   */
  static async create(
    recordData: Omit<CreateMaintenanceRecordRequest, 'service_date' | 'next_maintenance_date'> &
                { asset_id: number; service_date: Date; next_maintenance_date?: Date | null }
  ): Promise<MaintenanceRecord> {
    const {
      asset_id,
      service_type,
      service_date,
      description,
      cost,
      performed_by,
      next_maintenance_date,
      next_maintenance_notes,
    } = recordData;

    const query = `
      INSERT INTO maintenance_records
        (asset_id, service_type, service_date, description, cost, performed_by, next_maintenance_date, next_maintenance_notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;
    const values = [
      asset_id,
      service_type,
      service_date,
      description,
      cost,
      performed_by,
      next_maintenance_date,
      next_maintenance_notes,
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  /**
   * Busca um registro de manutenção pelo ID.
   * A verificação se o registro pertence a um ativo do usuário logado deve ser feita no serviço,
   * por exemplo, buscando o ativo associado e verificando seu user_id.
   */
  static async findById(id: number): Promise<MaintenanceRecord | null> {
    const query = "SELECT * FROM maintenance_records WHERE id = $1;";
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  /**
   * Lista todos os registros de manutenção de um ativo específico.
   * A verificação se o ativo pertence ao usuário logado deve ser feita antes de chamar este método.
   */
  static async findAllByAssetId(assetId: number): Promise<MaintenanceRecord[]> {
    const query = `
      SELECT * FROM maintenance_records
      WHERE asset_id = $1
      ORDER BY service_date DESC, created_at DESC;
    `;
    const result = await pool.query(query, [assetId]);
    return result.rows;
  }

  /**
   * Atualiza um registro de manutenção.
   * A verificação se o registro pertence a um ativo do usuário logado deve ser feita no serviço.
   */
  static async update(
    id: number,
    recordData: Omit<UpdateMaintenanceRecordRequest, 'service_date' | 'next_maintenance_date'> &
                { service_date?: Date; next_maintenance_date?: Date | null }
  ): Promise<MaintenanceRecord | null> {
    // Define a type for the payload that will be used to build the SET clause.
    // Date fields are represented as 'YYYY-MM-DD' strings or null.
    type UpdateDbPayload = {
      service_type?: string;
      service_date?: string;
      description?: string;
      cost?: number;
      performed_by?: string;
      next_maintenance_date?: string | null;
      next_maintenance_notes?: string;
    };

    const updates: UpdateDbPayload = {};

    if (recordData.service_type !== undefined) updates.service_type = recordData.service_type;
    
    if (recordData.service_date !== undefined) {
      // Convert Date to YYYY-MM-DD string in UTC
      updates.service_date = recordData.service_date.toISOString().split('T')[0];
    }
    
    if (recordData.description !== undefined) updates.description = recordData.description;
    if (recordData.cost !== undefined) updates.cost = recordData.cost;
    if (recordData.performed_by !== undefined) updates.performed_by = recordData.performed_by;
    
    if (recordData.next_maintenance_date !== undefined) {
      if (recordData.next_maintenance_date === null) {
        updates.next_maintenance_date = null;
      } else {
        // Convert Date to YYYY-MM-DD string in UTC
        updates.next_maintenance_date = recordData.next_maintenance_date.toISOString().split('T')[0];
      }
    }
    
    if (recordData.next_maintenance_notes !== undefined) updates.next_maintenance_notes = recordData.next_maintenance_notes;

    const fields = Object.keys(updates) as (keyof UpdateDbPayload)[];
    const values = fields.map((field) => updates[field]);

    if (fields.length === 0) {
      return this.findById(id); // Retorna o registro existente se nada for alterado
    }

    const setClause = fields
      .map((field, index) => `${field} = $${index + 2}`) // $1 é id
      .join(", ");

    const query = `
      UPDATE maintenance_records
      SET ${setClause}, updated_at = NOW()
      WHERE id = $1
      RETURNING *;
    `;
    const result = await pool.query(query, [id, ...values]);
    return result.rows[0] || null;
  }

  /**
   * Deleta um registro de manutenção.
   * A verificação se o registro pertence a um ativo do usuário logado deve ser feita no serviço.
   */
  static async delete(id: number): Promise<boolean> {
    const query = "DELETE FROM maintenance_records WHERE id = $1;";
    const result = await pool.query(query, [id]);
    return (result?.rowCount ?? 0) > 0;
  }

  /**
   * Busca os registros de manutenção mais recentes para cada tipo de serviço de um ativo,
   * que possuem uma data de próxima manutenção definida.
   * Crucial para o painel de controle.
   */
  static async findUpcomingMaintenancesByUserId(userId: number): Promise<
    (MaintenanceRecord & { asset_name: string; asset_id: number })[] // Adiciona nome e id do ativo
  > {
    const query = `
      SELECT DISTINCT ON (mr.asset_id, mr.service_type)
          mr.*,
          a.name as asset_name,
          a.id as asset_id_alias -- Renomeado para evitar conflito com mr.asset_id no mapeamento
      FROM maintenance_records mr
      JOIN assets a ON mr.asset_id = a.id
      WHERE a.user_id = $1 AND mr.next_maintenance_date IS NOT NULL
      ORDER BY mr.asset_id, mr.service_type, mr.service_date DESC;
    `;
    // A query acima pega o último registro (service_date DESC) para cada combinação de asset_id e service_type.
    // Filtramos então aqueles que têm next_maintenance_date para o painel.

    // No entanto, para o painel, queremos os que estão próximos.
    // Uma abordagem melhor para "próximas manutenções" é selecionar diretamente
    // os ÚLTIMOS registros de cada tipo de serviço que têm next_maintenance_date e ordená-los.

    const panelQuery = `
      WITH LastMaintenancePerType AS (
        SELECT
          mr.*,
          a.name as asset_name, -- Inclui o nome do ativo
          ROW_NUMBER() OVER(PARTITION BY mr.asset_id, mr.service_type ORDER BY mr.service_date DESC) as rn
        FROM maintenance_records mr
        JOIN assets a ON mr.asset_id = a.id
        WHERE a.user_id = $1
      )
      SELECT
        id,
        asset_id,
        service_type,
        service_date,
        description,
        cost,
        performed_by,
        next_maintenance_date,
        next_maintenance_notes,
        created_at,
        updated_at,
        asset_name -- Seleciona o nome do ativo
      FROM LastMaintenancePerType
      WHERE rn = 1 AND next_maintenance_date IS NOT NULL
      ORDER BY next_maintenance_date ASC;
    `;
    const result = await pool.query(panelQuery, [userId]);

    // Mapeia para o tipo esperado, ajustando asset_id_alias se necessário
    return result.rows.map(row => ({
        ...row,
        asset_id: row.asset_id, // Garante que asset_id do MaintenanceRecord é usado
        // asset_id_alias não é mais necessário com a query ajustada
    }));
  }
}