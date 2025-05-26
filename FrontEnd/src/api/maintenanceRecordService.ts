// C:/WorkHome/AlphaEdtech/React/KeepTrack/FrontEnd/src/api/maintenanceRecordService.ts
import type { MaintenanceRecord, CreateMaintenanceRecordPayload, UpdateMaintenanceRecordPayload } from '../types/maintenanceRecordTypes';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const getAuthHeaders = (token: string) => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`,
});

// Fetches all maintenance records for a specific asset
export async function fetchMaintenanceRecordsByAssetId(assetId: number, token: string): Promise<MaintenanceRecord[]> {
  const response = await fetch(`${API_BASE_URL}/assets/${assetId}/maintenance-records`, {
    method: 'GET',
    headers: getAuthHeaders(token),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch maintenance records');
  }
  return response.json();
}

// Fetches a single maintenance record by its ID
export async function fetchMaintenanceRecordById(recordId: number, token: string): Promise<MaintenanceRecord> {
    const response = await fetch(`${API_BASE_URL}/maintenance-records/${recordId}`, {
        method: 'GET',
        headers: getAuthHeaders(token),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch maintenance record');
    }
    return response.json();
}

export async function createMaintenanceRecordAPI(payload: CreateMaintenanceRecordPayload, token: string): Promise<{ message: string; record: MaintenanceRecord }> {
  const response = await fetch(`${API_BASE_URL}/maintenance-records`, {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to create maintenance record');
  }
  return response.json();
}

export async function updateMaintenanceRecordAPI(recordId: number, payload: UpdateMaintenanceRecordPayload, token: string): Promise<{ message: string; record: MaintenanceRecord }> {
  const response = await fetch(`${API_BASE_URL}/maintenance-records/${recordId}`, {
    method: 'PUT',
    headers: getAuthHeaders(token),
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to update maintenance record');
  }
  return response.json();
}

export async function deleteMaintenanceRecordAPI(recordId: number, token: string): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE_URL}/maintenance-records/${recordId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(token),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to delete maintenance record');
  }
  return response.json();
}