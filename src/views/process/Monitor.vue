<template>
  <div class="monitor-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>流程监控</span>
          <el-input v-model="searchText" placeholder="搜索流程" style="width: 200px" clearable />
        </div>
      </template>

      <el-table :data="tableData" v-loading="loading" border>
        <el-table-column prop="processName" label="流程名称" min-width="250" />
        <el-table-column prop="processNo" label="流程编号" width="150" />
        <el-table-column prop="applicant" label="申请人" width="100" />
        <el-table-column prop="startTime" label="发起时间" width="180" />
        <el-table-column prop="currentNode" label="当前节点" width="150" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTag(row.status)">
              {{ row.statusText }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="200">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleView(row)">查看</el-button>
            <el-button link type="warning" @click="handleSupervise(row)">督办</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          class="pagination"
      />
    </el-card>

    <el-dialog v-model="dialogVisible" title="流程详情" width="800px">
      <div class="process-detail">
        <el-steps direction="vertical" :active="currentStep">
          <el-step v-for="(node, index) in currentProcess.nodes" :key="index" :title="node.name" :description="node.description">
            <template #icon>
              <el-icon v-if="node.status === 'completed'" color="#67c23a"><CircleCheck /></el-icon>
              <el-icon v-else-if="node.status === 'processing'" color="#409eff"><Loading /></el-icon>
              <el-icon v-else color="#909399"><Circle /></el-icon>
            </template>
          </el-step>
        </el-steps>
      </div>
      <template #footer>
        <el-button @click="dialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { CircleCheck, Loading, Circle } from '@element-plus/icons-vue'

const loading = ref(false)
const searchText = ref('')
const tableData = ref([])
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const dialogVisible = ref(false)
const currentProcess = ref({})
const currentStep = ref(0)

onMounted(() => {
  loadData()
})

const loadData = () => {
  loading.value = true
  setTimeout(() => {
    tableData.value = [
      { id: 1, processName: '请假审批流程', processNo: 'PROC-2026-001', applicant: '张三', startTime: '2026-01-15 10:00', currentNode: '部门经理审批', status: 2, statusText: '审批中' },
      { id: 2, processName: '会议室预定流程', processNo: 'PROC-2026-002', applicant: '李四', startTime: '2026-01-14 09:00', currentNode: '已完成', status: 3, statusText: '已完成' },
      { id: 3, processName: '用车申请流程', processNo: 'PROC-2026-003', applicant: '王五', startTime: '2026-01-13 14:30', currentNode: '行政审批', status: 2, statusText: '审批中' }
    ]
    pagination.total = tableData.value.length
    loading.value = false
  }, 500)
}

const handleView = (row) => {
  currentProcess.value = {
    nodes: [
      { name: '发起申请', description: '张三 - 2026-01-15 10:00', status: 'completed' },
      { name: '部门经理审批', description: '李四 - 已同意', status: 'completed' },
      { name: '人事审批', description: '待审批', status: 'processing' },
      { name: '归档', description: '', status: 'pending' }
    ]
  }
  currentStep.value = 2
  dialogVisible.value = true
}

const handleSupervise = (row) => {
  ElMessage.success('已发送督办通知')
}

const getStatusTag = (status) => {
  const types = { 1: 'info', 2: 'warning', 3: 'success' }
  return types[status] || 'info'
}
</script>

<style lang="scss" scoped>
.monitor-page {
  padding: 20px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .pagination {
    margin-top: 20px;
    justify-content: flex-end;
  }

  .process-detail {
    padding: 20px;
  }
}
</style>
