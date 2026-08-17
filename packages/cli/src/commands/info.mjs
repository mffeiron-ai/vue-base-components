/**
 * info 命令：显示项目配置与已装组件
 */
import fs from 'fs'
import path from 'path'
import { log } from '../utils.mjs'
import { readConfig, resolveUiDir, resolveUtilsDir, resolveTailwindCss } from '../config.mjs'

export async function info({ cwd = process.cwd() } = {}) {
  const cfg = readConfig(cwd)
  if (!cfg) {
    log.error('未找到 components.json，请先运行: npx rionstudio init')
    return
  }
  const { path: configPath, config } = cfg
  const projectRoot = configPath ? path.dirname(configPath) : cwd

  log.step('rionstudio 配置')
  log.raw(`  配置文件: ${configPath}`)
  log.raw(`  项目目录: ${projectRoot}`)
  log.raw(`  Style: ${config.style || 'default'}`)
  log.raw(`  TypeScript: ${config.typescript ? '是' : '否'}`)
  log.raw(`  图标库: ${config.iconLibrary || 'lucide'}`)
  log.raw(`  Registry: ${config.registry}`)
  log.raw('  别名:')
  for (const [k, v] of Object.entries(config.aliases || {})) {
    log.raw(`    ${k}: ${v}`)
  }

  log.raw('')
  log.step('解析路径')
  log.raw(`  UI 目录: ${resolveUiDir(config, projectRoot)}`)
  log.raw(`  cn() 目录: ${resolveUtilsDir(config, projectRoot)}`)
  log.raw(`  Tailwind CSS: ${resolveTailwindCss(config, projectRoot)}`)

  const installed = config.components || []
  log.raw('')
  log.step(`已安装组件 (${installed.length})`)
  log.raw('  ' + (installed.join('  ') || '（无）'))

  // 检查关键文件
  log.raw('')
  log.step('健康检查')
  const utilsFile = path.join(resolveUtilsDir(config, projectRoot), 'utils.ts')
  const uiDir = resolveUiDir(config, projectRoot)
  log.raw(`  cn() 工具: ${fs.existsSync(utilsFile) ? '✔' : '✖ 缺失'}`)
  log.raw(`  UI 目录: ${fs.existsSync(uiDir) ? '✔' : '✖ 不存在'}`)
  const cssPath = resolveTailwindCss(config, projectRoot)
  log.raw(`  Tailwind CSS: ${fs.existsSync(cssPath) ? '✔' : '✖ 缺失'}`)
}
