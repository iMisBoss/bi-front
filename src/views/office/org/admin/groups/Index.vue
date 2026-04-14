<template>
  <div class="group-management-page">
    <!-- 面包屑 -->
    <el-breadcrumb separator="/" class="breadcrumb">
      <el-breadcrumb-item :to="{ path: '/' }">后台首页</el-breadcrumb-item>
      <el-breadcrumb-item>组织人事管理</el-breadcrumb-item>
      <el-breadcrumb-item>群组管理</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card class="main-card" shadow="never">
      <!-- 顶部工具栏 -->
      <GroupToolbar
          :selected-count="selectedRows.length"
          @batch-disable="handleBatchDisable"
          @batch-dissolve="handleBatchDissolve"
          @export="handleExport"
          @add="handleAdd"
          @import="showImportDialog = true"
          @refresh="handleRefresh"
          @show-settings="showSettings = true"
          @search="handleSearch"
          @filter="handleFilter"
      />

      <!-- 全部群组列表（删除"我的群组"Tab） -->
      <GroupTable
          :table-data="filteredAllGroups"
          @selection-change="handleSelectionChange"
          @edit="handleEdit"
          @manage-members="handleManageMembers"
          @view="handleView"
          @toggle-status="handleToggleStatus"
          @dissolve="handleDissolve"
      />

      <!-- 底部分页 -->
      <div class="pagination-wrapper">
        <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :total="total"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 新增/编辑抽屉 -->
    <GroupDrawer
        v-model="showDrawer"
        :type="drawerType"
        :data="currentGroup"
        :group-tree="groupTree"
        :department-tree="departmentTree"
        :positions-list="positionsList"
        :all-users="allUsers"
        @confirm="handleConfirmSave"
    />

    <!-- 导入对话框 -->
    <GroupImportDialog
        v-model="showImportDialog"
        @download-template="downloadTemplate"
        @confirm-import="handleConfirmImport"
    />

    <!-- 查看详情抽屉 -->
    <GroupDetailDrawer
        v-model="showDetailDrawer"
        :data="currentGroup"
        @edit="handleEdit"
        @toggle-status="handleToggleStatus"
        @dissolve="handleDissolve"
    />

    <!-- 群组成员管理对话框 -->
    <GroupMembersDialog
        v-model="showMembersDialog"
        :group="currentGroup"
        :all-users="allUsers"
        :department-tree="departmentTree"
        @confirm="handleConfirmMembers"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import GroupToolbar from './components/GroupToolbar.vue'
import GroupTable from './components/GroupTable.vue'
import GroupDrawer from './components/GroupDrawer.vue'
import GroupImportDialog from './components/GroupImportDialog.vue'
import GroupDetailDrawer from './components/GroupDetailDrawer.vue'
import GroupMembersDialog from './components/GroupMembersDialog.vue'

const activeTab = ref('all')
const selectedRows = ref([])
const currentGroup = ref(null)
const drawerType = ref('add')
const showDrawer = ref(false)
const showImportDialog = ref(false)
const showDetailDrawer = ref(false)
const showMembersDialog = ref(false)
const showSettings = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

const searchKeyword = ref('')
const typeFilter = ref('')
const statusFilter = ref('')

// 数据源
const groupData = ref([])
const groupTree = ref([])
const departmentTree = ref([])
const positionsList = ref([])
const allUsers = ref([])

// 过滤后的全部群组
const filteredAllGroups = computed(() => {
  let data = [...groupData.value]

  if (searchKeyword.value) {
    data = data.filter(item =>
        item.name?.includes(searchKeyword.value) ||
        item.groupId?.includes(searchKeyword.value) ||
        item.owner?.includes(searchKeyword.value)
    )
  }

  if (typeFilter.value) {
    data = data.filter(item => item.type === typeFilter.value)
  }

  if (statusFilter.value) {
    data = data.filter(item => item.status === statusFilter.value)
  }

  total.value = data.length
  return data
})

onMounted(() => {
  loadGroupData()
  loadGroupTree()
  loadDepartmentTree()
  loadPositions()
  loadAllUsers()
})

