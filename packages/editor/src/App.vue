<script setup lang="ts">
import { ref } from 'vue'
import NodeCanvas from './components/NodeCanvas.vue';
import EditorSidebar from './components/EditorSidebar.vue';

const message = ref('Network Simulator Editor')
</script>

<template>
  <div class="editor-container">
    <header class="editor-header">
      <h1>{{ message }}</h1>
      <p class="subtitle">Visual Node Graph Editor</p>
    </header>
    <main class="editor-main">
      <EditorSidebar />
      <div class="canvas-container">
        <NodeCanvas />
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
  padding: 1.5rem 2rem;
  background: #2a2a2a;
  border-bottom: 2px solid #3a3a3a;
}

.editor-header h1 {
  margin: 0;
  font-size: 1.75rem;
  color: #4a9eff;
}

.subtitle {
  margin: 0.5rem 0 0;
  font-size: 0.9rem;
  color: #888;
}

.editor-main {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.canvas-container {
  flex: 1;
  position: relative;
  overflow: hidden;
}
</style>
