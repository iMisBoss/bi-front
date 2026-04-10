<template>
  <div class="query-archive-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h2>查询与归档</h2>
      </div>
      <div class="header-right">
        <el-input
            v-model="searchText"
            placeholder="搜索公文标题/文号"
            style="width: 300px"
            clearable
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>
    </div>

    <!-- 搜索筛选区域 -->
    <el-card class="filter-card" shadow="hover">
      <el-form :inline="true" :model="filterForm" size="default">
        <el-form-item label="公文类型">
          <el-select v-model="filterForm.docType" placeholder="全部类型" clearable style="width: 150px">
            <el-option label="全部类型" value="" />
            <el-option label="请示" value="request" />
            <el-option label="报告" value="report" />
            <el-option label="通知" value="notice" />
            <el-option label="通报" value="bulletin" />
            <el-option label="决定" value="decision" />
          </el-select>
        </el-form-item>
        <el-form-item label="年份">
          <el-select v-model="filterForm.year" placeholder="全部年份" clearable style="width: 120px">
            <el-option label="2024" value="2024" />
            <el-option label="2023" value="2023" />
            <el-option label="2022" value="2022" />
            <el-option label="2021" value="2021" />
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
              v-model="filterForm.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="YYYY-MM-DD"
              style="width: 240px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleFilter" icon="Search">查询</el-button>
          <el-button @click="handleResetFilter" icon="Refresh">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- Tab 页签 -->
    <el-card class="tab-card" shadow="never">
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="公文查询" name="query" />
        <el-tab-pane label="已归档公文" name="archived" />
      </el-tabs>

      <!-- 公文查询 -->
      <div v-if="activeTab === 'query'" class="tab-content">
        <el-table :data="queryList" border v-loading="loading">
          <el-table-column prop="title" label="公文标题" min-width="250" show-overflow-tooltip />
          <el-table-column prop="docType" label="公文类型" width="120" />
          <el-table-column prop="docNumber" label="文号" width="150" />
          <el-table-column prop="sender" label="发文单位" width="150" />
          <el-table-column prop="sendDate" label="发文日期" width="120" sortable />
          <el-table-column prop="status" label="状态" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)" size="small" effect="plain">{{ row.status }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200" fixed="right" align="center">
            <template #default="{ row }">
              <el-button link type="primary" size="small" @click="handleView(row)">查看</el-button>
              <el-button link type="primary" size="small" @click="handleDownload(row)">下载</el-button>
              <el-button link type="warning" size="small" @click="handleArchive(row)">归档</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="pagination">
          <span class="total">共 {{ queryList.length }} 条</span>
          <el-pagination layout="prev, pager, next" :total="queryList.length" />
        </div>
      </div>

      <!-- 已归档公文 -->
      <div v-if="activeTab === 'archived'" class="tab-content">
        <el-table :data="archivedList" border v-loading="loading">
          <el-table-column prop="title" label="公文标题" min-width="250" show-overflow-tooltip />
          <el-table-column prop="docType" label="公文类型" width="120" />
          <el-table-column prop="docNumber" label="文号" width="150" />
          <el-table-column prop="sender" label="发文单位" width="150" />
          <el-table-column prop="sendDate" label="发文日期" width="120" sortable />
          <el-table-column prop="archiveDate" label="归档日期" width="120" />
          <el-table-column prop="archiveNo" label="归档编号" width="150" />
          <el-table-column label="操作" width="150" fixed="right" align="center">
            <template #default="{ row }">
              <el-button link type="primary" size="small" @click="handleView(row)">查看</el-button>
              <el-button link type="primary" size="small" @click="handleDownload(row)">下载</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="pagination">
          <span class="total">共 {{ archivedList.length }} 条</span>
          <el-pagination layout="prev, pager, next" :total="archivedList.length" />
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh } from '@element-plus/icons-vue'

const activeTab = ref('query')
const loading = ref(false)
const searchText = ref('')

// 筛选表单
const filterForm = reactive({
  docType: '',
  year: '',
  dateRange: null
})

// 公文查询数据
const queryList = ref([
  {
    id: 1,
    title: '关于加强春节放假期间安全管理的通知',
    docType: '通知',
    docNumber: '建信发〔2024〕1号',
    sender: '行政部',
    sendDate: '2024-01-15',
    status: '已发布'
  },
  {
    id: 2,
    title: '关于2024年度工作计划的报告',
    docType: '报告',
    docNumber: '建信报〔2024〕2号',
    sender: '综合办公室',
    sendDate: '2024-01-14',
    status: '已发布'
  },
  {
    id: 3,
    title: '关于申请增加部门编制的请示',
    docType: '请示',
    docNumber: '建信请〔2024〕3号',
    sender: '人力资源部',
    sendDate: '2024-01-13',
    status: '审批中'
  }
])

// 已归档公文数据
const archivedList = ref([
  {
    id: 101,
    title: '关于2023年度工作总结的通知',
    docType: '通知',
    docNumber: '建信发〔2023〕15号',
    sender: '行政部',
    sendDate: '2023-12-25',
    archiveDate: '2024-01-10',
    archiveNo: 'GD-2024-001'
  },
  {
    id: 102,
    title: '关于开展年终安全检查的通报',
    docType: '通报',
    docNumber: '建信通〔2023〕12号',
    sender: '安委办',
    sendDate: '2023-12-20',
    archiveDate: '2024-01-08',
    archiveNo: 'GD-2024-002'
  },
  {
    id: 103,
    title: '关于调整组织架构的决定',
    docType: '决定',
    docNumber: '建信决〔2023〕8号',
    sender: '总经理办公室',
    sendDate: '2023-12-15',
    archiveDate: '2024-01-05',
    archiveNo: 'GD-2024-003'
  }
])

// Tab 切换
const handleTabChange = (tab) => {
  console.log('切换到 Tab:', tab)
}

// 查询
const handleFilter = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    ElMessage.success('查询成功')
  }, 500)
}

// 重置筛选
const handleResetFilter = () => {
  filterForm.docType = ''
  filterForm.year = ''
  filterForm.dateRange = null
  searchText.value = ''
  handleFilter()
}

// 查看
const handleView = (row) => {
  ElMessage.info(`查看公文：${row.title}`)
}

// 下载
const handleDownload = (row) => {
  ElMessage.success(`下载公文：${row.docNumber}`)
}

// 归档
const handleArchive = (row) => {
  ElMessageBox.confirm(`确认将公文"${row.title}"归档吗？`, '归档确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('归档成功')
    // 从查询列表移除，添加到归档列表
    const index = queryList.value.findIndex(item => item.id === row.id)
    if (index > -1) {
      queryList.value.splice(index, 1)
    }
  }).catch(() => {})
}

// 状态类型
const getStatusType = (status) => {
  const map = {
    '草稿': 'info',
    '审批中': 'warning',
    '已发布': 'success',
    '已归档': 'info'
  }
  return map[status] || 'info'
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
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #303133;
    }
  }

  .filter-card {
    margin-bottom: 16px;

    :deep(.el-form-item) {
      margin-bottom: 0;
      margin-right: 16px;
    }
  }

  .tab-card {
    :deep(.el-card__body) {
      padding: 0 20px 20px;
    }

    :deep(.el-tabs__header) {
      padding: 0;
      margin-bottom: 16px;
      background-color: transparent;
      border-bottom: 1px solid #e8e8e8;
    }

    :deep(.el-tabs__item) {
      height: 48px;
      line-height: 48px;
      font-size: 15px;
      color: #606266;

      &.is-active {
        color: #409EFF;
        font-weight: 600;
      }
    }

    .tab-content {
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
