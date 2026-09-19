<script setup lang="ts">
/**
 * FallingText 文档页（路由 /motion/falling-text）
 * 移植自 React Bits 的 Falling Text（MIT）：原版依赖 matter-js，这里换成自研的迷你物理引擎。
 */
import { computed, reactive, ref, watch } from 'vue'
import { FallingText } from '@/components/motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'

const TEXT_PRESETS = [
  {
    label: '上游示例句',
    text: 'React Bits is a library of animated and interactive React components designed to streamline UI development and simplify your workflow.',
    highlight: ['React', 'Bits', 'animated', 'components', 'simplify'],
  },
  {
    label: '中文',
    text: '掉落的文字会一个个砸下来，弹几下，然后安静地躺在地上，还能用鼠标拖着玩。',
    highlight: ['掉', '落', '砸', '弹', '安', '静'],
  },
  {
    label: '中英混排',
    text: 'Falling Text 掉落文字，鼠标还能拖拽。',
    highlight: ['Falling', 'Text', '掉', '落'],
  },
  {
    label: '短句',
    text: 'Let it fall.',
    highlight: ['fall'],
  },
]

const TRIGGER_OPTIONS = [
  { label: '自动', value: 'auto' as const, hint: '挂上就掉' },
  { label: '滚入视口', value: 'scroll' as const, hint: '滚到可见处开始' },
  { label: '点击', value: 'click' as const, hint: '点一下开始' },
  { label: '悬停', value: 'hover' as const, hint: '鼠标移进框里开始' },
]

const FONT_PRESETS = [
  { label: '1.6rem', value: '1.6rem' },
  { label: '2rem（上游 demo）', value: '2rem' },
  { label: '2.6rem', value: '2.6rem' },
]

const falling = reactive({
  presetLabel: TEXT_PRESETS[0].label,
  text: TEXT_PRESETS[0].text,
  highlight: [...TEXT_PRESETS[0].highlight],
  trigger: 'auto' as 'auto' | 'scroll' | 'click' | 'hover',
  gravity: 0.56,
  stiffness: 0.9,
  fontSize: '2rem',
  wordSpacing: 2,
  wireframes: false,
  highlightOn: true,
})

const replayKey = ref(0)
const boxRef = ref<{ replay?: () => void } | null>(null)

function pickText(preset: (typeof TEXT_PRESETS)[number]) {
  falling.presetLabel = preset.label
  falling.text = preset.text
  falling.highlight = [...preset.highlight]
}

function onSlider(key: 'gravity' | 'stiffness' | 'wordSpacing', value: number[] | undefined) {
  const v = value?.[0]
  if (typeof v === 'number') falling[key] = v
}

/** 切触发器时让词回到起点再重新武装（改 key 重挂载） */
watch(() => falling.trigger, () => {
  replayKey.value += 1
})

function replay() {
  boxRef.value?.replay?.()
}

const triggerHint = computed(() => {
  if (falling.trigger === 'hover') return 'Hover Me'
  if (falling.trigger === 'click') return 'Click Me'
  return ''
})

const activeHighlight = computed(() => (falling.highlightOn ? falling.highlight : []))

const usageSnippet = computed(
  () => `<FallingText
  text="React Bits is a library of animated components."
  :highlight-words="${JSON.stringify(activeHighlight.value)}"
  trigger="${falling.trigger}"
  :gravity="${falling.gravity}"
  :mouse-constraint-stiffness="${falling.stiffness}"
  font-size="${falling.fontSize}"
  word-spacing="${falling.wordSpacing}px"
/>`,
)

const PROPS = [
  { name: 'text', type: 'string', def: "''", desc: '要掉下来的文字；按空格切词，CJK 再拆成单字' },
  { name: 'highlightWords', type: 'string[]', def: '[]', desc: '这些词（按前缀匹配）加高亮样式' },
  { name: 'highlightClass', type: 'string', def: "'highlighted'", desc: '高亮的类名；默认类定义在组件内（主色 + 粗体），可传自己的类名覆盖' },
  { name: 'trigger', type: "'auto' | 'scroll' | 'click' | 'hover'", def: "'auto'", desc: '何时开始掉：自动 / 滚入视口（IO threshold 0.1）/ 点击 / 悬停' },
  { name: 'backgroundColor', type: 'string', def: "'transparent'", desc: '物理画布的背景色，默认透明' },
  { name: 'wireframes', type: 'boolean', def: 'false', desc: '画出刚体线框（含四面墙），颜色取 --color-primary 并跟随主题' },
  { name: 'gravity', type: 'number', def: '1', desc: '重力倍数（与 matter-js 的 engine.gravity.y 同义）' },
  { name: 'mouseConstraintStiffness', type: 'number', def: '0.2', desc: '鼠标拖拽的弹簧刚度（0~1.5，越大越跟手）' },
  { name: 'fontSize', type: 'string', def: "'1rem'", desc: '掉之前的字号' },
  { name: 'wordSpacing', type: 'string', def: "'2px'", desc: '词与词之间的横向间距（词块左右外边距）' },
]

