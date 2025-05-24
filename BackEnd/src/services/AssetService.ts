import { AssetRepository } from '../repositories/AssetRepository';
import {
  Asset,
  AssetResponse,
  CreateAssetRequest,
  UpdateAssetRequest,
} from '../models/Assets';

export class AssetService {
  /**
   * Cria um novo ativo para um usuário.
   */
  static async createAsset(
    assetData: CreateAssetRequest,
    userId: number
  ): Promise<AssetResponse> {
    // Validações de negócio adicionais (ex: limite de ativos por usuário) podem ir aqui
    if (!assetData.name || assetData.name.trim() === '') {
      throw new Error('O nome do ativo é obrigatório.');
    }

    const newAsset = await AssetRepository.create({ ...assetData, user_id: userId });
    return this.mapToAssetResponse(newAsset);
  }

  /**
   * Busca um ativo específico de um usuário.
   */
  static async getAssetById(
    assetId: number,
    userId: number
  ): Promise<AssetResponse | null> {
    const asset = await AssetRepository.findById(assetId, userId);
    if (!asset) {
      return null; // Ou lançar um erro se preferir que o controller trate 404
    }
    return this.mapToAssetResponse(asset);
  }

  /**
   * Lista todos os ativos de um usuário.
   */
  static async getAllAssetsByUser(userId: number): Promise<AssetResponse[]> {
    const assets = await AssetRepository.findAllByUserId(userId);
    return assets.map(this.mapToAssetResponse);
  }

  /**
   * Atualiza um ativo existente de um usuário.
   */
  static async updateAsset(
    assetId: number,
    userId: number,
    assetData: UpdateAssetRequest
  ): Promise<AssetResponse | null> {
    // Verificar se o ativo existe e pertence ao usuário antes de tentar atualizar
    const existingAsset = await AssetRepository.findById(assetId, userId);
    if (!existingAsset) {
      // Pode-se lançar um erro aqui, que seria pego pelo controller e retornado como 404
      // ou retornar null e o controller decide o que fazer.
      // Lançar erro é mais explícito para "recurso não encontrado para este usuário".
      throw new Error('Ativo não encontrado ou não pertence ao usuário.');
    }

    if (assetData.name !== undefined && assetData.name.trim() === '') {
      throw new Error('O nome do ativo não pode ser vazio.');
    }

    const updatedAsset = await AssetRepository.update(assetId, userId, assetData);
    if (!updatedAsset) {
      return null; // Ou lançar erro se a atualização falhar por outro motivo
    }
    return this.mapToAssetResponse(updatedAsset);
  }

  /**
   * Deleta um ativo de um usuário.
   * A remoção em cascata dos registros de manutenção associados é feita pelo DB (ON DELETE CASCADE).
   */
  static async deleteAsset(assetId: number, userId: number): Promise<boolean> {
    // Verificar se o ativo existe e pertence ao usuário antes de tentar deletar
    const existingAsset = await AssetRepository.findById(assetId, userId);
    if (!existingAsset) {
      throw new Error('Ativo não encontrado ou não pertence ao usuário.');
    }
    return AssetRepository.delete(assetId, userId);
  }

  /**
   * Mapeia um objeto Asset (do banco) para AssetResponse (para a API).
   */
  private static mapToAssetResponse(asset: Asset): AssetResponse {
    return {
      id: asset.id,
      name: asset.name,
      description: asset.description,
      created_at: asset.created_at,
      updated_at: asset.updated_at,
    };
  }
}