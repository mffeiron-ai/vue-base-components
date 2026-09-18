import type { ComputedRef, Ref } from "vue"
import { createContext } from "reka-ui"

export type QuestionnaireItemStatus = 'unanswered' | 'answered' | 'skipped'
export type QuestionnaireShortcutMode = 'letters' | 'numbers'

/** 题目切换动画：`none` 关掉动画，其余四种都是入场动画。 */
export type QuestionnaireAnimation = 'fade' | 'none' | 'rise' | 'scale' | 'slide'

export type QuestionnaireInputType
  = | 'date'
    | 'datetime-local'
    | 'email'
    | 'month'
    | 'number'
    | 'password'
    | 'search'
    | 'tel'
    | 'text'
    | 'time'
    | 'url'
    | 'week'

export interface QuestionnaireChoiceDefinition {
  disabled?: boolean
  value: string
}

export interface QuestionnaireItemDefinition {
  choices?: readonly QuestionnaireChoiceDefinition[]
  disabled?: boolean
  name: string
  required?: boolean
}

export interface ChoiceRegistration {
  disabled: boolean
  value: string
}

/** 选中标记的样式：圆点 / 对勾 / 横杠 / 纯实心（不加内部符号）。 */
export type QuestionnaireChoiceIndicator = 'check' | 'dot' | 'fill' | 'minus'

export interface AnswerControlRegistration {
  disabled: boolean
  element: HTMLInputElement
  id: string
  ownDisabled: boolean
  type: 'choice' | 'input'
  value: string
}

export interface ItemRegistration {
  element: HTMLFieldSetElement
  focus: () => void
  focusInvalid: () => void
  getAnswerByElement: (element: Element) => AnswerControlRegistration | null
  getAnswerByShortcut: (shortcut: string) => AnswerControlRegistration | null
  getChoices: () => ChoiceRegistration[]
  isDisabled: () => boolean
  isRequired: () => boolean
  moveAnswerFocus: (element: Element, direction: 'next' | 'previous') => boolean
  name: string
  reset: () => void
  skip: () => void
  status: () => QuestionnaireItemStatus
  validate: () => boolean
}

export interface QuestionnaireRootContext {
  activeItem: ComputedRef<ItemRegistration | null>
  activeItemName: ComputedRef<string | null>
  activeItemRequired: ComputedRef<boolean | null>
  activeItemStatus: ComputedRef<QuestionnaireItemStatus | null>
  animation: ComputedRef<QuestionnaireAnimation>
  current: ComputedRef<number>
  domVersion: Ref<number>
  first: ComputedRef<boolean>
  goNext: () => void
  goPrevious: () => void
  itemDefinitionByName: ComputedRef<Map<string, QuestionnaireItemDefinition> | null>
  last: ComputedRef<boolean>
  nativeValidation: ComputedRef<boolean>
  registerItem: (registration: ItemRegistration) => () => void
  shortcuts: ComputedRef<QuestionnaireShortcutMode | null>
  skipCurrent: () => void
  total: ComputedRef<number>
}

export interface QuestionnaireItemContext {
  active: ComputedRef<boolean>
  /** Bumped after a controlled answer interaction so every control re-syncs. */
  controlSyncVersion: Ref<number>
  disabled: ComputedRef<boolean>
  hasInputAnswer: ComputedRef<boolean>
  invalid: ComputedRef<boolean>
  multiple: ComputedRef<boolean>
  name: ComputedRef<string>
  registerAnswerControl: (registration: AnswerControlRegistration) => () => void
  registerAnswerSelection: (answerId: string, defaultSelected: boolean) => () => void
  registerDescription: (descriptionId: string) => () => void
  registerError: (errorId: string) => () => void
  /** Only used when the title does not render as the fieldset legend. */
  registerTitle: (titleId: string) => () => void
  requestControlSync: () => void
  required: ComputedRef<boolean>
  resetVersion: Ref<number>
  selectedAnswerIds: Ref<string[]>
  setAnswerDefault: (answerId: string, defaultSelected: boolean) => void
  setAnswerSelectionFromInteraction: (answerId: string, selected: boolean) => void
  shortcutByAnswerId: ComputedRef<Map<string, string>>
  shortcutByChoiceValue: ComputedRef<Map<string, string> | null>
  shortcuts: ComputedRef<QuestionnaireShortcutMode | null>
  status: ComputedRef<QuestionnaireItemStatus>
  syncControlledAnswerSelection: (answerId: string, selected: boolean) => void
}

export const [injectQuestionnaireRootContext, provideQuestionnaireRootContext]
  = createContext<QuestionnaireRootContext>('Questionnaire')

export const [injectQuestionnaireItemContext, provideQuestionnaireItemContext]
  = createContext<QuestionnaireItemContext>('QuestionnaireItem')

export function hasInputValue(value: unknown) {
  if (Array.isArray(value)) {
    return value.some(item => String(item).trim().length > 0)
  }

  return value !== undefined && value !== null && String(value).trim().length > 0
}

export function getShortcutKeys(shortcuts: QuestionnaireShortcutMode | null) {
  if (shortcuts === 'letters') {
    return Array.from({ length: 26 }, (_, index) => String.fromCharCode(65 + index))
  }

  if (shortcuts === 'numbers') {
    return Array.from({ length: 9 }, (_, index) => String(index + 1))
  }

  return []
}

