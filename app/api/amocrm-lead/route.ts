import { NextRequest } from 'next/server';
import nodemailer from 'nodemailer';

export const runtime = 'nodejs'; // нужен Node для nodemailer

export async function POST(req: NextRequest) {
  const { problem, aiAnswer } = await req.json();

  /* ─────── AmoCRM ─────── */
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
          name: `HVAC AI Lead — ${new Date().toLocaleString()}`,
          price: 0,
          note: `Проблема: ${problem}\nAI: ${aiAnswer}`,
          _embedded: { contacts: [] },
        },
      ]),
    },
  );

  const amoBody = await amoRes.text();
  console.error('AMO status', amoRes.status, amoBody); // ← смотрим код в логах

  /* ─────── SMTP письмо ─────── */
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
