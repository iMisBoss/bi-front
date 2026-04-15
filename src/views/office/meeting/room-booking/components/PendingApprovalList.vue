<template>
  <div class="pending-approval-view">
    <el-table :data="pendingBookings" border stripe v-loading="loading" @selection-change="$emit('selection-change', $event)">
      <el-table-column type="selection" width="55" />
      <el-table-column prop="booker" label="预约人" width="120" />
      <el-table-column prop="roomName" label="会议室" width="150" />
      <el-table-column prop="title" label="预约主题" min-width="180" show-overflow-tooltip />
      <el-table-column prop="startTime" label="开始时间" width="160" />
      <el-table-column prop="endTime" label="结束时间" width="160" />
      <el-table-column label="操作" width="150" align="center" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click="$emit('view-detail', row)">查看</el-button>
          <el-button link type="success" size="small" @click="$emit('approve-booking', row, 'approve')">通过</el-button>
          <el-button link type="danger" size="small" @click="$emit('approve-booking', row, 'reject')">驳回</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="batch-actions" v-if="selectedRows.length > 0">
      <el-button type="success" @click="$emit('batch-approve', 'approve')">批量通过</el-button>
      <el-button type="danger" @click="$emit('batch-approve', 'reject')">批量驳回</el-button>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  pendingBookings: Array,
  loading: Boolean,
  selectedRows: Array
})

const emit = defineEmits(['selection-change', 'view-detail', 'approve-booking', 'batch-approve'])
</script>

<style lang="scss" scoped>
.pending-approval-view {
  .batch-actions {
    margin-top: 16px;
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }
}
</style>
