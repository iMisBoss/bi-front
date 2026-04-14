<template>
  <div class="my-schedule-page">
    <!-- 顶部操作栏 -->
    <div class="top-toolbar">
      <div class="toolbar-left">
        <el-button-group>
          <el-button :type="currentView === 'today' ? 'primary' : ''" @click="switchView('today')">今日</el-button>
          <el-button :type="currentView === 'day' ? 'primary' : ''" @click="switchView('day')">日</el-button>
          <el-button :type="currentView === 'week' ? 'primary' : ''" @click="switchView('week')">周</el-button>
          <el-button :type="currentView === 'month' ? 'primary' : ''" @click="switchView('month')">月</el-button>
          <el-button :type="currentView === 'list' ? 'primary' : ''" @click="switchView('list')">列表</el-button>
        </el-button-group>
        <div class="date-navigator">
          <el-button @click="navigateDate('prev')" icon="ArrowLeft" circle size="small" />
          <span class="current-date">{{ currentDateText }}</span>
          <el-button @click="navigateDate('next')" icon="ArrowRight" circle size="small" />
          <el-button @click="navigateDate('today')" size="small">今天</el-button>
        </div>
      </div>
      <div class="toolbar-right">
        <el-input v-model="searchText" placeholder="搜索日程" prefix-icon="Search" clearable style="width: 200px" />
        <el-button @click="handleImport" icon="Upload">导入</el-button>
        <el-button @click="handleExport" icon="Download">导出</el-button>
        <el-button type="primary" @click="handleAddSchedule" icon="Plus">新增日程</el-button>
      </div>
    </div>

    <!-- 主体内容区 -->
    <div class="main-content">
      <!-- 左侧辅助栏 -->
      <div class="left-sidebar" :class="{ collapsed: leftCollapsed }">
        <div class="sidebar-toggle" @click="leftCollapsed = !leftCollapsed">
          <el-icon><component :is="leftCollapsed ? 'DArrowRight' : 'DArrowLeft'" /></el-icon>
        </div>
        <div v-if="!leftCollapsed" class="sidebar-content">
          <!-- 今日聚焦 -->
          <el-card shadow="never" class="sidebar-card">
            <template #header>
              <span>今日聚焦</span>
            </template>
            <div class="today-summary">
              <div class="summary-item">
                <span class="label">总日程</span>
                <span class="value">{{ todayStats.total }}</span>
              </div>
              <div class="summary-item">
                <span class="label">进行中</span>
                <span class="value" style="color: #67c23a">{{ todayStats.ongoing }}</span>
              </div>
              <div class="summary-item">
                <span class="label">即将开始</span>
                <span class="value" style="color: #f56c6c">{{ todayStats.upcoming }}</span>
              </div>
            </div>
          </el-card>

          <!-- 待办联动 -->
          <el-card shadow="never" class="sidebar-card">
            <template #header>
              <span>待办联动</span>
            </template>
            <div class="todo-list">
              <div v-for="todo in linkedTodos" :key="todo.id" class="todo-item">
                <span class="todo-title">{{ todo.title }}</span>
                <el-button link type="primary" size="small" @click="handleLinkTodo(todo)">关联</el-button>
              </div>
            </div>
          </el-card>

          <!-- 共享日程列表 -->
          <el-card shadow="never" class="sidebar-card">
            <template #header>
              <span>共享日程</span>
            </template>
            <div class="shared-list">
              <div v-for="shared in sharedSchedules" :key="shared.id" class="shared-item">
                <span class="shared-title">{{ shared.title }}</span>
                <el-tag size="small">{{ shared.sharer }}</el-tag>
              </div>
            </div>
          </el-card>
        </div>
      </div>

      <!-- 中部主视图 -->
      <div class="center-view">
        <!-- 今日聚焦视图 -->
        <TodayView v-if="currentView === 'today'" :schedules="filteredSchedules" @add="handleAddSchedule" />

        <!-- 日视图 -->
        <DayView v-if="currentView === 'day'" :schedules="filteredSchedules" :current-date="currentDate" @add="handleAddSchedule" @edit="handleEditSchedule" />

        <!-- 周视图 -->
        <WeekView v-if="currentView === 'week'" :schedules="filteredSchedules" :current-date="currentDate" @add="handleAddSchedule" @edit="handleEditSchedule" />

        <!-- 月视图 -->
        <MonthView v-if="currentView === 'month'" :schedules="filteredSchedules" :current-date="currentDate" @add="handleAddSchedule" @edit="handleEditSchedule" />

        <!-- 列表视图 -->
        <ListView v-if="currentView === 'list'" :schedules="filteredSchedules" @batch-delete="handleBatchDelete" @batch-complete="handleBatchComplete" @export="handleExport" />
      </div>

      <!-- 右侧设置栏 -->
      <div class="right-sidebar" :class="{ collapsed: rightCollapsed }">
        <div class="sidebar-toggle" @click="rightCollapsed = !rightCollapsed">
          <el-icon><component :is="rightCollapsed ? 'DArrowLeft' : 'DArrowRight'" /></el-icon>
        </div>
        <div v-if="!rightCollapsed" class="sidebar-content">
          <!-- 提醒设置 -->
          <el-card shadow="never" class="sidebar-card">
            <template #header>
              <span>提醒设置</span>
            </template>
            <el-form label-width="100px" size="small">
              <el-form-item label="默认提醒">
                <el-select v-model="reminderSettings.defaultReminder" style="width: 100%">
                  <el-option label="不提醒" value="none" />
                  <el-option label="提前10分钟" value="10min" />
                  <el-option label="提前30分钟" value="30min" />
                  <el-option label="提前1小时" value="1hour" />
                  <el-option label="提前1天" value="1day" />
                </el-select>
              </el-form-item>
              <el-form-item label="提醒方式">
                <el-checkbox-group v-model="reminderSettings.reminderMethods">
                  <el-checkbox label="popup" value="popup">弹窗</el-checkbox>
                  <el-checkbox label="message" value="message">消息中心</el-checkbox>
                </el-checkbox-group>
              </el-form-item>
            </el-form>
          </el-card>

          <!-- 分类管理 -->
          <el-card shadow="never" class="sidebar-card">
            <template #header>
              <div class="card-header">
                <span>日程分类</span>
                <el-button link type="primary" size="small" @click="handleAddCategory">新增</el-button>
              </div>
            </template>
            <div class="category-list">
              <div v-for="category in categories" :key="category.id" class="category-item">
                <span class="category-color" :style="{ backgroundColor: category.color }"></span>
                <span class="category-name">{{ category.name }}</span>
                <el-tag v-if="category.system" size="small" type="info">系统</el-tag>
              </div>
            </div>
          </el-card>
        </div>
      </div>
    </div>

    <!-- 日程编辑对话框 -->
    <ScheduleDialog
        v-model="showScheduleDialog"
        :type="dialogType"
        :data="currentSchedule"
        @confirm="handleConfirmSchedule"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import TodayView from './components/TodayView.vue'
