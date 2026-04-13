<template>
  <div class="left-panel">
    <div class="panel-section">
      <div class="section-title">可见范围规则</div>
      <el-table
          :data="rules"
          border
          @row-click="handleSelectRule"
          highlight-current-row
          class="rule-table"
      >
        <el-table-column prop="name" label="规则名称" width="140" />
        <el-table-column prop="target" label="适用对象" width="120" />
        <el-table-column prop="scope" label="可见范围" width="120" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 'enabled' ? 'success' : 'info'" size="small">
              {{ row.status === 'enabled' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click.stop="$emit('edit-rule', row)">编辑</el-button>
            <el-button
                v-if="row.status === 'enabled'"
                link
                type="warning"
                size="small"
                @click.stop="$emit('disable-rule', row)"
            >
              禁用
            </el-button>
            <el-button
                v-else
                link
                type="success"
                size="small"
                @click.stop="$emit('enable-rule', row)"
            >
              启用
            </el-button>
            <el-button link type="danger" size="small" @click.stop="$emit('delete-rule', row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="panel-section">
      <div class="section-title">展示字段配置</div>
      <el-table
          :data="fields"
          border
          @row-click="handleSelectField"
          highlight-current-row
      >
        <el-table-column prop="name" label="字段名称" width="120" />
        <el-table-column prop="normalPermission" label="普通员工权限" width="120" />
        <el-table-column prop="adminPermission" label="管理层权限" width="120" />
        <el-table-column prop="maskRule" label="脱敏规则" width="100" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 'enabled' ? 'success' : 'info'" size="small">
              {{ row.status === 'enabled' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="80">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click.stop="$emit('edit-field', row)">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup>
defineProps({
  rules: {
    type: Array,
    default: () => []
  },
  fields: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits([
  'edit-rule',
  'disable-rule',
  'enable-rule',
  'delete-rule',
  'edit-field',
  'select-rule',
  'select-field'
])

const handleSelectRule = (row) => {
  emit('select-rule', row)
}

const handleSelectField = (row) => {
  emit('select-field', row)
}
</script>

<style lang="scss" scoped>
.left-panel {
  width: 60%;
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow-y: auto;

  .panel-section {
    .section-title {
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 12px;
      color: #303133;
    }

    .rule-table {
      :deep(.el-table__body) {
        cursor: pointer;
      }
    }
  }
}
</style>
