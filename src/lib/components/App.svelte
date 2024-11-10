<script>
	import { Canvas } from '@threlte/core';
	import Scene from './Scene.svelte';
	import InfoPanel from './InfoPanel.svelte';
	import { issStore } from '$lib/stores/iss';
	import { onMount, onDestroy } from 'svelte';

	onMount(() => {
		issStore.startTracking();
	});

	onDestroy(() => {
		issStore.stopTracking();
	});
</script>

<Canvas>
	<Scene />
</Canvas>
<InfoPanel />
