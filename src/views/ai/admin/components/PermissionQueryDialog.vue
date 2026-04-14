<template>
  <el-dialog
      v-model="visible"
      title="权限查询"
      width="600px"
      @close="handleClose"
  >
    <el-form label-width="100px">
      <el-form-item label="人员姓名">
        <el-input v-model="userName" placeholder="请输入人员姓名" clearable />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleQuery">查询</el-button>
      </el-form-item>
    </el-form>

    <el-table v-if="queryResult" :data="[queryResult]" border style="margin-top: 16px">
      <el-table-column prop="name" label="姓名" width="120" />
      <el-table-column prop="department" label="部门" width="150" />
      <el-table-column prop="qa" label="智能问答" width="100" align="center" />
      <el-table-column prop="summary" label="文档总结" width="100" align="center" />
      <el-table-column prop="writing" label="文案生成" width="100" align="center" />
      <el-table-column prop="assistant" label="流程咨询" width="100" align="center" />
      <el-table-column prop="knowledge" label="知识库检索" width="100" align="center" />
    </el-table>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">关闭</el-button>
        <el-button type="primary" @click="handleExport">导出备案</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const visible = ref(props.modelValue)
const userName = ref('')
const queryResult = ref(null)

watch(() => props.modelValue, (val) => {
  visible.value = val
})

watch(visible, (val) => {
  emit('update:modelValue', val)
})

const handleQuery = () => {
  if (!userName.value) {
    ElMessage.warning('请输入人员姓名')
    return
  }
  queryResult.value = {
    name: userName.value,
    department: '技术部',
    qa: '可使用',
    summary: '仅查看',
    writing: '可使用',
    assistant: '仅查看',
    knowledge: '仅查看'
  }
}

const handleExport = () => {
  ElMessage.success('导出成功')
}

const handleClose = () => {
  visible.value = false
  userName.value = ''
  queryResult.value = null
}
</script>

<style lang="scss" scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
