<template>
  <div class="done-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>我已处理</span>
          <el-input v-model="searchText" placeholder="搜索已处理事项" style="width: 200px" clearable />
        </div>
      </template>

      <el-table :data="tableData" v-loading="loading" border>
        <el-table-column prop="title" label="标题" min-width="300" />
        <el-table-column prop="type" label="类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getTypeTag(row.type)">
              {{ row.typeName }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="applicant" label="申请人" width="100" />
        <el-table-column prop="applyTime" label="申请时间" width="180" />
        <el-table-column prop="handleTime" label="处理时间" width="180" />
        <el-table-column prop="result" label="审批结果" width="100">
          <template #default="{ row }">
            <el-tag :type="row.result === 'agree' ? 'success' : 'danger'">
              {{ row.resultName }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="150">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleView(row)">查看</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          class="pagination"
      />
    </el-card>

    <el-dialog v-model="dialogVisible" title="审批详情" width="700px">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="标题">{{ currentDone.title }}</el-descriptions-item>
        <el-descriptions-item label="类型">{{ currentDone.typeName }}</el-descriptions-item>
        <el-descriptions-item label="申请人">{{ currentDone.applicant }}</el-descriptions-item>
        <el-descriptions-item label="申请时间">{{ currentDone.applyTime }}</el-descriptions-item>
        <el-descriptions-item label="处理时间">{{ currentDone.handleTime }}</el-descriptions-item>
        <el-descriptions-item label="审批结果">
          <el-tag :type="currentDone.result === 'agree' ? 'success' : 'danger'">
            {{ currentDone.resultName }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="审批意见">{{ currentDone.opinion }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="dialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

const loading = ref(false)
const searchText = ref('')
const tableData = ref([])
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const dialogVisible = ref(false)
const currentDone = ref({})

onMounted(() => {
  loadData()
})

const loadData = () => {
  loading.value = true
  setTimeout(() => {
    tableData.value = [
      { id: 1, title: '张三的请假申请', type: 'leave', typeName: '请假', applicant: '张三', applyTime: '2024-01-15 10:00', handleTime: '2024-01-15 11:00', result: 'agree', resultName: '已同意', opinion: '同意' },
      { id: 2, title: '会议室预定申请', type: 'meeting', typeName: '会议', applicant: '李四', applyTime: '2024-01-14 09:00', handleTime: '2024-01-14 10:00', result: 'agree', resultName: '已同意', opinion: '已安排会议室' },
      { id: 3, title: '用车申请', type: 'vehicle', typeName: '用车', applicant: '王五', applyTime: '2024-01-13 14:30', handleTime: '2024-01-13 15:00', result: 'reject', resultName: '已拒绝', opinion: '车辆已安排完毕' }
    ]
    pagination.total = tableData.value.length
    loading.value = false
  }, 500)
}

const handleView = (row) => {
  currentDone.value = row
  dialogVisible.value = true
}

const getTypeTag = (type) => {
  const types = { leave: 'warning', meeting: 'primary', vehicle: 'success', seal: 'danger' }
  return types[type] || 'info'
}
</script>

<style lang="scss" scoped>
.done-page {
  padding: 20px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .pagination {
    margin-top: 20px;
    justify-content: flex-end;
  }
}
</style>
