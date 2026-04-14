<template>
  <div class="org-structure-page">
    <!-- 面包屑 -->
    <el-breadcrumb separator="/" class="breadcrumb">
      <el-breadcrumb-item :to="{ path: '/' }">后台首页</el-breadcrumb-item>
      <el-breadcrumb-item>组织人事管理</el-breadcrumb-item>
      <el-breadcrumb-item>组织架构管理</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card class="main-card" shadow="never">
      <!-- 顶部工具栏（精简版：无批量操作） -->
      <OrgToolbar
          @export="handleExport"
          @import="showImportDialog = true"
          @add="handleAdd"
          @refresh="handleRefresh"
          @expand-all="handleExpandAll"
          @collapse-all="handleCollapseAll"
          @show-settings="showTreeSettings = true"
          @search="handleSearch"
          @filter="handleFilter"
          @show-advanced-filter="showAdvancedFilter = true"
      />

      <!-- 内容区：左右分栏 -->
      <div class="content-wrapper">
        <!-- 左栏：部门树（无复选框） -->
        <OrgTreePanel
            ref="treePanelRef"
            :tree-data="filteredTreeData"
            :tree-settings="treeSettings"
            :search-keyword="searchKeyword"
            @node-click="handleNodeClick"
            @node-drag-end="handleNodeDragEnd"
            @quick-add="handleQuickAdd"
            @quick-edit="handleQuickEdit"
            @quick-delete="handleQuickDelete"
        />

        <!-- 拖拽调整宽度 -->
        <div class="resize-handle" @mousedown="startResize"></div>

        <!-- 右栏：详情面板 -->
        <div class="detail-panel">
          <OrgDetailPanel
              v-if="currentNode"
              :node="currentNode"
              :active-tab="activeTab"
              :basic-form="basicForm"
              :positions="positions"
              :members="members"
              :logs="logs"
              :personnel-list="availablePersonnel"
              :location-list="locationList"
              :parent-options="parentOptions"
              :is-root-node="currentNode?.id === 1"
              @tab-change="handleTabChange"
              @field-save="handleFieldSave"
              @edit="handleEdit"
              @add-sub-department="handleAddSubDepartment"
              @add-position="handleAddPosition"
              @link-location="handleLinkLocation"
              @toggle-status="handleToggleStatus"
              @delete="handleDelete"
              @add-members="handleAddMembers"
              @remove-members="handleRemoveMembers"
              @transfer-members="handleTransferMembers"
              @batch-disable-positions="handleBatchDisablePositions"
              @export-positions="handleExportPositions"
              @export-logs="handleExportLogs"
              @view-audit-log="handleViewAuditLog"
          />

          <div v-else class="empty-detail">
            <el-empty description="请选择左侧部门节点查看详情">
              <template #image>
                <el-icon :size="80" color="#dcdfe6"><OfficeBuilding /></el-icon>
              </template>
            </el-empty>
          </div>
        </div>
      </div>

      <!-- 底部统计栏（简化版） -->
      <div class="footer-stats">
        <span>共 {{ totalDepartments }} 个部门</span>
        <el-divider direction="vertical" />
        <span>在职人员 {{ totalEmployees }} 人</span>
        <div class="footer-tips">
          <el-icon><InfoFilled /></el-icon>
          <span>提示：根部门不可删除/禁用 | 有人员的部门不可禁用 | 所有操作将记录审计日志</span>
        </div>
      </div>
    </el-card>

    <!-- 树形显示设置 -->
    <OrgTreeSettings
        v-model="showTreeSettings"
        :settings="treeSettings"
        @save="saveTreeSettings"
    />

    <!-- 新增/编辑对话框 -->
    <OrgAddDialog
        v-model="showAddDialog"
        :type="addForm.type"
        :parent-id="addForm.parentId"
        :edit-data="editData"
        :parent-options="parentOptions"
        :personnel-list="availablePersonnel"
        :location-list="locationList"
        @confirm="handleConfirmAdd"
    />

    <!-- 导入对话框 -->
    <OrgImportDialog
        v-model="showImportDialog"
        @download-template="downloadTemplate"
        @confirm-import="handleConfirmImport"
    />

    <!-- 人员选择器 -->
    <OrgMemberSelect
        v-model="showMemberSelectDialog"
        :available-members="availablePersonnel"
        :selected-members="selectedMembers"
        @confirm="handleConfirmAddMembers"
    />

    <!-- 关联办公地点 -->
    <el-dialog
        v-model="showLocationDialog"
        title="关联办公地点"
        width="500px"
        :close-on-click-modal="false"
    >
      <el-form label-width="100px">
        <el-form-item label="办公地点">
          <el-select
              v-model="basicForm.locationIds"
              multiple
              placeholder="选择办公地点"
              style="width: 100%"
              collapse-tags
              collapse-tags-tooltip
          >
            <el-option
                v-for="location in locationList"
                :key="location.id"
                :label="location.name"
                :value="location.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="当前已选">
          <el-tag
              v-for="locId in basicForm.locationIds"
              :key="locId"
              style="margin-right: 8px; margin-bottom: 4px"
          >
            {{ getLocationName(locId) }}
          </el-tag>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showLocationDialog = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmLinkLocation">确定</el-button>
      </template>
    </el-dialog>

    <!-- 高级筛选 -->
    <OrgAdvancedFilter
        v-model="showAdvancedFilter"
        @apply="handleApplyAdvancedFilter"
        @reset="handleResetAdvancedFilter"
    />

    <!-- 审计日志查看器 -->
    <OrgAuditLogDialog
        v-model="showAuditLogDialog"
        :logs="auditLogs"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { OfficeBuilding, InfoFilled } from '@element-plus/icons-vue'
