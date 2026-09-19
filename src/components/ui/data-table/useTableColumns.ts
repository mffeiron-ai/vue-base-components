/**
 * 列状态设施（显隐 / 列序 / 列宽 + 拖拽 + 持久化）
 *
 * 原子层 `DataTable` 和分子层 `business/BaseTable` 需要完全一样的三件事：
 *  ① 列显隐：菜单里勾选、最后一列不许隐藏；
 *  ② 列序：拖动手柄换位置（pointer 事件 + elementFromPoint，不用 HTML5 DnD）；
 *  ③ 列宽：拖拽改宽 + localStorage 持久化。
 * 这些都与「表格渲染」无关，是纯粹的「列元状态」，所以放这里两边共用一份实现。
 *
 * 为什么不用 `table.getIsAllColumnsVisible()` 之外的状态：
 *   列显隐 / 列序 / 列宽三份状态都写回 TanStack 的 `state` 对象（唯一来源），
 *   所以只要 TanStack 那边开着 `enableColumnResizing` / 有 columnVisibility feature，
 *   表格立刻跟着变，不需要我们额外同步。
 *
 * 用法（业务组件）：
 *   const { orderedColumns, visibleColumns, isVisible, toggleColumn, widthOf, styleOf,
 *           startResize, onHandlePointerDown, draggingId } = useTableColumns({
 *     table,
 *     columns: () => props.columns,
 *     idOf: col => String(col.field),
 *     state: tableState,
 *     storageKey: () => props.persistKey ? `bt-state:${props.persistKey}` : '',
 *     minWidth: () => props.minColumnWidth,
 *     defaultSize: col => guessColumnWidth(col),
 *   })
 */
import { computed, onBeforeUnmount, ref, watch } from 'vue'

export interface UseTableColumnsOptions<C = any> {
  /** TanStack 表格实例 */
  table: any
  /** 全部列（顺序 = 业务声明顺序） */
  columns: () => C[]
  /** 怎么从列对象取 id；默认读 `col.id`（列对象没有 id 时必须传，例如业务列用 field 当 id） */
  idOf?: (col: C) => string
  /** TanStack 的 state 对象（响应式），显隐 / 列序 / 列宽都写回这里 */
  state: any
  /** 持久化 key；返回空串表示不持久化 */
  storageKey?: () => string
  /** 拖拽下限 */
  minWidth?: () => number
  /** 初始列宽（仅在 TanStack 没有该列的 size 时兜底） */
  defaultSize?: (col: C) => number
}

