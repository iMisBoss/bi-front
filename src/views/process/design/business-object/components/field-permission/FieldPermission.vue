<template>
  <div class="field-permission">
    <div class="tab-toolbar">
      <div class="toolbar-left">
        <el-select v-model="selectedRole" placeholder="选择角色" style="width: 200px" @change="loadRolePermissions" clearable>
          <el-option label="申请人" value="applicant" />
          <el-option label="部门经理" value="dept_manager" />
          <el-option label="车辆管理员" value="vehicle_admin" />
          <el-option label="普通员工" value="employee" />
        </el-select>
        <el-button type="primary" size="default" icon="Setting" @click="handleBatchPermission">批量设置权限</el-button>
      </div>
    </div>

    <el-table :data="currentRolePermissions" border style="width: 100%" max-height="400">
      <el-table-column prop="fieldName" label="字段名称" min-width="150" />
      <el-table-column prop="fieldCode" label="字段编码" min-width="150" />
      <el-table-column prop="viewPermission" label="查看权限" width="120" align="center">
        <template #default="{ row }">
          <el-switch
              v-model="row.viewPermission"
              :disabled="!selectedRole"
              @change="handlePermissionChange"
          />
        </template>
      </el-table-column>
      <el-table-column prop="editPermission" label="编辑权限" width="120" align="center">
        <template #default="{ row }">
          <el-switch
              v-model="row.editPermission"
              :disabled="!selectedRole"
              @change="handlePermissionChange"
          />
        </template>
      </el-table-column>
    </el-table>

    <el-empty v-if="!selectedRole" description="请先选择角色查看权限配置" />

    <!-- 批量设置权限对话框 -->
    <el-dialog
        v-model="batchDialogVisible"
        title="批量设置权限"
        width="800px"
        :close-on-click-modal="false"
    >
      <el-form label-width="120px">
        <el-form-item label="选择角色">
          <el-select v-model="batchRole" placeholder="请选择角色" style="width: 100%" @change="loadBatchRoleData">
            <el-option label="申请人" value="applicant" />
            <el-option label="部门经理" value="dept_manager" />
            <el-option label="车辆管理员" value="vehicle_admin" />
            <el-option label="普通员工" value="employee" />
          </el-select>
        </el-form-item>

        <el-form-item label="批量操作">
          <el-radio-group v-model="batchAction" @change="handleBatchActionChange">
            <el-radio label="view-all">启用所有查看权限</el-radio>
            <el-radio label="view-none">禁用所有查看权限</el-radio>
            <el-radio label="edit-all">启用所有编辑权限</el-radio>
            <el-radio label="edit-none">禁用所有编辑权限</el-radio>
            <el-radio label="custom">自定义设置</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item v-if="batchAction === 'custom'" label="字段选择">
          <div class="field-checkbox-group">
            <el-checkbox v-model="selectAllFields" @change="handleSelectAllFields">全选</el-checkbox>
            <el-divider direction="vertical" />
            <el-checkbox-group v-model="selectedFields">
              <el-checkbox
                  v-for="field in allFields"
                  :key="field.fieldCode"
                  :label="field.fieldCode"
              >
                {{ field.fieldName }}
              </el-checkbox>
            </el-checkbox-group>
          </div>
        </el-form-item>

        <el-form-item v-if="batchAction === 'custom'" label="权限类型">
          <el-checkbox-group v-model="permissionTypes">
            <el-checkbox label="view">查看权限</el-checkbox>
            <el-checkbox label="edit">编辑权限</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="batchDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleConfirmBatch" :disabled="!batchRole || !batchAction">
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  isVersionEdit: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['change'])

