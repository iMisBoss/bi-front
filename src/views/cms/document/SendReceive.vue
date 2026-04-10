<template>
  <div class="send-receive-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h2>收发文管理</h2>
      </div>
    </div>

    <!-- Tab 页签 -->
    <el-card class="tab-card" shadow="never">
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="收文管理" name="incoming" />
        <el-tab-pane label="发文管理" name="outgoing" />
      </el-tabs>

      <!-- 收文管理 -->
      <div v-if="activeTab === 'incoming'" class="tab-content">
        <el-table :data="incomingList" border v-loading="loading">
          <el-table-column type="selection" width="50" align="center" />
          <el-table-column prop="title" label="公文标题" min-width="250" show-overflow-tooltip />
          <el-table-column prop="docType" label="公文类型" width="120" />
          <el-table-column prop="docNumber" label="文号" width="150" />
          <el-table-column prop="sourceUnit" label="来文单位" width="150" />
          <el-table-column prop="receiveDate" label="收文日期" width="120" sortable />
          <el-table-column prop="status" label="状态" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)" size="small" effect="plain">{{ row.status }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180" fixed="right" align="center">
            <template #default="{ row }">
              <el-button link type="primary" size="small" @click="handleProcess(row)">办理</el-button>
              <el-button link type="primary" size="small" @click="handleView(row)">查看</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="pagination">
          <span class="total">共 {{ incomingList.length }} 条</span>
          <el-pagination layout="prev, pager, next" :total="incomingList.length" />
        </div>
      </div>

      <!-- 发文管理 -->
      <div v-if="activeTab === 'outgoing'" class="tab-content">
        <el-table :data="outgoingList" border v-loading="loading">
          <el-table-column prop="title" label="公文标题" min-width="250" show-overflow-tooltip />
          <el-table-column prop="docType" label="公文类型" width="120" />
          <el-table-column prop="docNumber" label="文号" width="150" />
          <el-table-column prop="targetUnit" label="发文单位" width="150" />
          <el-table-column prop="sendDate" label="发文日期" width="120" sortable />
          <el-table-column prop="status" label="状态" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)" size="small" effect="plain">{{ row.status }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180" fixed="right" align="center">
            <template #default="{ row }">
              <el-button link type="primary" size="small" @click="handleView(row)">查看</el-button>
              <el-button v-if="row.status === '草稿'" link type="warning" size="small" @click="handleEdit(row)">编辑</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="pagination">
          <span class="total">共 {{ outgoingList.length }} 条</span>
          <el-pagination layout="prev, pager, next" :total="outgoingList.length" />
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

const activeTab = ref('incoming')
const loading = ref(false)

const incomingList = ref([
  { id: 1, title: '关于报送2024年工作计划的通知', docType: '通知', docNumber: '上级发〔2024〕10号', sourceUnit: '上级机关', receiveDate: '2024-01-15', status: '待办理' },
  { id: 2, title: '关于开展安全生产检查的通知', docType: '通知', docNumber: '安委发〔2024〕5号', sourceUnit: '安委办', receiveDate: '2024-01-14', status: '办理中' }
])

const outgoingList = ref([
  { id: 101, title: '关于调整春节放假安排的通知', docType: '通知', docNumber: '建信发〔2024〕1号', targetUnit: '全体员工', sendDate: '2024-01-13', status: '已发布' },
  { id: 102, title: '关于申请增加编制的请示', docType: '请示', docNumber: '建信请〔2024〕2号', targetUnit: '上级机关', sendDate: '2024-01-12', status: '草稿' }
])

const handleTabChange = (tab) => {
  console.log('切换到 Tab:', tab)
}

const handleProcess = (row) => {
  ElMessage.info('打开收文办理流程')
}

const handleView = (row) => {
  ElMessage.info('查看公文详情')
}

const handleEdit = (row) => {
  ElMessage.info('编辑公文')
}

const getStatusType = (status) => {
  const map = { '待办理': 'warning', '办理中': 'primary', '已发布': 'success', '草稿': 'info' }
  return map[status] || 'info'
}

onMounted(() => {
  console.log('收发文管理加载')
})
</script>

<style scoped lang="scss">
.send-receive-page {
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
