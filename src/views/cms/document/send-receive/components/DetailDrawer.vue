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
      <el-descriptions-item label="来文单位/发文单位">{{ document.sourceUnit || document.targetUnit }}</el-descriptions-item>
      <el-descriptions-item label="日期">{{ document.receiveDate || document.sendDate }}</el-descriptions-item>
      <el-descriptions-item label="紧急程度">
        <el-tag :type="getUrgencyType(document.urgency)">{{ document.urgency || '普通' }}</el-tag>
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
  const map = { '待办理': 'warning', '办理中': 'primary', '已办结': 'success', '已发布': 'success', '审批中': 'warning', '草稿': 'info' }
  return map[status] || 'info'
}

const getUrgencyType = (urgency) => {
  const map = { '普通': 'info', '紧急': 'warning', '特急': 'danger' }
  return map[urgency] || 'info'
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
