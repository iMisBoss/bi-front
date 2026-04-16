<template>
  <div class="compliance-report-page">
    <el-card shadow="never" class="main-card">
      <template #header>
        <div class="page-header">
          <div class="header-left">
            <h2>流程报表汇总</h2>
          </div>
          <div class="header-right">
            <el-button @click="refreshData" icon="Refresh" :loading="loading" size="default">刷新数据</el-button>
            <el-button @click="showOperationLog" icon="Document" size="default">操作日志</el-button>
          </div>
        </div>
      </template>

      <FilterSection
          :filter-form="filterForm"
          :templates="filterTemplates"
          @filter-change="handleFilterChange"
          @reset="handleResetFilter"
          @save-template="showSaveTemplateDialog = true"
          @load-template="handleLoadTemplate"
      />

      <el-tabs v-model="activeTab" @tab-change="handleTabChange" class="process-tabs">
        <el-tab-pane label="全流程汇总" name="all" />
        <el-tab-pane label="人事流程" name="hr" />
        <el-tab-pane label="财务流程" name="finance" />
        <el-tab-pane label="行政流程" name="admin" />
        <el-tab-pane label="会议流程" name="meeting" />
        <el-tab-pane label="公文流程" name="document" />
        <el-tab-pane label="自定义流程" name="custom" />
      </el-tabs>

      <DataTable
          ref="dataTableRef"
          :table-data="tableData"
          :loading="loading"
          :active-tab="activeTab"
          @view-detail="handleViewDetail"
          @selection-change="handleSelectionChange"
      />

      <div class="bottom-section">
        <div class="stats-cards">
          <el-card shadow="hover" class="stat-card">
            <el-statistic title="总流程数" :value="stats.total" />
          </el-card>
          <el-card shadow="hover" class="stat-card">
            <el-statistic title="审批中" :value="stats.approving" value-style="color: #409EFF" />
          </el-card>
          <el-card shadow="hover" class="stat-card">
            <el-statistic title="已完成" :value="stats.completed" value-style="color: #67C23A" />
          </el-card>
          <el-card shadow="hover" class="stat-card">
            <el-statistic title="已驳回" :value="stats.rejected" value-style="color: #F56C6C" />
          </el-card>
          <el-card shadow="hover" class="stat-card">
            <el-statistic title="异常流程" :value="stats.abnormal" value-style="color: #E6A23C" />
          </el-card>
        </div>

        <div class="compliance-tips">
          <el-alert
              :title="complianceTip.title"
              :type="complianceTip.type"
              :closable="false"
              show-icon
          >
            <template #default>
              <p>{{ complianceTip.message }}</p>
            </template>
          </el-alert>
        </div>

        <div class="export-actions">
          <el-button type="primary" @click="showExportDialog('excel')" icon="Document">
            Excel导出
          </el-button>
          <el-button type="success" @click="showExportDialog('pdf')" icon="Tickets">
            PDF导出
          </el-button>
          <el-button type="warning" @click="showExportDialog('zip')" icon="FolderOpened">
            监管报送包
          </el-button>
          <el-button @click="decryptSensitive" icon="Unlock" v-if="isAdmin">
            解密敏感字段
          </el-button>
        </div>
      </div>
    </el-card>

    <DetailDrawer
        v-model="detailDrawerVisible"
        :process-data="currentProcess"
    />

    <ExportDialog
        v-model="exportDialogVisible"
        :export-type="exportType"
        :selected-count="selectedRows.length"
        :total-count="tableData.length"
        @export="handleExport"
    />

    <OperationLogDialog v-model="operationLogVisible" />

    <SaveTemplateDialog
        v-model="showSaveTemplateDialog"
        :filter-form="filterForm"
        @save="handleSaveTemplate"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Refresh, Document } from '@element-plus/icons-vue'
