<template>
  <div class="query-archive-page">
    <div class="page-header">
      <div class="header-left">
        <h2>查询与归档</h2>
        <el-tag type="info" size="small">公文检索与档案管理</el-tag>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="handleAdvancedSearch" icon="Search">高级搜索</el-button>
        <el-button @click="handleExport" icon="Download">导出列表</el-button>
      </div>
    </div>

    <el-card class="filter-card" shadow="hover" v-if="advancedSearchVisible">
      <template #header>
        <div class="filter-header">
          <span>高级搜索条件</span>
          <el-button link type="primary" @click="advancedSearchVisible = false">收起</el-button>
        </div>
      </template>
      <el-form :inline="true" :model="filterForm" size="default">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="公文类型">
              <el-select v-model="filterForm.docType" placeholder="全部类型" clearable style="width: 100%">
                <el-option label="请示" value="request" />
                <el-option label="报告" value="report" />
                <el-option label="通知" value="notice" />
                <el-option label="通报" value="bulletin" />
                <el-option label="决定" value="decision" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="年份">
              <el-select v-model="filterForm.year" placeholder="全部年份" clearable style="width: 100%">
                <el-option label="2026" value="2026" />
                <el-option label="2025" value="2025" />
                <el-option label="2024" value="2024" />
                <el-option label="2023" value="2023" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="发文单位">
              <el-input v-model="filterForm.sender" placeholder="请输入" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="密级">
              <el-select v-model="filterForm.securityLevel" placeholder="全部" clearable style="width: 100%">
                <el-option label="公开" value="public" />
                <el-option label="内部" value="internal" />
                <el-option label="秘密" value="secret" />
                <el-option label="机密" value="confidential" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="时间范围">
              <el-date-picker
                  v-model="filterForm.dateRange"
                  type="daterange"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  value-format="YYYY-MM-DD"
                  style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="关键词">
              <el-input v-model="filterForm.keyword" placeholder="标题/文号/内容" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item>
              <el-button type="primary" @click="handleFilter" icon="Search">查询</el-button>
              <el-button @click="handleResetFilter" icon="Refresh">重置</el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <el-card class="quick-filter-card" shadow="never" v-if="!advancedSearchVisible">
      <el-input
          v-model="quickSearch"
          placeholder="快速搜索：公文标题/文号/发文单位"
          clearable
          style="width: 400px"
          @input="handleQuickSearch"
      >
        <template #prefix><el-icon><Search /></el-icon></template>
        <template #append>
          <el-button @click="advancedSearchVisible = true">高级搜索</el-button>
        </template>
      </el-input>
    </el-card>

    <el-card class="tab-card" shadow="never">
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="公文查询" name="query">
          <template #label>
            <span>公文查询 <el-badge :value="queryList.length" :max="999" /></span>
          </template>
        </el-tab-pane>
        <el-tab-pane label="已归档公文" name="archived" />
        <el-tab-pane label="回收站" name="recycle" />
      </el-tabs>

      <div v-if="activeTab === 'query'" class="tab-content">
        <el-table :data="filteredQueryList" border v-loading="loading" @selection-change="handleQuerySelection">
          <el-table-column type="selection" width="50" align="center" />
          <el-table-column prop="title" label="公文标题" min-width="250" show-overflow-tooltip />
          <el-table-column prop="docType" label="公文类型" width="120" />
          <el-table-column prop="docNumber" label="文号" width="160" />
          <el-table-column prop="sender" label="发文单位" width="150" />
          <el-table-column prop="sendDate" label="发文日期" width="120" sortable />
          <el-table-column prop="securityLevel" label="密级" width="100">
            <template #default="{ row }">
              <el-tag :type="getSecurityType(row.securityLevel)" size="small">{{ row.securityLevel }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)" size="small">{{ row.status }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="240" fixed="right" align="center">
            <template #default="{ row }">
              <el-button link type="primary" size="small" @click="handleView(row)">查看</el-button>
              <el-button link type="primary" size="small" @click="handleDownload(row)">下载</el-button>
              <el-button link type="warning" size="small" @click="handleArchive(row)">归档</el-button>
              <el-button link type="danger" size="small" @click="handleDelete(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <div class="batch-actions" v-if="querySelected.length > 0">
          <el-alert type="info" :closable="false" show-icon>
            已选择 {{ querySelected.length }} 项
            <el-button link type="warning" size="small" @click="handleBatchArchive">批量归档</el-button>
            <el-button link type="danger" size="small" @click="handleBatchDelete">批量删除</el-button>
          </el-alert>
        </div>

        <div class="pagination">
          <span class="total">共 {{ filteredQueryList.length }} 条</span>
          <el-pagination layout="prev, pager, next" :total="filteredQueryList.length" />
        </div>
      </div>

      <div v-if="activeTab === 'archived'" class="tab-content">
        <div class="archive-stats">
          <el-statistic title="归档总数" :value="archivedList.length" />
          <el-statistic title="本年度归档" :value="archivedList.filter(i => i.archiveDate.startsWith('2026')).length" />
        </div>

        <el-table :data="archivedList" border v-loading="loading">
          <el-table-column prop="title" label="公文标题" min-width="250" show-overflow-tooltip />
          <el-table-column prop="docType" label="公文类型" width="120" />
          <el-table-column prop="docNumber" label="文号" width="160" />
          <el-table-column prop="sender" label="发文单位" width="150" />
          <el-table-column prop="sendDate" label="发文日期" width="120" sortable />
          <el-table-column prop="archiveDate" label="归档日期" width="120" />
          <el-table-column prop="archiveNo" label="归档编号" width="150" />
          <el-table-column label="操作" width="180" fixed="right" align="center">
            <template #default="{ row }">
              <el-button link type="primary" size="small" @click="handleView(row)">查看</el-button>
              <el-button link type="primary" size="small" @click="handleDownload(row)">下载</el-button>
              <el-button link type="warning" size="small" @click="handleUnarchive(row)">取消归档</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="pagination">
          <span class="total">共 {{ archivedList.length }} 条</span>
          <el-pagination layout="prev, pager, next" :total="archivedList.length" />
        </div>
      </div>

      <div v-if="activeTab === 'recycle'" class="tab-content">
        <el-alert title="回收站中的公文将在30天后自动彻底删除" type="warning" :closable="false" show-icon style="margin-bottom: 16px" />

        <el-table :data="recycleList" border v-loading="loading">
          <el-table-column prop="title" label="公文标题" min-width="250" show-overflow-tooltip />
          <el-table-column prop="docNumber" label="文号" width="160" />
          <el-table-column prop="deleteTime" label="删除时间" width="160" />
          <el-table-column prop="deleteUser" label="删除人" width="100" />
          <el-table-column label="操作" width="180" fixed="right" align="center">
            <template #default="{ row }">
              <el-button link type="success" size="small" @click="handleRestore(row)">恢复</el-button>
              <el-button link type="danger" size="small" @click="handlePermanentDelete(row)">彻底删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="pagination">
          <span class="total">共 {{ recycleList.length }} 条</span>
          <el-pagination layout="prev, pager, next" :total="recycleList.length" />
        </div>
      </div>
    </el-card>

    <DetailDrawer v-model="detailDrawerVisible" :document="currentDoc" />
    <ArchiveDialog v-model="archiveDialogVisible" :document="currentDoc" @success="handleArchiveSuccess" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Download } from '@element-plus/icons-vue'
