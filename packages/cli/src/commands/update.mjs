/**
 * update 命令：更新已安装组件（覆盖源码，保留用户改动需 git 管理）
 */
import fs from 'fs'
import path from 'path'
import { log } from '../utils.mjs'
import { readConfig, resolveUiDir, writeConfig } from '../config.mjs'
import { loadRegistry, resolveStyleRegistryUrl, findItem, collectDependencies } from '../registry.mjs'
import { installComponentFiles, installDependencies } from '../installer.mjs'

export async function update(names, { cwd = process.cwd() } = {}) {
  const cfg = readConfig(cwd)
  if (!cfg) {
    log.error('未找到 components.json，请先运行: npx rionstudio init')
    return
  }
  const { config } = cfg
  const projectRoot = cfg.path ? path.dirname(cfg.path) : cwd
  const uiDir = resolveUiDir(config, projectRoot)

  let registry
  try {
    registry = await loadRegistry(resolveStyleRegistryUrl(config.registry, config.style))
  } catch (e) {
    log.error(`加载 registry 失败: ${e.message}`)
    return
  }

  // 要更新的组件：指定或全部已装
  const installed = config.components || []
  const targets = names && names.length ? names : installed

  if (targets.length === 0) {
    log.info('没有已安装的组件')
    return
  }

  log.step(`更新组件: ${targets.join(', ')}`)
  let updated = 0
  let deps = new Set()
  for (const name of targets) {
    const item = findItem(registry, name)
    if (!item) {
      log.warn(`registry 中找不到: ${name}`)
      continue
    }
    // 检查已安装目录是否存在
    if (!fs.existsSync(path.join(uiDir, name))) {
      log.warn(`未安装（跳过）: ${name}`)
      continue
    }
    const files = installComponentFiles(item, uiDir)
    for (const d of item.dependencies || []) deps.add(d)
    log.success(`✔ ${name} 已更新 (${files.length} 个文件)`)
    updated++
  }

  // 更新组件列表（清理不再存在的）
  if (names && names.length) {
    config.components = [...new Set([...installed, ...names])]
    writeConfig(projectRoot, config)
  }

  installDependencies([...deps], projectRoot)

  log.raw('')
  log.success(`更新完成 (${updated} 个组件)`)
  log.warn('提示: 建议在 git 中先提交本地改动，以便查看差异')
}
