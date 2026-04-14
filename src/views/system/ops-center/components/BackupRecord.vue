<template>
  <div class="backup-record">
    <!-- 统计卡片 -->
    <el-row :gutter="16" style="margin-bottom: 20px">
      <el-col :span="6">
        <el-card shadow="never" class="stat-card">
          <div class="stat-content">
            <div class="stat-value">{{ recordStats.total }}</div>
            <div class="stat-label">备份总数</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never" class="stat-card">
          <div class="stat-content">
            <div class="stat-value" style="color: #67c23a">{{ recordStats.success }}</div>
            <div class="stat-label">成功次数</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never" class="stat-card">
          <div class="stat-content">
            <div class="stat-value" style="color: #f56c6c">{{ recordStats.fail }}</div>
            <div class="stat-label">失败次数</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never" class="stat-card">
          <div class="stat-content">
            <div class="stat-value" style="color: #e6a23c">{{ recordStats.running }}</div>
            <div class="stat-label">执行中</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 筛选区 -->
    <div class="filter-bar">
      <el-select v-model="filterType" placeholder="备份类型" clearable style="width: 150px">
        <el-option label="全量备份" value="full" />
        <el-option label="增量备份" value="incremental" />
      </el-select>
      <el-select v-model="filterStatus" placeholder="执行状态" clearable style="width: 150px">
        <el-option label="成功" value="success" />
        <el-option label="执行中" value="running" />
        <el-option label="失败" value="fail" />
        <el-option label="已取消" value="cancelled" />
      </el-select>
      <el-date-picker v-model="dateRange" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" style="width: 240px" />
      <el-button-group>
        <el-button @click="handleExport" icon="Download">导出记录</el-button>
        <el-button @click="handleRetryAll" icon="Refresh">失败重试</el-button>
      </el-button-group>
    </div>

    <!-- 备份记录列表 -->
    <el-table
        :data="backupRecords"
        border
        @selection-change="handleSelectionChange"
        row-key="id"
        :header-cell-style="{ background: '#fafafa', color: '#333', fontWeight: '600' }"
        style="flex: 1"
    >
      <el-table-column type="selection" width="50" />
      <el-table-column prop="id" label="记录ID" width="100" />
      <el-table-column prop="type" label="备份类型" width="120" align="center">
        <template #default="{ row }">
          <el-tag :type="row.type === 'full' ? 'primary' : 'success'" size="small">
            {{ row.type === 'full' ? '全量备份' : '增量备份' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="scope" label="备份范围" min-width="200" />
      <el-table-column prop="startTime" label="执行时间" width="160" />
      <el-table-column prop="duration" label="耗时" width="100" />
      <el-table-column prop="fileSize" label="文件大小" width="120" />
      <el-table-column prop="status" label="执行状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)" size="small">{{ getStatusText(row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="operator" label="操作人" width="100" />
      <el-table-column label="操作" width="220" align="center" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click="handleViewDetail(row)">详情</el-button>
          <el-button link type="primary" size="small" @click="handleDownload(row)" :disabled="row.status !== 'success'">下载</el-button>
          <el-button link type="success" size="small" @click="handleRestore(row)" :disabled="row.status !== 'success'">恢复</el-button>
          <el-button link type="warning" size="small" @click="handleRetry(row)" :disabled="row.status !== 'fail'">重试</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-wrapper">
      <el-pagination
          :total="backupRecords.length"
          :page-size="20"
          layout="total, prev, pager, next, jumper"
      />
    </div>

    <!-- 备份详情抽屉 -->
    <el-drawer v-model="showDetailDrawer" title="备份详情" size="600px">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="记录ID">{{ currentRecord?.id }}</el-descriptions-item>
        <el-descriptions-item label="备份类型">{{ currentRecord?.type === 'full' ? '全量备份' : '增量备份' }}</el-descriptions-item>
        <el-descriptions-item label="备份范围">{{ currentRecord?.scope }}</el-descriptions-item>
        <el-descriptions-item label="执行时间">{{ currentRecord?.startTime }}</el-descriptions-item>
        <el-descriptions-item label="耗时">{{ currentRecord?.duration }}</el-descriptions-item>
        <el-descriptions-item label="文件大小">{{ currentRecord?.fileSize }}</el-descriptions-item>
        <el-descriptions-item label="存储路径">{{ currentRecord?.storagePath }}</el-descriptions-item>
        <el-descriptions-item label="执行状态">
          <el-tag :type="getStatusType(currentRecord?.status)">{{ getStatusText(currentRecord?.status) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="操作人">{{ currentRecord?.operator }}</el-descriptions-item>
        <el-descriptions-item label="备份日志">
          <el-input type="textarea" :rows="6" :model-value="currentRecord?.logs" readonly />
        </el-descriptions-item>
        <el-descriptions-item label="错误原因" v-if="currentRecord?.status === 'fail'">
          <el-alert :title="currentRecord?.errorMsg" type="error" :closable="false" />
        </el-descriptions-item>
      </el-descriptions>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const filterType = ref('')
const filterStatus = ref('')
const dateRange = ref(null)
const selectedRows = ref([])
const showDetailDrawer = ref(false)
const currentRecord = ref(null)

const recordStats = reactive({
  total: 156,
  success: 148,
  fail: 5,
  running: 3
})

const backupRecords = ref([
  { id: 1001, type: 'full', scope: '数据库+附件+配置文件', startTime: '2026-04-15 02:00', duration: '15分钟', fileSize: '2.5GB', storagePath: '/data/backup/20260415_full.zip', status: 'success', operator: '系统自动', logs: '备份任务启动...\n数据库备份完成\n附件备份完成\n配置文件备份完成\n备份任务完成', errorMsg: '' },
  { id: 1002, type: 'incremental', scope: '数据库', startTime: '2026-04-14 02:00', duration: '8分钟', fileSize: '856MB', storagePath: '/data/backup/20260414_incremental.zip', status: 'success', operator: '系统自动', logs: '增量备份任务启动...\n数据库增量备份完成\n备份任务完成', errorMsg: '' },
  { id: 1003, type: 'full', scope: '数据库+附件', startTime: '2026-04-13 02:00', duration: '失败', fileSize: '-', storagePath: '-', status: 'fail', operator: '系统自动', logs: '备份任务启动...\n数据库备份完成\n附件备份失败', errorMsg: '磁盘空间不足，无法完成附件备份' },
  { id: 1004, type: 'incremental', scope: '数据库', startTime: '2026-04-12 02:00', duration: '执行中', fileSize: '-', storagePath: '-', status: 'running', operator: '系统自动', logs: '增量备份任务启动...\n数据库增量备份进行中...', errorMsg: '' },
  { id: 1005, type: 'full', scope: '数据库+附件+配置文件', startTime: '2026-04-11 02:00', duration: '16分钟', fileSize: '2.6GB', storagePath: '/data/backup/20260411_full.zip', status: 'success', operator: '管理员', logs: '手动全量备份任务启动...\n数据库备份完成\n附件备份完成\n配置文件备份完成\n备份任务完成', errorMsg: '' }
])

const getStatusType = (status) => {
  const types = {
    'success': 'success',
    'running': 'primary',
    'fail': 'danger',
    'cancelled': 'info'
  }
  return types[status] || ''
}

const getStatusText = (status) => {
  const texts = {
    'success': '成功',
    'running': '执行中',
    'fail': '失败',
    'cancelled': '已取消'
  }
  return texts[status] || status
}

const handleSelectionChange = (selection) => {
  selectedRows.value = selection
}

const handleViewDetail = (row) => {
  currentRecord.value = row
  showDetailDrawer.value = true
}

const handleDownload = (row) => {
  ElMessage.success(`正在下载备份文件：${row.storagePath}`)
}

const handleRestore = (row) => {
  ElMessageBox.confirm(`确定要从备份「${row.startTime}」恢复数据吗？恢复前将自动备份当前数据。`, '数据恢复', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('数据恢复任务已提交，正在后台执行')
  }).catch(() => {})
}

const handleRetry = (row) => {
  ElMessageBox.confirm(`确定要重试失败的备份任务「${row.id}」吗？`, '重试备份', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'info'
  }).then(() => {
    row.status = 'running'
    row.duration = '执行中'
    ElMessage.success('备份任务重试中')
  }).catch(() => {})
}

const handleExport = () => {
  ElMessage.success('备份记录导出成功')
}

const handleRetryAll = () => {
  const failedRecords = backupRecords.value.filter(record => record.status === 'fail')
  if (failedRecords.length === 0) {
    ElMessage.info('没有失败的备份任务需要重试')
    return
  }
  ElMessageBox.confirm(`确定要重试 ${failedRecords.length} 个失败的备份任务吗？`, '批量重试', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'info'
  }).then(() => {
    failedRecords.forEach(record => {
      record.status = 'running'
      record.duration = '执行中'
    })
    ElMessage.success('批量重试任务已提交')
  }).catch(() => {})
}
</script>

<style lang="scss" scoped>
.backup-record {
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
}
</style>
