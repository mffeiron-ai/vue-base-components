<script setup lang="ts">
/**
 * SplitFlapText 文档页（路由 /motion/split-flap-text）
 * 移植自 React Bits 的 Split Flap Text（MIT）：纯 CSS 3D 翻转 + 逐格推进，零依赖。
 */
import { computed, reactive, ref } from 'vue'
import { SplitFlapText } from '@/components/motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { toHexColor, useThemeTick } from '../lib/themeColors'

const PHRASE_SETS = [
  { label: '发射', value: ['LAUNCH READY', 'SYNC ONLINE', 'SIGNAL LIVE'] },
  { label: '出行', value: ['BOARDING NOW', 'FINAL CALL', 'GATE OPEN'] },
  { label: '产品', value: ['BUILD FASTER', 'SHIP CLEANER', 'DELIGHT USERS'] },
  { label: '数字', value: ['FLIGHT 204', 'GATE 18', 'SEAT 07A'] },
]

const CHARSETS = [
  { label: 'A-Z + 0-9', value: 'alphanumeric' },
  { label: 'A-Z', value: 'alpha' },
  { label: '0-9', value: 'numeric' },
  { label: '十六进制 + 点', value: 'ABCDEF0123456789•' },
]

const flap = reactive({
  phraseLabel: PHRASE_SETS[0].label,
  words: [...PHRASE_SETS[0].value] as string[],
  // 颜色默认写成主题变量名：组件会按当前主题解析，切主题自动换色
  tileColor: '--color-foreground',
  textColor: '--color-background',
  charset: 'alphanumeric',
  flipDuration: 0.12,
  stagger: 0.06,
  cycleDelay: 2400,
  flipsPerChar: 8,
  padTo: 12,
  fontSize: 52,
  tileRadius: 8,
  gap: 6,
  loop: true,
})

function pickPhraseSet(set: (typeof PHRASE_SETS)[number]) {
  flap.phraseLabel = set.label
  flap.words = [...set.value]
}

/* 取色器只吃 #rrggbb，把（可能是变量名的）颜色解析出来给它；useThemeTick 让它在切主题时重算 */
const themeTick = useThemeTick()
const tileHex = computed(() => {
  themeTick.value
  return toHexColor(flap.tileColor, '#111827')
})
const textHex = computed(() => {
  themeTick.value
  return toHexColor(flap.textColor, '#f8fafc')
})
const followTheme = computed(
  () => flap.tileColor.startsWith('--') && flap.textColor.startsWith('--'),
)
function resetToThemeColors() {
  flap.tileColor = '--color-foreground'
  flap.textColor = '--color-background'
}

type NumberKey = 'flipDuration' | 'stagger' | 'cycleDelay' | 'flipsPerChar' | 'padTo' | 'fontSize' | 'tileRadius' | 'gap'

const SLIDERS: { key: NumberKey; label: string; min: number; max: number; step: number; unit?: string }[] = [
  { key: 'flipDuration', label: '单格翻速', min: 0.06, max: 0.24, step: 0.01, unit: 's' },
  { key: 'stagger', label: '逐格错峰', min: 0, max: 0.14, step: 0.01, unit: 's' },
  { key: 'cycleDelay', label: '定格时长', min: 900, max: 5000, step: 100, unit: 'ms' },
  { key: 'flipsPerChar', label: '中间翻数', min: 1, max: 14, step: 1 },
  { key: 'padTo', label: '固定格数', min: 8, max: 18, step: 1 },
  { key: 'fontSize', label: '字号', min: 32, max: 76, step: 1, unit: 'px' },
  { key: 'tileRadius', label: '格子圆角', min: 0, max: 18, step: 1, unit: 'px' },
  { key: 'gap', label: '格间距', min: 2, max: 14, step: 1, unit: 'px' },
]

function setSlider(key: NumberKey, value: number[] | undefined) {
  const v = value?.[0]
  if (typeof v === 'number') flap[key] = v
}

