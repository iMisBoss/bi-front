<template>
  <el-dialog v-model="visible" title="导入群组" width="600px">
    <div class="import-container">
      <el-alert
          title="导入说明"
          type="info"
          :closable="false"
          style="margin-bottom: 20px"
      >
        <p>1. 请先下载模板，按照模板格式填写数据</p>
        <p>2. 支持批量导入多个群组</p>
        <p>3. 群主必须是系统在职人员</p>
        <p>4. 重复的群组名称将自动跳过</p>
      </el-alert>

      <div class="upload-area">
        <el-upload
            drag
            :auto-upload="false"
            :on-change="handleFileChange"
            accept=".xlsx,.xls"
            :limit="1"
        >
          <el-icon class="el-icon--upload"><upload-filled /></el-icon>
          <div class="el-upload__text">
            将文件拖到此处，或<em>点击上传</em>
          </div>
          <template #tip>
            <div class="el-upload__tip">
              仅支持 xlsx/xls 文件
            </div>
          </template>
        </el-upload>
      </div>

      <div class="template-download">
        <el-button link type="primary" @click="$emit('download-template')">
          <el-icon><Download /></el-icon>
          下载导入模板
        </el-button>
      </div>
    </div>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="handleConfirmImport" :disabled="!file">
        开始导入
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { UploadFilled, Download } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'download-template', 'confirm-import'])

const file = ref(null)

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const handleFileChange = (uploadFile) => {
  file.value = uploadFile
}

const handleConfirmImport = () => {
  if (!file.value) {
    return
  }
  emit('confirm-import', file.value)
}
</script>

<style lang="scss" scoped>
.import-container {
  .upload-area {
    margin-bottom: 16px;
  }

  .template-download {
    text-align: center;
  }
}
</style>
