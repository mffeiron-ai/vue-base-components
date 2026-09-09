import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './style.css'
// 全局风格切面（style-* class 与圆角档位）由 lib/style.ts 统一管理

createApp(App).use(router).mount('#app')
