/**
 * 风格预设「按需挂载」—— 把非当前风格的预设规则从主样式表里摘出去
 *
 * ── 为什么需要它 ─────────────────────────────────────────────
 * app/src/style.css 把 8 套设计系统预设（src/styles/style-*.css）一起 @import，
 * 由 Tailwind 编译进同一张表：3519 条规则 / 1.97MB。但任意时刻只有 <html> 上
 * `.style-<name>` 那一套真正参与匹配。
 *
 * 问题出在「整文档样式重算」：打开浮层（Select 的 popper portal 到 body）、切换
 * class、focus 变化等都会让 Chromium 做一次**整篇文档**的样式重算，而重算耗时几乎
 * 与样式表规则数成正比（尤其 `:has()` 规则，实测每条 ≈2.5ms/次全量重算）。
 * 实测（/components/calendar，页面 1884 个元素，点击 Select 触发器到浮层出现）：
 *
 *   8 套预设全量常驻（现状）      1923ms
 *   只有 base + 一套预设          199ms
 *   全量但删掉 440 条 :has() 规则  637ms
 *   整张样式表禁用                 7ms
 *
 * 所以：编译期照旧全量（预设里的 @apply / 自定义 variant 依赖 style.css 的 Tailwind
 * 上下文，拆成独立文件按需 import 会 500），运行期只把当前风格的规则留在表里。
 *
 * ── 做法 ─────────────────────────────────────────────────────
 * - 首次调用时扫描主样式表，按选择器里的 `.style-<name>` 把规则归类并**摘下来**（原文缓存）；
 * - 把当前风格的规则原样插回表尾（预设规则是无层样式，放表尾与原来「在 utilities 之后」
 *   的层叠顺序一致）；
 * - 切换风格时：摘掉上一个、插回下一个；dev 下 HMR 换表时自动重扫。
 */

/** 8 套预设的名字，对应 <html> 上的 `.style-<name>` */
const PRESET_NAMES = ['luma', 'lyra', 'maia', 'mira', 'nova', 'rhea', 'sera', 'vega']

/** style.css 里的标记规则，用来定位「主样式表」 */
const HOST_MARKER = '--rion-preset-host'

/** 摘下来的预设规则原文（key = 预设名） */
let rulesByPreset = new Map<string, string[]>()
/** 已扫描过的那张表（用于识别 dev HMR 换了新表） */
let scannedSheet: CSSStyleSheet | null = null
/** 当前挂在表里的预设名 */
let mounted: string | null = null

/** 找出主样式表（含标记规则的那张） */
function findHostSheet(): CSSStyleSheet | null {
  for (const sheet of Array.from(document.styleSheets)) {
    let rules: CSSRuleList
    try {
      rules = sheet.cssRules // 跨域表会抛错，直接跳过
    } catch {
      continue
    }
    for (const rule of Array.from(rules)) {
      if (rule instanceof CSSStyleRule && rule.style.getPropertyValue(HOST_MARKER)) return sheet
    }
  }
  return null
}

/**
 * 判断一条规则属于哪套预设
 *
 * - 预设文件是 `.style-vega { ...嵌套... }`，编译后选择器以 `.style-vega` 开头
 *   （如 `.style-vega :is(.cn-card, [data-slot="card"])`）；
 * - 嵌套的 @media/@supports/@layer 只要内部全部属于同一套预设，就整块算这套预设；
 * - @keyframes、@property、:root 等无选择器的规则不算预设（它们不参与匹配，留着无害）。
 */
function presetOfRule(rule: CSSRule): string | null {
  if (rule instanceof CSSMediaRule || rule instanceof CSSSupportsRule || rule instanceof CSSLayerBlockRule) {
    const names = new Set<string>()
    for (const child of Array.from(rule.cssRules)) {
      const name = presetOfRule(child)
      if (!name) return null // 含非预设内容 → 整块保持原样，避免误伤
      names.add(name)
    }
    return names.size === 1 ? Array.from(names)[0] : null
  }

  if (rule instanceof CSSStyleRule) {
    const selector = rule.selectorText
    const hit = PRESET_NAMES.filter(name => selector.includes(`.style-${name}`))
    return hit.length === 1 ? hit[0] : null
  }

  return null
}

/** 扫描主表：把预设规则按风格分组摘下来（从后往前删，避免下标错位） */
function collectPresetRules(sheet: CSSStyleSheet): Map<string, string[]> {
  const collected = new Map<string, string[]>()
  for (let i = sheet.cssRules.length - 1; i >= 0; i--) {
    const rule = sheet.cssRules[i]
    const name = presetOfRule(rule)
    if (!name) continue
    const list = collected.get(name) ?? []
    list.unshift(rule.cssText)
    collected.set(name, list)
    sheet.deleteRule(i)
  }
  return collected
}

/** 把某套预设已挂载的规则摘掉 */
function unmount(sheet: CSSStyleSheet, name: string) {
  for (let i = sheet.cssRules.length - 1; i >= 0; i--) {
    if (presetOfRule(sheet.cssRules[i]) === name) sheet.deleteRule(i)
  }
}

/**
 * 只让 `name` 这套预设的规则留在主表里（幂等）
 *
 * @param name 预设名（不带 `style-` 前缀，如 `vega`）
 */
export function isolatePreset(name: string) {
  const sheet = findHostSheet()
  if (!sheet) return // 样式表还没就位（dev 下 CSS 由 Vite 注入，可能晚于 JS）→ 之后重试

  if (sheet !== scannedSheet) {
    // 首次运行，或 dev HMR 换了一张新表 → 重新扫描
    scannedSheet = sheet
    mounted = null
    rulesByPreset = collectPresetRules(sheet)
  }

  if (mounted === name) return
  if (mounted) unmount(sheet, mounted)
  for (const text of rulesByPreset.get(name) ?? []) sheet.insertRule(text, sheet.cssRules.length)
  mounted = name
}

/**
 * 让隔离在「样式表晚于 JS 就位」「dev HMR 换表」时也能自动生效
 *
 * @param apply 重新执行一次全局样式应用（通常就是 lib/style.ts 的 apply）
 */
export function initPresetIsolation(apply: () => void) {
  let queued = false
  const retry = () => {
    if (queued) return
    queued = true
    requestAnimationFrame(() => {
      queued = false
      if (findHostSheet() !== scannedSheet) apply()
    })
  }

  // 首帧兜一次（dev 下主表可能在 apply() 之后才注入）
  retry()
  // head 里新增/替换样式表（HMR、主题注入）时再兜一次
  new MutationObserver(retry).observe(document.head, { childList: true, subtree: true })
}
