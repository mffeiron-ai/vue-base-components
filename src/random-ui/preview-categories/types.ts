import type { Component } from 'vue'

export type RandomUiPreviewCategoryKey = 'charts' | 'forms' | 'navigation' | 'cards' | 'lists' | 'states' | 'showcase'

export type RandomUiPreviewCategory = {
  key: RandomUiPreviewCategoryKey
  label: string
  description: string
  component: Component
  width: 'wide' | 'narrow'
}
