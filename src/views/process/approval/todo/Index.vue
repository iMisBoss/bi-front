<template>
  <div class="my-approval-container">
    <div class="page-header">
      <div class="header-left">
        <h2>我的待办</h2>
        <el-tag type="danger" effect="dark" style="margin-left: 12px">
          {{ urgentCount }} 个紧急
        </el-tag>
      </div>
      <div class="header-right">
        <el-input
            v-model="searchText"
            placeholder="搜索待办事项"
            style="width: 300px"
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
          </el-select>
        </el-form-item>
        <el-form-item label="紧急程度">
          <el-select v-model="filterForm.priority" placeholder="全部优先级" clearable style="width: 150px">
            <el-option label="特急" value="urgent" />
            <el-option label="高" value="high" />
            <el-option label="中" value="medium" />
            <el-option label="低" value="low" />
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
          <el-button type="primary" @click="handleFilter">
            <el-icon><Search /></el-icon>
            查询
          </el-button>
          <el-button @click="handleResetFilter">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card v-if="selectedRows.length > 0" class="batch-operation-card" shadow="never">
      <div class="batch-operation-content">
        <span class="selected-count">已选择 {{ selectedRows.length }} 项</span>
        <el-button type="success" size="small" @click="handleBatchApprove" icon="CircleCheck">
          批量通过
        </el-button>
        <el-button type="danger" size="small" @click="handleBatchReject" icon="CircleClose">
          批量驳回
        </el-button>
        <el-button type="warning" size="small" @click="handleBatchTransfer" icon="Switch">
          批量转办
        </el-button>
        <el-button size="small" @click="clearSelection" icon="Delete">
          取消选择
        </el-button>
      </div>
    </el-card>

    <!-- 数据表格 -->
    <el-table
        :data="filteredTableData"
        style="width: 100%"
        border
        @selection-change="handleSelectionChange"
        :row-class-name="tableRowClassName"
    >
      <el-table-column type="selection" width="55" :selectable="selectable" />
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
      <el-table-column prop="processName" label="流程名称" width="150" show-overflow-tooltip />
      <el-table-column prop="currentNode" label="当前节点" width="120" show-overflow-tooltip />
      <el-table-column prop="applicant" label="申请人" width="100" />
      <el-table-column prop="applyTime" label="发起时间" width="160" sortable />
      <el-table-column prop="priority" label="紧急程度" width="90" sortable>
        <template #default="{ row }">
          <el-tag :type="getPriorityType(row.priority)" size="small" effect="plain">
            {{ getPriorityText(row.priority) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="taskType" label="任务类型" width="90">
        <template #default="{ row }">
          <el-tag v-if="row.taskType === 'approve'" type="success" size="small">审批</el-tag>
          <el-tag v-else-if="row.taskType === 'add'" type="warning" size="small">加签</el-tag>
          <el-tag v-else-if="row.taskType === 'assist'" type="info" size="small">征询意见</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="280" fixed="right">
        <template #default="scope">
          <el-button size="small" type="primary" @click="handleApprove(scope.row)" icon="Check">
            审批
          </el-button>
          <el-button size="small" @click="handleView(scope.row)" icon="View">
            查看
          </el-button>
          <el-button size="small" type="danger" @click="handleReject(scope.row)" icon="Close">
            驳回
          </el-button>
          <el-dropdown trigger="click" @command="(command) => handleMoreAction(command, scope.row)">
            <el-button size="small" icon="More">
              更多
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="transfer">转办</el-dropdown-item>
                <el-dropdown-item command="addReduceSign">加签/减签</el-dropdown-item>
                <el-dropdown-item command="consult">征询意见</el-dropdown-item>
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

    <!-- 审批对话框 -->
    <el-dialog
        v-model="approveDialogVisible"
        title="审批"
        width="600px"
        :close-on-click-modal="false"
    >
      <el-form :model="approveForm" label-width="100px">
        <el-form-item label="审批意见">
          <el-input
              v-model="approveForm.opinion"
              type="textarea"
              :rows="4"
              placeholder="请输入审批意见"
          />
        </el-form-item>
        <el-form-item label="附件上传">
          <el-upload
              action="#"
              :limit="5"
              multiple
              :file-list="approveForm.files"
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
        <el-button @click="approveDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmApprove" icon="Check">确定</el-button>
      </template>
    </el-dialog>

    <!-- 驳回对话框 -->
    <el-dialog
        v-model="rejectDialogVisible"
        title="驳回"
        width="600px"
        :close-on-click-modal="false"
    >
      <el-form :model="rejectForm" label-width="100px">
        <el-form-item label="驳回原因" required>
          <el-input
              v-model="rejectForm.reason"
              type="textarea"
              :rows="4"
              placeholder="请输入驳回原因"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="rejectDialogVisible = false">取消</el-button>
        <el-button type="danger" @click="confirmReject" icon="Close">确定</el-button>
      </template>
    </el-dialog>

    <!-- 转审/加签对话框 -->
    <!-- 转办/加签/减签/征询意见对话框 -->
    <el-dialog
        v-model="transferDialogVisible"
        :title="transferDialogTitle"
        width="600px"
        :close-on-click-modal="false"
    >
      <el-form :model="transferForm" label-width="100px">
        <el-form-item label="处理人" required v-if="transferForm.actionType !== 'consult'">
          <el-select v-model="transferForm.userId" placeholder="请选择处理人" style="width: 100%">
            <el-option label="李四" value="user1" />
            <el-option label="王五" value="user2" />
            <el-option label="赵六" value="user3" />
          </el-select>
        </el-form-item>
        <el-form-item label="被征询人" required v-if="transferForm.actionType === 'consult'">
          <el-select v-model="consultUserIds" placeholder="请选择被征询人（可多选）" style="width: 100%" multiple>
            <el-option label="李四 - 技术部" value="user1" />
            <el-option label="王五 - 行政部" value="user2" />
            <el-option label="赵六 - 财务部" value="user3" />
          </el-select>
        </el-form-item>
        <el-form-item label="操作原因" required>
          <el-input
              v-model="transferForm.remark"
              type="textarea"
              :rows="4"
              :placeholder="getRemarkPlaceholder(transferForm.actionType)"
          />
        </el-form-item>
        <el-form-item v-if="transferForm.actionType === 'transfer'">
          <el-alert
              title="转办说明"
              type="warning"
              :closable="false"
              show-icon
          >
            <template #default>
              <div>转办后，您将失去该任务的审批权限，由新审批人全权负责。</div>
            </template>
          </el-alert>
        </el-form-item>
        <el-form-item v-if="transferForm.actionType === 'addReduceSign'">
          <el-alert
              title="加签/减签说明"
              type="info"
              :closable="false"
              show-icon
          >
            <template #default>
              <div>加签后，需所有加签人和原审批人都审批通过，流程才能进入下一节点。您只能减签自己添加的人。</div>
            </template>
          </el-alert>
        </el-form-item>
        <el-form-item v-if="transferForm.actionType === 'consult'">
          <el-alert
              title="征询意见说明"
              type="success"
              :closable="false"
              show-icon
          >
            <template #default>
              <div>被征询人仅提供参考意见，没有审批决定权。最终审批决定权仍归您所有。</div>
            </template>
          </el-alert>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="transferDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmTransfer" icon="Check">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search, Refresh, CircleCheck, CircleClose, Switch, Delete,
  Check, View, Close, More
} from '@element-plus/icons-vue'
import DetailComponent from '../Detail.vue'

const searchText = ref('')
const urgentCount = ref(2)

// 筛选表单
const filterForm = reactive({
  processType: '',
  priority: '',
  dateRange: []
})

const tableData = ref([
  {
    id: 1,
    title: '张三 - 请假申请',
    processName: '请假审批流程',
    currentNode: '部门经理审批',
    applicant: '张三',
    applyTime: '2024-01-15 09:30',
    priority: 'urgent',
    status: '待审批',
    taskType: 'approve',
    isUrgent: true
  },
  {
    id: 2,
    title: '李四 - 会议申请',
    processName: '会议申请流程',
    currentNode: '分管领导审批',
    applicant: '李四',
    applyTime: '2024-01-15 10:20',
    priority: 'high',
    status: '待审批',
    taskType: 'approve',
    isUrgent: false
  },
  {
    id: 3,
    title: '王五 - 用车申请',
    processName: '用车申请流程',
    currentNode: '综合部确认',
    applicant: '王五',
    applyTime: '2024-01-15 11:15',
    priority: 'medium',
    status: '待审批',
    taskType: 'assist',
    isUrgent: false
  },
  {
    id: 4,
    title: '赵六 - 采购申请（加签）',
    processName: '采购申请流程',
    currentNode: '财务审核',
    applicant: '赵六',
    applyTime: '2024-01-15 14:00',
    priority: 'high',
    status: '待处理',
    taskType: 'add',
    isUrgent: false
  },
  {
    id: 5,
    title: '孙七 - 费用报销',
    processName: '费用报销流程',
    currentNode: '总经理审批',
    applicant: '孙七',
    applyTime: '2024-01-15 15:30',
    priority: 'urgent',
    status: '待审批',
    taskType: 'approve',
    isUrgent: true
  }
])

const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(5)
const selectedRows = ref([])

// 查看详情对话框
const viewDialogVisible = ref(false)
const currentViewId = ref('')

// 审批对话框
const approveDialogVisible = ref(false)
const approveForm = reactive({
  opinion: '',
  files: [],
  currentRow: null
})

// 驳回对话框
const rejectDialogVisible = ref(false)
const rejectForm = reactive({
  reason: '',
  currentRow: null
})

// 转审/加签对话框
// 转审/加签对话框
const transferDialogVisible = ref(false)
const transferDialogTitle = ref('转办')
const transferForm = reactive({
  userId: '',
  remark: '',
  actionType: '',
  currentRow: null
})
const consultUserIds = ref([])

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

  // 优先级过滤
  if (filterForm.priority) {
    result = result.filter(item => item.priority === filterForm.priority)
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

  // 紧急排序：紧急流程置顶
  result.sort((a, b) => {
    if (a.isUrgent && !b.isUrgent) return -1
    if (!a.isUrgent && b.isUrgent) return 1
    return 0
  })

  return result
})