import DetailDrawer from './components/DetailDrawer.vue'
import ArchiveDialog from './components/ArchiveDialog.vue'

const activeTab = ref('query')
const loading = ref(false)
const advancedSearchVisible = ref(false)
const quickSearch = ref('')
const detailDrawerVisible = ref(false)
const archiveDialogVisible = ref(false)
const currentDoc = ref({})
const querySelected = ref([])

const filterForm = ref({
  docType: '',
  year: '',
  sender: '',
  securityLevel: '',
  dateRange: null,
  keyword: ''
})

const queryList = ref([
  { id: 1, title: '关于加强春节放假期间安全管理的通知', docType: '通知', docNumber: '建信发〔2026〕1号', sender: '行政部', sendDate: '2026-01-15', securityLevel: '公开', status: '已发布' },
  { id: 2, title: '关于2026年度工作计划的报告', docType: '报告', docNumber: '建信报〔2026〕2号', sender: '综合办公室', sendDate: '2026-01-14', securityLevel: '内部', status: '已发布' },
  { id: 3, title: '关于申请增加部门编制的请示', docType: '请示', docNumber: '建信请〔2026〕3号', sender: '人力资源部', sendDate: '2026-01-13', securityLevel: '内部', status: '审批中' },
  { id: 4, title: '关于年度财务决算的通报', docType: '通报', docNumber: '建信通〔2026〕4号', sender: '财务部', sendDate: '2026-01-12', securityLevel: '秘密', status: '已发布' }
])

