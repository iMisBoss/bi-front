<template>
  <el-drawer
      :model-value="visible"
      @update:model-value="$emit('update:visible', $event)"
      title="会议通知详情"
      size="600px"
  >
    <div v-if="notification" class="drawer-content">
      <!-- 基础信息区 -->
      <div class="info-section">
        <h3 class="section-title">会议信息</h3>
        <el-descriptions :column="1" border>
          <el-descriptions-item label="会议标题">{{ notification.title }}</el-descriptions-item>
          <el-descriptions-item label="会议类型">
            <el-tag :type="notification.typeColor" size="small">{{ notification.typeLabel }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="发起人">{{ notification.initiator }} · {{ notification.initiatorDept }}</el-descriptions-item>
          <el-descriptions-item label="会议时间">
            {{ notification.startTime }} 至 {{ notification.endTime }}
          </el-descriptions-item>
          <el-descriptions-item label="会议地点">{{ notification.location }}</el-descriptions-item>
          <el-descriptions-item label="签到方式">
            {{ notification.checkinMethod === 'qrcode' ? '二维码签到' : '手动签到' }}
          </el-descriptions-item>
          <el-descriptions-item label="会议议程" v-if="notification.agenda">
            <div class="agenda-content">{{ notification.agenda }}</div>
          </el-descriptions-item>
          <el-descriptions-item label="附件" v-if="notification.attachments && notification.attachments.length > 0">
            <div v-for="file in notification.attachments" :key="file.name" class="attachment-item">
              <el-icon><Document /></el-icon>
              <span>{{ file.name }}</span>
              <el-button link type="primary" size="small" @click="$emit('download', notification)">
                下载
              </el-button>
            </div>
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- 变更对比（仅变更通知显示） -->
      <div class="change-section" v-if="notification.changeInfo">
        <h3 class="section-title">变更对比</h3>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="原时间">
            <span class="old-value">{{ notification.changeInfo.oldTime }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="新时间">
            <span class="new-value">{{ notification.changeInfo.newTime }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="原地点">
            <span class="old-value">{{ notification.changeInfo.oldLocation }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="新地点">
            <span class="new-value">{{ notification.changeInfo.newLocation }}</span>
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- 动态操作区 -->
      <div class="action-section">
        <h3 class="section-title">快捷操作</h3>

        <!-- 会议邀请操作 -->
        <div v-if="notification.type === 'invite' && notification.status === 'pending'" class="action-group">
          <el-button type="primary" @click="$emit('confirm', notification)">确认参会</el-button>
          <el-button type="danger" @click="$emit('reject', notification)">拒绝参会</el-button>
          <el-button @click="$emit('leave', notification)">请假申请</el-button>
        </div>

        <!-- 会议提醒操作 -->
        <div v-if="notification.type === 'reminder' && notification.status === 'pending'" class="action-group">
          <el-button type="primary" @click="$emit('checkin', notification)">立即签到</el-button>
          <el-button @click="$emit('snooze')">延后15分钟提醒</el-button>
        </div>

        <!-- 会议变更操作 -->
        <div v-if="notification.type === 'change' && notification.status === 'pending'" class="action-group">
          <el-button type="primary" @click="$emit('confirm', notification)">确认知晓</el-button>
          <el-button @click="$emit('leave', notification)">请假申请</el-button>
        </div>

        <!-- 纪要通知操作 -->
        <div v-if="notification.type === 'agenda'" class="action-group">
          <el-button type="primary" @click="$emit('view-agenda', notification)">在线查看纪要</el-button>
          <el-button @click="$emit('download', notification)">下载附件</el-button>
          <el-button @click="$emit('comment')">评论纪要</el-button>
        </div>

        <!-- 取消通知 -->
        <div v-if="notification.type === 'cancelled'" class="action-group">
          <el-alert
              :title="`会议已取消，取消原因：${notification.cancelReason || '未说明'}`"
              type="info"
              :closable="false"
              show-icon
          />
        </div>
      </div>

      <!-- 通知溯源区 -->
      <div class="trace-section" v-if="isInitiator || isAdmin">
        <h3 class="section-title">通知溯源</h3>
        <el-descriptions :column="1" border>
          <el-descriptions-item label="发送时间">{{ notification.sendTime }}</el-descriptions-item>
          <el-descriptions-item label="发送渠道">系统内消息</el-descriptions-item>
          <el-descriptions-item label="全员回执统计" v-if="isInitiator">
            <div class="stats-row">
              <span>已确认：{{ Math.floor(Math.random() * 10) }}人</span>
              <span style="margin-left: 16px">未确认：{{ Math.floor(Math.random() * 5) }}人</span>
              <span style="margin-left: 16px">已拒绝：{{ Math.floor(Math.random() * 2) }}人</span>
            </div>
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </div>
  </el-drawer>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'
import { Document } from '@element-plus/icons-vue'

const props = defineProps({
  visible: Boolean,
  notification: Object,
  userRole: String,
  isInitiator: Boolean,
  isAdmin: { type: Boolean, default: false }
})

const emit = defineEmits(['update:visible', 'confirm', 'reject', 'leave', 'checkin', 'view-agenda', 'download', 'snooze', 'comment'])
</script>

<style lang="scss" scoped>
.drawer-content {
  padding: 0 20px;

  .info-section,
  .change-section,
  .action-section,
  .trace-section {
    margin-bottom: 24px;

    .section-title {
      font-size: 15px;
      font-weight: 600;
      color: #303133;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 2px solid #409eff;
    }
  }

  .agenda-content {
    white-space: pre-wrap;
    line-height: 1.6;
  }

  .attachment-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px;
    background: #f5f7fa;
    border-radius: 4px;
    margin-bottom: 8px;
  }

  .old-value {
    color: #909399;
    text-decoration: line-through;
  }

  .new-value {
    color: #409eff;
    font-weight: 600;
  }

  .action-group {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }

  .stats-row {
    display: flex;
    gap: 16px;
    font-size: 13px;
    color: #606266;
  }
}
</style>
