<template>
  <div class="contacts-management-page">
    <el-card class="main-card" shadow="never">
      <div class="toolbar">
        <div class="toolbar-left">
          <template v-if="activeTab === 'external'">
            <el-button-group>
              <el-button @click="handleBatchEnableExternal" :disabled="selectedExternalContacts.length === 0">批量启用</el-button>
              <el-button @click="handleBatchDisableExternal" :disabled="selectedExternalContacts.length === 0">批量禁用</el-button>
              <el-button @click="handleBatchDeleteExternal" :disabled="selectedExternalContacts.length === 0">批量删除</el-button>
              <el-button @click="handleExportExternal">导出</el-button>
            </el-button-group>
          </template>

          <el-dropdown v-if="activeTab === 'external'" @command="handleAddCommand">
            <el-button type="primary">
              新增<el-icon class="el-icon--right"><arrow-down /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="contact">新增外部联系人</el-dropdown-item>
                <el-dropdown-item command="rule">新增可见范围规则</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <el-button v-else type="primary" @click="handleAddRule">新增</el-button>
          <el-button v-if="activeTab === 'external'" @click="showImportDialog = true">导入</el-button>
          <el-button @click="handleRefresh">刷新</el-button>
          <el-button v-if="activeTab === 'external'" @click="showSettings = true">显示设置</el-button>
        </div>

        <div class="toolbar-right">
          <el-input
              v-model="searchKeyword"
              :placeholder="activeTab === 'internal' ? '搜索规则名称' : '输入姓名/公司/手机号搜索'"
              prefix-icon="Search"
              clearable              style="width: 220px"
              @input="handleSearch"
          />
          <template v-if="activeTab === 'external'">
            <el-select v-model="categoryFilter" placeholder="联系人分类" style="width: 120px" @change="handleFilter">
              <el-option label="全部" value="" />
              <el-option label="客户" value="客户" />
              <el-option label="供应商" value="供应商" />
              <el-option label="合作伙伴" value="合作伙伴" />
              <el-option label="其他" value="其他" />
            </el-select>
            <el-select v-model="statusFilter" placeholder="状态" style="width: 100px" @change="handleFilter">
              <el-option label="全部" value="" />
              <el-option label="启用" value="enabled" />
              <el-option label="禁用" value="disabled" />
            </el-select>
          </template>
        </div>
      </div>

      <div class="content-wrapper">
        <el-tabs v-model="activeTab" class="contacts-tabs">
          <!-- Tab1: 内部通讯录配置 -->
          <el-tab-pane label="内部通讯录配置" name="internal">
            <div class="internal-config">
              <InternalRuleList
                  :rules="visibilityRules"
                  :fields="fieldConfigs"
                  @edit-rule="handleEditRule"
                  @disable-rule="handleDisableRule"
                  @enable-rule="handleEnableRule"
                  @delete-rule="handleDeleteRule"
                  @edit-field="handleEditField"
                  @select-rule="handleSelectRule"
                  @select-field="handleSelectField"
              />
              <InternalConfigEditor
                  :current-rule="currentRule"
                  :current-field="currentField"
                  :form="ruleForm"
                  :field-form="fieldForm"
                  :rules="ruleRules"
                  ref="configEditorRef"
                  @confirm="handleConfirmRule"
                  @cancel="currentRule = null"
                  @confirm-field="handleConfirmField"
                  @cancel-field="currentField = null"
              />
            </div>
          </el-tab-pane>

          <!-- Tab2: 外部联系人管理 -->
          <el-tab-pane label="外部联系人管理" name="external">
            <ExternalContactTable
                :contacts="filteredExternalContacts"
                v-model:page="externalPage"
                v-model:page-size="externalPageSize"
                :total="externalTotal"
                @selection-change="handleExternalSelectionChange"
                @row-click="handleExternalRowClick"
                @edit-contact="handleEditExternalContact"
                @view-contact="handleViewExternalContact"
                @disable-contact="handleDisableExternalContact"
                @enable-contact="handleEnableExternalContact"
                @delete-contact="handleDeleteExternalContact"
            />
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-card>

    <!-- 外部联系人详情抽屉 -->
    <ExternalContactDrawer
        v-model="externalDrawerVisible"
        v-model:active-tab="externalActiveTab"
        :current-contact="currentExternalContact"
        :basic-form="externalBasicForm"
        :permission-form="externalPermissionForm"
        :logs="externalLogs"
        @edit-contact="handleEditExternalContact"
        @disable-contact="handleDisableExternalContact"
        @enable-contact="handleEnableExternalContact"
        @delete-contact="handleDeleteExternalContact"
    />

    <!-- 新增/编辑外部联系人对话框 -->
    <ExternalContactAddDialog
        v-model="showExternalAddDialog"
        :contact-data="editingExternalContact"
        @confirm="handleConfirmExternalContact"
    />

    <!-- 导入外部联系人对话框 -->
    <ExternalContactImportDialog
        v-model="showImportExternalDialog"
        @download-template="downloadExternalTemplate"
        @confirm-import="handleConfirmExternalImport"
    />

    <!-- 显示设置对话框 -->
    <el-dialog v-model="showSettings" title="列表显示设置" width="500px">
      <el-form label-width="120px">
        <el-form-item label="显示字段">
          <el-checkbox-group v-model="settings.visibleFields">
            <el-checkbox label="company">所属公司</el-checkbox>
            <el-checkbox label="category">联系人分类</el-checkbox>
            <el-checkbox label="phone">手机号</el-checkbox>
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
import InternalRuleList from './components/InternalRuleList.vue'
import InternalConfigEditor from './components/InternalConfigEditor.vue'
import ExternalContactTable from './components/ExternalContactTable.vue'
import ExternalContactDrawer from './components/ExternalContactDrawer.vue'
import ExternalContactAddDialog from './components/ExternalContactAddDialog.vue'
import ExternalContactImportDialog from './components/ExternalContactImportDialog.vue'

