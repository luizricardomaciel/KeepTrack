import { MaintenanceRecordRepository } from '../repositories/MaintenanceRecordRepository';
import { AssetRepository } from '../repositories/AssetRepository'; // Para verificar posse do ativo
import {
  MaintenanceRecord,
  MaintenanceRecordResponse,
  CreateMaintenanceRecordRequest,
  UpdateMaintenanceRecordRequest,
} from '../models/MaintenanceRecord';

export class MaintenanceRecordService {
  /**
   * Valida e converte datas de string para Date.
   * Retorna um objeto com as datas convertidas ou lança erro se inválidas.
   */
  private static parseAndValidateDates(
    service_date_str?: string | null,
    next_maintenance_date_str?: string | null
  ): { service_date?: Date; next_maintenance_date?: Date | null } {
    const result: { service_date?: Date; next_maintenance_date?: Date | null } = {};

    if (service_date_str) {
      const sDate = new Date(service_date_str);
      if (isNaN(sDate.getTime())) {
        throw new Error('Data do serviço inválida.');
      }
      result.service_date = sDate;
    }

    if (next_maintenance_date_str === null) {
        result.next_maintenance_date = null;
    } else if (next_maintenance_date_str) {
      const nDate = new Date(next_maintenance_date_str);
      if (isNaN(nDate.getTime())) {
        throw new Error('Data da próxima manutenção inválida.');
      }
      result.next_maintenance_date = nDate;
    }
    
    return result;
  }

  /**
   * Cria um novo registro de manutenção para um ativo de um usuário.
   */
  static async createRecord(
    recordData: CreateMaintenanceRecordRequest,
    userId: number
  ): Promise<MaintenanceRecordResponse> {
    // 1. Verificar se o ativo (recordData.asset_id) existe e pertence ao usuário
    const asset = await AssetRepository.findById(recordData.asset_id, userId);
    if (!asset) {
      throw new Error('Ativo não encontrado ou não pertence ao usuário.');
    }

    // 2. Validar e converter datas
    if (!recordData.service_date) {
        throw new Error('A data do serviço é obrigatória.');
    }
    const { service_date, next_maintenance_date } = this.parseAndValidateDates(
        recordData.service_date,
        recordData.next_maintenance_date
    );

    if (!service_date) { // Checagem extra de segurança, embora a anterior já cubra.
        throw new Error('A data do serviço é obrigatória e deve ser válida.');
    }

    // 3. Validações de negócio
    if (!recordData.service_type || recordData.service_type.trim() === '') {
      throw new Error('O tipo de serviço é obrigatório.');
    }
    if (next_maintenance_date && service_date && next_maintenance_date < service_date) {
        throw new Error('A data da próxima manutenção não pode ser anterior à data do serviço.');
    }


    // 4. Preparar dados para o repositório
    const dataForRepo = {
      ...recordData,
      service_date, // Date object
      next_maintenance_date, // Date object or null
    };

    const newRecord = await MaintenanceRecordRepository.create(dataForRepo);
    return this.mapToMaintenanceRecordResponse(newRecord);
  }

  /**
   * Busca um registro de manutenção específico.
   * Garante que o registro pertence a um ativo do usuário.
   */
  static async getRecordById(
    recordId: number,
    userId: number
  ): Promise<MaintenanceRecordResponse | null> {
    const record = await MaintenanceRecordRepository.findById(recordId);
    if (!record) {
      return null;
    }
    // Verificar se o ativo ao qual este registro pertence é do usuário logado
    const asset = await AssetRepository.findById(record.asset_id, userId);
    if (!asset) {
      // O registro existe, mas não pertence a um ativo do usuário (caso de segurança ou erro)
      // Lançar um erro aqui seria apropriado para indicar acesso não autorizado/não encontrado
      throw new Error('Registro de manutenção não encontrado ou acesso não permitido.');
    }
    return this.mapToMaintenanceRecordResponse(record);
  }

  /**
   * Lista todos os registros de manutenção de um ativo específico de um usuário.
   */
  static async getAllRecordsByAssetId(
    assetId: number,
    userId: number
  ): Promise<MaintenanceRecordResponse[]> {
    // 1. Verificar se o ativo (assetId) existe e pertence ao usuário
    const asset = await AssetRepository.findById(assetId, userId);
    if (!asset) {
      throw new Error('Ativo não encontrado ou não pertence ao usuário.');
    }

    // 2. Se o ativo pertence, buscar os registros
    const records = await MaintenanceRecordRepository.findAllByAssetId(assetId);
    return records.map(this.mapToMaintenanceRecordResponse);
  }

