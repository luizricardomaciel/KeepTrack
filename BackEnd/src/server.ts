import app from './app';
import { testConnection } from './config/database';
import { initDatabase } from './database/init';

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // 1. Testar conexão
    console.log('🔍 Testando conexão com PostgreSQL...');
    const isConnected = await testConnection();
    
    if (!isConnected) {
      console.log('❌ Falha na conexão com PostgreSQL');
      process.exit(1);
    }
    
    console.log('✅ PostgreSQL conectado com sucesso!');
    
    // 2. Inicializar banco (criar tabelas)
    console.log('🏗️ Inicializando estrutura do banco...');
    await initDatabase();
    
    // 3. Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor KeepTrack rodando na porta ${PORT}`);
      console.log(`📊 KeepTrack: http://localhost:${PORT}/health`);
    });
    
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
};

startServer();