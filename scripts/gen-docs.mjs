/**
 * 自动生成 UI 组件展示 Markdown 骨架
 * 用法: node scripts/gen-docs.mjs
 *
 * 基于 src/components/ui/_registry.ts 的组件清单，
 * 读取每个组件的 index.ts，提取导出列表和 cva 变体信息，
 * 生成 docs/components/<name>.md
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const UI_DIR = path.join(ROOT, 'src', 'components', 'ui')
const DOCS_DIR = path.join(ROOT, 'docs', 'components')
const REGISTRY_PATH = path.join(UI_DIR, '_registry.ts')

// ── 工具函数 ──────────────────────────────────────────

/** 连字符转大驼峰: "alert-dialog" → "AlertDialog" */
function toPascal(str) {
  return str.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

/** kebab 转首字母大写的自然语言: "alert-dialog" → "Alert Dialog" */
function toTitle(str) {
  return str.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

/** 确保目录存在 */
function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

// ── 解析器 ────────────────────────────────────────────

/**
 * 从 _registry.ts 提取组件名列表
 */
function parseRegistryNames() {
  const content = fs.readFileSync(REGISTRY_PATH, 'utf-8')
  const names = []
  const re = /name:\s*"([^"]+)"/g
  let m
  while ((m = re.exec(content)) !== null) {
    names.push(m[1])
  }
  return names
}

/**
 * 解析 index.ts，返回:
 *   - exported: string[]      导出的组件名列表
 *   - variants: VariantDef[]   cva 变体定义
 *   - hasCva: boolean
 */
function parseIndex(name) {
  const indexPath = path.join(UI_DIR, name, 'index.ts')
  if (!fs.existsSync(indexPath)) return { exported: [], variants: [], hasCva: false }

  const content = fs.readFileSync(indexPath, 'utf-8')
  const exported = []
  const variants = []

  // 提取 export { default as Xxx }
  const expRe = /export\s*\{\s*default\s+as\s+(\w+)\s*\}/g
  let m
  while ((m = expRe.exec(content)) !== null) {
    exported.push(m[1])
  }

  // 提取 cva 定义的变体
  // 匹配: cva("base", { variants: { variant: { default: "...", secondary: "...", ... }, size: { ... } } })
  const cvaRe = /cva\(\s*"[^"]*"\s*,\s*\{([\s\S]*?)\}\s*\)/g
  let cvaMatch
  while ((cvaMatch = cvaRe.exec(content)) !== null) {
    const body = cvaMatch[1]

    // 提取 variants 块
    const variantsBlock = body.match(/variants:\s*\{([\s\S]*?)\}\s*,?\s*(?:defaultVariants|compoundVariants|$)/)
    if (!variantsBlock) continue

    const variantsBody = variantsBlock[1]

    // 提取每个 variant key（如 variant:, size:）
    const keyRe = /(\w+):\s*\{([\s\S]*?)\n\s*\}/g
    let keyMatch
    while ((keyMatch = keyRe.exec(variantsBody)) !== null) {
      const keyName = keyMatch[1]
      const keyBody = keyMatch[2]

      // 提取选项值（如 default: "bg-primary..."）
      const options = []
      const optRe = /(\w[\w-]*):\s*"([^"]*)"/g
      let optMatch
      while ((optMatch = optRe.exec(keyBody)) !== null) {
        options.push(optMatch[1])
      }

      if (options.length > 0) {
        variants.push({ name: keyName, options })
      }
    }
  }

  return { exported, variants, hasCva: variants.length > 0 }
}

/**
 * 尝试从主 .vue 文件提取 Props 定义（简要类型信息）
 */
