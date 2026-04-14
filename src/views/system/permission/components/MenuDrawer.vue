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
      <el-form-item label="父级菜单">
        <el-tree-select
            v-model="formData.parentId"
            :data="menuTree"
            :props="{ value: 'id', label: 'name', children: 'children' }"
            node-key="id"
            check-strictly
            clearable
            placeholder="选择父级菜单（可选）"
            style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="菜单名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入菜单名称" />
      </el-form-item>

      <el-form-item label="菜单类型" prop="type">
        <el-radio-group v-model="formData.type">
          <el-radio label="module" value="module">模块</el-radio>
          <el-radio label="menu" value="menu">菜单</el-radio>
          <el-radio label="page" value="page">页面</el-radio>
          <el-radio label="button" value="button">按钮</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="路由地址" prop="path">
        <el-input v-model="formData.path" placeholder="/module/page" :disabled="formData.type === 'button'" />
      </el-form-item>

      <el-form-item label="图标">
        <el-input v-model="formData.icon" placeholder="ElementPlus图标名称" />
      </el-form-item>

      <el-form-item label="排序号" prop="sort">
        <el-input-number v-model="formData.sort" :min="1" style="width: 100%" />
      </el-form-item>

      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="formData.status">
          <el-radio label="enabled" value="enabled">启用</el-radio>
          <el-radio label="disabled" value="disabled">禁用</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="是否可见">
        <el-switch v-model="formData.visible" />
      </el-form-item>

      <el-form-item label="系统内置">
        <el-switch v-model="formData.system" :disabled="!!formData.id" />
      </el-form-item>

      <el-alert
          title="提示：系统内置菜单不可删除，仅可隐藏；按钮类型无需填写路由地址"
          type="info"
          :closable="false"
          style="margin-top: 12px"
      />
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
  menuTree: {
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
  parentId: null,
  name: '',
  type: 'menu',
  path: '',
  icon: '',
  sort: 1,
  status: 'enabled',
  visible: true,
  system: false
})

const rules = {
  name: [{ required: true, message: '请输入菜单名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择菜单类型', trigger: 'change' }],
  path: [{ required: true, message: '请输入路由地址', trigger: 'blur' }]
}

const drawerTitle = computed(() => {
  return formData.id ? '编辑菜单' : '新增菜单'
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
    parentId: null,
    name: '',
    type: 'menu',
    path: '',
    icon: '',
    sort: 1,
    status: 'enabled',
    visible: true,
    system: false
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
