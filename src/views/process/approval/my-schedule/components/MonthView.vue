<template>
  <div class="month-view">
    <div class="view-header">
      <h3>{{ monthText }}</h3>
      <div class="header-actions">
        <el-button size="small" @click="handlePrevMonth" icon="ArrowLeft">上月</el-button>
        <el-button size="small" @click="handleNextMonth" icon="ArrowRight">下月</el-button>
      </div>
    </div>

    <div class="month-calendar">
      <!-- 星期标题 -->
      <div class="weekday-header">
        <div v-for="day in weekdays" :key="day" class="weekday-cell">{{ day }}</div>
      </div>

      <!-- 日期网格 -->
      <div class="month-grid">
        <div v-for="(cell, index) in calendarCells" :key="index"
             class="day-cell"
             :class="{
               'is-today': cell.isToday,
               'is-other-month': !cell.isCurrentMonth,
               'has-schedule': cell.schedules.length > 0
             }"
             @click="handleDayClick(cell)">
          <div class="day-header">
            <span class="day-number">{{ cell.day }}</span>
            <span v-if="cell.schedules.length > 0" class="schedule-count">{{ cell.schedules.length }}</span>
          </div>
          <div class="day-schedules">
            <div v-for="schedule in cell.schedules.slice(0, 3)" :key="schedule.id"
                 class="schedule-item"
                 :class="getScheduleClass(schedule)"
                 @click.stop="$emit('edit', schedule)">
              {{ schedule.title }}
            </div>
            <div v-if="cell.schedules.length > 3" class="more-schedules">
              还有 {{ cell.schedules.length - 3 }} 项...
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧日程列表 -->
    <div v-if="selectedDay" class="day-detail-panel">
      <el-card shadow="never">
        <template #header>
          <div class="panel-header">
            <span>{{ selectedDayText }}</span>
            <el-button link type="primary" size="small" @click="handleAddToDay">新增</el-button>
          </div>
        </template>
        <div class="schedule-list">
          <div v-for="schedule in selectedDaySchedules" :key="schedule.id"
               class="schedule-card"
               @click="$emit('edit', schedule)">
            <div class="schedule-time">{{ formatTime(schedule.startTime) }} - {{ formatTime(schedule.endTime) }}</div>
            <div class="schedule-title">{{ schedule.title }}</div>
            <div class="schedule-location" v-if="schedule.location">📍 {{ schedule.location }}</div>
          </div>
          <el-empty v-if="selectedDaySchedules.length === 0" description="暂无日程" />
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  schedules: {
    type: Array,
    default: () => []
  },
  currentDate: {
    type: Date,
    required: true
  }
})

const emit = defineEmits(['add', 'edit', 'date-change'])

const selectedDay = ref(null)

const weekdays = ['日', '一', '二', '三', '四', '五', '六']

const monthText = computed(() => {
  return `${props.currentDate.getFullYear()}年${props.currentDate.getMonth() + 1}月`
})

const calendarCells = computed(() => {
  const year = props.currentDate.getFullYear()
  const month = props.currentDate.getMonth()
  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startDay = firstDay.getDay()

  const cells = []
  const prevMonthLastDay = new Date(year, month, 0).getDate()

  // 上月的日期
  for (let i = startDay - 1; i >= 0; i--) {
    const day = prevMonthLastDay - i
    const date = new Date(year, month - 1, day)
    const dateStr = date.toISOString().split('T')[0]

    cells.push({
      day,
      date: dateStr,
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
      schedules: getSchedulesByDate(dateStr)
    })
  }

  // 当月的日期
  for (let day = 1; day <= lastDay.getDate(); day++) {
    const date = new Date(year, month, day)
    const dateStr = date.toISOString().split('T')[0]

    cells.push({
      day,
      date: dateStr,
      isCurrentMonth: true,
      isToday: dateStr === todayStr,
      schedules: getSchedulesByDate(dateStr)
    })
  }

  // 下月的日期
  const remaining = 42 - cells.length
  for (let day = 1; day <= remaining; day++) {
    const date = new Date(year, month + 1, day)
    const dateStr = date.toISOString().split('T')[0]

    cells.push({
      day,
      date: dateStr,
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
      schedules: getSchedulesByDate(dateStr)
    })
  }

  return cells
})

