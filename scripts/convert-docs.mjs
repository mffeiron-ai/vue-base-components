/**
 * 将 shadcn-docs/components/*.md 批量转换为 docs/components/*.md（VitePress Demo 格式）
 *
 * 用法: node scripts/convert-docs.mjs [--dry]
 *
 * 转换规则：
 * - 去掉 frontmatter / Installation（CLI 章节）/ code-tabs 等框架专属语法
 * - ::component-preview 幸运块 → <Demo>（示例代码从 Usage/Examples 的 ```vue 代码块里提取匹配）
 * - ```vue showLineNumbers → 保留为普通代码块
 * - 保留 Export/Props/Children 等章节
 * - 文档头补中文说明
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const SRC_DIR = path.join(ROOT, 'shadcn-docs', 'components')
const OUT_DIR = path.join(ROOT, 'docs', 'components')
const DRY = process.argv.includes('--dry')

// 转换范围：docs 中已有、且 shadcn-docs 也有的组件（button.md 已手工完善，跳过）
const SKIP = new Set(['toast']) // toast 已废弃指向 sonner
const KEEP = new Set(['button']) // 已是完善的手写中文文档，不覆盖

const DESCRIPTIONS = {
  accordion: '垂直堆叠的可折叠区块，点击标题展开/收起对应内容。',
  'alert-dialog': '模态对话框，用于需要用户确认的重要操作， interrupt 用户当前流程。',
  alert: '向用户展示重要信息的提示条，通常固定在页面区域。',
  'aspect-ratio': '按固定宽高比显示内容的容器，防止媒体加载时布局抖动。',
  avatar: '带降级能力的用户/实体头像，图片加载失败时回退到首字母或图标。',
  badge: '小型状态标记，用于展示计数、状态或分类标签。',
  breadcrumb: '展示当前页面在层级结构中的位置，支持折叠与导航。',
  'button-group': '把多个相关按钮组合成一组的容器。',
  calendar: '日期选择日历，支持单选、多选与范围选择。',
  card: '卡片容器，聚合相关内容与操作。',
  carousel: '轮播组件，通过前后箭头或拖动滚动浏览内容。',
  chart: '基于 Recharts 的图表组件。',
  checkbox: '复选框，在选中和未选中状态之间切换。',
  collapsible: '可折叠区域，click 切换显示隐藏内容。',
  combobox: '输入框 + 下拉列表组合，支持搜索过滤选择。',
  command: '命令面板，常用于 Cmd+K 快捷搜索与命令入口。',
  'context-menu': '右键菜单，在用户右键点击时展示操作选项。',
  dialog: '模态对话框，覆盖在页面之上聚焦用户注意力。',
  drawer: '从屏幕边缘滑出的面板，适合移动端或次要操作流。',
  'dropdown-menu': '下拉菜单，展示一组操作或链接选项。',
  empty: '空状态占位，引导用户进行下一步操作。',
  field: '表单字段容器，聚合 label、控件、描述与错误信息。',
  form: '基于 vee-validate 的表单组件。',
  'hover-card': '鼠标悬停时展示的卡片，适合预览链接或用户信息。',
  'input-group': '输入框组合，为输入框附加图标、按钮或说明。',
  'input-otp': '一次性密码输入框。',
  input: '文本输入框。',
  item: '通用的条目布局组件，聚合图标、标题、描述与操作。',
  kbd: '键盘按键样式标记，展示快捷键。',
  label: '表单控件标签。',
  menubar: '菜单栏，横向排列的下拉菜单集合。',
  'native-select': '原生 select 元素的样式化封装。',
  'navigation-menu': '导航菜单，支持水平/垂直布局与嵌套内容。',
  'number-field': '数字输入框，支持步进、最小/最大值限制。',
  pagination: '分页控件，支持页码、上下页与省略号。',
  'pin-input': 'PIN 码输入框，多个单字符输入框自动聚焦。',
  popover: '弹出层，点击触发展示富交互内容。',
  progress: '进度条，展示任务完成进度。',
  'radio-group': '单选组，在一组互斥选项中选择一个。',
  'range-calendar': '范围选择日历，选择起止日期。',
  resizable: '可拖拽调整大小的面板布局。',
  'scroll-area': '自定义滚动区域，统一样式的滚动条。',
  select: '下拉选择器，从一组选项中选择一个值。',
  separator: '分隔线，视觉或语义上分离内容。',
  sheet: '覆盖在主内容上的侧边面板，类似 dialog 的变体。',
  sidebar: '可折叠的侧边栏，配合 shadcn 布局体系使用。',
  skeleton: '骨架屏，数据加载前的占位动画。',
  slider: '滑块，拖动把手在范围内选择数值。',
  sonner: '基于 vue-sonner 的 toast 通知。',
  spinner: '加载指示器，旋转动画。',
  stepper: '步骤条，引导用户完成多步流程。',
  switch: '开关，两种状态之间切换。',
  table: '表格组件，展示行列数据。',
  tabs: '选项卡，在同一区域切换不同的内容面板。',
  'tags-input': '标签输入框，输入后回车生成标签。',
  textarea: '多行文本输入框。',
  'toggle-group': '开关按钮组，多选或单选的一组 toggle。',
  toggle: '按压开关按钮，两种状态切换。',
  tooltip: '鼠标悬停提示，简短说明元素。',
}

function toTitle(name) {
  return name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

/** 从 script 内容提取完整 import 语句（支持多行） */
function collectImports(scriptContent) {
  const stmts = []
  let buf = ''
  for (const line of scriptContent.split('\n')) {
    const t = line.trim()
    if (!t) continue
    if (!buf && !t.startsWith('import')) continue
    buf += (buf ? ' ' : '') + t
    if (/from\s+['"][^'"]+['"]$/.test(buf)) { stmts.push(buf); buf = '' }
  }
  if (buf) stmts.push(buf)
  return stmts
}

