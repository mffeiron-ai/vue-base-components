/**
 * 生成模板：cn() 工具、Tailwind 主题 CSS 等
 */

/** cn() 工具源码 */
export function utilsTemplate() {
  return `import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
`
}

/** Tailwind v4 主题 CSS（shadcn-vue 风格 CSS 变量） */
export function tailwindCssTemplate() {
  return `@import "tailwindcss";

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
}

/** 注入 Tailwind 主题（如果用户 css 已有 @theme，跳过注入基础 token） */
export function ensureTailwindTheme(cssPath, fs, path) {
  if (!fs.existsSync(cssPath)) return false
  const content = fs.readFileSync(cssPath, 'utf-8')
  // 已有 --color-primary 说明主题已配置
  if (content.includes('--color-primary')) return false
  const newContent = tailwindCssTemplate() + '\n' + content
  fs.writeFileSync(cssPath, newContent, 'utf-8')
  return true
}
