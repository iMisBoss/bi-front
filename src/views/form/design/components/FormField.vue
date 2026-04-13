<!-- src/views/process/design/form/design/components/FormField.vue -->
<template>
  <div
      class="form-field"
      :class="{ active: isActive, 'is-system': field.sys }"
      @click.stop="$emit('select', field)"
  >
    <div class="field-toolbar" v-if="isActive">
      <el-icon @click.stop="$emit('move', -1)" title="上移"><Top /></el-icon>
      <el-icon @click.stop="$emit('move', 1)" title="下移"><Bottom /></el-icon>
      <el-icon @click.stop="$emit('copy')" title="复制"><CopyDocument /></el-icon>
      <el-icon v-if="!field.sys" @click.stop="$emit('delete')" title="删除" class="del"><Delete /></el-icon>
    </div>
    <div class="field-content">
      <div class="field-label">
        <span v-if="field.required" class="required">*</span>
        {{ field.label }}
      </div>
      <div class="field-control">
        <el-input v-if="field.type === 'input'" placeholder="请输入" disabled />
        <el-input v-else-if="field.type === 'textarea'" type="textarea" :rows="3" disabled />
        <el-input-number v-else-if="field.type === 'number'" disabled style="width: 100%" />
        <el-select v-else-if="field.type === 'select'" disabled />
        <el-radio-group v-else-if="field.type === 'radio'" disabled />
        <el-checkbox-group v-else-if="field.type === 'checkbox'" disabled />
        <el-date-picker v-else-if="field.type === 'date'" disabled />
        <el-switch v-else-if="field.type === 'switch'" disabled />
        <el-input v-else placeholder="组件预览" disabled />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Top, Bottom, CopyDocument, Delete } from '@element-plus/icons-vue'

const props = defineProps({
  field: {
    type: Object,
    required: true
  },
  isActive: {
    type: Boolean,
    default: false
  }
})

defineEmits(['select', 'move', 'copy', 'delete'])
</script>

<style scoped lang="scss">
.form-field {
  background: #fff;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 12px;
  border: 2px solid transparent;
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

  &.is-system {
    background: #fafafa;
  }

  &.nested {
    margin-bottom: 8px;
    padding: 12px;
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
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.4);

    .el-icon {
      cursor: pointer;
      padding: 2px;
      &:hover { background: rgba(255,255,255,.2); }
    }

    .config:hover { background: #67c23a; }
    .del:hover { background: #f56c6c; }
  }

  .field-content {
    .field-label {
      font-size: 14px;
      margin-bottom: 8px;
      font-weight: 500;
      color: #303133;

      .required {
        color: #f56c6c;
        margin-right: 4px;
      }
    }
  }
}
</style>
