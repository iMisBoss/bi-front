<template>
  <el-dialog
      v-model="visible"
      title="批量调岗"
      width="600px"
      :close-on-click-modal="false"
      @close="handleClose"
  >
    <el-alert
        :title="`将为 ${selectedUsers.length} 名人员调整部门岗位`"
        type="info"
        :closable="false"      style="margin-bottom: 16px"
    />

    <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="100px"
    >
      <el-form-item label="目标部门" prop="departmentId">
        <el-tree-select
            v-model="formData.departmentId"
            :data="departmentTree"
            :props="{ value: 'id', label: 'name', children: 'children' }"
            node-key="id"
            check-strictly
            clearable
            placeholder="选择目标部门"
            style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="目标岗位" prop="positionId">
        <el-select
            v-model="formData.positionId"
            placeholder="选择目标岗位"
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
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleConfirm" :loading="confirming">确定调岗</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  selectedUsers: {
    type: Array,
    default: () => []
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
const confirming = ref(false)

const formData = reactive({
  departmentId: null,
  positionId: null,
  departmentName: '',
  positionName: ''
})

const rules = {
  departmentId: [{ required: true, message: '请选择目标部门', trigger: 'change' }],
  positionId: [{ required: true, message: '请选择目标岗位', trigger: 'change' }]
}

const filteredPositions = computed(() => {
  if (!formData.departmentId) return []
  return props.positions.filter(pos => pos.departmentId === formData.departmentId)
})

watch(() => props.modelValue, (val) => {
  visible.value = val
})

watch(visible, (val) => {
  emit('update:modelValue', val)
})

watch(() => formData.departmentId, (val) => {
  formData.positionId = null
  const dept = findDepartment(props.departmentTree, val)
  formData.departmentName = dept?.name || ''
})

watch(() => formData.positionId, (val) => {
  const pos = props.positions.find(p => p.id === val)
  formData.positionName = pos?.name || ''
})

const findDepartment = (nodes, id) => {
  for (const node of nodes) {
    if (node.id === id) return node
    if (node.children) {
      const found = findDepartment(node.children, id)
      if (found) return found
    }
  }
  return null
}

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
