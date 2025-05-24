export interface MaintenanceRecord {
  id: number;
  asset_id: number;
  service_type: string;
  service_date: Date; // O banco armazena como DATE, TS pode usar Date
  description?: string | null;
  cost?: number | null; // NUMERIC(10,2) pode ser representado por number
  performed_by?: string | null;
  next_maintenance_date?: Date | null;
  next_maintenance_notes?: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateMaintenanceRecordRequest {
  asset_id: number; // O frontend precisará enviar o ID do ativo ao qual o registro pertence
  service_type: string;
  service_date: string; // Frontend geralmente envia data como string (ex: 'YYYY-MM-DD')
  description?: string;
  cost?: number;
  performed_by?: string;
  next_maintenance_date?: string | null; // Frontend envia como string ou null
  next_maintenance_notes?: string;
}

export interface UpdateMaintenanceRecordRequest {
  service_type?: string;
  service_date?: string;
  description?: string;
  cost?: number;
  performed_by?: string;
  next_maintenance_date?: string | null;
  next_maintenance_notes?: string;
  // asset_id geralmente não é alterado em uma atualização de registro de manutenção
}

export interface MaintenanceRecordResponse {
  id: number;
  asset_id: number;
  service_type: string;
  service_date: string; // Para consistência com o input, e fácil uso no frontend
  description?: string | null;
  cost?: number | null;
  performed_by?: string | null;
  next_maintenance_date?: string | null;
  next_maintenance_notes?: string | null;
  created_at: Date;
  updated_at: Date;
}