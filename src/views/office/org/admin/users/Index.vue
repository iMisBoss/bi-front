<template>
  <div class="user-management-page">
    <el-card class="main-card" shadow="never">
      <!-- 内容区：左右分栏 -->
      <div class="content-wrapper">
        <!-- 左栏：部门机构树 -->
        <UserTreePanel
            ref="treePanelRef"
            :tree-data="departmentTree"
            :selected-dept-id="selectedDeptId"
            @node-click="handleDeptClick"
            @expand-all="handleExpandAll"
            @collapse-all="handleCollapseAll"
        />

        <!-- 拖拽调整宽度 -->
        <div class="resize-handle" @mousedown="startResize"></div>

        <!-- 右栏：人员列表 -->
        <div class="user-panel">
          <!-- 顶部工具栏 -->
          <UserToolbar
              :selected-count="selectedRows.length"
              :active-tab="activeTab"
              @batch-enable="handleBatchEnable"
              @batch-disable="handleBatchDisable"
              @batch-transfer="handleBatchTransfer"
              @batch-resign="handleBatchResign"
              @export="handleExport"
              @add="handleAdd"
              @import="showImportDialog = true"
              @refresh="handleRefresh"
              @search="handleSearch"
              @filter="handleFilter"
          />

          <!-- Tab切换 -->
          <el-tabs v-model="activeTab" @tab-change="handleTabChange" class="user-tabs">
            <!-- Tab1: 组织用户 -->
            <el-tab-pane label="组织用户" name="active">
              <ActiveUsers
                  :table-data="filteredActiveUsers"
                  @selection-change="handleSelectionChange"
                  @edit="handleEdit"
                  @view="handleView"
                  @disable="handleDisable"
                  @resign="handleResign"
                  @reset-password="handleResetPassword"
              />
            </el-tab-pane>

            <!-- Tab2: 禁用用户 -->
            <el-tab-pane label="禁用用户" name="disabled">
              <DisabledUsers
                  :table-data="filteredDisabledUsers"
                  @selection-change="handleSelectionChange"
                  @view="handleView"
                  @enable="handleEnable"
              />
            </el-tab-pane>

            <!-- Tab3: 历史用户 -->
            <el-tab-pane label="历史用户" name="resigned">
              <ResignedUsers
                  :table-data="filteredResignedUsers"
                  @view="handleView"
              />
            </el-tab-pane>
          </el-tabs>

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
        </div>
      </div>
    </el-card>

    <!-- 新增/编辑抽屉 -->
    <UserDrawer
        v-model="showDrawer"
        :type="drawerType"
        :data="currentUser"
        :department-tree="departmentTree"
        :positions="positionsList"
        @confirm="handleConfirmSave"
    />

    <!-- 导入对话框 -->
    <UserImportDialog
        v-model="showImportDialog"
        @download-template="downloadTemplate"
        @confirm-import="handleConfirmImport"
    />

    <!-- 查看详情抽屉 -->
    <UserDetailDrawer
        v-model="showDetailDrawer"
        :data="currentUser"
        @edit="handleEdit"
        @enable="handleEnable"
        @disable="handleDisable"
        @resign="handleResign"
    />

    <!-- 批量调岗对话框 -->
    <BatchTransferDialog
        v-model="showBatchTransferDialog"
        :selected-users="selectedRows"
        :department-tree="departmentTree"
        :positions="positionsList"
        @confirm="handleConfirmBatchTransfer"
    />

    <!-- 离职办理对话框 -->
    <ResignDialog
        v-model="showResignDialog"
        :user="currentUser"
        @confirm="handleConfirmResign"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import UserTreePanel from './components/UserTreePanel.vue'
import UserToolbar from './components/UserToolbar.vue'
import ActiveUsers from './components/ActiveUsers.vue'
import DisabledUsers from './components/DisabledUsers.vue'
import ResignedUsers from './components/ResignedUsers.vue'
import UserDrawer from './components/UserDrawer.vue'
import UserImportDialog from './components/UserImportDialog.vue'
import UserDetailDrawer from './components/UserDetailDrawer.vue'
import BatchTransferDialog from './components/BatchTransferDialog.vue'
import ResignDialog from './components/ResignDialog.vue'

const treePanelRef = ref(null)
const activeTab = ref('active')
const selectedRows = ref([])
const currentUser = ref(null)
const drawerType = ref('add')
const showDrawer = ref(false)
const showImportDialog = ref(false)
const showDetailDrawer = ref(false)
const showBatchTransferDialog = ref(false)
const showResignDialog = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const selectedDeptId = ref(null)

