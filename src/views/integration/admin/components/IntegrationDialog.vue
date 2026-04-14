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
      <el-form-item label="应用名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入应用名称" />
      </el-form-item>

      <el-form-item label="对接类型" prop="type">
        <el-select v-model="formData.type" placeholder="请选择对接类型" style="width: 100%">
          <el-option label="组织人员同步" value="组织人员同步" />
          <el-option label="数据对接" value="数据对接" />
          <el-option label="消息推送" value="消息推送" />
        </el-select>
      </el-form-item>

      <el-form-item label="对接地址" prop="url">
        <el-input v-model="formData.url" placeholder="http://内网IP:端口/api/xxx" />
      </el-form-item>

      <el-form-item label="鉴权方式" prop="authType">
        <el-radio-group v-model="formData.authType">
          <el-radio label="Token" value="Token">Token</el-radio>
          <el-radio label="密钥" value="密钥">密钥</el-radio>
          <el-radio label="无鉴权" value="无鉴权">无鉴权</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="鉴权密钥" v-if="formData.authType !== '无鉴权'">
        <el-input v-model="formData.authKey" type="password" show-password placeholder="请输入鉴权密钥" />
        <div class="form-tip">密钥将加密存储，前端脱敏展示</div>
      </el-form-item>

      <el-form-item label="同步周期" prop="syncCycle">
        <el-select v-model="formData.syncCycle" placeholder="请选择同步周期" style="width: 100%">
          <el-option label="实时" value="实时" />
          <el-option label="每5分钟" value="每5分钟" />
          <el-option label="每小时" value="每小时" />
          <el-option label="每日 02:00" value="每日 02:00" />
          <el-option label="每周" value="每周" />
        </el-select>
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
  type: '',
  url: '',
  authType: 'Token',
  authKey: '',
  syncCycle: '',
  remark: ''
})

const rules = {
  name: [{ required: true, message: '请输入应用名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择对接类型', trigger: 'change' }],
  url: [{ required: true, message: '请输入对接地址', trigger: 'blur' }],
  syncCycle: [{ required: true, message: '请选择同步周期', trigger: 'change' }]
}

const dialogTitle = computed(() => {
  return formData.id ? '编辑集成应用' : '新增集成应用'
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
    type: '',
    url: '',
    authType: 'Token',
    authKey: '',
    syncCycle: '',
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
