import type { CinemaOrder, Film, FilmHall, FilmSchedule, User } from '$lib/api/types';

export const sampleUser: User = {
	_id: 'user-1',
	phone: '+7 999 123 45 67',
	lastname: 'Иванов',
	firstname: 'Иван',
	middlename: 'Иванович',
	city: 'Москва',
	email: 'ivan@mail.ru'
};

export const sampleFilm: Film = {
	id: '7',
	name: 'Интерстеллар',
	originalName: 'Interstellar',
	description:
		'Когда Земля становится непригодной для жизни, группа исследователей отправляется через червоточину в поисках нового дома для человечества.',
	releaseDate: '6 ноября 2014',
	actors: [
		{
			id: '1',
			professions: ['actor'],
			fullName: 'Мэттью Макконахи',
			photo: '/static/images/cinema/actors/matthew-mcconaughey.webp'
		},
		{
			id: '2',
			professions: ['actor'],
			fullName: 'Энн Хэтэуэй',
			photo: '/static/images/cinema/actors/anne-hathaway.webp'
		},
		{
			id: '3',
			professions: ['actor'],
			fullName: 'Джессика Честейн',
			photo: '/static/images/cinema/actors/jessica-chastain.webp'
		},
		{
			id: '4',
			professions: ['actor'],
			fullName: 'Маккензи Фой',
			photo: '/static/images/cinema/actors/mackenzie-foy.webp'
		}
	],
	directors: [
		{
			id: '1',
			professions: ['director'],
			fullName: 'Кристофер Нолан',
			photo: '/static/images/cinema/directors/christopher-nolan.webp'
		}
	],
	runtime: 169,
	ageRating: 'pg13',
	genres: ['фантастика', 'драма', 'приключения'],
	userRatings: { kinopoisk: '8.7', imdb: '8.7' },
	img: '/static/images/cinema/films/interstellar.webp',
	country: { id: 1, code: 'USA', code2: 'US', name: 'США' }
};

const blocked = { price: 0, type: 'blocked' } as const;
const econom = (price = 300) => ({ price, type: 'econom' }) as const;
const comfort = { price: 400, type: 'comfort' } as const;
const paid = { price: 300, type: 'paid' } as const;

export const sampleHall: FilmHall = {
	name: 'Blue',
	places: [
		[blocked, econom(), econom(), econom(), blocked],
		[econom(), comfort, comfort, comfort, econom()],
		[econom(), paid, econom(), econom(), econom()],
		[econom(), econom(), econom(), econom(), econom()]
	]
};

export const sampleSchedules: FilmSchedule[] = [
	{
		date: '23.11.26',
		seances: [
			{ time: '11:40', hall: { name: 'Red', places: [] } },
			{ time: '12:40', hall: { name: 'Red', places: [] } },
			{ time: '14:40', hall: { name: 'Red', places: [] } },
			{ time: '12:15', hall: { name: 'Blue', places: [] } },
			{ time: '15:15', hall: { name: 'Blue', places: [] } }
		]
	},
	{
		date: '24.11.26',
		seances: [
			{ time: '10:30', hall: { name: 'Green', places: [] } },
			{ time: '13:30', hall: { name: 'Green', places: [] } },
			{ time: '19:20', hall: { name: 'Blue', places: [] } }
		]
	},
	{
		date: '25.11.26',
		seances: [
			{ time: '11:00', hall: { name: 'Red', places: [] } },
			{ time: '16:30', hall: { name: 'Red', places: [] } }
		]
	}
];

export const sampleOrder: CinemaOrder = {
	_id: 'order-1',
	film: sampleFilm,
	orderNumber: 483920,
	tickets: [
		{
			_id: 'ticket-8931',
			filmId: sampleFilm.id,
			orderId: 'order-1',
			row: 1,
			column: 5,
			seance: { date: '23.11.26', time: '17:10', hall: 'Blue' },
			phone: '+7 999 999 99 99',
			status: 'paid'
		},
		{
			_id: 'ticket-5632',
			filmId: sampleFilm.id,
			orderId: 'order-1',
			row: 1,
			column: 6,
			seance: { date: '23.11.26', time: '17:10', hall: 'Blue' },
			phone: '+7 999 999 99 99',
			status: 'paid'
		}
	],
	person: {
		firstname: 'Иван',
		lastname: 'Иванов',
		middlename: 'Иванович',
		phone: '+7 999 999 99 99'
	},
	status: 'paid',
	created: '2026-11-23T10:00:00.000Z',
	updated: '2026-11-23T10:00:00.000Z'
};
