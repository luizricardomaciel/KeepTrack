import { Request, Response } from 'express';
import { AssetService } from '../services/AssetService';
import { CreateAssetRequest, UpdateAssetRequest } from '../models/Assets';
import { AuthRequest } from '../middleware/auth'; // Para obter o userId

export class AssetController {
  /**
   * POST /api/assets
   * Cria um novo ativo.
   */
  static async createAsset(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId; // Garantido pelo authenticateToken middleware
      const assetData: CreateAssetRequest = req.body;

      const newAsset = await AssetService.createAsset(assetData, userId);
      res.status(201).json({ message: 'Ativo criado com sucesso', asset: newAsset });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao criar ativo.';
      // Determinar o status code apropriado com base no erro
      if (errorMessage.includes('obrigatório') || errorMessage.includes('inválido')) {
        res.status(400).json({ error: errorMessage });
      } else {
        res.status(500).json({ error: 'Erro interno ao criar ativo.' });
      }
    }
  }

  /**
   * GET /api/assets/:id
   * Busca um ativo pelo ID.
   */
  static async getAssetById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const assetId = parseInt(req.params.id, 10);

      if (isNaN(assetId)) {
        res.status(400).json({ error: 'ID do ativo inválido.' });
        return;
      }

      const asset = await AssetService.getAssetById(assetId, userId);
      if (!asset) {
        res.status(404).json({ error: 'Ativo não encontrado.' });
        return;
      }
      res.status(200).json(asset);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao buscar ativo.';
      res.status(500).json({ error: 'Erro interno ao buscar ativo.', details: errorMessage });
    }
  }

  /**
   * GET /api/assets
   * Lista todos os ativos do usuário logado.
   */
  static async getAllAssets(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const assets = await AssetService.getAllAssetsByUser(userId);
      res.status(200).json(assets);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao listar ativos.';
      res.status(500).json({ error: 'Erro interno ao listar ativos.', details: errorMessage });
    }
  }

  /**
   * PUT /api/assets/:id
   * Atualiza um ativo.
   */
  static async updateAsset(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const assetId = parseInt(req.params.id, 10);
      const assetData: UpdateAssetRequest = req.body;

      if (isNaN(assetId)) {
        res.status(400).json({ error: 'ID do ativo inválido.' });
        return;
      }

      const updatedAsset = await AssetService.updateAsset(assetId, userId, assetData);
      if (!updatedAsset) {
        // O serviço lança erro se o ativo não for encontrado ou não pertencer ao usuário
        // Esta condição pode não ser alcançada se o serviço sempre lançar erro em caso de falha
        res.status(404).json({ error: 'Ativo não encontrado para atualização.' });
        return;
      }
      res.status(200).json({ message: 'Ativo atualizado com sucesso', asset: updatedAsset });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao atualizar ativo.';
       if (errorMessage.includes('não encontrado') || errorMessage.includes('não pertence')) {
        res.status(404).json({ error: errorMessage });
      } else if (errorMessage.includes('obrigatório') || errorMessage.includes('inválido') || errorMessage.includes('vazio')) {
        res.status(400).json({ error: errorMessage });
      } else {
        res.status(500).json({ error: 'Erro interno ao atualizar ativo.', details: errorMessage });
      }
    }
  }

  /**
   * DELETE /api/assets/:id
   * Deleta um ativo.
   */
  static async deleteAsset(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const assetId = parseInt(req.params.id, 10);

      if (isNaN(assetId)) {
        res.status(400).json({ error: 'ID do ativo inválido.' });
        return;
      }

      const success = await AssetService.deleteAsset(assetId, userId);
      if (!success) {
        // O serviço lança erro se o ativo não for encontrado ou não pertencer ao usuário
         // Esta condição pode não ser alcançada.
        res.status(404).json({ error: 'Ativo não encontrado para exclusão.' });
        return;
      }
      res.status(200).json({ message: 'Ativo excluído com sucesso.' });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao excluir ativo.';
      if (errorMessage.includes('não encontrado') || errorMessage.includes('não pertence')) {
        res.status(404).json({ error: errorMessage });
      } else {
        res.status(500).json({ error: 'Erro interno ao excluir ativo.', details: errorMessage });
      }
    }
  }
}