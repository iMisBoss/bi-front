<template>
  <div class="business-object-container">
    <div class="page-layout">
      <!-- 左侧目录树 -->
      <div class="tree-section">
        <el-card class="tree-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <el-icon><Folder /></el-icon>
              <span>业务域</span>
              <el-dropdown trigger="click" class="header-dropdown">
                <el-button size="small" icon="Plus" />
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click="handleAddDomain">新建业务域</el-dropdown-item>
                    <el-dropdown-item divided @click="handleModifyDomain">修改业务域</el-dropdown-item>
                    <el-dropdown-item @click="handleDeleteDomain" style="color: #F56C6C">删除业务域</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </template>
          <div class="tree-content">
            <el-tree
                ref="domainTreeRef"
                :data="domainTreeData"
                :props="treeProps"
                node-key="id"
                default-expand-all
                :expand-on-click-node="false"
                @node-click="handleDomainClick"
                class="domain-tree"
                :highlight-current="true"
            >
              <template #default="{ node, data }">
                <div class="tree-node" @contextmenu.prevent="handleContextMenu($event, data)">
                  <el-icon v-if="data.icon">
                    <component :is="data.icon" />
                  </el-icon>
                  <span class="tree-node-label">{{ node.label }}</span>
                  <span v-if="data.count" class="tree-node-count">{{ data.count }}</span>
                </div>
              </template>
            </el-tree>
          </div>
        </el-card>
      </div>

      <!-- 右侧内容区 -->
      <div class="main-section">
        <!-- 顶部操作栏 -->
        <el-card class="toolbar-card" shadow="hover">
          <div class="toolbar-content">
            <div class="toolbar-left">
              <el-button type="primary" @click="handleCreate" icon="Plus" class="gradient-btn-primary">新建业务对象</el-button>
              <el-button @click="handleImport" icon="Upload" class="gradient-btn-blue">导入业务对象</el-button>
              <el-button @click="handleExportSelected" icon="Download" class="gradient-btn-orange">导出选中</el-button>
              <el-button type="success" @click="handleBatchPublish" icon="CircleCheck">批量发布</el-button>
              <el-button type="danger" @click="handleBatchDelete" icon="Delete">批量删除</el-button>
              <el-button @click="handleConfig" icon="Setting" class="gradient-btn-gray">全局配置</el-button>
            </div>
            <div class="toolbar-right">
              <el-input
                  v-model="searchQuery"
                  placeholder="搜索名称/表名/备注"
                  clearable
                  @keydown.enter.prevent="handleSearch"
                  class="search-input"
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
              <el-button type="primary" @click="handleSearch" icon="Search">搜索</el-button>
            </div>
          </div>
        </el-card>

        <!-- 筛选栏 -->
        <el-card class="filter-card" shadow="hover">
          <el-form :inline="true" :model="filterForm" size="default" class="filter-form">
            <el-form-item label="状态">
              <el-select v-model="filterForm.status" placeholder="全部状态" clearable class="filter-select">
                <el-option label="草稿" value="draft" />
                <el-option label="已发布" value="published" />
                <el-option label="已停用" value="disabled" />
                <el-option label="已归档" value="archived" />
              </el-select>
            </el-form-item>
            <el-form-item label="创建时间">
              <el-date-picker
                  v-model="filterForm.dateRange"
                  type="daterange"
                  range-separator="~"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  value-format="YYYY-MM-DD"
                  class="filter-date"
              />
            </el-form-item>
            <el-form-item class="filter-actions">
              <el-button type="primary" @click="handleFilter" icon="Search">查询</el-button>
              <el-button @click="handleResetFilter" icon="Refresh">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <!-- 数据列表 -->
        <el-card class="table-card" shadow="hover">
          <el-table
              ref="tableRef"
              :data="tableData"              style="width: 100%"
              border
              v-loading="loading"
              @selection-change="handleSelectionChange"
              :row-class-name="tableRowClassName"
              :cell-style="{ padding: '10px 0' }"
              :header-cell-style="{ background: '#fafafa', color: '#333', fontWeight: '600' }"
          >
            <el-table-column type="selection" width="50" />
            <el-table-column prop="name" label="对象名称" min-width="120" show-overflow-tooltip />
            <el-table-column prop="tableName" label="数据库表名" min-width="180" show-overflow-tooltip />
            <el-table-column prop="domain" label="业务域" min-width="100" />
            <el-table-column prop="status" label="状态" min-width="90">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)" size="small" effect="light">
                  {{ getStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="formCount" label="关联表单" min-width="100" align="center">
              <template #default="{ row }">
                <el-link type="primary" @click="handleViewForms(row)" :underline="false">
                  {{ row.formCount }}
                </el-link>
              </template>
            </el-table-column>
            <el-table-column prop="processCount" label="关联流程" min-width="100" align="center">
              <template #default="{ row }">
                <el-link type="primary" @click="handleViewProcesses(row)" :underline="false">
                  {{ row.processCount }}
                </el-link>
              </template>
            </el-table-column>
            <el-table-column prop="creator" label="创建人" min-width="100" />
            <el-table-column prop="createTime" label="创建时间" min-width="160" sortable />
            <el-table-column label="操作" min-width="400" fixed="right" align="center" header-align="center">
              <template #default="{ row }">
                <div class="action-buttons">
                  <!-- 编辑按钮：草稿和已停用显示 -->
                  <el-button
                      v-if="row.status === 'draft' || row.status === 'disabled'"
                      size="small"
                      type="primary"
                      @click="handleEdit(row)"
                      icon="Edit"
                      plain
                      class="action-btn"
                  >
                    编辑
                  </el-button>

                  <!-- 编辑新版本按钮：仅已发布显示 -->
                  <el-button
                      v-if="row.status === 'published'"
                      size="small"
                      type="primary"
                      @click="handleEditNewVersion(row)"
                      icon="Edit"
                      plain
                      class="action-btn"
                  >
                    编辑
                  </el-button>

                  <!-- 发布按钮：仅草稿显示 -->
                  <el-button
                      v-if="row.status === 'draft'"
                      size="small"
                      type="success"
                      @click="handlePublish(row)"
                      icon="CircleCheck"
                      plain
                      class="action-btn"
                  >
                    发布
                  </el-button>

                  <!-- 停用按钮：仅已发布显示 -->
                  <el-button
                      v-if="row.status === 'published'"
                      size="small"
                      type="primary"
                      @click="handleDisable(row)"
                      icon="CircleClose"
                      plain
                      class="action-btn"
                  >
                    停用
                  </el-button>

                  <!-- 启用按钮：仅已停用显示 -->
                  <el-button
                      v-if="row.status === 'disabled'"
                      size="small"
                      type="success"
                      @click="handleEnable(row)"
                      icon="CircleCheck"
                      class="action-btn"
                  >
                    启用
                  </el-button>

                  <!-- 预览按钮：所有状态都显示 -->
                  <el-button
                      size="small"
                      type="info"
                      @click="handlePreview(row)"
                      icon="View"
                      plain
                      class="action-btn"
                  >
                    预览
                  </el-button>

                  <!-- 更多菜单 -->
                  <el-dropdown trigger="click" @command="(cmd) => handleMoreCommand(cmd, row)">
                    <el-button size="small" plain icon="More" class="action-btn">更多</el-button>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <!-- SQL按钮：已归档隐藏 -->
                        <el-dropdown-item
                            v-if="row.status !== 'archived'"
                            :command="'sql'"
                            icon="Document"
                        >
                          SQL{{ row.status === 'published' ? '(查看)' : '' }}
                        </el-dropdown-item>

                        <!-- 依赖按钮：已归档隐藏 -->
                        <el-dropdown-item
                            v-if="row.status !== 'archived'"
                            :command="'dependency'"
                            icon="Connection"
                        >
                          依赖{{ row.status === 'published' ? '(查看)' : '' }}
                        </el-dropdown-item>

                        <!-- 复制按钮：所有状态都显示 -->
                        <el-dropdown-item
                            :command="'copy'"
                            icon="DocumentCopy"
                        >
                          复制
                        </el-dropdown-item>

                        <!-- 删除按钮：仅草稿显示 -->
                        <el-dropdown-item
                            v-if="row.status === 'draft'"
                            divided
                            :command="'delete'"
                            icon="Delete"
                            class="danger-item"
                        >
                          删除
                        </el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </div>
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

    <!-- 右键菜单 -->
    <div
        v-if="contextMenuVisible"
        class="context-menu"
        :style="{ left: contextMenuX + 'px', top: contextMenuY + 'px' }"
        @click.stop="closeContextMenu"
    >
      <el-dropdown
          ref="contextDropdown"
          trigger="click"
          @command="handleContextMenuCommand"
      >
        <el-dropdown-menu>
          <el-dropdown-item command="add">新建业务对象</el-dropdown-item>
          <el-dropdown-item command="rename">重命名业务域</el-dropdown-item>
          <el-dropdown-item command="delete" divided>删除空业务域</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
    <!-- 新建业务域弹窗 -->
    <AddDomainDialog
        v-model="addDomainDialogVisible"
        :domain-tree-data="domainTreeData"
        :edit-data="currentDomain"
        @confirm="handleAddDomainConfirm"
    />

    <!-- 导入业务对象弹窗 -->
    <ImportDialog
        v-model="importDialogVisible"
        @confirm="handleImportConfirm"
    />

    <!-- 导出业务对象弹窗 -->
    <ExportDialog
        v-model="exportDialogVisible"
        :selected-rows="selectedRows"
        @confirm="handleExportConfirm"
    />

    <!-- 新建业务对象弹窗 -->
    <CreateDialog
        v-model="createDialogVisible"
        @confirm="handleCreateConfirm"
    />

    <!-- 查看依赖弹窗 -->
    <DependencyDialog
        v-model="dependencyDialogVisible"
        :data="currentRow"
    />

    <!-- 批量发布弹窗 -->
    <BatchPublishDialog
        v-model="batchPublishDialogVisible"
        :selected-rows="selectedRows"
        @confirm="handleBatchPublishConfirm"
    />

    <!-- 删除确认弹窗 -->
    <DeleteConfirmDialog
        v-model="deleteConfirmDialogVisible"
        :selected-rows="selectedRows"
        :show-list="selectedRows.length > 1"
        @confirm="handleBatchDeleteConfirm"
    />
  </div>

  <!-- 全局配置弹窗 -->
  <ConfigDialog
      v-model="configDialogVisible"
      @confirm="handleConfigConfirm"
  />
  <!-- 编辑弹窗 -->
  <EditDialog
      v-model="editDialogVisible"
      :data="currentRow"
      :is-version-edit="currentRow?.status === 'published'"
      @confirm="handleEditConfirm"
  />

  <!-- 停用确认弹窗 -->
  <DisableConfirmDialog
      v-model="disableDialogVisible"
      :data="currentRow"
      @confirm="handleDisableConfirm"
  />

  <!-- 启用确认弹窗 -->
  <EnableConfirmDialog
      v-model="enableDialogVisible"
      :data="currentRow"
      @confirm="handleEnableConfirm"
      @edit="handleGoEdit"
  />
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search, Plus, Upload, Download, Setting, Delete, Edit, View,
  CircleCheck, CircleClose, Document, Connection, DocumentCopy, Folder, Refresh
} from '@element-plus/icons-vue'
import CreateDialog from './components/CreateDialog.vue'
import DependencyDialog from './components/DependencyDialog.vue'
import BatchPublishDialog from './components/BatchPublishDialog.vue'
import DeleteConfirmDialog from './components/DeleteConfirmDialog.vue'
import AddDomainDialog from './components/AddDomainDialog.vue'
import ImportDialog from './components/ImportDialog.vue'
import ExportDialog from './components/ExportDialog.vue'
import ConfigDialog from './components/ConfigDialog.vue'
import EditDialog from './components/EditDialog.vue'
import DisableConfirmDialog from './components/DisableConfirmDialog.vue'
import EnableConfirmDialog from './components/EnableConfirmDialog.vue'

const loading = ref(false)
const tableRef = ref(null)
const domainTreeRef = ref(null)
const contextDropdown = ref(null)

// 搜索和筛选
const searchQuery = ref('')
const selectedRows = ref([])
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)

