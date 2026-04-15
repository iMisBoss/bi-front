<template>
  <el-dialog
      v-model="visible"
      title="公文办理"
      width="700px"
      :close-on-click-modal="false"
  >
    <el-form :model="form" label-width="100px">
      <el-form-item label="公文标题">
        <el-input v-model="document.title" disabled />
      </el-form-item>
      <el-form-item label="文号">
        <el-input v-model="document.docNumber" disabled />
      </el-form-item>
      <el-form-item label="办理意见" required>
        <el-input
            v-model="form.opinion"
            type="textarea"
            :rows="4"
            placeholder="请输入办理意见"
        />
      </el-form-item>
      <el-form-item label="办理结果">
        <el-radio-group v-model="form.result">
          <el-radio label="同意">同意</el-radio>
          <el-radio label="退回">退回</el-radio>
          <el-radio label="转办">转办</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="附件上传">
        <el-upload
            action="#"
            :auto-upload="false"
            :limit="5"
        >
          <el-button type="primary">上传附件</el-button>
          <template #tip>
            <div class="el-upload__tip">支持 doc/docx/pdf 格式，单个文件不超过 50MB</div>
          </template>
        </el-upload>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="submitting">提交办理</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  modelValue: Boolean,
  document: Object
})

const emit = defineEmits(['update:modelValue', 'success'])

const visible = ref(false)
const submitting = ref(false)

const form = ref({
  opinion: '',
  result: '同意'
})

watch(() => props.modelValue, (val) => {
  visible.value = val
})

watch(visible, (val) => {
  emit('update:modelValue', val)
})

const handleSubmit = async () => {
  if (!form.value.opinion) {
    ElMessage.warning('请输入办理意见')
    return
  }
  submitting.value = true
  setTimeout(() => {
    submitting.value = false
    visible.value = false
    emit('success')
    ElMessage.success('办理成功')
  }, 1000)
}
</script>
