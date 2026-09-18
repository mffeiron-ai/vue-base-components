<script setup lang="ts">
import { ref } from 'vue'
import { toast } from 'vue-sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Toaster } from '@/components/ui/sonner'
import { Badge } from '@/components/ui/badge'

/* ── 位置 / 主题 / 开关（都作用到同一个 Toaster 上）── */
const position = ref<'top-left' | 'top-right' | 'top-center' | 'bottom-left' | 'bottom-right' | 'bottom-center'>('bottom-right')
const theme = ref<'light' | 'dark' | 'system'>('system')
const richColors = ref(true)
const closeButton = ref(false)
const expand = ref(false)
const duration = ref(4000)

/* ── Promise 演示 ── */
const promiseState = ref('还没跑')
async function runPromise() {
  promiseState.value = '进行中…'
  const p = new Promise<string>((resolve, reject) => {
    setTimeout(() => (Math.random() > 0.35 ? resolve('ok') : reject(new Error('boom'))), 1800)
  })
  // 注意：vue-sonner 的 toast.promise() **不返回** 那个 Promise（上游 sonner 的 React 版才返回），
  // 所以想过后续处理得自己留着引用，不能写 toast.promise(...).then(...)。
  toast.promise(p, {
    loading: '正在保存…',
    success: '保存成功',
    error: '保存失败，请重试',
  })
  try {
    await p
    promiseState.value = '成功'
  }
  catch {
    promiseState.value = '失败（这次随机到了失败）'
  }
}

/* ── 手动关闭 ── */
let stickyId: string | number | undefined
function openSticky() {
  stickyId = toast('这条不会自动消失', {
    description: '点「关掉它」用 toast.dismiss(id) 收掉。',
    duration: Number.POSITIVE_INFINITY,
  })
}

/* ── 连弹三条 ── */
// 注意：模板表达式里不能直接写 setTimeout —— 它会被当成组件实例的属性去查（报 _ctx.setTimeout is not a function）
function popThree() {
  toast.success('第一条')
  window.setTimeout(() => toast.error('第二条'), 220)
  window.setTimeout(() => toast('第三条'), 440)
}

/* ── API 表 ── */
const toasterRows = [
  { name: 'position', type: "'top-left' | 'top-right' | 'top-center' | 'bottom-left' | 'bottom-right' | 'bottom-center'", def: "'bottom-right'", desc: '全局默认位置。单条 toast 也能用 <code>toast(msg, { position })</code> 覆盖' },
  { name: 'theme', type: "'light' | 'dark' | 'system'", def: "'system'", desc: '配色。<code>system</code> 跟随系统的 <code>prefers-color-scheme</code>；文档站这种自管暗色的场景可以显式传 <code>dark</code> / <code>light</code>' },
  { name: 'richColors', type: 'boolean', def: 'false', desc: '<b>语义配色</b>：success / error / warning / info 各用一套底色（不打开的话四种类型长得几乎一样）' },
  { name: 'closeButton', type: 'boolean', def: 'false', desc: '每条右上角带一个关闭按钮（图标槽在组件里换成了 lucide 的 <code>X</code>）' },
  { name: 'duration', type: 'number', def: '4000', desc: '默认停留毫秒数。单条可以用 <code>toast(msg, { duration })</code> 覆盖，传 <code>Infinity</code> 就永不自动关闭' },
  { name: 'expand', type: 'boolean', def: 'false', desc: '多条叠在一起时是否<b>全部展开</b>；默认只展开悬停/聚焦的那一条，其余收成一条摞' },
  { name: 'visibleToasts', type: 'number', def: '3', desc: '最多同时显示几条，多出来的排队' },
  { name: 'gap / offset', type: 'number | string | {top,right,bottom,left}', def: '14 / 32', desc: '条目间距与距屏幕边缘的距离；<code>mobileOffset</code> 单独管移动端' },
  { name: 'invert', type: 'boolean', def: 'false', desc: '反色（亮底黑字，用来在深色界面里突出）' },
  { name: 'dir / swipeDirections', type: "'rtl' | 'ltr' | 'auto' / SwipeDirection[]", def: "'auto' / 右侧位置默认 ['right']", desc: '阅读方向，以及允许往哪些方向滑掉' },
  { name: 'hotkey', type: 'string[]', def: "['altKey','KeyT']", desc: '聚焦到最新一条 toast 的快捷键（默认 Alt+T），聚焦后可用 Tab 遍历操作按钮' },
  { name: 'toastOptions', type: 'ToastOptions', def: '—', desc: '所有 toast 的默认项（<code>class</code> / <code>style</code> / <code>duration</code> / <code>unstyled</code> …）。<b>本库在这里注入了 <code>cn-toast</code></b>，各风格的圆角靠它' },
  { name: 'class', type: 'string', def: '—', desc: '挂在容器上（默认已带 <code>toaster group</code>），改整体样式从这里进' },
]

