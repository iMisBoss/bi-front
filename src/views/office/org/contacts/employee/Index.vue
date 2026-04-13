<template>
  <div class="employee-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>员工入职离职</span>
        </div>
      </template>

      <el-tabs v-model="activeTab">
        <el-tab-pane label="在职员工" name="active">
          <el-table :data="activeData" v-loading="loading" border>
            <el-table-column prop="name" label="姓名" width="120" />
            <el-table-column prop="department" label="部门" width="150" />
            <el-table-column prop="position" label="岗位" width="150" />
            <el-table-column prop="entryDate" label="入职日期" width="120" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag type="success">在职</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" fixed="right" width="200">
              <template #default="{ row }">
                <el-button link type="primary" @click="handleTransfer(row)">调岗</el-button>
                <el-button link type="danger" @click="handleResign(row)">离职</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="离职员工" name="resigned">
          <el-table :data="resignedData" v-loading="loading" border>
            <el-table-column prop="name" label="姓名" width="120" />
            <el-table-column prop="department" label="部门" width="150" />
            <el-table-column prop="position" label="岗位" width="150" />
            <el-table-column prop="entryDate" label="入职日期" width="120" />
            <el-table-column prop="resignDate" label="离职日期" width="120" />
            <el-table-column prop="reason" label="离职原因" width="200" />
            <el-table-column label="操作" fixed="right" width="150">
              <template #default="{ row }">
                <el-button link type="primary" @click="handleView(row)">查看</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

const loading = ref(false)
const activeTab = ref('active')
const activeData = ref([])
const resignedData = ref([])

onMounted(() => {
  loadData()
})

const loadData = () => {
  loading.value = true
  setTimeout(() => {
    activeData.value = [
      { id: 1, name: '张三', department: '科技部', position: '前端工程师', entryDate: '2026-01-01', status: 1 }
    ]
    resignedData.value = [
      { id: 2, name: '李四', department: '科技部', position: '后端工程师', entryDate: '2023-01-01', resignDate: '2026-01-01', reason: '个人发展' }
    ]
    loading.value = false
  }, 500)
}

const handleTransfer = (row) => {
  ElMessage.info('调岗功能开发中')
}

const handleResign = (row) => {
  ElMessage.info('离职办理功能开发中')
}

const handleView = (row) => {
  ElMessage.info('查看详情功能开发中')
}
</script>

<style lang="scss" scoped>
.employee-page {
  padding: 20px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
</style>