// 弹窗控制
const createDialogVisible = ref(false)
const dependencyDialogVisible = ref(false)
const batchPublishDialogVisible = ref(false)
const deleteConfirmDialogVisible = ref(false)
const addDomainDialogVisible = ref(false)
const importDialogVisible = ref(false)
const exportDialogVisible = ref(false)
const configDialogVisible = ref(false)
const editDialogVisible = ref(false)
const disableDialogVisible = ref(false)
const enableDialogVisible = ref(false)
const currentRow = ref(null)
// 筛选表单
const filterForm = reactive({
  status: '',
  dateRange: []
})

// 树形数据
const domainTreeData = ref([
  {
    id: 'all',
    label: '全部',
    icon: Folder,
    count: 45,
    children: [],
    parentId: null,
    description: ''
  },
  {
    id: 'hr',
    label: '人事类',
    icon: Folder,
    count: 12,
    children: [],
    parentId: null,
    description: '人事相关业务的分类'
  },
  {
    id: 'finance',
    label: '财务类',
    icon: Folder,
    count: 15,
    children: [],
    parentId: null,
    description: '财务相关业务的分类'
  },
  {
    id: 'admin',
    label: '行政类',
    icon: Folder,
    count: 10,
    children: [],
    parentId: null,
    description: '行政相关业务的分类'
  },
  {
    id: 'risk',
    label: '风控类',
    icon: Folder,
    count: 8,
    children: [],
    parentId: null,
    description: '风控相关业务的分类'
  },
  {
    id: 'loan',
    label: '信贷类',
    icon: Folder,
    count: 6,
    children: [],
    parentId: null,
    description: '信贷相关业务的分类'
  }
])

