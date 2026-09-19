<script setup lang="ts">
/**
 * ScrambledText 文档页（路由 /motion/scrambled-text）
 * 移植自 React Bits 的 Scrambled Text（MIT）：上游用 gsap SplitText + ScrambleTextPlugin，这里自己算乱码进度。
 */
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { ScrambledText } from '@/components/motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'

const TEXT_PRESETS = [
  {
    label: '上游示例',
    value:
      'Once you hover over me, you will see the effect in action! You can customize the radius, duration, and speed of the scramble effect.',
  },
  { label: '短句', value: 'Scrambled Text · 乱码文字' },
  { label: '中英混排', value: '鼠标扫过的地方，字符会先炸成乱码，再一个个变回来。' },
  { label: '纯中文', value: '把鼠标移进这段文字里扫一下，看看会发生什么。' },
]

const CHARS_PRESETS = [
  { label: '上游 .:', value: '.:' },
  { label: '符号', value: '!<>-_\\/[]{}—=+*^?#' },
  { label: '二进制', value: '01' },
  { label: '方块', value: '█▓▒░' },
  { label: '数字', value: '0123456789' },
]

const scramble = reactive({
  textLabel: TEXT_PRESETS[0].label,
  text: TEXT_PRESETS[0].value,
  charsLabel: CHARS_PRESETS[0].label,
  scrambleChars: CHARS_PRESETS[0].value,
  radius: 100,
  duration: 1.2,
  speed: 0.5,
})

function pickText(item: (typeof TEXT_PRESETS)[number]) {
  scramble.textLabel = item.label
  scramble.text = item.value
}

function pickChars(item: (typeof CHARS_PRESETS)[number]) {
  scramble.charsLabel = item.label
  scramble.scrambleChars = item.value
}

function onSlider(key: 'radius' | 'duration' | 'speed', value: number[] | undefined) {
  const v = value?.[0]
  if (typeof v === 'number') scramble[key] = v
}

function resetAll() {
  scramble.radius = 100
  scramble.duration = 1.2
  scramble.speed = 0.5
  scramble.charsLabel = CHARS_PRESETS[0].label
  scramble.scrambleChars = CHARS_PRESETS[0].value
}

/* ── 读数 + 手动触发 ──────────────────────────────────── */

interface Stats {
  chars: number
  scrambling: number
  texts: string[]
}

const compRef = ref<{
  scramble?: (index?: number, ms?: number) => number
  stats?: () => Stats
} | null>(null)

const stats = ref<Stats | null>(null)
let timer = 0

function syncStats() {
  stats.value = compRef.value?.stats?.() ?? null
}

function burstAll() {
  compRef.value?.scramble?.(undefined, 700)
  syncStats()
}

onMounted(() => {
  timer = window.setInterval(syncStats, 120)
})

onBeforeUnmount(() => {
  window.clearInterval(timer)
})

const usageSnippet = computed(
  () => `<ScrambledText
  text="${scramble.text.slice(0, 30)}${scramble.text.length > 30 ? '…' : ''}"
  :radius="${scramble.radius}"
  :duration="${scramble.duration}"
  :speed="${scramble.speed}"
  scramble-chars="${scramble.scrambleChars}"
/>`,
)

const PROPS = [
  { name: 'text', type: 'string', def: "''", desc: '要展示的文字；逐字符拆开（中日韩天然逐字）。也可以用默认插槽，但插槽内容不拆' },
  { name: 'radius', type: 'number', def: '100', desc: '影响半径（px）：字符中心离指针多近才会被「炸」' },
  { name: 'duration', type: 'number', def: '1.2', desc: '乱码时长（秒）；实际时长 = 本值 × (1 − 距离/半径)，越近乱得越久' },
  { name: 'speed', type: 'number', def: '0.5', desc: '乱码刷新速度，越大闪得越快（对应 GSAP 的 `speed`；内部换算成 `0.05 / speed` 秒换一次字符）' },
  { name: 'scrambleChars', type: 'string', def: "': '.:''", desc: '拿来做乱码的字符（对每个字符独立随机）' },
  { name: 'containerClassName', type: 'string', def: "''", desc: '外层类名（Vue 里直接写 class 也会透传到根元素）' },
  { name: 'textClassName', type: 'string', def: "''", desc: '文字层类名' },
]

const EXPOSED = [
  { name: 'scramble(index?, ms?)', desc: '手动让若干字符「炸」一下；不传 index 就是整段（返回命中的字符数）' },
  { name: 'stats()', desc: '读数：{ chars, scrambling, texts }（总字符数 / 正在乱码的字符数 / 每个字符当前文本）' },
]
</script>