const CN_TITLE = {
  accordion: '手风琴', 'alert-dialog': '警告对话框', alert: '警告提示',
  'aspect-ratio': '宽高比', attachment: '附件', avatar: '头像', badge: '徽标',
  breadcrumb: '面包屑', bubble: '气泡', 'button-group': '按钮组', calendar: '日历',
  card: '卡片', carousel: '轮播', chart: '图表', checkbox: '复选框',
  collapsible: '折叠面板', combobox: '组合框', command: '命令面板',
  'context-menu': '右键菜单', 'data-table': '数据表格', 'date-picker': '日期选择器',
  dialog: '对话框', drawer: '抽屉', 'dropdown-menu': '下拉菜单', empty: '空状态',
  field: '表单字段', form: '表单', 'hover-card': '悬停卡片', 'input-group': '输入组',
  'input-otp': 'OTP 输入', input: '输入框', item: '条目', kbd: '键盘按键',
  label: '标签', marker: '标记', menubar: '菜单栏', message: '消息',
  'message-scroller': '消息滚动容器', 'native-select': '原生选择器',
  'navigation-menu': '导航菜单', 'number-field': '数字输入', pagination: '分页',
  'pin-input': 'PIN 输入', popover: '弹出层', progress: '进度条',
  questionnaire: '问卷', 'radio-group': '单选组', 'range-calendar': '范围日历',
  resizable: '可调整大小', 'scroll-area': '滚动区域', select: '选择器',
  separator: '分隔线', sheet: '侧边面板', sidebar: '侧边栏', skeleton: '骨架屏',
  slider: '滑块', sonner: 'Toast 通知', spinner: '加载指示', stepper: '步骤条',
  switch: '开关', table: '表格', tabs: '选项卡', 'tags-input': '标签输入',
  textarea: '多行输入', 'toggle-group': '开关按钮组', toggle: '开关按钮',
  tooltip: '文字提示', typography: '排版',
}

/** 提取 frontmatter 后的正文 */
function stripFrontmatter(content) {
  return content.replace(/^---[\s\S]*?---\n/, '')
}

/** 提取 frontmatter description */
function extractDescription(content) {
  const m = content.match(/^description:\s*(.+)$/m)
  return m ? m[1].trim() : ''
}

/**剔除 Installation / code-tabs 整块 */
function removeInstallation(content) {
  // 匹配 "## Installation" 到下一个 "## "（不含）之间的内容
  const re = /^## Installation[\s\S]*?(?=^## )/m
  return content.replace(re, '')
}

/** 转换指令块等框架语法 */
function convertSyntax(content) {
  // 去掉 vue-school-link 等自定义组件
  content = content.replace(/^::vue-school-link[\s\S]*?::$/gm, '')
  // ::component-preview 块 —— 收集 name 供后续匹配 demo 代码
  // 先全部移除，后面由 convertPreviews 统一替换
  // Callout → 提示块
  content = content.replace(/^::Callout(\{[^}]*\})?([^\n]*)\n([\s\S]*?)^::$/gm, (m, attrs, title, body) => {
    const t = title.trim()
    return `> ${t ? `**${t.replace(/^title="|"$/g, '')}**\n> \n> ` : ''}${body.trim().split('\n').join('\n> ')}`
  })
  return content
}

