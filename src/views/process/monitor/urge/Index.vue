<template>
  <div class="urge-management">
    <div class="page-header">
      <h2>流程催办管理</h2>
      <p class="subtitle">监控待办任务的催办情况，支持手动催办和自动催办规则配置</p>
    </div>

    <div class="toolbar">
      <div class="toolbar-left">
        <el-input
            v-model="searchKeyword"
            placeholder="搜索流程名称、申请人"
            clearable
            style="width: 300px"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-select v-model="filterStatus" placeholder="催办状态" clearable style="width: 150px">
          <el-option label="未催办" value="not_urge" />
          <el-option label="已催办" value="urged" />
          <el-option label="已处理" value="handled" />
        </el-select>
        <el-select v-model="filterUrgency" placeholder="紧急程度" clearable style="width: 150px">
          <el-option label="普通" value="normal" />
          <el-option label="紧急" value="urgent" />
          <el-option label="特急" value="very_urgent" />
        </el-select>
        <el-button type="primary" icon="Search" @click="handleSearch">查询</el-button>
        <el-button icon="Refresh" @click="handleReset">重置</el-button>
      </div>
      <div class="toolbar-right">
        <el-button type="warning" icon="Bell" @click="handleBatchUrge">批量催办</el-button>
        <el-button type="success" icon="Download" @click="handleExport">导出列表</el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="statistics-cards">
      <el-card shadow="hover" class="stat-card">
        <div class="stat-content">
          <div class="stat-icon" style="background: #ecf5ff;">
            <el-icon color="#409eff"><Clock /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ statistics.pending }}</div>
            <div class="stat-label">待催办任务</div>
          </div>
        </div>
      </el-card>

      <el-card shadow="hover" class="stat-card">
        <div class="stat-content">
          <div class="stat-icon" style="background: #fef0f0;">
            <el-icon color="#f56c6c"><Bell /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ statistics.urgable }}</div>
            <div class="stat-label">可催办任务</div>
          </div>
        </div>
      </el-card>

      <el-card shadow="hover" class="stat-card">
        <div class="stat-content">
          <div class="stat-icon" style="background: #f4f4f5;">
            <el-icon color="#909399"><Check /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ statistics.todayUrged }}</div>
            <div class="stat-label">今日已催办</div>
          </div>
        </div>
      </el-card>

      <el-card shadow="hover" class="stat-card">
        <div class="stat-content">
          <div class="stat-icon" style="background: #fdf6ec;">
            <el-icon color="#e6a23c"><Warning /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ statistics.overdue }}</div>
            <div class="stat-label">超时未处理</div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 数据表格 -->
    <el-table
        :data="filteredTaskList"
        border
        style="width: 100%; margin-top: 16px;"
        v-loading="loading"
        @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column prop="processName" label="流程名称" min-width="180" />
      <el-table-column prop="billNo" label="单据编号" width="150" />
      <el-table-column prop="applicant" label="申请人" width="120" />
      <el-table-column prop="currentNode" label="当前节点" min-width="150" />
      <el-table-column prop="assignee" label="当前审批人" width="120" />
      <el-table-column prop="stayDuration" label="停留时长" width="120" align="center">
        <template #default="{ row }">
          <el-tag size="small" :type="getDurationTag(row.stayHours)">
            {{ row.stayDuration }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="urgency" label="紧急程度" width="100" align="center">
        <template #default="{ row }">
          <el-tag size="small" :type="getUrgencyTag(row.urgency)">
            {{ getUrgencyText(row.urgency) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="urgeCount" label="催办次数" width="100" align="center" />
      <el-table-column prop="lastUrgeTime" label="最后催办时间" width="180" />
      <el-table-column label="操作" width="220" align="center" fixed="right">
        <template #default="{ row }">
          <div class="action-buttons">
            <el-button
                size="small"
                type="warning"
                icon="Bell"
                @click="handleUrge(row)"
                :disabled="row.status === 'handled'"
            >
              催办
            </el-button>
            <el-button size="small" type="primary" icon="View" @click="handleView(row)">详情</el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-bar">
      <span>共 {{ filteredTaskList.length }} 条记录</span>
      <el-pagination
          layout="total, sizes, prev, pager, next, jumper"
          :total="filteredTaskList.length"
          :page-sizes="[10, 20, 50]"
          v-model:page-size="pageSize"
          v-model:current-page="currentPage"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
      />
    </div>

    <!-- 催办对话框 -->
    <el-dialog
        v-model="urgeDialogVisible"
        title="发送催办通知"
        width="600px"
        :close-on-click-modal="false"
    >
      <el-form :model="urgeForm" label-width="100px">
        <el-form-item label="流程名称">
          <el-input v-model="urgeForm.processName" disabled />
        </el-form-item>

        <el-form-item label="单据编号">
          <el-input v-model="urgeForm.billNo" disabled />
        </el-form-item>

        <el-form-item label="当前审批人">
          <el-input v-model="urgeForm.assignee" disabled />
        </el-form-item>

        <el-form-item label="催办方式">
          <el-checkbox-group v-model="urgeForm.notifyMethods">
            <el-checkbox label="system">系统通知</el-checkbox>
            <el-checkbox label="email">邮件通知</el-checkbox>
            <el-checkbox label="sms">短信通知</el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <el-form-item label="催办内容" prop="urgeContent">
          <el-input
              v-model="urgeForm.urgeContent"
              type="textarea"
              :rows="4"
              placeholder="请输入催办内容"
          />
        </el-form-item>

        <el-form-item label="紧急程度">
          <el-radio-group v-model="urgeForm.urgencyLevel">
            <el-radio label="normal">普通</el-radio>
            <el-radio label="urgent">紧急</el-radio>
            <el-radio label="very_urgent">特急</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="urgeDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmUrge" :loading="sending">发送催办</el-button>
      </template>
    </el-dialog>

    <!-- 详情对话框 -->
    <el-dialog
        v-model="detailVisible"
        title="任务详情"
        width="700px"
        :close-on-click-modal="false"
    >
      <el-descriptions :column="1" border v-if="currentTask">
        <el-descriptions-item label="流程名称">{{ currentTask.processName }}</el-descriptions-item>
        <el-descriptions-item label="单据编号">{{ currentTask.billNo }}</el-descriptions-item>
        <el-descriptions-item label="申请人">{{ currentTask.applicant }}</el-descriptions-item>
        <el-descriptions-item label="申请时间">{{ currentTask.applyTime }}</el-descriptions-item>
        <el-descriptions-item label="当前节点">{{ currentTask.currentNode }}</el-descriptions-item>
        <el-descriptions-item label="当前审批人">{{ currentTask.assignee }}</el-descriptions-item>
        <el-descriptions-item label="停留时长">{{ currentTask.stayDuration }}</el-descriptions-item>
        <el-descriptions-item label="紧急程度">
          <el-tag :type="getUrgencyTag(currentTask.urgency)">
            {{ getUrgencyText(currentTask.urgency) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="催办次数">{{ currentTask.urgeCount }}</el-descriptions-item>
        <el-descriptions-item label="最后催办时间">{{ currentTask.lastUrgeTime || '-' }}</el-descriptions-item>
        <el-descriptions-item label="催办历史" v-if="currentTask.urgeHistory && currentTask.urgeHistory.length > 0">
          <div v-for="(history, index) in currentTask.urgeHistory" :key="index" class="urge-history-item">
            <el-tag size="small">{{ history.time }}</el-tag>
            <span>{{ history.content }}</span>
          </div>
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
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Bell, Download, Clock, Check, Warning, View } from '@element-plus/icons-vue'

const searchKeyword = ref('')
const filterStatus = ref('')
const filterUrgency = ref('')
const loading = ref(false)
const sending = ref(false)

// 统计数据
const statistics = ref({
  pending: 28,
  urgable: 15,
  todayUrged: 8,
  overdue: 5
})

// 任务列表
const taskList = ref([
  {
    id: 1,
    processName: '请假审批流程',
    billNo: 'QJ20240408001',
    applicant: '张三',
    applyTime: '2024-04-05 09:00:00',
    currentNode: '部门经理审批',
    assignee: '李四',
    stayHours: 72,
    stayDuration: '3天',
    urgency: 'urgent',
    urgeCount: 2,
    lastUrgeTime: '2024-04-07 14:30:00',
    status: 'not_urge',
    urgeHistory: [
      { time: '2024-04-06 10:00:00', content: '系统自动催办' },
      { time: '2024-04-07 14:30:00', content: '管理员手动催办' }
    ]
  },
  {
    id: 2,
    processName: '费用报销流程',
    billNo: 'BX20240408002',
    applicant: '王五',
    applyTime: '2024-04-06 10:30:00',
    currentNode: '财务经理审批',
    assignee: '赵六',
    stayHours: 48,
    stayDuration: '2天',
    urgency: 'normal',
    urgeCount: 1,
    lastUrgeTime: '2024-04-07 16:00:00',
    status: 'urged',
    urgeHistory: [
      { time: '2024-04-07 16:00:00', content: '申请人发起催办' }
    ]
  },
  {
    id: 3,
    processName: '加班审批流程',
    billNo: 'JB20240408003',
    applicant: '孙七',
    applyTime: '2024-04-07 14:00:00',
    currentNode: 'HR备案',
    assignee: '周八',
    stayHours: 24,
    stayDuration: '1天',
    urgency: 'normal',
    urgeCount: 0,
    lastUrgeTime: '',
    status: 'not_urge',
    urgeHistory: []
  },
  {
    id: 4,
    processName: '会议申请流程',
    billNo: 'HY20240408004',
    applicant: '吴九',
    applyTime: '2024-04-03 09:00:00',
    currentNode: '总经理审批',
    assignee: '郑十',
    stayHours: 120,
    stayDuration: '5天',
    urgency: 'very_urgent',
    urgeCount: 3,
    lastUrgeTime: '2024-04-08 09:00:00',
    status: 'not_urge',
    urgeHistory: [
      { time: '2024-04-05 10:00:00', content: '系统自动催办' },
      { time: '2024-04-06 15:00:00', content: '管理员手动催办' },
      { time: '2024-04-08 09:00:00', content: '申请人再次催办' }
    ]
  },
  {
    id: 5,
    processName: '车辆申请流程',
    billNo: 'CL20240408005',
    applicant: '冯十一',
    applyTime: '2024-04-07 16:00:00',
    currentNode: '车队队长审批',
    assignee: '陈十二',
    stayHours: 18,
    stayDuration: '18小时',
    urgency: 'normal',
    urgeCount: 0,
    lastUrgeTime: '',
    status: 'not_urge',
    urgeHistory: []
  },
  {
    id: 6,
    processName: '请假审批流程',
    billNo: 'QJ20240408006',
    applicant: '褚十三',
    applyTime: '2024-04-02 09:00:00',
    currentNode: '部门经理审批',
    assignee: '卫十四',
    stayHours: 144,
    stayDuration: '6天',
    urgency: 'urgent',
    urgeCount: 4,
    lastUrgeTime: '2024-04-08 10:00:00',
    status: 'handled',
    urgeHistory: [
      { time: '2024-04-04 10:00:00', content: '系统自动催办' },
      { time: '2024-04-05 14:00:00', content: '管理员催办' },
      { time: '2024-04-07 09:00:00', content: '申请人催办' },
      { time: '2024-04-08 10:00:00', content: '上级督办' }
    ]
  }
])

const pageSize = ref(10)
const currentPage = ref(1)
const selectedTasks = ref([])

// 筛选后的列表
const filteredTaskList = computed(() => {
  let result = [...taskList.value]

  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(task =>
        task.processName.toLowerCase().includes(keyword) ||
        task.applicant.toLowerCase().includes(keyword)
    )
  }

  if (filterStatus.value) {
    result = result.filter(task => task.status === filterStatus.value)
  }

  if (filterUrgency.value) {
    result = result.filter(task => task.urgency === filterUrgency.value)
  }

  return result
})

// 催办对话框
const urgeDialogVisible = ref(false)
const urgeForm = ref({
  processName: '',
  billNo: '',
  assignee: '',
  notifyMethods: ['system'],
  urgeContent: '您好，您有一个待办任务需要及时处理，请尽快完成审批。',
  urgencyLevel: 'normal'
})

// 详情对话框
const detailVisible = ref(false)
const currentTask = ref(null)

// 搜索
const handleSearch = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    ElMessage.success('查询完成')
  }, 500)
}

