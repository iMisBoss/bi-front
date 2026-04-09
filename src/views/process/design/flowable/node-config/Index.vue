<template>
  <div class="node-config">
    <div class="page-header">
      <h2>节点配置管理</h2>
      <p class="subtitle">配置流程节点的详细参数，包括审批人、超时规则、通知策略等</p>
    </div>

    <div class="toolbar">
      <div class="toolbar-left">
        <el-select v-model="selectedProcess" placeholder="选择流程" style="width: 250px">
          <el-option label="请假审批流程" value="leave_approval" />
          <el-option label="加班审批流程" value="overtime_approval" />
          <el-option label="费用报销流程" value="expense_approval" />
        </el-select>
        <el-button type="primary" icon="Search" @click="handleSearch">查询</el-button>
        <el-button icon="Refresh" @click="handleReset">重置</el-button>
      </div>
      <div class="toolbar-right">
        <el-button type="primary" icon="Plus" @click="handleAdd">新增节点配置</el-button>
      </div>
    </div>

    <el-table
        :data="nodeConfigList"
        border
        style="width: 100%"
        v-loading="loading"
    >
      <el-table-column prop="nodeName" label="节点名称" min-width="150" />
      <el-table-column prop="nodeType" label="节点类型" width="120">
        <template #default="{ row }">
          <el-tag size="small">{{ row.nodeType }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="assignee" label="审批人" min-width="150" />
      <el-table-column prop="timeoutHours" label="超时时间(小时)" width="130" align="center" />
      <el-table-column prop="timeoutAction" label="超时动作" width="120">
        <template #default="{ row }">
          <el-tag size="small" :type="getTimeoutActionTag(row.timeoutAction)">
            {{ getTimeoutActionText(row.timeoutAction) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="通知方式" width="150">
        <template #default="{ row }">
          <el-tag v-if="row.notifyEmail" size="small" style="margin-right: 4px">邮件</el-tag>
          <el-tag v-if="row.notifySMS" size="small" style="margin-right: 4px" type="warning">短信</el-tag>
          <el-tag v-if="row.notifySystem" size="small" type="success">系统</el-tag>
        </template>
      </el-table-column>
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
      <el-form :model="configForm" :rules="formRules" ref="formRef" label-width="120px">
        <el-form-item label="节点名称" prop="nodeName">
          <el-input v-model="configForm.nodeName" placeholder="请输入节点名称" />
        </el-form-item>

        <el-form-item label="节点类型" prop="nodeType">
          <el-select v-model="configForm.nodeType" placeholder="请选择节点类型" style="width: 100%">
            <el-option label="审批节点" value="审批节点" />
            <el-option label="抄送节点" value="抄送节点" />
            <el-option label="条件节点" value="条件节点" />
            <el-option label="结束节点" value="结束节点" />
          </el-select>
        </el-form-item>

        <el-form-item label="审批人配置" prop="assignee">
          <el-select v-model="configForm.assignee" placeholder="请选择审批人" style="width: 100%">
            <el-option label="部门经理" value="部门经理" />
            <el-option label="总经理" value="总经理" />
            <el-option label="HR经理" value="HR经理" />
            <el-option label="财务经理" value="财务经理" />
          </el-select>
        </el-form-item>

        <el-form-item label="审批方式" prop="approvalType">
          <el-radio-group v-model="configForm.approvalType">
            <el-radio label="single">单人审批</el-radio>
            <el-radio label="countersign">会签（全部通过）</el-radio>
            <el-radio label="orsign">或签（一人通过）</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="超时时间" prop="timeoutHours">
          <el-input-number v-model="configForm.timeoutHours" :min="1" :max="720" style="width: 100%" />
          <div class="tip">单位：小时，最大720小时（30天）</div>
        </el-form-item>

        <el-form-item label="超时动作" prop="timeoutAction">
          <el-radio-group v-model="configForm.timeoutAction">
            <el-radio label="remind">提醒</el-radio>
            <el-radio label="transfer">转交</el-radio>
            <el-radio label="auto_pass">自动通过</el-radio>
            <el-radio label="auto_reject">自动驳回</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="通知方式">
          <el-checkbox-group v-model="configForm.notifyMethods">
            <el-checkbox label="email">邮件通知</el-checkbox>
            <el-checkbox label="sms">短信通知</el-checkbox>
            <el-checkbox label="system">系统通知</el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <el-form-item label="节点说明" prop="description">
          <el-input
              v-model="configForm.description"
              type="textarea"
              :rows="3"
              placeholder="请输入节点说明"
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
import { Search, Refresh, Plus, Edit, Delete } from '@element-plus/icons-vue'

const selectedProcess = ref('')
const loading = ref(false)
const saving = ref(false)

const nodeConfigList = ref([
  {
    id: 1,
    nodeName: '部门经理审批',
    nodeType: '审批节点',
    assignee: '部门经理',
    approvalType: 'single',
    timeoutHours: 24,
    timeoutAction: 'remind',
    notifyEmail: true,
    notifySMS: false,
    notifySystem: true,
    description: '请假申请由部门经理审批'
  },
  {
    id: 2,
    nodeName: '总经理审批',
    nodeType: '审批节点',
    assignee: '总经理',
    approvalType: 'single',
    timeoutHours: 48,
    timeoutAction: 'transfer',
    notifyEmail: true,
    notifySMS: true,
    notifySystem: true,
    description: '请假超过5天需总经理审批'
  },
  {
    id: 3,
    nodeName: 'HR备案',
    nodeType: '抄送节点',
    assignee: 'HR经理',
    approvalType: 'single',
    timeoutHours: 72,
    timeoutAction: 'auto_pass',
    notifyEmail: true,
    notifySMS: false,
    notifySystem: true,
    description: '请假审批通过后抄送HR备案'
  }
])

const dialogVisible = ref(false)
const dialogTitle = ref('新增节点配置')
const formRef = ref(null)
const configForm = ref({
  nodeName: '',
  nodeType: '审批节点',
  assignee: '',
  approvalType: 'single',
  timeoutHours: 24,
  timeoutAction: 'remind',
  notifyMethods: ['email', 'system'],
  description: ''
})

const formRules = {
  nodeName: [{ required: true, message: '请输入节点名称', trigger: 'blur' }],
  nodeType: [{ required: true, message: '请选择节点类型', trigger: 'change' }],
  assignee: [{ required: true, message: '请选择审批人', trigger: 'change' }]
}

const handleSearch = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    ElMessage.success('查询完成')
  }, 500)
}