const searchKeyword = ref('')
const positionFilter = ref('')
const levelFilter = ref('')

// 数据源
const departmentTree = ref([])
const userList = ref([])
const positionsList = ref([])

// 过滤后的组织用户
const filteredActiveUsers = computed(() => {
  let data = userList.value.filter(user => user.status === 'active')

  if (selectedDeptId.value) {
    data = data.filter(user => isUserInDepartment(user, selectedDeptId.value))
  }

  if (searchKeyword.value && activeTab.value === 'active') {
    data = data.filter(user =>
        user.name?.includes(searchKeyword.value) ||
        user.employeeNo?.includes(searchKeyword.value) ||
        user.phone?.includes(searchKeyword.value)
    )
  }

  if (positionFilter.value) {
    data = data.filter(user => user.position === positionFilter.value)
  }

  return data
})

// 过滤后的禁用用户
const filteredDisabledUsers = computed(() => {
  let data = userList.value.filter(user => user.status === 'disabled')

  if (selectedDeptId.value) {
    data = data.filter(user => isUserInDepartment(user, selectedDeptId.value))
  }

  if (searchKeyword.value && activeTab.value === 'disabled') {
    data = data.filter(user =>
        user.name?.includes(searchKeyword.value) ||
        user.employeeNo?.includes(searchKeyword.value)
    )
  }

  return data
})

// 过滤后的历史用户
const filteredResignedUsers = computed(() => {
  let data = userList.value.filter(user => user.status === 'resigned')

  if (selectedDeptId.value) {
    data = data.filter(user => isUserInDepartment(user, selectedDeptId.value))
  }

  if (searchKeyword.value && activeTab.value === 'resigned') {
    data = data.filter(user =>
        user.name?.includes(searchKeyword.value) ||
        user.employeeNo?.includes(searchKeyword.value)
    )
  }

  return data
})

onMounted(() => {
  loadDepartmentTree()
  loadUserList()
  loadPositions()
})

