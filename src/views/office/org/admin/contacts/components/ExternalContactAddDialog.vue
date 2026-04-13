
<template>
  <el-dialog
      v-model="dialogVisible"
      :title="contactData?.id ? '编辑外部联系人' : '新增外部联系人'"
      width="600px"
  >
    <el-form :model="formData" label-width="100px" :rules="rules" ref="formRef">
      <el-form-item label="姓名" prop="name">
        <el-input v-model="formData.name" placeholder="请输入姓名" />
      </el-form-item>
      <el-form-item label="所属公司" prop="company">
        <el-input v-model="formData.company" placeholder="请输入所属公司" />
      </el-form-item>
      <el-form-item label="联系人分类" prop="category">
        <el-select v-model="formData.category" placeholder="选择联系人分类" style="width: 100%">
          <el-option label="客户" value="客户" />
          <el-option label="供应商" value="供应商" />
          <el-option label="合作伙伴" value="合作伙伴" />
          <el-option label="其他" value="其他" />
        </el-select>
      </el-form-item>
      <el-form-item label="手机号" prop="phone">
        <el-input v-model="formData.phone" placeholder="请输入手机号" />
      </el-form-item>
      <el-form-item label="邮箱">
        <el-input v-model="formData.email" placeholder="请输入邮箱" />
      </el-form-item>
      <el-form-item label="办公电话">
        <el-input v-model="formData.officePhone" placeholder="请输入办公电话" />
      </el-form-item>
      <el-form-item label="地址">
        <el-input v-model="formData.address" placeholder="请输入地址" />
      </el-form-item>
      <el-form-item label="备注">
        <el-input
            v-model="formData.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注"
            maxlength="200"
            show-word-limit
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="handleConfirm">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  modelValue: Boolean,
  contactData: Object
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const dialogVisible = ref(false)
const formRef = ref(null)

const formData = ref({
  id: null,
  name: '',
  company: '',
  category: '',
  phone: '',
  email: '',
  officePhone: '',
  address: '',
  status: 'enabled',
  remark: ''
})

const rules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  company: [{ required: true, message: '请输入所属公司', trigger: 'blur' }],
  category: [{ required: true, message: '请选择联系人分类', trigger: 'change' }],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ]
}

watch(() => props.modelValue, (val) => {
  dialogVisible.value = val
})

watch(() => props.contactData, (val) => {
  if (val) {
    Object.assign(formData.value, val)
  } else {
    resetForm()
  }
}, { deep: true })

watch(dialogVisible, (val) => {
  emit('update:modelValue', val)
})

const resetForm = () => {
  formData.value = {
    id: null,
    name: '',
    company: '',
    category: '',
    phone: '',
    email: '',
    officePhone: '',
    address: '',
    status: 'enabled',
    remark: ''
  }
}

const handleConfirm = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      emit('confirm', { ...formData.value })
    } else {
      ElMessage.warning('请填写必填项')
    }
  })
}
</script>