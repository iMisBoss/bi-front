<template>
  <el-dialog
      v-model="visible"
      title="审计日志详情"
      width="700px"
      @close="handleClose"
  >
    <el-descriptions :column="2" border>
      <el-descriptions-item label="使用时间">{{ data?.time }}</el-descriptions-item>
      <el-descriptions-item label="用户ID">{{ data?.userId }}</el-descriptions-item>
      <el-descriptions-item label="姓名">{{ data?.userName }}</el-descriptions-item>
      <el-descriptions-item label="部门">{{ data?.department }}</el-descriptions-item>
      <el-descriptions-item label="AI功能">{{ getFunctionText(data?.function) }}</el-descriptions-item>
      <el-descriptions-item label="操作状态">
        <el-tag :type="getStatusType(data?.status)" size="small">{{ getStatusText(data?.status) }}</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="客户端IP" :span="2">{{ data?.ip }}</el-descriptions-item>
    </el-descriptions>

    <el-divider content-position="left">提问内容</el-divider>
    <div class="content-box">{{ data?.question }}</div>

    <el-divider content-position="left">AI响应</el-divider>
    <div class="content-box">{{ data?.response || '无响应（拦截/异常）' }}</div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">关闭</el-button>
        <el-button type="primary" @click="handleMarkAbnormal" :disabled="data?.status === 'error'">标记异常</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  data: {
    type: Object,
    default: null
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

const getFunctionText = (func) => {
  const texts = {
    'qa': '智能问答',
    'summary': '文档总结',
    'writing': '文案生成',
    'assistant': '流程咨询',
    'knowledge': '知识库检索'
  }
  return texts[func] || func
}

const getStatusType = (status) => {
  const types = {
    'normal': 'success',
    'intercepted': 'warning',
    'error': 'danger'
  }
  return types[status] || ''
}

const getStatusText = (status) => {
  const texts = {
    'normal': '正常',
    'intercepted': '拦截',
    'error': '异常'
  }
  return texts[status] || status
}

const handleMarkAbnormal = () => {
  ElMessage.success('已标记为异常行为')
}

const handleClose = () => {
  visible.value = false
}
</script>

<style lang="scss" scoped>
.content-box {
  padding: 12px;
  background: #f5f7fa;
  border-radius: 4px;
  min-height: 60px;
  line-height: 1.8;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
