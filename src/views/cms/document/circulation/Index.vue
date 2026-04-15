<template>
  <div class="circulation-page">
    <div class="page-header">
      <div class="header-left">
        <h2>流转与督办</h2>
        <el-tag type="info" size="small">公文跟踪管理</el-tag>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="handleCirculate" icon="Share">发起传阅</el-button>
        <el-button type="warning" @click="handleSupervise" icon="Bell">新建督办</el-button>
      </div>
    </div>

    <el-card class="tab-card" shadow="never">
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="公文传阅" name="circulation">
          <template #label>
            <span>公文传阅 <el-badge :value="unreadCount" :max="99" /></span>
          </template>
        </el-tab-pane>
        <el-tab-pane label="公文督办" name="supervision" />
        <el-tab-pane label="流程跟踪" name="tracking" />
      </el-tabs>

      <div v-if="activeTab === 'circulation'" class="tab-content">
        <div class="filter-bar">
          <el-input
              v-model="circulationSearch"
              placeholder="搜索公文标题/文号"
              clearable
              style="width: 300px"
          >
            <template #prefix><el-icon><Search /></el-icon></template>
          </el-input>
          <el-select v-model="readStatus" placeholder="阅读状态" clearable style="width: 120px">
            <el-option label="已读" value="已读" />
            <el-option label="未读" value="未读" />
          </el-select>
        </div>

        <el-table :data="filteredCirculationList" border v-loading="loading">
          <el-table-column type="selection" width="50" align="center" />
          <el-table-column prop="title" label="公文标题" min-width="250" show-overflow-tooltip />
          <el-table-column prop="docType" label="公文类型" width="120" />
          <el-table-column prop="docNumber" label="文号" width="160" />
          <el-table-column prop="sender" label="传阅人" width="100" />
          <el-table-column prop="sendTime" label="传阅时间" width="160" sortable />
          <el-table-column prop="readStatus" label="阅读状态" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="row.readStatus === '已读' ? 'success' : 'warning'" size="small">{{ row.readStatus }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200" fixed="right" align="center">
            <template #default="{ row }">
              <el-button link type="primary" size="small" @click="handleView(row)">查看</el-button>
              <el-button v-if="row.readStatus === '未读'" link type="success" size="small" @click="handleMarkRead(row)">标记已读</el-button>
              <el-button link type="warning" size="small" @click="handleComment(row)">批注</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="pagination">
          <span class="total">共 {{ filteredCirculationList.length }} 条</span>
          <el-pagination layout="prev, pager, next" :total="filteredCirculationList.length" />
        </div>
      </div>

      <div v-if="activeTab === 'supervision'" class="tab-content">
        <div class="stats-cards">
          <el-card shadow="hover" class="stat-card">
            <el-statistic title="待督办" :value="supervisionList.filter(i => i.status === '未办理').length" />
          </el-card>
          <el-card shadow="hover" class="stat-card">
            <el-statistic title="办理中" :value="supervisionList.filter(i => i.status === '办理中').length" />
          </el-card>
          <el-card shadow="hover" class="stat-card">
            <el-statistic title="已办结" :value="supervisionList.filter(i => i.status === '已办结').length" />
          </el-card>
          <el-card shadow="hover" class="stat-card">
            <el-statistic title="已逾期" :value="overdueCount" value-style="color: #F56C6C" />
          </el-card>
        </div>

        <el-table :data="supervisionList" border v-loading="loading">
          <el-table-column prop="title" label="公文标题" min-width="250" show-overflow-tooltip />
          <el-table-column prop="docType" label="公文类型" width="120" />
          <el-table-column prop="docNumber" label="文号" width="160" />
          <el-table-column prop="handler" label="承办人" width="100" />
          <el-table-column prop="deadline" label="办理期限" width="120" sortable />
          <el-table-column prop="status" label="督办状态" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="getSupervisionType(row.status)" size="small">{{ row.status }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="220" fixed="right" align="center">
            <template #default="{ row }">
              <el-button link type="primary" size="small" @click="handleView(row)">查看</el-button>
              <el-button v-if="row.status === '未办理'" link type="warning" size="small" @click="handleUrge(row)">催办</el-button>
              <el-button link type="success" size="small" @click="handleFeedback(row)">反馈</el-button>
              <el-button link type="info" size="small" @click="handleTrack(row)">跟踪</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="pagination">
          <span class="total">共 {{ supervisionList.length }} 条</span>
          <el-pagination layout="prev, pager, next" :total="supervisionList.length" />
        </div>
      </div>

      <div v-if="activeTab === 'tracking'" class="tab-content">
        <el-empty description="选择公文查看流转轨迹" />
      </div>
    </el-card>

    <DetailDrawer v-model="detailDrawerVisible" :document="currentDoc" />
    <TrackDialog v-model="trackDialogVisible" :document="currentDoc" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Share, Bell } from '@element-plus/icons-vue'
import DetailDrawer from './components/DetailDrawer.vue'
import TrackDialog from './components/TrackDialog.vue'

const activeTab = ref('circulation')
const loading = ref(false)
const detailDrawerVisible = ref(false)
const trackDialogVisible = ref(false)
const currentDoc = ref({})

const circulationSearch = ref('')
const readStatus = ref('')

const circulationList = ref([
  { id: 1, title: '关于2026年度工作部署的通知', docType: '通知', docNumber: '建信发〔2026〕1号', sender: '张三', sendTime: '2026-01-15 09:00', readStatus: '已读' },
  { id: 2, title: '关于加强安全生产的通知', docType: '通知', docNumber: '建信发〔2026〕2号', sender: '李四', sendTime: '2026-01-14 10:00', readStatus: '未读' },
  { id: 3, title: '关于调整组织架构的决定', docType: '决定', docNumber: '建信决〔2026〕3号', sender: '王五', sendTime: '2026-01-13 11:00', readStatus: '未读' }
])

const supervisionList = ref([
  { id: 101, title: '关于整改安全隐患的通报', docType: '通报', docNumber: '建信通〔2026〕3号', handler: '王五', deadline: '2026-01-20', status: '未办理' },
  { id: 102, title: '关于报送工作总结的通知', docType: '通知', docNumber: '建信发〔2026〕4号', handler: '赵六', deadline: '2026-01-18', status: '办理中' },
  { id: 103, title: '关于完善规章制度的通知', docType: '通知', docNumber: '建信发〔2026〕5号', handler: '孙七', deadline: '2026-01-10', status: '已逾期' }
])

const unreadCount = computed(() => circulationList.value.filter(i => i.readStatus === '未读').length)
const overdueCount = computed(() => supervisionList.value.filter(i => i.status === '已逾期').length)

const filteredCirculationList = computed(() => {
  return circulationList.value.filter(item => {
    const matchSearch = !circulationSearch.value || item.title.includes(circulationSearch.value)
    const matchRead = !readStatus.value || item.readStatus === readStatus.value
    return matchSearch && matchRead
  })
})

const handleTabChange = (tab) => {
  loading.value = true
  setTimeout(() => { loading.value = false }, 300)
}

const handleCirculate = () => {
  ElMessage.info('发起传阅功能')
}

const handleSupervise = () => {
  ElMessage.info('新建督办功能')
}

const handleView = (row) => {
  currentDoc.value = row
  detailDrawerVisible.value = true
}

const handleMarkRead = (row) => {
  row.readStatus = '已读'
  ElMessage.success('已标记为已读')
}

const handleComment = (row) => {
  ElMessageBox.prompt('请输入批注内容', '添加批注', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputType: 'textarea'
  }).then(({ value }) => {
    ElMessage.success('批注已添加')
  }).catch(() => {})
}

const handleUrge = (row) => {
  ElMessageBox.confirm(`确认向 ${row.handler} 发送催办通知？`, '催办确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('催办通知已发送')
  }).catch(() => {})
}

const handleFeedback = (row) => {
  ElMessageBox.prompt('请输入反馈内容', '办理反馈', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputType: 'textarea'
  }).then(({ value }) => {
    row.status = '已办结'
    ElMessage.success('反馈已提交')
  }).catch(() => {})
}

const handleTrack = (row) => {
  currentDoc.value = row
  trackDialogVisible.value = true
}

const getSupervisionType = (status) => {
  const map = { '未办理': 'danger', '办理中': 'warning', '已办结': 'success', '已逾期': 'danger' }
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

  .tab-card {
    :deep(.el-card__body) {
      padding: 0 20px 20px;
    }

    .tab-content {
      .filter-bar {
        display: flex;
        gap: 12px;
        margin-bottom: 16px;
        flex-wrap: wrap;
      }

      .stats-cards {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 16px;
        margin-bottom: 20px;

        .stat-card {
          text-align: center;
        }
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
