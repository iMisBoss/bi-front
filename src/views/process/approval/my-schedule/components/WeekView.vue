<template>
  <div class="week-view">
    <div class="view-header">
      <h3>{{ weekRangeText }}</h3>
      <div class="header-actions">
        <el-button size="small" @click="handlePrevWeek" icon="ArrowLeft">上周</el-button>
        <el-button size="small" @click="handleNextWeek" icon="ArrowRight">下周</el-button>
        <el-checkbox v-model="compactMode">紧凑模式</el-checkbox>
      </div>
    </div>

    <!-- 周日历 -->
    <div class="week-calendar">
      <!-- 星期标题 -->
      <div class="weekday-header">
        <div class="time-column"></div>
        <div v-for="(day, index) in weekDays" :key="index"
             class="weekday-column"
             :class="{ 'is-today': day.isToday }">
          <div class="weekday-name">{{ day.weekday }}</div>
          <div class="weekday-date">{{ day.date }}</div>
        </div>
      </div>

      <!-- 时间轴 -->
      <div class="week-timeline">
        <div class="time-column">
          <div v-for="hour in 24" :key="hour" class="time-slot">
            <div class="time-label">{{ String(hour - 1).padStart(2, '0') }}:00</div>
          </div>
        </div>

        <!-- 每天的列 -->
        <div v-for="(day, dayIndex) in weekDays" :key="dayIndex"
             class="day-column"
             :class="{ 'is-today': day.isToday }"
             @click="handleDayClick(day.date)">
          <div v-for="hour in 24" :key="hour" class="time-slot-area">
            <div class="slot-line"></div>
          </div>

          <!-- 当天的日程 -->
          <div v-for="schedule in getDaySchedules(day.date)" :key="schedule.id"
               class="schedule-block"
               :style="getScheduleStyle(schedule)"
               :class="getScheduleClass(schedule)"
               @click.stop="$emit('edit', schedule)">
            <div class="schedule-title">{{ schedule.title }}</div>
            <div class="schedule-time">{{ formatTime(schedule.startTime) }}</div>
          </div>
        </div>
      </div>
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

const compactMode = ref(false)

const weekDays = computed(() => {
  const curr = new Date(props.currentDate)
  const first = curr.getDate() - curr.getDay() + 1

  const days = []
  const weekdays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  const today = new Date()

  for (let i = 0; i < 7; i++) {
    const date = new Date(curr.setDate(first + i))
    const dateStr = date.toISOString().split('T')[0]

    days.push({
      date: dateStr,
      weekday: weekdays[i],
      day: date.getDate(),
      isToday: dateStr === today.toISOString().split('T')[0]
    })
  }

  return days
})

const weekRangeText = computed(() => {
  const first = weekDays.value[0]
  const last = weekDays.value[6]
  return `${first.date} ~ ${last.date}`
})

const getDaySchedules = (dateStr) => {
  return props.schedules.filter(schedule =>
      schedule.startTime.startsWith(dateStr)
  ).sort((a, b) => a.startTime.localeCompare(b.startTime))
}

const formatTime = (dateTime) => {
  return dateTime.split(' ')[1]
}

const getScheduleStyle = (schedule) => {
  const startHour = parseInt(schedule.startTime.split(' ')[1].split(':')[0])
  const startMinute = parseInt(schedule.startTime.split(' ')[1].split(':')[1])
  const endHour = parseInt(schedule.endTime.split(' ')[1].split(':')[0])
  const endMinute = parseInt(schedule.endTime.split(' ')[1].split(':')[1])

  const slotHeight = compactMode.value ? 40 : 90
  const top = (startHour * 60 + startMinute) * (slotHeight / 60)
  const height = ((endHour * 60 + endMinute) - (startHour * 60 + startMinute)) * (slotHeight / 60)

  return {
    top: `${top}px`,
    height: `${Math.max(height, 20)}px`
  }
}

const getScheduleClass = (schedule) => {
  const classes = []
  if (schedule.status === 'ongoing') classes.push('ongoing')
  if (schedule.status === 'upcoming') classes.push('upcoming')
  if (schedule.priority === 'high') classes.push('high-priority')
  return classes.join(' ')
}

const handleDayClick = (dateStr) => {
  emit('add', { date: dateStr })
}

const handlePrevWeek = () => {
  const newDate = new Date(props.currentDate)
  newDate.setDate(newDate.getDate() - 7)
  emit('date-change', newDate)
}

const handleNextWeek = () => {
  const newDate = new Date(props.currentDate)
  newDate.setDate(newDate.getDate() + 7)
  emit('date-change', newDate)
}
</script>

<style lang="scss" scoped>
.week-view {
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
      align-items: center;
      gap: 12px;
    }
  }

  .week-calendar {
    border: 1px solid #ebeef5;
    border-radius: 8px;
    overflow: hidden;
    background: #fff;

    .weekday-header {
      display: flex;
      background: #fafafa;
      border-bottom: 2px solid #ebeef5;

      .time-column {
        width: 80px;
        flex-shrink: 0;
      }

      .weekday-column {
        flex: 1;
        padding: 12px;
        text-align: center;
        border-left: 1px solid #ebeef5;

        &.is-today {
          background: #ecf5ff;
        }

        .weekday-name {
          font-size: 14px;
          font-weight: 600;
          color: #303133;
          margin-bottom: 4px;
        }

        .weekday-date {
          font-size: 12px;
          color: #909399;
        }
      }
    }

    .week-timeline {
      display: flex;
      position: relative;

      .time-column {
        width: 80px;
        flex-shrink: 0;
        background: #fafafa;
        border-right: 1px solid #ebeef5;

        .time-slot {
          height: 90px;
          display: flex;
          align-items: flex-start;
          padding: 4px 8px;

          .time-label {
            font-size: 12px;
            color: #909399;
          }
        }
      }

      .day-column {
        flex: 1;
        position: relative;
        min-height: 2160px;
        border-left: 1px solid #ebeef5;
        cursor: pointer;

        &.is-today {
          background: #f5f7fa;
        }

        .time-slot-area {
          height: 90px;
          position: relative;

          .slot-line {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 1px;
            background: #f0f0f0;
          }
        }

        .schedule-block {
          position: absolute;
          left: 4px;
          right: 4px;
          padding: 4px 8px;
          background: #ecf5ff;
          border-left: 3px solid #409eff;
          border-radius: 4px;
          cursor: pointer;
          overflow: hidden;

          &:hover {
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            z-index: 10;
          }

          &.ongoing {
            background: #f0f9ff;
            border-left-color: #67c23a;
          }

          &.upcoming {
            background: #fef0f0;
            border-left-color: #f56c6c;
          }

          &.high-priority {
            border-left-width: 5px;
          }

          .schedule-title {
            font-size: 12px;
            font-weight: 600;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .schedule-time {
            font-size: 11px;
            color: #909399;
          }
        }
      }
    }
  }
}
</style>
