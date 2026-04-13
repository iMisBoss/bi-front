<template>
  <el-dialog
      v-model="dialogVisible"
      title="导入人员数据"
      width="500px"
  >
    <el-alert
        title="导入说明"
        type="info"
        :closable="false"
        style="margin-bottom: 16px"
    >
      <p>1. 请下载模板，严格按照模板格式填写；</p>
      <p>2. 手机号/工号必须唯一，重复数据将被跳过；</p>
      <p>3. 支持.xls和.xlsx格式文件。</p>
    </el-alert>
    <el-upload
        drag
        action="#"
        :auto-upload="false"
        :on-change="handleFileChange"
        accept=".xls,.xlsx"
        :limit="1"
    >
      <el-icon class="el-icon--upload"><upload-filled /></el-icon>
      <div class="el-upload__text">
        将文件拖到此处，或<em>点击上传</em>
      </div>
      <template #tip>
        <div class="el-upload__tip">
          只能上传xls/xlsx文件
        </div>
      </template>
    </el-upload>
    <template #footer>
      <el-button @click="handleDownloadTemplate">下载模板</el-button>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" :disabled="!selectedFile" @click="handleConfirm">开始导入</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { UploadFilled } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: Boolean
})

const emit = defineEmits(['update:modelValue', 'download-template', 'confirm-import'])

const dialogVisible = ref(false)
const selectedFile = ref(null)

watch(() => props.modelValue, (val) => {
  dialogVisible.value = val
  if (!val) {
    selectedFile.value = null
  }
})

watch(dialogVisible, (val) => {
  emit('update:modelValue', val)
})

const handleFileChange = (file) => {
  selectedFile.value = file
}

const handleDownloadTemplate = () => {
  emit('download-template')
}

const handleConfirm = () => {
  if (!selectedFile.value) {
    ElMessage.warning('请先选择文件')
    return
  }
  emit('confirm-import', selectedFile.value)
}
</script>

<style lang="scss" scoped>
:deep(.el-upload__tip) {
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
}
</style>
