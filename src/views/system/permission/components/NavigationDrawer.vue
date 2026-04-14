<template>
  <el-drawer
      v-model="visible"
      :title="drawerTitle"
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
      <el-form-item label="导航名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入导航名称" />
      </el-form-item>

      <el-form-item label="关联菜单" prop="menuId">
        <el-tree-select
            v-model="formData.menuId"
            :data="menuTree"
            :props="{ value: 'id', label: 'name', children: 'children' }"
            node-key="id"
            check-strictly
            clearable
            placeholder="选择关联菜单"
            style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="图标">
        <el-input v-model="formData.icon" placeholder="ElementPlus图标名称" />
      </el-form-item>

      <el-form-item label="显示角色">
        <el-select v-model="formData.roles" multiple placeholder="选择显示角色" style="width: 100%">
          <el-option label="全部角色" value="全部角色" />
          <el-option label="超级管理员" value="超级管理员" />
          <el-option label="系统管理员" value="系统管理员" />
          <el-option label="部门管理员" value="部门管理员" />
          <el-option label="普通员工" value="普通员工" />
        </el-select>
      </el-form-item>

      <el-form-item label="显示">
        <el-switch v-model="formData.visible" />
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
  }
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const visible = ref(props.modelValue)
const formRef = ref(null)
const saving = ref(false)

const formData = reactive({
  id: null,
  name: '',
  menuId: null,
  icon: '',
  roles: [],
  visible: true
})

const rules = {
  name: [{ required: true, message: '请输入导航名称', trigger: 'blur' }]
}

const menuTree = ref([
  { id: 1, name: '工作台', children: [
      { id: 2, name: '我的待办' }
    ]
  },
  { id: 3, name: '流程中心' },
  { id: 4, name: '系统管理' }
])

const drawerTitle = computed(() => {
  return formData.id ? '编辑导航' : '新增导航'
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
    menuId: null,
    icon: '',
    roles: [],
    visible: true
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
