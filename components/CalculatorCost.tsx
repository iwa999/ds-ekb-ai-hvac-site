'use client';

import { useState } from 'react';

export default function CalculatorCost() {
  // состояния формы
  const [service, setService] = useState<'ventilation' | 'conditioning' | 'refrigeration'>('ventilation');
  const [object, setObject] = useState<'flat' | 'office' | 'warehouse'>('flat');
  const [urgency, setUrgency] = useState<'normal' | 'fast' | 'emergency'>('normal');
  const [sqm, setSqm] = useState('');
  const [price, setPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleCalc() {
    setLoading(true);
    const res = await fetch('/api/calc-price', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service,
        object,
        urgency,
        sqm: Number(sqm),
      }),
    });
    const data = await res.json();
    setPrice(data.price);
    setLoading(false);
  }

  // русские label'ы для отправки в CRM/почту
  const serviceLabel =
    service === 'ventilation'
      ? 'Вентиляция'
      : service === 'conditioning'
      ? 'Кондиционер'
      : 'Холод';
  const objectLabel =
    object === 'flat' ? 'Квартира' : object === 'office' ? 'Офис' : 'Склад';
  const urgencyLabel =
    urgency === 'normal' ? 'Обычная' : urgency === 'fast' ? 'Срочная' : 'Аварийная';

  async function sendLead() {
    await fetch('/api/amocrm-lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        calc: {
          serviceLabel,
          objectLabel,
          urgencyLabel,
          sqm: Number(sqm),
          price,
        },
      }),
    });
    alert('Заявка отправлена!');
  }

  return (
    <section className="bg-gray-100 text-gray-900 py-12 px-4">
      <h2 className="text-3xl font-bold text-center mb-6">Калькулятор стоимости</h2>

      <div className="max-w-xl mx-auto grid gap-4">
        {/* Тип услуги */}
        <select
          className="p-3 rounded-lg"
          value={service}
          onChange={(e) => setService(e.target.value as any)}
        >
          <option value="ventilation">Вентиляция</option>
          <option value="conditioning">Кондиционер</option>
          <option value="refrigeration">Холод</option>
        </select>

        {/* Тип объекта */}
        <select
          className="p-3 rounded-lg"
          value={object}
          onChange={(e) => setObject(e.target.value as any)}
        >
          <option value="flat">Квартира</option>
          <option value="office">Офис</option>
          <option value="warehouse">Склад</option>
        </select>

        {/* Срочность */}
        <select
          className="p-3 rounded-lg"
          value={urgency}
          onChange={(e) => setUrgency(e.target.value as any)}
        >
          <option value="normal">Обычная</option>
          <option value="fast">Срочная</option>
          <option value="emergency">Аварийная</option>
        </select>

        {/* Площадь */}
        <input
          type="number"
          min="0"
          className="p-3 rounded-lg"
          placeholder="Площадь (м², опц.)"
          value={sqm}
          onChange={(e) => setSqm(e.target.value)}
        />

        <button
          onClick={handleCalc}
          disabled={loading}
          className="bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          {loading ? 'Рассчитываем…' : 'Рассчитать'}
        </button>

        {price !== null && (
          <div className="bg-white p-6 rounded-lg shadow text-center mt-4 grid gap-4">
            <div>
              <p className="text-xl">Итого:</p>
              <p className="text-4xl font-bold">
                {price.toLocaleString('ru-RU')} ₽
              </p>
            </div>

            <button
              onClick={sendLead}
              className="bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition"
            >
              Оформить заявку
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
