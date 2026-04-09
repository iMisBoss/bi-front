<template>
  <div class="process-variables-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>流程变量管理</h2>
      <p class="subtitle">管理流程运行时的变量定义，支持全局变量和局部变量</p>
    </div>

    <!-- 工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <el-input
            v-model="searchKeyword"
            placeholder="搜索变量名称、变量编码"
            clearable
            style="width: 300px"
            @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-select v-model="filterScope" placeholder="变量范围" clearable style="width: 150px">
          <el-option label="全局变量" value="global" />
          <el-option label="流程变量" value="process" />
          <el-option label="节点变量" value="node" />
        </el-select>
        <el-select v-model="filterType" placeholder="变量类型" clearable style="width: 150px">
          <el-option label="字符串" value="string" />
          <el-option label="整数" value="integer" />
          <el-option label="小数" value="decimal" />
          <el-option label="日期" value="date" />
          <el-option label="布尔值" value="boolean" />
        </el-select>
        <el-button type="primary" icon="Search" @click="handleSearch">查询</el-button>
        <el-button icon="Refresh" @click="handleReset">重置</el-button>
      </div>
      <div class="toolbar-right">
        <el-button type="primary" icon="Plus" @click="handleAdd">新增变量</el-button>
        <el-button type="success" icon="Download" @click="handleExport">导出变量</el-button>
      </div>
    </div>

    <!-- 数据表格 -->
    <el-table
        :data="filteredVariableList"
        border
        style="width: 100%"
        v-loading="loading"
        @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column prop="varName" label="变量名称" min-width="150" />
      <el-table-column prop="varCode" label="变量编码" min-width="150" />
      <el-table-column prop="varType" label="变量类型" width="100">
        <template #default="{ row }">
          <el-tag size="small" :type="getTypeTag(row.varType)">
            {{ getTypeText(row.varType) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="scope" label="变量范围" width="100">
        <template #default="{ row }">
          <el-tag size="small" :type="getScopeTag(row.scope)">
            {{ getScopeText(row.scope) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="defaultValue" label="默认值" min-width="150" />
      <el-table-column prop="description" label="变量说明" min-width="200" show-overflow-tooltip />
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

    <!-- 分页 -->
    <div class="pagination-bar">
      <span>共 {{ filteredVariableList.length }} 条记录</span>
      <el-pagination
          layout="total, sizes, prev, pager, next, jumper"
          :total="filteredVariableList.length"
          :page-sizes="[10, 20, 50]"
          v-model:page-size="pageSize"
          v-model:current-page="currentPage"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
      />
    </div>

    <!-- 新增/编辑对话框 -->
    <el-dialog
        v-model="dialogVisible"
        :title="dialogTitle"
        width="700px"
        :close-on-click-modal="false"
    >
      <el-form :model="variableForm" :rules="formRules" ref="formRef" label-width="100px">
        <el-form-item label="变量名称" prop="varName">
          <el-input v-model="variableForm.varName" placeholder="请输入变量名称" />
        </el-form-item>

        <el-form-item label="变量编码" prop="varCode">
          <el-input v-model="variableForm.varCode" placeholder="例如：leave_days" />
          <div class="tip">变量编码用于流程表达式引用，建议使用英文和下划线</div>
        </el-form-item>

        <el-form-item label="变量类型" prop="varType">
          <el-select v-model="variableForm.varType" placeholder="请选择变量类型" style="width: 100%">
            <el-option label="字符串" value="string" />
            <el-option label="整数" value="integer" />
            <el-option label="小数" value="decimal" />
            <el-option label="日期" value="date" />
            <el-option label="布尔值" value="boolean" />
            <el-option label="对象" value="object" />
          </el-select>
        </el-form-item>

        <el-form-item label="变量范围" prop="scope">
          <el-select v-model="variableForm.scope" placeholder="请选择变量范围" style="width: 100%">
            <el-option label="全局变量（所有流程可用）" value="global" />
            <el-option label="流程变量（当前流程可用）" value="process" />
            <el-option label="节点变量（指定节点可用）" value="node" />
          </el-select>
        </el-form-item>

        <el-form-item label="默认值" prop="defaultValue">
          <el-input v-model="variableForm.defaultValue" placeholder="请输入默认值" />
        </el-form-item>

        <el-form-item label="变量说明" prop="description">
          <el-input
              v-model="variableForm.description"
              type="textarea"
              :rows="3"
              placeholder="请输入变量说明"
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
import { Search, Refresh, Plus, Download, Edit, Delete } from '@element-plus/icons-vue'

const searchKeyword = ref('')
const filterScope = ref('')
const filterType = ref('')
const loading = ref(false)
const saving = ref(false)

// 变量列表
const variableList = ref([
  {
    id: 1,
    varName: '请假天数',
    varCode: 'leave_days',
    varType: 'integer',
    scope: 'process',
    defaultValue: '0',
    description: '请假申请的天数，用于条件判断',
    creator: '系统管理员',
    createTime: '2024-01-10 09:00:00'
  },
  {
    id: 2,
    varName: '报销金额',
    varCode: 'expense_amount',
    varType: 'decimal',
    scope: 'process',
    defaultValue: '0.00',
    description: '费用报销的金额，用于审批金额判断',
    creator: '财务管理员',
    createTime: '2024-02-01 10:00:00'
  },
  {
    id: 3,
    varName: '紧急程度',
    varCode: 'urgency_level',
    varType: 'string',
    scope: 'global',
    defaultValue: '普通',
    description: '流程紧急程度标识',
    creator: '系统管理员',
    createTime: '2024-01-15 11:00:00'
  },
  {
    id: 4,
    varName: '是否需要HR审批',
    varCode: 'need_hr_approval',
    varType: 'boolean',
    scope: 'process',
    defaultValue: 'false',
    description: '标识是否需要HR部门审批',
    creator: '流程管理员',
    createTime: '2024-03-01 09:30:00'
  },
  {
    id: 5,
    varName: '申请人职级',
    varCode: 'applicant_level',
    varType: 'integer',
    scope: 'process',
    defaultValue: '1',
    description: '申请人的职级，用于审批人匹配',
    creator: '系统管理员',
    createTime: '2024-01-20 14:00:00'
  }
])

const pageSize = ref(10)
const currentPage = ref(1)

// 筛选后的列表
const filteredVariableList = computed(() => {
  let result = [...variableList.value]

  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(v =>
        v.varName.toLowerCase().includes(keyword) ||
        v.varCode.toLowerCase().includes(keyword)
    )
  }

  if (filterScope.value) {
    result = result.filter(v => v.scope === filterScope.value)
  }

  if (filterType.value) {
    result = result.filter(v => v.varType === filterType.value)
  }

  return result
})

// 对话框状态
const dialogVisible = ref(false)
const dialogTitle = ref('新增变量')
const formRef = ref(null)
const variableForm = ref({
  varName: '',
  varCode: '',
  varType: 'string',
  scope: 'process',
  defaultValue: '',
  description: ''
})

// 表单验证规则
const formRules = {
  varName: [
    { required: true, message: '请输入变量名称', trigger: 'blur' },
    { max: 50, message: '变量名称不能超过50个字符', trigger: 'blur' }
  ],
  varCode: [
    { required: true, message: '请输入变量编码', trigger: 'blur' },
    { pattern: /^[a-z_][a-z0-9_]*$/, message: '变量编码只能包含小写字母、数字和下划线', trigger: 'blur' }
  ],
  varType: [
    { required: true, message: '请选择变量类型', trigger: 'change' }
  ],
  scope: [
    { required: true, message: '请选择变量范围', trigger: 'change' }
  ]
}

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
  filterScope.value = ''
  filterType.value = ''
  currentPage.value = 1
  ElMessage.success('已重置查询条件')
}

// 新增
const handleAdd = () => {
  dialogTitle.value = '新增变量'
  variableForm.value = {
    varName: '',
    varCode: '',
    varType: 'string',
    scope: 'process',
    defaultValue: '',
    description: ''
  }
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row) => {
  dialogTitle.value = '编辑变量'
  variableForm.value = { ...row }
  dialogVisible.value = true
}

// 提交表单
const handleSubmit = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      saving.value = true

      setTimeout(() => {
        if (variableForm.value.id) {
          const index = variableList.value.findIndex(v => v.id === variableForm.value.id)
          if (index !== -1) {
            variableList.value[index] = { ...variableForm.value }
          }
          ElMessage.success('变量修改成功')
        } else {
          const newVar = {
            ...variableForm.value,
            id: Date.now(),
            creator: '当前用户',
            createTime: new Date().toLocaleString('zh-CN')
          }
          variableList.value.unshift(newVar)
          ElMessage.success('变量新增成功')
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
      `确定要删除变量"${row.varName}"吗？此操作不可恢复！`,
      '删除确认',
      {
        confirmButtonText: '确认删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
  ).then(() => {
    variableList.value = variableList.value.filter(v => v.id !== row.id)
    ElMessage.success('删除成功')
  }).catch(() => {})
}

// 导出
const handleExport = () => {
  ElMessage.success('导出功能开发中...')
}

// 选择变化
const handleSelectionChange = (selection) => {
  console.log('选中的变量:', selection)
}

// 分页相关
const handleSizeChange = (size) => {
  pageSize.value = size
}

const handleCurrentChange = (page) => {
  currentPage.value = page
}

// 工具方法
const getTypeTag = (type) => {
  const tags = {
    'string': 'success',
    'integer': 'primary',
    'decimal': 'warning',
    'date': 'info',
    'boolean': 'danger',
    'object': ''
  }
  return tags[type] || 'info'
}

const getTypeText = (type) => {
  const texts = {
    'string': '字符串',
    'integer': '整数',
    'decimal': '小数',
    'date': '日期',
    'boolean': '布尔值',
    'object': '对象'
  }
  return texts[type] || type
}

const getScopeTag = (scope) => {
  const tags = {
    'global': 'success',
    'process': 'primary',
    'node': 'warning'
  }
  return tags[scope] || 'info'
}

const getScopeText = (scope) => {
  const texts = {
    'global': '全局变量',
    'process': '流程变量',
    'node': '节点变量'
  }
  return texts[scope] || scope
}
</script>

<style scoped lang="scss">
.process-variables-management {
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

  .pagination-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 16px;
    padding: 12px 0;
  }

  .tip {
    margin-top: 4px;
    font-size: 12px;
    color: #909399;
  }
}
</style>
