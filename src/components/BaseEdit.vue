<template>
    <div class="w-full h-full overflow-auto">
      <Card class="p-6 border-none m-6 flex flex-col">
        <CardTitle class="mb-4">
          <h2 class="text-2xl font-bold">{{ titleComputed }}</h2>
        </CardTitle>
        <CardContent>
          <FieldSet class="space-y-6">
            <div class="grid grid-cols-12 gap-4">
              <template v-for="item in fields" :key="item.field">
                <Field :data-invalid="errors[item.field] ? true : false" :class="getFieldColSpan(item)" orientation="horizontal" 
                class="[&_[data-slot=field-label]]:shrink-0 [&_[data-slot=field-label]]:w-20 [&_[data-slot=field-content]]:flex-none gap-2">
                  <MarkDown
                    v-if="item.type === FIELD_TYPES.MARKDOWN"
                    v-model="form[item.field]"
                    :placeholder="item.placeholder"
                    :editable="true"
                    :id="`markdown-${item.field}`"
                  />
                  
                  <template v-else-if="item.type === FIELD_TYPES.SELECT">
                    <FieldContent>
                      <FieldLabel :for="`select-${item.field}`">{{ item.label }}</FieldLabel>
                      <FieldDescription v-if="item.description">{{ item.description }}</FieldDescription>
                    </FieldContent>
                    <Select v-model="form[item.field]" :id="`select-${item.field}`">
                      <SelectTrigger>
                        <SelectValue :placeholder="item.placeholder || '请选择'" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem 
                            v-for="opt in item.options" 
                            :key="opt.value" 
                            :value="opt.value"
                          >
                            {{ opt.label }}
                          </SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <FieldError v-if="errors[item.field]" :errors="[errors[item.field]]" />
                  </template>

                  <template v-else-if="item.type === FIELD_TYPES.IMAGE">
                    <FieldContent>
                      <FieldLabel>{{ item.label }}</FieldLabel>
                      <FieldDescription v-if="item.description">{{ item.description }}</FieldDescription>
                    </FieldContent>
                    <div class="w-full flex">
                      <img
                        v-if="form[item.field]"
                        :src="form[item.field]"
                        alt="图片"
                        class="w-full h-auto rounded cursor-pointer object-cover max-w-xs"
                        @click="openImageUpload(item.field)"
                        :id="`img-${item.field}`"
                      />
                      <div
                        v-else
                        class="bg-secondary flex items-center justify-center rounded w-full h-40 cursor-pointer max-w-xs"
                        @click="openImageUpload(item.field)"
                        :id="`img-upload-${item.field}`"
                      >
                        <span class="bg-secondary">点击上传图片</span>
                      </div>
                      <div class="hidden">
                        <Input
                          :ref="el => setFileInputRef(item.field, el)"
                          type="file"
                          accept="image/*"
                          @change="(event: Event) => handleFileChange(event, item.field)"
                        />
                      </div>
                    </div>
                    <FieldError v-if="errors[item.field]" :errors="[errors[item.field]]" />
                  </template>

                  <template v-else-if="item.type === FIELD_TYPES.CAROUSEL">
                    <FieldContent>
                      <FieldLabel>{{ item.label }}</FieldLabel>
                      <FieldDescription v-if="item.description">{{ item.description }}</FieldDescription>
                    </FieldContent>
                    <div class="w-full">
                      <div class="carousel-images flex flex-wrap gap-2">
                        <div v-if="getCarouselImages(item.field).length > 0" class="flex flex-wrap gap-2">
                          <div v-for="(image, index) in getCarouselImages(item.field)" :key="index" class="relative">
                            <img
                              :src="image"
                              alt="轮播图"
                              class="w-32 h-32 object-cover rounded"
                            />
                            <Button
                              type="button"
                              class="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex 
                              items-center justify-center"
                              @click="removeCarouselImage(item.field, index)"
                            >
                              ×
                            </Button>
                          </div>
                        </div>
                        <div
                          class="bg-secondary flex items-center justify-center rounded w-32 h-32 cursor-pointer"
                          @click="openImageUpload(item.field)"
                        >
                          <span>添加轮播图</span>
                        </div>
                        <div class="hidden">
                          <Input
                            :ref="el => setFileInputRef(item.field, el)"
                            type="file"
                            accept="image/*"
                            @change="(event: Event) => handleFileChange(event, item.field, true)"
                          />
                        </div>
                      </div>
                    </div>
                    <FieldError v-if="errors[item.field]" :errors="[errors[item.field]]" />
                  </template>

                  <template v-else-if="item.type === FIELD_TYPES.NUMBER">
                    <FieldContent>
                      <FieldLabel :for="`number-${item.field}`">{{ item.label }}</FieldLabel>
                      <FieldDescription v-if="item.description">{{ item.description }}</FieldDescription>
                    </FieldContent>
                    <NumberField
                      :id="`number-${item.field}`"
                      v-model="form[item.field]"
                      :precision="2"
                      :step="0.01"
                      class="w-32"
                    >
                      <NumberFieldContent>
                        <NumberFieldDecrement />
                        <NumberFieldInput />
                        <NumberFieldIncrement />
                      </NumberFieldContent>
                    </NumberField>
                    <FieldError v-if="errors[item.field]" :errors="[errors[item.field]]" />
                  </template>

                  <template v-else-if="[FIELD_TYPES.EMAIL, FIELD_TYPES.PASSWORD, FIELD_TYPES.URL].includes(item.type)">
                    <FieldContent>
                      <FieldLabel :for="`input-${item.field}`">{{ item.label }}</FieldLabel>
                      <FieldDescription v-if="item.description">{{ item.description }}</FieldDescription>
                    </FieldContent>
                    <Input
                      class="w-auto"
                      v-model="form[item.field]"
                      :required="item.required"
                      :placeholder="item.placeholder"
                      :disabled="item?.disabled"
                      :id="`input-${item.field}`"
                      :type="item.type"
                      :aria-invalid="errors[item.field] ? true : false"
                    />
                    <FieldError v-if="errors[item.field]" :errors="[errors[item.field]]" />
                  </template>

                  <template v-else>
                    <FieldContent>
                      <FieldLabel :for="`input-${item.field}`">{{ item.label }}</FieldLabel>
                      <FieldDescription v-if="item.description">{{ item.description }}</FieldDescription>
                    </FieldContent>
                    <Input
                      class="w-auto"
                      v-model="form[item.field]"
                      :required="item.required"
                      :placeholder="item.placeholder"
                      :disabled="item?.disabled"
                      :id="`input-${item.field}`"
                      type="text"
                      :aria-invalid="errors[item.field] ? true : false"
                    />
                    <FieldError v-if="errors[item.field]" :errors="[errors[item.field]]" />
                  </template>
                </Field>
              </template>
            </div>
          </FieldSet>
        </CardContent>
        <CardFooter class="flex justify-end gap-2 mt-6 border-t pr-0">
          <Button type="submit" variant="default" id="btn-save" @click="onSave" class="cursor-pointer">保存</Button>
          <Button type="button" variant="outline" @click="onCancel" id="btn-cancel" class="cursor-pointer">返回</Button>
        </CardFooter>
      </Card>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import Card from './ui/card/Card.vue'
