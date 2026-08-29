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
  
  console.log('=== Rendered HTML (first 1000 chars) ===')
  console.log(html.slice(0, 1000))
  console.log('\n=== Checking for unclosed tags ===')
  
  // Check for unclosed Demo tags
  const demoOpens = (html.match(/<Demo\b/g) || []).length
  const demoCloses = (html.match(/<\/Demo>/g) || []).length
  console.log('Demo opens:', demoOpens, 'closes:', demoCloses)
  
  // Check for unclosed Carousel tags
  const carouselOpens = (html.match(/<Carousel\b/g) || []).length
  const carouselCloses = (html.match(/<\/Carousel>/g) || []).length
  console.log('Carousel opens:', carouselOpens, 'closes:', carouselCloses)
  
  // Check for any unclosed tags
  const allOpens = html.match(/<[A-Z][a-zA-Z]*/g) || []
  const allCloses = html.match(/<\/[A-Z][a-zA-Z]*>/g) || []
  console.log('All Vue component opens:', allOpens.length, 'closes:', allCloses.length)
}

main().catch(console.error)