const EXPOSED = [
  { name: 'replay()', desc: '重新掉一次：词回到起点、重新量尺寸、物理世界清零（等价重新挂载，但不会闪一下）' },
]
</script>

<template>
  <div class="mx-auto max-w-5xl px-6 py-10">
    <h1 class="text-3xl font-bold tracking-tight">掉落文字 FallingText</h1>
    <p class="mt-3 text-muted-foreground">
      一段文字被拆成一个个词，触发后<strong>掉下来</strong> —— 重力、弹跳、翻滚、互相堆叠，还能用鼠标把它们<strong>拖着玩</strong>。
      <strong>移植自 React Bits</strong>（MIT）：原版用 <code>matter-js</code>，本仓库的动效不引第三方依赖，
      所以自研了一个迷你 2D 刚体引擎（SAT + 顶点接触 + 冲量解算），<strong>常量与 matter-js 对齐</strong>
      （固定步长 60Hz、<code>gravity.scale = 0.001</code>、弹跳 0.8、空气阻力 0.01、摩擦 0.2），
      所以 <code>gravity</code> / <code>mouseConstraintStiffness</code> 的手感与上游一致。
    </p>

    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">示例</h2>
        <CardDescription>
          触发器：<span class="font-mono">{{ falling.trigger }}</span>
          <span v-if="triggerHint"> · 框里会提示「{{ triggerHint }}」</span>
          · 鼠标按住任意词可以拖
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-6">
        <div class="relative h-[420px] overflow-hidden rounded-xl border border-border bg-background">
          <div class="pointer-events-none absolute inset-0 flex items-center justify-center text-4xl font-semibold text-muted-foreground/20">
            {{ triggerHint }}
          </div>
          <FallingText
            :key="replayKey"
            ref="boxRef"
            :text="falling.text"
            :highlight-words="activeHighlight"
            :trigger="falling.trigger"
            :gravity="falling.gravity"
            :mouse-constraint-stiffness="falling.stiffness"
            :font-size="falling.fontSize"
            :word-spacing="`${falling.wordSpacing}px`"
            :wireframes="falling.wireframes"
          />
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" @click="replay">重新掉一次</Button>
          <span class="text-xs text-muted-foreground">
            调参后如果词已经躺平，点一下这里重新掉（重力与刚度是实时生效的）
          </span>
        </div>

        <div class="grid gap-5 sm:grid-cols-2">
          <div class="space-y-2">
            <p class="text-sm font-semibold">文案（顺便换高亮词）</p>
            <div class="flex flex-wrap gap-2">
              <Button
                v-for="t in TEXT_PRESETS"
                :key="t.label"
                :variant="falling.presetLabel === t.label ? 'default' : 'outline'"
                size="sm"
                @click="pickText(t)"
              >{{ t.label }}</Button>
            </div>
          </div>

          <div class="space-y-2">
            <p class="text-sm font-semibold">字号</p>
            <div class="flex flex-wrap gap-2">
              <Button
                v-for="f in FONT_PRESETS"
                :key="f.value"
                :variant="falling.fontSize === f.value ? 'default' : 'outline'"
                size="sm"
                @click="falling.fontSize = f.value"
              >{{ f.label }}</Button>
            </div>
          </div>

          <div class="space-y-2 sm:col-span-2">
            <p class="text-sm font-semibold">触发器</p>
            <div class="flex flex-wrap gap-2">
              <Button
                v-for="t in TRIGGER_OPTIONS"
                :key="t.value"
                :variant="falling.trigger === t.value ? 'default' : 'outline'"
                size="sm"
                @click="falling.trigger = t.value"
              >{{ t.label }}<span class="ml-1 text-xs opacity-60">{{ t.hint }}</span></Button>
            </div>
          </div>
        </div>

        <div class="space-y-4 rounded-lg border border-border p-4">
          <p class="text-sm font-semibold">开关</p>
          <div class="grid gap-3 sm:grid-cols-2">
            <label class="flex cursor-pointer items-center justify-between gap-4 rounded-md px-1 py-1">
              <span class="space-y-0.5">
                <span class="block text-sm">高亮词</span>
                <span class="block text-xs text-muted-foreground">命中 highlightWords 的词用主色加粗</span>
              </span>
              <Switch v-model="falling.highlightOn" />
            </label>
            <label class="flex cursor-pointer items-center justify-between gap-4 rounded-md px-1 py-1">
              <span class="space-y-0.5">
                <span class="block text-sm">刚体线框</span>
                <span class="block text-xs text-muted-foreground">把每个词（和四面墙）的碰撞盒画出来</span>
              </span>
              <Switch v-model="falling.wireframes" />
            </label>
          </div>
        </div>

        <div class="space-y-4 rounded-lg border border-border p-4">
          <p class="text-sm font-semibold">参数</p>
          <div class="grid gap-4 sm:grid-cols-3">
            <div class="space-y-1.5">
              <div class="flex items-baseline justify-between">
                <span class="text-xs text-muted-foreground">重力</span>
                <span class="text-xs font-medium tabular-nums">{{ falling.gravity.toFixed(2) }}</span>
              </div>
              <Slider
                :model-value="[falling.gravity]"
                :min="0"
                :max="2"
                :step="0.01"
                @update:model-value="v => onSlider('gravity', v)"
              />
            </div>
            <div class="space-y-1.5">
              <div class="flex items-baseline justify-between">
                <span class="text-xs text-muted-foreground">鼠标刚度</span>
                <span class="text-xs font-medium tabular-nums">{{ falling.stiffness.toFixed(2) }}</span>
              </div>
              <Slider
                :model-value="[falling.stiffness]"
                :min="0.05"
                :max="1.5"
                :step="0.05"
                @update:model-value="v => onSlider('stiffness', v)"
              />
            </div>
            <div class="space-y-1.5">
              <div class="flex items-baseline justify-between">
                <span class="text-xs text-muted-foreground">词间距</span>
                <span class="text-xs font-medium tabular-nums">{{ falling.wordSpacing }}px</span>
              </div>
              <Slider
                :model-value="[falling.wordSpacing]"
                :min="0"
                :max="12"
                :step="1"
                @update:model-value="v => onSlider('wordSpacing', v)"
              />
            </div>
          </div>
        </div>

        <div class="space-y-2">
          <p class="text-sm font-semibold">用法</p>
          <pre class="overflow-x-auto rounded-lg bg-muted p-3 text-xs leading-relaxed"><code>{{ usageSnippet }}</code></pre>
          <p class="text-xs text-muted-foreground">
            <strong>容器必须有确定高度</strong>（组件是 <code>height: 100%</code>），示例里是 <code>h-[420px]</code> 的框。
          </p>
        </div>

        <div class="space-y-2">
          <p class="text-sm font-semibold">实现上的注意点</p>
          <ul class="list-disc space-y-1 pl-5 text-xs text-muted-foreground">
            <li><strong>不引 matter-js</strong>：物理在 <code>falling-text/mini-physics.ts</code> 里，SAT 求最小分离轴 + 顶点穿透取接触点 + 冲量解算（带库仑摩擦与位置修正），常量与 matter-js 对齐，见文件头注释。</li>
            <li><strong>接触点取「落在对方内部的顶点」</strong>：平放在地上时两个下角各算一个接触点，所以词不会像只支撑一个点那样歪倒；四角都进墙时自然会有多个接触点。</li>
            <li><strong>低于阈值的碰撞不反弹</strong>（相对速度 &lt; 1.5px/步时弹跳系数按 0 处理），否则落定后会一直微抖；速度与角速度也有上限，防止极端情况炸开。</li>
            <li><strong>鼠标拖拽是「速度伺服」</strong>：matter 的 MouseConstraint 是按质量加权直接挪位置，这里等价换算成「速度 += 误差 × 刚度」，更跟手又保留惯性（松手会甩出去）；抓点偏离质心会产生扭矩 —— 拎着一角时词会吊着转。</li>
            <li><strong>固定步长累加器</strong>：物理固定 60Hz 步进，标签页切回来最多补 5 步，避免一次积分一大段导致穿墙。</li>
            <li><strong>CJK 拆成单字</strong>：上游按空格切，整句中文会变成一个巨大的刚体（掉不下来也翻不动），所以按词切完再把 CJK 拆成单字。</li>
            <li>实时生效的参数：<code>gravity</code> / <code>mouseConstraintStiffness</code> / <code>wireframes</code> / <code>highlightWords</code> 都是每步或每次渲染直接读的；而 <code>text</code> / <code>fontSize</code> / <code>wordSpacing</code> 影响排版，改了会<strong>重新量尺寸并重播</strong>（上游改文案后不会重建物理世界）。</li>
            <li>线框画在一张 canvas 上（<code>pointer-events: none</code>），拖拽监听挂在<strong>容器</strong>上；容器带 <code>touch-action: none</code>，触摸端拖动不会连带滚动页面。</li>
            <li>尺寸变化（<code>ResizeObserver</code>）只会重设画布大小，<strong>不会重建物理世界与四面墙</strong> —— 变了容器尺寸想彻底重来就 <code>replay()</code> 或改 <code>key</code> 重挂载。</li>
            <li><code>prefers-reduced-motion: reduce</code> 时不动（词留在原位）。</li>
            <li>父级没给高度时组件有 <code>min-height: 160px</code> 兜底（上游没有，0 高度 + <code>overflow: hidden</code> 会把文字整个裁掉）。</li>
          </ul>
        </div>
      </CardContent>
    </Card>

    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">API</h2>
        <CardDescription><code>import { FallingText } from '@/components/motion'</code></CardDescription>
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
                  <th class="py-2 pr-4 font-medium">方法</th>
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
