export interface SeatPosition {
	row: number;
	column: number;
}

export type TicketsTab = 'active' | 'history';

export function parseTicketsTab(value: string | null | undefined): TicketsTab {
	return value === 'history' ? 'history' : 'active';
}

/** Active tab shows paid orders; history keeps every order, including cancelled ones. */
export function filterOrdersByTab<T extends { status: string }>(orders: T[], tab: TicketsTab): T[] {
	if (tab === 'history') return orders;
	return orders.filter((order) => order.status === 'paid');
}

function plural(count: number, one: string, few: string, many: string): string {
	const mod100 = count % 100;
	const mod10 = count % 10;

	if (mod100 >= 11 && mod100 <= 14) return many;
	if (mod10 === 1) return one;
	if (mod10 >= 2 && mod10 <= 4) return few;
	return many;
}

function joinNumbers(values: number[]): string {
	if (values.length <= 1) return values.join('');
	return `${values.slice(0, -1).join(', ')} и ${values[values.length - 1]}`;
}

/** Groups tickets by row: "1 ряд, 5 и 6 места", "2 ряд, 3 место". */
export function formatSeatGroups(seats: SeatPosition[]): string {
	const rows = new Map<number, Set<number>>();

	for (const seat of seats) {
		const columns = rows.get(seat.row) ?? new Set<number>();
		columns.add(seat.column);
		rows.set(seat.row, columns);
	}

	return [...rows.entries()]
		.sort(([left], [right]) => left - right)
		.map(([row, columns]) => {
			const columnList = [...columns].sort((left, right) => left - right);
			return `${row} ряд, ${joinNumbers(columnList)} ${plural(
				columnList.length,
				'место',
				'места',
				'мест'
			)}`;
		})
		.join('; ');
}

/** Stable four-digit ticket number derived from the ticket id. */
export function ticketNumber(id: string): string {
	let hash = 0;

	for (let index = 0; index < id.length; index += 1) {
		hash = (hash * 31 + id.charCodeAt(index)) >>> 0;
	}

	return String(hash % 10_000).padStart(4, '0');
}