// 加载群组数据
const loadGroupData = () => {
  groupData.value = [
    {
      id: 1,
      groupId: 'GRP-001',
      name: '全公司全员群',
      parentId: null,
      parentName: '根群组',
      type: 'system',
      typeName: '系统群',
      scope: 'all',
      scopeName: '全公司',
      owner: '系统管理员',
      ownerIds: [1],
      memberCount: 3,
      status: 'enabled',
      createTime: '2026-01-01 10:00:00',
      description: '公司全员通讯群组',
      members: [
        { id: 100, name: '系统管理员', employeeNo: 'ADMIN', department: '公司总部' },
        { id: 1, name: '张三', employeeNo: 'E001', department: '前端开发组' },
        { id: 2, name: '李四', employeeNo: 'E002', department: '技术部' }
      ],
      isSystem: true
    },
    {
      id: 2,
      groupId: 'GRP-002',
      name: '技术部群组',
      parentId: null,
      parentName: '根群组',
      type: 'department',
      typeName: '部门群',
      scope: 'department',
      scopeName: '技术部',
      owner: '李四',
      ownerIds: [2],
      memberCount: 3,
      status: 'enabled',
      createTime: '2026-01-15 10:00:00',
      description: '技术部门内部群组',
      members: [
        { id: 2, name: '李四', employeeNo: 'E002', department: '技术部' },
        { id: 1, name: '张三', employeeNo: 'E001', department: '前端开发组' },
        { id: 4, name: '赵六', employeeNo: 'E004', department: '后端开发组' }
      ],
      isSystem: false
    },
    {
      id: 3,
      groupId: 'GRP-003',
      name: '前端开发组',
      parentId: 2,
      parentName: '技术部群组',
      type: 'department',
      typeName: '部门群',
      scope: 'department',
      scopeName: '前端开发组',
      owner: '张三',
      ownerIds: [1],
      memberCount: 2,
      status: 'enabled',
      createTime: '2026-02-01 10:00:00',
      description: '前端开发团队群组',
      members: [
        { id: 1, name: '张三', employeeNo: 'E001', department: '前端开发组' },
        { id: 8, name: '郑十', employeeNo: 'E010', department: '前端开发组' }
      ],
      isSystem: false
    },
    {
      id: 4,
      groupId: 'GRP-004',
      name: '产品部群组',
      parentId: null,
      parentName: '根群组',
      type: 'department',
      typeName: '部门群',
      scope: 'department',
      scopeName: '产品部',
      owner: '王五',
      ownerIds: [3],
      memberCount: 3,
      status: 'enabled',
      createTime: '2026-01-20 10:00:00',
      description: '产品部门内部群组',
      members: [
        { id: 3, name: '王五', employeeNo: 'E003', department: '产品部' },
        { id: 5, name: '孙七', employeeNo: 'E005', department: '产品部' },
        { id: 15, name: '马十七', employeeNo: 'E015', department: '产品部' }
      ],
      isSystem: false
    },
    {
      id: 5,
      groupId: 'GRP-005',
      name: '2026年度项目群',
      parentId: null,
      parentName: '根群组',
      type: 'project',
      typeName: '项目群',
      scope: 'custom',
      scopeName: '自定义人员',
      owner: '当前用户',
      ownerIds: [100],
      memberCount: 3,
      status: 'enabled',
      createTime: '2026-03-01 10:00:00',
      description: '2026年度重点项目沟通群',
      members: [
        { id: 100, name: '当前用户', employeeNo: 'E100', department: '公司总部' },
        { id: 2, name: '李四', employeeNo: 'E002', department: '技术部' },
        { id: 3, name: '王五', employeeNo: 'E003', department: '产品部' }
      ],
      isSystem: false
    },
    {
      id: 6,
      groupId: 'GRP-006',
      name: '财务部群组',
      parentId: null,
      parentName: '根群组',
      type: 'department',
      typeName: '部门群',
      scope: 'department',
      scopeName: '财务部',
      owner: '周八',
      ownerIds: [6],
      memberCount: 2,
      status: 'disabled',
      createTime: '2026-01-10 10:00:00',
      description: '财务部门内部群组',
      members: [
        { id: 6, name: '周八', employeeNo: 'E006', department: '财务部' },
        { id: 16, name: '罗十八', employeeNo: 'E016', department: '财务部' }
      ],
      isSystem: false
    }
  ]
  total.value = groupData.value.length
}