const treeProps = {
  children: 'children',
  label: 'label'
}

// 当前选中的业务域
const currentDomain = ref(null)

// 表格数据
const tableData = ref([
  {
    id: 1,
    name: '请假申请',
    tableName: 'biz_leave_application',
    domain: '人事类',
    status: 'published',
    formCount: 3,
    processCount: 2,
    creator: '张三',
    createTime: '2026-01-15 09:30'
  },
  {
    id: 2,
    name: '费用报销',
    tableName: 'biz_expense_reimbursement',
    domain: '财务类',
    status: 'published',
    formCount: 5,
    processCount: 3,
    creator: '李四',
    createTime: '2026-01-14 10:20'
  },
  {
    id: 3,
    name: '会议申请',
    tableName: 'biz_meeting_application',
    domain: '行政类',
    status: 'draft',
    formCount: 1,
    processCount: 0,
    creator: '王五',
    createTime: '2026-01-13 14:00'
  },
  {
    id: 4,
    name: '合同审批',
    tableName: 'biz_contract_approval',
    domain: '风控类',
    status: 'disabled',
    formCount: 2,
    processCount: 1,
    creator: '赵六',
    createTime: '2026-01-12 11:15'
  },
  {
    id: 5,
    name: '贷款申请',
    tableName: 'biz_loan_application',
    domain: '信贷类',
    status: 'archived',
    formCount: 4,
    processCount: 2,
    creator: '孙七',
    createTime: '2026-01-11 16:30'
  },
  {
    id: 6,
    name: '出差申请',
    tableName: 'biz_business_trip',
    domain: '人事类',
    status: 'published',
    formCount: 2,
    processCount: 1,
    creator: '周八',
    createTime: '2026-01-10 08:45'
  },
  {
    id: 7,
    name: '采购申请',
    tableName: 'biz_purchase_application',
    domain: '财务类',
    status: 'draft',
    formCount: 0,
    processCount: 0,
    creator: '吴九',
    createTime: '2026-01-09 15:20'
  },
  {
    id: 8,
    name: '用印申请',
    tableName: 'biz_seal_application',
    domain: '行政类',
    status: 'published',
    formCount: 3,
    processCount: 2,
    creator: '郑十',
    createTime: '2026-01-08 11:30'
  },
  {
    id: 9,
    name: '车辆申请',
    tableName: 'biz_vehicle_application',
    domain: '行政类',
    status: 'disabled',
    formCount: 1,
    processCount: 0,
    creator: '钱十一',
    createTime: '2026-01-07 14:15'
  },
  {
    id: 10,
    name: '招待申请',
    tableName: 'biz_entertainment_application',
    domain: '财务类',
    status: 'published',
    formCount: 2,
    processCount: 1,
    creator: '冯十二',
    createTime: '2026-01-06 09:00'
  },
  {
    id: 11,
    name: '培训申请',
    tableName: 'biz_training_application',
    domain: '人事类',
    status: 'draft',
    formCount: 1,
    processCount: 0,
    creator: '褚十三',
    createTime: '2026-01-05 16:45'
  },
  {
    id: 12,
    name: '资产购置',
    tableName: 'biz_asset_purchase',
    domain: '财务类',
    status: 'published',
    formCount: 4,
    processCount: 3,
    creator: '卫十四',
    createTime: '2026-01-04 10:30'
  },
  {
    id: 13,
    name: '公章使用',
    tableName: 'biz_official_seal_use',
    domain: '行政类',
    status: 'archived',
    formCount: 2,
    processCount: 1,
    creator: '蒋十五',
    createTime: '2026-01-03 13:20'
  },
  {
    id: 14,
    name: '风险评估',
    tableName: 'biz_risk_assessment',
    domain: '风控类',
    status: 'published',
    formCount: 3,
    processCount: 2,
    creator: '沈十六',
    createTime: '2026-01-02 08:50'
  },
  {
    id: 15,
    name: '授信申请',
    tableName: 'biz_credit_application',
    domain: '信贷类',
    status: 'draft',
    formCount: 0,
    processCount: 0,
    creator: '韩十七',
    createTime: '2026-01-01 17:10'
  }
])

