/**
 * Registry 构建脚本
 * 扫描 src/components/ui/，生成 registry/registry.json
 * （含源码内联 + 依赖推断 + 组件间依赖）
 *
 * 用法: node registry/build.mjs
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const uiDir = path.join(root, 'src', 'components', 'ui')
const registryDir = path.join(root, 'registry')
const outputFile = path.join(registryDir, 'registry.json')

// 外部依赖白名单（UI 层实际用到的 npm 包）
const EXTERNAL_DEPS = new Set([
  'reka-ui', 'lucide-vue-next', '@vueuse/core', 'class-variance-authority',
  'clsx', 'tailwind-merge', 'vaul-vue', 'motion-v', 'embla-carousel-vue',
  'embla-carousel-autoplay', 'vue-input-otp', 'md-editor-v3', 'echarts',
  '@unovis/vue', '@unovis/ts', 'vue-sonner', 'vee-validate',
  '@internationalized/date', 'pinia', 'vue-router', 'qrcode', 'tw-animate-css',
])

/** 递归收集目录下的 .vue / .ts 文件（相对路径） */
function walk(dir, base = '') {
  const files = []
  if (!fs.existsSync(dir)) return files
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    const rel = base ? path.join(base, entry.name) : entry.name
    if (entry.isDirectory()) {
      files.push(...walk(full, rel))
    } else if (/\.(vue|ts)$/.test(entry.name) && entry.name !== '_registry.ts') {
      files.push(rel)
    }
  }
  return files
}

/** 从源码提取 import 的外部依赖 + 内部 ui 依赖 */
function extractDeps(content) {
  const external = new Set()
  const internal = new Set()
  // 匹配 import/export ... from 'spec'
  const re = /(?:import|export)\s+(?:type\s+)?(?:\{[^}]*\}|\*\s+as\s+\w+|\w+(?:\s*,\s*\{[^}]*\})?)\s+from\s+['"]([^'"]+)['"]/g
  let m
  while ((m = re.exec(content)) !== null) {
    const spec = m[1]
    if (spec.startsWith('.')) {
      // 相对导入：跨 ui 组件目录 → 内部依赖；同目录 → 忽略
      const uiMatch = spec.match(/\/ui\/([^/]+)/)
      if (uiMatch) internal.add(uiMatch[1])
    } else if (!spec.startsWith('virtual:') && !spec.startsWith('@/lib')) {
      const pkg = spec.startsWith('@') ? spec.split('/').slice(0, 2).join('/') : spec.split('/')[0]
      external.add(pkg)
    }
  }
  // 过滤：只保留白名单外的真实 npm 依赖（排除相对/别名）
  const filteredExternal = [...external].filter(p => p !== 'vue' && p !== '.' && p !== '..' && !p.startsWith('.'))
  return { external: filteredExternal, internal: [...internal] }
}

/** 读取文件内容，统一换行 */
function readContent(filePath) {
  return fs.readFileSync(filePath, 'utf-8').replace(/\r\n/g, '\n')
}

function main() {
  const items = []
  const dirs = fs.readdirSync(uiDir, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name)
    .sort()

  for (const name of dirs) {
    const compDir = path.join(uiDir, name)
    const files = walk(compDir).map(rel => ({
      path: path.join('ui', name, rel).replace(/\\/g, '/'),
      type: 'registry:ui',
      content: readContent(path.join(compDir, rel)),
    }))

    // 合并所有文件的依赖
    const allContent = files.map(f => f.content).join('\n')
    const { external, internal } = extractDeps(allContent)

    items.push({
      name,
      type: 'registry:ui',
      dependencies: [...new Set(external)].sort(),
      registryDependencies: [...new Set(internal)].sort(),
      files,
    })
  }

  const registry = {
    $schema: 'https://your-domain.example/schema.json',
    name: '@rionstudio/ui',
    homepage: 'https://your-domain.example',
    items,
  }

  if (!fs.existsSync(registryDir)) fs.mkdirSync(registryDir, { recursive: true })
  fs.writeFileSync(outputFile, JSON.stringify(registry, null, 2) + '\n', 'utf-8')

  // 统计
  const withDeps = items.filter(i => i.dependencies.length).length
  const withInternal = items.filter(i => i.registryDependencies.length).length
  const totalFiles = items.reduce((s, i) => s + i.files.length, 0)
  console.log(`✅ 生成 ${outputFile}`)
  console.log(`   组件: ${items.length} | 文件: ${totalFiles} | 有外部依赖: ${withDeps} | 有内部依赖: ${withInternal}`)
  console.log(`   外部依赖汇总: ${[...new Set(items.flatMap(i => i.dependencies))].sort().join(', ')}`)
}

main()