// 重置
const handleReset = () => {
  searchKeyword.value = ''
  filterStatus.value = ''
  filterUrgency.value = ''
  currentPage.value = 1
  ElMessage.success('已重置查询条件')
}

// 单个催办
const handleUrge = (row) => {
  urgeForm.value = {
    processName: row.processName,
    billNo: row.billNo,
    assignee: row.assignee,
    notifyMethods: ['system'],
    urgeContent: `您好，您有一个待办任务需要及时处理。\n\n流程名称：${row.processName}\n单据编号：${row.billNo}\n申请人：${row.applicant}\n\n请尽快完成审批。`,
    urgencyLevel: row.urgency
  }
  urgeDialogVisible.value = true
}

// 确认催办
const handleConfirmUrge = () => {
  sending.value = true

  setTimeout(() => {
    // 更新任务信息
    const task = taskList.value.find(t => t.billNo === urgeForm.value.billNo)
    if (task) {
      task.urgeCount++
      task.lastUrgeTime = new Date().toLocaleString('zh-CN')
      task.status = 'urged'

      if (!task.urgeHistory) {
        task.urgeHistory = []
      }
      task.urgeHistory.push({
        time: task.lastUrgeTime,
        content: '管理员手动催办'
      })
    }

    sending.value = false
    urgeDialogVisible.value = false

    // 更新统计
    statistics.value.todayUrged++

    ElMessage.success('催办通知已发送')
  }, 800)
}