// 右键菜单
const contextMenuVisible = ref(false)
const contextMenuX = ref(0)
const contextMenuY = ref(0)
const currentContextMenuData = ref(null)

// 状态类型映射
const getStatusType = (status) => {
  const typeMap = {
    'draft': 'info',
    'published': 'success',
    'disabled': 'warning',
    'archived': 'danger'
  }
  return typeMap[status] || 'info'
}

// 状态文本映射
const getStatusText = (status) => {
  const textMap = {
    'draft': '草稿',
    'published': '已发布',
    'disabled': '已停用',
    'archived': '已归档'
  }
  return textMap[status] || '未知'
}

// 表格行样式
const tableRowClassName = ({ row }) => {
  if (row.status === 'archived') {
    return 'archived-row'
  }
  return ''
}

// 业务域节点点击
const handleDomainClick = (data) => {
  currentDomain.value = data
  console.log('点击业务域:', data)
  // TODO: 根据业务域筛选数据
}

// 搜索
const handleSearch = () => {
  ElMessage.success('搜索完成')
}

// 筛选
const handleFilter = () => {
  ElMessage.success('筛选完成')
}

const handleResetFilter = () => {
  filterForm.status = ''
  filterForm.dateRange = []
}

// 选择变化
const handleSelectionChange = (selection) => {
  selectedRows.value = selection
}

