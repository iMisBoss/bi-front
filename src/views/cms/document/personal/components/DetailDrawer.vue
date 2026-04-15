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
      <el-descriptions-item label="发起人">{{ document.sender }}</el-descriptions-item>
      <el-descriptions-item label="接收时间">{{ document.receiveTime || document.sendTime }}</el-descriptions-item>
      <el-descriptions-item label="状态">
        <el-tag :type="getStatusType(document.status)">{{ document.status }}</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="公文内容">
        <div class="doc-content">
          <p>这是一份示例公文内容，实际使用时将从后端获取完整的公文正文信息。</p>
          <p>公文正文通常包含标题、主送机关、正文内容、落款等部分。</p>
        </div>
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
  const map = { '待办理': 'warning', '办理中': 'primary', '已发布': 'success', '审批中': 'warning' }
  return map[status] || 'info'
}
</script>

<style scoped lang="scss">
.doc-content {
  p {
    margin: 8px 0;
    line-height: 1.8;
    text-indent: 2em;
  }
}

.attachment-section {
  margin-top: 20px;

  h4 {
    margin-bottom: 12px;
    font-size: 14px;
    font-weight: 600;
  }
}
</style>
