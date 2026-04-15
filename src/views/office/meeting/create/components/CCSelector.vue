<template>
  <el-dialog
      v-model="visible"
      title="选择抄送人"
      width="800px"
      top="5vh"
  >
    <div class="cc-selector">
      <el-input
          v-model="ccSearch"
          placeholder="搜索人员姓名/部门"
          prefix-icon="Search"
          style="margin-bottom: 16px"
      />
      <el-table :data="filteredCCUsers" border max-height="400">
        <el-table-column label="选择" width="60" align="center">
          <template #default="{ row }">
            <el-checkbox v-model="row.selected" />
          </template>
        </el-table-column>
        <el-table-column prop="name" label="姓名" width="100" />
        <el-table-column prop="department" label="部门" width="120" />
        <el-table-column prop="position" label="职位" width="120" />
      </el-table>
    </div>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="confirmCCSelection">确认选择</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { defineProps, defineEmits, ref, computed } from 'vue'
import { Search } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: Boolean,
  allUsers: Array
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const ccSearch = ref('')

const filteredCCUsers = computed(() => {
  if (!ccSearch.value) return props.allUsers
  const keyword = ccSearch.value.toLowerCase()
  return props.allUsers.filter(u =>
      u.name.toLowerCase().includes(keyword) ||
      u.department.toLowerCase().includes(keyword)
  )
})

const confirmCCSelection = () => {
  const selectedUsers = props.allUsers
      .filter(u => u.selected)
      .map(u => ({
        id: u.id,
        name: u.name,
        department: u.department
      }))
  emit('confirm', selectedUsers)
  visible.value = false
}
</script>

<style lang="scss" scoped>
.cc-selector {
  // 继承父级样式
}
</style>
