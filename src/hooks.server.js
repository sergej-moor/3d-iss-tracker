import { startTracking, stopTracking } from '$lib/server/issTracker.js';

// Start tracking when server starts
startTracking();

// Clean up on server shutdown
process.on('SIGTERM', () => {
	stopTracking();
	process.exit(0);
});
