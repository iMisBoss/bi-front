<template>
  <div class="launched-container">
    <div class="page-header">
      <div class="header-left">
        <h2>我发起的</h2>
        <div class="stat-tags">
          <el-tag type="warning" effect="plain" style="margin-right: 8px">
            审批中：{{ processingCount }}
          </el-tag>
          <el-tag type="success" effect="plain" style="margin-right: 8px">
            已通过：{{ passedCount }}
          </el-tag>
          <el-tag type="danger" effect="plain" style="margin-right: 8px">
            已驳回：{{ rejectedCount }}
          </el-tag>
        </div>
      </div>
      <div class="header-right">
        <el-input
            v-model="searchText"
            placeholder="搜索我发起的审批"
            style="width: 300px"
            clearable
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button type="primary" @click="handleCopyProcess" icon="DocumentCopy" style="margin-left: 12px">
          复制流程
        </el-button>
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
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filterForm.status" placeholder="全部状态" clearable style="width: 150px">
            <el-option label="审批中" value="processing" />
            <el-option label="已通过" value="passed" />
            <el-option label="已驳回" value="rejected" />
            <el-option label="已撤回" value="withdrawn" />
          </el-select>
        </el-form-item>
        <el-form-item label="发起时间">
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
        :data="filteredTableData"
        style="width: 100%"
        border
        :row-class-name="tableRowClassName"
    >
      <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip>
        <template #default="{ row }">
          <div class="task-title">
            <el-tag v-if="row.isUrgent" type="danger" size="small" effect="dark" style="margin-right: 6px">
              紧急
            </el-tag>
            <span>{{ row.title }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="processName" label="流程名称" width="160" show-overflow-tooltip />
      <el-table-column prop="applyTime" label="发起时间" width="160" sortable />
      <el-table-column prop="currentNode" label="当前节点" width="140" show-overflow-tooltip>
        <template #default="{ row }">
          <div v-if="row.status === 'processing'" class="current-node">
            <el-tag type="warning" size="small" effect="plain">{{ row.currentNode }}</el-tag>
          </div>
          <div v-else>{{ row.currentNode }}</div>
        </template>
      </el-table-column>
      <el-table-column prop="stayTime" label="停留时长" width="100">
        <template #default="{ row }">
          <span v-if="row.status === 'processing'" class="stay-time">{{ row.stayTime }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)" size="small" effect="plain">
            {{ getStatusText(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="280" fixed="right">
        <template #default="scope">
          <el-button size="small" type="primary" @click="handleView(scope.row)" icon="View">
            详情
          </el-button>
          <el-button
              v-if="scope.row.status === 'processing'"
              size="small"
              type="warning"
              @click="handleUrge(scope.row)"
              icon="Bell"
          >
            催办
          </el-button>
          <el-button
              v-if="canRevoke(scope.row.status)"
              size="small"
              type="danger"
              @click="handleRevoke(scope.row)"
              icon="Close"
          >
            撤回
          </el-button>
          <el-dropdown trigger="click" @command="(command) => handleMoreAction(command, scope.row)">
            <el-button size="small" icon="More">
              更多
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="supplement">补充材料</el-dropdown-item>
                <el-dropdown-item command="copy">复制发起</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
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

    <!-- 催办对话框 -->
    <el-dialog
        v-model="urgeDialogVisible"
        title="催办"
        width="500px"
        :close-on-click-modal="false"
    >
      <el-form :model="urgeForm" label-width="100px">
        <el-alert
            title="催办提醒"
            type="warning"
            :closable="false"
            style="margin-bottom: 20px"
        >
          催办将向当前审批人发送系统消息和短信提醒
        </el-alert>
        <el-form-item label="当前审批人">
          <div>{{ urgeForm.currentHandler }}</div>
        </el-form-item>
        <el-form-item label="催办留言">
          <el-input
              v-model="urgeForm.message"
              type="textarea"
              :rows="3"
              placeholder="请输入催办留言（选填）"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="urgeDialogVisible = false">取消</el-button>
        <el-button type="warning" @click="confirmUrge" icon="Bell">确定</el-button>
      </template>
    </el-dialog>

    <!-- 补充材料对话框 -->
    <el-dialog
        v-model="supplementDialogVisible"
        title="补充材料"
        width="600px"
        :close-on-click-modal="false"
    >
      <el-form :model="supplementForm" label-width="100px">
        <el-form-item label="补充说明">
          <el-input
              v-model="supplementForm.description"
              type="textarea"
              :rows="4"
              placeholder="请描述补充的材料或说明"
          />
        </el-form-item>
        <el-form-item label="附件上传">
          <el-upload
              action="#"
              :limit="5"
              multiple
              :file-list="supplementForm.files"
              :on-change="handleFileChange"
              :on-remove="handleFileRemove"
          >
            <el-button type="primary">上传附件</el-button>
            <template #tip>
              <div class="el-upload__tip">最多上传 5 个文件</div>
            </template>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="supplementDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmSupplement" icon="Check">确定</el-button>
      </template>
    </el-dialog>

    <!-- 复制流程选择对话框 -->
    <el-dialog
        v-model="copyDialogVisible"
        title="复制流程重新发起"
        width="700px"
        :close-on-click-modal="false"
    >
      <el-form :model="copyForm" label-width="100px">
        <el-form-item label="选择流程">
          <el-select
              v-model="copyForm.selectedProcessId"
              placeholder="请选择要复制的流程"
              style="width: 100%"
              @change="handleProcessSelect"
          >
            <el-option
                v-for="item in copyableProcesses"
                :key="item.id"
                :label="`${item.title} (${item.processName})`"
                :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-alert
            v-if="copyForm.selectedProcessId"
            title="复制说明"
            type="info"
            :closable="false"
            style="margin-top: 10px"
        >
          将复制选中流程的表单内容和附件，生成新的审批流程
        </el-alert>
      </el-form>
      <template #footer>
        <el-button @click="copyDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmCopy" icon="Check">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search, Refresh, View, Bell, Close, More, DocumentCopy, Check
} from '@element-plus/icons-vue'
import DetailComponent from '../Detail.vue'

const searchText = ref('')

// 统计数据
const processingCount = ref(2)
const passedCount = ref(1)
const rejectedCount = ref(1)

// 筛选表单
const filterForm = reactive({
  processType: '',
  status: '',
  dateRange: []
})

const tableData = ref([
  {
    id: 1,
    title: '请假申请 - 张三',
    processName: '请假审批流程',
    applicant: '张三',
    department: '信息技术部',
    applyTime: '2026-01-15 09:30',
    currentNode: '部门经理审批',
    stayTime: '2 小时',
    status: 'processing',
    isUrgent: false,
    content: '因个人原因，需请假 3 天，望批准。',
    flowSteps: [
      { name: '开始', handler: '张三', status: '已完成', stepStatus: 'success' },
      { name: '部门经理审批', handler: '李四', status: '进行中', stepStatus: 'process' },
      { name: '分管领导审批', handler: '', status: '待处理', stepStatus: 'wait' },
      { name: '结束', handler: '', status: '待处理', stepStatus: 'wait' }
    ],
    currentStep: 1,
    historyRecords: [
      {
        node: '发起人提交',
        processor: '张三',
        time: '2026-01-15 09:30:00',
        status: '已提交',
        statusType: 'success',
        color: '#67C23A',
        opinion: ''
      }
    ]
  },
  {
    id: 2,
    title: '会议申请 - 张三',
    processName: '会议申请流程',
    applicant: '张三',
    department: '信息技术部',
    applyTime: '2026-01-14 14:20',
    currentNode: '已完成',
    stayTime: '-',
    status: 'passed',
    isUrgent: false,
    content: '申请召开季度营销会议。',
    flowSteps: [],
    currentStep: 0,
    historyRecords: []
  },
  {
    id: 3,
    title: '用车申请 - 张三',
    processName: '用车申请流程',
    applicant: '张三',
    department: '信息技术部',
    applyTime: '2026-01-13 11:15',
    currentNode: '行政部审批',
    stayTime: '1 天',
    status: 'processing',
    isUrgent: true,
    content: '因业务需要，申请使用公务车。',
    flowSteps: [],
    currentStep: 0,
    historyRecords: []
  },
  {
    id: 4,
    title: '用印申请 - 张三',
    processName: '用印申请流程',
    applicant: '张三',
    department: '信息技术部',
    applyTime: '2026-01-12 10:00',
    currentNode: '已完成',
    stayTime: '-',
    status: 'rejected',
    isUrgent: false,
    content: '申请使用公司公章。',
    flowSteps: [],
    currentStep: 0,
    historyRecords: []
  }
])

const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(4)

// 对话框控制
const viewDialogVisible = ref(false)
const currentViewId = ref('')
const urgeDialogVisible = ref(false)
const supplementDialogVisible = ref(false)
const copyDialogVisible = ref(false)

// 催办表单
const urgeForm = reactive({
  currentHandler: '',
  message: '',
  currentRow: null
})

// 补充材料表单
const supplementForm = reactive({
  description: '',
  files: [],
  currentRow: null
})

// 复制流程表单
const copyForm = reactive({
  selectedProcessId: null,
  selectedProcess: null
})

// 可复制的流程列表（排除已通过、已驳回的）
const copyableProcesses = computed(() => {
  return tableData.value.filter(item =>
      item.status === 'passed' || item.status === 'rejected'
  )
})

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

  // 状态过滤
  if (filterForm.status) {
    result = result.filter(item => item.status === filterForm.status)
  }

  // 日期范围过滤
  if (filterForm.dateRange && filterForm.dateRange.length === 2) {
    const startDate = new Date(filterForm.dateRange[0])
    const endDate = new Date(filterForm.dateRange[1])
    endDate.setHours(23, 59, 59, 999)

    result = result.filter(item => {
      const itemDate = new Date(item.applyTime)
      return itemDate >= startDate && itemDate <= endDate
    })
  }

  return result
})

const getStatusType = (status) => {
  const typeMap = {
    'processing': 'warning',
    'passed': 'success',
    'rejected': 'danger',
    'withdrawn': 'info'
  }
  return typeMap[status] || 'info'
}

const getStatusText = (status) => {
  const textMap = {
    'processing': '审批中',
    'passed': '已通过',
    'rejected': '已驳回',
    'withdrawn': '已撤回'
  }
  return textMap[status] || '未知'
}

const tableRowClassName = ({ row }) => {
  if (row.isUrgent) {
    return 'urgent-row'
  }
  return ''
}

const canRevoke = (status) => {
  return status === 'processing' || status === 'withdrawn'
}

// 筛选操作
const handleFilter = () => {
  console.log('执行筛选', filterForm)
  ElMessage.success('筛选完成')
}

const handleResetFilter = () => {
  filterForm.processType = ''
  filterForm.status = ''
  filterForm.dateRange = []
  searchText.value = ''
}

// 查看详情 - 打开弹框展示 Detail.vue 组件
const handleView = (row) => {
  currentViewId.value = row.id.toString()
  viewDialogVisible.value = true
}

// 关闭对话框回调
const handleDialogClose = () => {
  viewDialogVisible.value = false
}

// 催办
const handleUrge = (row) => {
  urgeForm.currentRow = row
  urgeForm.currentHandler = row.currentNode
  urgeForm.message = ''
  urgeDialogVisible.value = true
}

// 撤回
const handleRevoke = (row) => {
  ElMessageBox.confirm('确认撤回该审批吗？撤回后流程将终止。', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    console.log('撤回', row)
    ElMessage.success('撤回成功')
  }).catch(() => {})
}

