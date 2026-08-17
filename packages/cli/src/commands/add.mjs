/**
 * add 命令：添加组件（递归处理内部依赖、复制文件、装依赖）
 */
import fs from 'fs'
import path from 'path'
import { log } from '../utils.mjs'
import { readConfig, resolveUiDir, resolveUtilsDir, resolveTailwindCss, writeConfig } from '../config.mjs'
import { loadRegistry, resolveStyleRegistryUrl, resolveDependencyTree, collectDependencies } from '../registry.mjs'
import { installComponentFiles, ensureUtils, ensureTailwindTheme, installDependencies } from '../installer.mjs'

export async function add(names, { cwd = process.cwd(), registry: registryFlag } = {}) {
  if (!names || names.length === 0) {
    log.error('请指定要添加的组件，例如: npx rionstudio add button')
    return
  }

  // 1. 读取配置
  const cfg = readConfig(cwd)
  if (!cfg) {
    log.error('未找到 components.json，请先运行: npx rionstudio init')
    return
  }
  const { config } = cfg

  // 2. 加载 registry（支持 -r 覆盖）
  const registryUrl = resolveStyleRegistryUrl(
    registryFlag || config.registry,
    config.style,
  )
  let registry
  try {
    registry = await loadRegistry(registryUrl)
  } catch (e) {
    log.error(`加载 registry 失败: ${e.message}`)
    return
  }

  // 3. 解析依赖树
  const items = []
  const missing = []
  for (const name of names) {
    const tree = resolveDependencyTree(registry, name)
    if (tree.length === 0) {
      missing.push(name)
      continue
    }
    for (const item of tree) {
      if (!items.find(i => i.name === item.name)) items.push(item)
    }
  }
  if (missing.length) log.warn(`找不到组件: ${missing.join(', ')}`)

  // 4. 复制文件
  const projectRoot = cfg.path ? path.dirname(cfg.path) : cwd
  const uiDir = resolveUiDir(config, projectRoot)
  const installed = []

  log.step(`安装组件: ${items.map(i => i.name).join(', ')}`)
  for (const item of items) {
    const files = installComponentFiles(item, uiDir)
    installed.push(item.name)
    log.success(`✔ ${item.name} (${files.length} 个文件)`)
  }

  // 5. 确保 cn() 与 Tailwind 主题
  const utilsDir = resolveUtilsDir(config, projectRoot)
  ensureUtils(utilsDir)
  const cssPath = resolveTailwindCss(config, projectRoot)
  ensureTailwindTheme(cssPath)

  // 6. 更新 components.json 已装列表
  config.components = [...new Set([...(config.components || []), ...installed])]
  writeConfig(projectRoot, config)

  // 7. 安装依赖
  const deps = collectDependencies(items)
  installDependencies(deps, projectRoot)

  log.raw('')
  log.success('安装完成！')
  for (const name of installed) {
    log.raw(`  导入: import { ${pascalCase(name)} } from '${config.aliases.ui || '@/components/ui'}/${name}'`)
  }
}

function pascalCase(str) {
  return str.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('')
}
