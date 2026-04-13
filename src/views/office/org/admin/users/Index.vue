<template>
  <div class="user-management-page">
    <el-card class="main-card" shadow="never">
      <div class="toolbar">
        <div class="toolbar-left">
          <el-button-group>
            <el-button @click="handleBatchEnable" :disabled="selectedRows.length === 0">批量启用</el-button>
            <el-button @click="handleBatchDisable" :disabled="selectedRows.length === 0">批量禁用</el-button>
            <el-button @click="handleBatchResign" :disabled="selectedRows.length === 0">批量离职</el-button>
            <el-button @click="handleExport">导出</el-button>
          </el-button-group>
        </div>

        <div class="toolbar-center">
          <el-button type="primary" @click="handleAdd">新增</el-button>
          <el-button @click="showImportDialog = true">导入</el-button>
          <el-button @click="handleRefresh">刷新</el-button>
        </div>

        <div class="toolbar-right">
          <el-input
              v-model="searchKeyword"
              placeholder="输入姓名/工号/手机号搜索"
              prefix-icon="Search"
              clearable
              style="width: 240px"
              @input="handleSearch"
          />
          <el-tree-select
              v-model="departmentFilter"
              :data="departmentTree"
              :props="{ value: 'id', label: 'name', children: 'children' }"
              node-key="id"
              check-strictly
              clearable
              placeholder="所属部门"
              style="width: 150px"
              @change="handleFilter"
          />
          <el-select v-model="statusFilter" placeholder="人员状态" style="width: 120px" @change="handleFilter">
            <el-option label="全部" value="" />
            <el-option label="在职" value="active" />
            <el-option label="禁用" value="disabled" />
            <el-option label="离职" value="resigned" />
          </el-select>
        </div>
      </div>

      <div class="content-wrapper">
        <el-table
            :data="filteredTableData"
            border
            @selection-change="handleSelectionChange"
            row-key="id"
        >
          <el-table-column type="selection" width="50" />
          <el-table-column label="头像姓名" width="150">
            <template #default="{ row }">
              <div class="user-cell">
                <span class="user-name">{{ row.name }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="employeeNo" label="工号" width="100" />
          <el-table-column prop="department" label="所属部门" width="120" />
          <el-table-column prop="position" label="岗位" width="150" />
          <el-table-column prop="job" label="职务" width="100" />
          <el-table-column prop="phone" label="手机号" width="130" />
          <el-table-column prop="status" label="人员状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)">{{ getStatusLabel(row.status) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" fixed="right" width="250">
            <template #default="{ row }">
              <el-button
                  link
                  type="primary"
                  size="small"
                  :disabled="row.status === 'resigned'"
                  @click="handleEdit(row)"
              >
                编辑
              </el-button>
              <el-button link type="primary" size="small" @click="handleView(row)">查看</el-button>
              <el-button
                  v-if="row.status === 'active'"
                  link
                  type="warning"
                  size="small"
                  @click="handleDisable(row)"
              >
                禁用
              </el-button>
              <el-button
                  v-else-if="row.status === 'disabled'"
                  link
                  type="success"
                  size="small"
                  @click="handleEnable(row)"
              >
                启用
              </el-button>
              <el-button
                  link
                  type="danger"
                  size="small"
                  :disabled="row.status === 'resigned' || row.isAdmin"
                  @click="handleResign(row)"
              >
                离职
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div class="pagination-wrapper">
        <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :total="total"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
        />
      </div>
    </el-card>

    <UserAddDialog
        v-model="showAddDialog"
        :user-data="currentUser"
        :department-tree="departmentTree"
        :positions="positionsList"
        @confirm="handleConfirmAdd"
    />

    <UserImportDialog
        v-model="showImportDialog"
        @download-template="downloadTemplate"
        @confirm-import="handleConfirmImport"
    />

    <el-drawer
        v-model="drawerVisible"
        :title="`${currentUser?.name || ''}（人员）`"
        size="600px"
    >
      <template #header>
        <div class="drawer-header">
          <h3 class="drawer-title">{{ currentUser?.name }}（人员）</h3>
          <div class="drawer-actions">
            <el-button
                size="small"
                :disabled="currentUser?.status === 'resigned'"
                @click="handleEdit(currentUser)"
            >
              编辑
            </el-button>
            <el-button
                v-if="currentUser?.status === 'active'"
                size="small"
                type="warning"
                :disabled="currentUser?.isAdmin"
                @click="handleDisable(currentUser)"
            >
              禁用
            </el-button>
            <el-button
                v-else-if="currentUser?.status === 'disabled'"
                size="small"
                type="success"
                @click="handleEnable(currentUser)"
            >
              启用
            </el-button>
            <el-button
                size="small"
                type="danger"
                :disabled="currentUser?.status === 'resigned' || currentUser?.isAdmin"
                @click="handleResign(currentUser)"
            >
              离职办理
            </el-button>
          </div>
        </div>
      </template>

      <el-tabs v-model="activeTab">
        <el-tab-pane label="基本信息" name="basic">
          <el-form :model="basicForm" label-width="100px" class="basic-form">
            <el-divider content-position="left">基础信息</el-divider>
            <el-form-item label="姓名">
              <el-input v-model="basicForm.name" :disabled="!isEditMode" />
            </el-form-item>
            <el-form-item label="性别">
              <el-radio-group v-model="basicForm.gender" :disabled="!isEditMode">
                <el-radio label="male">男</el-radio>
                <el-radio label="female">女</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="工号">
              <el-input v-model="basicForm.employeeNo" disabled />
            </el-form-item>
            <el-form-item label="手机号">
              <el-input v-model="basicForm.phone" :disabled="!isEditMode" />
            </el-form-item>
            <el-form-item label="邮箱">
              <el-input v-model="basicForm.email" :disabled="!isEditMode" />
            </el-form-item>
            <el-form-item label="入职日期">
              <el-date-picker
                  v-model="basicForm.joinDate"
                  type="date"
                  placeholder="选择日期"
                  :disabled="!isEditMode"
              />
            </el-form-item>
            <el-form-item label="转正日期">
              <el-date-picker
                  v-model="basicForm.probationDate"
                  type="date"
                  placeholder="选择日期"
                  :disabled="!isEditMode"
              />
            </el-form-item>

            <el-divider content-position="left">账号信息</el-divider>
            <el-form-item label="登录账号">
              <el-input v-model="basicForm.account" disabled />
            </el-form-item>
            <el-form-item label="账号状态">
              <el-tag :type="getStatusType(basicForm.status)">{{ getStatusLabel(basicForm.status) }}</el-tag>
            </el-form-item>

            <el-divider content-position="left">辅助信息</el-divider>
            <el-form-item label="办公地点">
              <el-input v-model="basicForm.location" :disabled="!isEditMode" />
            </el-form-item>
            <el-form-item label="紧急联系人">
              <el-input v-model="basicForm.emergencyContact" :disabled="!isEditMode" />
            </el-form-item>
            <el-form-item label="备注">
              <el-input
                  v-model="basicForm.remark"
                  type="textarea"
                  :rows="3"
                  maxlength="200"
                  show-word-limit
                  :disabled="!isEditMode"
              />
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="组织岗位" name="organization">
          <el-form :model="orgForm" label-width="100px" class="basic-form">
            <el-form-item label="所属部门" required>
              <el-tree-select
                  v-model="orgForm.departmentId"
                  :data="departmentTree"
                  :props="{ value: 'id', label: 'name', children: 'children' }"
                  node-key="id"
                  check-strictly
                  clearable
                  placeholder="选择部门"
                  :disabled="!isEditMode"
              />
            </el-form-item>
            <el-form-item label="所属岗位" required>
              <el-select
                  v-model="orgForm.positionId"
                  placeholder="选择岗位"
                  :disabled="!isEditMode || !orgForm.departmentId"
                  style="width: 100%"
              >
                <el-option
                    v-for="pos in filteredPositions"
                    :key="pos.id"
                    :label="pos.name"
                    :value="pos.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="所属职务">
              <el-input v-model="orgForm.jobTitle" disabled placeholder="自动继承岗位职务" />
            </el-form-item>
            <el-form-item label="汇报对象">
              <el-select
                  v-model="orgForm.reportToId"
                  placeholder="选择汇报对象"
                  clearable
                  :disabled="!isEditMode"
                  style="width: 100%"
              >
                <el-option
                    v-for="user in userList"
                    :key="user.id"
                    :label="user.name"
                    :value="user.id"
                />
              </el-select>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="操作日志" name="logs">
          <div class="logs-toolbar">
            <el-select v-model="logOperatorFilter" placeholder="操作人" size="small" style="width: 120px" clearable>
              <el-option v-for="op in logOperators" :key="op" :label="op" :value="op" />
            </el-select>
            <el-date-picker
                v-model="logDateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                size="small"
                style="width: 240px"
            />
            <el-select v-model="logTypeFilter" placeholder="操作类型" size="small" style="width: 120px" clearable>
              <el-option label="新增" value="create" />
              <el-option label="编辑" value="edit" />
              <el-option label="禁用" value="disable" />
              <el-option label="启用" value="enable" />
              <el-option label="离职" value="resign" />
              <el-option label="调岗" value="transfer" />
              <el-option label="重置密码" value="resetPwd" />
            </el-select>
            <el-button size="small" @click="handleExportLogs">导出日志</el-button>
          </div>
          <el-table :data="filteredLogs" border>
            <el-table-column prop="operator" label="操作人" width="120" />
            <el-table-column prop="time" label="操作时间" width="180" />
            <el-table-column prop="type" label="操作类型" width="100">
              <template #default="{ row }">
                <el-tag :type="getLogTypeTag(row.type)">{{ getLogTypeLabel(row.type) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="content" label="操作内容" min-width="250" />
            <el-table-column prop="ip" label="操作IP" width="130" />
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-drawer>

    <el-dialog
        v-model="showResignDialog"
        title="离职办理"
        width="500px"
    >
      <el-alert
          title="离职后该人员账号将被冻结，待办审批将自动清空，请谨慎操作！"
          type="warning"
          :closable="false"
          style="margin-bottom: 16px"
      />
      <el-form :model="resignForm" label-width="100px">
        <el-form-item label="离职日期" required>
          <el-date-picker
              v-model="resignForm.resignDate"
              type="date"
              placeholder="选择离职日期"
              style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="离职原因">
          <el-input
              v-model="resignForm.resignReason"
              type="textarea"
              :rows="3"
              placeholder="请输入离职原因"
              maxlength="200"
              show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showResignDialog = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmResign">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import UserAddDialog from './components/UserAddDialog.vue'
import UserImportDialog from './components/UserImportDialog.vue'

const selectedRows = ref([])
const currentUser = ref(null)
const drawerVisible = ref(false)
const activeTab = ref('basic')
const isEditMode = ref(false)
const searchKeyword = ref('')
const departmentFilter = ref('')
const statusFilter = ref('')
const showAddDialog = ref(false)
const showImportDialog = ref(false)
const showResignDialog = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

const logOperatorFilter = ref('')
const logDateRange = ref([])
const logTypeFilter = ref('')

const basicForm = reactive({
  id: null,
  name: '',
  gender: 'male',
  employeeNo: '',
  phone: '',
  email: '',
  joinDate: '',
  probationDate: '',
  account: '',
  status: 'active',
  location: '',
  emergencyContact: '',
  remark: '',
  isAdmin: false
})

const orgForm = reactive({
  departmentId: null,
  positionId: null,
  jobTitle: '',
  reportToId: null
})

const resignForm = reactive({
  resignDate: '',
  resignReason: ''
})

const userList = ref([])
const departmentTree = ref([])
const positionsList = ref([])
const logs = ref([])

onMounted(() => {
  loadUserList()
  loadDepartmentTree()
  loadPositions()
})

const loadUserList = () => {
  userList.value = [
    { id: 1, name: '张三', employeeNo: 'E001', department: '技术部', position: '前端开发岗', job: '专员', phone: '138****0000', status: 'active', isAdmin: false, avatar: '' },
    { id: 2, name: '李四', employeeNo: 'E002', department: '技术部', position: '技术经理岗', job: '经理', phone: '138****0001', status: 'active', isAdmin: false, avatar: '' },
    { id: 3, name: '王五', employeeNo: 'E003', department: '产品部', position: '产品岗', job: '主管', phone: '138****0002', status: 'resigned', isAdmin: false, avatar: '' },
    { id: 4, name: '系统管理员', employeeNo: 'ADMIN', department: '公司总部', position: '管理员', job: '高管', phone: '138****9999', status: 'active', isAdmin: true, avatar: '' }
  ]
  total.value = userList.value.length
}

const loadDepartmentTree = () => {
  departmentTree.value = [
    { id: 1, name: '公司总部', children: [
        { id: 2, name: '技术部', children: [] },
        { id: 5, name: '产品部', children: [] }
      ]
    }
  ]
}

const loadPositions = () => {
  positionsList.value = [
    { id: 1, name: '前端开发岗', departmentId: 2, jobTitle: '专员' },
    { id: 2, name: '后端开发岗', departmentId: 2, jobTitle: '专员' },
    { id: 3, name: '技术经理岗', departmentId: 2, jobTitle: '经理' },
    { id: 4, name: '产品岗', departmentId: 5, jobTitle: '主管' }
  ]
}

const filteredTableData = computed(() => {
  let data = [...userList.value]

  if (searchKeyword.value) {
    data = data.filter(item =>
        item.name.includes(searchKeyword.value) ||
        item.employeeNo.includes(searchKeyword.value) ||
        item.phone.includes(searchKeyword.value)
    )
  }

  if (departmentFilter.value) {
    data = data.filter(item => item.department === getDepartmentName(departmentFilter.value))
  }

  if (statusFilter.value) {
    data = data.filter(item => item.status === statusFilter.value)
  }

  return data
})

const filteredPositions = computed(() => {
  if (!orgForm.departmentId) return []
  return positionsList.value.filter(pos => pos.departmentId === orgForm.departmentId)
})

const filteredLogs = computed(() => {
  let data = logs.value

  if (logOperatorFilter.value) {
    data = data.filter(log => log.operator === logOperatorFilter.value)
  }

  if (logTypeFilter.value) {
    data = data.filter(log => log.type === logTypeFilter.value)
  }

  if (logDateRange.value && logDateRange.value.length === 2) {
    const [start, end] = logDateRange.value
    data = data.filter(log => {
      const logTime = new Date(log.time)
      return logTime >= start && logTime <= end
    })
  }

  return data
})

const logOperators = computed(() => {
  return [...new Set(logs.value.map(log => log.operator))]
})

const getDepartmentName = (id) => {
  const findName = (nodes) => {
    for (const node of nodes) {
      if (node.id === id) return node.name
      if (node.children) {
        const found = findName(node.children)
        if (found) return found
      }
    }
    return null
  }
  return findName(departmentTree.value) || ''
}

const getStatusType = (status) => {
  const types = { active: 'success', disabled: 'info', resigned: 'danger' }
  return types[status] || ''
}

const getStatusLabel = (status) => {
  const labels = { active: '在职', disabled: '禁用', resigned: '离职' }
  return labels[status] || status
}

const handleSelectionChange = (selection) => {
  selectedRows.value = selection
}

const handleAdd = () => {
  currentUser.value = null
  isEditMode.value = false
  showAddDialog.value = true
}

const handleEdit = (row) => {
  Object.assign(basicForm, { ...row })
  Object.assign(orgForm, {
    departmentId: row.departmentId || null,
    positionId: row.positionId || null,
    jobTitle: row.job || '',
    reportToId: row.reportToId || null
  })
  currentUser.value = row
  isEditMode.value = true
  drawerVisible.value = false
  showAddDialog.value = true
}

const handleView = (row) => {
  Object.assign(basicForm, { ...row })
  Object.assign(orgForm, {
    departmentId: row.departmentId || null,
    positionId: row.positionId || null,
    jobTitle: row.job || '',
    reportToId: row.reportToId || null
  })
  currentUser.value = row
  isEditMode.value = false

  logs.value = [
    { operator: '管理员', time: '2026-04-13 10:00:00', type: 'create', content: '新增人员', ip: '192.168.1.100' },
    { operator: '管理员', time: '2026-04-13 11:00:00', type: 'edit', content: '编辑人员信息', ip: '192.168.1.100' }
  ]

  drawerVisible.value = true
}

const handleConfirmAdd = (formData) => {
  if (formData.id) {
    const index = userList.value.findIndex(item => item.id === formData.id)
    if (index !== -1) {
      userList.value[index] = { ...userList.value[index], ...formData }
    }
    ElMessage.success('编辑成功')
  } else {
    formData.id = userList.value.length + 1
    formData.employeeNo = `E${String(formData.id).padStart(3, '0')}`
    formData.account = formData.phone
    userList.value.push(formData)
    ElMessage.success('新增成功')
  }
  showAddDialog.value = false
  currentUser.value = null
  loadUserList()
}

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
    ElMessage.success('禁用成功')
    if (drawerVisible.value) {
      loadUserList()
    }
  })
}

const handleEnable = (row) => {
  ElMessageBox.confirm(`确定要启用人员「${row.name}」吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    row.status = 'active'
    ElMessage.success('启用成功')
    if (drawerVisible.value) {
      loadUserList()
    }
  })
}

const handleResign = (row) => {
  if (row.isAdmin) {
    ElMessage.warning('超级管理员账号不可离职')
    return
  }
  currentUser.value = row
  resignForm.resignDate = ''
  resignForm.resignReason = ''
  showResignDialog.value = true
}

const handleConfirmResign = () => {
  if (!resignForm.resignDate) {
    ElMessage.warning('请选择离职日期')
    return
  }
  currentUser.value.status = 'resigned'
  ElMessage.success('离职办理成功')
  showResignDialog.value = false
  drawerVisible.value = false
  loadUserList()
}

const handleBatchEnable = () => {
  const activeRows = selectedRows.value.filter(row => row.status !== 'active')
  if (activeRows.length === 0) {
    ElMessage.warning('选中的人员均已在职')
    return
  }
  ElMessageBox.confirm(`确定要批量启用 ${activeRows.length} 名人员吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    activeRows.forEach(row => {
      if (!row.isAdmin) {
        row.status = 'active'
      }
    })
    ElMessage.success('批量启用成功')
    selectedRows.value = []
    loadUserList()
  })
}

const handleBatchDisable = () => {
  const adminRows = selectedRows.value.filter(row => row.isAdmin)
  if (adminRows.length > 0) {
    ElMessage.warning('选中的人员中包含超级管理员，无法批量禁用')
    return
  }
  ElMessageBox.confirm(`确定要批量禁用 ${selectedRows.value.length} 名人员吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    selectedRows.value.forEach(row => {
      if (row.status === 'active') {
        row.status = 'disabled'
      }
    })
    ElMessage.success('批量禁用成功')
    selectedRows.value = []
    loadUserList()
  })
}

const handleBatchResign = () => {
  const adminRows = selectedRows.value.filter(row => row.isAdmin)
  if (adminRows.length > 0) {
    ElMessage.warning('选中的人员中包含超级管理员，无法批量离职')
    return
  }
  ElMessageBox.confirm(`确定要批量办理 ${selectedRows.value.length} 名人员离职吗？`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    selectedRows.value.forEach(row => {
      if (row.status !== 'resigned') {
        row.status = 'resigned'
      }
    })
    ElMessage.success('批量离职成功')
    selectedRows.value = []
    loadUserList()
  })
}

const handleExport = () => {
  ElMessage.success('导出成功')
}

const handleRefresh = () => {
  loadUserList()
  ElMessage.success('刷新成功')
}

const handleSearch = () => {}

const handleFilter = () => {}

const downloadTemplate = () => {
  ElMessage.success('模板下载成功')
}

const handleConfirmImport = () => {
  ElMessage.success('导入成功')
  showImportDialog.value = false
  loadUserList()
}

const handleExportLogs = () => {
  ElMessage.success('日志导出成功')
}

const getLogTypeTag = (type) => {
  const tags = {
    create: 'success',
    edit: 'primary',
    disable: 'warning',
    enable: 'success',
    resign: 'danger',
    transfer: 'info',
    resetPwd: 'warning'
  }
  return tags[type] || ''
}

const getLogTypeLabel = (type) => {
  const labels = {
    create: '新增',
    edit: '编辑',
    disable: '禁用',
    enable: '启用',
    resign: '离职',
    transfer: '调岗',
    resetPwd: '重置密码'
  }
  return labels[type] || type
}
</script>

<style lang="scss" scoped>
.user-management-page {
  padding: 20px;
  height: calc(100vh - 60px);
  display: flex;
  flex-direction: column;

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
    overflow: auto;
    min-height: 0;
  }

  .pagination-wrapper {
    margin-top: 16px;
    display: flex;
    justify-content: flex-end;
  }

  .user-cell {
    display: flex;
    align-items: center;
    gap: 8px;

    .user-name {
      font-weight: 500;
    }
  }

  .drawer-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;

    .drawer-title {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
    }

    .drawer-actions {
      display: flex;
      gap: 8px;
    }
  }

  .basic-form {
    max-width: 500px;
  }

  .logs-toolbar {
    margin-bottom: 16px;
    display: flex;
    gap: 8px;
    align-items: center;
    flex-wrap: wrap;
  }
}
</style>
