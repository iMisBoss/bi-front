<template>
  <el-drawer
      v-model="visible"
      title="邮箱账号配置"
      size="600px"
      :close-on-click-modal="false"
      @close="handleClose"
  >
    <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="100px"
    >
      <el-divider content-position="left">基础配置</el-divider>

      <el-form-item label="邮箱账号">
        <el-input v-model="formData.email" disabled />
      </el-form-item>

      <el-form-item label="所属人员">
        <el-input v-model="formData.name" disabled />
      </el-form-item>

      <el-form-item label="邮箱容量" prop="capacity">
        <el-select v-model="formData.capacity" placeholder="选择邮箱容量" style="width: 100%">
          <el-option label="50MB" value="50MB" />
          <el-option label="100MB" value="100MB" />
          <el-option label="500MB" value="500MB" />
        </el-select>
      </el-form-item>

      <el-form-item label="账号状态" prop="status">
        <el-radio-group v-model="formData.status">
          <el-radio label="enabled" value="enabled">启用</el-radio>
          <el-radio label="disabled" value="disabled">禁用</el-radio>
        </el-radio-group>
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
      <div class="drawer-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSave" :loading="saving">保存</el-button>
      </div>
    </template>
  </el-drawer>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  data: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const visible = ref(props.modelValue)
const formRef = ref(null)
const saving = ref(false)

const formData = reactive({
  id: null,
  name: '',
  email: '',
  capacity: '100MB',
  status: 'enabled',
  remark: ''
})

const rules = {
  capacity: [{ required: true, message: '请选择邮箱容量', trigger: 'change' }],
  status: [{ required: true, message: '请选择账号状态', trigger: 'change' }]
}

watch(() => props.modelValue, (val) => {
  visible.value = val
  if (val && props.data) {
    Object.assign(formData, {
      ...props.data,
      capacity: props.data.totalCapacity || '100MB'
    })
  }
})

watch(visible, (val) => {
  emit('update:modelValue', val)
})

const handleSave = async () => {
  if (!formRef.value) return

  await formRef.value.validate((valid) => {
    if (valid) {
      saving.value = true
      setTimeout(() => {
        saving.value = false
        emit('confirm', {
          ...formData,
          totalCapacity: formData.capacity
        })
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
.drawer-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
