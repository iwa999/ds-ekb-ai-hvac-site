import { NextRequest } from 'next/server';
import nodemailer from 'nodemailer';

/**
 *  Запускаем маршрут в Node-runtime, чтобы работал nodemailer
 */
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const { problem, aiAnswer } = await req.json();

  /* ───────────────── AmoCRM ───────────────── */
  const amoRes = await fetch(
    `https://${process.env.AMO_SUBDOMAIN}.amocrm.ru/api/v4/leads/complex`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.AMO_ACCESS_TOKEN}`,
      },
      body: JSON.stringify([
        {
          name: 'HVAC AI Lead',
          _embedded: { contacts: [] },
          /**  ↓ При необходимости подставьте реальные ID полей */
          custom_fields_values: [
            { field_name: 'Problem', values: [{ value: problem }] },
            { field_name: 'AI Answer', values: [{ value: aiAnswer }] },
          ],
        },
      ]),
    },
  );

  /** Логируем код и тело ответа AmoCRM для диагностики */
  const amoText = await amoRes.text();
  console.error('AMO status', amoRes.status, amoText);

  /* ───────────────── SMTP письмо ───────────────── */
  let mailOk = false;

  if (
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS
  ) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 465,
        secure: true,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: `"HVAC AI" <${process.env.SMTP_USER}>`,
        to: process.env.LEAD_NOTIFY_EMAIL,
        subject: 'Новый лид с сайта',
        text: `Проблема: ${problem}\n\nОтвет AI: ${aiAnswer}`,
      });

      mailOk = true;
    } catch (err) {
      console.error('SMTP err', err);
    }
  } else {
    console.error('SMTP vars missing');
  }

  /* ───────────────── Ответ фронту ───────────────── */
  return new Response(
    JSON.stringify({
      amoStatus: amoRes.status, // 201 — Created
      mailOk,                   // true — письмо ушло
    }),
    { headers: { 'Content-Type': 'application/json' } },
  );
}