export function useTableColumns<C = any>(options: UseTableColumnsOptions<C>) {
  const { table, state } = options

  /** 列 id：优选项外传入的 idOf，退回列对象上的 id */
  const idOf = (col: C): string => {
    const explicit = options.idOf?.(col)
    if (explicit != null) return String(explicit)
    return String((col as any)?.id ?? '')
  }
  const columnIds = () => options.columns().map(idOf)
  const minWidth = () => options.minWidth?.() ?? 60

  // ── 列序 ────────────────────────────────────────────────────

  /** 按 columnOrder 排好的全部列（含被隐藏的） */
  const orderedColumns = computed<C[]>(() => {
    const list = options.columns()
    const order: string[] = Array.isArray(state.columnOrder) ? state.columnOrder : []
    if (!order.length) return list
    const byId = new Map(list.map(c => [idOf(c), c]))
    const out = order.map(id => byId.get(id)).filter((c): c is C => !!c)
    for (const c of list) if (!order.includes(idOf(c))) out.push(c)
    return out
  })

  // ── 列显隐 ──────────────────────────────────────────────────

  function isVisible(id: string): boolean {
    return table?.getColumn?.(id)?.getIsVisible?.() ?? true
  }

  const visibleColumns = computed<C[]>(() => orderedColumns.value.filter(c => isVisible(idOf(c))))

  const visibleCount = computed(() => visibleColumns.value.length)

  const isAllVisible = computed(() => table?.getIsAllColumnsVisible?.() ?? true)

  /** 最后一列不允许取消勾选（否则表格会空掉），所以用 disabled 表达，而不是静默失败 */
  function canHide(id: string): boolean {
    return !(isVisible(id) && visibleCount.value <= 1)
  }

  function toggleColumn(id: string, checked: boolean) {
    if (!checked && !canHide(id)) return
    table?.getColumn?.(id)?.toggleVisibility?.(checked)
  }

  function toggleAllColumns() {
    table?.toggleAllColumnsVisible?.(!isAllVisible.value)
  }

  // ── 列宽 ────────────────────────────────────────────────────

  function widthOf(id: string): number {
    const col = options.columns().find(c => idOf(c) === id)
    const size = table?.getColumn?.(id)?.getSize?.()
    if (size != null) return size
    return (col && options.defaultSize?.(col)) || col?.width || 150
  }

  function styleOf(id: string) {
    const w = widthOf(id)
    return { width: `${w}px`, minWidth: `${w}px` }
  }

  /**
   * 拖拽调宽。
   * 只处理 pointer 生命周期（DOM 监听挂 window），真正的宽度写回交给外部 ——
   * 因为「写哪儿」取决于调用方：业务表格写 TanStack 的 columnSizing（顺带被持久化），
   * 简单场景也可以只调尺寸不落盘。这里用 onChange 回调暴露出去。
   */
  const draggingWidth = ref<{ id: string, startX: number, startW: number } | null>(null)

  function startResize(e: MouseEvent, id: string) {
    e.preventDefault()
    e.stopPropagation()
    draggingWidth.value = { id, startX: e.clientX, startW: widthOf(id) }
    window.addEventListener('mousemove', onResizeMove)
    window.addEventListener('mouseup', onResizeEnd)
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }

  function onResizeMove(e: MouseEvent) {
    const d = draggingWidth.value
    if (!d) return
    const w = Math.max(minWidth(), d.startW + (e.clientX - d.startX))
    state.columnSizing = { ...state.columnSizing, [d.id]: w }
  }

  function onResizeEnd() {
    if (!draggingWidth.value) return
    draggingWidth.value = null
    window.removeEventListener('mousemove', onResizeMove)
    window.removeEventListener('mouseup', onResizeEnd)
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
  }

  // ── 列序拖拽（行内手柄，按住拖动换位） ──────────────────────

  const draggingId = ref<string | null>(null)
  const dragOverId = ref<string | null>(null)
  let dragPointerId: number | null = null

  function onHandlePointerDown(e: PointerEvent, id: string) {
    if (e.button !== 0) return
    e.preventDefault() // 阻止拖动时选中文本
    draggingId.value = id
    dragOverId.value = null
    dragPointerId = e.pointerId
    window.addEventListener('pointermove', onHandlePointerMove)
    window.addEventListener('pointerup', onHandlePointerUp)
    window.addEventListener('pointercancel', onHandlePointerUp)
  }

  function onHandlePointerMove(e: PointerEvent) {
    if (!draggingId.value || e.pointerId !== dragPointerId) return
    e.preventDefault()
    const el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null
    const rowEl = el?.closest?.('[data-col-row]') as HTMLElement | null
    dragOverId.value = rowEl ? rowEl.getAttribute('data-col-row') : null
  }

  function onHandlePointerUp() {
    window.removeEventListener('pointermove', onHandlePointerMove)
    window.removeEventListener('pointerup', onHandlePointerUp)
    window.removeEventListener('pointercancel', onHandlePointerUp)
    dragPointerId = null
    const from = draggingId.value
    const to = dragOverId.value
    draggingId.value = null
    dragOverId.value = null
    if (!from || !to || from === to) return
    const arr = columnIds()
    const i = arr.indexOf(from)
    const j = arr.indexOf(to)
    if (i < 0 || j < 0) return
    arr.splice(i, 1)
    arr.splice(j, 0, from)
    state.columnOrder = arr
  }

  // ── 持久化（列宽 + 列序 + 列显隐，一个 key 装三份状态） ─────

  const key = computed(() => options.storageKey?.() ?? '')

  function load() {
    if (!key.value) return
    try {
      const raw = localStorage.getItem(key.value)
      if (!raw) return
      const saved = JSON.parse(raw) as Record<string, any>
      if (saved.columnSizing && typeof saved.columnSizing === 'object') state.columnSizing = { ...saved.columnSizing }
      if (saved.columnVisibility && typeof saved.columnVisibility === 'object') state.columnVisibility = { ...saved.columnVisibility }
      if (Array.isArray(saved.columnOrder)) {
        // 只保留仍然存在的列，并把新增列补到末尾（列定义变了也不会错位）
        const cur = columnIds()
        const merged = saved.columnOrder.filter((id: string) => cur.includes(id))
        for (const id of cur) if (!merged.includes(id)) merged.push(id)
        state.columnOrder = merged
      } else {
        state.columnOrder = columnIds()
      }
    } catch { /* 存储不可用就当没有 */ }
  }

  function save() {
    if (!key.value) return
    try {
      localStorage.setItem(key.value, JSON.stringify({
        columnSizing: state.columnSizing,
        columnVisibility: state.columnVisibility,
        columnOrder: state.columnOrder,
      }))
    } catch { /* ignore */ }
  }

  watch(key, load, { immediate: true })
  watch(() => [state.columnSizing, state.columnVisibility, state.columnOrder], save, { deep: true })

  onBeforeUnmount(() => {
    onResizeEnd()
    if (dragPointerId !== null) onHandlePointerUp()
  })

  return {
    /** 按 columnOrder 排好的全部列（含隐藏列） */
    orderedColumns,
    /** 可见列（按 columnOrder 顺序） */
    visibleColumns,
    visibleCount,
    isAllVisible,
    isVisible,
    canHide,
    toggleColumn,
    toggleAllColumns,
    widthOf,
    styleOf,
    startResize,
    draggingId,
    dragOverId,
    onHandlePointerDown,
  }
}
