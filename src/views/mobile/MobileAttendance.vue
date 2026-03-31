<template>
  <div class="mobile-attendance-page">
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card class="clock-card">
          <template #header>
            <span>考勤打卡</span>
          </template>
          <div class="clock-content">
            <div class="current-time">
              {{ currentTime }}
            </div>
            <div class="attendance-status">
              <el-tag :type="todayStatus.type" size="large">
                {{ todayStatus.text }}
              </el-tag>
            </div>
            <div class="clock-actions">
              <el-button
                  v-if="!todayAttendance.onDuty"
                  type="primary"
                  size="large"
                  :loading="clocking"
                  @click="handleOnDuty"
              >
                <el-icon><VideoCamera /></el-icon>
                上班打卡
              </el-button>
              <el-button
                  v-if="todayAttendance.onDuty && !todayAttendance.offDuty"
                  type="success"
                  size="large"
                  :loading="clocking"
                  @click="handleOffDuty"
              >
                <el-icon><VideoCamera /></el-icon>
                下班打卡
              </el-button>
              <div v-if="todayAttendance.onDuty && todayAttendance.offDuty" class="clocked-info">
                <p>上班：{{ todayAttendance.onDutyTime }}</p>
                <p>下班：{{ todayAttendance.offDutyTime }}</p>
              </div>
            </div>
            <el-alert
                v-if="todayAttendance.onDuty && !todayAttendance.offDuty"
                title="已上班打卡，记得下班打卡哦！"
                type="success"
                :closable="false"
                show-icon
                style="margin-top: 20px"
            />
          </div>
        </el-card>

        <el-card class="stats-card" style="margin-top: 20px">
          <template #header>
            <span>本月统计</span>
          </template>
          <div class="stats-content">
            <el-row :gutter="20">
              <el-col :span="8">
                <div class="stat-item">
                  <div class="stat-value">{{ stats.normalDays }}</div>
                  <div class="stat-label">正常</div>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="stat-item">
                  <div class="stat-value">{{ stats.lateDays }}</div>
                  <div class="stat-label">迟到</div>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="stat-item">
                  <div class="stat-value">{{ stats.earlyDays }}</div>
                  <div class="stat-label">早退</div>
                </div>
              </el-col>
            </el-row>
            <el-row :gutter="20" style="margin-top: 15px">
              <el-col :span="8">
                <div class="stat-item">
                  <div class="stat-value">{{ stats.absentDays }}</div>
                  <div class="stat-label">缺卡</div>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="stat-item">
                  <div class="stat-value">{{ stats.leaveDays }}</div>
                  <div class="stat-label">请假</div>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="stat-item">
                  <div class="stat-value">{{ stats.businessDays }}</div>
                  <div class="stat-label">出差</div>
                </div>
              </el-col>
            </el-row>
          </div>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card class="records-card">
          <template #header>
            <div class="card-header">
              <span>打卡记录</span>
              <el-date-picker
                  v-model="selectedDate"
                  type="month"
                  placeholder="选择月份"
                  style="width: 150px"
              />
            </div>
          </template>
          <el-table :data="attendanceRecords" border height="500">
            <el-table-column prop="date" label="日期" width="100" />
            <el-table-column prop="weekday" label="星期" width="80" />
            <el-table-column prop="onDutyTime" label="上班打卡" width="120">
              <template #default="{ row }">
                <span :class="{ 'abnormal': row.onDutyStatus === 2 }">
                  {{ row.onDutyTime || '-' }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="offDutyTime" label="下班打卡" width="120">
              <template #default="{ row }">
                <span :class="{ 'abnormal': row.offDutyStatus === 2 }">
                  {{ row.offDutyTime || '-' }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusTag(row.status)" size="small">
                  {{ row.statusText }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100">
              <template #default="{ row }">
                <el-button link type="primary" @click="handleViewDetail(row)">详情</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <el-dialog v-model="detailVisible" title="打卡详情" width="500px">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="日期">{{ currentRecord.date }}</el-descriptions-item>
        <el-descriptions-item label="上班打卡">{{ currentRecord.onDutyTime || '未打卡' }}</el-descriptions-item>
        <el-descriptions-item label="下班打卡">{{ currentRecord.offDutyTime || '未打卡' }}</el-descriptions-item>
        <el-descriptions-item label="状态">{{ currentRecord.statusText }}</el-descriptions-item>
        <el-descriptions-item label="备注">
          {{ currentRecord.remark || '无' }}
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
        <el-button type="primary" @click="handleApplyException">申请异常</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { VideoCamera } from '@element-plus/icons-vue'

const loading = ref(false)
const clocking = ref(false)
const currentTime = ref('')
const selectedDate = ref(new Date())
const detailVisible = ref(false)
const currentRecord = ref({})

const todayAttendance = ref({
  onDuty: false,
  offDuty: false,
  onDutyTime: '',
  offDutyTime: ''
})

const todayStatus = ref({
  type: 'info',
  text: '未打卡'
})

const stats = ref({
  normalDays: 18,
  lateDays: 2,
  earlyDays: 1,
  absentDays: 0,
  leaveDays: 1,
  businessDays: 2
})

const attendanceRecords = ref([])

let timer = null

onMounted(() => {
  updateTime()
  timer = setInterval(updateTime, 1000)
  loadData()
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})

const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })
}

