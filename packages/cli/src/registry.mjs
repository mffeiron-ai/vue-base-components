/**
 * Registry 拉取与组件解析
 * 支持：远程 URL / 本地文件路径
 */
import fs from 'fs'
import path from 'path'
import { log } from './utils.mjs'

/** 从 URL 或本地路径读取 registry 内容 */
async function fetchRegistrySource(registryUrl) {
  if (registryUrl.startsWith('http://') || registryUrl.startsWith('https://')) {
    const res = await fetch(registryUrl)
    if (!res.ok) throw new Error(`拉取 registry 失败: ${res.status} ${res.statusText}`)
    return res.text()
  }
  // 本地文件路径
  const localPath = registryUrl.replace(/^file:\/\//, '')
  if (fs.existsSync(localPath)) return fs.readFileSync(localPath, 'utf-8')
  throw new Error(`找不到 registry: ${registryUrl}`)
}

/** 加载 registry（解析为对象） */
export async function loadRegistry(registryUrl) {
  log.info(`从 ${registryUrl} 加载 registry...`)
  const raw = await fetchRegistrySource(registryUrl)
  const data = JSON.parse(raw)
  const items = Array.isArray(data) ? data : data.items
  if (!items) throw new Error('registry 格式错误：缺少 items')
  return { ...data, items }
}

/** 根据 style 选择对应的风格 registry；未配置时使用基础 registry。 */
export function resolveStyleRegistryUrl(registryUrl, style) {
  if (!style || style === 'default') return registryUrl
  const normalizedStyle = style.startsWith('reka-') ? style : `reka-${style}`
  if (registryUrl.startsWith('http://') || registryUrl.startsWith('https://')) {
    return registryUrl.replace(/\/registry\.json(?:\?.*)?$/, `/styles/${normalizedStyle}/registry.json`)
  }
  const localPath = registryUrl.replace(/^file:\/\//, '')
  return path.join(path.dirname(path.dirname(localPath)), 'styles', normalizedStyle, 'registry.json')
}

/** 按名称查找组件 */
export function findItem(registry, name) {
  return registry.items.find(i => i.name === name)
}

/**
 * 解析组件依赖树（registryDependencies 递归）
 * 返回有序的组件列表（被依赖的在前）
 */
export function resolveDependencyTree(registry, name, visited = new Set(), result = []) {
  if (visited.has(name)) return result
  visited.add(name)
  const item = findItem(registry, name)
  if (!item) {
    log.warn(`找不到组件: ${name}`)
    return result
  }
  // 先处理内部依赖
  for (const dep of item.registryDependencies || []) {
    resolveDependencyTree(registry, dep, visited, result)
  }
  result.push(item)
  return result
}

/** 汇总一组组件的所有外部依赖 */
export function collectDependencies(items) {
  const deps = new Set()
  for (const item of items) {
    for (const d of item.dependencies || []) deps.add(d)
  }
  return [...deps].sort()
}
