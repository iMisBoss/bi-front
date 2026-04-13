<template>
  <div class="group-management-page">
    <el-card class="main-card" shadow="never">
      <!-- 顶部工具栏 -->
      <div class="toolbar">
        <div class="toolbar-left">
          <el-button-group>
            <el-button @click="handleBatchDisband" :disabled="selectedGroups.length === 0">批量解散</el-button>
            <el-button @click="handleBatchDisable" :disabled="selectedGroups.length === 0">批量禁用</el-button>
            <el-button @click="handleExportGroups">导出</el-button>
          </el-button-group>
        </div>

        <div class="toolbar-center">
          <el-dropdown @command="handleAddCommand">
            <el-button type="primary">
              新增<el-icon class="el-icon--right"><arrow-down /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="manual">手动建群</el-dropdown-item>
                <el-dropdown-item command="template">模板建群</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <el-button @click="showImportDialog = true">导入</el-button>
          <el-button @click="handleRefresh">刷新</el-button>
          <el-button @click="showSettings = true">显示设置</el-button>
        </div>

        <div class="toolbar-right">
          <el-input
              v-model="searchKeyword"
              placeholder="输入群名称/群主/群ID搜索"
              prefix-icon="Search"
              clearable
              style="width: 240px"
              @input="handleSearch"
          />
          <el-select v-model="typeFilter" placeholder="群组类型" style="width: 120px" @change="handleFilter">
            <el-option label="全部" value="" />
            <el-option label="部门群" value="部门群" />
            <el-option label="项目群" value="项目群" />
            <el-option label="系统群" value="系统群" />
            <el-option label="临时群" value="临时群" />
          </el-select>
          <el-select v-model="statusFilter" placeholder="群状态" style="width: 100px" @change="handleFilter">
            <el-option label="全部" value="" />
            <el-option label="启用" value="enabled" />
            <el-option label="禁用" value="disabled" />
          </el-select>
        </div>
      </div>

      <!-- 主内容区 -->
      <div class="content-wrapper">
        <GroupTable
            :groups="filteredGroups"
            v-model:page="currentPage"
            v-model:page-size="pageSize"
            :total="total"
            @selection-change="handleSelectionChange"
            @row-click="handleRowClick"
            @edit-group="handleEditGroup"
            @view-group="handleViewGroup"
            @disable-group="handleDisableGroup"
            @enable-group="handleEnableGroup"
            @disband-group="handleDisbandGroup"
        />
      </div>
    </el-card>

    <!-- 群组详情抽屉 -->
    <GroupDrawer
        v-model="drawerVisible"
        v-model:active-tab="drawerActiveTab"
        :current-group="currentGroup"
        :basic-form="groupBasicForm"
        :members="groupMembers"
        :logs="groupLogs"
        @edit-group="handleEditGroup"
        @add-members="handleAddMembers"
        @disband-group="handleDisbandGroup"
        @disable-group="handleDisableGroup"
        @enable-group="handleEnableGroup"
        @remove-member="handleRemoveMember"
        @transfer-owner="handleTransferOwner"
    />

    <!-- 新增/编辑群组对话框 -->
    <GroupAddDialog
        v-model="showAddDialog"
        :group-data="editingGroup"
        @confirm="handleConfirmGroup"
    />

    <!-- 导入群组对话框 -->
    <GroupImportDialog
        v-model="showImportDialog"
        @download-template="downloadTemplate"
        @confirm-import="handleConfirmImport"
    />

    <!-- 添加成员对话框 -->
    <el-dialog v-model="showAddMemberDialog" title="添加群成员" width="600px">
      <UserSelectDialog
          v-model="selectedUsers"
          :multiple="true"
          title="选择成员"
      />
      <template #footer>
        <el-button @click="showAddMemberDialog = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmAddMembers">确定</el-button>
      </template>
    </el-dialog>

    <!-- 转让群主对话框 -->
    <el-dialog v-model="showTransferDialog" title="转让群主" width="500px">
      <el-form :model="transferForm" label-width="100px">
        <el-form-item label="新群主" required>
          <UserSelectDialog
              v-model="transferForm.newOwnerId"
              :multiple="false"
              title="选择新群主"
          />
        </el-form-item>
        <el-form-item label="备注">
          <el-input
              v-model="transferForm.remark"
              type="textarea"
              :rows="3"
              placeholder="请输入转让原因"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showTransferDialog = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmTransfer">确定</el-button>
      </template>
    </el-dialog>

    <!-- 显示设置对话框 -->
    <el-dialog v-model="showSettings" title="列表显示设置" width="500px">
      <el-form label-width="120px">
        <el-form-item label="显示字段">
          <el-checkbox-group v-model="settings.visibleFields">
            <el-checkbox label="type">群组类型</el-checkbox>
            <el-checkbox label="owner">群主</el-checkbox>
            <el-checkbox label="memberCount">成员数</el-checkbox>
            <el-checkbox label="status">群状态</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showSettings = false">取消</el-button>
        <el-button type="primary" @click="showSettings = false">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowDown } from '@element-plus/icons-vue'
