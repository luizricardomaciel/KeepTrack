import { Router } from 'express';
import { AssetController } from '../controllers/AssetController';
import { MaintenanceRecordController } from '../controllers/MaintenanceRecordController'; // Adicionado
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.post('/', AssetController.createAsset);
router.get('/', AssetController.getAllAssets);
router.get('/:id', AssetController.getAssetById);
router.put('/:id', AssetController.updateAsset);
router.delete('/:id', AssetController.deleteAsset);

// GET /api/assets/:assetId/maintenance-records - Listar todos os registros de um ativo específico
router.get(
  '/:assetId/maintenance-records',
  MaintenanceRecordController.getAllRecordsByAssetId
);

export default router;