<template>
  <div class="field-permission">
    <div class="tab-toolbar">
      <div class="toolbar-left">
        <el-select v-model="selectedRole" placeholder="选择角色" style="width: 200px" @change="loadRolePermissions">
          <el-option label="普通员工" value="employee" />
          <el-option label="部门经理" value="manager" />
          <el-option label="HR 专员" value="hr" />
          <el-option label="财务专员" value="finance" />
          <el-option label="系统管理员" value="admin" />
        </el-select>
        <el-button type="primary" size="default" icon="Setting" @click="handleBatchPermission">批量设置权限</el-button>
      </div>
    </div>

    <el-table :data="permissionList" border style="width: 100%" max-height="400">
      <el-table-column prop="fieldName" label="字段名称" min-width="150" />
      <el-table-column prop="fieldCode" label="字段编码" min-width="150" />
      <el-table-column prop="viewPermission" label="查看权限" width="120" align="center">
        <template #default="{ row }">
          <el-switch
              v-model="row.viewPermission"
              :disabled="!selectedRole"
              @change="handlePermissionChange(row)"
          />
        </template>
      </el-table-column>
      <el-table-column prop="editPermission" label="编辑权限" width="120" align="center">
        <template #default="{ row }">
          <el-switch
              v-model="row.editPermission"
              :disabled="!selectedRole"
              @change="handlePermissionChange(row)"
          />
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  isVersionEdit: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['change'])

const selectedRole = ref('')
const permissionList = ref([
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

const loadRolePermissions = () => {
  if (selectedRole.value) {
    ElMessage.success(`已加载${selectedRole.value}的权限配置`)
  }
}

const handlePermissionChange = (row) => {
  emit('change', permissionList.value)
}

const handleBatchPermission = () => {
  ElMessage.info('批量设置权限功能开发中...')
}

defineExpose({
  permissionList
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
}
</style>
