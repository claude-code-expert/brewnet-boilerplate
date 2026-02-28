<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface HelloResponse {
    message: string
    lang: string
    version: string
}

interface HealthResponse {
    status: string
    timestamp: string
    db_connected: boolean
}

const hello = ref<HelloResponse | null>(null)
const health = ref<HealthResponse | null>(null)
const error = ref<string | null>(null)

onMounted(async () => {
    try {
        const res = await fetch('/api/hello')
        hello.value = await res.json()
    } catch {
        error.value = 'Failed to connect to backend'
    }
    try {
        const res = await fetch('/health')
        health.value = await res.json()
    } catch {}
})
</script>

<template>
    <main>
        <h1>Brewnet</h1>
        <p v-if="error" class="error">{{ error }}</p>
        <p v-if="hello" class="hello">
            {{ hello.message }} ({{ hello.lang }} {{ hello.version }})
        </p>
        <p v-if="health">
            DB: {{ health.db_connected ? 'Connected' : 'Disconnected' }}
        </p>
        <p v-if="!hello && !error">Loading...</p>
    </main>
</template>

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