function parseVueProps(name, mainExport) {
  const vuePath = path.join(UI_DIR, name, `${mainExport}.vue`)
  if (!fs.existsSync(vuePath)) return []

  const content = fs.readFileSync(vuePath, 'utf-8')

  // 提取 interface Props extends ... { ... }
  const props = []
  const ifaceRe = /interface\s+\w+\s+(?:extends[^{]+)?\{([\s\S]*?)\n\}/
  const ifaceMatch = content.match(ifaceRe)
  if (ifaceMatch) {
    const body = ifaceMatch[1]
    const propRe = /(\w+)\??:\s*([^;]+)/g
    let pm
    while ((pm = propRe.exec(body)) !== null) {
      const propName = pm[1]
      const propType = pm[2].trim()
      // 跳过 class（它是 HTMLAttributes）
      if (propName === 'class' && propType.includes('HTMLAttributes')) continue
      props.push({ name: propName, type: simplifyType(propType) })
    }
  }

  // 如果没有 interface，尝试 defineProps<...>()
  if (props.length === 0) {
    const dpRe = /defineProps<([^>]+)>/
    const dpMatch = content.match(dpRe)
    if (dpMatch) {
      const typeStr = dpMatch[1]
      // 简单处理 & 交叉类型
      const parts = typeStr.split('&').map(s => s.trim())
      for (const part of parts) {
        // 如果是 { variant?: ..., size?: ... } 内联对象
        const inlineRe = /\{([\s\S]*?)\}/
        const inlineMatch = part.match(inlineRe)
        if (inlineMatch) {
          const propRe = /(\w+)\??:\s*([^;]+)/g
          let pm
          while ((pm = propRe.exec(inlineMatch[1])) !== null) {
            props.push({ name: pm[1], type: simplifyType(pm[2].trim()) })
          }
        }
      }
    }
  }

  return props
}

function simplifyType(t) {
  return t
    .replace(/\s+/g, ' ')
    .replace(/HTMLAttributes\["class"\]/, 'string')
    .replace(/\| undefined/g, '')
    .trim()
}

// ── Markdown 生成器 ────────────────────────────────────

function generateMd(name, info) {
  const { exported, variants, hasCva } = info
  const title = toTitle(name)
  const importPath = `../../src/components/ui/${name}`
  const imports = exported.join(', ')

  const mainExport = exported[0] || toTitle(name)

  // 提取 Props
  const props = parseVueProps(name, mainExport)

  let md = `# ${title}\n\n`

  // 描述占位
  md += `> TODO: 组件描述\n\n`

  // 导入语句
  md += `## 导入\n\n`
  md += `\`\`\`vue\n`
  md += `<script setup lang="ts">\n`
  md += `import { ${imports} } from 'vue-base-components'\n`
  md += `</script>\n`
  md += `\`\`\`\n\n`

  // 复合组件：列出子组件
  if (exported.length > 3) {
    md += `## 子组件\n\n`
    md += `该组件由以下子组件组合而成：\n\n`
    md += `| 组件 | 说明 |\n|------|------|\n`
    for (const e of exported) {
      md += `| \`${e}\` | TODO |\n`
    }
    md += `\n`
  }

  // 变体展示
  if (hasCva) {
    for (const v of variants) {
      md += `## ${v.name}\n\n`
      md += `可用值：\`` + v.options.join('` | `') + '`\n\n'
      md += `\`\`\`vue\n`
      for (const opt of v.options) {
        const propStr = v.name === 'variant' ? `variant="${opt}"` : `${v.name}="${opt}"`
        md += `<${mainExport} ${propStr}>${opt}</${mainExport}>\n`
      }
      md += `\`\`\`\n\n`
    }
  }

  // Props API 表格
  if (props.length > 0) {
    md += `## API\n\n`
    md += `| 属性 | 类型 | 说明 |\n|------|------|------|\n`
    for (const p of props) {
      md += `| \`${p.name}\` | \`${p.type}\` | TODO |\n`
    }
    md += `\n`
  } else {
    md += `## API\n\n`
    md += `> TODO: 补充 Props / Emits / Slots 文档\n\n`
  }

  return md
}

// ── 主流程 ────────────────────────────────────────────

function main() {
  const names = parseRegistryNames()
  ensureDir(DOCS_DIR)

  let created = 0
  let skipped = 0

  for (const name of names) {
    const filePath = path.join(DOCS_DIR, `${name}.md`)

    if (fs.existsSync(filePath)) {
      console.log(`  ⏭  跳过已存在: ${name}.md`)
      skipped++
      continue
    }

    const info = parseIndex(name)
    const md = generateMd(name, info)
    fs.writeFileSync(filePath, md, 'utf-8')
    console.log(`  ✅ 生成: ${name}.md  (${info.exported.length} 导出, ${info.variants.length} 变体组)`)
    created++
  }

  console.log(`\n📊 完成: ${created} 新建, ${skipped} 跳过, 共 ${names.length} 个组件`)
}

main()
