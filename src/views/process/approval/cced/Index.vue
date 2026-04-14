<template>
  <div class="cced-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <h3 class="page-title">抄送管理</h3>
      <div class="stats-group">
        <el-tag type="warning" effect="plain" size="small">未读：{{ unreadCount }}</el-tag>
        <el-tag type="success" effect="plain" size="small" style="margin-left: 8px;">已读：{{ readCount }}</el-tag>
      </div>
    </div>

    <!-- 搜索区域 -->
    <div class="search-card">
      <el-form :model="queryParams" inline class="search-form">
        <el-form-item label="流程类型">
          <el-select v-model="queryParams.processType" placeholder="全部流程" clearable>
            <el-option label="全部流程" value="" />
            <el-option label="请假申请" value="leave" />
            <el-option label="会议申请" value="meeting" />
            <el-option label="采购申请" value="purchase" />
            <el-option label="用车申请" value="vehicle" />
          </el-select>
        </el-form-item>
        <el-form-item label="阅读状态">
          <el-select v-model="queryParams.readStatus" placeholder="全部状态" clearable>
            <el-option label="全部状态" value="" />
            <el-option label="未读" value="unread" />
            <el-option label="已读" value="read" />
          </el-select>
        </el-form-item>
        <el-form-item label="抄送时间">
          <el-date-picker
              v-model="queryParams.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="YYYY-MM-DD"
              size="default"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">
            <el-icon><Search /></el-icon>
            查询
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- Tab 区域 -->
    <div class="tab-card">
      <el-tabs v-model="activeTab" @tab-click="handleTabChange">
        <el-tab-pane label="抄送我的" name="cced-to-me">
          <div class="tab-content">
            <!-- 表格 -->
            <el-table
                v-loading="loading"
                :data="tableData"
                @selection-change="handleSelectionChange"
                border
            >
              <el-table-column type="selection" width="50" align="center" />
              <el-table-column label="标题" prop="title" min-width="200" show-overflow-tooltip>
                <template #default="{ row }">
                  <el-tag v-if="row.urgent" type="danger" size="small" style="margin-right: 6px;">紧急</el-tag>
                  {{ row.title }}
                </template>
              </el-table-column>
              <el-table-column label="流程名称" prop="processName" width="150" show-overflow-tooltip />
              <el-table-column label="申请人" prop="submitter" width="100" />
              <el-table-column label="发起时间" prop="submitTime" width="160" />
              <el-table-column label="抄送时间" prop="ccedTime" width="160" sortable />
              <el-table-column label="状态" prop="status" width="100" align="center">
                <template #default="{ row }">
                  <el-tag :type="getStatusType(row.status)" size="small" effect="plain">
                    {{ row.status }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="阅读状态" prop="readStatus" width="100" align="center">
                <template #default="{ row }">
                  <el-tag :type="row.readStatus === '未读' ? 'warning' : 'success'" size="small" effect="plain">
                    {{ row.readStatus }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="280" fixed="right" align="center">
                <template #default="{ row }">
                  <el-button link type="primary" size="small" @click="handleDetail(row)">
                    <el-icon><View /></el-icon>
                    详情
                  </el-button>
                  <el-button
                      v-if="row.readStatus === '未读'"
                      link
                      type="success"
                      size="small"
                      @click="handleMarkRead(row)"
                  >
                    <el-icon><Check /></el-icon>
                    标记已读
                  </el-button>
                  <el-button
                      v-else
                      link
                      type="info"
                      size="small"
                      @click="handleMarkUnread(row)"
                  >
                    <el-icon><Close /></el-icon>
                    标记未读
                  </el-button>
                  <el-button link type="warning" size="small" @click="handleComment(row)">
                    <el-icon><ChatLineRound /></el-icon>
                    评论
                  </el-button>
                </template>
              </el-table-column>
            </el-table>

            <!-- 分页 -->
            <div class="pagination">
              <span class="total">共 {{ total }} 条</span>
              <el-select v-model="queryParams.pageSize" size="small" style="width: 100px; margin: 0 10px;">
                <el-option label="10条/页" :value="10" />
                <el-option label="20条/页" :value="20" />
                <el-option label="50条/页" :value="50" />
              </el-select>
              <el-pagination
                  v-model:current-page="queryParams.pageNum"
                  :page-size="queryParams.pageSize"
                  :total="total"
                  layout="prev, pager, next, jumper"
                  @current-change="handleQuery"
              />
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="我抄送的" name="cced-by-me">
          <div class="tab-content">
            <!-- 表格 -->
            <el-table
                v-loading="myCcedLoading"
                :data="myCcedTableData"
                border
            >
              <el-table-column label="标题" prop="title" min-width="200" show-overflow-tooltip />
              <el-table-column label="流程名称" prop="processName" width="150" show-overflow-tooltip />
              <el-table-column label="申请人" prop="submitter" width="100" />
              <el-table-column label="发起人" prop="initiator" width="100" />
              <el-table-column label="发起时间" prop="submitTime" width="160" />
              <el-table-column label="抄送时间" prop="ccedTime" width="160" sortable />
              <el-table-column label="状态" prop="status" width="100" align="center">
                <template #default="{ row }">
                  <el-tag :type="getStatusType(row.status)" size="small" effect="plain">
                    {{ row.status }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="150" fixed="right" align="center">
                <template #default="{ row }">
                  <el-button link type="primary" size="small" @click="handleDetail(row)">
                    <el-icon><View /></el-icon>
                    详情
                  </el-button>
                </template>
              </el-table-column>
            </el-table>

            <!-- 分页 -->
            <div class="pagination">
              <span class="total">共 {{ myCcedTotal }} 条</span>
              <el-select v-model="myCcedQueryParams.pageSize" size="small" style="width: 100px; margin: 0 10px;">
                <el-option label="10条/页" :value="10" />
                <el-option label="20条/页" :value="20" />
                <el-option label="50条/页" :value="50" />
              </el-select>
              <el-pagination
                  v-model:current-page="myCcedQueryParams.pageNum"
                  :page-size="myCcedQueryParams.pageSize"
                  :total="myCcedTotal"
                  layout="prev, pager, next, jumper"
                  @current-change="handleMyCcedQuery"
              />
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 详情弹窗 -->
    <el-dialog
        v-model="detailVisible"
        title="流程详情"
        width="800px"
    >
      <el-descriptions :column="2" border>
        <el-descriptions-item label="流程名称">{{ currentRow?.processName }}</el-descriptions-item>
        <el-descriptions-item label="标题">{{ currentRow?.title }}</el-descriptions-item>
        <el-descriptions-item label="申请人">{{ currentRow?.submitter }}</el-descriptions-item>
        <el-descriptions-item label="发起时间">{{ currentRow?.submitTime }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(currentRow?.status)" size="small">
            {{ currentRow?.status }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="抄送时间">{{ currentRow?.ccedTime }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Search, Refresh, View, Check, Close, ChatLineRound } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()

const activeTab = ref('cced-to-me')
const loading = ref(false)
const myCcedLoading = ref(false)
const detailVisible = ref(false)
const currentRow = ref(null)

// 统计数据
const unreadCount = ref(2)
const readCount = ref(2)

// 抄送我的查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  processType: '',
  readStatus: '',
  dateRange: null
})

// 我抄送的查询参数
const myCcedQueryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  processType: '',
  dateRange: null
})

// 抄送我的表格数据
const tableData = ref([
  {
    id: 1,
    title: '张三 - 请假申请',
    processName: '请假审批流程',
    submitter: '张三',
    submitTime: '2026-01-15 09:30',
    ccedTime: '2026-01-15 14:30',
    status: '审批中',
    readStatus: '未读',
    urgent: true
  },
  {
    id: 2,
    title: '李四 - 会议申请',
    processName: '会议申请流程',
    submitter: '李四',
    submitTime: '2026-01-14 10:20',
    ccedTime: '2026-01-14 16:30',
    status: '已通过',
    readStatus: '已读',
    urgent: false
  },
  {
    id: 3,
    title: '王五 - 用车申请',
    processName: '用车申请流程',
    submitter: '王五',
    submitTime: '2026-01-13 11:15',
    ccedTime: '2026-01-13 15:45',
    status: '审批中',
    readStatus: '未读',
    urgent: false
  },
  {
    id: 4,
    title: '赵六 - 采购申请',
    processName: '采购申请流程',
    submitter: '赵六',
    submitTime: '2026-01-12 14:00',
    ccedTime: '2026-01-12 17:30',
    status: '已通过',
    readStatus: '已读',
    urgent: false
  }
])

const total = ref(4)
const selection = ref([])

// 我抄送的表格数据
const myCcedTableData = ref([
  {
    id: 101,
    title: '部门周报审批',
    processName: '周报审批流程',
    submitter: '张三',
    initiator: '我',
    submitTime: '2026-01-15 10:00',
    ccedTime: '2026-01-15 10:05',
    status: '审批中'
  },
  {
    id: 102,
    title: '项目立项申请',
    processName: '项目立项流程',
    submitter: '李四',
    initiator: '我',
    submitTime: '2026-01-14 11:00',
    ccedTime: '2026-01-14 11:05',
    status: '已通过'
  }
])

const myCcedTotal = ref(2)

// Tab 切换
const handleTabChange = (tab) => {
  if (tab.paneName === 'cced-to-me') {
    handleQuery()
  } else {
    handleMyCcedQuery()
  }
}

// 抄送我的 - 查询
const handleQuery = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 500)
}