import OrgTreePanel from './components/OrgTreePanel.vue'
import OrgDetailPanel from './components/OrgDetailPanel.vue'
import OrgTreeSettings from './components/OrgTreeSettings.vue'
import OrgAddDialog from './components/OrgAddDialog.vue'
import OrgImportDialog from './components/OrgImportDialog.vue'
import OrgMemberSelect from './components/OrgMemberSelect.vue'
import OrgToolbar from './components/OrgToolbar.vue'
import OrgAdvancedFilter from './components/OrgAdvancedFilter.vue'
import OrgAuditLogDialog from './components/OrgAuditLogDialog.vue'

const treePanelRef = ref(null)
const currentNode = ref(null)
const activeTab = ref('basic')
const searchKeyword = ref('')
const statusFilter = ref('')
const showTreeSettings = ref(false)
const showAddDialog = ref(false)
const showImportDialog = ref(false)
const showMemberSelectDialog = ref(false)
const showLocationDialog = ref(false)
const showAdvancedFilter = ref(false)
const showAuditLogDialog = ref(false)
const editData = ref(null)
const selectedMembers = ref([])

// 树形设置
const treeSettings = reactive({
  showMemberCount: true,
  showLeader: true,
  showLocation: false,
  showCode: false,
  density: 'standard',
  autoExpand: true
})

// 新增表单
const addForm = reactive({
  type: 'department',
  name: '',
  code: '',
  parentId: null,
  leaderIds: [],
  locationIds: [],
  remark: ''
})

// 基本信息表单
const basicForm = reactive({
  name: '',
  code: '',
  parentId: null,
  leaderIds: [],
  deputyLeaderIds: [],
  sortOrder: 0,
  status: 'enabled',
  locationIds: [],
  description: '',
  createTime: '',
  lastModifier: ''
})

// 数据源
const treeData = ref([])
const positions = ref([])
const members = ref([])
const logs = ref([])
const auditLogs = ref([])
const availablePersonnel = ref([])
const locationList = ref([])
const parentOptions = ref([])

// 统计数据
const totalDepartments = ref(0)
const totalEmployees = ref(0)

