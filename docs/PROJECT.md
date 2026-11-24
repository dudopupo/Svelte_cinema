# Svelte Cinema — документация проекта

> Онлайн-кинотеатр с покупкой билетов на **SvelteKit 5 + Tailwind CSS 4**.
> Задание платформы Juniors Bootcamp (siberiacancode), уровень **Senior** — полный объём.
> Документ описывает реализуемый функционал, API, архитектуру и этапы разработки.

Источник дизайна: Figma-файл буткемпа, страница **«Кинотеатр»** (разделы Light/Dark, уровни Junior/Middle/Senior).
Справочник по cinema-контракту: [`docs/research/cinema-api.md`](./research/cinema-api.md).

**Содержание:**

1. [Цель и область](#1-цель-и-область)
2. [Стек](#2-стек)
3. [Дизайн-система](#3-дизайн-система)
4. [Экраны и роуты](#4-экраны-и-роуты)
5. [Функционал](#5-функционал)
6. [API](#6-api)
7. [Модели данных](#7-модели-данных)
8. [Архитектура](#8-архитектура)
9. [i18n](#9-i18n)
10. [Тесты и качество](#10-тесты-и-качество)
11. [Этапы разработки](#11-этапы-разработки)
12. [Критерии готовности](#12-критерии-готовности)
13. [Риски и краевые случаи](#13-риски-и-краевые-случаи)
14. [Ссылки](#14-ссылки)

---

## 1. Цель и область

Сделать адаптивное веб-приложение кинотеатра (desktop + mobile) с двумя темами (light/dark):

- каталог фильмов и страница фильма с расписанием;
- выбор сеанса и мест в зале, оформление и «оплата» билетов;
- авторизация по телефону (OTP), профиль, список купленных билетов и история, отмена заказа.

**Уровень: Senior** — реализуется **весь** объём задания целиком (каталог + бронирование + аккаунт/билеты). Этапы ниже — это **порядок работ**, а не частичная сдача.

Язык интерфейса: **русский** (инфраструктура i18n заложена, другие локали — позже).

---

## 2. Стек

Текущий скаффолд (`main`):

| Слой      | Технология                                                              |
| --------- | ----------------------------------------------------------------------- |
| Фреймворк | SvelteKit 2, Svelte 5 (runes)                                           |
| Стили     | Tailwind CSS 4.3 (актуальная 4.x; обновлять по мере выхода патчей)      |
| Язык      | TypeScript                                                              |
| i18n      | Paraglide (inlang), `baseLocale: ru` (файл `en` пока остаётся каркасом) |
| Иконки    | `@lucide/svelte` (уже подключён)                                        |
| Качество  | Prettier, ESLint                                                        |

Добавляем:

| Назначение            | Инструмент                                                                      |
| --------------------- | ------------------------------------------------------------------------------- |
| UI-примитивы          | `shadcn-svelte` (поверх `bits-ui`), Tailwind-merge, clsx, CVA, `tw-animate-css` |
| Шрифт                 | `@fontsource/nunito` (self-host, вариативный)                                   |
| Тесты                 | `vitest` + `@testing-library/svelte` + jsdom                                    |
| Документация UI       | Storybook (`@storybook/svelte` + Svelte CSF)                                    |
| Git-хуки              | `husky` + `lint-staged`                                                         |
| (опц.) Валидация форм | `zod`                                                                           |

> Storybook и тесты пишем **только для наших компонентов и логики**, не для сторонних (shadcn/bits-ui).

---

## 3. Дизайн-система

Источник значений — Figma-переменные и стили (страница «Кинотеатр» + общие «Colors/Typography/Icons»).

### 3.1. Цвета

- **Primitives**: `neutral/*`, `red/*`, `violet/*`, `yellow/*`, `orange/*`, `purple/*`, `pink/*`, `green/*`, `blue/*`, `sky/*`, `olive/*`.
- **Semantic** (используются в UI), с режимами **Light/Dark**:
  `background`, `foreground`, `surface`, `surface-foreground`, `muted`, `muted-foreground`,
  `primary`, `primary-foreground`, `primary-hover`, `secondary`, `secondary-foreground`, `secondary-hover`,
  `accent-primary`, `accent-primary-hover`, `accent-foreground`, `accent-secondary`, `accent-tertiary`,
  `accent-quaternary`, `accent-quinary`, `accent-senary`, `accent-septenary`,
  `destructive-foreground`, `destructive-background`, `destructive-border`,
  `border-hard`, `border-soft`, `input`, `outline`, `ring`, `ring-error`, `ghost-hover`, `ghost-foreground`.

Реализация: CSS-переменные в `src/routes/layout.css` (текущая точка входа Tailwind — `@import 'tailwindcss'`): `:root` — light, `[data-theme="dark"]` — dark → маппинг в Tailwind 4 `@theme` (например `--color-background`, `--color-accent-primary`).

### 3.2. Типографика (Nunito)

| Стиль       | Размер / вес / межстрочный |
| ----------- | -------------------------- |
| heading-2xl | 96 / 800                   |
| heading-xl  | 80 / 800                   |
| heading lg  | 60 / 700                   |
| heading-md  | 48 / 700                   |
| title-lg    | 32 / 700                   |
| title-md    | 24 / 700                   |
| body-lg     | 24 / 500                   |
| body-md     | 18 / 400                   |
| body-sm     | 16 / 500                   |
| link        | 16 / 500                   |
| caption     | 14 / 500                   |

### 3.3. Радиусы и тени

- Радиусы: `2, 4, 6, 8, 10, 12, 14, 16, 24, 9999`.
- Тени (effects): `input/dropshadow`, `switcher/dropshadow`, `tabs/dropshadow`.

### 3.4. Темы

- Переключение через `data-theme` на `<html>`; значение сохраняется в `localStorage` + учитывается системная тема (`prefers-color-scheme`).
- Тёмная тема — по умолчанию (вайб «кино»).

### 3.5. Компоненты дизайн-системы (из Figma)

Header (desktop), Header/Mobile app, TabBar, Button (варианты/размеры), Badge (с иконками), Input/Field,
DropdownMenu, Checkbox, Radio, BottomSheet (Desktop/Mobile = Modal/Drawer), Card/Movie, Tooltip,
Progress-Scrubber, Toast, Typography, Icon Wrapper.

**Стратегия:** интерактивные (Drawer/Modal, Tabs, Tooltip, Dropdown, Checkbox, Radio, Select, Toast) — `shadcn-svelte`/`bits-ui` со стилями на наших токенах; остальное (Button, Badge, Card, Input, Typography, Header, TabBar, SeatMap, ScheduleSelector…) — свои Svelte-компоненты.

---

## 4. Экраны и роуты

| Экран (Figma)             | Роут         | Описание                                                                                                     |
| ------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------ |
| Главная / Каталог фильмов | `/`          | Featured-ряд (крупные карточки) + сетка фильмов; на mobile — сетка каталога                                  |
| О фильме                  | `/film/[id]` | Постер/рейтинг/жанры/описание, актёры/режиссёр, выбор даты и сеанса                                          |
| Бронирование              | `/buy`       | Многошаговый флоу: места → проверка билетов → контакты → оплата → успех (`?step=`)                           |
| Авторизация               | `/auth`      | Ввод телефона → ввод OTP-кода                                                                                |
| Профиль                   | `/profile`   | Данные пользователя (просмотр/редактирование), выход, (опц.) сохранённые карты                               |
| Билеты / история          | `/tickets`   | Две вкладки: «Билеты» (активные) и «История покупки билетов» (все заказы, в т.ч. отменённые); отмена/возврат |

Лэйаут: группа `(menu)` — общий каркас: **Header** (desktop) / **TabBar** (mobile). Адаптив — один код на брейкпоинтах.

### Флоу бронирования (Middle/Senior)

Как в эталоне `cinema/1` (4 шага + успех):

1. На `/film/[id]` выбрать дату и сеанс (зал + время).
2. **Шаг 1 — «Выбор мест»**: схема зала (econom/comfort/blocked/paid), выбор нескольких мест, сумма.
3. **Шаг 2 — «Проверка билетов»**: выбранные места, сеанс, итоговая сумма; изменение выбора.
4. **Шаг 3 — «Контакты»**: ФИО + телефон (предзаполнение из профиля, если авторизован).
5. **Шаг 4 — «Оплата»**: форма карты (`pan/expireDate/cvv` — как в контракте, серверно не списывается).
6. **Успех**: номер заказа, билеты; заказ появляется в `/tickets`.

---

## 5. Функционал

### Junior (база доступа)

- Получение и отображение каталога фильмов.
- Страница фильма: описание, рейтинги, актёры/режиссёры, жанры.
- Расписание: даты → сеансы по залам/времени.

### Middle (бронирование)

- Схема мест зала с типами и ценами, выбор нескольких мест.
- Шаг проверки билетов, подсчёт суммы, форма контактов.
- «Оплата» (создание заказа + билетов), экран успеха.
- Сохранение купленных мест как `paid` в расписании.

### Senior (аккаунт и билеты)

- Авторизация по телефону + OTP (реальный API буткемпа).
- Профиль: просмотр/редактирование (имя, фамилия, отчество, email, город), выход.
- Билеты и «История покупки билетов»: заказы с билетами, статусы, отмена/возврат.
- Доступ к `/tickets`, `/profile`, `/buy` с учётом авторизации.

---

## 6. API

Базовая идея: **реальный API** закрывает аккаунт, **мок** — весь cinema-домен.

### 6.1. Реальный API (проксируется)

Базовый хост: `https://juniorsbootcamp.ru`; в спецификации все пути начинаются с `/api` (ниже префикс `/api` вынесен в базу). Заголовок `x-application: web`. Сессия — cookie `session_token` (web); для mobile-клиента — `Authorization: Bearer <token>`.

| Метод  | Путь                 | Назначение                                               |
| ------ | -------------------- | -------------------------------------------------------- |
| POST   | `/otps/otp`          | запросить OTP по `{ phone }` → `{ success, retryDelay }` |
| POST   | `/auth/sign-in`      | `{ phone, code }` → `{ success, token, user }`           |
| POST   | `/auth/sign-out`     | выход                                                    |
| GET    | `/users/profile`     | профиль текущего пользователя                            |
| PATCH  | `/users/profile`     | обновление профиля                                       |
| GET    | `/cards/cards`       | сохранённые карты (опционально)                          |
| DELETE | `/cards/cards/{id}`  | удалить карту (опционально)                              |
| GET    | `/transactions/{id}` | транзакция (в cinema-флоу не используется)               |

> В спецификации есть зеркало `/api/tester/*` (те же auth/profile/cards) и служебная страница `GET /api/otps` со списком сгенерированных OTP-кодов — SMS не отправляется, код вводится вручную на экране «Проверочный код при входе».

**Схема авторизации:** OTP → sign-in → сервер приложения сохраняет токен сессии в httpOnly-cookie `session_token` на своём домене и проксирует запросы к реальному API. `hooks.server.ts` читает сессию и заполняет `locals.user`.

### 6.2. Мок cinema API (внутри SvelteKit)

Реализуется эндпоинтами `src/routes/api/cinema/.../+server.ts` по контракту `_disabled/cinema` из `juniors-bootcamp-backend`. Формат ответа — плоский `{ success, ...данные }`.

| #   | Метод | Путь                                | Описание                                      |
| --- | ----- | ----------------------------------- | --------------------------------------------- |
| 1   | GET   | `/api/cinema/films`                 | все фильмы                                    |
| 2   | GET   | `/api/cinema/film/:filmId`          | один фильм                                    |
| 3   | GET   | `/api/cinema/film/:filmId/schedule` | 7 дней сеансов + сетки мест с отметкой `paid` |
| 4   | POST  | `/api/cinema/payment`               | создать заказ + билеты (`paid`)               |
| 5   | GET   | `/api/cinema/orders`                | заказы текущего пользователя                  |
| 6   | PUT   | `/api/cinema/orders/cancel`         | отменить заказ                                |

**Данные:** seed из backend-констант (`films`, `schedules`, `halls` — Red 6×6, Green 10×10, Blue 11×18), постеры/фото — из статики (`https://juniorsbootcamp.ru/api/static/images/cinema/...`; при желании — вендорить локально).

**Решения по поведению мока:**

- Расписания **генерируются всем 18 фильмам** (по шаблонам залов), а не только 1–10.
- Купленные места помечаются `paid` в расписании.
- При отмене заказа **места освобождаются** (становятся доступны снова), в отличие от эталона.
- Состояние заказов/билетов — in-memory (+ опционально persist в JSON для dev).
- Валидация: дубли мест, границы зала, тип `blocked` — отклоняются (HTTP 400 с `reason`).

### 6.3. Граница «реальный / мок» и прокси

- Реальный API — только через серверный прокси (обход CORS и third-party cookie): `src/routes/api/backend/[...path]/+server.ts` и тонкие auth-хэндлеры.
- Мок cinema живёт на том же origin (`/api/cinema/*`) — браузер вызывает напрямую.
- Слой `$lib/api` инкапсулирует оба источника; переключение мока на реальный cinema-бэкенд — заменой базового URL.

---

## 7. Модели данных

```ts
// ---------- Film ----------
type Rating = 'g' | 'pg' | 'pg13' | 'r' | 'nc17';
type Profession = 'actor' | 'director';

interface Country {
	id: number;
	code: string;
	code2: string;
	name: string;
}
interface FilmStaff {
	id: string;
	professions: Profession[];
	fullName: string;
	photo: string;
}
interface FilmUserRating {
	kinopoisk: string;
	imdb: string;
}

interface Film {
	id: string;
	name: string;
	originalName: string;
	description: string;
	releaseDate: string; // "25 мая 2016"
	actors: FilmStaff[];
	directors: FilmStaff[];
	runtime: number;
	ageRating: Rating;
	genres: string[];
	userRatings: FilmUserRating;
	img: string;
	country?: Country;
}

// ---------- Hall / Seance / Schedule ----------
type FilmHallCellType = 'econom' | 'comfort' | 'blocked' | 'paid';
interface FilmHallCell {
	type: FilmHallCellType;
	price: number; // 0 для blocked
}
interface FilmHall {
	name: string; // "Red" | "Green" | "Blue"
	places: FilmHallCell[][];
}
interface FilmSeance {
	time: string; // "12:30"
	hall: FilmHall;
}
interface FilmScheduleSeance {
	time: string;
	hall: FilmHall;
}
interface FilmSchedule {
	date: string; // "DD.MM.YY"
	seances: FilmScheduleSeance[];
}

// ---------- Order / Ticket ----------
type CinemaTicketStatus = 'paid' | 'cancelled';
type CinemaOrderStatus = 'paid' | 'canceled';
interface FilmPerson {
	firstname: string;
	lastname: string;
	middlename?: string;
	phone: string;
}

interface CinemaTicket {
	_id: string;
	filmId: string;
	orderId: string;
	row: number;
	column: number; // нумерация с 1
	seance: { date: string; time: string };
	phone: string;
	status: CinemaTicketStatus | string; // в БД хранится строкой, не enum
	created?: string;
	updated?: string;
}

interface CinemaOrder {
	_id: string;
	film: Film;
	orderNumber: number;
	tickets: CinemaTicket[];
	person: FilmPerson;
	status: CinemaOrderStatus;
	created?: string;
	updated?: string;
}

// ---------- Account (реальный API) ----------
interface User {
	_id: string;
	phone: string;
	firstname?: string;
	middlename?: string;
	lastname?: string;
	email?: string;
	city?: string;
}
interface Card {
	_id: string;
	phone: string;
	panMasked: string;
	expiry: string;
	cryptoPacket?: string | null;
}

// ---------- Ответы ----------
interface BaseResponse {
	success: boolean;
	reason?: string;
}
interface FilmsResponse extends BaseResponse {
	films: Film[];
}
interface FilmResponse extends BaseResponse {
	film: Film;
}
interface ScheduleResponse extends BaseResponse {
	schedules: FilmSchedule[];
}
interface PaymentResponse extends BaseResponse {
	order: CinemaOrder;
}
interface CinemaOrdersResponse extends BaseResponse {
	orders: CinemaOrder[];
}
```

---

## 8. Архитектура

### 8.1. Структура

```
src/
  routes/
    layout.css                 # Tailwind entry: токены (CSS vars) + @theme
    +layout.svelte / +layout.server.ts
    +page.svelte / +page.server.ts          # каталог
    film/[id]/+page.svelte / +page.server.ts
    buy/+page.svelte                        # шаги бронирования
    auth/+page.svelte
    tickets/+page.svelte / +page.server.ts
    profile/+page.svelte / +page.server.ts
    api/
      backend/[...path]/+server.ts          # прокси реального API
      auth/{otp,sign-in,sign-out,me}/+server.ts
      cinema/films/+server.ts
      cinema/film/[id]/+server.ts
      cinema/film/[id]/schedule/+server.ts
      cinema/payment/+server.ts
      cinema/orders/+server.ts
      cinema/orders/cancel/+server.ts
  hooks.server.ts              # paraglide + сессия → locals.user
  hooks.ts                     # paraglide reroute
  lib/
    api/
      client.ts                # типизированный fetch + обработка { success, reason }
      types.ts                 # DTO/модели API
      cinema.ts                # вызовы /api/cinema/*
      account.ts               # auth/profile/cards
    server/
      mock-cinema/
        seed.ts                # films/schedules/halls (из backend-констант)
        store.ts               # in-memory заказы/билеты, отметка paid, освобождение мест
        schedule.ts            # генерация расписаний (все 18 фильмов)
    components/
      ui/                      # shadcn-svelte + самописные примитивы
      cinema/                  # фичевые: FilmCard, FilmGrid, Header, TabBar,
                               #   ScheduleSelector, SeatMap, BookingSteps, TicketCard…
    stores/
      booking.svelte.ts        # runes-стейт бронирования
      theme.svelte.ts          # тема
    utils/                     # cn, formatDate, formatGenres, money
    paraglide/                 # сгенерировано
messages/
  ru.json / en.json            # исходники Paraglide (вне src)
```

### 8.2. Слои

- **UI** (`components/ui`, `components/cinema`) — презентация, без сетевой логики.
- **Feature/route** — SvelteKit `load` + runes, связывают данные и UI.
- **API-client** (`$lib/api`) — единственная точка сетевых вызовов, типы ответов.
- **Server** (`routes/api`, `lib/server`) — прокси реального API и мок cinema.
- Границы: компоненты не знают, мок это или реальный бэкенд — работают через `$lib/api`.

### 8.3. Данные и состояние

- SSR-загрузка каталога/фильма/расписания через `+page.server.ts` (`load`) → быстрый первый рендер.
- Авторизация: `hooks.server.ts` читает `session_token`, тянет профиль → `locals.user`; защищённые роуты проверяют `locals.user`.
- Бронирование: `booking.svelte.ts` (runes) хранит выбранный фильм/сеанс/места/контакты; шаг — в URL (`?step=`), чтобы работали back/refresh.
- Тема: `theme.svelte.ts` + `data-theme` на `<html>`, persist в `localStorage`.

---

## 9. i18n

- Paraglide, `baseLocale` переключаем на `ru` (единственная активная локаль). Сейчас в `project.inlang/settings.json` стоит `baseLocale: en`, локали `["en","ru"]` — меняем на `["ru"]` (файл `en.json` можно оставить для будущего).
- Все строки — через `m.*()` из `$lib/paraglide/messages`; тексты в `messages/ru.json` (в корне проекта, вне `src`).
- Каркас оставляем для будущих локалей (`en` и др.) без переделки кода.
- Форматирование дат/сумм — через общие утилиты (локаль-зависимые).

---

## 10. Тесты и качество

- **Unit/компонентные** (`vitest` + `@testing-library/svelte`): сторы, утилиты (форматирование, суммы), мок-логика (расписание, оплата, отмена), ключевые наши компоненты (SeatMap, ScheduleSelector, формы).
- **Storybook**: только наши компоненты/композиции (shadcn-примитивы не документируем). Истории: Button/Badge/Card/FilmCard/SeatMap/ScheduleSelector/BookingSteps.
- E2E (Playwright) — **пока не добавляем**, заложено в будущее.
- `husky` + `lint-staged`: pre-commit — prettier/eslint; pre-push — `svelte-check` + `vitest run`.
- Обязательный `npm run check` перед PR.

---

## 11. Этапы разработки

> Полный объём (Senior) реализуется целиком; этапы — порядок работ.

### M0 — Фундамент

- [x] Tailwind уже 4.3 — обновить до актуальной 4.x; настроить токены (`src/routes/layout.css`: CSS vars + `@theme`), темы light/dark.
- [x] Подключить Nunito (`@fontsource/nunito`); иконки — `@lucide/svelte` (уже есть).
- [x] Инициализировать `shadcn-svelte` (`npx shadcn-svelte init`: bits-ui, tailwind-merge, clsx, CVA, tw-animate-css).
- [x] Лэйаут-каркас: Header (desktop) / TabBar (mobile), контейнеры, адаптив.
- [x] i18n: Paraglide, `baseLocale: ru`, `m.*()`.
- [x] Мок-сервер cinema: seed + store + 6 эндпоинтов; генерация расписаний всем 18 фильмам.
- [x] Прокси реального API + auth-хэндлеры + `locals.user`.
- [x] Инструменты: vitest, Storybook, husky + lint-staged.
- [x] `svelte-check`/lint/prettier зелёные.

### M1 — Каталог и фильм (Junior)

- [x] `GET /api/cinema/films` → каталог: featured-ряд + сетка `FilmCard`.
- [x] `/film/[id]`: данные фильма, рейтинг, жанры, актёры/режиссёр.
- [x] `ScheduleSelector`: даты → сеансы по залам/времени (данные из `/schedule`).
- [x] Адаптив desktop/mobile, обе темы.
- [x] Storybook + тесты для FilmCard/ScheduleSelector.

### M2 — Бронирование и оплата (Middle)

- [x] `SeatMap`: типы мест (econom/comfort/blocked/paid), выбор, сумма.
- [x] Шаги `/buy?step=`: места → проверка билетов → контакты → оплата → успех.
- [x] `POST /api/cinema/payment`: валидация, создание order+tickets (`paid`), номер заказа.
- [x] Экран успеха с билетами.
- [x] Тесты мок-логики оплаты (дубли, границы, `blocked`).

### M3 — Аккаунт и билеты (Senior)

- [x] `/auth`: телефон → OTP (`/otps/otp`, `/auth/sign-in`, код с `/api/otps` в dev).
- [x] Сессия: cookie `session_token`, `locals.user`, guard-роуты.
- [x] `/profile`: просмотр/редактирование (`PATCH /users/profile`), выход.
- [x] `/tickets`: вкладки «Билеты» / «История покупки билетов», статусы, отмена (`PUT /orders/cancel`, освобождение мест).
- [x] Отображение авторизации в Header/TabBar.

### M4 — Полировка

- [x] Все экраны реализованы адаптивно (Desktop + Mobile, Light + Dark); desktop-версии в обеих темах проверены вживую. Figma-файла в репозитории нет — попиксельная сверка не выполнялась.
- [x] Пустые состояния, ошибки API (`{ success: false, reason }`), загрузки/скелетоны.
- [x] Доступность (фокус, клавиатура, aria), контраст — Lighthouse Accessibility 100 на каталоге, фильме, авторизации, билетах, профиле, выборе места и 404.
- [x] Полный прогон тестов (23 файла / 104 теста), Storybook, `check`, lint.

---

## 12. Критерии готовности

- Все экраны и флоу работают на моке cinema + реальном auth/profile.
- Каталог, фильм, бронирование, оплата, билеты, профиль — по Figma, адаптив + обе темы.
- Покупка и отмена билета корректно отражаются в расписании и `/tickets`.
- Ошибки контракта (`{ success: false, reason }`) отображаются пользователю.
- `npm run check`, lint, prettier — без ошибок; тесты и Storybook собираются; husky работает.
- i18n: все строки через `m.*()`; локаль `ru`.

---

## 13. Риски и краевые случаи

| Риск                                                              | Решение                                               |
| ----------------------------------------------------------------- | ----------------------------------------------------- |
| CORS/third-party cookie при обращении к реальному API из браузера | серверный прокси + httpOnly-cookie на своём домене    |
| OTP без SMS                                                       | код берём со служебной страницы `GET /api/otps` (dev) |
| В сиде нет расписаний у 11–18                                     | генерируем расписания всем фильмам в моке             |
| Эталон не освобождает места после отмены                          | в моке освобождаем                                    |
| Дубли/некорректные места (blocked, границы)                       | валидируем на сервере мока, 400 + reason              |
| In-memory состояние теряется при рестарте                         | опционально persist в JSON для dev                    |
| Расхождения дизайна Figma и референса `cinema/1`                  | визуал — строго Figma, поведение — референс           |
| Большой ответ расписания (полные сетки залов)                     | кэширование на клиенте + нормализация                 |

---

## 14. Ссылки

- Figma: страница «Кинотеатр» (Light/Dark: Junior/Middle/Senior), общие «Components/Colors/Typography/Icons».
- Контракт cinema: [`docs/research/cinema-api.md`](./research/cinema-api.md).
- Backend (исходники): `siberiacancode/juniors-bootcamp-backend` (`_disabled/cinema`).
- Референс-реализация: `siberiacancode/juniors-bootcamp-examples` (`cinema/1` — Next.js, `cinema/2` — React/Vite).
- Реальный API: <https://juniorsbootcamp.ru/api/rest>.
