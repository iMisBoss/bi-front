<template>
  <div class="send-receive-page">
    <div class="page-header">
      <div class="header-left">
        <h2>收发文管理</h2>
        <el-tag type="info" size="small">公文收发工作台</el-tag>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="handleReceiveDoc" icon="Download">登记收文</el-button>
        <el-button type="success" @click="handleSendDoc" icon="Upload">发起发文</el-button>
      </div>
    </div>

    <el-card class="tab-card" shadow="never">
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="收文管理" name="incoming" />
        <el-tab-pane label="发文管理" name="outgoing" />
      </el-tabs>

      <div v-if="activeTab === 'incoming'" class="tab-content">
        <div class="filter-bar">
          <el-input
              v-model="incomingSearch"
              placeholder="搜索公文标题/文号"
              clearable
              style="width: 300px"
          >
            <template #prefix><el-icon><Search /></el-icon></template>
          </el-input>
          <el-select v-model="incomingSource" placeholder="来文单位" clearable style="width: 150px">
            <el-option label="上级机关" value="上级机关" />
            <el-option label="安委办" value="安委办" />
            <el-option label="兄弟单位" value="兄弟单位" />
          </el-select>
          <el-select v-model="incomingStatus" placeholder="状态" clearable style="width: 120px">
            <el-option label="待办理" value="待办理" />
            <el-option label="办理中" value="办理中" />
            <el-option label="已办结" value="已办结" />
          </el-select>
        </div>

        <el-table :data="filteredIncomingList" border v-loading="loading" @selection-change="handleIncomingSelection">
          <el-table-column type="selection" width="50" align="center" />
          <el-table-column prop="title" label="公文标题" min-width="250" show-overflow-tooltip />
          <el-table-column prop="docType" label="公文类型" width="120" />
          <el-table-column prop="docNumber" label="文号" width="160" />
          <el-table-column prop="sourceUnit" label="来文单位" width="150" />
          <el-table-column prop="receiveDate" label="收文日期" width="120" sortable />
          <el-table-column prop="urgency" label="紧急程度" width="100">
            <template #default="{ row }">
              <el-tag :type="getUrgencyType(row.urgency)" size="small">{{ row.urgency }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)" size="small">{{ row.status }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="220" fixed="right" align="center">
            <template #default="{ row }">
              <el-button link type="primary" size="small" @click="handleProcess(row)">办理</el-button>
              <el-button link type="primary" size="small" @click="handleView(row)">查看</el-button>
              <el-button link type="warning" size="small" @click="handleDistribute(row)">分发</el-button>
              <el-button link type="info" size="small" @click="handleArchive(row)">归档</el-button>
            </template>
          </el-table-column>
        </el-table>

        <div class="batch-actions" v-if="incomingSelected.length > 0">
          <el-alert type="info" :closable="false" show-icon>
            已选择 {{ incomingSelected.length }} 项
            <el-button link type="primary" size="small" @click="handleBatchDistribute">批量分发</el-button>
          </el-alert>
        </div>

        <div class="pagination">
          <span class="total">共 {{ filteredIncomingList.length }} 条</span>
          <el-pagination layout="prev, pager, next" :total="filteredIncomingList.length" />
        </div>
      </div>

      <div v-if="activeTab === 'outgoing'" class="tab-content">
        <div class="filter-bar">
          <el-input
              v-model="outgoingSearch"
              placeholder="搜索公文标题/文号"
              clearable
              style="width: 300px"
          >
            <template #prefix><el-icon><Search /></el-icon></template>
          </el-input>
          <el-select v-model="outgoingStatus" placeholder="状态" clearable style="width: 120px">
            <el-option label="草稿" value="草稿" />
            <el-option label="审批中" value="审批中" />
            <el-option label="已发布" value="已发布" />
          </el-select>
        </div>

        <el-table :data="filteredOutgoingList" border v-loading="loading">
          <el-table-column prop="title" label="公文标题" min-width="250" show-overflow-tooltip />
          <el-table-column prop="docType" label="公文类型" width="120" />
          <el-table-column prop="docNumber" label="文号" width="160" />
          <el-table-column prop="targetUnit" label="发文单位" width="150" />
          <el-table-column prop="sendDate" label="发文日期" width="120" sortable />
          <el-table-column prop="status" label="状态" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)" size="small">{{ row.status }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200" fixed="right" align="center">
            <template #default="{ row }">
              <el-button link type="primary" size="small" @click="handleView(row)">查看</el-button>
              <el-button v-if="row.status === '草稿'" link type="warning" size="small" @click="handleEdit(row)">编辑</el-button>
              <el-button v-if="row.status === '草稿'" link type="success" size="small" @click="handleSubmit(row)">提交</el-button>
              <el-button v-if="row.status === '草稿'" link type="danger" size="small" @click="handleDelete(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="pagination">
          <span class="total">共 {{ filteredOutgoingList.length }} 条</span>
          <el-pagination layout="prev, pager, next" :total="filteredOutgoingList.length" />
        </div>
      </div>
    </el-card>

    <ReceiveDialog v-model="receiveDialogVisible" @success="handleReceiveSuccess" />
    <SendDialog v-model="sendDialogVisible" @success="handleSendSuccess" />
    <DetailDrawer v-model="detailDrawerVisible" :document="currentDoc" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Download, Upload } from '@element-plus/icons-vue'
