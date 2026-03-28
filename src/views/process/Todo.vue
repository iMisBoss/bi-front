<template>
  <div class="todo-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>我的待办</span>
          <el-input v-model="searchText" placeholder="搜索待办" style="width: 200px" clearable />
        </div>
      </template>

      <el-table :data="tableData" v-loading="loading" border>
        <el-table-column prop="title" label="标题" width="300" />
        <el-table-column prop="type" label="类型" width="120" />
        <el-table-column prop="applicant" label="申请人" width="100" />
        <el-table-column prop="applyTime" label="申请时间" width="180" />
        <el-table-column prop="urgency" label="紧急程度" width="100">
          <template #default="{ row }">
            <el-tag :type="row.urgency === 'high' ? 'danger' : 'warning'">
              {{ row.urgency === 'high' ? '紧急' : '普通' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="200">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleApprove">审批</el-button>
            <el-button link type="primary" @click="handleView">查看</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

const loading = ref(false)
const searchText = ref('')
const tableData = ref([])

onMounted(() => {
  loadData()
})

const loadData = () => {
  loading.value = true
  setTimeout(() => {
    tableData.value = [
      { id: 1, title: '请假申请 - 张三', type: '请假', applicant: '张三', applyTime: '2026-01-15 10:00', urgency: 'high' },
      { id: 2, title: '用车申请 - 李四', type: '用车', applicant: '李四', applyTime: '2026-01-15 09:30', urgency: 'normal' }
    ]
    loading.value = false
  }, 500)
}

const handleApprove = () => {
  ElMessage.info('审批功能开发中')
}

const handleView = () => {
  ElMessage.info('查看功能开发中')
}
</script>

<style lang="scss" scoped>
.todo-page {
  padding: 20px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
</style>
