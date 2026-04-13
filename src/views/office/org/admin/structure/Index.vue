<template>
  <div class="org-structure-page">
    <el-card class="main-card" shadow="never">
      <div class="toolbar">
        <div class="toolbar-left">
          <el-button-group>
            <el-button @click="handleBatchEnable" :disabled="selectedNodes.length === 0">批量启用</el-button>
            <el-button @click="handleBatchDisable" :disabled="selectedNodes.length === 0">批量禁用</el-button>
            <el-button @click="handleBatchDelete" :disabled="selectedNodes.length === 0">批量删除</el-button>
            <el-button @click="handleExport" :disabled="selectedNodes.length === 0">导出</el-button>
          </el-button-group>
        </div>

        <div class="toolbar-center">
          <el-dropdown @command="handleAddCommand">
            <el-button type="primary">
              新增<el-icon class="el-icon--right"><arrow-down /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="department">新增部门</el-dropdown-item>
                <el-dropdown-item command="position">新增岗位</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <el-button @click="showImportDialog = true">导入</el-button>
          <el-button @click="handleRefresh">刷新</el-button>
          <el-button @click="showTreeSettings = true">显示设置</el-button>
        </div>

        <div class="toolbar-right">
          <el-input
              v-model="searchKeyword"
              placeholder="输入部门名称、负责人搜索"
              prefix-icon="Search"
              clearable              style="width: 240px"
              @input="handleSearch"
          />
          <el-select v-model="statusFilter" placeholder="状态" style="width: 100px" @change="handleFilter">
            <el-option label="全部" value="" />
            <el-option label="启用" value="enabled" />
            <el-option label="禁用" value="disabled" />
          </el-select>
        </div>
      </div>

      <div class="content-wrapper">
        <OrgTreePanel
            ref="treePanelRef"
            :tree-data="treeData"
            :tree-settings="treeSettings"
            :search-keyword="searchKeyword"
            :status-filter="statusFilter"
            @node-click="handleNodeClick"
            @node-check="handleNodeCheck"
            @node-drag-end="handleNodeDragEnd"
            @expand-all="expandAll"
            @collapse-all="collapseAll"
        />

        <div class="resize-handle" @mousedown="startResize"></div>

        <OrgDetailPanel
            v-if="currentNode"
            :node="currentNode"
            :active-tab="activeTab"
            :basic-form="basicForm"
            :positions="positions"
            :members="members"
            :logs="logs"
            :personnel-list="personnelList"
            :location-list="locationList"
            :parent-options="parentOptions"
            @tab-change="handleTabChange"
            @field-blur="handleFieldBlur"
            @edit="handleEdit"
            @add-sub-department="handleAddSubDepartment"
            @add-position="handleAddPosition"
            @link-location="handleLinkLocation"
            @toggle-status="handleToggleStatus"
            @delete="handleDelete"
            @add-members="handleAddMembers"
            @remove-members="handleRemoveMembers"
            @add-position-inline="handleAddPositionInline"
            @edit-position="handleEditPosition"
            @delete-position="handleDeletePosition"
            @batch-disable-positions="handleBatchDisablePositions"
            @export-positions="handleExportPositions"
            @export-logs="handleExportLogs"
        />

        <div v-else class="empty-detail">
          <el-empty description="请选择部门节点" />
        </div>
      </div>
    </el-card>

    <OrgTreeSettings
        v-model="showTreeSettings"
        :settings="treeSettings"
        @save="saveTreeSettings"
    />

    <OrgAddDialog
        v-model="showAddDialog"
        :type="addForm.type"
        :parent-id="addForm.parentId"
        :edit-data="editData"
        :parent-options="parentOptions"
        :personnel-list="personnelList"
        :location-list="locationList"
        @confirm="handleConfirmAdd"
    />

    <OrgImportDialog
        v-model="showImportDialog"
        @download-template="downloadTemplate"
        @confirm-import="handleConfirmImport"
    />

    <OrgMemberSelect
        v-model="showMemberSelectDialog"
        :available-members="availableMembers"
        @confirm="handleConfirmAddMembers"
    />
    <el-dialog
        v-model="showLocationDialog"
        title="关联办公地点"
        width="500px"
    >
      <el-form label-width="100px">
        <el-form-item label="办公地点">
          <el-select v-model="basicForm.locationIds" multiple placeholder="选择办公地点" style="width: 100%">
            <el-option
                v-for="location in locationList"
                :key="location.id"
                :label="location.name"
                :value="location.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showLocationDialog = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmLinkLocation">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowDown } from '@element-plus/icons-vue'
