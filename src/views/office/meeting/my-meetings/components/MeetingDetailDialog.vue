<template>
  <el-dialog
      :model-value="visible"
      @update:model-value="$emit('update:visible', $event)"
      title="会议详情"
      width="800px"
      top="5vh"
      :close-on-click-modal="false"
  >
    <div class="meeting-detail" v-if="meeting">
      <!-- 基本信息 -->
      <el-card shadow="never" class="detail-section">
        <template #header>
          <div class="section-title">
            <el-icon><InfoFilled /></el-icon>
            <span>基本信息</span>
          </div>
        </template>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="会议编号">{{ meeting.meetingNo }}</el-descriptions-item>
          <el-descriptions-item label="会议标题">{{ meeting.title }}</el-descriptions-item>
          <el-descriptions-item label="会议类型">{{ meeting.typeName }}</el-descriptions-item>
          <el-descriptions-item label="会议状态">
            <el-tag :type="getStatusType(meeting.status)">{{ meeting.statusName }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="开始时间">{{ meeting.startTime }}</el-descriptions-item>
          <el-descriptions-item label="结束时间">{{ meeting.endTime }}</el-descriptions-item>
          <el-descriptions-item label="会议地点" :span="2">
            <span v-if="meeting.isOnline">🎥 线上会议（{{ meeting.onlineUrl }}）</span>
            <span v-else>{{ meeting.location }}（{{ meeting.locationDetail }}）</span>
          </el-descriptions-item>
          <el-descriptions-item label="发起人">{{ meeting.initiator }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ meeting.createTime }}</el-descriptions-item>
          <el-descriptions-item label="会议描述" :span="2">
            <div class="description-content">{{ meeting.description }}</div>
          </el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- 参会人员 -->
      <el-card shadow="never" class="detail-section">
        <template #header>
          <div class="section-title">
            <el-icon><UserFilled /></el-icon>
            <span>参会人员（{{ meeting.totalCount }}人）</span>
          </div>
        </template>
        <div class="attendees-list">
          <div class="attendee-item" v-for="attendee in meeting.attendees" :key="attendee.id">
            <el-avatar :size="32">{{ attendee.name.charAt(0) }}</el-avatar>
            <div class="attendee-info">
              <div class="attendee-name">{{ attendee.name }} - {{ attendee.department }}</div>
              <div class="attendee-status">
                <el-tag :type="getAttendStatusType(attendee.status)" size="small">{{ attendee.statusName }}</el-tag>
                <span v-if="attendee.reason" class="attendee-reason">（{{ attendee.reason }}）</span>
              </div>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 会议纪要 -->
      <el-card shadow="never" class="detail-section" v-if="meeting.minutes">
        <template #header>
          <div class="section-title">
            <el-icon><Document /></el-icon>
            <span>会议纪要</span>
          </div>
        </template>
        <div class="minutes-content">{{ meeting.minutes }}</div>
      </el-card>

      <!-- 会议附件 -->
      <el-card shadow="never" class="detail-section" v-if="meeting.attachments && meeting.attachments.length > 0">
        <template #header>
          <div class="section-title">
            <el-icon><Paperclip /></el-icon>
            <span>会议附件</span>
          </div>
        </template>
        <el-table :data="meeting.attachments" border size="small">
          <el-table-column prop="name" label="文件名称" min-width="200" />
          <el-table-column prop="size" label="文件大小" width="100" />
          <el-table-column prop="uploader" label="上传人" width="100" />
          <el-table-column label="操作" width="100" align="center">
            <template #default="{ row }">
              <el-button link type="primary" size="small" @click="handleDownload(row)">下载</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>
    <template #footer>
      <el-button @click="$emit('update:visible', false)">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'
import { ElMessage } from 'element-plus'
import { InfoFilled, UserFilled, Document, Paperclip } from '@element-plus/icons-vue'

defineProps({
  visible: Boolean,
  meeting: Object
})

defineEmits(['update:visible'])

const getStatusType = (status) => {
  const types = {
    upcoming: 'primary',
    ongoing: 'success',
    finished: 'info',
    cancelled: 'warning'
  }
  return types[status] || 'info'
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

const handleDownload = (file) => {
  ElMessage.success('下载成功')
}
</script>

<style lang="scss" scoped>
.meeting-detail {
  max-height: calc(100vh - 200px);
  overflow-y: auto;

  .detail-section {
    margin-bottom: 16px;

    :deep(.el-card__header) {
      padding: 12px 20px;
      background: #fafafa;
    }

    .section-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 15px;
      font-weight: 600;
      color: #303133;
    }

    .description-content {
      line-height: 1.8;
      white-space: pre-wrap;
    }

    .attendees-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 12px;

      .attendee-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        background: #f5f7fa;
        border-radius: 4px;

        .attendee-info {
          flex: 1;

          .attendee-name {
            font-weight: 600;
            margin-bottom: 4px;
          }

          .attendee-status {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 12px;

            .attendee-reason {
              color: #909399;
            }
          }
        }
      }
    }

    .minutes-content {
      line-height: 1.8;
      white-space: pre-wrap;
      padding: 12px;
      background: #f5f7fa;
      border-radius: 4px;
    }
  }
}
</style>
