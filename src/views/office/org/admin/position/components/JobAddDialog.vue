<template>
  <el-dialog
      v-model="dialogVisible"
      :title="jobData?.id ? '编辑职务' : '新增职务'"
      width="600px"
  >
    <el-form :model="formData" label-width="100px" :rules="rules" ref="formRef">
      <el-form-item label="职务名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入职务名称" />
      </el-form-item>
      <el-form-item label="职务编码" prop="code">
        <el-input v-model="formData.code" placeholder="请输入职务编码" />
      </el-form-item>
      <el-form-item label="职级级别" prop="level">
        <el-select v-model="formData.level" placeholder="请选择职级级别" style="width: 100%">
          <el-option label="基层" value="基层" />
          <el-option label="中层" value="中层" />
          <el-option label="高层" value="高层" />
          <el-option label="高管" value="高管" />
        </el-select>
      </el-form-item>
      <el-form-item label="排序号" prop="sort">
        <el-input-number v-model="formData.sort" :min="1" :max="999" style="width: 100%" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="formData.status">
          <el-radio label="enabled">启用</el-radio>
          <el-radio label="disabled">禁用</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="备注">
        <el-input
            v-model="formData.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注"
            maxlength="200"
            show-word-limit
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="handleConfirm">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  modelValue: Boolean,
  jobData: Object
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const dialogVisible = ref(false)
const formRef = ref(null)

const formData = ref({
  id: null,
  name: '',
  code: '',
  level: '',
  sort: 1,
  status: 'enabled',
  remark: ''
})

const rules = {
  name: [{ required: true, message: '请输入职务名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入职务编码', trigger: 'blur' }],
  level: [{ required: true, message: '请选择职级级别', trigger: 'change' }],
  sort: [{ required: true, message: '请输入排序号', trigger: 'blur' }]
}

watch(() => props.modelValue, (val) => {
  dialogVisible.value = val
})

watch(() => props.jobData, (val) => {
  if (val) {
    Object.assign(formData.value, val)
  }
}, { deep: true })

watch(dialogVisible, (val) => {
  emit('update:modelValue', val)
})

const handleConfirm = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      emit('confirm', { ...formData.value })
    } else {
      ElMessage.warning('请填写必填项')
    }
  })
}
</script>