import OrgTreePanel from './components/OrgTreePanel.vue'
import OrgDetailPanel from './components/OrgDetailPanel.vue'
import OrgTreeSettings from './components/OrgTreeSettings.vue'
import OrgAddDialog from './components/OrgAddDialog.vue'
import OrgImportDialog from './components/OrgImportDialog.vue'
import OrgMemberSelect from './components/OrgMemberSelect.vue'

const treePanelRef = ref(null)
const selectedNodes = ref([])
const currentNode = ref(null)
const activeTab = ref('basic')
const searchKeyword = ref('')
const statusFilter = ref('')
const showTreeSettings = ref(false)
const showAddDialog = ref(false)
const showImportDialog = ref(false)
const showMemberSelectDialog = ref(false)
const showLocationDialog = ref(false)
const editData = ref(null)

const treeSettings = reactive({
  showMemberCount: true,
  showLeader: true,
  showLocation: false,
  density: 'standard'
})

const addForm = reactive({
  type: 'department',
  name: '',
  code: '',
  parentId: null,
  leaderIds: [],
  locationIds: [],
  remark: ''
})

const basicForm = reactive({
  name: '',
  code: '',
  parentId: null,
  leaderIds: [],
  status: 'enabled',
  locationIds: [],
  remark: ''
})

const treeData = ref([])
const positions = ref([])
const members = ref([])
const logs = ref([])
const personnelList = ref([])
const locationList = ref([])
const parentOptions = ref([])
const availableMembers = ref([])

onMounted(() => {
  loadTreeData()
  loadPersonnelList()
  loadLocationList()
})

const loadTreeData = () => {
  treeData.value = [
    {
      id: 1,
      name: '公司总部',
      type: 'department',
      status: 'enabled',
      memberCount: 150,
      leader: '张三',
      children: [
        {
          id: 2,
          name: '技术部',
          type: 'department',
          status: 'enabled',
          memberCount: 80,
          leader: '李四',
          children: []
        },
        {
          id: 5,
          name: '产品部',
          type: 'department',
          status: 'enabled',
          memberCount: 30,
          leader: '王五',
          children: []
        }
      ]
    }
  ]
  parentOptions.value = treeData.value
}

const loadPersonnelList = () => {
  personnelList.value = [
    { id: 1, name: '张三', employeeNo: 'E001', department: '技术部', position: '前端工程师' },
    { id: 2, name: '李四', employeeNo: 'E002', department: '技术部', position: '后端工程师' }
  ]
}

const loadLocationList = () => {
  locationList.value = [
    { id: 1, name: '北京总部' },
    { id: 2, name: '上海分部' },
    { id: 3, name: '深圳分部' }
  ]
}

const handleNodeClick = (node) => {
  currentNode.value = node
  activeTab.value = 'basic'
  loadNodeDetail(node)
}

const handleNodeCheck = (checkedNodes) => {
  selectedNodes.value = checkedNodes
}

const handleNodeDragEnd = () => {
  ElMessage.success('层级调整成功')
  loadTreeData()
}

const expandAll = () => {
  if (treePanelRef.value) {
    treePanelRef.value.expandAll()
  }
}