// 新建业务对象
const handleCreate = () => {
  createDialogVisible.value = true
}

// 导入业务对象
const handleImport = () => {
  importDialogVisible.value = true
}

// 导出选中
const handleExportSelected = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要导出的业务对象')
    return
  }
  exportDialogVisible.value = true
}

// 配置
const handleConfig = () => {
  configDialogVisible.value = true
}

// 弹窗回调
const handleConfigConfirm = (data) => {
  console.log('保存全局配置:', data)
  // TODO: 调用 API 保存配置
}


// 弹窗回调
const handleExportConfirm = (data) => {
  console.log('导出业务对象:', data)
  // TODO: 调用 API 导出
}

// 弹窗回调
const handleImportConfirm = (data) => {
  console.log('导入业务对象:', data)
  // TODO: 调用 API 导入
}
// 新建/修改业务域确认
const handleAddDomainConfirm = (data) => {
  console.log('业务域操作:', data)

  if (data.action === 'add') {
    // 新增业务域
    ElMessage.success('新增业务域成功')
    // TODO: 调用 API 新增
  } else if (data.action === 'edit') {
    // 修改业务域
    ElMessage.success('修改业务域成功')
    // TODO: 调用 API 修改
  }

  // 刷新树数据
  refreshDomainTree()
}

// 刷新业务域树
const refreshDomainTree = () => {
  // TODO: 调用 API 刷新业务域树
  console.log('刷新业务域树')
}

// 批量发布
const handleBatchPublish = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要发布的业务对象')
    return
  }

  const draftRows = selectedRows.value.filter(row => row.status === 'draft')
  if (draftRows.length === 0) {
    ElMessage.warning('选中的业务对象中没有草稿状态，无法发布')
    return
  }

  batchPublishDialogVisible.value = true
}