// 批量催办
const handleBatchUrge = () => {
  if (selectedTasks.value.length === 0) {
    ElMessage.warning('请先选择要催办的任务')
    return
  }

  ElMessageBox.confirm(
      `确定要对选中的 ${selectedTasks.value.length} 个任务发送催办通知吗？`,
      '批量催办确认',
      {
        confirmButtonText: '确认催办',
        cancelButtonText: '取消',
        type: 'warning'
      }
  ).then(() => {
    selectedTasks.value.forEach(task => {
      task.urgeCount++
      task.lastUrgeTime = new Date().toLocaleString('zh-CN')
      task.status = 'urged'
    })

    statistics.value.todayUrged += selectedTasks.value.length
    ElMessage.success(`已成功催办 ${selectedTasks.value.length} 个任务`)
  }).catch(() => {})
}

// 查看详情
const handleView = (row) => {
  currentTask.value = { ...row }
  detailVisible.value = true
}

// 导出
const handleExport = () => {
  ElMessage.success('导出功能开发中...')
}

// 选择变化
const handleSelectionChange = (selection) => {
  selectedTasks.value = selection
}

// 分页相关
const handleSizeChange = (size) => {
  pageSize.value = size
}

const handleCurrentChange = (page) => {
  currentPage.value = page
}