// 计算属性：过滤后的树形数据
const filteredTreeData = computed(() => {
  let result = JSON.parse(JSON.stringify(treeData.value))

  // 状态筛选
  if (statusFilter.value) {
    result = filterByStatus(result, statusFilter.value)
  }

  // 关键词搜索
  if (searchKeyword.value) {
    result = searchTree(result, searchKeyword.value)
  }

  return result
})

// 按状态过滤
const filterByStatus = (nodes, status) => {
  return nodes.filter(node => {
    const match = node.status === status
    if (node.children?.length) {
      node.children = filterByStatus(node.children, status)
    }
    return match || node.children?.length > 0
  })
}

// 搜索树
const searchTree = (nodes, keyword) => {
  const result = []
  for (const node of nodes) {
    const match =
        node.name?.includes(keyword) ||
        node.code?.includes(keyword) ||
        node.leader?.includes(keyword)

    if (node.children?.length) {
      const filteredChildren = searchTree(node.children, keyword)
      if (match || filteredChildren.length > 0) {
        result.push({ ...node, children: filteredChildren })
      }
    } else if (match) {
      result.push(node)
    }
  }
  return result
}

onMounted(() => {
  loadTreeData()
  loadPersonnelList()
  loadLocationList()
  updateStatistics()
})

// 加载树形数据
const loadTreeData = () => {
  treeData.value = [
    {
      id: 1,
      name: '公司总部',
      code: 'DEPT-001',
      type: 'department',
      status: 'enabled',
      memberCount: 150,
      leader: '张三',
      leaderIds: [1],
      parentId: null,
      sortOrder: 1,
      createTime: '2024-01-01 10:00:00',
      lastModifier: '系统管理员',
      children: [
        {
          id: 2,
          name: '技术部',
          code: 'DEPT-002',
          type: 'department',
          status: 'enabled',
          memberCount: 80,
          leader: '李四',
          leaderIds: [2],
          parentId: 1,
          sortOrder: 1,
          createTime: '2024-01-15 10:00:00',
          lastModifier: '张三',
          children: [
            {
              id: 3,
              name: '前端开发组',
              code: 'DEPT-003',
              type: 'department',
              status: 'enabled',
              memberCount: 30,
              leader: '王五',
              leaderIds: [3],
              parentId: 2,
              sortOrder: 1,
              createTime: '2024-02-01 10:00:00',
              lastModifier: '李四',
              children: []
            },
            {
              id: 4,
              name: '后端开发组',
              code: 'DEPT-004',
              type: 'department',
              status: 'enabled',
              memberCount: 50,
              leader: '赵六',
              leaderIds: [4],
              parentId: 2,
              sortOrder: 2,
              createTime: '2024-02-01 10:00:00',
              lastModifier: '李四',
              children: []
            }
          ]
        },
        {
          id: 5,
          name: '产品部',
          code: 'DEPT-005',
          type: 'department',
          status: 'enabled',
          memberCount: 30,
          leader: '孙七',
          leaderIds: [5],
          parentId: 1,
          sortOrder: 2,
          createTime: '2024-01-20 10:00:00',
          lastModifier: '张三',
          children: []
        },
        {
          id: 6,
          name: '财务部',
          code: 'DEPT-006',
          type: 'department',
          status: 'disabled',
          memberCount: 15,
          leader: '周八',
          leaderIds: [6],
          parentId: 1,
          sortOrder: 3,
          createTime: '2024-01-10 10:00:00',
          lastModifier: '张三',
          children: []
        }
      ]
    }
  ]
  parentOptions.value = flattenTreeForSelect(treeData.value)
}

// 扁平化树形数据用于下拉选择
const flattenTreeForSelect = (nodes, result = []) => {
  nodes.forEach(node => {
    result.push({
      id: node.id,
      name: node.name,
      code: node.code
    })
    if (node.children?.length) {
      flattenTreeForSelect(node.children, result)
    }
  })
  return result
}

