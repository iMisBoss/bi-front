<template>
  <div class="exception-monitor">
    <div class="page-header">
      <h2>流程异常监控</h2>
      <p class="subtitle">监控流程运行中的异常情况，及时处理流程阻塞问题</p>
    </div>

    <div class="statistics-cards">
      <el-card shadow="hover">
        <div class="stat-item">
          <div class="stat-value danger">{{ exceptionStats.total }}</div>
          <div class="stat-label">异常总数</div>
        </div>
      </el-card>
      <el-card shadow="hover">
        <div class="stat-item">
          <div class="stat-value warning">{{ exceptionStats.pending }}</div>
          <div class="stat-label">待处理</div>
        </div>
      </el-card>
      <el-card shadow="hover">
        <div class="stat-item">
          <div class="stat-value success">{{ exceptionStats.resolved }}</div>
          <div class="stat-label">已解决</div>
        </div>
      </el-card>
      <el-card shadow="hover">
        <div class="stat-item">
          <div class="stat-value info">{{ exceptionStats.today }}</div>
          <div class="stat-label">今日新增</div>
        </div>
      </el-card>
    </div>

    <div class="toolbar">
      <div class="toolbar-left">
        <el-input
            v-model="searchKeyword"
            placeholder="搜索流程名称、异常描述"
            clearable
            style="width: 300px"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-select v-model="filterType" placeholder="异常类型" clearable style="width: 150px">
          <el-option label="审批人缺失" value="missing_approver" />
          <el-option label="超时未处理" value="timeout" />
          <el-option label="流程阻塞" value="blocked" />
          <el-option label="系统错误" value="system_error" />
        </el-select>
        <el-select v-model="filterStatus" placeholder="处理状态" clearable style="width: 150px">
          <el-option label="待处理" value="pending" />
          <el-option label="处理中" value="processing" />
          <el-option label="已解决" value="resolved" />
        </el-select>
        <el-button type="primary" icon="Search" @click="handleSearch">查询</el-button>
        <el-button icon="Refresh" @click="handleReset">重置</el-button>
      </div>
      <div class="toolbar-right">
        <el-button type="success" icon="Check" @click="handleBatchResolve">批量解决</el-button>
      </div>
    </div>

    <el-table
        :data="filteredExceptionList"
        border
        style="width: 100%"
        v-loading="loading"
        @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column prop="exceptionId" label="异常ID" width="100" align="center" />
      <el-table-column prop="processName" label="流程名称" min-width="180" />
      <el-table-column prop="billNo" label="单据编号" width="150" />
      <el-table-column prop="exceptionType" label="异常类型" width="120">
        <template #default="{ row }">
          <el-tag size="small" :type="getTypeTag(row.exceptionType)">
            {{ getTypeText(row.exceptionType) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="description" label="异常描述" min-width="200" show-overflow-tooltip />
      <el-table-column prop="status" label="处理状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag size="small" :type="getStatusTag(row.status)">
            {{ getStatusText(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="occurTime" label="发生时间" width="180" />
      <el-table-column label="操作" width="220" align="center" fixed="right">
        <template #default="{ row }">
          <div class="action-buttons">
            <el-button size="small" type="primary" icon="View" @click="handleView(row)">查看</el-button>
            <el-button
                v-if="row.status !== 'resolved'"
                size="small"
                type="success"
                icon="Check"
                @click="handleResolve(row)"
            >
              解决
            </el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-bar">
      <span>共 {{ filteredExceptionList.length }} 条记录</span>
      <el-pagination
          layout="total, sizes, prev, pager, next, jumper"
          :total="filteredExceptionList.length"
          :page-sizes="[10, 20, 50]"
          v-model:page-size="pageSize"
          v-model:current-page="currentPage"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Check, View } from '@element-plus/icons-vue'

const searchKeyword = ref('')
const filterType = ref('')
const filterStatus = ref('')
const loading = ref(false)

const exceptionStats = ref({
  total: 15,
  pending: 8,
  resolved: 7,
  today: 3
})

const exceptionList = ref([
  {
    exceptionId: 'E001',
    processName: '请假审批流程',
    billNo: 'QJ20240408001',
    exceptionType: 'missing_approver',
    description: '总经理审批节点未配置审批人',
    status: 'pending',
    occurTime: '2024-04-08 09:30:00',
    handler: '',
    resolveTime: ''
  },
  {
    exceptionId: 'E002',
    processName: '费用报销流程',
    billNo: 'BX20240408002',
    exceptionType: 'timeout',
    description: '财务审核节点已超时24小时未处理',
    status: 'pending',
    occurTime: '2024-04-08 10:00:00',
    handler: '',
    resolveTime: ''
  },
  {
    exceptionId: 'E003',
    processName: '加班审批流程',
    billNo: 'JB20240408003',
    exceptionType: 'blocked',
    description: '流程在部门经理审批节点阻塞超过48小时',
    status: 'processing',
    occurTime: '2024-04-07 14:20:00',
    handler: '系统管理员',
    resolveTime: ''
  },
  {
    exceptionId: 'E004',
    processName: '会议申请流程',
    billNo: 'HY20240408004',
    exceptionType: 'system_error',
    description: '流程引擎执行异常：NullPointerException',
    status: 'resolved',
    occurTime: '2024-04-07 16:45:00',
    handler: '技术部',
    resolveTime: '2024-04-07 17:30:00'
  },
  {
    exceptionId: 'E005',
    processName: '车辆申请流程',
    billNo: 'CL20240408005',
    exceptionType: 'missing_approver',
    description: '车队队长审批节点未配置审批人',
    status: 'pending',
    occurTime: '2024-04-08 11:15:00',
    handler: '',
    resolveTime: ''
  }
])

const pageSize = ref(10)
const currentPage = ref(1)
const selectedExceptions = ref([])

const filteredExceptionList = computed(() => {
  let result = [...exceptionList.value]

  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(e =>
        e.processName.toLowerCase().includes(keyword) ||
        e.description.toLowerCase().includes(keyword)
    )
  }

  if (filterType.value) {
    result = result.filter(e => e.exceptionType === filterType.value)
  }

  if (filterStatus.value) {
    result = result.filter(e => e.status === filterStatus.value)
  }

  return result
})

const handleSearch = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    ElMessage.success('查询完成')
  }, 500)
}

