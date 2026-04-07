<template>
  <div class="handle-query-container">
    <div class="page-layout">
      <!-- 左侧审批流树 -->
      <div class="tree-section">
        <el-card class="tree-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <el-icon><Folder /></el-icon>
              <span>审批流程分类</span>
            </div>
          </template>
          <div class="tree-content">
            <el-tree
                ref="processTreeRef"
                :data="processTreeData"
                :props="treeProps"
                node-key="id"
                default-expand-all
                :expand-on-click-node="false"
                @node-click="handleNodeClick"
                class="process-tree"
                :highlight-current="true"
            >
              <template #default="{ node, data }">
                <span class="tree-node">
                  <el-icon v-if="data.icon">
                    <component :is="data.icon" />
                  </el-icon>
                  <span class="tree-node-label">{{ node.label }}</span>
                  <span v-if="data.count" class="tree-node-count">{{ data.count }}</span>
                </span>
              </template>
            </el-tree>
          </div>
        </el-card>
      </div>

      <!-- 右侧内容区 -->
      <div class="main-section">
        <!-- 筛选区域 -->
        <el-card class="filter-card" shadow="hover">
          <div class="filter-row">
            <div class="filter-item">
              <el-input
                  v-model="filterForm.id"
                  placeholder="请输入单据号"
                  style="width: 220px"
                  clearable
                  @keydown.enter.prevent="handleFilter"
              >
                <template #prefix>
                  <el-icon><Ticket /></el-icon>
                </template>
              </el-input>
              <el-button type="primary" @click="handleFilter" icon="Search">查询</el-button>
              <el-button link type="primary" @click="toggleExpand" icon="ArrowDown">
                {{ expanded ? '收起' : '展开' }}
              </el-button>
            </div>
          </div>

          <el-collapse-transition>
            <div v-show="expanded" class="filter-expand">
              <el-divider border-style="dashed" />
              <el-form :inline="true" :model="filterForm" size="default">
                <el-form-item label="发起人">
                  <el-input
                      v-model="filterForm.applicant"
                      placeholder="请输入发起人"
                      style="width: 200px"
                      clearable
                  >
                    <template #prefix>
                      <el-icon><User /></el-icon>
                    </template>
                  </el-input>
                </el-form-item>
                <el-form-item label="发起部门">
                  <el-input
                      v-model="filterForm.department"
                      placeholder="请输入发起部门"
                      style="width: 200px"
                      clearable
                  >
                    <template #prefix>
                      <el-icon><OfficeBuilding /></el-icon>
                    </template>
                  </el-input>
                </el-form-item>
                <el-form-item label="日期范围">
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
                  <el-button @click="handleResetFilter" icon="Refresh">重置</el-button>
                </el-form-item>
              </el-form>
            </div>
          </el-collapse-transition>
        </el-card>

        <!-- 标签页切换区 -->
        <el-card class="tabs-card" shadow="hover">
          <el-tabs v-model="activeTab" @tab-change="handleTabChange">
            <el-tab-pane label="全部" name="all" />
            <el-tab-pane label="待审批" name="pending" />
            <el-tab-pane label="审批中" name="processing" />
            <el-tab-pane label="已通过" name="approved" />
            <el-tab-pane label="已驳回" name="rejected" />
            <el-tab-pane label="已终止" name="terminated" />
            <el-tab-pane label="抄送我的" name="cced" />
          </el-tabs>
        </el-card>

        <!-- 批量操作栏 -->
        <el-card class="batch-operation-card" shadow="hover">
          <div class="batch-operation-content">
            <span class="selected-count">
              <el-icon><Check /></el-icon>
              已选择 {{ selectedRows.length }} 项
            </span>
            <div class="batch-buttons">
              <el-button type="success" size="small" @click="handleBatchApprove" icon="CircleCheck">
                批量通过
              </el-button>
              <el-button type="danger" size="small" @click="handleBatchReject" icon="CircleClose">
                批量驳回
              </el-button>
              <el-button type="warning" size="small" @click="handleBatchTransfer" icon="Switch">
                批量转办
              </el-button>
              <el-button type="primary" size="small" @click="handleBatchUrge" icon="Bell">
                批量催办
              </el-button>
              <el-button type="info" size="small" @click="handleBatchPrint" icon="Printer">
                批量打印
              </el-button>
              <el-button type="primary" size="small" @click="handleBatchExport" icon="Download">
                批量导出
              </el-button>
              <el-button type="danger" size="small" @click="handleBatchTerminate" icon="Close">
                批量终止
              </el-button>
              <el-button size="small" @click="clearSelection" icon="Delete">
                取消选择
              </el-button>
            </div>
          </div>
        </el-card>

        <!-- 数据列表区 -->
        <el-card class="table-card" shadow="hover">
          <el-table
              ref="tableRef"
              :data="filteredTableData"
              style="width: 100%"
              border
              v-loading="loading"
              @selection-change="handleSelectionChange"
              :row-class-name="tableRowClassName"
              :cell-style="{ padding: '10px 0' }"
              :header-cell-style="{ background: '#fafafa', color: '#333', fontWeight: '600' }"
          >
            <el-table-column type="selection" width="45" />
            <el-table-column prop="id" label="单据号" width="180" sortable />
            <el-table-column prop="processName" label="流程名称" min-width="220" show-overflow-tooltip />
            <el-table-column prop="initiator" label="发起人" width="120" />
            <el-table-column prop="department" label="发起部门" width="150" />
            <el-table-column prop="currentNode" label="当前节点" width="150" show-overflow-tooltip />
            <el-table-column prop="currentHandler" label="当前审批人" width="130" />
            <el-table-column prop="applyTime" label="发起时间" width="170" sortable />
            <el-table-column prop="status" label="状态" width="110">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)" size="small" effect="light">
                  {{ getStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="300" fixed="right" align="center">
              <template #default="{ row }">
                <el-button
                    size="small"
                    type="primary"
                    @click="handleView(row)"
                    icon="View"
                    plain
                >
                  查看
                </el-button>
                <el-button
                    size="small"
                    type="warning"
                    @click="handleEdit(row)"
                    icon="Edit"
                    plain
                >
                  编辑
                </el-button>
                <el-dropdown trigger="click" @command="(command) => handleMoreCommand(command, row)">
                  <el-button size="small" icon="More" plain>
                    更多
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="approve" :icon="CircleCheck" style="color: #67C23A">通过</el-dropdown-item>
                      <el-dropdown-item command="reject" :icon="CircleClose" style="color: #F56C6C">驳回</el-dropdown-item>
                      <el-dropdown-item command="urge" :icon="Bell" divided>催办</el-dropdown-item>
                      <el-dropdown-item command="transfer" :icon="Switch">转办</el-dropdown-item>
                      <el-dropdown-item command="print" :icon="Printer">打印</el-dropdown-item>
                      <el-dropdown-item command="terminate" :icon="Close" divided style="color: #F56C6C">终止</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
          <div class="table-footer">
            <el-pagination
                v-model:current-page="currentPage"
                v-model:page-size="pageSize"
                :total="total"
                :page-sizes="[10, 20, 50, 100]"
                layout="total, sizes, prev, pager, next, jumper"
            />
          </div>
        </el-card>
      </div>
    </div>

    <!-- 查看详情弹框 -->
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

      <DetailComponent
          v-if="viewDialogVisible"
          :approval-id="currentViewId"
          :embedded-in-dialog="true"
          :edit-mode="editMode"
          @close="handleDialogClose"
      />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search, Refresh, View, Close, Delete, More,
  User, OfficeBuilding, Ticket, ArrowDown, Bell, Switch,
  Printer, CircleCheck, CircleClose, Grid, Money, Document, Monitor,
  Star
} from '@element-plus/icons-vue'
import DetailComponent from '../approval/Detail.vue'

const loading = ref(false)
const viewDialogVisible = ref(false)
const editMode = ref(false)
const currentViewId = ref('')
const currentRow = ref(null)
const selectedRows = ref([])
const expanded = ref(false)
const activeTab = ref('all')
const selectedProcessType = ref('all')
const currentCategoryName = ref('全部流程')

// 筛选表单
const filterForm = reactive({
  id: '',
  dateRange: [],
  applicant: '',
  department: ''
})

// 切换展开/收起
const toggleExpand = () => {
  expanded.value = !expanded.value
}

// 树形数据
const processTreeData = ref([
  {
    id: 'all',
    label: '全部流程',
    icon: Grid,
    count: 45,
    children: []
  },
  {
    id: 'admin',
    label: '行政',
    icon: OfficeBuilding,
    count: 12,
    children: [
      { id: 'admin-leave', label: '请假审批', count: 5 },
      { id: 'admin-seal', label: '用印审批', count: 4 },
      { id: 'admin-vehicle', label: '用车申请', count: 3 }
    ]
  },
  {
    id: 'management',
    label: '综合管理',
    icon: Star,
    count: 10,
    children: [
      { id: 'mgmt-meeting', label: '会议申请', count: 6 },
      { id: 'mgmt-event', label: '活动申请', count: 4 }
    ]
  },
  {
    id: 'finance',
    label: '财务',
    icon: Money,
    count: 15,
    children: [
      { id: 'fin-expense', label: '费用报销', count: 10 },
      { id: 'fin-payment', label: '付款申请', count: 5 }
    ]
  },
  {
    id: 'tech',
    label: '金科与数据',
    icon: Monitor,
    count: 8,
    children: [
      { id: 'tech-data', label: '数据修改', count: 4 },
      { id: 'tech-system', label: '系统权限', count: 4 }
    ]
  }
])

const treeProps = {
  children: 'children',
  label: 'label'
}

// 表格数据
const tableData = ref([
  {
    id: 'LC20240115001',
    processName: '请假审批流程',
    initiator: '张三',
    department: '信息技术部',
    currentNode: '部门经理审批',
    currentHandler: '李四',
    applyTime: '2024-01-15 09:30',
    status: 'processing',
    processType: 'admin-leave'
  },
  {
    id: 'LC20240114002',
    processName: '会议申请流程',
    initiator: '李明',
    department: '市场部',
    currentNode: '综合部确认',
    currentHandler: '王五',
    applyTime: '2024-01-14 10:20',
    status: 'pending',
    processType: 'mgmt-meeting'
  },
  {
    id: 'LC20240113003',
    processName: '用印审批流程',
    initiator: '王五',
    department: '行政部',
    currentNode: '分管领导审批',
    currentHandler: '赵六',
    applyTime: '2024-01-13 14:00',
    status: 'approved',
    processType: 'admin-seal'
  },
  {
    id: 'LC20240112004',
    processName: '费用报销流程',
    initiator: '刘芳',
    department: '财务部',
    currentNode: '财务审核',
    currentHandler: '孙七',
    applyTime: '2024-01-12 11:15',
    status: 'rejected',
    processType: 'fin-expense'
  },
  {
    id: 'LC20240111005',
    processName: '用车申请流程',
    initiator: '陈伟',
    department: '销售部',
    currentNode: '车辆调度',
    currentHandler: '-',
    applyTime: '2024-01-11 16:30',
    status: 'terminated',
    processType: 'admin-vehicle'
  },
  {
    id: 'LC20240110006',
    processName: '数据修改流程',
    initiator: '杨洋',
    department: '金科与数据部',
    currentNode: '-',
    currentHandler: '-',
    applyTime: '2024-01-10 09:00',
    status: 'cced',
    processType: 'tech-data'
  }
])

const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(tableData.value.length)

// 过滤后的表格数据
const filteredTableData = computed(() => {
  let result = [...tableData.value]

  // 标签页过滤
  if (activeTab.value !== 'all') {
    result = result.filter(item => item.status === activeTab.value)
  }

  // 流程类型过滤（左侧树选择）
  if (selectedProcessType.value && selectedProcessType.value !== 'all') {
    result = result.filter(item => item.processType === selectedProcessType.value)
  }

  // 单据号过滤
  if (filterForm.id) {
    result = result.filter(item => item.id.includes(filterForm.id))
  }

  // 发起人过滤
  if (filterForm.applicant) {
    result = result.filter(item => item.initiator.includes(filterForm.applicant))
  }

  // 发起部门过滤
  if (filterForm.department) {
    result = result.filter(item => item.department.includes(filterForm.department))
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
    'pending': 'warning',
    'processing': 'warning',
    'approved': 'success',
    'rejected': 'danger',
    'terminated': 'info',
    'cced': 'info'
  }
  return typeMap[status] || 'info'
}

const getStatusText = (status) => {
  const textMap = {
    'pending': '待审批',
    'processing': '审批中',
    'approved': '已通过',
    'rejected': '已驳回',
    'terminated': '已终止',
    'cced': '抄送我的'
  }
  return textMap[status] || '未知'
}

// 表格行样式
const tableRowClassName = ({ row }) => {
  if (row.status === 'terminated') {
    return 'terminated-row'
  }
  return ''
}

// 树节点点击
const handleNodeClick = (data) => {
  selectedProcessType.value = data.id
  currentCategoryName.value = data.label
  console.log('选中节点:', data)
}

// 标签页切换
const handleTabChange = (tab) => {
  console.log('切换到标签页:', tab)
}

// 筛选
const handleFilter = () => {
  ElMessage.success('筛选完成')
}

const handleResetFilter = () => {
  filterForm.status = ''
  filterForm.dateRange = []
  filterForm.applicant = ''
  filterForm.department = ''
  filterForm.id = ''
  activeTab.value = 'all'
  selectedProcessType.value = 'all'
  currentCategoryName.value = '全部流程'
}

// 表格引用
const tableRef = ref(null)

// 选择变化
const handleSelectionChange = (selection) => {
  selectedRows.value = selection
}

const clearSelection = () => {
  // 调用表格的 clearSelection 方法清除复选框选中状态
  tableRef.value?.clearSelection()
  selectedRows.value = []
}

// 关闭对话框回调
const handleDialogClose = () => {
  viewDialogVisible.value = false
}

// 更多操作
const handleMoreCommand = (command, row) => {
  if (command === 'approve') {
    ElMessageBox.confirm('确认通过该流程吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      ElMessage.success('流程已通过')
    }).catch(() => {})
  } else if (command === 'reject') {
    ElMessageBox.prompt('请输入驳回原因', '驳回', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputPattern: /.+/,
      inputErrorMessage: '请填写原因',
      type: 'warning'
    }).then(({ value }) => {
      ElMessage.success('流程已驳回')
    }).catch(() => {})
  } else if (command === 'urge') {
    ElMessage.success('催办成功')
  } else if (command === 'transfer') {
    ElMessageBox.prompt('请输入转办原因', '转办', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputPattern: /.+/,
      inputErrorMessage: '请填写原因',
      type: 'warning'
    }).then(({ value }) => {
      ElMessage.success('转办成功')
    }).catch(() => {})
  } else if (command === 'print') {
    ElMessage.success('开始打印')
  } else if (command === 'terminate') {
    ElMessageBox.confirm('确认终止该流程吗？此操作不可恢复！', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'error'
    }).then(() => {
      row.status = 'terminated'
      ElMessage.success('流程已终止')
    }).catch(() => {})
  }
}

