<template>
  <div class="data-trace">
    <el-card shadow="never" class="trace-card">
      <template #header>
        <div class="card-header">
          <span>数据溯源查询</span>
          <span class="header-tip">支持按会议ID、发起人、会议室等条件查询单条会议全流程数据</span>
        </div>
      </template>

      <!-- 查询条件 -->
      <el-form :model="queryForm" :inline="true" class="query-form">
        <el-form-item label="会议ID">
          <el-input
              v-model="queryForm.meetingId"
              placeholder="请输入会议ID"
              clearable
              style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="会议主题">
          <el-input
              v-model="queryForm.subject"
              placeholder="请输入会议主题"
              clearable
              style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="发起人">
          <el-input
              v-model="queryForm.initiator"
              placeholder="请输入发起人姓名"
              clearable
              style="width: 150px"
          />
        </el-form-item>
        <el-form-item label="会议室">
          <el-select
              v-model="queryForm.roomId"
              placeholder="选择会议室"
              clearable
              style="width: 180px"
          >
            <el-option label="3楼大会议室" value="room_001" />
            <el-option label="2楼中会议室" value="room_002" />
            <el-option label="1楼小会议室A" value="room_003" />
            <el-option label="4楼培训室" value="room_004" />
          </el-select>
        </el-form-item>
        <el-form-item label="会议时间">
          <el-date-picker
              v-model="queryForm.meetingTime"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              style="width: 240px"
          />
        </el-form-item>
        <el-form-item label="会议类型">
          <el-select
              v-model="queryForm.meetingType"
              placeholder="选择类型"
              clearable
              style="width: 140px"
          >
            <el-option label="部门例会" value="dept_meeting" />
            <el-option label="项目评审" value="project_review" />
            <el-option label="培训会议" value="training" />
            <el-option label="高管会议" value="executive" />
            <el-option label="涉密会议" value="classified" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleQuery">
            查询
          </el-button>
          <el-button :icon="Refresh" @click="handleReset">
            重置
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 查询结果表格 -->
      <el-table
          v-loading="loading"
          :data="tableData"
          border
          stripe
          style="width: 100%; margin-top: 16px"
          @row-click="handleRowClick"
      >
        <el-table-column prop="meetingId" label="会议ID" width="120" fixed />
        <el-table-column prop="subject" label="会议主题" min-width="180" show-overflow-tooltip />
        <el-table-column prop="initiator" label="发起人" width="100" />
        <el-table-column prop="department" label="所属部门" width="100" />
        <el-table-column prop="roomName" label="会议室" width="120" />
        <el-table-column prop="meetingTime" label="会议时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.startTime) }} ~ {{ formatTime(row.endTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="meetingType" label="会议类型" width="110">
          <template #default="{ row }">
            <el-tag :type="getMeetingTypeTag(row.meetingType)" size="small">
              {{ getMeetingTypeName(row.meetingType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="approvalStatus" label="审批状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getApprovalType(row.approvalStatus)" size="small">
              {{ getApprovalText(row.approvalStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="minutesStatus" label="纪要状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.minutesStatus === 'completed'" type="success" size="small">
              已提交
            </el-tag>
            <el-tag v-else-if="row.minutesStatus === 'pending'" type="warning" size="small">
              待提交
            </el-tag>
            <el-tag v-else type="info" size="small">
              无需纪要
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right" align="center">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click.stop="handleViewDetail(row)">
              查看详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
            v-model:current-page="pagination.page"
            v-model:page-size="pagination.pageSize"
            :total="pagination.total"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <!-- 详情对话框 -->
    <el-dialog
        v-model="detailVisible"
        title="会议全流程数据详情"
        width="80%"
        :close-on-click-modal="false"
    >
      <div v-if="currentMeeting" class="detail-content">
        <el-descriptions title="基本信息" :column="3" border>
          <el-descriptions-item label="会议ID">{{ currentMeeting.meetingId }}</el-descriptions-item>
          <el-descriptions-item label="会议主题">{{ currentMeeting.subject }}</el-descriptions-item>
          <el-descriptions-item label="会议类型">
            <el-tag :type="getMeetingTypeTag(currentMeeting.meetingType)" size="small">
              {{ getMeetingTypeName(currentMeeting.meetingType) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="发起人">{{ currentMeeting.initiator }}</el-descriptions-item>
          <el-descriptions-item label="所属部门">{{ currentMeeting.department }}</el-descriptions-item>
          <el-descriptions-item label="会议室">{{ currentMeeting.roomName }}</el-descriptions-item>
          <el-descriptions-item label="会议时间" :span="3">
            {{ formatDateTime(currentMeeting.startTime) }} ~ {{ formatTime(currentMeeting.endTime) }}
          </el-descriptions-item>
          <el-descriptions-item label="会议形式">
            {{ getFormText(currentMeeting.form) }}
          </el-descriptions-item>
          <el-descriptions-item label="参会人数">{{ currentMeeting.attendeeCount }}人</el-descriptions-item>
          <el-descriptions-item label="实际参会">{{ currentMeeting.actualAttendee }}人</el-descriptions-item>
        </el-descriptions>

        <el-divider />

        <el-descriptions title="审批信息" :column="2" border>
          <el-descriptions-item label="审批状态">
            <el-tag :type="getApprovalType(currentMeeting.approvalStatus)" size="small">
              {{ getApprovalText(currentMeeting.approvalStatus) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="审批人">{{ currentMeeting.approver || '-' }}</el-descriptions-item>
          <el-descriptions-item label="审批时间">{{ currentMeeting.approvalTime || '-' }}</el-descriptions-item>
          <el-descriptions-item label="审批意见">{{ currentMeeting.approvalComment || '-' }}</el-descriptions-item>
        </el-descriptions>

        <el-divider />

        <el-descriptions title="参会情况" :column="3" border>
          <el-descriptions-item label="应到人数">{{ currentMeeting.attendeeCount }}人</el-descriptions-item>
          <el-descriptions-item label="实到人数">{{ currentMeeting.actualAttendee }}人</el-descriptions-item>
          <el-descriptions-item label="参会率">
            <el-progress
                :percentage="calculateAttendanceRate()"
                :color="getProgressColor(calculateAttendanceRate())"
            />
          </el-descriptions-item>
          <el-descriptions-item label="迟到人数">{{ currentMeeting.lateCount || 0 }}人</el-descriptions-item>
          <el-descriptions-item label="缺席人数">{{ currentMeeting.absentCount || 0 }}人</el-descriptions-item>
          <el-descriptions-item label="请假人数">{{ currentMeeting.leaveCount || 0 }}人</el-descriptions-item>
        </el-descriptions>

        <el-divider />

        <el-descriptions title="会议纪要" :column="2" border>
          <el-descriptions-item label="纪要状态">
            <el-tag v-if="currentMeeting.minutesStatus === 'completed'" type="success" size="small">
              已提交
            </el-tag>
            <el-tag v-else-if="currentMeeting.minutesStatus === 'pending'" type="warning" size="small">
              待提交
            </el-tag>
            <el-tag v-else type="info" size="small">
              无需纪要
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="提交人">{{ currentMeeting.minutesSubmitter || '-' }}</el-descriptions-item>
          <el-descriptions-item label="提交时间">{{ currentMeeting.minutesSubmitTime || '-' }}</el-descriptions-item>
          <el-descriptions-item label="待办事项">{{ currentMeeting.todoCount || 0 }}项</el-descriptions-item>
        </el-descriptions>

        <el-divider />

        <el-descriptions title="操作日志" :column="1" border>
          <el-descriptions-item label="操作记录">
            <el-timeline>
              <el-timeline-item
                  v-for="(log, index) in currentMeeting.operationLogs"
                  :key="index"
                  :timestamp="log.time"
                  placement="top"
              >
                {{ log.action }} - {{ log.operator }}
              </el-timeline-item>
            </el-timeline>
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
        <el-button type="primary" @click="handleExportDetail">导出明细</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { Search, Refresh } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'

const loading = ref(false)
const detailVisible = ref(false)
const currentMeeting = ref(null)

const queryForm = reactive({
  meetingId: '',
  subject: '',
  initiator: '',
  roomId: '',
  meetingTime: [],
  meetingType: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const tableData = ref([
  {
    meetingId: 'MTG20260415001',
    subject: 'Q2产品研发进度评审会',
    initiator: '张三',
    department: '研发部',
    roomName: '3楼大会议室',
    startTime: '2026-04-15 14:00:00',
    endTime: '2026-04-15 16:00:00',
    meetingType: 'project_review',
    form: 'offline',
    status: 'completed',
    approvalStatus: 'approved',
    minutesStatus: 'completed',
    attendeeCount: 12,
    actualAttendee: 11,
    lateCount: 1,
    absentCount: 0,
    leaveCount: 1,
    approver: '李四',
    approvalTime: '2026-04-14 10:30:00',
    approvalComment: '同意',
    minutesSubmitter: '王五',
    minutesSubmitTime: '2026-04-15 17:00:00',
    todoCount: 5,
    operationLogs: [
      { time: '2026-04-13 09:00:00', action: '创建会议', operator: '张三' },
      { time: '2026-04-13 09:05:00', action: '提交审批', operator: '张三' },
      { time: '2026-04-14 10:30:00', action: '审批通过', operator: '李四' },
      { time: '2026-04-15 14:00:00', action: '会议开始', operator: '系统' },
      { time: '2026-04-15 16:00:00', action: '会议结束', operator: '系统' },
      { time: '2026-04-15 17:00:00', action: '提交纪要', operator: '王五' }
    ]
  },
  {
    meetingId: 'MTG20260415002',
    subject: '市场部周例会',
    initiator: '赵六',
    department: '市场部',
    roomName: '2楼中会议室',
    startTime: '2026-04-15 10:00:00',
    endTime: '2026-04-15 11:00:00',
    meetingType: 'dept_meeting',
    form: 'offline',
    status: 'completed',
    approvalStatus: 'no_approval',
    minutesStatus: 'completed',
    attendeeCount: 8,
    actualAttendee: 8,
    lateCount: 0,
    absentCount: 0,
    leaveCount: 0,
    approver: null,
    approvalTime: null,
    approvalComment: null,
    minutesSubmitter: '赵六',
    minutesSubmitTime: '2026-04-15 11:30:00',
    todoCount: 3,
    operationLogs: [
      { time: '2026-04-14 16:00:00', action: '创建会议', operator: '赵六' },
      { time: '2026-04-15 10:00:00', action: '会议开始', operator: '系统' },
      { time: '2026-04-15 11:00:00', action: '会议结束', operator: '系统' },
      { time: '2026-04-15 11:30:00', action: '提交纪要', operator: '赵六' }
    ]
  }
])

const handleQuery = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    ElMessage.success('查询成功')
  }, 500)
}

const handleReset = () => {
  queryForm.meetingId = ''
  queryForm.subject = ''
  queryForm.initiator = ''
  queryForm.roomId = ''
  queryForm.meetingTime = []
  queryForm.meetingType = ''
  handleQuery()
}

const handleRowClick = (row) => {
  currentMeeting.value = row
  detailVisible.value = true
}

const handleViewDetail = (row) => {
  currentMeeting.value = row
  detailVisible.value = true
}

const handleExportDetail = () => {
  ElMessage.success('正在导出会议明细数据...')
  // TODO: 实现导出逻辑
}

const handleSizeChange = (size) => {
  pagination.pageSize = size
  handleQuery()
}

const handlePageChange = (page) => {
  pagination.page = page
  handleQuery()
}

const formatDateTime = (datetime) => {
  if (!datetime) return '-'
  return dayjs(datetime).format('YYYY-MM-DD HH:mm')
}

const formatTime = (datetime) => {
  if (!datetime) return '-'
  return dayjs(datetime).format('HH:mm')
}

const getMeetingTypeName = (type) => {
  const typeMap = {
    dept_meeting: '部门例会',
    project_review: '项目评审',
    training: '培训会议',
    executive: '高管会议',
    classified: '涉密会议',
    external: '外部客户会议',
    temporary: '临时会议'
  }
  return typeMap[type] || type
}

const getMeetingTypeTag = (type) => {
  const tagMap = {
    dept_meeting: '',
    project_review: 'success',
    training: 'warning',
    executive: 'danger',
    classified: 'info',
    external: '',
    temporary: ''
  }
  return tagMap[type] || ''
}

const getStatusText = (status) => {
  const statusMap = {
    pending: '待召开',
    ongoing: '进行中',
    completed: '已结束',
    cancelled: '已取消',
    postponed: '已延期'
  }
  return statusMap[status] || status
}

const getStatusType = (status) => {
  const typeMap = {
    pending: 'info',
    ongoing: 'warning',
    completed: 'success',
    cancelled: 'danger',
    postponed: 'info'
  }
  return typeMap[status] || ''
}

const getApprovalText = (status) => {
  const statusMap = {
    pending: '待审批',
    approved: '已通过',
    rejected: '已驳回',
    no_approval: '无需审批'
  }
  return statusMap[status] || status
}

const getApprovalType = (status) => {
  const typeMap = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger',
    no_approval: 'info'
  }
  return typeMap[status] || ''
}

const getFormText = (form) => {
  const formMap = {
    offline: '线下会议',
    online: '线上会议',
    hybrid: '混合会议'
  }
  return formMap[form] || form
}

const calculateAttendanceRate = () => {
  if (!currentMeeting.value) return 0
  const { attendeeCount, actualAttendee } = currentMeeting.value
  return attendeeCount > 0 ? Math.round((actualAttendee / attendeeCount) * 100) : 0
}

const getProgressColor = (percentage) => {
  if (percentage >= 90) return '#67c23a'
  if (percentage >= 70) return '#e6a23c'
  return '#f56c6c'
}
</script>

<style lang="scss" scoped>
.data-trace {
  .trace-card {
    :deep(.el-card__header) {
      padding: 12px 16px;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 14px;
      font-weight: 600;
      color: #303133;

      .header-tip {
        font-size: 12px;
        color: #909399;
        font-weight: normal;
      }
    }

    .query-form {
      margin-bottom: 0;
    }

    .pagination-container {
      margin-top: 16px;
      display: flex;
      justify-content: flex-end;
    }
  }

  .detail-content {
    max-height: 600px;
    overflow-y: auto;
  }
}
</style>
