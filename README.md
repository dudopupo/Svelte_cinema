# sv

Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```sh
# create a new project
npx sv create my-app
```

To recreate this project with the same configuration:

```sh
# recreate this project
npx sv@0.16.5 create --template minimal --types ts --add prettier eslint tailwindcss="plugins:none" paraglide="languageTags:en,ru+demo:yes" --no-download-check --install npm .
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```sh
npm run build
```

The project uses `@sveltejs/adapter-node`, so the build produces a standalone
Node server in `build/`. You can preview it with:

```sh
node build
```

## Деплой (Docker / VPS)

Требуется Node.js 22+ либо Docker. Сайт нельзя разместить как статику: здесь
SSR, серверные API-роуты, прокси авторизации и `httpOnly`-cookie.

### Переменные окружения

| Переменная    | Назначение                                        | По умолчанию                 |
| ------------- | ------------------------------------------------- | ---------------------------- |
| `ORIGIN`      | Публичный URL приложения (нужен за reverse proxy) | —                            |
| `BACKEND_URL` | База реального API аккаунта                       | `https://juniorsbootcamp.ru` |
| `PORT`        | Порт, который слушает `node build`                | `3000`                       |
| `HOST`        | Интерфейс прослушивания                           | `0.0.0.0` (в Docker)         |
| `APP_PORT`    | Только для Compose: внешний порт контейнера       | `3000`                       |

Скопируйте `.env.example` в `.env` и укажите свой `ORIGIN`.

### Docker

```sh
docker build -t svelte-cinema .
docker run -d --name svelte-cinema -p 3000:3000 \
  -e ORIGIN=https://cinema.example.com \
  svelte-cinema
```

### Docker Compose

```sh
cp .env.example .env   # укажите ORIGIN
docker compose up -d --build
```

### Без Docker

```sh
npm ci
npm run build
ORIGIN=https://cinema.example.com node build
```

Для продакшена ставьте приложение за Nginx/Caddy с HTTPS и проксируйте на
`127.0.0.1:3000`. В `ORIGIN` должен быть внешний HTTPS-адрес.

### Важно для этого демо

- Заказы и купленные места мока хранятся в памяти процесса. При рестарте,
  передеплое или перезапуске контейнера они сбрасываются.
- Эндпоинт `/api/otps` проксирует служебную страницу реального API и отдаёт
  OTP-коды. Для публичного демо его стоит закрыть или ограничить по IP.
- Мок-состояние не рассчитано на несколько реплик: запускайте один инстанс
  приложения (или выносите состояние в БД/Redis).
