<script setup lang="ts">
/**
 * DecryptedText 文档页（路由 /motion/decrypted-text）
 * 移植自 React Bits 的 Decrypted Text（MIT）：原版只借 motion.span 当普通 span 用，这里就是 Vue + setInterval。
 */
import { computed, reactive, ref } from 'vue'
import { DecryptedText } from '@/components/motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'

const TEXT_PRESETS = [
  { label: '短句', value: 'Decrypted Text' },
  { label: '中文', value: '解密文字，一个字符一个字符地解出来' },
  { label: '中英混排', value: '解密 Decrypted 文字 Text' },
  { label: '长句', value: 'A hacker style decryption of the whole sentence' },
]

const ANIMATE_OPTIONS = [
  { label: '悬停', value: 'hover' as const, hint: '移入解密、移出打回乱码' },
  { label: '滚入视口', value: 'view' as const, hint: '滚到可见处解一次' },
  { label: '点击', value: 'click' as const, hint: '点一下（配合下方模式）' },
  { label: '滚入 + 悬停', value: 'inViewHover' as const, hint: '两者都触发' },
]

const DIRECTION_OPTIONS = [
  { label: '从左（上游默认）', value: 'start' as const },
  { label: '从右', value: 'end' as const },
  { label: '从中间', value: 'center' as const },
]

const CLASS_PRESETS = [
  { label: '不上色（默认）', className: '', encryptedClassName: '' },
  { label: '解密段主色 + 乱码段灰', className: 'dt-revealed', encryptedClassName: 'dt-encrypted' },
  { label: '乱码段模糊', className: 'dt-revealed', encryptedClassName: 'dt-encrypted-blur' },
]

const decrypted = reactive({
  text: TEXT_PRESETS[0].value,
  textLabel: TEXT_PRESETS[0].label,
  animateOn: 'hover' as 'hover' | 'view' | 'click' | 'inViewHover',
  clickMode: 'once' as 'once' | 'toggle',
  revealDirection: 'start' as 'start' | 'end' | 'center',
  speed: 50,
  maxIterations: 10,
  sequential: false,
  useOriginalCharsOnly: false,
  classLabel: CLASS_PRESETS[0].label,
  className: CLASS_PRESETS[0].className,
  encryptedClassName: CLASS_PRESETS[0].encryptedClassName,
})

const compRef = ref<{
  decrypt?: () => void
  reverse?: () => void
  reset?: () => void
} | null>(null)

function pickText(preset: (typeof TEXT_PRESETS)[number]) {
  decrypted.textLabel = preset.label
  decrypted.text = preset.value
}

function pickClass(preset: (typeof CLASS_PRESETS)[number]) {
  decrypted.classLabel = preset.label
  decrypted.className = preset.className
  decrypted.encryptedClassName = preset.encryptedClassName
}

function onSlider(key: 'speed' | 'maxIterations', value: number[] | undefined) {
  const v = value?.[0]
  if (typeof v === 'number') decrypted[key] = v
}

const hint = computed(() => {
  const map: Record<string, string> = {
    hover: '把鼠标移进框里（移出会打回乱码）',
    view: '滚到可见处自动解一次',
    click: decrypted.clickMode === 'once' ? '点一下解密（只解一次）' : '点一下解密 / 再点一下打回乱码',
    inViewHover: '滚入视口 + 悬停都会触发',
  }
  return map[decrypted.animateOn]
})

const usageSnippet = computed(
  () => `<DecryptedText
  text="${decrypted.text.slice(0, 22)}"
  :speed="${decrypted.speed}"
  :max-iterations="${decrypted.maxIterations}"
  ${decrypted.sequential ? 'sequential\n  ' : ''}${decrypted.useOriginalCharsOnly ? 'use-original-chars-only\n  ' : ''}reveal-direction="${decrypted.revealDirection}"
  animate-on="${decrypted.animateOn}"
  click-mode="${decrypted.clickMode}"
  ${decrypted.className ? `class-name="${decrypted.className}"\n  encrypted-class-name="${decrypted.encryptedClassName}"` : ''}
/>`,
)

