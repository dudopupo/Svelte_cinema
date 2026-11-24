import filmsData from './seed/films.json';
import hallsData from './seed/halls.json';
import schedulesData from './seed/schedules.json';
import type { Film, FilmHall, FilmSchedule, FilmSeance } from '$lib/api/types';

export const FILMS = filmsData as unknown as Film[];

export const HALLS = hallsData as unknown as Record<'red' | 'green' | 'blue', FilmHall>;

type RawSeance = { time: string; hall: keyof typeof HALLS };
type RawSchedule = RawSeance[][];

const RAW_SCHEDULES = schedulesData as unknown as Record<string, RawSchedule>;

/**
 * Seed contains schedules only for films 1–10. For the rest we reuse a template
 * with a small deterministic time shift so every film has its own timetable.
 */
function getRawSchedule(filmId: string): RawSchedule {
	const direct = RAW_SCHEDULES[filmId];
	if (direct) return direct;

	const numericId = Number(filmId);
	const templates = Object.values(RAW_SCHEDULES);
	const template = templates[(numericId - 1) % templates.length];

	return template.map((day) =>
		day.map((seance) => ({
			...seance,
			time: shiftTime(seance.time, (numericId % 5) * 5)
		}))
	);
}

function shiftTime(time: string, minutesDelta: number): string {
	const [hours, minutes] = time.split(':').map(Number);
	const total = (hours * 60 + minutes + minutesDelta) % (24 * 60);
	const nextHours = Math.floor(total / 60);
	const nextMinutes = total % 60;
	return `${String(nextHours).padStart(2, '0')}:${String(nextMinutes).padStart(2, '0')}`;
}

export function formatScheduleDate(date: Date): string {
	const day = String(date.getDate()).padStart(2, '0');
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const year = String(date.getFullYear()).slice(-2);
	return `${day}.${month}.${year}`;
}

export function getScheduleDates(now = new Date()): string[] {
	const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	return Array.from({ length: 7 }, (_, index) => {
		const date = new Date(start);
		date.setDate(start.getDate() + index);
		return formatScheduleDate(date);
	});
}

export interface PaidSeat {
	date: string;
	time: string;
	row: number;
	column: number;
}

export function buildSchedule(
	filmId: string,
	paidSeats: PaidSeat[] = [],
	now = new Date()
): FilmSchedule[] {
	const raw = getRawSchedule(filmId);
	const dayIndex = now.getDay();
	const rotated = dayIndex === 0 ? raw : raw.slice(dayIndex).concat(raw.slice(0, dayIndex));
	const dates = getScheduleDates(now);

	return rotated.slice(0, 7).map((day, dayOffset) => {
		const date = dates[dayOffset];

		return {
			date,
			seances: day.map((rawSeance) => {
				const hall = structuredClone(HALLS[rawSeance.hall]);
				const seance: FilmSeance = { time: rawSeance.time, hall };

				for (const seat of paidSeats) {
					if (seat.date !== date || seat.time !== rawSeance.time) continue;

					const cell = hall.places[seat.row - 1]?.[seat.column - 1];
					if (cell && cell.type !== 'blocked') cell.type = 'paid';
				}

				return seance;
			})
		};
	});
}

export interface FindSeanceOptions {
	/** Hall name, needed when the film has several seances at the same time. */
	hall?: string;
	now?: Date;
}

export function findSeance(
	filmId: string,
	date: string | undefined,
	time: string | undefined,
	{ hall, now = new Date() }: FindSeanceOptions = {}
): FilmSeance | undefined {
	if (!date || !time) return undefined;
	const schedule = buildSchedule(filmId, [], now);
	const seances = schedule.find((day) => day.date === date)?.seances ?? [];

	return seances.find((seance) => seance.time === time && (!hall || seance.hall.name === hall));
}
