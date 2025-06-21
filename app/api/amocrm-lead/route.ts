import { NextRequest } from 'next/server';
import nodemailer from 'nodemailer';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const { problem, aiAnswer, calc } = await req.json();

  // формируем текст примечания
  const noteLines = [
    problem ? `Проблема: ${problem}` : null,
    aiAnswer ? `AI: ${aiAnswer}` : null,
    calc
      ? `Калькулятор → ${calc.serviceLabel}, ${calc.objectLabel}, ${calc.urgencyLabel}, м²=${calc.sqm} → ${calc.price} ₽`
      : null,
  ].filter(Boolean);

  /* ───────── создаём сделку ───────── */
  const amoLeadRes = await fetch(
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
          price: calc?.price || 0,
          currency: 'RUB',
        },
      ]),
    },
  );
  const amoLeadBody = await amoLeadRes.json();
  console.error('AMO status', amoLeadRes.status, amoLeadBody);

  const leadId = amoLeadBody?.[0]?.id;

  /* ───────── добавляем примечание ───────── */
  if (leadId && noteLines.length) {
    await fetch(
      `https://${process.env.AMO_SUBDOMAIN}.amocrm.ru/api/v4/leads/${leadId}/notes`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.AMO_ACCESS_TOKEN}`,
        },
        body: JSON.stringify([
          {
            note_type: 'common',
            params: { text: noteLines.join('\n') },
          },
        ]),
      },
    );
  }

  /* ───────── отправляем письмо ───────── */
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
      text: noteLines.join('\n'),
    });

    mailOk = true;
  } catch (err) {
    console.error('SMTP err', err);
  }

  return new Response(
    JSON.stringify({ amoStatus: amoLeadRes.status, mailOk }),
    { headers: { 'Content-Type': 'application/json' } },
  );
}
