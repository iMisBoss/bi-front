<template>
  <el-drawer
      v-model="visible"
      :title="drawerTitle"
      size="700px"
      :close-on-click-modal="false"
      @close="handleClose"
  >
    <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="100px"
    >
      <el-divider content-position="left">基础信息</el-divider>

      <el-form-item label="姓名" prop="name">
        <el-input v-model="formData.name" placeholder="请输入姓名" />
      </el-form-item>

      <el-form-item label="性别" prop="gender">
        <el-radio-group v-model="formData.gender">
          <el-radio label="male">男</el-radio>
          <el-radio label="female">女</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="手机号" prop="phone">
        <el-input v-model="formData.phone" placeholder="请输入手机号" />
      </el-form-item>

      <el-form-item label="邮箱" prop="email">
        <el-input v-model="formData.email" placeholder="请输入邮箱" />
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
            style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="所属岗位" prop="positionId">
        <el-select
            v-model="formData.positionId"
            placeholder="选择岗位"
            :disabled="!formData.departmentId"
            style="width: 100%"
        >
          <el-option
              v-for="pos in filteredPositions"
              :key="pos.id"
              :label="pos.name"
              :value="pos.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="汇报对象">
        <el-select
            v-model="formData.reportToId"
            placeholder="选择汇报对象"
            clearable
            style="width: 100%"
        >
          <el-option
              v-for="user in userList"
              :key="user.id"
              :label="user.name"
              :value="user.id"
          />
        </el-select>
      </el-form-item>

      <el-divider content-position="left">入职信息</el-divider>

      <el-form-item label="入职日期" prop="joinDate">
        <el-date-picker
            v-model="formData.joinDate"
            type="date"
            placeholder="选择日期"
            style="width: 100%"
        />
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
import { ref, reactive, computed, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    default: 'add'
  },
  data: {
    type: Object,
    default: null
  },
  departmentTree: {
    type: Array,
    default: () => []
  },
  positions: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const visible = ref(props.modelValue)
const formRef = ref(null)
const saving = ref(false)

const formData = reactive({
  id: null,
  name: '',
  gender: 'male',
  phone: '',
  email: '',
  departmentId: null,
  positionId: null,
  reportToId: null,
  joinDate: '',
  remark: '',
  status: 'active'
})

const rules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入手机号', trigger: 'blur' }],
  departmentId: [{ required: true, message: '请选择部门', trigger: 'change' }],
  positionId: [{ required: true, message: '请选择岗位', trigger: 'change' }],
  joinDate: [{ required: true, message: '请选择入职日期', trigger: 'change' }]
}

const drawerTitle = computed(() => {
  return formData.id ? '编辑人员' : '新增人员'
})

const filteredPositions = computed(() => {
  if (!formData.departmentId) return []
  return props.positions.filter(pos => pos.departmentId === formData.departmentId)
})

const userList = computed(() => {
  return []
})

watch(() => props.modelValue, (val) => {
  visible.value = val
  if (val && props.data) {
    Object.assign(formData, props.data)
  } else if (val) {
    resetForm()
  }
})

watch(visible, (val) => {
  emit('update:modelValue', val)
})

const resetForm = () => {
  Object.assign(formData, {
    id: null,
    name: '',
    gender: 'male',
    phone: '',
    email: '',
    departmentId: null,
    positionId: null,
    reportToId: null,
    joinDate: '',
    remark: '',
    status: 'active'
  })
}

const handleSave = async () => {
  if (!formRef.value) return

  await formRef.value.validate((valid) => {
    if (valid) {
      saving.value = true

      setTimeout(() => {
        saving.value = false
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
.drawer-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