import DayView from './components/DayView.vue'
import WeekView from './components/WeekView.vue'
import MonthView from './components/MonthView.vue'
import ListView from './components/ListView.vue'
import ScheduleDialog from './components/ScheduleDialog.vue'

const currentView = ref('week')
const currentDate = ref(new Date())
const searchText = ref('')
const leftCollapsed = ref(false)
const rightCollapsed = ref(false)
const showScheduleDialog = ref(false)
const dialogType = ref('add')
const currentSchedule = ref(null)

const todayStats = reactive({
  total: 5,
  ongoing: 2,
  upcoming: 1
})

const linkedTodos = ref([
  { id: 1, title: '完成Q1工作报告', deadline: '2026-04-20' },
  { id: 2, title: '审批采购申请', deadline: '2026-04-18' }
])

const sharedSchedules = ref([
  { id: 1, title: '部门周例会', sharer: '李四' },
  { id: 2, title: '项目评审会', sharer: '王五' }
])

const reminderSettings = reactive({
  defaultReminder: '30min',
  reminderMethods: ['popup', 'message']
})

const categories = ref([
  { id: 1, name: '工作会议', color: '#409EFF', system: true },
  { id: 2, name: '出差', color: '#67C23A', system: true },
  { id: 3, name: '培训', color: '#E6A23C', system: true },
  { id: 4, name: '个人事务', color: '#909399', system: true },
  { id: 5, name: '客户拜访', color: '#F56C6C', system: false }
])

const schedules = ref([
  { id: 1, title: '部门周例会', startTime: '2026-04-15 09:00', endTime: '2026-04-15 10:30', location: '会议室A', participants: ['张三', '李四', '王五'], priority: 'high', category: 1, status: 'ongoing', shared: true },
  { id: 2, title: '项目评审会', startTime: '2026-04-15 14:00', endTime: '2026-04-15 16:00', location: '会议室B', participants: ['张三', '赵六'], priority: 'high', category: 1, status: 'upcoming', shared: true },
  { id: 3, title: '客户拜访', startTime: '2026-04-16 10:00', endTime: '2026-04-16 12:00', location: '客户公司', participants: ['张三'], priority: 'medium', category: 5, status: 'pending', shared: false },
  { id: 4, title: '培训学习', startTime: '2026-04-17 09:00', endTime: '2026-04-17 17:00', location: '培训室', participants: ['张三'], priority: 'low', category: 3, status: 'pending', shared: false },
  { id: 5, title: '月度总结', startTime: '2026-04-15 16:30', endTime: '2026-04-15 17:30', location: '办公室', participants: ['张三'], priority: 'medium', category: 1, status: 'pending', shared: false }
])

const currentDateText = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth() + 1
  const day = currentDate.value.getDate()

  if (currentView.value === 'month') {
    return `${year}年${month}月`
  } else if (currentView.value === 'week') {
    return `${year}年${month}月第${getWeekOfMonth(currentDate.value)}周`
  } else {
    return `${year}年${month}月${day}日`
  }
})

