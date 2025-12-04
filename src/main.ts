import { createApp } from 'vue'
import App from './App.vue'
import GameData from '@/core/gameData'
import { LayoutEngine } from '@/layout/LayoutEngine'

// Initialize layout engine before mounting the app
LayoutEngine.initializeLayout(GameData)

// Create and mount the app
const app = createApp(App)
app.mount('#app')
