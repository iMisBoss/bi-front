<template>
  <div class="personal-document-page">
    <div class="page-header">
      <div class="header-left">
        <h2>个人公文中心</h2>
        <el-tag type="info" size="small">公文处理工作台</el-tag>
      </div>
      <div class="header-right">
        <el-badge :value="todoList.length" :max="99">
          <el-button type="primary" @click="activeTab = 'todo'" icon="Bell">
            待办 {{ todoList.length }}
          </el-button>
        </el-badge>
        <el-button @click="handleRefresh" icon="Refresh" :loading="loading">刷新</el-button>
      </div>
    </div>

    <el-card class="tab-card" shadow="never">
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="待办办理" name="todo">
          <template #label>
            <span>待办办理 <el-badge :value="todoList.length" :max="99" /></span>
          </template>
        </el-tab-pane>
        <el-tab-pane label="我的公文" name="my" />
        <el-tab-pane label="发起公文" name="start" />
      </el-tabs>

      <div v-if="activeTab === 'todo'" class="tab-content">
        <div class="filter-bar">
          <el-input
              v-model="todoSearch"
              placeholder="搜索公文标题/文号"
              clearable
              style="width: 300px"
              @input="handleTodoSearch"
          >
            <template #prefix><el-icon><Search /></el-icon></template>
          </el-input>
          <el-select v-model="todoDocType" placeholder="公文类型" clearable style="width: 150px">
            <el-option label="请示" value="请示" />
            <el-option label="报告" value="报告" />
            <el-option label="通知" value="通知" />
          </el-select>
          <el-select v-model="todoStatus" placeholder="状态" clearable style="width: 120px">
            <el-option label="待办理" value="待办理" />
            <el-option label="办理中" value="办理中" />
          </el-select>
        </div>

        <el-table :data="filteredTodoList" border v-loading="loading" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="50" align="center" />
          <el-table-column prop="title" label="公文标题" min-width="250" show-overflow-tooltip />
          <el-table-column prop="docType" label="公文类型" width="120" />
          <el-table-column prop="docNumber" label="文号" width="160" />
          <el-table-column prop="sender" label="发起人" width="100" />
          <el-table-column prop="receiveTime" label="接收时间" width="160" sortable />
          <el-table-column prop="status" label="状态" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)" size="small">{{ row.status }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200" fixed="right" align="center">
            <template #default="{ row }">
              <el-button link type="primary" size="small" @click="handleProcess(row)">办理</el-button>
              <el-button link type="primary" size="small" @click="handleView(row)">查看</el-button>
              <el-button link type="success" size="small" @click="handleForward(row)">转办</el-button>
            </template>
          </el-table-column>
        </el-table>

        <div class="batch-actions" v-if="selectedRows.length > 0">
          <el-alert type="info" :closable="false" show-icon>
            已选择 {{ selectedRows.length }} 项
            <el-button link type="primary" size="small" @click="handleBatchProcess">批量办理</el-button>
          </el-alert>
        </div>

        <div class="pagination">
          <span class="total">共 {{ filteredTodoList.length }} 条</span>
          <el-pagination layout="prev, pager, next" :total="filteredTodoList.length" />
        </div>
      </div>

      <div v-if="activeTab === 'my'" class="tab-content">
        <div class="filter-bar">
          <el-input
              v-model="mySearch"
              placeholder="搜索公文标题/文号"
              clearable
              style="width: 300px"
          >
            <template #prefix><el-icon><Search /></el-icon></template>
          </el-input>
          <el-date-picker
              v-model="myDateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              style="width: 240px"
          />
        </div>

        <el-table :data="filteredMyList" border v-loading="loading">
          <el-table-column prop="title" label="公文标题" min-width="250" show-overflow-tooltip />
          <el-table-column prop="docType" label="公文类型" width="120" />
          <el-table-column prop="docNumber" label="文号" width="160" />
          <el-table-column prop="sendTime" label="发送时间" width="160" sortable />
          <el-table-column prop="status" label="状态" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)" size="small">{{ row.status }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180" fixed="right" align="center">
            <template #default="{ row }">
              <el-button link type="primary" size="small" @click="handleView(row)">查看</el-button>
              <el-button link type="warning" size="small" v-if="row.status === '草稿'" @click="handleEdit(row)">编辑</el-button>
              <el-button link type="danger" size="small" v-if="row.status === '草稿'" @click="handleDelete(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="pagination">
          <span class="total">共 {{ filteredMyList.length }} 条</span>
          <el-pagination layout="prev, pager, next" :total="filteredMyList.length" />
        </div>
      </div>

      <div v-if="activeTab === 'start'" class="tab-content">
        <el-row :gutter="20">
          <el-col :span="6" v-for="item in docTypes" :key="item.value">
            <el-card shadow="hover" class="doc-type-card" @click="handleStartDoc(item)">
              <div class="card-icon">
                <el-icon :size="40" :color="item.color"><component :is="item.icon" /></el-icon>
              </div>
              <div class="card-title">{{ item.label }}</div>
              <div class="card-desc">{{ item.desc }}</div>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </el-card>

    <ProcessDialog v-model="processDialogVisible" :document="currentDoc" @success="handleProcessSuccess" />
    <DetailDrawer v-model="detailDrawerVisible" :document="currentDoc" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Document, Edit, Folder, Search, Refresh, Bell } from '@element-plus/icons-vue'
