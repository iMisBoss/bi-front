<template>
  <div class="version-diff">
    <div class="diff-toolbar">
      <el-button type="primary" size="default" icon="Download" @click="handleExportDiff">导出差异报告</el-button>
      <el-button size="default" icon="Refresh" @click="handleRefreshDiff">刷新对比</el-button>
    </div>

    <el-table :data="diffList" border style="width: 100%" max-height="400" :row-class-name="diffRowClassName">
      <el-table-column prop="category" label="对比维度" width="120" />
      <el-table-column prop="fieldName" label="字段/项名称" min-width="150" />
      <el-table-column prop="originalValue" :label="'原版本 V' + originalVersion" min-width="200" show-overflow-tooltip />
      <el-table-column prop="newValue" :label="'新版本 V' + newVersion" min-width="200" show-overflow-tooltip />
      <el-table-column prop="changeType" label="差异类型" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="getChangeTypeTag(row.changeType)" size="small">
            {{ getChangeTypeText(row.changeType) }}
          </el-tag>
        </template>
      </el-table-column>
    </el-table>

    <el-empty v-if="diffList.length === 0" description="暂无差异，当前新版本与原版本配置一致" />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  originalVersion: {
    type: String,
    default: '1.0'
  },
  newVersion: {
    type: String,
    default: '1.1'
  },
  diffData: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['refresh'])

const diffList = ref(props.diffData || [])

watch(() => props.diffData, (newVal) => {
  diffList.value = newVal || []
}, { deep: true })

const handleExportDiff = () => {
  ElMessage.info('导出差异报告功能开发中...')
}

const handleRefreshDiff = () => {
  emit('refresh')
  ElMessage.success('差异对比已刷新')
}

const diffRowClassName = ({ row }) => {
  if (row.changeType === '新增') return 'diff-row-add'
  if (row.changeType === '修改') return 'diff-row-modify'
  if (row.changeType === '删除') return 'diff-row-delete'
  return ''
}

const getChangeTypeTag = (type) => {
  const tags = {
    '新增': 'success',
    '修改': 'warning',
    '删除': 'danger'
  }
  return tags[type] || 'info'
}

const getChangeTypeText = (type) => {
  return type || '-'
}

defineExpose({
  diffList
})
</script>

<style scoped lang="scss">
.version-diff {
  .diff-toolbar {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;
  }

  :deep(.diff-row-add) {
    background-color: #f0f9eb !important;
  }

  :deep(.diff-row-modify) {
    background-color: #fdf6ec !important;
  }

  :deep(.diff-row-delete) {
    background-color: #fef0f0 !important;
  }
}
</style>