import GroupTable from './components/GroupTable.vue'
import GroupDrawer from './components/GroupDrawer.vue'
import GroupAddDialog from './components/GroupAddDialog.vue'
import GroupImportDialog from './components/GroupImportDialog.vue'
import UserSelectDialog from '@/components/UserSelectDialog.vue'

const searchKeyword = ref('')
const typeFilter = ref('')
const statusFilter = ref('')
const showImportDialog = ref(false)
const showAddDialog = ref(false)
const showSettings = ref(false)
const drawerVisible = ref(false)
const drawerActiveTab = ref('basic')
const selectedGroups = ref([])
const editingGroup = ref(null)
const currentGroup = ref(null)
const showAddMemberDialog = ref(false)
const showTransferDialog = ref(false)
const selectedUsers = ref([])

const groups = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

const groupBasicForm = reactive({
  id: null,
  name: '',
  groupId: '',
  type: '',
  ownerId: null,
  ownerName: '',
  status: 'enabled',
  remark: ''
})

const groupMembers = ref([])
const groupLogs = ref([])

const transferForm = reactive({
  newOwnerId: null,
  remark: ''
})

const settings = reactive({
  visibleFields: ['type', 'owner', 'memberCount', 'status']
})

onMounted(() => {
  loadGroups()
})

const loadGroups = () => {
  groups.value = [
    {
      id: 1,
      groupId: 'GRP001',
      name: '技术部工作群',
      type: '部门群',
      ownerId: 1,
      ownerName: '张三',
      memberCount: 15,
      status: 'enabled',
      avatar: '',
      createTime: '2026-01-15 10:00:00',
      linkedProcesses: 0
    },
    {
      id: 2,
      groupId: 'GRP002',
      name: '新产品项目组',
      type: '项目群',
      ownerId: 2,
      ownerName: '李四',
      memberCount: 8,
      status: 'enabled',
      avatar: '',
      createTime: '2026-02-20 14:30:00',
      linkedProcesses: 2
    },
    {
      id: 3,
      groupId: 'GRP003',
      name: '全员通知群',
      type: '系统群',
      ownerId: 1,
      ownerName: '张三',
      memberCount: 156,
      status: 'enabled',
      avatar: '',
      createTime: '2025-12-01 09:00:00',
      linkedProcesses: 0
    },
    {
      id: 4,
      groupId: 'GRP004',
      name: '临时攻坚群',
      type: '临时群',
      ownerId: 3,
      ownerName: '王五',
      memberCount: 5,
      status: 'disabled',
      avatar: '',
      createTime: '2026-03-10 16:00:00',
      linkedProcesses: 0
    }
  ]
  total.value = groups.value.length
}