// 加载人员列表
const loadPersonnelList = () => {
  availablePersonnel.value = [
    {
      id: 1,
      name: '张三',
      employeeNo: 'E001',
      department: '公司总部',
      position: '总经理',
      phone: '138****8000',
      status: 'active'
    },
    {
      id: 2,
      name: '李四',
      employeeNo: 'E002',
      department: '技术部',
      position: '技术总监',
      phone: '139****8001',
      status: 'active'
    },
    {
      id: 3,
      name: '王五',
      employeeNo: 'E003',
      department: '前端开发组',
      position: '前端组长',
      phone: '137****8002',
      status: 'active'
    },
    {
      id: 4,
      name: '赵六',
      employeeNo: 'E004',
      department: '后端开发组',
      position: '后端组长',
      phone: '136****8003',
      status: 'active'
    },
    {
      id: 5,
      name: '孙七',
      employeeNo: 'E005',
      department: '产品部',
      position: '产品总监',
      phone: '135****8004',
      status: 'active'
    }
  ]
}

// 加载办公地点
const loadLocationList = () => {
  locationList.value = [
    { id: 1, name: '北京总部大楼', address: '北京市朝阳区xxx路xxx号' },
    { id: 2, name: '上海分部', address: '上海市浦东新区xxx路xxx号' },
    { id: 3, name: '深圳分部', address: '深圳市南山区xxx路xxx号' },
    { id: 4, name: '杭州研发中心', address: '杭州市西湖区xxx路xxx号' }
  ]
}

// 更新统计数据
const updateStatistics = () => {
  totalDepartments.value = countNodes(treeData.value)
  totalEmployees.value = treeData.value.reduce((sum, node) => sum + (node.memberCount || 0), 0)
}

// 递归统计节点数
const countNodes = (nodes) => {
  let count = 0
  nodes.forEach(node => {
    count++
    if (node.children?.length) {
      count += countNodes(node.children)
    }
  })
  return count
}

// ==================== 事件处理函数 ====================

// 节点点击
const handleNodeClick = (node) => {
  currentNode.value = node
  activeTab.value = 'basic'
  loadNodeDetail(node)
}

// 节点拖拽结束
const handleNodeDragEnd = (draggedNode, targetNode, position) => {
  ElMessageBox.confirm(
      `确认将「${draggedNode.name}」移动到「${targetNode?.name || '根节点'}」${position === 'before' ? '之前' : position === 'after' ? '之后' : '内部'}吗？`,
      '架构调整确认',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }
  ).then(() => {
    recordAuditLog('架构调整', `移动部门: ${draggedNode.name}`, draggedNode.id)
    ElMessage.success('架构调整成功，已记录审计日志')
    loadTreeData()
  }).catch(() => {
    loadTreeData()
  })
}

// 快捷操作
const handleQuickAdd = (parentNode) => {
  addForm.type = 'department'
  addForm.parentId = parentNode.id
  editData.value = null
  showAddDialog.value = true
}

const handleQuickEdit = (node) => {
  currentNode.value = node
  handleEdit()
}

const handleQuickDelete = (node) => {
  currentNode.value = node
  handleDelete()
}

