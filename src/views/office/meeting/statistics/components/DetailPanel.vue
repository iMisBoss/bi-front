<template>
  <div class="detail-panel">
    <!-- 核心数据详情 -->
    <el-card shadow="never" class="panel-card">
      <template #header>
        <div class="card-header">
          <span>核心数据详情</span>
        </div>
      </template>

      <div class="data-section">
        <div class="section-title">同比/环比分析</div>
        <div class="comparison-list">
          <div class="comparison-item">
            <span class="label">本月会议数</span>
            <span class="value">320场</span>
            <el-tag size="small" type="success">同比 ↓12%</el-tag>
          </div>
          <div class="comparison-item">
            <span class="label">会议室利用率</span>
            <span class="value">68%</span>
            <el-tag size="small" type="success">环比 ↑5%</el-tag>
          </div>
          <div class="comparison-item">
            <span class="label">平均参会率</span>
            <span class="value">82%</span>
            <el-tag size="small" type="danger">同比 ↓3%</el-tag>
          </div>
          <div class="comparison-item">
            <span class="label">纪要完成率</span>
            <span class="value">88%</span>
            <el-tag size="small" type="success">环比 ↑2%</el-tag>
          </div>
        </div>
      </div>

      <el-divider />

      <div class="data-section">
        <div class="section-title">TOP3 排行榜</div>
        <div class="rank-list">
          <div class="rank-category">
            <div class="category-title">利用率最高的会议室</div>
            <div class="rank-item" v-for="(item, index) in topRooms" :key="index">
              <el-tag :type="index === 0 ? 'danger' : index === 1 ? 'warning' : 'info'" size="small">
                {{ index + 1 }}
              </el-tag>
              <span class="name">{{ item.name }}</span>
              <span class="value">{{ item.usage }}%</span>
            </div>
          </div>

          <div class="rank-category">
            <div class="category-title">参会率最低的部门</div>
            <div class="rank-item" v-for="(item, index) in lowAttendanceDepts" :key="index">
              <el-tag :type="index === 0 ? 'danger' : index === 1 ? 'warning' : 'info'" size="small">
                {{ index + 1 }}
              </el-tag>
              <span class="name">{{ item.name }}</span>
              <span class="value">{{ item.rate }}%</span>
            </div>
          </div>
        </div>
      </div>

      <el-divider />

      <div class="data-section" v-if="hasClassifiedData">
        <div class="section-title">
          <el-icon color="#f56c6c"><Lock /></el-icon>
          涉密会议统计
        </div>
        <div class="classified-stats">
          <div class="stat-item">
            <span class="label">涉密会议数</span>
            <span class="value danger">15场</span>
          </div>
          <div class="stat-item">
            <span class="label">占比</span>
            <span class="value">4.7%</span>
          </div>
          <div class="stat-item">
            <span class="label">合规率</span>
            <span class="value success">100%</span>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 异常预警区 -->
    <el-card shadow="never" class="panel-card warning-card">
      <template #header>
        <div class="card-header">
          <span>异常预警</span>
          <el-badge :value="warnings.length" :max="99" class="badge" />
        </div>
      </template>

      <div class="warning-list">
        <div
            v-for="(warning, index) in warnings"
            :key="index"
            class="warning-item"
            :class="warning.level"
            @click="handleWarningClick(warning)"
        >
          <div class="warning-header">
            <el-icon class="warning-icon">
              <component :is="getWarningIcon(warning.level)" />
            </el-icon>
            <span class="warning-level">{{ getWarningLevelText(warning.level) }}</span>
            <el-tag size="small" :type="getWarningTagType(warning.level)">
              {{ warning.metric }}
            </el-tag>
          </div>
          <div class="warning-content">
            <div class="metric-value">{{ warning.value }}</div>
            <div class="suggestion">{{ warning.suggestion }}</div>
          </div>
          <div class="warning-action">
            <el-button type="primary" link size="small">
              立即处理 →
            </el-button>
          </div>
        </div>

        <el-empty v-if="warnings.length === 0" description="暂无预警" :image-size="80" />
      </div>
    </el-card>

    <!-- 智能优化建议 -->
    <el-card shadow="never" class="panel-card suggestion-card">
      <template #header>
        <div class="card-header">
          <span>智能优化建议</span>
          <el-icon><Lightbulb /></el-icon>
        </div>
      </template>

      <div class="suggestion-list">
        <div
            v-for="(suggestion, index) in suggestions"
            :key="index"
            class="suggestion-item"
        >
          <div class="suggestion-header">
            <el-tag :type="getSuggestionType(suggestion.type)" size="small">
              {{ getSuggestionTypeName(suggestion.type) }}
            </el-tag>
            <span class="title">{{ suggestion.title }}</span>
          </div>
          <div class="suggestion-content">
            {{ suggestion.content }}
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Lock, Lightbulb, Warning, CircleClose, InfoFilled } from '@element-plus/icons-vue'