import FilterSection from './components/FilterSection.vue'
import DataTable from './components/DataTable.vue'
import DetailDrawer from './components/DetailDrawer.vue'
import ExportDialog from './components/ExportDialog.vue'
import OperationLogDialog from './components/OperationLogDialog.vue'
import SaveTemplateDialog from './components/SaveTemplateDialog.vue'

const loading = ref(false)
const activeTab = ref('all')
const detailDrawerVisible = ref(false)
const exportDialogVisible = ref(false)
const operationLogVisible = ref(false)
const showSaveTemplateDialog = ref(false)
const exportType = ref('excel')
const currentProcess = ref({})
const selectedRows = ref([])
const isAdmin = ref(true)

const filterForm = reactive({
  startTime: null,
  endTime: null,
  completeStartTime: null,
  completeEndTime: null,
  status: '',
  templates: [],
  processNo: '',
  initiator: '',
  approver: '',
  departments: [],
  abnormalType: [],
  dataScope: 'all'
})

const filterTemplates = ref([
  { name: '月度审计报表', form: { status: 'completed', startTime: '2026-01-01', endTime: '2026-01-31' } },
  { name: '异常流程核查', form: { abnormalType: ['timeout', 'reject'] } },
  { name: '涉密流程导出', form: { dataScope: 'confidential' } }
])

const tableData = ref([
  {
    id: 1,
    processNo: 'PRC202601001',
    processName: '春节放假申请',
    template: '请假流程',
    initiator: '张三',
    initiatorNo: 'EMP001',
    department: '技术研发部',
    position: '高级工程师',
    phone: '138****1234',
    status: '已通过',
    startTime: '2026-01-10 09:00:00',
    endTime: '2026-01-11 14:30:00',
    duration: '1天5小时',
    currentApprover: '李四',
    nodeCount: 3,
    approvedNodes: 3,
    rejectCount: 0,
    isTimeout: false,
    reason: '春节放假回家',
    attachmentCount: 2,
    project: '-',
    contract: '-',
    leaveType: '年假',
    leaveDays: '5天',
    archiveTime: '2026-01-12',
    archiver: '系统',
    dataStatus: '已归档',
    isSensitive: false,
    isConfidential: false
  },
  {
    id: 2,
    processNo: 'PRC202601002',
    processName: '年度预算审批',
    template: '财务报销',
    initiator: '王五',
    initiatorNo: 'EMP002',
    department: '财务部',
    position: '财务经理',
    phone: '139****5678',
    status: '审批中',
    startTime: '2026-01-12 10:00:00',
    endTime: '-',
    duration: '-',
    currentApprover: '赵六',
    nodeCount: 5,
    approvedNodes: 2,
    rejectCount: 0,
    isTimeout: true,
    reason: '2026年度部门预算申请',
    attachmentCount: 5,
    project: '年度预算项目',
    contract: 'HT2026001',
    amount: '¥500,000',
    expenseType: '办公费用',
    archiveTime: '-',
    archiver: '-',
    dataStatus: '审批中',
    isSensitive: true,
    isConfidential: false
  },
  {
    id: 3,
    processNo: 'PRC202601003',
    processName: '公章使用申请',
    template: '用章流程',
    initiator: '孙七',
    initiatorNo: 'EMP003',
    department: '行政部',
    position: '行政专员',
    phone: '137****9012',
    status: '已驳回',
    startTime: '2026-01-13 11:00:00',
    endTime: '2026-01-13 16:00:00',
    duration: '5小时',
    currentApprover: '-',
    nodeCount: 3,
    approvedNodes: 1,
    rejectCount: 1,
    isTimeout: false,
    reason: '合同盖章',
    attachmentCount: 3,
    project: '-',
    contract: 'HT2026002',
    sealType: '公章',
    useCount: '1次',
    archiveTime: '-',
    archiver: '-',
    dataStatus: '已驳回',
    isSensitive: false,
    isConfidential: true
  }
])