// 加载群组树
const loadGroupTree = () => {
  groupTree.value = [
    { id: 0, name: '根群组', children: [
        { id: 1, name: '全公司全员群', children: [] },
        { id: 2, name: '技术部群组', children: [
            { id: 3, name: '前端开发组', children: [] }
          ]
        },
        { id: 4, name: '产品部群组', children: [] },
        { id: 5, name: '2026年度项目群', children: [] },
        { id: 6, name: '财务部群组', children: [] }
      ]
    }
  ]
}

// 加载部门树
const loadDepartmentTree = () => {
  departmentTree.value = [
    { id: 1, name: '公司总部', children: [
        { id: 2, name: '技术部', children: [
            { id: 3, name: '前端开发组', children: [] },
            { id: 4, name: '后端开发组', children: [] }
          ]
        },
        { id: 5, name: '产品部', children: [] },
        { id: 6, name: '财务部', children: [] }
      ]
    }
  ]
}

// 加载岗位列表
const loadPositions = () => {
  positionsList.value = [
    { id: 1, name: '前端开发岗', departmentId: 2 },
    { id: 2, name: '后端开发岗', departmentId: 2 },
    { id: 3, name: '技术经理岗', departmentId: 2 },
    { id: 4, name: '产品岗', departmentId: 5 },
    { id: 5, name: '财务岗', departmentId: 6 }
  ]
}

// 加载所有用户
const loadAllUsers = () => {
  allUsers.value = [
    { id: 1, name: '系统管理员', employeeNo: 'ADMIN', department: '公司总部' },
    { id: 2, name: '李四', employeeNo: 'E002', department: '技术部' },
    { id: 3, name: '王五', employeeNo: 'E003', department: '产品部' },
    { id: 4, name: '赵六', employeeNo: 'E004', department: '后端开发组' },
    { id: 5, name: '孙七', employeeNo: 'E005', department: '产品部' },
    { id: 6, name: '周八', employeeNo: 'E006', department: '财务部' },
    { id: 8, name: '郑十', employeeNo: 'E010', department: '前端开发组' },
    { id: 15, name: '马十七', employeeNo: 'E015', department: '产品部' },
    { id: 16, name: '罗十八', employeeNo: 'E016', department: '财务部' },
    { id: 100, name: '当前用户', employeeNo: 'E100', department: '公司总部' }
  ]
}

// ==================== 事件处理 ====================

// 选择变化
const handleSelectionChange = (selection) => {
  selectedRows.value = selection
}

// 新增
const handleAdd = () => {
  drawerType.value = 'add'
  currentGroup.value = null
  showDrawer.value = true
}

// 编辑
const handleEdit = (row) => {
  drawerType.value = 'edit'
  currentGroup.value = { ...row }
  showDrawer.value = true
  showDetailDrawer.value = false
}

// 查看
const handleView = (row) => {
  currentGroup.value = row
  showDetailDrawer.value = true
}

// 管理成员
const handleManageMembers = (row) => {
  currentGroup.value = row
  showMembersDialog.value = true
}