const collapseAll = () => {
  if (treePanelRef.value) {
    treePanelRef.value.collapseAll()
  }
}

const loadNodeDetail = (node) => {
  basicForm.name = node.name
  basicForm.code = node.code || `DEPT-${String(node.id).padStart(3, '0')}`
  basicForm.parentId = node.parentId || null
  basicForm.leaderIds = node.leaderIds || []
  basicForm.status = node.status || 'enabled'
  basicForm.locationIds = node.locationIds || []
  basicForm.remark = node.remark || ''

  positions.value = [
    { id: 1, name: '前端开发岗', code: 'POS-001', status: 'enabled', memberCount: 5 },
    { id: 2, name: '后端开发岗', code: 'POS-002', status: 'enabled', memberCount: 8 }
  ]

  members.value = [
    { id: 1, name: '张三', employeeNo: 'E001', position: '前端工程师', phone: '13800138000', status: 'active' }
  ]

  logs.value = [
    { operator: '管理员', time: '2026-04-13 10:00:00', type: 'create', content: '新增部门', ip: '192.168.1.100' }
  ]
}

const handleTabChange = (tab) => {
  activeTab.value = tab
}

const handleFieldBlur = () => {
  ElMessage.success('保存成功')
}

const handleAddCommand = (command) => {
  addForm.type = command
  addForm.name = ''
  addForm.code = ''
  addForm.parentId = currentNode.value?.id || null
  addForm.leaderIds = []
  addForm.locationIds = []
  addForm.remark = ''
  showAddDialog.value = true
}

const handleConfirmAdd = (formData) => {
  if (formData.id) {
    const index = treeData.value.findIndex(item => item.id === formData.id)
    if (index !== -1) {
      treeData.value[index] = { ...treeData.value[index], ...formData }
    }
    ElMessage.success('编辑成功')
  } else {
    ElMessage.success('新增成功')
  }
  showAddDialog.value = false
  editData.value = null
  loadTreeData()
  if (currentNode.value) {
    loadNodeDetail(currentNode.value)
  }
}

const handleEdit = () => {
  editData.value = {
    id: currentNode.value.id,
    name: basicForm.name,
    code: basicForm.code,
    parentId: basicForm.parentId,
    leaderIds: basicForm.leaderIds,
    locationIds: basicForm.locationIds,
    remark: basicForm.remark
  }
  addForm.type = 'department'
  showAddDialog.value = true
}

const handleBatchDisablePositions = (selectedPositions) => {
  ElMessageBox.confirm(`确定要禁用选中的 ${selectedPositions.length} 个岗位吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    selectedPositions.forEach(pos => {
      pos.status = 'disabled'
    })
    ElMessage.success('批量禁用成功')
    loadNodeDetail(currentNode.value)
  })
}

const handleExportPositions = () => {
  ElMessage.success('岗位导出成功')
}

const handleExportLogs = () => {
  ElMessage.success('日志导出成功')
}

const handleAddSubDepartment = () => {
  addForm.type = 'department'
  addForm.parentId = currentNode.value?.id
  showAddDialog.value = true
}

const handleAddPosition = () => {
  addForm.type = 'position'
  addForm.parentId = currentNode.value?.id
  showAddDialog.value = true
}

const handleAddPositionInline = () => {
  addForm.type = 'position'
  addForm.parentId = currentNode.value?.id
  showAddDialog.value = true
}

const handleEditPosition = (row) => {
  editData.value = {
    id: row.id,
    name: row.name,
    code: row.code,
    status: row.status,
    parentId: currentNode.value?.id
  }
  addForm.type = 'position'
  showAddDialog.value = true
}

const handleDeletePosition = (row) => {
  ElMessageBox.confirm(`确定要删除岗位「${row.name}」吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('删除成功')
    loadNodeDetail(currentNode.value)
  })
}

const handleLinkLocation = () => {
  basicForm.locationIds = [...(currentNode.value.locationIds || [])]
  showLocationDialog.value = true
}