const toastRows = [
  { name: 'toast(message)', desc: '普通提示。第二个参数是 options 对象（见下）' },
  { name: 'toast.success / error / info / warning', desc: '四种语义类型，图标已在组件里换成 lucide（<code>CircleCheck</code> / <code>OctagonX</code> / <code>Info</code> / <code>TriangleAlert</code>）' },
  { name: 'toast.loading(message, opts?)', desc: '转圈提示（<code>Loader2</code> + <code>animate-spin</code>）。<b>默认不自动消失</b>，记得给 <code>duration</code> 或自己 dismiss' },
  { name: 'toast.promise(promise, { loading, success, error })', desc: '一条 toast 跟着 Promise 状态自己变：先 loading、成功换 success、失败换 error。<b>注意它不返回那个 Promise</b>（实测 <code>.then</code> 会报 <code>not a function</code>）—— 需要后续处理就自己留着原 Promise 的引用' },
  { name: 'toast.dismiss(id?)', desc: '关掉指定的一条（<code>toast()</code> 的返回值就是 id）；不传参数则清空全部' },
  { name: 'toast.custom(component, opts?)', desc: '完全自定义内容的 toast（不受内置样式约束）' },
]

const optionRows = [
  { name: 'description', type: 'string', desc: '标题下面那行补充说明' },
  { name: 'action / cancel', type: '{ label, onClick }', desc: '右侧的操作按钮与取消按钮（都带 <code>onClick</code>）；点完默认会关掉这条 toast' },
  { name: 'duration', type: 'number', desc: '覆盖全局的停留时间，<code>Infinity</code> 表示不自动关' },
  { name: 'id', type: 'string | number', desc: '指定 id —— 同一个 id 会**复用同一条** toast（适合进度更新）' },
  { name: 'position', type: 'Position', desc: '单独指定这条的位置' },
  { name: 'icon', type: 'Component', desc: '换掉左侧图标' },
  { name: 'class / style / classes', type: 'string / CSSProperties / object', desc: '单条的自定义样式（<code>classes</code> 能分别给 title / description / actionButton 等部位加类）' },
  { name: 'onDismiss / onAutoClose', type: '(t) => void', desc: '被手动关掉 / 自动超时关掉时的回调' },
]
</script>

