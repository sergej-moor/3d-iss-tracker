import { json } from '@sveltejs/kit';
import { getCurrentPosition } from '$lib/server/issTracker.js';

export async function GET() {
	const position = getCurrentPosition();

	return json({
		message: 'success',
		iss_position: {
			latitude: position.latitude,
			longitude: position.longitude
		},
		timestamp: position.lastUpdate,
		loading: position.loading,
		error: position.error
	});
}
