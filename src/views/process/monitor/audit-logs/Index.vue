<template>
  <div class="audit-logs">
    <div class="page-header">
      <h2>流程审计日志</h2>
      <p class="subtitle">记录流程的所有操作行为，支持追溯和审计</p>
    </div>

    <div class="toolbar">
      <div class="toolbar-left">
        <el-input
            v-model="searchKeyword"
            placeholder="搜索操作人、流程名称"
            clearable
            style="width: 300px"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-select v-model="filterAction" placeholder="操作类型" clearable style="width: 150px">
          <el-option label="发起流程" value="start" />
          <el-option label="审批通过" value="approve" />
          <el-option label="审批驳回" value="reject" />
          <el-option label="撤回" value="withdraw" />
          <el-option label="转交" value="transfer" />
        </el-select>
        <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 240px"
        />
        <el-button type="primary" icon="Search" @click="handleSearch">查询</el-button>
        <el-button icon="Refresh" @click="handleReset">重置</el-button>
      </div>
      <div class="toolbar-right">
        <el-button type="success" icon="Download" @click="handleExport">导出日志</el-button>
      </div>
    </div>

    <el-table
        :data="filteredLogList"
        border
        style="width: 100%"
        v-loading="loading"
    >
      <el-table-column prop="logId" label="日志ID" width="100" align="center" />
      <el-table-column prop="processName" label="流程名称" min-width="180" />
      <el-table-column prop="billNo" label="单据编号" width="150" />
      <el-table-column prop="actionType" label="操作类型" width="120">
        <template #default="{ row }">
          <el-tag size="small" :type="getActionTag(row.actionType)">
            {{ getActionText(row.actionType) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="operator" label="操作人" width="120" />
      <el-table-column prop="nodeName" label="节点名称" min-width="150" />
      <el-table-column prop="actionResult" label="操作结果" width="100" align="center">
        <template #default="{ row }">
          <el-tag size="small" :type="row.actionResult === 'success' ? 'success' : 'danger'">
            {{ row.actionResult === 'success' ? '成功' : '失败' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="ipAddress" label="IP地址" width="140" />
      <el-table-column prop="operateTime" label="操作时间" width="180" />
      <el-table-column label="操作" width="100" align="center" fixed="right">
        <template #default="{ row }">
          <el-button size="small" type="primary" icon="View" @click="handleViewDetail(row)">详情</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-bar">
      <span>共 {{ filteredLogList.length }} 条记录</span>
      <el-pagination
          layout="total, sizes, prev, pager, next, jumper"
          :total="filteredLogList.length"
          :page-sizes="[10, 20, 50, 100]"
          v-model:page-size="pageSize"
          v-model:current-page="currentPage"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
      />
    </div>

    <!-- 详情对话框 -->
    <el-dialog
        v-model="detailVisible"
        title="日志详情"
        width="700px"
        :close-on-click-modal="false"
    >
      <el-descriptions :column="1" border v-if="currentLog">
        <el-descriptions-item label="日志ID">{{ currentLog.logId }}</el-descriptions-item>
        <el-descriptions-item label="流程名称">{{ currentLog.processName }}</el-descriptions-item>
        <el-descriptions-item label="单据编号">{{ currentLog.billNo }}</el-descriptions-item>
        <el-descriptions-item label="操作类型">
          <el-tag :type="getActionTag(currentLog.actionType)">
            {{ getActionText(currentLog.actionType) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="操作人">{{ currentLog.operator }}</el-descriptions-item>
        <el-descriptions-item label="节点名称">{{ currentLog.nodeName }}</el-descriptions-item>
        <el-descriptions-item label="操作结果">
          <el-tag :type="currentLog.actionResult === 'success' ? 'success' : 'danger'">
            {{ currentLog.actionResult === 'success' ? '成功' : '失败' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="IP地址">{{ currentLog.ipAddress }}</el-descriptions-item>
        <el-descriptions-item label="操作时间">{{ currentLog.operateTime }}</el-descriptions-item>
        <el-descriptions-item label="操作详情">{{ currentLog.detail || '-' }}</el-descriptions-item>
        <el-descriptions-item label="请求参数">
          <pre class="json-content">{{ JSON.stringify(currentLog.requestParams, null, 2) }}</pre>
        </el-descriptions-item>
      </el-descriptions>

      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Refresh, Download, View } from '@element-plus/icons-vue'

const searchKeyword = ref('')
const filterAction = ref('')
const dateRange = ref([])
const loading = ref(false)

const logList = ref([
  {
    logId: 1001,
    processName: '请假审批流程',
    billNo: 'QJ20240408001',
    actionType: 'start',
    operator: '张三',
    nodeName: '发起节点',
    actionResult: 'success',
    ipAddress: '192.168.1.100',
    operateTime: '2024-04-08 09:00:00',
    detail: '发起请假申请，请假天数：3天',
    requestParams: { leaveType: '事假', days: 3, reason: '个人事务' }
  },
  {
    logId: 1002,
    processName: '请假审批流程',
    billNo: 'QJ20240408001',
    actionType: 'approve',
    operator: '李四（部门经理）',
    nodeName: '部门经理审批',
    actionResult: 'success',
    ipAddress: '192.168.1.101',
    operateTime: '2024-04-08 10:30:00',
    detail: '审批通过',
    requestParams: { opinion: '同意', approved: true }
  },
  {
    logId: 1003,
    processName: '费用报销流程',
    billNo: 'BX20240408002',
    actionType: 'reject',
    operator: '王五（财务经理）',
    nodeName: '财务审核',
    actionResult: 'success',
    ipAddress: '192.168.1.102',
    operateTime: '2024-04-08 11:15:00',
    detail: '审批驳回：发票不全',
    requestParams: { opinion: '驳回，请补充发票', approved: false }
  },
  {
    logId: 1004,
    processName: '加班审批流程',
    billNo: 'JB20240408003',
    actionType: 'withdraw',
    operator: '赵六',
    nodeName: '发起节点',
    actionResult: 'success',
    ipAddress: '192.168.1.103',
    operateTime: '2024-04-08 14:20:00',
    detail: '撤回加班申请',
    requestParams: { reason: '计划变更' }
  },
  {
    logId: 1005,
    processName: '会议申请流程',
    billNo: 'HY20240408004',
    actionType: 'transfer',
    operator: '孙七（部门经理）',
    nodeName: '部门经理审批',
    actionResult: 'success',
    ipAddress: '192.168.1.104',
    operateTime: '2024-04-08 15:45:00',
    detail: '转交给副经理审批',
    requestParams: { transferTo: '周八', reason: '外出开会' }
  },
  {
    logId: 1006,
    processName: '请假审批流程',
    billNo: 'QJ20240408005',
    actionType: 'approve',
    operator: '系统',
    nodeName: '自动审批',
    actionResult: 'failed',
    ipAddress: '127.0.0.1',
    operateTime: '2024-04-08 16:00:00',
    detail: '自动审批失败：审批人未配置',
    requestParams: { error: 'Approver not configured' }
  }
])

const pageSize = ref(10)
const currentPage = ref(1)

const filteredLogList = computed(() => {
  let result = [...logList.value]

  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(log =>
        log.operator.toLowerCase().includes(keyword) ||
        log.processName.toLowerCase().includes(keyword)
    )
  }

  if (filterAction.value) {
    result = result.filter(log => log.actionType === filterAction.value)
  }

  return result
})

const detailVisible = ref(false)
const currentLog = ref(null)

const handleSearch = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    ElMessage.success('查询完成')
  }, 500)
}

const handleReset = () => {
  searchKeyword.value = ''
  filterAction.value = ''
  dateRange.value = []
  currentPage.value = 1
  ElMessage.success('已重置查询条件')
}

const handleViewDetail = (row) => {
  currentLog.value = { ...row }
  detailVisible.value = true
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

const getActionTag = (type) => {
  const tags = {
    start: 'success',
    approve: 'success',
    reject: 'danger',
    withdraw: 'warning',
    transfer: 'info'
  }
  return tags[type] || 'info'
}

const getActionText = (type) => {
  const texts = {
    start: '发起流程',
    approve: '审批通过',
    reject: '审批驳回',
    withdraw: '撤回',
    transfer: '转交'
  }
  return texts[type] || type
}
</script>

<style scoped lang="scss">
.audit-logs {
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

  .pagination-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 16px;
    padding: 12px 0;
  }

  .json-content {
    background: #f5f7fa;
    padding: 12px;
    border-radius: 4px;
    font-size: 12px;
    max-height: 200px;
    overflow-y: auto;
    margin: 0;
  }
}
</style>
