import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

export const runtime = 'nodejs';

let cached: any = null;

/**
 * GET /api/faq-index
 * Отдаёт массив [{ q, a }] — многострочные ответы поддержаны.
 */
export async function GET() {
  if (cached) {
    return new Response(JSON.stringify(cached), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public,max-age=3600',
      },
    });
  }

  /* --- читаем markdown --- */
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const mdPath = path.join(__dirname, '../../../data/faq.md');
  const md = await fs.readFile(mdPath, 'utf8');

  /* --- парсим: каждая пара “## вопрос / ответ (до следующего ##)” --- */
  const lines = md.split('\n');
  const arr: { q: string; a: string }[] = [];

  let curQ = '';
  let buf: string[] = [];

  for (const line of lines) {
    if (line.startsWith('## ')) {
      if (curQ) arr.push({ q: curQ, a: buf.join('\n').trim() });
      curQ = line.replace(/^##\s*/, '').trim();
      buf = [];
    } else {
      buf.push(line);
    }
  }
  if (curQ) arr.push({ q: curQ, a: buf.join('\n').trim() });

  cached = arr;

  return new Response(JSON.stringify(arr), {
    headers: { 'Content-Type': 'application/json' },
  });
}
