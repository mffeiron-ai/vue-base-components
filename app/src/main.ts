import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// ── 主题与风格字体（@fontsource 自托管，仅 latin 子集）─────────────────────────
// 字体有两个来源，两边必须全部兼容：
//   1) 主题：themes.json 的 font-sans / font-serif / font-mono（共引用 51 个字体族）
//   2) 风格：`@/random-ui/config/config.ts` 里 8 套设计系统各自的 font（Inter / Figtree / JetBrains Mono）
// 这些字体必须**真正加载**，否则「切换字体」只是改写 CSS 变量，字形依旧走系统兜底
// → 看起来完全没生效（Windows 自带字体只有 Courier New / Georgia / Arial 等几个）。
// 下面按两处实际用到的族引入 400/500/600/700 四档（字体本身没有的档位自动跳过），
// 且只引 latin 子集：这些字体都不含中文，中文照旧由系统字体兜底；用 latin-*.css
// 可以避免把用不到的 cyrillic / greek / vietnamese 子集也打进产物。
// 引入 `.css` 即等于注册 @font-face，浏览器只会下载当前主题真正用到的那几个文件。
//
// 维护方式：新增字体包后跑 `node .tmp/fonts-audit.mjs` 重新生成下面的清单。

// Architects Daughter（只有 400）
import '@fontsource/architects-daughter/latin-400.css'

// DM Sans
import '@fontsource/dm-sans/latin-400.css'
import '@fontsource/dm-sans/latin-500.css'
import '@fontsource/dm-sans/latin-600.css'
import '@fontsource/dm-sans/latin-700.css'

// Figtree（Maia 设计系统用）
import '@fontsource/figtree/latin-400.css'
import '@fontsource/figtree/latin-500.css'
import '@fontsource/figtree/latin-600.css'
import '@fontsource/figtree/latin-700.css'

// Fira Code
import '@fontsource/fira-code/latin-400.css'
import '@fontsource/fira-code/latin-500.css'
import '@fontsource/fira-code/latin-600.css'
import '@fontsource/fira-code/latin-700.css'

// Geist（注意：themes.json 用的是 `Geist`，由 @fontsource/geist 提供；
// geist-sans 注册的族名是 `Geist Sans`，两者不是同一个，都需要）
import '@fontsource/geist/latin-400.css'
import '@fontsource/geist/latin-500.css'
import '@fontsource/geist/latin-600.css'
import '@fontsource/geist/latin-700.css'

// Geist Mono
import '@fontsource/geist-mono/latin-400.css'
import '@fontsource/geist-mono/latin-500.css'
import '@fontsource/geist-mono/latin-600.css'
import '@fontsource/geist-mono/latin-700.css'

// Geist Sans
import '@fontsource/geist-sans/latin-400.css'
import '@fontsource/geist-sans/latin-500.css'
import '@fontsource/geist-sans/latin-600.css'
import '@fontsource/geist-sans/latin-700.css'

// IBM Plex Mono
import '@fontsource/ibm-plex-mono/latin-400.css'
import '@fontsource/ibm-plex-mono/latin-500.css'
import '@fontsource/ibm-plex-mono/latin-600.css'
import '@fontsource/ibm-plex-mono/latin-700.css'

// Inter
import '@fontsource/inter/latin-400.css'
import '@fontsource/inter/latin-500.css'
import '@fontsource/inter/latin-600.css'
import '@fontsource/inter/latin-700.css'

// JetBrains Mono
import '@fontsource/jetbrains-mono/latin-400.css'
import '@fontsource/jetbrains-mono/latin-500.css'
import '@fontsource/jetbrains-mono/latin-600.css'
import '@fontsource/jetbrains-mono/latin-700.css'

// Libre Baskerville（只有 400 / 700）
import '@fontsource/libre-baskerville/latin-400.css'
import '@fontsource/libre-baskerville/latin-700.css'