/** 重播：换 key 重挂载，牌子从头翻一遍 */
const replay = ref(0)

const usageSnippet = computed(
  () => `<SplitFlapText
  :words="['${flap.words.join("', '")}']"
  charset="${flap.charset}"
  :flips-per-char="${flap.flipsPerChar}"
  tile-color="${flap.tileColor}"
  text-color="${flap.textColor}"
/>`,
)

const PROPS = [
  { name: 'words', type: 'string[]', def: "['LAUNCH READY', 'SYNC ONLINE', 'SIGNAL LIVE']", desc: '循环播放的短语数组' },
  { name: 'text', type: 'string', def: 'undefined', desc: '单条短语；设了它就不看 words' },
  { name: 'flipDuration', type: 'number', def: '0.12', desc: '每翻一格用多久（秒）' },
  { name: 'stagger', type: 'number', def: '0.06', desc: '相邻格开始翻的间隔（秒）' },
  { name: 'cycleDelay', type: 'number', def: '2400', desc: '定格多久后换下一条（毫秒）' },
  { name: 'charset', type: "'alpha' | 'alphanumeric' | 'numeric' | string", def: "'alphanumeric'", desc: '中间字形用哪些字符，也可以直接给一串' },
  { name: 'flipsPerChar', type: 'number', def: '8', desc: '每格翻多少个中间字形再落到目标' },
  { name: 'tileColor', type: 'string', def: "'--color-foreground'", desc: '牌子底色：任意 CSS 颜色，或 `--` 变量名（默认跟随主题）' },
  { name: 'textColor', type: 'string', def: "'--color-background'", desc: '字形颜色：同上' },
  { name: 'tileRadius', type: 'number | string', def: '8', desc: '格子圆角（数字按 px）' },
  { name: 'gap', type: 'number | string', def: '6', desc: '格间距（数字按 px）' },
  { name: 'fontSize', type: 'number | string', def: '52', desc: '字号（数字按 px）' },
  { name: 'loop', type: 'boolean', def: 'true', desc: '播完最后一条是否回头再来' },
  { name: 'padTo', type: 'number', def: '12', desc: '固定格数：把短语补齐到这么多格，牌子宽度不跳' },
]
</script>