import ProcessDialog from './components/ProcessDialog.vue'
import DetailDrawer from './components/DetailDrawer.vue'

const activeTab = ref('todo')
const loading = ref(false)
const processDialogVisible = ref(false)
const detailDrawerVisible = ref(false)
const currentDoc = ref({})
const selectedRows = ref([])

const todoSearch = ref('')
const todoDocType = ref('')
const todoStatus = ref('')
const mySearch = ref('')
const myDateRange = ref(null)

const todoList = ref([
  { id: 1, title: '关于加强春节放假通知', docType: '通知', docNumber: '建信发〔2026〕1号', sender: '行政部', receiveTime: '2026-01-15 09:00', status: '待办理' },
  { id: 2, title: '2026年度工作计划报告', docType: '报告', docNumber: '建信报〔2026〕2号', sender: '财务部', receiveTime: '2026-01-14 14:00', status: '办理中' },
  { id: 3, title: '关于调整组织架构的请示', docType: '请示', docNumber: '建信请〔2026〕3号', sender: '人力资源部', receiveTime: '2026-01-13 11:00', status: '待办理' }
])

const myList = ref([
  { id: 101, title: '关于申请采购办公用品的请示', docType: '请示', docNumber: '建信请〔2026〕5号', sendTime: '2026-01-13 10:00', status: '审批中' },
  { id: 102, title: '关于调整会议安排的通知', docType: '通知', docNumber: '建信发〔2026〕3号', sendTime: '2026-01-12 16:00', status: '已发布' },
  { id: 103, title: '关于部门预算的请示', docType: '请示', docNumber: '', sendTime: '2026-01-10 09:00', status: '草稿' }
])

const docTypes = ref([
  { value: 'request', label: '请示', desc: '向上级请求指示或批准', icon: Document, color: '#409EFF' },
  { value: 'report', label: '报告', desc: '向上级汇报工作或反映情况', icon: Edit, color: '#67C23A' },
  { value: 'notice', label: '通知', desc: '传达要求下级机关办理的事项', icon: Folder, color: '#E6A23C' },
  { value: 'decision', label: '决定', desc: '对重要事项作出决策和部署', icon: Document, color: '#F56C6C' }
])

const filteredTodoList = computed(() => {
  return todoList.value.filter(item => {
    const matchSearch = !todoSearch.value || item.title.includes(todoSearch.value) || item.docNumber.includes(todoSearch.value)
    const matchType = !todoDocType.value || item.docType === todoDocType.value
    const matchStatus = !todoStatus.value || item.status === todoStatus.value
    return matchSearch && matchType && matchStatus
  })
})

const filteredMyList = computed(() => {
  return myList.value.filter(item => {
    const matchSearch = !mySearch.value || item.title.includes(mySearch.value) || item.docNumber.includes(mySearch.value)
    return matchSearch
  })
})

const handleTabChange = (tab) => {
  loadTabData(tab)
}

const loadTabData = (tab) => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 300)
}

const handleTodoSearch = () => {
  // 搜索逻辑已在 computed 中处理
}

const handleSelectionChange = (selection) => {
  selectedRows.value = selection
}

const handleProcess = (row) => {
  currentDoc.value = row
  processDialogVisible.value = true
}

const handleView = (row) => {
  currentDoc.value = row
  detailDrawerVisible.value = true
}

const handleForward = (row) => {
  ElMessageBox.prompt('请输入转办人', '转办公文', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPattern: /.+/,
    inputErrorMessage: '请输入转办人'
  }).then(({ value }) => {
    ElMessage.success(`已转办给 ${value}`)
  }).catch(() => {})
}

const handleBatchProcess = () => {
  ElMessage.info(`批量办理 ${selectedRows.value.length} 个公文`)
}

const handleEdit = (row) => {
  ElMessage.info(`编辑公文：${row.title}`)
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确认删除公文"${row.title}"？`, '删除确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = myList.value.findIndex(item => item.id === row.id)
    if (index > -1) myList.value.splice(index, 1)
    ElMessage.success('删除成功')
  }).catch(() => {})
}

const handleStartDoc = (item) => {
  ElMessage.info(`发起${item.label}`)
}

const handleRefresh = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    ElMessage.success('刷新成功')
  }, 500)
}

const handleProcessSuccess = () => {
  const index = todoList.value.findIndex(item => item.id === currentDoc.value.id)
  if (index > -1) {
    todoList.value.splice(index, 1)
  }
}

const getStatusType = (status) => {
  const map = { '待办理': 'warning', '办理中': 'primary', '已发布': 'success', '审批中': 'warning', '草稿': 'info' }
  return map[status] || 'info'
}

onMounted(() => {
  loadTabData(activeTab.value)
})
</script>

<style scoped lang="scss">
.personal-document-page {
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
      align-items: center;
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

      .doc-type-card {
        margin-bottom: 20px;
        text-align: center;
        cursor: pointer;
        transition: all 0.3s;

        &:hover {
          transform: translateY(-5px);
        }

        .card-icon {
          margin-bottom: 16px;
        }

        .card-title {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .card-desc {
          font-size: 13px;
          color: #909399;
        }
      }
    }
  }
}
</style>
