<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="flex px-32 py-4 justify-start bg-secondary">
	<div>
		{@render children?.()}
	</div>
</div>
