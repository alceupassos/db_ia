import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import XLSX from 'xlsx';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Função para parsear datas no formato brasileiro (DD/MM/YYYY)
function parseDate(dateStr) {
    if (!dateStr || dateStr === 'x' || dateStr === '') return null;
    
    // Tenta parsear formato DD/MM/YYYY
    if (typeof dateStr === 'string' && dateStr.includes('/')) {
        const parts = dateStr.split('/');
        if (parts.length === 3) {
            const day = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10);
            const year = parseInt(parts[2], 10);
            if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
                // Ajusta ano se for 2 dígitos
                const fullYear = year < 100 ? (year < 50 ? 2000 + year : 1900 + year) : year;
                return new Date(fullYear, month - 1, day).toISOString().split('T')[0];
            }
        }
    }
    
    // Tenta parsear como Date object do Excel
    if (typeof dateStr === 'number') {
        // Excel armazena datas como números
        const excelEpoch = new Date(1899, 11, 30);
        const date = new Date(excelEpoch.getTime() + dateStr * 86400000);
        return date.toISOString().split('T')[0];
    }
    
    return null;
}

// Função para normalizar status
function normalizeStatus(status) {
    if (!status || status === '') return 'PENDENTE';
    const upper = status.toUpperCase();
    if (upper.includes('CONCLUÍDO') || upper.includes('CONCLUIDO')) return 'CONCLUÍDO';
    if (upper.includes('EM ANDAMENTO')) return 'EM ANDAMENTO';
    if (upper.includes('CANCELADO')) return 'Cancelado';
    return 'PENDENTE';
}

// Função para normalizar documentos assinados
function normalizeDocumentosAssinados(doc) {
    if (!doc || doc === 'x' || doc === '') return 'EM ANDAMENTO';
    const upper = doc.toUpperCase();
    if (upper.includes('CONCLUÍDO') || upper.includes('CONCLUIDO')) return 'CONCLUÍDO';
    return 'EM ANDAMENTO';
}

async function importExcel() {
    const excelPath = path.join(__dirname, '..', 'demandasjuridico.xlsx');
    
    if (!fs.existsSync(excelPath)) {
        console.error(`❌ Arquivo não encontrado: ${excelPath}`);
        process.exit(1);
    }

    console.log(`📖 Lendo arquivo: ${excelPath}`);
    const workbook = XLSX.readFile(excelPath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

    console.log(`📊 Encontradas ${data.length} linhas no arquivo`);

    // Pula o cabeçalho (linha 0)
    const rows = data.slice(1).filter(row => row[0] && row[0] !== ''); // Remove linhas vazias

    console.log(`✅ ${rows.length} linhas válidas para processar`);

    // Mapa para armazenar clientes únicos
    const clientesMap = new Map();
    const demandas = [];

    for (const row of rows) {
        const cliente = (row[0] || '').toString().trim();
        const demanda = (row[1] || '').toString().trim();
        const responsavel = (row[2] || '').toString().trim();
        const dataSolicitacao = parseDate(row[3]);
        const prazo = parseDate(row[4]);
        const dataEntrega = parseDate(row[5]);
        const status = normalizeStatus(row[6]);
        const observacoes = (row[7] || '').toString().trim();
        const documentosAssinados = normalizeDocumentosAssinados(row[8]);

        if (!cliente || !demanda) {
            console.warn(`⚠️ Linha ignorada: cliente ou demanda vazio`);
            continue;
        }

        // Adiciona cliente ao mapa se não existir
        if (!clientesMap.has(cliente)) {
            clientesMap.set(cliente, {
                nome: cliente,
                cnpj: null,
                contato: null,
                email: null,
                telefone: null,
                endereco: null
            });
        }

        demandas.push({
            cliente_nome: cliente,
            demanda,
            responsavel,
            data_solicitacao: dataSolicitacao,
            prazo,
            data_entrega: dataEntrega,
            status,
            observacoes: observacoes || null,
            documentos_assinados: documentosAssinados
        });
    }

    console.log(`\n👥 Encontrados ${clientesMap.size} clientes únicos`);
    console.log(`📋 Encontradas ${demandas.length} demandas\n`);

    // Inserir clientes
    console.log('💾 Inserindo clientes...');
    let clientesInseridos = 0;
    let clientesMapDB = new Map(); // Map clientes nome -> id

    for (const [nome, clienteData] of clientesMap) {
        try {
            // Verifica se cliente já existe
            const { data: existing } = await supabase
                .from('clientes')
                .select('id')
                .eq('nome', nome)
                .single();

            if (existing) {
                clientesMapDB.set(nome, existing.id);
                console.log(`  ✓ Cliente já existe: ${nome}`);
            } else {
                const { data, error } = await supabase
                    .from('clientes')
                    .insert(clienteData)
                    .select('id')
                    .single();

                if (error) throw error;

                clientesMapDB.set(nome, data.id);
                clientesInseridos++;
                console.log(`  ✓ Cliente inserido: ${nome}`);
            }
        } catch (err) {
            console.error(`  ❌ Erro ao inserir cliente ${nome}:`, err.message);
        }
    }

    console.log(`\n✅ ${clientesInseridos} novos clientes inseridos\n`);

    // Inserir demandas
    console.log('💾 Inserindo demandas...');
    let demandasInseridas = 0;
    let demandasErro = 0;

    for (const demanda of demandas) {
        try {
            const clienteId = clientesMapDB.get(demanda.cliente_nome);

            const { error } = await supabase
                .from('demandas_juridicas')
                .insert({
                    cliente_id: clienteId,
                    cliente_nome: demanda.cliente_nome,
                    demanda: demanda.demanda,
                    responsavel: demanda.responsavel,
                    data_solicitacao: demanda.data_solicitacao,
                    prazo: demanda.prazo,
                    data_entrega: demanda.data_entrega,
                    status: demanda.status,
                    observacoes: demanda.observacoes,
                    documentos_assinados: demanda.documentos_assinados
                });

            if (error) throw error;

            demandasInseridas++;
            if (demandasInseridas % 10 === 0) {
                console.log(`  ✓ ${demandasInseridas} demandas inseridas...`);
            }
        } catch (err) {
            demandasErro++;
            console.error(`  ❌ Erro ao inserir demanda "${demanda.demanda}":`, err.message);
        }
    }

    console.log(`\n✅ Importação concluída!`);
    console.log(`   - ${demandasInseridas} demandas inseridas`);
    if (demandasErro > 0) {
        console.log(`   - ${demandasErro} demandas com erro`);
    }
}

importExcel().catch(console.error);
