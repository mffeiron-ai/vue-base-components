<script setup lang="ts">
/**
 * AsciiText 文档页（路由 /motion/ascii-text）
 * 移植自 React Bits 的 AsciiText（MIT）：上游是 three.js + 自制 AsciiFilter，这里用 CPU 软件光栅化复刻。
 */
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { AsciiText, DEFAULT_CHARSET } from '@/components/motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'

const TEXT_PRESETS = [
  { label: 'David!（上游默认）', value: 'David!' },
  { label: 'Hey!（上游示例）', value: 'Hey!' },
  { label: 'React Bits', value: 'React Bits' },
  { label: 'ASCII', value: 'ASCII' },
  { label: '你好，世界', value: '你好，世界' },
]

const CHARSET_PRESETS = [
  { label: '上游默认（70 级）', value: DEFAULT_CHARSET },
  { label: '经典 10 级', value: ' .:-=+*#%@' },
  { label: '方块 ░▒▓█', value: ' ░▒▓█' },
  { label: '点阵 .·•●', value: ' .·•●' },
  { label: '竖条 ▁▂▃▄▅', value: ' ▁▂▃▄▅' },
]

const COLOR_PRESETS = [
  { label: '上游 #fdf9f3', value: '#fdf9f3' },
  { label: '纯白', value: '#ffffff' },
  { label: '主题前景', value: '--color-foreground' },
  { label: '主题主色', value: '--color-primary' },
]

/** 示例容器底色：这个效果的世界是「暗底亮字」，底色直接决定观感与是否自动反色 */
const SURFACES = [
  { label: '深色底', value: 'dark', cls: 'bg-neutral-950' },
  { label: '浅色底', value: 'light', cls: 'bg-white' },
  { label: '跟随页面', value: 'page', cls: 'bg-background' },
]

const ascii = reactive({
  textLabel: TEXT_PRESETS[0].label,
  text: TEXT_PRESETS[0].value,
  surface: 'dark',
  charsetLabel: CHARSET_PRESETS[0].label,
  charset: CHARSET_PRESETS[0].value,
  colorLabel: COLOR_PRESETS[0].label,
  textColor: COLOR_PRESETS[0].value,
  asciiFontSize: 8,
  textFontSize: 200,
  planeBaseHeight: 8,
  enableWaves: true,
  followMouse: true,
  hueShift: true,
  invert: true,
  rainbow: true,
  invertOnLight: true,
})

function pickText(item: (typeof TEXT_PRESETS)[number]) {
  ascii.textLabel = item.label
  ascii.text = item.value
}

function pickCharset(item: (typeof CHARSET_PRESETS)[number]) {
  ascii.charsetLabel = item.label
  ascii.charset = item.value
}

function pickColor(item: (typeof COLOR_PRESETS)[number]) {
  ascii.colorLabel = item.label
  ascii.textColor = item.value
}

const surfaceClass = computed(
  () => SURFACES.find((s) => s.value === ascii.surface)?.cls ?? 'bg-neutral-950',
)

/** 底色变了要重新读背景亮度（组件拿不到「外层容器换色」这件事）；
 *  这里等过渡动画走完再读，否则读到的还是渐变中间的那个颜色 */
async function pickSurface(item: (typeof SURFACES)[number]) {
  ascii.surface = item.value
  await nextTick()
  window.setTimeout(() => compRef.value?.refreshBackground?.(), 420)
}

function onSlider(
  key: 'asciiFontSize' | 'textFontSize' | 'planeBaseHeight',
  value: number[] | undefined,
) {
  const v = value?.[0]
  if (typeof v === 'number') ascii[key] = v
}

