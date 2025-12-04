<script setup lang="ts">
import { ref } from 'vue'

const message = ref('Network Simulator Editor')
</script>

<template>
  <div class="editor-container">
    <header class="editor-header">
      <h1>{{ message }}</h1>
      <p class="subtitle">Story & Node Editor - Coming Soon</p>
    </header>
    <main class="editor-main">
      <div class="placeholder">
        <p>Editor interface will be implemented here</p>
        <ul class="feature-list">
          <li>Visual node editor</li>
          <li>Story narration composer</li>
          <li>Branch visualization</li>
          <li>Export/import tools</li>
        </ul>
      </div>
    </main>
  </div>
</template>

<style scoped>
.editor-container {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #1a1a1a;
  color: #e0e0e0;
  font-family: system-ui, -apple-system, sans-serif;
}

.editor-header {
  padding: 2rem;
  background: #2a2a2a;
  border-bottom: 2px solid #3a3a3a;
}

.editor-header h1 {
  margin: 0;
  font-size: 2rem;
  color: #4a9eff;
}

.subtitle {
  margin: 0.5rem 0 0;
  font-size: 1rem;
  color: #888;
}

.editor-main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.placeholder {
  text-align: center;
  max-width: 600px;
}

.placeholder p {
  font-size: 1.25rem;
  margin-bottom: 2rem;
  color: #aaa;
}

.feature-list {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.feature-list li {
  padding: 1rem;
  background: #2a2a2a;
  border-radius: 8px;
  border-left: 4px solid #4a9eff;
}
</style>
