-- Migration 003: Adicionar campos de calendário de pagamentos
-- Campos de datas para controle de pagamentos, contratos e entregas

ALTER TABLE demandas_juridicas
ADD COLUMN IF NOT EXISTS data_pagamento DATE,
ADD COLUMN IF NOT EXISTS data_fim_contrato DATE;

-- data_entrega já existe na tabela, apenas garantir que está correta
-- Comentário: data_entrega já foi criado na migration 002_juridico.sql

-- Criar índice para melhor performance nas consultas de calendário
CREATE INDEX IF NOT EXISTS idx_demandas_data_pagamento ON demandas_juridicas(data_pagamento);
CREATE INDEX IF NOT EXISTS idx_demandas_data_fim_contrato ON demandas_juridicas(data_fim_contrato);
CREATE INDEX IF NOT EXISTS idx_demandas_data_entrega ON demandas_juridicas(data_entrega);