// 加载部门树
const loadDepartmentTree = () => {
  departmentTree.value = [
    { id: 0, name: '全公司', children: [
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
  ]
}

// 加载人员列表
const loadUserList = () => {
  userList.value = [
    {
      id: 1,
      name: '张三',
      employeeNo: 'E001',
      departmentId: 3,
      department: '前端开发组',
      position: '前端开发岗',
      level: '专员',
      phone: '138****0000',
      status: 'active',
      isAdmin: false,
      joinDate: '2023-01-15',
      reportTo: '李四',
      avatar: ''
    },
    {
      id: 2,
      name: '李四',
      employeeNo: 'E002',
      departmentId: 2,
      department: '技术部',
      position: '技术经理岗',
      level: '经理',
      phone: '138****0001',
      status: 'active',
      isAdmin: false,
      joinDate: '2022-06-20',
      reportTo: '王五',
      avatar: ''
    },
    {
      id: 3,
      name: '王五',
      employeeNo: 'E003',
      departmentId: 5,
      department: '产品部',
      position: '产品岗',
      level: '主管',
      phone: '138****0002',
      status: 'active',
      isAdmin: false,
      joinDate: '2021-03-10',
      reportTo: '系统管理员',
      avatar: ''
    },
    {
      id: 4,
      name: '赵六',
      employeeNo: 'E004',
      departmentId: 4,
      department: '后端开发组',
      position: '后端开发岗',
      level: '专员',
      phone: '138****0003',
      status: 'active',
      isAdmin: false,
      joinDate: '2023-05-12',
      reportTo: '李四',
      avatar: ''
    },
    {
      id: 5,
      name: '孙七',
      employeeNo: 'E005',
      departmentId: 5,
      department: '产品部',
      position: '产品岗',
      level: '专员',
      phone: '138****0004',
      status: 'active',
      isAdmin: false,
      joinDate: '2023-08-20',
      reportTo: '王五',
      avatar: ''
    },
    {
      id: 6,
      name: '周八',
      employeeNo: 'E006',
      departmentId: 6,
      department: '财务部',
      position: '财务岗',
      level: '专员',
      phone: '138****0005',
      status: 'active',
      isAdmin: false,
      joinDate: '2022-09-01',
      reportTo: '系统管理员',
      avatar: ''
    },
    {
      id: 7,
      name: '吴九',
      employeeNo: 'E007',
      departmentId: 2,
      department: '技术部',
      position: '前端开发岗',
      level: '专员',
      phone: '138****0006',
      status: 'active',
      isAdmin: false,
      joinDate: '2023-03-15',
      reportTo: '李四',
      avatar: ''
    },
    {
      id: 8,
      name: '郑十',
      employeeNo: 'E008',
      departmentId: 3,
      department: '前端开发组',
      position: '前端开发岗',
      level: '专员',
      phone: '138****0007',
      status: 'active',
      isAdmin: false,
      joinDate: '2023-07-01',
      reportTo: '张三',
      avatar: ''
    },
    {
      id: 9,
      name: '陈十一',
      employeeNo: 'E009',
      departmentId: 4,
      department: '后端开发组',
      position: '后端开发岗',
      level: '专员',
      phone: '138****0008',
      status: 'disabled',
      isAdmin: false,
      joinDate: '2022-11-15',
      disableDate: '2026-02-15',
      disableReason: '停薪留职',
      reportTo: '李四',
      avatar: ''
    },
    {
      id: 10,
      name: '林十二',
      employeeNo: 'E010',
      departmentId: 5,
      department: '产品部',
      position: '产品岗',
      level: '主管',
      phone: '138****0009',
      status: 'disabled',
      isAdmin: false,
      joinDate: '2022-04-20',
      disableDate: '2026-01-10',
      disableReason: '长期病假',
      reportTo: '王五',
      avatar: ''
    },
    {
      id: 11,
      name: '黄十三',
      employeeNo: 'E011',
      departmentId: 6,
      department: '财务部',
      position: '财务岗',
      level: '专员',
      phone: '138****0010',
      status: 'resigned',
      isAdmin: false,
      joinDate: '2020-01-05',
      resignDate: '2026-01-31',
      resignReason: '个人发展',
      avatar: ''
    },
    {
      id: 12,
      name: '刘十四',
      employeeNo: 'E012',
      departmentId: 3,
      department: '前端开发组',
      position: '前端开发岗',
      level: '专员',
      phone: '138****0011',
      status: 'resigned',
      isAdmin: false,
      joinDate: '2021-06-10',
      resignDate: '2026-02-28',
      resignReason: '跳槽',
      avatar: ''
    },
    {
      id: 13,
      name: '杨十五',
      employeeNo: 'E013',
      departmentId: 2,
      department: '技术部',
      position: '后端开发岗',
      level: '专员',
      phone: '138****0012',
      status: 'active',
      isAdmin: false,
      joinDate: '2023-09-01',
      reportTo: '李四',
      avatar: ''
    },
    {
      id: 14,
      name: '何十六',
      employeeNo: 'E014',
      departmentId: 4,
      department: '后端开发组',
      position: '后端开发岗',
      level: '主管',
      phone: '138****0013',
      status: 'active',
      isAdmin: false,
      joinDate: '2022-02-15',
      reportTo: '李四',
      avatar: ''
    },
    {
      id: 15,
      name: '马十七',
      employeeNo: 'E015',
      departmentId: 5,
      department: '产品部',
      position: '产品岗',
      level: '专员',
      phone: '138****0014',
      status: 'active',
      isAdmin: false,
      joinDate: '2023-11-01',
      reportTo: '王五',
      avatar: ''
    },
    {
      id: 16,
      name: '罗十八',
      employeeNo: 'E016',
      departmentId: 6,
      department: '财务部',
      position: '财务岗',
      level: '主管',
      phone: '138****0015',
      status: 'active',
      isAdmin: false,
      joinDate: '2021-08-20',
      reportTo: '系统管理员',
      avatar: ''
    },
    {
      id: 17,
      name: '梁十九',
      employeeNo: 'E017',
      departmentId: 3,
      department: '前端开发组',
      position: '前端开发岗',
      level: '主管',
      phone: '138****0016',
      status: 'active',
      isAdmin: false,
      joinDate: '2022-05-10',
      reportTo: '李四',
      avatar: ''
    },
    {
      id: 18,
      name: '宋二十',
      employeeNo: 'E018',
      departmentId: 4,
      department: '后端开发组',
      position: '后端开发岗',
      level: '专员',
      phone: '138****0017',
      status: 'active',
      isAdmin: false,
      joinDate: '2023-12-01',
      reportTo: '何十六',
      avatar: ''
    },
    {
      id: 19,
      name: '唐二一',
      employeeNo: 'E019',
      departmentId: 2,
      department: '技术部',
      position: '技术经理岗',
      level: '经理',
      phone: '138****0018',
      status: 'active',
      isAdmin: false,
      joinDate: '2021-01-15',
      reportTo: '系统管理员',
      avatar: ''
    },
    {
      id: 20,
      name: '韩二二',
      employeeNo: 'E020',
      departmentId: 5,
      department: '产品部',
      position: '产品岗',
      level: '专员',
      phone: '138****0019',
      status: 'resigned',
      isAdmin: false,
      joinDate: '2022-07-20',
      resignDate: '2026-03-15',
      resignReason: '转行',
      avatar: ''
    },
    {
      id: 100,
      name: '系统管理员',
      employeeNo: 'ADMIN',
      departmentId: 1,
      department: '公司总部',
      position: '管理员',
      level: '高管',
      phone: '138****9999',
      status: 'active',
      isAdmin: true,
      joinDate: '2019-01-01',
      avatar: ''
    }
  ]
  updateTotal()
}

// 加载岗位列表
const loadPositions = () => {
  positionsList.value = [
    { id: 1, name: '前端开发岗', departmentId: 2, jobTitle: '专员' },
    { id: 2, name: '后端开发岗', departmentId: 2, jobTitle: '专员' },
    { id: 3, name: '技术经理岗', departmentId: 2, jobTitle: '经理' },
    { id: 4, name: '产品岗', departmentId: 5, jobTitle: '主管' },
    { id: 5, name: '财务岗', departmentId: 6, jobTitle: '专员' }
  ]
}

// 更新总数
const updateTotal = () => {
  const filterData = activeTab.value === 'active' ? filteredActiveUsers.value :
      activeTab.value === 'disabled' ? filteredDisabledUsers.value :
          filteredResignedUsers.value
  total.value = filterData.length
}

// 判断用户是否在指定部门（包含子部门）
const isUserInDepartment = (user, deptId) => {
  if (deptId === 0) return true

  const deptIds = getDepartmentAndChildren(deptId)
  return deptIds.includes(user.departmentId)
}

// 获取部门及所有子部门ID
const getDepartmentAndChildren = (deptId) => {
  const ids = [deptId]

  const findChildren = (nodes) => {
    for (const node of nodes) {
      if (node.id === deptId && node.children) {
        node.children.forEach(child => {
          ids.push(child.id)
          if (child.children) {
            findChildren([child])
          }
        })
      }
    }
  }

  findChildren(departmentTree.value)
  return ids
}

// ==================== 事件处理 ====================

// 部门树点击
const handleDeptClick = (deptId) => {
  selectedDeptId.value = deptId
  currentPage.value = 1
  updateTotal()
}

// Tab切换
const handleTabChange = (tab) => {
  selectedRows.value = []
  currentPage.value = 1
  updateTotal()
}

// 选择变化
const handleSelectionChange = (selection) => {
  selectedRows.value = selection
}

// 新增
const handleAdd = () => {
  drawerType.value = 'add'
  currentUser.value = null
  showDrawer.value = true
}

// 编辑
const handleEdit = (row) => {
  drawerType.value = 'edit'
  currentUser.value = { ...row }
  showDrawer.value = true
  showDetailDrawer.value = false
}

// 查看
const handleView = (row) => {
  currentUser.value = row
  showDetailDrawer.value = true
}

// 禁用
const handleDisable = (row) => {
  if (row.isAdmin) {
    ElMessage.warning('超级管理员账号不可禁用')
    return
  }

  ElMessageBox.confirm(`确定要禁用人员「${row.name}」吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    row.status = 'disabled'
    row.disableDate = new Date().toISOString().split('T')[0]
    ElMessage.success('禁用成功')
    updateTotal()
  })
}

// 启用
const handleEnable = (row) => {
  ElMessageBox.confirm(`确定要启用人员「${row.name}」吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    row.status = 'active'
    row.disableDate = null
    row.disableReason = null
    ElMessage.success('启用成功')
    updateTotal()
  })
}

// 离职
const handleResign = (row) => {
  if (row.isAdmin) {
    ElMessage.warning('超级管理员账号不可离职')
    return
  }
  currentUser.value = row
  showResignDialog.value = true
}

// 重置密码
const handleResetPassword = (row) => {
  ElMessageBox.confirm(`确定要重置「${row.name}」的登录密码吗？`, '重置密码', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('密码重置成功，初始密码已发送至该员工手机号')
  }).catch(() => {
    // 用户取消，不做处理
  })
}