// 加载节点详情
const loadNodeDetail = (node) => {
  basicForm.name = node.name
  basicForm.code = node.code
  basicForm.parentId = node.parentId || null
  basicForm.leaderIds = node.leaderIds || []
  basicForm.deputyLeaderIds = node.deputyLeaderIds || []
  basicForm.sortOrder = node.sortOrder || 0
  basicForm.status = node.status || 'enabled'
  basicForm.locationIds = node.locationIds || []
  basicForm.description = node.description || ''
  basicForm.createTime = node.createTime || ''
  basicForm.lastModifier = node.lastModifier || ''

  positions.value = [
    {
      id: 1,
      name: '前端开发岗',
      code: 'POS-001',
      status: 'enabled',
      memberCount: 5,
      description: '负责前端开发工作'
    },
    {
      id: 2,
      name: '后端开发岗',
      code: 'POS-002',
      status: 'enabled',
      memberCount: 8,
      description: '负责后端开发工作'
    },
    {
      id: 3,
      name: '测试工程师岗',
      code: 'POS-003',
      status: 'disabled',
      memberCount: 3,
      description: '负责测试工作'
    }
  ]

  members.value = [
    {
      id: 1,
      name: '张三',
      employeeNo: 'E001',
      position: '前端工程师',
      level: 'P6',
      phone: '138****8000',
      status: 'active',
      joinDate: '2023-01-15',
      email: 'zhangsan@company.com'
    },
    {
      id: 2,
      name: '李四',
      employeeNo: 'E002',
      position: '后端工程师',
      level: 'P7',
      phone: '139****8001',
      status: 'active',
      joinDate: '2022-06-20',
      email: 'lisi@company.com'
    }
  ]

  logs.value = [
    {
      operator: '系统管理员',
      time: '2024-01-01 10:00:00',
      type: 'create',
      content: '创建部门',
      ip: '192.168.1.100'
    },
    {
      operator: '张三',
      time: '2024-02-15 14:30:00',
      type: 'update',
      content: '修改部门负责人',
      ip: '192.168.1.101'
    }
  ]
}

// Tab切换
const handleTabChange = (tab) => {
  activeTab.value = tab
}

// 字段保存
const handleFieldSave = (field, oldValue, newValue) => {
  recordAuditLog('字段修改', `${field}: ${oldValue} → ${newValue}`, currentNode.value.id)
  ElMessage.success('保存成功')
  loadTreeData()
}

// 新增
const handleAdd = () => {
  addForm.type = 'department'
  addForm.parentId = currentNode.value?.id || 1
  editData.value = null
  showAddDialog.value = true
}

// 确认新增/编辑
const handleConfirmAdd = (formData) => {
  if (formData.id) {
    recordAuditLog('部门编辑', `编辑部门: ${formData.name}`, formData.id)
    ElMessage.success('编辑成功')
  } else {
    recordAuditLog('部门新增', `新增部门: ${formData.name}`, null)
    ElMessage.success('新增成功')
  }
  showAddDialog.value = false
  editData.value = null
  loadTreeData()
  updateStatistics()
  if (currentNode.value) {
    loadNodeDetail(currentNode.value)
  }
}

// 编辑
const handleEdit = () => {
  editData.value = {
    id: currentNode.value.id,
    name: basicForm.name,
    code: basicForm.code,
    parentId: basicForm.parentId,
    leaderIds: basicForm.leaderIds,
    deputyLeaderIds: basicForm.deputyLeaderIds,
    sortOrder: basicForm.sortOrder,
    locationIds: basicForm.locationIds,
    description: basicForm.description
  }
  addForm.type = 'department'
  showAddDialog.value = true
}

// 批量禁用岗位（保留：这是岗位级别的合理批量操作）
const handleBatchDisablePositions = (selectedPositions) => {
  ElMessageBox.confirm(
      `确定要禁用选中的 ${selectedPositions.length} 个岗位吗？`,
      '批量禁用岗位',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
  ).then(() => {
    selectedPositions.forEach(pos => {
      pos.status = 'disabled'
    })
    recordAuditLog('批量禁用岗位', `禁用 ${selectedPositions.length} 个岗位`, currentNode.value.id)
    ElMessage.success('批量禁用成功')
    loadNodeDetail(currentNode.value)
  })
}

// 导出相关
const handleExportPositions = () => {
  ElMessage.success('岗位数据导出成功')
}

const handleExportLogs = () => {
  ElMessage.success('操作日志导出成功')
}

// 查看审计日志
const handleViewAuditLog = () => {
  auditLogs.value = [
    {
      operator: '系统管理员',
      operationTime: '2024-01-01 10:00:00',
      operationType: 'create',
      fieldName: '-',
      oldValue: '-',
      newValue: '创建部门',
      ipAddress: '192.168.1.100'
    },
    {
      operator: '张三',
      operationTime: '2024-02-15 14:30:00',
      operationType: 'update',
      fieldName: '负责人',
      oldValue: '李四',
      newValue: '王五',
      ipAddress: '192.168.1.101'
    }
  ]
  showAuditLogDialog.value = true
}