function resetAll() {
  ascii.surface = 'dark'
  ascii.asciiFontSize = 8
  ascii.textFontSize = 200
  ascii.planeBaseHeight = 8
  ascii.enableWaves = true
  ascii.followMouse = true
  ascii.hueShift = true
  ascii.invert = true
  ascii.rainbow = true
  ascii.invertOnLight = true
  ascii.charsetLabel = CHARSET_PRESETS[0].label
  ascii.charset = CHARSET_PRESETS[0].value
  ascii.colorLabel = COLOR_PRESETS[0].label
  ascii.textColor = COLOR_PRESETS[0].value
}

/* ── 读数（组件暴露的 stats） ──────────────────────────── */

interface Stats {
  cols: number
  rows: number
  cells: number
  cost: number
  hue: number
  rotationX: number
  rotationY: number
  reducedMotion: boolean
  lightBackground: boolean
}

const compRef = ref<{
  stats?: () => Stats
  refreshBackground?: () => void
} | null>(null)
const stats = ref<Stats | null>(null)
let timer = 0

function syncStats() {
  stats.value = compRef.value?.stats?.() ?? null
}

onMounted(() => {
  timer = window.setInterval(syncStats, 250)
})

onBeforeUnmount(() => {
  window.clearInterval(timer)
})

const usageSnippet = computed(
  () => `<!-- 父容器需要有尺寸（组件是 absolute inset-0 铺满它的） -->
<div class="relative h-[420px]">
  <AsciiText
    text="${ascii.text}"
    :ascii-font-size="${ascii.asciiFontSize}"
    :text-font-size="${ascii.textFontSize}"
    :plane-base-height="${ascii.planeBaseHeight}"
    :enable-waves="${ascii.enableWaves}"
    :follow-mouse="${ascii.followMouse}"
    text-color="${ascii.textColor}"
  />
</div>`,
)

const PROPS = [
  { name: 'text', type: 'string', def: "'David!'", desc: '要显示的文字（画到平面纹理上，字号由 textFontSize 决定）' },
  { name: 'asciiFontSize', type: 'number', def: '8', desc: '一个 ASCII 字符占多少像素；越小越细，但格子数按平方增长' },
  { name: 'textFontSize', type: 'number', def: '200', desc: '画进纹理的字号（像素），决定平面的宽高比' },
  { name: 'textColor', type: 'string', def: "'#fdf9f3'", desc: '纹理里文字的颜色（上游写死这个近白色）。它**不是界面色**：亮度决定用多「密」的字符，也支持传 `--color-*` 跟随主题' },
  { name: 'planeBaseHeight', type: 'number', def: '8', desc: '平面在 3D 里的高度，宽度按文字宽高比自动算' },
  { name: 'enableWaves', type: 'boolean', def: 'true', desc: '波浪形变开关（顶点着色器那段正弦位移）' },
  { name: 'followMouse', type: 'boolean', def: 'true', desc: '鼠标在容器里移动时，平面跟着倾斜（阻尼 0.05）' },
  { name: 'hueShift', type: 'boolean', def: 'true', desc: '色相随鼠标角度旋转（绕容器中心算极角）' },
  { name: 'invert', type: 'boolean', def: 'true', desc: '字符表反转：亮的地方用「密」字符（上游 `invert: true`）' },
  { name: 'charset', type: 'string', def: '上游 70 级字符表', desc: '字符表，按「疏 → 密」排' },
  { name: 'rainbow', type: 'boolean', def: 'true', desc: 'ASCII 字符用渐变填充；关掉就用 textColor 单色' },
  { name: 'rainbowColors', type: 'string[]', def: "['#ff6188','#fc9867','#ffd866']", desc: '渐变三色（上游固定粉→橙→黄）' },
  { name: 'invertOnLight', type: 'boolean', def: 'true', desc: '浅色背景时给容器整体加 `invert(1)`（上游用 `data-theme=light` 选择器，这里从组件往上找第一个不透明背景算亮度）' },
  { name: 'fontFamily', type: 'string', def: '一栈等宽字体', desc: '等宽字体；上游远程加载 IBM Plex Mono，这里不联网' },
  { name: 'paused', type: 'boolean', def: 'false', desc: '暂停渲染（画面停在当前帧）' },
]

