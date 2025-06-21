import { NextRequest } from 'next/server';
import nodemailer from 'nodemailer';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const { problem, aiAnswer } = await req.json();

  /* ---------- AmoCRM ---------- */
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
          name: `HVAC AI Lead — ${new Date().toISOString()}`,
          note: `Проблема: ${problem}\nAI: ${aiAnswer}`,
          // custom_fields_values добавим позже, когда будут field_id
        },
      ]),
    },
  );

  const amoText = await amoRes.text();
  console.error('AMO status', amoRes.status, amoText); // ← оставляем лог

  /* ---------- Email ---------- */
  let mailOk = false;
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

  return new Response(
    JSON.stringify({ amoStatus: amoRes.status, mailOk }),
    { headers: { 'Content-Type': 'application/json' } },
  );
}
