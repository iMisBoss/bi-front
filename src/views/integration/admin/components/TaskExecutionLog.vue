<template>
  <div class="task-execution-log">
    <!-- 统计看板 -->
    <el-row :gutter="16" style="margin-bottom: 20px">
      <el-col :span="6">
        <el-card shadow="never" class="stat-card">
          <div class="stat-content">
            <div class="stat-value">{{ logStats.total }}</div>
            <div class="stat-label">执行总数</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never" class="stat-card">
          <div class="stat-content">
            <div class="stat-value" style="color: #67c23a">{{ logStats.success }}</div>
            <div class="stat-label">成功次数</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never" class="stat-card">
          <div class="stat-content">
            <div class="stat-value" style="color: #f56c6c">{{ logStats.fail }}</div>
            <div class="stat-label">失败次数</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never" class="stat-card">
          <div class="stat-content">
            <div class="stat-value" style="color: #e6a23c">{{ logStats.running }}</div>
            <div class="stat-label">执行中</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 筛选区 -->
    <div class="filter-bar">
      <el-select v-model="filterTask" placeholder="任务名称" clearable style="width: 200px">
        <el-option label="日志归档任务" value="TASK_LOG_ARCHIVE" />
        <el-option label="数据备份任务" value="TASK_DATA_BACKUP" />
        <el-option label="HR人员同步" value="TASK_HR_SYNC" />
      </el-select>
      <el-select v-model="filterGroup" placeholder="任务分组" clearable style="width: 150px">
        <el-option label="系统任务" value="system" />
        <el-option label="业务任务" value="business" />
        <el-option label="集成任务" value="integration" />
      </el-select>
      <el-select v-model="filterStatus" placeholder="执行状态" clearable style="width: 150px">
        <el-option label="成功" value="success" />
        <el-option label="失败" value="fail" />
        <el-option label="执行中" value="running" />
      </el-select>
      <el-date-picker v-model="dateRange" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" style="width: 240px" />
      <el-button-group>
        <el-button @click="handleExport" icon="Download">导出日志</el-button>
        <el-button @click="handleRefresh" icon="Refresh">刷新</el-button>
      </el-button-group>
    </div>

    <!-- 日志列表 -->
    <el-table
        :data="executionLogs"
        border
        row-key="id"
        :header-cell-style="{ background: '#fafafa', color: '#333', fontWeight: '600' }"
        style="flex: 1"
    >
      <el-table-column prop="taskId" label="任务ID" width="100" />
      <el-table-column prop="taskName" label="任务名称" min-width="180" />
      <el-table-column prop="params" label="执行参数" min-width="150" show-overflow-tooltip />
      <el-table-column prop="startTime" label="开始时间" width="160" />
      <el-table-column prop="endTime" label="结束时间" width="160" />
      <el-table-column prop="duration" label="耗时" width="100" />
      <el-table-column prop="status" label="执行状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)" size="small">{{ getStatusText(row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="140" align="center" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click="handleViewDetail(row)">详情</el-button>
          <el-button
              v-if="row.status === 'fail'"
              link
              type="warning"
              size="small"
              @click="handleRetry(row)"
          >
            重试
          </el-button>
          <el-button
              v-if="row.status === 'running'"
              link
              type="danger"
              size="small"
              @click="handleForceStop(row)"
          >
            终止
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-wrapper">
      <el-pagination
          :total="executionLogs.length"
          :page-size="20"
          layout="total, prev, pager, next, jumper"
      />
    </div>

    <!-- 日志详情抽屉 -->
    <el-drawer v-model="showDetailDrawer" title="执行日志详情" size="700px">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="任务ID">{{ currentLog?.taskId }}</el-descriptions-item>
        <el-descriptions-item label="任务名称">{{ currentLog?.taskName }}</el-descriptions-item>
        <el-descriptions-item label="执行参数">{{ currentLog?.params }}</el-descriptions-item>
        <el-descriptions-item label="开始时间">{{ currentLog?.startTime }}</el-descriptions-item>
        <el-descriptions-item label="结束时间">{{ currentLog?.endTime }}</el-descriptions-item>
        <el-descriptions-item label="耗时">{{ currentLog?.duration }}</el-descriptions-item>
        <el-descriptions-item label="服务器节点">{{ currentLog?.serverNode }}</el-descriptions-item>
        <el-descriptions-item label="执行状态">
          <el-tag :type="getStatusType(currentLog?.status)">{{ getStatusText(currentLog?.status) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="异常信息" v-if="currentLog?.status === 'fail'">
          <el-input type="textarea" :rows="8" :model-value="currentLog?.errorMsg" readonly />
        </el-descriptions-item>
      </el-descriptions>

      <template #footer>
        <div class="drawer-footer">
          <el-button @click="showDetailDrawer = false">关闭</el-button>
          <el-button v-if="currentLog?.status === 'fail'" type="primary" @click="handleRetryFromDetail">重试任务</el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const filterTask = ref('')
const filterGroup = ref('')
const filterStatus = ref('')
const dateRange = ref(null)
const showDetailDrawer = ref(false)
const currentLog = ref(null)

const logStats = reactive({
  total: 1256,
  success: 1180,
  fail: 45,
  running: 3
})

const executionLogs = ref([
  { id: 1, taskId: 1, taskName: '日志归档任务', params: '{}', startTime: '2026-04-15 02:00:00', endTime: '2026-04-15 02:15:30', duration: '15分30秒', status: 'success', serverNode: 'node-1', errorMsg: '' },
  { id: 2, taskId: 2, taskName: '数据备份任务', params: '{}', startTime: '2026-04-15 03:00:00', endTime: '2026-04-15 03:25:10', duration: '25分10秒', status: 'success', serverNode: 'node-1', errorMsg: '' },
  { id: 3, taskId: 3, taskName: 'HR人员同步', params: '{}', startTime: '2026-04-15 08:00:00', endTime: '2026-04-15 08:02:15', duration: '2分15秒', status: 'fail', serverNode: 'node-2', errorMsg: '连接超时：无法连接到HR系统\nat com.oa.task.HrSyncTask.execute(HrSyncTask.java:45)\nat com.oa.scheduler.TaskExecutor.run(TaskExecutor.java:128)' },
  { id: 4, taskId: 1, taskName: '日志归档任务', params: '{}', startTime: '2026-04-14 02:00:00', endTime: '2026-04-14 02:14:50', duration: '14分50秒', status: 'success', serverNode: 'node-1', errorMsg: '' }
])

const getStatusType = (status) => {
  const types = {
    'success': 'success',
    'fail': 'danger',
    'running': 'primary'
  }
  return types[status] || ''
}

const getStatusText = (status) => {
  const texts = {
    'success': '成功',
    'fail': '失败',
    'running': '执行中'
  }
  return texts[status] || status
}

const handleViewDetail = (row) => {
  currentLog.value = row
  showDetailDrawer.value = true
}

const handleRetry = (row) => {
  ElMessageBox.confirm(`确定要重试任务「${row.taskName}」吗？`, '重试任务', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'info'
  }).then(() => {
    ElMessage.success('任务重试已提交')
  }).catch(() => {})
}

const handleRetryFromDetail = () => {
  ElMessageBox.confirm(`确定要重试任务「${currentLog.value?.taskName}」吗？`, '重试任务', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'info'
  }).then(() => {
    showDetailDrawer.value = false
    ElMessage.success('任务重试已提交')
  }).catch(() => {})
}

const handleForceStop = (row) => {
  ElMessageBox.confirm(`确定要强制终止正在执行的任务「${row.taskName}」吗？`, '强制终止', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'error'
  }).then(() => {
    row.status = 'fail'
    row.endTime = new Date().toLocaleString()
    row.errorMsg = '用户手动终止'
    ElMessage.success('任务已终止')
  }).catch(() => {})
}

const handleExport = () => {
  ElMessage.success('日志导出成功')
}

const handleRefresh = () => {
  ElMessage.success('刷新成功')
}
</script>

<style lang="scss" scoped>
.task-execution-log {
  display: flex;
  flex-direction: column;
  height: 100%;

  .stat-card {
    border-radius: 8px;

    .stat-content {
      text-align: center;
      padding: 12px 0;

      .stat-value {
        font-size: 24px;
        font-weight: 600;
        color: #303133;
        margin-bottom: 4px;
      }

      .stat-label {
        font-size: 14px;
        color: #909399;
      }
    }
  }

  .filter-bar {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;
    flex-wrap: wrap;
  }

  .pagination-wrapper {
    margin-top: 16px;
    display: flex;
    justify-content: flex-end;
    flex-shrink: 0;
  }

  .drawer-footer {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }
}
</style>