const selectable = (row) => {
  return row.status === '待审批' || row.status === '待处理'
}

const getPriorityType = (priority) => {
  const typeMap = {
    'urgent': 'danger',
    'high': 'warning',
    'medium': 'info',
    'low': 'success'
  }
  return typeMap[priority] || 'info'
}

const getPriorityText = (priority) => {
  const textMap = {
    'urgent': '特急',
    'high': '高',
    'medium': '中',
    'low': '低'
  }
  return textMap[priority] || '普通'
}

const tableRowClassName = ({ row }) => {
  if (row.isUrgent) {
    return 'urgent-row'
  }
  return ''
}

const handleSelectionChange = (selection) => {
  selectedRows.value = selection
}

const clearSelection = () => {
  selectedRows.value = []
}

// 筛选操作
const handleFilter = () => {
  console.log('执行筛选', filterForm)
  ElMessage.success('筛选完成')
}

const handleResetFilter = () => {
  filterForm.processType = ''
  filterForm.priority = ''
  filterForm.dateRange = []
  searchText.value = ''
}

// 批量操作
const handleBatchApprove = () => {
  ElMessageBox.confirm(`确认批量通过 ${selectedRows.value.length} 个待办事项吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    console.log('批量通过', selectedRows.value)
    ElMessage.success('批量通过成功')
    clearSelection()
  }).catch(() => {})
}

const handleBatchReject = () => {
  ElMessageBox.confirm(`确认批量驳回 ${selectedRows.value.length} 个待办事项吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    rejectDialogVisible.value = true
  }).catch(() => {})
}