const filteredSchedules = computed(() => {
  let result = [...schedules.value]

  if (searchText.value) {
    result = result.filter(item => item.title.includes(searchText.value))
  }

  return result
})

function getWeekOfMonth(date) {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1)
  const dayOfWeek = firstDay.getDay()
  const dayOfMonth = date.getDate()
  return Math.ceil((dayOfMonth + dayOfWeek) / 7)
}

const switchView = (view) => {
  currentView.value = view
}

const navigateDate = (direction) => {
  const date = new Date(currentDate.value)

  if (direction === 'today') {
    currentDate.value = new Date()
  } else if (currentView.value === 'day') {
    date.setDate(date.getDate() + (direction === 'next' ? 1 : -1))
    currentDate.value = date
  } else if (currentView.value === 'week') {
    date.setDate(date.getDate() + (direction === 'next' ? 7 : -7))
    currentDate.value = date
  } else if (currentView.value === 'month') {
    date.setMonth(date.getMonth() + (direction === 'next' ? 1 : -1))
    currentDate.value = date
  }
}

const handleAddSchedule = () => {
  dialogType.value = 'add'
  currentSchedule.value = null
  showScheduleDialog.value = true
}

const handleEditSchedule = (schedule) => {
  dialogType.value = 'edit'
  currentSchedule.value = { ...schedule }
  showScheduleDialog.value = true
}

const handleConfirmSchedule = (formData) => {
  if (formData.id) {
    const index = schedules.value.findIndex(item => item.id === formData.id)
    if (index !== -1) {
      schedules.value[index] = { ...schedules.value[index], ...formData }
    }
    ElMessage.success('编辑成功')
  } else {
    formData.id = Date.now()
    formData.status = 'pending'
    schedules.value.push(formData)
    ElMessage.success('新增成功')
  }
  showScheduleDialog.value = false
}

const handleImport = () => {
  ElMessage.info('导入功能')
}

const handleExport = () => {
  ElMessage.success('导出成功')
}

const handleAddCategory = () => {
  ElMessage.info('新增分类功能')
}

const handleBatchDelete = () => {
  ElMessage.info('批量删除功能')
}

const handleBatchComplete = () => {
  ElMessage.info('批量完成功能')
}

const handleLinkTodo = (todo) => {
  dialogType.value = 'add'
  currentSchedule.value = {
    title: todo.title,
    startTime: todo.deadline + ' 09:00',
    endTime: todo.deadline + ' 18:00'
  }
  showScheduleDialog.value = true
}
</script>

<style lang="scss" scoped>
.my-schedule-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;

  .top-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 20px;
    background: #fff;
    border-bottom: 1px solid #ebeef5;

    .toolbar-left {
      display: flex;
      align-items: center;
      gap: 16px;

      .date-navigator {
        display: flex;
        align-items: center;
        gap: 8px;

        .current-date {
          font-size: 16px;
          font-weight: 600;
          min-width: 150px;
          text-align: center;
        }
      }
    }

    .toolbar-right {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }

  .main-content {
    flex: 1;
    display: flex;
    overflow: hidden;

    .left-sidebar,
    .right-sidebar {
      width: 280px;
      background: #fff;
      border-right: 1px solid #ebeef5;
      position: relative;
      transition: width 0.3s;

      &.collapsed {
        width: 36px;
      }

      .sidebar-toggle {
        position: absolute;
        top: 50%;
        right: -12px;
        width: 24px;
        height: 48px;
        background: #fff;
        border: 1px solid #ebeef5;
        border-radius: 0 4px 4px 0;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        z-index: 10;

        &:hover {
          background: #f5f7fa;
        }
      }

      .sidebar-content {
        padding: 16px;
        overflow-y: auto;
        height: 100%;

        .sidebar-card {
          margin-bottom: 16px;
          border-radius: 8px;

          .card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
        }

        .today-summary {
          .summary-item {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #f0f0f0;

            .label {
              color: #606266;
            }

            .value {
              font-weight: 600;
            }
          }
        }

        .todo-list,
        .shared-list {
          .todo-item,
          .shared-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 0;
            border-bottom: 1px solid #f0f0f0;

            .todo-title,
            .shared-title {
              flex: 1;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
              margin-right: 8px;
            }
          }
        }

        .category-list {
          .category-item {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 0;
            border-bottom: 1px solid #f0f0f0;

            .category-color {
              width: 12px;
              height: 12px;
              border-radius: 2px;
            }

            .category-name {
              flex: 1;
            }
          }
        }
      }
    }

    .right-sidebar {
      border-right: none;
      border-left: 1px solid #ebeef5;

      .sidebar-toggle {
        right: auto;
        left: -12px;
        border-radius: 4px 0 0 4px;
      }
    }

    .center-view {
      flex: 1;
      overflow: auto;
      padding: 20px;
    }
  }
}
</style>