const filteredGroups = computed(() => {
  let data = [...groups.value]

  if (searchKeyword.value) {
    data = data.filter(item =>
        item.name.includes(searchKeyword.value) ||
        item.ownerName.includes(searchKeyword.value) ||
        item.groupId.toLowerCase().includes(searchKeyword.value.toLowerCase())
    )
  }

  if (typeFilter.value) {
    data = data.filter(item => item.type === typeFilter.value)
  }

  if (statusFilter.value) {
    data = data.filter(item => item.status === statusFilter.value)
  }

  return data
})

const handleSearch = () => {}

const handleFilter = () => {}

const handleRefresh = () => {
  loadGroups()
  ElMessage.success('刷新成功')
}

const handleAddCommand = (command) => {
  editingGroup.value = null
  if (command === 'manual') {
    showAddDialog.value = true
  } else if (command === 'template') {
    ElMessage.info('模板建群功能开发中')
  }
}

const handleSelectionChange = (selection) => {
  selectedGroups.value = selection
}

const handleRowClick = (row) => {
  handleViewGroup(row)
}

const handleEditGroup = (row) => {
  editingGroup.value = row
  drawerVisible.value = false
  showAddDialog.value = true
}

const handleViewGroup = (row) => {
  currentGroup.value = row
  Object.assign(groupBasicForm, { ...row })

  // 加载成员列表
  groupMembers.value = [
    { id: 1, name: '张三', position: '技术总监', joinTime: '2026-01-15 10:00:00', isOwner: true },
    { id: 2, name: '李四', position: '前端工程师', joinTime: '2026-01-15 10:05:00', isOwner: false },
    { id: 3, name: '王五', position: '后端工程师', joinTime: '2026-01-16 09:00:00', isOwner: false }
  ]

  // 加载操作日志
  groupLogs.value = [
    { operator: '管理员', time: '2026-01-15 10:00:00', type: 'create', content: '创建群组', ip: '192.168.1.100' },
    { operator: '张三', time: '2026-01-15 10:05:00', type: 'add_member', content: '添加成员：李四', ip: '192.168.1.101' },
    { operator: '张三', time: '2026-01-16 09:00:00', type: 'add_member', content: '添加成员：王五', ip: '192.168.1.101' }
  ]

  drawerActiveTab.value = 'basic'
  drawerVisible.value = true
}

const handleConfirmGroup = (formData) => {
  if (formData.id) {
    const index = groups.value.findIndex(item => item.id === formData.id)
    if (index !== -1) {
      groups.value[index] = { ...groups.value[index], ...formData }
    }
    ElMessage.success('编辑成功')
  } else {
    formData.id = groups.value.length + 1
    formData.groupId = `GRP${String(formData.id).padStart(3, '0')}`
    formData.memberCount = 0
    formData.linkedProcesses = 0
    formData.createTime = new Date().toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).replace(/\//g, '-')
    groups.value.push(formData)
    ElMessage.success('创建成功')
  }
  showAddDialog.value = false
  editingGroup.value = null
  loadGroups()
}

const handleDisableGroup = (row) => {
  ElMessageBox.confirm(`确定要禁用群组「${row.name}」吗？禁用后群聊不可发消息。`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    row.status = 'disabled'
    ElMessage.success('禁用成功')
    if (drawerVisible.value) {
      loadGroups()
    }
  })
}