const activeTab = ref('internal')
const searchKeyword = ref('')
const categoryFilter = ref('')
const statusFilter = ref('')
const showImportExternalDialog = ref(false)
const showExternalAddDialog = ref(false)
const showSettings = ref(false)

const visibilityRules = ref([])
const fieldConfigs = ref([])
const currentRule = ref(null)
const currentField = ref(null)
const editingExternalContact = ref(null)
const currentExternalContact = ref(null)
const externalDrawerVisible = ref(false)
const externalActiveTab = ref('basic')
const selectedExternalContacts = ref([])
const externalContacts = ref([])
const externalPage = ref(1)
const externalPageSize = ref(10)
const externalTotal = ref(0)
const configEditorRef = ref(null)

const ruleForm = reactive({
  id: null,
  name: '',
  target: '',
  scope: '',
  status: 'enabled',
  remark: ''
})

const fieldForm = reactive({
  id: null,
  name: '',
  permission: '',
  maskRule: '',
  status: 'enabled',
  remark: ''
})

const externalBasicForm = reactive({
  id: null,
  name: '',
  company: '',
  category: '',
  phone: '',
  email: '',
  officePhone: '',
  address: '',
  status: 'enabled',
  remark: ''
})

const externalPermissionForm = reactive({
  visibleScope: '全公司可见',
  relatedUserId: null,
  editPermission: '仅管理员可编辑'
})

const externalLogs = ref([])

const settings = reactive({
  visibleFields: ['company', 'category', 'phone']
})

const ruleRules = {
  name: [{ required: true, message: '请输入规则名称', trigger: 'blur' }],
  target: [{ required: true, message: '请选择适用对象', trigger: 'change' }],
  scope: [{ required: true, message: '请选择可见范围', trigger: 'change' }]
}

onMounted(() => {
  loadVisibilityRules()
  loadFieldConfigs()
  loadExternalContacts()
})

const loadVisibilityRules = () => {
  visibilityRules.value = [
    { id: 1, name: '全公司可见', target: '全体员工', scope: '全公司', status: 'enabled', remark: '' },
    { id: 2, name: '本部门可见', target: '普通员工', scope: '本部门及下级', status: 'enabled', remark: '' },
    { id: 3, name: '管理层全可见', target: '部门经理及以上', scope: '全公司', status: 'enabled', remark: '' }
  ]
}

const loadFieldConfigs = () => {
  fieldConfigs.value = [
    { id: 1, name: '姓名', normalPermission: '全员可见', adminPermission: '全员可见', maskRule: '无脱敏', status: 'enabled', permission: '全员可见', remark: '' },
    { id: 2, name: '工号', normalPermission: '全员可见', adminPermission: '全员可见', maskRule: '无脱敏', status: 'enabled', permission: '全员可见', remark: '' },
    { id: 3, name: '所属部门', normalPermission: '全员可见', adminPermission: '全员可见', maskRule: '无脱敏', status: 'enabled', permission: '全员可见', remark: '' },
    { id: 4, name: '岗位/职务', normalPermission: '全员可见', adminPermission: '全员可见', maskRule: '无脱敏', status: 'enabled', permission: '全员可见', remark: '' },
    { id: 5, name: '手机号', normalPermission: '仅本部门可见', adminPermission: '全员可见', maskRule: '中间4位星号', status: 'enabled', permission: '仅本部门可见', remark: '' },
    { id: 6, name: '邮箱', normalPermission: '仅管理层可见', adminPermission: '全员可见', maskRule: '部分隐藏', status: 'enabled', permission: '仅管理层可见', remark: '' },
    { id: 7, name: '办公电话', normalPermission: '全员可见', adminPermission: '全员可见', maskRule: '无脱敏', status: 'enabled', permission: '全员可见', remark: '' },
    { id: 8, name: '入职日期', normalPermission: '仅管理层可见', adminPermission: '全员可见', maskRule: '无脱敏', status: 'enabled', permission: '仅管理层可见', remark: '' }
  ]
}