  /**
   * Atualiza um registro de manutenção.
   * Garante que o registro pertence a um ativo do usuário.
   */
  static async updateRecord(
    recordId: number,
    userId: number,
    recordData: UpdateMaintenanceRecordRequest
  ): Promise<MaintenanceRecordResponse | null> {
    // 1. Verificar se o registro de manutenção existe
    const existingRecord = await MaintenanceRecordRepository.findById(recordId);
    if (!existingRecord) {
      throw new Error('Registro de manutenção não encontrado.');
    }

    // 2. Verificar se o ativo ao qual o registro pertence é do usuário logado
    const asset = await AssetRepository.findById(existingRecord.asset_id, userId);
    if (!asset) {
      throw new Error('Acesso negado. O registro não pertence a um ativo seu.');
    }

    // 3. Validar e converter datas, se fornecidas
    const { service_date, next_maintenance_date } = this.parseAndValidateDates(
        recordData.service_date,
        recordData.next_maintenance_date
    );

    // 4. Validações de negócio
    if (recordData.service_type !== undefined && recordData.service_type.trim() === '') {
        throw new Error('O tipo de serviço não pode ser vazio.');
    }
    
    const finalServiceDate = service_date ?? new Date(existingRecord.service_date);
    const finalNextMaintenanceDate = next_maintenance_date === undefined ? 
        (existingRecord.next_maintenance_date ? new Date(existingRecord.next_maintenance_date) : null) 
        : next_maintenance_date;

    if (finalNextMaintenanceDate && finalServiceDate && finalNextMaintenanceDate < finalServiceDate) {
        throw new Error('A data da próxima manutenção não pode ser anterior à data do serviço.');
    }

    // 5. Preparar dados para o repositório (somente campos presentes em recordData)
    const dataForRepo: Parameters<typeof MaintenanceRecordRepository.update>[1] = {};

    if (recordData.service_type !== undefined) dataForRepo.service_type = recordData.service_type;
    if (service_date !== undefined) dataForRepo.service_date = service_date; // Date object
    if (recordData.description !== undefined) dataForRepo.description = recordData.description;
    if (recordData.cost !== undefined) dataForRepo.cost = recordData.cost;
    if (recordData.performed_by !== undefined) dataForRepo.performed_by = recordData.performed_by;
    if (next_maintenance_date !== undefined) dataForRepo.next_maintenance_date = next_maintenance_date; // Date object or null
    if (recordData.next_maintenance_notes !== undefined) dataForRepo.next_maintenance_notes = recordData.next_maintenance_notes;

    if (Object.keys(dataForRepo).length === 0) {
        return this.mapToMaintenanceRecordResponse(existingRecord); // Nenhum dado para atualizar
    }

    const updatedRecord = await MaintenanceRecordRepository.update(recordId, dataForRepo);
    if (!updatedRecord) return null;

    return this.mapToMaintenanceRecordResponse(updatedRecord);
  }

  /**
   * Deleta um registro de manutenção.
   * Garante que o registro pertence a um ativo do usuário.
   */
  static async deleteRecord(recordId: number, userId: number): Promise<boolean> {
    // 1. Verificar se o registro de manutenção existe
    const existingRecord = await MaintenanceRecordRepository.findById(recordId);
    if (!existingRecord) {
      throw new Error('Registro de manutenção não encontrado.');
    }

    // 2. Verificar se o ativo ao qual o registro pertence é do usuário logado
    const asset = await AssetRepository.findById(existingRecord.asset_id, userId);
    if (!asset) {
      throw new Error('Acesso negado. O registro não pertence a um ativo seu.');
    }

    return MaintenanceRecordRepository.delete(recordId);
  }

  /**
   * Busca todas as próximas manutenções para o painel de um usuário.
   */
  static async getUpcomingMaintenancesForUserPanel(userId: number): Promise<
    (MaintenanceRecordResponse & { asset_name: string; asset_id: number })[]
  > {
    const upcomingRaw = await MaintenanceRecordRepository.findUpcomingMaintenancesByUserId(userId);
    
    return upcomingRaw.map(record => ({
      ...this.mapToMaintenanceRecordResponse(record),
      asset_name: record.asset_name, // Adiciona o nome do ativo
      // asset_id já está no MaintenanceRecordResponse (e no record original)
    }));
  }

  /**
   * Mapeia um objeto MaintenanceRecord (do banco) para MaintenanceRecordResponse (para a API).
   * Converte datas para string ISO (YYYY-MM-DD) para consistência na API.
   */
  private static mapToMaintenanceRecordResponse(
    record: MaintenanceRecord | (MaintenanceRecord & { asset_name?: string })
  ): MaintenanceRecordResponse & { asset_name?: string } {
    // Função auxiliar para formatar Date para 'YYYY-MM-DD' string
    const formatDate = (date: Date | string | null | undefined): string | null => {
        if (!date) return null;
        // Se já for string (vindo de uma query que não converteu ou de um request), tenta usar direto
        // Se for Date, formata.
        const d = (typeof date === 'string') ? new Date(date) : date;
        if (isNaN(d.getTime())) return null; // Data inválida
        // Garante que a data é tratada como UTC para evitar problemas de fuso horário na formatação YYYY-MM-DD
        const year = d.getUTCFullYear();
        const month = (d.getUTCMonth() + 1).toString().padStart(2, '0');
        const day = d.getUTCDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    };
    
    const response: MaintenanceRecordResponse & { asset_name?: string } = {
      id: record.id,
      asset_id: record.asset_id,
      service_type: record.service_type,
      service_date: formatDate(record.service_date)!, // service_date é obrigatório
      description: record.description,
      cost: record.cost,
      performed_by: record.performed_by,
      next_maintenance_date: formatDate(record.next_maintenance_date),
      next_maintenance_notes: record.next_maintenance_notes,
      created_at: record.created_at,
      updated_at: record.updated_at,
    };

    if ('asset_name' in record && record.asset_name) {
        response.asset_name = record.asset_name;
    }

    return response;
  }
}