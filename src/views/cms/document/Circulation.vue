<template>
  <div class="circulation-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h2>流转与督办</h2>
      </div>
    </div>

    <!-- Tab 页签 -->
    <el-card class="tab-card" shadow="never">
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="公文传阅" name="circulation" />
        <el-tab-pane label="公文督办" name="supervision" />
      </el-tabs>

      <!-- 公文传阅 -->
      <div v-if="activeTab === 'circulation'" class="tab-content">
        <el-table :data="circulationList" border v-loading="loading">
          <el-table-column type="selection" width="50" align="center" />
          <el-table-column prop="title" label="公文标题" min-width="250" show-overflow-tooltip />
          <el-table-column prop="docType" label="公文类型" width="120" />
          <el-table-column prop="docNumber" label="文号" width="150" />
          <el-table-column prop="sender" label="传阅人" width="100" />
          <el-table-column prop="sendTime" label="传阅时间" width="160" sortable />
          <el-table-column prop="readStatus" label="阅读状态" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="row.readStatus === '已读' ? 'success' : 'warning'" size="small" effect="plain">{{ row.readStatus }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150" fixed="right" align="center">
            <template #default="{ row }">
              <el-button link type="primary" size="small" @click="handleView(row)">查看</el-button>
              <el-button v-if="row.readStatus === '未读'" link type="success" size="small" @click="handleMarkRead(row)">标记已读</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="pagination">
          <span class="total">共 {{ circulationList.length }} 条</span>
          <el-pagination layout="prev, pager, next" :total="circulationList.length" />
        </div>
      </div>

      <!-- 公文督办 -->
      <div v-if="activeTab === 'supervision'" class="tab-content">
        <el-table :data="supervisionList" border v-loading="loading">
          <el-table-column prop="title" label="公文标题" min-width="250" show-overflow-tooltip />
          <el-table-column prop="docType" label="公文类型" width="120" />
          <el-table-column prop="docNumber" label="文号" width="150" />
          <el-table-column prop="handler" label="承办人" width="100" />
          <el-table-column prop="deadline" label="办理期限" width="120" sortable />
          <el-table-column prop="status" label="督办状态" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="getSupervisionType(row.status)" size="small" effect="plain">{{ row.status }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180" fixed="right" align="center">
            <template #default="{ row }">
              <el-button link type="primary" size="small" @click="handleView(row)">查看</el-button>
              <el-button v-if="row.status === '未办理'" link type="warning" size="small" @click="handleUrge(row)">催办</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="pagination">
          <span class="total">共 {{ supervisionList.length }} 条</span>
          <el-pagination layout="prev, pager, next" :total="supervisionList.length" />
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

const activeTab = ref('circulation')
const loading = ref(false)

const circulationList = ref([
  { id: 1, title: '关于2024年度工作部署的通知', docType: '通知', docNumber: '建信发〔2024〕1号', sender: '张三', sendTime: '2024-01-15 09:00', readStatus: '已读' },
  { id: 2, title: '关于加强安全生产的通知', docType: '通知', docNumber: '建信发〔2024〕2号', sender: '李四', sendTime: '2024-01-14 10:00', readStatus: '未读' }
])

const supervisionList = ref([
  { id: 101, title: '关于整改安全隐患的通报', docType: '通报', docNumber: '建信通〔2024〕3号', handler: '王五', deadline: '2024-01-20', status: '未办理' },
  { id: 102, title: '关于报送工作总结的通知', docType: '通知', docNumber: '建信发〔2024〕4号', handler: '赵六', deadline: '2024-01-18', status: '办理中' }
])

const handleTabChange = (tab) => {
  console.log('切换到 Tab:', tab)
}

const handleView = (row) => {
  ElMessage.info('查看公文详情')
}

const handleMarkRead = (row) => {
  row.readStatus = '已读'
  ElMessage.success('已标记为已读')
}

const handleUrge = (row) => {
  ElMessage.info('发送催办通知')
}

const getSupervisionType = (status) => {
  const map = { '未办理': 'danger', '办理中': 'warning', '已办结': 'success' }
  return map[status] || 'info'
}

onMounted(() => {
  console.log('流转与督办加载')
})
</script>

<style scoped lang="scss">
.circulation-page {
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
