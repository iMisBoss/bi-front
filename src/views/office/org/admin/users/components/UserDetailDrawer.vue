<template>
  <el-drawer
      v-model="visible"
      :title="`${data?.name || ''}（人员）`"
      size="700px"
      @close="handleClose"
  >
    <template #header>
      <div class="drawer-header">
        <h3 class="drawer-title">{{ data?.name }}（人员）</h3>
        <div class="drawer-actions">
          <el-button size="small" @click="$emit('edit', data)">编辑</el-button>
          <el-button
              v-if="data?.status === 'active'"
              size="small"
              type="warning"
              :disabled="data?.isAdmin"
              @click="$emit('disable', data)"
          >
            禁用
          </el-button>
          <el-button
              v-else-if="data?.status === 'disabled'"
              size="small"
              type="success"
              @click="$emit('enable', data)"
          >
            启用
          </el-button>
          <el-button
              size="small"
              type="danger"
              :disabled="data?.status === 'resigned' || data?.isAdmin"
              @click="$emit('resign', data)"
          >
            离职办理
          </el-button>
        </div>
      </div>
    </template>

    <el-descriptions :column="2" border>
      <el-descriptions-item label="姓名">{{ data?.name }}</el-descriptions-item>
      <el-descriptions-item label="性别">{{ data?.gender === 'male' ? '男' : '女' }}</el-descriptions-item>
      <el-descriptions-item label="工号">{{ data?.employeeNo }}</el-descriptions-item>
      <el-descriptions-item label="手机号">{{ data?.phone }}</el-descriptions-item>
      <el-descriptions-item label="邮箱">{{ data?.email || '-' }}</el-descriptions-item>
      <el-descriptions-item label="所属部门">{{ data?.department }}</el-descriptions-item>
      <el-descriptions-item label="岗位">{{ data?.position }}</el-descriptions-item>
      <el-descriptions-item label="职级">
        <el-tag size="small">{{ data?.level }}</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="入职日期">{{ data?.joinDate }}</el-descriptions-item>
      <el-descriptions-item label="直属领导">{{ data?.reportTo || '-' }}</el-descriptions-item>
      <el-descriptions-item label="人员状态">
        <el-tag :type="getStatusType(data?.status)" size="small">
          {{ getStatusLabel(data?.status) }}
        </el-tag>
      </el-descriptions-item>

      <template v-if="data?.status === 'disabled'">
        <el-descriptions-item label="禁用时间">{{ data?.disableDate }}</el-descriptions-item>
        <el-descriptions-item label="禁用原因">{{ data?.disableReason || '-' }}</el-descriptions-item>
      </template>

      <template v-if="data?.status === 'resigned'">
        <el-descriptions-item label="离职日期">{{ data?.resignDate }}</el-descriptions-item>
        <el-descriptions-item label="离职原因">{{ data?.resignReason || '-' }}</el-descriptions-item>
      </template>
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

const emit = defineEmits(['update:modelValue', 'edit', 'enable', 'disable', 'resign'])

const visible = ref(props.modelValue)

watch(() => props.modelValue, (val) => {
  visible.value = val
})

watch(visible, (val) => {
  emit('update:modelValue', val)
})

const getStatusType = (status) => {
  const types = { active: 'success', disabled: 'warning', resigned: 'info' }
  return types[status] || ''
}

const getStatusLabel = (status) => {
  const labels = { active: '在职', disabled: '禁用', resigned: '离职' }
  return labels[status] || status
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
