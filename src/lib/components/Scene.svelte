<script>
	import { T } from '@threlte/core';
	import { ContactShadows, Float, Grid, OrbitControls } from '@threlte/extras';
	import { TextureLoader } from 'three';
	import { useGltf } from '@threlte/extras';
	import { Group, Vector3 } from 'three';
	import { onMount, onDestroy } from 'svelte';

	const textureLoader = new TextureLoader();
	const earthTexture = textureLoader.load('/2k_earth_daymap.jpg');
	const specularMap = textureLoader.load('/2k_earth_specular_map.tif');
	const normalMap = textureLoader.load('/2k_earth_normal_map.tif');
	const cloudsTexture = textureLoader.load('/2k_earth_clouds.jpg');

	// Function to convert lat/long to 3D position
	/**
	 * @param {number} latitude
	 * @param {number} longitude
	 * @param {number} radius
	 */
	function latLongToVector3(latitude, longitude, radius) {
		const phi = (90 - latitude) * (Math.PI / 180);
		const theta = (longitude + 180) * (Math.PI / 180);

		const x = -(radius * Math.sin(phi) * Math.cos(theta));
		const z = radius * Math.sin(phi) * Math.sin(theta);
		const y = radius * Math.cos(phi);

		return [x, y, z];
	}

	// Store for ISS position
	let latitude = 0;
	let longitude = 0;
	let intervalId;

	async function fetchISSPosition() {
		try {
			const response = await fetch('/api/iss');
			const data = await response.json();

			if (data.message === 'success') {
				latitude = parseFloat(data.iss_position.latitude);

				longitude = parseFloat(data.iss_position.longitude);
			}
		} catch (error) {
			console.error('Error fetching ISS position:', error);
		}
	}

	onMount(() => {
		// Initial fetch
		fetchISSPosition();

		// Set up interval (every 5 seconds)
		intervalId = setInterval(fetchISSPosition, 5000);
	});

	onDestroy(() => {
		// Clean up interval when component is destroyed
		if (intervalId) clearInterval(intervalId);
	});

	// Calculate ISS position (using your existing function)
	$: issPosition = latLongToVector3(latitude, longitude, 2.5);
</script>

<!-- Add position display -->
<div
	style="position: fixed; top: 10px; left: 10px; background: rgba(0,0,0,0.5); padding: 10px; color: white;"
>
	<div>Latitude: {latitude.toFixed(4)}°</div>
	<div>Longitude: {longitude.toFixed(4)}°</div>
</div>

<T.PerspectiveCamera makeDefault position={[-10, 10, 10]} fov={45}>
	<OrbitControls
		autoRotate
		enableZoom={true}
		minDistance={5}
		maxDistance={50}
		enableDamping
		autoRotateSpeed={0.2}
		target.y={1.5}
	/>
</T.PerspectiveCamera>

<T.AmbientLight intensity={0.8} />
<!-- 
<Grid
	position.y={-0.001}
	cellColor="#ffffff"
	sectionColor="#ffffff"
	sectionThickness={0}
	fadeDistance={25}
	cellSize={2}
/> -->

<ContactShadows scale={10} blur={2} far={2.5} opacity={0.5} />

<Float floatIntensity={0.5} floatingRange={[0, 0.5]}>
	<!-- Earth Sphere -->
	<T.Mesh>
		<T.SphereGeometry args={[2, 64, 64]} />
		<T.MeshPhongMaterial
			map={earthTexture}
			{specularMap}
			{normalMap}
			normalScale={0.5}
			specular="#666666"
			shininess={5}
		/>
	</T.Mesh>

	<!-- Cloud Layer -->
	<T.Mesh>
		<T.SphereGeometry args={[2.05, 64, 64]} />
		<T.MeshPhongMaterial map={cloudsTexture} transparent={true} opacity={0.8} depthWrite={false} />
	</T.Mesh>

	<!-- ISS -->
	<T.Group position={issPosition} rotation.x={Math.PI / 2}>
		{#await useGltf('/ISS_stationary.glb') then gltf}
			<T scale={0.005} is={gltf.scene} />
		{/await}
	</T.Group>
</Float>