import ReceiveDialog from './components/ReceiveDialog.vue'
import SendDialog from './components/SendDialog.vue'
import DetailDrawer from './components/DetailDrawer.vue'

const activeTab = ref('incoming')
const loading = ref(false)
const receiveDialogVisible = ref(false)
const sendDialogVisible = ref(false)
const detailDrawerVisible = ref(false)
const currentDoc = ref({})
const incomingSelected = ref([])

const incomingSearch = ref('')
const incomingSource = ref('')
const incomingStatus = ref('')
const outgoingSearch = ref('')
const outgoingStatus = ref('')

const incomingList = ref([
  { id: 1, title: '关于报送2026年工作计划的通知', docType: '通知', docNumber: '上级发〔2026〕10号', sourceUnit: '上级机关', receiveDate: '2026-01-15', urgency: '普通', status: '待办理' },
  { id: 2, title: '关于开展安全生产检查的通知', docType: '通知', docNumber: '安委发〔2026〕5号', sourceUnit: '安委办', receiveDate: '2026-01-14', urgency: '紧急', status: '办理中' },
  { id: 3, title: '关于配合审计工作的通知', docType: '通知', docNumber: '审发〔2026〕3号', sourceUnit: '审计局', receiveDate: '2026-01-13', urgency: '普通', status: '已办结' }
])

const outgoingList = ref([
  { id: 101, title: '关于调整春节放假安排的通知', docType: '通知', docNumber: '建信发〔2026〕1号', targetUnit: '全体员工', sendDate: '2026-01-13', status: '已发布' },
  { id: 102, title: '关于申请增加编制的请示', docType: '请示', docNumber: '建信请〔2026〕2号', targetUnit: '上级机关', sendDate: '2026-01-12', status: '草稿' },
  { id: 103, title: '关于年度工作总结的报告', docType: '报告', docNumber: '', targetUnit: '上级机关', sendDate: '2026-01-10', status: '草稿' }
])

const filteredIncomingList = computed(() => {
  return incomingList.value.filter(item => {
    const matchSearch = !incomingSearch.value || item.title.includes(incomingSearch.value) || item.docNumber.includes(incomingSearch.value)
    const matchSource = !incomingSource.value || item.sourceUnit === incomingSource.value
    const matchStatus = !incomingStatus.value || item.status === incomingStatus.value
    return matchSearch && matchSource && matchStatus
  })
})

const filteredOutgoingList = computed(() => {
  return outgoingList.value.filter(item => {
    const matchSearch = !outgoingSearch.value || item.title.includes(outgoingSearch.value) || item.docNumber.includes(outgoingSearch.value)
    const matchStatus = !outgoingStatus.value || item.status === outgoingStatus.value
    return matchSearch && matchStatus
  })
})

const handleTabChange = (tab) => {
  loading.value = true
  setTimeout(() => { loading.value = false }, 300)
}

const handleIncomingSelection = (selection) => {
  incomingSelected.value = selection
}

const handleReceiveDoc = () => {
  receiveDialogVisible.value = true
}

const handleSendDoc = () => {
  sendDialogVisible.value = true
}

const handleProcess = (row) => {
  ElMessage.info(`办理收文：${row.title}`)
}

const handleView = (row) => {
  currentDoc.value = row
  detailDrawerVisible.value = true
}

const handleDistribute = (row) => {
  ElMessageBox.prompt('请输入分发对象（多个用逗号分隔）', '分发公文', {
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  }).then(({ value }) => {
    ElMessage.success(`已分发给：${value}`)
  }).catch(() => {})
}

const handleArchive = (row) => {
  ElMessageBox.confirm(`确认归档公文"${row.title}"？`, '归档确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    row.status = '已办结'
    ElMessage.success('归档成功')
  }).catch(() => {})
}

const handleBatchDistribute = () => {
  ElMessage.info(`批量分发 ${incomingSelected.value.length} 个公文`)
}

const handleEdit = (row) => {
  ElMessage.info(`编辑发文：${row.title}`)
}

const handleSubmit = (row) => {
  ElMessageBox.confirm(`确认提交发文"${row.title}"？`, '提交确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    row.status = '审批中'
    ElMessage.success('提交成功')
  }).catch(() => {})
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确认删除公文"${row.title}"？`, '删除确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = outgoingList.value.findIndex(item => item.id === row.id)
    if (index > -1) outgoingList.value.splice(index, 1)
    ElMessage.success('删除成功')
  }).catch(() => {})
}

const handleReceiveSuccess = () => {
  ElMessage.success('收文登记成功')
}

const handleSendSuccess = () => {
  ElMessage.success('发文发起成功')
}

const getStatusType = (status) => {
  const map = { '待办理': 'warning', '办理中': 'primary', '已办结': 'success', '已发布': 'success', '审批中': 'warning', '草稿': 'info' }
  return map[status] || 'info'
}

const getUrgencyType = (urgency) => {
  const map = { '普通': 'info', '紧急': 'warning', '特急': 'danger' }
  return map[urgency] || 'info'
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