// 批量删除
const handleBatchDelete = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要删除的业务对象')
    return
  }

  const draftRows = selectedRows.value.filter(row => row.status === 'draft')
  if (draftRows.length === 0) {
    ElMessage.warning('选中的业务对象中没有草稿状态，无法删除')
    return
  }

  deleteConfirmDialogVisible.value = true
}

// 编辑
const handleEdit = (row) => {
  currentRow.value = row
  editDialogVisible.value = true
}

// 编辑新版本
const handleEditNewVersion = (row) => {
  currentRow.value = row
  editDialogVisible.value = true
}

// 编辑确认
const handleEditConfirm = (data) => {
  console.log('保存编辑:', data)
  if (data.isVersionEdit) {
    if (data.action === 'publish') {
      ElMessage.success(`新版本V${data.version}发布成功`)
    } else if (data.action === 'save_draft') {
      ElMessage.success('草稿保存成功')
    } else {
      ElMessage.success('保存成功')
    }
  } else {
    ElMessage.success('保存成功')
  }
  // TODO: 调用 API 保存
}

// 发布
const handlePublish = (row) => {
  ElMessageBox.confirm(
      '发布后将生成数据库表结构，已发布的字段不可删除或修改类型！确定要发布吗？',
      '生产环境安全提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
  ).then(() => {
    ElMessage.success('发布成功')
  }).catch(() => {})
}

// 停用
const handleDisable = (row) => {
  currentRow.value = row
  disableDialogVisible.value = true
}

// 停用确认
const handleDisableConfirm = (data) => {
  console.log('停用业务对象:', data)
  ElMessage.success(`已成功停用「${data.name}」`)
  // TODO: 调用 API 停用
}

// 启用
const handleEnable = (row) => {
  currentRow.value = row
  enableDialogVisible.value = true
}

// 启用确认
const handleEnableConfirm = (data) => {
  console.log('启用业务对象:', data)
  ElMessage.success(`已成功启用「${data.name}」`)
  // TODO: 调用 API 启用
}

// 预览
const handlePreview = (row) => {
  ElMessage.info(`预览：${row.name}`)
}

// 更多菜单命令处理
const handleMoreCommand = (command, row) => {
  switch (command) {
    case 'sql':
      handleGenerateSQL(row)
      break
    case 'dependency':
      handleViewDependencies(row)
      break
    case 'copy':
      handleCopy(row)
      break
    case 'delete':
      handleDelete(row)
      break
  }
}


// 生成 SQL
const handleGenerateSQL = (row) => {
  if (row.status === 'published') {
    ElMessage.info(`查看 SQL：${row.name}（只读模式，已发布状态不可编辑）`)
  } else if (row.status === 'disabled') {
    ElMessage.info(`查看/编辑 SQL：${row.name}（停用状态仅允许低风险修改）`)
  } else {
    ElMessage.info(`查看/编辑 SQL：${row.name}`)
  }
}

// 查看依赖
const handleViewDependencies = (row) => {
  if (row.status === 'published') {
    ElMessage.info(`查看依赖：${row.name}（只读模式，已发布状态仅允许新增依赖）`)
  } else if (row.status === 'disabled') {
    ElMessageBox.confirm(
        `模板已停用，修改依赖关系可能影响正在运行的流程。确认要继续吗？`,
        '影响范围提示',
        {
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          type: 'warning'
        }
    ).then(() => {
      currentRow.value = row
      dependencyDialogVisible.value = true
    }).catch(() => {})
  } else {
    currentRow.value = row
    dependencyDialogVisible.value = true
  }
}

// 复制
const handleCopy = (row) => {
  if (row.status === 'archived') {
    ElMessageBox.confirm(
        `归档模板复制操作将被记录审计日志。确认要复制"${row.name}"吗？`,
        '归档模板复制提示',
        {
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          type: 'info'
        }
    ).then(() => {
      ElMessage.info(`复制归档模板：${row.name}（已记录审计日志）`)
    }).catch(() => {})
  } else {
    ElMessage.info(`复制：${row.name}`)
  }
}

