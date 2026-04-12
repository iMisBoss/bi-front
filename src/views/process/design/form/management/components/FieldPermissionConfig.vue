<template>
  <div class="field-permission-config">
    <el-empty v-if="!formId" description="请先选择表单" :image-size="80" />
    <div v-else class="permission-content">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="角色权限" name="role">
          <div class="tab-content">
            <div class="tab-toolbar">
              <el-select v-model="selectedRole" placeholder="选择角色" style="width: 200px" @change="loadRolePermissions">
                <el-option label="全部角色" value="all" />
                <el-option label="申请人" value="applicant" />
                <el-option label="部门经理" value="dept_manager" />
                <el-option label="HR经理" value="hr_manager" />
                <el-option label="财务经理" value="finance_manager" />
                <el-option label="系统管理员" value="admin" />
              </el-select>
              <div class="toolbar-actions">
                <el-button size="small" @click="handleBatchSet">批量设置</el-button>
                <el-button size="small" type="primary" @click="handleCopyPermission">复制权限</el-button>
              </div>
            </div>
            <el-table :data="rolePermissionMatrix" border stripe>
              <el-table-column prop="fieldName" label="字段名称" min-width="150" fixed />
              <el-table-column prop="fieldType" label="字段类型" width="120" align="center" />
              <el-table-column label="可见" width="80" align="center">
                <template #default="{ row }">
                  <el-radio-group v-model="row.permission" @change="handleChange(row)">
                    <el-radio label="visible">可见</el-radio>
                  </el-radio-group>
                </template>
              </el-table-column>
              <el-table-column label="可编辑" width="100" align="center">
                <template #default="{ row }">
                  <el-radio-group v-model="row.permission" @change="handleChange(row)">
                    <el-radio label="editable" :disabled="row.isSystemField">可编辑</el-radio>
                  </el-radio-group>
                </template>
              </el-table-column>
              <el-table-column label="只读" width="80" align="center">
                <template #default="{ row }">
                  <el-radio-group v-model="row.permission" @change="handleChange(row)">
                    <el-radio label="readonly">只读</el-radio>
                  </el-radio-group>
                </template>
              </el-table-column>
              <el-table-column label="隐藏" width="80" align="center">
                <template #default="{ row }">
                  <el-radio-group v-model="row.permission" @change="handleChange(row)">
                    <el-radio label="hidden">隐藏</el-radio>
                  </el-radio-group>
                </template>
              </el-table-column>
            </el-table>
            <div class="tab-footer">
              <el-button @click="handleReset">重置</el-button>
              <el-button type="primary" @click="handleSave">保存权限</el-button>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="节点权限" name="node">
          <div class="tab-content">
            <div class="tab-toolbar">
              <el-select v-model="selectedNode" placeholder="选择节点" style="width: 200px" @change="loadNodePermissions">
                <el-option label="发起申请" value="start" />
                <el-option label="部门审批" value="dept_approval" />
                <el-option label="财务审批" value="finance_approval" />
                <el-option label="总经理审批" value="gm_approval" />
              </el-select>
            </div>
            <el-table :data="nodePermissionMatrix" border stripe>
              <el-table-column prop="fieldName" label="字段名称" min-width="150" />
              <el-table-column prop="fieldType" label="字段类型" width="120" align="center" />
              <el-table-column label="权限" width="200" align="center">
                <template #default="{ row }">
                  <el-select v-model="row.permission" style="width: 100%">
                    <el-option label="可编辑" value="editable" />
                    <el-option label="只读" value="readonly" />
                    <el-option label="隐藏" value="hidden" />
                  </el-select>
                </template>
              </el-table-column>
            </el-table>
            <div class="tab-footer">
              <el-button @click="handleReset">重置</el-button>
              <el-button type="primary" @click="handleSave">保存权限</el-button>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  formId: {
    type: [String, Number],
    default: null
  },
  formName: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['saved'])

const activeTab = ref('role')
const selectedRole = ref('')
const selectedNode = ref('')

const rolePermissionMatrix = ref([
  { fieldName: '申请人', fieldCode: 'applicant', fieldType: '系统变量', permission: 'visible', isSystemField: true },
  { fieldName: '申请部门', fieldCode: 'dept', fieldType: '系统变量', permission: 'visible', isSystemField: true },
  { fieldName: '请假类型', fieldCode: 'leave_type', fieldType: '下拉选择', permission: 'editable', isSystemField: false },
  { fieldName: '请假天数', fieldCode: 'leave_days', fieldType: '数字输入', permission: 'editable', isSystemField: false },
  { fieldName: '请假事由', fieldCode: 'reason', fieldType: '多行文本', permission: 'editable', isSystemField: false }
])

const nodePermissionMatrix = ref([
  { fieldName: '申请人', fieldCode: 'applicant', fieldType: '系统变量', permission: 'visible' },
  { fieldName: '请假类型', fieldCode: 'leave_type', fieldType: '下拉选择', permission: 'readonly' },
  { fieldName: '请假天数', fieldCode: 'leave_days', fieldType: '数字输入', permission: 'editable' }
])

const loadRolePermissions = () => {
  ElMessage.success('已加载角色权限')
}

const loadNodePermissions = () => {
  ElMessage.success('已加载节点权限')
}

const handleChange = () => {}

const handleBatchSet = () => {
  ElMessage.info('批量设置功能')
}

const handleCopyPermission = () => {
  ElMessage.info('复制权限功能')
}

const handleReset = () => {
  ElMessage.success('已重置')
}

const handleSave = () => {
  ElMessage.success('权限保存成功')
  emit('saved')
}
</script>

<style scoped lang="scss">
.field-permission-config {
  .tab-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    .toolbar-actions {
      display: flex;
      gap: 8px;
    }
  }

  .tab-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid #e4e7ed;
  }
}
</style>