const stats = computed(() => ({
  total: tableData.value.length,
  approving: tableData.value.filter(i => i.status === '审批中').length,
  completed: tableData.value.filter(i => i.status === '已通过').length,
  rejected: tableData.value.filter(i => i.status === '已驳回').length,
  abnormal: tableData.value.filter(i => i.isTimeout || i.rejectCount > 0).length
}))

const complianceTip = computed(() => {
  const abnormalCount = stats.value.abnormal
  if (abnormalCount > 0) {
    return {
      title: '合规提醒',
      type: 'warning',
      message: `当前筛选存在 ${abnormalCount} 条异常流程（超时/驳回），建议核查后导出`
    }
  }
  return {
    title: '合规提示',
    type: 'success',
    message: '当前数据符合监管报送要求，可直接导出'
  }
})

const handleFilterChange = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    ElMessage.success('筛选成功')
  }, 500)
}

const handleResetFilter = () => {
  Object.assign(filterForm, {
    startTime: null,
    endTime: null,
    completeStartTime: null,
    completeEndTime: null,
    status: '',
    templates: [],
    processNo: '',
    initiator: '',
    approver: '',
    departments: [],
    abnormalType: [],
    dataScope: 'all'
  })
  handleFilterChange()
}

const handleLoadTemplate = (template) => {
  Object.assign(filterForm, template.form)
  handleFilterChange()
  ElMessage.success(`已加载模板：${template.name}`)
}

const handleTabChange = (tab) => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 300)
}

const handleViewDetail = (row) => {
  currentProcess.value = row
  detailDrawerVisible.value = true
}

const handleSelectionChange = (selection) => {
  selectedRows.value = selection
}

const refreshData = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    ElMessage.success('数据已刷新')
  }, 500)
}

const showOperationLog = () => {
  operationLogVisible.value = true
}

const showExportDialog = (type) => {
  exportType.value = type
  exportDialogVisible.value = true
}

const handleExport = (params) => {
  ElMessage.success(`${params.type}导出成功，共导出 ${params.count} 条数据`)
  exportDialogVisible.value = false
}

const decryptSensitive = () => {
  ElMessageBox.confirm('解密敏感字段将写入审计日志，确认继续？', '解密确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('敏感字段已解密，操作已记录')
  }).catch(() => {})
}

const handleSaveTemplate = (template) => {
  filterTemplates.value.push(template)
  ElMessage.success('模板保存成功')
}

onMounted(() => {
  console.log('流程报表汇总页面加载')
})
</script>
<style scoped lang="scss">
.compliance-report-page {
  padding: 16px;
  background: #f0f2f5;
  min-height: calc(100vh - 60px);

  .main-card {
    :deep(.el-card__header) {
      padding: 12px 16px;
      border-bottom: 1px solid #e4e7ed;
    }

    :deep(.el-card__body) {
      padding: 12px 16px 16px;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .header-left {
        display: flex;
        align-items: center;
        gap: 12px;

        h2 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: #303133;
        }

        .header-tags {
          display: flex;
          gap: 8px;
        }
      }

      .header-right {
        display: flex;
        gap: 8px;
      }
    }

    .process-tabs {
      margin: 8px 0 12px;

      :deep(.el-tabs__header) {
        margin-bottom: 0;
      }
    }

    .bottom-section {
      margin-top: 16px;

      .stats-cards {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: 12px;
        margin-bottom: 12px;

        .stat-card {
          text-align: center;

          :deep(.el-card__body) {
            padding: 12px;
          }
        }
      }

      .compliance-tips {
        margin-bottom: 12px;

        :deep(.el-alert) {
          padding: 8px 12px;
        }

        p {
          margin: 0;
          font-size: 13px;
        }
      }

      .export-actions {
        display: flex;
        gap: 8px;
        justify-content: flex-end;
        padding-top: 12px;
        border-top: 1px solid #e8e8e8;
      }
    }
  }
}
</style>
