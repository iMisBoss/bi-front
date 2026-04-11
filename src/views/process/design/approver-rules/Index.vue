<template>
  <div class="approver-rules-engine">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator=">" class="breadcrumb">
      <el-breadcrumb-item :to="{ path: '/admin' }">后台首页</el-breadcrumb-item>
      <el-breadcrumb-item>低代码设计平台</el-breadcrumb-item>
      <el-breadcrumb-item>审批人规则引擎</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 页面标题区 -->
    <div class="page-header">
      <div class="header-left">
        <h2>审批人规则引擎（审批人模板库）</h2>
        <p class="subtitle">提前创建审批人规则模板，请假/报销/采购等流程可直接引用，无需重复配置</p>
      </div>
    </div>

    <!-- 搜索与操作栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <el-input
            v-model="searchKeyword"
            placeholder="搜索规则名称/规则说明"
            clearable
            style="width: 280px"
            @keyup.enter="handleSearch"
        >
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>
        <el-select v-model="filterStatus" placeholder="状态" clearable style="width: 120px">
          <el-option label="启用" value="enabled" />
          <el-option label="禁用" value="disabled" />
        </el-select>
        <el-button type="primary" icon="Search" @click="handleSearch">查询</el-button>
        <el-button icon="Refresh" @click="handleReset">重置</el-button>
      </div>
      <div class="toolbar-right" v-if="isAdmin">
        <el-button type="primary" icon="Plus" @click="handleAddRule">新建审批规则</el-button>
      </div>
    </div>

    <!-- 批量操作栏 -->
    <div v-if="selectedRules.length > 0 && isAdmin" class="batch-toolbar">
      <el-checkbox v-model="selectAll" @change="handleSelectAll">全选</el-checkbox>
      <span class="batch-info">已选择 {{ selectedRules.length }} 项</span>
      <el-button size="small" type="success" @click="handleBatchEnable">批量启用</el-button>
      <el-button size="small" type="warning" @click="handleBatchDisable">批量禁用</el-button>
      <el-button size="small" type="danger" plain @click="handleBatchDelete">批量删除</el-button>
    </div>

    <!-- 规则列表表格 -->
    <div class="rules-table-container">
      <el-table
          :data="filteredRules"
          border
          stripe
          v-loading="loading"
          @selection-change="handleSelectionChange"
      >
        <el-table-column v-if="isAdmin" type="selection" width="50" align="center" />

        <el-table-column prop="ruleName" label="规则名称" min-width="150">
          <template #default="{ row }">
            <span class="rule-name-link" @click="handleViewDetail(row)">{{ row.ruleName }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="description" label="规则说明" min-width="180" show-overflow-tooltip />

        <el-table-column label="触发条件" min-width="180">
          <template #default="{ row }">
            <div v-if="row.conditions && row.conditions.length > 0" class="conditions-display">
              <el-tag v-for="(cond, idx) in row.conditions.slice(0, 2)" :key="idx" size="small" style="margin-right: 4px">
                {{ cond.field }}{{ cond.operator }}{{ cond.value }}
              </el-tag>
              <span v-if="row.conditions.length > 2" class="more-count">+{{ row.conditions.length - 2 }}</span>
            </div>
            <span v-else class="text-muted">无条件限制</span>
          </template>
        </el-table-column>

        <el-table-column label="审批链" min-width="200">
          <template #default="{ row }">
            <div class="approval-chain-display">
              <span v-for="(node, idx) in row.approvalNodes" :key="idx" class="chain-node-tag">
                {{ node.name }}
                <span v-if="idx < row.approvalNodes.length - 1" class="chain-arrow">→</span>
              </span>
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
            <el-button size="small" link type="primary" icon="Edit" @click="handleEditRule(row)">编辑</el-button>
            <el-button size="small" link type="success" icon="CopyDocument" @click="handleCopyRule(row)">复制</el-button>
            <el-button size="small" link type="danger" icon="Delete" @click="handleDeleteRule(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 空状态 -->
      <el-empty v-if="filteredRules.length === 0" description="暂无审批人规则" :image-size="120">
        <template #description>
          <p class="empty-text">请点击上方「新建审批规则」按钮创建</p>
        </template>
        <el-button v-if="isAdmin" type="primary" icon="Plus" @click="handleAddRule">新建审批规则</el-button>
      </el-empty>
    </div>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="totalRules"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
      />
    </div>

    <!-- 新增/编辑规则弹窗 -->
    <el-dialog
        v-model="ruleDialogVisible"
        :title="dialogTitle"
        width="800px"
        :close-on-click-modal="false"
    >
      <el-form :model="ruleForm" :rules="ruleRules" ref="ruleFormRef" label-width="120px">
        <!-- 1. 基础信息 -->
        <div class="form-section">
          <h3 class="section-title">1. 基础信息</h3>
          <el-form-item label="规则名称" prop="ruleName">
            <el-input v-model="ruleForm.ruleName" placeholder="如：小额报销审批、普通请假审批" />
          </el-form-item>
          <el-form-item label="规则说明" prop="description">
            <el-input
                v-model="ruleForm.description"
                type="textarea"
                :rows="2"
                placeholder="一句话解释什么时候用这个规则，如：金额小于1000元的报销审批"
            />
          </el-form-item>
        </div>

        <!-- 2. 触发条件 -->
        <div class="form-section">
          <h3 class="section-title">2. 触发条件（什么时候触发这个规则）</h3>
          <div class="conditions-builder">
            <div v-for="(condition, index) in ruleForm.conditions" :key="index" class="condition-row">
              <el-select v-model="condition.field" placeholder="表单字段" style="width: 150px">
                <el-option label="报销金额" value="amount" />
                <el-option label="请假天数" value="days" />
                <el-option label="申请人部门" value="department" />
                <el-option label="申请类型" value="type" />
              </el-select>
              <el-select v-model="condition.operator" placeholder="运算符" style="width: 120px">
                <el-option label="等于" value="=" />
                <el-option label="不等于" value="!=" />
                <el-option label="大于" value=">" />
                <el-option label="小于" value="<" />
                <el-option label="大于等于" value=">=" />
                <el-option label="小于等于" value="<=" />
                <el-option label="包含" value="contains" />
              </el-select>
              <el-input v-model="condition.value" placeholder="值" style="width: 150px" />
              <el-button
                  v-if="index > 0"
                  size="small"
                  type="danger"
                  icon="Delete"
                  circle
                  @click="removeCondition(index)"
              />
            </div>
            <el-button size="small" type="primary" icon="Plus" @click="addCondition" style="margin-top: 8px">
              添加条件
            </el-button>
            <div class="condition-tip">满足以上所有条件时，执行此审批规则</div>
          </div>
        </div>

        <!-- 3. 审批人设置 -->
        <div class="form-section">
          <h3 class="section-title">3. 审批人设置（满足条件后，谁审批）</h3>
          <div class="approval-nodes-builder">
            <div v-for="(node, index) in ruleForm.approvalNodes" :key="index" class="node-row">
              <span class="node-label">审批节点{{ index + 1 }}：</span>
              <el-select v-model="node.type" placeholder="选择类型" style="width: 180px" @change="handleNodeTypeChange(node)">
                <el-option label="直属主管" value="superior" />
                <el-option label="部门经理" value="role" />
                <el-option label="指定人员" value="user" />
                <el-option label="指定角色" value="role" />
                <el-option label="指定部门" value="department" />
                <el-option label="发起人自选" value="self_select" />
                <el-option label="连续多级上级" value="continuous_superior" />
              </el-select>
              <el-select
                  v-if="node.type === 'user'"
                  v-model="node.userId"
                  placeholder="选择人员"
                  multiple
                  style="width: 200px; margin-left: 8px"
              >
                <el-option label="张三" value="zhangsan" />
                <el-option label="李四" value="lisi" />
              </el-select>
              <el-select
                  v-if="node.type === 'role'"
                  v-model="node.roleId"
                  placeholder="选择角色"
                  style="width: 200px; margin-left: 8px"
              >
                <el-option label="部门经理" value="dept_manager" />
                <el-option label="总经理" value="general_manager" />
                <el-option label="总监" value="director" />
              </el-select>
              <el-button
                  v-if="index > 0"
                  size="small"
                  type="danger"
                  icon="Delete"
                  circle
                  @click="removeNode(index)"
                  style="margin-left: 8px"
              />
            </div>
            <el-button size="small" type="primary" icon="Plus" @click="addNode" style="margin-top: 8px">
              添加审批节点
            </el-button>
            <div class="node-tip">按顺序设置审批人，第一个审批完成后流转到下一个</div>
          </div>
        </div>

        <!-- 4. 状态 -->
        <div class="form-section">
          <h3 class="section-title">4. 状态</h3>
          <el-form-item label="规则状态">
            <el-radio-group v-model="ruleForm.status">
              <el-radio label="enabled">启用（流程可以使用）</el-radio>
              <el-radio label="disabled">禁用（流程不可使用）</el-radio>
            </el-radio-group>
          </el-form-item>
        </div>
      </el-form>

      <template #footer>
        <el-button @click="ruleDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitRule" :loading="saving">保存</el-button>
      </template>
    </el-dialog>

    <!-- 规则详情弹窗 -->
    <RuleDetailDialog v-model="detailVisible" :rule="currentDetailRule" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Plus, Edit, CopyDocument, Delete } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import RuleDetailDialog from './components/RuleDetailDialog.vue'

