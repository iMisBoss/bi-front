<template>
  <el-drawer
      v-model="visible"
      title="内容详情"
      size="700px"
      @close="handleClose"
  >
    <el-descriptions :column="1" border>
      <el-descriptions-item label="标题">{{ data?.title }}</el-descriptions-item>
      <el-descriptions-item label="副标题">{{ data?.subtitle || '无' }}</el-descriptions-item>
      <el-descriptions-item label="栏目">{{ data?.column }}</el-descriptions-item>
      <el-descriptions-item label="可见范围">{{ data?.scope }}</el-descriptions-item>
      <el-descriptions-item label="状态">
        <el-tag :type="getStatusType(data?.status)" size="small">{{ getStatusText(data?.status) }}</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="置顶">
        <el-tag v-if="data?.top" type="warning" size="small">置顶</el-tag>
        <span v-else>否</span>
      </el-descriptions-item>
      <el-descriptions-item label="生效时间">{{ data?.effectiveTime || '无' }}</el-descriptions-item>
      <el-descriptions-item label="过期时间">{{ data?.expireTime || '无' }}</el-descriptions-item>
      <el-descriptions-item label="创建人">{{ data?.creator }}</el-descriptions-item>
      <el-descriptions-item label="发布时间">{{ data?.publishTime || '未发布' }}</el-descriptions-item>
    </el-descriptions>

    <el-divider content-position="left">内容预览</el-divider>
    <div class="content-preview" v-html="data?.content"></div>

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

watch(() => props.modelValue, (val) => {
  visible.value = val
})

watch(visible, (val) => {
  emit('update:modelValue', val)
})

const getStatusType = (status) => {
  const types = {
    'draft': 'info',
    'pending': 'warning',
    'published': 'success',
    'expired': '',
    'offline': 'info'
  }
  return types[status] || ''
}

const getStatusText = (status) => {
  const texts = {
    'draft': '草稿',
    'pending': '待审批',
    'published': '已发布',
    'expired': '已过期',
    'offline': '已下架'
  }
  return texts[status] || status
}

const handleClose = () => {
  visible.value = false
}
</script>

<style lang="scss" scoped>
.content-preview {
  padding: 16px;
  background: #f5f7fa;
  border-radius: 4px;
  min-height: 100px;
  line-height: 1.8;
}

.drawer-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
