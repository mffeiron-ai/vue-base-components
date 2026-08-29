import fs from 'node:fs'
import path from 'node:path'

const dir = 'docs/components'
let totalFixed = 0

for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.md'))) {
  const p = path.join(dir, f)
  let c = fs.readFileSync(p, 'utf8')
  const orig = c

  // Pattern: ```vue\n...script...\n```\n\n<template>...</template>\n```
  // Merge the orphan <template> block back into the preceding code fence
  c = c.replace(
    /(```vue\n[\s\S]*?)```\n\n(<template[\s\S]*?<\/template>\n```)/g,
    '$1$2'
  )

  if (c !== orig) {
    fs.writeFileSync(p, c)
    totalFixed++
    console.log('FIXED:', f)
  }
}
console.log('total:', totalFixed)
