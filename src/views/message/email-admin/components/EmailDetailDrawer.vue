<template>
  <el-drawer
      v-model="visible"
      :title="`邮件详情`"
      size="700px"
      @close="handleClose"
  >
    <el-tabs v-model="activeTab">
      <el-tab-pane label="邮件详情" name="detail">
        <!-- 基础信息 -->
        <el-descriptions :column="1" border>
          <el-descriptions-item label="邮件主题">{{ data?.subject }}</el-descriptions-item>
          <el-descriptions-item label="发件人">{{ data?.sender }}</el-descriptions-item>
          <el-descriptions-item label="收件人">{{ data?.receiver }}</el-descriptions-item>
          <el-descriptions-item label="抄送">{{ data?.cc || '无' }}</el-descriptions-item>
          <el-descriptions-item label="发送时间">{{ data?.sendTime }}</el-descriptions-item>
          <el-descriptions-item label="邮件大小">{{ data?.size }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(data?.status)" size="small">
              {{ getStatusText(data?.status) }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>

        <!-- 内容预览 -->
        <el-divider content-position="left">邮件内容</el-divider>
        <div class="email-content" v-html="data?.content"></div>

        <!-- 附件列表 -->
        <el-divider content-position="left" v-if="data?.attachments && data.attachments.length > 0">附件列表</el-divider>
        <el-table v-if="data?.attachments && data.attachments.length > 0" :data="data.attachments" border size="small">
          <el-table-column prop="name" label="附件名称" />
          <el-table-column prop="size" label="大小" width="100" />
        </el-table>

        <!-- 操作日志 -->
        <el-divider content-position="left">操作日志</el-divider>
        <el-timeline>
          <el-timeline-item
              v-for="(log, index) in data?.logs"
              :key="index"
              :timestamp="log.time"
              placement="top"
          >
            {{ log.operator }} {{ log.action }}
          </el-timeline-item>
        </el-timeline>
      </el-tab-pane>
    </el-tabs>

    <template #footer>
      <div class="drawer-footer">
        <el-button @click="handleClose">关闭</el-button>
        <el-button
            type="danger"
            @click="handleDelete"
            :disabled="data?.status === 'deleted'"
        >
          删除
        </el-button>
        <el-button
            type="primary"
            @click="handleArchive"
            :disabled="data?.status === 'archived'"
        >
          归档
        </el-button>
      </div>
    </template>
  </el-drawer>
</template>

<script setup>
import { ref, watch } from 'vue'

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

const emit = defineEmits(['update:modelValue', 'delete', 'archive'])

const visible = ref(props.modelValue)
const activeTab = ref('detail')

watch(() => props.modelValue, (val) => {
  visible.value = val
})

watch(visible, (val) => {
  emit('update:modelValue', val)
})

const getStatusType = (status) => {
  const types = {
    'normal': 'success',
    'deleted': 'danger',
    'archived': 'info'
  }
  return types[status] || ''
}

const getStatusText = (status) => {
  const texts = {
    'normal': '正常',
    'deleted': '已删除',
    'archived': '已归档'
  }
  return texts[status] || status
}

const handleDelete = () => {
  emit('delete', props.data)
  visible.value = false
}

const handleArchive = () => {
  emit('archive', props.data)
  visible.value = false
}

const handleClose = () => {
  visible.value = false
}
</script>

<style lang="scss" scoped>
.email-content {
  padding: 16px;
  background: #f5f7fa;
  border-radius: 4px;
  min-height: 100px;
  line-height: 1.8;
}

.drawer-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
