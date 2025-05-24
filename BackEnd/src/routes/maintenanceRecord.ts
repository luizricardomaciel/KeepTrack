import { Router } from 'express';
import { MaintenanceRecordController } from '../controllers/MaintenanceRecordController';
import { authenticateToken } from '../middleware/auth';
// Adicionar validadores específicos para registros de manutenção se necessário
// import { maintenanceValidators } from '../utils/validators';
// import { handleValidationErrors } from '../middleware/validation';

const router = Router();

// Todas as rotas de registros de manutenção requerem autenticação
router.use(authenticateToken);

// Rota especial para o painel - deve vir antes de rotas com parâmetros genéricos como /:id se houver conflito de padrão
// Neste caso, /panel/upcoming não conflita com /:id
router.get('/panel/upcoming', MaintenanceRecordController.getUpcomingPanel);


// POST /api/maintenance-records - Criar novo registro de manutenção
// O asset_id virá no corpo da requisição
router.post(
  '/',
  // maintenanceValidators.create(), // Exemplo
  // handleValidationErrors,
  MaintenanceRecordController.createRecord
);

// GET /api/assets/:assetId/maintenance-records - Listar registros de um ativo específico
// Esta rota pode ficar em asset.ts ou aqui. Colocar aqui mantém os records juntos.
// Se colocar aqui, o path completo seria /api/maintenance-records/asset/:assetId
// Para seguir o padrão RESTful de sub-recursos, é mais comum em asset.ts:
// router.get('/:assetId/maintenance-records', MaintenanceRecordController.getAllRecordsByAssetId);
// Vamos manter a rota para buscar registros de um ativo específico dentro das rotas de ativos para melhor organização REST.
// Portanto, esta rota específica será adicionada em `asset.ts` ou você pode optar por um endpoint diferente aqui.

// GET /api/maintenance-records/:id - Buscar registro por ID
router.get('/:id', MaintenanceRecordController.getRecordById);

// PUT /api/maintenance-records/:id - Atualizar registro
router.put(
  '/:id',
  // maintenanceValidators.update(), // Exemplo
  // handleValidationErrors,
  MaintenanceRecordController.updateRecord
);

// DELETE /api/maintenance-records/:id - Deletar registro
router.delete('/:id', MaintenanceRecordController.deleteRecord);


export default router;