const handleEnableGroup = (row) => {
  ElMessageBox.confirm(`确定要启用群组「${row.name}」吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    row.status = 'enabled'
    ElMessage.success('启用成功')
    if (drawerVisible.value) {
      loadGroups()
    }
  })
}

const handleDisbandGroup = (row) => {
  ElMessageBox.confirm(
      `解散后群数据将归档，无法恢复，是否继续解散「${row.name}」？`,
      '警告',
      {
        confirmButtonText: '确定解散',
        cancelButtonText: '取消',
        type: 'error',
        distinguishCancelAndClose: true
      }
  ).then(() => {
    groups.value = groups.value.filter(item => item.id !== row.id)
    ElMessage.success('解散成功，数据已归档')
    drawerVisible.value = false
    loadGroups()
  })
}

const handleBatchDisband = () => {
  ElMessageBox.confirm(
      `解散后群数据将归档，无法恢复，确定要解散选中的 ${selectedGroups.value.length} 个群组吗？`,
      '警告',
      {
        confirmButtonText: '确定解散',
        cancelButtonText: '取消',
        type: 'error',
        distinguishCancelAndClose: true
      }
  ).then(() => {
    groups.value = groups.value.filter(item => {
      return !selectedGroups.value.find(sel => sel.id === item.id)
    })
    ElMessage.success('批量解散成功，数据已归档')
    selectedGroups.value = []
    loadGroups()
  })
}

const handleBatchDisable = () => {
  ElMessageBox.confirm(`确定要批量禁用 ${selectedGroups.value.length} 个群组吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    selectedGroups.value.forEach(row => {
      row.status = 'disabled'
    })
    ElMessage.success('批量禁用成功')
    selectedGroups.value = []
    loadGroups()
  })
}

const handleExportGroups = () => {
  ElMessage.success('导出成功')
}

const downloadTemplate = () => {
  ElMessage.success('模板下载成功')
}

const handleConfirmImport = () => {
  ElMessage.success('导入成功')
  showImportDialog.value = false
  loadGroups()
}

const handleAddMembers = () => {
  showAddMemberDialog.value = true
}

const handleConfirmAddMembers = () => {
  if (selectedUsers.value.length === 0) {
    ElMessage.warning('请选择要添加的成员')
    return
  }

  // 模拟添加成员
  selectedUsers.value.forEach(user => {
    groupMembers.value.push({
      id: user.id,
      name: user.name,
      position: user.position || '未设置',
      joinTime: new Date().toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }).replace(/\//g, '-'),
      isOwner: false
    })
  })

  // 更新成员数
  if (currentGroup.value) {
    currentGroup.value.memberCount = groupMembers.value.length
  }

  ElMessage.success(`成功添加 ${selectedUsers.value.length} 名成员`)
  showAddMemberDialog.value = false
  selectedUsers.value = []
}

const handleRemoveMember = (member) => {
  ElMessageBox.confirm(`确定要将「${member.name}」移出群组吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = groupMembers.value.findIndex(m => m.id === member.id)
    if (index !== -1) {
      groupMembers.value.splice(index, 1)
    }

    // 更新成员数
    if (currentGroup.value) {
      currentGroup.value.memberCount = groupMembers.value.length
    }

    ElMessage.success('移除成功')
  })
}

const handleTransferOwner = (member) => {
  transferForm.newOwnerId = member.id
  transferForm.remark = ''
  showTransferDialog.value = true
}

const handleConfirmTransfer = () => {
  if (!transferForm.newOwnerId) {
    ElMessage.warning('请选择新群主')
    return
  }

  // 找到新群主信息
  const newOwner = groupMembers.value.find(m => m.id === transferForm.newOwnerId)

  // 更新所有成员的群主标识
  groupMembers.value.forEach(member => {
    member.isOwner = member.id === transferForm.newOwnerId
  })

  // 更新群组基本信息
  if (currentGroup.value && newOwner) {
    currentGroup.value.ownerId = newOwner.id
    currentGroup.value.ownerName = newOwner.name
    groupBasicForm.ownerId = newOwner.id
    groupBasicForm.ownerName = newOwner.name
  }

  // 添加操作日志
  groupLogs.value.unshift({
    operator: '管理员',
    time: new Date().toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).replace(/\//g, '-'),
    type: 'transfer_owner',
    content: `转让群主给：${newOwner?.name}`,
    ip: '192.168.1.100'
  })

  ElMessage.success('群主转让成功')
  showTransferDialog.value = false
  transferForm.newOwnerId = null
  transferForm.remark = ''
}
</script>

<style lang="scss" scoped>
.group-management-page {
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
    overflow: hidden;
  }
}
</style>
