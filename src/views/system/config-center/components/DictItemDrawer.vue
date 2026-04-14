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
      <el-form-item label="字典标签" prop="label">
        <el-input v-model="formData.label" placeholder="请输入字典标签（显示文本）" />
      </el-form-item>

      <el-form-item label="字典值" prop="value">
        <el-input v-model="formData.value" placeholder="请输入字典值（存储值）" />
      </el-form-item>

      <el-form-item label="排序号" prop="sort">
        <el-input-number v-model="formData.sort" :min="1" style="width: 100%" />
      </el-form-item>

      <el-form-item label="默认值">
        <el-switch v-model="formData.isDefault" />
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
  },
  dictTypeId: {
    type: Number,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const visible = ref(props.modelValue)
const formRef = ref(null)
const saving = ref(false)

const formData = reactive({
  id: null,
  typeId: null,
  label: '',
  value: '',
  sort: 1,
  isDefault: false,
  status: 'enabled',
  remark: ''
})

const rules = {
  label: [{ required: true, message: '请输入字典标签', trigger: 'blur' }],
  value: [{ required: true, message: '请输入字典值', trigger: 'blur' }]
}

const drawerTitle = computed(() => {
  return formData.id ? '编辑字典项' : '新增字典项'
})

watch(() => props.modelValue, (val) => {
  visible.value = val
  if (val && props.data) {
    Object.assign(formData, props.data)
  } else if (val) {
    resetForm()
    formData.typeId = props.dictTypeId
  }
})

watch(visible, (val) => {
  emit('update:modelValue', val)
})

const resetForm = () => {
  Object.assign(formData, {
    id: null,
    typeId: props.dictTypeId,
    label: '',
    value: '',
    sort: 1,
    isDefault: false,
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
