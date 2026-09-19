/**
 * 假数据 + 模拟服务端
 *
 * 目的：把 RichTable 的**参数协议**（见 src/components/business/rich-table/types.ts）当成真接口实现一遍，
 * 这样文档站的 demo 既能跑，也能当「后端要支持哪些参数」的可执行说明。
 *
 * 协议速查：
 *   `${k}__gte` / `${k}__lte`            数值区间
 *   `${k}__in`                           集合命中（select / 分面文本）
 *   `${k}__date__in`                     按天多选（yyyy-MM-dd[]）
 *   `${k}__date__gte` / `${k}__date__lte` 日期区间
 *   `${k}`                               文本模糊（可配 matchFields 附加字段）
 */

export type AfterSaleRow = {
  id: number
  orderNo: string
  productTitle: string
  buyer: string
  channel: string
  status: string
  amount: number
  commission: number
  createdAt: string
  paidAt: string | null
  remark: string
  thumb: string
}

export type OrderQuery = {
  page: number
  pageSize: number
  sortField?: string | null
  sortOrder?: 'asc' | 'desc' | null
  filters?: Record<string, any>
}

export type OrderPage = { rows: AfterSaleRow[], total: number }

export type FacetItem = { value: any, count: number }

// ── 选项（前端列定义与 mock 共用，保证一致）─────────────────
export const CHANNEL_OPTIONS = [
  { value: 'tmall', label: '天猫' },
  { value: 'jd', label: '京东' },
  { value: 'douyin', label: '抖音' },
  { value: 'pdd', label: '拼多多' },
  { value: 'self', label: '自营商城' },
]

export const STATUS_OPTIONS = [
  { value: 'pending', label: '待审核' },
  { value: 'processing', label: '处理中' },
  { value: 'approved', label: '已同意' },
  { value: 'rejected', label: '已拒绝' },
  { value: 'done', label: '已完成' },
]

