<!-- D:\Workspaces\BI\bi-front\src\views\process\design\variables\components\ProcessVariables.vue -->
<template>
  <div class="process-variables">
    <!-- 筛选搜索区 -->
    <div class="filter-section">
      <div class="filter-left">
        <span class="filter-label">变量分类：</span>
        <el-radio-group v-model="filterCategory" @change="handleFilterChange">
          <el-radio-button label="">全部</el-radio-button>
          <el-radio-button label="hr">人事类</el-radio-button>
          <el-radio-button label="finance">财务类</el-radio-button>
          <el-radio-button label="admin">行政类</el-radio-button>
          <el-radio-button label="general">通用类</el-radio-button>
        </el-radio-group>
      </div>
      <div class="filter-right">
        <el-input
            v-model="searchKeyword"
            placeholder="搜索变量名称/变量编码"
            clearable            style="width: 300px; margin-right: 12px"
            @keyup.enter="handleSearch"
            @clear="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button v-if="isAdmin" type="primary" icon="Plus" @click="handleAdd">新增变量</el-button>
      </div>
    </div>

    <!-- 批量操作栏 -->
    <div v-if="selectedVariables.length > 0 && isAdmin" class="batch-toolbar">
      <el-checkbox v-model="selectAll" @change="handleSelectAll">全选</el-checkbox>
      <span class="batch-info">已选择 {{ selectedVariables.length }} 项</span>
      <el-button size="small" type="success" @click="handleBatchEnable">批量启用</el-button>
      <el-button size="small" type="warning" @click="handleBatchDisable">批量禁用</el-button>
      <el-button size="small" type="danger" plain @click="handleBatchDelete">批量删除</el-button>
    </div>

    <!-- 数据表格 -->
    <div class="table-container">
      <el-table
          :data="filteredVariables"
          border
          stripe
          v-loading="loading"
          :row-class-name="getRowClassName"
          @selection-change="handleSelectionChange"
      >
        <el-table-column v-if="isAdmin" type="selection" width="50" align="center" />

        <el-table-column prop="varCode" label="变量编码" width="150" fixed>
          <template #default="{ row }">
            <span class="code-text">${{ row.varCode }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="varName" label="变量名称" width="140" />

        <el-table-column prop="varType" label="变量类型" width="100" align="center">
          <template #default="{ row }">
            <el-tag size="small" :type="getTypeTag(row.varType)">
              {{ getTypeText(row.varType) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="category" label="变量分类" width="120" align="center">
          <template #default="{ row }">
            <el-tag size="small" :type="getCategoryTag(row.category)">
              {{ getCategoryText(row.category) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="适用场景" min-width="200">
          <template #default="{ row }">
            <div class="scenario-tags">
              <el-tag
                  v-for="scenario in row.scenarios"
                  :key="scenario"
                  size="small"
                  type="info"
                  effect="plain"
                  style="margin-right: 4px"
              >
                {{ getScenarioText(scenario) }}
              </el-tag>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-switch
                v-if="isAdmin"
                v-model="row.status"
                active-value="enabled"
                inactive-value="disabled"
                @change="handleStatusChange(row)"
            />
            <el-tag v-else :type="row.status === 'enabled' ? 'success' : 'info'" size="small">
              {{ row.status === 'enabled' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="200" align="center" fixed="right" v-if="isAdmin">
          <template #default="{ row }">
            <el-button size="small" link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button size="small" link type="danger" @click="handleDelete(row)">删除</el-button>
            <el-button size="small" link type="success" @click="handleViewExample(row)">引用示例</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 空状态 -->
      <el-empty v-if="filteredVariables.length === 0" description="暂无流程变量" :image-size="100">
        <template #description>
          <p class="empty-text">请点击上方「新增变量」按钮创建</p>
        </template>
        <el-button v-if="isAdmin" type="primary" icon="Plus" @click="handleAdd">新增变量</el-button>
      </el-empty>
    </div>

    <!-- 分页区 -->
    <div class="pagination-section">
      <div class="pagination-info">
        共 {{ totalVariables }} 条记录 | 每页{{ pageSize }}条
      </div>
      <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50]"
          :total="totalVariables"
          layout="prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
      />
    </div>

    <!-- 新增/编辑变量弹窗 -->
    <el-dialog
        v-model="dialogVisible"
        :title="dialogTitle"
        width="800px"
        :close-on-click-modal="false"
    >
      <el-form :model="variableForm" :rules="formRules" ref="formRef" label-width="100px">
        <!-- 1. 基础信息 -->
        <div class="form-section">
          <h3 class="section-title">1. 基础信息</h3>
          <el-form-item label="变量编码" prop="varCode">
            <el-input v-model="variableForm.varCode" placeholder="如：day_num" :disabled="!!variableForm.id" />
            <div class="form-tip">变量编码用于表单引用，仅允许字母和下划线，保存后不可修改</div>
          </el-form-item>
          <el-form-item label="变量名称" prop="varName">
            <el-input v-model="variableForm.varName" placeholder="如：请假天数" />
          </el-form-item>
          <el-form-item label="变量分类" prop="category">
            <el-select v-model="variableForm.category" placeholder="请选择分类" style="width: 100%">
              <el-option label="人事类" value="hr" />
              <el-option label="财务类" value="finance" />
              <el-option label="行政类" value="admin" />
              <el-option label="通用类" value="general" />
            </el-select>
          </el-form-item>
        </div>

        <!-- 2. 数据配置 -->
        <div class="form-section">
          <h3 class="section-title">2. 数据配置</h3>
          <el-form-item label="变量类型" prop="varType">
            <el-select v-model="variableForm.varType" placeholder="请选择类型" style="width: 100%">
              <el-option label="文本" value="text" />
              <el-option label="数字" value="number" />
              <el-option label="日期" value="date" />
              <el-option label="布尔" value="boolean" />
              <el-option label="单选" value="radio" />
              <el-option label="多选" value="checkbox" />
              <el-option label="人员" value="user" />
              <el-option label="部门" value="department" />
            </el-select>
          </el-form-item>
          <el-form-item label="默认值">
            <el-input v-model="variableForm.defaultValue" placeholder="可选，如：0" />
          </el-form-item>
          <el-form-item label="备注说明">
            <el-input
                v-model="variableForm.description"
                type="textarea"
                :rows="2"
                placeholder="可选，用于说明变量用途"
            />
          </el-form-item>
        </div>

        <!-- 3. 适用范围 -->
        <div class="form-section">
          <h3 class="section-title">3. 适用范围</h3>
          <el-form-item label="">
            <el-checkbox-group v-model="variableForm.scenarios">
              <el-checkbox label="form">表单绑定</el-checkbox>
              <el-checkbox label="condition">流程条件</el-checkbox>
              <el-checkbox label="rule">审批规则</el-checkbox>
              <el-checkbox label="print">打印模板</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </div>

        <!-- 4. 状态 -->
        <div class="form-section">
          <h3 class="section-title">4. 状态</h3>
          <el-form-item label="">
            <el-radio-group v-model="variableForm.status">
              <el-radio label="enabled">启用（可使用）</el-radio>
              <el-radio label="disabled">禁用（隐藏）</el-radio>
            </el-radio-group>
          </el-form-item>
        </div>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="saving">保存</el-button>
      </template>
    </el-dialog>

    <!-- 引用示例弹窗 -->
    <el-dialog
        v-model="exampleDialogVisible"
        title="引用示例"
        width="700px"
        :close-on-click-modal="false"
    >
      <div v-if="currentVariable" class="example-content">
        <div class="example-header">
          <el-tag size="large" type="primary">${{ currentVariable.varCode }}</el-tag>
          <span class="example-name">{{ currentVariable.varName }}</span>
        </div>

        <div class="example-section">
          <h4 class="section-title">
            <el-icon color="#409EFF"><Document /></el-icon>
            表单绑定示例
          </h4>
          <div class="code-block">
            <div class="code-header">
              <span>表单字段配置</span>
              <el-button size="small" type="primary" link @click="copyToClipboard('form')">
                <el-icon><CopyDocument /></el-icon>
                复制
              </el-button>
            </div>
            <pre class="code-content">fieldName: ${{ currentVariable.varCode }}
defaultValue: ${"${" + currentVariable.varCode + "}"}</pre>
          </div>
        </div>

        <div class="example-section">
          <h4 class="section-title">
            <el-icon color="#67C23A"><Connection /></el-icon>
            流程条件示例
          </h4>
          <div class="code-block">
            <div class="code-header">
              <span>条件表达式</span>
              <el-button size="small" type="primary" link @click="copyToClipboard('condition')">
                <el-icon><CopyDocument /></el-icon>
                复制
              </el-button>
            </div>
            <pre class="code-content">${{ currentVariable.varCode }} > 3</pre>
          </div>
        </div>

        <el-alert
            title="提示：点击「复制」按钮可直接复制语法，粘贴到对应配置项中使用"
            type="success"
            :closable="false"
            show-icon
        />
      </div>

      <template #footer>
        <el-button @click="exampleDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search, Plus, CopyDocument, Document, Connection
} from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const isAdmin = computed(() => userStore.isAdmin)

// 加载状态
const loading = ref(false)
const saving = ref(false)

// 筛选条件
const filterCategory = ref('')
const searchKeyword = ref('')

// 分页
const currentPage = ref(1)
const pageSize = ref(10)

// 对话框状态
const dialogVisible = ref(false)
const dialogTitle = ref('新增流程变量')
const formRef = ref(null)
const currentVariable = ref(null)
const exampleDialogVisible = ref(false)

// 全选
const selectAll = ref(false)
const selectedVariables = ref([])

// 变量表单
const variableForm = ref({
  id: null,
  varCode: '',
  varName: '',
  varType: 'text',
  category: '',
  defaultValue: '',
  description: '',
  scenarios: ['form', 'condition'],
  status: 'enabled'
})

// 表单验证规则
const formRules = {
  varCode: [
    { required: true, message: '请输入变量编码', trigger: 'blur' },
    { pattern: /^[a-z_][a-z0-9_]*$/, message: '仅允许小写字母、数字、下划线', trigger: 'blur' }
  ],
  varName: [{ required: true, message: '请输入变量名称', trigger: 'blur' }],
  category: [{ required: true, message: '请选择变量分类', trigger: 'change' }],
  varType: [{ required: true, message: '请选择变量类型', trigger: 'change' }]
}

// 流程变量列表（预置数据）
const variableList = ref([
  {
    id: 1,
    varCode: 'day_num',
    varName: '请假天数',
    varType: 'number',
    category: 'hr',
    defaultValue: '0',
    description: '请假申请的天数',
    scenarios: ['form', 'condition'],
    status: 'enabled',
    isReferenced: false
  },
  {
    id: 2,
    varCode: 'money',
    varName: '报销金额',
    varType: 'number',
    category: 'finance',
    defaultValue: '0.00',
    description: '费用报销的金额',
    scenarios: ['form', 'condition', 'rule'],
    status: 'enabled',
    isReferenced: false
  },
  {
    id: 3,
    varCode: 'urgent',
    varName: '紧急程度',
    varType: 'radio',
    category: 'general',
    defaultValue: 'normal',
    description: '流程紧急程度标识',
    scenarios: ['form', 'condition'],
    status: 'enabled',
    isReferenced: false
  },
  {
    id: 4,
    varCode: 'hr_audit',
    varName: '是否HR审批',
    varType: 'boolean',
    category: 'hr',
    defaultValue: 'false',
    description: '标识是否需要HR部门审批',
    scenarios: ['rule', 'condition'],
    status: 'enabled',
    isReferenced: false
  },
  {
    id: 5,
    varCode: 'apply_reason',
    varName: '申请事由',
    varType: 'text',
    category: 'general',
    defaultValue: '',
    description: '申请的具体事由说明',
    scenarios: ['form', 'print'],
    status: 'enabled',
    isReferenced: false
  }
])

// 过滤后的变量列表
const filteredVariables = computed(() => {
  let result = [...variableList.value]

  // 分类筛选
  if (filterCategory.value) {
    result = result.filter(v => v.category === filterCategory.value)
  }

  // 关键词搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(v =>
        v.varName.toLowerCase().includes(keyword) ||
        v.varCode.toLowerCase().includes(keyword)
    )
  }

  return result
})

const totalVariables = computed(() => filteredVariables.value.length)

// 方法
const handleSearch = () => {
  currentPage.value = 1
}

const handleFilterChange = () => {
  currentPage.value = 1
}

const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
}

const handleCurrentChange = (page) => {
  currentPage.value = page
}

const handleSelectAll = (val) => {
  filteredVariables.value.forEach(v => v.selected = val)
}

const handleSelectionChange = (selection) => {
  selectedVariables.value = selection
}

const handleAdd = () => {
  dialogTitle.value = '新增流程变量'
  variableForm.value = {
    id: null,
    varCode: '',
    varName: '',
    varType: 'text',
    category: '',
    defaultValue: '',
    description: '',
    scenarios: ['form', 'condition'],
    status: 'enabled'
  }
  dialogVisible.value = true
}

const handleEdit = (row) => {
  dialogTitle.value = '编辑流程变量'
  variableForm.value = {
    ...row,
    scenarios: [...row.scenarios]
  }
  dialogVisible.value = true
}

const handleDelete = (row) => {
  if (row.isReferenced) {
    ElMessage.error(`变量「${row.varName}」已被流程引用，请先解除引用后再删除`)
    return
  }

  ElMessageBox.confirm(
      `确定要删除变量「${row.varName}」吗？此操作不可恢复！`,
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

const handleSubmit = () => {
  formRef.value?.validate((valid) => {
    if (!valid) return

    if (variableForm.value.scenarios.length === 0) {
      ElMessage.warning('请至少选择一个适用范围')
      return
    }

    saving.value = true
    setTimeout(() => {
      if (variableForm.value.id) {
        // 编辑
        const index = variableList.value.findIndex(v => v.id === variableForm.value.id)
        if (index !== -1) {
          variableList.value[index] = {
            ...variableForm.value,
            scenarios: [...variableForm.value.scenarios]
          }
        }
        ElMessage.success('变量修改成功')
      } else {
        // 新增
        variableList.value.unshift({
          ...variableForm.value,
          id: Date.now(),
          isReferenced: false,
          scenarios: [...variableForm.value.scenarios]
        })
        ElMessage.success('变量新增成功')
      }
      saving.value = false
      dialogVisible.value = false
    }, 500)
  })
}

const handleStatusChange = (row) => {
  const oldStatus = row.status === 'enabled' ? 'disabled' : 'enabled'
  const newStatus = row.status
  const action = newStatus === 'enabled' ? '启用' : '禁用'
  const oppositeAction = newStatus === 'enabled' ? '禁用' : '启用'

  ElMessageBox.confirm(
      `确定要${action}变量「${row.varName}」吗？\n\n${action}后，该变量将${newStatus === 'enabled' ? '可以在流程中使用' : '在流程中隐藏不可见'}。`,
      `${action}确认`,
      {
        confirmButtonText: `确认${action}`,
        cancelButtonText: `改为${oppositeAction}`,
        type: newStatus === 'enabled' ? 'success' : 'warning',
        distinguishCancelAndClose: true
      }
  ).then(() => {
    ElMessage.success(`已${action}变量「${row.varName}」`)
  }).catch((action) => {
    // 用户点击取消或关闭，恢复原状态
    row.status = oldStatus
    if (action === 'cancel') {
      ElMessage.info(`已取消${action}操作`)
    }
  })
}

const handleViewExample = (row) => {
  currentVariable.value = row
  exampleDialogVisible.value = true
}

const handleBatchEnable = () => {
  selectedVariables.value.forEach(v => v.status = 'enabled')
  ElMessage.success(`已批量启用 ${selectedVariables.value.length} 个变量`)
  selectedVariables.value = []
}

const handleBatchDisable = () => {
  selectedVariables.value.forEach(v => v.status = 'disabled')
  ElMessage.success(`已批量禁用 ${selectedVariables.value.length} 个变量`)
  selectedVariables.value = []
}

const handleBatchDelete = () => {
  const hasReferenced = selectedVariables.value.some(v => v.isReferenced)
  if (hasReferenced) {
    ElMessage.error('选中的变量中存在已被引用的变量，无法批量删除')
    return
  }

  ElMessageBox.confirm(
      `确定要删除选中的 ${selectedVariables.value.length} 个变量吗？`,
      '批量删除',
      {
        confirmButtonText: '确认删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
  ).then(() => {
    variableList.value = variableList.value.filter(v => !selectedVariables.value.find(s => s.id === v.id))
    ElMessage.success('批量删除成功')
    selectedVariables.value = []
  }).catch(() => {})
}

const copyToClipboard = (type) => {
  let text = ''
  if (type === 'form') {
    text = `fieldName: $${currentVariable.value.varCode}\ndefaultValue: \${$${currentVariable.value.varCode}}`
  } else if (type === 'condition') {
    text = `$${currentVariable.value.varCode} > 3`
  }

  navigator.clipboard.writeText(text).then(() => {
    ElMessage.success('已复制到剪贴板')
  }).catch(() => {
    ElMessage.error('复制失败，请手动复制')
  })
}

// 工具方法
const getTypeTag = (type) => {
  const tags = {
    'text': 'success',
    'number': 'primary',
    'date': 'info',
    'boolean': 'danger',
    'radio': 'warning',
    'checkbox': '',
    'user': '',
    'department': ''
  }
  return tags[type] || 'info'
}

const getTypeText = (type) => {
  const texts = {
    'text': '文本',
    'number': '数字',
    'date': '日期',
    'boolean': '布尔',
    'radio': '单选',
    'checkbox': '多选',
    'user': '人员',
    'department': '部门'
  }
  return texts[type] || type
}

const getCategoryTag = (category) => {
  const tags = {
    'hr': 'success',
    'finance': 'warning',
    'admin': 'primary',
    'general': 'info'
  }
  return tags[category] || 'info'
}

const getCategoryText = (category) => {
  const texts = {
    'hr': '人事类',
    'finance': '财务类',
    'admin': '行政类',
    'general': '通用类'
  }
  return texts[category] || category
}

const getScenarioText = (scenario) => {
  const texts = {
    'form': '表单绑定',
    'condition': '流程条件',
    'rule': '审批规则',
    'print': '打印模板'
  }
  return texts[scenario] || scenario
}

const getRowClassName = ({ row }) => {
  return row.status === 'disabled' ? 'disabled-row' : ''
}
</script>

<style scoped lang="scss">
.process-variables {
  .filter-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding: 16px 20px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

    .filter-left {
      display: flex;
      align-items: center;
      gap: 12px;

      .filter-label {
        font-size: 14px;
        color: #606266;
        font-weight: 500;
      }
    }
  }

  .batch-toolbar {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    background: #f0f9ff;
    border: 1px solid #d9ecff;
    border-radius: 4px;
    margin-bottom: 16px;

    .batch-info {
      font-size: 14px;
      color: #409eff;
      font-weight: 500;
    }
  }

  .table-container {
    background: #fff;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

    .code-text {
      font-family: 'Courier New', monospace;
      color: #409EFF;
      font-weight: 600;
      font-size: 13px;
    }

    .scenario-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
    }

    :deep(.disabled-row) {
      background-color: #fafafa;

      td {
        color: #c0c4cc;
      }
    }
  }

  .pagination-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 16px;
    padding: 16px 20px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

    .pagination-info {
      font-size: 14px;
      color: #606266;
    }
  }

  .empty-text {
    color: #909399;
    margin: 8px 0 16px;
  }

  .form-tip {
    margin-top: 4px;
    font-size: 12px;
    color: #909399;
  }

  // 表单样式
  .form-section {
    margin-bottom: 24px;
    padding-bottom: 24px;
    border-bottom: 1px solid #ebeef5;

    &:last-child {
      border-bottom: none;
      margin-bottom: 0;
      padding-bottom: 0;
    }

    .section-title {
      font-size: 15px;
      font-weight: 600;
      color: #303133;
      margin: 0 0 16px;
      padding-left: 8px;
      border-left: 3px solid #409EFF;
    }
  }

  // 引用示例弹窗样式
  .example-content {
    .example-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 2px solid #f0f0f0;

      .example-name {
        font-size: 16px;
        font-weight: 600;
        color: #303133;
      }
    }

    .example-section {
      margin-bottom: 20px;

      .section-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        font-weight: 600;
        color: #303133;
        margin: 0 0 12px;
      }

      .code-block {
        border: 1px solid #dcdfe6;
        border-radius: 6px;
        overflow: hidden;

        .code-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 12px;
          background: #f5f7fa;
          border-bottom: 1px solid #dcdfe6;
          font-size: 13px;
          font-weight: 500;
          color: #606266;
        }

        .code-content {
          margin: 0;
          padding: 12px;
          background: #fafafa;
          font-family: 'Courier New', monospace;
          font-size: 13px;
          line-height: 1.6;
          color: #303133;
          overflow-x: auto;
        }
      }
    }
  }
}
</style>
