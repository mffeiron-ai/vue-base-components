<script setup lang="ts">
import { defineComponent, h, onBeforeUnmount, ref } from 'vue'
import { Bubble, BubbleContent } from '@/components/ui/bubble'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { Message, MessageContent } from '@/components/ui/message'
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
  useMessageScroller,
  useMessageScrollerScrollable,
  useMessageScrollerVisibility,
} from '@/components/ui/message-scroller'

// ---------- 演示数据 ----------
interface DemoMessage {
  id: string
  text: string
  mine?: boolean
}

const replies = [
  '这个接口的返回结构我看下。',
  '字段说明我稍后发你。',
  '收到，谢谢！',
  '我先把 registry 里失效的路由清掉。',
  '文档我补了两篇，你回头看看措辞。',
  'Chart 那页的示例数据要换成真实的吗？',
  '不用，示例数据反而更好懂。',
  '那我把注释补全一点。',
  '构建跑完了吗？',
  '还在等，估计再两分钟。',
  '好，出结果喊我。',
  '跑完了，产物 2.1MB。',
  '比之前小了一点。',
  '嗯，字体只留了 latin 子集。',
]

const messages: DemoMessage[] = replies.map((text, i) => ({
  id: `m-${i + 1}`,
  text,
  mine: i % 3 === 2,
}))

/** 跳转演示用的目标消息 */
const jumpTargets = ['m-1', 'm-6', 'm-12']

/** 流式追加演示：一开始只显示 2 条，点按钮逐条补上 */
const streamMessages = messages.slice(0, 5)
const streamShown = ref(2)
const streamRunning = ref(false)
let streamTimer: ReturnType<typeof setInterval> | null = null

function playStream() {
  if (streamRunning.value)
    return
  streamRunning.value = true
  streamTimer = setInterval(() => {
    if (streamShown.value >= streamMessages.length) {
      stopStream()
      return
    }
    streamShown.value += 1
  }, 450)
}

function stopStream() {
  if (streamTimer)
    clearInterval(streamTimer)
  streamTimer = null
  streamRunning.value = false
}

onBeforeUnmount(stopStream)

// ---------- Provider 内的子组件 ----------
/**
 * composable 靠 inject 拿上下文，所以只能在 Provider 内部的**子组件**里调用：
 * 在文档里用渲染函数就地定义一个，免得为演示单独建文件。
 */
const ScrollerTools = defineComponent({
  setup() {
    const { scrollToMessage } = useMessageScroller()
    const scrollable = useMessageScrollerScrollable()
    const visibility = useMessageScrollerVisibility()

    return () => h('div', { class: 'flex flex-wrap items-center gap-2 border-b border-border p-3 text-xs' }, [
      ...jumpTargets.map((id) =>
        h(
          Button,
          {
            key: id,
            variant: 'outline',
            size: 'sm',
            onClick: () => scrollToMessage(id, { align: 'center', behavior: 'smooth' }),
          },
          () => `跳到 ${id}`,
        ),
      ),
      h('span', { class: 'text-muted-foreground' }, `上滚 ${scrollable.value.start ? '✓' : '✗'} · 下滚 ${scrollable.value.end ? '✓' : '✗'}`),
      h('span', { class: 'text-muted-foreground' }, `锚点 ${visibility.value.currentAnchorId ?? '—'}`),
    ])
  },
})

