import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

export const runtime = 'nodejs';

let cached: any = null;

export async function GET() {
  if (cached) {
    return new Response(JSON.stringify(cached), {
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public,max-age=3600' },
    });
  }

  // __dirname эквивалент для ES-модулей
  const __filename = fileURLToPath(import.meta.url);
  const __dirname  = path.dirname(__filename);

  // markdown лежит на один уровень выше (../../../data/faq.md)
  const mdPath = path.join(__dirname, '../../../data/faq.md');
  const md = await fs.readFile(mdPath, 'utf8');

  const arr = md
    .split('\n')
    .filter((l) => l.startsWith('##'))
    .map((_, i, a) => a.slice(i, i + 2))
    .filter((p) => p.length === 2)
    .map(([q, a]) => ({
      q: q.replace(/^##\s*/, '').trim(),
      a: a.trim(),
    }));

  cached = arr;

  return new Response(JSON.stringify(arr), {
    headers: { 'Content-Type': 'application/json' },
  });
}
