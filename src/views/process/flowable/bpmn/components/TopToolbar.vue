
<template>
  <!-- 顶部操作区（可折叠） -->
  <div class="top-toolbar" v-show="!collapsed">
    <div class="toolbar-content">
      <!-- 左侧：流程基础信息 -->
      <div class="flow-info-group">
        <div class="info-item">
          <span class="info-label">流程名称</span>
          <el-input v-model="localFlowInfo.name" placeholder="请输入流程名称" class="info-input" @input="handleUpdate" />
        </div>
        <div class="info-item">
          <span class="info-label">流程分类</span>
          <el-select v-model="localFlowInfo.category" placeholder="请选择" class="info-select" @change="handleUpdate">
            <el-option label="人事类" value="hr" />
            <el-option label="财务类" value="finance" />
            <el-option label="行政类" value="admin" />
            <el-option label="其他" value="other" />
          </el-select>
        </div>
        <div class="info-item">
          <span class="info-label">流程状态</span>
          <el-tag :type="statusType" size="small">{{ statusText }}</el-tag>
        </div>
      </div>

      <!-- 右侧：操作按钮 -->
      <div class="action-buttons">
        <el-button size="small" type="info" @click="$emit('save')">
          <el-icon><Document /></el-icon>
          保存
        </el-button>
        <el-button size="small" type="primary" @click="$emit('publish')">
          <el-icon><Promotion /></el-icon>
          发布
        </el-button>
        <el-button size="small" type="success" @click="$emit('test')">
          <el-icon><CircleCheck /></el-icon>
          测试
        </el-button>
        <el-divider direction="vertical" />
        <el-button size="small" @click="$emit('preview')">
          <el-icon><View /></el-icon>
          预览
        </el-button>
        <el-button size="small" @click="$emit('import')">
          <el-icon><Download /></el-icon>
          导入
        </el-button>
        <el-button size="small" @click="$emit('export')">
          <el-icon><Upload /></el-icon>
          导出
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>import { ref, computed, watch } from 'vue'
import {
  Document, Promotion, CircleCheck,
  View, Download, Upload, ArrowUp, ArrowDown
} from '@element-plus/icons-vue'

const props = defineProps({
  flowInfo: {
    type: Object,
    required: true
  },
  collapsed: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:flow-info', 'save', 'publish', 'test', 'preview', 'import', 'export', 'toggle-top'])

// 本地副本
const localFlowInfo = ref({ ...props.flowInfo })

// 监听 props 变化
watch(() => props.flowInfo, (newVal) => {
  localFlowInfo.value = { ...newVal }
}, { deep: true })

// 状态文本
const statusText = computed(() => {
  const statusMap = {
    draft: '草稿',
    published: '已发布',
    deprecated: '已停用'
  }
  return statusMap[localFlowInfo.value.status] || '草稿'
})

// 状态类型
const statusType = computed(() => {
  const typeMap = {
    draft: 'info',
    published: 'success',
    deprecated: 'danger'
  }
  return typeMap[localFlowInfo.value.status] || 'info'
})

// 更新流程信息
const handleUpdate = () => {
  emit('update:flow-info', { ...localFlowInfo.value })
}
</script>

<style scoped lang="scss">
.top-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
}

.top-toolbar {
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  padding: 12px 20px;

  .toolbar-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 20px;
    flex-wrap: nowrap;
  }

  .flow-info-group {
    display: flex;
    align-items: center;
    gap: 16px;
    flex: 1;
    min-width: 0;

    .info-item {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-shrink: 0;

      .info-label {
        font-size: 13px;
        color: #606266;
        white-space: nowrap;
      }

      .info-input {
        width: 200px;
      }

      .info-select {
        width: 140px;
      }
    }
  }

  .action-buttons {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }
}
</style>