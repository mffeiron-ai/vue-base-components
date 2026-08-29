import { parse } from '@vue/compiler-sfc'
import fs from 'node:fs'

// Test 1: Simple test
const simple = `# Test

<script setup>
const x = 1
<\/script>

<Demo :code="x">
  <div>hello</div>
<\/Demo>
`
try {
  const r = parse(simple)
  console.log('Simple test: OK, template:', !!r.descriptor.template)
} catch(e) {
  console.log('Simple test ERROR:', e.message)
}

// Test 2: Actual carousel.md
const carousel = fs.readFileSync('docs/components/carousel.md', 'utf8')
try {
  const r = parse(carousel)
  console.log('Carousel: OK, template:', !!r.descriptor.template)
} catch(e) {
  console.log('Carousel ERROR:', e.message)
}

// Test 3: button.md
const button = fs.readFileSync('docs/components/button.md', 'utf8')
try {
  const r = parse(button)
  console.log('Button: OK, template:', !!r.descriptor.template)
} catch(e) {
  console.log('Button ERROR:', e.message)
}