/**
 * 解析 Usage/Examples 中的 ```vue 代码块，返回 { demoName → code } 不可行（代码块与 preview 名无直接映射）
 * 故：把 ::component-preview 转为占位符，然后在最近的 ```vue 后插入 Demo
 */
function convertPreviews(content) {
  // 收集所有 preview 名称
  const previews = []
  content = content.replace(/^::component-preview\n---\n([\s\S]*?)\n---\n::$/gm, (m, attrs) => {
    const nameM = attrs.match(/name:\s*(\w+)/)
    previews.push(nameM ? nameM[1] : null)
    return `\n@@PREVIEW:${previews.length - 1}@@\n`
  })

  // 找出正文里的 ```vue 代码块（示例代码）
  const vueBlocks = []
  const vbRe = /```vue showLineNumbers\n([\s\S]*?)```/g
  let m
  while ((m = vbRe.exec(content)) !== null) {
    vueBlocks.push(m[1])
  }

  // 每个 preview 占位符 → <Demo :code="demoN">，并把第 n 个 vue 块填进 script
  let vueIdx = 0
  content = content.replace(/@@PREVIEW:(\d+)@@/g, (mm, i) => {
    const name = previews[Number(i)]
    return `<Demo :code="demo${vueIdx}">\n  <!-- TODO: ${name || 'demo'} TODO预览内容 -->\n</Demo>`
    vueIdx++
  })

  return { content, previews, vueBlocks }
}