// 批量操作
const handleBatchApprove = () => {
  ElMessageBox.confirm(`确认批量通过 ${selectedRows.value.length} 个流程吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('批量通过成功')
    clearSelection()
  }).catch(() => {})
}

const handleBatchReject = () => {
  ElMessageBox.confirm(`确认批量驳回 ${selectedRows.value.length} 个流程吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('批量驳回成功')
    clearSelection()
  }).catch(() => {})
}

const handleBatchTransfer = () => {
  ElMessageBox.prompt('请输入批量转办原因', '批量转办', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPattern: /.+/,
    inputErrorMessage: '请填写原因',
    type: 'warning'
  }).then(({ value }) => {
    ElMessage.success('批量转办成功')
    clearSelection()
  }).catch(() => {})
}

const handleBatchUrge = () => {
  ElMessageBox.confirm(`确认向 ${selectedRows.value.length} 个流程的当前审批人发送催办通知吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('批量催办成功')
    clearSelection()
  }).catch(() => {})
}

const handleBatchPrint = () => {
  ElMessage.success(`开始打印 ${selectedRows.value.length} 个流程`)
  clearSelection()
}

const handleBatchExport = () => {
  ElMessage.success(`开始导出 ${selectedRows.value.length} 个流程`)
  clearSelection()
}

const handleBatchTerminate = () => {
  ElMessageBox.confirm(`确认批量终止 ${selectedRows.value.length} 个流程吗？此操作不可恢复！`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'error'
  }).then(() => {
    ElMessage.success('批量终止成功')
    clearSelection()
  }).catch(() => {})
}

// 查看详情
const handleView = (row) => {
  currentViewId.value = row.id.toString()
  editMode.value = false
  viewDialogVisible.value = true
}

// 编辑
const handleEdit = (row) => {
  currentViewId.value = row.id.toString()
  editMode.value = true
  viewDialogVisible.value = true
}

onMounted(() => {
  // 加载数据
})
</script>

<style scoped lang="scss">
.handle-query-container {
  padding: 0;
  background: #f5f7fa;
  height: 100vh;
  overflow: hidden;

  .page-layout {
    display: flex;
    height: calc(100vh - 60px);
    padding: 16px;
    gap: 16px;
    overflow: hidden;
  }

  .tree-section {
    width: 260px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;

    .tree-card {
      height: 100%;
      border-radius: 8px;
      display: flex;
      flex-direction: column;

      :deep(.el-card__header) {
        padding: 14px 16px;
        border-bottom: 1px solid #f0f0f0;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: #fff;

        .card-header {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 15px;
          font-weight: 600;

          .el-icon {
            font-size: 18px;
          }
        }
      }

      .tree-content {
        flex: 1;
        overflow-y: auto;
        overflow-x: hidden;
        padding: 8px 0;

        &::-webkit-scrollbar {
          width: 6px;
        }

        &::-webkit-scrollbar-track {
          background: #f1f1f1;
        }

        &::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 3px;

          &:hover {
            background: #a8a8a8;
          }
        }
      }

      .process-tree {
        .el-tree-node {
          &:hover {
            background-color: #f5f7fa;
          }

          &.is-current > .el-tree-node__content {
            background: linear-gradient(90deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
            color: #667eea;
            font-weight: 600;
          }
        }

        .tree-node {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          padding: 10px 16px;
          transition: all 0.2s;

          .el-icon {
            color: #667eea;
            flex-shrink: 0;
            font-size: 16px;
          }

          .tree-node-label {
            flex: 1;
            font-size: 14px;
            color: #333;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .tree-node-count {
            font-size: 12px;
            color: #909399;
            background: #f4f4f5;
            padding: 2px 8px;
            border-radius: 10px;
            min-width: 24px;
            text-align: center;
            flex-shrink: 0;
          }
        }

        .el-tree-node__content {
          height: 40px;
          border-radius: 4px;
          margin: 2px 8px;
        }

        .el-tree-node__expand-icon {
          color: #c0c4cc;
          font-size: 14px;

          &.is-leaf {
            color: transparent;
          }
        }
      }
    }
  }

  .main-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 16px;
    overflow: hidden;
    min-width: 0;
  }

  .filter-card {
    border-radius: 8px;
    flex-shrink: 0;

    :deep(.el-card__body) {
      padding: 16px;
    }

    .filter-row {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .filter-item {
        display: flex;
        align-items: center;
        gap: 12px;
      }
    }

    .filter-expand {
      padding-top: 12px;

      :deep(.el-form) {
        flex-wrap: wrap;
      }

      :deep(.el-form-item) {
        margin-bottom: 12px;
      }
    }
  }

  .tabs-card {
    border-radius: 8px;
    flex-shrink: 0;

    :deep(.el-card__body) {
      padding: 0 16px;
    }

    :deep(.el-tabs__nav-wrap::after) {
      height: 1px;
    }

    :deep(.el-tabs__item) {
      font-size: 14px;
      padding: 0 20px;
    }

    :deep(.el-tabs__item.is-active) {
      font-weight: 600;
    }
  }

  .batch-operation-card {
    border-radius: 8px;
    flex-shrink: 0;
    background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
    border: 1px solid #bae6fd;

    :deep(.el-card__body) {
      padding: 12px 16px;
    }

    .batch-operation-content {
      display: flex;
      align-items: center;
      gap: 16px;
      flex-wrap: wrap;

      .selected-count {
        font-size: 14px;
        font-weight: 600;
        color: #0369a1;
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .batch-buttons {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        margin-left: auto;
      }
    }
  }

  .table-card {
    border-radius: 8px;
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    :deep(.el-card__body) {
      padding: 0;
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .el-table {
      flex: 1;

      :deep(.el-table__body-wrapper) {
        overflow-y: auto;

        &::-webkit-scrollbar {
          width: 6px;
        }

        &::-webkit-scrollbar-track {
          background: #f1f1f1;
        }

        &::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 3px;

          &:hover {
            background: #a8a8a8;
          }
        }
      }
    }

    .table-footer {
      padding: 16px 20px;
      display: flex;
      justify-content: flex-end;
      border-top: 1px solid #ebeef5;
      flex-shrink: 0;
      background: #fafafa;
    }
  }
}

// 表格行样式
.terminated-row {
  background-color: #fafafa !important;
}

.detail-content {
  padding: 10px 0;
}
</style>

