import { writable } from 'svelte/store';
import { tweened } from 'svelte/motion';
import { cubicOut } from 'svelte/easing';

export const tweenedLatitude = tweened(0, {
	duration: 5000,
	easing: cubicOut
});

export const tweenedLongitude = tweened(0, {
	duration: 5000,
	easing: cubicOut
});

export const altitude = writable(0);
export const velocity = writable(0);
export const visibility = writable('');

const createISSStore = () => {
	const { subscribe, set } = writable({ loading: true, error: null });

	const fetchISSPosition = async () => {
		try {
			const response = await fetch('/api/iss');
			const data = await response.json();

			if (data.message === 'success') {
				tweenedLatitude.set(data.iss_position.latitude);
				tweenedLongitude.set(data.iss_position.longitude);
				altitude.set(data.iss_position.altitude);
				velocity.set(data.iss_position.velocity);
				visibility.set(data.iss_position.visibility);

				set({
					loading: false,
					error: null,
					lastUpdate: data.timestamp
				});
			}
		} catch (error) {
			set({ loading: false, error: error.message });
			console.error('Error fetching ISS position:', error);
		}
	};

	let intervalId;

	const startTracking = () => {
		fetchISSPosition();
		intervalId = setInterval(fetchISSPosition, 10000);
	};

	const stopTracking = () => {
		if (intervalId) clearInterval(intervalId);
	};

	return {
		subscribe,
		startTracking,
		stopTracking
	};
};

export const issStore = createISSStore();
