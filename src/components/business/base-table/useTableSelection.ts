/**
 * BaseTable · 行选择（跨页语义）
 *
 * 刻意**不用** TanStack 的 rowSelection：生产语义是「跨页全选所有匹配」，
 * 服务端分页下列不出全集，所以 selected 里用两个标记表达（协议见 types.ts）：
 *   '__all__'           全选所有匹配
 *   '__except__:<id>'   在全选基础上排除某行
 * 解码请用 `summarizeSelection()` / `resolveSelected()`。
 */
import { computed } from 'vue'
import type { SelectionSummary } from './types'
import { ALL_SELECT_MARK, excludedMark, summarizeSelection } from './types'

export interface UseTableSelectionOptions<T> {
  /** 当前页数据（表头三态 / 全选都只看这一页） */
  rows: () => T[]
  idField: () => string
  selected: () => (string | number)[] | undefined
  /** 是否开启「跨页全选所有匹配」 */
  selectAll?: () => boolean | undefined
  onChange: (marks: (string | number)[]) => void
}

export function useTableSelection<T>(options: UseTableSelectionOptions<T>) {
  const marks = () => options.selected() || []
  const allowAll = () => !!options.selectAll?.()

  function isRowSelected(row: any): boolean {
    const sel = marks()
    const id = row[options.idField()]
    if (allowAll() && sel.includes(ALL_SELECT_MARK)) return !sel.includes(excludedMark(id))
    return sel.includes(id)
  }

  const allSelected = computed(() => {
    const sel = marks()
    if (!options.rows().length) return false
    if (allowAll() && sel.includes(ALL_SELECT_MARK)) {
      return !options.rows().some(row => sel.includes(excludedMark(row[options.idField()])))
    }
    return options.rows().every(row => isRowSelected(row))
  })

  const someSelected = computed(() => options.rows().some(isRowSelected))

  /** reka 的三态勾选：用 modelValue='indeterminate' 表达半选（不是单独 prop） */
  const headerState = computed<boolean | 'indeterminate'>(() => {
    if (allSelected.value) return true
    return someSelected.value ? 'indeterminate' : false
  })

  function toggleAll() {
    if (allSelected.value) {
      options.onChange([])
    } else if (allowAll()) {
      options.onChange([ALL_SELECT_MARK]) // 跨页：标记「全部匹配」
    } else {
      options.onChange(options.rows().map(row => row[options.idField()]))
    }
  }

  function toggleRow(id: string | number) {
    const current = [...marks()]
    if (allowAll() && current.includes(ALL_SELECT_MARK)) {
      // 全选模式下点某行 = 加/减一条排除标记，保留跨页全选
      const mark = excludedMark(id)
      options.onChange(current.includes(mark) ? current.filter(x => x !== mark) : [...current, mark])
      return
    }
    const idx = current.indexOf(id)
    if (idx >= 0) current.splice(idx, 1)
    else current.push(id)
    options.onChange(current)
  }

  const summary = computed<SelectionSummary>(() => summarizeSelection(options.selected()))

  return { isRowSelected, allSelected, someSelected, headerState, toggleAll, toggleRow, summary }
}
