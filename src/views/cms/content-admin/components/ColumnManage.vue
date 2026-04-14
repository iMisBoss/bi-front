<template>
  <div class="column-manage">
    <!-- 顶部工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <el-button-group>
          <el-button type="success" @click="handleBatchEnable" :disabled="selectedRows.length === 0">批量启用</el-button>
          <el-button type="warning" @click="handleBatchDisable" :disabled="selectedRows.length === 0">批量禁用</el-button>
          <el-button @click="handleExport" icon="Download">导出</el-button>
        </el-button-group>
      </div>
      <div class="toolbar-right">
        <el-button type="primary" @click="handleAdd" icon="Plus">新增栏目</el-button>
        <el-button @click="handleRefresh" icon="Refresh">刷新</el-button>
      </div>
    </div>

    <!-- 栏目列表 -->
    <el-table
        :data="filteredColumns"
        border
        @selection-change="handleSelectionChange"
        row-key="id"
        :header-cell-style="{ background: '#fafafa', color: '#333', fontWeight: '600' }"
        style="flex: 1"
    >
      <el-table-column type="selection" width="50" />
      <el-table-column prop="name" label="栏目名称" min-width="200" />
      <el-table-column prop="type" label="类型" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="row.type === 'content' ? 'primary' : 'success'" size="small">
            {{ row.type === 'content' ? '内容类' : '文档类' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="sort" label="排序号" width="100" align="center" />
      <el-table-column prop="manager" label="管理员" width="120" />
      <el-table-column prop="status" label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="row.status === 'enabled' ? 'success' : 'info'" size="small">
            {{ row.status === 'enabled' ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180" align="center" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
          <el-button link type="primary" size="small" @click="handleMove(row)">移动</el-button>
          <el-button
              link
              :type="row.status === 'enabled' ? 'warning' : 'success'"
              size="small"
              @click="handleToggleStatus(row)"
          >
            {{ row.status === 'enabled' ? '禁用' : '启用' }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-wrapper">
      <el-pagination
          :total="columnData.length"
          :page-size="20"
          layout="total, prev, pager, next"
      />
    </div>

    <!-- 新增/编辑抽屉 -->
    <ColumnDrawer
        v-model="showDrawer"
        :type="drawerType"
        :data="currentColumn"
        @confirm="handleConfirmSave"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import ColumnDrawer from './ColumnDrawer.vue'

const props = defineProps({
  orgData: {
    type: Object,
    default: null
  }
})

const selectedRows = ref([])
const currentColumn = ref(null)
const drawerType = ref('add')
const showDrawer = ref(false)

const columnData = ref([
  { id: 1, name: '新闻公告', type: 'content', sort: 1, manager: '张三', status: 'enabled', parentId: null },
  { id: 2, name: '公司公告', type: 'content', sort: 1, manager: '张三', status: 'enabled', parentId: 1 },
  { id: 3, name: '部门通知', type: 'content', sort: 2, manager: '李四', status: 'enabled', parentId: 1 },
  { id: 4, name: '规章制度', type: 'content', sort: 2, manager: '王五', status: 'enabled', parentId: null },
  { id: 5, name: '技术文档', type: 'document', sort: 3, manager: '赵六', status: 'enabled', parentId: null },
  { id: 6, name: '财务制度', type: 'content', sort: 4, manager: '周八', status: 'disabled', parentId: 4 }
])

const filteredColumns = computed(() => {
  if (props.orgData) {
    return columnData.value.filter(col => col.manager === props.orgData.name)
  }
  return columnData.value
})

const handleSelectionChange = (selection) => {
  selectedRows.value = selection
}

const handleAdd = () => {
  drawerType.value = 'add'
  currentColumn.value = null
  showDrawer.value = true
}

const handleEdit = (row) => {
  drawerType.value = 'edit'
  currentColumn.value = { ...row }
  showDrawer.value = true
}

const handleMove = (row) => {
  ElMessage.info('移动栏目功能')
}

const handleToggleStatus = (row) => {
  const action = row.status === 'enabled' ? '禁用' : '启用'
  ElMessageBox.confirm(`确定要${action}栏目「${row.name}」吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    row.status = row.status === 'enabled' ? 'disabled' : 'enabled'
    ElMessage.success(`${action}成功`)
  }).catch(() => {})
}

const handleBatchEnable = () => {
  if (selectedRows.value.length === 0) return
  selectedRows.value.forEach(row => { row.status = 'enabled' })
  ElMessage.success('批量启用成功')
  selectedRows.value = []
}

const handleBatchDisable = () => {
  if (selectedRows.value.length === 0) return
  selectedRows.value.forEach(row => { row.status = 'disabled' })
  ElMessage.success('批量禁用成功')
  selectedRows.value = []
}

const handleExport = () => {
  ElMessage.success('导出成功')
}

const handleRefresh = () => {
  ElMessage.success('刷新成功')
}

const handleConfirmSave = (formData) => {
  if (formData.id) {
    const index = columnData.value.findIndex(item => item.id === formData.id)
    if (index !== -1) {
      columnData.value[index] = { ...columnData.value[index], ...formData }
    }
    ElMessage.success('编辑成功')
  } else {
    formData.id = Date.now()
    columnData.value.push(formData)
    ElMessage.success('新增成功')
  }
  showDrawer.value = false
}
</script>

<style lang="scss" scoped>
.column-manage {
  display: flex;
  flex-direction: column;
  height: 100%;

  .toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 16px;
    border-bottom: 1px solid #ebeef5;

    .toolbar-left,
    .toolbar-right {
      display: flex;
      gap: 8px;
    }
  }

  .pagination-wrapper {
    margin-top: 16px;
    display: flex;
    justify-content: flex-end;
    flex-shrink: 0;
  }
}
</style>
