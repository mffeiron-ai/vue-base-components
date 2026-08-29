import fs from 'node:fs';
let c = fs.readFileSync('shadcn-docs/components/slider.md', 'utf8').replace(/\r\n/g, '\n');
c = c.replace(/^---\n[\s\S]*?\n---\n/, '');
c = c.replace(/^## Installation[\s\S]*?(?=^## )/m, '');
const m = c.match(/```vue showLineNumbers\n([\s\S]*?)```/);
console.log('matched:', !!m);
if (m) console.log(m[1].slice(0, 150));
else {
  console.log('NO MATCH. tail:');
  console.log(JSON.stringify(c.slice(-200)));
}
