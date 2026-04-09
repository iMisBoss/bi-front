<template>
  <div class="process-instances">
    <div class="page-header">
      <h2>流程实例监控</h2>
      <p class="subtitle">实时监控所有正在运行的流程实例状态</p>
    </div>

    <div class="toolbar">
      <div class="toolbar-left">
        <el-input
            v-model="searchKeyword"
            placeholder="搜索流程名称、单据编号"
            clearable
            style="width: 300px"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-select v-model="filterStatus" placeholder="流程状态" clearable style="width: 150px">
          <el-option label="运行中" value="running" />
          <el-option label="已完成" value="completed" />
          <el-option label="已终止" value="terminated" />
          <el-option label="已挂起" value="suspended" />
        </el-select>
        <el-button type="primary" icon="Search" @click="handleSearch">查询</el-button>
        <el-button icon="Refresh" @click="handleReset">重置</el-button>
      </div>
      <div class="toolbar-right">
        <el-button type="success" icon="Download" @click="handleExport">导出</el-button>
      </div>
    </div>

    <el-table
        :data="filteredInstanceList"
        border
        style="width: 100%"
        v-loading="loading"
    >
      <el-table-column prop="instanceId" label="实例ID" width="120" />
      <el-table-column prop="processName" label="流程名称" min-width="180" />
      <el-table-column prop="billNo" label="单据编号" width="150" />
      <el-table-column prop="initiator" label="发起人" width="120" />
      <el-table-column prop="currentNode" label="当前节点" min-width="150" />
      <el-table-column prop="status" label="流程状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag size="small" :type="getStatusTag(row.status)">
            {{ getStatusText(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="startTime" label="启动时间" width="180" />
      <el-table-column prop="duration" label="运行时长" width="120" />
      <el-table-column label="操作" width="280" align="center" fixed="right">
        <template #default="{ row }">
          <div class="action-buttons">
            <el-button size="small" type="primary" icon="View" @click="handleView(row)">查看</el-button>
            <el-button
                v-if="row.status === 'running'"
                size="small"
                type="warning"
                icon="VideoPause"
                @click="handleSuspend(row)"
            >
              挂起
            </el-button>
            <el-button
                v-if="row.status === 'running'"
                size="small"
                type="danger"
                icon="CircleClose"
                @click="handleTerminate(row)"
            >
              终止
            </el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-bar">
      <span>共 {{ filteredInstanceList.length }} 条记录</span>
      <el-pagination
          layout="total, sizes, prev, pager, next, jumper"
          :total="filteredInstanceList.length"
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
import { Search, Refresh, Download, View, VideoPause, CircleClose } from '@element-plus/icons-vue'

const searchKeyword = ref('')
const filterStatus = ref('')
const loading = ref(false)

const instanceList = ref([
  {
    instanceId: 'INST001',
    processName: '请假审批流程',
    billNo: 'QJ20240408001',
    initiator: '张三',
    currentNode: '部门经理审批',
    status: 'running',
    startTime: '2024-04-08 09:00:00',
    duration: '2小时30分'
  },
  {
    instanceId: 'INST002',
    processName: '费用报销流程',
    billNo: 'BX20240408002',
    initiator: '李四',
    currentNode: '财务审核',
    status: 'running',
    startTime: '2024-04-08 10:15:00',
    duration: '1小时15分'
  },
  {
    instanceId: 'INST003',
    processName: '加班审批流程',
    billNo: 'JB20240407003',
    initiator: '王五',
    currentNode: '-',
    status: 'completed',
    startTime: '2024-04-07 14:00:00',
    duration: '5小时20分'
  },
  {
    instanceId: 'INST004',
    processName: '会议申请流程',
    billNo: 'HY20240408004',
    initiator: '赵六',
    currentNode: '行政备案',
    status: 'suspended',
    startTime: '2024-04-08 11:30:00',
    duration: '30分钟'
  },
  {
    instanceId: 'INST005',
    processName: '车辆申请流程',
    billNo: 'CL20240407005',
    initiator: '孙七',
    currentNode: '-',
    status: 'terminated',
    startTime: '2024-04-07 16:00:00',
    duration: '1小时'
  }
])

const pageSize = ref(10)
const currentPage = ref(1)

const filteredInstanceList = computed(() => {
  let result = [...instanceList.value]

  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(i =>
        i.processName.toLowerCase().includes(keyword) ||
        i.billNo.toLowerCase().includes(keyword)
    )
  }

  if (filterStatus.value) {
    result = result.filter(i => i.status === filterStatus.value)
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
  filterStatus.value = ''
  currentPage.value = 1
  ElMessage.success('已重置查询条件')
}

const handleView = (row) => {
  ElMessage.info(`查看流程实例 ${row.instanceId}`)
}

const handleSuspend = (row) => {
  ElMessageBox.confirm(
      `确定要挂起流程实例"${row.billNo}"吗？`,
      '挂起确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
  ).then(() => {
    row.status = 'suspended'
    ElMessage.success('流程已挂起')
  }).catch(() => {})
}

const handleTerminate = (row) => {
  ElMessageBox.confirm(
      `确定要终止流程实例"${row.billNo}"吗？此操作不可恢复！`,
      '终止确认',
      {
        confirmButtonText: '确定终止',
        cancelButtonText: '取消',
        type: 'error'
      }
  ).then(() => {
    row.status = 'terminated'
    row.currentNode = '-'
    ElMessage.success('流程已终止')
  }).catch(() => {})
}

const handleExport = () => {
  ElMessage.success('导出功能开发中...')
}

const handleSizeChange = (size) => {
  pageSize.value = size
}

const handleCurrentChange = (page) => {
  currentPage.value = page
}

const getStatusTag = (status) => {
  const tags = { running: 'success', completed: 'info', terminated: 'danger', suspended: 'warning' }
  return tags[status] || 'info'
}

const getStatusText = (status) => {
  const texts = { running: '运行中', completed: '已完成', terminated: '已终止', suspended: '已挂起' }
  return texts[status] || status
}
</script>

<style scoped lang="scss">
.process-instances {
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

  .toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    .toolbar-left,
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
