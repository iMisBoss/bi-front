<template>
  <div class="global-data-dict">
    <!-- 顶部工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <el-button-group>
          <el-button type="success" @click="handleBatchEnable" :disabled="selectedRows.length === 0">批量启用</el-button>
          <el-button type="warning" @click="handleBatchDisable" :disabled="selectedRows.length === 0">批量禁用</el-button>
        </el-button-group>
        <el-button @click="handleImport" icon="Upload">批量导入</el-button>
        <el-button @click="handleExport" icon="Download">导出字典</el-button>
      </div>
      <el-button type="primary" @click="handleAddDictType" icon="Plus">新增字典类型</el-button>
    </div>

    <!-- 左侧字典类型树 + 右侧字典项列表 -->
    <div class="content-wrapper">
      <!-- 左侧：字典类型树 -->
      <div class="dict-type-panel">
        <div class="panel-header">字典类型分类</div>
        <el-tree
            :data="dictTypeTree"
            :props="{ label: 'name', children: 'children' }"
            node-key="id"
            default-expand-all
            @node-click="handleTypeClick"
        >
          <template #default="{ node, data }">
            <div class="tree-node">
              <el-icon class="node-icon"><Collection /></el-icon>
              <span class="node-name">{{ node.label }}</span>
              <el-tag v-if="data.status === 'disabled'" size="small" type="info" style="margin-left: 8px">禁用</el-tag>
            </div>
          </template>
        </el-tree>
      </div>

      <!-- 右侧：字典项列表 -->
      <div class="dict-item-panel">
        <div class="panel-header">
          <span>字典项列表</span>
          <el-tag v-if="currentDictType" type="primary">当前：{{ currentDictType.name }}</el-tag>
        </div>

        <div class="dict-item-actions">
          <el-button type="primary" size="small" @click="handleAddDictItem" icon="Plus">新增字典项</el-button>
        </div>

        <el-table
            :data="dictItems"
            border
            @selection-change="handleSelectionChange"
            row-key="id"
            :header-cell-style="{ background: '#fafafa', color: '#333', fontWeight: '600' }"
            style="flex: 1"
        >
          <el-table-column type="selection" width="50" />
          <el-table-column prop="label" label="字典标签" min-width="150" />
          <el-table-column prop="value" label="字典值" min-width="150" />
          <el-table-column prop="sort" label="排序" width="80" align="center" />
          <el-table-column prop="isDefault" label="默认值" width="100" align="center">
            <template #default="{ row }">
              <el-tag v-if="row.isDefault" type="success" size="small">默认</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="row.status === 'enabled' ? 'success' : 'info'" size="small">
                {{ row.status === 'enabled' ? '启用' : '禁用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="140" align="center" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" size="small" @click="handleEditDictItem(row)">编辑</el-button>
              <el-button link type="danger" size="small" @click="handleDeleteDictItem(row)" :disabled="row.system">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <!-- 字典编辑抽屉 -->
    <DictItemDrawer
        v-model="showDrawer"
        :type="drawerType"
        :data="currentDictItem"
        :dict-type-id="currentDictType?.id"
        @confirm="handleConfirmSave"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Collection } from '@element-plus/icons-vue'
import DictItemDrawer from './DictItemDrawer.vue'

const selectedRows = ref([])
const currentDictType = ref(null)
const currentDictItem = ref(null)
const drawerType = ref('add')
const showDrawer = ref(false)

const dictTypeTree = ref([
  {
    id: 1,
    name: '系统类',
    status: 'enabled',
    children: [
      { id: 2, name: '性别', status: 'enabled', system: true },
      { id: 3, name: '学历', status: 'enabled', system: true },
      { id: 4, name: '职位级别', status: 'enabled', system: true }
    ]
  },
  {
    id: 5,
    name: '业务类',
    status: 'enabled',
    children: [
      { id: 6, name: '公告类型', status: 'enabled', system: false },
      { id: 7, name: '审批状态', status: 'enabled', system: true },
      { id: 8, name: '文档格式', status: 'enabled', system: false }
    ]
  }
])

const dictItems = ref([
  { id: 1, typeId: 2, label: '男', value: 'male', sort: 1, isDefault: true, status: 'enabled', system: true },
  { id: 2, typeId: 2, label: '女', value: 'female', sort: 2, isDefault: false, status: 'enabled', system: true },
  { id: 3, typeId: 2, label: '未知', value: 'unknown', sort: 3, isDefault: false, status: 'enabled', system: false },
  { id: 4, typeId: 3, label: '博士', value: 'doctor', sort: 1, isDefault: false, status: 'enabled', system: false },
  { id: 5, typeId: 3, label: '硕士', value: 'master', sort: 2, isDefault: false, status: 'enabled', system: false },
  { id: 6, typeId: 3, label: '本科', value: 'bachelor', sort: 3, isDefault: true, status: 'enabled', system: false }
])

const handleTypeClick = (data) => {
  currentDictType.value = data
  dictItems.value = dictItems.value.filter(item => item.typeId === data.id)
}

const handleSelectionChange = (selection) => {
  selectedRows.value = selection
}

const handleAddDictType = () => {
  ElMessage.info('新增字典类型功能')
}

const handleAddDictItem = () => {
  if (!currentDictType.value) {
    ElMessage.warning('请先选择字典类型')
    return
  }
  drawerType.value = 'add'
  currentDictItem.value = null
  showDrawer.value = true
}

const handleEditDictItem = (row) => {
  drawerType.value = 'edit'
  currentDictItem.value = { ...row }
  showDrawer.value = true
}

const handleDeleteDictItem = (row) => {
  ElMessageBox.confirm(`确定要删除字典项「${row.label}」吗？`, '删除字典项', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    dictItems.value = dictItems.value.filter(item => item.id !== row.id)
    ElMessage.success('删除成功')
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

const handleImport = () => {
  ElMessage.info('批量导入功能')
}

const handleExport = () => {
  ElMessage.success('字典导出成功')
}

const handleConfirmSave = (formData) => {
  if (formData.id) {
    const index = dictItems.value.findIndex(item => item.id === formData.id)
    if (index !== -1) {
      dictItems.value[index] = { ...dictItems.value[index], ...formData }
    }
    ElMessage.success('编辑成功')
  } else {
    formData.id = Date.now()
    formData.typeId = currentDictType.value?.id
    dictItems.value.push(formData)
    ElMessage.success('新增成功')
  }
  showDrawer.value = false
}
</script>

<style lang="scss" scoped>
.global-data-dict {
  display: flex;
  flex-direction: column;
  height: 100%;

  .toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    .toolbar-left {
      display: flex;
      gap: 8px;
    }
  }

  .content-wrapper {
    display: flex;
    gap: 16px;
    flex: 1;
    overflow: hidden;

    .dict-type-panel,
    .dict-item-panel {
      display: flex;
      flex-direction: column;
      overflow: hidden;
      border: 1px solid #ebeef5;
      border-radius: 8px;

      .panel-header {
        padding: 12px 16px;
        background: #fafafa;
        border-bottom: 1px solid #ebeef5;
        font-weight: 600;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
    }

    .dict-type-panel {
      width: 260px;
      padding: 12px;
      overflow-y: auto;

      .tree-node {
        display: flex;
        align-items: center;
        gap: 8px;

        .node-icon {
          color: #409eff;
        }
      }
    }

    .dict-item-panel {
      flex: 1;

      .dict-item-actions {
        padding: 12px 16px;
        border-bottom: 1px solid #ebeef5;
      }
    }
  }
}
</style>
