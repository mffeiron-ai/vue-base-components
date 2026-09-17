<script setup lang="ts">
import { ref } from 'vue'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogScrollContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

// ---------- 演示状态 ----------
/** 受控打开：外部按钮也能开 */
const ctrlOpen = ref(false)
/** 表单：提交后关闭并回显 */
const formOpen = ref(false)
const formName = ref('Rion')
const savedName = ref('Rion')

function submitForm() {
  savedName.value = formName.value.trim() || '(空)'
  formOpen.value = false
}

// ---------- API ----------
const rootRows = [
  { name: 'v-model:open', type: 'boolean', def: '—', desc: '受控开关；不管它就是非受控（由 DialogTrigger 自己开合）。作用域插槽能拿到 { open }' },
  { name: 'default-open', type: 'boolean', def: 'false', desc: '非受控时初始是否打开' },
  { name: 'modal', type: 'boolean', def: 'true', desc: '模态：打开时锁住背景滚动与焦点，Esc / 点遮罩可关闭' },
  { name: '（其余）', type: 'reka DialogRoot 的 props', def: '—', desc: '原样透传' },
]

const rootEmits = [
  { name: 'update:open', desc: '开合状态变化（受控时自己要落地这个值）' },
]

const contentRows = [
  { name: 'show-close-button', type: 'boolean', def: 'true', desc: '右上角的 × 关闭按钮；传 false 就只剩 Esc / 点遮罩 / 内部 DialogClose' },
  { name: 'class', type: 'string', def: '—', desc: '宽度靠它覆盖：sm:max-w-sm!（窄）/ sm:max-w-2xl!（宽）——注意样式预设也定义了 max-width，覆盖时要带 !' },
  { name: '@escape-key-down', type: '(e) => void', def: '—', desc: 'reka 事件：要禁止 Esc 关闭就 event.preventDefault()' },
  { name: '@pointer-down-outside', type: '(e) => void', def: '—', desc: 'reka 事件：点遮罩关闭前触发，同样可 preventDefault 拦住' },
]

const partRows = [
  { name: 'DialogTrigger', type: 'as-child', desc: '触发器，默认渲染 <button>；as-child 可包住自己的 Button' },
  { name: 'DialogClose', type: 'as-child', desc: '「关闭」按钮，放 Footer 里当取消 / 关闭' },
  { name: 'DialogTitle', type: '—', desc: '标题（必填）：reka 用它生成 aria-labelledby' },
  { name: 'DialogDescription', type: '—', desc: '标题下的说明文字，挂到 aria-describedby；长正文请用普通 p' },
  { name: 'DialogHeader / DialogFooter', type: 'class', desc: '上下分区容器；Footer 的 show-close-button 会附一个英文 Close 按钮' },
  { name: 'DialogOverlay', type: 'class', desc: '遮罩（DialogContent 已自带）；只有完全自定义遮罩时才单独用' },
  { name: 'DialogScrollContent', type: 'class', desc: '长内容版主体：整页滚动不挤扁弹层；仍会带一个方形 × 按钮' },
]
</script>

