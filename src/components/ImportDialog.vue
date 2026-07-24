<script setup lang="ts">
import { ref, watch } from 'vue'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog'
import { Button } from './ui/button'
import { Label } from './ui/label'
import { toast } from 'vue-sonner'
import { Download, Upload, FileSpreadsheet, X } from 'lucide-vue-next'
import request from '@/api/request'

const props = defineProps<{
  open: boolean
  title?: string
  /** 导入 API 地址，如 '/product/mechanism/import' */
  apiUrl: string
  /** 模板下载 API 地址 */
  templateApiUrl?: string
  /** 提醒事项列表 */
  reminders?: string[]
  /** 文件接受类型 */
  accept?: string
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'success': []
}>()

const uploading = ref(false)
const downloading = ref(false)
const selectedFile = ref<File | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)

const defaultReminders = [
  '请先下载模板文件，按模板格式填写数据',
  '不要修改模板的表头行，否则导入会失败',
  '必填字段不能为空',
  '单次导入建议不超�?500 �?,
]

const allReminders = props.reminders?.length ? props.reminders : defaultReminders

function onDialogOpen(val: boolean) {
  if (!val) {
    selectedFile.value = null
    if (fileInputRef.value) fileInputRef.value.value = ''
  }
  emit('update:open', val)
}

function handleFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  if (input.files?.length) {
    selectedFile.value = input.files[0]
  }
}

function clearFile() {
  selectedFile.value = null
  if (fileInputRef.value) fileInputRef.value.value = ''
}

async function downloadTemplate() {
  if (!props.templateApiUrl) {
    toast.warning('模板下载地址未配�?)
    return
  }
  downloading.value = true
  try {
    const res = await request({
      url: props.templateApiUrl,
      method: 'POST',
      responseType: 'blob',
    } as any)
    const blob = res.data instanceof Blob ? res.data : new Blob([res.data])
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `导入模板_${new Date().toISOString().slice(0, 10)}.xlsx`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('模板下载成功')
  } catch {
    toast.error('模板下载失败')
  } finally {
    downloading.value = false
  }
}

async function handleImport() {
  if (!selectedFile.value) {
    toast.error('请选择文件')
    return
  }
  uploading.value = true
  try {
    const formData = new FormData()
    formData.append('file', selectedFile.value)
    const res = await request({
      url: props.apiUrl,
      method: 'POST',
      data: formData,
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    if (res.data.code === 200) {
      const count = res.data.data?.count ?? 0
      toast.success(`导入成功，共导入 ${count} 条数据`)
      emit('success')
      emit('update:open', false)
    } else {
      toast.error(res.data.message || '导入失败')
    }
  } catch {
    toast.error('导入失败，请检查文件格�?)
  } finally {
    uploading.value = false
  }
}
</script>

<template>
  <Dialog :open="open" @update:open="onDialogOpen">
    <DialogContent class="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>{{ title || '批量导入' }}</DialogTitle>
        <DialogDescription>下载模板 �?填写数据 �?上传导入</DialogDescription>
      </DialogHeader>

      <div class="space-y-4 py-2">
        <!-- 提醒 -->
        <div class="rounded-md bg-amber-50 border border-amber-200 p-3">
          <p class="text-sm font-medium text-amber-800 mb-2">📋 注意事项</p>
          <ul class="text-sm text-amber-700 space-y-1 list-disc list-inside">
            <li v-for="(r, i) in allReminders" :key="i">{{ r }}</li>
          </ul>
        </div>

        <!-- 步骤 1：下载模�?-->
        <div class="flex items-center gap-3">
          <div class="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">1</div>
          <Button
            variant="outline"
            :disabled="downloading"
            @click="downloadTemplate"
          >
            <Download class="mr-2 h-4 w-4" />
            {{ downloading ? '下载中�? : '下载导入模板' }}
          </Button>
        </div>

        <!-- 步骤 2：选择文件 -->
        <div class="flex items-start gap-3">
          <div class="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">2</div>
          <div class="flex-1 space-y-2">
            <div class="flex items-center gap-2">
              <Button variant="outline" @click="fileInputRef?.click()">
                <Upload class="mr-2 h-4 w-4" />选择文件
              </Button>
              <input
                ref="fileInputRef"
                type="file"
                :accept="accept || '.xlsx,.xls'"
                class="hidden"
                @change="handleFileChange"
              />
            </div>
            <div v-if="selectedFile" class="flex items-center gap-2 text-sm text-muted-foreground">
              <FileSpreadsheet class="h-4 w-4 text-green-600" />
              <span class="text-green-700 font-medium">{{ selectedFile.name }}</span>
              <Button variant="ghost" size="icon" class="h-6 w-6" @click="clearFile">
                <X class="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>

        <!-- 步骤 3：上�?-->
        <div class="flex items-center gap-3">
          <div class="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">3</div>
          <p class="text-sm text-muted-foreground">确认文件无误后，点击下方「开始导入」按�?/p>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="onDialogOpen(false)">取消</Button>
        <Button :disabled="uploading || !selectedFile" @click="handleImport">
          {{ uploading ? '导入中�? : '开始导�? }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