// 抄送我的 - 重置
const handleReset = () => {
  queryParams.processType = ''
  queryParams.readStatus = ''
  queryParams.dateRange = null
  queryParams.pageNum = 1
  handleQuery()
}

// 我抄送的 - 查询
const handleMyCcedQuery = () => {
  myCcedLoading.value = true
  setTimeout(() => {
    myCcedLoading.value = false
  }, 500)
}

// 我抄送的 - 重置
const handleMyCcedReset = () => {
  myCcedQueryParams.processType = ''
  myCcedQueryParams.dateRange = null
  myCcedQueryParams.pageNum = 1
  handleMyCcedQuery()
}

const handleSelectionChange = (val) => {
  selection.value = val
}

const handleDetail = (row) => {
  currentRow.value = row
  detailVisible.value = true
  if (row.readStatus === '未读') {
    row.readStatus = '已读'
    updateCounts()
  }
}

const handleMarkRead = (row) => {
  row.readStatus = '已读'
  updateCounts()
  ElMessage.success('已标记为已读')
}

const handleMarkUnread = (row) => {
  row.readStatus = '未读'
  updateCounts()
  ElMessage.success('已标记为未读')
}

const handleComment = (row) => {
  ElMessage.info('评论功能开发中')
}

const updateCounts = () => {
  unreadCount.value = tableData.value.filter(item => item.readStatus === '未读').length
  readCount.value = tableData.value.filter(item => item.readStatus === '已读').length
}

const getStatusType = (status) => {
  const typeMap = {
    '审批中': 'warning',
    '已通过': 'success',
    '已驳回': 'danger',
    '已撤回': 'info'
  }
  return typeMap[status] || ''
}

onMounted(() => {
  handleQuery()
})
</script>

<style lang="scss" scoped>
.cced-page {
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

    .page-title {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #303133;
    }

    .stats-group {
      display: flex;
      align-items: center;
    }
  }

  .search-card {
    background: #fff;
    padding: 16px 20px;
    border-radius: 4px;
    margin-bottom: 16px;

    .search-form {
      margin-bottom: 0;

      :deep(.el-form-item) {
        margin-bottom: 0;
        margin-right: 16px;
      }

      :deep(.el-select) {
        width: 180px;
      }

      :deep(.el-date-editor) {
        width: 380px;
      }
    }
  }

  .tab-card {
    background: #fff;
    border-radius: 4px;
    padding: 0 20px;

    :deep(.el-tabs__header) {
      margin-bottom: 16px;
    }

    :deep(.el-tabs__nav-wrap::after) {
      height: 1px;
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
