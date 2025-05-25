// C:/WorkHome/AlphaEdtech/React/KeepTrack/FrontEnd/src/api/assetService.ts
import type { Asset, CreateAssetPayload, UpdateAssetPayload } from '../types/assetTypes';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const getAuthHeaders = (token: string) => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`,
});

export async function fetchAssets(token: string): Promise<Asset[]> {
  const response = await fetch(`${API_BASE_URL}/assets`, {
    method: 'GET',
    headers: getAuthHeaders(token),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch assets');
  }
  return response.json();
}

export async function createAssetAPI(assetData: CreateAssetPayload, token: string): Promise<{ message: string; asset: Asset }> {
  const response = await fetch(`${API_BASE_URL}/assets`, {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify(assetData),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to create asset');
  }
  return response.json();
}

export async function updateAssetAPI(assetId: number, assetData: UpdateAssetPayload, token: string): Promise<{ message: string; asset: Asset }> {
  const response = await fetch(`${API_BASE_URL}/assets/${assetId}`, {
    method: 'PUT',
    headers: getAuthHeaders(token),
    body: JSON.stringify(assetData),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to update asset');
  }
  return response.json();
}

export async function deleteAssetAPI(assetId: number, token: string): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE_URL}/assets/${assetId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(token),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to delete asset');
  }
  return response.json();
}