import fs from 'node:fs'
import { createMarkdownRenderer } from 'vitepress'

async function main() {
  const md = await createMarkdownRenderer()
  
  const content = fs.readFileSync('docs/components/carousel.md', 'utf8')
  
  // Extract script setup
  const scriptMatch = content.match(/^<script setup>([\s\S]*?)<\/script>/m)
  const scriptContent = scriptMatch ? scriptMatch[1] : ''
  const templateContent = content.replace(/^<script setup>[\s\S]*?<\/script>/m, '')
  
  // Render markdown to HTML
  const html = md.render(templateContent)
  
  // Build the final Vue SFC (this is what VitePass sends to the compiler)
  const sfc = `<script setup>${scriptContent}</script>
<template>${html}</template>`
  
  console.log('=== Final SFC (first 500 chars) ===')
  console.log(sfc.slice(0, 500))
  console.log('\n=== SFC length ===', sfc.length)
  
  // Try to parse with Vue SFC compiler
  const { parse } = await import('@vue/compiler-sfc')
  try {
    const result = parse(sfc)
    console.log('\n=== Parse result ===')
    console.log('template:', !!result.descriptor.template)
    console.log('scriptSetup:', !!result.descriptor.scriptSetup)
    console.log('errors:', result.errors.length)
    if (result.errors.length > 0) {
      result.errors.forEach(e => console.log('  Error:', e.message))
    }
  } catch(e) {
    console.log('\n=== Parse ERROR ===')
    console.log(e.message)
  }
}

main().catch(console.error)
