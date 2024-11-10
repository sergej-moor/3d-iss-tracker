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

const createISSStore = () => {
	const { subscribe, set } = writable({ loading: true, error: null });

	const fetchISSPosition = async () => {
		try {
			const response = await fetch('/api/iss');
			const data = await response.json();

			if (data.message === 'success') {
				const newLat = parseFloat(data.iss_position.latitude);
				const newLong = parseFloat(data.iss_position.longitude);

				tweenedLatitude.set(newLat);
				tweenedLongitude.set(newLong);
				set({ loading: false, error: null });
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