<template>
  <div class="mx-auto max-w-5xl px-6 py-10">
    <h1 class="text-3xl font-bold tracking-tight">Sonner Toast 通知</h1>
    <p class="mt-3 text-muted-foreground">
      全局的轻提示：屏幕边缘弹出一条，几秒后自己消失，不打断操作。<br />
      用法分两半 —— <code>&lt;Toaster /&gt;</code>（本库包装，放在页面里渲染容器、负责位置/主题/配色）+
      <code>toast()</code> 函数（来自 <code>vue-sonner</code>，在任何地方调用都能弹）。
      <b>一个页面放一个 <code>&lt;Toaster /&gt;</code> 就够了</b>，多个实例会互相抢。<br />
      另外别忘了在应用入口引一次它自带的样式（toast 的宽度、配色、动画、堆叠全靠它）：
      <code>import 'vue-sonner/style.css'</code> —— 并且要写在自己样式<b>之前</b>，否则各风格的圆角会盖不过去。
    </p>

    <!-- 1. 基础 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">基础用法</h2>
        <CardDescription>
          六种调用方式。<code>toast()</code> 是普通提示，另外四种是语义类型（图标不同）；
          <code>toast.loading()</code> 默认<b>不会自己消失</b>，所以这里给它 1.6 秒。<br />
          开着 <code>richColors</code> 时四种类型会各用一套底色，关掉就只靠图标区分。
        </CardDescription>
      </CardHeader>
      <CardContent class="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" @click="toast('这是一条普通提示')">
          普通
        </Button>
        <Button variant="outline" size="sm" @click="toast.success('保存成功')">
          success
        </Button>
        <Button variant="outline" size="sm" @click="toast.info('有新版本可用')">
          info
        </Button>
        <Button variant="outline" size="sm" @click="toast.warning('磁盘空间不足 10%')">
          warning
        </Button>
        <Button variant="outline" size="sm" @click="toast.error('请求失败：502')">
          error
        </Button>
        <Button variant="outline" size="sm" @click="toast.loading('正在上传…', { duration: 1600 })">
          loading
        </Button>
      </CardContent>
    </Card>

    <!-- 2. 描述与操作 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">描述、操作按钮与手动关闭</h2>
        <CardDescription>
          <code>description</code> 是标题下的补充说明，<code>action</code> / <code>cancel</code> 是右侧两个按钮
          （各自带 <code>onClick</code>，点完默认关掉这条）。<br />
          <code>toast()</code> 的<b>返回值就是 id</b>，想让它一直留着可以传 <code>duration: Infinity</code>，之后手动
          <code>toast.dismiss(id)</code>。
        </CardDescription>
      </CardHeader>
      <CardContent class="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          @click="toast('已删除「设计规范.pdf」', {
            description: '文件会保留在回收站 30 天。',
            action: { label: '撤销', onClick: () => toast.success('已撤销') },
            cancel: { label: '知道了', onClick: () => {} },
          })"
        >
          撤销操作
        </Button>
        <Button variant="outline" size="sm" @click="openSticky">
          打开一条常驻的
        </Button>
        <Button variant="outline" size="sm" @click="toast.dismiss(stickyId)">
          关掉它
        </Button>
        <Button variant="outline" size="sm" @click="toast.dismiss()">
          全部清空
        </Button>
      </CardContent>
    </Card>

    <!-- 3. Promise -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">Promise：一条 toast 走完全程</h2>
        <CardDescription>
          <code>toast.promise(p, { loading, success, error })</code> —— 先显示 loading，
          等 Promise 落定时原地换成成功或失败，不用自己记 id。<br />
          <b>它不返回那个 Promise</b>（实测写 <code>.then</code> 会报 <code>not a function</code>），
          需要后续处理就自己保留原 Promise 的引用。下面这个有 35% 概率失败。
        </CardDescription>      </CardHeader>
      <CardContent class="flex flex-wrap items-center gap-3">
        <Button variant="outline" size="sm" @click="runPromise">
          跑一次 Promise
        </Button>
        <Badge variant="secondary">
          {{ promiseState }}
        </Badge>
      </CardContent>
    </Card>

    <!-- 4. 位置 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">位置</h2>
        <CardDescription>
          <code>position</code> 有六个取值，作用到整个 <code>Toaster</code>；
          单条也能用 <code>toast(msg, { position })</code> 单独指定，做「这条必须显眼」的提示。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-3">
        <div class="flex flex-wrap gap-2">
          <Button
            v-for="p in (['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right'] as const)"
            :key="p"
            size="sm"
            :variant="position === p ? 'default' : 'outline'"
            @click="position = p"
          >
            {{ p }}
          </Button>
        </div>
        <div class="flex items-center gap-2 text-sm">
          <span class="text-muted-foreground">当前：</span>
          <Badge variant="secondary">
            {{ position }}
          </Badge>
          <Button variant="outline" size="sm" @click="toast(`我在 ${position}`)">
            弹一条试试
          </Button>
        </div>
      </CardContent>
    </Card>

    <!-- 5. 主题与开关 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">主题、语义色与其它开关</h2>
        <CardDescription>
          这些也都是 <code>Toaster</code> 上的 props（<code>theme</code> 用下面的下拉切换，其余用按钮开关）。<br />
          注意 <code>expand</code>：关闭时多条会收成一条摞、只展开悬停的那条；打开则全部铺开。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="flex flex-wrap items-end gap-4">
          <div class="space-y-2">
            <p class="text-xs font-medium text-muted-foreground">
              theme
            </p>
            <Select :model-value="theme" @update:model-value="(v: any) => theme = v">
              <SelectTrigger class="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">
                  light
                </SelectItem>
                <SelectItem value="dark">
                  dark
                </SelectItem>
                <SelectItem value="system">
                  system（跟随系统）
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="space-y-2">
            <p class="text-xs font-medium text-muted-foreground">
              duration
            </p>
            <div class="flex gap-2">
              <Button
                v-for="d in [2000, 4000, 8000]"
                :key="d"
                size="sm"
                :variant="duration === d ? 'default' : 'outline'"
                @click="duration = d"
              >
                {{ d }}ms
              </Button>
            </div>
          </div>
        </div>

        <div class="flex flex-wrap gap-2">
          <Button
            size="sm"
            :variant="richColors ? 'default' : 'outline'"
            @click="richColors = !richColors"
          >
            richColors：{{ richColors }}
          </Button>
          <Button
            size="sm"
            :variant="closeButton ? 'default' : 'outline'"
            @click="closeButton = !closeButton"
          >
            closeButton：{{ closeButton }}
          </Button>
          <Button
            size="sm"
            :variant="expand ? 'default' : 'outline'"
            @click="expand = !expand"
          >
            expand：{{ expand }}
          </Button>
        </div>

        <Button
          variant="outline"
          size="sm"
          @click="popThree"
        >
          连弹三条看叠放
        </Button>
      </CardContent>
    </Card>

    <!-- 6. API -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">API / Props</h2>
        <CardDescription>
          <code>&lt;Toaster /&gt;</code> 的 props（透传给 <code>vue-sonner</code> 的 <code>Toaster</code>）。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b text-left">
                <th class="py-2 pr-4 font-medium">
                  属性
                </th>
                <th class="py-2 pr-4 font-medium">
                  类型
                </th>
                <th class="py-2 pr-4 font-medium">
                  默认
                </th>
                <th class="py-2 font-medium">
                  说明
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in toasterRows" :key="row.name" class="border-b last:border-0">
                <td class="py-2 pr-4 align-top">
                  <code>{{ row.name }}</code>
                </td>
                <td class="py-2 pr-4 align-top text-xs text-muted-foreground">
                  {{ row.type }}
                </td>
                <td class="py-2 pr-4 align-top text-xs text-muted-foreground">
                  {{ row.def }}
                </td>
                <td class="py-2 align-top" v-html="row.desc" />
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>

    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">toast() 的几种形式</h2>
        <CardDescription>
          从 <code>vue-sonner</code> 导入（本库只包装了 <code>&lt;Toaster /&gt;</code>，函数直接用上游的）。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b text-left">
                <th class="py-2 pr-4 font-medium">
                  调用
                </th>
                <th class="py-2 font-medium">
                  说明
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in toastRows" :key="row.name" class="border-b last:border-0">
                <td class="py-2 pr-4 align-top">
                  <code>{{ row.name }}</code>
                </td>
                <td class="py-2 align-top" v-html="row.desc" />
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>

    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">第二条参数（options）</h2>
        <CardDescription>每种 <code>toast.xxx()</code> 的第二个参数都是同一套配置。</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b text-left">
                <th class="py-2 pr-4 font-medium">
                  字段
                </th>
                <th class="py-2 pr-4 font-medium">
                  类型
                </th>
                <th class="py-2 font-medium">
                  说明
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in optionRows" :key="row.name" class="border-b last:border-0">
                <td class="py-2 pr-4 align-top">
                  <code>{{ row.name }}</code>
                </td>
                <td class="py-2 pr-4 align-top text-xs text-muted-foreground">
                  {{ row.type }}
                </td>
                <td class="py-2 align-top" v-html="row.desc" />
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>

    <!-- 全页唯一的 Toaster（把上面所有开关作用上去） -->
    <Toaster
      :position="position"
      :theme="theme"
      :rich-colors="richColors"
      :close-button="closeButton"
      :expand="expand"
      :duration="duration"
      :visible-toasts="3"
      :offset="24"
    />
  </div>
</template>
