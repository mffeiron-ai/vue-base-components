<template>
  <div class="mt-4 flex flex-col md:flex-row justify-between items-center p-2"> 
    <div class="flex items-center space-x-2 mb-2 md:mb-0 whitespace-nowrap"> 
      <span class="text-sm text-muted-foreground">每页显示</span> 
      <Select v-model="localPageSize" @update:modelValue="onPageSizeChange"> 
        <SelectTrigger class="min-w-[90px]"> 
          {{ localPageSize }} 条 
        </SelectTrigger> 
        <SelectContent> 
          <SelectItem :value="10">10 条</SelectItem> 
          <SelectItem :value="20">20 条</SelectItem> 
          <SelectItem :value="50">50 条</SelectItem> 
          <SelectItem :value="100">100 条</SelectItem> 
        </SelectContent> 
      </Select> 
    </div> 
    <div class="flex items-center justify-center w-full gap-4"> 
      <Pagination v-slot="{ page }" :items-per-page="localPageSize" :total="localTotal" 
      v-model:page="localPage"> 
        <PaginationContent v-slot="{ items }"> 
          <PaginationPrevious>上一页</PaginationPrevious> 
          <template v-for="(item, index) in items" :key="index"> 
            <PaginationItem
              v-if="item.type === 'page'" 
              :value="item.value" 
              :is-active="item.value === page"
              :class="item.value === page ? 'bg-primary text-primary-foreground hover:bg-primary/90 font-semibold' : 'border-none bg-card hover:bg-accent'"
            > 
              {{ item.value }} 
            </PaginationItem> 
          </template> 
          <PaginationEllipsis v-if="localNumPages > 7" :index="3" /> 
          <PaginationNext>下一页</PaginationNext> 
        </PaginationContent> 
      </Pagination> 
      <div class="flex items-center"> 
        <span class="text-sm text-muted-foreground whitespace-nowrap">共 {{ localNumPages }} 页，{{ localTotal }} 条</span> 
        <div class="flex items-center ml-4"> 
          <span class="text-sm text-muted-foreground whitespace-nowrap">跳转到</span> 
          <Input 
            type="number" 
            v-model="jumpToPage" 
            class="w-16 h-8 px-2 border rounded text-sm mx-1" 
            min="1" 
            :max="localNumPages" 
            @keyup.enter="handleJumpToPage" 
          /> 
          <Button size="sm" variant="outline" class="cursor-pointer border-none bg-primary text-primary-foreground" @click="handleJumpToPage">确定</Button> 
        </div> 
      </div> 
    </div> 
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Button } from './ui/button'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger
} from './ui/select'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationNext,
  PaginationPrevious
} from './ui/pagination'
import Input from './ui/input/Input.vue'

const props = defineProps({
  page: {
    type: Number,
    default: 1
  },
  pageSize: {
    type: Number,
    default: 10
  },
  total: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['update:page', 'update:pageSize', 'page-change', 'pageSize-change'])

const localPage = ref(props.page)
const localPageSize = ref(props.pageSize)
const localTotal = ref(props.total)
const jumpToPage = ref(props.page)

// 计算总页数
const localNumPages = computed(() => {
  return Math.ceil(localTotal.value / localPageSize.value) || 1
})

// 每页条数变化
const onPageSizeChange = () => {
  localPage.value = 1
  jumpToPage.value = 1
  emit('update:pageSize', localPageSize.value)
  emit('pageSize-change', localPageSize.value)
}

// 跳转到指定页
const handleJumpToPage = () => {
  if (jumpToPage.value < 1) {
    jumpToPage.value = 1
  } else if (jumpToPage.value > localNumPages.value) {
    jumpToPage.value = localNumPages.value
  }
  localPage.value = jumpToPage.value
}

// 所有页面变化统一由 watch 处理 emit，避免 reka-ui + @click 双重触发
watch(localPage, (newVal, oldVal) => {
  if (newVal === oldVal) return
  jumpToPage.value = newVal
  emit('update:page', newVal)
  emit('page-change', newVal)
})

// 监听props变化
watch(() => props.page, (newVal) => {
  localPage.value = newVal
  jumpToPage.value = newVal
}, { immediate: false })

watch(() => props.pageSize, (newVal) => {
  localPageSize.value = newVal
})

watch(() => props.total, (newVal) => {
  localTotal.value = newVal
})
</script>