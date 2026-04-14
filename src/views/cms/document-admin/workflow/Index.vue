<template>
  <div class="workflow-config-page">
    <el-breadcrumb separator="/" class="breadcrumb">
      <el-breadcrumb-item :to="{ path: '/' }">后台首页</el-breadcrumb-item>
      <el-breadcrumb-item>公文管理</el-breadcrumb-item>
      <el-breadcrumb-item>公文流程配置</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card class="main-card" shadow="never">
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
            <el-button @click="handleRefresh" icon="Refresh">刷新</el-button>
          </el-button-group>
        </div>
      </div>

      <el-table
          :data="workflowData"
          border
          @selection-change="handleSelectionChange"
          row-key="id"
          :header-cell-style="{ background: '#fafafa', color: '#333', fontWeight: '600' }"
          style="flex: 1"
      >
        <el-table-column type="selection" width="50" />
        <el-table-column prop="docType" label="公文类型" width="150" />
        <el-table-column prop="flowName" label="绑定流程" min-width="200" />
        <el-table-column prop="nodes" label="审批节点" width="200" show-overflow-tooltip />
        <el-table-column prop="scope" label="适用范围" width="150" />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 'enabled' ? 'success' : 'info'" size="small">
              {{ row.status === 'enabled' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="140" align="center" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
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
            :total="workflowData.length"
            :page-size="10"
            layout="total, prev, pager, next"
        />
      </div>
    </el-card>

    <WorkflowDrawer
        v-model="showDrawer"
        :data="currentWorkflow"
        @confirm="handleConfirmSave"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import WorkflowDrawer from './components/WorkflowDrawer.vue'

const selectedRows = ref([])
const currentWorkflow = ref(null)
const showDrawer = ref(false)
const workflowData = ref([])

onMounted(() => {
  loadWorkflowData()
})

const loadWorkflowData = () => {
  workflowData.value = [
    { id: 1, docType: '发文', flowName: '发文审批流程', nodes: '发起人 → 部门经理 → 分管领导 → 总经理', scope: '全公司', status: 'enabled' },
    { id: 2, docType: '收文', flowName: '收文登记流程', nodes: '收发室 → 办公室 → 领导批示 → 承办部门', scope: '全公司', status: 'enabled' },
    { id: 3, docType: '通知', flowName: '通知发布流程', nodes: '起草人 → 部门审核 → 发布', scope: '全公司', status: 'enabled' },
    { id: 4, docType: '涉密公文', flowName: '涉密公文特批流程', nodes: '发起人 → 部门经理 → 保密办 → 分管领导', scope: '指定部门', status: 'disabled' }
  ]
}

const handleSelectionChange = (selection) => {
  selectedRows.value = selection
}

const handleEdit = (row) => {
  currentWorkflow.value = { ...row }
  showDrawer.value = true
}

const handleToggleStatus = (row) => {
  const action = row.status === 'enabled' ? '禁用' : '启用'
  ElMessageBox.confirm(`确定要${action}「${row.docType}」流程配置吗？`, '提示', {
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

  ElMessageBox.confirm(`确定要批量启用 ${selectedRows.value.length} 个流程配置吗？`, '批量启用', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'info'
  }).then(() => {
    selectedRows.value.forEach(row => { row.status = 'enabled' })
    ElMessage.success('批量启用成功')
    selectedRows.value = []
  }).catch(() => {})
}

const handleRefresh = () => {
  loadWorkflowData()
  ElMessage.success('刷新成功')
}

const handleConfirmSave = (formData) => {
  if (formData.id) {
    const index = workflowData.value.findIndex(item => item.id === formData.id)
    if (index !== -1) {
      workflowData.value[index] = { ...workflowData.value[index], ...formData }
    }
    ElMessage.success('编辑成功')
  } else {
    formData.id = Date.now()
    workflowData.value.push(formData)
    ElMessage.success('新增成功')
  }
  showDrawer.value = false
}
</script>

<style lang="scss" scoped>
.workflow-config-page {
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

    .toolbar-left {
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
