<template>
  <el-dialog
      v-model="dialogVisible"
      width="800px"
      :close-on-click-modal="false"
      @close="handleClose"
      class="relation-log-dialog"
      append-to-body
  >
    <div class="dialog-header">
      <el-icon class="header-icon"><Document /></el-icon>
      <div class="header-text">
        <div class="header-title">操作日志</div>
        <div class="header-subtitle">{{ relationName }}</div>
      </div>
    </div>

    <div class="log-content">
      <!-- 时间线 -->
      <el-timeline>
        <el-timeline-item
            v-for="(log, index) in logList"
            :key="index"
            :timestamp="log.time"
            placement="top"
            :color="getTimelineColor(log.type)"
        >
          <div class="log-item">
            <div class="log-header">
              <el-tag :type="getLogTagType(log.type)" size="small" effect="light">
                {{ log.type }}
              </el-tag>
              <span class="log-operator">操作人：{{ log.operator }}</span>
            </div>
            <div class="log-body">
              <p class="log-action">{{ log.action }}</p>
              <div v-if="log.changes" class="log-changes">
                <div v-for="(change, idx) in log.changes" :key="idx" class="change-item">
                  <span class="change-field">{{ change.field }}：</span>
                  <span class="change-old">{{ change.oldValue || '-' }}</span>
                  <span class="change-arrow">→</span>
                  <span class="change-new">{{ change.newValue || '-' }}</span>
                </div>
              </div>
            </div>
          </div>
        </el-timeline-item>
      </el-timeline>

      <!-- 空状态 -->
      <el-empty
          v-if="logList.length === 0"
          description="暂无操作日志"
          :image-size="100"
      />
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">关闭</el-button>
        <el-button type="primary" plain icon="Download">导出日志</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Document } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: Boolean,
  relationName: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue'])

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

// 模拟日志数据
const logList = ref([
  {
    time: '2026-04-07 15:30:22',
    type: '创建',
    operator: '张三',
    action: '创建关联关系"加班记录"',
    changes: null
  },
  {
    time: '2026-04-07 14:20:15',
    type: '修改',
    operator: '李四',
    action: '修改关联说明',
    changes: [
      {
        field: '关联说明',
        oldValue: '关联加班记录',
        newValue: '关联加班记录表，记录员工加班时长和审批状态'
      }
    ]
  },
  {
    time: '2026-04-07 10:15:08',
    type: '停用',
    operator: '王五',
    action: '停用关联关系"加班记录"',
    changes: [
      {
        field: '状态',
        oldValue: '启用',
        newValue: '停用'
      }
    ]
  },
  {
    time: '2026-04-06 16:45:33',
    type: '启用',
    operator: '张三',
    action: '启用关联关系"加班记录"',
    changes: [
      {
        field: '状态',
        oldValue: '停用',
        newValue: '启用'
      }
    ]
  },
  {
    time: '2026-04-05 09:00:00',
    type: '创建',
    operator: '系统',
    action: '系统自动创建关联关系"加班记录"',
    changes: null
  }
])

// 获取时间线颜色
const getTimelineColor = (type) => {
  const colorMap = {
    '创建': '#67c23a',
    '修改': '#409eff',
    '停用': '#e6a23c',
    '启用': '#67c23a',
    '删除': '#f56c6c'
  }
  return colorMap[type] || '#909399'
}

// 获取标签类型
const getLogTagType = (type) => {
  const typeMap = {
    '创建': 'success',
    '修改': 'primary',
    '停用': 'warning',
    '启用': 'success',
    '删除': 'danger'
  }
  return typeMap[type] || 'info'
}

// 关闭弹窗
const handleClose = () => {
  emit('update:modelValue', false)
}
</script>

<style scoped lang="scss">
.relation-log-dialog {
  .el-dialog__header {
    padding: 0;
    border-bottom: none;
  }

  .dialog-header {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 20px 24px 16px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 8px 8px 0 0;
    margin: -24px -24px 20px;

    .header-icon {
      font-size: 28px;
      color: #fff;
      flex-shrink: 0;
    }

    .header-text {
      flex: 1;

      .header-title {
        font-size: 16px;
        font-weight: 600;
        color: #fff;
        margin-bottom: 4px;
      }

      .header-subtitle {
        font-size: 12px;
        color: rgba(255, 255, 255, 0.9);
      }
    }
  }

  .log-content {
    padding: 10px 20px;
    max-height: 500px;
    overflow-y: auto;

    .log-item {
      .log-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 8px;

        .log-operator {
          font-size: 13px;
          color: #909399;
        }
      }

      .log-body {
        .log-action {
          font-size: 14px;
          color: #303133;
          margin: 0 0 8px;
          line-height: 1.5;
        }

        .log-changes {
          background: #f5f7fa;
          padding: 12px 16px;
          border-radius: 6px;
          margin-top: 8px;

          .change-item {
            font-size: 13px;
            line-height: 1.8;

            .change-field {
              color: #606266;
              font-weight: 500;
            }

            .change-old {
              color: #f56c6c;
              text-decoration: line-through;
            }

            .change-arrow {
              color: #909399;
              margin: 0 6px;
            }

            .change-new {
              color: #67c23a;
              font-weight: 500;
            }
          }
        }
      }
    }

    :deep(.el-timeline-item__timestamp) {
      font-size: 12px;
      color: #909399;
    }
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding: 16px 24px 0;
    border-top: 1px solid #ebeef5;
  }
}
</style>
