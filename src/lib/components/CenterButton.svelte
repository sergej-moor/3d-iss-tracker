<script>
	import { centerOnISS } from '$lib/stores/controls';
</script>

<button
	on:click={() => $centerOnISS()}
	style="
         position: fixed; 
         bottom: 20px; 
         right: 20px; 
         background: rgba(0,0,0,0.7); 
         color: white; 
         border: none; 
         padding: 10px 20px; 
         border-radius: 5px; 
         cursor: pointer;
         font-family: 'Arial', sans-serif;
         backdrop-filter: blur(5px);
         transition: background 0.3s;"
	on:mouseenter={(e) => (e.target.style.background = 'rgba(20,20,20,0.8)')}
	on:mouseleave={(e) => (e.target.style.background = 'rgba(0,0,0,0.7)')}
>
	Where is the ISS?
</button>
