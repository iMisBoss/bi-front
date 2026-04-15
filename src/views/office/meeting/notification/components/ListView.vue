<template>
  <div class="list-view">
    <el-table :data="notifications" border stripe @row-click="handleRowClick" @row-dblclick="handleRowDblClick">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="类型" width="120" align="center">
        <template #default="{ row }">
          <el-tag :type="row.typeColor" size="small">{{ row.typeLabel }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="title" label="会议标题" min-width="200" show-overflow-tooltip />
      <el-table-column label="发起人" width="150">
        <template #default="{ row }">
          {{ row.initiator }} · {{ row.initiatorDept }}
        </template>
      </el-table-column>
      <el-table-column prop="startTime" label="会议时间" width="170" />
      <el-table-column prop="location" label="地点" width="150" show-overflow-tooltip />
      <el-table-column label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)" size="small">
            {{ row.statusLabel }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="sendTimeDisplay" label="发送时间" width="120" align="center" />
      <el-table-column label="操作" width="200" align="center" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click.stop="handleClick(row)">
            查看
          </el-button>
          <template v-if="row.status === 'pending' && row.type === 'invite'">
            <el-button link type="success" size="small" @click.stop="$emit('confirm', row)">
              确认
            </el-button>
            <el-button link type="danger" size="small" @click.stop="$emit('reject', row)">
              拒绝
            </el-button>
          </template>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  notifications: Array
})

const emit = defineEmits(['click', 'dblclick', 'confirm', 'reject'])

const handleRowClick = (row) => {
  emit('click', row)
}

const handleRowDblClick = (row) => {
  emit('dblclick', row)
}

const handleClick = (row) => {
  emit('click', row)
}

const getStatusType = (status) => {
  const types = {
    pending: 'warning',
    confirmed: 'success',
    rejected: 'danger',
    read: 'info',
    cancelled: 'info'
  }
  return types[status] || 'info'
}
</script>

<style lang="scss" scoped>
.list-view {
  // 继承父级样式
}
</style>
