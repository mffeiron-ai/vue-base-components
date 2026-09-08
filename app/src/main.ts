import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './style.css'

// 默认启用组件库 vega 主题切面（与 docs 一致）
document.documentElement.classList.add('style-vega')

createApp(App).use(router).mount('#app')
