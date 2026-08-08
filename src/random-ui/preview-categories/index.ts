import CardsPreviewCategory from './CardsPreviewCategory.vue'
import ChartsPreviewCategory from './ChartsPreviewCategory.vue'
import FormsPreviewCategory from './FormsPreviewCategory.vue'
import ListsPreviewCategory from './ListsPreviewCategory.vue'
import NavigationPreviewCategory from './NavigationPreviewCategory.vue'
import ShowcasePreviewCategory from './ShowcasePreviewCategory.vue'
import StatesPreviewCategory from './StatesPreviewCategory.vue'
import type { RandomUiPreviewCategory, RandomUiPreviewCategoryKey } from './types'

export type { RandomUiPreviewCategory, RandomUiPreviewCategoryKey } from './types'

export const DEFAULT_RANDOM_UI_PREVIEW_CATEGORY: RandomUiPreviewCategoryKey = 'navigation'

export const RANDOM_UI_PREVIEW_CATEGORIES: RandomUiPreviewCategory[] = [
  {
    key: 'charts',
    label: '图表',
    description: '趋势、统计、指标可视化组件。',
    component: ChartsPreviewCategory,
    width: 'wide',
  },
  {
    key: 'forms',
    label: '表单',
    description: '输入、配置、上传、邀请与交互式提交组件。',
    component: FormsPreviewCategory,
    width: 'wide',
  },
  {
    key: 'navigation',
    label: '导航',
    description: '导航、入口、快捷操作和信息入口类组件。',
    component: NavigationPreviewCategory,
    width: 'wide',
  },
  {
    key: 'cards',
    label: '卡片',
    description: '信息卡、资料卡、金额卡和进度卡组件。',
    component: CardsPreviewCategory,
    width: 'wide',
  },
  {
    key: 'lists',
    label: '列表',
    description: '列表、里程碑、通知、目录和社交信息流组件。',
    component: ListsPreviewCategory,
    width: 'narrow',
  },
  {
    key: 'states',
    label: '状态',
    description: '空状态、异常反馈、同步过程与骨架屏组件。',
    component: StatesPreviewCategory,
    width: 'narrow',
  },
  {
    key: 'showcase',
    label: '展示',
    description: '样式展示、组件全集和场景型控件组件。',
    component: ShowcasePreviewCategory,
    width: 'narrow',
  },
]

export const RANDOM_UI_PREVIEW_CATEGORY_OPTIONS = RANDOM_UI_PREVIEW_CATEGORIES.map(category => ({
  value: category.key,
  label: category.label,
  description: category.description,
}))

export function getRandomUiPreviewCategory(categoryKey?: RandomUiPreviewCategoryKey) {
  return RANDOM_UI_PREVIEW_CATEGORIES.find(category => category.key === categoryKey)
    ?? RANDOM_UI_PREVIEW_CATEGORIES.find(category => category.key === DEFAULT_RANDOM_UI_PREVIEW_CATEGORY)
    ?? RANDOM_UI_PREVIEW_CATEGORIES[0]
}
