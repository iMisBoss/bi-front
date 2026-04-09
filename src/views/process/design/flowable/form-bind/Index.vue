<template>
  <div class="form-bind">
    <div class="page-header">
      <h2>表单绑定配置</h2>
      <p class="subtitle">将业务对象字段绑定到流程节点，实现数据流转</p>
    </div>

    <div class="toolbar">
      <div class="toolbar-left">
        <el-select v-model="selectedProcess" placeholder="选择流程" style="width: 250px" @change="loadProcessForms">
          <el-option label="请假审批流程" value="leave_approval" />
          <el-option label="加班审批流程" value="overtime_approval" />
          <el-option label="费用报销流程" value="expense_approval" />
        </el-select>
        <el-select v-model="selectedNode" placeholder="选择节点" style="width: 200px" :disabled="!selectedProcess">
          <el-option label="部门经理审批" value="dept_manager" />
          <el-option label="总经理审批" value="general_manager" />
          <el-option label="HR审批" value="hr" />
        </el-select>
        <el-button type="primary" icon="Search" @click="handleSearch" :disabled="!selectedProcess">查询</el-button>
      </div>
      <div class="toolbar-right">
        <el-button type="primary" icon="Plus" @click="handleAdd" :disabled="!selectedNode">添加绑定</el-button>
        <el-button type="success" icon="Check" @click="handleSaveAll">保存全部</el-button>
      </div>
    </div>

    <el-table
        :data="bindingList"
        border
        style="width: 100%"
        v-loading="loading"
    >
      <el-table-column prop="nodeName" label="流程节点" width="150" />
      <el-table-column prop="fieldName" label="业务字段" min-width="150" />
      <el-table-column prop="formField" label="表单字段" min-width="150" />
      <el-table-column prop="bindType" label="绑定类型" width="120">
        <template #default="{ row }">
          <el-tag size="small" :type="getBindTypeTag(row.bindType)">
            {{ getBindTypeText(row.bindType) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="direction" label="数据流向" width="120">
        <template #default="{ row }">
          <el-tag size="small" :type="row.direction === 'read' ? 'info' : 'success'">
            {{ row.direction === 'read' ? '只读' : '读写' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180" align="center" fixed="right">
        <template #default="{ row }">
          <div class="action-buttons">
            <el-button size="small" type="primary" icon="Edit" @click="handleEdit(row)">编辑</el-button>
            <el-button size="small" type="danger" icon="Delete" @click="handleDelete(row)">删除</el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <!-- 新增/编辑对话框 -->
    <el-dialog
        v-model="dialogVisible"
        :title="dialogTitle"
        width="600px"
        :close-on-click-modal="false"
    >
      <el-form :model="bindingForm" :rules="formRules" ref="formRef" label-width="100px">
        <el-form-item label="业务字段" prop="fieldName">
          <el-select v-model="bindingForm.fieldName" placeholder="请选择业务字段" style="width: 100%">
            <el-option label="单据编号" value="bill_no" />
            <el-option label="申请人" value="applicant" />
            <el-option label="请假类型" value="leave_type" />
            <el-option label="请假天数" value="leave_days" />
            <el-option label="开始时间" value="start_time" />
            <el-option label="结束时间" value="end_time" />
          </el-select>
        </el-form-item>

        <el-form-item label="表单字段" prop="formField">
          <el-select v-model="bindingForm.formField" placeholder="请选择表单字段" style="width: 100%">
            <el-option label="单据编号输入框" value="bill_no_input" />
            <el-option label="申请人选择器" value="applicant_selector" />
            <el-option label="请假类型下拉" value="leave_type_select" />
            <el-option label="请假天数输入" value="leave_days_input" />
          </el-select>
        </el-form-item>

        <el-form-item label="绑定类型" prop="bindType">
          <el-select v-model="bindingForm.bindType" placeholder="请选择绑定类型" style="width: 100%">
            <el-option label="值绑定" value="value" />
            <el-option label="引用绑定" value="reference" />
            <el-option label="计算绑定" value="calculation" />
          </el-select>
        </el-form-item>

        <el-form-item label="数据流向" prop="direction">
          <el-radio-group v-model="bindingForm.direction">
            <el-radio label="read">只读（流程→表单）</el-radio>
            <el-radio label="write">读写（双向同步）</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="转换规则" prop="transformRule">
          <el-input
              v-model="bindingForm.transformRule"
              type="textarea"
              :rows="3"
              placeholder="可选：数据转换规则表达式"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="saving">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus, Check, Edit, Delete } from '@element-plus/icons-vue'

const selectedProcess = ref('')
const selectedNode = ref('')
const loading = ref(false)
const saving = ref(false)

const bindingList = ref([
  {
    id: 1,
    nodeName: '部门经理审批',
    fieldName: '请假类型',
    formField: '请假类型下拉',
    bindType: 'value',
    direction: 'read',
    transformRule: ''
  },
  {
    id: 2,
    nodeName: '部门经理审批',
    fieldName: '请假天数',
    formField: '请假天数输入',
    bindType: 'value',
    direction: 'write',
    transformRule: ''
  },
  {
    id: 3,
    nodeName: '总经理审批',
    fieldName: '请假事由',
    formField: '请假事由文本域',
    bindType: 'reference',
    direction: 'read',
    transformRule: ''
  }
])

const dialogVisible = ref(false)
const dialogTitle = ref('添加绑定')
const formRef = ref(null)
const bindingForm = ref({
  fieldName: '',
  formField: '',
  bindType: 'value',
  direction: 'write',
  transformRule: ''
})

const formRules = {
  fieldName: [{ required: true, message: '请选择业务字段', trigger: 'change' }],
  formField: [{ required: true, message: '请选择表单字段', trigger: 'change' }],
  bindType: [{ required: true, message: '请选择绑定类型', trigger: 'change' }]
}

const loadProcessForms = () => {
  ElMessage.success('已加载流程表单配置')
}

const handleSearch = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    ElMessage.success('查询完成')
  }, 500)
}