<template>
  <div class="mx-auto max-w-5xl px-6 py-10">
    <h1 class="text-3xl font-bold tracking-tight">乱码文字 ScrambledText</h1>
    <p class="mt-3 text-muted-foreground">
      鼠标扫过的地方，字符会<strong>炸成随机字符</strong>，再一个个<strong>变回来</strong> ——
      离指针越近乱得越久，边缘几乎是瞬间恢复。
      <strong>移植自 React Bits</strong>（MIT）：原版用 gsap 的 SplitText + ScrambleTextPlugin，
      这里自己实现「逐字拆 + 每帧算进度 + 按规则写文本节点」，零依赖。
      <strong>把鼠标移进下面的文字里扫一扫</strong>。
    </p>

    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">示例</h2>
        <!-- 读数每 120ms 变一次，这里锁个高度：数字位数变化会让行数跳变（CLS），看着别扭 -->
        <CardDescription class="min-h-[3.5rem]">
          正在乱码 <span class="font-mono">{{ stats?.scrambling ?? 0 }}</span> /
          <span class="font-mono">{{ stats?.chars ?? 0 }}</span> 个字符
          · 半径 <span class="font-mono">{{ scramble.radius }}</span>px
          · 乱码字符 <span class="font-mono">{{ scramble.scrambleChars }}</span>
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-6">
        <div class="relative flex min-h-[320px] items-center rounded-xl border border-border bg-muted/40 p-8">
          <ScrambledText
            ref="compRef"
            :text="scramble.text"
            :radius="scramble.radius"
            :duration="scramble.duration"
            :speed="scramble.speed"
            :scramble-chars="scramble.scrambleChars"
          />
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" @click="burstAll">整段炸一次</Button>
          <Button variant="outline" size="sm" @click="resetAll">重置参数</Button>
          <span class="text-xs text-muted-foreground">
            鼠标扫过才有乱码（触屏 / 手写笔走 <code>pointermove</code> 一样有效）；
            开「减少动效」的系统里完全不参与，文字保持原样
          </span>
        </div>

        <div class="grid gap-5 sm:grid-cols-2">
          <div class="space-y-2">
            <p class="text-sm font-semibold">文案</p>
            <div class="flex flex-wrap gap-2">
              <Button
                v-for="t in TEXT_PRESETS"
                :key="t.label"
                :variant="scramble.textLabel === t.label ? 'default' : 'outline'"
                size="sm"
                @click="pickText(t)"
              >{{ t.label }}</Button>
            </div>
          </div>

          <div class="space-y-2">
            <p class="text-sm font-semibold">乱码字符（<code>scrambleChars</code>）</p>
            <div class="flex flex-wrap gap-2">
              <Button
                v-for="c in CHARS_PRESETS"
                :key="c.label"
                :variant="scramble.charsLabel === c.label ? 'default' : 'outline'"
                size="sm"
                @click="pickChars(c)"
              >{{ c.label }}</Button>
            </div>
          </div>
        </div>

        <div class="space-y-4 rounded-lg border border-border p-4">
          <p class="text-sm font-semibold">参数</p>
          <div class="grid gap-4 sm:grid-cols-3">
            <div class="space-y-1.5">
              <div class="flex items-baseline justify-between">
                <span class="text-xs text-muted-foreground">半径</span>
                <span class="text-xs font-medium tabular-nums">{{ scramble.radius }}px</span>
              </div>
              <Slider
                :model-value="[scramble.radius]"
                :min="10"
                :max="300"
                :step="10"
                @update:model-value="v => onSlider('radius', v)"
              />
            </div>

            <div class="space-y-1.5">
              <div class="flex items-baseline justify-between">
                <span class="text-xs text-muted-foreground">时长</span>
                <span class="text-xs font-medium tabular-nums">{{ scramble.duration.toFixed(1) }}s</span>
              </div>
              <Slider
                :model-value="[scramble.duration]"
                :min="0.1"
                :max="5"
                :step="0.1"
                @update:model-value="v => onSlider('duration', v)"
              />
            </div>

            <div class="space-y-1.5">
              <div class="flex items-baseline justify-between">
                <span class="text-xs text-muted-foreground">刷新速度</span>
                <span class="text-xs font-medium tabular-nums">{{ scramble.speed.toFixed(1) }}</span>
              </div>
              <Slider
                :model-value="[scramble.speed]"
                :min="0.1"
                :max="2"
                :step="0.1"
                @update:model-value="v => onSlider('speed', v)"
              />
            </div>
          </div>
          <p class="text-xs text-muted-foreground">
            三个参数的分工：<code>radius</code> 决定「多大的范围会被扰动」，
            <code>duration</code> 决定「扰动多久」（近处久、边缘瞬间恢复），
            <code>speed</code> 决定「乱码字符换得多快」—— 它不影响持续时间。
          </p>
        </div>

        <div class="space-y-2">
          <p class="text-sm font-semibold">用法</p>
          <pre class="overflow-x-auto rounded-lg bg-muted p-3 text-xs leading-relaxed"><code>{{ usageSnippet }}</code></pre>
        </div>

        <div class="space-y-2">
          <p class="text-sm font-semibold">实现上的注意点</p>
          <ul class="list-disc space-y-1 pl-5 text-xs text-muted-foreground">
            <li><strong>上游是 gsap 的 <code>SplitText</code> + <code>ScrambleTextPlugin</code>：</strong>
              逐字符拆成 <code>display: inline-block</code> 的元素、把真字符塞进 <code>data-content</code>，
              然后在容器上监听 <code>pointermove</code>，对**每个**字符算「指针到它中心的距离」，
              距离小于 <code>radius</code> 就给这个字符挂一个乱码补间。
              这里不需要 gsap：逐字拆 + 每帧算进度 + 写文本节点就够了。</li>
            <li><strong>时长按距离衰减：</strong><code>duration × (1 − dist / radius)</code> ——
              正中心是完整时长（乱得最久），贴着半径边缘几乎是瞬间恢复（偏 0）。</li>
            <li><strong>乱码补间的真实行为（照抄 <code>ScrambleTextPlugin.render</code>）：</strong>
              单字符时 <code>l = 1</code>、<code>i = ~~(ratio × l + 0.5)</code>，
              于是 <strong><code>ratio &lt; 0.5</code> 显示随机字符、<code>≥ 0.5</code> 显示真字符</strong>，
              而 <code>ratio === 0</code> 时先显示一次原文（补间刚起步的那一帧）。</li>
            <li><strong>随机字符多久换一次：</strong>插件里是 <code>data.speed = 0.05 / speed</code>（秒），
              即 <code>speed = 0.5</code> → 每 0.1 秒换一次。所以 <code>speed</code> 越大闪得越碎。</li>
            <li><strong>「<code>overwrite: true</code>」是效果的关键：</strong>鼠标每动一次都会把命中字符的补间<strong>从头重启</strong>，
              所以指针附近会持续闪；指针停住不再有 <code>pointermove</code>，补间跑完就自己恢复。</li>
            <li><strong>读矩形与写文本要分开：</strong>一轮 <code>pointermove</code> 里先把所有字符的
              <code>getBoundingClientRect()</code> 读完（这中间一次 DOM 都不写，浏览器只会做一次 layout），
              写入推迟到 <code>requestAnimationFrame</code> 里统一做 —— 否则读写交错会引发 layout thrashing。</li>
            <li><strong>Vue 里有个时序坑：</strong><code>:ref</code> 回调是在 <strong>DOM patch 时</strong>触发的，
              所以「字符状态数组」必须在那之前就位 —— 这里用 setup 顶层先建一次 + 监听 <code>text</code> 的
              pre-flush watch 重建（第一版写成 <code>await nextTick()</code> 之后再建，结果 ref 回调早就跑完了，
              所有状态里的元素都是 null）。</li>
            <li>逐字符更新用的是<strong>文本节点的 <code>nodeValue</code></strong>，
              比 <code>textContent</code> / <code>innerHTML</code> 都省（一次扫描可能有几百个字符在闪）。</li>
            <li>空格单独处理：用 <code>display: inline</code>（不加 <code>inline-block</code>），
              否则空格宽度会被折掉、长句也没法正常换行；但空格同样会被乱码「点亮」。</li>
            <li>上游 CSS 里的 <code>margin: 7vw</code> / <code>max-width</code> / 写死的白色都去掉了
              （颜色改成继承，方便放进任何主题）；字号仍是上游的 <code>clamp(14px, 4vw, 32px)</code>，
              要改得用 <code>text-2xl!</code> 这类 important 写法。</li>
            <li>只有 <code>text</code> 变化会重建字符状态；<code>radius / duration / speed / scrambleChars</code> 变化会把
              所有字符复位一次（对齐上游 effect 重跑会 <code>split.revert()</code> 的行为）。</li>
            <li><code>prefers-reduced-motion: reduce</code> 时完全不参与：不挂指针监听、不启动循环。</li>
            <li><strong>调试提醒：</strong>在内嵌浏览器里页面一旦变成 <code>hidden</code>，<code>requestAnimationFrame</code> 会冻结 ——
              这时候这个组件看起来「完全没反应」（<code>pointermove</code> 事件照样派发，但每帧的写入不跑），
              自动化点击也会卡在「等元素稳定」上。把标签页切到前台或新开一个页面就好。</li>
          </ul>
        </div>
      </CardContent>
    </Card>

    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">API</h2>
        <CardDescription><code>import { ScrambledText } from '@/components/motion'</code></CardDescription>
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