// 新增子部门/岗位
const handleAddSubDepartment = () => {
  addForm.type = 'department'
  addForm.parentId = currentNode.value?.id
  editData.value = null
  showAddDialog.value = true
}

const handleAddPosition = () => {
  addForm.type = 'position'
  addForm.parentId = currentNode.value?.id
  editData.value = null
  showAddDialog.value = true
}

// 关联办公地点
const handleLinkLocation = () => {
  basicForm.locationIds = [...(currentNode.value.locationIds || [])]
  showLocationDialog.value = true
}

const handleConfirmLinkLocation = () => {
  currentNode.value.locationIds = [...basicForm.locationIds]
  recordAuditLog('关联地点', `办公地点变更`, currentNode.value.id)
  ElMessage.success('关联成功')
  showLocationDialog.value = false
}

const getLocationName = (id) => {
  const location = locationList.value.find(loc => loc.id === id)
  return location ? location.name : '-'
}

// 切换状态（单个部门操作）
const handleToggleStatus = () => {
  const isRoot = currentNode.value.id === 1
  if (isRoot) {
    ElMessage.warning('根部门不可禁用')
    return
  }

  const hasMembers = currentNode.value.memberCount > 0
  const newStatus = currentNode.value.status === 'enabled' ? 'disabled' : 'enabled'

  if (newStatus === 'disabled' && hasMembers) {
    ElMessageBox.alert(
        '该部门下存在在职员工，无法禁用。请先将人员调动至其他部门后再禁用。',
        '禁用失败',
        {
          confirmButtonText: '知道了',
          type: 'warning'
        }
    )
    return
  }

  const action = newStatus === 'enabled' ? '启用' : '禁用'
  ElMessageBox.confirm(`确定要${action}该部门吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    currentNode.value.status = newStatus
    recordAuditLog('状态变更', `${action}部门`, currentNode.value.id)
    ElMessage.success(`${action}成功`)
    loadTreeData()
  })
}

// 删除（单个部门操作）
const handleDelete = () => {
  const isRoot = currentNode.value.id === 1
  if (isRoot) {
    ElMessage.warning('根部门不可删除')
    return
  }

  const hasChildren = currentNode.value.children?.length > 0
  const hasMembers = currentNode.value.memberCount > 0

  if (hasChildren) {
    ElMessageBox.alert(
        '该部门下存在子部门，无法删除。请先删除或移动所有子部门。',
        '删除失败',
        {
          confirmButtonText: '知道了',
          type: 'warning'
        }
    )
    return
  }

  if (hasMembers) {
    ElMessageBox.alert(
        '该部门下存在在职员工，无法删除。请先将人员调动至其他部门后再删除。',
        '删除失败',
        {
          confirmButtonText: '知道了',
          type: 'warning'
        }
    )
    return
  }

  ElMessageBox.confirm(
      '确定要删除该部门吗？删除后不可恢复！',
      '警告',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'error',
        confirmButtonClass: 'el-button--danger'
      }
  ).then(() => {
    recordAuditLog('部门删除', `删除部门: ${currentNode.value.name}`, currentNode.value.id)
    ElMessage.success('删除成功')
    currentNode.value = null
    loadTreeData()
    updateStatistics()
  })
}

// 成员管理
const handleAddMembers = () => {
  selectedMembers.value = []
  showMemberSelectDialog.value = true
}

const handleConfirmAddMembers = (selected) => {
  recordAuditLog('添加成员', `添加 ${selected.length} 名成员`, currentNode.value.id)
  ElMessage.success(`已添加 ${selected.length} 名成员`)
  showMemberSelectDialog.value = false
  loadNodeDetail(currentNode.value)
  updateStatistics()
}

const handleRemoveMembers = (selectedMembers) => {
  ElMessageBox.confirm(
      `确定要移除选中的 ${selectedMembers.length} 名成员吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
  ).then(() => {
    recordAuditLog('移除成员', `移除 ${selectedMembers.length} 名成员`, currentNode.value.id)
    ElMessage.success('移除成功')
    loadNodeDetail(currentNode.value)
    updateStatistics()
  })
}

