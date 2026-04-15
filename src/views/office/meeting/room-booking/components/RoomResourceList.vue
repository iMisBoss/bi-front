<template>
  <div class="left-panel">
    <div class="panel-title">会议室资源</div>
    <div class="room-list">
      <div v-for="group in roomGroups" :key="group.id" class="room-group">
        <div class="group-title">{{ group.name }}</div>
        <div
            v-for="room in filteredRooms(group.rooms)"
            :key="room.id"
            class="room-card"
            :class="{
            'room-selected': selectedRoom === room.id,
            'room-unavailable': room.status === 'maintenance' || room.status === 'locked'
          }"
            @click="$emit('select-room', room)"
        >
          <div class="room-header">
            <span class="room-name">{{ room.name }}</span>
            <el-tag :type="getRoomStatusType(room.status)" size="small">
              {{ getRoomStatusText(room.status) }}
            </el-tag>
          </div>
          <div class="room-info">
            <span>👥 {{ room.capacity }}人</span>
            <span>📍 {{ room.location }}</span>
          </div>
          <div class="room-equipments">
            <el-tag
                v-for="eq in room.equipments"
                :key="eq"
                size="small"
                type="info"
                class="equipment-tag"
            >
              {{ eq }}
            </el-tag>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  roomGroups: Array,
  selectedRoom: String,
  floorFilter: String,
  capacityFilter: String
})

const emit = defineEmits(['select-room'])

const filteredRooms = (rooms) => {
  let filtered = rooms
  if (props.floorFilter) {
    filtered = filtered.filter(room => room.floor === props.floorFilter)
  }
  if (props.capacityFilter) {
    const cap = parseInt(props.capacityFilter)
    filtered = filtered.filter(room => {
      if (cap === 5) return room.capacity <= 5
      if (cap === 10) return room.capacity > 5 && room.capacity <= 10
      if (cap === 20) return room.capacity > 10 && room.capacity <= 20
      return room.capacity > 20
    })
  }
  return filtered
}

const getRoomStatusType = (status) => {
  const types = {
    available: 'success',
    occupied: 'warning',
    maintenance: 'info',
    locked: 'danger'
  }
  return types[status] || 'info'
}

const getRoomStatusText = (status) => {
  const texts = {
    available: '可预约',
    occupied: '已预约',
    maintenance: '维护中',
    locked: '已锁定'
  }
  return texts[status] || '未知'
}
</script>

<style lang="scss" scoped>
.left-panel {
  width: 280px;
  min-width: 280px;
  background: #fff;
  border-radius: 4px;
  padding: 12px;
  overflow-y: auto;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
  margin-right: 12px;

  .panel-title {
    font-size: 15px;
    font-weight: 600;
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 2px solid #409eff;
  }

  .room-list {
    .room-group {
      margin-bottom: 16px;

      .group-title {
        font-size: 13px;
        font-weight: 600;
        color: #606266;
        margin-bottom: 8px;
      }

      .room-card {
        padding: 10px;
        margin-bottom: 8px;
        background: #f5f7fa;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.3s;
        border: 2px solid transparent;

        &:hover {
          background: #ecf5ff;
          border-color: #409eff;
        }

        &.room-selected {
          background: #ecf5ff;
          border-color: #409eff;
        }

        &.room-unavailable {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .room-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 6px;

          .room-name {
            font-weight: 600;
            color: #303133;
            font-size: 14px;
          }
        }

        .room-info {
          display: flex;
          gap: 12px;
          font-size: 12px;
          color: #909399;
          margin-bottom: 6px;
        }

        .room-equipments {
          display: flex;
          gap: 4px;
          flex-wrap: wrap;

          .equipment-tag {
            margin: 0;
            font-size: 11px;
          }
        }
      }
    }
  }
}
</style>