const router = useRouter()
const userStore = useUserStore()
const isAdmin = computed(() => userStore.isAdmin)

// 加载状态
const loading = ref(false)

// 筛选条件
const searchKeyword = ref('')
const filterStatus = ref('')

// 分页
const currentPage = ref(1)
const pageSize = ref(10)

// 全选
const selectAll = ref(false)

// 规则列表数据
const ruleList = ref([
  {
    id: 1,
    ruleName: '小额报销审批',
    description: '金额小于1000元的报销审批',
    conditions: [
      { field: '报销金额', operator: '<', value: '1000' }
    ],
    approvalNodes: [
      { name: '直属主管', type: 'superior' }
    ],
    status: 'enabled',
    createTime: '2024-04-01 10:00:00',
    updateTime: '2024-04-01 10:00:00',
    creator: '系统管理员',
    updater: '系统管理员'
  },
  {
    id: 2,
    ruleName: '中额报销审批',
    description: '金额1000-5000元的报销审批',
    conditions: [
      { field: '报销金额', operator: '>=', value: '1000' },
      { field: '报销金额', operator: '<=', value: '5000' }
    ],
    approvalNodes: [
      { name: '直属主管', type: 'superior' },
      { name: '部门经理', type: 'role' }
    ],
    status: 'enabled',
    createTime: '2024-04-01 10:30:00',
    updateTime: '2024-04-01 10:30:00',
    creator: '系统管理员',
    updater: '系统管理员'
  },
  {
    id: 3,
    ruleName: '大额报销审批',
    description: '金额大于5000元的报销审批',
    conditions: [
      { field: '报销金额', operator: '>', value: '5000' }
    ],
    approvalNodes: [
      { name: '直属主管', type: 'superior' },
      { name: '部门经理', type: 'role' },
      { name: '总监', type: 'role' }
    ],
    status: 'enabled',
    createTime: '2024-04-01 11:00:00',
    updateTime: '2024-04-01 11:00:00',
    creator: '系统管理员',
    updater: '系统管理员'
  },
  {
    id: 4,
    ruleName: '普通请假审批',
    description: '3天以内的请假审批',
    conditions: [
      { field: '请假天数', operator: '<=', value: '3' }
    ],
    approvalNodes: [
      { name: '直属主管', type: 'superior' }
    ],
    status: 'enabled',
    createTime: '2024-04-02 09:00:00',
    updateTime: '2024-04-02 09:00:00',
    creator: '系统管理员',
    updater: '系统管理员'
  }
])

