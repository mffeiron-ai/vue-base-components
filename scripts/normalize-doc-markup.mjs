/**
 * 规范化文档页里的行内标记：
 *  1) `xxx`   → <code>xxx</code>      （反引号在 Vue 模板里不会被解析，会原样显示）
 *  2) **xxx** → <strong>xxx</strong>
 *  3) <code class="..."> → <code>    （样式已由 app/src/style.css 的 .docs-content 统一接管）
 *  4) <CardTitle class="text-xl font-semibold">xxx</CardTitle> → <h2 class="text-xl font-semibold">xxx</h2>
 *     段落标题不要用 CardTitle：8 套风格预设是非分层 CSS，优先级高于工具类，
 *     text-xl 会被预设里的 text-base 盖掉（实测 16px）。用普通 h2 就没这个问题，
 *     也和最早写的 Alert / Alert Dialog 文档保持一致。
 *
 * 只处理 <template> 区段里的「文本节点」：标签内部（属性）不动，<pre>/<code>/<script>/<style>
 * 的内容原样保留（那里面的反引号可能是模板字符串）。
 *
 * 用法：node scripts/normalize-doc-markup.mjs [--apply]
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const DIR = 'app/src/docs'
const apply = process.argv.includes('--apply')
const SKIP_INNER = new Set(['pre', 'code', 'script', 'style'])

/** 文本节点里的裸 < > & 转义（已经是实体形式的不动） */
function escapeText(s) {
  return s
    .replace(/&(?![a-zA-Z#][a-zA-Z0-9]*;)/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function transformText(text, stats) {
  // `code`
  let out = text.replace(/`([^`\n]+)`/g, (_m, code) => {
    stats.backtick++
    return `<code>${escapeText(code)}</code>`
  })
  // **bold**
  out = out.replace(/\*\*([^*\n]+)\*\*/g, (_m, t) => {
    stats.bold++
    return `<strong>${escapeText(t)}</strong>`
  })
  return out
}

function transformTemplate(tpl, stats) {
  // 4) 段落标题：CardTitle → h2（在 tokenizer 之前做，它跨 标签+文本+标签）
  tpl = tpl.replace(/<CardTitle class="text-xl font-semibold">([\s\S]*?)<\/CardTitle>/g, (_m, inner) => {
    stats.title++
    return `<h2 class="text-xl font-semibold">${inner}</h2>`
  })

  let out = ''
  let i = 0
  while (i < tpl.length) {
    if (tpl[i] === '<') {
      // 标签：带引号感知地找到结束的 '>'
      let j = i + 1
      let quote = null
      while (j < tpl.length) {
        const ch = tpl[j]
        if (quote) {
          if (ch === quote) quote = null
        } else if (ch === '"' || ch === "'") {
          quote = ch
        } else if (ch === '>') {
          break
        }
        j++
      }
      let tag = tpl.slice(i, j + 1)
      // <code class="..."> 统一简化成 <code>（含结尾标签前的情况）
      if (/^<code\b[^>]*class=/i.test(tag)) {
        tag = tag.replace(/^<code\b[^>]*>/i, '<code>')
        stats.codeClass++
      }
      out += tag
      i = j + 1
      // 代码块 / 已转义内容：内部原样拷贝
      const m = /^<(pre|code|script|style)\b/i.exec(tag)
      if (m && !/\/>$/.test(tag)) {
        const name = m[1].toLowerCase()
        const rest = tpl.slice(i)
        const cm = new RegExp(`</${name}\\s*>`, 'i').exec(rest)
        if (cm) {
          out += rest.slice(0, cm.index) + cm[0]
          i += cm.index + cm[0].length
        }
      }
      continue
    }
    // 文本节点：直到下一个 '<'
    let j = tpl.indexOf('<', i)
    if (j === -1) j = tpl.length
    out += transformText(tpl.slice(i, j), stats)
    i = j
  }
  return out
}

const report = []
for (const file of readdirSync(DIR).filter((f) => f.endsWith('.vue')).sort()) {
  const path = join(DIR, file)
  const src = readFileSync(path, 'utf8')
  const start = src.indexOf('<template>')
  const end = src.lastIndexOf('</template>')
  if (start === -1 || end === -1) {
    report.push({ file, note: '没有 template 区段' })
    continue
  }
  const head = src.slice(0, start)
  const tpl = src.slice(start + '<template>'.length, end)
  const tail = src.slice(end)
  const stats = { backtick: 0, bold: 0, codeClass: 0, title: 0 }
  const nextTpl = transformTemplate(tpl, stats)
  const changed = nextTpl !== tpl
  if (changed && apply) writeFileSync(path, head + '<template>' + nextTpl + tail)
  report.push({ file, '反引号→code': stats.backtick, '**→strong': stats.bold, '简化 code class': stats.codeClass, '标题→h2': stats.title })
}

console.table(report)
console.log(apply ? '✅ 已写入' : '（dry-run，加 --apply 才写入）')
