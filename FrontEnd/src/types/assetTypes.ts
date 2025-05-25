// Corresponds to AssetResponse from backend
export interface Asset {
  id: number;
  name: string;
  description?: string | null;
  created_at: string; // Assuming ISO string from backend
  updated_at: string; // Assuming ISO string from backend
}

// For creating a new asset
export interface CreateAssetPayload {
  name: string;
  description?: string;
}

// For updating an existing asset
export interface UpdateAssetPayload {
  name?: string;
  description?: string;
}