const selectedRole = ref('')
const permissionData = ref([
  {
    id: 1,
    roleName: '申请人',
    roleCode: 'applicant',
    permissions: [
      { fieldName: '单据编号', fieldCode: 'bill_no', view: true, edit: false },
      { fieldName: '申请人', fieldCode: 'applicant_id', view: true, edit: false },
      { fieldName: '车辆类型', fieldCode: 'vehicle_type', view: true, edit: true },
      { fieldName: '车牌号码', fieldCode: 'license_plate', view: true, edit: true },
      { fieldName: '用车事由', fieldCode: 'usage_reason', view: true, edit: true },
      { fieldName: '开始时间', fieldCode: 'start_time', view: true, edit: true },
      { fieldName: '结束时间', fieldCode: 'end_time', view: true, edit: true },
      { fieldName: '审批状态', fieldCode: 'approval_status', view: true, edit: false }
    ]
  },
  {
    id: 2,
    roleName: '部门经理',
    roleCode: 'dept_manager',
    permissions: [
      { fieldName: '单据编号', fieldCode: 'bill_no', view: true, edit: false },
      { fieldName: '申请人', fieldCode: 'applicant_id', view: true, edit: false },
      { fieldName: '车辆类型', fieldCode: 'vehicle_type', view: true, edit: true },
      { fieldName: '车牌号码', fieldCode: 'license_plate', view: true, edit: true },
      { fieldName: '用车事由', fieldCode: 'usage_reason', view: true, edit: true },
      { fieldName: '开始时间', fieldCode: 'start_time', view: true, edit: true },
      { fieldName: '结束时间', fieldCode: 'end_time', view: true, edit: true },
      { fieldName: '审批状态', fieldCode: 'approval_status', view: true, edit: true },
      { fieldName: '紧急联系人', fieldCode: 'emergency_contact', view: true, edit: false }
    ]
  },
  {
    id: 3,
    roleName: '车辆管理员',
    roleCode: 'vehicle_admin',
    permissions: [
      { fieldName: '单据编号', fieldCode: 'bill_no', view: true, edit: false },
      { fieldName: '申请人', fieldCode: 'applicant_id', view: true, edit: false },
      { fieldName: '车辆类型', fieldCode: 'vehicle_type', view: true, edit: true },
      { fieldName: '车牌号码', fieldCode: 'license_plate', view: true, edit: true },
      { fieldName: '用车事由', fieldCode: 'usage_reason', view: true, edit: true },
      { fieldName: '开始时间', fieldCode: 'start_time', view: true, edit: true },
      { fieldName: '结束时间', fieldCode: 'end_time', view: true, edit: true },
      { fieldName: '审批状态', fieldCode: 'approval_status', view: true, edit: true },
      { fieldName: '紧急联系人', fieldCode: 'emergency_contact', view: true, edit: true },
      { fieldName: '联系电话', fieldCode: 'contact_phone', view: true, edit: true }
    ]
  },
  {
    id: 4,
    roleName: '普通员工',
    roleCode: 'employee',
    permissions: [
      { fieldName: '单据编号', fieldCode: 'bill_no', view: true, edit: false },
      { fieldName: '申请人', fieldCode: 'applicant_id', view: true, edit: false },
      { fieldName: '车辆类型', fieldCode: 'vehicle_type', view: true, edit: false },
      { fieldName: '车牌号码', fieldCode: 'license_plate', view: false, edit: false },
      { fieldName: '用车事由', fieldCode: 'usage_reason', view: false, edit: false },
      { fieldName: '开始时间', fieldCode: 'start_time', view: false, edit: false },
      { fieldName: '结束时间', fieldCode: 'end_time', view: false, edit: false },
      { fieldName: '审批状态', fieldCode: 'approval_status', view: true, edit: false },
      { fieldName: '紧急联系人', fieldCode: 'emergency_contact', view: false, edit: false },
      { fieldName: '联系电话', fieldCode: 'contact_phone', view: false, edit: false }
    ]
  }
])

