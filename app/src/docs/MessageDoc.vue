<script setup lang="ts">
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Bubble, BubbleContent } from '@/components/ui/bubble'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
  MessageGroup,
  MessageHeader,
} from '@/components/ui/message'

// ---------- API ----------
const rows = [
  { name: 'Message', type: "'start' | 'end'", def: "'start'", desc: '一行消息的根：横向 flex（头像 + 内容），gap-2 / text-sm 由它统一控制；<code>align="end"</code> 时整行 flex-row-reverse，头像跑到右边' },
  { name: 'MessageAvatar', type: 'class', def: '—', desc: '头像位：2rem 圆形 + bg-muted，底部对齐（self-end）；<b>Message 里出现 MessageFooter 时会自动上移 2rem</b>，免得头像被时间行顶到中间' },
  { name: 'MessageContent', type: 'class', def: '—', desc: '内容列：竖向排布（gap-2.5），标题 / 气泡 / 时间都塞这里；end 对齐时内部带 data-slot 的直接子元素会自动靠右' },
  { name: 'MessageHeader', type: 'class', def: '—', desc: '顶部小字（12px / muted），通常放发送者名字；左右内边距 12px，配 ghost 气泡时自动变成 0' },
  { name: 'MessageFooter', type: 'class', def: '—', desc: '底部小字，通常放时间 / 状态；样式同 Header，end 对齐时整行右对齐' },
  { name: 'MessageGroup', type: 'class', def: '—', desc: '多条消息的纵向分组（gap-2），适合「同一话题连着几条」' },
]

const slots = [
  { name: '六个部件', desc: '都是单默认插槽，内容直接写在标签里（没有命名插槽）' },
  { name: 'MessageAvatar', desc: '一般放 Avatar（自带 size-8，与头像位同尺寸）；放图片或纯色块也可以' },
]
</script>