// 对话框
const ruleDialogVisible = ref(false)
const dialogTitle = ref('新建审批规则')
const ruleFormRef = ref(null)
const ruleForm = ref({
  ruleName: '',
  description: '',
  conditions: [],
  approvalNodes: [],
  status: 'enabled'
})

const ruleRules = {
  ruleName: [{ required: true, message: '请输入规则名称', trigger: 'blur' }],
  description: [{ required: true, message: '请输入规则说明', trigger: 'blur' }]
}

// 详情
const detailVisible = ref(false)
const currentDetailRule = ref(null)
const saving = ref(false)

// 选中的规则
const selectedRules = ref([])

// 过滤后的规则列表
const filteredRules = computed(() => {
  let filtered = [...ruleList.value]

  // 关键词筛选
  if (searchKeyword.value) {
    const kw = searchKeyword.value.toLowerCase()
    filtered = filtered.filter(r =>
        r.ruleName.toLowerCase().includes(kw) ||
        (r.description && r.description.toLowerCase().includes(kw))
    )
  }

  // 状态筛选
  if (filterStatus.value) {
    filtered = filtered.filter(r => r.status === filterStatus.value)
  }

  return filtered
})

const totalRules = computed(() => ruleList.value.length)

// 方法
const handleSearch = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    ElMessage.success('查询完成')
  }, 300)
}