// 计算当前选中角色的权限列表
const currentRolePermissions = computed(() => {
  if (!selectedRole.value) return []
  const role = permissionData.value.find(r => r.roleCode === selectedRole.value)
  if (!role) return []

  // 将 permissions 数组中的 view/edit 映射为 viewPermission/editPermission
  return role.permissions.map(p => ({
    ...p,
    viewPermission: p.view,
    editPermission: p.edit
  }))
})

// 所有字段列表
const allFields = computed(() => {
  if (!selectedRole.value) return []
  const role = permissionData.value.find(r => r.roleCode === selectedRole.value)
  return role ? role.permissions.map(p => ({ fieldName: p.fieldName, fieldCode: p.fieldCode })) : []
})

// 批量设置对话框
const batchDialogVisible = ref(false)
const batchRole = ref('')
const batchAction = ref('view-all')
const selectedFields = ref([])
const selectAllFields = ref(false)
const permissionTypes = ref(['view'])

const loadRolePermissions = () => {
  if (selectedRole.value) {
    const role = permissionData.value.find(r => r.roleCode === selectedRole.value)
    if (role) {
      ElMessage.success(`已加载 ${role.roleName} 的权限配置`)
    }
  }
}

const handlePermissionChange = () => {
  emit('change', { role: selectedRole.value, permissions: currentRolePermissions.value })
}

const handleBatchPermission = () => {
  batchRole.value = selectedRole.value || ''
  batchAction.value = 'view-all'
  selectedFields.value = []
  selectAllFields.value = false
  permissionTypes.value = ['view']
  batchDialogVisible.value = true
}

const loadBatchRoleData = () => {
  // 加载角色的字段列表
  selectedFields.value = []
  selectAllFields.value = false
}

const handleBatchActionChange = () => {
  if (batchAction.value === 'custom') {
    selectedFields.value = []
    permissionTypes.value = ['view']
  }
}

const handleSelectAllFields = (val) => {
  if (val) {
    selectedFields.value = allFields.value.map(f => f.fieldCode)
  } else {
    selectedFields.value = []
  }
}

const handleConfirmBatch = () => {
  if (!batchRole.value) {
    ElMessage.warning('请选择角色')
    return
  }

  const role = permissionData.value.find(r => r.roleCode === batchRole.value)
  if (!role) {
    ElMessage.error('角色不存在')
    return
  }

  // 根据批量操作类型更新权限
  switch (batchAction.value) {
    case 'view-all':
      role.permissions.forEach(p => { p.view = true })
      ElMessage.success('已启用所有查看权限')
      break
    case 'view-none':
      role.permissions.forEach(p => { p.view = false })
      ElMessage.success('已禁用所有查看权限')
      break
    case 'edit-all':
      role.permissions.forEach(p => { p.edit = true })
      ElMessage.success('已启用所有编辑权限')
      break
    case 'edit-none':
      role.permissions.forEach(p => { p.edit = false })
      ElMessage.success('已禁用所有编辑权限')
      break
    case 'custom':
      if (selectedFields.value.length === 0) {
        ElMessage.warning('请至少选择一个字段')
        return
      }
      if (permissionTypes.value.length === 0) {
        ElMessage.warning('请至少选择一种权限类型')
        return
      }

      const setView = permissionTypes.value.includes('view')
      const setEdit = permissionTypes.value.includes('edit')

      role.permissions.forEach(p => {
        if (selectedFields.value.includes(p.fieldCode)) {
          if (setView) p.view = true
          if (setEdit) p.edit = true
        }
      })
      ElMessage.success('批量设置成功')
      break
  }

  batchDialogVisible.value = false
  emit('change', { role: batchRole.value, permissions: currentRolePermissions.value })
}

defineExpose({
  permissionData,
  currentRolePermissions
})
</script>

<style scoped lang="scss">
.field-permission {
  .tab-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    .toolbar-left {
      display: flex;
      gap: 12px;
    }
  }

  .field-checkbox-group {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    flex-wrap: wrap;

    :deep(.el-checkbox-group) {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
    }
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }
}
</style>
