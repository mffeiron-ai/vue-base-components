// ⚠️ 遗留文件：依赖 @tanstack/vue-table，但 package.json 里并没有装这个包，
// 目前也没人 import 它（数据表格实践改成纯 Vue 了）。保留只为不丢参考；
// 要么补依赖，要么连同这个文件一起删掉。
import type { Updater } from "@tanstack/vue-table"

import type { Ref } from "vue"
import { isFunction } from "@tanstack/vue-table"

export function valueUpdater<T>(updaterOrValue: Updater<T>, ref: Ref<T>) {
  ref.value = isFunction(updaterOrValue)
    ? updaterOrValue(ref.value)
    : updaterOrValue
}
