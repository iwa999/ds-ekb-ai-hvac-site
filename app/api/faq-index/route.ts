import { promises as fs } from 'fs';
import path from 'path';

export const runtime = 'edge';

let cached: any = null;

export async function GET() {
  if (cached) {
    return new Response(JSON.stringify(cached), {
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=3600' },
    });
  }

  const md = await fs.readFile(
    path.join(process.cwd(), 'data/faq.md'),
    'utf8',
  );

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
