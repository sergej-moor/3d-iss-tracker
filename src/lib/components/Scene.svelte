<script>
	import { T } from '@threlte/core';
	import { ContactShadows, Float, Grid, OrbitControls } from '@threlte/extras';
	import { TextureLoader } from 'three';
	import { useGltf } from '@threlte/extras';
	import { Group, Vector3 } from 'three';

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

	// Example coordinates (you can make these reactive props)
	let latitude = 11.5074; // London latitude
	let longitude = -0.1278; // London longitude
	let radius = 2.5; // Slightly above Earth's surface (Earth radius is 2)

	// Calculate ISS position
	$: issPosition = latLongToVector3(latitude, longitude, radius);
</script>

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
