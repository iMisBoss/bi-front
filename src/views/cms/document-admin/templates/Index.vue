<template>
  <div class="template-manage-page">
    <!-- 面包屑 -->
    <el-breadcrumb separator="/" class="breadcrumb">
      <el-breadcrumb-item :to="{ path: '/' }">后台首页</el-breadcrumb-item>
      <el-breadcrumb-item>日常办公管理</el-breadcrumb-item>
      <el-breadcrumb-item>公文管理</el-breadcrumb-item>
      <el-breadcrumb-item>公文模板管理</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card class="main-card" shadow="never">
      <!-- 顶部工具栏 -->
      <div class="toolbar">
        <div class="toolbar-left">
          <el-button-group>
            <el-button
                type="success"
                @click="handleBatchEnable"
                :disabled="selectedRows.length === 0"
            >
              批量启用
            </el-button>
            <el-button
                type="warning"
                @click="handleBatchDisable"
                :disabled="selectedRows.length === 0"
            >
              批量禁用
            </el-button>
            <el-button
                type="danger"
                @click="handleBatchDelete"
                :disabled="selectedRows.length === 0"
            >
              批量删除
            </el-button>
            <el-button @click="handleExport" icon="Download">导出</el-button>
          </el-button-group>
        </div>

        <div class="toolbar-right">
          <el-button type="primary" @click="handleAdd" icon="Plus">新增模板</el-button>
          <el-button @click="showImportDialog = true" icon="Upload">导入</el-button>
          <el-button @click="handleRefresh" icon="Refresh">刷新</el-button>
        </div>
      </div>

      <!-- 搜索筛选 -->
      <div class="filter-bar">
        <el-input
            v-model="searchKeyword"
            placeholder="搜索模板名称"
            prefix-icon="Search"
            clearable
            style="width: 240px"
            @input="handleSearch"
        />
        <el-select
            v-model="typeFilter"
            placeholder="模板类型"
            style="width: 120px"
            clearable
            @change="handleFilter"
        >
          <el-option label="全部" value="" />
          <el-option label="发文" value="send" />
          <el-option label="收文" value="receive" />
          <el-option label="通知" value="notice" />
        </el-select>
        <el-select
            v-model="statusFilter"
            placeholder="状态"
            style="width: 100px"
            clearable
            @change="handleFilter"
        >
          <el-option label="全部" value="" />
          <el-option label="启用" value="enabled" />
          <el-option label="禁用" value="disabled" />
        </el-select>
      </div>

      <!-- 模板列表 -->
      <el-table
          :data="filteredTemplates"
          border
          @selection-change="handleSelectionChange"
          row-key="id"
          :header-cell-style="{ background: '#fafafa', color: '#333', fontWeight: '600' }"
          style="flex: 1"
      >
        <el-table-column type="selection" width="50" />
        <el-table-column prop="name" label="模板名称" min-width="200" />
        <el-table-column prop="type" label="模板类型" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getTypeTagType(row.type)" size="small">{{ getTypeText(row.type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="department" label="适用部门" width="150" />
        <el-table-column prop="version" label="版本号" width="100" align="center" />
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
            <el-button link type="primary" size="small" @click="handleView(row)">查看</el-button>
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

      <!-- 底部分页 -->
      <div class="pagination-wrapper">
        <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :total="total"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 新增/编辑抽屉 -->
    <TemplateDrawer
        v-model="showDrawer"
        :type="drawerType"
        :data="currentTemplate"
        @confirm="handleConfirmSave"
    />

    <!-- 查看详情抽屉 -->
    <TemplateDetailDrawer
        v-model="showDetailDrawer"
        :data="currentTemplate"
        @edit="handleEdit"
    />

    <!-- 导入对话框 -->
    <TemplateImportDialog
        v-model="showImportDialog"
        @confirm-import="handleConfirmImport"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import TemplateDrawer from './components/TemplateDrawer.vue'
import TemplateDetailDrawer from './components/TemplateDetailDrawer.vue'
import TemplateImportDialog from './components/TemplateImportDialog.vue'

const selectedRows = ref([])
const currentTemplate = ref(null)
const drawerType = ref('add')
const showDrawer = ref(false)
const showDetailDrawer = ref(false)
const showImportDialog = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

const searchKeyword = ref('')
const typeFilter = ref('')
const statusFilter = ref('')

const templateData = ref([])

const filteredTemplates = computed(() => {
  let data = [...templateData.value]

  if (searchKeyword.value) {
    data = data.filter(item => item.name?.includes(searchKeyword.value))
  }

  if (typeFilter.value) {
    data = data.filter(item => item.type === typeFilter.value)
  }

  if (statusFilter.value) {
    data = data.filter(item => item.status === statusFilter.value)
  }

  total.value = data.length
  return data
})

onMounted(() => {
  loadTemplateData()
})

