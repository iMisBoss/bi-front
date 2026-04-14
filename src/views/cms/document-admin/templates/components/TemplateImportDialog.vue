<template>
  <el-dialog
      v-model="visible"
      title="模板导入"
      width="600px"
      :close-on-click-modal="false"
      @close="handleClose"
  >
    <div class="import-content">
      <el-alert
          title="导入说明"
          type="info"
          :closable="false"
          style="margin-bottom: 16px"
      >
        <p>1. 请先下载模板，按照模板格式填写数据</p>
        <p>2. 支持批量导入，单次最多导入200个模板</p>
        <p>3. 模板名称重复的数据将会被跳过</p>
        <p>4. 导入成功后将自动刷新列表</p>
      </el-alert>

      <el-upload
          ref="uploadRef"
          class="upload-area"
          drag
          :auto-upload="false"
          :limit="1"
          accept=".xlsx,.xls"
          :on-change="handleFileChange"
          :on-exceed="handleExceed"
      >
        <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
        <div class="el-upload__text">
          将文件拖到此处，或<em>点击上传</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">
            只能上传 xlsx/xls 文件
          </div>
        </template>
      </el-upload>

      <div v-if="fileName" class="file-info">
        <el-icon><Document /></el-icon>
        <span>{{ fileName }}</span>
        <el-button link type="danger" @click="clearFile">
          <el-icon><Close /></el-icon>
        </el-button>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleDownloadTemplate">
          <el-icon><Download /></el-icon>
          下载模板
        </el-button>
        <el-button @click="handleClose">取消</el-button>
        <el-button
            type="primary"
            @click="handleConfirmImport"
            :disabled="!file"
            :loading="importing"
        >
          开始导入
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { UploadFilled, Document, Close, Download } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'download-template', 'confirm-import'])

const visible = ref(props.modelValue)
const uploadRef = ref(null)
const file = ref(null)
const fileName = ref('')
const importing = ref(false)

watch(() => props.modelValue, (val) => {
  visible.value = val
  if (!val) {
    clearFile()
  }
})

watch(visible, (val) => {
  emit('update:modelValue', val)
})

const handleFileChange = (uploadFile) => {
  file.value = uploadFile.raw
  fileName.value = uploadFile.name
}

const handleExceed = () => {
  ElMessage.warning('只能上传一个文件')
}

const clearFile = () => {
  file.value = null
  fileName.value = ''
  uploadRef.value?.clearFiles()
}

const handleDownloadTemplate = () => {
  emit('download-template')
  ElMessage.success('模板下载成功')
}

const handleConfirmImport = () => {
  if (!file.value) {
    ElMessage.warning('请先选择文件')
    return
  }

  importing.value = true

  setTimeout(() => {
    importing.value = false
    emit('confirm-import')
    clearFile()
  }, 1500)
}

const handleClose = () => {
  visible.value = false
  clearFile()
}
</script>

<style lang="scss" scoped>
.import-content {
  .upload-area {
    margin: 20px 0;
  }

  .file-info {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px;
    background: #f5f7fa;
    border-radius: 4px;
    margin-top: 12px;

    .el-icon {
      font-size: 18px;
      color: #409eff;
    }

    span {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
