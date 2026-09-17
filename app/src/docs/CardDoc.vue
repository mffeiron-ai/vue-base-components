<script setup lang="ts">
import { ref } from 'vue'
import { ImageIcon, EllipsisIcon, PlusIcon } from 'lucide-vue-next'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

// 可点击卡片示例：记录最后一次点了哪张
const picked = ref('')
// 表单卡片示例：用非受控的 ref 读值（这里只演示布局，不做校验）
const email = ref('')

// 用内联 SVG 当占位封面，文档站不依赖任何外部图片
const cover = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8ea2ff"/><stop offset="1" stop-color="#e4e9ff"/></linearGradient></defs><rect width="640" height="360" fill="url(#g)"/></svg>',
)}`

const props2 = [
  { name: 'size', type: "'default' | 'sm'", def: "'default'", desc: '紧凑尺寸：行间距与纵向内边距更小，子组件的左右内边距也跟着收（由预设的 data-[size=sm] 驱动）' },
  { name: 'class', type: 'string', def: '—', desc: '追加自定义类，经 tailwind-merge 去重；CardHeader / Content / Footer 等子组件同样只有 class' },
]

const parts = [
  { name: 'Card', slot: 'card', desc: '最外层容器：纵向 flex + gap-6 + 圆角/边框/阴影，纵向内边距 py-6；可用 size="sm" 切紧凑' },
  { name: 'CardHeader', slot: 'card-header', desc: '标题区：grid 两行；里面放了 CardAction 就自动切成两列；自带 .border-b 时补 pb-6' },
  { name: 'CardTitle', slot: 'card-title', desc: '标题，渲染为 <h3>，leading-none + 半粗' },
  { name: 'CardDescription', slot: 'card-description', desc: '描述，渲染为 <p>，弱化颜色 + 小号字' },
  { name: 'CardAction', slot: 'card-action', desc: '右上角操作区；必须放在 CardHeader 内（靠 header 的 grid 定位）' },
  { name: 'CardContent', slot: 'card-content', desc: '正文区，只管左右内边距 px-6' },
  { name: 'CardFooter', slot: 'card-footer', desc: '页脚：横向 flex 排列按钮；自带 .border-t 时补 pt-6' },
]
</script>

<template>
  <div class="mx-auto max-w-5xl px-6 py-10">
    <h1 class="text-3xl font-bold tracking-tight">Card 卡片</h1>
    <p class="mt-3 text-muted-foreground">
      卡片容器，把标题、描述、正文、操作和页脚组合成一块带边框与阴影的区域。
      全部子组件都是纯布局 div（只有 <code>class</code> 一个 prop），
      间距由外层统一控制，所以内部不需要写 margin。
    </p>

    <!-- 基础用法 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">基础用法</h2>
        <CardDescription>Header（标题 + 描述）+ Content + Footer 是标准三段式。</CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="flex justify-center rounded-lg border border-dashed border-input p-6">
          <Card class="w-full max-w-sm">
            <CardHeader>
              <CardTitle>项目周报</CardTitle>
              <CardDescription>第 37 周 · 9 月 8 日 - 9 月 14 日</CardDescription>
            </CardHeader>
            <CardContent>
              <p class="text-sm text-muted-foreground">
                本周完成组件文档 6 篇，修复日历下拉与换页动画，并统一了风格预设层。
              </p>
            </CardContent>
            <CardFooter class="justify-end gap-2">
              <Button variant="outline" size="sm">稍后看</Button>
              <Button size="sm">查看详情</Button>
            </CardFooter>
          </Card>
        </div>
      </CardContent>
    </Card>

    <!-- CardAction -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">右上角操作（CardAction）</h2>
        <CardDescription>
          把 <code>CardAction</code> 放进 <code>CardHeader</code>：
          header 检测到它就会从单列切成 <code>[1fr_auto]</code> 两列，
          标题占左、操作顶靠右。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="flex flex-wrap gap-4">
          <Card class="w-full max-w-sm">
            <CardHeader>
              <CardTitle>团队成员</CardTitle>
              <CardDescription>共 8 人 · 3 人在线</CardDescription>
              <CardAction>
                <Badge variant="secondary">进行中</Badge>
              </CardAction>
            </CardHeader>
            <CardContent class="flex flex-wrap gap-2">
              <Avatar v-for="n in 5" :key="n" class="size-8">
                <AvatarFallback>{{ ['陈', '林', '王', '赵', '周'][n - 1] }}</AvatarFallback>
              </Avatar>
              <Avatar class="size-8">
                <AvatarFallback><PlusIcon class="size-4" /></AvatarFallback>
              </Avatar>
            </CardContent>
          </Card>

          <Card class="w-full max-w-sm">
            <CardHeader>
              <CardTitle>存储用量</CardTitle>
              <CardDescription>已用 6.2 GB / 10 GB</CardDescription>
              <CardAction>
                <Button variant="ghost" size="icon-sm" aria-label="更多操作">
                  <EllipsisIcon class="size-4" />
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent>
              <div class="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div class="h-full w-[62%] rounded-full bg-primary" />
              </div>
            </CardContent>
          </Card>
        </div>
        <p class="text-sm text-muted-foreground">
          注意：<code>CardAction</code> 脱离了 header 的 grid 就没有定位（会落回普通文档流），
          别把它放在 <code>CardContent</code> 里。
        </p>
      </CardContent>
    </Card>

    <!-- 统计卡 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">简洁统计卡</h2>
        <CardDescription>只用 CardContent 也行；大数字 + 小标签是常见组合。</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="grid gap-4 sm:grid-cols-3">
          <Card v-for="s in [{ k: '访问量', v: '12.8k', d: '+8.2%' }, { k: '转化率', v: '3.4%', d: '-0.6%' }, { k: '平均时长', v: '4m 12s', d: '+21s' }]" :key="s.k">
            <CardContent class="space-y-1">
              <p class="text-sm text-muted-foreground">{{ s.k }}</p>
              <p class="text-2xl font-semibold tracking-tight">{{ s.v }}</p>
              <p class="text-xs text-muted-foreground">{{ s.d }}</p>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>

    <!-- 媒体卡片 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">媒体卡片</h2>
        <CardDescription>
          把 <code>&lt;img&gt;</code> 放成 Card 的<strong>第一个子元素</strong>：预设会自动
          <code>pt-0</code>（去掉顶部内边距让图贴边）并给图加与卡片一致的顶部圆角。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div class="flex flex-wrap gap-4">
          <Card class="w-full max-w-sm">
            <img :src="cover" alt="封面" class="h-36 w-full object-cover" />
            <CardHeader>
              <CardTitle>封面图卡片</CardTitle>
              <CardDescription>图片顶部满宽，下面接标题与正文</CardDescription>
            </CardHeader>
            <CardContent class="text-sm text-muted-foreground">
              图片用的是内联 SVG 占位，避免文档站依赖外部资源。
            </CardContent>
            <CardFooter class="gap-2">
              <Button size="sm">开始使用</Button>
              <Button variant="outline" size="sm">了解更多</Button>
            </CardFooter>
          </Card>

          <Card class="w-full max-w-sm">
            <CardHeader>
              <CardTitle>带缩略图的列表项</CardTitle>
              <CardDescription>小图 + 文字，适合放多张</CardDescription>
            </CardHeader>
            <CardContent class="space-y-3">
              <div v-for="i in 2" :key="i" class="flex items-center gap-3">
                <div class="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                  <ImageIcon class="size-4" />
                </div>
                <div class="min-w-0">
                  <p class="truncate text-sm font-medium">示例条目 {{ i }}</p>
                  <p class="truncate text-xs text-muted-foreground">这里是补充说明文字，过长会截断</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>

    <!-- 表单卡片 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">表单卡片</h2>
        <CardDescription>登录 / 订阅这类场景：Content 放字段，Footer 放占满宽度的主按钮。</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="flex justify-center rounded-lg border border-dashed border-input p-6">
          <Card class="w-full max-w-sm">
            <CardHeader>
              <CardTitle>登录账号</CardTitle>
              <CardDescription>输入邮箱后我们会发送登录链接</CardDescription>
            </CardHeader>
            <CardContent class="space-y-4">
              <div class="space-y-2">
                <Label for="card-demo-email">邮箱</Label>
                <Input id="card-demo-email" v-model="email" type="email" placeholder="you@example.com" />
              </div>
              <div class="space-y-2">
                <Label for="card-demo-team">团队</Label>
                <Input id="card-demo-team" placeholder="可选" />
              </div>
            </CardContent>
            <CardFooter class="flex-col gap-2">
              <Button class="w-full">发送登录链接</Button>
              <Button variant="ghost" class="w-full">使用其他方式登录</Button>
            </CardFooter>
          </Card>
        </div>
      </CardContent>
    </Card>

    <!-- 间距与分隔线 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">尺寸、间距与分隔线</h2>
        <CardDescription>
          间距不在子组件里写：竖间距来自 Card 的 <code>gap</code>、纵向内边距来自
          Card 的 <code>py</code>，横向内边距在 header / content / footer（px-6）。
          要更紧凑请用 <code>size="sm"</code>（比手写 class 更保险，因为预设的
          <code>data-[size=sm]</code> 会同时收紧子组件内边距）。
          另外，给 header / footer 自己加 <code>border-b</code> /
          <code>border-t</code> 时会自动补上 <code>pb-6</code> /
          <code>pt-6</code>。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div class="flex flex-wrap gap-4">
          <Card size="sm" class="w-full max-w-sm">
            <CardHeader>
              <CardTitle>紧凑尺寸</CardTitle>
              <CardDescription>size="sm"</CardDescription>
            </CardHeader>
            <CardContent class="text-sm text-muted-foreground">
              行间距、纵向内边距与子组件的左右内边距都变小，适合列表、侧边栏里的卡片。
            </CardContent>
            <CardFooter class="gap-2">
              <Button size="sm" variant="outline">取消</Button>
              <Button size="sm">保存</Button>
            </CardFooter>
          </Card>

          <Card class="w-full max-w-sm">
            <CardHeader class="border-b">
              <CardTitle class="text-base">分区卡片</CardTitle>
              <CardDescription>header 带 border-b 会自动补下内边距</CardDescription>
            </CardHeader>
            <CardContent class="text-sm text-muted-foreground">
              正文区不需要额外写上下内边距，间距由 Card 统一控制。
            </CardContent>
            <CardFooter class="border-t">
              <Button size="sm">确定</Button>
            </CardFooter>
          </Card>
        </div>
      </CardContent>
    </Card>

    <!-- 可点击卡片 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">可点击与网格排列</h2>
        <CardDescription>
          Card 渲染的是普通 <code>div</code>，事件会透传到根元素，
          所以直接写 <code>@click</code> + <code>cursor-pointer</code> 就能整卡可点。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-3">
        <div class="grid gap-4 sm:grid-cols-3">
          <Card
            v-for="p in ['方案 A', '方案 B', '方案 C']"
            :key="p"
            class="cursor-pointer transition-shadow hover:shadow-md"
            :class="picked === p ? 'ring-2 ring-ring' : ''"
            @click="picked = p"
          >
            <CardHeader>
              <CardTitle class="text-base">{{ p }}</CardTitle>
              <CardDescription>点击选中</CardDescription>
            </CardHeader>
            <CardContent class="text-sm text-muted-foreground">
              用 hover:shadow-md 与 ring 反馈选中状态。
            </CardContent>
          </Card>
        </div>
        <p class="text-sm text-muted-foreground">
          当前选中：<code>{{ picked || '(未选择)' }}</code>
        </p>
      </CardContent>
    </Card>

    <!-- API -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">API</h2>
        <CardDescription>
          Card 只有 <code>size</code> / <code>class</code> 两个 prop；
          其余子组件只有 <code>class</code>，内容全走默认插槽。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-5">
        <div>
          <p class="mb-2 text-sm font-medium">Card Props</p>
          <div class="overflow-x-auto rounded-lg">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-border bg-muted/40 text-left">
                  <th class="px-4 py-2 font-medium">属性</th>
                  <th class="px-4 py-2 font-medium">类型</th>
                  <th class="px-4 py-2 font-medium">默认</th>
                  <th class="px-4 py-2 font-medium">说明</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="p in props2" :key="p.name" class="border-b border-border last:border-0">
                  <td class="px-4 py-2 font-mono text-foreground">{{ p.name }}</td>
                  <td class="px-4 py-2 font-mono text-xs text-muted-foreground">{{ p.type }}</td>
                  <td class="px-4 py-2 font-mono text-xs text-muted-foreground">{{ p.def }}</td>
                  <td class="px-4 py-2 text-muted-foreground">{{ p.desc }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <p class="mb-2 text-sm font-medium">子组件</p>
          <div class="overflow-x-auto rounded-lg">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-border bg-muted/40 text-left">
                  <th class="px-4 py-2 font-medium">组件</th>
                  <th class="px-4 py-2 font-medium">data-slot</th>
                  <th class="px-4 py-2 font-medium">说明</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="p in parts" :key="p.name" class="border-b border-border last:border-0">
                  <td class="px-4 py-2 font-mono text-foreground">{{ p.name }}</td>
                  <td class="px-4 py-2 font-mono text-xs text-muted-foreground">{{ p.slot }}</td>
                  <td class="px-4 py-2 text-muted-foreground">{{ p.desc }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <p class="text-sm text-muted-foreground">
          每个子组件都带 <code>data-slot="card-*"</code> 标记：
          8 套风格预设（<code>src/styles/style-*.css</code>）就是按这些标记做圆角、间距、底色差异的，
          所以换风格时卡片会自动跟着变，不用改业务代码。
        </p>
      </CardContent>
    </Card>
  </div>
</template>
