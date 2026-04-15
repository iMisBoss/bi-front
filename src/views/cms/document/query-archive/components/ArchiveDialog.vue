<template>
  <el-dialog
      v-model="visible"
      title="公文归档"
      width="600px"
      :close-on-click-modal="false"
  >
    <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
      <el-form-item label="公文标题">
        <el-input v-model="document.title" disabled />
      </el-form-item>
      <el-form-item label="文号">
        <el-input v-model="document.docNumber" disabled />
      </el-form-item>
      <el-form-item label="归档编号" prop="archiveNo">
        <el-input v-model="form.archiveNo" placeholder="请输入归档编号" />
      </el-form-item>
      <el-form-item label="归档日期" prop="archiveDate">
        <el-date-picker
            v-model="form.archiveDate"
            type="date"
            placeholder="选择日期"
            value-format="YYYY-MM-DD"
            style="width: 100%"
        />
      </el-form-item>
      <el-form-item label="保管期限">
        <el-select v-model="form.retentionPeriod" placeholder="请选择" style="width: 100%">
          <el-option label="永久" value="permanent" />
          <el-option label="30年" value="30years" />
          <el-option label="10年" value="10years" />
        </el-select>
      </el-form-item>
      <el-form-item label="归档备注">
        <el-input
            v-model="form.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="submitting">确认归档</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  modelValue: Boolean,
  document: Object
})

const emit = defineEmits(['update:modelValue', 'success'])

const visible = ref(false)
const submitting = ref(false)
const formRef = ref(null)

const form = ref({
  archiveNo: '',
  archiveDate: new Date().toISOString().split('T')[0],
  retentionPeriod: 'permanent',
  remark: ''
})

const rules = {
  archiveNo: [{ required: true, message: '请输入归档编号', trigger: 'blur' }],
  archiveDate: [{ required: true, message: '请选择归档日期', trigger: 'change' }]
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
      submitting.value = true
      setTimeout(() => {
        submitting.value = false
        visible.value = false
        emit('success')
        ElMessage.success('归档成功')
      }, 1000)
    }
  })
}
</script>
