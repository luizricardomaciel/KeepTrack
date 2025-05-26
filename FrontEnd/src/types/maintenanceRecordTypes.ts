// Corresponds to MaintenanceRecordResponse from backend
export interface MaintenanceRecord {
  id: number;
  asset_id: number;
  service_type: string;
  service_date: string; // YYYY-MM-DD string
  description?: string | null;
  cost?: number | null;
  performed_by?: string | null;
  next_maintenance_date?: string | null; // YYYY-MM-DD string or null
  next_maintenance_notes?: string | null;
  created_at: string; // ISO string from backend
  updated_at: string; // ISO string from backend
}

// For creating a new maintenance record
// asset_id will be supplied by the context (e.g., current page's asset)
export interface CreateMaintenanceRecordPayload {
  asset_id: number; // To be included when sending to API
  service_type: string;
  service_date: string; // YYYY-MM-DD
  description?: string;
  cost?: number;
  performed_by?: string;
  next_maintenance_date?: string | null; // YYYY-MM-DD or null
  next_maintenance_notes?: string;
}

// For updating an existing maintenance record
export interface UpdateMaintenanceRecordPayload {
  service_type?: string;
  service_date?: string; // YYYY-MM-DD
  description?: string;
  cost?: number;
  performed_by?: string;
  next_maintenance_date?: string | null; // YYYY-MM-DD or null
  next_maintenance_notes?: string;
}