<template>
  <div class="my-bookings-view">
    <el-table :data="myBookings" border stripe v-loading="loading">
      <el-table-column prop="roomName" label="会议室" width="150" />
      <el-table-column prop="title" label="预约主题" min-width="180" show-overflow-tooltip />
      <el-table-column prop="startTime" label="开始时间" width="160" />
      <el-table-column prop="endTime" label="结束时间" width="160" />
      <el-table-column label="审批状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="getApprovalStatusType(row.approvalStatus)" size="small">
            {{ row.approvalStatusName }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" align="center" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click="$emit('view-detail', row)">查看</el-button>
          <el-button
              v-if="canEditBooking(row)"
              link
              type="warning"
              size="small"
              @click="$emit('edit-booking', row)"
          >编辑</el-button>
          <el-button
              v-if="canCancelBooking(row)"
              link
              type="danger"
              size="small"
              @click="$emit('cancel-booking', row)"
          >取消</el-button>
          <el-button
              v-if="row.approvalStatus === 'pending'"
              link
              type="info"
              size="small"
              @click="$emit('withdraw-booking', row)"
          >撤销</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  myBookings: Array,
  loading: Boolean
})

const emit = defineEmits(['view-detail', 'edit-booking', 'cancel-booking', 'withdraw-booking'])

const canEditBooking = (row) => {
  return row.isMine && row.approvalStatus !== 'approved'
}

const canCancelBooking = (row) => {
  return row.isMine && row.approvalStatus !== 'rejected'
}

const getApprovalStatusType = (status) => {
  const types = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger'
  }
  return types[status] || 'info'
}
</script>

<style lang="scss" scoped>
.my-bookings-view {
  // 继承父级样式
}
</style>
