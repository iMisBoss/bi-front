<template>
  <div class="center-panel">
    <!-- 视图切换 -->
    <div class="calendar-toolbar">
      <el-button-group>
        <el-button :type="calendarView === 'week' ? 'primary' : ''" @click="$emit('update:calendarView', 'week')">
          周视图
        </el-button>
        <el-button :type="calendarView === 'day' ? 'primary' : ''" @click="$emit('update:calendarView', 'day')">
          日视图
        </el-button>
      </el-button-group>
      <div class="date-navigation">
        <el-button @click="$emit('navigate-date', 'prev')" icon="ArrowLeft" circle size="small" />
        <span class="current-date">{{ currentDateText }}</span>
        <el-button @click="$emit('navigate-date', 'next')" icon="ArrowRight" circle size="small" />
        <el-button @click="$emit('go-to-today')" size="small">今天</el-button>
      </div>
    </div>

    <!-- 周视图 -->
    <div v-if="calendarView === 'week'" class="week-view">
      <div class="week-header">
        <div class="time-header"></div>
        <div
            v-for="day in weekDays"
            :key="day.date"
            class="day-header"
            :class="{ 'is-today': day.isToday }"
        >
          <div class="day-name">{{ day.name }}</div>
          <div class="day-date">{{ day.date }}</div>
        </div>
      </div>
      <div class="week-body">
        <div
            v-for="room in filteredAllRooms"
            :key="room.id"
            class="room-row"
            :class="{ 'room-row-selected': selectedRoom === room.id }"
            :data-room-id="room.id"
        >
          <div class="room-label" @click="handleRoomClick(room)">
            <div class="label-name">{{ room.name }}</div>
            <div class="label-capacity">{{ room.capacity }}人</div>
          </div>
          <div class="day-columns">
            <div v-for="day in weekDays" :key="day.date" class="day-column">
              <div
                  v-for="slot in generateWeekSlots(room.id, day.date)"
                  :key="slot.time"
                  class="time-slot"
                  :class="{
                  'slot-occupied': slot.isOccupied,
                  'slot-mine': slot.isMine,
                  'slot-maintenance': slot.isMaintenance,
                  'slot-conflict': slot.isConflict
                }"
                  @click="handleSlotClick(room, day.date, slot.time)"
              >
                <el-tooltip v-if="slot.booking" :content="slot.booking.title" placement="top">
                  <div class="booking-block">{{ slot.booking.title }}</div>
                </el-tooltip>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 日视图 -->
    <div v-if="calendarView === 'day'" class="day-view">
      <div class="day-header">
        <div class="time-column"></div>
        <div class="rooms-header">
          <div
              v-for="room in filteredAllRooms"
              :key="room.id"
              class="room-header-item"
              :class="{ 'room-header-selected': selectedRoom === room.id }"
              :data-room-id="room.id"
              @click="handleRoomClick(room)"
          >
            <div class="header-name">{{ room.name }}</div>
            <div class="header-capacity">{{ room.capacity }}人</div>
          </div>
        </div>
      </div>
      <div class="day-body">
        <div class="time-labels">
          <div v-for="hour in dayHours" :key="hour" class="hour-label" style="height: 60px">
            {{ hour }}:00
          </div>
        </div>
        <div class="rooms-grid">
          <div
              v-for="room in filteredAllRooms"
              :key="room.id"
              class="room-grid"
              :class="{ 'room-grid-selected': selectedRoom === room.id }"
              :data-room-id="room.id"
          >
            <div v-for="hour in dayHours" :key="hour" class="hour-grid">
              <div
                  v-for="slot in generateDaySlots(room.id, hour)"
                  :key="slot.time"
                  class="grid-slot"
                  :class="{
                  'grid-occupied': slot.isOccupied,
                  'grid-mine': slot.isMine,
                  'grid-maintenance': slot.isMaintenance,
                  'grid-conflict': slot.isConflict
                }"
                  @click="handleSlotClick(room, currentDate, slot.time)"
              >
                <el-tooltip v-if="slot.booking" :content="slot.booking.title" placement="top">
                  <div class="booking-block-small">{{ slot.booking.title }}</div>
                </el-tooltip>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>import { defineProps, defineEmits, computed, watch, nextTick } from 'vue'

const props = defineProps({
  calendarView: String,
  currentDate: Date,
  filteredAllRooms: Array,
  selectedRoom: String,
  weekDays: Array,
  dayHours: Array,
  bookings: Array
})

const emit = defineEmits(['update:calendarView', 'navigate-date', 'go-to-today', 'slot-click', 'select-room'])

const currentDateText = computed(() => {
  if (props.calendarView === 'week') {
    const firstDay = props.weekDays[0]
    const lastDay = props.weekDays[6]
    return `${firstDay.date} ~ ${lastDay.date}`
  }
  return props.currentDate.toISOString().split('T')[0]
})

const generateWeekSlots = (roomId, date) => {
  const slots = []
  for (let hour = 8; hour <= 20; hour++) {
    const time = `${date} ${hour.toString().padStart(2, '0')}:00`
    const booking = props.bookings.find(b => {
      return b.roomId === roomId && b.startTime <= time && b.endTime > time
    })
    slots.push({
      time,
      isOccupied: !!booking,
      isMine: booking?.isMine,
      isMaintenance: false,
      isConflict: false,
      booking
    })
  }
  return slots
}

