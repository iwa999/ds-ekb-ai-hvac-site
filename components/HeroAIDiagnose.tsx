'use client';
import { useState } from 'react';

export default function HeroAIDiagnose() {
  const [problem, setProblem] = useState('');
  const [aiAnswer, setAiAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleAIDiagnose() {
    setLoading(true);
    setAiAnswer('');
    const res = await fetch('/api/ai-diagnose', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ problem }),
    });
    const data = await res.json();
    setAiAnswer(data.answer);
    setLoading(false);
  }

  async function handleLeadSubmit() {
    await fetch('/api/amocrm-lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ problem, aiAnswer }),
    });
    setSubmitted(true);
  }

  return (
    <section className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-600 to-purple-700 text-white px-4 py-16">
      <div className="max-w-2xl w-full text-center">
        <div className="flex items-center justify-center gap-4 mb-4">
          <span className="text-3xl font-bold">DS EKB</span>
          <span className="bg-yellow-400 text-gray-900 px-3 py-1 rounded-lg text-sm font-bold">AI HVAC</span>
        </div>
        <h1 className="text-5xl font-bold mb-4">Диагностика за 2 минуты</h1>
        <p className="text-xl mb-8">Опиши проблему — получи решение от искусственного интеллекта</p>
        <textarea
          className="w-full p-4 rounded-lg text-gray-900 text-lg mb-4"
          rows={4}
          placeholder="Опишите вашу проблему..."
          value={problem}
          onChange={(e) => setProblem(e.target.value)}
        />
        <button
          className="bg-yellow-400 text-gray-900 font-bold px-8 py-4 rounded-xl mb-6 hover:bg-yellow-300 transition"
          disabled={!problem || loading}
          onClick={handleAIDiagnose}
        >
          {loading ? 'Диагностика...' : 'Получить AI-ответ'}
        </button>
        {aiAnswer && (
          <div className="bg-white text-gray-900 rounded-xl shadow-lg p-6 mb-6 mt-4">
            <h2 className="text-2xl font-bold mb-2">Ответ AI:</h2>
            <p>{aiAnswer}</p>
            {!submitted ? (
              <button
                className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                onClick={handleLeadSubmit}
              >
                Оформить заявку
              </button>
            ) : (
              <div className="text-green-600 mt-4 font-bold">Ваша заявка отправлена!</div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}