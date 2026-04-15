<template>
  <div class="archive-page">
    <el-card shadow="never">
      <!-- 顶部操作栏 -->
      <div class="page-header">
        <div class="header-left">
          <el-tabs v-model="currentView" @tab-change="handleViewChange">
            <el-tab-pane label="我的归档" name="my" />
            <el-tab-pane v-if="canViewDepartment" label="部门归档" name="dept" />
            <el-tab-pane v-if="canViewGlobal" label="全局归档" name="all" />
          </el-tabs>
        </div>
        <div class="header-right">
          <el-button @click="handleExport" icon="Download" :disabled="selectedRows.length === 0">
            批量导出
          </el-button>
          <el-button @click="handlePrint" icon="Printer" :disabled="selectedRows.length === 0">
            打印归档单
          </el-button>
          <el-button @click="handleRefresh" icon="Refresh">
            刷新
          </el-button>
          <el-button @click="showAdvanced = !showAdvanced" icon="Filter">
            {{ showAdvanced ? '收起筛选' : '高级筛选' }}
          </el-button>
        </div>
      </div>

      <!-- 快速筛选区 -->
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="流程类型">
          <el-select v-model="filterForm.type" placeholder="全部类型" clearable style="width: 150px">
            <el-option label="请假" value="leave" />
            <el-option label="报销" value="expense" />
            <el-option label="出差" value="travel" />
            <el-option label="用章" value="seal" />
            <el-option label="采购" value="purchase" />
            <el-option label="付款" value="payment" />
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-select v-model="filterForm.timeRange" placeholder="请选择" clearable style="width: 120px">
            <el-option label="今日" value="today" />
            <el-option label="本周" value="week" />
            <el-option label="本月" value="month" />
            <el-option label="近3月" value="3months" />
            <el-option label="近1年" value="year" />
            <el-option label="自定义" value="custom" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="filterForm.timeRange === 'custom'" label="时间">
          <el-date-picker
              v-model="filterForm.customTime"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              style="width: 240px"
          />
        </el-form-item>
        <el-form-item label="关键词">
          <el-input
              v-model="filterForm.keyword"
              placeholder="流程编号/标题/发起人"
              clearable
              style="width: 200px"
              @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch" icon="Search">查询</el-button>
          <el-button @click="handleReset" icon="Refresh">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 高级筛选区 -->
      <el-collapse-transition>
        <div v-show="showAdvanced" class="advanced-filter">
          <el-form :inline="true" :model="advancedForm" class="filter-form">
            <el-form-item label="发起人">
              <el-select v-model="advancedForm.initiator" placeholder="选择发起人" clearable filterable style="width: 150px">
                <el-option label="张三" value="张三" />
                <el-option label="李四" value="李四" />
                <el-option label="王五" value="王五" />
              </el-select>
            </el-form-item>
            <el-form-item label="归档时间">
              <el-date-picker
                  v-model="advancedForm.archiveTime"
                  type="daterange"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  style="width: 240px"
              />
            </el-form-item>
            <el-form-item label="办结结果">
              <el-select v-model="advancedForm.result" placeholder="全部结果" clearable style="width:120px">
              <el-option label="同意" value="approved" />
              <el-option label="驳回" value="rejected" />
              <el-option label="终止" value="terminated" />
              </el-select>
            </el-form-item>
            <el-form-item label="归档方式">
              <el-select v-model="advancedForm.archiveType" placeholder="全部方式" clearable style="width: 150px">
                <el-option label="系统自动归档" value="auto" />
                <el-option label="人工手动归档" value="manual" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleAdvancedSearch">查询</el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-collapse-transition>

      <!-- 核心列表区 -->
      <el-table
          :data="tableData"
          v-loading="loading"
          border
          stripe
          @selection-change="handleSelectionChange"
          @row-click="handleRowClick"
          highlight-current-row
          :row-style="{ cursor: 'pointer' }"
      >
        <el-table-column type="selection" width="55" fixed="left" />
        <el-table-column prop="processNo" label="流程编号" width="160" fixed="left">
          <template #default="{ row }">
            <el-button link type="primary" @click.stop="handleCopyNo(row.processNo)">
              {{ row.processNo }}
            </el-button>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="流程标题" min-width="200" show-overflow-tooltip />
        <el-table-column prop="type" label="流程类型" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getTypeColor(row.type)" size="small">{{ row.typeName }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="initiator" label="发起人" width="120" show-overflow-tooltip />
        <el-table-column prop="initiateTime" label="发起时间" width="160" sortable />
        <el-table-column prop="finishTime" label="办结时间" width="160" sortable />
        <el-table-column prop="archiveTime" label="归档时间" width="160" sortable />
        <el-table-column prop="result" label="审批结果" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getResultType(row.result)" size="small">{{ row.resultName }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" align="center" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click.stop="handleView(row)" icon="View">详情</el-button>
            <el-button link type="success" size="small" @click.stop="handleExportSingle(row)" icon="Download">导出</el-button>
            <el-button link type="warning" size="small" @click.stop="handlePrintSingle(row)" icon="Printer">打印</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
            v-model:current-page="pagination.page"
            v-model:page-size="pagination.pageSize"
            :total="pagination.total"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <!-- 详情弹窗 -->
    <el-dialog
        v-model="detailVisible"
        title="流程归档详情"
        width="90%"
        top="5vh"
        :close-on-click-modal="false"
    >
      <div class="detail-content" v-if="currentRow">
        <!-- 1. 流程基础信息 -->
        <el-card shadow="never" class="detail-card">
          <template #header>
            <div class="card-title">
              <el-icon><InfoFilled /></el-icon>
              <span>流程基础信息</span>
            </div>
          </template>
          <el-descriptions :column="3" border>
            <el-descriptions-item label="流程编号">{{ currentRow.processNo }}</el-descriptions-item>
            <el-descriptions-item label="流程标题">{{ currentRow.title }}</el-descriptions-item>
            <el-descriptions-item label="流程类型">{{ currentRow.typeName }}</el-descriptions-item>
            <el-descriptions-item label="发起人">{{ currentRow.initiator }}</el-descriptions-item>
            <el-descriptions-item label="发起时间">{{ currentRow.initiateTime }}</el-descriptions-item>
            <el-descriptions-item label="办结时间">{{ currentRow.finishTime }}</el-descriptions-item>
            <el-descriptions-item label="归档时间">{{ currentRow.archiveTime }}</el-descriptions-item>
            <el-descriptions-item label="归档方式">{{ currentRow.archiveTypeName }}</el-descriptions-item>
            <el-descriptions-item label="审批结果">{{ currentRow.resultName }}</el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- 2. 表单数据区 -->
        <el-card shadow="never" class="detail-card">
          <template #header>
            <div class="card-title">
              <el-icon><Document /></el-icon>
              <span>表单数据</span>
            </div>
          </template>
          <div class="form-data">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="请假类型">年假</el-descriptions-item>
              <el-descriptions-item label="请假天数">3天</el-descriptions-item>
              <el-descriptions-item label="开始时间">2026-04-15</el-descriptions-item>
              <el-descriptions-item label="结束时间">2026-04-17</el-descriptions-item>
              <el-descriptions-item label="请假事由" :span="2">个人原因请假，请批准。</el-descriptions-item>
            </el-descriptions>
          </div>
        </el-card>

        <!-- 3. 审批轨迹 -->
        <el-card shadow="never" class="detail-card">
          <template #header>
            <div class="card-title">
              <el-icon><List /></el-icon>
              <span>审批轨迹</span>
            </div>
          </template>
          <el-timeline>
            <el-timeline-item
                v-for="step in approvalSteps"
                :key="step.id"
                :timestamp="step.time"
                placement="top"
                :type="step.type"
            >
              <el-card>
                <div class="step-content">
                  <div class="step-header">
                    <span class="step-node">{{ step.node }}</span>
                    <el-tag :type="step.resultType" size="small">{{ step.result }}</el-tag>
                  </div>
                  <div class="step-info">
                    <span>审批人：{{ step.approver }}</span>
                    <span>岗位：{{ step.position }}</span>
                    <span>审批时间：{{ step.time }}</span>
                  </div>
                  <div class="step-opinion" v-if="step.opinion">
                    <span class="opinion-label">审批意见：</span>
                    {{ step.opinion }}
                  </div>
                </div>
              </el-card>
            </el-timeline-item>
          </el-timeline>
        </el-card>

        <!-- 4. 附件资料 -->
        <el-card shadow="never" class="detail-card">
          <template #header>
            <div class="card-title">
              <el-icon><Paperclip /></el-icon>
              <span>附件资料</span>
            </div>
          </template>
          <el-table :data="attachments" border size="small">
            <el-table-column prop="name" label="文件名称" min-width="200" />
            <el-table-column prop="size" label="文件大小" width="120" />
            <el-table-column prop="uploader" label="上传人" width="100" />
            <el-table-column prop="uploadTime" label="上传时间" width="160" />
            <el-table-column label="操作" width="120" align="center">
              <template #default="{ row }">
                <el-button link type="primary" size="small" @click="handlePreview(row)">预览</el-button>
                <el-button link type="success" size="small" @click="handleDownload(row)">下载</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>

        <!-- 5. 归档备注 -->
        <el-card shadow="never" class="detail-card" v-if="currentRow.remark">
          <template #header>
            <div class="card-title">
              <el-icon><Notebook /></el-icon>
              <span>归档备注</span>
            </div>
          </template>
          <div class="remark-content">{{ currentRow.remark }}</div>
        </el-card>
      </div>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  InfoFilled, Document, List, Paperclip, Notebook,
  Download, Printer, Refresh, Filter, Search, View
} from '@element-plus/icons-vue'

