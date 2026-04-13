<template>
  <el-dialog
      v-model="dialogVisible"
      :title="userData?.id ? '编辑人员' : '新增人员'"
      width="700px"
  >
    <el-form :model="formData" label-width="100px" :rules="rules" ref="formRef">
      <el-divider content-position="left">基本信息</el-divider>
      <el-form-item label="姓名" prop="name">
        <el-input v-model="formData.name" placeholder="请输入姓名" />
      </el-form-item>
      <el-form-item label="手机号" prop="phone">
        <el-input v-model="formData.phone" placeholder="请输入手机号" />
      </el-form-item>
      <el-form-item label="邮箱">
        <el-input v-model="formData.email" placeholder="请输入邮箱" />
      </el-form-item>
      <el-form-item label="入职日期">
        <el-date-picker
            v-model="formData.joinDate"
            type="date"
            placeholder="选择日期"
            style="width: 100%"
        />
      </el-form-item>

      <el-divider content-position="left">组织岗位</el-divider>
      <el-form-item label="所属部门" prop="departmentId">
        <el-tree-select
            v-model="formData.departmentId"
            :data="departmentTree"
            :props="{ value: 'id', label: 'name', children: 'children' }"
            node-key="id"
            check-strictly
            clearable
            placeholder="选择部门"
            @change="handleDepartmentChange"
        />
      </el-form-item>
      <el-form-item label="所属岗位" prop="positionId">
        <el-select
            v-model="formData.positionId"
            placeholder="选择岗位"
            :disabled="!formData.departmentId"
            style="width: 100%"
            @change="handlePositionChange"
        >
          <el-option
              v-for="pos in filteredPositions"
              :key="pos.id"
              :label="pos.name"
              :value="pos.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="所属职务">
        <el-input v-model="formData.jobTitle" disabled placeholder="自动继承岗位职务" />
      </el-form-item>
      <el-form-item label="汇报对象">
        <el-select
            v-model="formData.reportToId"
            placeholder="选择汇报对象"
            clearable
            style="width: 100%"
        >
          <el-option
              v-for="user in availableUsers"
              :key="user.id"
              :label="user.name"
              :value="user.id"
          />
        </el-select>
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

<script setup>
import { ref, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  modelValue: Boolean,
  userData: Object,
  departmentTree: Array,
  positions: Array
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const dialogVisible = ref(false)
const formRef = ref(null)

const formData = ref({
  id: null,
  name: '',
  gender: 'male',
  phone: '',
  email: '',
  joinDate: '',
  departmentId: null,
  positionId: null,
  jobTitle: '',
  reportToId: null,
  remark: ''
})

const rules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  departmentId: [{ required: true, message: '请选择所属部门', trigger: 'change' }],
  positionId: [{ required: true, message: '请选择所属岗位', trigger: 'change' }]
}

const filteredPositions = computed(() => {
  if (!formData.value.departmentId) return []
  return props.positions.filter(pos => pos.departmentId === formData.value.departmentId)
})

const availableUsers = computed(() => {
  return props.positions || []
})

watch(() => props.modelValue, (val) => {
  dialogVisible.value = val
})

watch(() => props.userData, (val) => {
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
    gender: 'male',
    phone: '',
    email: '',
    joinDate: '',
    departmentId: null,
    positionId: null,
    jobTitle: '',
    reportToId: null,
    remark: ''
  }
}

const handleDepartmentChange = () => {
  formData.value.positionId = null
  formData.value.jobTitle = ''
}

const handlePositionChange = (positionId) => {
  const position = props.positions.find(pos => pos.id === positionId)
  if (position) {
    formData.value.jobTitle = position.jobTitle || ''
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