<template>
  <div class="mx-auto max-w-5xl px-6 py-10">
    <h1 class="text-3xl font-bold tracking-tight">Message 消息</h1>
    <p class="mt-3 text-muted-foreground">
      对话里<b>一行消息的布局骨架</b>：<code>Message</code>（横排）里放 <code>MessageAvatar</code>（头像）+
      <code>MessageContent</code>（内容列）。<br />
      内容列里再按顺序塞 <code>MessageHeader</code>（发送者）、<code>Bubble</code>（气泡正文）、
      <code>MessageFooter</code>（时间 / 状态）。<br />
      它<b>只管排版不管长相</b> —— 气泡样式归 <code>Bubble</code>，所以既可以配气泡聊天气泡，也可以做纯文本的消息流。<br />
      <code>align</code> 决定这条消息是对方（<code>start</code>，头像在左）还是自己（<code>end</code>，整行反向）。
    </p>

    <!-- 1. 基础用法 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">基础用法</h2>
        <CardDescription>
          最小的组合：<code>Message</code> + <code>MessageAvatar</code> + <code>MessageContent</code>。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Message>
          <MessageAvatar>
            <Avatar>
              <AvatarFallback>R</AvatarFallback>
            </Avatar>
          </MessageAvatar>
          <MessageContent>
            我把 registry 里失效的路由清掉了，顺手补上了这篇文档。
          </MessageContent>
        </Message>
      </CardContent>
    </Card>

    <!-- 2. 头部 / 尾部 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">头部与尾部</h2>
        <CardDescription>
          <code>MessageHeader</code> 放发送者，<code>MessageFooter</code> 放时间 / 状态，都在 <code>MessageContent</code> 里、气泡的前后。<br />
          注意两条消息的<b>头像位置</b>：带 Footer 的那条（下面第一条）头像会自动往上挪，不会被时间行挤下去。
        </CardDescription>
      </CardHeader>
      <CardContent class="flex flex-col gap-6">
        <Message>
          <MessageAvatar>
            <Avatar>
              <AvatarFallback>R</AvatarFallback>
            </Avatar>
          </MessageAvatar>
          <MessageContent>
            <MessageHeader>Rion</MessageHeader>
            <Bubble variant="secondary">
              <BubbleContent>这个接口的返回结构我看下。</BubbleContent>
            </Bubble>
            <MessageFooter>10:24</MessageFooter>
          </MessageContent>
        </Message>

        <Message>
          <MessageAvatar>
            <Avatar>
              <AvatarFallback>R</AvatarFallback>
            </Avatar>
          </MessageAvatar>
          <MessageContent>
            <MessageHeader>Rion</MessageHeader>
            <Bubble variant="secondary">
              <BubbleContent>没有时间行时，头像就贴在最后一行文字旁边。</BubbleContent>
            </Bubble>
          </MessageContent>
        </Message>
      </CardContent>
    </Card>

    <!-- 3. 自己发的（align=end） -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">对方 / 自己（align）</h2>
        <CardDescription>
          <code>align="start"</code>（默认）是对方，<code>align="end"</code> 是自己：整行反向（头像到右边），
          <code>MessageFooter</code> 也改成右对齐。<br />
          气泡<b>左右贴哪边由 Bubble 自己决定</b>（<code>align</code> 一起传即可），Message 只负责把这一行翻过来。
        </CardDescription>
      </CardHeader>
      <CardContent class="flex flex-col gap-6">
        <Message>
          <MessageAvatar>
            <Avatar>
              <AvatarFallback>R</AvatarFallback>
            </Avatar>
          </MessageAvatar>
          <MessageContent>
            <MessageHeader>Rion</MessageHeader>
            <Bubble variant="secondary" align="start">
              <BubbleContent>字段说明我稍后发你。</BubbleContent>
            </Bubble>
          </MessageContent>
        </Message>

        <Message align="end">
          <MessageAvatar>
            <Avatar>
              <AvatarFallback>我</AvatarFallback>
            </Avatar>
          </MessageAvatar>
          <MessageContent>
            <MessageHeader>我</MessageHeader>
            <Bubble align="end">
              <BubbleContent>收到，谢谢！</BubbleContent>
            </Bubble>
            <MessageFooter>10:26 · 已读</MessageFooter>
          </MessageContent>
        </Message>
      </CardContent>
    </Card>

    <!-- 4. 配 ghost 气泡 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">配 ghost 气泡</h2>
        <CardDescription>
          用 <code>Bubble variant="ghost"</code> 时（长回复、文档式输出），头部 / 尾部会自动去掉左右 12px 内边距，
          跟正文左对齐，不会比正文缩进一段。
        </CardDescription>
      </CardHeader>
      <CardContent class="flex flex-col gap-6">
        <Message>
          <MessageAvatar>
            <Avatar>
              <AvatarFallback>AI</AvatarFallback>
            </Avatar>
          </MessageAvatar>
          <MessageContent>
            <MessageHeader>Rion Copilot</MessageHeader>
            <Bubble variant="ghost">
              <BubbleContent>
                这条没有气泡背景。上面那行小字也跟着贴到左边了 —— 联动来自预设里的
                group-has-data-[variant=ghost] 规则，不用手写 class。
              </BubbleContent>
            </Bubble>
            <MessageFooter>刚刚</MessageFooter>
          </MessageContent>
        </Message>
      </CardContent>
    </Card>

    <!-- 5. 多条消息 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">多条消息（MessageGroup）</h2>
        <CardDescription>
          <code>MessageGroup</code> 只是把若干 <code>Message</code> 纵向收拢（gap-2，比手写 flex-col gap-6 更紧凑），
          常用于「同一话题连着几条」。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <MessageGroup>
          <Message>
            <MessageAvatar>
              <Avatar>
                <AvatarFallback>R</AvatarFallback>
              </Avatar>
            </MessageAvatar>
            <MessageContent>
              <Bubble variant="secondary">
                <BubbleContent>构建跑完了吗？</BubbleContent>
              </Bubble>
            </MessageContent>
          </Message>
          <Message>
            <MessageAvatar>
              <Avatar>
                <AvatarFallback>R</AvatarFallback>
              </Avatar>
            </MessageAvatar>
            <MessageContent>
              <Bubble variant="secondary">
                <BubbleContent>我刚点了一次，还在等。</BubbleContent>
              </Bubble>
            </MessageContent>
          </Message>
          <Message align="end">
            <MessageAvatar>
              <Avatar>
                <AvatarFallback>我</AvatarFallback>
              </Avatar>
            </MessageAvatar>
            <MessageContent>
              <Bubble align="end">
                <BubbleContent>好，出结果喊我。</BubbleContent>
              </Bubble>
            </MessageContent>
          </Message>
        </MessageGroup>
      </CardContent>
    </Card>

    <!-- API -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">API / Props</h2>
        <CardDescription>除 <code>Message</code> 的 <code>align</code> 外，其余部件都只有 <code>class</code> 一个 prop。</CardDescription>
      </CardHeader>
      <CardContent class="space-y-6">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b text-left">
                <th class="py-2 pr-4 font-medium">组件</th>
                <th class="py-2 pr-4 font-medium">Props</th>
                <th class="py-2 pr-4 font-medium">默认值</th>
                <th class="py-2 font-medium">说明</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in rows" :key="row.name" class="border-b last:border-0">
                <td class="py-2 pr-4"><code>{{ row.name }}</code></td>
                <td class="py-2 pr-4 font-mono text-xs text-muted-foreground">{{ row.type }}</td>
                <td class="py-2 pr-4 font-mono text-xs text-muted-foreground">{{ row.def }}</td>
                <td class="py-2 text-muted-foreground" v-html="row.desc" />
              </tr>
            </tbody>
          </table>
        </div>

        <div>
          <p class="mb-2 text-sm font-medium">插槽</p>
          <ul class="space-y-1 text-sm text-muted-foreground">
            <li v-for="s in slots" :key="s.name">
              · <code>{{ s.name }}</code>：{{ s.desc }}
            </li>
          </ul>
        </div>

        <p class="text-sm text-muted-foreground">
          六个部件都基于 reka-ui 的 <code>Primitive</code>，因此都支持 <code>as</code> / <code>asChild</code>
          （比如 <code>as-child</code> 把整条消息变成 <code>&lt;li&gt;</code>）；除 <code>Message</code> 的
          <code>align</code> 外没有别的 props。
        </p>
      </CardContent>
    </Card>
  </div>
</template>
