<template>
  <el-drawer
      v-model="visible"
      title="模板详情"
      size="700px"
      @close="handleClose"
  >
    <el-tabs v-model="activeTab">
      <el-tab-pane label="基本信息" name="basic">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="模板名称">{{ data?.name }}</el-descriptions-item>
          <el-descriptions-item label="模板类型">
            <el-tag :type="getTypeTagType(data?.type)" size="small">{{ getTypeText(data?.type) }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="适用部门">{{ data?.department }}</el-descriptions-item>
          <el-descriptions-item label="版本号">{{ data?.version }}</el-descriptions-item>
          <el-descriptions-item label="使用次数">{{ data?.usage }}次</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="data?.status === 'enabled' ? 'success' : 'info'" size="small">
              {{ data?.status === 'enabled' ? '启用' : '禁用' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="备注">{{ data?.remark || '无' }}</el-descriptions-item>
        </el-descriptions>
      </el-tab-pane>

      <el-tab-pane label="模板内容" name="content">
        <div class="template-content" v-html="data?.content"></div>
      </el-tab-pane>
    </el-tabs>

    <template #footer>
      <div class="drawer-footer">
        <el-button @click="handleClose">关闭</el-button>
        <el-button type="primary" @click="$emit('edit', data)">编辑</el-button>
      </div>
    </template>
  </el-drawer>
</template>

<script setup>
import { ref, watch } from 'vue'

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

const emit = defineEmits(['update:modelValue', 'edit'])

const visible = ref(props.modelValue)
const activeTab = ref('basic')

watch(() => props.modelValue, (val) => {
  visible.value = val
})

watch(visible, (val) => {
  emit('update:modelValue', val)
})

const getTypeTagType = (type) => {
  const types = { 'send': 'primary', 'receive': 'success', 'notice': 'warning' }
  return types[type] || ''
}

const getTypeText = (type) => {
  const texts = { 'send': '发文', 'receive': '收文', 'notice': '通知' }
  return texts[type] || type
}

const handleClose = () => {
  visible.value = false
}
</script>

<style lang="scss" scoped>
.template-content {
  padding: 16px;
  background: #f5f7fa;
  border-radius: 4px;
  min-height: 200px;
  line-height: 1.8;
}

.drawer-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
