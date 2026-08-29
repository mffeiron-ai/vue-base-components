import fs from 'node:fs'
import { createMarkdownRenderer } from 'vitepress'

// VitePress 内部用 markdown-it 处理 md 文件
// 我们模拟这个过程看看输出

const md = fs.readFileSync('docs/components/carousel.md', 'utf8')

// 提取 script setup
const scriptMatch = md.match(/^<script setup>([\s\S]*?)<\/script>/m)
const scriptContent = scriptMatch ? scriptMatch[1] : ''
const templateContent = md.replace(/^<script setup>[\s\S]*?<\/script>/m, '')

console.log('=== Template content (first 500 chars) ===')
console.log(templateContent.slice(0, 500))
console.log('\n=== Checking for unclosed tags in template ===')

// Check if markdown-it would break the HTML
const lines = templateContent.split(/\r?\n/)
let inCodeBlock = false
let inHtmlBlock = false
let htmlBlockTag = ''
const issues = []

for (let i = 0; i < lines.length; i++) {
  const line = lines[i]
  if (/^```/.test(line)) { inCodeBlock = !inCodeBlock; continue }
  if (inCodeBlock) continue
  
  // Check for HTML blocks that markdown-it might process
  const openMatch = line.match(/^<(Demo|[A-Z][a-zA-Z]*)[\s>]/)
  const closeMatch = line.match(/^<\/(Demo|[A-Z][a-zA-Z]*)>/)
  
  if (openMatch && !inHtmlBlock) {
    inHtmlBlock = true
    htmlBlockTag = openMatch[1]
  }
  if (closeMatch && inHtmlBlock && closeMatch[1] === htmlBlockTag) {
    inHtmlBlock = false
    htmlBlockTag = ''
  }
}

console.log('Script content length:', scriptContent.length)
console.log('Template content length:', templateContent.length)
