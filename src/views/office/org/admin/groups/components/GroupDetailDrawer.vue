<template>
  <el-drawer
      v-model="visible"
      :title="`${data?.name || ''}（群组）`"
      size="600px"
      @close="handleClose"
  >
    <template #header>
      <div class="drawer-header">
        <h3 class="drawer-title">{{ data?.name }}（群组）</h3>
        <div class="drawer-actions">
          <el-button size="small" @click="$emit('edit', data)">编辑</el-button>
          <el-button
              v-if="data?.status === 'enabled'"
              size="small"
              type="warning"
              :disabled="data?.isSystem"
              @click="$emit('toggle-status', data)"
          >
            禁用
          </el-button>
          <el-button
              v-else
              size="small"
              type="success"
              @click="$emit('toggle-status', data)"
          >
            启用
          </el-button>
          <el-button
              size="small"
              type="danger"
              :disabled="data?.isSystem"
              @click="$emit('dissolve', data)"
          >
            解散
          </el-button>
        </div>
      </div>
    </template>

    <el-descriptions :column="2" border>
      <el-descriptions-item label="群ID">{{ data?.groupId }}</el-descriptions-item>
      <el-descriptions-item label="群组名称">{{ data?.name }}</el-descriptions-item>
      <el-descriptions-item label="上级群组">
        <el-tag v-if="data?.parentName === '根群组'" type="info" size="small">根群组</el-tag>
        <span v-else>{{ data?.parentName }}</span>
      </el-descriptions-item>
      <el-descriptions-item label="群组类型">
        <el-tag :type="getTypeTagType(data?.type)" size="small">{{ data?.typeName }}</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="适用范围">
        <el-tag :type="getScopeType(data?.scope)" size="small">{{ data?.scopeName }}</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="群主">{{ data?.owner }}</el-descriptions-item>
      <el-descriptions-item label="群组成员">{{ data?.memberCount }}人</el-descriptions-item>
      <el-descriptions-item label="群组状态">
        <el-tag :type="data?.status === 'enabled' ? 'success' : 'info'" size="small">
          {{ data?.status === 'enabled' ? '启用' : '禁用' }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="创建时间">{{ data?.createTime }}</el-descriptions-item>
      <el-descriptions-item label="群组描述" :span="2">{{ data?.description || '无' }}</el-descriptions-item>
    </el-descriptions>
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

const emit = defineEmits(['update:modelValue', 'edit', 'toggle-status', 'dissolve'])

const visible = ref(props.modelValue)

watch(() => props.modelValue, (val) => {
  visible.value = val
})

watch(visible, (val) => {
  emit('update:modelValue', val)
})

const getScopeType = (scope) => {
  const types = {
    'all': '',
    'department': 'primary',
    'position': 'warning',
    'custom': 'success'
  }
  return types[scope] || ''
}

const getTypeTagType = (type) => {
  const types = {
    'department': '',
    'project': 'success',
    'system': 'danger',
    'temporary': 'warning'
  }
  return types[type] || ''
}

const handleClose = () => {
  visible.value = false
}
</script>

<style lang="scss" scoped>
.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;

  .drawer-title {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
  }

  .drawer-actions {
    display: flex;
    gap: 8px;
  }
}
</style>
