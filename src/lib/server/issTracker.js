// Server-side tracker
let currentPosition = {
	latitude: 0,
	longitude: 0,
	altitude: 0,
	velocity: 0,
	visibility: '',
	lastUpdate: null,
	loading: true,
	error: null
};

let intervalId = null;

async function updateISSPosition() {
	try {
		const response = await fetch('https://api.wheretheiss.at/v1/satellites/25544');
		const data = await response.json();

		if (data.name === 'iss') {
			currentPosition = {
				latitude: parseFloat(data.latitude),
				longitude: parseFloat(data.longitude),
				altitude: parseFloat(data.altitude),
				velocity: parseFloat(data.velocity),
				visibility: data.visibility,
				lastUpdate: new Date(data.timestamp * 1000).toISOString(),
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