const loadTemplateData = () => {
  templateData.value = [
    { id: 1, name: '红头文件模板（标准版）', type: 'send', department: '全公司', version: 'V2.0', status: 'enabled', usage: 156, content: '<p>红头文件内容</p>' },
    { id: 2, name: '收文登记模板', type: 'receive', department: '全公司', version: 'V1.5', status: 'enabled', usage: 89, content: '<p>收文登记内容</p>' },
    { id: 3, name: '内部通知模板', type: 'notice', department: '全公司', version: 'V3.0', status: 'enabled', usage: 234, content: '<p>通知内容</p>' },
    { id: 4, name: '技术部发文模板', type: 'send', department: '技术部', version: 'V1.0', status: 'disabled', usage: 45, content: '<p>技术部发文</p>' },
    { id: 5, name: '财务部通知模板', type: 'notice', department: '财务部', version: 'V2.1', status: 'enabled', usage: 67, content: '<p>财务部通知</p>' }
  ]
  total.value = templateData.value.length
}

const getTypeTagType = (type) => {
  const types = { 'send': 'primary', 'receive': 'success', 'notice': 'warning' }
  return types[type] || ''
}

const getTypeText = (type) => {
  const texts = { 'send': '发文', 'receive': '收文', 'notice': '通知' }
  return texts[type] || type
}

const handleSelectionChange = (selection) => {
  selectedRows.value = selection
}

const handleAdd = () => {
  drawerType.value = 'add'
  currentTemplate.value = null
  showDrawer.value = true
}

const handleEdit = (row) => {
  drawerType.value = 'edit'
  currentTemplate.value = { ...row }
  showDrawer.value = true
  showDetailDrawer.value = false
}

const handleView = (row) => {
  currentTemplate.value = row
  showDetailDrawer.value = true
}

const handleToggleStatus = (row) => {
  const action = row.status === 'enabled' ? '禁用' : '启用'
  ElMessageBox.confirm(`确定要${action}模板「${row.name}」吗？`, '提示', {
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

  ElMessageBox.confirm(`确定要批量启用 ${selectedRows.value.length} 个模板吗？`, '批量启用', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'info'
  }).then(() => {
    selectedRows.value.forEach(row => { row.status = 'enabled' })
    ElMessage.success('批量启用成功')
    selectedRows.value = []
  }).catch(() => {})
}

const handleBatchDisable = () => {
  if (selectedRows.value.length === 0) return

  ElMessageBox.confirm(`确定要批量禁用 ${selectedRows.value.length} 个模板吗？`, '批量禁用', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    selectedRows.value.forEach(row => { row.status = 'disabled' })
    ElMessage.success('批量禁用成功')
    selectedRows.value = []
  }).catch(() => {})
}

const handleBatchDelete = () => {
  if (selectedRows.value.length === 0) return

  const usedTemplates = selectedRows.value.filter(row => row.usage > 0)
  if (usedTemplates.length > 0) {
    ElMessage.warning('选中的模板中包含了已被使用的模板，无法删除，请先禁用')
    return
  }

  ElMessageBox.confirm(`确定要删除 ${selectedRows.value.length} 个模板吗？`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'error'
  }).then(() => {
    const ids = selectedRows.value.map(row => row.id)
    templateData.value = templateData.value.filter(item => !ids.includes(item.id))
    ElMessage.success('删除成功')
    selectedRows.value = []
    total.value = templateData.value.length
  }).catch(() => {})
}

const handleExport = () => {
  ElMessage.success('模板数据导出成功')
}

const handleRefresh = () => {
  loadTemplateData()
  ElMessage.success('刷新成功')
}

const handleSearch = () => {}
const handleFilter = () => {}

const handleConfirmSave = (formData) => {
  if (formData.id) {
    const index = templateData.value.findIndex(item => item.id === formData.id)
    if (index !== -1) {
      templateData.value[index] = { ...templateData.value[index], ...formData }
    }
    ElMessage.success('编辑成功')
  } else {
    formData.id = Date.now()
    formData.version = 'V1.0'
    formData.usage = 0
    templateData.value.push(formData)
    ElMessage.success('新增成功')
  }
  showDrawer.value = false
  total.value = templateData.value.length
}

const handleConfirmImport = () => {
  ElMessage.success('导入成功')
  showImportDialog.value = false
  loadTemplateData()
}

const handleSizeChange = (val) => {
  pageSize.value = val
}

const handleCurrentChange = (val) => {
  currentPage.value = val
}
</script>

<style lang="scss" scoped>
.template-manage-page {
  padding: 20px;
  height: calc(100vh - 60px);
  display: flex;
  flex-direction: column;
  background: #f5f7fa;

  .breadcrumb {
    margin-bottom: 16px;
    font-size: 14px;
  }

  .main-card {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border-radius: 8px;

    :deep(.el-card__body) {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      padding: 16px;
    }
  }

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

  .filter-bar {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;
  }

  .pagination-wrapper {
    margin-top: 16px;
    display: flex;
    justify-content: flex-end;
    flex-shrink: 0;
  }
}
</style>
