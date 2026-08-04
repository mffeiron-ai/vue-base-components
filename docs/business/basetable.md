# Table 数据表格

通用表格组件，支持排序、分页、列显示控制、行详情侧滑等功能。

<script setup>
import { ref } from 'vue'
import BaseTable from '../../src/components/BaseTable.vue'

const dataSource = ref([
  { id: 1, name: '张三', email: 'zhangsan@example.com', role: '管理员', status: '启用' },
  { id: 2, name: '李四', email: 'lisi@example.com', role: '编辑', status: '启用' },
  { id: 3, name: '王五', email: 'wangwu@example.com', role: '查看者', status: '禁用' },
  { id: 4, name: '赵六', email: 'zhaoliu@example.com', role: '编辑', status: '启用' },
])

const columns = ref([
  { title: 'ID', key: 'id', width: 80 },
  { title: '姓名', key: 'name', sortable: true },
  { title: '邮箱', key: 'email' },
  { title: '角色', key: 'role' },
  { title: '状态', key: 'status' },
])
</script>

## 基础用法

<BaseTable
  :columns="columns"
  :data-source="dataSource"
  :pagination="false"
/>

```vue
<BaseTable
  :columns="columns"
  :data-source="dataSource"
  :pagination="false"
/>
```

## API

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `columns` | `Column[]` | — | 列配置 |
| `dataSource` | `Record<string, any>[]` | — | 数据源 |
| `pagination` | `boolean \| PaginationConfig` | `true` | 分页配置 |
| `loading` | `boolean` | `false` | 加载状态 |
| `rowKey` | `string` | `'id'` | 行唯一键 |

### Column 类型

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `title` | `string` | — | 列标题 |
| `key` | `string` | — | 数据字段 |
| `width` | `number` | — | 列宽度 (px) |
| `sortable` | `boolean` | `false` | 是否可排序 |
