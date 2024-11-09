export async function GET() {
	try {
		const response = await fetch('http://api.open-notify.org/iss-now.json');
		const data = await response.json();

		return new Response(JSON.stringify(data), {
			headers: {
				'Content-Type': 'application/json'
			}
		});
	} catch (error) {
		return new Response(JSON.stringify({ error: 'Failed to fetch ISS position' }), {
			status: 500,
			headers: {
				'Content-Type': 'application/json'
			}
		});
	}
}