// 权限判断（实际项目应从后端获取）
const canViewDepartment = ref(true)
const canViewGlobal = ref(true)
const currentView = ref('my')

const loading = ref(false)
const showAdvanced = ref(false)
const detailVisible = ref(false)
const currentRow = ref(null)
const selectedRows = ref([])

const filterForm = reactive({
  type: '',
  timeRange: '',
  customTime: [],
  keyword: ''
})

const advancedForm = reactive({
  initiator: '',
  archiveTime: [],
  result: '',
  archiveType: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

const tableData = ref([
  {
    id: 1,
    processNo: 'PRC20260415001',
    title: '张三 - 年假申请',
    type: 'leave',
    typeName: '请假',
    initiator: '张三 - 技术部',
    initiateTime: '2026-04-10 09:00',
    finishTime: '2026-04-12 16:30',
    archiveTime: '2026-04-12 16:35',
    archiveType: 'auto',
    archiveTypeName: '系统自动归档',
    result: 'approved',
    resultName: '同意',
    remark: '流程正常办结，系统自动归档'
  },
  {
    id: 2,
    processNo: 'EXP20260415002',
    title: '李四 - 差旅报销',
    type: 'expense',
    typeName: '报销',
    initiator: '李四 - 销售部',
    initiateTime: '2026-04-08 14:00',
    finishTime: '2026-04-11 10:20',
    archiveTime: '2026-04-11 10:25',
    archiveType: 'auto',
    archiveTypeName: '系统自动归档',
    result: 'approved',
    resultName: '同意',
    remark: ''
  },
  {
    id: 3,
    processNo: 'PUR20260415003',
    title: '王五 - 设备采购申请',
    type: 'purchase',
    typeName: '采购',
    initiator: '王五 - 行政部',
    initiateTime: '2026-04-05 11:00',
    finishTime: '2026-04-09 15:00',
    archiveTime: '2026-04-09 15:10',
    archiveType: 'manual',
    archiveTypeName: '人工手动归档',
    result: 'approved',
    resultName: '同意',
    remark: '采购金额较大，财务审核后归档'
  },
  {
    id: 4,
    processNo: 'SL20260415004',
    title: '赵六 - 合同用章申请',
    type: 'seal',
    typeName: '用章',
    initiator: '赵六 - 法务部',
    initiateTime: '2026-04-03 09:30',
    finishTime: '2026-04-04 11:00',
    archiveTime: '2026-04-04 11:05',
    archiveType: 'auto',
    archiveTypeName: '系统自动归档',
    result: 'approved',
    resultName: '同意',
    remark: ''
  },
  {
    id: 5,
    processNo: 'PAY20260415005',
    title: '钱七 - 预付款申请',
    type: 'payment',
    typeName: '付款',
    initiator: '钱七 - 财务部',
    initiateTime: '2026-04-01 10:00',
    finishTime: '2026-04-03 16:00',
    archiveTime: '2026-04-03 16:05',
    archiveType: 'auto',
    archiveTypeName: '系统自动归档',
    result: 'approved',
    resultName: '同意',
    remark: ''
  }
])

const approvalSteps = ref([
  { id: 1, node: '提交申请', approver: '张三', position: '前端工程师', time: '2026-04-10 09:00', result: '已提交', resultType: 'success', type: 'success', opinion: '' },
  { id: 2, node: '部门经理审批', approver: '李四', position: '技术部经理', time: '2026-04-10 14:30', result: '同意', resultType: 'success', type: 'success', opinion: '同意，注意休息' },
  { id: 3, node: 'HR审批', approver: '王五', position: 'HR专员', time: '2026-04-11 09:15', result: '同意', resultType: 'success', type: 'success', opinion: '' },
  { id: 4, node: '归档', approver: '系统', position: '自动归档', time: '2026-04-12 16:35', result: '已归档', resultType: 'info', type: 'info', opinion: '流程正常办结，系统自动归档' }
])

const attachments = ref([
  { id: 1, name: '请假申请表.pdf', size: '256 KB', uploader: '张三', uploadTime: '2026-04-10 09:00' },
  { id: 2, name: '工作交接文档.docx', size: '1.2 MB', uploader: '张三', uploadTime: '2026-04-10 09:05' }
])

const getTypeColor = (type) => {
  const colors = {
    leave: 'primary',
    expense: 'success',
    travel: 'warning',
    seal: 'danger',
    purchase: 'info',
    payment: ''
  }
  return colors[type] || 'info'
}

const getResultType = (result) => {
  const types = {
    approved: 'success',
    rejected: 'warning',
    terminated: 'danger'
  }
  return types[result] || 'info'
}

const handleViewChange = () => {
  loadData()
}

const handleSearch = () => {
  pagination.page = 1
  loadData()
}

const handleAdvancedSearch = () => {
  pagination.page = 1
  loadData()
  ElMessage.success('高级筛选查询成功')
}

const handleReset = () => {
  filterForm.type = ''
  filterForm.timeRange = ''
  filterForm.customTime = []
  filterForm.keyword = ''
  advancedForm.initiator = ''
  advancedForm.archiveTime = []
  advancedForm.result = ''
  advancedForm.archiveType = ''
  handleSearch()
}

const handleRefresh = () => {
  loadData()
  ElMessage.success('刷新成功')
}

const loadData = () => {
  loading.value = true
  setTimeout(() => {
    pagination.total = tableData.value.length
    loading.value = false
  }, 300)
}

const handleSelectionChange = (selection) => {
  selectedRows.value = selection
}

const handleSizeChange = (size) => {
  pagination.pageSize = size
  loadData()
}

const handlePageChange = (page) => {
  pagination.page = page
  loadData()
}

const handleRowClick = (row) => {
  handleView(row)
}

const handleView = (row) => {
  currentRow.value = row
  detailVisible.value = true
}

const handleCopyNo = (no) => {
  navigator.clipboard.writeText(no)
  ElMessage.success('流程编号已复制')
}

const handleExport = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请选择要导出的流程')
    return
  }
  if (selectedRows.value.length > 50) {
    ElMessage.warning('单次最多导出50条')
    return
  }
  ElMessage.success('导出成功')
}

