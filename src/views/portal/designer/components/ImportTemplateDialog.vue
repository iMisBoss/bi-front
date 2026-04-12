<template>
  <el-dialog v-model="visible" title="导入门户模板" width="600px" :close-on-click-modal="false" @close="handleClose">
    <el-upload
        class="upload-area"
        drag
        action="#"
        :auto-upload="false"
        :on-change="handleFileChange"
        :limit="1"
        accept=".json"
    >
      <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
      <div class="el-upload__text">将门户模板文件拖到此处，或<em>点击上传</em></div>
      <template #tip>
        <div class="el-upload__tip">支持 .json 格式的门户模板文件，文件大小不超过 5MB</div>
      </template>
    </el-upload>

    <div v-if="importData" class="import-preview">
      <el-descriptions title="模板信息" :column="2" border size="small">
        <el-descriptions-item label="门户名称">{{ importData.name || '未命名' }}</el-descriptions-item>
        <el-descriptions-item label="门户分类">{{ importData.category || '未分类' }}</el-descriptions-item>
        <el-descriptions-item label="组件数量">{{ importData.components?.length || 0 }} 个</el-descriptions-item>
        <el-descriptions-item label="导出时间">{{ importData.exportTime || '-' }}</el-descriptions-item>
      </el-descriptions>
    </div>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleConfirm" :loading="importing" :disabled="!importData">确认导入</el-button>
    </template>
  </el-dialog>
</template>

<script setup>import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { UploadFilled } from '@element-plus/icons-vue'

const emit = defineEmits(['import-success'])

const visible = ref(false)
const importing = ref(false)
const importData = ref(null)

const open = () => {
  importData.value = null
  visible.value = true
}

const handleFileChange = (file) => {
  if (!file || !file.raw) {
    ElMessage.error('无效的文件')
    return
  }
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result)
      if (!data.components) {
        ElMessage.error('无效的门户模板文件')
        return
      }
      importData.value = data
    } catch (err) {
      ElMessage.error('文件解析失败，请检查文件格式')
    }
  }
  reader.readAsText(file.raw)
}

const handleConfirm = () => {
  if (!importData.value) return
  importing.value = true
  setTimeout(() => {
    importing.value = false
    emit('import-success', importData.value)
    ElMessage.success('模板导入成功')
    visible.value = false
  }, 500)
}

const handleClose = () => {
  importData.value = null
  visible.value = false
}

defineExpose({ open })
</script>

<style scoped lang="scss">.upload-area { :deep(.el-upload) { width: 100%; .el-upload-dragger { width: 100%; } } }
.import-preview { margin-top: 20px; }
</style>