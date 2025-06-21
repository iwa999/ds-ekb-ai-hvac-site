# DS EKB AI HVAC Site

Полноценный MVP: Hero‑блок + AI‑диагностика + отправка лида в AmoCRM и e‑mail.

## Запуск локально

```bash
cp .env.example .env          # заполнить ключи
npm install
npm run dev
```

## Деплой на Railway

1. Sign in with GitHub → New Project → Deploy from Repo.
2. В Variables внести содержимое `.env.example`.
3. Build: `npm run build`, Start: `npm start`.
4. Profit.