import { Button } from './ui/button'
import { Input } from './ui/input'
import MarkDown from './MarkDown.vue'
import { uploadImageApi } from '@/api/request'
import { useAuthStore } from '@/stores/authStore'
import { useEditStore } from '@/stores/editStore'
import { toast } from "vue-sonner"
import {
  NumberField,
  NumberFieldContent,
  NumberFieldDecrement,
  NumberFieldIncrement,
  NumberFieldInput,
} from "./ui/number-field"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldSet,
} from './ui/field'
import CardTitle from './ui/card/CardTitle.vue'
import CardContent from './ui/card/CardContent.vue'
import CardFooter from './ui/card/CardFooter.vue'

const router = useRouter()

// 字段类型配置 - 维护所有支持的字段类型
const FIELD_TYPES = {
  MARKDOWN: 'markdown',      // Markdown编辑器
  SELECT: 'select',          // 下拉选择
  IMAGE: 'image',            // 单图片上传
  CAROUSEL: 'carousel',      // 轮播图（多图片）
  NUMBER: 'number',          // 数字输入
  EMAIL: 'email',            // 邮箱输入
  PASSWORD: 'password',      // 密码输入
  URL: 'url',                // URL输入
} as const

const props = defineProps<{
  type?: string // 类型（用于提示文案和动态选项加载）
  id?: number // 编辑时的ID
  fields?: any[] // 字段配置列表
  getInfo?: (params: any) => Promise<any> // 获取信息的API函数
  updateApi?: (data: any) => Promise<any> // 更新的API函数
  createApi?: (data: any) => Promise<any> // 创建的API函数
  redirectPath?: string // 保存成功后的重定向路径
}>()

const form = ref<Record<string, any>>({}) // 表单数据对象
const errors = ref<Record<string, string>>({}) // 错误对象
const fileInputRefs = ref<Record<string, HTMLInputElement>>({}) // 文件输入框引用对象

const authStore = useAuthStore()
const editStore = useEditStore()
const titleComputed = computed(() => props.id ? `编辑${props.type}` : `新建${props.type}`)

// 从 props 或 editStore 回退读取配置
const fields = computed(() => {
  if (props.fields?.length) return props.fields
  return editStore.editConfig?.fields || []
})

const getInfo = computed(() => props.getInfo || editStore.editConfig?.getInfo)
const createApi = computed(() => props.createApi || editStore.editConfig?.createApi)
const updateApi = computed(() => props.updateApi || editStore.editConfig?.updateApi)