const handleTransferMembers = (selectedMembers) => {
  ElMessage.info('人员调动功能开发中')
}

// 导出
const handleExport = () => {
  ElMessage.success('组织架构数据导出成功')
}

// 刷新
const handleRefresh = () => {
  loadTreeData()
  updateStatistics()
  ElMessage.success('刷新成功')
}

// 全部展开
const handleExpandAll = () => {
  if (treePanelRef.value) {
    treePanelRef.value.expandAll()
    ElMessage.success('已全部展开')
  }
}

// 全部收起
const handleCollapseAll = () => {
  if (treePanelRef.value) {
    treePanelRef.value.collapseAll()
    ElMessage.success('已全部收起')
  }
}

// 搜索和筛选
const handleSearch = () => {}
const handleFilter = () => {}

// 保存树形设置
const saveTreeSettings = (settings) => {
  Object.assign(treeSettings, settings)
  ElMessage.success('设置已保存')
}

// 导入相关
const downloadTemplate = () => {
  ElMessage.success('模板下载成功')
}

const handleConfirmImport = () => {
  recordAuditLog('数据导入', '导入组织架构数据', null)
  ElMessage.success('导入成功')
  showImportDialog.value = false
  loadTreeData()
  updateStatistics()
}

// 高级筛选
const handleResetAdvancedFilter = () => {
  // 由子组件内部处理
}

const handleApplyAdvancedFilter = (filterData) => {
  console.log('应用高级筛选:', filterData)
  ElMessage.success('高级筛选已应用')
}

// 记录审计日志
const recordAuditLog = (operationType, content, departmentId) => {
  console.log('审计日志:', {
    operationType,
    content,
    departmentId,
    operator: '当前用户',
    operationTime: new Date().toLocaleString(),
    ipAddress: '192.168.1.xxx'
  })
}

// 拖拽调整宽度
const startResize = (e) => {
  const startX = e.clientX
  const treePanel = document.querySelector('.org-tree-panel')
  const startWidth = treePanel.offsetWidth

  const onMouseMove = (moveEvent) => {
    const newWidth = startWidth + (moveEvent.clientX - startX)
    if (newWidth >= 250 && newWidth <= 600) {
      treePanel.style.width = newWidth + 'px'
    }
  }

  const onMouseUp = () => {
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)
  }

  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)
}
</script>

<style lang="scss" scoped>
.org-structure-page {
  padding: 20px;
  height: calc(100vh - 60px);
  display: flex;
  flex-direction: column;
  background: #f5f7fa;

  .breadcrumb {
    margin-bottom: 16px;
    font-size: 14px;
  }

  .main-card {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border-radius: 8px;

    :deep(.el-card__body) {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      padding: 16px;
    }
  }

  .content-wrapper {
    flex: 1;
    display: flex;
    gap: 8px;
    overflow: hidden;
    min-height: 0;
  }

  .resize-handle {
    width: 4px;
    background: #dcdfe6;
    cursor: col-resize;
    transition: background 0.2s;
    flex-shrink: 0;
    border-radius: 2px;

    &:hover {
      background: #409eff;
    }
  }

  .detail-panel {
    flex: 1;
    overflow: hidden;
    min-width: 0;
  }

  .empty-detail {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #fff;
    border-radius: 4px;
  }

  .footer-stats {
    margin-top: 16px;
    padding: 12px 16px;
    background: #fafafa;
    border-radius: 4px;
    font-size: 13px;
    color: #606266;
    display: flex;
    align-items: center;
    gap: 16px;
    flex-shrink: 0;

    .footer-tips {
      margin-left: auto;
      display: flex;
      align-items: center;
      gap: 4px;
      color: #909399;
      font-size: 12px;

      .el-icon {
        font-size: 14px;
      }
    }
  }
}
</style>
