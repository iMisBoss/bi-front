<!-- src/components/UserSelectDialog.vue -->
<template>
  <el-dialog
      v-model="dialogVisible"
      title="选择人员"
      width="800px"
      :close-on-click-modal="false"
  >
    <div class="user-select">
      <el-input
          v-model="searchText"
          placeholder="搜索姓名/工号"
          clearable
          style="margin-bottom: 16px"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>

      <el-table
          :data="filteredUsers"
          @selection-change="handleSelectionChange"
          max-height="400"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="name" label="姓名" />
        <el-table-column prop="code" label="工号" />
        <el-table-column prop="department" label="部门" />
      </el-table>
    </div>

    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="handleConfirm">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Search } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: Boolean,
  multiple: Boolean
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const searchText = ref('')
const selectedUsers = ref([])

const userList = ref([
  { id: 1, name: '张三', code: 'E001', department: '技术部' },
  { id: 2, name: '李四', code: 'E002', department: '人事部' },
  { id: 3, name: '王五', code: 'E003', department: '财务部' }
])

const filteredUsers = computed(() => {
  if (!searchText.value) return userList.value
  const keyword = searchText.value.toLowerCase()
  return userList.value.filter(u =>
      u.name.toLowerCase().includes(keyword) ||
      u.code.toLowerCase().includes(keyword)
  )
})

const handleSelectionChange = (selection) => {
  selectedUsers.value = selection
}

const handleConfirm = () => {
  emit('confirm', selectedUsers.value)
  dialogVisible.value = false
}
</script>

<style scoped lang="scss">
.user-select {
  :deep(.el-table) {
    margin-top: 12px;
  }
}
</style>