const handleExportSingle = (row) => {
  ElMessage.success('导出成功')
}

const handlePrint = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请选择要打印的流程')
    return
  }
  ElMessage.success('打印任务已提交')
}

const handlePrintSingle = (row) => {
  ElMessage.success('打印任务已提交')
}

const handlePreview = (file) => {
  ElMessage.info('在线预览功能开发中')
}

const handleDownload = (file) => {
  ElMessage.success('下载成功')
}

onMounted(() => {
  loadData()
})
</script>

<style lang="scss" scoped>
.archive-page {
  padding: 20px;
  background: #f5f7fa;
  min-height: calc(100vh - 60px);

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 16px;
    border-bottom: 1px solid #ebeef5;

    .header-left {
      flex: 1;

      :deep(.el-tabs__header) {
        margin: 0;
      }
    }

    .header-right {
      display: flex;
      gap: 8px;
    }
  }

  .filter-form {
    margin-bottom: 16px;

    :deep(.el-form-item) {
      margin-bottom: 12px;
    }
  }

  .advanced-filter {
    padding: 16px;
    background: #f9fafc;
    border-radius: 4px;
    margin-bottom: 16px;
  }

  .pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }

  .detail-content {
    max-height: calc(100vh - 200px);
    overflow-y: auto;

    .detail-card {
      margin-bottom: 16px;

      :deep(.el-card__header) {
        padding: 12px 20px;
        background: #fafafa;
      }

      .card-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 15px;
        font-weight: 600;
        color: #303133;
      }

      .step-content {
        .step-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;

          .step-node {
            font-weight: 600;
            font-size: 14px;
          }
        }

        .step-info {
          display: flex;
          gap: 20px;
          font-size: 13px;
          color: #606266;
          margin-bottom: 8px;
        }

        .step-opinion {
          padding: 8px 12px;
          background: #f5f7fa;
          border-radius: 4px;
          font-size: 13px;
          color: #606266;

          .opinion-label {
            font-weight: 600;
          }
        }
      }

      .remark-content {
        padding: 12px;
        background: #fff9e6;
        border-left: 3px solid #e6a23c;
        border-radius: 4px;
        font-size: 14px;
        color: #606266;
        line-height: 1.8;
      }
    }
  }
}
</style>
