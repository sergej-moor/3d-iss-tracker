<script>
	import { T } from '@threlte/core';
	import { ContactShadows, Environment, Float, Grid, OrbitControls, Stars } from '@threlte/extras';
	import { TextureLoader } from 'three';
	import { useGltf } from '@threlte/extras';
	import { Group, Vector3, Color } from 'three';
	import { onMount, onDestroy } from 'svelte';
	import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';

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

	// Create tweened stores for smooth transitions
	const tweenedLatitude = tweened(0, {
		duration: 5000, // Duration matches the update interval
		easing: cubicOut
	});

	const tweenedLongitude = tweened(0, {
		duration: 5000,
		easing: cubicOut
	});

	let intervalId = 10000;

	async function fetchISSPosition() {
		try {
			const response = await fetch('/api/iss');
			const data = await response.json();

			if (data.message === 'success') {
				const newLat = parseFloat(data.iss_position.latitude);
				const newLong = parseFloat(data.iss_position.longitude);

				// Update tweened stores
				tweenedLatitude.set(newLat);
				tweenedLongitude.set(newLong);
			}
		} catch (error) {
			console.error('Error fetching ISS position:', error);
		}
	}

	onMount(() => {
		fetchISSPosition();
		intervalId = setInterval(fetchISSPosition, 10000);
	});

	onDestroy(() => {
		if (intervalId) clearInterval(intervalId);
	});

	// Calculate ISS position using tweened values
	$: issPosition = latLongToVector3($tweenedLatitude, $tweenedLongitude, 2.5);
</script>

<Environment
	path="/"
	files="space.hdr"
	isBackground={true}
	groundProjection={{ radius: 500, height: 5, scale: { x: 100, y: 100, z: 100 } }}
/>
<Stars factor={4} speed={1} radius={80} />

<T.AmbientLight intensity={0.2} />
<T.DirectionalLight intensity={1.5} position={[10, 10, 10]} castShadow />

<T.PerspectiveCamera makeDefault position={[-7, 7, 7]} fov={45}>
	<OrbitControls
		autoRotate={true}
		autoRotateSpeed={0.01}
		enableZoom={true}
		minDistance={3}
		maxDistance={30}
		enableDamping={true}
		dampingFactor={0.05}
		minPolarAngle={Math.PI * 0.2}
		maxPolarAngle={Math.PI * 0.8}
		target.y={1.5}
	/>
</T.PerspectiveCamera>

<Float floatIntensity={0.5} floatingRange={[0, 0.5]}>
	<T.Mesh castShadow receiveShadow>
		<T.SphereGeometry args={[2, 64, 64]} />
		<T.MeshPhongMaterial
			map={earthTexture}
			{specularMap}
			{normalMap}
			normalScale={0.8}
			specular="#444444"
			shininess={25}
			emissive={new Color(0x112244)}
			emissiveIntensity={0.1}
		/>
	</T.Mesh>

	<T.Mesh>
		<T.SphereGeometry args={[2.05, 64, 64]} />
		<T.MeshPhongMaterial
			map={cloudsTexture}
			transparent={true}
			opacity={0.4}
			depthWrite={false}
			emissive={new Color(0xffffff)}
			emissiveIntensity={0.05}
		/>
	</T.Mesh>

	<!-- Atmosphere glow -->
	<T.Mesh>
		<T.SphereGeometry args={[2.1, 32, 32]} />
		<T.MeshPhongMaterial color={new Color(0x0077ff)} transparent={true} opacity={0.1} side={2} />
	</T.Mesh>

	<T.Group position={issPosition} rotation.x={Math.PI / 2}>
		{#await useGltf('/ISS_stationary.glb') then gltf}
			<T scale={0.005} is={gltf.scene}>
				<T.PointLight intensity={0.5} distance={1} color={new Color(0xff0000)} />
			</T>
		{/await}
	</T.Group>
</Float>

<!-- Enhanced UI -->
<div
	style="position: fixed; top: 20px; left: 20px; 
		   background: rgba(0,0,0,0.7); 
		   padding: 15px; 
		   color: white;
		   border-radius: 10px;
		   font-family: 'Arial', sans-serif;
		   backdrop-filter: blur(5px);"
>
	<div style="font-size: 1.2em; margin-bottom: 5px;">ISS Location</div>
	<div>Latitude: {$tweenedLatitude.toFixed(4)}°</div>
	<div>Longitude: {$tweenedLongitude.toFixed(4)}°</div>
</div>
