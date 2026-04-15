<template>
  <el-drawer
      v-model="visible"
      title="公文详情"
      size="600px"
  >
    <el-descriptions :column="1" border>
      <el-descriptions-item label="公文标题">{{ document.title }}</el-descriptions-item>
      <el-descriptions-item label="文号">{{ document.docNumber }}</el-descriptions-item>
      <el-descriptions-item label="公文类型">{{ document.docType }}</el-descriptions-item>
      <el-descriptions-item label="传阅人/承办人">{{ document.sender || document.handler }}</el-descriptions-item>
      <el-descriptions-item label="时间">{{ document.sendTime || document.deadline }}</el-descriptions-item>
      <el-descriptions-item label="状态">
        <el-tag :type="getStatusType(document.status || document.readStatus)">
          {{ document.status || document.readStatus }}
        </el-tag>
      </el-descriptions-item>
    </el-descriptions>

    <div class="attachment-section">
      <h4>附件列表</h4>
      <el-table :data="attachments" size="small">
        <el-table-column prop="name" label="附件名称" />
        <el-table-column prop="size" label="大小" width="120" />
        <el-table-column label="操作" width="100">
          <template #default>
            <el-button link type="primary" size="small">下载</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </el-drawer>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  document: Object
})

const emit = defineEmits(['update:modelValue'])

const visible = ref(false)

const attachments = ref([
  { name: '公文正文.docx', size: '256KB' }
])

watch(() => props.modelValue, (val) => {
  visible.value = val
})

watch(visible, (val) => {
  emit('update:modelValue', val)
})

const getStatusType = (status) => {
  const map = { '已读': 'success', '未读': 'warning', '未办理': 'danger', '办理中': 'warning', '已办结': 'success', '已逾期': 'danger' }
  return map[status] || 'info'
}
</script>

<style scoped lang="scss">
.attachment-section {
  margin-top: 20px;

  h4 {
    margin-bottom: 12px;
    font-size: 14px;
    font-weight: 600;
  }
}
</style>