const handleReset = () => {
  selectedProcess.value = ''
  ElMessage.success('已重置查询条件')
}

const handleAdd = () => {
  dialogTitle.value = '新增节点配置'
  configForm.value = {
    nodeName: '',
    nodeType: '审批节点',
    assignee: '',
    approvalType: 'single',
    timeoutHours: 24,
    timeoutAction: 'remind',
    notifyMethods: ['email', 'system'],
    description: ''
  }
  dialogVisible.value = true
}

const handleEdit = (row) => {
  dialogTitle.value = '编辑节点配置'
  configForm.value = { ...row }
  dialogVisible.value = true
}

const handleSubmit = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      saving.value = true
      setTimeout(() => {
        if (configForm.value.id) {
          const index = nodeConfigList.value.findIndex(n => n.id === configForm.value.id)
          if (index !== -1) {
            nodeConfigList.value[index] = {
              ...configForm.value,
              notifyEmail: configForm.value.notifyMethods.includes('email'),
              notifySMS: configForm.value.notifyMethods.includes('sms'),
              notifySystem: configForm.value.notifyMethods.includes('system')
            }
          }
          ElMessage.success('节点配置修改成功')
        } else {
          nodeConfigList.value.unshift({
            ...configForm.value,
            id: Date.now(),
            notifyEmail: configForm.value.notifyMethods.includes('email'),
            notifySMS: configForm.value.notifyMethods.includes('sms'),
            notifySystem: configForm.value.notifyMethods.includes('system')
          })
          ElMessage.success('节点配置新增成功')
        }
        saving.value = false
        dialogVisible.value = false
      }, 500)
    }
  })
}

const handleDelete = (row) => {
  ElMessageBox.confirm(
      `确定要删除节点"${row.nodeName}"的配置吗？`,
      '删除确认',
      {
        confirmButtonText: '确认删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
  ).then(() => {
    nodeConfigList.value = nodeConfigList.value.filter(n => n.id !== row.id)
    ElMessage.success('删除成功')
  }).catch(() => {})
}

const getTimeoutActionTag = (action) => {
  const tags = { remind: 'info', transfer: 'warning', auto_pass: 'success', auto_reject: 'danger' }
  return tags[action] || 'info'
}

const getTimeoutActionText = (action) => {
  const texts = { remind: '提醒', transfer: '转交', auto_pass: '自动通过', auto_reject: '自动驳回' }
  return texts[action] || action
}
</script>

<style scoped lang="scss">
.node-config {
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
