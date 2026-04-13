<template>
  <div class="system-variables-library">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator=">" class="breadcrumb">
      <el-breadcrumb-item :to="{ path: '/admin' }">后台首页</el-breadcrumb-item>
      <el-breadcrumb-item>低代码设计平台</el-breadcrumb-item>
      <el-breadcrumb-item>基础能力配置</el-breadcrumb-item>
      <el-breadcrumb-item>系统变量库</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 标题区 -->
    <div class="page-header">
      <div class="header-left">
        <h2>系统变量库</h2>
        <p class="subtitle">系统内置全局变量，自动获取用户/流程上下文，表单与流程可直接引用</p>
      </div>
      <div class="header-right">
        <el-button icon="Refresh" @click="handleRefresh">刷新</el-button>
      </div>
    </div>

    <!-- 筛选搜索区 -->
    <div class="filter-section">
      <div class="filter-left">
        <span class="filter-label">变量分类：</span>
        <el-radio-group v-model="filterCategory" @change="handleFilterChange">
          <el-radio-button label="">全部</el-radio-button>
          <el-radio-button label="applicant">申请人信息</el-radio-button>
          <el-radio-button label="department">部门信息</el-radio-button>
          <el-radio-button label="flow">流程信息</el-radio-button>
          <el-radio-button label="time">时间信息</el-radio-button>
          <el-radio-button label="business">业务通用</el-radio-button>
        </el-radio-group>
      </div>
      <div class="filter-right">
        <el-input
            v-model="searchKeyword"
            placeholder="搜索变量名称/变量编码/变量标识"
            clearable
            style="width: 300px"
            @keyup.enter="handleSearch"
            @clear="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>
    </div>

    <!-- 数据表格 -->
    <div class="table-container">
      <el-table
          :data="filteredVariables"
          border
          stripe
          v-loading="loading"
          :row-class-name="getRowClassName"
      >
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
                v-if="isSuperAdmin"
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

        <el-table-column label="操作" width="180" align="center" fixed="right">
          <template #default="{ row }">
            <el-button size="small" link type="primary" @click="handleViewDetail(row)">
              查看详情
            </el-button>
            <el-button size="small" link type="success" @click="handleViewExample(row)">
              引用示例
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 空状态 -->
      <el-empty v-if="filteredVariables.length === 0" description="暂无匹配的变量" :image-size="100" />
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

    <!-- 变量详情弹窗 -->
    <el-dialog
        v-model="detailDialogVisible"
        title="变量详情"
        width="700px"
        :close-on-click-modal="false"
    >
      <div v-if="currentVariable" class="variable-detail">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="变量编码">
            <code class="code-highlight">${{ currentVariable.varCode }}</code>
          </el-descriptions-item>
          <el-descriptions-item label="变量名称">{{ currentVariable.varName }}</el-descriptions-item>
          <el-descriptions-item label="变量类型">
            <el-tag size="small" :type="getTypeTag(currentVariable.varType)">
              {{ getTypeText(currentVariable.varType) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="变量分类">
            <el-tag size="small" :type="getCategoryTag(currentVariable.category)">
              {{ getCategoryText(currentVariable.category) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="默认值">
            {{ currentVariable.defaultValue || '无（系统自动赋值）' }}
          </el-descriptions-item>
          <el-descriptions-item label="变量说明">{{ currentVariable.description }}</el-descriptions-item>
          <el-descriptions-item label="适用场景">
            <div class="scenario-list">
              <el-tag
                  v-for="scenario in currentVariable.scenarios"
                  :key="scenario"
                  size="small"
                  style="margin-right: 6px; margin-bottom: 6px"
              >
                {{ getScenarioText(scenario) }}
              </el-tag>
            </div>
          </el-descriptions-item>
        </el-descriptions>

        <el-alert
            title="系统变量由平台预置，不可新增、删除或编辑，仅支持启用/禁用"
            type="info"
            :closable="false"
            style="margin-top: 16px"
        />
      </div>

      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 引用示例弹窗 -->
    <el-dialog
        v-model="exampleDialogVisible"
        title="引用示例"
        width="800px"
        :close-on-click-modal="false"
    >
      <div v-if="currentVariable" class="example-content">
        <div class="example-header">
          <el-tag size="large" :type="getTypeTag(currentVariable.varType)">
            ${{ currentVariable.varCode }}
          </el-tag>
          <span class="example-name">{{ currentVariable.varName }}</span>
        </div>

        <!-- 场景1：表单绑定 -->
        <div class="example-section">
          <h4 class="section-title">
            <el-icon color="#409EFF"><Document /></el-icon>
            场景1：表单控件绑定
          </h4>
          <div class="example-box">
            <div class="example-desc">在表单设计器中，选择该变量作为字段默认值，发起流程时自动填充</div>
            <div class="code-block">
              <div class="code-header">
                <span>表单字段配置</span>
                <el-button size="small" type="primary" link @click="copyToClipboard('form')">
                  <el-icon><CopyDocument /></el-icon>
                  复制
                </el-button>
              </div>
              <pre class="code-content">{{ getFormExample() }}</pre>
            </div>
          </div>
        </div>

        <!-- 场景2：流程条件 -->
        <div class="example-section">
          <h4 class="section-title">
            <el-icon color="#67C23A"><Connection /></el-icon>
            场景2：流程条件判断
          </h4>
          <div class="example-box">
            <div class="example-desc">在审批人规则引擎中，使用该变量作为条件判断依据</div>
            <div class="code-block">
              <div class="code-header">
                <span>条件表达式</span>
                <el-button size="small" type="primary" link @click="copyToClipboard('condition')">
                  <el-icon><CopyDocument /></el-icon>
                  复制
                </el-button>
              </div>
              <pre class="code-content">{{ getConditionExample() }}</pre>
            </div>
          </div>
        </div>

        <!-- 场景3：文案模板 -->
        <div class="example-section">
          <h4 class="section-title">
            <el-icon color="#E6A23C"><EditPen /></el-icon>
            场景3：打印/文案模板
          </h4>
          <div class="example-box">
            <div class="example-desc">在通知模板、打印模板中，拼接变量生成动态文案</div>
            <div class="code-block">
              <div class="code-header">
                <span>模板语法</span>
                <el-button size="small" type="primary" link @click="copyToClipboard('template')">
                  <el-icon><CopyDocument /></el-icon>
                  复制
                </el-button>
              </div>
              <pre class="code-content">{{ getTemplateExample() }}</pre>
            </div>
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
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Refresh, CopyDocument, Document, Connection, EditPen } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

// 权限判断（假设超级管理员有特殊标识）
const isSuperAdmin = computed(() => userStore.currentUser?.role === 'super_admin')

// 加载状态
const loading = ref(false)

// 筛选条件
const filterCategory = ref('')
const searchKeyword = ref('')

// 分页
const currentPage = ref(1)
const pageSize = ref(10)

// 对话框状态
const detailDialogVisible = ref(false)
const exampleDialogVisible = ref(false)
const currentVariable = ref(null)

// 系统变量列表（预置数据，覆盖99%企业场景）
const variableList = ref([
  // 申请人信息
  {
    id: 1,
    varCode: 'user_id',
    varName: '申请人ID',
    varType: 'string',
    category: 'applicant',
    defaultValue: '',
    description: '获取当前发起流程的用户ID，用于数据关联和权限校验',
    scenarios: ['form', 'condition', 'rule', 'print'],
    status: 'enabled'
  },
  {
    id: 2,
    varCode: 'user_name',
    varName: '申请人姓名',
    varType: 'string',
    category: 'applicant',
    defaultValue: '',
    description: '获取当前发起流程的用户姓名，自动填充无需手动输入',
    scenarios: ['form', 'condition', 'rule', 'print'],
    status: 'enabled'
  },
  {
    id: 3,
    varCode: 'user_post',
    varName: '申请人职级',
    varType: 'integer',
    category: 'applicant',
    defaultValue: '1',
    description: '获取当前用户的职级编号，用于审批层级判断（1=员工，2=主管，3=经理，4=总监）',
    scenarios: ['condition', 'rule'],
    status: 'enabled'
  },
  {
    id: 4,
    varCode: 'user_leader',
    varName: '直属领导',
    varType: 'user',
    category: 'applicant',
    defaultValue: '',
    description: '获取申请人的直属上级，用于自动匹配审批人',
    scenarios: ['rule', 'condition'],
    status: 'enabled'
  },

  // 部门信息
  {
    id: 5,
    varCode: 'dept_id',
    varName: '部门ID',
    varType: 'string',
    category: 'department',
    defaultValue: '',
    description: '获取申请人所属部门的ID标识',
    scenarios: ['form', 'condition'],
    status: 'enabled'
  },
  {
    id: 6,
    varCode: 'dept_name',
    varName: '申请部门',
    varType: 'string',
    category: 'department',
    defaultValue: '',
    description: '获取申请人所属部门的名称，如：技术部、财务部',
    scenarios: ['form', 'condition', 'print'],
    status: 'enabled'
  },
  {
    id: 7,
    varCode: 'dept_manager',
    varName: '部门负责人',
    varType: 'user',
    category: 'department',
    defaultValue: '',
    description: '获取申请人部门的负责人，用于部门级审批',
    scenarios: ['rule'],
    status: 'enabled'
  },

  // 流程信息
  {
    id: 8,
    varCode: 'flow_no',
    varName: '流程编号',
    varType: 'string',
    category: 'flow',
    defaultValue: '',
    description: '系统自动生成的流程唯一编号，格式：FL202404070001',
    scenarios: ['form', 'print'],
    status: 'enabled'
  },
  {
    id: 9,
    varCode: 'flow_title',
    varName: '流程标题',
    varType: 'string',
    category: 'flow',
    defaultValue: '',
    description: '流程的标题名称，如：张三的请假申请',
    scenarios: ['form', 'print'],
    status: 'enabled'
  },
  {
    id: 10,
    varCode: 'flow_status',
    varName: '流程状态',
    varType: 'string',
    category: 'flow',
    defaultValue: 'draft',
    description: '当前流程的状态：draft=草稿，running=审批中，approved=已通过，rejected=已驳回',
    scenarios: ['condition', 'print'],
    status: 'enabled'
  },

  // 时间信息
  {
    id: 11,
    varCode: 'apply_time',
    varName: '申请时间',
    varType: 'datetime',
    category: 'time',
    defaultValue: '',
    description: '流程发起的时间，精确到秒',
    scenarios: ['form', 'print'],
    status: 'enabled'
  },
  {
    id: 12,
    varCode: 'create_time',
    varName: '创建时间',
    varType: 'datetime',
    category: 'time',
    defaultValue: '',
    description: '流程实例创建的时间戳',
    scenarios: ['form', 'print'],
    status: 'enabled'
  },
  {
    id: 13,
    varCode: 'update_time',
    varName: '更新时间',
    varType: 'datetime',
    category: 'time',
    defaultValue: '',
    description: '流程最后一次更新的时间',
    scenarios: ['print'],
    status: 'enabled'
  },

  // 业务通用
  {
    id: 14,
    varCode: 'is_urgent',
    varName: '是否紧急',
    varType: 'boolean',
    category: 'business',
    defaultValue: 'false',
    description: '标识流程是否紧急，用于优先处理',
    scenarios: ['form', 'condition'],
    status: 'enabled'
  },
  {
    id: 15,
    varCode: 'apply_money',
    varName: '申请金额',
    varType: 'decimal',
    category: 'business',
    defaultValue: '0.00',
    description: '流程涉及的申请金额，用于金额分级审批',
    scenarios: ['form', 'condition', 'rule'],
    status: 'enabled'
  },
  {
    id: 16,
    varCode: 'apply_days',
    varName: '申请天数',
    varType: 'integer',
    category: 'business',
    defaultValue: '0',
    description: '流程涉及的天数（如请假天数、出差天数），用于时长判断',
    scenarios: ['form', 'condition', 'rule'],
    status: 'enabled'
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
const handleRefresh = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    ElMessage.success('刷新成功')
  }, 300)
}

const handleFilterChange = () => {
  currentPage.value = 1
}

const handleSearch = () => {
  currentPage.value = 1
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 300)
}

const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
}

const handleCurrentChange = (page) => {
  currentPage.value = page
}

const handleViewDetail = (row) => {
  currentVariable.value = row
  detailDialogVisible.value = true
}

const handleViewExample = (row) => {
  currentVariable.value = row
  exampleDialogVisible.value = true
}

const handleStatusChange = (row) => {
  const action = row.status === 'enabled' ? '启用' : '禁用'
  ElMessage.success(`已${action}变量「${row.varName}」`)
}

// 获取示例
const getFormExample = () => {
  if (!currentVariable.value) return ''
  const varCode = currentVariable.value.varCode

  if (currentVariable.value.category === 'applicant') {
    return `// 表单字段配置\n{\n  "field": "${varCode}",\n  "label": "${currentVariable.value.varName}",\n  "defaultValue": "\${${varCode}}",\n  "readonly": true\n}`
  }

  return `// 自动填充配置\nfieldName: ${varCode}\ndefaultValue: \${${varCode}}`
}

const getConditionExample = () => {
  if (!currentVariable.value) return ''
  const varCode = currentVariable.value.varCode

  if (currentVariable.value.varType === 'string') {
    return `\${${varCode}} == "技术部"`
  } else if (currentVariable.value.varType === 'integer' || currentVariable.value.varType === 'decimal') {
    return `\${${varCode}} > 1000`
  } else if (currentVariable.value.varType === 'boolean') {
    return `\${${varCode}} == true`
  }

  return `\${${varCode}} != null`
}

const getTemplateExample = () => {
  if (!currentVariable.value) return ''
  const varCode = currentVariable.value.varCode

  if (currentVariable.value.category === 'applicant') {
    return `申请人\${user_name}于\${apply_time}发起申请，请审批。`
  } else if (currentVariable.value.category === 'business') {
    return `申请金额：\${apply_money}元\n申请天数：\${apply_days}天`
  }

  return `当前值：\${${varCode}}`
}

// 复制到剪贴板
const copyToClipboard = (type) => {
  let text = ''

  if (type === 'form') {
    text = getFormExample()
  } else if (type === 'condition') {
    text = getConditionExample()
  } else if (type === 'template') {
    text = getTemplateExample()
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
    'string': 'success',
    'integer': 'primary',
    'decimal': 'warning',
    'datetime': 'info',
    'boolean': 'danger',
    'user': '',
    'department': ''
  }
  return tags[type] || 'info'
}

const getTypeText = (type) => {
  const texts = {
    'string': '文本',
    'integer': '数字',
    'decimal': '小数',
    'datetime': '日期时间',
    'boolean': '布尔',
    'user': '人员',
    'department': '部门'
  }
  return texts[type] || type
}

const getCategoryTag = (category) => {
  const tags = {
    'applicant': 'success',
    'department': 'primary',
    'flow': 'warning',
    'time': 'info',
    'business': ''
  }
  return tags[category] || 'info'
}

const getCategoryText = (category) => {
  const texts = {
    'applicant': '申请人信息',
    'department': '部门信息',
    'flow': '流程信息',
    'time': '时间信息',
    'business': '业务通用'
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
.system-variables-library {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 60px);

  .breadcrumb {
    margin-bottom: 20px;
    font-size: 14px;
  }

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    padding: 20px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

    .header-left {
      h2 {
        margin: 0 0 8px;
        font-size: 22px;
        color: #303133;
        font-weight: 600;
      }

      .subtitle {
        margin: 0;
        font-size: 14px;
        color: #909399;
      }
    }
  }

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

  // 详情弹窗样式
  .variable-detail {
    .code-highlight {
      font-family: 'Courier New', monospace;
      background: #f0f9ff;
      padding: 4px 8px;
      border-radius: 4px;
      color: #409EFF;
      font-weight: 600;
    }

    .scenario-list {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
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
      margin-bottom: 24px;

      .section-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 15px;
        font-weight: 600;
        color: #303133;
        margin: 0 0 12px;
      }

      .example-box {
        .example-desc {
          font-size: 13px;
          color: #909399;
          margin-bottom: 8px;
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
}
</style>
