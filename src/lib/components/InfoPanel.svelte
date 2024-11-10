<script>
	import { tweenedLatitude, tweenedLongitude } from '$lib/stores/iss';
</script>

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