const PROPS = [
  { name: 'text', type: 'string', def: "''", desc: '要解密的文字' },
  { name: 'speed', type: 'number', def: '50', desc: '每一拍之间的间隔（毫秒）' },
  { name: 'maxIterations', type: 'number', def: '10', desc: '非顺序模式下的最大随机拍数' },
  { name: 'sequential', type: 'boolean', def: 'false', desc: '顺序模式：一个字符一个字符地解（否则是「整段乱码 N 拍后直接出真字」）' },
  { name: 'revealDirection', type: "'start' | 'end' | 'center'", def: "'start'", desc: '顺序模式从哪边开始解；center 从中间向两边交替' },
  { name: 'useOriginalCharsOnly', type: 'boolean', def: 'false', desc: '只用文字里已有的字符来乱码（而不是整张 characters 表）' },
  { name: 'characters', type: 'string', def: 'A-Za-z + !@#$%^&*()_+', desc: '乱码字符表' },
  { name: 'animateOn', type: "'view' | 'hover' | 'inViewHover' | 'click'", def: "'hover'", desc: '何时开始解密' },
  { name: 'clickMode', type: "'once' | 'toggle'", def: "'once'", desc: '点击行为；toggle 时再点一下会打回乱码（反向演示）' },
  { name: 'className', type: 'string', def: "''", desc: '已解出字符的类名' },
  { name: 'encryptedClassName', type: 'string', def: "''", desc: '仍是乱码的字符的类名' },
  { name: 'parentClassName', type: 'string', def: "''", desc: '根元素的类名（Vue 里直接写 class 也会透传到根元素）' },
]

const EXPOSED = [
  { name: 'decrypt()', desc: '手动解密一次（走正向）' },
  { name: 'reverse()', desc: '手动反解密：把文字重新打成乱码' },
  { name: 'reset()', desc: '立刻恢复明文（等价 hover 移出的效果）' },
  { name: 'isDecrypted', desc: '当前是否明文状态（可读的 ref）' },
]
</script>

