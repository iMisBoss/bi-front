<!-- src/views/process/design/form/design/components/DetailTableField.vue -->
<template>
  <div
      class="detail-table-field"
      :class="{ active: isActive }"
      @click.stop="$emit('select', field)"
      @dblclick.stop="$emit('config', field)"
  >
    <div class="field-toolbar" v-if="isActive">
      <el-icon @click.stop="$emit('move', -1)" title="上移"><Top /></el-icon>
      <el-icon @click.stop="$emit('move', 1)" title="下移"><Bottom /></el-icon>
      <el-icon @click.stop="$emit('config', field)" title="配置列" class="config"><Setting /></el-icon>
      <el-icon @click.stop="$emit('delete')" title="删除" class="del"><Delete /></el-icon>
    </div>
    <div class="detail-table-content">
      <div class="detail-table-header">
        <span class="detail-title">{{ field.label }}</span>
        <el-tag size="small" type="info" style="margin-right: 8px">双击配置列</el-tag>
        <el-button size="small" type="primary" icon="Plus" @click.stop="$emit('add-row', field)">新增行</el-button>
      </div>
      <el-table :data="field.rows || []" border size="small" style="width: 100%">
        <el-table-column
            v-for="col in field.columns"
            :key="col.code"
            :prop="col.code"
            :label="col.label"
            :width="col.width"
        >
          <template #default="{ row }">
            <el-input v-if="col.type === 'input'" v-model="row[col.code]" size="small" placeholder="请输入" />
            <el-input-number v-else-if="col.type === 'number'" v-model="row[col.code]" size="small" style="width: 100%" />
            <el-select v-else-if="col.type === 'select'" v-model="row[col.code]" size="small" />
            <el-date-picker v-else-if="col.type === 'date'" v-model="row[col.code]" size="small" />
            <span v-else>{{ row[col.code] || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="60" align="center">
          <template #default="{ $index }">
            <el-button size="small" type="danger" link @click.stop="$emit('remove-row', field, $index)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { Top, Bottom, Setting, Delete } from '@element-plus/icons-vue'

defineProps({
  field: {
    type: Object,
    required: true
  },
  isActive: {
    type: Boolean,
    default: false
  }
})

defineEmits(['select', 'config', 'move', 'delete', 'add-row', 'remove-row'])
</script>

<style scoped lang="scss">
.detail-table-field {
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

  .detail-table-content {
    padding: 16px;

    .detail-table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;

      .detail-title {
        font-size: 14px;
        font-weight: 600;
        color: #303133;
      }
    }
  }
}
</style>
