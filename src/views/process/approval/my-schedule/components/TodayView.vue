<template>
  <div class="today-view">
    <div class="view-header">
      <h3>{{ todayText }}</h3>
    </div>

    <!-- 时间轴 -->
    <div class="timeline">
      <div v-for="hour in 24" :key="hour" class="time-slot">
        <div class="time-label">{{ String(hour - 1).padStart(2, '0') }}:00</div>
        <div class="time-content">
          <div v-for="schedule in getSchedulesByHour(hour - 1)" :key="schedule.id"
               class="schedule-card"
               :class="getScheduleClass(schedule)"
               @click="$emit('edit', schedule)">
            <div class="schedule-time">{{ formatTime(schedule.startTime) }} - {{ formatTime(schedule.endTime) }}</div>
            <div class="schedule-title">{{ schedule.title }}</div>
            <div class="schedule-location" v-if="schedule.location">📍 {{ schedule.location }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 快捷添加 -->
    <div class="quick-add">
      <el-button type="primary" @click="$emit('add')" icon="Plus">新增今日日程</el-button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

defineProps({
  schedules: {
    type: Array,
    default: () => []
  }
})

defineEmits(['add', 'edit'])

const todayText = computed(() => {
  const now = new Date()
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 ${weekdays[now.getDay()]}`
})

const getSchedulesByHour = (hour) => {
  const now = new Date()
  const today = now.toISOString().split('T')[0]

  return props.schedules.filter(schedule => {
    const scheduleDate = schedule.startTime.split(' ')[0]
    if (scheduleDate !== today) return false

    const startHour = parseInt(schedule.startTime.split(' ')[1].split(':')[0])
    return startHour === hour
  })
}

const getScheduleClass = (schedule) => {
  const classes = []
  if (schedule.status === 'ongoing') classes.push('ongoing')
  if (schedule.status === 'upcoming') classes.push('upcoming')
  if (schedule.priority === 'high') classes.push('high-priority')
  return classes.join(' ')
}

const formatTime = (dateTime) => {
  return dateTime.split(' ')[1]
}
</script>

<style lang="scss" scoped>
.today-view {
  .view-header {
    margin-bottom: 20px;

    h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
    }
  }

  .timeline {
    .time-slot {
      display: flex;
      min-height: 60px;
      border-bottom: 1px solid #f0f0f0;

      .time-label {
        width: 60px;
        padding: 8px;
        color: #909399;
        font-size: 12px;
        text-align: right;
      }

      .time-content {
        flex: 1;
        padding: 4px;
        position: relative;

        .schedule-card {
          padding: 8px 12px;
          margin-bottom: 4px;
          border-radius: 4px;
          cursor: pointer;
          background: #ecf5ff;
          border-left: 3px solid #409eff;

          &.ongoing {
            background: #f0f9ff;
            border-left-color: #67c23a;
            font-weight: 600;
          }

          &.upcoming {
            background: #fef0f0;
            border-left-color: #f56c6c;
          }

          &.high-priority {
            border-left-width: 5px;
          }

          .schedule-time {
            font-size: 12px;
            color: #606266;
            margin-bottom: 4px;
          }

          .schedule-title {
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 4px;
          }

          .schedule-location {
            font-size: 12px;
            color: #909399;
          }
        }
      }
    }
  }

  .quick-add {
    margin-top: 20px;
    text-align: center;
  }
}
</style>