const handleBatchTransfer = () => {
  transferDialogTitle.value = '批量转办'
  transferForm.actionType = 'transfer'
  transferDialogVisible.value = true
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

// 单个操作
const handleApprove = (row) => {
  approveForm.currentRow = row
  approveForm.opinion = ''
  approveForm.files = []
  approveDialogVisible.value = true
}

const handleReject = (row) => {
  rejectForm.currentRow = row
  rejectForm.reason = ''
  rejectDialogVisible.value = true
}

const handleMoreAction = (command, row) => {
  transferForm.currentRow = row
  transferForm.actionType = command

  const actionMap = {
    'transfer': '转办',
    'addReduceSign': '加签/减签',
    'consult': '征询意见'
  }

  transferDialogTitle.value = actionMap[command] || '操作'
  transferForm.userId = ''
  transferForm.remark = ''
  consultUserIds.value = []
  transferDialogVisible.value = true
}

const getRemarkPlaceholder = (actionType) => {
  const placeholders = {
    'transfer': '请输入转办原因（将记录：转办人、原审批人、新审批人、转办时间）',
    'addReduceSign': '请输入加签/减签原因（将记录：加签/减签人、被加签/减签人、操作时间）',
    'consult': '请输入征询原因（将记录：征询人、被征询人、征询时间、被征询人意见）'
  }
  return placeholders[actionType] || '请输入原因'
}

// 确认操作
const confirmApprove = () => {
  console.log('确认审批', approveForm.currentRow, approveForm.opinion)
  ElMessage.success('审批成功')
  approveDialogVisible.value = false
}

const confirmReject = () => {
  if (!rejectForm.reason.trim()) {
    ElMessage.warning('请输入驳回原因')
    return
  }
  console.log('确认驳回', rejectForm.currentRow, rejectForm.reason)
  ElMessage.success('驳回成功')
  rejectDialogVisible.value = false
}

const confirmTransfer = () => {
  if (!transferForm.userId && transferForm.actionType !== 'consult') {
    ElMessage.warning('请选择处理人')
    return
  }
  if (transferForm.actionType === 'consult' && consultUserIds.value.length === 0) {
    ElMessage.warning('请选择被征询人')
    return
  }
  if (!transferForm.remark.trim()) {
    ElMessage.warning('请输入操作原因')
    return
  }

  // 构建审计日志
  const auditLog = {
    actionType: transferForm.actionType,
    actionName: transferDialogTitle.value,
    taskId: transferForm.currentRow.id,
    taskTitle: transferForm.currentRow.title,
    operator: 'current_user_id',
    operatorName: '当前用户',
    operationTime: new Date().toISOString(),
    reason: transferForm.remark
  }

  if (transferForm.actionType === 'transfer') {
    // 转办审计日志
    auditLog.originalApprover = '当前用户 ID'
    auditLog.newApprover = transferForm.userId
    auditLog.auditFields = ['转办人', '原审批人', '新审批人', '转办时间', '转办原因']
    console.log('【转办操作】', auditLog)
  } else if (transferForm.actionType === 'addReduceSign') {
    // 加签/减签审计日志
    auditLog.targetUser = transferForm.userId
    auditLog.auditFields = ['加签/减签人', '被加签/减签人', '操作时间', '操作原因']
    console.log('【加签/减签操作】', auditLog)
  } else if (transferForm.actionType === 'consult') {
    // 征询意见审计日志
    auditLog.consultUsers = consultUserIds.value
    auditLog.auditFields = ['征询人', '被征询人', '征询时间', '被征询人意见']
    console.log('【征询意见操作】', auditLog)
  }

  ElMessage.success(`${transferDialogTitle.value}成功`)
  transferDialogVisible.value = false
}

// 文件上传处理
const handleFileChange = (file, fileList) => {
  approveForm.files = fileList
}

const handleFileRemove = (file, fileList) => {
  approveForm.files = fileList
}

// 模拟同步待办数量到首页和导航栏
const syncTodoCount = () => {
  const count = tableData.value.length
  console.log('同步待办数量到系统:', count)
  localStorage.setItem('todoCount', count.toString())
  window.dispatchEvent(new Event('storage'))
}

onMounted(() => {
  syncTodoCount()
})
</script>

<style scoped lang="scss">
.my-approval-container {
  padding: 20px;
  background: #fff;
  border-radius: 4px;
  min-height: calc(100vh - 140px);

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    .header-left {
      display: flex;
      align-items: center;

      h2 {
        font-size: 20px;
        color: #333;
        margin: 0;
        font-weight: 600;
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

  .batch-operation-card {
    margin-bottom: 16px;
    background: linear-gradient(to right, #f0f9ff, #e0f2fe);

    :deep(.el-card__body) {
      padding: 12px 16px;
    }

    .batch-operation-content {
      display: flex;
      align-items: center;
      gap: 12px;

      .selected-count {
        font-size: 14px;
        font-weight: 600;
        color: #409EFF;
        margin-right: auto;
      }
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

// 对话框样式优化
:deep(.el-dialog) {
  .el-dialog__body {
    padding: 0;
    overflow: hidden;
  }
}
</style>