// 按 colSpan 计算占几列（12列网格），默认占满
function getFieldColSpan(item: any): string {
  const span = Math.min(item.colSpan || 12, 12)
  const map: Record<number, string> = {
    1: 'col-span-1', 2: 'col-span-2', 3: 'col-span-3', 4: 'col-span-4',
    5: 'col-span-5', 6: 'col-span-6', 7: 'col-span-7', 8: 'col-span-8',
    9: 'col-span-9', 10: 'col-span-10', 11: 'col-span-11', 12: 'col-span-12',
  }
  return map[span] || 'col-span-12'
}

// 设置文件输入框引用
function setFileInputRef(fieldName: string, el: any) {
  if (el) {
    fileInputRefs.value[fieldName] = el.$el || el
  }
}

// 获取轮播图图片列表
function getCarouselImages(fieldName: string): string[] {
  if (!form.value[fieldName]) {
    return [];
  }
  
  try {
    const images = JSON.parse(form.value[fieldName]);
    return Array.isArray(images) ? images : [];
  } catch (e) {
    return [];
  }
}

// 打开图片上传
function openImageUpload(fieldName: string) {
  const fileInput = fileInputRefs.value[fieldName]
  if (fileInput) {
    fileInput.click()
  }
}

// 处理文件选择
async function handleFileChange(event: Event, fieldName: string, isCarousel: boolean = false) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) return

  try {
    const response = await uploadImageApi(file, isCarousel ? 'carousel' : 'avatar')
    const imagePath = response.data.data.file_path

    if (isCarousel) {
      // 轮播图：添加到数组
      const images = getCarouselImages(fieldName)
      images.push(imagePath)
      form.value[fieldName] = JSON.stringify(images)
    } else {
      // 单图片：直接覆盖
      form.value[fieldName] = imagePath
    }

    target.value = ''
    // 清除该字段的错误
    delete errors.value[fieldName]
  } catch (error) {
    console.error(`图片上传失败:`, error)
    toast.error(`图片上传失败`)
  }
}

// 移除轮播图
function removeCarouselImage(fieldName: string, index: number) {
  const images = getCarouselImages(fieldName)
  images.splice(index, 1)
  form.value[fieldName] = JSON.stringify(images)
}

// 验证表单数据
function validateForm(): boolean {
  errors.value = {} // 清空错误
  
  for (const item of fields.value) {
    const value = form.value[item.field]
    
    // 验证必填项
    if (item.required && !value) {
      errors.value[item.field] = `${item.label}不能为空`
      continue
    }
    
    // 验证 email 格式
    if (item.type === FIELD_TYPES.EMAIL && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(value)) {
        errors.value[item.field] = `${item.label}格式不正确`
        continue
      }
    }
    
    // 验证 URL 格式
    if (item.type === FIELD_TYPES.URL && value) {
      try {
        new URL(value)
      } catch {
        errors.value[item.field] = `${item.label}格式不正确`
        continue
      }
    }
  }
  
  return Object.keys(errors.value).length === 0
}

// 获取编辑信息
async function fetchInfo() {
  const api = getInfo.value
  if (api && props.id) {
    try {
      const res = await api({ id: props.id })
      const data = res.data?.data
      if (data) Object.assign(form.value, data)
    } catch { toast.error('加载数据失败') }
  }
}

// 加载动态选项
async function loadDynamicOptions() {
  if (props.fields) {
    for (const item of props.fields) {
      if (item.type === FIELD_TYPES.SELECT && item.function) {
        try {
          const result = await item.function({ category_type: props.type })
          if (result && result.data && result.data.data) {
            item.options = result.data.data.map((option: string) => ({
              label: option,
              value: option
            }))
          }
        } catch (error) {
          console.error(`加载${item.label}选项失败:`, error)
        }
      }
    }
  }
}

onMounted(() => {
  if (props.type) {
    fetchInfo()
  }
  loadDynamicOptions()
})

// 监听路由参数变化，重新加载数据
watch(() => props.id, (newId) => {
  if (newId && props.type) {
    // 重置表单和错误
    form.value = {}
    errors.value = {}
    // 重新获取数据
    fetchInfo()
  }
})

async function onSave() {
  // 先验证表单
  if (!validateForm()) {
    toast.error(`请修正表单中的错误`)
    return
  }
  
  let result
  try {
    if (props.id && updateApi.value) {
      result = await updateApi.value(form.value)
    } else if (createApi.value) {
      result = await createApi.value(form.value)
    }
    if (
      props.type === '管理员' &&
      props.id &&
      String(props.id) === String(authStore.admin?.id)
    ) {
      // 同步更新store
      authStore.setAdmin(result.data.data)
    }
    toast.success(`${props.type || '内容'}保存成功`)
    router.push(props.redirectPath || '/')
  } catch (error) {
    toast.error(`${props.type || '内容'}保存失败`)
    console.error(error)
  }
}

function onCancel() {
  router.back()
}
</script>