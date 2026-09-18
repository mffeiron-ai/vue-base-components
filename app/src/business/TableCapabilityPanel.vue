<script setup lang="ts">
/**
 * 能力开关面板（侧栏卡片样式，与 SidebarCategoryCard 观感一致）
 *
 * 纯展示型：开关直接写进父组件传进来的 reactive 状态对象（`state[key]`），
 * 变化由父组件 watch 后落到组件的 props / 列定义上。
 * 「零 props 是否写死」这类说明放在父组件里，这里只负责渲染开关。
 */
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

export type CapItem = { key: string, label: string, hint: string, dep?: string }

const props = defineProps<{
  items: CapItem[]
  /** 父组件持有的 reactive 开关状态（本组件直接改它的字段） */
  state: Record<string, boolean>
}>()

const emit = defineEmits<{ reset: [] }>()

// 同一个面板可能同时存在于两处（侧栏 / 窄屏兜底），id 不能撞，所以用模块级自增序号
let seq = 0
const uid = `cap-panel-${++seq}`
const idOf = (key: string) => `${uid}-${key}`
</script>

<template>
  <section class="w-full min-w-0 rounded-lg border border-border bg-card p-2 shadow-xs">
    <div class="flex items-baseline justify-between px-2 pt-1 pb-1">
      <h3 class="text-sm font-semibold">能力开关</h3>
      <Badge variant="secondary" class="h-5 px-1.5 text-[11px] tabular-nums">
        {{ Object.values(props.state).filter(Boolean).length }}/{{ items.length }}
      </Badge>
    </div>
    <p class="px-2 pb-1 text-[11px] leading-snug text-muted-foreground/80">
      关掉哪一项，另一侧表格里对应的 UI 立刻消失
    </p>

    <div class="space-y-0.5">
      <div
        v-for="item in items"
        :key="item.key"
        class="flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-accent/50"
      >
        <div class="min-w-0 flex-1">
          <Label :for="idOf(item.key)" class="text-sm">{{ item.label }}</Label>
          <p class="text-[11px] leading-snug text-muted-foreground/80">{{ item.hint }}</p>
        </div>
        <Switch
          :id="idOf(item.key)"
          v-model="state[item.key]"
          size="sm"
          :disabled="!!item.dep && !state[item.dep]"
        />
      </div>
    </div>

    <div class="mt-2 border-t border-border pt-2">
      <Button variant="ghost" size="sm" class="w-full" @click="emit('reset')">恢复默认</Button>
    </div>
  </section>
</template>
