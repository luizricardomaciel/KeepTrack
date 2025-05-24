import { Router } from 'express';
import authRoutes from './auth';
import assetRoutes from './asset'; // Importar rotas de ativos
import maintenanceRecordRoutes from './maintenanceRecord'; // Importar rotas de registros de manutenção

const router = Router();

// Registrar rotas
router.use('/auth', authRoutes);
router.use('/assets', assetRoutes); // Adicionar rotas de ativos sob /api/assets
router.use('/maintenance-records', maintenanceRecordRoutes); // Adicionar rotas de registros sob /api/maintenance-records

export default router;