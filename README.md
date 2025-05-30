# KeepTrack - Assistente de Manutenção

KeepTrack é uma aplicação web full-stack projetada para ajudar usuários a gerenciar seus ativos (equipamentos) e agendar/registrar manutenções preventivas e corretivas. Ele fornece alertas para manutenções futuras ou vencidas, garantindo que os equipamentos estejam sempre em bom estado de funcionamento.

![Projeto Foto](https://github.com/luizricardomaciel/KeepTrack/blob/main/FrontEnd/public/Captura%20de%20tela%20de%202025-05-30%2010-36-44.png)
*(Original project inspiration: [DesafioAlpha3](https://github.com/luizricardomaciel/KeepTrack/tree/main))*

## Funcionalidades Principais

-   **Autenticação de Usuários:**
    -   Registro de novos usuários.
    -   Login para usuários existentes.
    -   Sessões protegidas usando JSON Web Tokens (JWT).
-   **Gerenciamento de Ativos:**
    -   CRUD (Criar, Ler, Atualizar, Deletar) completo para ativos.
    -   Cada ativo pertence a um usuário específico.
-   **Gerenciamento de Manutenções:**
    -   CRUD completo para registros de manutenção associados a cada ativo.
    -   Campos para tipo de serviço, data do serviço, descrição, custo, responsável.
    -   Agendamento da próxima manutenção com data e notas.
-   **Dashboard Intuitivo:**
    -   Listagem visual dos ativos do usuário com acesso rápido às suas manutenções.
    -   Página dedicada para visualização das próximas manutenções agendadas.
-   **Interface Responsiva:**
    -   Construída com React e Material-UI para uma experiência de usuário agradável em desktops e dispositivos móveis, com tema escuro.


## Tecnologias Utilizadas

-   **Frontend:**
    -   React.js (v19) com Vite
    -   TypeScript
    -   Material-UI (MUI)
    -   React Router DOM (v7)
    -   Date-fns
-   **Backend:**
    -   Node.js
    -   Express.js
    -   TypeScript
    -   PostgreSQL (como banco de dados)
    -   `pg` (driver PostgreSQL para Node.js)
    -   `jsonwebtoken` (para autenticação baseada em token JWT)
    -   `bcryptjs` (para hashing de senhas)
    -   `cors`, `helmet` (para segurança)
-   **Ferramentas de Desenvolvimento (Root):**
    -   `concurrently` (para rodar múltiplos scripts)

## Pré-requisitos

-   Node.js (v18 ou superior recomendado)
-   npm (geralmente vem com Node.js)
-   PostgreSQL (servidor de banco de dados)

## Configuração e Instalação

1.  **Clone o Repositório:**

    ```bash
    git clone <URL_DO_SEU_REPOSITORIO>
    cd KeepTrack
    ```

2.  **Instale as Dependências (Root, Backend e Frontend):**
    No diretório raiz `KeepTrack`, execute:
    ```bash
    npm install
    ```
    Este comando instalará `concurrently` no nível raiz e, em seguida (devido ao script `postinstall`), executará `npm install` dentro das pastas `BackEnd` e `FrontEnd` para instalar suas respectivas dependências. Se preferir, após o `npm install` raiz, você pode rodar manualmente:
    ```bash
    npm run install:all
    ```

3.  **Configuração do Backend:**
    -   Navegue até a pasta `BackEnd`:
        ```bash
        cd BackEnd
        ```
    -   Crie um arquivo `.env` a partir do exemplo `BackEnd/.env.example`.
    -   Preencha as variáveis de ambiente no arquivo `.env`. Exemplo:
        ```env
        # Server
        PORT=3001 # Recomenda-se 3001 para corresponder ao VITE_API_URL do frontend
        NODE_ENV=development

        # Database
        DB_HOST=localhost
        DB_PORT=5432
        DB_NAME=keeptrack_db # Ou o nome do seu banco
        DB_USER=your_postgres_user
        DB_PASSWORD=your_postgres_password

        # JWT
        JWT_SECRET=uma_string_secreta_bem_forte_e_aleatoria
        JWT_EXPIRES_IN=7d # Ex: 7 dias

        # CORS
        FRONTEND_URL=http://localhost:5173 # URL do seu frontend Vite
        ```
    -   **Importante:** `JWT_SECRET` deve ser uma string longa, aleatória e segura.
    -   Retorne ao diretório raiz:
        ```bash
        cd ..
        ```

4.  **Configuração do Frontend:**
    -   Navegue até a pasta `FrontEnd`:
        ```bash
        cd FrontEnd
        ```
    -   O arquivo `FrontEnd/.env` já deve existir com `VITE_API_URL=http://localhost:3001/api`. Certifique-se que a porta corresponde à configurada no `PORT` do backend (`.env` do `BackEnd`).
    -   Retorne ao diretório raiz:
        ```bash
        cd ..
        ```

5.  **Configuração do Banco de Dados PostgreSQL:**
    -   Certifique-se de que o PostgreSQL está instalado e rodando.
    -   Crie o banco de dados, usuário e senha conforme especificado no arquivo `.env` do `BackEnd`. Por exemplo, se `DB_NAME=keeptrack_db`, `DB_USER=keeptrack_user`, `DB_PASSWORD=secret`:
        ```sql
        CREATE USER keeptrack_user WITH PASSWORD 'secret';
        CREATE DATABASE keeptrack_db OWNER keeptrack_user;
        ```
    -   O backend criará automaticamente as tabelas necessárias na primeira execução (ver `BackEnd/src/database/init.ts`). Caso precise criá-las manualmente, o DDL está abaixo.

## Script SQL para Criação das Tabelas (DDL)

Este DDL é executado automaticamente pelo backend na inicialização se as tabelas não existirem.

```sql
-- Tabela de Usuários
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Tabela de Ativos
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

-- Tabela de Registros de Manutenção
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
