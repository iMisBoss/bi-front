<template>
  <div class="job-management-page">
    <el-card class="main-card" shadow="never">
      <div class="toolbar">
        <div class="toolbar-left">
          <el-button-group>
            <el-button @click="handleBatchEnable" :disabled="selectedRows.length === 0">批量启用</el-button>
            <el-button @click="handleBatchDisable" :disabled="selectedRows.length === 0">批量禁用</el-button>
            <el-button @click="handleBatchDelete" :disabled="selectedRows.length === 0">批量删除</el-button>
            <el-button @click="handleExport">导出</el-button>
          </el-button-group>
        </div>

        <div class="toolbar-center">
          <el-button type="primary" @click="handleAdd">新增</el-button>
          <el-button @click="showImportDialog = true">导入</el-button>
          <el-button @click="handleRefresh">刷新</el-button>
          <el-button @click="showSettings = true"> 显示设置 </el-button>
        </div>

        <div class="toolbar-right">
          <el-input
              v-model="searchKeyword"
              placeholder="输入职务名称搜索"
              prefix-icon="Search"
              clearable
              style="width: 200px"
              @input="handleSearch"
          />
          <el-select v-model="levelFilter" placeholder="职级级别" style="width: 120px" @change="handleFilter">
            <el-option label="全部" value="" />
            <el-option label="基层" value="基层" />
            <el-option label="中层" value="中层" />
            <el-option label="高层" value="高层" />
            <el-option label="高管" value="高管" />
          </el-select>
          <el-select v-model="statusFilter" placeholder="状态" style="width: 100px" @change="handleFilter">
            <el-option label="全部" value="" />
            <el-option label="启用" value="enabled" />
            <el-option label="禁用" value="disabled" />
          </el-select>
        </div>
      </div>

      <div class="content-wrapper">
        <el-table
            :data="filteredTableData"
            border
            @selection-change="handleSelectionChange"
            row-key="id"
        >
          <el-table-column type="selection" width="50" />
          <el-table-column prop="sort" label="职级排序" width="100" />
          <el-table-column prop="name" label="职务名称" width="150" />
          <el-table-column prop="code" label="职务编码" width="120" />
          <el-table-column prop="level" label="职级级别" width="100" />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="row.status === 'enabled' ? 'success' : 'info'">
                {{ row.status === 'enabled' ? '启用' : '禁用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" fixed="right" width="200">
            <template #default="{ row }">
              <el-button link type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
              <el-button link type="primary" size="small" @click="handleView(row)">查看</el-button>
              <el-button
                  link
                  type="danger"
                  size="small"
                  :disabled="row.linkedPositions > 0"
                  @click="handleDelete(row)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div class="pagination-wrapper">
        <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :total="total"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
        />
      </div>
    </el-card>

    <JobSettings
        v-model="showSettings"
        @save="saveSettings"
    />

    <JobAddDialog
        v-model="showAddDialog"
        :job-data="currentJob"
        @confirm="handleConfirmAdd"
    />

    <JobImportDialog
        v-model="showImportDialog"
        @download-template="downloadTemplate"
        @confirm-import="handleConfirmImport"
    />

    <el-drawer
        v-model="drawerVisible"
        :title="`${currentJob?.name || ''}（职务）`"
        size="600px"
    >
      <template #header>
        <div class="drawer-header">
          <h3 class="drawer-title">{{ currentJob?.name }}（职务）</h3>
          <div class="drawer-actions">
            <el-button size="small" @click="handleEdit(currentJob)">编辑</el-button>
            <el-button
                v-if="currentJob?.status === 'enabled'"
                size="small"
                type="warning"
                @click="handleToggleStatus(currentJob)"
            >
              禁用
            </el-button>
            <el-button
                v-else
                size="small"
                type="success"
                @click="handleToggleStatus(currentJob)"
            >
              启用
            </el-button>
            <el-button
                size="small"
                type="danger"
                :disabled="currentJob?.linkedPositions > 0"
                @click="handleDelete(currentJob)"
            >
              删除
            </el-button>
          </div>
        </div>
      </template>

      <el-tabs v-model="activeTab">
        <el-tab-pane label="基本信息" name="basic">
          <el-form :model="basicForm" label-width="100px" class="basic-form">
            <el-form-item label="职务名称" required>
              <el-input v-model="basicForm.name" />
            </el-form-item>
            <el-form-item label="职务编码" required>
              <el-input v-model="basicForm.code" />
            </el-form-item>
            <el-form-item label="职级级别" required>
              <el-select v-model="basicForm.level" placeholder="请选择">
                <el-option label="基层" value="基层" />
                <el-option label="中层" value="中层" />
                <el-option label="高层" value="高层" />
                <el-option label="高管" value="高管" />
              </el-select>
            </el-form-item>
            <el-form-item label="排序号" required>
              <el-input-number v-model="basicForm.sort" :min="1" :max="999" />
            </el-form-item>
            <el-form-item label="状态" required>
              <el-radio-group v-model="basicForm.status">
                <el-radio label="enabled">启用</el-radio>
                <el-radio label="disabled">禁用</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="备注">
              <el-input
                  v-model="basicForm.remark"
                  type="textarea"
                  :rows="3"
                  maxlength="200"
                  show-word-limit
              />
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="关联岗位" name="positions">
          <el-table :data="linkedPositions" border>
            <el-table-column prop="name" label="岗位名称" />
            <el-table-column prop="department" label="所属部门" />
            <el-table-column prop="memberCount" label="在岗人数" width="100" />
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="操作日志" name="logs">
          <div class="logs-toolbar">
            <el-select v-model="logOperatorFilter" placeholder="操作人" size="small" style="width: 120px" clearable>
              <el-option v-for="op in logOperators" :key="op" :label="op" :value="op" />
            </el-select>
            <el-date-picker
                v-model="logDateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                size="small"
                style="width: 240px"
            />
            <el-select v-model="logTypeFilter" placeholder="操作类型" size="small" style="width: 120px" clearable>
              <el-option label="新增" value="create" />
              <el-option label="编辑" value="edit" />
              <el-option label="删除" value="delete" />
              <el-option label="禁用" value="disable" />
              <el-option label="启用" value="enable" />
              <el-option label="排序调整" value="sort" />
            </el-select>
            <el-button size="small" @click="handleExportLogs">导出日志</el-button>
          </div>
          <el-table :data="filteredLogs" border>
            <el-table-column prop="operator" label="操作人" width="120" />
            <el-table-column prop="time" label="操作时间" width="180" />
            <el-table-column prop="type" label="操作类型" width="100">
              <template #default="{ row }">
                <el-tag :type="getLogTypeTag(row.type)">{{ getLogTypeLabel(row.type) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="content" label="变更内容" min-width="250" />
            <el-table-column prop="ip" label="操作IP" width="130" />
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowDown } from '@element-plus/icons-vue'
import JobSettings from './components/JobSettings.vue'
import JobAddDialog from './components/JobAddDialog.vue'
import JobImportDialog from './components/JobImportDialog.vue'

const selectedRows = ref([])
const currentJob = ref(null)
const drawerVisible = ref(false)
const activeTab = ref('basic')
const searchKeyword = ref('')
const levelFilter = ref('')
const statusFilter = ref('')
const showSettings = ref(false)
const showAddDialog = ref(false)
const showImportDialog = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

const logOperatorFilter = ref('')
const logDateRange = ref([])
const logTypeFilter = ref('')

const basicForm = reactive({
  id: null,
  name: '',
  code: '',
  level: '',
  sort: 1,
  status: 'enabled',
  remark: ''
})

const tableData = ref([])
const linkedPositions = ref([])
const logs = ref([])

onMounted(() => {
  loadTableData()
})

const loadTableData = () => {
  tableData.value = [
    { id: 1, name: '专员', code: 'JOB-001', level: '基层', sort: 1, status: 'enabled', linkedPositions: 15, remark: '' },
    { id: 2, name: '主管', code: 'JOB-002', level: '中层', sort: 2, status: 'enabled', linkedPositions: 8, remark: '' },
    { id: 3, name: '经理', code: 'JOB-003', level: '中层', sort: 3, status: 'enabled', linkedPositions: 5, remark: '' },
    { id: 4, name: '总监', code: 'JOB-004', level: '高层', sort: 4, status: 'enabled', linkedPositions: 3, remark: '' },
    { id: 5, name: '总经理', code: 'JOB-005', level: '高管', sort: 5, status: 'enabled', linkedPositions: 1, remark: '' }
  ]
  total.value = tableData.value.length
}

const filteredTableData = computed(() => {
  let data = [...tableData.value]

  if (searchKeyword.value) {
    data = data.filter(item => item.name.includes(searchKeyword.value))
  }

  if (levelFilter.value) {
    data = data.filter(item => item.level === levelFilter.value)
  }

  if (statusFilter.value) {
    data = data.filter(item => item.status === statusFilter.value)
  }

  return data
})

const filteredLogs = computed(() => {
  let data = logs.value

  if (logOperatorFilter.value) {
    data = data.filter(log => log.operator === logOperatorFilter.value)
  }

  if (logTypeFilter.value) {
    data = data.filter(log => log.type === logTypeFilter.value)
  }

  if (logDateRange.value && logDateRange.value.length === 2) {
    const [start, end] = logDateRange.value
    data = data.filter(log => {
      const logTime = new Date(log.time)
      return logTime >= start && logTime <= end
    })
  }

  return data
})

const logOperators = computed(() => {
  return [...new Set(logs.value.map(log => log.operator))]
})

const handleSelectionChange = (selection) => {
  selectedRows.value = selection
}

const handleAdd = () => {
  Object.assign(basicForm, {
    id: null,
    name: '',
    code: '',
    level: '',
    sort: tableData.value.length + 1,
    status: 'enabled',
    remark: ''
  })
  currentJob.value = null
  showAddDialog.value = true
}

const handleEdit = (row) => {
  Object.assign(basicForm, { ...row })
  currentJob.value = row
  showAddDialog.value = true
  drawerVisible.value = false
}

const handleView = (row) => {
  currentJob.value = row
  Object.assign(basicForm, { ...row })

  linkedPositions.value = [
    { id: 1, name: '前端开发岗', department: '技术部', memberCount: 5 },
    { id: 2, name: '后端开发岗', department: '技术部', memberCount: 8 }
  ]

  logs.value = [
    { operator: '管理员', time: '2026-04-13 10:00:00', type: 'create', content: '新增职务', ip: '192.168.1.100' },
    { operator: '管理员', time: '2026-04-13 11:00:00', type: 'edit', content: '修改职务编码', ip: '192.168.1.100' }
  ]

  drawerVisible.value = true
}

const handleConfirmAdd = (formData) => {
  if (formData.id) {
    const index = tableData.value.findIndex(item => item.id === formData.id)
    if (index !== -1) {
      tableData.value[index] = { ...tableData.value[index], ...formData }
    }
    ElMessage.success('编辑成功')
  } else {
    formData.id = tableData.value.length + 1
    formData.linkedPositions = 0
    tableData.value.push(formData)
    ElMessage.success('新增成功')
  }
  showAddDialog.value = false
  loadTableData()
}

const handleToggleStatus = (row) => {
  const action = row.status === 'enabled' ? '禁用' : '启用'
  ElMessageBox.confirm(`确定要${action}该职务吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    row.status = row.status === 'enabled' ? 'disabled' : 'enabled'
    ElMessage.success(`${action}成功`)
    if (drawerVisible.value) {
      loadTableData()
    }
  })
}

const handleDelete = (row) => {
  if (row.linkedPositions > 0) {
    ElMessage.warning('该职务已关联岗位，无法删除')
    return
  }
  ElMessageBox.confirm('确定要删除该职务吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    tableData.value = tableData.value.filter(item => item.id !== row.id)
    ElMessage.success('删除成功')
    drawerVisible.value = false
    loadTableData()
  })
}

const handleBatchEnable = () => {
  selectedRows.value.forEach(row => {
    row.status = 'enabled'
  })
  ElMessage.success(`批量启用 ${selectedRows.value.length} 个职务`)
  selectedRows.value = []
}

const handleBatchDisable = () => {
  ElMessageBox.confirm(`确定要批量禁用 ${selectedRows.value.length} 个职务吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    selectedRows.value.forEach(row => {
      row.status = 'disabled'
    })
    ElMessage.success('批量禁用成功')
    selectedRows.value = []
  })
}

const handleBatchDelete = () => {
  const canDelete = selectedRows.value.filter(row => row.linkedPositions === 0)
  if (canDelete.length === 0) {
    ElMessage.warning('选中的职务均已关联岗位，无法删除')
    return
  }
  ElMessageBox.confirm(`确定要删除选中的 ${canDelete.length} 个职务吗？删除后不可恢复！`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    tableData.value = tableData.value.filter(item => {
      return !selectedRows.value.find(sel => sel.id === item.id) || item.linkedPositions > 0
    })
    ElMessage.success('批量删除成功')
    selectedRows.value = []
    loadTableData()
  })
}

const handleExport = () => {
  ElMessage.success('导出成功')
}

const handleRefresh = () => {
  loadTableData()
  ElMessage.success('刷新成功')
}

const handleSearch = () => {}

const handleFilter = () => {}

const saveSettings = () => {
  ElMessage.success('设置已保存')
}

const downloadTemplate = () => {
  ElMessage.success('模板下载成功')
}

const handleConfirmImport = () => {
  ElMessage.success('导入成功')
  showImportDialog.value = false
  loadTableData()
}

const handleExportLogs = () => {
  ElMessage.success('日志导出成功')
}

const getLogTypeTag = (type) => {
  const tags = {
    create: 'success',
    edit: 'primary',
    delete: 'danger',
    disable: 'warning',
    enable: 'success',
    sort: 'info'
  }
  return tags[type] || ''
}

const getLogTypeLabel = (type) => {
  const labels = {
    create: '新增',
    edit: '编辑',
    delete: '删除',
    disable: '禁用',
    enable: '启用',
    sort: '排序调整'
  }
  return labels[type] || type
}
</script>

<style lang="scss" scoped>
.job-management-page {
  padding: 20px;
  height: calc(100vh - 60px);
  display: flex;
  flex-direction: column;

  .main-card {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;

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
    .toolbar-center,
    .toolbar-right {
      display: flex;
      gap: 8px;
      align-items: center;
    }
  }

  .content-wrapper {
    flex: 1;
    overflow: auto;
    min-height: 0;
  }

  .pagination-wrapper {
    margin-top: 16px;
    display: flex;
    justify-content: flex-end;
  }

  .footer-tips {
    margin-top: 16px;
    padding: 12px 16px;
    background: #f5f7fa;
    border-radius: 4px;
    font-size: 12px;
    color: #909399;

    p {
      margin: 4px 0;
    }
  }

  .drawer-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;

    .drawer-title {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
    }

    .drawer-actions {
      display: flex;
      gap: 8px;
    }
  }

  .basic-form {
    max-width: 500px;
  }

  .logs-toolbar {
    margin-bottom: 16px;
    display: flex;
    gap: 8px;
    align-items: center;
    flex-wrap: wrap;
  }
}
</style>