// 删除
const handleDelete = (row) => {
  if (row.status === 'draft') {
    ElMessageBox.confirm(
        `确定要删除草稿"${row.name}"吗？该操作不可逆。`,
        '删除确认',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
    ).then(() => {
      currentRow.value = row
      deleteConfirmDialogVisible.value = true
    }).catch(() => {})
  }
}

// 弹窗回调
const handleCreateConfirm = (data) => {
  console.log('创建业务对象:', data)
  // TODO: 调用 API 创建
}

const handleBatchPublishConfirm = (data) => {
  console.log('批量发布:', data)
  // TODO: 调用 API 批量发布
}

const handleBatchDeleteConfirm = (data) => {
  console.log('批量删除:', data)
  // TODO: 调用 API 批量删除
}

// 查看表单
const handleViewForms = (row) => {
  ElMessage.info(`查看关联表单：${row.name}`)
}

// 查看流程
const handleViewProcesses = (row) => {
  ElMessage.info(`查看关联流程：${row.name}`)
}

// 右键菜单
const handleContextMenu = (event, data) => {
  event.preventDefault()
  currentContextMenuData.value = data
  contextMenuX.value = event.clientX
  contextMenuY.value = event.clientY
  contextMenuVisible.value = true
}

const handleContextMenuCommand = (command) => {
  if (command === 'add') {
    handleCreate()
  } else if (command === 'rename') {
    ElMessage.info('重命名业务域')
  } else if (command === 'delete') {
    ElMessage.info('删除空业务域')
  }
  closeContextMenu()
}

const closeContextMenu = () => {
  contextMenuVisible.value = false
  currentContextMenuData.value = null
}

// 新建业务域
const handleAddDomain = () => {
  currentDomain.value = null
  addDomainDialogVisible.value = true
}

// 修改业务域
const handleModifyDomain = () => {
  if (!currentDomain.value) {
    ElMessage.warning('请先选择一个业务域')
    return
  }

  if (currentDomain.value.id === 'all') {
    ElMessage.warning('不能修改"全部"')
    return
  }

  console.log('修改业务域，当前选中:', currentDomain.value)
  addDomainDialogVisible.value = true
}

// 删除业务域
const handleDeleteDomain = () => {
  if (!currentDomain.value) {
    ElMessage.warning('请先选择一个业务域')
    return
  }

  if (currentDomain.value.id === 'all') {
    ElMessage.warning('不能删除"全部"')
    return
  }

  ElMessageBox.confirm(
      `确定要删除业务域"${currentDomain.value.label}"吗？删除后该业务域下的所有业务对象将被移至"全部业务对象"`,
      '删除业务域',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
  ).then(() => {
    // TODO: 调用 API 删除
    domainTreeData.value = domainTreeData.value.filter(item => item.id !== currentDomain.value.id)
    currentDomain.value = null
    ElMessage.success('删除成功')
  }).catch(() => {
    // 取消删除
  })
}

