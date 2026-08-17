/**
 * list 命令：列出 registry 可用组件 + 已安装组件
 */
import { log } from '../utils.mjs'
import { readConfig, resolveUiDir } from '../config.mjs'
import { loadRegistry } from '../registry.mjs'

export async function list({ cwd = process.cwd() } = {}) {
  const cfg = readConfig(cwd)
  if (!cfg) {
    log.error('未找到 components.json，请先运行: npx rionstudio init')
    return
  }
  const { config } = cfg

  // 已安装
  const installed = config.components || []
  const uiDir = resolveUiDir(config, cwd)

  let registry
  try {
    registry = await loadRegistry(config.registry)
  } catch (e) {
    log.warn(`加载 registry 失败: ${e.message}（仅显示已安装）`)
  }

  if (registry) {
    log.step(`可用组件 (${registry.items.length})`)
    const cols = registry.items.map(i => i.name)
    // 每行 5 个
    for (let i = 0; i < cols.length; i += 5) {
      log.raw('  ' + cols.slice(i, i + 5).join('  '))
    }
  }

  log.raw('')
  if (installed.length) {
    log.step(`已安装 (${installed.length})`)
    log.raw('  ' + installed.join('  '))
  } else {
    log.info('尚未安装任何组件')
  }
}
