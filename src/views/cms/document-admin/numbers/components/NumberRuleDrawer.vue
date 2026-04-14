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
        label-width="120px"
    >
      <el-form-item label="规则名称" prop="name">
        <el-input v-model="formData.name" placeholder="如：公司发文规则" />
      </el-form-item>

      <el-form-item label="文号前缀" prop="prefix">
        <el-input v-model="formData.prefix" placeholder="如：公司发、技术发" />
      </el-form-item>

      <el-form-item label="年份格式" prop="yearFormat">
        <el-radio-group v-model="formData.yearFormat">
          <el-radio label="full" value="full">2026（4位）</el-radio>
          <el-radio label="short" value="short">26（2位）</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="流水号位数" prop="serialDigits">
        <el-select v-model="formData.serialDigits" placeholder="选择位数" style="width: 100%">
          <el-option label="3位（001）" :value="3" />
          <el-option label="4位（0001）" :value="4" />
        </el-select>
        <span class="form-tip">每年自动重置</span>
      </el-form-item>

      <el-form-item label="适用公文类型" prop="applyType">
        <el-select v-model="formData.applyType" placeholder="选择公文类型" style="width: 100%">
          <el-option label="发文" value="发文" />
          <el-option label="收文" value="收文" />
          <el-option label="通知" value="通知" />
        </el-select>
      </el-form-item>

      <el-form-item label="规则状态" prop="status">
        <el-radio-group v-model="formData.status">
          <el-radio label="enabled" value="enabled">启用</el-radio>
          <el-radio label="disabled" value="disabled">禁用</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-alert
          title="提示：文号全局唯一，系统自动生成，禁止人工修改"
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
  }
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const visible = ref(props.modelValue)
const formRef = ref(null)
const saving = ref(false)

const formData = reactive({
  id: null,
  name: '',
  prefix: '',
  yearFormat: 'full',
  serialDigits: 3,
  applyType: '发文',
  status: 'enabled'
})

const rules = {
  name: [{ required: true, message: '请输入规则名称', trigger: 'blur' }],
  prefix: [{ required: true, message: '请输入文号前缀', trigger: 'blur' }],
  yearFormat: [{ required: true, message: '请选择年份格式', trigger: 'change' }],
  serialDigits: [{ required: true, message: '请选择流水号位数', trigger: 'change' }],
  applyType: [{ required: true, message: '请选择适用公文类型', trigger: 'change' }]
}

const drawerTitle = computed(() => {
  return formData.id ? '编辑规则' : '新增规则'
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
    prefix: '',
    yearFormat: 'full',
    serialDigits: 3,
    applyType: '发文',
    status: 'enabled'
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

.form-tip {
  margin-left: 12px;
  color: #909399;
  font-size: 12px;
}
</style>