const EXPOSED = [
  { name: 'renderOnce()', desc: '立刻渲染一帧并返回 { cols, rows, text, pixels }（探针 / 手动驱动）' },
  { name: 'stats()', desc: '读数：格子数、单帧耗时、色相、倾斜角、是否减少动效 / 浅色背景' },
  { name: 'refreshBackground()', desc: '重新读一次背景亮度（外层容器换了底色之后调）' },
]
</script>

<template>
  <div class="mx-auto max-w-5xl px-6 py-10">
    <h1 class="text-3xl font-bold tracking-tight">ASCII 文字 AsciiText</h1>
    <p class="mt-3 text-muted-foreground">
      一段 3D 文字被拆成 <strong>ASCII 字符</strong>铺满整块：平面会缓慢<strong>呼吸</strong>（顶点正弦位移），
      鼠标一动，整块文字跟着<strong>倾斜</strong>、画面<strong>色相</strong>绕着鼠标角度转。
      <strong>移植自 React Bits</strong>（MIT，源头是 JuanFuentes 的 codepen）：上游是 three.js 渲染 + 自制 AsciiFilter，
      这里<strong>不引 three / WebGL</strong>，把「渲染 + 缩小 + 取像素」换成 CPU 软件光栅化（投影与波浪公式与上游着色器一致）。
      <strong>把鼠标移到下面的框里</strong>试试。
    </p>

    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">示例</h2>
        <CardDescription>
          字符网格 <span class="font-mono">{{ stats?.cols ?? 0 }} × {{ stats?.rows ?? 0 }}</span>
          （<span class="font-mono">{{ stats?.cells ?? 0 }}</span> 格）
          · 单帧 <span class="font-mono">{{ (stats?.cost ?? 0).toFixed(1) }}ms</span>
          · 色相 <span class="font-mono">{{ (stats?.hue ?? 0).toFixed(0) }}°</span>
          · 倾斜 <span class="font-mono">{{ (stats?.rotationX ?? 0).toFixed(2) }}, {{ (stats?.rotationY ?? 0).toFixed(2) }}</span>
          · 背景<span class="font-mono">{{ stats?.lightBackground ? '浅色（自动反色）' : '深色' }}</span>
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-6">
        <div class="relative h-[420px] overflow-hidden rounded-xl border border-border transition-colors" :class="surfaceClass">
          <AsciiText
            ref="compRef"
            :text="ascii.text"
            :ascii-font-size="ascii.asciiFontSize"
            :text-font-size="ascii.textFontSize"
            :text-color="ascii.textColor"
            :plane-base-height="ascii.planeBaseHeight"
            :enable-waves="ascii.enableWaves"
            :follow-mouse="ascii.followMouse"
            :hue-shift="ascii.hueShift"
            :invert="ascii.invert"
            :charset="ascii.charset"
            :rainbow="ascii.rainbow"
            :invert-on-light="ascii.invertOnLight"
          />
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <span class="text-xs text-muted-foreground">示例容器底色：</span>
          <Button
            v-for="s in SURFACES"
            :key="s.value"
            :variant="ascii.surface === s.value ? 'default' : 'outline'"
            size="sm"
            @click="pickSurface(s)"
          >{{ s.label }}</Button>
          <Button variant="outline" size="sm" @click="resetAll">重置参数</Button>
        </div>

        <p class="text-xs text-muted-foreground">
          鼠标进到框里会驱动倾斜与色相；开「减少动效」的系统里会冻结成静态 ASCII 图。
          这个效果的「世界观」是<strong>暗底亮字</strong>：文字色亮 → 笔画处用「密」字符 → 看着实心；
          换成浅色底时组件会扫到亮背景并自动加 <code>invert(1)</code>（上游靠 <code>data-theme</code> 选择器，这里靠背景亮度），
          但<strong>字符的疏密只由文字色决定</strong> —— 浅色主题下如果想保持实心，把文字色传成亮色即可。
        </p>

        <div class="grid gap-5 sm:grid-cols-2">
          <div class="space-y-2">
            <p class="text-sm font-semibold">文案</p>
            <div class="flex flex-wrap gap-2">
              <Button
                v-for="t in TEXT_PRESETS"
                :key="t.label"
                :variant="ascii.textLabel === t.label ? 'default' : 'outline'"
                size="sm"
                @click="pickText(t)"
              >{{ t.label }}</Button>
            </div>
          </div>

          <div class="space-y-2">
            <p class="text-sm font-semibold">字符表（<code>charset</code>）</p>
            <div class="flex flex-wrap gap-2">
              <Button
                v-for="c in CHARSET_PRESETS"
                :key="c.label"
                :variant="ascii.charsetLabel === c.label ? 'default' : 'outline'"
                size="sm"
                @click="pickCharset(c)"
              >{{ c.label }}</Button>
            </div>
          </div>

          <div class="space-y-2">
            <p class="text-sm font-semibold">文字颜色（<code>textColor</code>）</p>
            <div class="flex flex-wrap gap-2">
              <Button
                v-for="c in COLOR_PRESETS"
                :key="c.label"
                :variant="ascii.colorLabel === c.label ? 'default' : 'outline'"
                size="sm"
                @click="pickColor(c)"
              >{{ c.label }}</Button>
            </div>
            <p class="text-xs text-muted-foreground">
              颜色只影响纹理亮度 → <strong>间接决定用多「密」的字符</strong>（越亮越密）
            </p>
          </div>

          <div class="space-y-2">
            <p class="text-sm font-semibold">开关</p>
            <div class="flex flex-wrap gap-2">
              <Button
                :variant="ascii.enableWaves ? 'default' : 'outline'"
                size="sm"
                @click="ascii.enableWaves = !ascii.enableWaves"
              >enableWaves</Button>
              <Button
                :variant="ascii.followMouse ? 'default' : 'outline'"
                size="sm"
                @click="ascii.followMouse = !ascii.followMouse"
              >followMouse</Button>
              <Button
                :variant="ascii.hueShift ? 'default' : 'outline'"
                size="sm"
                @click="ascii.hueShift = !ascii.hueShift"
              >hueShift</Button>
              <Button
                :variant="ascii.invert ? 'default' : 'outline'"
                size="sm"
                @click="ascii.invert = !ascii.invert"
              >invert</Button>
              <Button
                :variant="ascii.rainbow ? 'default' : 'outline'"
                size="sm"
                @click="ascii.rainbow = !ascii.rainbow"
              >rainbow</Button>
              <Button
                :variant="ascii.invertOnLight ? 'default' : 'outline'"
                size="sm"
                @click="ascii.invertOnLight = !ascii.invertOnLight"
              >invertOnLight</Button>
            </div>
          </div>
        </div>

        <div class="space-y-4 rounded-lg border border-border p-4">
          <p class="text-sm font-semibold">参数</p>
          <div class="grid gap-4 sm:grid-cols-3">
            <div class="space-y-1.5">
              <div class="flex items-baseline justify-between">
                <span class="text-xs text-muted-foreground">字符大小</span>
                <span class="text-xs font-medium tabular-nums">{{ ascii.asciiFontSize }}px</span>
              </div>
              <Slider
                :model-value="[ascii.asciiFontSize]"
                :min="4"
                :max="16"
                :step="1"
                @update:model-value="v => onSlider('asciiFontSize', v)"
              />
            </div>

            <div class="space-y-1.5">
              <div class="flex items-baseline justify-between">
                <span class="text-xs text-muted-foreground">纹理字号</span>
                <span class="text-xs font-medium tabular-nums">{{ ascii.textFontSize }}px</span>
              </div>
              <Slider
                :model-value="[ascii.textFontSize]"
                :min="80"
                :max="360"
                :step="10"
                @update:model-value="v => onSlider('textFontSize', v)"
              />
            </div>

            <div class="space-y-1.5">
              <div class="flex items-baseline justify-between">
                <span class="text-xs text-muted-foreground">平面高度</span>
                <span class="text-xs font-medium tabular-nums">{{ ascii.planeBaseHeight.toFixed(1) }}</span>
              </div>
              <Slider
                :model-value="[ascii.planeBaseHeight]"
                :min="3"
                :max="16"
                :step="0.5"
                @update:model-value="v => onSlider('planeBaseHeight', v)"
              />
            </div>
          </div>
          <p class="text-xs text-muted-foreground">
            「字符大小」是<strong>开销旋钮</strong>：格子数 = <code>(框宽 / 字符宽) × (框高 / 字符大小)</code>，
            所以字号减半 = 采样点翻四倍（单帧耗时读数就在上面）。
            「纹理字号」只决定平面的宽高比与笔画粗细，几乎不影响性能。
          </p>
        </div>

        <div class="space-y-2">
          <p class="text-sm font-semibold">用法</p>
          <pre class="overflow-x-auto rounded-lg bg-muted p-3 text-xs leading-relaxed"><code>{{ usageSnippet }}</code></pre>
        </div>

        <div class="space-y-2">
          <p class="text-sm font-semibold">实现上的注意点</p>
          <ul class="list-disc space-y-1 pl-5 text-xs text-muted-foreground">
            <li><strong>上游是 three.js：</strong><code>PerspectiveCamera(45°, aspect, 1, 1000)</code> 放在 <code>z = 30</code>，
              文字纹理贴到 <code>PlaneGeometry(planeW, planeH, 36, 36)</code>（平面高就是 <code>planeBaseHeight</code>，宽按文字宽高比推），
              顶点着色器做波浪，再用自制 <code>AsciiFilter</code> 把 WebGL 输出缩到「一格一字符」逐像素查表。</li>
            <li><strong>这里怎么替代的：</strong>顶点变换（波浪 → 旋转 → 透视投影）逐顶点算在 JS 里，然后<strong>逐四边形拆两个三角形</strong>，
              用重心坐标插值 uv 去采样文字纹理，直接写进 <code>cols × rows</code> 的像素缓冲 —— 每格正好一个 ASCII 字符。
              等价于「自己写了个只有 1296 个四边形的软光栅器」，还带一个格子级 z-buffer。</li>
            <li><strong>波浪公式（照抄 shader）：</strong><code>t = uTime × 5</code>、
              <code>x += sin(t + y) × 0.5 × waves</code>、<code>y += cos(t + z) × 0.15 × waves</code>、<code>z += sin(t + x) × waves</code>；
              平面 <code>z</code> 恒为 0，所以第二项的 <code>cos(t + z)</code> 退化成 <code>cos(t)</code>。</li>
            <li><strong>uTime 不是时间，是 <code>sin(时间)</code>：</strong>上游喂的是 <code>Math.sin(unix 秒)</code> ∈ [−1, 1]，
              所以波浪是<strong>慢速往复</strong>而不是越滚越快。</li>
            <li><strong>旋转是 <code>Rx · Ry</code></strong>（three 的 Euler 默认 XYZ，这里 rotation.z 恒为 0）：
              鼠标位置映射成 <code>map(y, 0, 高, 0.5, −0.5)</code> / <code>map(x, 0, 宽, −0.5, 0.5)</code>，每帧 <code>+0.05</code> 阻尼追过去。</li>
            <li><strong>片元着色器有个容易看错的地方：</strong>R/G/B 三个通道各把 uv 偏移一点再采样（色差抖动），
              GLSL 里 <code>pos + float</code> 是<strong>逐分量</strong>相加 —— 所以 u、v 都偏移了同样的量，而不是只偏移 x。</li>
            <li><strong>量化：</strong>灰度 <code>0.3r + 0.6g + 0.1b</code> → <code>idx = floor((1 − gray) × (表长 − 1))</code>，
              <code>invert</code> 时再取反 → 亮的笔画用「密」字符；纹理是透明底，所以 <code>alpha === 0</code> 的格子直接输出空格。</li>
            <li><strong>输出是两层叠出来的：</strong>底层是把每格颜色画上去的<strong>低分辨率马赛克 canvas</strong>
              （CSS 放大 + <code>image-rendering: pixelated</code>），上层是 <code>&lt;pre&gt;</code> 里的 ASCII 字符，
              用彩虹渐变 <code>background-clip: text</code> 上色、再配 <code>mix-blend-mode: difference</code> 压在底图上。缺一层都不像。</li>
            <li>ASCII 文本每帧只改<strong>文本节点的值</strong>（不是 <code>innerHTML</code>，也不是 <code>textContent</code> 重建），
              一万多格的字符串这样更新最省。</li>
            <li><code>textColor</code> 默认就是上游那个近白色 <code>#fdf9f3</code> —— 它<strong>不是界面色</strong>：
              纹理里笔画越亮，灰度越高，量化后就落到字符表越靠后的「密」字符上，所以<strong>颜色直接决定文字的实心程度</strong>。
              想跟随主题可以传 <code>--color-*</code>，但浅色主题下的深色前景会让笔画变「疏」（这个效果本来的世界观是暗底亮字）。</li>
            <li><strong>背景亮度是往上扫出来的：</strong>从组件自己开始沿 DOM 往上找第一个不透明背景
              （这个站里 html/body 是透明的，颜色其实在里层容器上），亮就加 <code>invert(1)</code>。
              外壳换底色时组件不会自己知道（MutationObserver 只盯 <code>&lt;html&gt;</code> / <code>&lt;head&gt;</code>），
              示例里的底色切换就是手动调了暴露出来的 <code>refreshBackground()</code>。</li>
            <li>上游远程加载 Google Fonts 的 IBM Plex Mono —— 这里不联网，字体走 <code>fontFamily</code>（默认一栈等宽字体），
              要精确还原请自托管该字体。</li>
            <li><code>prefers-reduced-motion: reduce</code> 时冻结时间、不跟随鼠标，仍然渲染成一张静态 ASCII（不丢画面）。</li>
            <li>容器尺寸为 0（比如在折叠面板里）时会等 <code>ResizeObserver</code> 报到尺寸再初始化，
              字体则等 <code>document.fonts.ready</code>（字宽会影响 <code>cols</code>）。</li>
          </ul>
        </div>
      </CardContent>
    </Card>

    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">API</h2>
        <CardDescription><code>import { AsciiText } from '@/components/motion'</code></CardDescription>
      </CardHeader>
      <CardContent class="space-y-6">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b text-left">
                <th class="py-2 pr-4 font-medium">属性</th>
                <th class="py-2 pr-4 font-medium">类型</th>
                <th class="py-2 pr-4 font-medium">默认值</th>
                <th class="py-2 font-medium">说明</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in PROPS" :key="p.name" class="border-b">
                <td class="py-2 pr-4 align-top"><code>{{ p.name }}</code></td>
                <td class="py-2 pr-4 align-top text-muted-foreground">{{ p.type }}</td>
                <td class="py-2 pr-4 align-top text-muted-foreground">{{ p.def }}</td>
                <td class="py-2 align-top text-muted-foreground">{{ p.desc }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div>
          <p class="text-sm font-semibold">暴露的方法</p>
          <div class="mt-2 overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b text-left">
                  <th class="py-2 pr-4 font-medium">名称</th>
                  <th class="py-2 font-medium">说明</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="p in EXPOSED" :key="p.name" class="border-b">
                  <td class="py-2 pr-4 align-top"><code>{{ p.name }}</code></td>
                  <td class="py-2 align-top text-muted-foreground">{{ p.desc }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
