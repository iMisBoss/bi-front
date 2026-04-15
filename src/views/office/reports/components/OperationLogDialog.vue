<template>
  <el-dialog
      v-model="visible"
      title="操作日志（审计留痕）"
      width="900px"
      :close-on-click-modal="false"
  >
    <el-alert
        title="所有查询、筛选、导出、查看详情操作均永久记录，不可删除"
        type="info"
        :closable="false"
        show-icon
        style="margin-bottom: 20px"
    />

    <el-table :data="logs" stripe>
      <el-table-column prop="time" label="操作时间" width="180" sortable />
      <el-table-column prop="user" label="操作人" width="100" />
      <el-table-column prop="action" label="操作类型" width="120">
        <template #default="{ row }">
          <el-tag :type="getActionType(row.action)" size="small">{{ row.action }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="detail" label="操作详情" min-width="250" show-overflow-tooltip />
      <el-table-column prop="ip" label="IP地址" width="140" />
    </el-table>

    <template #footer>
      <el-button @click="visible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: Boolean
})

const emit = defineEmits(['update:modelValue'])

const visible = ref(false)

const logs = ref([
  { time: '2026-01-15 10:30:00', user: '管理员', action: '查询', detail: '筛选条件：状态=已通过，时间范围=2026-01', ip: '192.168.1.100' },
  { time: '2026-01-15 10:25:00', user: '管理员', action: '导出', detail: 'Excel导出，范围：已选3条，脱敏：是', ip: '192.168.1.100' },
  { time: '2026-01-15 10:20:00', user: '管理员', action: '查看详情', detail: '查看流程编号：PRC202601001', ip: '192.168.1.100' },
  { time: '2026-01-15 10:15:00', user: '管理员', action: '解密', detail: '解密敏感字段，操作留痕', ip: '192.168.1.100' }
])

watch(() => props.modelValue, (val) => {
  visible.value = val
})

watch(visible, (val) => {
  emit('update:modelValue', val)
})

const getActionType = (action) => {
  const map = { '查询': 'info', '导出': 'success', '查看详情': 'primary', '解密': 'warning' }
  return map[action] || 'info'
}
</script>
