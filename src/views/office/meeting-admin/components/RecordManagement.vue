<template>
  <div class="record-management">
    <!-- 工具栏 -->
    <div class="record-toolbar">
      <el-button type="danger" @click="handleBatchDelete" :disabled="selectedRows.length === 0">
        批量删除
      </el-button>
      <el-button @click="handleBatchArchive" :disabled="selectedRows.length === 0">
        批量归档
      </el-button>
      <el-button @click="handleExport">导出</el-button>
      <el-button @click="loadData" icon="Refresh">刷新</el-button>
    </div>

    <!-- 搜索筛选 -->
    <div class="search-filter">
      <el-input
          v-model="searchForm.keyword"
          placeholder="搜索会议主题、发起人"
          style="width: 240px; margin-right: 12px"
          clearable
          @keyup.enter="loadData"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      <el-select
          v-model="searchForm.status"
          placeholder="会议状态"
          style="width: 120px; margin-right: 12px"
          clearable
          @change="loadData"
      >
        <el-option label="已完成" value="completed" />
        <el-option label="已取消" value="cancelled" />
        <el-option label="进行中" value="ongoing" />
      </el-select>
      <el-date-picker
          v-model="searchForm.dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="YYYY-MM-DD"
          style="width: 240px; margin-right: 12px"
          @change="loadData"
      />
      <el-button type="primary" @click="loadData" icon="Search">查询</el-button>
      <el-button @click="handleResetSearch" icon="Refresh">重置</el-button>
    </div>

    <!-- 表格 -->
    <el-table
        ref="tableRef"
        :data="tableData"
        style="width: 100%"
        border
        v-loading="loading"
        @selection-change="handleSelectionChange"
        :header-cell-style="{ background: '#fafafa', color: '#333', fontWeight: '600' }"
    >
      <el-table-column type="selection" width="50" />
      <el-table-column prop="title" label="会议主题" min-width="180" show-overflow-tooltip />
      <el-table-column prop="roomName" label="会议室" width="120" />
      <el-table-column prop="time" label="会议时间" width="180" />
      <el-table-column prop="initiator" label="发起人" width="100" />
      <el-table-column prop="participantCount" label="参会人数" width="100" align="center" />
      <el-table-column prop="status" label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)" size="small">
            {{ getStatusText(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150" fixed="right" align="center">
        <template #default="{ row }">
          <el-button size="small" type="primary" link @click="handleView(row)">查看</el-button>
          <el-button size="small" type="danger" link @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-wrapper">
      <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadData"
          @current-change="loadData"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search } from '@element-plus/icons-vue'

const emit = defineEmits(['selection-change', 'view', 'delete'])

const loading = ref(false)
const tableRef = ref(null)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const selectedRows = ref([])

const searchForm = reactive({
  keyword: '',
  status: '',
  dateRange: []
})

const tableData = ref([
  {
    id: 1,
    title: '技术周会',
    roomName: '一号会议室',
    time: '2026-04-15 14:00-16:00',
    initiator: '张三',
    participantCount: 8,
    status: 'completed'
  },
  {
    id: 2,
    title: '项目评审会议',
    roomName: '线上',
    time: '2026-04-14 10:00-11:30',
    initiator: '李四',
    participantCount: 5,
    status: 'cancelled'
  },
  {
    id: 3,
    title: '产品规划讨论',
    roomName: '三号会议室',
    time: '2026-04-16 09:00-12:00',
    initiator: '王五',
    participantCount: 12,
    status: 'ongoing'
  }
])

const getStatusType = (status) => {
  const typeMap = {
    completed: 'info',
    cancelled: 'danger',
    ongoing: 'warning'
  }
  return typeMap[status] || 'info'
}

const getStatusText = (status) => {
  const textMap = {
    completed: '已完成',
    cancelled: '已取消',
    ongoing: '进行中'
  }
  return textMap[status] || '未知'
}

const handleSelectionChange = (selection) => {
  selectedRows.value = selection
  emit('selection-change', selection)
}

const handleView = (row) => {
  emit('view', row)
}

const handleDelete = (row) => {
  emit('delete', row)
}

const handleBatchDelete = () => {
  ElMessageBox.confirm(`确认删除选中的 ${selectedRows.value.length} 条会议记录吗？此操作不可恢复！`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'error'
  }).then(() => {
    ElMessage.success('批量删除成功')
    loadData()
  }).catch(() => {})
}

const handleBatchArchive = () => {
  ElMessageBox.confirm(`确认归档选中的 ${selectedRows.value.length} 条会议记录吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('批量归档成功')
    loadData()
  }).catch(() => {})
}

const handleExport = () => {
  ElMessage.success('导出功能开发中')
}

const handleResetSearch = () => {
  searchForm.keyword = ''
  searchForm.status = ''
  searchForm.dateRange = []
  loadData()
}

const loadData = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    total.value = tableData.value.length
  }, 300)
}

defineExpose({
  loadData
})
</script>

<style scoped lang="scss">
.record-management {
  padding: 20px;

  .record-toolbar {
    margin-bottom: 16px;
    display: flex;
    gap: 8px;
  }

  .search-filter {
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
  }

  .pagination-wrapper {
    margin-top: 16px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>
