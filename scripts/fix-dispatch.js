const fs = require('fs')
const path = require('path')

const dir = 'src/random-ui/ui-dispatch'
const subs = fs.readdirSync(dir).filter(f => fs.statSync(path.join(dir, f)).isDirectory())

subs.forEach(sub => {
  const filePath = path.join(dir, sub, 'index.ts')
  const content = `export * from '@/components/ui/${sub}'\n`
  fs.writeFileSync(filePath, content)
  console.log('OK:', sub)
})

console.log('Done:', subs.length, 'files')
