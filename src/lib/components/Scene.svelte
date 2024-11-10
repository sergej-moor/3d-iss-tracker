<script>
	import { T } from '@threlte/core';
	import {
		ContactShadows,
		Environment,
		Float,
		Grid,
		TrackballControls,
		Stars
	} from '@threlte/extras';
	import { TextureLoader } from 'three';
	import { useGltf } from '@threlte/extras';
	import { Group, Vector3, Color } from 'three';
	import { onMount, onDestroy } from 'svelte';
	import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
	import { useFrame } from '@threlte/core';
	import { tweenedLatitude, tweenedLongitude } from '$lib/stores/iss';

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

	// Calculate ISS position using tweened values, with fallback
	$: issPosition =
		$tweenedLatitude !== null && $tweenedLongitude !== null
			? latLongToVector3($tweenedLatitude, $tweenedLongitude, 2.5)
			: [0, 0, 0]; // Or you could return null and not render the ISS until position is known

	let cloudRotation = 0;

	useFrame(() => {
		cloudRotation += 0.00002;
	});
</script>

<!-- <Environment
	path="/"
	files="space.hdr"
	isBackground={true}
	groundProjection={{ radius: 500, height: 5, scale: { x: 100, y: 100, z: 100 } }}
/> -->

<Stars factor={4} speed={1} radius={80} />

<T.AmbientLight intensity={0.2} />
<T.DirectionalLight intensity={1.5} position={[10, 10, 10]} castShadow />

<T.PerspectiveCamera makeDefault position={[-7, 7, 7]} fov={45}>
	<TrackballControls
		noZoom={false}
		noPan={false}
		dynamicDampingFactor={0.15}
		minDistance={3.5}
		maxDistance={30}
		enabled={true}
	/>
</T.PerspectiveCamera>

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

<T.Mesh rotation.y={cloudRotation}>
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

<!-- Only show ISS when we have position data -->
{#if $tweenedLatitude !== null && $tweenedLongitude !== null}
	<T.Group position={issPosition} rotation.x={Math.PI / 2}>
		{#await useGltf('/ISS_stationary.glb') then gltf}
			<T scale={0.002} is={gltf.scene}>
				<T.PointLight intensity={0.5} distance={1} color={new Color(0xff0000)} />
			</T>
		{/await}
	</T.Group>
{/if}
