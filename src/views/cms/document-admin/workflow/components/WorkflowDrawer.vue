<template>
  <el-drawer
      v-model="visible"
      title="流程配置"
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
      <el-form-item label="公文类型" prop="docType">
        <el-select v-model="formData.docType" placeholder="选择公文类型" style="width: 100%">
          <el-option label="发文" value="发文" />
          <el-option label="收文" value="收文" />
          <el-option label="通知" value="通知" />
          <el-option label="涉密公文" value="涉密公文" />
        </el-select>
      </el-form-item>

      <el-form-item label="绑定流程" prop="flowName">
        <el-select v-model="formData.flowName" placeholder="选择已部署的流程" style="width: 100%">
          <el-option label="发文审批流程" value="发文审批流程" />
          <el-option label="收文登记流程" value="收文登记流程" />
          <el-option label="通知发布流程" value="通知发布流程" />
          <el-option label="涉密公文特批流程" value="涉密公文特批流程" />
        </el-select>
      </el-form-item>

      <el-form-item label="适用范围" prop="scope">
        <el-select v-model="formData.scope" placeholder="选择适用范围" style="width: 100%">
          <el-option label="全公司" value="全公司" />
          <el-option label="指定部门" value="指定部门" />
          <el-option label="指定角色" value="指定角色" />
        </el-select>
      </el-form-item>

      <el-form-item label="流程状态" prop="status">
        <el-radio-group v-model="formData.status">
          <el-radio label="enabled" value="enabled">启用</el-radio>
          <el-radio label="disabled" value="disabled">禁用</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-alert
          title="提示：绑定流程需先在流程中心完成BPMN流程部署"
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
import { ref, reactive, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
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
  docType: '',
  flowName: '',
  nodes: '',
  scope: '全公司',
  status: 'enabled'
})

const rules = {
  docType: [{ required: true, message: '请选择公文类型', trigger: 'change' }],
  flowName: [{ required: true, message: '请选择绑定流程', trigger: 'change' }],
  scope: [{ required: true, message: '请选择适用范围', trigger: 'change' }]
}

watch(() => props.modelValue, (val) => {
  visible.value = val
  if (val && props.data) {
    Object.assign(formData, props.data)
  }
})

watch(visible, (val) => {
  emit('update:modelValue', val)
})

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