// Lora
import '@fontsource/lora/latin-400.css'
import '@fontsource/lora/latin-500.css'
import '@fontsource/lora/latin-600.css'
import '@fontsource/lora/latin-700.css'

// Merriweather（只有 400 / 700）
import '@fontsource/merriweather/latin-400.css'
import '@fontsource/merriweather/latin-700.css'

// Montserrat
import '@fontsource/montserrat/latin-400.css'
import '@fontsource/montserrat/latin-500.css'
import '@fontsource/montserrat/latin-600.css'
import '@fontsource/montserrat/latin-700.css'

// Noto Sans
import '@fontsource/noto-sans/latin-400.css'
import '@fontsource/noto-sans/latin-500.css'
import '@fontsource/noto-sans/latin-600.css'
import '@fontsource/noto-sans/latin-700.css'

// Open Sans
import '@fontsource/open-sans/latin-400.css'
import '@fontsource/open-sans/latin-500.css'
import '@fontsource/open-sans/latin-600.css'
import '@fontsource/open-sans/latin-700.css'

// Outfit
import '@fontsource/outfit/latin-400.css'
import '@fontsource/outfit/latin-500.css'
import '@fontsource/outfit/latin-600.css'
import '@fontsource/outfit/latin-700.css'

// Oxanium
import '@fontsource/oxanium/latin-400.css'
import '@fontsource/oxanium/latin-500.css'
import '@fontsource/oxanium/latin-600.css'
import '@fontsource/oxanium/latin-700.css'

// Playfair Display
import '@fontsource/playfair-display/latin-400.css'
import '@fontsource/playfair-display/latin-500.css'
import '@fontsource/playfair-display/latin-600.css'
import '@fontsource/playfair-display/latin-700.css'

// Plus Jakarta Sans
import '@fontsource/plus-jakarta-sans/latin-400.css'
import '@fontsource/plus-jakarta-sans/latin-500.css'
import '@fontsource/plus-jakarta-sans/latin-600.css'
import '@fontsource/plus-jakarta-sans/latin-700.css'

// Poppins
import '@fontsource/poppins/latin-400.css'
import '@fontsource/poppins/latin-500.css'
import '@fontsource/poppins/latin-600.css'
import '@fontsource/poppins/latin-700.css'

// Quicksand
import '@fontsource/quicksand/latin-400.css'
import '@fontsource/quicksand/latin-500.css'
import '@fontsource/quicksand/latin-600.css'
import '@fontsource/quicksand/latin-700.css'

// Roboto（没有 600）
import '@fontsource/roboto/latin-400.css'
import '@fontsource/roboto/latin-500.css'
import '@fontsource/roboto/latin-700.css'

// Roboto Mono
import '@fontsource/roboto-mono/latin-400.css'
import '@fontsource/roboto-mono/latin-500.css'
import '@fontsource/roboto-mono/latin-600.css'
import '@fontsource/roboto-mono/latin-700.css'

// Source Code Pro
import '@fontsource/source-code-pro/latin-400.css'
import '@fontsource/source-code-pro/latin-500.css'
import '@fontsource/source-code-pro/latin-600.css'
import '@fontsource/source-code-pro/latin-700.css'

// Source Serif 4
import '@fontsource/source-serif-4/latin-400.css'
import '@fontsource/source-serif-4/latin-500.css'
import '@fontsource/source-serif-4/latin-600.css'
import '@fontsource/source-serif-4/latin-700.css'

// Space Mono（只有 400 / 700）
import '@fontsource/space-mono/latin-400.css'
import '@fontsource/space-mono/latin-700.css'

// Ubuntu Mono（只有 400 / 700）
import '@fontsource/ubuntu-mono/latin-400.css'
import '@fontsource/ubuntu-mono/latin-700.css'

import './style.css'
// 全局风格切面（style-* class 与圆角档位）由 lib/style.ts 统一管理

createApp(App).use(router).mount('#app')
