<template>
  <el-dialog
      v-model="visible"
      title="操作审计日志"
      width="900px"
      @close="handleClose"
  >
    <el-table :data="logs" border max-height="400">
      <el-table-column prop="operator" label="操作人" width="120" />
      <el-table-column prop="operationTime" label="操作时间" width="180" />
      <el-table-column prop="operationType" label="操作类型" width="120">
        <template #default="{ row }">
          <el-tag :type="getOperationTypeTag(row.operationType)" size="small">
            {{ getOperationTypeText(row.operationType) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="fieldName" label="修改字段" width="120" />
      <el-table-column prop="oldValue" label="原值" min-width="120" show-overflow-tooltip />
      <el-table-column prop="newValue" label="新值" min-width="120" show-overflow-tooltip />
      <el-table-column prop="ipAddress" label="IP地址" width="140" />
    </el-table>
  </el-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  logs: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue'])

const visible = ref(props.modelValue)

watch(() => props.modelValue, (val) => {
  visible.value = val
})

watch(visible, (val) => {
  emit('update:modelValue', val)
})

const handleClose = () => {
  visible.value = false
}

const getOperationTypeTag = (type) => {
  const tagMap = {
    create: 'success',
    update: 'warning',
    delete: 'danger',
    move: 'info'
  }
  return tagMap[type] || 'info'
}

const getOperationTypeText = (type) => {
  const textMap = {
    create: '新增',
    update: '修改',
    delete: '删除',
    move: '移动'
  }
  return textMap[type] || type
}
</script>
