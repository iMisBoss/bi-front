<template>
  <el-dialog
      v-model="visible"
      title="修改记录"
      width="900px"
      :close-on-click-modal="false"
  >
    <el-table :data="historyList" stripe style="width: 100%">
      <el-table-column prop="modifyTime" label="修改时间" width="180" />
      <el-table-column prop="field" label="修改字段" width="120" />
      <el-table-column label="修改前" min-width="150">
        <template #default="{ row }">
          <el-text type="info" size="small">{{ row.beforeValue || '-' }}</el-text>
        </template>
      </el-table-column>
      <el-table-column label="修改后" min-width="150">
        <template #default="{ row }">
          <el-text type="primary" size="small">{{ row.afterValue || '-' }}</el-text>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)" size="small">
            {{ getStatusText(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="approver" label="审批人" width="100" />
    </el-table>

    <template #footer>
      <el-button @click="visible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const visible = ref(false)

const historyList = ref([
  {
    modifyTime: '2024-01-15 10:30:00',
    field: '手机号码',
    beforeValue: '13800138000',
    afterValue: '13900139000',
    status: 'approved',
    approver: '李四'
  },
  {
    modifyTime: '2024-01-10 14:20:00',
    field: '办公工位',
    beforeValue: 'A座3层-308-5号',
    afterValue: 'A座5层-508-12号',
    status: 'approved',
    approver: '李四'
  },
  {
    modifyTime: '2024-01-05 09:15:00',
    field: '个人签名',
    beforeValue: '',
    afterValue: '专注OA系统开发',
    status: 'saved',
    approver: '-'
  }
])

watch(() => props.modelValue, (val) => {
  visible.value = val
})

watch(visible, (val) => {
  emit('update:modelValue', val)
})

const getStatusType = (status) => {
  const types = {
    approved: 'success',
    pending: 'warning',
    rejected: 'danger',
    saved: 'info'
  }
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = {
    approved: '已通过',
    pending: '待审批',
    rejected: '已驳回',
    saved: '已保存'
  }
  return texts[status] || '未知'
}
</script>