/** 转换单个文档 */
function convert(name) {
  const srcPath = path.join(SRC_DIR, `${name}.md`)
  if (!fs.existsSync(srcPath)) return null
  // 统一 \n 行尾，否则多行正则匹配失败
  let content = fs.readFileSync(srcPath, 'utf8').replace(/\r\n/g, '\n')

  // 1. 去 frontmatter
  content = content.replace(/^---\n[\s\S]*?\n---\n/, '')

  // 2. 去掉 Installation 章节（到下一个 ## 为止）
  content = content.replace(/^## Installation[\s\S]*?(?=^## )/m, '')
  content = content.replace(/^## Install[\s\S]*?(?=^## )/m, '')

  // 3. 自定义组件清理
  content = content.replace(/^::vue-school-link[\s\S]*?::$/gm, '')
  content = content.replace(/<vue-school-link[\s\S]*?<\/vue-school-link>/g, '')

  // 4. 提取 ```vue 代码块 → demo 变量（仅提取无参数的标准块，与 preview 配对）
  //    带 title=/{n} 参数的块属于参考代码，由 4.2 统一转为纯代码块
  const demos = []
  const processVueBlock = (code) => {
    const raw = code.replace(/^\n+/, '').replace(/\n+$/, '')
    let imports = []
    let templateBody = ''

    if (/<template[\s>]/.test(raw)) {
      const tplMatch = raw.match(/<template[^>]*>\n?([\s\S]*?)\n?<\/template>/)
      templateBody = tplMatch ? tplMatch[1] : ''
      const scriptMatch = raw.match(/<script[^>]*>([\s\S]*?)<\/script>/)
      if (scriptMatch) imports = collectImports(scriptMatch[1])
    } else {
      const lines = raw.split('\n')
      let i = 0
      while (i < lines.length) {
        const t = lines[i].trim()
        if (t.startsWith('import')) { imports.push(t); i++; continue }
        if (imports.length && !t.startsWith('<')) { imports[imports.length - 1] = imports[imports.length - 1].replace(/}$/, '') + ' ' + t.replace(/^import\s*/, ''); i++; continue }
        break
      }
      templateBody = lines.slice(i).join('\n')
    }

    // 静态检测：不含动态绑定(非常量表达式)/指令/插值才可直接渲染
    // :prop="'str'" / :prop="123" / :prop="[1,2]" / :prop="{...}" / :prop="true" 视为静态
    // @click="fn(...)" 内联调用可渲染；@click="handler" 引用 script 变量视为动态
    const withoutInlineEvents = templateBody.replace(/@[\w.]+="[^"]*\([^"]*\)"/g, '')
    const hasVarEventHandler = /@[\w.]+="\w+"/.test(withoutInlineEvents)
    const isStatic = templateBody.length > 0
      && !/v-for|v-if|v-show|v-model|\{\{/.test(templateBody)
      && !hasVarEventHandler
      && !/:[\w-]+="(?!\s*('([^']*)'|"([^"]*)"|\d+|\[[^\]]*\]|\{[^}]*\}|true|false)\s*)[^"]*"/.test(withoutInlineEvents)

    const display = raw.split('\n')
      .filter(l => {
        const t = l.trim()
        return !t.startsWith('<script') && t !== '</script>' && !t.startsWith('<template') && t !== '</template>'
      })
      .join('\n')
      .replace(/\n{3,}/g, '\n\n')

    return { imports, templateBody, isStatic, display }
  }

  content = content.replace(/```vue showLineNumbers\n([\s\S]*?)```/g, (m, code) => {
    demos.push(processVueBlock(code))
    return `\n@@DEMO:${demos.length - 1}@@\n`
  })
  // 末尾未闭合的 ```vue 块兜底（部分源文档截断）
  content = content.replace(/```vue showLineNumbers\n([\s\S]*)$/g, (m, code) => {
    demos.push(processVueBlock(code))
    return `\n@@DEMO:${demos.length - 1}@@\n`
  })

  // 4.2 必须在裸 script 提取之前：带参数的 ```vue 块（{n}/title=）转为纯代码块
  //     否则裸 script 提取会拆散其内部 <script>，留下悬空 JS
  content = content.replace(/```vue[^\n]*\n([\s\S]*?)```/g, (m, code) => {
    return '```vue\n' + code + '```'
  })

  // 4.3 提取裸 `<script setup lang="ts">` 块（部分 Example 内嵌）→ 防止 Vue 解析
  content = content.replace(/^<script setup lang="ts">\n([\s\S]*?)<\/script>$/gm, (m, code) => {
    return '```vue\n' + code + '```'
  })

  // 5. ::component-preview 块 → <Demo>（按文档顺序与 demo 配对）
  //    - 有对应 demo 且静态 → 模板放进插槽真实渲染
  //    - 有对应 demo 且动态 → TODO 注释
  //    - 无对应 demo（examples 型 preview）→ 第一个含该组件标签的静态 demo 兜底，
  //      否则首个静态 demo；都没有 → TODO
  const compTag = toTitle(name).replace(/\s/g, '')
  let previewCount = 0
  content = content.replace(/^::component-preview\n---\n[\s\S]*?\n---\n::$/gm, () => {
    const idx = previewCount++
    let d = demos[idx]
    if (!d || !d.templateBody) {
      // 兜底：找包含组件名标签的静态模板
      d = demos.find(x => x.templateBody && x.templateBody.includes('<' + compTag) && x.isStatic)
        || (demos[0] && demos[0].isStatic ? demos[0] : null)
    }
    if (!d || !d.templateBody) {
      return `<Demo :code="demo0">\n  <!-- TODO: 动态示例需补充 script 逻辑后放入 -->\n</Demo>`
    }
    const slot = d.isStatic
      ? d.templateBody.split('\n').map(l => '  ' + l).join('\n')
      : `  <!-- TODO: 动态示例需补充 script 逻辑后放入 -->`
    const codeVar = `demo${demos.indexOf(d)}`
    return `<Demo :code="${codeVar}">\n${slot}\n</Demo>`
  })

  // 5.1 清理残留占位符(无 preview 配对的 demo)
  content = content.replace(/^@@DEMO:\d+@@\n?/gm, '')

  // 6. 清理其他 Nuxt 容器语法
  content = content.replace(/^:{2,3}(callout|tip|note|warning|caution)\b.*$/gm, '> **提示**')
  content = content.replace(/^:{2,4}(tabs|tabs-list|tabs-trigger|tabs-content|step|steps)\S*\s*(\{[^}]*\})?\s*$/gm, '')
  content = content.replace(/^:(props|class|style)=.*$/gm, '')
  // tabs 列表文本行: "   Component" / "  ::" 类残留
  content = content.replace(/^\s*::\s*$/gm, '')

  // 7. 内部链接 /docs/components/xxx → /components/xxx.html
  content = content.replace(/\]\(\/docs\/components\/([^)#]+)([^)]*)\)/g, '](/components/$1.html)')
  content = content.replace(/\]\(\/docs\/([^)#]+)([^)]*)\)/g, '](/components/$1.html)')
  // 链接文本中的花括号残留
  content = content.replace(/\[\$\{1\}\]/g, '')

  // 8. 清理多余空行
  content = content.replace(/\n{3,}/g, '\n\n').trim()

  // 9. 代码里的反斜杠路径等残留清理
  content = content.replace(/鈹?[^\n]*/g, (m) => m.includes('鈹') ? '' : m)

  // 10. 组装 script setup
  //     demo 展示代码放模板字符串；imports(路径转 @/)提升为真实 DOM 组件导入
  const scriptParts = [`<script setup>`]
  const realImports = []
  const seenImports = new Set()
  for (const d of demos) {
    for (let line of d.imports) {
      line = line.trim()
      if (!line) continue
      // @/components/ui/xxx 或 @/registry/default/ui/xxx → 相对路径，@lucide/vue → lucide-vue-next
      const m1 = line.match(/'@\/components\/ui\/([\w-]+)'/)
      if (m1) line = line.replace(/'@\/components\/ui\/[\w-]+'/, `'../../src/components/ui/${m1[1]}'`)
      const m2 = line.match(/'@\/registry\/(?:default|new-york-v4)\/ui\/([\w-]+)'/)
      if (m2) line = line.replace(/'@\/registry\/(?:default|new-york-v4)\/ui\/[\w-]+'/, `'../../src/components/ui/${m2[1]}'`)
      line = line.replace(/'@lucide\/vue'/, `'lucide-vue-next'`)
      if (!seenImports.has(line)) { seenImports.add(line); realImports.push(line) }
    }
  }
  scriptParts.push(...realImports)
  for (let i = 0; i < demos.length; i++) {
    const display = demos[i].display
      .replace(/`/g, '\\`')
      .replace(/\$\{/g, '\\${')
    scriptParts.push(`\nconst demo${i} = \`${display}\``)
  }
  scriptParts.push(`</script>`)

  // 11. 标题
  const title = toTitle(name)
  const cn = CN_TITLE[name] || ''
  const header = cn ? `# ${title} ${cn}\n\n` : `# ${title}\n\n`
  // 去掉源文档 H1(若有)；H2 及以后正文保留
  const body = content.replace(/^#\s+.*\n/, '')

  return `${header}${scriptParts.join('\n')}\n\n${body}\n`
}

function nameToChinese(name) {
  const map = {
    accordion: '手风琴', 'alert-dialog': '警告对话框', alert: '警告提示',
    'aspect-ratio': '宽高比', avatar: '头像', badge: '徽标', breadcrumb: '面包屑',
    'button-group': '按钮组', calendar: '日历', card: '卡片', carousel: '轮播',
    chart: '图表', checkbox: '复选框', collapsible: '折叠面板', combobox: '组合框',
    command: '命令面板', 'context-menu': '右键菜单', dialog: '对话框', drawer: '抽屉',
    'dropdown-menu': '下拉菜单', empty: '空状态', field: '表单字段', form: '表单',
    'hover-card': '悬停卡片', 'input-group': '输入组', 'input-otp': 'OTP 输入',
    input: '输入框', item: '条目', kbd: '键盘按键', label: '标签', menubar: '菜单栏',
    'native-select': '原生选择器', 'navigation-menu': '导航菜单',
    'number-field': '数字输入', pagination: '分页', 'pin-input': 'PIN 输入',
    popover: '弹出层', progress: '进度条', 'radio-group': '单选组',
    'range-calendar': '范围日历', resizable: '可调整大小', 'scroll-area': '滚动区域',
    select: '选择器', separator: '分隔线', sheet: '侧边面板', sidebar: '侧边栏',
    skeleton: '骨架屏', slider: '滑块', sonner: 'Toast 通知', spinner: '加载指示',
    stepper: '步骤条', switch: '开关', table: '表格', tabs: '选项卡',
    'tags-input': '标签输入', textarea: '多行输入', 'toggle-group': '开关按钮组',
    toggle: '开关按钮', tooltip: '文字提示',
  }
  return map[name] || ''
}

// ---- main ----
const files = fs.readdirSync(SRC_DIR).filter(f => f.endsWith('.md')).map(f => f.replace(/\.md$/, ''))
const results = { ok: [], skip: [], empty: [], nodemo: [] }

for (const name of files) {
  if (SKIP.has(name)) { results.skip.push(name); continue }
  if (KEEP.has(name)) { results.skip.push(`${name} (keep)`); continue }

  const out = convert(name)
  if (!out) { results.empty.push(name); continue }

  const hasDemo = out.includes('<Demo')
  if (!hasDemo) results.nodemo.push(name)

  if (!DRY) {
    fs.writeFileSync(path.join(OUT_DIR, `${name}.md`), out)
  }
  results.ok.push(name)
}

console.log(`转换完成: ${results.ok.length} 个`)
if (results.skip.length) console.log(`跳过: ${results.skip.join(', ')}`)
if (results.empty.length) console.log(`无源文档: ${results.empty.join(', ')}`)
if (results.nodemo.length) console.log(`无 Demo 的文档(纯文本 API): ${results.nodemo.join(', ')}`)
