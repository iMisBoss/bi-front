<!-- src/views/process/design/form/design/components/ContainerField.vue -->
<template>
  <div
      class="container-field"
      :class="{ active: isActive }"
      @click.stop="$emit('select', field)"
  >
    <div class="field-toolbar" v-if="isActive">
      <el-icon @click.stop="$emit('move', -1)" title="上移"><Top /></el-icon>
      <el-icon @click.stop="$emit('move', 1)" title="下移"><Bottom /></el-icon>
      <el-icon @click.stop="$emit('copy')" title="复制"><CopyDocument /></el-icon>
      <el-icon @click.stop="$emit('delete')" title="删除" class="del"><Delete /></el-icon>
    </div>

    <!-- 容器标题 -->
    <div v-if="field.type === 'group' || field.type === 'card'" class="container-header">
      <span class="container-title">{{ field.title || '未命名容器' }}</span>
    </div>

    <!-- 容器内容区 -->
    <div
        class="container-body"
        :class="`layout-${field.cols || 1}`"
        @drop.stop="$emit('drop-to-container', $event, field)"
        @dragover.stop="$emit('drag-over')"
        @dragenter.stop.prevent
    >
      <template v-for="(childField, childIndex) in field.children" :key="childField.id">
        <div
            class="form-field nested"
            :class="{ active: activeChild?.id === childField.id }"
            @click.stop="$emit('select-child', childField)"
        >
          <div class="field-toolbar" v-if="activeChild?.id === childField.id">
            <el-icon @click.stop="$emit('move-child', childIndex, -1)" title="上移"><Top /></el-icon>
            <el-icon @click.stop="$emit('move-child', childIndex, 1)" title="下移"><Bottom /></el-icon>
            <el-icon @click.stop="$emit('delete-child', childIndex)" title="删除" class="del"><Delete /></el-icon>
          </div>
          <div class="field-content">
            <div class="field-label">
              <span v-if="childField.required" class="required">*</span>
              {{ childField.label }}
            </div>
            <div class="field-control">
              <el-input v-if="childField.type === 'input'" placeholder="请输入" disabled />
              <el-input v-else-if="childField.type === 'textarea'" type="textarea" :rows="2" disabled />
              <el-input-number v-else-if="childField.type === 'number'" disabled style="width: 100%" />
              <el-select v-else-if="childField.type === 'select'" disabled />
              <el-date-picker v-else-if="childField.type === 'date'" disabled />
              <el-switch v-else-if="childField.type === 'switch'" disabled />
              <el-input v-else placeholder="组件预览" disabled />
            </div>
          </div>
        </div>
      </template>
      <el-empty v-if="!field.children || field.children.length === 0" description="拖拽组件到此容器" :image-size="60" />
    </div>
  </div>
</template>

<script setup>
import { Top, Bottom, CopyDocument, Delete } from '@element-plus/icons-vue'

defineProps({
  field: {
    type: Object,
    required: true
  },
  isActive: {
    type: Boolean,
    default: false
  },
  activeChild: {
    type: Object,
    default: null
  }
})

defineEmits([
  'select', 'move', 'copy', 'delete',
  'drop-to-container', 'drag-over',
  'select-child', 'move-child', 'delete-child'
])
</script>

<style scoped lang="scss">
.container-field {
  background: #fff;
  border: 2px solid transparent;
  border-radius: 8px;
  margin-bottom: 12px;
  position: relative;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

  &:hover {
    border-color: #c0c4cc;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }

  &.active {
    border-color: #409eff;
    box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2), 0 4px 12px rgba(0, 0, 0, 0.08);
  }

  .field-toolbar {
    position: absolute;
    top: -10px;
    right: 10px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 4px;
    border-radius: 4px;
    display: flex;
    gap: 4px;
    color: #fff;
    z-index: 10;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.4);

    .el-icon {
      cursor: pointer;
      padding: 2px;
      &:hover { background: rgba(255,255,255,.2); }
    }

    .del:hover { background: #f56c6c; }
  }

  .container-header {
    padding: 12px 16px;
    background: linear-gradient(135deg, #f5f7fa 0%, #e8eef5 100%);
    border-bottom: 1px solid #e8e8e8;
    border-radius: 8px 8px 0 0;

    .container-title {
      font-size: 14px;
      font-weight: 600;
      color: #303133;
    }
  }

  .container-body {
    padding: 16px;
    min-height: 100px;

    &.layout-1 {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    &.layout-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    &.layout-3 {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 12px;
    }
  }
}
</style>
