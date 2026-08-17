/**
 * 安装器：复制组件文件、生成 cn()、注入 Tailwind、安装依赖
 */
import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import { ensureDir, log } from './utils.mjs'
import { utilsTemplate } from './template.mjs'

/**
 * 复制组件文件到目标 ui 目录
 * file.path = 'ui/button/Button.vue' → <uiDir>/button/Button.vue
 */
export function installComponentFiles(item, uiDir) {
  const written = []
  for (const file of item.files || []) {
    const relPath = file.path.replace(/^ui\//, '')
    const destPath = path.join(uiDir, relPath)
    ensureDir(path.dirname(destPath))
    fs.writeFileSync(destPath, file.content, 'utf-8')
    written.push(relPath)
  }
  return written
}

/** 确保 cn() 工具存在 */
export function ensureUtils(utilsDir) {
  const utilsFile = path.join(utilsDir, 'utils.ts')
  if (fs.existsSync(utilsFile)) return false
  ensureDir(utilsDir)
  fs.writeFileSync(utilsFile, utilsTemplate(), 'utf-8')
  log.success(`生成 cn() 工具: ${utilsFile}`)
  return true
}

/** 注入 Tailwind 主题 CSS（若用户 css 无 --color-primary） */
export function ensureTailwindTheme(cssPath) {
  if (!fs.existsSync(cssPath)) {
    log.warn(`未找到 Tailwind CSS 文件: ${cssPath}（可手动配置主题色）`)
    return false
  }
  const content = fs.readFileSync(cssPath, 'utf-8')
  if (content.includes('--color-primary')) {
    log.info('Tailwind 主题已配置，跳过')
    return false
  }
  const theme = `@import "tailwindcss";

@theme {
  --color-background: hsl(0 0% 100%);
  --color-foreground: hsl(222.2 84% 4.9%);
  --color-card: hsl(0 0% 100%);
  --color-card-foreground: hsl(222.2 84% 4.9%);
  --color-popover: hsl(0 0% 100%);
  --color-popover-foreground: hsl(222.2 84% 4.9%);
  --color-primary: hsl(222.2 47.4% 11.2%);
  --color-primary-foreground: hsl(210 40% 98%);
  --color-secondary: hsl(210 40% 96.1%);
  --color-secondary-foreground: hsl(222.2 47.4% 11.2%);
  --color-muted: hsl(210 40% 96.1%);
  --color-muted-foreground: hsl(215.4 16.3% 46.9%);
  --color-accent: hsl(210 40% 96.1%);
  --color-accent-foreground: hsl(222.2 47.4% 11.2%);
  --color-destructive: hsl(0 84.2% 60.2%);
  --color-destructive-foreground: hsl(210 40% 98%);
  --color-border: hsl(214.3 31.8% 91.4%);
  --color-input: hsl(214.3 31.8% 91.4%);
  --color-ring: hsl(222.2 84% 4.9%);
  --radius-sm: 0.25rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
  --radius-xl: 0.75rem;
  --radius-2xl: 1rem;
}
`
  fs.writeFileSync(cssPath, theme + '\n' + content, 'utf-8')
  log.success(`注入 Tailwind 主题: ${cssPath}`)
  return true
}

/** 安装 npm 依赖 */
export function installDependencies(deps, cwd) {
  if (!deps || deps.length === 0) return
  log.step(`安装依赖 (${deps.length}): ${deps.join(', ')}`)
  try {
    execSync(`npm install ${deps.map(d => `"${d}"`).join(' ')}`, { cwd, stdio: 'inherit' })
  } catch (e) {
    log.warn(`依赖安装失败（可手动安装）: ${deps.join(', ')}`)
  }
}

/** 移除组件目录 */
export function removeComponent(name, uiDir) {
  const target = path.join(uiDir, name)
  if (fs.existsSync(target)) {
    fs.rmSync(target, { recursive: true, force: true })
    return true
  }
  return false
}
