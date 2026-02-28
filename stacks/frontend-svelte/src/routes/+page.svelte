<script lang="ts">
    import { onMount } from 'svelte';

    interface HelloResponse {
        message: string;
        lang: string;
        version: string;
    }

    interface HealthResponse {
        status: string;
        timestamp: string;
        db_connected: boolean;
    }

    let hello: HelloResponse | null = $state(null);
    let health: HealthResponse | null = $state(null);
    let error: string | null = $state(null);

    onMount(async () => {
        try {
            const res = await fetch('/api/hello');
            hello = await res.json();
        } catch {
            error = 'Failed to connect to backend';
        }
        try {
            const res = await fetch('/health');
            health = await res.json();
        } catch {}
    });
</script>

<main>
    <h1>Brewnet</h1>
    {#if error}
        <p class="error">{error}</p>
    {/if}
    {#if hello}
        <p class="hello">
            {hello.message} ({hello.lang} {hello.version})
        </p>
    {/if}
    {#if health}
        <p>DB: {health.db_connected ? 'Connected' : 'Disconnected'}</p>
    {/if}
    {#if !hello && !error}
        <p>Loading...</p>
    {/if}
</main>

<style>
    main {
        font-family: system-ui, sans-serif;
        max-width: 600px;
        margin: 0 auto;
        padding: 2rem;
        text-align: center;
    }
    h1 { font-size: 2.5rem; }
    .hello { font-size: 1.25rem; }
    .error { color: red; }
</style>
