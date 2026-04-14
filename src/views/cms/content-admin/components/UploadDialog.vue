<template>
  <el-dialog
      v-model="visible"
      title="上传文档"
      width="600px"
      :close-on-click-modal="false"
      @close="handleClose"
  >
    <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="100px"
    >
      <el-form-item label="文档名称" prop="fileName">
        <el-input v-model="formData.fileName" placeholder="请输入文档名称" />
      </el-form-item>

      <el-form-item label="上传文件" prop="file">
        <el-upload
            ref="uploadRef"
            class="upload-demo"
            action="#"
            :auto-upload="false"
            :limit="1"
            :on-change="handleFileChange"
        >
          <el-button type="primary">选择文件</el-button>
          <template #tip>
            <div class="el-upload__tip">
              支持Word/Excel/PDF等格式，单文件最大50M
            </div>
          </template>
        </el-upload>
      </el-form-item>

      <el-form-item label="标签">
        <el-select
            v-model="formData.tags"
            multiple
            placeholder="选择或输入标签"
            style="width: 100%"
            allow-create
            filterable
        >
          <el-option label="规范" value="规范" />
          <el-option label="接口" value="接口" />
          <el-option label="模板" value="模板" />
          <el-option label="指南" value="指南" />
        </el-select>
      </el-form-item>

      <el-form-item label="备注">
        <el-input
            v-model="formData.remark"
            type="textarea"
            :rows="3"
            maxlength="200"
            show-word-limit
            placeholder="请输入备注"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleConfirm" :loading="uploading">上传</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const visible = ref(props.modelValue)
const formRef = ref(null)
const uploadRef = ref(null)
const uploading = ref(false)

const formData = reactive({
  fileName: '',
  file: null,
  format: '',
  size: '',
  tags: [],
  remark: ''
})

const rules = {
  fileName: [{ required: true, message: '请输入文档名称', trigger: 'blur' }],
  file: [{ required: true, message: '请选择文件', trigger: 'change' }]
}

watch(() => props.modelValue, (val) => {
  visible.value = val
})

watch(visible, (val) => {
  emit('update:modelValue', val)
})

const handleFileChange = (uploadFile) => {
  formData.file = uploadFile.raw
  formData.fileName = uploadFile.name
  formData.format = uploadFile.name.split('.').pop().toUpperCase()
  formData.size = formatFileSize(uploadFile.size)
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + sizes[i]
}

const handleConfirm = async () => {
  if (!formRef.value) return

  await formRef.value.validate((valid) => {
    if (valid) {
      uploading.value = true
      setTimeout(() => {
        uploading.value = false
        emit('confirm', { ...formData })
      }, 1000)
    }
  })
}

const handleClose = () => {
  visible.value = false
  formRef.value?.resetFields()
  uploadRef.value?.clearFiles()
}
</script>

<style lang="scss" scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
