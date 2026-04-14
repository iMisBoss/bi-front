<template>
  <div class="archive-manage-page">
    <el-breadcrumb separator="/" class="breadcrumb">
      <el-breadcrumb-item :to="{ path: '/' }">后台首页</el-breadcrumb-item>
      <el-breadcrumb-item>日常办公管理</el-breadcrumb-item>
      <el-breadcrumb-item>公文管理</el-breadcrumb-item>
      <el-breadcrumb-item>归档与数据管理</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card class="main-card" shadow="never">
      <div class="toolbar">
        <div class="toolbar-left">
          <el-button-group>
            <el-button
                @click="handleBatchArchive"
                :disabled="selectedRows.length === 0"
            >
              批量归档
            </el-button>
            <el-button
                type="danger"
                @click="handleBatchDelete"
                :disabled="selectedRows.length === 0"
            >
              批量删除
            </el-button>
            <el-button @click="handleExport" icon="Download">导出</el-button>
          </el-button-group>
        </div>

        <div class="toolbar-right">
          <el-button @click="handleRefresh" icon="Refresh">刷新</el-button>
        </div>
      </div>

      <div class="filter-bar">
        <el-input
            v-model="searchKeyword"
            placeholder="搜索公文标题"
            prefix-icon="Search"
            clearable
            style="width: 240px"
            @input="handleSearch"
        />
        <el-select
            v-model="statusFilter"
            placeholder="公文状态"
            style="width: 120px"
            clearable
            @change="handleFilter"
        >
          <el-option label="全部" value="" />
          <el-option label="已办结" value="completed" />
          <el-option label="已归档" value="archived" />
        </el-select>
        <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 240px"
            @change="handleFilter"
        />
      </div>

      <el-table
          :data="filteredDocuments"
          border
          @selection-change="handleSelectionChange"
          row-key="id"
          :header-cell-style="{ background: '#fafafa', color: '#333', fontWeight: '600' }"
          style="flex: 1"
      >
        <el-table-column type="selection" width="50" />
        <el-table-column prop="title" label="公文标题" min-width="250" show-overflow-tooltip />
        <el-table-column prop="docNumber" label="文号" width="150" />
        <el-table-column prop="type" label="类型" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getTypeTagType(row.type)" size="small">{{ row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="initiator" label="发起人" width="100" />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="archiveTime" label="归档时间" width="160" />
        <el-table-column label="操作" width="140" align="center" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleView(row)">查看</el-button>
            <el-button
                link
                type="primary"
                size="small"
                @click="handleArchive(row)"
                :disabled="row.status === 'archived'"
            >
              归档
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrapper">
        <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :total="total"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const selectedRows = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

const searchKeyword = ref('')
const statusFilter = ref('')
const dateRange = ref(null)

const documentData = ref([])

const filteredDocuments = computed(() => {
  let data = [...documentData.value]

  if (searchKeyword.value) {
    data = data.filter(item => item.title?.includes(searchKeyword.value))
  }

  if (statusFilter.value) {
    data = data.filter(item => item.status === statusFilter.value)
  }

  if (dateRange.value && dateRange.value.length === 2) {
    const [start, end] = dateRange.value
    data = data.filter(item => {
      const time = new Date(item.archiveTime || item.createTime)
      return time >= start && time <= end
    })
  }

  total.value = data.length
  return data
})

onMounted(() => {
  loadDocumentData()
})

