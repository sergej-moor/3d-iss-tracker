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
	import { cubicOut, elasticIn, elasticInOut, elasticOut } from 'svelte/easing';
	import { useFrame } from '@threlte/core';
	import { tweenedLatitude, tweenedLongitude } from '$lib/stores/iss';
	import { centerOnISS } from '$lib/stores/controls';

	const textureLoader = new TextureLoader();
	const earthTexture = textureLoader.load('/2k_earth_daymap.jpg');
	const specularMap = textureLoader.load('/2k_earth_specular_map.tif');
	const normalMap = textureLoader.load('/2k_earth_normal_map.tif');
	const cloudsTexture = textureLoader.load('/2k_earth_clouds.jpg');

	function latLongToVector3(latitude, longitude, radius) {
		const phi = (90 - latitude) * (Math.PI / 180);
		const theta = (longitude + 180) * (Math.PI / 180);

		const x = -(radius * Math.sin(phi) * Math.cos(theta));
		const z = radius * Math.sin(phi) * Math.sin(theta);
		const y = radius * Math.cos(phi);

		return [x, y, z];
	}

	$: issPosition =
		$tweenedLatitude !== null && $tweenedLongitude !== null
			? latLongToVector3($tweenedLatitude, $tweenedLongitude, 2.5)
			: null;

	$: cameraIssPosition =
		$tweenedLatitude !== null && $tweenedLongitude !== null
			? latLongToVector3($tweenedLatitude, $tweenedLongitude, 3)
			: null;

	let cloudRotation = 0;

	useFrame(() => {
		cloudRotation += 0.0002;
	});

	let controls;

	const cameraPosition = tweened(
		{ x: -7, y: 7, z: 7 },
		{
			duration: 5000,
			easing: cubicOut
		}
	);

	$: if (controls) {
		centerOnISS.set(() => {
			const [x, y, z] = cameraIssPosition;
			cameraPosition.set(
				{
					x: controls.object.position.x,
					y: controls.object.position.y,
					z: controls.object.position.z
				},
				{ duration: 0 }
			);

			cameraPosition.set({ x, y, z }, { duration: 3000 }).then(() => {
				rotateISS();
			});
		});
	}

	$: if (controls) {
		controls.object.position.set($cameraPosition.x, $cameraPosition.y, $cameraPosition.z);
		controls.update();
	}

	const issRotation = tweened(
		{ x: 0, y: 0, z: 0 },
		{
			duration: 6000,
			easing: elasticInOut
		}
	);

	let totalRotation = 0;

	function rotateISS() {
		totalRotation += Math.PI * 2;
		issRotation.set({
			x: 0,
			y: totalRotation,
			z: 0
		});
	}

	const loadingRotation = tweened(0, {
		duration: 2000,
		easing: elasticOut
	});

	function rotateLoading() {
		loadingRotation.set($loadingRotation + Math.PI * 2).then(() => {
			rotateLoading();
		});
	}

	const lightIntensity = tweened(0.8, {
		duration: 2000,
		easing: cubicOut
	});

	function blinkLight() {
		lightIntensity
			.set(0.2)
			.then(() => lightIntensity.set(0.8))
			.then(() => blinkLight());
	}

	onMount(() => {
		rotateLoading();
		blinkLight();
	});

	onDestroy(() => {
		loadingRotation.set($loadingRotation);
		lightIntensity.set(0.8);
	});
</script>

<Environment path="/" files="8k_stars_milky_way.jpg" isBackground={true} />

<Stars factor={6} speed={1} radius={50} />

<T.AmbientLight intensity={0.2} />
<T.DirectionalLight intensity={1.5} position={[10, 10, 10]} castShadow />

<T.PerspectiveCamera
	makeDefault
	position={[$cameraPosition.x, $cameraPosition.y, $cameraPosition.z]}
	fov={45}
>
	<TrackballControls
		bind:ref={controls}
		noZoom={false}
		noPan={true}
		dynamicDampingFactor={0.05}
		minDistance={3}
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
		opacity={0.2}
		depthWrite={false}
		emissive={new Color(0xffffff)}
		emissiveIntensity={0.01}
	/>
</T.Mesh>

<T.Mesh>
	<T.SphereGeometry args={[2.1, 32, 32]} />
	<T.MeshPhongMaterial color={new Color(0x0077ff)} transparent={true} opacity={0.1} side={2} />
</T.Mesh>

{#if $tweenedLatitude !== null && $tweenedLongitude !== null}
	<T.Group position={issPosition}>
		{#await useGltf('/compressed_medium_ISS_stationary.glb')}
			<T.Group
				rotation={[
					-(($tweenedLatitude * Math.PI) / 180) + $issRotation.x,
					($tweenedLongitude * Math.PI) / 180 + Math.PI / 2 + $issRotation.y,
					Math.PI / 2 + $issRotation.z
				]}
			>
				<T.Mesh scale={0.1} rotation.z={$loadingRotation}>
					<T.TorusGeometry args={[1, 0.1, 16, 32, Math.PI * 1.5]} />
					<T.MeshBasicMaterial color={new Color(0xffffff)} opacity={0.5} transparent />
				</T.Mesh>
			</T.Group>
		{:then gltf}
			<T
				scale={0.002}
				is={gltf.scene}
				rotation={[
					-(($tweenedLatitude * Math.PI) / 180) + $issRotation.x,
					($tweenedLongitude * Math.PI) / 180 + Math.PI / 2 + $issRotation.y,
					Math.PI / 2 + $issRotation.z
				]}
			>
				<T.PointLight
					intensity={$lightIntensity}
					distance={0.5}
					decay={2}
					color={new Color(0xffcccc)}
				/>
				<T.PointLight
					intensity={$lightIntensity}
					distance={0.5}
					decay={2}
					position={[0, 0, 15]}
					color={new Color(0xffcccc)}
				/>
			</T>
		{/await}
	</T.Group>
{/if}
