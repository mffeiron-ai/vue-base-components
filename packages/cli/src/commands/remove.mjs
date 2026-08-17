/**
 * remove 命令：移除已安装组件
 */
import path from 'path'
import { log } from '../utils.mjs'
import { readConfig, resolveUiDir, writeConfig } from '../config.mjs'
import { removeComponent } from '../installer.mjs'

export async function remove(names, { cwd = process.cwd() } = {}) {
  if (!names || names.length === 0) {
    log.error('请指定要移除的组件: npx rionstudio remove button')
    return
  }

  const cfg = readConfig(cwd)
  if (!cfg) {
    log.error('未找到 components.json，请先运行: npx rionstudio init')
    return
  }
  const { config } = cfg
  const projectRoot = cfg.path ? path.dirname(cfg.path) : cwd
  const uiDir = resolveUiDir(config, projectRoot)

  log.step(`移除组件: ${names.join(', ')}`)
  let removed = 0
  for (const name of names) {
    if (removeComponent(name, uiDir)) {
      log.success(`✔ ${name} 已移除`)
      removed++
    } else {
      log.warn(`未找到: ${name}`)
    }
  }

  // 更新已装列表
  if (removed > 0) {
    config.components = (config.components || []).filter(c => !names.includes(c))
    writeConfig(projectRoot, config)
    log.success(`已从 components.json 移除记录`)
  }
}