const archivedList = ref([
  { id: 101, title: '关于2023年度工作总结的通知', docType: '通知', docNumber: '建信发〔2023〕15号', sender: '行政部', sendDate: '2023-12-25', archiveDate: '2026-01-10', archiveNo: 'GD-2026-001' },
  { id: 102, title: '关于开展年终安全检查的通报', docType: '通报', docNumber: '建信通〔2023〕12号', sender: '安委办', sendDate: '2023-12-20', archiveDate: '2026-01-08', archiveNo: 'GD-2026-002' },
  { id: 103, title: '关于调整组织架构的决定', docType: '决定', docNumber: '建信决〔2023〕8号', sender: '总经理办公室', sendDate: '2023-12-15', archiveDate: '2026-01-05', archiveNo: 'GD-2026-003' }
])

const recycleList = ref([
  { id: 201, title: '关于临时会议安排的通知', docNumber: '建信发〔2026〕8号', deleteTime: '2026-01-14 10:00', deleteUser: '张三' },
  { id: 202, title: '关于调整工作计划的请示', docNumber: '建信请〔2026〕6号', deleteTime: '2026-01-13 15:00', deleteUser: '李四' }
])

const filteredQueryList = computed(() => {
  return queryList.value.filter(item => {
    if (!quickSearch.value) return true
    const keyword = quickSearch.value.toLowerCase()
    return item.title.toLowerCase().includes(keyword) ||
        item.docNumber.toLowerCase().includes(keyword) ||
        item.sender.toLowerCase().includes(keyword)
  })
})

const handleTabChange = (tab) => {
  loading.value = true
  setTimeout(() => { loading.value = false }, 300)
}

const handleAdvancedSearch = () => {
  advancedSearchVisible.value = !advancedSearchVisible.value
}

const handleQuickSearch = () => {
  // 搜索逻辑已在 computed 中处理
}

const handleFilter = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    ElMessage.success('查询成功')
  }, 500)
}

const handleResetFilter = () => {
  filterForm.value = {
    docType: '',
    year: '',
    sender: '',
    securityLevel: '',
    dateRange: null,
    keyword: ''
  }
  quickSearch.value = ''
  handleFilter()
}

const handleQuerySelection = (selection) => {
  querySelected.value = selection
}

const handleView = (row) => {
  currentDoc.value = row
  detailDrawerVisible.value = true
}

const handleDownload = (row) => {
  ElMessage.success(`下载公文：${row.docNumber}`)
}