// 切换状态
const handleToggleStatus = (row) => {
  if (row.isSystem) {
    ElMessage.warning('系统群组不可禁用')
    return
  }

  const action = row.status === 'enabled' ? '禁用' : '启用'
  ElMessageBox.confirm(`确定要${action}群组「${row.name}」吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    row.status = row.status === 'enabled' ? 'disabled' : 'enabled'
    ElMessage.success(`${action}成功`)
  }).catch(() => {})
}

// 解散群组
const handleDissolve = (row) => {
  if (row.isSystem) {
    ElMessage.warning('系统群组不可解散')
    return
  }

  ElMessageBox.confirm(
      `确定要解散群组「${row.name}」吗？解散后不可恢复！`,
      '警告',
      {
        confirmButtonText: '确定解散',
        cancelButtonText: '取消',
        type: 'error',
        confirmButtonClass: 'el-button--danger'
      }
  ).then(() => {
    groupData.value = groupData.value.filter(item => item.id !== row.id)
    ElMessage.success('解散成功')
  }).catch(() => {})
}

// 确认保存
const handleConfirmSave = (formData) => {
  if (formData.id) {
    // 编辑模式
    const index = groupData.value.findIndex(item => item.id === formData.id)
    if (index !== -1) {
      groupData.value[index] = { ...groupData.value[index], ...formData }
    }
    ElMessage.success('编辑成功')
  } else {
    // 新增模式
    formData.id = Date.now()
    formData.groupId = `GRP-${String(groupData.value.length + 1).padStart(3, '0')}`
    formData.memberCount = 0
    formData.members = []
    formData.createTime = new Date().toLocaleString()
    groupData.value.push(formData)
    ElMessage.success('新增成功')
  }
  showDrawer.value = false
  total.value = groupData.value.length
}

// 确认成员管理
const handleConfirmMembers = (members) => {
  if (currentGroup.value) {
    currentGroup.value.members = members
    currentGroup.value.memberCount = members.length
    ElMessage.success('成员更新成功')
  }
  showMembersDialog.value = false
}

// 批量禁用
const handleBatchDisable = () => {
  if (selectedRows.value.length === 0) return

  const systemGroups = selectedRows.value.filter(row => row.isSystem)
  if (systemGroups.length > 0) {
    ElMessage.warning('选中的群组中包含系统群组，无法批量禁用')
    return
  }

  ElMessageBox.confirm(
      `确定要批量禁用 ${selectedRows.value.length} 个群组吗？`,
      '批量禁用',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
  ).then(() => {
    selectedRows.value.forEach(row => {
      row.status = 'disabled'
    })
    ElMessage.success('批量禁用成功')
    selectedRows.value = []
  }).catch(() => {})
}

// 批量解散
const handleBatchDissolve = () => {
  if (selectedRows.value.length === 0) return

  const systemGroups = selectedRows.value.filter(row => row.isSystem)
  if (systemGroups.length > 0) {
    ElMessage.warning('选中的群组中包含系统群组，无法批量解散')
    return
  }

  ElMessageBox.confirm(
      `确定要解散选中的 ${selectedRows.value.length} 个群组吗？解散后不可恢复！`,
      '警告',
      {
        confirmButtonText: '确定解散',
        cancelButtonText: '取消',
        type: 'error',
        confirmButtonClass: 'el-button--danger'
      }
  ).then(() => {
    const ids = selectedRows.value.map(row => row.id)
    groupData.value = groupData.value.filter(item => !ids.includes(item.id))
    ElMessage.success('批量解散成功')
    selectedRows.value = []
    total.value = groupData.value.length
  }).catch(() => {})
}

// 导出
const handleExport = () => {
  ElMessage.success('群组数据导出成功')
}

// 刷新
const handleRefresh = () => {
  loadGroupData()
  ElMessage.success('刷新成功')
}

// 搜索和筛选
const handleSearch = () => {}
const handleFilter = () => {}

// 分页
const handleSizeChange = (val) => {
  pageSize.value = val
}

const handleCurrentChange = (val) => {
  currentPage.value = val
}

// 导入
const downloadTemplate = () => {
  ElMessage.success('模板下载成功')
}

const handleConfirmImport = () => {
  ElMessage.success('导入成功')
  showImportDialog.value = false
  loadGroupData()
}
</script>

<style lang="scss" scoped>
.group-management-page {
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

  .pagination-wrapper {
    margin-top: 16px;
    display: flex;
    justify-content: flex-end;
    flex-shrink: 0;
  }
}
</style>
