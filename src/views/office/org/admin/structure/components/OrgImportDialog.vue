D:\Workspaces\BI\bi-front\src\views\office\org\admin\components\OrgImportDialog.vue
<template>
  <el-dialog v-model="visible" title="导入组织数据" width="600px">
    <el-alert
        title="请按照模板格式填写数据，确保数据准确性"
        type="info"
        :closable="false"
        style="margin-bottom: 16px"
    />
    <el-button @click="$emit('downloadTemplate')">下载模板</el-button>
    <el-upload
        drag
        action="#"
        :auto-upload="false"
        :on-change="handleFileChange"
        accept=".xlsx,.xls"
        style="margin-top: 16px"
    >
      <el-icon class="el-icon--upload"><upload-filled /></el-icon>
      <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
      <template #tip>
        <div class="el-upload__tip">只能上传 xlsx/xls 文件</div>
      </template>
    </el-upload>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="handleConfirm">开始导入</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, ref } from 'vue'
import { UploadFilled } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: Boolean
})

const emit = defineEmits(['update:modelValue', 'downloadTemplate', 'confirmImport'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const uploadFile = ref(null)

const handleFileChange = (file) => {
  uploadFile.value = file
}

const handleConfirm = () => {
  if (!uploadFile.value) {
    ElMessage.warning('请先选择文件')
    return
  }
  emit('confirmImport', uploadFile.value)
}
</script>
