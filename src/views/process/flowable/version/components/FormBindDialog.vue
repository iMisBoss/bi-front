<template>
  <el-dialog v-model="visible" title="表单绑定配置" width="550px" destroy-on-close>
    <div class="bind-header">
      <span class="process-name">流程：<el-tag effect="plain">{{ processName }}</el-tag></span>
    </div>

    <el-form :model="bindForm" label-width="80px" style="margin-top: 20px;">
      <el-form-item label="选择表单" required>
        <el-select v-model="bindForm.formId" placeholder="请选择要绑定的表单" filterable style="width: 100%">
          <el-option v-for="form in availableForms" :key="form.id" :label="form.name" :value="form.id" />
        </el-select>
        <div class="form-tip">选择后，该流程发起时将展示此表单。</div>
      </el-form-item>
      <el-form-item label="当前绑定">
        <span class="current-bind">{{ bindForm.currentFormName || '未绑定' }}</span>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="handleSave" :loading="saving">确认绑定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'

const visible = ref(false)
const saving = ref(false)
const processName = ref('')

const bindForm = reactive({
  formId: '',
  currentFormName: ''
})

// 模拟可用表单列表
const availableForms = ref([
  { id: 'f1', name: '请假申请表' },
  { id: 'f2', name: '加班申请表' },
  { id: 'f3', name: '出差申请表' },
  { id: 'f4', name: '费用报销单' },
  { id: 'f5', name: '采购申请单' }
])

const open = (row) => {
  processName.value = row.name
  bindForm.currentFormName = row.bindForm || '未绑定'
  bindForm.formId = '' // 默认不选中，或者是当前 ID
  visible.value = true
}

const handleSave = () => {
  if (!bindForm.formId) {
    ElMessage.warning('请选择一个表单进行绑定')
    return
  }

  saving.value = true
  setTimeout(() => {
    // 触发父组件更新逻辑（通过 emit 或回调）
    // 这里简化为直接更新当前行的显示（实际项目中应请求后端）
    ElMessage.success('表单绑定成功')
    saving.value = false
    visible.value = false
  }, 500)
}

// 暴露方法给父组件
defineExpose({ open })
</script>

<style scoped lang="scss">
.bind-header {
  margin-bottom: 10px;

  .process-name {
    font-size: 14px;
    font-weight: 500;
  }
}
.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}
.current-bind {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}
</style>
