/**
 * components.json 配置读写
 */
import fs from 'fs'
import path from 'path'
import { findUp, findProjectRoot, log } from './utils.mjs'

export const CONFIG_FILE = 'components.json'

/** 默认配置 */
export function defaultConfig() {
  return {
    $schema: 'https://your-domain.example/schema.json',
    style: 'reka-nova',
    typescript: true,
    tailwind: {
      css: 'src/assets/index.css',
      baseColor: 'slate',
      cssVariables: true,
    },
    aliases: {
      components: '@/components',
      utils: '@/lib/utils',
      ui: '@/components/ui',
      lib: '@/lib',
    },
    iconLibrary: 'lucide',
    registry: 'https://your-domain.example/r/registry.json',
  }
}

/** 查找 components.json（从 cwd 向上） */
export function findConfig(startDir = process.cwd()) {
  return findUp(startDir, CONFIG_FILE)
}

/** 读取配置；不存在返回 null */
export function readConfig(startDir = process.cwd()) {
  const p = findConfig(startDir)
  if (!p) return null
  try {
    return { path: p, config: JSON.parse(fs.readFileSync(p, 'utf-8')) }
  } catch (e) {
    log.warn(`解析 ${CONFIG_FILE} 失败: ${e.message}`)
    return null
  }
}

/** 写入配置 */
export function writeConfig(dir, config) {
  const p = path.join(dir, CONFIG_FILE)
  fs.writeFileSync(p, JSON.stringify(config, null, 2) + '\n', 'utf-8')
  return p
}

/**
 * 解析别名目录
 * '@/' 惯例映射到项目 src/ 目录；其余相对项目根
 * 返回绝对路径
 */
function resolveAliasDir(alias, projectRoot) {
  if (!alias) return projectRoot
  if (alias.startsWith('@/')) {
    return path.join(projectRoot, 'src', alias.replace(/^@\//, ''))
  }
  return path.resolve(projectRoot, alias)
}

/** 解析 ui 目录（组件复制目标） */
export function resolveUiDir(config, projectRoot) {
  return resolveAliasDir(config?.aliases?.ui, projectRoot)
}

/** 解析 utils 目录（cn() 所在目录，utils.ts 在此目录下） */
export function resolveUtilsDir(config, projectRoot) {
  const alias = config?.aliases?.utils || '@/lib/utils'
  // 去掉末尾文件名/子路径，得到目录（'@/lib/utils' → '@/lib'）
  const dirAlias = alias.replace(/\/[^/]+$/, '')
  return resolveAliasDir(dirAlias, projectRoot)
}

/** 解析 Tailwind css 文件路径 */
export function resolveTailwindCss(config, projectRoot) {
  const css = config?.tailwind?.css || 'src/assets/index.css'
  return path.resolve(projectRoot, css)
}