// 更多操作
const handleMoreAction = (command, row) => {
  switch (command) {
    case 'supplement':
      handleSupplement(row)
      break
    case 'copy':
      handleCopySingle(row)
      break
    case 'flowchart':
      handleViewFlowchart(row)
      break
    case 'opinion':
      handleViewOpinion(row)
      break
  }
}

// 补充材料
const handleSupplement = (row) => {
  supplementForm.currentRow = row
  supplementForm.description = ''
  supplementForm.files = []
  supplementDialogVisible.value = true
}

// 复制单个流程
const handleCopySingle = (row) => {
  copyForm.selectedProcessId = row.id
  copyForm.selectedProcess = row
  copyDialogVisible.value = true
}

// 查看流程图
const handleViewFlowchart = (row) => {
  currentViewId.value = row.id.toString()
  viewDialogVisible.value = true
  // 注意：这里需要在 Detail.vue 中支持直接切换到流程图 Tab
  // 可以通过额外的 prop 或者事件来控制
}

// 查看审批意见
const handleViewOpinion = (row) => {
  currentViewId.value = row.id.toString()
  viewDialogVisible.value = true
  // 注意：这里需要在 Detail.vue 中支持直接切换到审批意见 Tab
  // 可以通过额外的 prop 或者事件来控制
}

