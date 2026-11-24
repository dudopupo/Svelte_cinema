# Cinema API — справочник по исходному коду

Источник: репозиторий [`siberiacancode/juniors-bootcamp-backend`](https://github.com/siberiacancode/juniors-bootcamp-backend), ветка `main`, коммит [`7f8855e`](https://github.com/siberiacancode/juniors-bootcamp-backend/tree/7f8855e0ded5de2f2934cb43d19574a3cb7f51f0) (24.08.2026). Анализ выполнен 23.11.2026.

Весь модуль лежит в каталоге `_disabled/cinema/` и **не подключён** к приложению: в `src/app.module.ts` строка `// CinemaModule` закомментирована. Ниже описано фактическое содержимое кода, а не поведение задеплоенного API.

Ссылки на исходники (raw):

- [`cinema.controller.ts`](https://raw.githubusercontent.com/siberiacancode/juniors-bootcamp-backend/main/_disabled/cinema/cinema.controller.ts)
- [`cinema.model.ts`](https://raw.githubusercontent.com/siberiacancode/juniors-bootcamp-backend/main/_disabled/cinema/cinema.model.ts)
- [`cinema.service.ts`](https://raw.githubusercontent.com/siberiacancode/juniors-bootcamp-backend/main/_disabled/cinema/cinema.service.ts)
- [`cinema.query.ts`](https://raw.githubusercontent.com/siberiacancode/juniors-bootcamp-backend/main/_disabled/cinema/cinema.query.ts)
- [`cinema.mutation.ts`](https://raw.githubusercontent.com/siberiacancode/juniors-bootcamp-backend/main/_disabled/cinema/cinema.mutation.ts)
- [`dto/`](https://github.com/siberiacancode/juniors-bootcamp-backend/tree/main/_disabled/cinema/dto)
- [`entities/`](https://github.com/siberiacancode/juniors-bootcamp-backend/tree/main/_disabled/cinema/entities)
- [`modules/cinema-order/`](https://github.com/siberiacancode/juniors-bootcamp-backend/tree/main/_disabled/cinema/modules/cinema-order)
- [`modules/cinema-ticket/`](https://github.com/siberiacancode/juniors-bootcamp-backend/tree/main/_disabled/cinema/modules/cinema-ticket)
- [`constants/films.ts`](https://raw.githubusercontent.com/siberiacancode/juniors-bootcamp-backend/main/_disabled/cinema/constants/films.ts)
- [`constants/schedules.ts`](https://raw.githubusercontent.com/siberiacancode/juniors-bootcamp-backend/main/_disabled/cinema/constants/schedules.ts)
- [`constants/halls/`](https://github.com/siberiacancode/juniors-bootcamp-backend/tree/main/_disabled/cinema/constants/halls)

Все пути из задания существуют; 404 только у `src/utils/common/country.ts` (фактический путь — `src/utils/common/country/country.entity.ts`).

---

## Эндпоинты

Базовый путь контроллера — `/cinema`. Глобальный префикс приложения — `api` (`BASE_URL = 'api'` в `src/utils/helpers/withBaseUrl.ts`), то есть реальные URL выглядят как `/api/cinema/...`.

Общий формат успешного ответа (старый `BaseResolver.wrapSuccess`): **`{ success: true, ...данные }`**, поля данных лежат на верхнем уровне. Отдельного ключа `payload` в коде нет. Ошибка: `{ success: false, reason: string, ...данные }`; HTTP-код задаёт исключение (`BadRequestException` → 400, guard → 401).

| #   | Метод | Путь                            | Авторизация               | Кратко                                                  |
| --- | ----- | ------------------------------- | ------------------------- | ------------------------------------------------------- |
| 1   | GET   | `/cinema/films`                 | нет                       | Список всех фильмов                                     |
| 2   | GET   | `/cinema/film/:filmId`          | нет                       | Один фильм по id                                        |
| 3   | GET   | `/cinema/film/:filmId/schedule` | нет                       | Расписание на 7 дней с отметками купленных мест         |
| 4   | POST  | `/cinema/payment`               | нет                       | «Оплата»: создаёт заказ и билеты сразу в статусе `paid` |
| 5   | GET   | `/cinema/orders`                | `@AuthorizedOnly()` + JWT | Заказы текущего пользователя                            |
| 6   | PUT   | `/cinema/orders/cancel`         | `@AuthorizedOnly()`       | Отмена заказа (меняет статусы)                          |

В модуле также объявлены GraphQL-резолверы (`cinema.query.ts`, `cinema.mutation.ts`): `getCinemaToday`, `getFilm(input)`, `getFilmSchedule(input)`, `getCinemaOrders(token)`, `createCinemaPayment(input)`, `cancelCinemaOrder(input)`. Они не попадают в схему, пока модуль отключён.

### 1. GET `/cinema/films`

Метод в контроллере называется `getCinemaToday`, но возвращает все фильмы из константы `FILMS`. Параметров нет.

```json
{
	"success": true,
	"films": [
		{
			"id": "1",
			"name": "Варкрафт",
			"originalName": "Warcraft",
			"description": "Мир Азерота оказывается на грани войны, когда через портал в него приходят орки, ищущие новый дом для своего народа.",
			"releaseDate": "25 мая 2016",
			"actors": [
				{
					"id": "1",
					"professions": ["actor"],
					"fullName": "Трэвис Фиммел",
					"photo": "/static/images/cinema/actors/travis-fimmel.webp"
				}
			],
			"directors": [
				{
					"id": "1",
					"professions": ["director"],
					"fullName": "Дункан Джонс",
					"photo": "/static/images/cinema/directors/duncan-jones.webp"
				}
			],
			"runtime": 123,
			"ageRating": "pg13",
			"genres": ["фэнтези", "боевик", "приключения"],
			"userRatings": { "kinopoisk": "7.6", "imdb": "6.7" },
			"img": "/static/images/cinema/films/warcraft.webp",
			"country": { "id": 1, "code": "USA", "code2": "US", "name": "США" }
		}
	]
}
```

Массив `films` содержит все 18 элементов (см. «Seed-данные»). В примере актёры сокращены — в реальных данных у каждого фильма 5 актёров.

### 2. GET `/cinema/film/:filmId`

Параметр `filmId` — строка (`GetFilmDto`, `@IsString() @IsNotEmpty()`), например `1`.

Успех:

```json
{
	"success": true,
	"film": {
		"id": "1",
		"name": "Варкрафт",
		"originalName": "Warcraft",
		"description": "Мир Азерота оказывается на грани войны, когда через портал в него приходят орки, ищущие новый дом для своего народа.",
		"releaseDate": "25 мая 2016",
		"actors": [
			{
				"id": "1",
				"professions": ["actor"],
				"fullName": "Трэвис Фиммел",
				"photo": "/static/images/cinema/actors/travis-fimmel.webp"
			},
			{
				"id": "2",
				"professions": ["actor"],
				"fullName": "Пола Пэттон",
				"photo": "/static/images/cinema/actors/paula-patton.webp"
			},
			{
				"id": "3",
				"professions": ["actor"],
				"fullName": "Бен Фостер",
				"photo": "/static/images/cinema/actors/ben-foster.webp"
			},
			{
				"id": "4",
				"professions": ["actor"],
				"fullName": "Доминик Купер",
				"photo": "/static/images/cinema/actors/dominic-cooper.webp"
			},
			{
				"id": "5",
				"professions": ["actor"],
				"fullName": "Тоби Кеббелл",
				"photo": "/static/images/cinema/actors/toby-kebbell.webp"
			}
		],
		"directors": [
			{
				"id": "1",
				"professions": ["director"],
				"fullName": "Дункан Джонс",
				"photo": "/static/images/cinema/directors/duncan-jones.webp"
			}
		],
		"runtime": 123,
		"ageRating": "pg13",
		"genres": ["фэнтези", "боевик", "приключения"],
		"userRatings": { "kinopoisk": "7.6", "imdb": "6.7" },
		"img": "/static/images/cinema/films/warcraft.webp",
		"country": { "id": 1, "code": "USA", "code2": "US", "name": "США" }
	}
}
```

Ошибка (HTTP 400):

```json
{ "success": false, "reason": "Фильм не найден" }
```

### 3. GET `/cinema/film/:filmId/schedule`

Алгоритм (`cinema.controller.ts` + `cinema.service.ts`):

1. Берётся массив `SCHEDULES` и находится запись с нужным `filmId`.
2. `const currentDay = new Date().getDay()`. Если сегодня воскресенье (`0`), массив дней возвращается как есть; иначе выполняется ротация `schedule.slice(currentDay).concat(schedule.slice(0, currentDay))`.
3. Каждому дню присваивается дата `getDDMMYYFormatDate(index)` — **сегодня + index дней** в формате `DD.MM.YY` (год из двух цифр).
4. Из Mongo загружаются все билеты `{ filmId }` (без фильтра по статусу). Для каждого сеанса копия сетки мест (`structuredClone`) помечается: ячейка `[row-1][column-1].type = "paid"`, если найден билет с совпадающими `seance.date`, `seance.time`, `filmId`.

Ответ:

```jsonc
{
	"success": true,
	"schedules": [
		{
			"date": "23.11.26", // динамически: сегодня + индекс дня
			"seances": [
				{
					"time": "12:30",
					"hall": {
						"name": "Red",
						"places": [
							[
								{ "price": 0, "type": "blocked" },
								{ "price": 0, "type": "blocked" },
								{ "price": 100, "type": "econom" },
								{ "price": 100, "type": "econom" },
								{ "price": 0, "type": "blocked" },
								{ "price": 0, "type": "blocked" }
							],
							[
								{ "price": 0, "type": "blocked" },
								{ "price": 100, "type": "econom" },
								{ "price": 100, "type": "econom" },
								{ "price": 100, "type": "econom" },
								{ "price": 100, "type": "econom" },
								{ "price": 0, "type": "blocked" }
							],
							[
								{ "price": 100, "type": "econom" },
								{ "price": 200, "type": "comfort" },
								{ "price": 200, "type": "comfort" },
								{ "price": 200, "type": "comfort" },
								{ "price": 200, "type": "comfort" },
								{ "price": 100, "type": "econom" }
							],
							[
								{ "price": 100, "type": "econom" },
								{ "price": 200, "type": "comfort" },
								{ "price": 200, "type": "comfort" },
								{ "price": 200, "type": "comfort" },
								{ "price": 200, "type": "comfort" },
								{ "price": 100, "type": "econom" }
							],
							[
								{ "price": 100, "type": "econom" },
								{ "price": 100, "type": "econom" },
								{ "price": 100, "type": "econom" },
								{ "price": 100, "type": "econom" },
								{ "price": 100, "type": "econom" },
								{ "price": 100, "type": "econom" }
							],
							[
								{ "price": 100, "type": "econom" },
								{ "price": 100, "type": "econom" },
								{ "price": 100, "type": "econom" },
								{ "price": 100, "type": "econom" },
								{ "price": 100, "type": "econom" },
								{ "price": 100, "type": "econom" }
							]
						]
					}
				}
				// ... ещё 11 сеансов: 4 Red, 4 Green, 4 Blue
			]
		}
		// ... всего 7 дней
	]
}
```

Купленное место в ответе выглядит как `{ "type": "paid", "price": 100 }` (цена исходного места сохраняется). Сетки Green (10×10) и Blue (11×18) в примере не показаны.

Для фильмов **11–18** запись в `SCHEDULES` отсутствует: `schedules.find(...)` вернёт `undefined`, деструктуризация `const { schedule } = ...` бросит `TypeError` → HTTP 500.

### 4. POST `/cinema/payment`

DTO `CreateCinemaPaymentDto`:

```json
{
	"filmId": "1",
	"person": {
		"firstname": "Иван",
		"lastname": "Иванов",
		"middlename": "Иванович",
		"phone": "89990009999"
	},
	"debitCard": {
		"pan": "1111 1111",
		"expireDate": "11/11",
		"cvv": "111"
	},
	"seance": { "date": "23.11.26", "time": "12:30" },
	"tickets": [
		{ "row": 3, "column": 1 },
		{ "row": 3, "column": 2 }
	]
}
```

`debitCard` обязателен по DTO, но **никак не используется**: списания и транзакции нет.

Логика:

1. Для каждого места ищется билет по `seance.date + seance.time + row + column` (без `filmId` и без фильтра по статусу). Если найден — HTTP 400:
   ```json
   {
   	"success": false,
   	"reason": "Данные билеты уже куплены: 1. 23.11.26 12:30 3 1",
   	"tickets": [
   		{
   			"seance": { "date": "23.11.26", "time": "12:30" },
   			"row": 3,
   			"column": 1,
   			"status": "paid"
   		}
   	]
   }
   ```
2. Генерируется `orderNumber = Math.floor(Math.random() * 10 ** 6)` (0…999999, без проверки уникальности).
3. Создаётся заказ со статусом `paid` и пустым `tickets`, фильм сохраняется **целиком** (снимок).
4. Вставляются билеты со статусом `paid`, затем в заказ записывается массив билетов.
5. По телефону ищется пользователь; если нет — создаётся `{ phone }`, затем имя/фамилия/отчество перезаписываются из `person`.
6. Возвращается заново прочитанный заказ.

Успешный ответ (сокращён):

```jsonc
{
	"success": true,
	"order": {
		"_id": "665f1c2ab7e4d93f2c1a0001",
		"film": { "id": "1", "name": "Варкрафт", "...": "полный объект Film" },
		"orderNumber": 483920,
		"tickets": [
			{
				"_id": "665f1c2ab7e4d93f2c1a0002",
				"filmId": "1",
				"orderId": "665f1c2ab7e4d93f2c1a0001",
				"row": 3,
				"column": 1,
				"seance": { "date": "23.11.26", "time": "12:30" },
				"phone": "89990009999",
				"status": "paid"
			},
			{
				"_id": "665f1c2ab7e4d93f2c1a0003",
				"filmId": "1",
				"orderId": "665f1c2ab7e4d93f2c1a0001",
				"row": 3,
				"column": 2,
				"seance": { "date": "23.11.26", "time": "12:30" },
				"phone": "89990009999",
				"status": "paid"
			}
		],
		"person": {
			"firstname": "Иван",
			"lastname": "Иванов",
			"middlename": "Иванович",
			"phone": "89990009999"
		},
		"status": "paid",
		"created": "2026-11-23T10:00:00.000Z",
		"updated": "2026-11-23T10:00:00.000Z"
	}
}
```

Важно: в HTTP-контроллере тело объявлено как `@Args('input')` (декоратор GraphQL), а не `@Body()`. В REST-режиме это, скорее всего, приведёт к `undefined`/ошибке. Рабочий вариант того же кода — GraphQL-мутация `createCinemaPayment(input)` в `cinema.mutation.ts`.

### 5. GET `/cinema/orders`

Требует `@AuthorizedOnly()`. Затем контроллер вручную читает **JWT**:

```ts
const token = req.headers.authorization?.split(' ')[1];
const decodedJwtAccessToken = (await this.authService.decode(token)) as User;
const orders = await this.cinemaOrderService.find({ 'person.phone': decodedJwtAccessToken.phone });
```

Заголовок: `Authorization: Bearer <jwt>`. Если токен не декодируется — 400 `{ "success": false, "reason": "Некорректный токен авторизации" }`.

```jsonc
{
	"success": true,
	"orders": [
		{
			"_id": "665f1c2ab7e4d93f2c1a0001",
			"film": { "id": "1", "name": "Варкрафт", "...": "полный объект Film" },
			"orderNumber": 483920,
			"tickets": [/* массив CinemaTicket */],
			"person": {
				"firstname": "Иван",
				"lastname": "Иванов",
				"middlename": "Иванович",
				"phone": "89990009999"
			},
			"status": "paid",
			"created": "2026-11-23T10:00:00.000Z",
			"updated": "2026-11-23T10:00:00.000Z"
		}
	]
}
```

### 6. PUT `/cinema/orders/cancel`

Тело (`CancelCinemaOrderDto`):

```json
{ "orderId": "665f1c2ab7e4d93f2c1a0001" }
```

Логика:

1. Заказ ищется по `_id`; нет — 400 `{ "success": false, "reason": "Заказ не найден" }`.
2. Если статус не `paid` — 400 `{ "success": false, "reason": "Заказ нельзя отменить" }`.
3. Всем билетам заказа ставится `status: "cancelled"`.
4. Заказ перечитывается со статусом `canceled` и обновлённым массивом билетов.
5. Владелец заказа **не проверяется** — достаточно любого авторизованного пользователя и чужого `orderId`.

Ответ:

```json
{ "success": true }
```

---

## Модели данных

### Обёртки ответов

```ts
// Старый BaseResponse (@/utils/services/base/base.model.ts)
interface BaseResponse {
	success: boolean;
	reason?: string;
}

// wrapSuccess({ films }) === { success: true, films }
// wrapFail('...', { tickets }) === { success: false, reason: '...', tickets }

interface FilmResponse extends BaseResponse {
	film: Film;
}
interface FilmsResponse extends BaseResponse {
	films: Film[];
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

> В `cinema.model.ts` у `ScheduleResponse` в `@ApiProperty` указан тип `FilmSchedule` (не массив), хотя TS-поле — `FilmSchedule[]`; в `@Field` тоже указан одиночный `FilmSchedule`. Ориентируйтесь на TS-поле: это массив.

### Film и вложенные сущности

```ts
type Rating = 'g' | 'pg' | 'pg13' | 'r' | 'nc17';

interface Film {
	id: string;
	name: string;
	originalName: string;
	description: string;
	releaseDate: string; // человекочитаемая строка, напр. "25 мая 2016"
	actors: FilmStaff[];
	directors: FilmStaff[];
	runtime: number; // минуты
	ageRating: Rating;
	genres: string[]; // просто строки
	userRatings: FilmUserRating;
	img: string; // "/static/images/cinema/films/<slug>.webp"
	country?: Country;
}

type Profession = 'actor' | 'director';

interface FilmStaff {
	id: string;
	professions: Profession[];
	fullName: string;
	photo: string;
}

interface FilmUserRating {
	kinopoisk: string; // строки, напр. "7.6"
	imdb: string;
}

interface Country {
	id: number;
	code: string; // "USA"
	code2: string; // "US"
	name: string; // "США"
}
```

Сущность `FilmGenre { id: string; name: string }` объявлена, но **не используется**: `Film.genres` — массив строк.

### Аккаунт покупателя

```ts
interface FilmPerson {
	firstname: string;
	lastname: string;
	middlename?: string;
	phone: string;
}
```

### Зал, место, сеанс, расписание

```ts
type FilmHallCellType = 'econom' | 'comfort' | 'blocked' | 'paid';
type FilmHallCellStatus = 'default' | 'paid'; // объявлен, но нигде не используется

interface FilmHallCell {
	type: FilmHallCellType;
	price: number; // у blocked — 0
}

interface FilmHall {
	name: string; // фактически "Red" | "Green" | "Blue"
	places: FilmHallCell[][]; // [ряд][место], нумерация с 0 в массиве
}

interface FilmSeance {
	time: string; // "12:30"
	hall: FilmHall; // полная сетка мест внутри каждого сеанса
}

interface FilmScheduleSeance {
	// дубликат FilmSeance
	time: string;
	hall: FilmHall;
}

interface FilmSchedule {
	date: string; // "DD.MM.YY"
	seances: FilmScheduleSeance[];
}
```

`FilmHallCellType` (значения enum): `econom`, `comfort`, `blocked`, `paid`.
`FilmHallCellStatus`: `default`, `paid` (не применяется).

### Билет

```ts
type CinemaTicketStatus = 'paid' | 'cancelled'; // в enum именно две "l"

interface CinemaTicketSeance {
	date: string; // "29.06.23"
	time: string; // "10:00"
}

interface CinemaTicket {
	_id: string; // Types.ObjectId → строка в JSON
	filmId: string;
	orderId: string;
	row: number; // с 1
	column: number; // с 1
	seance: CinemaTicketSeance;
	phone: string;
	status: CinemaTicketStatus; // тип поля в классе — string, но пишется enum
	created?: string; // timestamps: createdAt
	updated?: string; // timestamps: updatedAt
}
```

### Заказ

```ts
type CinemaOrderStatus = 'paid' | 'canceled'; // одна "l"

interface CinemaOrder {
	_id: string;
	film: Film; // полный снимок фильма
	orderNumber: number; // 0…999999
	tickets: CinemaTicket[];
	person: FilmPerson;
	status: CinemaOrderStatus;
	created?: string;
	updated?: string;
}
```

Коллекции Mongo: `cinema/order`, `cinema/tickets`.

### DTO

```ts
interface GetFilmDto {
	filmId: string;
}
interface GetScheduleDto {
	filmId: string;
}
interface CancelCinemaOrderDto {
	orderId: string;
}

interface CreatePaymentTicketsDto {
	row: number;
	column: number;
}

interface CreatePaymentDebitCardDto {
	pan: string;
	expireDate: string; // "11/11"
	cvv: string;
}

interface CreatePaymentPersonDto {
	firstname: string;
	lastname: string;
	middlename?: string;
	phone: string;
}

interface CreatePaymentSeanceDto {
	date: string;
	time: string;
}

interface CreateCinemaPaymentDto {
	filmId: string;
	person: CreatePaymentPersonDto;
	debitCard: CreatePaymentDebitCardDto;
	seance: CreatePaymentSeanceDto;
	tickets: CreatePaymentTicketsDto[];
}
```

---

## Seed-данные

### Фильмы (`_disabled/cinema/constants/films.ts`)

Ровно **18 фильмов**, `id` — строки `"1"`…`"18"`. У каждого: 5 актёров (`professions: ["actor"]`), 1 режиссёр (у «Дня сурка» режиссёр одновременно `["director","actor"]`), `userRatings` строками, `country`.

| id  | Название                   | Оригинал                     | Жанры                            | Возраст | КП  | IMDb | Мин | Дата выхода     | Страна         | Постер (`/static/images/cinema/films/…`) | Режиссёр            |
| --- | -------------------------- | ---------------------------- | -------------------------------- | ------- | --- | ---- | --- | --------------- | -------------- | ---------------------------------------- | ------------------- |
| 1   | Варкрафт                   | Warcraft                     | фэнтези, боевик, приключения     | pg13    | 7.6 | 6.7  | 123 | 25 мая 2016     | США            | warcraft.webp                            | Дункан Джонс        |
| 2   | Один дома                  | Home Alone                   | комедия, семейный                | pg      | 8.3 | 7.7  | 103 | 10 ноября 1990  | США            | home-alone.webp                          | Крис Коламбус       |
| 3   | Остров проклятых           | Shutter Island               | триллер, детектив, драма         | r       | 8.5 | 8.2  | 138 | 13 февраля 2010 | США            | shutter-island.webp                      | Мартин Скорсезе     |
| 4   | Хроники Риддика            | The Chronicles of Riddick    | фантастика, боевик, приключения  | pg13    | 7.2 | 6.6  | 119 | 11 июня 2004    | США            | the-chronicles-of-riddick.webp           | Дэвид Туи           |
| 5   | Маска                      | The Mask                     | комедия, фэнтези                 | pg13    | 7.8 | 6.9  | 101 | 29 июля 1994    | США            | the-mask.webp                            | Чак Рассел          |
| 6   | Молчание ягнят             | The Silence of the Lambs     | триллер, детектив, криминал      | r       | 8.3 | 8.6  | 118 | 30 января 1991  | США            | the-silence-of-the-lambs.webp            | Джонатан Демми      |
| 7   | Интерстеллар               | Interstellar                 | фантастика, драма, приключения   | pg13    | 8.7 | 8.7  | 169 | 26 октября 2014 | США            | interstellar.webp                        | Кристофер Нолан     |
| 8   | Очень страшное кино        | Scary Movie                  | комедия, ужасы                   | r       | 7.0 | 6.3  | 88  | 7 июля 2000     | США            | scary-movie.webp                         | Кинен Айвори Уайанс |
| 9   | Великий уравнитель         | The Equalizer                | боевик, триллер, криминал        | r       | 7.3 | 7.2  | 132 | 7 сентября 2014 | США            | the-equalizer.webp                       | Антуан Фукуа        |
| 10  | Сонная Лощина              | Sleepy Hollow                | ужасы, фэнтези, детектив         | r       | 7.7 | 7.3  | 105 | 17 ноября 1999  | США            | sleepy-hollow.webp                       | Тим Бёртон          |
| 11  | Назад в будущее            | Back to the Future           | фантастика, комедия, приключения | pg      | 8.6 | 8.5  | 116 | 3 июля 1985     | США            | back-to-the-future.webp                  | Роберт Земекис      |
| 12  | Сайлент Хилл               | Silent Hill                  | ужасы, детектив                  | r       | 7.2 | 6.5  | 125 | 21 апреля 2006  | Канада         | silent-hill.webp                         | Кристоф Ган         |
| 13  | Пятница 13-е               | Friday the 13th              | ужасы, триллер                   | r       | 6.3 | 6.4  | 95  | 9 мая 1980      | США            | friday-the-13th.webp                     | Шон С. Каннингем    |
| 14  | День сурка                 | Groundhog Day                | комедия, фэнтези, мелодрама      | pg      | 8.1 | 8.0  | 101 | 12 февраля 1993 | США            | groundhog-day.webp                       | Гарольд Рамис       |
| 15  | Чужой                      | Alien                        | ужасы, фантастика, триллер       | r       | 8.1 | 8.5  | 117 | 25 мая 1979     | Великобритания | alien.webp                               | Ридли Скотт         |
| 16  | Хэллоуин                   | Halloween                    | ужасы, триллер                   | r       | 7.1 | 7.7  | 91  | 25 октября 1978 | США            | halloween.webp                           | Джон Карпентер      |
| 17  | Техасская резня бензопилой | The Texas Chain Saw Massacre | ужасы                            | r       | 6.7 | 7.4  | 83  | 1 октября 1974  | США            | the-texas-chain-saw-massacre.webp        | Тоуб Хупер          |
| 18  | Мальчишник в Вегасе        | The Hangover                 | комедия                          | r       | 7.8 | 7.7  | 100 | 30 мая 2009     | США            | the-hangover.webp                        | Тодд Филлипс        |

Пути постеров в ответе начинаются с `/static/...`, однако статика в `main.ts` смонтирована с префиксом `withBaseUrl('/static/')`, то есть фактически `/api/static/images/cinema/...`. Клиенту нужно добавлять `/api` (или использовать относительный базовый URL API).

Актёры и их фото лежат в `src/static/images/cinema/actors/`, режиссёры — в `.../directors/`.

### Залы (`constants/halls/index.ts`)

Три зала, имя — с большой буквы: `Red`, `Green`, `Blue`.

| Зал   | Размер сетки     | Всего мест | `blocked` | `econom` | `comfort` | Цены (econom / comfort), blocked = 0 |
| ----- | ---------------- | ---------- | --------- | -------- | --------- | ------------------------------------ |
| Red   | 6 рядов × 6 мест | 36         | 6         | 22       | 8         | 100 / 200                            |
| Green | 10 × 10          | 100        | 10        | 66       | 24        | 200 / 300                            |
| Blue  | 11 × 18          | 198        | 30        | 132      | 36        | 300 / 400                            |

`blocked`-места нужны для «вырезанной» формы зала (боковые/угловые). Внутри одного зала цена зависит только от типа: например, в Red все `econom` = 100, все `comfort` = 200.

`constants/index.ts` экспортирует только `films` и `schedules`; `halls` импортируется в `schedules.ts` напрямую из `./halls`.

### Расписания (`constants/schedules.ts`)

- В `SCHEDULES` ровно **10 записей** — только `filmId` `"1"`…`"10"`.
- У каждой записи `schedule` — массив из **7 дней**. Индекс 0 соответствует воскресенью, 1 — понедельнику, … 6 — субботе (совместимо с `Date.getDay()`).
- В каждом дне ровно **12 сеансов**: по 4 в Red, 4 в Green, 4 в Blue (в этом порядке; времена внутри зала возрастают).
- Итого 84 сеанса на фильм, 840 сеансов во всём сиде.
- Каждый сеанс — `{ time: "HH:MM", hall: halls.<name> }`, где `hall` — **полный объект зала** с сеткой мест (данные дублируются в каждом сеансе ответа).

Пример дня фильма 1 (исходный второй день недели):

| Зал   | Времена                    |
| ----- | -------------------------- |
| Red   | 12:30, 13:10, 17:10, 20:00 |
| Green | 12:50, 15:30, 17:50, 20:20 |
| Blue  | 11:20, 13:10, 17:10, 21:40 |

Для фильмов **11–18** расписаний нет — эндпоинт `/film/:id/schedule` для них падает (см. выше).

---

## Особенности реализации

### Авторизация

- Эндпоинт `/orders` защищён `@AuthorizedOnly()`, после чего контроллер **самостоятельно** разбирает `req.headers.authorization`: берёт вторую часть после пробела и вызывает `authService.decode(token)` (JWT). Результат приводится к `User`, заказы фильтруются по `person.phone`.
- Токен не проверяется на принадлежность к сессии в контроллере — это делает guard (в старом коде — JWT-guard из `@/modules/auth`).
- `/payment` не требует авторизации: пользователь создаётся/обновляется по телефону из тела.
- В отмене заказа нет проверки, что заказ принадлежит текущему пользователю.
- В контроллере используется `@AuthorizedOnly()`, но сам декоратор **не импортирован** (импортирован только `AuthorizedOnlyGuard`); вместе с импортами из удалённого `@/utils/services` это делает модуль некомпилируемым в текущем состоянии — ещё одна причина, почему он в `_disabled/`.

### Пометка купленных мест (`PAID`)

- В сиде типы мест: `econom`, `comfort`, `blocked`. Тип `paid` появляется только в ответе расписания.
- При запросе расписания контроллер клонирует сетку и для каждого билета с совпадением `filmId + date + time` ставит `places[row-1][column-1].type = "paid"`.
- Цена (`price`) купленного места не обнуляется.
- Билеты со статусом `cancelled` **тоже учитываются** (фильтра по `status` нет), поэтому после отмены заказа места остаются визуально `paid`.

### Оплата

- Отдельной платёжной транзакции нет: сразу создаются `CinemaOrder` со статусом `paid` и `CinemaTicket[]` со статусом `paid`.
- `debitCard` (pan/expireDate/cvv) принимается DTO, но не используется и нигде не сохраняется.
- Нет проверки суммы, баланса, существования сеанса, границ зала и типа места: можно «купить» `blocked`, несуществующий ряд/место или место в чужом фильме (проверка дублей не включает `filmId`).
- В заказе нет поля суммы/цены — только снимок фильма, билеты, покупатель, номер и статус.
- `orderNumber` случаен и не уникален.
- Пользователь ищется по `phone`; при отсутствии создаётся, затем его ФИО перезаписывается данными из формы.

### Отмена

- Разрешена только для `paid`; переводит заказ в `canceled`, билеты — в `cancelled`.
- Повторная отмена/отмена `canceled` → 400 «Заказ нельзя отменить».
- Освободившиеся места нельзя купить повторно: проверка дублей ищет билеты без учёта статуса, а расписание продолжает рисовать их как `paid`.

### Генерация расписания

- `getFilms()` возвращает константу; `getFilm(id)` — `find` по строковому id.
- Дни «вращаются» от текущего дня недели (`Date.getDay()`), а даты считаются от сегодняшнего числа. Индекс 0 в сиде — воскресенье, поэтому в понедельник первым вернётся `schedule[1]` с датой «сегодня»; состав сеансов и дата при этом согласованы. В воскресенье вращения нет.
- Каждый сеанс содержит полную копию зала, поэтому ответ расписания большой (≈1336 ячеек на день: 4×36 + 4×100 + 4×198).

### REST vs GraphQL

- Один и тот же модуль содержит и REST-контроллер, и GraphQL-резолверы с одинаковой логикой.
- В REST-контроллере `POST /payment` ошибочно использует `@Args('input')` вместо `@Body()`.
- GraphQL-версия `getCinemaOrders` принимает токен аргументом, REST-версия — из `Authorization`.
- GraphQL-схема не содержит модуль, пока `CinemaModule` закомментирован.

---

## Расхождения с задеплоенным API

1. **Модуль отключён.** `_disabled/cinema/` не собирается и не импортируется: в `src/app.module.ts` стоит `// CinemaModule`. В текущем задеплоенном API эндпоинтов `/cinema/*` нет.
2. **Другая авторизация.** Старый cinema-код рассчитывает на JWT в `Authorization: Bearer <jwt>` и `authService.decode`. Задеплоенный API использует серверные сессии (Mongo ObjectId): cookie `session_token` для веба и Bearer-токен для мобильного клиента; тип клиента — заголовок `x-application: web | mobile` (`ClientType.WEB = 'web'`, `ClientType.MOBILE = 'mobile'`; при отсутствии/невалидном значении — `web`). Guard `AuthorizedOnlyGuard` сначала читает cookie, затем `Authorization: Bearer`.
3. **Устаревшие импорты.** `cinema.controller.ts` и `cinema.module.ts` импортируют `AuthService`, `BaseResolver`, `BaseResponse`, `AuthModule` из `@/utils/services`, которого больше нет в `main`. Сейчас база ответов — `src/utils/base/base.response.ts` (`success`, `reason?`), а данные разворачиваются через `Result.success({...})` на верхнем уровне.
4. **Формат ответа.** И в старом `BaseResolver`, и в новом `Result` данные лежат рядом с `success` (`{ success: true, orders: [...] }`), ключа `payload` нет.
5. **Статика.** Сид возвращает `img: "/static/..."`, а фактический префикс статики — `/api/static/...` (`app.useStaticAssets({ prefix: withBaseUrl('/static/') })`).
6. **GraphQL.** В приложении GraphQL настроен, но cinema-резолверы в схему не попадают; REST-документация монтируется под `/api/rest` (и `/api/rest.json`).
7. **Реально задеплоенные модули** (из `app.module.ts`): `AuthModule`, `OtpsModule`, `UsersModule`, `CardsModule`, `TransactionsModule`, `SessionsModule`, `PizzasModule`, `GamesModule`, `TesterModule`. Cinema, delivery, cars — отключены/удалены.
8. **Модель оплаты.** В актуальном API платежи и карты вынесены в отдельные модули `cards` и `transactions`; в cinema-модуле `debitCard` — мёртвое поле, а заказ сразу `paid`.

---

## Итог: что мокать, а что доступно реально

- **Мокать целиком (6 эндпоинтов):** `GET /cinema/films`, `GET /cinema/film/:filmId`, `GET /cinema/film/:filmId/schedule`, `POST /cinema/payment`, `GET /cinema/orders`, `PUT /cinema/orders/cancel`. В задеплоенном API их нет — их нужно реализовать моком на основе `FILMS`/`SCHEDULES` и in-memory заказов/билетов. Учтите: расписания есть только у фильмов 1–10; даты динамические; купленные места помечаются `paid`.
- **Реально доступно (не мокать, а проксировать/использовать):** `POST /api/auth/sign-in`, `POST /api/auth/sign-out`; `POST /api/otps/otp`; `GET|PATCH /api/users/profile`; `GET /api/cards/cards`, `DELETE /api/cards/cards/:id`; `GET /api/transactions/:id`, `POST /api/transactions/pay`, `POST /api/transactions/:id/pay/qr`.
- Авторизацию в моке лучше эмулировать теми же средствами, что и реальный API: cookie `session_token` для web, Bearer для mobile, заголовок `x-application`. JWT из старого cinema-кода использовать не нужно.
- Для мока оплаты достаточно создавать заказ и билеты в памяти со статусом `paid`, без транзакций; отмена переводит заказ в `canceled`, билеты — в `cancelled` (при этом в эталонном коде места остаются `paid` в расписании — это известное расхождение).