// ---------- API ----------
const providerRows = [
  { name: 'autoScroll', type: 'boolean', def: 'false', desc: '打开后进入「跟随底部」：内容追加 / 尺寸变化时自动滚到底。用户主动上滑（滚轮 / 触摸 / 方向键）会退出跟随，滚回底部附近又自动恢复；滚动条在跟随期间会淡出（<code>data-autoscrolling</code>）' },
  { name: 'defaultScrollPosition', type: "'start' | 'end' | 'last-anchor'", def: "'end'", desc: '首次挂载后停在哪：<code>end</code> 贴底（聊天默认）、<code>start</code> 顶部、<code>last-anchor</code> 停到最后一条 <code>scrollAnchor</code> 的消息' },
  { name: 'scrollEdgeThreshold', type: 'number', def: '8', desc: '判定「还能往上 / 往下滚」的像素阈值，决定 <code>MessageScrollerButton</code> 的显隐与 <code>data-scrollable</code> 的值' },
  { name: 'scrollPreviousItemPeek', type: 'number', def: '64', desc: '判定「当前锚点消息」时的回看余量：视口顶部往上 64px 以内、带 <code>scrollAnchor</code> 的消息就算当前锚点' },
  { name: 'scrollMargin', type: 'number', def: '0', desc: '可见性 / 锚点判定的整体偏移' },
]

const partRows = [
  { name: 'MessageScroller', slot: 'message-scroller', desc: '根容器（<code>flex size-full min-h-0 flex-col overflow-hidden</code>）：高度必须由外部给，它自己和视口都是 <code>size-full</code>；同时输出 <code>data-scrollable="start end"</code> 与 <code>data-autoscrolling</code> 供自定义提示' },
  { name: 'MessageScrollerViewport', slot: 'message-scroller-viewport', desc: '滚动容器：自带 <code>role=region</code> / <code>aria-label="Messages"</code> / <code>tabindex=0</code>（键盘可滚）、滚动渐隐与细滚动条；prop <code>preserveScrollOnPrepend</code>（默认 true）= 往上插入内容时保持视觉位置不跳' },
  { name: 'MessageScrollerContent', slot: 'message-scroller-content', desc: '内容列：<code>role="log"</code> + <code>aria-relevant="additions"</code>、默认 <code>gap-8</code> 与 <code>min-h-full</code>；末尾有个隐藏 spacer 把不足视口的高度补齐，所以短会话也能贴底。prop <code>spacerClass</code>' },
  { name: 'MessageScrollerItem', slot: 'message-scroller-item', desc: '一条消息：<code>messageId</code>（<b>必须字符串</b>）、<code>scrollAnchor</code>（默认 false，可被 <code>scrollToMessage</code> / 锚点判定识别）；自带 <code>content-visibility:auto</code> 与 <code>contain-intrinsic-size</code>，长列表只渲染视口内的' },
  { name: 'MessageScrollerButton', slot: 'message-scroller-button', desc: '回到底部 / 顶部的悬浮按钮：<code>direction</code>（<code>end</code> 默认 / <code>start</code>）、<code>behavior</code>（默认 smooth）、<code>variant</code>（默认 secondary）、<code>size</code>（默认 icon-sm）；到端后自动淡出并 <code>inert</code>，绝对定位在 Scroller 内（end → 距底 1rem 居中）' },
]

const composableRows = [
  { name: 'useMessageScroller()', desc: '<code>scrollToEnd({ behavior })</code>、<code>scrollToStart({ behavior })</code>、<code>scrollToMessage(id, { align, behavior, scrollMargin })</code>，<code>align</code> 取 <code>start / center / end / nearest</code>' },
  { name: 'useMessageScrollerScrollable()', desc: '返回 <code>Ref&lt;{ start, end }&gt;</code>：当前是否还能往上 / 往下滚（做「有新消息」提示条常用）' },
  { name: 'useMessageScrollerVisibility()', desc: '返回 <code>Ref&lt;{ currentAnchorId, visibleMessageIds }&gt;</code>：当前锚点与可见消息 id 列表；内部做引用计数，组件卸载自动释放' },
]
</script>

