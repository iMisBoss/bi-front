<template>
  <el-dialog
      v-model="visible"
      title="保存筛选模板"
      width="500px"
      :close-on-click-modal="false"
  >
    <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
      <el-form-item label="模板名称" prop="name">
        <el-input v-model="form.name" placeholder="如：月度审计报表" />
      </el-form-item>
      <el-form-item label="模板描述">
        <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="请输入模板描述"
        />
      </el-form-item>
      <el-form-item label="筛选条件">
        <el-tag v-for="(value, key) in filterForm" :key="key" style="margin-right: 8px">
          {{ key }}: {{ value }}
        </el-tag>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="handleSubmit">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  modelValue: Boolean,
  filterForm: Object
})

const emit = defineEmits(['update:modelValue', 'save'])

const visible = ref(false)
const formRef = ref(null)

const form = ref({
  name: '',
  description: ''
})

const rules = {
  name: [{ required: true, message: '请输入模板名称', trigger: 'blur' }]
}

watch(() => props.modelValue, (val) => {
  visible.value = val
})

watch(visible, (val) => {
  emit('update:modelValue', val)
})

const handleSubmit = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      emit('save', {
        name: form.value.name,
        description: form.value.description,
        form: { ...props.filterForm }
      })
      visible.value = false
      ElMessage.success('模板保存成功')
    }
  })
}
</script>