onMounted(() => {
  // 加载数据
})
</script>
<style scoped lang="scss">
.business-object-container {
  padding: 20px;
  background: #f0f2f5;
  height: calc(100vh - 60px);
  overflow: hidden;
  box-sizing: border-box;

  .page-layout {
    display: flex;
    gap: 16px;
    height: 100%;
    overflow: hidden;
  }

  .tree-section {
    width: 220px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    .tree-card {
      border-radius: 8px;
      border: none;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      height: 100%;
      display: flex;
      flex-direction: column;
      overflow: hidden;

      :deep(.el-card__header) {
        padding: 16px 20px;
        border-bottom: none;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: #fff;
        border-radius: 8px 8px 0 0;
        flex-shrink: 0;
        white-space: nowrap;

        .card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          font-size: 15px;
          font-weight: 600;

          .el-icon {
            font-size: 18px;
            flex-shrink: 0;
          }

          span {
            white-space: nowrap;
          }

          .header-dropdown {
            margin-left: auto;
            flex-shrink: 0;

            .el-button {
              background: rgba(255, 255, 255, 0.2);
              border-color: transparent;
              color: #fff;
              padding: 6px 10px;
              flex-shrink: 0;

              &:hover {
                background: rgba(255, 255, 255, 0.3);
              }
            }
          }
        }
      }

      .tree-content {
        flex: 1;
        overflow-y: auto;
        overflow-x: hidden;
        padding: 12px 4px;

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

      .domain-tree {
        .el-tree-node {
          &:hover {
            background-color: #f5f7fa;
          }

          &.is-current > .el-tree-node__content {
            background: linear-gradient(90deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%);
            color: #667eea;
            font-weight: 600;
            border-radius: 6px;
          }
        }

        .tree-node {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 8px 8px;
          transition: all 0.2s;
          border-radius: 6px;
          margin: 2px 0;

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
          height: 36px;
          margin: 2px 0;
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

  .toolbar-card {
    border-radius: 8px;
    border: none;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    flex-shrink: 0;

    :deep(.el-card__body) {
      padding: 16px 20px;
    }

    .toolbar-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;

      .toolbar-left {
        display: flex;
        gap: 10px;
        flex-wrap: nowrap;

        .el-button {
          border-radius: 6px;
          font-weight: 500;
          padding: 8px 16px;
          transition: all 0.3s;
          white-space: nowrap;

          &:hover {
            transform: translateY(-1px);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          }
        }

        .gradient-btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          color: #fff;
        }

        .gradient-btn-blue {
          background: linear-gradient(135deg, #409EFF 0%, #337ecc 100%);
          border: none;
          color: #fff;
        }

        .gradient-btn-orange {
          background: linear-gradient(135deg, #e6a23c 0%, #d4880b 100%);
          border: none;
          color: #fff;
        }

        .gradient-btn-gray {
          background: linear-gradient(135deg, #909399 0%, #73767a 100%);
          border: none;
          color: #fff;
        }
      }

      .toolbar-right {
        display: flex;
        gap: 10px;
        align-items: center;
        flex-shrink: 0;

        .search-input {
          width: 220px;

          .el-input__wrapper {
            border-radius: 6px;
          }
        }
      }
    }
  }

  .filter-card {
    border-radius: 8px;
    border: none;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    flex-shrink: 0;

    :deep(.el-card__body) {
      padding: 14px 20px;
    }

    .filter-form {
      margin-bottom: 0;
      display: flex;
      align-items: center;
      gap: 16px;
      flex-wrap: nowrap;

      .el-form-item {
        margin-bottom: 0;
        margin-right: 0;
      }

      .filter-select {
        width: 140px;
      }

      .filter-date {
        width: 240px;
      }

      .filter-actions {
        margin-left: auto;
      }
    }
  }

  .table-card {
    border-radius: 8px;
    border: none;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    min-height: 0;

    :deep(.el-card__body) {
      padding: 0;
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      border-radius: 8px;
      min-height: 0;
    }

    .el-table {
      width: 100%;
      flex: 1;

      :deep(.el-table__header th) {
        background: #fafafa !important;
        color: #333;
        font-weight: 600;
        font-size: 14px;
        border-bottom: 2px solid #ebeef5;
        white-space: nowrap;
      }

      :deep(.el-table__row) {
        &:hover {
          background-color: #f5f7fa !important;
        }

        td {
          padding: 12px 0;
          border-bottom: 1px solid #f0f0f0;
        }
      }

      :deep(.el-table__body-wrapper) {
        overflow: auto;

        &::-webkit-scrollbar {
          width: 6px;
          height: 6px;
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

      .action-buttons {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        white-space: nowrap;
        flex-wrap: nowrap;

        .action-btn {
          margin: 0;
          padding: 6px 10px;
          font-size: 13px;
          border-radius: 4px;
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
      border-radius: 0 0 8px 8px;
    }
  }
}

// 表格行样式
.archived-row {
  background-color: #fafafa !important;
  opacity: 0.8;
}

// 状态标签优化
:deep(.el-tag) {
  border-radius: 4px;
  padding: 4px 10px;
  font-weight: 500;
}

// 链接样式优化
:deep(.el-link) {
  font-weight: 500;

  &:hover {
    text-decoration: underline;
  }
}

// 下拉菜单优化
:deep(.el-dropdown-menu__item) {
  padding: 10px 20px;

  &:hover {
    background: linear-gradient(90deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
    color: #667eea;
  }
}

// 右键菜单
.context-menu {
  position: fixed;
  z-index: 9999;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  padding: 8px 0;
}
</style>


