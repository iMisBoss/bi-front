<template>
  <div class="approval-config">
    <div class="toolbar">
      <el-button-group>
        <el-button type="success" @click="handleBatchEnable" :disabled="selectedRows.length === 0">批量启用</el-button>
      </el-button-group>
      <el-button type="primary" @click="handleAdd" icon="Plus">新增配置</el-button>
    </div>

    <el-table
        :data="approvalData"
        border
        @selection-change="handleSelectionChange"
        row-key="id"
        style="flex: 1"
    >
      <el-table-column type="selection" width="50" />
      <el-table-column prop="docType" label="公文类型" width="150" />
      <el-table-column prop="flowName" label="绑定流程" min-width="200" />
      <el-table-column prop="nodes" label="审批节点" width="250" show-overflow-tooltip />
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
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const selectedRows = ref([])

const approvalData = ref([
  { id: 1, docType: '公司公告', flowName: '总经理审批流程', nodes: '起草人 → 部门经理 → 总经理', scope: '全公司', status: 'enabled' },
  { id: 2, docType: '部门通知', flowName: '部门负责人审批流程', nodes: '起草人 → 部门负责人', scope: '指定部门', status: 'enabled' },
  { id: 3, docType: '规章制度', flowName: '高管审批流程', nodes: '起草人 → 部门经理 → 分管领导 → 总经理', scope: '全公司', status: 'enabled' }
])

const handleSelectionChange = (selection) => {
  selectedRows.value = selection
}

const handleAdd = () => {
  ElMessage.info('新增审批配置功能')
}

const handleEdit = (row) => {
  ElMessage.info('编辑审批配置功能')
}

const handleToggleStatus = (row) => {
  const action = row.status === 'enabled' ? '禁用' : '启用'
  ElMessageBox.confirm(`确定要${action}该配置吗？`, '提示', {
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
</script>

<style lang="scss" scoped>
.approval-config {
  display: flex;
  flex-direction: column;
  height: 100%;

  .toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }
}
</style>