<template>
  <div class="mx-auto max-w-5xl px-6 py-10">
    <h1 class="text-3xl font-bold tracking-tight">解密文字 DecryptedText</h1>
    <p class="mt-3 text-muted-foreground">
      文字先是一串<strong>随机乱码</strong>，再一个字符一个字符地「解」回真字 —— 黑客电影里那种感觉。
      <strong>移植自 React Bits</strong>（MIT）：原版只是借 <code>motion.span</code> 当普通 span 用（没有任何动画值），
      所以这里就是 <strong>Vue + <code>setInterval</code></strong>，不引依赖。顺序模式按
      <code>revealDirection</code> 逐个点亮，非顺序模式则是「整段乱码 N 拍 → 直接出真字」。
    </p>

    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">示例</h2>
        <CardDescription>{{ hint }}</CardDescription>
      </CardHeader>
      <CardContent class="space-y-6">
        <div class="flex min-h-[160px] items-center justify-center rounded-xl border border-border bg-background px-8 py-10">
          <DecryptedText
            ref="compRef"
            :text="decrypted.text"
            :speed="decrypted.speed"
            :max-iterations="decrypted.maxIterations"
            :sequential="decrypted.sequential"
            :reveal-direction="decrypted.revealDirection"
            :use-original-chars-only="decrypted.useOriginalCharsOnly"
            :animate-on="decrypted.animateOn"
            :click-mode="decrypted.clickMode"
            :class-name="decrypted.className"
            :encrypted-class-name="decrypted.encryptedClassName"
            class="cursor-pointer text-3xl font-semibold tracking-tight"
          />
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" @click="compRef?.decrypt?.()">手动解密</Button>
          <Button variant="outline" size="sm" @click="compRef?.reverse?.()">打回乱码</Button>
          <Button variant="outline" size="sm" @click="compRef?.reset?.()">立刻显示明文</Button>
          <span class="text-xs text-muted-foreground">这三个按钮调的是组件 <code>defineExpose</code> 出去的方法</span>
        </div>

        <div class="grid gap-5 sm:grid-cols-2">
          <div class="space-y-2">
            <p class="text-sm font-semibold">文案</p>
            <div class="flex flex-wrap gap-2">
              <Button
                v-for="t in TEXT_PRESETS"
                :key="t.label"
                :variant="decrypted.textLabel === t.label ? 'default' : 'outline'"
                size="sm"
                @click="pickText(t)"
              >{{ t.label }}</Button>
            </div>
          </div>

          <div class="space-y-2">
            <p class="text-sm font-semibold">字符类名</p>
            <div class="flex flex-wrap gap-2">
              <Button
                v-for="c in CLASS_PRESETS"
                :key="c.label"
                :variant="decrypted.classLabel === c.label ? 'default' : 'outline'"
                size="sm"
                @click="pickClass(c)"
              >{{ c.label }}</Button>
            </div>
          </div>

          <div class="space-y-2 sm:col-span-2">
            <p class="text-sm font-semibold">触发方式（<code>animateOn</code>）</p>
            <div class="flex flex-wrap gap-2">
              <Button
                v-for="t in ANIMATE_OPTIONS"
                :key="t.value"
                :variant="decrypted.animateOn === t.value ? 'default' : 'outline'"
                size="sm"
                @click="decrypted.animateOn = t.value"
              >{{ t.label }}<span class="ml-1 text-xs opacity-60">{{ t.hint }}</span></Button>
            </div>
          </div>

          <div class="space-y-2">
            <p class="text-sm font-semibold">点击模式（<code>clickMode</code>）</p>
            <div class="flex flex-wrap gap-2">
              <Button
                :variant="decrypted.clickMode === 'once' ? 'default' : 'outline'"
                size="sm"
                @click="decrypted.clickMode = 'once'"
              >点一次</Button>
              <Button
                :variant="decrypted.clickMode === 'toggle' ? 'default' : 'outline'"
                size="sm"
                @click="decrypted.clickMode = 'toggle'"
              >一开一关</Button>
            </div>
          </div>

          <div class="space-y-2">
            <p class="text-sm font-semibold">顺序方向（<code>revealDirection</code>）</p>
            <div class="flex flex-wrap gap-2">
              <Button
                v-for="d in DIRECTION_OPTIONS"
                :key="d.value"
                :variant="decrypted.revealDirection === d.value ? 'default' : 'outline'"
                size="sm"
                @click="decrypted.revealDirection = d.value"
              >{{ d.label }}</Button>
            </div>
          </div>
        </div>

        <div class="space-y-4 rounded-lg border border-border p-4">
          <p class="text-sm font-semibold">开关</p>
          <div class="grid gap-3 sm:grid-cols-2">
            <label class="flex cursor-pointer items-center justify-between gap-4 rounded-md px-1 py-1">
              <span class="space-y-0.5">
                <span class="block text-sm">顺序模式</span>
                <span class="block text-xs text-muted-foreground">一个字符一个字符地解（关掉＝整段乱码几拍后直接出真字）</span>
              </span>
              <Switch v-model="decrypted.sequential" />
            </label>
            <label class="flex cursor-pointer items-center justify-between gap-4 rounded-md px-1 py-1">
              <span class="space-y-0.5">
                <span class="block text-sm">只用原文里的字符</span>
                <span class="block text-xs text-muted-foreground">乱码只用文字里出现过的字符（看起来更像「差一点解开」）</span>
              </span>
              <Switch v-model="decrypted.useOriginalCharsOnly" />
            </label>
          </div>
        </div>

        <div class="space-y-4 rounded-lg border border-border p-4">
          <p class="text-sm font-semibold">参数</p>
          <div class="grid gap-4 sm:grid-cols-2">
            <div class="space-y-1.5">
              <div class="flex items-baseline justify-between">
                <span class="text-xs text-muted-foreground">每拍间隔</span>
                <span class="text-xs font-medium tabular-nums">{{ decrypted.speed }}ms</span>
              </div>
              <Slider
                :model-value="[decrypted.speed]"
                :min="10"
                :max="200"
                :step="10"
                @update:model-value="v => onSlider('speed', v)"
              />
            </div>
            <div class="space-y-1.5">
              <div class="flex items-baseline justify-between">
                <span class="text-xs text-muted-foreground">非顺序最大拍数</span>
                <span class="text-xs font-medium tabular-nums">{{ decrypted.maxIterations }}</span>
              </div>
              <Slider
                :model-value="[decrypted.maxIterations]"
                :min="1"
                :max="30"
                :step="1"
                @update:model-value="v => onSlider('maxIterations', v)"
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
            <li><strong>四种走法</strong>（与上游逐条对齐）：顺序·正放 = 按 <code>revealDirection</code> 逐个点亮；顺序·倒放 = 按相反顺序逐个熄掉；非顺序·正放 = 连续 <code>maxIterations</code> 拍乱码后直接出真字；非顺序·倒放 = 从全亮开始每拍随机熄掉 <code>ceil(len / maxIterations)</code> 个。</li>
            <li><strong>乱码规则</strong>：空格原样、已点亮的用真字、其余取随机字符；<code>useOriginalCharsOnly</code> 时随机表换成「文字里出现过的字符去重」。</li>
            <li><strong>逐字符渲染成 span</strong>：已解出的用 <code>className</code>、还是乱码的用 <code>encryptedClassName</code>，所以可以分别上色（本页的「解密段主色 + 乱码段灰」就是这么做的）。</li>
            <li>颜色变化让每个字宽度不同 → 整行会有轻微抖动，这是这个效果的一部分；容器用 <code>white-space: pre-wrap</code> + <code>inline-block</code> 保住空白与换行。</li>
            <li><strong>无障碍（改了上游）</strong>：给读屏的那份隐藏文本永远是<strong>真实文字</strong>；上游给的是「当前乱码」，读屏用户会一直听到随机字符。</li>
            <li><strong>center 方向（改了上游）</strong>：上游正放走 <code>getNextIndex()</code>，它的 center 分支实际是「第一个没点亮的」＝等同于 start；这里统一用 <code>computeOrder()</code>（中间 → 左 → 右 交替）取下一个下标，center 才真的从中间开始。</li>
            <li>动画是 <code>setInterval</code> 驱动的（上游也是）：<strong>切到后台标签页会被浏览器降频</strong>，看起来会「卡」——回到前台会接着走，不会错位。</li>
            <li><code>animateOn="click"</code> 时初始就是<strong>已加密</strong>状态（其余模式初始是明文）；<code>clickMode="toggle"</code> 再点一下会走反向（逐渐打回乱码）。</li>
            <li><code>animateOn="hover"</code> 移出会 <code>resetToPlainText()</code>（立刻恢复明文并停表）；<code>view</code> 只解一次（<code>hasAnimated</code> 把关），<code>inViewHover</code> 两者都触发。</li>
            <li><code>speed</code> 改动时如果正在动画，会用新速度重开计时器；<code>text</code> 改动会重置回初始状态并重新挂观察器。</li>
          </ul>
        </div>
      </CardContent>
    </Card>

    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">API</h2>
        <CardDescription><code>import { DecryptedText } from '@/components/motion'</code></CardDescription>
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
          <p class="text-sm font-semibold">暴露的方法 / 状态</p>
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

<!-- 演示用的字符类名：必须是**非 scoped** 才会作用到子组件里渲染出来的 span 上 -->
<style>
.dt-revealed {
  color: var(--color-primary, #3b82f6);
}

.dt-encrypted {
  color: var(--color-muted-foreground, #6b7280);
}

.dt-encrypted-blur {
  color: var(--color-muted-foreground, #6b7280);
  filter: blur(1.5px);
}
</style>