// 确认保存
const handleConfirmSave = (formData) => {
  if (formData.id) {
    // 编辑模式
    const index = userList.value.findIndex(item => item.id === formData.id)
    if (index !== -1) {
      userList.value[index] = { ...userList.value[index], ...formData }
    }
    ElMessage.success('编辑成功')
  } else {
    // 新增模式
    formData.id = Date.now()
    formData.employeeNo = `E${String(userList.value.length + 1).padStart(3, '0')}`
    userList.value.push(formData)
    ElMessage.success('新增成功')
  }
  showDrawer.value = false
  updateTotal()
}

// 确认离职
const handleConfirmResign = (formData) => {
  currentUser.value.status = 'resigned'
  currentUser.value.resignDate = formData.resignDate
  currentUser.value.resignReason = formData.resignReason
  ElMessage.success('离职办理成功')
  showResignDialog.value = false
  updateTotal()
}

// 批量启用
const handleBatchEnable = () => {
  if (selectedRows.value.length === 0) return

  ElMessageBox.confirm(
      `确定要批量启用 ${selectedRows.value.length} 名人员吗？`,
      '批量启用',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
  ).then(() => {
    selectedRows.value.forEach(row => {
      if (!row.isAdmin) {
        row.status = 'active'
        row.disableDate = null
        row.disableReason = null
      }
    })
    ElMessage.success('批量启用成功')
    selectedRows.value = []
    updateTotal()
  })
}

