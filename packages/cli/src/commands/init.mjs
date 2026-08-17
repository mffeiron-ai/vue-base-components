/**
 * init 命令：初始化 components.json + cn() + Tailwind 主题
 */
import fs from 'fs'
import path from 'path'
import { log } from '../utils.mjs'
import { defaultConfig, writeConfig, resolveUtilsDir, resolveTailwindCss } from '../config.mjs'
import { ensureUtils, ensureTailwindTheme } from '../installer.mjs'

export async function init(projectRoot) {
  log.step('初始化 rionstudio...')

  // 1. components.json
  const configPath = path.join(projectRoot, 'components.json')
  let config = null
  if (fs.existsSync(configPath)) {
    config = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
    log.info(`components.json 已存在: ${configPath}`)
  } else {
    config = { ...defaultConfig(), components: [] }
    writeConfig(projectRoot, config)
    log.success(`生成 components.json: ${configPath}`)
  }

  // 2. cn() 工具
  const utilsDir = resolveUtilsDir(config, projectRoot)
  ensureUtils(utilsDir)

  // 3. Tailwind 主题
  const cssPath = resolveTailwindCss(config, projectRoot)
  ensureTailwindTheme(cssPath)

  log.raw('')
  log.success('初始化完成！现在可以运行:')
  log.raw(`  ${'rionstudio add <组件名>'.padEnd(0)}`)
  log.raw('  例如: npx rionstudio add button dialog')
}
