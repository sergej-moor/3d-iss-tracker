// Server-side tracker
let currentPosition = {
	latitude: 0,
	longitude: 0,
	lastUpdate: null,
	loading: true,
	error: null
};

let intervalId = null;

async function updateISSPosition() {
	try {
		const response = await fetch('http://api.open-notify.org/iss-now.json');
		const data = await response.json();

		if (data.message === 'success') {
			currentPosition = {
				latitude: parseFloat(data.iss_position.latitude),
				longitude: parseFloat(data.iss_position.longitude),
				lastUpdate: new Date().toISOString(),
				loading: false,
				error: null
			};
		}
	} catch (error) {
		currentPosition.error = error.message;
		currentPosition.loading = false;
		console.error('Error fetching ISS position:', error);
	}
}

export function startTracking() {
	if (!intervalId) {
		updateISSPosition();
		intervalId = setInterval(updateISSPosition, 10000);
	}
}

export function stopTracking() {
	if (intervalId) {
		clearInterval(intervalId);
		intervalId = null;
	}
}

export function getCurrentPosition() {
	return currentPosition;
}
