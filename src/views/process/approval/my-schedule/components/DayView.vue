<template>
  <div class="day-view">
    <div class="view-header">
      <h3>{{ formatDate(currentDate) }}</h3>
      <el-button size="small" @click="handlePrevDay" icon="ArrowLeft">前一天</el-button>
      <el-button size="small" @click="handleNextDay" icon="ArrowRight">后一天</el-button>
    </div>

    <!-- 时间轴 -->
    <div class="day-timeline">
      <div class="time-column">
        <div v-for="hour in 24" :key="hour" class="time-slot">
          <div class="time-label">{{ String(hour - 1).padStart(2, '0') }}:00</div>
        </div>
      </div>

      <div class="schedule-column" @click="handleTimeSlotClick">
        <div v-for="hour in 24" :key="hour" class="time-slot-area">
          <div class="slot-line"></div>
        </div>

        <!-- 日程卡片 -->
        <div v-for="schedule in daySchedules" :key="schedule.id"
             class="schedule-block"
             :style="getScheduleStyle(schedule)"
             :class="getScheduleClass(schedule)"
             draggable="true"
             @dragstart="handleDragStart(schedule, $event)"
             @click.stop="$emit('edit', schedule)">
          <div class="schedule-header">
            <span class="schedule-title">{{ schedule.title }}</span>
            <el-tag v-if="schedule.priority === 'high'" type="danger" size="small">高</el-tag>
          </div>
          <div class="schedule-time">
            {{ formatTime(schedule.startTime) }} - {{ formatTime(schedule.endTime) }}
          </div>
          <div class="schedule-location" v-if="schedule.location">
            📍 {{ schedule.location }}
          </div>
          <div class="schedule-participants" v-if="schedule.participants?.length">
            👥 {{ schedule.participants.join(', ') }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

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

const daySchedules = computed(() => {
  const dateStr = props.currentDate.toISOString().split('T')[0]
  return props.schedules.filter(schedule =>
      schedule.startTime.startsWith(dateStr)
  ).sort((a, b) => a.startTime.localeCompare(b.startTime))
})

const formatDate = (date) => {
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${weekdays[date.getDay()]}`
}

const formatTime = (dateTime) => {
  return dateTime.split(' ')[1]
}

const getScheduleStyle = (schedule) => {
  const startHour = parseInt(schedule.startTime.split(' ')[1].split(':')[0])
  const startMinute = parseInt(schedule.startTime.split(' ')[1].split(':')[1])
  const endHour = parseInt(schedule.endTime.split(' ')[1].split(':')[0])
  const endMinute = parseInt(schedule.endTime.split(' ')[1].split(':')[1])

  const top = (startHour * 60 + startMinute) * 1.5
  const height = ((endHour * 60 + endMinute) - (startHour * 60 + startMinute)) * 1.5

  return {
    top: `${top}px`,
    height: `${Math.max(height, 30)}px`
  }
}

const getScheduleClass = (schedule) => {
  const classes = []
  if (schedule.status === 'ongoing') classes.push('ongoing')
  if (schedule.status === 'upcoming') classes.push('upcoming')
  if (schedule.priority === 'high') classes.push('high-priority')
  return classes.join(' ')
}

const handleDragStart = (schedule, event) => {
  event.dataTransfer.setData('scheduleId', schedule.id)
}

const handleTimeSlotClick = (event) => {
  const rect = event.currentTarget.getBoundingClientRect()
  const y = event.clientY - rect.top
  const hour = Math.floor(y / 90)

  const dateStr = props.currentDate.toISOString().split('T')[0]
  const startTime = `${dateStr} ${String(hour).padStart(2, '0')}:00`
  const endTime = `${dateStr} ${String(hour + 1).padStart(2, '0')}:00`

  emit('add', { startTime, endTime })
}

const handlePrevDay = () => {
  const newDate = new Date(props.currentDate)
  newDate.setDate(newDate.getDate() - 1)
  emit('date-change', newDate)
}

const handleNextDay = () => {
  const newDate = new Date(props.currentDate)
  newDate.setDate(newDate.getDate() + 1)
  emit('date-change', newDate)
}
</script>

<style lang="scss" scoped>
.day-view {
  .view-header {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 20px;

    h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
    }
  }

  .day-timeline {
    display: flex;
    border: 1px solid #ebeef5;
    border-radius: 8px;
    overflow: hidden;
    background: #fff;

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

    .schedule-column {
      flex: 1;
      position: relative;
      min-height: 2160px;
      cursor: pointer;

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
        left: 8px;
        right: 8px;
        padding: 8px 12px;
        background: #ecf5ff;
        border-left: 4px solid #409eff;
        border-radius: 4px;
        cursor: pointer;
        overflow: hidden;
        transition: all 0.2s;

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
          border-left-width: 6px;
        }

        .schedule-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 4px;

          .schedule-title {
            font-size: 14px;
            font-weight: 600;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }

        .schedule-time {
          font-size: 12px;
          color: #606266;
          margin-bottom: 4px;
        }

        .schedule-location,
        .schedule-participants {
          font-size: 12px;
          color: #909399;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
    }
  }
}
</style>
