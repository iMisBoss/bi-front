<template>
  <div class="form-linkage">
    <div class="page-header">
      <h2>表单联动规则</h2>
      <p class="subtitle">配置字段之间的联动关系，实现动态表单效果</p>
    </div>

    <div class="toolbar">
      <div class="toolbar-left">
        <el-input
            v-model="searchKeyword"
            placeholder="搜索联动规则"
            clearable
            style="width: 300px"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button type="primary" icon="Search" @click="handleSearch">查询</el-button>
        <el-button icon="Refresh" @click="handleReset">重置</el-button>
      </div>
      <div class="toolbar-right">
        <el-button type="primary" icon="Plus" @click="handleAdd">新增联动</el-button>
      </div>
    </div>

    <el-table
        :data="filteredLinkageList"
        border
        style="width: 100%"
        v-loading="loading"
    >
      <el-table-column prop="ruleName" label="规则名称" min-width="180" />
      <el-table-column prop="triggerField" label="触发字段" width="150" />
      <el-table-column prop="triggerCondition" label="触发条件" min-width="200" />
      <el-table-column prop="actionType" label="联动动作" width="120">
        <template #default="{ row }">
          <el-tag size="small" :type="getActionTag(row.actionType)">
            {{ getActionText(row.actionType) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="targetField" label="目标字段" width="150" />
      <el-table-column label="规则状态" width="100" align="center">
        <template #default="{ row }">
          <el-switch
              v-model="row.status"
              active-value="enabled"
              inactive-value="disabled"
              @change="handleStatusChange(row)"
          />
        </template>
      </el-table-column>
      <el-table-column prop="creator" label="创建人" width="120" />
      <el-table-column prop="createTime" label="创建时间" width="180" />
      <el-table-column label="操作" width="220" align="center" fixed="right">
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
        width="800px"
        :close-on-click-modal="false"
    >
      <el-form :model="linkageForm" :rules="formRules" ref="formRef" label-width="120px">
        <el-form-item label="规则名称" prop="ruleName">
          <el-input v-model="linkageForm.ruleName" placeholder="请输入规则名称" />
        </el-form-item>

        <el-form-item label="触发字段" prop="triggerField">
          <el-select v-model="linkageForm.triggerField" placeholder="请选择触发字段" style="width: 100%">
            <el-option label="请假类型" value="leave_type" />
            <el-option label="报销金额" value="expense_amount" />
            <el-option label="申请人部门" value="applicant_dept" />
          </el-select>
        </el-form-item>

        <el-form-item label="触发条件" prop="triggerCondition">
          <el-input v-model="linkageForm.triggerCondition" placeholder="例如：leave_type == '病假'" />
          <div class="tip">支持条件表达式：==、!=、>、<、>=、<=、in、not in</div>
        </el-form-item>

        <el-form-item label="联动动作" prop="actionType">
          <el-select v-model="linkageForm.actionType" placeholder="请选择联动动作" style="width: 100%">
            <el-option label="显示/隐藏" value="toggle" />
            <el-option label="必填/选填" value="required" />
            <el-option label="只读/可编辑" value="readonly" />
            <el-option label="设置默认值" value="default" />
          </el-select>
        </el-form-item>

        <el-form-item label="目标字段" prop="targetField">
          <el-select v-model="linkageForm.targetField" multiple placeholder="请选择目标字段" style="width: 100%">
            <el-option label="请假天数" value="leave_days" />
            <el-option label="开始时间" value="start_time" />
            <el-option label="结束时间" value="end_time" />
            <el-option label="请假事由" value="leave_reason" />
          </el-select>
        </el-form-item>

        <el-form-item label="动作值" prop="actionValue">
          <el-input v-model="linkageForm.actionValue" placeholder="例如：true/false/显示/隐藏" />
        </el-form-item>

        <el-form-item label="规则说明" prop="description">
          <el-input
              v-model="linkageForm.description"
              type="textarea"
              :rows="3"
              placeholder="请输入规则说明"
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
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Plus, Edit, Delete } from '@element-plus/icons-vue'

const searchKeyword = ref('')
const loading = ref(false)
const saving = ref(false)

const linkageList = ref([
  {
    id: 1,
    ruleName: '病假显示请假事由',
    triggerField: '请假类型',
    triggerCondition: 'leave_type == "病假"',
    actionType: 'toggle',
    targetField: ['请假事由'],
    actionValue: '显示',
    status: 'enabled',
    description: '病假时显示请假事由字段',
    creator: '系统管理员',
    createTime: '2024-01-10 09:00:00'
  },
  {
    id: 2,
    ruleName: '事假设置请假天数为必填',
    triggerField: '请假类型',
    triggerCondition: 'leave_type == "事假"',
    actionType: 'required',
    targetField: ['请假天数'],
    actionValue: 'true',
    status: 'enabled',
    description: '事假必须填写请假天数',
    creator: '系统管理员',
    createTime: '2024-01-10 09:30:00'
  },
  {
    id: 3,
    ruleName: '报销金额大于5000设置只读',
    triggerField: '报销金额',
    triggerCondition: 'expense_amount > 5000',
    actionType: 'readonly',
    targetField: ['报销事由'],
    actionValue: 'true',
    status: 'enabled',
    description: '报销金额超过5000时，报销事由不可修改',
    creator: '财务管理员',
    createTime: '2024-02-01 10:00:00'
  }
])

const dialogVisible = ref(false)
const dialogTitle = ref('新增联动')
const formRef = ref(null)
const linkageForm = ref({
  ruleName: '',
  triggerField: '',
  triggerCondition: '',
  actionType: '',
  targetField: [],
  actionValue: '',
  description: ''
})

const formRules = {
  ruleName: [{ required: true, message: '请输入规则名称', trigger: 'blur' }],
  triggerField: [{ required: true, message: '请选择触发字段', trigger: 'change' }],
  triggerCondition: [{ required: true, message: '请输入触发条件', trigger: 'blur' }],
  actionType: [{ required: true, message: '请选择联动动作', trigger: 'change' }],
  targetField: [{ required: true, message: '请选择目标字段', trigger: 'change' }]
}

const filteredLinkageList = computed(() => {
  let result = [...linkageList.value]
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(l =>
        l.ruleName.toLowerCase().includes(keyword) ||
        l.triggerField.toLowerCase().includes(keyword)
    )
  }
  return result
})