<template>
  <div class="mx-auto max-w-5xl px-6 py-10">
    <h1 class="text-3xl font-bold tracking-normal">翻页牌 SplitFlapText</h1>
    <p class="mt-3 text-muted-foreground">
      机场出发牌那种一格一格翻字：每格由「上半 + 下半」两块拼成，翻的时候再叠两块 3D 翻翼，
      逐格错峰地从中间字形翻到目标，定格一会儿再换下一条。
      <strong>移植自 React Bits</strong>（MIT）—— 原版是纯 CSS 3D + 一个推进循环，零依赖。
    </p>

    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">示例</h2>
        <CardDescription>默认 12 格、每格翻 8 个中间字形；「固定格数」调大可放更长的短语。</CardDescription>
      </CardHeader>
      <CardContent class="space-y-6">
        <div class="flex min-h-[200px] items-center justify-center overflow-x-auto rounded-xl border border-border bg-muted/40 px-6 py-10">
          <SplitFlapText
            :key="replay"
            :words="flap.words"
            :charset="flap.charset"
            :flip-duration="flap.flipDuration"
            :stagger="flap.stagger"
            :cycle-delay="flap.cycleDelay"
            :flips-per-char="flap.flipsPerChar"
            :pad-to="flap.padTo"
            :font-size="flap.fontSize"
            :tile-radius="flap.tileRadius"
            :gap="flap.gap"
            :tile-color="flap.tileColor"
            :text-color="flap.textColor"
            :loop="flap.loop"
          />
        </div>

        <div class="grid gap-5 sm:grid-cols-2">
          <div class="space-y-2">
            <p class="text-sm font-semibold">短语集</p>
            <div class="flex flex-wrap gap-2">
              <Button
                v-for="set in PHRASE_SETS"
                :key="set.label"
                :variant="flap.phraseLabel === set.label ? 'default' : 'outline'"
                size="sm"
                @click="pickPhraseSet(set)"
              >{{ set.label }}</Button>
            </div>
          </div>

          <div class="space-y-2">
            <p class="text-sm font-semibold">中间字形字符集</p>
            <div class="flex flex-wrap gap-2">
              <Button
                v-for="c in CHARSETS"
                :key="c.value"
                :variant="flap.charset === c.value ? 'default' : 'outline'"
                size="sm"
                @click="flap.charset = c.value"
              >{{ c.label }}</Button>
            </div>
          </div>
        </div>

        <div class="space-y-4 rounded-lg border border-border p-4">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <p class="text-sm font-semibold">参数</p>
            <div class="flex flex-wrap items-center gap-4">
              <label class="flex items-center gap-2 text-xs text-muted-foreground">
                牌面
                <input
                  type="color"
                  class="h-7 w-9 cursor-pointer rounded border border-border bg-transparent"
                  :value="tileHex"
                  @input="flap.tileColor = ($event.target as HTMLInputElement).value"
                >
              </label>
              <label class="flex items-center gap-2 text-xs text-muted-foreground">
                字形
                <input
                  type="color"
                  class="h-7 w-9 cursor-pointer rounded border border-border bg-transparent"
                  :value="textHex"
                  @input="flap.textColor = ($event.target as HTMLInputElement).value"
                >
              </label>
              <Button variant="outline" size="sm" :disabled="followTheme" @click="resetToThemeColors">
                {{ followTheme ? '已跟随主题' : '跟随主题' }}
              </Button>
              <label class="flex items-center gap-2 text-xs text-muted-foreground">
                循环
                <Switch :model-value="flap.loop" @update:model-value="v => (flap.loop = !!v)" />
              </label>
              <Button variant="outline" size="sm" @click="replay++">重播</Button>
            </div>
          </div>

          <p class="text-xs text-muted-foreground">
            两个颜色默认跟随主题（<code>--color-foreground</code> / <code>--color-background</code>）；
            手动改取色器就固定成该颜色，点「跟随主题」回到跟随。
          </p>

          <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div v-for="s in SLIDERS" :key="s.key" class="space-y-1.5">
              <div class="flex items-baseline justify-between">
                <span class="text-xs text-muted-foreground">{{ s.label }}</span>
                <span class="text-xs font-medium tabular-nums">{{ flap[s.key] }}{{ s.unit ?? '' }}</span>
              </div>
              <Slider
                :model-value="[flap[s.key]]"
                :min="s.min"
                :max="s.max"
                :step="s.step"
                @update:model-value="v => setSlider(s.key, v)"
              />
            </div>
          </div>
        </div>

        <div class="space-y-2">
          <p class="text-sm font-semibold">用法</p>
          <pre class="overflow-x-auto rounded-lg bg-muted p-3 text-xs leading-relaxed"><code>{{ usageSnippet }}</code></pre>
        </div>

        <div class="space-y-2">
          <p class="text-sm font-semibold">实现上的注意点</p>
          <ul class="list-disc space-y-1 pl-5 text-xs text-muted-foreground">
            <li><code>words</code> 会按最长的一条 + <code>padTo</code> 补齐空格，所以牌子宽度恒定不会跳。</li>
            <li>改 <code>charset</code> / <code>flipsPerChar</code> / <code>padTo</code> / <code>words</code> 会从头翻一遍；改颜色和时长是即时生效，不打断当前这轮。</li>
            <li><code>tileColor</code> / <code>textColor</code> 支持 <code>--color-*</code> 变量名（默认就是这么传的），切主题会自动换色。</li>
            <li>系统开了「减少动态效果」时不翻牌，直接跳到目标短语（循环仍在）。</li>
          </ul>
        </div>
      </CardContent>
    </Card>

    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">API</h2>
        <CardDescription><code>import { SplitFlapText } from '@/components/motion'</code></CardDescription>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  </div>
</template>
