import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

const SQL_DIR = './docs/sql';

async function ingest() {
    const files = fs.readdirSync(SQL_DIR).filter(f => f.endsWith('.sql'));

    console.log(`🚀 Found ${files.length} SQL files to ingest.`);

    for (const file of files) {
        const filePath = path.join(SQL_DIR, file);
        const content = fs.readFileSync(filePath, 'utf8');
        const name = file.replace('.sql', '');

        console.log(`🔍 Analyzing ${file}...`);

        const prompt = `
      Você é um especialista em BI e ERP.
      Analise a seguinte query SQL e retorne um objeto JSON estrito com:
      1. "explanation": Uma explicação concisa do que esta query faz.
      2. "business_domain": O domínio de negócio (ex: Financeiro, Estoque, Vendas).
      3. "suggested_schema": Um array de objetos { name: string, type: string } representando as colunas resultantes.
      
      QUERY:
      ${content}
      
      Responda apenas com o JSON.
    `;

        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            let text = response.text().trim();

            // Remove markdown code blocks if present
            if (text.startsWith('```json')) {
                text = text.substring(7, text.length - 3);
            } else if (text.startsWith('```')) {
                text = text.substring(3, text.length - 3);
            }

            const analysis = JSON.parse(text);

            const { error } = await supabase
                .from('ai_known_queries')
                .upsert({
                    name: name,
                    filename: file,
                    raw_sql: content,
                    explanation: analysis.explanation,
                    business_domain: analysis.business_domain,
                    suggested_schema: analysis.suggested_schema
                }, { onConflict: 'name' });

            if (error) throw error;
            console.log(`✅ ${file} ingested successfully.`);

        } catch (err) {
            console.error(`❌ Error ingesting ${file}:`, err.message);
        }
    }
}

ingest();
