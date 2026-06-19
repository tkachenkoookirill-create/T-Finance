# T-Finance · Mobile

Expo (React Native) + TypeScript. Те же дизайн-токены, что и в web.

## Quick start

```bash
cd mobile
npm install
npx expo start
# нажми i (iOS симулятор) или a (Android), либо отсканируй QR в Expo Go
```

Перед стартом подними бэкенд (см. `backend/README.md`) и в `app.json` обнови `extra.apiUrl`:
- iOS симулятор: `http://localhost:8000`
- Android эмулятор: `http://10.0.2.2:8000`
- Реальное устройство в одной сети: `http://<lan-ip>:8000`

## Что готово

- Boot → Login → Main (Tabs)
- Home: общий капитал, счета, недавние операции (с реального API)
- Transfer: цифровая клавиатура + перевод между своими счетами
- Дизайн-токены 1:1 с web (`src/theme/tokens.ts`)

## Что нужно добавить (после твоего «да»)

- expo-font загрузка `Plus Jakarta Sans` / `JetBrains Mono` / `Instrument Serif`
- Биометрия (expo-local-authentication) для входа
- Push-уведомления
- Экраны: Карта, Инвестиции, История, Профиль (web-версии уже есть → копируем структуру)
