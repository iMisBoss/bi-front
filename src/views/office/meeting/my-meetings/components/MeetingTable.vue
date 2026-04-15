<template>
  <div class="meeting-table">
    <el-table
        :data="meetings"
        v-loading="loading"
        border
        stripe
        @selection-change="$emit('selection-change', $event)"
        @row-click="$emit('row-click', $event)"
        highlight-current-row
        :row-style="{ cursor: 'pointer' }"
    >
      <el-table-column v-if="showCheckbox" type="selection" width="55" fixed="left" />
      <el-table-column label="会议状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)" size="small">{{ row.statusName }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="title" label="会议标题" min-width="200" show-overflow-tooltip>
        <template #default="{ row }">
          <span>{{ row.title }}</span>
          <el-tag v-if="row.isSecret" type="danger" size="small" style="margin-left: 8px">涉密</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="type" label="会议类型" width="120" align="center">
        <template #default="{ row }">
          <el-tag :type="getTypeColor(row.type)" size="small">{{ row.typeName }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="time" label="时间" width="160" sortable />
      <el-table-column prop="location" label="地点" width="150" show-overflow-tooltip>
        <template #default="{ row }">
          <span v-if="row.isOnline">🎥 线上会议</span>
          <span v-else>{{ row.location }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="initiator" label="发起人" width="120" />
      <el-table-column prop="attendees" label="参会人数" width="100" align="center">
        <template #default="{ row }">
          <span>{{ row.confirmedCount }}/{{ row.totalCount }}</span>
        </template>
      </el-table-column>
      <el-table-column v-if="currentView === 'pending'" label="参会状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="getAttendStatusType(row.attendStatus)" size="small">{{ row.attendStatusName }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column v-if="currentView === 'cancelled'" label="取消原因" min-width="150" show-overflow-tooltip>
        <template #default="{ row }">
          {{ row.cancelReason }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="300" align="center" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click.stop="$emit('view', row)">查看</el-button>
          <el-button
              v-if="currentView === 'pending' && !row.isConfirmed"
              link
              type="success"
              size="small"
              @click.stop="$emit('confirm', row)"
          >确认参会</el-button>
          <el-button
              v-if="currentView === 'launched' && row.status === 'upcoming'"
              link
              type="warning"
              size="small"
              @click.stop="$emit('edit', row)"
          >编辑</el-button>
          <el-button
              v-if="currentView === 'launched' && row.status === 'upcoming'"
              link
              type="danger"
              size="small"
              @click.stop="$emit('cancel', row)"
          >取消</el-button>
          <el-button
              v-if="row.status === 'ongoing'"
              link
              type="success"
              size="small"
              @click.stop="$emit('join', row)"
          >进入会议</el-button>
          <el-button
              v-if="row.status === 'finished'"
              link
              type="primary"
              size="small"
              @click.stop="$emit('view-minutes', row)"
          >查看纪要</el-button>
          <el-button
              link
              type="warning"
              size="small"
              @click.stop="$emit('toggle-favorite', row)"
          >{{ row.isFavorite ? '取消收藏' : '收藏' }}</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

defineProps({
  meetings: Array,
  currentView: String,
  showCheckbox: Boolean,
  loading: Boolean
})

defineEmits(['selection-change', 'row-click', 'view', 'confirm', 'edit', 'cancel', 'join', 'view-minutes', 'toggle-favorite'])

const getStatusType = (status) => {
  const types = {
    upcoming: 'primary',
    ongoing: 'success',
    finished: 'info',
    cancelled: 'warning'
  }
  return types[status] || 'info'
}

const getTypeColor = (type) => {
  const colors = {
    department: 'primary',
    project: 'success',
    company: 'warning',
    online: 'info',
    secret: 'danger'
  }
  return colors[type] || 'info'
}

const getAttendStatusType = (status) => {
  const types = {
    confirmed: 'success',
    pending: 'warning',
    rejected: 'danger',
    leave: 'info'
  }
  return types[status] || 'info'
}
</script>

<style lang="scss" scoped>
.meeting-table {
  margin-bottom: 20px;
}
</style>
