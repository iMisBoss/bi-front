<template>
  <el-dialog
      v-model="visible"
      title="离职办理"
      width="500px"
      :close-on-click-modal="false"
      @close="handleClose"
  >
    <el-alert
        title="离职后该人员账号将被冻结，待办审批将自动清空，工号永久占用不可复用，请谨慎操作！"
        type="warning"
        :closable="false"
        style="margin-bottom: 16px"
    />

    <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="100px"
    >
      <el-form-item label="员工姓名">
        <el-input :model-value="user?.name" disabled />
      </el-form-item>

      <el-form-item label="离职日期" prop="resignDate">
        <el-date-picker
            v-model="formData.resignDate"
            type="date"
            placeholder="选择离职日期"
            style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="离职原因">
        <el-input
            v-model="formData.resignReason"
            type="textarea"
            :rows="3"
            placeholder="请输入离职原因"
            maxlength="200"
            show-word-limit
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleConfirm" :loading="confirming">确定离职</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  user: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const visible = ref(props.modelValue)
const formRef = ref(null)
const confirming = ref(false)

const formData = reactive({
  resignDate: '',
  resignReason: ''
})

const rules = {
  resignDate: [{ required: true, message: '请选择离职日期', trigger: 'change' }]
}

watch(() => props.modelValue, (val) => {
  visible.value = val
  if (val) {
    formData.resignDate = ''
    formData.resignReason = ''
  }
})

watch(visible, (val) => {
  emit('update:modelValue', val)
})

const handleConfirm = async () => {
  if (!formRef.value) return

  await formRef.value.validate((valid) => {
    if (valid) {
      confirming.value = true
      setTimeout(() => {
        confirming.value = false
        emit('confirm', { ...formData })
      }, 500)
    }
  })
}

const handleClose = () => {
  visible.value = false
  formRef.value?.resetFields()
}
</script>

<style lang="scss" scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
