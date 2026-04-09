<template>
  <div class="process-params-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>流程参数管理</h2>
      <p class="subtitle">配置流程运行时的系统参数，控制流程行为和执行策略</p>
    </div>

    <!-- 工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <el-input
            v-model="searchKeyword"
            placeholder="搜索参数名称、参数编码"
            clearable
            style="width: 300px"
            @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-select v-model="filterCategory" placeholder="参数分类" clearable style="width: 150px">
          <el-option label="审批参数" value="approval" />
          <el-option label="超时参数" value="timeout" />
          <el-option label="通知参数" value="notification" />
          <el-option label="安全参数" value="security" />
        </el-select>
        <el-button type="primary" icon="Search" @click="handleSearch">查询</el-button>
        <el-button icon="Refresh" @click="handleReset">重置</el-button>
      </div>
      <div class="toolbar-right">
        <el-button type="primary" icon="Plus" @click="handleAdd">新增参数</el-button>
        <el-button type="success" icon="Download" @click="handleExport">导出参数</el-button>
        <el-button type="warning" icon="RefreshLeft" @click="handleResetDefaults">恢复默认</el-button>
      </div>
    </div>

    <!-- 数据表格 -->
    <el-table
        :data="filteredParamList"
        border
        style="width: 100%"
        v-loading="loading"
    >
      <el-table-column prop="paramName" label="参数名称" min-width="180" />
      <el-table-column prop="paramCode" label="参数编码" min-width="180" />
      <el-table-column prop="category" label="参数分类" width="120">
        <template #default="{ row }">
          <el-tag size="small" :type="getCategoryTag(row.category)">
            {{ getCategoryText(row.category) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="paramValue" label="参数值" min-width="150" />
      <el-table-column prop="defaultValue" label="默认值" width="120" />
      <el-table-column prop="description" label="参数说明" min-width="200" show-overflow-tooltip />
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
        width="700px"
        :close-on-click-modal="false"
    >
      <el-form :model="paramForm" :rules="formRules" ref="formRef" label-width="100px">
        <el-form-item label="参数名称" prop="paramName">
          <el-input v-model="paramForm.paramName" placeholder="请输入参数名称" />
        </el-form-item>

        <el-form-item label="参数编码" prop="paramCode">
          <el-input v-model="paramForm.paramCode" placeholder="例如：max_approve_days" />
          <div class="tip">参数编码用于系统内部调用，建议使用英文和下划线</div>
        </el-form-item>

        <el-form-item label="参数分类" prop="category">
          <el-select v-model="paramForm.category" placeholder="请选择参数分类" style="width: 100%">
            <el-option label="审批参数" value="approval" />
            <el-option label="超时参数" value="timeout" />
            <el-option label="通知参数" value="notification" />
            <el-option label="安全参数" value="security" />
          </el-select>
        </el-form-item>

        <el-form-item label="参数值" prop="paramValue">
          <el-input v-model="paramForm.paramValue" placeholder="请输入参数值" />
        </el-form-item>

        <el-form-item label="默认值" prop="defaultValue">
          <el-input v-model="paramForm.defaultValue" placeholder="请输入默认值" />
        </el-form-item>

        <el-form-item label="参数说明" prop="description">
          <el-input
              v-model="paramForm.description"
              type="textarea"
              :rows="3"
              placeholder="请输入参数说明"
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
import { Search, Refresh, Plus, Download, Edit, Delete, RefreshLeft } from '@element-plus/icons-vue'

const searchKeyword = ref('')
const filterCategory = ref('')
const loading = ref(false)
const saving = ref(false)

// 参数列表
const paramList = ref([
  {
    id: 1,
    paramName: '最大审批天数',
    paramCode: 'max_approve_days',
    category: 'approval',
    paramValue: '30',
    defaultValue: '30',
    description: '流程最大审批天数，超过此天数流程自动终止'
  },
  {
    id: 2,
    paramName: '审批超时时间（小时）',
    paramCode: 'approve_timeout_hours',
    category: 'timeout',
    paramValue: '24',
    defaultValue: '24',
    description: '审批节点超时时间，超过后自动提醒或转交'
  },
  {
    id: 3,
    paramName: '启用邮件通知',
    paramCode: 'enable_email_notification',
    category: 'notification',
    paramValue: 'true',
    defaultValue: 'true',
    description: '是否启用邮件通知功能'
  },
  {
    id: 4,
    paramName: '启用短信通知',
    paramCode: 'enable_sms_notification',
    category: 'notification',
    paramValue: 'false',
    defaultValue: 'false',
    description: '是否启用短信通知功能'
  },
  {
    id: 5,
    paramName: '最大并行审批数',
    paramCode: 'max_parallel_approvals',
    category: 'approval',
    paramValue: '5',
    defaultValue: '5',
    description: '同一流程实例最大并行审批节点数'
  },
  {
    id: 6,
    paramName: '会话超时时间（分钟）',
    paramCode: 'session_timeout_minutes',
    category: 'security',
    paramValue: '30',
    defaultValue: '30',
    description: '用户会话超时时间，超时后需重新登录'
  },
  {
    id: 7,
    paramName: '允许撤回已提交申请',
    paramCode: 'allow_withdraw_submitted',
    category: 'approval',
    paramValue: 'true',
    defaultValue: 'true',
    description: '是否允许申请人撤回已提交的申请'
  },
  {
    id: 8,
    paramName: '超时自动转交',
    paramCode: 'auto_transfer_on_timeout',
    category: 'timeout',
    paramValue: 'false',
    defaultValue: 'false',
    description: '审批超时后是否自动转交给上级'
  }
])

// 对话框状态
const dialogVisible = ref(false)
const dialogTitle = ref('新增参数')
const formRef = ref(null)
const paramForm = ref({
  paramName: '',
  paramCode: '',
  category: '',
  paramValue: '',
  defaultValue: '',
  description: ''
})

// 表单验证规则
const formRules = {
  paramName: [
    { required: true, message: '请输入参数名称', trigger: 'blur' },
    { max: 50, message: '参数名称不能超过50个字符', trigger: 'blur' }
  ],
  paramCode: [
    { required: true, message: '请输入参数编码', trigger: 'blur' },
    { pattern: /^[a-z_][a-z0-9_]*$/, message: '参数编码只能包含小写字母、数字和下划线', trigger: 'blur' }
  ],
  category: [
    { required: true, message: '请选择参数分类', trigger: 'change' }
  ],
  paramValue: [
    { required: true, message: '请输入参数值', trigger: 'blur' }
  ]
}

// 筛选后的列表
const filteredParamList = computed(() => {
  let result = [...paramList.value]

  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(p =>
        p.paramName.toLowerCase().includes(keyword) ||
        p.paramCode.toLowerCase().includes(keyword)
    )
  }

  if (filterCategory.value) {
    result = result.filter(p => p.category === filterCategory.value)
  }

  return result
})

// 搜索
const handleSearch = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    ElMessage.success('查询完成')
  }, 500)
}

