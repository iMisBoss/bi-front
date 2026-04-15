<template>
  <el-dialog
      v-model="visible"
      title="发起发文"
      width="700px"
      :close-on-click-modal="false"
  >
    <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
      <el-form-item label="公文标题" prop="title">
        <el-input v-model="form.title" placeholder="请输入公文标题" />
      </el-form-item>
      <el-form-item label="公文类型" prop="docType">
        <el-select v-model="form.docType" placeholder="请选择" style="width: 100%">
          <el-option label="请示" value="请示" />
          <el-option label="报告" value="报告" />
          <el-option label="通知" value="通知" />
          <el-option label="通报" value="通报" />
          <el-option label="决定" value="决定" />
        </el-select>
      </el-form-item>
      <el-form-item label="发文单位" prop="targetUnit">
        <el-input v-model="form.targetUnit" placeholder="请输入发文单位" />
      </el-form-item>
      <el-form-item label="紧急程度">
        <el-radio-group v-model="form.urgency">
          <el-radio label="普通">普通</el-radio>
          <el-radio label="紧急">紧急</el-radio>
          <el-radio label="特急">特急</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="发文附件">
        <el-upload
            action="#"
            :auto-upload="false"
            :limit="10"
        >
          <el-button type="primary">上传附件</el-button>
          <template #tip>
            <div class="el-upload__tip">支持 doc/docx/pdf 格式</div>
          </template>
        </el-upload>
      </el-form-item>
      <el-form-item label="备注">
        <el-input
            v-model="form.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="submitting">保存草稿</el-button>
      <el-button type="success" @click="handleSubmitAndSend" :loading="submitting">直接发文</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  modelValue: Boolean
})

const emit = defineEmits(['update:modelValue', 'success'])

const visible = ref(false)
const submitting = ref(false)
const formRef = ref(null)

const form = ref({
  title: '',
  docType: '',
  targetUnit: '',
  urgency: '普通',
  remark: ''
})

const rules = {
  title: [{ required: true, message: '请输入公文标题', trigger: 'blur' }],
  docType: [{ required: true, message: '请选择公文类型', trigger: 'change' }],
  targetUnit: [{ required: true, message: '请输入发文单位', trigger: 'blur' }]
}

watch(() => props.modelValue, (val) => {
  visible.value = val
})

watch(visible, (val) => {
  emit('update:modelValue', val)
})

const handleSubmit = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      submitting.value = true
      setTimeout(() => {
        submitting.value = false
        visible.value = false
        emit('success')
        ElMessage.success('草稿已保存')
      }, 1000)
    }
  })
}

const handleSubmitAndSend = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      submitting.value = true
      setTimeout(() => {
        submitting.value = false
        visible.value = false
        emit('success')
        ElMessage.success('发文已提交')
      }, 1000)
    }
  })
}
</script>