const loadDocumentData = () => {
  documentData.value = [
    { id: 1, title: '关于2026年度工作计划的通知', docNumber: '公司发〔2026〕001号', type: '通知', initiator: '张三', status: 'archived', archiveTime: '2026-04-10 15:00', createTime: '2026-04-01 10:00' },
    { id: 2, title: '技术部项目管理办法', docNumber: '技术发〔2026〕015号', type: '发文', initiator: '李四', status: 'completed', archiveTime: '', createTime: '2026-04-05 14:00' },
    { id: 3, title: '财务部报销流程优化方案', docNumber: '财务发〔2026〕008号', type: '发文', initiator: '周八', status: 'archived', archiveTime: '2026-04-12 09:00', createTime: '2026-03-20 11:00' },
    { id: 4, title: '产品部Q1工作总结', docNumber: '产品发〔2026〕012号', type: '发文', initiator: '王五', status: 'completed', archiveTime: '', createTime: '2026-04-08 16:00' },
    { id: 5, title: '关于清明节放假安排的通知', docNumber: '通知〔2026〕003号', type: '通知', initiator: '行政部', status: 'archived', archiveTime: '2026-04-03 10:00', createTime: '2026-03-25 09:00' }
  ]
  total.value = documentData.value.length
}

const getTypeTagType = (type) => {
  const types = { '发文': 'primary', '收文': 'success', '通知': 'warning' }
  return types[type] || ''
}

const getStatusType = (status) => {
  const types = { 'completed': 'primary', 'archived': 'info' }
  return types[status] || ''
}

const getStatusText = (status) => {
  const texts = { 'completed': '已办结', 'archived': '已归档' }
  return texts[status] || status
}

const handleSelectionChange = (selection) => {
  selectedRows.value = selection
}

const handleView = (row) => {
  ElMessage.info('查看公文详情功能')
}

const handleArchive = (row) => {
  ElMessageBox.confirm(`确定要归档公文「${row.title}」吗？归档后将锁定只读。`, '归档公文', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'info'
  }).then(() => {
    row.status = 'archived'
    row.archiveTime = new Date().toLocaleString()
    ElMessage.success('归档成功')
  }).catch(() => {})
}

const handleBatchArchive = () => {
  if (selectedRows.value.length === 0) return

  ElMessageBox.confirm(`确定要批量归档 ${selectedRows.value.length} 个公文吗？`, '批量归档', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'info'
  }).then(() => {
    const now = new Date().toLocaleString()
    selectedRows.value.forEach(row => {
      row.status = 'archived'
      row.archiveTime = now
    })
    ElMessage.success('批量归档成功')
    selectedRows.value = []
  }).catch(() => {})
}

const handleBatchDelete = () => {
  if (selectedRows.value.length === 0) return

  const archivedDocs = selectedRows.value.filter(row => row.status === 'archived')
  if (archivedDocs.length > 0) {
    ElMessage.warning('已归档的公文禁止删除，请先取消归档')
    return
  }

  ElMessageBox.confirm(`确定要删除 ${selectedRows.value.length} 个公文吗？`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'error'
  }).then(() => {
    const ids = selectedRows.value.map(row => row.id)
    documentData.value = documentData.value.filter(item => !ids.includes(item.id))
    ElMessage.success('删除成功')
    selectedRows.value = []
    total.value = documentData.value.length
  }).catch(() => {})
}

const handleExport = () => {
  ElMessage.success('归档台账导出成功')
}

const handleRefresh = () => {
  loadDocumentData()
  ElMessage.success('刷新成功')
}

const handleSearch = () => {}
const handleFilter = () => {}

const handleSizeChange = (val) => {
  pageSize.value = val
}

const handleCurrentChange = (val) => {
  currentPage.value = val
}
</script>

<style lang="scss" scoped>
.archive-manage-page {
  padding: 20px;
  height: calc(100vh - 60px);
  display: flex;
  flex-direction: column;
  background: #f5f7fa;

  .breadcrumb {
    margin-bottom: 16px;
    font-size: 14px;
  }

  .main-card {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border-radius: 8px;

    :deep(.el-card__body) {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      padding: 16px;
    }
  }

  .toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 16px;
    border-bottom: 1px solid #ebeef5;

    .toolbar-left,
    .toolbar-right {
      display: flex;
      gap: 8px;
    }
  }

  .filter-bar {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;
  }

  .pagination-wrapper {
    margin-top: 16px;
    display: flex;
    justify-content: flex-end;
    flex-shrink: 0;
  }
}
</style>
