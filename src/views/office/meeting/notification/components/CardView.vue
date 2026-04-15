<template>
  <div class="card-view">
    <div
        v-for="notification in notifications"
        :key="notification.id"
        class="notification-card"
        :class="{
        'card-unread': !notification.isRead,
        'card-pending': notification.status === 'pending',
        'card-secret': notification.isSecret
      }"
        @click="handleClick(notification)"
        @dblclick="handleDblClick(notification)"
    >
      <div class="card-header">
        <div class="card-type">
          <el-tag :type="notification.typeColor" size="small">
            {{ notification.typeLabel }}
          </el-tag>
          <el-tag v-if="notification.isSecret" type="danger" size="small" style="margin-left: 8px">
            涉密
          </el-tag>
        </div>
        <div class="card-status">
          <el-tag :type="getStatusType(notification.status)" size="small">
            {{ notification.statusLabel }}
          </el-tag>
        </div>
      </div>

      <div class="card-content">
        <h3 class="card-title" :class="{ 'secret-mask': notification.isSecret && !notification.isRead }">
          {{ notification.isSecret && !notification.isRead ? '涉密会议通知' : notification.title }}
        </h3>
        <div class="card-info">
          <div class="info-item">
            <el-icon><User /></el-icon>
            <span>{{ notification.initiator }} · {{ notification.initiatorDept }}</span>
          </div>
          <div class="info-item">
            <el-icon><Clock /></el-icon>
            <span>{{ notification.startTime }}</span>
          </div>
          <div class="info-item">
            <el-icon><Location /></el-icon>
            <span>{{ notification.location }}</span>
          </div>
        </div>
      </div>

      <div class="card-footer">
        <div class="card-time">
          {{ notification.sendTimeDisplay }}
        </div>
        <div class="card-actions" @click.stop>
          <template v-if="notification.status === 'pending' && notification.type === 'invite'">
            <el-button type="primary" size="small" @click="$emit('confirm', notification)">
              确认参会
            </el-button>
            <el-button size="small" @click="$emit('reject', notification)">
              拒绝
            </el-button>
            <el-button size="small" @click="$emit('leave', notification)">
              请假
            </el-button>
          </template>
          <template v-if="notification.status === 'pending' && notification.type === 'reminder'">
            <el-button type="primary" size="small" @click="$emit('checkin', notification)">
              签到
            </el-button>
            <el-button size="small" @click="handleClick(notification)">
              查看详情
            </el-button>
          </template>
          <template v-if="notification.type === 'agenda'">
            <el-button type="primary" size="small" @click="$emit('view-agenda', notification)">
              查看纪要
            </el-button>
            <el-button size="small" @click="$emit('download', notification)">
              下载附件
            </el-button>
          </template>
          <template v-if="notification.type === 'cancelled'">
            <el-button size="small" @click="handleClick(notification)">
              查看详情
            </el-button>
          </template>
        </div>
      </div>
    </div>

    <el-empty v-if="notifications.length === 0" description="暂无通知" />
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'
import { User, Clock, Location } from '@element-plus/icons-vue'

const props = defineProps({
  notifications: Array,
  selectedIds: Array
})

const emit = defineEmits(['click', 'dblclick', 'confirm', 'reject', 'leave', 'checkin', 'view-agenda', 'download'])

const handleClick = (notification) => {
  emit('click', notification)
}

const handleDblClick = (notification) => {
  emit('dblclick', notification)
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
.card-view {
  display: flex;
  flex-direction: column;
  gap: 12px;

  .notification-card {
    padding: 16px;
    background: #fff;
    border: 1px solid #ebeef5;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    &.card-unread {
      border-left: 4px solid #409eff;
    }

    &.card-pending {
      background: #fff7e6;
      border-color: #ffe4b5;
    }

    &.card-secret {
      background: #fef0f0;
      border-color: #f56c6c;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    .card-content {
      margin-bottom: 12px;

      .card-title {
        font-size: 16px;
        font-weight: 600;
        color: #303133;
        margin: 0 0 8px 0;

        &.secret-mask {
          color: #909399;
        }
      }

      .card-info {
        display: flex;
        flex-direction: column;
        gap: 6px;
        font-size: 13px;
        color: #606266;

        .info-item {
          display: flex;
          align-items: center;
          gap: 6px;

          .el-icon {
            font-size: 14px;
            color: #909399;
          }
        }
      }
    }

    .card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 12px;
      border-top: 1px solid #f0f0f0;

      .card-time {
        font-size: 12px;
        color: #909399;
      }

      .card-actions {
        display: flex;
        gap: 8px;
      }
    }
  }
}
</style>
