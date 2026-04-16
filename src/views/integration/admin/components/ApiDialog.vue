<template>
  <el-dialog
      v-model="visible"
      :title="dialogTitle"
      width="700px"
      :close-on-click-modal="false"
      @close="handleClose"
  >
    <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="120px"
    >
      <el-form-item label="接口名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入接口名称" />
      </el-form-item>

      <el-form-item label="请求路径" prop="path">
        <el-input v-model="formData.path" placeholder="/api/v1/xxx" />
      </el-form-item>

      <el-form-item label="请求方式" prop="method">
        <el-select v-model="formData.method" placeholder="请选择请求方式" style="width: 100%">
          <el-option label="GET" value="GET" />
          <el-option label="POST" value="POST" />
          <el-option label="PUT" value="PUT" />
          <el-option label="DELETE" value="DELETE" />
        </el-select>
      </el-form-item>

      <el-form-item label="接口分类" prop="category">
        <el-select v-model="formData.category" placeholder="请选择接口分类" style="width: 100%">
          <el-option label="系统接口" value="system" />
          <el-option label="业务接口" value="business" />
          <el-option label="集成接口" value="integration" />
        </el-select>
      </el-form-item>

      <el-form-item label="鉴权方式" prop="authType">
        <el-select v-model="formData.authType" placeholder="请选择鉴权方式" style="width: 100%">
          <el-option label="Token" value="Token" />
          <el-option label="密钥" value="密钥" />
          <el-option label="无鉴权" value="无鉴权" />
        </el-select>
      </el-form-item>

      <el-form-item label="限流阈值" prop="rateLimit">
        <el-input-number v-model="formData.rateLimit" :min="1" :max="100000" style="width: 100%" />
        <div class="form-tip">每日最大调用次数</div>
      </el-form-item>

      <el-form-item label="接口版本">
        <el-input v-model="formData.version" placeholder="v1" />
      </el-form-item>

      <el-form-item label="接口描述">
        <el-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
            maxlength="200"
            show-word-limit
            placeholder="请输入接口描述"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSave" :loading="saving">保存</el-button>
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
  path: '',
  method: 'GET',
  category: 'system',
  authType: 'Token',
  rateLimit: 1000,
  version: 'v1',
  description: ''
})

const rules = {
  name: [{ required: true, message: '请输入接口名称', trigger: 'blur' }],
  path: [{ required: true, message: '请输入请求路径', trigger: 'blur' }],
  method: [{ required: true, message: '请选择请求方式', trigger: 'change' }],
  category: [{ required: true, message: '请选择接口分类', trigger: 'change' }],
  authType: [{ required: true, message: '请选择鉴权方式', trigger: 'change' }],
  rateLimit: [{ required: true, message: '请输入限流阈值', trigger: 'blur' }]
}

const dialogTitle = computed(() => {
  return formData.id ? '编辑接口' : '新增接口'
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
    path: '',
    method: 'GET',
    category: 'system',
    authType: 'Token',
    rateLimit: 1000,
    version: 'v1',
    description: ''
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
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}
</style>
