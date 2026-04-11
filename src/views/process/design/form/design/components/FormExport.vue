<template>
  <div></div>
</template>

<script setup>
import { ElMessage } from 'element-plus'

const props = defineProps({
  formInfo: {
    type: Object,
    required: true
  },
  formFields: {
    type: Array,
    required: true
  },
  linkageRules: {
    type: Array,
    required: true
  }
})

// 深拷贝工具函数
const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj.getTime())
  if (obj instanceof Array) return obj.map(item => deepClone(item))
  if (obj instanceof Object) {
    const clonedObj = {}
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key])
      }
    }
    return clonedObj
  }
}

// 导出表单配置
const handleExport = () => {
  if (props.formFields.length === 0) {
    ElMessage.warning('请先设计表单再导出')
    return
  }

  // 组装完整配置
  const formConfig = {
    formName: props.formInfo.name,
    formCategory: props.formInfo.category,
    formDesc: props.formInfo.description,
    fields: deepClone(props.formFields),
    linkageRules: deepClone(props.linkageRules),
    exportTime: new Date().toLocaleString(),
    version: '1.0'
  }

  // 生成JSON文件并下载
  const jsonStr = JSON.stringify(formConfig, null, 2)
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  const timestamp = new Date().getTime()
  a.download = `${props.formInfo.name || '表单配置'}_${timestamp}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)

  ElMessage.success('表单配置导出成功')
}

defineExpose({
  handleExport
})
</script>
