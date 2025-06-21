'use client';

import { useEffect, useState } from 'react';

type QA = { q: string; a: string };

export default function FaqBlock() {
  const [faq, setFaq] = useState<QA[]>([]);
  const [open, setOpen] = useState<number | null>(null);

  const [customQ, setCustomQ] = useState('');
  const [customA, setCustomA] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  /* --- грузим FAQ --- */
  useEffect(() => {
    fetch('/api/faq-index')          {/* ← было /faq.json */}
      .then((r) => r.json())
      .then((d) => setFaq(d as QA[]))
      .catch(console.error);
  }, []);

  /* --- задать произвольный вопрос --- */
  async function ask() {
    if (!customQ.trim()) return;
    setLoading(true);
    setCustomA(null);
    try {
      const r = await fetch('/api/faq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: customQ }),
      });
      const data = await r.json();
      setCustomA(data.answer);
    } catch (e) {
      setCustomA('Ошибка сервиса FAQ.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="py-12 px-4 bg-white">
      <h2 className="text-3xl font-bold text-center mb-8">Частые вопросы</h2>

      {/* Accordion */}
      <div className="max-w-3xl mx-auto divide-y divide-gray-300">
        {faq.map((item, idx) => (
          <div key={idx} className="py-3">
            <button
              onClick={() => setOpen(open === idx ? null : idx)}
              className="w-full text-left font-semibold flex justify-between"
            >
              <span>{item.q}</span>
              <span className="text-2xl">{open === idx ? '−' : '+'}</span>
            </button>
            {open === idx && (
              <p className="mt-2 text-gray-700 whitespace-pre-line">{item.a}</p>
            )}
          </div>
        ))}
      </div>

      {/* Свой вопрос */}
      <div className="max-w-3xl mx-auto mt-10 grid gap-4">
        <h3 className="text-2xl font-semibold">Не нашли ответа?</h3>
        <textarea
          rows={3}
          className="p-3 rounded-lg border"
          placeholder="Задайте вопрос..."
          value={customQ}
          onChange={(e) => setCustomQ(e.target.value)}
        />
        <button
          onClick={ask}
          disabled={loading}
          className="bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          {loading ? 'Ищем ответ…' : 'Получить ответ'}
        </button>

        {customA && (
          <div className="bg-gray-100 p-4 rounded-lg whitespace-pre-line">
            {customA}
          </div>
        )}
      </div>
    </section>
  );
}