const loadData = () => {
  loading.value = true
  setTimeout(() => {
    // 模拟今日打卡状态
    const hour = new Date().getHours()
    if (hour >= 9 && hour < 18) {
      todayAttendance.value = {
        onDuty: true,
        offDuty: false,
        onDutyTime: '08:55:30',
        offDutyTime: ''
      }
      todayStatus.value = { type: 'success', text: '已上班打卡' }
    } else if (hour >= 18) {
      todayAttendance.value = {
        onDuty: true,
        offDuty: true,
        onDutyTime: '08:55:30',
        offDutyTime: '18:05:20'
      }
      todayStatus.value = { type: 'success', text: '已完成打卡' }
    }

    // 模拟打卡记录
    attendanceRecords.value = [
      { id: 1, date: '2026-01-15', weekday: '一', onDutyTime: '08:55:30', offDutyTime: '18:05:20', status: 1, statusText: '正常' },
      { id: 2, date: '2026-01-14', weekday: '日', onDutyTime: '08:55:30', offDutyTime: '18:05:20', status: 1, statusText: '正常' },
      { id: 3, date: '2026-01-13', weekday: '六', onDutyTime: '09:05:30', offDutyTime: '18:05:20', status: 2, statusText: '迟到' },
      { id: 4, date: '2026-01-12', weekday: '五', onDutyTime: '08:55:30', offDutyTime: '17:30:20', status: 3, statusText: '早退' },
      { id: 5, date: '2026-01-11', weekday: '四', onDutyTime: '-', offDutyTime: '-', status: 4, statusText: '缺卡' }
    ]

    loading.value = false
  }, 500)
}

const handleOnDuty = () => {
  clocking.value = true
  setTimeout(() => {
    const now = new Date()
    const timeStr = now.toLocaleTimeString('zh-CN', { hour12: false })
    todayAttendance.value.onDuty = true
    todayAttendance.value.onDutyTime = timeStr

    const hour = now.getHours()
    if (hour > 9) {
      todayStatus.value = { type: 'warning', text: '迟到打卡' }
    } else {
      todayStatus.value = { type: 'success', text: '已上班打卡' }
    }

    clocking.value = false
    ElMessage.success('上班打卡成功')
  }, 1000)
}

const handleOffDuty = () => {
  clocking.value = true
  setTimeout(() => {
    const now = new Date()
    const timeStr = now.toLocaleTimeString('zh-CN', { hour12: false })
    todayAttendance.value.offDuty = true
    todayAttendance.value.offDutyTime = timeStr
    todayStatus.value = { type: 'success', text: '已完成打卡' }

    clocking.value = false
    ElMessage.success('下班打卡成功')
  }, 1000)
}

const handleViewDetail = (row) => {
  currentRecord.value = row
  detailVisible.value = true
}

const handleApplyException = () => {
  ElMessage.info('异常申请功能开发中')
}

const getStatusTag = (status) => {
  const types = { 1: 'success', 2: 'warning', 3: 'warning', 4: 'danger', 5: 'info', 6: 'info' }
  return types[status] || 'info'
}
</script>

<style lang="scss" scoped>
.mobile-attendance-page {
  padding: 20px;

  .clock-card {
    .clock-content {
      text-align: center;
      padding: 20px;

      .current-time {
        font-size: 36px;
        font-weight: 600;
        color: #333;
        margin-bottom: 20px;
      }

      .attendance-status {
        margin-bottom: 30px;
      }

      .clock-actions {
        .clocked-info {
          margin-top: 20px;
          padding: 20px;
          background: #f5f7fa;
          border-radius: 4px;

          p {
            margin: 10px 0;
            font-size: 16px;
            color: #606266;
          }
        }
      }
    }
  }

  .stats-card {
    .stats-content {
      .stat-item {
        text-align: center;
        padding: 15px;

        .stat-value {
          font-size: 28px;
          font-weight: 600;
          color: #333;
          margin-bottom: 5px;
        }

        .stat-label {
          font-size: 13px;
          color: #999;
        }
      }
    }
  }

  .records-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .abnormal {
      color: #f56c6c;
      font-weight: 600;
    }
  }
}
</style>
