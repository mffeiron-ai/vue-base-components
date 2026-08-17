#!/usr/bin/env node
/**
 * rionstudio CLI 入口
 * 零依赖命令分发器
 */
import { log, color } from './src/utils.mjs'
import { init } from './src/commands/init.mjs'
import { add } from './src/commands/add.mjs'
import { update } from './src/commands/update.mjs'
import { remove } from './src/commands/remove.mjs'
import { list } from './src/commands/list.mjs'
import { info } from './src/commands/info.mjs'

const VERSION = '0.1.0'

const HELP = `
${color('RionStudio', 'bold')} v${VERSION} - 将 UI 组件复制到你的项目

${'用法:'.padEnd(0)}
  npx rionstudio <command> [options]

${'命令:'.padEnd(0)}
  ${'init'.padEnd(10)} 初始化 components.json + cn() + Tailwind 主题
  ${'add <name...>'.padEnd(10)} 添加组件（自动处理内部依赖并安装 npm 依赖）
  ${'update [name...]'.padEnd(10)} 更新已安装组件（缺省更新全部）
  ${'remove <name...>'.padEnd(10)} 移除组件
  ${'list'.padEnd(10)} 列出可用组件与已安装组件
  ${'info'.padEnd(10)} 显示项目配置与健康检查

${'选项:'.padEnd(0)}
  ${'-r, --registry <url>'.padEnd(10)} 指定 registry 地址（add 时覆盖 components.json）
  ${'--cwd <path>'.padEnd(10)} 指定项目目录
  ${'-h, --help'.padEnd(10)} 显示帮助
  ${'-v, --version'.padEnd(10)} 显示版本

${'示例:'.padEnd(0)}
  npx rionstudio init
  npx rionstudio add button dialog
  npx rionstudio update
  npx rionstudio add button -r ./registry/registry.json
`

/** 解析参数：提取 --cwd 和 --registry，剩余为位置参数 */
function parseArgs(argv) {
  const positional = []
  const options = { cwd: process.cwd(), registry: null }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--cwd') { options.cwd = argv[++i]; continue }
    if (a === '-r' || a === '--registry') { options.registry = argv[++i]; continue }
    if (a.startsWith('--cwd=')) { options.cwd = a.slice(6); continue }
    if (a.startsWith('--registry=')) { options.registry = a.slice(11); continue }
    if (a.startsWith('-')) { options.unknown = a; continue }
    positional.push(a)
  }
  return { positional, options }
}

async function main() {
  const args = process.argv.slice(2)
  if (args.length === 0 || args[0] === '-h' || args[0] === '--help' || args[0] === 'help') {
    log.raw(HELP)
    return
  }
  if (args[0] === '-v' || args[0] === '--version' || args[0] === 'version') {
    log.raw(VERSION)
    return
  }

  const command = args[0]
  const { positional, options } = parseArgs(args.slice(1))

  if (options.unknown) {
    log.error(`未知选项: ${options.unknown}`)
    return
  }

  try {
    switch (command) {
      case 'init': await init(options.cwd); break
      case 'add': await add(positional, options); break
      case 'update': await update(positional, options); break
      case 'remove': await remove(positional, options); break
      case 'list': await list(options); break
      case 'info': await info(options); break
      default:
        log.error(`未知命令: ${command}`)
        log.raw(HELP)
    }
  } catch (e) {
    log.error(`执行失败: ${e.message}`)
    if (process.env.DEBUG) console.error(e)
  }
}

main()
