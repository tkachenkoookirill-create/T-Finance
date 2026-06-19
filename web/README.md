# T-Finance · Web

Next.js 14 (App Router) + TypeScript + Tailwind CSS.
Дизайн-токены — порт `oklch`-палитры из исходного `styles.css`.

## Quick start

```bash
cd web
cp .env.example .env.local
npm install
npm run dev   # → http://localhost:3000
```

Перед стартом подними бэкенд:

```bash
cd backend
docker compose up -d
uvicorn app.main:app --reload
python -m app.seed   # создаёт demo@tfinance.local / demo1234
```

## Структура

```
web/src/
├── app/
│   ├── globals.css           # все дизайн-токены T-Finance
│   ├── layout.tsx
│   ├── page.tsx              # → /dashboard
│   ├── login/page.tsx
│   ├── register/page.tsx
│   └── (app)/                # авторизованная зона с sidebar
│       ├── layout.tsx        # охрана + shell
│       ├── dashboard/page.tsx
│       ├── accounts/page.tsx
│       ├── transfer/page.tsx
│       ├── analytics/page.tsx
│       ├── invest/page.tsx
│       ├── history/page.tsx
│       ├── credit/page.tsx
│       └── profile/page.tsx
├── components/
│   ├── ui.tsx                # Logo, Card, Pill, Button, Sparkline
│   └── shell.tsx             # Sidebar, Topbar
└── lib/
    ├── api.ts                # fetch + JWT
    ├── money.ts              # форматтеры (minor units)
    └── i18n.ts               # RU/EN строки
```

## Что осознанно не доделано — ждёт твоего «да»

- **Tweaks-панель** из дизайна (тема/плотность/акцент) — нужен ли в проде или только в дизайне?
- **Графики** (свечи, sankey, heatmap) — пока упрощённые. Подключим `recharts` / `visx` когда подтвердишь.
- **Real-time котировки** — сейчас seed-данные. Нужен ли воркер, который дёргает MOEX/Yahoo Finance?
- **Иконки в сайдбаре** — заменены на цветные точки, верну SVG-набор из `ui.jsx` после подтверждения.