const generateDaySlots = (roomId, hour) => {
  const slots = []
  const date = props.currentDate.toISOString().split('T')[0]
  for (let minute = 0; minute < 60; minute += 30) {
    const time = `${date} ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
    const booking = props.bookings.find(b => {
      return b.roomId === roomId && b.startTime <= time && b.endTime > time
    })
    slots.push({
      time,
      isOccupied: !!booking,
      isMine: booking?.isMine,
      isMaintenance: false,
      isConflict: false,
      booking
    })
  }
  return slots
}

// 监听选中会议室变化，自动滚动到对应位置
watch(() => props.selectedRoom, async (newRoomId) => {
  if (newRoomId) {
    await nextTick()
    const roomRow = document.querySelector(`.room-row[data-room-id="${newRoomId}"]`)
    if (roomRow) {
      roomRow.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      })
    }
  }
})

const handleRoomClick = (room) => {
  emit('select-room', room)
}

const handleSlotClick = (room, date, time) => {
  emit('slot-click', room, date, time)
}
</script>

<style lang="scss" scoped>
.center-panel {
  flex: 1;
  background: #fff;
  border-radius: 4px;
  padding: 12px;
  overflow: auto;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);

  .calendar-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    padding-bottom: 12px;
    border-bottom: 1px solid #ebeef5;

    .date-navigation {
      display: flex;
      align-items: center;
      gap: 12px;

      .current-date {
        font-size: 15px;
        font-weight: 600;
        color: #303133;
      }
    }
  }

  .week-view {
    .week-header {
      display: flex;
      border-bottom: 2px solid #ebeef5;

      .time-header {
        width: 140px;
      }

      .day-header {
        flex: 1;
        text-align: center;
        padding: 10px;
        background: #f5f7fa;

        &.is-today {
          background: #ecf5ff;
          color: #409eff;
          font-weight: 600;
        }

        .day-name {
          font-size: 12px;
          margin-bottom: 4px;
        }

        .day-date {
          font-size: 13px;
          font-weight: 600;
        }
      }
    }

    .week-body {
      max-height: calc(100vh - 280px);
      overflow-y: auto;

      .room-row {
        display: flex;
        border-bottom: 1px solid #ebeef5;
        scroll-margin-top: 20px;
        scroll-margin-bottom: 20px;

        &.room-row-selected {
          background: #ecf5ff;
          border-left: 4px solid #409eff;
          box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
          position: relative;

          &::before {
            content: '当前选中';
            position: absolute;
            top: 4px;
            right: 8px;
            background: #409eff;
            color: #fff;
            font-size: 11px;
            padding: 2px 6px;
            border-radius: 2px;
            z-index: 1;
          }
        }

        .room-label {
          width: 140px;
          padding: 10px;
          border-right: 1px solid #ebeef5;
          cursor: pointer;

          .label-name {
            font-weight: 600;
            margin-bottom: 4px;
            font-size: 13px;
          }

          .label-capacity {
            font-size: 12px;
            color: #909399;
          }
        }

        .day-columns {
          flex: 1;
          display: flex;

          .day-column {
            flex: 1;
            border-right: 1px solid #ebeef5;

            .time-slot {
              height: 36px;
              border-bottom: 1px solid #f0f0f0;
              position: relative;
              cursor: pointer;

              &:hover {
                background: #f5f7fa;
              }

              &.slot-occupied {
                background: #ffe6e6;
              }

              &.slot-mine {
                background: #d9ecff;
              }

              &.slot-maintenance {
                background: #f5f7fa;
                cursor: not-allowed;
              }

              &.slot-conflict {
                background: #ffe6e6;
                border: 2px solid #f56c6c;
              }

              .booking-block {
                padding: 3px 6px;
                background: #409eff;
                color: #fff;
                font-size: 12px;
                border-radius: 2px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
              }
            }
          }
        }
      }
    }
  }

  .day-view {
    .day-header {
      display: flex;
      border-bottom: 2px solid #ebeef5;

      .time-column {
        width: 70px;
      }

      .rooms-header {
        flex: 1;
        display: flex;

        .room-header-item {
          flex: 1;
          text-align: center;
          padding: 10px;
          background: #f5f7fa;
          cursor: pointer;

          &.room-header-selected {
            background: #ecf5ff;
            color: #409eff;
          }

          .header-name {
            font-weight: 600;
            margin-bottom: 4px;
            font-size: 13px;
          }

          .header-capacity {
            font-size: 12px;
            color: #909399;
          }
        }
      }
    }

    .day-body {
      display: flex;

      .time-labels {
        width: 70px;

        .hour-label {
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          color: #909399;
          border-bottom: 1px solid #f0f0f0;
        }
      }

      .rooms-grid {
        flex: 1;
        display: flex;

        .room-grid {
          flex: 1;
          border-right: 1px solid #ebeef5;
          transition: all 0.3s;

          &.room-grid-selected {
            background: #ecf5ff;
            box-shadow: inset 0 0 0 2px #409eff;
          }

          .hour-grid {
            .grid-slot {
              height: 28px;
              border-bottom: 1px solid #f0f0f0;
              position: relative;
              cursor: pointer;

              &:hover {
                background: #f5f7fa;
              }

              &.grid-occupied {
                background: #ffe6e6;
              }

              &.grid-mine {
                background: #d9ecff;
              }

              &.grid-maintenance {
                background: #f5f7fa;
                cursor: not-allowed;
              }

              &.grid-conflict {
                background: #ffe6e6;
                border: 2px solid #f56c6c;
              }

              .booking-block-small {
                padding: 2px 4px;
                background: #409eff;
                color: #fff;
                font-size: 10px;
                border-radius: 2px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
              }
            }
          }
        }
      }
    }
  }
}
</style>