export function getShortcutFromKey(key: string, shortcuts: QuestionnaireShortcutMode) {
  const normalizedKey = shortcuts === 'letters' ? key.toUpperCase() : key

  return getShortcutKeys(shortcuts).includes(normalizedKey) ? normalizedKey : null
}

export function getAnswerKeyShortcuts(shortcut: string | null, filled: boolean) {
  return [shortcut, filled ? 'Enter' : null].filter(Boolean).join(' ') || undefined
}

/**
 * 题目切换动画的类名（依赖 tw-animate-css，组件库已普遍使用）。
 *
 * 只做入场：非激活题靠 `hidden` 退出布局，切回来时 `display` 从 `none` 变回可见，
 * 浏览器会从头播放 `animation`，所以不需要（也没机会）做离场动画。
 *
 * 时长**跟随全局动效设置**：tw-animate-css 的 `animate-in` 读的是 `--tw-duration`
 * （`animation: enter var(--tw-animation-duration, var(--tw-duration, .15s)) …`），
 * 而 `duration-*` 会同时写 `--tw-duration` 与 `transition-duration`
 * —— 所以 `duration-[var(--anim-dur,300ms)]` 能把 `src/styles/animations.css` 的
 * 全局时长接进来；逗号后是回退值，没引入那个样式文件的消费方仍是 300ms。
 * 「形式」仍由组件自己的 `animation` prop 决定（fade / rise / scale / slide / none）。
 */
export function getQuestionnaireAnimationClass(animation: QuestionnaireAnimation) {
  const duration = 'duration-[var(--anim-dur,300ms)]'

  if (animation === 'fade') {
    return `animate-in fade-in-0 ${duration}`
  }

  if (animation === 'rise') {
    return `animate-in fade-in-0 slide-in-from-bottom-4 ${duration}`
  }

  if (animation === 'scale') {
    return `animate-in fade-in-0 zoom-in-95 ${duration}`
  }

  if (animation === 'slide') {
    return `animate-in fade-in-0 slide-in-from-right-4 ${duration}`
  }

  return ''
}

export function isAnswerFilled(answer: AnswerControlRegistration) {
  if (answer.type === 'choice') {
    return answer.element.checked
  }

  return answer.element.hasAttribute('name') && hasInputValue(answer.element.value)
}

export function isEmptyNavigableInput(answer: AnswerControlRegistration | null) {
  return (
    answer?.type === 'input'
    && ['email', 'password', 'search', 'tel', 'text', 'url'].includes(answer.element.type)
    && !hasInputValue(answer.element.value)
  )
}

export function isTextEntryTarget(element: Element) {
  if (element instanceof HTMLTextAreaElement || element instanceof HTMLSelectElement) {
    return true
  }

  if (element instanceof HTMLInputElement) {
    return !['button', 'checkbox', 'radio', 'reset', 'submit'].includes(element.type)
  }

  return element instanceof HTMLElement && element.isContentEditable
}

export function isRadioTarget(element: Element) {
  return element instanceof HTMLInputElement && element.type === 'radio'
}

/**
 * Sort registrations by the position of their element in the document, so that
 * navigation always follows the rendered order instead of the mount order.
 */
export function compareDocumentOrder(first: Element, second: Element) {
  if (first === second) {
    return 0
  }

  const position = first.compareDocumentPosition(second)

  if (position & Node.DOCUMENT_POSITION_FOLLOWING) {
    return -1
  }

  if (position & Node.DOCUMENT_POSITION_PRECEDING) {
    return 1
  }

  return 0
}

export interface QuestionnaireCollection {
  enabledItems: QuestionnaireItemDefinition[]
  itemByName: Map<string, QuestionnaireItemDefinition>
  items: readonly QuestionnaireItemDefinition[]
}

export function createQuestionnaireCollection(
  items: readonly QuestionnaireItemDefinition[] | undefined,
): QuestionnaireCollection | null {
  if (items === undefined) {
    return null
  }

  return {
    enabledItems: items.filter(item => !item.disabled),
    itemByName: new Map(items.map(item => [item.name, item])),
    items,
  }
}

export function getInitialItemName(
  collection: QuestionnaireCollection | null,
  defaultItem: string | undefined,
) {
  if (!collection) {
    return defaultItem ?? null
  }

  const defaultDefinition = defaultItem ? collection.itemByName.get(defaultItem) : undefined

  if (defaultDefinition && !defaultDefinition.disabled) {
    return defaultDefinition.name
  }

  return collection.enabledItems[0]?.name ?? null
}

/**
 * Map every enabled choice of an item definition to a keyboard shortcut, so
 * that shortcuts stay stable regardless of how choices are rendered.
 */
export function getShortcutByChoiceValue(
  item: QuestionnaireItemDefinition | undefined,
  shortcuts: QuestionnaireShortcutMode | null,
) {
  const shortcutByChoiceValue = new Map<string, string>()

  if (!item || !shortcuts) {
    return shortcutByChoiceValue
  }

  const keys = getShortcutKeys(shortcuts)
  let shortcutIndex = 0

  for (const choice of item.choices ?? []) {
    if (choice.disabled) {
      continue
    }

    const shortcut = keys[shortcutIndex]

    if (!shortcut) {
      break
    }

    shortcutByChoiceValue.set(choice.value, shortcut)
    shortcutIndex += 1
  }

  return shortcutByChoiceValue
}
