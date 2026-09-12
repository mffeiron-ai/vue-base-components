/**
 * Registry 构建脚本
 *
 * 1) 扫描 src/components/ui/（**唯一组件源**），生成 registry/registry.json
 *    （含源码内联 + 依赖推断 + 组件间依赖）
 * 2) 为 8 套风格生成 registry/styles/<风格>/registry.json
 *    每份只带该风格的 CSS（style-<风格>.css + utilities.css），组件全部复用上面这一份，
 *    即「一套组件 + 8 套 CSS」，不再为每套风格复制一份组件源码。
 *
 * 用法: node registry/build.mjs
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const uiDir = path.join(root, 'src', 'components', 'ui')
const stylesDir = path.join(root, 'src', 'styles')
const registryDir = path.join(root, 'registry')
const outputFile = path.join(registryDir, 'registry.json')
const SCHEMA = 'https://your-domain.example/schema.json'
// 风格名 = src/styles/style-<短名>.css 的短名；组件本身只有一套，风格差异全在 CSS 里
const styleNames = ['reka-luma', 'reka-lyra', 'reka-maia', 'reka-mira', 'reka-nova', 'reka-rhea', 'reka-sera', 'reka-vega']

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
      // 相对导入分三种：
      //   ../button           → 跨组件目录，算组件间依赖（组件源用的就是这种写法）
      //   ../button/index     → 同上
      //   ../../../lib/utils  → 指向 lib（名字以 . 开头，不会命中）
      //   ./useQuestionnaire  → 同目录，忽略
      const sibling = spec.match(/^\.\.\/([A-Za-z][^/]*)(?:\/|$)/)
      if (sibling) {
        internal.add(sibling[1])
      } else {
        const uiMatch = spec.match(/\/ui\/([^/]+)/)
        if (uiMatch) internal.add(uiMatch[1])
      }
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

function buildRegistry(sourceDir, name) {
  const items = []
  const dirs = fs.readdirSync(sourceDir, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name)
    .sort()

  for (const name of dirs) {
    const compDir = path.join(sourceDir, name)
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

  return {
    $schema: SCHEMA,
    name: '@rionstudio/ui',
    homepage: 'https://your-domain.example',
    items,
  }
}

/**
 * 风格包：不再复制组件源码，只带该风格的 CSS
 *  （style-<短名>.css 负责该风格的全部视觉差异，utilities.css 是组件用到的自定义工具类）
 */
function buildStyleRegistry(styleName) {
  const short = styleName.replace(/^reka-/, '')
  const cssFiles = [`style-${short}.css`, 'utilities.css']
    .map(f => path.join(stylesDir, f))
    .filter(f => fs.existsSync(f))
    .map(f => ({
      path: `styles/${path.basename(f)}`,
      type: 'registry:style',
      content: readContent(f),
    }))

  return {
    $schema: SCHEMA,
    name: `@rionstudio/ui/${styleName}`,
    style: styleName,
    // 组件统一来自这份单组件源；风格文件只负责额外叠上视觉差异
    extends: '../../registry.json',
    items: [
      {
        name: styleName,
        type: 'registry:style',
        dependencies: [],
        registryDependencies: [],
        files: cssFiles,
      },
    ],
  }
}

function writeRegistry(filePath, registry) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, JSON.stringify(registry, null, 2) + '\n', 'utf-8')
}

function printStats(label, filePath, registry) {
  const { items } = registry
  const withDeps = items.filter(i => i.dependencies.length).length
  const withInternal = items.filter(i => i.registryDependencies.length).length
  const totalFiles = items.reduce((s, i) => s + i.files.length, 0)
  console.log(`✅ ${label}: ${filePath}`)
  console.log(`   组件: ${items.length} | 文件: ${totalFiles} | 外部依赖组件: ${withDeps} | 内部依赖组件: ${withInternal}`)
}

function main() {
  const baseRegistry = buildRegistry(uiDir)
  writeRegistry(outputFile, baseRegistry)
  printStats('唯一组件源 registry', outputFile, baseRegistry)

  // 先清掉上一轮生成结果，避免风格被移除后留下陈旧目录
  fs.rmSync(path.join(registryDir, 'styles'), { recursive: true, force: true })

  for (const styleName of styleNames) {
    const styleOutput = path.join(registryDir, 'styles', styleName, 'registry.json')
    const registry = buildStyleRegistry(styleName)
    writeRegistry(styleOutput, registry)
    const cssNames = registry.items[0].files.map(f => path.basename(f.path)).join(' + ')
    console.log(`✅ ${styleName}: ${path.relative(root, styleOutput).replace(/\\/g, '/')} —— ${cssNames}（组件复用 registry.json）`)
  }
}

main()