const handleSearch = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    ElMessage.success('查询完成')
  }, 500)
}

const handleReset = () => {
  searchKeyword.value = ''
  ElMessage.success('已重置查询条件')
}

const handleAdd = () => {
  dialogTitle.value = '新增联动'
  linkageForm.value = {
    ruleName: '',
    triggerField: '',
    triggerCondition: '',
    actionType: '',
    targetField: [],
    actionValue: '',
    description: ''
  }
  dialogVisible.value = true
}

const handleEdit = (row) => {
  dialogTitle.value = '编辑联动'
  linkageForm.value = { ...row }
  dialogVisible.value = true
}

const handleSubmit = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      saving.value = true
      setTimeout(() => {
        if (linkageForm.value.id) {
          const index = linkageList.value.findIndex(l => l.id === linkageForm.value.id)
          if (index !== -1) {
            linkageList.value[index] = { ...linkageForm.value }
          }
          ElMessage.success('规则修改成功')
        } else {
          linkageList.value.unshift({
            ...linkageForm.value,
            id: Date.now(),
            creator: '当前用户',
            createTime: new Date().toLocaleString('zh-CN')
          })
          ElMessage.success('规则新增成功')
        }
        saving.value = false
        dialogVisible.value = false
      }, 500)
    }
  })
}

const handleStatusChange = (row) => {
  const action = row.status === 'enabled' ? '启用' : '停用'
  ElMessage.success(`已${action}规则"${row.ruleName}"`)
}

const handleDelete = (row) => {
  ElMessageBox.confirm(
      `确定要删除规则"${row.ruleName}"吗？`,
      '删除确认',
      {
        confirmButtonText: '确认删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
  ).then(() => {
    linkageList.value = linkageList.value.filter(l => l.id !== row.id)
    ElMessage.success('删除成功')
  }).catch(() => {})
}

const getActionTag = (type) => {
  const tags = { toggle: 'success', required: 'warning', readonly: 'info', default: 'primary' }
  return tags[type] || 'info'
}

const getActionText = (type) => {
  const texts = { toggle: '显示/隐藏', required: '必填/选填', readonly: '只读/可编辑', default: '设置默认值' }
  return texts[type] || type
}
</script>

<style scoped lang="scss">
.form-linkage {
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

  .tip {
    margin-top: 4px;
    font-size: 12px;
    color: #909399;
  }
}
</style>
