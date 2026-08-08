import { defineComponent, h, onUnmounted, shallowRef, watch } from 'vue'
import { useDesignSystemSearchParams, type DesignSystemStyle } from '@/components/useDesignSystemSearchParams'

type ModuleMap = Record<string, () => Promise<Record<string, unknown>>>
type ModuleExports = Record<string, unknown>

const styleModuleLoaders = import.meta.glob('../../components/styles/reka-*/ui/*/index.ts') as ModuleMap
const baseModuleLoaders = import.meta.glob('../../components/ui/*/index.ts') as ModuleMap
const moduleCache = new Map<string, Promise<ModuleExports>>()
const componentCache = new Map<string, unknown>()

function resolveStyleModuleKey(style: DesignSystemStyle, moduleName: string) {
  const styleName = style.startsWith('reka-') ? style : `reka-${style}`
  return `../../components/styles/${styleName}/ui/${moduleName}/index.ts`
}

function resolveBaseModuleKey(moduleName: string) {
  return `../../components/ui/${moduleName}/index.ts`
}

function getOrLoadModule(moduleKey: string, loader: () => Promise<ModuleExports>) {
  const cached = moduleCache.get(moduleKey)
  if (cached) {
    return cached
  }

  const pending = loader()
  moduleCache.set(moduleKey, pending)
  return pending
}

async function resolveExportComponent(nextStyle: DesignSystemStyle, moduleName: string, exportName: string) {
  const styleCacheKey = `${nextStyle}|${moduleName}|${exportName}`
  const cachedStyleComponent = componentCache.get(styleCacheKey)
  if (cachedStyleComponent) {
    return cachedStyleComponent
  }

  const styleModuleKey = resolveStyleModuleKey(nextStyle, moduleName)
  const styleLoader = styleModuleLoaders[styleModuleKey]
  if (styleLoader) {
    const styleModule = await getOrLoadModule(styleModuleKey, styleLoader)
    const styleComponent = styleModule[exportName]
    if (styleComponent) {
      componentCache.set(styleCacheKey, styleComponent)
      return styleComponent
    }
  }

  const baseModuleKey = resolveBaseModuleKey(moduleName)
  const baseCacheKey = `base|${moduleName}|${exportName}`
  const cachedBaseComponent = componentCache.get(baseCacheKey)
  if (cachedBaseComponent) {
    return cachedBaseComponent
  }

  const baseLoader = baseModuleLoaders[baseModuleKey]
  if (!baseLoader) {
    return null
  }

  const baseModule = await getOrLoadModule(baseModuleKey, baseLoader)
  const baseComponent = baseModule[exportName] ?? null
  if (baseComponent) {
    componentCache.set(baseCacheKey, baseComponent)
  }

  return baseComponent
}

export function createStyleComponent(moduleName: string, exportName: string) {
  return defineComponent({
    name: `StyleDispatch${exportName}`,
    inheritAttrs: false,
    setup(_, { attrs, slots }) {
      const { style } = useDesignSystemSearchParams()
      const resolvedComponent = shallowRef<unknown>(null)
      let requestId = 0
      let isUnmounted = false

      onUnmounted(() => {
        isUnmounted = true
        requestId++
      })

      const loadComponent = async (nextStyle: DesignSystemStyle) => {
        const currentRequest = ++requestId
        const component = await resolveExportComponent(nextStyle, moduleName, exportName)
        if (isUnmounted || currentRequest !== requestId) {
          return
        }

        resolvedComponent.value = component
      }

      watch(
        () => style.value,
        (nextStyle) => {
          void loadComponent(nextStyle)
        },
        { immediate: true },
      )

      return () => {
        if (!resolvedComponent.value) {
          return null
        }

        return h(resolvedComponent.value as any, attrs, slots)
      }
    },
  })
}