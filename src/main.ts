import { createApp } from 'vue'

// Create a temporary minimal app to test the build system
const App = {
  name: 'App',
  template: `
    <div id="app">
      <h1>Network Simulator - TypeScript Migration</h1>
      <p>Phase 1: Build System Foundation - Dev server running</p>
    </div>
  `
}

// Mount the app
const app = createApp(App)
app.mount('#app')