const handleToggleStatus = () => {
  const action = currentNode.value.status === 'enabled' ? '禁用' : '启用'
  ElMessageBox.confirm(`确定要${action}该节点吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    currentNode.value.status = currentNode.value.status === 'enabled' ? 'disabled' : 'enabled'
    ElMessage.success(`${action}成功`)
  })
}

const handleDelete = () => {
  ElMessageBox.confirm('确定要删除该节点吗？删除前需移除关联成员、下级节点', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('删除成功')
    currentNode.value = null
    loadTreeData()
  })
}

const handleAddMembers = () => {
  availableMembers.value = personnelList.value
  showMemberSelectDialog.value = true
}

const handleConfirmAddMembers = (selected) => {
  ElMessage.success(`已添加 ${selected.length} 名成员`)
  showMemberSelectDialog.value = false
  loadNodeDetail(currentNode.value)
}

const handleConfirmLinkLocation = () => {
  currentNode.value.locationIds = [...basicForm.locationIds]
  ElMessage.success('关联成功')
  showLocationDialog.value = false
}

const handleRemoveMembers = () => {
  ElMessageBox.confirm('确定要移除选中的成员吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('移除成功')
    loadNodeDetail(currentNode.value)
  })
}

const handleBatchEnable = () => {
  ElMessageBox.confirm(`确定要批量启用 ${selectedNodes.value.length} 个节点吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    selectedNodes.value.forEach(node => {
      node.status = 'enabled'
    })
    ElMessage.success('批量启用成功')
    selectedNodes.value = []
    loadTreeData()
  })
}

const handleBatchDisable = () => {
  ElMessageBox.confirm(`确定要批量禁用 ${selectedNodes.value.length} 个节点吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    selectedNodes.value.forEach(node => {
      node.status = 'disabled'
    })
    ElMessage.success('批量禁用成功')
    selectedNodes.value = []
    loadTreeData()
  })
}

const handleBatchDelete = () => {
  ElMessageBox.confirm(`确定要删除选中的 ${selectedNodes.value.length} 个组织节点吗？删除后不可恢复！`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('批量删除成功')
    selectedNodes.value = []
    loadTreeData()
  })
}

const handleExport = () => {
  ElMessage.success('导出成功')
}

const handleRefresh = () => {
  loadTreeData()
  ElMessage.success('刷新成功')
}

const handleSearch = () => {}

const handleFilter = () => {
  loadTreeData()
}

const saveTreeSettings = (settings) => {
  Object.assign(treeSettings, settings)
  ElMessage.success('设置已保存')
}

const downloadTemplate = () => {
  ElMessage.success('模板下载成功')
}

const handleConfirmImport = () => {
  ElMessage.success('导入成功')
  showImportDialog.value = false
  loadTreeData()
}

const startResize = (e) => {
  const startX = e.clientX
  const startWidth = window.innerWidth * 0.3

  const onMouseMove = (moveEvent) => {
    const newWidth = startWidth + (moveEvent.clientX - startX)
    if (newWidth >= 200 && newWidth <= 600) {
      document.querySelector('.org-tree-panel').style.width = newWidth + 'px'
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

  .breadcrumb {
    margin-bottom: 16px;
  }

  .main-card {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    :deep(.el-card__body) {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      padding: 16px;
    }
  }

  .toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 16px;
    border-bottom: 1px solid #ebeef5;

    .toolbar-left,
    .toolbar-center,
    .toolbar-right {
      display: flex;
      gap: 8px;
      align-items: center;
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

    &:hover {
      background: #409eff;
    }
  }

  .empty-detail {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .footer-tips {
    margin-top: 16px;
    padding: 12px 16px;
    background: #f5f7fa;
    border-radius: 4px;
    font-size: 12px;
    color: #909399;

    p {
      margin: 4px 0;
    }
  }
}
</style>
