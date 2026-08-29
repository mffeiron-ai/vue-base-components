import fs from 'node:fs'
import { createMarkdownRenderer } from 'vitepress'

async function main() {
  const md = await createMarkdownRenderer()
  
  const content = fs.readFileSync('docs/components/carousel.md', 'utf8')
  const templateContent = content.replace(/^<script setup>[\s\S]*?<\/script>/m, '')
  
  const html = md.render(templateContent)
  
  // Find all unclosed tags
  const lines = html.split('\n')
  const stack = []
  const issues = []
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    
    // Find opening tags
    const openMatches = line.matchAll(/<([A-Z][a-zA-Z]*)(?:\s[^>]*)?(?:\s*\/>|(?:\s*>))/g)
    for (const m of openMatches) {
      const tag = m[1]
      const selfClose = m[0].endsWith('/>')
      if (!selfClose) {
        stack.push({ tag, line: i + 1 })
      }
    }
    
    // Find closing tags
    const closeMatches = line.matchAll(/<\/([A-Z][a-zA-Z]*)>/g)
    for (const m of closeMatches) {
      const tag = m[1]
      const last = stack[stack.length - 1]
      if (last && last.tag === tag) {
        stack.pop()
      } else {
        // Mismatched close
        const idx = stack.findLastIndex(s => s.tag === tag)
        if (idx >= 0) {
          const removed = stack.splice(idx, 1)[0]
          issues.push(`Line ${i + 1}: Mismatched close </${tag}>, expected </${last?.tag}> (opened at line ${removed.line})`)
        } else {
          issues.push(`Line ${i + 1}: Unexpected close </${tag}>`)
        }
      }
    }
  }
  
  console.log('=== Unclosed tags ===')
  stack.forEach(s => console.log(`  <${s.tag}> opened at line ${s.line}`))
  
  console.log('\n=== Mismatched closes ===')
  issues.forEach(i => console.log(`  ${i}`))
  
  console.log('\n=== Full HTML around line 15-25 ===')
  console.log(lines.slice(14, 25).join('\n'))
}

main().catch(console.error)