const handleReset = () => {
  searchKeyword.value = ''
  filterStatus.value = ''
  ElMessage.success('已重置查询条件')
}

const handleSelectAll = (val) => {
  filteredRules.value.forEach(r => r.selected = val)
}

const handleSelectionChange = (selection) => {
  selectedRules.value = selection
}

const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1
}

const handleCurrentChange = (val) => {
  currentPage.value = val
}

const addCondition = () => {
  ruleForm.value.conditions.push({
    field: '',
    operator: '',
    value: ''
  })
}

const removeCondition = (index) => {
  ruleForm.value.conditions.splice(index, 1)
}

const addNode = () => {
  ruleForm.value.approvalNodes.push({
    name: '',
    type: '',
    userId: [],
    roleId: ''
  })
}

const removeNode = (index) => {
  ruleForm.value.approvalNodes.splice(index, 1)
}

const handleNodeTypeChange = (node) => {
  // 清空相关字段
  node.userId = []
  node.roleId = ''

  // 根据类型设置默认名称
  const nameMap = {
    superior: '直属主管',
    role: '部门经理',
    user: '指定人员',
    department: '指定部门',
    self_select: '发起人自选',
    continuous_superior: '连续多级上级'
  }
  node.name = nameMap[node.type] || ''
}

const handleAddRule = () => {
  dialogTitle.value = '新建审批规则'
  ruleForm.value = {
    ruleName: '',
    description: '',
    conditions: [],
    approvalNodes: [
      { name: '直属主管', type: 'superior' }
    ],
    status: 'enabled'
  }
  ruleDialogVisible.value = true
}

const handleEditRule = (row) => {
  dialogTitle.value = '编辑审批规则'
  ruleForm.value = JSON.parse(JSON.stringify(row))
  ruleDialogVisible.value = true
}

const handleCopyRule = (row) => {
  dialogTitle.value = '复制审批规则'
  const copied = JSON.parse(JSON.stringify(row))
  copied.id = undefined
  copied.ruleName = row.ruleName + '（副本）'
  ruleForm.value = copied
  ruleDialogVisible.value = true
}

const handleDeleteRule = (row) => {
  ElMessageBox.confirm(`确定删除规则「${row.ruleName}」吗？`, '删除确认', {
    confirmButtonText: '确定删除',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ruleList.value = ruleList.value.filter(r => r.id !== row.id)
    ElMessage.success('删除成功')
  }).catch(() => {})
}

