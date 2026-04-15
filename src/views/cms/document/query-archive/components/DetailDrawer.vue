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
      <el-descriptions-item label="发文单位">{{ document.sender }}</el-descriptions-item>
      <el-descriptions-item label="发文日期">{{ document.sendDate }}</el-descriptions-item>
      <el-descriptions-item label="密级">
        <el-tag :type="getSecurityType(document.securityLevel)">{{ document.securityLevel }}</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="状态">
        <el-tag :type="getStatusType(document.status)">{{ document.status }}</el-tag>
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
  { name: '公文正文.docx', size: '256KB' },
  { name: '附件1.pdf', size: '1.2MB' }
])

watch(() => props.modelValue, (val) => {
  visible.value = val
})

watch(visible, (val) => {
  emit('update:modelValue', val)
})

const getStatusType = (status) => {
  const map = { '草稿': 'info', '审批中': 'warning', '已发布': 'success', '已归档': 'info' }
  return map[status] || 'info'
}

const getSecurityType = (level) => {
  const map = { '公开': 'success', '内部': 'info', '秘密': 'warning', '机密': 'danger' }
  return map[level] || 'info'
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
