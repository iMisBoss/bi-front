<template>
  <el-dialog v-model="visible" title="选择成员" width="800px">
    <el-table
        :data="availableMembers"
        @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="50" />
      <el-table-column prop="name" label="姓名" width="120" />
      <el-table-column prop="employeeNo" label="工号" width="120" />
      <el-table-column prop="department" label="部门" width="150" />
      <el-table-column prop="position" label="岗位" width="150" />
    </el-table>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="handleConfirm">确定添加</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  availableMembers: Array
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const selectedMembers = ref([])

const handleSelectionChange = (selection) => {
  selectedMembers.value = selection
}

const handleConfirm = () => {
  emit('confirm', selectedMembers.value)
}
</script>
