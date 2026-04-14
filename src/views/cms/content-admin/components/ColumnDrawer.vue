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
      <el-form-item label="栏目名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入栏目名称" />
      </el-form-item>

      <el-form-item label="父栏目">
        <el-tree-select
            v-model="formData.parentId"
            :data="columnTree"
            :props="{ value: 'id', label: 'name', children: 'children' }"
            node-key="id"
            check-strictly
            clearable
            placeholder="选择父栏目（可选）"
            style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="栏目类型" prop="type">
        <el-radio-group v-model="formData.type">
          <el-radio label="content" value="content">内容类</el-radio>
          <el-radio label="document" value="document">文档类</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="排序号" prop="sort">
        <el-input-number v-model="formData.sort" :min="1" style="width: 100%" />
      </el-form-item>

      <el-form-item label="管理员">
        <el-input v-model="formData.manager" placeholder="指定栏目管理员" />
      </el-form-item>

      <el-form-item label="状态" prop="status">
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
  parentId: null,
  type: 'content',
  sort: 1,
  manager: '',
  status: 'enabled',
  remark: ''
})

const rules = {
  name: [{ required: true, message: '请输入栏目名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择栏目类型', trigger: 'change' }],
  sort: [{ required: true, message: '请输入排序号', trigger: 'blur' }]
}

const columnTree = ref([
  { id: 1, name: '新闻公告', children: [
      { id: 2, name: '公司公告', children: [] },
      { id: 3, name: '部门通知', children: [] }
    ]
  },
  { id: 4, name: '规章制度', children: [] },
  { id: 5, name: '技术文档', children: [] }
])

const drawerTitle = computed(() => {
  return formData.id ? '编辑栏目' : '新增栏目'
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
    parentId: null,
    type: 'content',
    sort: 1,
    manager: '',
    status: 'enabled',
    remark: ''
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