const loadExternalContacts = () => {
  externalContacts.value = [
    { id: 1, name: '张三', company: 'XX科技有限公司', category: '客户', phone: '138****0000', status: 'enabled', linkedProcesses: 0, avatar: '', email: '', officePhone: '', address: '' },
    { id: 2, name: '李四', company: 'XX供应商', category: '供应商', phone: '138****0001', status: 'enabled', linkedProcesses: 0, avatar: '', email: '', officePhone: '', address: '' },
    { id: 3, name: '王五', company: 'XX合作伙伴', category: '合作伙伴', phone: '138****0002', status: 'disabled', linkedProcesses: 1, avatar: '', email: '', officePhone: '', address: '' }
  ]
  externalTotal.value = externalContacts.value.length
}

const filteredExternalContacts = computed(() => {
  let data = [...externalContacts.value]

  if (searchKeyword.value) {
    data = data.filter(item =>
        item.name.includes(searchKeyword.value) ||
        item.company.includes(searchKeyword.value) ||
        item.phone.includes(searchKeyword.value)
    )
  }

  if (categoryFilter.value) {
    data = data.filter(item => item.category === categoryFilter.value)
  }

  if (statusFilter.value) {
    data = data.filter(item => item.status === statusFilter.value)
  }

  return data
})

const handleSearch = () => {}

const handleFilter = () => {}

const handleRefresh = () => {
  if (activeTab.value === 'internal') {
    loadVisibilityRules()
    loadFieldConfigs()
  } else {
    loadExternalContacts()
  }
  ElMessage.success('刷新成功')
}

const handleAddCommand = (command) => {
  if (command === 'contact') {
    editingExternalContact.value = null
    showExternalAddDialog.value = true
  } else if (command === 'rule') {
    activeTab.value = 'internal'
    handleAddRule()
  }
}

// 内部通讯录配置方法
const handleAddRule = () => {
  currentRule.value = { id: null }
  currentField.value = null
  Object.assign(ruleForm, {
    id: null,
    name: '',
    target: '',
    scope: '',
    status: 'enabled',
    remark: ''
  })
}

const handleEditRule = (row) => {
  Object.assign(ruleForm, { ...row })
  currentRule.value = row
  currentField.value = null
}

const handleConfirmRule = () => {
  if (ruleForm.id) {
    const index = visibilityRules.value.findIndex(item => item.id === ruleForm.id)
    if (index !== -1) {
      visibilityRules.value[index] = { ...visibilityRules.value[index], ...ruleForm }
    }
    ElMessage.success('编辑成功')
  } else {
    ruleForm.id = visibilityRules.value.length + 1
    visibilityRules.value.push({ ...ruleForm })
    ElMessage.success('新增成功')
  }
  currentRule.value = null
}

const handleDisableRule = (row) => {
  ElMessageBox.confirm(`确定要禁用规则「${row.name}」吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    row.status = 'disabled'
    ElMessage.success('禁用成功')
  })
}

const handleEnableRule = (row) => {
  ElMessageBox.confirm(`确定要启用规则「${row.name}」吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    row.status = 'enabled'
    ElMessage.success('启用成功')
  })
}

const handleDeleteRule = (row) => {
  ElMessageBox.confirm(`确定要删除规则「${row.name}」吗？`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    visibilityRules.value = visibilityRules.value.filter(item => item.id !== row.id)
    ElMessage.success('删除成功')
    if (currentRule.value?.id === row.id) {
      currentRule.value = null
    }
  })
}

const handleEditField = (row) => {
  Object.assign(fieldForm, { ...row })
  currentField.value = row
  currentRule.value = null
}

const handleConfirmField = () => {
  const index = fieldConfigs.value.findIndex(item => item.id === fieldForm.id)
  if (index !== -1) {
    fieldConfigs.value[index] = { ...fieldConfigs.value[index], ...fieldForm }
  }
  ElMessage.success('保存成功')
  currentField.value = null
}

const handleSelectRule = (row) => {
  handleEditRule(row)
}

const handleSelectField = (row) => {
  handleEditField(row)
}

// 外部联系人管理方法
const handleExternalSelectionChange = (selection) => {
  selectedExternalContacts.value = selection
}

const handleExternalRowClick = (row) => {
  handleViewExternalContact(row)
}

