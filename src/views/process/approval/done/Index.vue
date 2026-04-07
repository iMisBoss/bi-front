<template>
  <div class="processed-container">
    <div class="page-header">
      <div class="header-left">
        <h2>我已处理</h2>
        <div class="stat-tags">
          <el-tag type="success" effect="plain" style="margin-right: 8px">
            通过：{{ passedCount }}
          </el-tag>
          <el-tag type="danger" effect="plain" style="margin-right: 8px">
            驳回：{{ rejectedCount }}
          </el-tag>
          <el-tag type="info" effect="plain">
            转办：{{ transferredCount }}
          </el-tag>
        </div>
      </div>
      <div class="header-right">
        <el-input
            v-model="searchText"
            placeholder="搜索已处理事项"            style="width: 300px"
            clearable
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>
    </div>

    <!-- 筛选区域 -->
    <el-card class="filter-card" shadow="hover">
      <el-form :inline="true" :model="filterForm" size="default">
        <el-form-item label="流程类型">
          <el-select v-model="filterForm.processType" placeholder="全部流程" clearable style="width: 180px">
            <el-option label="请假审批流程" value="leave" />
            <el-option label="会议申请流程" value="meeting" />
            <el-option label="用车申请流程" value="vehicle" />
            <el-option label="采购申请流程" value="purchase" />
            <el-option label="费用报销流程" value="expense" />
            <el-option label="人事调动流程" value="transfer" />
          </el-select>
        </el-form-item>
        <el-form-item label="处理结果">
          <el-select v-model="filterForm.result" placeholder="全部结果" clearable style="width: 150px">
            <el-option label="已通过" value="passed" />
            <el-option label="已驳回" value="rejected" />
            <el-option label="已转办" value="transferred" />
            <el-option label="已撤回" value="withdrawn" />
          </el-select>
        </el-form-item>
        <el-form-item label="处理时间">
          <el-date-picker
              v-model="filterForm.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="YYYY-MM-DD"              style="width: 240px"
          />
        </el-form-item>
        <el-form-item label="我的意见">
          <el-select v-model="filterForm.hasOpinion" placeholder="全部" clearable style="width: 150px">
            <el-option label="有审批意见" value="yes" />
            <el-option label="无审批意见" value="no" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleFilter" icon="Search">
            查询
          </el-button>
          <el-button @click="handleResetFilter" icon="Refresh">
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 数据表格 -->
    <el-table
        :data="filteredTableData"        style="width: 100%"
        border
        :row-class-name="tableRowClassName"
    >
      <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip>
        <template #default="{ row }">
          <div class="task-title">
            <el-tag v-if="row.isUrgent" type="danger" size="small" effect="dark" style="margin-right: 6px">
              紧急
            </el-tag>
            <el-tag v-if="row.taskType === 'add'" type="warning" size="small" style="margin-right: 6px">
              加签
            </el-tag>
            <el-tag v-if="row.taskType === 'assist'" type="info" size="small" style="margin-right: 6px">
              征询意见
            </el-tag>
            <span>{{ row.title }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="processName" label="流程名称" width="160" show-overflow-tooltip />
      <el-table-column prop="currentNode" label="当前节点" width="120" show-overflow-tooltip />
      <el-table-column prop="applicant" label="申请人" width="100" />
      <el-table-column prop="applyTime" label="发起时间" width="160" sortable />
      <el-table-column prop="handleTime" label="处理时间" width="160" sortable />
      <el-table-column prop="handleResult" label="处理结果" width="100">
        <template #default="{ row }">
          <el-tag :type="getResultType(row.handleResult)" size="small" effect="plain">
            {{ getResultText(row.handleResult) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="hasOpinion" label="审批意见" width="90">
        <template #default="{ row }">
          <el-icon v-if="row.hasOpinion" color="#67C23A"><Check /></el-icon>
          <el-icon v-else color="#C0C4CC"><Close /></el-icon>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="scope">
          <el-button size="small" type="primary" @click="handleViewDetail(scope.row)" icon="View">
            详情
          </el-button>
          <el-button size="small" @click="handleViewOpinion(scope.row)" icon="ChatDotRound">
            意见
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="table-footer">
      <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
      />
    </div>

    <!-- 查看详情对话框 - 嵌入 Detail.vue 组件 -->
    <el-dialog
        v-model="viewDialogVisible"
        title=""
        width="95%"
        :close-on-click-modal="false"
        :fullscreen="true"
        destroy-on-close
    >
      <template #header>
        <div style="display: none;">
          <!-- 隐藏标题，使用组件内部的头部 -->
        </div>
      </template>

      <!-- 嵌入 Detail 组件，通过 props 传递审批 ID -->
      <DetailComponent
          v-if="viewDialogVisible"
          :approval-id="currentViewId"
          :embedded-in-dialog="true"
          @close="handleDialogClose"
      />
    </el-dialog>

    <!-- 审批意见快速查看对话框 -->
    <el-dialog
        v-model="opinionDialogVisible"
        title="我的审批意见"
        width="600px"
    >
      <div v-if="currentOpinion" class="quick-opinion">
        <div class="opinion-result">
          <el-tag :type="getResultType(currentOpinion.handleResult)" size="large">
            {{ getResultText(currentOpinion.handleResult) }}
          </el-tag>
        </div>
        <div class="opinion-detail">
          <strong>审批意见：</strong>
          <p>{{ currentOpinion.opinion || '无' }}</p>
        </div>
        <div class="opinion-meta">
          <div>处理时间：{{ currentOpinion.handleTime }}</div>
          <div v-if="currentOpinion.duration">办理耗时：{{ currentOpinion.duration }}</div>
        </div>
      </div>
      <template #footer>
        <el-button @click="opinionDialogVisible = false" icon="Close">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Search, Refresh, View, ChatDotRound, Close, Check, Document
} from '@element-plus/icons-vue'
import DetailComponent from '../Detail.vue'

const searchText = ref('')

// 统计数据
const passedCount = ref(15)
const rejectedCount = ref(3)
const transferredCount = ref(2)

// 筛选表单
const filterForm = reactive({
  processType: '',
  result: '',
  dateRange: [],
  hasOpinion: ''
})

const tableData = ref([
  {
    id: 1,
    title: '张三 - 请假申请',
    processName: '请假审批流程',
    currentNode: '部门经理审批',
    applicant: '张三',
    department: '信息技术部',
    applyTime: '2024-01-15 09:30',
    handleTime: '2024-01-15 14:20',
    handleResult: 'passed',
    hasOpinion: true,
    isUrgent: false,
    taskType: 'approve',
    priority: 'medium',
    content: '因个人原因，需请假 3 天，望批准。',
    attachments: [
      { name: '请假证明.pdf', url: '#' }
    ],
    myOpinion: '情况属实，同意请假。请做好工作交接。',
    myAttachments: [],
    handler: '李四',
    historyRecords: [
      {
        node: '发起人提交',
        processor: '张三',
        time: '2024-01-15 09:30:00',
        status: '已提交',
        statusType: 'success',
        color: '#67C23A',
        opinion: '请领导审批'
      },
      {
        node: '部门初审',
        processor: '王五',
        time: '2024-01-15 10:45:00',
        status: '已通过',
        statusType: 'success',
        color: '#67C23A',
        opinion: '同意'
      }
    ],
    flowSteps: [
      { name: '开始', handler: '张三', status: '已完成', stepStatus: 'success' },
      { name: '部门经理审批', handler: '李四', status: '已完成', stepStatus: 'success' },
      { name: '分管领导审批', handler: '', status: '待处理', stepStatus: 'wait' },
      { name: '结束', handler: '', status: '待处理', stepStatus: 'wait' }
    ],
    currentStep: 1
  },
  {
    id: 2,
    title: '李四 - 会议申请',
    processName: '会议申请流程',
    currentNode: '综合部确认',
    applicant: '李四',
    department: '市场部',
    applyTime: '2024-01-14 10:20',
    handleTime: '2024-01-14 16:30',
    handleResult: 'rejected',
    hasOpinion: true,
    isUrgent: false,
    taskType: 'approve',
    priority: 'high',
    content: '申请召开季度营销会议，预计 50 人参加。',
    attachments: [],
    myOpinion: '会议预算过高，建议缩减规模后重新申请。',
    myAttachments: [
      { name: '预算调整建议.docx', url: '#' }
    ],
    handler: '赵六',
    historyRecords: [],
    flowSteps: [],
    currentStep: 0
  },
  {
    id: 3,
    title: '王五 - 用车申请',
    processName: '用车申请流程',
    currentNode: '车辆调度',
    applicant: '王五',
    department: '销售部',
    applyTime: '2024-01-13 11:15',
    handleTime: '2024-01-13 15:45',
    handleResult: 'passed',
    hasOpinion: false,
    isUrgent: false,
    taskType: 'approve',
    priority: 'low',
    content: '因业务需要，申请使用公务车一辆。',
    attachments: [],
    myOpinion: '',
    myAttachments: [],
    handler: '孙七',
    historyRecords: [],
    flowSteps: [],
    currentStep: 0
  },
  {
    id: 4,
    title: '赵六 - 采购申请（加签）',
    processName: '采购申请流程',
    currentNode: '财务审核',
    applicant: '赵六',
    department: '行政部',
    applyTime: '2024-01-12 14:00',
    handleTime: '2024-01-12 17:30',
    handleResult: 'transferred',
    hasOpinion: true,
    isUrgent: true,
    taskType: 'add',
    priority: 'urgent',
    content: '申请采购办公用品一批。',
    attachments: [
      { name: '采购清单.xlsx', url: '#' }
    ],
    myOpinion: '此采购已超预算，请财务部先行审核。',
    myAttachments: [],
    handler: '周八',
    historyRecords: [],
    flowSteps: [],
    currentStep: 0
  }
])

const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(4)

// 对话框控制
const viewDialogVisible = ref(false)
const currentViewId = ref('')
const opinionDialogVisible = ref(false)
const currentOpinion = ref(null)

const filteredTableData = computed(() => {
  let result = [...tableData.value]

  // 搜索过滤
  if (searchText.value) {
    result = result.filter(item =>
        item.title.includes(searchText.value) ||
        item.processName.includes(searchText.value) ||
        item.applicant.includes(searchText.value)
    )
  }

  // 流程类型过滤
  if (filterForm.processType) {
    result = result.filter(item => item.processName.includes(filterForm.processType))
  }

  // 处理结果过滤
  if (filterForm.result) {
    result = result.filter(item => item.handleResult === filterForm.result)
  }

  // 日期范围过滤
  if (filterForm.dateRange && filterForm.dateRange.length === 2) {
    const startDate = new Date(filterForm.dateRange[0])
    const endDate = new Date(filterForm.dateRange[1])
    endDate.setHours(23, 59, 59, 999)

    result = result.filter(item => {
      const itemDate = new Date(item.handleTime)
      return itemDate >= startDate && itemDate <= endDate
    })
  }

  // 审批意见过滤
  if (filterForm.hasOpinion === 'yes') {
    result = result.filter(item => item.hasOpinion)
  } else if (filterForm.hasOpinion === 'no') {
    result = result.filter(item => !item.hasOpinion)
  }

  return result
})

const getResultType = (result) => {
  const typeMap = {
    'passed': 'success',
    'rejected': 'danger',
    'transferred': 'warning',
    'withdrawn': 'info'
  }
  return typeMap[result] || 'info'
}

const getResultText = (result) => {
  const textMap = {
    'passed': '已通过',
    'rejected': '已驳回',
    'transferred': '已转办',
    'withdrawn': '已撤回'
  }
  return textMap[result] || '未知'
}

const tableRowClassName = ({ row }) => {
  if (row.isUrgent) {
    return 'urgent-row'
  }
  return ''
}

// 筛选操作
const handleFilter = () => {
  console.log('执行筛选', filterForm)
  ElMessage.success('筛选完成')
}

const handleResetFilter = () => {
  filterForm.processType = ''
  filterForm.result = ''
  filterForm.dateRange = []
  filterForm.hasOpinion = ''
  searchText.value = ''
}

// 查看详情 - 打开弹框展示 Detail.vue 组件
const handleViewDetail = (row) => {
  currentViewId.value = row.id.toString()
  viewDialogVisible.value = true
}

// 关闭对话框回调
const handleDialogClose = () => {
  viewDialogVisible.value = false
}

// 查看审批意见
const handleViewOpinion = (row) => {
  currentOpinion.value = {
    handleResult: row.handleResult,
    opinion: row.myOpinion || '无',
    handleTime: row.handleTime,
    duration: '2 小时 15 分钟'
  }
  opinionDialogVisible.value = true
}

onMounted(() => {
  // 可以在这里调用 API 获取真实数据
})
</script>

<style scoped lang="scss">
.processed-container {
  padding: 20px;
  background: #fff;
  border-radius: 4px;
  min-height: calc(100vh - 140px);

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    flex-wrap: wrap;
    gap: 10px;

    .header-left {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;

      h2 {
        font-size: 20px;
        color: #333;
        margin: 0;
        font-weight: 600;
      }

      .stat-tags {
        display: flex;
        align-items: center;
      }
    }

    .header-right {
      display: flex;
      gap: 12px;
    }
  }

  .filter-card {
    margin-bottom: 20px;

    :deep(.el-card__body) {
      padding: 16px;
    }
  }

  .task-title {
    display: flex;
    align-items: center;
  }

  .table-footer {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}

// 紧急行样式
:deep(.el-table__body tr.urgent-row) {
  background-color: #fef0f0 !important;

  &:hover {
    td {
      background-color: #ffe6e6 !important;
    }
  }
}

// 详情对话框样式
.detail-section {
  h4 {
    font-size: 16px;
    color: #333;
    margin: 16px 0 12px;
    font-weight: 600;
    border-left: 3px solid #409EFF;
    padding-left: 8px;
  }

  .attachment-list {
    .attachment-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      margin-bottom: 8px;
      background-color: #f5f7fa;
      border-radius: 4px;

      .el-icon {
        color: #409EFF;
        font-size: 18px;
      }

      span {
        flex: 1;
        font-size: 14px;
        color: #606266;
      }
    }
  }
}

// 我的意见卡片
.my-opinion-card {
  padding: 20px;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border-radius: 8px;
  border: 1px solid #bae6fd;

  .opinion-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;

    .opinion-info {
      flex: 1;

      .opinion-user {
        font-size: 15px;
        font-weight: 600;
        color: #333;
      }

      .opinion-time {
        font-size: 13px;
        color: #909399;
        margin-top: 4px;
      }
    }
  }

  .opinion-content {
    padding: 12px;
    background-color: #fff;
    border-radius: 4px;
    margin-bottom: 12px;

    p {
      margin-top: 8px;
      font-size: 14px;
      color: #606266;
      line-height: 1.6;
    }
  }

  .opinion-attachments {
    .attachment-link {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-top: 8px;
      font-size: 14px;
    }
  }
}

// 时间线记录
.timeline-record {
  .record-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;

    .record-node {
      font-size: 15px;
      font-weight: 600;
      color: #333;
    }
  }

  .record-info {
    div {
      margin-bottom: 6px;
      font-size: 14px;
      color: #606266;

      strong {
        color: #333;
        margin-right: 4px;
      }
    }
  }
}

// 快速意见查看
.quick-opinion {
  .opinion-result {
    text-align: center;
    margin-bottom: 20px;
  }

  .opinion-detail {
    padding: 16px;
    background-color: #f5f7fa;
    border-radius: 4px;
    margin-bottom: 16px;

    p {
      margin-top: 8px;
      font-size: 14px;
      color: #606266;
      line-height: 1.6;
    }
  }

  .opinion-meta {
    font-size: 13px;
    color: #909399;

    div {
      margin-bottom: 4px;
    }
  }
}

// 对话框样式优化
:deep(.el-dialog) {
  .el-dialog__body {
    padding: 0;
    overflow: hidden;
  }
}
</style>
