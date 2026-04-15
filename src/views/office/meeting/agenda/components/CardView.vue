<template>
  <div class="card-view">
    <div
        v-for="record in records"
        :key="record.id"
        class="agenda-card"
        :class="{
        'card-pending': record.status === 'pending',
        'card-rejected': record.status === 'rejected',
        'card-secret': record.isSecret
      }"
        @click="$emit('click', record)"
    >
      <div class="card-header">
        <div class="card-status">
          <el-tag :type="record.statusColor" size="small">
            {{ record.statusLabel }}
          </el-tag>
          <el-tag v-if="record.isSecret" type="danger" size="small" style="margin-left: 8px">
            涉密
          </el-tag>
        </div>
        <div class="card-time">
          {{ record.lastEditTime | formatTime }}
        </div>
      </div>

      <div class="card-content">
        <h3 class="card-title">{{ record.title }}</h3>
        <div class="card-info">
          <div class="info-item">
            <el-icon><Calendar /></el-icon>
            <span>{{ record.meetingName }}</span>
          </div>
          <div class="info-item">
            <el-icon><User /></el-icon>
            <span>{{ record.initiator }} · {{ record.initiatorDept }}</span>
          </div>
          <div class="info-item">
            <el-icon><Clock /></el-icon>
            <span>{{ record.meetingTime }}</span>
          </div>
        </div>

        <div class="card-summary" v-if="record.decisions.length > 0">
          <div class="summary-label">核心决议：</div>
          <div class="summary-content">
            <div v-for="(decision, index) in record.decisions.slice(0, 2)" :key="index" class="decision-item">
              {{ decision }}
            </div>
          </div>
        </div>

        <div class="card-meta">
          <span class="meta-item">
            <el-icon><List /></el-icon>
            待办 {{ record.todoCount }} 项
          </span>
          <span class="meta-item">
            <el-icon><View /></el-icon>
            {{ getVisibilityText(record.visibility) }}
          </span>
          <span class="meta-item">
            <el-icon><Document /></el-icon>
            V{{ record.version }}
          </span>
        </div>
      </div>

      <div class="card-footer" @click.stop>
        <el-button link type="primary" size="small" @click="$emit('click', record)">
          查看
        </el-button>
        <el-button
            v-if="record.status === 'draft' || record.status === 'rejected'"
            link
            type="warning"
            size="small"
            @click="$emit('edit', record)"
        >
          编辑
        </el-button>
        <el-button
            v-if="record.status === 'draft' || record.status === 'rejected'"
            link
            type="success"
            size="small"
            @click="$emit('submit', record)"
        >
          提交审批
        </el-button>
        <el-button
            v-if="record.status === 'pending'"
            link
            type="primary"
            size="small"
            @click="$emit('publish', record)"
        >
          发布
        </el-button>
        <el-button link type="info" size="small" @click="$emit('export', record)">
          导出
        </el-button>
      </div>
    </div>

    <el-empty v-if="records.length === 0" description="暂无会议纪要" />
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'
import { Calendar, User, Clock, List, View, Document } from '@element-plus/icons-vue'

const props = defineProps({
  records: Array
})

const emit = defineEmits(['click', 'edit', 'submit', 'publish', 'export'])

const getVisibilityText = (visibility) => {
  const texts = {
    personal: '本人仅见',
    meeting: '参会人可见',
    department: '部门可见',
    company: '全公司可见',
    specific: '指定人员'
  }
  return texts[visibility] || '未知'
}
</script>

<style lang="scss" scoped>
.card-view {
  display: flex;
  flex-direction: column;
  gap: 12px;

  .agenda-card {
    padding: 16px;
    background: #fff;
    border: 1px solid #ebeef5;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    &.card-pending {
      background: #fff7e6;
      border-color: #ffe4b5;
    }

    &.card-rejected {
      background: #fef0f0;
      border-color: #f56c6c;
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

      .card-time {
        font-size: 12px;
        color: #909399;
      }
    }

    .card-content {
      .card-title {
        font-size: 16px;
        font-weight: 600;
        color: #303133;
        margin: 0 0 12px 0;
      }

      .card-info {
        display: flex;
        flex-direction: column;
        gap: 6px;
        margin-bottom: 12px;
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

      .card-summary {
        margin-bottom: 12px;
        padding: 12px;
        background: #f5f7fa;
        border-radius: 4px;

        .summary-label {
          font-size: 12px;
          color: #909399;
          margin-bottom: 6px;
        }

        .summary-content {
          .decision-item {
            font-size: 13px;
            color: #303133;
            margin-bottom: 4px;
            padding-left: 12px;
            position: relative;

            &::before {
              content: '?';
              position: absolute;
              left: 0;
              color: #409eff;
            }
          }
        }
      }

      .card-meta {
        display: flex;
        gap: 16px;
        font-size: 12px;
        color: #909399;

        .meta-item {
          display: flex;
          align-items: center;
          gap: 4px;

          .el-icon {
            font-size: 14px;
          }
        }
      }
    }

    .card-footer {
      display: flex;
      gap: 8px;
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid #f0f0f0;
    }
  }
}
</style>
