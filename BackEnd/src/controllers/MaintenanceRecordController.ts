import { Request, Response } from 'express';
import { MaintenanceRecordService } from '../services/MaintenanceRecordService';
import { CreateMaintenanceRecordRequest, UpdateMaintenanceRecordRequest } from '../models/MaintenanceRecord';
import { AuthRequest } from '../middleware/auth';

export class MaintenanceRecordController {
  /**
   * POST /api/maintenance-records
   * Cria um novo registro de manutenção.
   */
  static async createRecord(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const recordData: CreateMaintenanceRecordRequest = req.body;

      // Validações básicas de formato (ex: ID do ativo é número) podem vir do express-validator
      // Validações de negócio estão no Service

      const newRecord = await MaintenanceRecordService.createRecord(recordData, userId);
      res.status(201).json({ message: 'Registro de manutenção criado com sucesso', record: newRecord });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao criar registro.';
      
      if (errorMessage.includes('obrigatório') || errorMessage.includes('inválid')) { // 'inválida', 'inválido'
        res.status(400).json({ error: errorMessage });
      } else if (errorMessage.includes('não encontrado') || errorMessage.includes('não pertence')) {
        res.status(404).json({ error: errorMessage });
      } else {
        res.status(500).json({ error: 'Erro interno ao criar registro.', details: errorMessage });
      }
    }
  }

  /**
   * GET /api/maintenance-records/:id
   * Busca um registro de manutenção pelo ID.
   */
  static async getRecordById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const recordId = parseInt(req.params.id, 10);

      if (isNaN(recordId)) {
        res.status(400).json({ error: 'ID do registro inválido.' });
        return;
      }

      const record = await MaintenanceRecordService.getRecordById(recordId, userId);
      if (!record) {
        res.status(404).json({ error: 'Registro de manutenção não encontrado.' });
        return;
      }
      res.status(200).json(record);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao buscar registro.';
       if (errorMessage.includes('não encontrado') || errorMessage.includes('acesso não permitido') || errorMessage.includes('Acesso negado')) {
        res.status(404).json({ error: errorMessage });
      } else {
        res.status(500).json({ error: 'Erro interno ao buscar registro.', details: errorMessage });
      }
    }
  }

  /**
   * GET /api/assets/:assetId/maintenance-records
   * Lista todos os registros de manutenção de um ativo específico.
   */
  static async getAllRecordsByAssetId(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const assetId = parseInt(req.params.assetId, 10);

      if (isNaN(assetId)) {
        res.status(400).json({ error: 'ID do ativo inválido.' });
        return;
      }

      const records = await MaintenanceRecordService.getAllRecordsByAssetId(assetId, userId);
      res.status(200).json(records);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao listar registros.';
      if (errorMessage.includes('não encontrado') || errorMessage.includes('não pertence')) {
        res.status(404).json({ error: errorMessage });
      } else {
        res.status(500).json({ error: 'Erro interno ao listar registros.', details: errorMessage });
      }
    }
  }

  /**
   * PUT /api/maintenance-records/:id
   * Atualiza um registro de manutenção.
   */
  static async updateRecord(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const recordId = parseInt(req.params.id, 10);
      const recordData: UpdateMaintenanceRecordRequest = req.body;

      if (isNaN(recordId)) {
        res.status(400).json({ error: 'ID do registro inválido.' });
        return;
      }

      const updatedRecord = await MaintenanceRecordService.updateRecord(recordId, userId, recordData);
      if (!updatedRecord) {
        // O serviço geralmente lança erro
        res.status(404).json({ error: 'Registro de manutenção não encontrado para atualização.' });
        return;
      }
      res.status(200).json({ message: 'Registro de manutenção atualizado com sucesso', record: updatedRecord });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao atualizar registro.';
      if (errorMessage.includes('obrigatório') || errorMessage.includes('inválid') || errorMessage.includes('não pode ser anterior') || errorMessage.includes('vazio')) {
        res.status(400).json({ error: errorMessage });
      } else if (errorMessage.includes('não encontrado') || errorMessage.includes('Acesso negado')) {
        res.status(404).json({ error: errorMessage });
      } else {
        res.status(500).json({ error: 'Erro interno ao atualizar registro.', details: errorMessage });
      }
    }
  }

  /**
   * DELETE /api/maintenance-records/:id
   * Deleta um registro de manutenção.
   */
  static async deleteRecord(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const recordId = parseInt(req.params.id, 10);

      if (isNaN(recordId)) {
        res.status(400).json({ error: 'ID do registro inválido.' });
        return;
      }

      const success = await MaintenanceRecordService.deleteRecord(recordId, userId);
      if (!success) {
         // O serviço geralmente lança erro
        res.status(404).json({ error: 'Registro de manutenção não encontrado para exclusão.' });
        return;
      }
      res.status(200).json({ message: 'Registro de manutenção excluído com sucesso.' });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao excluir registro.';
       if (errorMessage.includes('não encontrado') || errorMessage.includes('Acesso negado')) {
        res.status(404).json({ error: errorMessage });
      } else {
        res.status(500).json({ error: 'Erro interno ao excluir registro.', details: errorMessage });
      }
    }
  }

  /**
   * GET /api/maintenance-records/panel/upcoming
   * Busca as próximas manutenções para o painel do usuário.
   */
  static async getUpcomingPanel(req: AuthRequest, res: Response): Promise<void> {
    try {
        const userId = req.user!.userId;
        const upcomingMaintenances = await MaintenanceRecordService.getUpcomingMaintenancesForUserPanel(userId);
        res.status(200).json(upcomingMaintenances);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao buscar painel de manutenções.';
        res.status(500).json({ error: 'Erro interno ao buscar painel de manutenções.', details: errorMessage });
    }
  }
}