const handleReset = () => {
  searchKeyword.value = ''
  filterType.value = ''
  filterStatus.value = ''
  currentPage.value = 1
  ElMessage.success('已重置查询条件')
}

const handleSelectionChange = (selection) => {
  selectedExceptions.value = selection
}

const handleView = (row) => {
  ElMessage.info(`查看异常 ${row.exceptionId}`)
}

const handleResolve = (row) => {
  ElMessageBox.prompt('请输入解决方案', '解决异常', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPlaceholder: '请输入解决方案...'
  }).then(({ value }) => {
    row.status = 'resolved'
    row.handler = '当前用户'
    row.resolveTime = new Date().toLocaleString('zh-CN')
    exceptionStats.value.pending--
    exceptionStats.value.resolved++
    ElMessage.success('异常已解决')
  }).catch(() => {})
}

const handleBatchResolve = () => {
  if (selectedExceptions.value.length === 0) {
    ElMessage.warning('请先选择要解决的异常')
    return
  }

  ElMessageBox.confirm(
      `确定要批量解决选中的 ${selectedExceptions.value.length} 个异常吗？`,
      '批量解决确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
  ).then(() => {
    selectedExceptions.value.forEach(e => {
      if (e.status !== 'resolved') {
        e.status = 'resolved'
        e.handler = '当前用户'
        e.resolveTime = new Date().toLocaleString('zh-CN')
      }
    })
    exceptionStats.value.pending -= selectedExceptions.value.length
    exceptionStats.value.resolved += selectedExceptions.value.length
    ElMessage.success('批量解决成功')
    selectedExceptions.value = []
  }).catch(() => {})
}

const handleSizeChange = (size) => {
  pageSize.value = size
}

const handleCurrentChange = (page) => {
  currentPage.value = page
}

const getTypeTag = (type) => {
  const tags = {
    missing_approver: 'danger',
    timeout: 'warning',
    blocked: 'warning',
    system_error: 'danger'
  }
  return tags[type] || 'info'
}

const getTypeText = (type) => {
  const texts = {
    missing_approver: '审批人缺失',
    timeout: '超时未处理',
    blocked: '流程阻塞',
    system_error: '系统错误'
  }
  return texts[type] || type
}

const getStatusTag = (status) => {
  const tags = { pending: 'danger', processing: 'warning', resolved: 'success' }
  return tags[status] || 'info'
}

const getStatusText = (status) => {
  const texts = { pending: '待处理', processing: '处理中', resolved: '已解决' }
  return texts[status] || status
}
</script>

<style scoped lang="scss">
.exception-monitor {
  padding: 20px;

  .page-header {
    margin-bottom: 24px;

    h2 {
      margin: 0 0 8px;
      font-size: 20px;
    }

    .subtitle {
      margin: 0;
      font-size: 14px;
      color: #909399;
    }
  }

  .statistics-cards {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 24px;

    .stat-item {
      text-align: center;

      .stat-value {
        font-size: 32px;
        font-weight: bold;
        margin-bottom: 8px;

        &.danger {
          color: #f56c6c;
        }

        &.warning {
          color: #e6a23c;
        }

        &.success {
          color: #67c23a;
        }

        &.info {
          color: #409eff;
        }
      }

      .stat-label {
        font-size: 14px;
        color: #909399;
      }
    }
  }

  .toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    .toolbar-left {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    .toolbar-right {
      display: flex;
      gap: 12px;
    }
  }

  :deep(.el-table__cell) {
    .action-buttons {
      display: inline-flex !important;
      gap: 8px;
      justify-content: center;
      align-items: center;
      flex-wrap: nowrap !important;
      white-space: nowrap !important;

      .el-button {
        margin: 0 !important;
        white-space: nowrap !important;
      }
    }
  }

  .pagination-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 16px;
    padding: 12px 0;
  }
}
</style>
