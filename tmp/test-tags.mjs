import fs from 'node:fs'
import { createMarkdownRenderer } from 'vitepress'

async function main() {
  const md = await createMarkdownRenderer()
  
  const content = fs.readFileSync('docs/components/carousel.md', 'utf8')
  const templateContent = content.replace(/^<script setup>[\s\S]*?<\/script>/m, '')
  
  const html = md.render(templateContent)
  
  // Count ALL tags (not just Vue components)
  const allOpens = html.match(/<[A-Z][a-zA-Z]*/g) || []
  const allCloses = html.match(/<\/[A-Z][a-zA-Z]*>/g) || []
  const selfCloses = html.match(/<[A-Z][a-zA-Z]*[^>]*\/>/g) || []
  
  console.log('All Vue component opens:', allOpens.length)
  console.log('All Vue component closes:', allCloses.length)
  console.log('All Vue component self-closes:', selfCloses.length)
  console.log('Net (opens - closes - selfCloses):', allOpens.length - allCloses.length - selfCloses.length)
  
  // Show each tag type
  const tagTypes = {}
  for (const m of allOpens) {
    const tag = m.slice(1)
    tagTypes[tag] = (tagTypes[tag] || 0) + 1
  }
  console.log('\nTag types:')
  Object.entries(tagTypes).sort((a, b) => b[1] - a[1]).forEach(([tag, count]) => {
    const closes = (html.match(new RegExp(`</${tag}>`, 'g')) || []).length
    const selfs = (html.match(new RegExp(`<${tag}[^>]*/>`, 'g')) || []).length
    console.log(`  ${tag}: ${count} opens, ${closes} closes, ${selfs} self-closes, net: ${count - closes - selfs}`)
  })
  
  // Show the full HTML
  console.log('\n=== Full HTML ===')
  console.log(html)
}

main().catch(console.error)
