<script setup lang="ts">
/**
 * TextPressure 文档页（路由 /motion/text-pressure）
 * 移植自 React Bits 的 Text Pressure（MIT，源自 Juan Fuentes 的 CodePen）。
 * ⚠️ 需要可变字体（默认用 Google Fonts 的 Roboto Flex，必须有网络）。
 */
import { computed, reactive, ref } from 'vue'
import { TextPressure } from '@/components/motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'

const TEXT_PRESETS = [
  { label: 'Hello!', value: 'Hello!' },
  { label: 'Compressa（上游默认）', value: 'Compressa' },
  { label: 'PRESSURE', value: 'Pressure' },
  { label: '长一点（看挤压）', value: 'Variable Font' },
  { label: '中文（轴不生效）', value: '挤压效果' },
]

const FONT_FAMILY = 'Roboto Flex Variable'

const COLOR_OPTIONS: { label: string; textColor: string; strokeColor: string }[] = [
  { label: '跟随主题（默认）', textColor: '--color-foreground', strokeColor: '--color-primary' },
  { label: '主题主色字 + 前景描边', textColor: '--color-primary', strokeColor: '--color-foreground' },
  { label: '上游默认（白字 + 红描边）', textColor: '#ffffff', strokeColor: '#ff0000' },
]

const pressure = reactive({
  text: TEXT_PRESETS[0].value,
  textLabel: TEXT_PRESETS[0].label,
  colorLabel: COLOR_OPTIONS[0].label,
  textColor: COLOR_OPTIONS[0].textColor,
  strokeColor: COLOR_OPTIONS[0].strokeColor,
  width: true,
  weight: true,
  italic: true,
  alpha: false,
  flex: true,
  stroke: false,
  scale: false,
  minFontSize: 36,
  strokeWidth: 2,
})

function pickText(preset: (typeof TEXT_PRESETS)[number]) {
  pressure.textLabel = preset.label
  pressure.text = preset.value
}

function pickColor(preset: (typeof COLOR_OPTIONS)[number]) {
  pressure.colorLabel = preset.label
  pressure.textColor = preset.textColor
  pressure.strokeColor = preset.strokeColor
}

type NumberKey = 'minFontSize' | 'strokeWidth'

const SLIDERS: { key: NumberKey; label: string; min: number; max: number; step: number; unit?: string }[] = [
  { key: 'minFontSize', label: '最小字号', min: 16, max: 140, step: 2, unit: 'px' },
  { key: 'strokeWidth', label: '描边宽度', min: 1, max: 8, step: 0.5, unit: 'px' },
]

function setSlider(key: NumberKey, value: number[] | undefined) {
  const v = value?.[0]
  if (typeof v === 'number') pressure[key] = v
}

const TOGGLES: { key: 'width' | 'weight' | 'italic' | 'alpha' | 'flex' | 'stroke' | 'scale'; label: string; hint: string }[] = [
  { key: 'width', label: '宽度轴 wdth', hint: '离光标近的字被拉宽（5 → 200）' },
  { key: 'weight', label: '粗细轴 wght', hint: '离光标近的字变粗（100 → 900）' },
  { key: 'italic', label: '斜体轴 ital / slnt', hint: '离光标近的字变斜（两个轴都写，字体有哪个就用哪个）' },
  { key: 'alpha', label: '按距离改透明度', hint: '越远越淡' },
  { key: 'flex', label: 'flex 均匀分布', hint: '字符用 flex 撑满整行（上游默认开）' },
  { key: 'stroke', label: '描边副本', hint: '在字后面叠一层 -webkit-text-stroke' },
  { key: 'scale', label: '纵向拉伸填满', hint: '按容器高度把文字纵向拉满' },
]

const replay = ref(0)

const usageSnippet = computed(
  () => `<div style="position: relative; height: 320px">
  <TextPressure
    text="${pressure.text}"
    font-family="${FONT_FAMILY}"
    :width="${pressure.width}"
    :weight="${pressure.weight}"
    :italic="${pressure.italic}"
    :alpha="${pressure.alpha}"
    :flex="${pressure.flex}"
    :stroke="${pressure.stroke}"
    text-color="${pressure.textColor}"
    stroke-color="${pressure.strokeColor}"
    :min-font-size="${pressure.minFontSize}"
  />
</div>`,
)