<template>
  <div class="mx-auto max-w-5xl px-6 py-10">
    <h1 class="text-3xl font-bold tracking-tight">Dialog 对话框</h1>
    <p class="mt-3 text-muted-foreground">
      模态对话框：<code>Dialog</code>（状态）包住 <code>DialogTrigger</code> + <code>DialogContent</code>（主体），<br />
      内容里再放 <code>DialogHeader</code> / <code>DialogTitle</code> / <code>DialogDescription</code> / <code>DialogFooter</code>。<br />
      默认是模态：打开后锁背景滚动与焦点，Esc、点遮罩、右上角 × 、内部 <code>DialogClose</code> 都能关；<br />
      长内容用 <code>DialogScrollContent</code>（整页滚动，不把弹层挤扁）；要「必须点按钮才能关」请用 AlertDialog。
    </p>

    <!-- 1. 基础用法 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">基础用法</h2>
        <CardDescription>触发器 + 标题 / 描述 + 底部按钮。点遮罩或按 Esc 也会关闭。</CardDescription>
      </CardHeader>
      <CardContent class="flex flex-wrap items-center gap-3">
        <Dialog>
          <DialogTrigger as-child>
            <Button variant="outline">编辑资料</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>编辑资料</DialogTitle>
              <DialogDescription>
                这里的修改会立即同步到你的账号，稍后可以再改回来。
              </DialogDescription>
            </DialogHeader>
            <div class="grid gap-2">
              <Label for="dialog-nickname">昵称</Label>
              <Input id="dialog-nickname" model-value="Rion" />
            </div>
            <DialogFooter>
              <DialogClose as-child>
                <Button variant="outline">取消</Button>
              </DialogClose>
              <Button>保存</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>

    <!-- 2. 受控 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">受控开关（v-model:open）</h2>
        <CardDescription>
          用 <code>v-model:open</code> 把开合状态拿到外面：外部按钮能直接打开，也能读到当前状态（表单校验不通过就可以不让它关）。
        </CardDescription>
      </CardHeader>
      <CardContent class="flex flex-wrap items-center gap-3">
        <Button variant="outline" @click="ctrlOpen = true">从外面打开</Button>
        <code class="text-sm text-muted-foreground">open：{{ ctrlOpen }}</code>

        <Dialog v-model:open="ctrlOpen">
          <DialogContent>
            <DialogHeader>
              <DialogTitle>受控对话框</DialogTitle>
              <DialogDescription>这个弹层的开合由外层 ref 决定。</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" @click="ctrlOpen = false">在内部关掉</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>

    <!-- 3. 宽度 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">不同宽度</h2>
        <CardDescription>
          默认宽度由样式预设给出（当前风格是 <code>sm:max-w-md</code>）；覆盖要加 <code>!</code>，
          因为预设是无层规则、特异性比工具类高：<code>class="sm:max-w-sm!"</code> / <code>class="sm:max-w-2xl!"</code>。
        </CardDescription>
      </CardHeader>
      <CardContent class="flex flex-wrap items-center gap-3">
        <Dialog>
          <DialogTrigger as-child>
            <Button variant="outline">窄（max-w-sm）</Button>
          </DialogTrigger>
          <DialogContent class="sm:max-w-sm!">
            <DialogHeader>
              <DialogTitle>窄对话框</DialogTitle>
              <DialogDescription>适合只有一两行内容的确认场景。</DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>

        <Dialog>
          <DialogTrigger as-child>
            <Button variant="outline">宽（max-w-2xl）</Button>
          </DialogTrigger>
          <DialogContent class="sm:max-w-2xl!">
            <DialogHeader>
              <DialogTitle>宽对话框</DialogTitle>
              <DialogDescription>适合放表格、双列表单、并排对比这类内容。</DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>

    <!-- 4. 自定义关闭按钮 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">去掉右上角关闭按钮</h2>
        <CardDescription>
          <code>:show-close-button="false"</code> 关掉默认的 ×，改成底部按钮（这样用户必须选一个明确的操作）。
        </CardDescription>
      </CardHeader>
      <CardContent class="flex flex-wrap items-center gap-3">
        <Dialog>
          <DialogTrigger as-child>
            <Button variant="outline">自定义关闭</Button>
          </DialogTrigger>
          <DialogContent :show-close-button="false">
            <DialogHeader>
              <DialogTitle>要保存草稿吗？</DialogTitle>
              <DialogDescription>关掉右上角 ×，让「保存 / 不保存」成为唯一出口。</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose as-child>
                <Button variant="outline">不保存</Button>
              </DialogClose>
              <DialogClose as-child>
                <Button>保存草稿</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>

    <!-- 5. 长内容 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">长内容：DialogScrollContent</h2>
        <CardDescription>
          内容比屏幕高时用 <code>DialogScrollContent</code>：遮罩兼做滚动容器，弹层自然顶天立地，不会被压扁；
          另外它在弹层里拖选文字、移到外面松手也不会误关闭。
        </CardDescription>
      </CardHeader>
      <CardContent class="flex flex-wrap items-center gap-3">
        <Dialog>
          <DialogTrigger as-child>
            <Button variant="outline">查看服务条款</Button>
          </DialogTrigger>
          <DialogScrollContent class="sm:max-w-2xl!">
            <DialogHeader>
              <DialogTitle>服务条款</DialogTitle>
              <DialogDescription>最后更新：2026 年 9 月 15 日</DialogDescription>
            </DialogHeader>
            <div class="space-y-3 text-sm text-muted-foreground">
              <p v-for="i in 12" :key="i">
                第 {{ i }} 条 —— 这里是条款正文占位内容，用来把弹层撑高到需要滚动的高度。
                真实场景下这段文字来自接口或静态文档，用户滚动阅读后点底部按钮确认。
              </p>
            </div>
            <DialogFooter>
              <DialogClose as-child>
                <Button variant="outline">关闭</Button>
              </DialogClose>
              <Button>我同意</Button>
            </DialogFooter>
          </DialogScrollContent>
        </Dialog>
      </CardContent>
    </Card>

    <!-- 6. 表单 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">弹层里放表单</h2>
        <CardDescription>提交后关闭并回显；「取消」用 DialogClose，直接关掉不留状态。</CardDescription>
      </CardHeader>
      <CardContent class="flex flex-wrap items-center gap-3">
        <Dialog v-model:open="formOpen">
          <DialogTrigger as-child>
            <Button variant="outline">修改昵称</Button>
          </DialogTrigger>
          <DialogContent class="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>修改昵称</DialogTitle>
              <DialogDescription>最多 12 个字。</DialogDescription>
            </DialogHeader>
            <div class="grid gap-2">
              <Label for="dialog-form-name">昵称</Label>
              <Input id="dialog-form-name" v-model="formName" placeholder="请输入昵称" />
            </div>
            <DialogFooter>
              <DialogClose as-child>
                <Button variant="outline">取消</Button>
              </DialogClose>
              <Button @click="submitForm">保存</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <code class="text-sm text-muted-foreground">已保存：{{ savedName }}</code>
      </CardContent>
    </Card>

    <!-- API -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">API / Props</h2>
      </CardHeader>
      <CardContent class="space-y-6">
        <div>
          <p class="mb-2 text-sm font-medium"><code>Dialog</code>（根）</p>
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
                <tr v-for="row in rootRows" :key="row.name" class="border-b border-border last:border-0">
                  <td class="px-4 py-2 font-mono text-foreground">{{ row.name }}</td>
                  <td class="px-4 py-2 font-mono text-xs text-muted-foreground">{{ row.type }}</td>
                  <td class="px-4 py-2 font-mono text-xs text-muted-foreground">{{ row.def }}</td>
                  <td class="px-4 py-2 text-muted-foreground">{{ row.desc }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <ul class="mt-3 space-y-1 text-sm text-muted-foreground">
            <li v-for="e in rootEmits" :key="e.name">
              · <code>{{ e.name }}</code>：{{ e.desc }}
            </li>
          </ul>
        </div>

        <div>
          <p class="mb-2 text-sm font-medium"><code>DialogContent</code></p>
          <div class="overflow-x-auto rounded-lg">
            <table class="w-full text-sm">
              <tbody>
                <tr v-for="row in contentRows" :key="row.name" class="border-b border-border last:border-0">
                  <td class="px-4 py-2 font-mono text-foreground">{{ row.name }}</td>
                  <td class="px-4 py-2 font-mono text-xs text-muted-foreground">{{ row.type }}</td>
                  <td class="px-4 py-2 font-mono text-xs text-muted-foreground">{{ row.def }}</td>
                  <td class="px-4 py-2 text-muted-foreground">{{ row.desc }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <p class="mb-2 text-sm font-medium">其余子组件</p>
          <ul class="space-y-1 text-sm text-muted-foreground">
            <li v-for="row in partRows" :key="row.name">
              · <code>{{ row.name }}</code>：{{ row.desc }}
            </li>
          </ul>
        </div>

        <p class="text-sm text-muted-foreground">
          子组件都是薄封装，<code>reka-ui</code> Dialog 的原生 props / 事件（<code>as-child</code>、
          <code>force-mount</code>、<code>@open-auto-focus</code> …）都能直接传，不会被吃掉。
        </p>
      </CardContent>
    </Card>
  </div>
</template>
