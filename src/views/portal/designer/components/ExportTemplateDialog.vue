<template>
  <el-dialog
      v-model="visible"
      title="导出门户模板"
      width="500px"
      :close-on-click-modal="false"
  >
    <el-form label-width="100px" size="default">
      <el-form-item label="模板名称">
        <el-input v-model="exportForm.name" placeholder="请输入模板名称" />
      </el-form-item>
      <el-form-item label="模板描述">
        <el-input v-model="exportForm.description" type="textarea" :rows="3" placeholder="请输入模板描述（选填）" />
      </el-form-item>
      <el-alert
          title="提示：导出的模板文件包含当前门户的所有组件配置，可在其他环境中导入使用。"
          type="info"
          :closable="false"
          show-icon
      />
    </el-form>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="handleExport" :loading="exporting">
        确认导出
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  portalData: {
    type: Object,
    default: () => ({})
  }
})

const visible = ref(false)
const exporting = ref(false)

const exportForm = reactive({
  name: '',
  description: ''
})

const open = (data) => {
  exportForm.name = data.name || '门户模板'
  exportForm.description = data.description || ''
  visible.value = true
}

const handleExport = () => {
  if (!exportForm.name) {
    ElMessage.warning('请输入模板名称')
    return
  }

  exporting.value = true
  setTimeout(() => {
    const exportData = {
      name: exportForm.name,
      description: exportForm.description,
      category: props.portalData.category,
      components: props.portalData.components || [],
      exportTime: new Date().toLocaleString('zh-CN'),
      version: '1.0'
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${exportForm.name}.json`
    a.click()
    URL.revokeObjectURL(url)

    exporting.value = false
    visible.value = false
    ElMessage.success('模板导出成功')
  }, 500)
}

defineExpose({ open })
</script>

<style scoped lang="scss">
.el-alert {
  margin-top: 16px;
}
</style>