const PROPS = [
  { name: 'text', type: 'string', def: "'Compressa'", desc: '文案（强制大写，与上游一致）' },
  { name: 'fontFamily', type: 'string', def: "'Roboto Flex Variable'", desc: "可变字体族名（Fontsource 可变包用带 `Variable` 后缀的族名）" },
  { name: 'fontUrl', type: 'string', def: "''", desc: '外部字体样式表地址；**留空则不注入任何外部样式表**（默认），字体由使用方本地加载' },
  { name: 'width', type: 'boolean', def: 'true', desc: "变宽轴：`'wdth' 5 → 200`" },
  { name: 'weight', type: 'boolean', def: 'true', desc: "变粗轴：`'wght' 100 → 900`" },
  { name: 'italic', type: 'boolean', def: 'true', desc: "斜体轴：`'ital' 0 → 1`" },
  { name: 'alpha', type: 'boolean', def: 'false', desc: '按距离改透明度（越远越淡）' },
  { name: 'flex', type: 'boolean', def: 'true', desc: '字符用 `flex + justify-between` 撑满整行' },
  { name: 'stroke', type: 'boolean', def: 'false', desc: '在字后叠一层描边副本（`-webkit-text-stroke`）' },
  { name: 'scale', type: 'boolean', def: 'false', desc: '按容器高度纵向拉伸（`scale(1, y)` + 同步 line-height）' },
  { name: 'textColor', type: 'string', def: "'--color-foreground'", desc: '文字颜色；传 `--color-*` 变量名跟随主题（上游是 #FFFFFF）' },
  { name: 'strokeColor', type: 'string', def: "'--color-primary'", desc: '描边颜色；传 `--color-*` 变量名跟随主题（上游是 #FF0000）' },
  { name: 'strokeWidth', type: 'number', def: '2', desc: '描边宽度（px）' },
  { name: 'minFontSize', type: 'number', def: '24', desc: '最小字号（窄容器不至于把字压得太小）' },
  { name: '（expose）refresh', type: '() => void', def: '—', desc: '手动重算字号 / 尺寸（一般不用调，容器变化会自动重算）' },
]
</script>

