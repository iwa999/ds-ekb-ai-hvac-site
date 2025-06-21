import { NextRequest } from 'next/server';
    import nodemailer from 'nodemailer';

    export const runtime = 'edge';

    export async function POST(req: NextRequest) {
      const { problem, aiAnswer } = await req.json();

      // AmoCRM lead creation
      await fetch(`https://${process.env.AMO_SUBDOMAIN}.amocrm.ru/api/v4/leads/complex`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.AMO_ACCESS_TOKEN}`,
        },
        body: JSON.stringify([
          {
            name: 'HVAC AI Lead',
            price: 0,
            _embedded: {
              contacts: [],
            },
            custom_fields_values: [
              {
                field_name: 'Problem',
                values: [{ value: problem }],
              },
              {
                field_name: 'AI Answer',
                values: [{ value: aiAnswer }],
              },
            ],
          },
        ]),
      }).catch(() => {});

      // Email notification
      if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
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
          text: `Проблема: ${problem}

Ответ AI: ${aiAnswer}`,
        }).catch(() => {});
      }

      return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } });
    }