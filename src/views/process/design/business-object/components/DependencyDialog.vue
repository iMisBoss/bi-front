<template>
  <el-dialog
      v-model="dialogVisible"
      width="750px"
      :close-on-click-modal="false"
      @close="handleClose"
  >
    <el-tabs v-model="activeTab">
      <el-tab-pane label="关联表单" name="forms">
        <el-table :data="formsData" border style="width: 100%">
          <el-table-column prop="formName" label="表单名称" min-width="150" />
          <el-table-column prop="creator" label="创建人" width="100" />
          <el-table-column prop="createTime" label="创建时间" width="160" />
          <el-table-column label="操作" width="100" align="center">
            <template #default="{ row }">
              <el-button size="small" type="primary" @click="handleViewForm(row)" icon="View">查看</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
      <el-tab-pane label="关联流程" name="processes">
        <el-table :data="processesData" border style="width: 100%">
          <el-table-column prop="processName" label="流程名称" min-width="150" />
          <el-table-column prop="creator" label="创建人" width="100" />
          <el-table-column prop="createTime" label="创建时间" width="160" />
          <el-table-column label="操作" width="100" align="center">
            <template #default="{ row }">
              <el-button size="small" type="primary" @click="handleViewProcess(row)" icon="View">查看</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>
    <template #footer>
      <el-button @click="handleClose">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  modelValue: Boolean,
  data: Object
})

const emit = defineEmits(['update:modelValue'])

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const activeTab = ref('forms')

// 模拟数据
const formsData = ref([
  { id: 1, formName: '请假申请表', creator: '张三', createTime: '2024-01-10 10:00' },
  { id: 2, formName: '请假统计报表', creator: '李四', createTime: '2024-01-11 14:30' }
])

const processesData = ref([
  { id: 1, processName: '请假审批流程', creator: '王五', createTime: '2024-01-12 09:00' }
])

const handleClose = () => {
  emit('update:modelValue', false)
}

const handleViewForm = (row) => {
  ElMessage.info(`查看表单：${row.formName}`)
}

const handleViewProcess = (row) => {
  ElMessage.info(`查看流程：${row.processName}`)
}
</script>
