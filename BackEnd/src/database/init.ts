import { pool } from '../config/database';

export const initDatabase = async () => {
  const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(150) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
  `;

  const createAssetsTable = `
    CREATE TABLE IF NOT EXISTS assets (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_user
        FOREIGN KEY(user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_assets_user_id ON assets(user_id);
  `;

  const createMaintenanceRecordsTable = `
    CREATE TABLE IF NOT EXISTS maintenance_records (
      id SERIAL PRIMARY KEY,
      asset_id INTEGER NOT NULL,
      service_type VARCHAR(255) NOT NULL,
      service_date DATE NOT NULL,
      description TEXT,
      cost NUMERIC(10, 2),
      performed_by VARCHAR(255),
      next_maintenance_date DATE,
      next_maintenance_notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_asset
        FOREIGN KEY(asset_id)
        REFERENCES assets(id)
        ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_maintenance_asset_id ON maintenance_records(asset_id);
    CREATE INDEX IF NOT EXISTS idx_maintenance_service_date ON maintenance_records(service_date);
    CREATE INDEX IF NOT EXISTS idx_maintenance_next_date ON maintenance_records(next_maintenance_date);
    CREATE INDEX IF NOT EXISTS idx_maintenance_asset_service_type_date_desc ON maintenance_records(asset_id, service_type, service_date DESC);
  `;

  try {
    console.log('⏳ Verificando/Criando tabela users...');
    await pool.query(createUsersTable);
    console.log('✅ Tabela users verificada/criada com sucesso!');

    console.log('⏳ Verificando/Criando tabela assets...');
    await pool.query(createAssetsTable);
    console.log('✅ Tabela assets verificada/criada com sucesso!');

    console.log('⏳ Verificando/Criando tabela maintenance_records...');
    await pool.query(createMaintenanceRecordsTable);
    console.log('✅ Tabela maintenance_records verificada/criada com sucesso!');

  } catch (error) {
    console.error('❌ Erro ao inicializar tabelas do banco de dados:', error);
    throw error; // Re-throw para que o server.ts possa pegar o erro
  }
};