// 工具方法
const getDurationTag = (hours) => {
  if (hours >= 72) return 'danger'
  if (hours >= 48) return 'warning'
  if (hours >= 24) return ''
  return 'success'
}

const getUrgencyTag = (urgency) => {
  const tags = { normal: 'info', urgent: 'warning', very_urgent: 'danger' }
  return tags[urgency] || 'info'
}

const getUrgencyText = (urgency) => {
  const texts = { normal: '普通', urgent: '紧急', very_urgent: '特急' }
  return texts[urgency] || urgency
}
</script>

<style scoped lang="scss">
.urge-management {
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

  .statistics-cards {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 16px;

    .stat-card {
      :deep(.el-card__body) {
        padding: 16px;
      }

      .stat-content {
        display: flex;
        align-items: center;
        gap: 16px;

        .stat-icon {
          width: 60px;
          height: 60px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;

          .el-icon {
            font-size: 28px;
          }
        }

        .stat-info {
          flex: 1;

          .stat-value {
            font-size: 28px;
            font-weight: bold;
            color: #303133;
            line-height: 1;
            margin-bottom: 8px;
          }

          .stat-label {
            font-size: 13px;
            color: #909399;
          }
        }
      }
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

  .urge-history-item {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;

    &:last-child {
      margin-bottom: 0;
    }
  }
}
</style>
