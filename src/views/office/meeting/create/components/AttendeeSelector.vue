<template>
  <el-dialog
      v-model="visible"
      title="选择参会人"
      width="800px"
      top="5vh"
  >
    <div class="attendee-selector">
      <el-input
          v-model="attendeeSearch"
          placeholder="搜索人员姓名/部门"
          prefix-icon="Search"
          style="margin-bottom: 16px"
      />
      <el-table :data="filteredAttendees" border max-height="400">
        <el-table-column label="选择" width="60" align="center">
          <template #default="{ row }">
            <el-checkbox v-model="row.selected" />
          </template>
        </el-table-column>
        <el-table-column label="姓名" width="100">
          <template #default="{ row }">
            {{ row.name }}
          </template>
        </el-table-column>
        <el-table-column prop="department" label="部门" width="120" />
        <el-table-column prop="position" label="职位" width="120" />
        <el-table-column label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 'online' ? 'success' : 'info'" size="small">
              {{ row.status === 'online' ? '在线' : '离线' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="类型" width="120" align="center">
          <template #default="{ row }">
            <el-radio-group v-model="row.attendeeType" size="small">
              <el-radio-button label="required">必填</el-radio-button>
              <el-radio-button label="optional">普通</el-radio-button>
            </el-radio-group>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="confirmAttendeeSelection">确认选择</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { defineProps, defineEmits, ref, computed } from 'vue'
import { Search } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: Boolean,
  allAttendees: Array
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const attendeeSearch = ref('')

const filteredAttendees = computed(() => {
  if (!attendeeSearch.value) return props.allAttendees
  const keyword = attendeeSearch.value.toLowerCase()
  return props.allAttendees.filter(u =>
      u.name.toLowerCase().includes(keyword) ||
      u.department.toLowerCase().includes(keyword)
  )
})

const confirmAttendeeSelection = () => {
  const selectedAttendees = props.allAttendees
      .filter(u => u.selected)
      .map(u => ({
        id: u.id,
        name: u.name,
        department: u.department,
        isRequired: u.attendeeType === 'required'
      }))
  emit('confirm', selectedAttendees)
  visible.value = false
}
</script>

<style lang="scss" scoped>
.attendee-selector {
  // 继承父级样式
}
</style>
