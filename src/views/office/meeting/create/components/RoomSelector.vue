<template>
  <el-dialog
      v-model="visible"
      title="选择会议室"
      width="900px"
      top="5vh"
  >
    <div class="room-selector">
      <!-- 筛选栏 -->
      <div class="filter-bar">
        <el-select v-model="roomFilter.floor" placeholder="楼层" clearable style="width: 120px">
          <el-option label="1楼" value="1F" />
          <el-option label="2楼" value="2F" />
          <el-option label="3楼" value="3F" />
        </el-select>
        <el-select v-model="roomFilter.capacity" placeholder="容量" clearable style="width: 120px; margin-left: 8px">
          <el-option label="5人内" value="5" />
          <el-option label="6-10人" value="10" />
          <el-option label="11-20人" value="20" />
          <el-option label="20人以上" value="30" />
        </el-select>
        <el-checkbox-group v-model="roomFilter.equipments" style="margin-left: 16px">
          <el-checkbox label="projector">投影仪</el-checkbox>
          <el-checkbox label="video">视频会议</el-checkbox>
          <el-checkbox label="whiteboard">白板</el-checkbox>
        </el-checkbox-group>
      </div>

      <!-- 会议室列表 -->
      <el-table :data="filteredRooms" border style="margin-top: 16px">
        <el-table-column label="选择" width="60" align="center">
          <template #default="{ row }">
            <el-radio
                v-model="selectedRoomId"
                :label="row.id"
                :disabled="row.status === 'occupied' || row.status === 'maintenance'"
            />
          </template>
        </el-table-column>
        <el-table-column prop="name" label="会议室名称" width="150" />
        <el-table-column prop="capacity" label="容纳人数" width="100" align="center" />
        <el-table-column prop="location" label="位置" width="120" />
        <el-table-column label="设备" min-width="200">
          <template #default="{ row }">
            <el-tag
                v-for="eq in row.equipments"
                :key="eq"
                size="small"
                type="info"
                style="margin-right: 4px"
            >
              {{ eq }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getRoomStatusType(row.status)" size="small">
              {{ getRoomStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="confirmRoomSelection">确认选择</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { defineProps, defineEmits, ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  modelValue: Boolean,
  rooms: Array
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const roomFilter = reactive({
  floor: '',
  capacity: '',
  equipments: []
})

const selectedRoomId = ref('')

const filteredRooms = computed(() => {
  let result = props.rooms
  if (roomFilter.floor) {
    result = result.filter(r => r.floor === roomFilter.floor)
  }
  if (roomFilter.capacity) {
    const cap = parseInt(roomFilter.capacity)
    result = result.filter(r => {
      if (cap === 5) return r.capacity <= 5
      if (cap === 10) return r.capacity > 5 && r.capacity <= 10
      if (cap === 20) return r.capacity > 10 && r.capacity <= 20
      return r.capacity > 20
    })
  }
  return result
})

const getRoomStatusType = (status) => {
  const types = {
    available: 'success',
    occupied: 'warning',
    maintenance: 'info'
  }
  return types[status] || 'info'
}

const getRoomStatusText = (status) => {
  const texts = {
    available: '可预约',
    occupied: '已占用',
    maintenance: '维护中'
  }
  return texts[status] || '未知'
}

const confirmRoomSelection = () => {
  const room = props.rooms.find(r => r.id === selectedRoomId.value)
  if (room) {
    emit('confirm', room)
    visible.value = false
  } else {
    ElMessage.warning('请选择会议室')
  }
}
</script>

<style lang="scss" scoped>
.room-selector {
  .filter-bar {
    display: flex;
    align-items: center;
    gap: 8px;
  }
}
</style>