const handleAddExternalContact = () => {
  editingExternalContact.value = null
  showExternalAddDialog.value = true
}

const handleEditExternalContact = (row) => {
  editingExternalContact.value = row
  externalDrawerVisible.value = false
  showExternalAddDialog.value = true
}

const handleViewExternalContact = (row) => {
  currentExternalContact.value = row
  Object.assign(externalBasicForm, { ...row })
  Object.assign(externalPermissionForm, {
    visibleScope: '全公司可见',
    relatedUserId: null,
    editPermission: '仅管理员可编辑'
  })
  externalLogs.value = [
    { operator: '管理员', time: '2026-04-13 10:00:00', type: 'create', content: '新增外部联系人', ip: '192.168.1.100' },
    { operator: '管理员', time: '2026-04-13 11:00:00', type: 'edit', content: '编辑联系人信息', ip: '192.168.1.100' }
  ]
  externalActiveTab.value = 'basic'
  externalDrawerVisible.value = true
}

const handleConfirmExternalContact = (formData) => {
  if (formData.id) {
    const index = externalContacts.value.findIndex(item => item.id === formData.id)
    if (index !== -1) {
      externalContacts.value[index] = { ...externalContacts.value[index], ...formData }
    }
    ElMessage.success('编辑成功')
  } else {
    formData.id = externalContacts.value.length + 1
    formData.linkedProcesses = 0
    externalContacts.value.push(formData)
    ElMessage.success('新增成功')
  }
  showExternalAddDialog.value = false
  editingExternalContact.value = null
  loadExternalContacts()
}

const handleDisableExternalContact = (row) => {
  ElMessageBox.confirm(`确定要禁用联系人「${row.name}」吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    row.status = 'disabled'
    ElMessage.success('禁用成功')
    if (externalDrawerVisible.value) {
      loadExternalContacts()
    }
  })
}

const handleEnableExternalContact = (row) => {
  ElMessageBox.confirm(`确定要启用联系人「${row.name}」吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    row.status = 'enabled'
    ElMessage.success('启用成功')
    if (externalDrawerVisible.value) {
      loadExternalContacts()
    }
  })
}

const handleDeleteExternalContact = (row) => {
  if (row.linkedProcesses > 0) {
    ElMessage.warning('该联系人已关联流程，无法删除')
    return
  }
  ElMessageBox.confirm(`确定要删除联系人「${row.name}」吗？`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    externalContacts.value = externalContacts.value.filter(item => item.id !== row.id)
    ElMessage.success('删除成功')
    externalDrawerVisible.value = false
    loadExternalContacts()
  })
}

const handleBatchEnableExternal = () => {
  ElMessageBox.confirm(`确定要批量启用 ${selectedExternalContacts.value.length} 个联系人吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    selectedExternalContacts.value.forEach(row => {
      row.status = 'enabled'
    })
    ElMessage.success('批量启用成功')
    selectedExternalContacts.value = []
    loadExternalContacts()
  })
}

const handleBatchDisableExternal = () => {
  ElMessageBox.confirm(`确定要批量禁用 ${selectedExternalContacts.value.length} 个联系人吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    selectedExternalContacts.value.forEach(row => {
      row.status = 'disabled'
    })
    ElMessage.success('批量禁用成功')
    selectedExternalContacts.value = []
    loadExternalContacts()
  })
}

const handleBatchDeleteExternal = () => {
  const canDelete = selectedExternalContacts.value.filter(row => row.linkedProcesses === 0)
  if (canDelete.length === 0) {
    ElMessage.warning('选中的联系人均已关联流程，无法删除')
    return
  }
  ElMessageBox.confirm(`确定要删除选中的 ${canDelete.length} 个联系人吗？`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    externalContacts.value = externalContacts.value.filter(item => {
      return !selectedExternalContacts.value.find(sel => sel.id === item.id) || item.linkedProcesses > 0
    })
    ElMessage.success('批量删除成功')
    selectedExternalContacts.value = []
    loadExternalContacts()
  })
}

const handleExportExternal = () => {
  ElMessage.success('导出成功')
}

const downloadExternalTemplate = () => {
  ElMessage.success('模板下载成功')
}

const handleConfirmExternalImport = () => {
  ElMessage.success('导入成功')
  showImportExternalDialog.value = false
  loadExternalContacts()
}
</script>

<style lang="scss" scoped>
.contacts-management-page {
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

  .contacts-tabs {
    height: 100%;

    :deep(.el-tabs__content) {
      height: calc(100% - 55px);
      overflow: hidden;
    }

    :deep(.el-tab-pane) {
      height: 100%;
    }
  }

  .internal-config {
    height: 100%;
    display: flex;
    gap: 20px;
  }
}
</style>