const handleSubmitRule = () => {
  ruleFormRef.value?.validate((valid) => {
    if (!valid) return

    if (ruleForm.value.conditions.length === 0) {
      ElMessage.warning('请至少添加一个触发条件')
      return
    }

    if (ruleForm.value.approvalNodes.length === 0) {
      ElMessage.warning('请至少添加一个审批节点')
      return
    }

    saving.value = true
    setTimeout(() => {
      if (ruleForm.value.id) {
        // 编辑
        const index = ruleList.value.findIndex(r => r.id === ruleForm.value.id)
        if (index !== -1) {
          ruleList.value[index] = {
            ...ruleForm.value,
            updateTime: new Date().toLocaleString('zh-CN'),
            updater: userStore.currentUser?.name || '当前用户'
          }
        }
        ElMessage.success('规则修改成功')
      } else {
        // 新增
        ruleList.value.unshift({
          ...ruleForm.value,
          id: Date.now(),
          createTime: new Date().toLocaleString('zh-CN'),
          updateTime: new Date().toLocaleString('zh-CN'),
          creator: userStore.currentUser?.name || '当前用户',
          updater: userStore.currentUser?.name || '当前用户'
        })
        ElMessage.success('规则新增成功')
      }
      saving.value = false
      ruleDialogVisible.value = false
    }, 500)
  })
}

const handleStatusChange = (row) => {
  const action = row.status === 'enabled' ? '启用' : '禁用'
  ElMessageBox.confirm(
      `确定${action}规则「${row.ruleName}」吗？${row.status === 'disabled' ? '禁用后该规则将不再生效' : ''}`,
      '状态确认',
      { confirmButtonText: '确定', cancelButtonText: '取消', type: 'info' }
  ).then(() => {
    ElMessage.success(`已${action}规则`)
  }).catch(() => {
    row.status = row.status === 'enabled' ? 'disabled' : 'enabled'
  })
}

const handleViewDetail = (row) => {
  currentDetailRule.value = row
  detailVisible.value = true
}

const handleBatchEnable = () => {
  selectedRules.value.forEach(r => r.status = 'enabled')
  ElMessage.success(`已批量启用 ${selectedRules.value.length} 条规则`)
  selectedRules.value = []
}

const handleBatchDisable = () => {
  selectedRules.value.forEach(r => r.status = 'disabled')
  ElMessage.success(`已批量禁用 ${selectedRules.value.length} 条规则`)
  selectedRules.value = []
}

const handleBatchDelete = () => {
  ElMessageBox.confirm(`确定删除选中的 ${selectedRules.value.length} 条规则吗？`, '批量删除', {
    confirmButtonText: '确定删除',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ruleList.value = ruleList.value.filter(r => !selectedRules.value.find(s => s.id === r.id))
    ElMessage.success('批量删除成功')
    selectedRules.value = []
  }).catch(() => {})
}
</script>

<style scoped lang="scss">
.approver-rules-engine {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 60px);

  .breadcrumb {
    margin-bottom: 20px;
    font-size: 14px;
  }

  .page-header {
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

  .rules-table-container {
    background: #fff;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

    .rule-name-link {
      color: #409EFF;
      cursor: pointer;
      font-weight: 500;

      &:hover {
        text-decoration: underline;
      }
    }

    .conditions-display {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 4px;

      .more-count {
        font-size: 12px;
        color: #909399;
      }
    }

    .text-muted {
      color: #909399;
      font-size: 13px;
    }

    .approval-chain-display {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 4px;

      .chain-node-tag {
        display: inline-flex;
        align-items: center;
        font-size: 13px;
        color: #606266;

        .chain-arrow {
          margin: 0 4px;
          color: #409EFF;
          font-weight: 600;
        }
      }
    }
  }

  .pagination-container {
    display: flex;
    justify-content: flex-end;
    margin-top: 16px;
    padding: 16px;
    background: #fff;
    border-radius: 8px;
  }

  .empty-text {
    color: #909399;
    margin: 8px 0 16px;
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

    .conditions-builder {
      .condition-row {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;
      }

      .condition-tip {
        margin-top: 8px;
        font-size: 12px;
        color: #909399;
      }
    }

    .approval-nodes-builder {
      .node-row {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;

        .node-label {
          font-size: 14px;
          color: #606266;
          white-space: nowrap;
        }
      }

      .node-tip {
        margin-top: 8px;
        font-size: 12px;
        color: #909399;
      }
    }
  }
}
</style>
