import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const dir = path.join(root, 'src', 'random-ui', 'ui-dispatch')

const subs = fs.readdirSync(dir).filter(f => fs.statSync(path.join(dir, f)).isDirectory())

subs.forEach(sub => {
  const filePath = path.join(dir, sub, 'index.ts')
  const content = `export * from '@/components/ui/${sub}'\n`
  fs.writeFileSync(filePath, content)
  console.log('OK:', sub)
})

console.log('Done:', subs.length, 'files')
