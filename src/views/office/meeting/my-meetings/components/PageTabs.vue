<template>
  <div class="page-header">
    <div class="header-left">
      <el-tabs :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" @tab-change="$emit('change')">
        <el-tab-pane label="全部会议" name="all">
          <template #label>
            <span>全部会议</span>
            <span class="tab-badge">{{ stats.all }}</span>
          </template>
        </el-tab-pane>
        <el-tab-pane label="待我参与" name="pending">
          <template #label>
            <span>待我参与</span>
            <span class="tab-badge">{{ stats.pending }}</span>
          </template>
        </el-tab-pane>
        <el-tab-pane label="我发起的" name="launched">
          <template #label>
            <span>我发起的</span>
            <span class="tab-badge">{{ stats.launched }}</span>
          </template>
        </el-tab-pane>
        <el-tab-pane label="已结束" name="finished">
          <template #label>
            <span>已结束</span>
            <span class="tab-badge">{{ stats.finished }}</span>
          </template>
        </el-tab-pane>
        <el-tab-pane label="已取消" name="cancelled">
          <template #label>
            <span>已取消</span>
            <span class="tab-badge">{{ stats.cancelled }}</span>
          </template>
        </el-tab-pane>
        <el-tab-pane label="我的收藏" name="favorites">
          <template #label>
            <span>我的收藏</span>
            <span class="tab-badge">{{ stats.favorites }}</span>
          </template>
        </el-tab-pane>
      </el-tabs>
    </div>
    <div class="header-right">
      <el-button type="primary" @click="$emit('create')" icon="Plus">创建会议</el-button>
      <el-button @click="$emit('batch-export')" icon="Download" :disabled="selectedCount === 0">
        批量导出
      </el-button>
      <el-button @click="$emit('refresh')" icon="Refresh">刷新</el-button>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'
import { Plus, Download, Refresh } from '@element-plus/icons-vue'

defineProps({
  modelValue: String,
  stats: Object,
  selectedCount: Number
})

defineEmits(['update:modelValue', 'change', 'create', 'batch-export', 'refresh'])
</script>

<style lang="scss" scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #ebeef5;

  .header-left {
    flex: 1;

    :deep(.el-tabs__header) {
      margin: 0;
    }

    .tab-badge {
      margin-left: 6px;
      color: #409eff;
      font-size: 12px;
    }
  }

  .header-right {
    display: flex;
    gap: 8px;
  }
}
</style>