<template>
  <div class="mx-auto max-w-5xl px-6 py-10">
    <h1 class="text-3xl font-bold tracking-tight">挤压文字 TextPressure</h1>
    <p class="mt-3 text-muted-foreground">
      光标附近的字会被<strong>可变字体</strong>「挤」宽挤粗 —— 逐字按「字到光标的距离」写
      <code>font-variation-settings</code>。<strong>移植自 React Bits</strong>（MIT，源自 Juan Fuentes 的 CodePen）：
      上游用常驻 rAF 逐帧刷，这里只在<strong>光标还在动 / 还没收敛</strong>时跑 rAF，停下来就停。
    </p>
    <p class="mt-2 rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-300">
      ⚠️ 这个效果<strong>依赖可变字体</strong>：文档站已把 Roboto Flex <strong>本地自托管</strong>
      （<code>@fontsource-variable/roboto-flex/standard.css</code>），<strong>不请求外网</strong>。
      消费方需要自己装这个包（或给 <code>font-url</code> 传一个地址）；字体没有 <code>wght</code> / <code>wdth</code> / <code>slnt</code> 轴时，只有透明度 / 描边这类效果可见
      —— 中文可变字体极少，所以中文文案基本看不到挤压。
      <br>
      注意族名：Fontsource 的可变包注册的是 <code>'Roboto Flex Variable'</code>（默认值），而 Google Fonts 的 CSS 注册的是 <code>'Roboto Flex'</code>。
    </p>

    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">示例</h2>
        <CardDescription>把鼠标移到文字上左右晃一晃；不动时它会停在最后一个位置。</CardDescription>
      </CardHeader>
      <CardContent class="space-y-6">
        <div class="h-[400px] overflow-hidden rounded-xl border border-border bg-muted/40">
          <TextPressure
            :key="replay"
            :text="pressure.text"
            :font-family="FONT_FAMILY"
            :width="pressure.width"
            :weight="pressure.weight"
            :italic="pressure.italic"
            :alpha="pressure.alpha"
            :flex="pressure.flex"
            :stroke="pressure.stroke"
            :scale="pressure.scale"
            :text-color="pressure.textColor"
            :stroke-color="pressure.strokeColor"
            :stroke-width="pressure.strokeWidth"
            :min-font-size="pressure.minFontSize"
          />
        </div>

        <div class="grid gap-5 sm:grid-cols-2">
          <div class="space-y-2">
            <p class="text-sm font-semibold">文案</p>
            <div class="flex flex-wrap gap-2">
              <Button
                v-for="t in TEXT_PRESETS"
                :key="t.label"
                :variant="pressure.textLabel === t.label ? 'default' : 'outline'"
                size="sm"
                @click="pickText(t)"
              >{{ t.label }}</Button>
            </div>
          </div>

          <div class="space-y-2">
            <p class="text-sm font-semibold">配色</p>
            <div class="flex flex-wrap gap-2">
              <Button
                v-for="c in COLOR_OPTIONS"
                :key="c.label"
                :variant="pressure.colorLabel === c.label ? 'default' : 'outline'"
                size="sm"
                @click="pickColor(c)"
              >{{ c.label }}</Button>
            </div>
          </div>

          <div class="space-y-2">
            <p class="text-sm font-semibold">其他</p>
            <Button variant="outline" size="sm" @click="replay++">重播（重新挂载）</Button>
          </div>
        </div>

        <div class="space-y-4 rounded-lg border border-border p-4">
          <p class="text-sm font-semibold">开关</p>
          <div class="grid gap-3 sm:grid-cols-2">
            <label
              v-for="t in TOGGLES"
              :key="t.key"
              class="flex cursor-pointer items-center justify-between gap-4 rounded-md px-1 py-1"
            >
              <span class="space-y-0.5">
                <span class="block text-sm">{{ t.label }}</span>
                <span class="block text-xs text-muted-foreground">{{ t.hint }}</span>
              </span>
              <Switch v-model="pressure[t.key]" />
            </label>
          </div>
        </div>

        <div class="space-y-4 rounded-lg border border-border p-4">
          <p class="text-sm font-semibold">参数</p>
          <div class="grid gap-4 sm:grid-cols-2">
            <div v-for="s in SLIDERS" :key="s.key" class="space-y-1.5">
              <div class="flex items-baseline justify-between">
                <span class="text-xs text-muted-foreground">{{ s.label }}</span>
                <span class="text-xs font-medium tabular-nums">{{ pressure[s.key] }}{{ s.unit ?? '' }}</span>
              </div>
              <Slider
                :model-value="[pressure[s.key]]"
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
            <li><strong>字号是按容器算的</strong>：<code>fontSize = 容器宽 / (字符数 / 2)</code>（大写字母平均宽度 ≈ 0.5em，所以整行刚好铺满），再取 <code>minFontSize</code> 兜底。</li>
            <li><strong>距离公式与上游逐字一致</strong>：<code>getAttr(d, maxDist, min, max)</code>，其中 <code>maxDist = 标题宽 / 2</code>；越近越接近 <code>max</code>。</li>
            <li>三个轴的范围：<code>wdth</code> 5 ~ 200、<code>wght</code> 100 ~ 900、<code>ital / slnt</code> 0 ~ 1 / 0 ~ -10（Roboto Flex 只有 <code>slnt</code>，所以两个轴都写，字体没有哪个就忽略哪个）；关掉某个轴就用固定值（100 / 400 / 0）。</li>
            <li>光标位置做了平滑跟随（每帧向目标移动 1/15），所以不会一格一格跳；初始位置是容器中心，所以刚进页面时中间那几个字最宽。</li>
            <li><strong>不做常驻 rAF</strong>：只有指针移动（或还没追上目标）时才跑，静下来就停 —— 省电，后台标签页也不会白跑。</li>
            <li>每个字符的宽度会随轴变化，进而推动后面的字符 —— 所以每帧都重新量一次字符中心（与上游一致），这个反馈正是「挤压」的观感来源。</li>
            <li><code>scale</code> 会先复位 <code>scaleY / lineHeight</code> 再测高度，避免上一次的缩放把测量结果带偏（上游同款处理）。</li>
            <li><code>flex</code> 模式下字符用 <code>justify-content: space-between</code> 撑满整行，挤压感更明显。</li>
            <li>字体<strong>不请求外网</strong>：文档站用 <code>@fontsource-variable/roboto-flex/standard.css</code>（自托管）；组件的 <code>fontUrl</code> 默认空，只有显式传地址时才会注入 <code>&lt;link&gt;</code>，而且用 <code>media=&quot;print&quot;</code> → <code>load</code> 后切 <code>all</code> 的非阻塞写法（直接挂会导致首屏白屏）。</li>
          </ul>
        </div>
      </CardContent>
    </Card>

    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">API</h2>
        <CardDescription><code>import { TextPressure } from '@/components/motion'</code></CardDescription>
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
