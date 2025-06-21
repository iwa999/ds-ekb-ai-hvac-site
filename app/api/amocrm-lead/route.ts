import { NextRequest } from 'next/server';
import nodemailer from 'nodemailer';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const { problem, aiAnswer, calc } = await req.json();
  /**
   * calc? = {
   *   service: 'ventilation',
   *   object: 'flat',
   *   urgency: 'normal',
   *   sqm: 40,
   *   price: 12700
   * }
   */

  /* ───── AmoCRM ───── */
  const noteLines = [
    problem ? `Проблема: ${problem}` : null,
    aiAnswer ? `AI: ${aiAnswer}` : null,
    calc
      ? `Калькулятор → ${calc.service}, ${calc.object}, ${calc.urgency}, м²=${calc.sqm} → ${calc.price} ₽`
      : null,
  ].filter(Boolean);

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
          price: calc?.price || 0,
          note: noteLines.join('\n'),
          _embedded: { contacts: [] },
        },
      ]),
    },
  );

  const amoTxt = await amoRes.text();
  console.error('AMO status', amoRes.status, amoTxt);

  /* ───── SMTP ───── */
  let mailOk = false;
  try {
    const t = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 465,
      secure: true,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });

    await t.sendMail({
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
    JSON.stringify({ amoStatus: amoRes.status, mailOk }),
    { headers: { 'Content-Type': 'application/json' } },
  );
}