// 重置
const handleReset = () => {
  searchKeyword.value = ''
  filterCategory.value = ''
  ElMessage.success('已重置查询条件')
}

// 新增
const handleAdd = () => {
  dialogTitle.value = '新增参数'
  paramForm.value = {
    paramName: '',
    paramCode: '',
    category: '',
    paramValue: '',
    defaultValue: '',
    description: ''
  }
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row) => {
  dialogTitle.value = '编辑参数'
  paramForm.value = { ...row }
  dialogVisible.value = true
}

// 提交表单
const handleSubmit = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      saving.value = true

      setTimeout(() => {
        if (paramForm.value.id) {
          const index = paramList.value.findIndex(p => p.id === paramForm.value.id)
          if (index !== -1) {
            paramList.value[index] = { ...paramForm.value }
          }
          ElMessage.success('参数修改成功')
        } else {
          const newParam = {
            ...paramForm.value,
            id: Date.now()
          }
          paramList.value.unshift(newParam)
          ElMessage.success('参数新增成功')
        }

        saving.value = false
        dialogVisible.value = false
      }, 500)
    }
  })
}

// 删除
const handleDelete = (row) => {
  ElMessageBox.confirm(
      `确定要删除参数"${row.paramName}"吗？此操作不可恢复！`,
      '删除确认',
      {
        confirmButtonText: '确认删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
  ).then(() => {
    paramList.value = paramList.value.filter(p => p.id !== row.id)
    ElMessage.success('删除成功')
  }).catch(() => {})
}

// 导出
const handleExport = () => {
  ElMessage.success('导出功能开发中...')
}

// 恢复默认
const handleResetDefaults = () => {
  ElMessageBox.confirm(
      '确定要恢复所有参数为默认值吗？此操作将覆盖当前所有自定义配置！',
      '恢复默认确认',
      {
        confirmButtonText: '确认恢复',
        cancelButtonText: '取消',
        type: 'warning'
      }
  ).then(() => {
    paramList.value.forEach(p => {
      p.paramValue = p.defaultValue
    })
    ElMessage.success('已恢复所有参数为默认值')
  }).catch(() => {})
}

// 工具方法
const getCategoryTag = (category) => {
  const tags = {
    'approval': 'success',
    'timeout': 'warning',
    'notification': 'primary',
    'security': 'danger'
  }
  return tags[category] || 'info'
}

const getCategoryText = (category) => {
  const texts = {
    'approval': '审批参数',
    'timeout': '超时参数',
    'notification': '通知参数',
    'security': '安全参数'
  }
  return texts[category] || category
}
</script>

<style scoped lang="scss">
.process-params-management {
  padding: 20px;

  .page-header {
    margin-bottom: 24px;

    h2 {
      margin: 0 0 8px;
      font-size: 20px;
      color: #303133;
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

    .toolbar-left {
      display: flex;
      gap: 12px;
    }

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