const handleAdd = () => {
  dialogTitle.value = '添加绑定'
  bindingForm.value = {
    fieldName: '',
    formField: '',
    bindType: 'value',
    direction: 'write',
    transformRule: ''
  }
  dialogVisible.value = true
}

const handleEdit = (row) => {
  dialogTitle.value = '编辑绑定'
  bindingForm.value = { ...row }
  dialogVisible.value = true
}

const handleSubmit = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      saving.value = true
      setTimeout(() => {
        if (bindingForm.value.id) {
          const index = bindingList.value.findIndex(b => b.id === bindingForm.value.id)
          if (index !== -1) {
            bindingList.value[index] = {
              ...bindingForm.value,
              nodeName: selectedNode.value
            }
          }
          ElMessage.success('绑定修改成功')
        } else {
          bindingList.value.unshift({
            ...bindingForm.value,
            id: Date.now(),
            nodeName: selectedNode.value
          })
          ElMessage.success('绑定添加成功')
        }
        saving.value = false
        dialogVisible.value = false
      }, 500)
    }
  })
}

const handleDelete = (row) => {
  ElMessageBox.confirm(
      `确定要删除该绑定关系吗？`,
      '删除确认',
      {
        confirmButtonText: '确认删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
  ).then(() => {
    bindingList.value = bindingList.value.filter(b => b.id !== row.id)
    ElMessage.success('删除成功')
  }).catch(() => {})
}

const handleSaveAll = () => {
  ElMessage.success('全部绑定已保存')
}

const getBindTypeTag = (type) => {
  const tags = { value: 'success', reference: 'primary', calculation: 'warning' }
  return tags[type] || 'info'
}

const getBindTypeText = (type) => {
  const texts = { value: '值绑定', reference: '引用绑定', calculation: '计算绑定' }
  return texts[type] || type
}
</script>

<style scoped lang="scss">
.form-bind {
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
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    .toolbar-left,
    .toolbar-right {
      display: flex;
      gap: 12px;
    }
  }

  :deep(.el-table__cell) {
    .action-buttons {
      display: inline-flex !important;
      gap: 8px;
      justify-content: center;
      align-items: center;
      flex-wrap: nowrap !important;
      white-space: nowrap !important;

      .el-button {
        margin: 0 !important;
        white-space: nowrap !important;
      }
    }
  }
}
</style>
