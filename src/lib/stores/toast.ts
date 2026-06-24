import { writable } from 'svelte/store';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
	id: string;
	type: ToastType;
	message: string;
	duration?: number;
}

function createToastStore() {
	const { subscribe, update } = writable<ToastMessage[]>([]);

	return {
		subscribe,
		add: (message: string, type: ToastType = 'info', duration: number = 3000) => {
			const id = Math.random().toString(36).substring(2, 9);
			update((toasts) => [...toasts, { id, type, message, duration }]);

			setTimeout(() => {
				update((toasts) => toasts.filter((t) => t.id !== id));
			}, duration);
		},
		remove: (id: string) => {
			update((toasts) => toasts.filter((t) => t.id !== id));
		}
	};
}

export const toast = createToastStore();