// 批量禁用
const handleBatchDisable = () => {
  if (selectedRows.value.length === 0) return

  const adminRows = selectedRows.value.filter(row => row.isAdmin)

  if (adminRows.length > 0) {
    ElMessage.warning('选中的人员中包含超级管理员，无法批量禁用')
    return
  }

  ElMessageBox.confirm(
      `确定要批量禁用 ${selectedRows.value.length} 名人员吗？`,
      '批量禁用',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
  ).then(() => {
    selectedRows.value.forEach(row => {
      if (row.status === 'active') {
        row.status = 'disabled'
        row.disableDate = new Date().toISOString().split('T')[0]
      }
    })
    ElMessage.success('批量禁用成功')
    selectedRows.value = []
    updateTotal()
  })
}

// 批量调岗
const handleBatchTransfer = () => {
  if (selectedRows.value.length === 0) return

  const adminRows = selectedRows.value.filter(row => row.isAdmin)

  if (adminRows.length > 0) {
    ElMessage.warning('选中的人员中包含超级管理员，无法批量调岗')
    return
  }

  showBatchTransferDialog.value = true
}

// 确认批量调岗
const handleConfirmBatchTransfer = (formData) => {
  selectedRows.value.forEach(row => {
    row.departmentId = formData.departmentId
    row.department = formData.departmentName
    row.positionId = formData.positionId
    row.position = formData.positionName
  })
  ElMessage.success(`已成功调岗 ${selectedRows.value.length} 名人员`)
  showBatchTransferDialog.value = false
  selectedRows.value = []
}

// 批量离职
const handleBatchResign = () => {
  if (selectedRows.value.length === 0) return

  const adminRows = selectedRows.value.filter(row => row.isAdmin)

  if (adminRows.length > 0) {
    ElMessage.warning('选中的人员中包含超级管理员，无法批量离职')
    return
  }

  ElMessageBox.confirm(
      `确定要批量办理 ${selectedRows.value.length} 名人员离职吗？`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
  ).then(() => {
    selectedRows.value.forEach(row => {
      if (row.status !== 'resigned') {
        row.status = 'resigned'
        row.resignDate = new Date().toISOString().split('T')[0]
      }
    })
    ElMessage.success('批量离职成功')
    selectedRows.value = []
    updateTotal()
  })
}

// 导出
const handleExport = () => {
  ElMessage.success(`${activeTab.value === 'active' ? '组织用户' : activeTab.value === 'disabled' ? '禁用用户' : '历史用户'}数据导出成功`)
}

// 刷新
const handleRefresh = () => {
  loadUserList()
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
  loadUserList()
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

// 拖拽调整宽度
const startResize = (e) => {
  const startX = e.clientX
  const treePanel = document.querySelector('.user-tree-panel')
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
.user-management-page {
  padding: 20px;
  height: calc(100vh - 60px);
  display: flex;
  flex-direction: column;
  background: #f5f7fa;

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

  .user-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    min-width: 0;
  }

  .user-tabs {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    :deep(.el-tabs__header) {
      margin: 0 0 16px 0;
      padding-bottom: 0;
      border-bottom: 1px solid #ebeef5;
    }

    :deep(.el-tabs__content) {
      flex: 1;
      overflow: hidden;
      padding: 0;
    }

    :deep(.el-tab-pane) {
      height: 100%;
      display: flex;
      flex-direction: column;
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
