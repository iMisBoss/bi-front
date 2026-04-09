<template>
  <div class="opinion-template">
    <div class="page-header">
      <h2>审批意见模板</h2>
      <p class="subtitle">配置审批节点的常用意见模板，提高审批效率</p>
    </div>

    <div class="toolbar">
      <div class="toolbar-left">
        <el-input
            v-model="searchKeyword"
            placeholder="搜索模板名称"
            clearable
            style="width: 300px"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-select v-model="filterAction" placeholder="审批动作" clearable style="width: 150px">
          <el-option label="同意" value="approve" />
          <el-option label="驳回" value="reject" />
          <el-option label="退回" value="return" />
          <el-option label="转交" value="transfer" />
        </el-select>
        <el-button type="primary" icon="Search" @click="handleSearch">查询</el-button>
        <el-button icon="Refresh" @click="handleReset">重置</el-button>
      </div>
      <div class="toolbar-right">
        <el-button type="primary" icon="Plus" @click="handleAdd">新增模板</el-button>
      </div>
    </div>

    <el-table
        :data="filteredTemplateList"
        border
        style="width: 100%"
        v-loading="loading"
    >
      <el-table-column prop="templateName" label="模板名称" min-width="180" />
      <el-table-column prop="actionType" label="审批动作" width="120">
        <template #default="{ row }">
          <el-tag size="small" :type="getActionTag(row.actionType)">
            {{ getActionText(row.actionType) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="applicableProcess" label="适用流程" min-width="150" />
      <el-table-column prop="opinionContent" label="意见内容" min-width="250" show-overflow-tooltip />
      <el-table-column prop="useCount" label="使用次数" width="100" align="center" />
      <el-table-column prop="creator" label="创建人" width="120" />
      <el-table-column prop="createTime" label="创建时间" width="180" />
      <el-table-column label="操作" width="280" align="center" fixed="right">
        <template #default="{ row }">
          <div class="action-buttons">
            <el-button size="small" type="primary" icon="Edit" @click="handleEdit(row)">编辑</el-button>
            <el-button size="small" type="success" icon="CopyDocument" @click="handleUse(row)">使用</el-button>
            <el-button size="small" type="danger" icon="Delete" @click="handleDelete(row)">删除</el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <!-- 新增/编辑对话框 -->
    <el-dialog
        v-model="dialogVisible"
        :title="dialogTitle"
        width="700px"
        :close-on-click-modal="false"
    >
      <el-form :model="templateForm" :rules="formRules" ref="formRef" label-width="100px">
        <el-form-item label="模板名称" prop="templateName">
          <el-input v-model="templateForm.templateName" placeholder="请输入模板名称" />
        </el-form-item>

        <el-form-item label="审批动作" prop="actionType">
          <el-select v-model="templateForm.actionType" placeholder="请选择审批动作" style="width: 100%">
            <el-option label="同意" value="approve" />
            <el-option label="驳回" value="reject" />
            <el-option label="退回" value="return" />
            <el-option label="转交" value="transfer" />
          </el-select>
        </el-form-item>

        <el-form-item label="适用流程" prop="applicableProcess">
          <el-select v-model="templateForm.applicableProcess" placeholder="请选择适用流程" style="width: 100%">
            <el-option label="全部流程" value="all" />
            <el-option label="请假审批流程" value="leave_approval" />
            <el-option label="加班审批流程" value="overtime_approval" />
            <el-option label="费用报销流程" value="expense_approval" />
          </el-select>
        </el-form-item>

        <el-form-item label="意见内容" prop="opinionContent">
          <el-input
              v-model="templateForm.opinionContent"
              type="textarea"
              :rows="4"
              placeholder="请输入审批意见内容"
          />
        </el-form-item>

        <el-form-item label="模板说明" prop="description">
          <el-input
              v-model="templateForm.description"
              type="textarea"
              :rows="2"
              placeholder="请输入模板说明"
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
import { Search, Refresh, Plus, Edit, CopyDocument, Delete } from '@element-plus/icons-vue'

const searchKeyword = ref('')
const filterAction = ref('')
const loading = ref(false)
const saving = ref(false)

const templateList = ref([
  {
    id: 1,
    templateName: '同意-标准',
    actionType: 'approve',
    applicableProcess: '全部流程',
    opinionContent: '同意。',
    useCount: 523,
    description: '标准同意意见',
    creator: '系统管理员',
    createTime: '2024-01-10 09:00:00'
  },
  {
    id: 2,
    templateName: '同意-请假',
    actionType: 'approve',
    applicableProcess: '请假审批流程',
    opinionContent: '同意请假，请做好工作交接。',
    useCount: 186,
    description: '请假审批专用同意意见',
    creator: '系统管理员',
    createTime: '2024-01-10 09:30:00'
  },
  {
    id: 3,
    templateName: '驳回-资料不全',
    actionType: 'reject',
    applicableProcess: '全部流程',
    opinionContent: '驳回。资料不全，请补充完整后重新提交。',
    useCount: 92,
    description: '资料不全驳回意见',
    creator: '流程管理员',
    createTime: '2024-02-01 10:00:00'
  },
  {
    id: 4,
    templateName: '退回-修改',
    actionType: 'return',
    applicableProcess: '全部流程',
    opinionContent: '退回修改。请根据实际情况修改后重新提交。',
    useCount: 45,
    description: '退回修改意见',
    creator: '系统管理员',
    createTime: '2024-03-01 11:00:00'
  },
  {
    id: 5,
    templateName: '转交-其他人处理',
    actionType: 'transfer',
    applicableProcess: '全部流程',
    opinionContent: '此事项请转交相关负责人处理。',
    useCount: 28,
    description: '转交意见模板',
    creator: '系统管理员',
    createTime: '2024-03-15 14:00:00'
  }
])

const dialogVisible = ref(false)
const dialogTitle = ref('新增模板')
const formRef = ref(null)
const templateForm = ref({
  templateName: '',
  actionType: '',
  applicableProcess: '',
  opinionContent: '',
  description: ''
})

const formRules = {
  templateName: [{ required: true, message: '请输入模板名称', trigger: 'blur' }],
  actionType: [{ required: true, message: '请选择审批动作', trigger: 'change' }],
  applicableProcess: [{ required: true, message: '请选择适用流程', trigger: 'change' }],
  opinionContent: [{ required: true, message: '请输入意见内容', trigger: 'blur' }]
}

const filteredTemplateList = computed(() => {
  let result = [...templateList.value]

  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(t => t.templateName.toLowerCase().includes(keyword))
  }

  if (filterAction.value) {
    result = result.filter(t => t.actionType === filterAction.value)
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
  filterAction.value = ''
  ElMessage.success('已重置查询条件')
}

const handleAdd = () => {
  dialogTitle.value = '新增模板'
  templateForm.value = {
    templateName: '',
    actionType: '',
    applicableProcess: '',
    opinionContent: '',
    description: ''
  }
  dialogVisible.value = true
}

const handleEdit = (row) => {
  dialogTitle.value = '编辑模板'
  templateForm.value = { ...row }
  dialogVisible.value = true
}

const handleSubmit = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      saving.value = true
      setTimeout(() => {
        if (templateForm.value.id) {
          const index = templateList.value.findIndex(t => t.id === templateForm.value.id)
          if (index !== -1) {
            templateList.value[index] = { ...templateForm.value }
          }
          ElMessage.success('模板修改成功')
        } else {
          templateList.value.unshift({
            ...templateForm.value,
            id: Date.now(),
            useCount: 0,
            creator: '当前用户',
            createTime: new Date().toLocaleString('zh-CN')
          })
          ElMessage.success('模板新增成功')
        }
        saving.value = false
        dialogVisible.value = false
      }, 500)
    }
  })
}

const handleUse = (row) => {
  row.useCount++
  ElMessage.success(`已使用模板"${row.templateName}"，使用次数：${row.useCount}`)
}

const handleDelete = (row) => {
  ElMessageBox.confirm(
      `确定要删除模板"${row.templateName}"吗？`,
      '删除确认',
      {
        confirmButtonText: '确认删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
  ).then(() => {
    templateList.value = templateList.value.filter(t => t.id !== row.id)
    ElMessage.success('删除成功')
  }).catch(() => {})
}

const getActionTag = (type) => {
  const tags = { approve: 'success', reject: 'danger', return: 'warning', transfer: 'info' }
  return tags[type] || 'info'
}

const getActionText = (type) => {
  const texts = { approve: '同意', reject: '驳回', return: '退回', transfer: '转交' }
  return texts[type] || type
}
</script>

<style scoped lang="scss">
.opinion-template {
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
