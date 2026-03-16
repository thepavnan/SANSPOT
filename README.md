# 🎵 Statify — Spotify Tracker

Трекер прослуховувань Spotify з Vercel-ready архітектурою.

## Можливості

- OAuth 2.0 авторизація з автоматичним оновленням токенів
- Now Playing — поточний трек у реальному часі
- Історія — останні 50 прослуханих треків
- Статистика — топ артисти, топ треки, лічильники
- Auto-polling кожні 30 секунд

## Локальний запуск

```bash
npm install
cp .env.example .env.local
# Заповни .env.local своїми ключами
npm run dev
```

## Деплой на Vercel

1. Запуш код на GitHub
2. Відкрий [vercel.com](https://vercel.com) → New Project → імпортуй репо
3. У Vercel додай **Environment Variables**:
   - `SPOTIFY_CLIENT_ID`
   - `SPOTIFY_CLIENT_SECRET`
   - `SPOTIFY_REDIRECT_URI` → `https://твій-домен.vercel.app/api/auth/callback`
4. Натисни **Deploy**
5. В [Spotify Dashboard](https://developer.spotify.com/dashboard) додай новий Redirect URI:
   `https://твій-домен.vercel.app/api/auth/callback`
