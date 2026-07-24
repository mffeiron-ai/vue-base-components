<template>
  <div ref="editorRoot" class="flex h-full min-h-0 flex-col">
    <MdEditor
      v-model="text"
      :preview="preview"
      :toolbars="toolbars"
      :disabled="!editable"
      :placeholder="placeholder"
      @onUploadImg="onUploadImg"
      class="flex-1 min-h-0"
      :style="{ height: editorHeight }"
    />
    <div v-if="content" v-html="renderedContent"></div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { MdEditor, MdPreview } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'
import { uploadImageApi } from '@/api/request'

const props = defineProps({
  modelValue: String,
  placeholder: String,
  height: {
    type: String,
    default: '400px'
  },
  editable: {
    type: Boolean,
    default: true
  },
  content: String,
  id: String
})

const emit = defineEmits(['update:modelValue'])
const editorRoot = ref(null)

// 编辑器内�?const text = ref(props.modelValue || '')
// 是否预览模式
const preview = ref(true)
// 是否可编�?const editable = computed(() => props.editable !== false)
// 占位�?const placeholder = computed(() => props.placeholder || '请输入内�?..')
const editorHeight = computed(() => props.height || '400px')

// 工具栏配�?const toolbars = [
  'bold',
  'italic',
  'strikethrough',
  'title',
  'sub',
  'sup',
  'quote',
  'unorderedList',
  'orderedList',
  'codeRow',
  'code',
  'link',
  'image',
  'table',
  'revoke',
  'next',
  'save',
  'pageFullscreen',
  'fullscreen',
  'preview',
  'htmlPreview',
  'catalog'
]

const taskLinePattern = /^(\s*[-*]\s+\[)( |x|X)(\]\s+.*)$/

const toggleTaskByIndex = (targetIndex) => {
  if (targetIndex < 0) return
  const lines = (text.value || '').split('\n')
  const taskLineIndexes = []

  for (let idx = 0; idx < lines.length; idx += 1) {
    if (taskLinePattern.test(lines[idx])) {
      taskLineIndexes.push(idx)
    }
  }

  const lineIndex = taskLineIndexes[targetIndex]
  if (lineIndex === undefined) return

  lines[lineIndex] = lines[lineIndex].replace(taskLinePattern, (_match, prefix, status, suffix) => {
    const nextStatus = status.toLowerCase() === 'x' ? ' ' : 'x'
    return `${prefix}${nextStatus}${suffix}`
  })
  text.value = lines.join('\n')
}

const onPreviewTaskClick = (event) => {
  const root = editorRoot.value
  if (!root) return

  const target = event.target
  if (!(target instanceof HTMLElement)) return

  const previewRoot = target.closest('.md-editor-preview')
  if (!previewRoot) return

  const taskItem = target.closest('li.task-list-item')
  if (!taskItem) return

  const allItems = Array.from(previewRoot.querySelectorAll('li.task-list-item'))
  const taskIndex = allItems.indexOf(taskItem)
  if (taskIndex === -1) return

  event.preventDefault()
  toggleTaskByIndex(taskIndex)
}

// 图片上传处理
const onUploadImg = async (files, callback) => {
  const res = []
  for (const file of files) {
    try {
      const uploadRes = await uploadImageApi(file, 'content')
      const url = uploadRes.data?.data?.file_path
      if (url) {
        res.push(url)
      }
    } catch (e) {
      console.error('图片上传失败', e)
    }
  }
  callback(res)
}

// 监听内容变化
watch(text, (newVal) => {
  emit('update:modelValue', newVal)
})

// 监听props.modelValue变化
watch(() => props.modelValue, (newVal) => {
  if (newVal !== text.value) {
    text.value = newVal || ''
  }
})

onMounted(() => {
  if (editorRoot.value) {
    editorRoot.value.addEventListener('click', onPreviewTaskClick)
  }
})

onBeforeUnmount(() => {
  if (editorRoot.value) {
    editorRoot.value.removeEventListener('click', onPreviewTaskClick)
  }
})

// 渲染内容（用于显示）
const renderedContent = computed(() => {
  if (!props.content) return ''
  // 使用MdPreview将Markdown转为HTML
  return MdPreview.getHtml(props.content)
})
</script>