<template>
  <div class="mx-auto max-w-5xl px-6 py-10">
    <h1 class="text-3xl font-bold tracking-tight">Message Scroller 消息滚动区</h1>
    <p class="mt-3 text-muted-foreground">
      聊天 / 流式输出的<b>滚动引擎</b>：把消息列表交给它，它负责「贴底跟随、用户上滑就停下、往上加载不跳位、跳到某条消息、回到底部按钮」。<br />
      结构固定四层：<code>MessageScrollerProvider</code>（只提供上下文，不渲染节点）→
      <code>MessageScroller</code>（根）→ <code>MessageScrollerViewport</code>（滚动容器）→
      <code>MessageScrollerContent</code>（内容列，每条消息再包一层 <code>MessageScrollerItem</code>）。<br />
      注意<b>高度要由外部容器给</b>：Provider 不渲染节点，写在外层的 div 上（如 <code>h-72</code>），否则滚动区撑不开。
    </p>

    <!-- 1. 基础用法 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">基础用法</h2>
        <CardDescription>
          套上四层结构，消息各自包一层 <code>MessageScrollerItem</code>（<code>message-id</code> 必填）。<br />
          默认 <code>default-scroll-position="end"</code>，所以一进来就贴底；内容超出一屏后，
          右下角会自动出现「回到底部」按钮，滚到底它自己再淡出。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div class="h-72 overflow-hidden rounded-lg border border-input">
          <MessageScrollerProvider>
            <MessageScroller>
              <MessageScrollerViewport>
                <MessageScrollerContent class="gap-4 p-4">
                  <MessageScrollerItem v-for="m in messages" :key="m.id" :message-id="m.id">
                    <Message :align="m.mine ? 'end' : 'start'">
                      <MessageContent>
                        <Bubble :variant="m.mine ? 'default' : 'secondary'" :align="m.mine ? 'end' : 'start'">
                          <BubbleContent>{{ m.text }}</BubbleContent>
                        </Bubble>
                      </MessageContent>
                    </Message>
                  </MessageScrollerItem>
                </MessageScrollerContent>
              </MessageScrollerViewport>
              <MessageScrollerButton />
            </MessageScroller>
          </MessageScrollerProvider>
        </div>
      </CardContent>
    </Card>

    <!-- 2. 跳转与状态读数 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">跳到某条消息与状态读数</h2>
        <CardDescription>
          用 <code>useMessageScroller()</code> 的 <code>scrollToMessage(id, { align })</code> 跳转
          （<code>align</code> 取 <code>start / center / end / nearest</code>）。<br />
          <code>useMessageScrollerScrollable()</code> 给「还能不能往上 / 往下滚」，
          <code>useMessageScrollerVisibility()</code> 给「当前锚点 + 可见消息」——
          下面工具条就是这两条实时读数的效果。<br />
          两者都要在 <b>Provider 内部的子组件</b>里调用（靠 inject 拿上下文，直接在文档组件里调会抛错）。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div class="flex h-80 flex-col overflow-hidden rounded-lg border border-input">
          <MessageScrollerProvider>
            <ScrollerTools />
            <MessageScroller class="min-h-0 flex-1">
              <MessageScrollerViewport>
                <MessageScrollerContent class="gap-4 p-4">
                  <MessageScrollerItem
                    v-for="(m, i) in messages"
                    :key="m.id"
                    :message-id="m.id"
                    :scroll-anchor="i % 5 === 0"
                  >
                    <Message :align="m.mine ? 'end' : 'start'">
                      <MessageContent>
                        <Bubble :variant="m.mine ? 'default' : 'secondary'" :align="m.mine ? 'end' : 'start'">
                          <BubbleContent>{{ m.text }}</BubbleContent>
                        </Bubble>
                      </MessageContent>
                    </Message>
                  </MessageScrollerItem>
                </MessageScrollerContent>
              </MessageScrollerViewport>
              <MessageScrollerButton />
            </MessageScroller>
          </MessageScrollerProvider>
        </div>
        <p class="mt-3 text-sm text-muted-foreground">
          这条演示里每 5 条挂了一个 <code>scroll-anchor</code>：往上翻时，工具条右侧的「锚点」会跟着换成当前停在的那条；
          不挂锚点的消息也能被 <code>scrollToMessage</code> 定位，只是不参与锚点判定。
        </p>
      </CardContent>
    </Card>

    <!-- 3. 自动跟随 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">自动跟随（流式追加）</h2>
        <CardDescription>
          <code>auto-scroll</code> 打开后就是「跟随底部」模式：内容变高（新消息、逐字输出、图片加载完）都会自动滚到底。<br />
          用户一旦主动往上滑就退出跟随（此时新内容不再打断阅读），滚回底部附近会自己恢复。
          点下面的按钮模拟逐条追加：先手动往上滑，再点一次看看区别。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-3">
        <div class="h-72 overflow-hidden rounded-lg border border-input">
          <MessageScrollerProvider auto-scroll>
            <MessageScroller>
              <MessageScrollerViewport>
                <MessageScrollerContent class="gap-4 p-4">
                  <MessageScrollerItem
                    v-for="m in streamMessages.slice(0, streamShown)"
                    :key="m.id"
                    :message-id="m.id"
                  >
                    <Message :align="m.mine ? 'end' : 'start'">
                      <MessageContent>
                        <Bubble :variant="m.mine ? 'default' : 'secondary'" :align="m.mine ? 'end' : 'start'">
                          <BubbleContent>{{ m.text }}</BubbleContent>
                        </Bubble>
                      </MessageContent>
                    </Message>
                  </MessageScrollerItem>
                </MessageScrollerContent>
              </MessageScrollerViewport>
              <MessageScrollerButton />
            </MessageScroller>
          </MessageScrollerProvider>
        </div>
        <div class="flex items-center gap-2">
          <Button size="sm" :disabled="streamRunning || streamShown >= streamMessages.length" @click="playStream">
            {{ streamShown >= streamMessages.length ? '已全部追加' : '模拟流式追加' }}
          </Button>
          <Button variant="outline" size="sm" @click="streamShown = 2; stopStream()">
            重置
          </Button>
          <span class="text-sm text-muted-foreground">已显示 {{ Math.min(streamShown, streamMessages.length) }} / {{ streamMessages.length }} 条</span>
        </div>
      </CardContent>
    </Card>

    <!-- API -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">API / Props</h2>
        <CardDescription><code>MessageScrollerProvider</code> 的 props（其余部件都只有 <code>class</code>）。</CardDescription>
      </CardHeader>
      <CardContent class="space-y-6">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b text-left">
                <th class="py-2 pr-4 font-medium">Props</th>
                <th class="py-2 pr-4 font-medium">类型</th>
                <th class="py-2 pr-4 font-medium">默认值</th>
                <th class="py-2 font-medium">说明</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in providerRows" :key="row.name" class="border-b last:border-0">
                <td class="py-2 pr-4"><code>{{ row.name }}</code></td>
                <td class="py-2 pr-4 text-muted-foreground">{{ row.type }}</td>
                <td class="py-2 pr-4 text-muted-foreground">{{ row.def }}</td>
                <td class="py-2 text-muted-foreground" v-html="row.desc" />
              </tr>
            </tbody>
          </table>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b text-left">
                <th class="py-2 pr-4 font-medium">组件</th>
                <th class="py-2 pr-4 font-medium">data-slot</th>
                <th class="py-2 font-medium">说明</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in partRows" :key="row.name" class="border-b last:border-0">
                <td class="py-2 pr-4"><code>{{ row.name }}</code></td>
                <td class="py-2 pr-4 text-muted-foreground"><code>{{ row.slot }}</code></td>
                <td class="py-2 text-muted-foreground" v-html="row.desc" />
              </tr>
            </tbody>
          </table>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b text-left">
                <th class="py-2 pr-4 font-medium">Composable</th>
                <th class="py-2 font-medium">说明（都要在 Provider 内部的子组件里用）</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in composableRows" :key="row.name" class="border-b last:border-0">
                <td class="py-2 pr-4"><code>{{ row.name }}</code></td>
                <td class="py-2 text-muted-foreground" v-html="row.desc" />
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
