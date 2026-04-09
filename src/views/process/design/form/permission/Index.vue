<template>
  <div class="form-permission">
    <div class="page-header">
      <h2>表单权限管理</h2>
      <p class="subtitle">配置不同角色对表单字段的查看和编辑权限</p>
    </div>

    <div class="toolbar">
      <el-select v-model="selectedRole" placeholder="选择角色" style="width: 200px" @change="loadRolePermissions" clearable>
        <el-option label="申请人" value="applicant" />
        <el-option label="部门经理" value="dept_manager" />
        <el-option label="HR经理" value="hr_manager" />
        <el-option label="财务经理" value="finance_manager" />
      </el-select>
    </div>

    <el-table :data="currentRolePermissions" border style="width: 100%">
      <el-table-column prop="fieldName" label="字段名称" min-width="150" />
      <el-table-column prop="fieldCode" label="字段编码" min-width="150" />
      <el-table-column label="查看权限" width="120" align="center">
        <template #default="{ row }">
          <el-switch
              v-model="row.viewPermission"
              :disabled="!selectedRole"
              @change="handlePermissionChange"
          />
        </template>
      </el-table-column>
      <el-table-column label="编辑权限" width="120" align="center">
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
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'

const selectedRole = ref('')

const permissionData = ref([
  {
    roleCode: 'applicant',
    roleName: '申请人',
    permissions: [
      { fieldName: '单据编号', fieldCode: 'bill_no', view: true, edit: false },
      { fieldName: '申请人', fieldCode: 'applicant', view: true, edit: false },
      { fieldName: '请假类型', fieldCode: 'leave_type', view: true, edit: true },
      { fieldName: '请假天数', fieldCode: 'leave_days', view: true, edit: true },
      { fieldName: '开始时间', fieldCode: 'start_time', view: true, edit: true },
      { fieldName: '结束时间', fieldCode: 'end_time', view: true, edit: true },
      { fieldName: '请假事由', fieldCode: 'leave_reason', view: true, edit: true }
    ]
  },
  {
    roleCode: 'dept_manager',
    roleName: '部门经理',
    permissions: [
      { fieldName: '单据编号', fieldCode: 'bill_no', view: true, edit: false },
      { fieldName: '申请人', fieldCode: 'applicant', view: true, edit: false },
      { fieldName: '请假类型', fieldCode: 'leave_type', view: true, edit: false },
      { fieldName: '请假天数', fieldCode: 'leave_days', view: true, edit: false },
      { fieldName: '开始时间', fieldCode: 'start_time', view: true, edit: false },
      { fieldName: '结束时间', fieldCode: 'end_time', view: true, edit: false },
      { fieldName: '请假事由', fieldCode: 'leave_reason', view: true, edit: false },
      { fieldName: '审批意见', fieldCode: 'approval_comment', view: true, edit: true }
    ]
  }
])

const currentRolePermissions = computed(() => {
  if (!selectedRole.value) return []
  const role = permissionData.value.find(r => r.roleCode === selectedRole.value)
  if (!role) return []
  return role.permissions.map(p => ({
    ...p,
    viewPermission: p.view,
    editPermission: p.edit
  }))
})

const loadRolePermissions = () => {
  if (selectedRole.value) {
    const role = permissionData.value.find(r => r.roleCode === selectedRole.value)
    if (role) {
      ElMessage.success(`已加载 ${role.roleName} 的权限配置`)
    }
  }
}

const handlePermissionChange = () => {
  ElMessage.success('权限已更新')
}
</script>

<style scoped lang="scss">
.form-permission {
  padding: 20px;

  .page-header {
    margin-bottom: 24px;

    h2 {
      margin: 0 0 8px;
      font-size: 20px;
    }

    .subtitle {
      margin: 0;
      font-size: 14px;
      color: #909399;
    }
  }

  .toolbar {
    margin-bottom: 16px;
  }
}
</style>
