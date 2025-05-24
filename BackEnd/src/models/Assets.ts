export interface Asset {
  id: number;
  user_id: number;
  name: string;
  description?: string | null; // Opcional e pode ser null no banco
  created_at: Date;
  updated_at: Date;
}

export interface CreateAssetRequest {
  name: string;
  description?: string;
}

export interface UpdateAssetRequest {
  name?: string;
  description?: string;
}

// Para respostas da API, geralmente não incluímos user_id diretamente no ativo,
// pois o contexto do usuário já é dado pela requisição autenticada.
// No entanto, para consistência com o modelo do banco, pode ser mantido.
// Vamos simplificar a resposta para o que o frontend pode precisar diretamente.
export interface AssetResponse {
  id: number;
  name: string;
  description?: string | null;
  created_at: Date;
  updated_at: Date;
}