const handleArchive = (row) => {
  currentDoc.value = row
  archiveDialogVisible.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确认删除公文"${row.title}"？删除后将移至回收站`, '删除确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = queryList.value.findIndex(item => item.id === row.id)
    if (index > -1) {
      const deleted = queryList.value.splice(index, 1)[0]
      recycleList.value.unshift({
        id: deleted.id,
        title: deleted.title,
        docNumber: deleted.docNumber,
        deleteTime: new Date().toLocaleString('zh-CN'),
        deleteUser: '当前用户'
      })
    }
    ElMessage.success('已移至回收站')
  }).catch(() => {})
}

const handleBatchArchive = () => {
  ElMessageBox.confirm(`确认批量归档 ${querySelected.value.length} 个公文？`, '批量归档', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('批量归档成功')
  }).catch(() => {})
}

const handleBatchDelete = () => {
  ElMessageBox.confirm(`确认批量删除 ${querySelected.value.length} 个公文？`, '批量删除', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('批量删除成功')
  }).catch(() => {})
}

const handleUnarchive = (row) => {
  ElMessageBox.confirm(`确认取消归档"${row.title}"？`, '取消归档', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = archivedList.value.findIndex(item => item.id === row.id)
    if (index > -1) {
      const unarchived = archivedList.value.splice(index, 1)[0]
      queryList.value.push({
        id: unarchived.id,
        title: unarchived.title,
        docType: unarchived.docType,
        docNumber: unarchived.docNumber,
        sender: unarchived.sender,
        sendDate: unarchived.sendDate,
        securityLevel: '内部',
        status: '已发布'
      })
    }
    ElMessage.success('已取消归档')
  }).catch(() => {})
}

const handleRestore = (row) => {
  ElMessageBox.confirm(`确认恢复公文"${row.title}"？`, '恢复确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  }).then(() => {
    const index = recycleList.value.findIndex(item => item.id === row.id)
    if (index > -1) recycleList.value.splice(index, 1)
    ElMessage.success('恢复成功')
  }).catch(() => {})
}

const handlePermanentDelete = (row) => {
  ElMessageBox.confirm(`确认彻底删除公文"${row.title}"？此操作不可恢复`, '彻底删除', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'error'
  }).then(() => {
    const index = recycleList.value.findIndex(item => item.id === row.id)
    if (index > -1) recycleList.value.splice(index, 1)
    ElMessage.success('已彻底删除')
  }).catch(() => {})
}

const handleExport = () => {
  ElMessage.success('导出成功')
}

const handleArchiveSuccess = () => {
  ElMessage.success('归档成功')
}

const getStatusType = (status) => {
  const map = { '草稿': 'info', '审批中': 'warning', '已发布': 'success', '已归档': 'info' }
  return map[status] || 'info'
}

const getSecurityType = (level) => {
  const map = { '公开': 'success', '内部': 'info', '秘密': 'warning', '机密': 'danger' }
  return map[level] || 'info'
}

onMounted(() => {
  console.log('查询与归档加载')
})
</script>

<style scoped lang="scss">
.query-archive-page {
  padding: 20px;
  background: #f0f2f5;
  min-height: calc(100vh - 60px);

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    background: #fff;
    padding: 16px 20px;
    border-radius: 4px;

    .header-left h2 {
      margin: 0 0 8px 0;
      font-size: 18px;
      font-weight: 600;
      color: #303133;
    }

    .header-right {
      display: flex;
      gap: 12px;
    }
  }

  .filter-card {
    margin-bottom: 16px;

    .filter-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: 600;
    }

    :deep(.el-form-item) {
      margin-bottom: 0;
      margin-right: 16px;
    }
  }

  .quick-filter-card {
    margin-bottom: 16px;
    padding: 16px;
  }

  .tab-card {
    :deep(.el-card__body) {
      padding: 0 20px 20px;
    }

    .tab-content {
      .archive-stats {
        display: flex;
        gap: 40px;
        margin-bottom: 20px;
        padding-bottom: 20px;
        border-bottom: 1px solid #e8e8e8;
      }

      .batch-actions {
        margin-top: 12px;
      }

      .pagination {
        margin-top: 16px;
        display: flex;
        justify-content: flex-end;
        align-items: center;

        .total {
          font-size: 14px;
          color: #606266;
        }
      }
    }
  }
}
</style>