const dayOf = (v: any) => (v == null ? '' : String(v).slice(0, 10))
// ── 确定性假数据（同一次构建里每次刷新都一样，方便对照截图）──
function mulberry32(seed: number) {
  return function next() {
    seed |= 0
    seed = (seed + 0x6D2B79F5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** 内联 SVG 占位图：不依赖网络，离线也能演示图片单元格 / 图片详情 */
const THUMB = `data:image/svg+xml;utf8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="80" height="80" fill="#e5e7eb"/><text x="40" y="45" font-size="11" text-anchor="middle" fill="#6b7280">商品图</text></svg>',
)}`

const PRODUCTS = [
  '纯棉长袖衬衫（男）',
  '轻量羽绒服 · 雾灰',
  '真丝方巾 90cm',
  '无线降噪耳机 Pro',
  '露营折叠桌（铝合金）',
  '儿童护眼台灯',
  '手冲咖啡套装',
  '空气循环扇 · 静音款',
  '羊毛混纺围巾',
  '机械键盘 87 键',
]
const BUYERS = ['林舟', '陈见山', '苏晓', '徐一鸣', '何洲', '顾南', '郑怀', '白露', '沈青禾', '袁野', '骆书文', '季明']
const REMARKS = [
  '**客户已寄回**，等仓库质检结果。',
  '面单破损，已让客户重新拍照。\n\n> 待补充材料',
  '与机制商品名不一致，转人工复核。',
  '超期未收到货，按缺货退款处理。',
  '客户要求改寄新地址，已登记。',
  '批量订单（12 件），走线下审批。',
]

/** 生成 137 条售后单（数量固定，便于验证分页边界） */
export const MOCK_ROWS: AfterSaleRow[] = (() => {
  const rand = mulberry32(20260918)
  const rows: AfterSaleRow[] = []
  const base = new Date(2026, 6, 1, 9, 0, 0).getTime()
  for (let i = 1; i <= 137; i++) {
    const channel = CHANNEL_OPTIONS[Math.floor(rand() * CHANNEL_OPTIONS.length)].value
    const status = STATUS_OPTIONS[Math.floor(rand() * STATUS_OPTIONS.length)].value
    const amount = Math.round((29 + rand() * 1170) * 100) / 100
    const created = new Date(base + Math.floor(rand() * 42) * 86400000 + Math.floor(rand() * 10) * 3600000)
    const paid = status === 'done' || status === 'approved'
      ? new Date(created.getTime() + Math.floor(rand() * 5) * 86400000)
      : null
    const p = (n: number) => String(n).padStart(2, '0')
    const day = (d: Date) => `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
    rows.push({
      id: i,
      orderNo: `AS${day(created).replace(/-/g, '')}${String(1000 + i)}`,
      productTitle: PRODUCTS[Math.floor(rand() * PRODUCTS.length)],
      buyer: BUYERS[Math.floor(rand() * BUYERS.length)],
      channel,
      status,
      amount,
      commission: Math.round(amount * (0.03 + rand() * 0.12) * 100) / 100,
      createdAt: `${day(created)} ${p(created.getHours())}:${p(created.getMinutes())}`,
      paidAt: paid ? `${day(paid)} ${p(paid.getHours())}:${p(paid.getMinutes())}` : null,
      remark: REMARKS[Math.floor(rand() * REMARKS.length)],
      thumb: THUMB,
    })
  }
  return rows
})()

/** 文本列模糊匹配时额外扫的字段（对应列定义里的 matchFields 语义） */
const TEXT_SEARCH_FIELDS: Record<string, (keyof AfterSaleRow)[]> = {
  orderNo: ['orderNo', 'productTitle', 'buyer'],
  productTitle: ['productTitle', 'orderNo', 'buyer'],
}

const numOf = (v: any) => (v == null || v === '' ? null : Number(v))

/** 单条参数匹配（严格按协议后缀判定，所以 `__date__` 必须先于 `__in` 判断） */
function matchRow(row: AfterSaleRow, key: string, value: any): boolean {
  if (key.endsWith('__date__in')) {
    const f = key.slice(0, -'__date__in'.length) as keyof AfterSaleRow
    const days = (Array.isArray(value) ? value : [value]).map(String)
    return days.includes(dayOf(row[f]))
  }
  if (key.endsWith('__date__gte')) {
    const f = key.slice(0, -'__date__gte'.length) as keyof AfterSaleRow
    return dayOf(row[f]) >= String(value)
  }
  if (key.endsWith('__date__lte')) {
    const f = key.slice(0, -'__date__lte'.length) as keyof AfterSaleRow
    return dayOf(row[f]) <= String(value)
  }
  if (key.endsWith('__gte')) {
    const f = key.slice(0, -'__gte'.length) as keyof AfterSaleRow
    const n = numOf(row[f])
    return n != null && n >= Number(value)
  }
  if (key.endsWith('__lte')) {
    const f = key.slice(0, -'__lte'.length) as keyof AfterSaleRow
    const n = numOf(row[f])
    return n != null && n <= Number(value)
  }
  if (key.endsWith('__in')) {
    const f = key.slice(0, -'__in'.length) as keyof AfterSaleRow
    const list = Array.isArray(value) ? value : [value]
    return list.some(v => String(v) === String(row[f] ?? ''))
  }
  // 普通文本参数：模糊匹配（含附加字段）
  const kw = String(value ?? '').trim().toLowerCase()
  if (!kw) return true
  const fields = TEXT_SEARCH_FIELDS[key] ?? [key as keyof AfterSaleRow]
  return fields.some(f => String(row[f] ?? '').toLowerCase().includes(kw))
}

function applyFilters(list: AfterSaleRow[], filters: Record<string, any> = {}): AfterSaleRow[] {
  const entries = Object.entries(filters).filter(([, v]) => v !== '' && v != null)
  if (!entries.length) return list
  return list.filter(row => entries.every(([k, v]) => matchRow(row, k, v)))
}

function sortRows(list: AfterSaleRow[], field?: string | null, order?: 'asc' | 'desc' | null): AfterSaleRow[] {
  if (!field || !order) return list
  const dir = order === 'asc' ? 1 : -1
  const f = field as keyof AfterSaleRow
  return [...list].sort((a, b) => {
    const x = a[f]
    const y = b[f]
    if (typeof x === 'number' && typeof y === 'number') return (x - y) * dir
    return String(x ?? '').localeCompare(String(y ?? ''), 'zh') * dir
  })
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

/** 列表接口：筛选 → 排序 → 分页（时间戳 + 抖动延迟，用来看骨架屏） */
export async function fetchOrderPage(q: OrderQuery): Promise<OrderPage> {
  await sleep(180 + Math.random() * 220)
  const filtered = applyFilters(MOCK_ROWS, q.filters)
  const sorted = sortRows(filtered, q.sortField, q.sortOrder)
  const start = (Math.max(1, q.page) - 1) * q.pageSize
  return { rows: sorted.slice(start, start + q.pageSize), total: sorted.length }
}

/**
 * 分面接口：候选值 + 命中数。
 * Excel 语义：统计时**排除这一列自己的筛选**（否则勾了一个值后其它值的计数全是 0）。
 * 日期列返回按天分组。
 */
export async function fetchOrderFacets(field: string, keyword = '', filters: Record<string, any> = {}): Promise<FacetItem[]> {
  await sleep(140 + Math.random() * 160)
  const others: Record<string, any> = {}
  for (const [k, v] of Object.entries(filters)) {
    if (k.startsWith(field)) continue // 跳过本列自己的筛选
    others[k] = v
  }
  const pool = applyFilters(MOCK_ROWS, others)
  const kw = keyword.trim().toLowerCase()
  const counts = new Map<string, number>()
  for (const row of pool) {
    const raw = field === 'createdAt' ? dayOf(row.createdAt) : (row as any)[field]
    const value = raw == null || raw === '' ? '' : String(raw)
    if (kw && !value.toLowerCase().includes(kw)) continue
    counts.set(value, (counts.get(value) ?? 0) + 1)
  }
  return [...counts.entries()]
    .sort((a, b) => (field === 'createdAt' ? b[0].localeCompare(a[0]) : a[0].localeCompare(b[0], 'zh')))
    .map(([value, count]) => ({ value: value === '' ? null : value, count }))
}