const props = defineProps({
  statsData: {
    type: Object,
    required: true
  },
  warnings: {
    type: Array,
    default: () => []
  },
  suggestions: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['handle-warning'])

const hasClassifiedData = computed(() => {
  // TODO: 根据用户权限判断是否显示涉密数据
  return true
})

const topRooms = [
  { name: '3楼大会议室', usage: 92 },
  { name: '2楼中会议室', usage: 85 },
  { name: '1楼小会议室A', usage: 78 }
]

const lowAttendanceDepts = [
  { name: '销售部', rate: 72 },
  { name: '市场部', rate: 78 },
  { name: '运营部', rate: 82 }
]

const getWarningIcon = (level) => {
  const iconMap = {
    red: CircleClose,
    orange: Warning,
    yellow: InfoFilled
  }
  return iconMap[level] || InfoFilled
}

const getWarningLevelText = (level) => {
  const textMap = {
    red: '紧急',
    orange: '提醒',
    yellow: '注意'
  }
  return textMap[level] || '注意'
}

const getWarningTagType = (level) => {
  const typeMap = {
    red: 'danger',
    orange: 'warning',
    yellow: 'info'
  }
  return typeMap[level] || 'info'
}

const getSuggestionType = (type) => {
  const typeMap = {
    resource: 'success',
    efficiency: 'warning',
    compliance: 'danger'
  }
  return typeMap[type] || ''
}

const getSuggestionTypeName = (type) => {
  const nameMap = {
    resource: '资源优化',
    efficiency: '效率优化',
    compliance: '合规优化'
  }
  return nameMap[type] || type
}

const handleWarningClick = (warning) => {
  emit('handle-warning', warning)
}
</script>

<style lang="scss" scoped>
.detail-panel {
  width: 320px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;

  .panel-card {
    :deep(.el-card__header) {
      padding: 12px 16px;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 14px;
      font-weight: 600;
      color: #303133;
    }

    .data-section {
      .section-title {
        font-size: 13px;
        font-weight: 600;
        color: #303133;
        margin-bottom: 12px;
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .comparison-list {
        display: flex;
        flex-direction: column;
        gap: 8px;

        .comparison-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 12px;
          background: #f5f7fa;
          border-radius: 4px;

          .label {
            font-size: 12px;
            color: #909399;
          }

          .value {
            font-size: 14px;
            font-weight: 600;
            color: #303133;
          }
        }
      }

      .rank-list {
        display: flex;
        flex-direction: column;
        gap: 12px;

        .rank-category {
          .category-title {
            font-size: 12px;
            color: #606266;
            margin-bottom: 8px;
          }

          .rank-item {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 6px 8px;
            background: #f5f7fa;
            border-radius: 4px;
            margin-bottom: 6px;

            .name {
              flex: 1;
              font-size: 12px;
              color: #606266;
            }

            .value {
              font-size: 13px;
              font-weight: 600;
              color: #303133;
            }
          }
        }
      }

      .classified-stats {
        display: flex;
        flex-direction: column;
        gap: 8px;

        .stat-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 12px;
          background: #fef0f0;
          border-radius: 4px;

          .label {
            font-size: 12px;
            color: #909399;
          }

          .value {
            font-size: 14px;
            font-weight: 600;

            &.danger {
              color: #f56c6c;
            }

            &.success {
              color: #67c23a;
            }
          }
        }
      }
    }
  }

  .warning-card {
    .warning-list {
      display: flex;
      flex-direction: column;
      gap: 10px;

      .warning-item {
        padding: 12px;
        border-radius: 4px;
        border-left: 3px solid;
        cursor: pointer;
        transition: all 0.3s;

        &:hover {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        &.red {
          background: #fef0f0;
          border-left-color: #f56c6c;
        }

        &.orange {
          background: #fdf6ec;
          border-left-color: #e6a23c;
        }

        &.yellow {
          background: #f4f4f5;
          border-left-color: #909399;
        }

        .warning-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;

          .warning-icon {
            font-size: 16px;
          }

          .warning-level {
            font-size: 12px;
            font-weight: 600;
            color: #303133;
          }
        }

        .warning-content {
          margin-bottom: 8px;

          .metric-value {
            font-size: 18px;
            font-weight: 600;
            color: #303133;
            margin-bottom: 4px;
          }

          .suggestion {
            font-size: 12px;
            color: #606266;
            line-height: 1.5;
          }
        }

        .warning-action {
          text-align: right;
        }
      }
    }
  }

  .suggestion-card {
    .suggestion-list {
      display: flex;
      flex-direction: column;
      gap: 10px;

      .suggestion-item {
        padding: 12px;
        background: #f5f7fa;
        border-radius: 4px;

        .suggestion-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;

          .title {
            font-size: 13px;
            font-weight: 600;
            color: #303133;
          }
        }

        .suggestion-content {
          font-size: 12px;
          color: #606266;
          line-height: 1.6;
        }
      }
    }
  }
}
</style>
