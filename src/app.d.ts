import type { User } from '$lib/api/types';
import type { BookingStep } from '$lib/utils/booking';

declare global {
	namespace App {
		interface Locals {
			user: User | null;
		}
		interface PageData {
			user?: User | null;
		}
		interface PageState {
			bookingStep?: BookingStep;
		}
	}
}

export {};
