<template>
  <el-dialog
      v-model="dialogVisible"
      title="导入表单配置"
      width="520px"
      append-to-body
      :close-on-click-modal="false"
  >
    <div class="import-dialog">
      <el-upload
          class="upload-area"
          drag
          accept=".json"
          :auto-upload="false"
          :show-file-list="true"
          :limit="1"
          :on-change="handleFileChange"
          :on-remove="handleRemove"
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">
          拖拽 JSON 文件到此处，或 <em>点击选择</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">仅支持 .json 格式的表单配置文件</div>
        </template>
      </el-upload>

      <div class="warning-tip">
        <el-icon><warning-filled /></el-icon>
        <span>导入后将<strong style="color:#f56c6c">覆盖当前表单</strong>，请确认已保存当前配置</span>
      </div>
    </div>

    <template #footer>
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" @click="handleConfirmImport" :disabled="!selectedFile" :loading="importing">
        确认导入
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { UploadFilled, WarningFilled } from '@element-plus/icons-vue'

const emit = defineEmits(['import-success'])

const dialogVisible = ref(false)
const selectedFile = ref(null)
const importing = ref(false)

// 打开导入弹窗
const open = () => {
  dialogVisible.value = true
  selectedFile.value = null
}

// 文件选择
const handleFileChange = (file) => {
  selectedFile.value = file.raw
}

// 移除文件
const handleRemove = () => {
  selectedFile.value = null
}

// 取消
const handleCancel = () => {
  dialogVisible.value = false
  selectedFile.value = null
}

// 确认导入
const handleConfirmImport = async () => {
  if (!selectedFile.value) {
    ElMessage.warning('请先选择JSON配置文件')
    return
  }

  try {
    importing.value = true

    // 二次确认
    await ElMessageBox.confirm(
        '导入后将覆盖当前表单配置，此操作不可撤销。是否继续？',
        '覆盖确认',
        {
          confirmButtonText: '确认覆盖',
          cancelButtonText: '取消',
          type: 'warning'
        }
    )

    const text = await selectedFile.value.text()
    const config = JSON.parse(text)

    // 校验格式
    if (!config.fields || !Array.isArray(config.fields)) {
      ElMessage.error('配置文件格式错误，请使用导出的JSON文件')
      importing.value = false
      return
    }

    // 触发导入成功事件
    emit('import-success', config)

    // 关闭弹窗
    dialogVisible.value = false
    selectedFile.value = null

    ElMessage.success('表单导入成功')
  } catch (e) {
    if (e !== 'cancel') {
      ElMessage.error('文件解析失败，请检查JSON格式是否正确')
      console.error('导入错误:', e)
    }
  } finally {
    importing.value = false
  }
}

defineExpose({
  open
})
</script>

<style scoped lang="scss">
.import-dialog {
  .upload-area {
    :deep(.el-upload-dragger) {
      padding: 30px 20px;
      border: 2px dashed #dcdfe6;
      border-radius: 8px;
      transition: all 0.3s;

      &:hover {
        border-color: #667eea;
      }
    }

    .el-icon--upload {
      font-size: 48px;
      color: #c0c4cc;
      margin-bottom: 12px;
    }

    .el-upload__text {
      color: #606266;
      font-size: 14px;

      em {
        color: #667eea;
        font-style: normal;
        font-weight: 500;
      }
    }

    .el-upload__tip {
      font-size: 12px;
      color: #909399;
      margin-top: 8px;
    }
  }

  .warning-tip {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 16px;
    padding: 12px;
    background: #fef0f0;
    border: 1px solid #fbc4c4;
    border-radius: 6px;
    font-size: 13px;
    color: #f56c6c;

    .el-icon {
      font-size: 18px;
      flex-shrink: 0;
    }
  }
}
</style>