// 选择流程
const handleProcessSelect = (processId) => {
  copyForm.selectedProcess = tableData.value.find(item => item.id === processId)
}

// 确认催办
const confirmUrge = () => {
  console.log('确认催办', urgeForm.currentRow, urgeForm.message)
  ElMessage.success('催办成功，已向审批人发送提醒')
  urgeDialogVisible.value = false
}

// 确认补充材料
const confirmSupplement = () => {
  console.log('确认补充', supplementForm.currentRow, supplementForm)
  ElMessage.success('补充材料成功')
  supplementDialogVisible.value = false
}

// 确认复制
const confirmCopy = () => {
  if (!copyForm.selectedProcessId) {
    ElMessage.warning('请选择要复制的流程')
    return
  }
  console.log('确认复制', copyForm.selectedProcess)
  ElMessage.success('复制成功，正在跳转到发起页面...')
  copyDialogVisible.value = false
  // 实际项目中可以跳转到发起页面并携带模板数据
  // window.open(`/process/approval/start?templateId=${copyForm.selectedProcess.processId}`, '_blank')
}

// 顶部复制流程按钮
const handleCopyProcess = () => {
  if (copyableProcesses.value.length === 0) {
    ElMessage.warning('没有可复制的流程')
    return
  }
  copyForm.selectedProcessId = null
  copyForm.selectedProcess = null
  copyDialogVisible.value = true
}

// 文件上传处理
const handleFileChange = (file, fileList) => {
  supplementForm.files = fileList
}

const handleFileRemove = (file, fileList) => {
  supplementForm.files = fileList
}

onMounted(() => {
  // 可以在这里调用 API 获取真实数据
})
</script>

<style scoped lang="scss">
.launched-container {
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

  .current-node {
    display: inline-block;
  }

  .stay-time {
    color: #E6A23C;
    font-weight: 500;
  }

  .table-footer {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}

// 防止操作按钮组换行
:deep(.el-table__body .el-table__cell .cell) {
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
  flex-wrap: nowrap !important;

  .el-button {
    white-space: nowrap !important;
    margin: 0 !important;
  }

  .el-dropdown {
    white-space: nowrap !important;
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

// 对话框样式优化
:deep(.el-dialog) {
  .el-dialog__body {
    padding: 0;
    overflow: hidden;
  }
}
</style>
