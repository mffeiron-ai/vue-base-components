/**
 * 通用工具：颜色输出、文件操作
 */

// ── ANSI 颜色（零依赖）────────────────────────────────
const RESET = '\x1b[0m'
const COLORS = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m',
  bold: '\x1b[1m',
}

export function color(text, c) {
  return `${COLORS[c] || ''}${text}${RESET}`
}

export const log = {
  info: (msg) => console.log(color('ℹ ', 'cyan') + msg),
  success: (msg) => console.log(color('✔ ', 'green') + msg),
  warn: (msg) => console.log(color('⚠ ', 'yellow') + msg),
  error: (msg) => console.log(color('✖ ', 'red') + msg),
  step: (msg) => console.log(color(msg, 'bold')),
  raw: (msg) => console.log(msg),
}

// ── 文件操作 ───────────────────────────────────────────
import fs from 'fs'
import path from 'path'

/** 确保目录存在 */
export function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true })
}

/** 向上查找文件（从 startDir 逐级向上） */
export function findUp(startDir, fileName) {
  let dir = startDir
  while (dir !== path.parse(dir).root) {
    const p = path.join(dir, fileName)
    if (fs.existsSync(p)) return p
    dir = path.dirname(dir)
  }
  return null
}

/** 递归复制目录 */
export function copyDir(src, dest) {
  ensureDir(dest)
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name)
    const destPath = path.join(dest, entry.name)
    if (entry.isDirectory()) copyDir(srcPath, destPath)
    else fs.copyFileSync(srcPath, destPath)
  }
}

/** 查找项目根（含 package.json 或 components.json 的目录） */
export function findProjectRoot(startDir) {
  let dir = startDir
  while (dir !== path.parse(dir).root) {
    const hasPkg = fs.existsSync(path.join(dir, 'package.json'))
    const hasComponents = fs.existsSync(path.join(dir, 'components.json'))
    if (hasPkg || hasComponents) return dir
    dir = path.dirname(dir)
  }
  return process.cwd()
}