const selectedDayText = computed(() => {
  if (!selectedDay.value) return ''
  return `${selectedDay.value} 的日程`
})

const selectedDaySchedules = computed(() => {
  if (!selectedDay.value) return []
  return getSchedulesByDate(selectedDay.value)
})

const getSchedulesByDate = (dateStr) => {
  return props.schedules.filter(schedule =>
      schedule.startTime.startsWith(dateStr)
  ).sort((a, b) => a.startTime.localeCompare(b.startTime))
}

const formatTime = (dateTime) => {
  return dateTime.split(' ')[1]
}

const getScheduleClass = (schedule) => {
  const classes = []
  if (schedule.status === 'ongoing') classes.push('ongoing')
  if (schedule.status === 'upcoming') classes.push('upcoming')
  if (schedule.priority === 'high') classes.push('high-priority')
  return classes.join(' ')
}

const handleDayClick = (cell) => {
  selectedDay.value = cell.date
  emit('add', { date: cell.date })
}

const handleAddToDay = () => {
  if (selectedDay.value) {
    emit('add', { date: selectedDay.value })
  }
}

const handlePrevMonth = () => {
  const newDate = new Date(props.currentDate)
  newDate.setMonth(newDate.getMonth() - 1)
  emit('date-change', newDate)
}

const handleNextMonth = () => {
  const newDate = new Date(props.currentDate)
  newDate.setMonth(newDate.getMonth() + 1)
  emit('date-change', newDate)
}
</script>

<style lang="scss" scoped>
.month-view {
  display: flex;
  gap: 20px;

  .view-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
    }

    .header-actions {
      display: flex;
      gap: 8px;
    }
  }

  .month-calendar {
    flex: 1;
    border: 1px solid #ebeef5;
    border-radius: 8px;
    overflow: hidden;
    background: #fff;

    .weekday-header {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      background: #fafafa;
      border-bottom: 2px solid #ebeef5;

      .weekday-cell {
        padding: 12px;
        text-align: center;
        font-weight: 600;
        color: #303133;
      }
    }

    .month-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      grid-auto-rows: minmax(120px, auto);

      .day-cell {
        padding: 8px;
        border-right: 1px solid #f0f0f0;
        border-bottom: 1px solid #f0f0f0;
        cursor: pointer;
        transition: background 0.2s;

        &:hover {
          background: #f5f7fa;
        }

        &.is-today {
          background: #ecf5ff;
        }

        &.is-other-month {
          background: #fafafa;
          opacity: 0.5;
        }

        &.has-schedule {
          background: #f0f9ff;
        }

        .day-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;

          .day-number {
            font-size: 16px;
            font-weight: 600;
            color: #303133;
          }

          .schedule-count {
            background: #409eff;
            color: #fff;
            font-size: 11px;
            padding: 2px 6px;
            border-radius: 10px;
          }
        }

        .day-schedules {
          .schedule-item {
            padding: 4px 6px;
            margin-bottom: 4px;
            font-size: 12px;
            background: #ecf5ff;
            border-left: 2px solid #409eff;
            border-radius: 2px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            cursor: pointer;

            &.ongoing {
              background: #f0f9ff;
              border-left-color: #67c23a;
            }

            &.upcoming {
              background: #fef0f0;
              border-left-color: #f56c6c;
            }

            &.high-priority {
              border-left-width: 4px;
            }
          }

          .more-schedules {
            font-size: 11px;
            color: #909399;
            padding: 2px 0;
          }
        }
      }
    }
  }

  .day-detail-panel {
    width: 300px;
    flex-shrink: 0;

    .panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .schedule-list {
      max-height: 500px;
      overflow-y: auto;

      .schedule-card {
        padding: 12px;
        margin-bottom: 8px;
        background: #f5f7fa;
        border-radius: 4px;
        cursor: pointer;

        &:hover {
          background: #ecf5ff;
        }

        .schedule-time {
          font-size: 12px;
          color: #909399;
          margin-bottom: 4px;
        }

        .schedule-title {
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 4px;
        }

        .schedule-location {
          font-size: 12px;
          color: #606266;
        }
      }
    }
  }
}
</style>
