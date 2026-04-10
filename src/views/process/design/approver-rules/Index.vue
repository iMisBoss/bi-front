<template>
  <div class="approver-rules-engine">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>审批人规则管理</h2>
      <p class="subtitle">全局审批人规则统一管理，支持规则复用、权限管控、审计追溯（全局生效）</p>
    </div>

    <!-- 筛选与操作栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <el-input
            v-model="searchKeyword"
            placeholder="搜索规则名称/适用节点"
            clearable
            style="width: 280px"
            @keyup.enter="handleSearch"
        >
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>
        <el-select v-model="filterStrategy" placeholder="分配策略" clearable style="width: 150px">
          <el-option label="指定人员" value="specific_user" />
          <el-option label="指定角色" value="specific_role" />
          <el-option label="指定部门" value="specific_dept" />
          <el-option label="发起人自选" value="initiator_select" />
          <el-option label="发起人上级" value="initiator_superior" />
          <el-option label="连续上级" value="continuous_superior" />
          <el-option label="条件分支" value="condition_branch" />
        </el-select>
        <el-select v-model="filterRuleType" placeholder="规则类型" clearable style="width: 140px">
          <el-option label="全局通用规则" value="global" />
          <el-option label="流程专属规则" value="process" />
        </el-select>
        <el-select v-model="filterStatus" placeholder="状态" clearable style="width: 120px">
          <el-option label="启用" value="enabled" />
          <el-option label="禁用" value="disabled" />
        </el-select>
        <el-button type="primary" icon="Search" @click="handleSearch">查询</el-button>
        <el-button icon="Refresh" @click="handleReset">重置</el-button>
      </div>
      <div class="toolbar-right" v-if="isAdmin">
        <el-button type="primary" icon="Plus" @click="handleAddRule">新增规则</el-button>
        <el-button type="success" icon="Download" @click="handleExportRules">导出规则</el-button>
      </div>
    </div>

    <!-- 批量操作栏 -->
    <div v-if="selectedRules.length > 0 && isAdmin" class="batch-toolbar">
      <span class="batch-info">已选择 {{ selectedRules.length }} 项</span>
      <el-button size="small" type="success" @click="handleBatchEnable">批量启用</el-button>
      <el-button size="small" type="warning" @click="handleBatchDisable">批量禁用</el-button>
      <el-button size="small" type="danger" plain @click="handleBatchDelete">批量删除</el-button>
    </div>

    <!-- 统一表头 + 分组展示 -->
    <div class="rules-table-container">
      <!-- 统一表头 -->
      <div class="unified-header">
        <el-checkbox v-if="isAdmin" v-model="selectAll" @change="handleSelectAll" style="width: 50px" />
        <div class="header-cell" style="flex: 2">规则名称</div>
        <div class="header-cell" style="flex: 1.2">规则类型</div>
        <div class="header-cell" style="flex: 1.5">适用流程/节点</div>
        <div class="header-cell" style="flex: 1">分配策略</div>
        <div class="header-cell" style="flex: 1.5">审批人/角色</div>
        <div class="header-cell" style="width: 80px">优先级</div>
        <div class="header-cell" style="width: 80px">状态</div>
        <div class="header-cell" style="width: 220px">操作</div>
      </div>

      <!-- 分组折叠区 -->
      <el-collapse v-model="activeGroups" class="rule-groups">
        <!-- 全局通用规则分组 -->
        <el-collapse-item v-if="groupedRules.global && groupedRules.global.length > 0" name="global">
          <template #title>
            <div class="group-title" style="border-left-color: #409EFF">
              <el-tag type="primary" size="default">全局通用规则</el-tag>
              <span class="group-count">({{ groupedRules.global.length }} 条)</span>
            </div>
          </template>
          <div class="rule-rows">
            <div v-for="row in groupedRules.global" :key="row.id" class="rule-row">
              <el-checkbox v-if="isAdmin" v-model="row.selected" @change="handleRowSelect" style="width: 50px" />
              <div class="rule-cell" style="flex: 2">
                <span class="rule-name" @click="handleViewDetail(row)">{{ row.ruleName }}</span>
              </div>
              <div class="rule-cell" style="flex: 1.2">
                <el-tag type="primary" size="small">全局通用</el-tag>
              </div>
              <div class="rule-cell" style="flex: 1.5">
                <span class="text-muted">{{ row.processName || '全系统' }}</span>
              </div>
              <div class="rule-cell" style="flex: 1">
                <el-tag size="small">{{ getStrategyText(row.strategy) }}</el-tag>
              </div>
              <div class="rule-cell" style="flex: 1.5">
                <span class="text-ellipsis">{{ row.target }}</span>
              </div>
              <div class="rule-cell" style="width: 80px">
                <el-tag :type="getPriorityTag(row.priority)" size="small">{{ row.priority }}</el-tag>
              </div>
              <div class="rule-cell" style="width: 80px">
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
              </div>
              <div class="rule-cell action-cell" style="width: 220px">
                <el-button size="small" link type="primary" icon="Edit" @click="handleEditRule(row)">编辑</el-button>
                <el-button size="small" link type="success" icon="CopyDocument" @click="handleCopyRule(row)">复制</el-button>
                <el-button size="small" link type="info" icon="Clock" @click="handleViewLogs(row)">日志</el-button>
                <el-button
                    v-if="isAdmin && row.ruleType === 'process'"
                    size="small"
                    link
                    type="danger"
                    icon="Delete"
                    @click="handleDeleteRule(row)"
                >
                  删除
                </el-button>
              </div>
            </div>
          </div>
        </el-collapse-item>

        <!-- 流程专属规则分组 -->
        <el-collapse-item v-if="groupedRules.process && groupedRules.process.length > 0" name="process">
          <template #title>
            <div class="group-title" style="border-left-color: #909399">
              <el-tag type="info" size="default">流程专属规则</el-tag>
              <span class="group-count">({{ groupedRules.process.length }} 条)</span>
            </div>
          </template>
          <div class="rule-rows">
            <div v-for="row in groupedRules.process" :key="row.id" class="rule-row">
              <el-checkbox v-if="isAdmin" v-model="row.selected" @change="handleRowSelect" style="width: 50px" />
              <div class="rule-cell" style="flex: 2">
                <span class="rule-name" @click="handleViewDetail(row)">{{ row.ruleName }}</span>
              </div>
              <div class="rule-cell" style="flex: 1.2">
                <el-tag type="info" size="small">流程专属</el-tag>
              </div>
              <div class="rule-cell" style="flex: 1.5">
                <el-link type="primary" :underline="false" @click="handleJumpToProcess(row)">
                  {{ row.processName }}
                </el-link>
              </div>
              <div class="rule-cell" style="flex: 1">
                <el-tag size="small">{{ getStrategyText(row.strategy) }}</el-tag>
              </div>
              <div class="rule-cell" style="flex: 1.5">
                <span class="text-ellipsis">{{ row.target }}</span>
              </div>
              <div class="rule-cell" style="width: 80px">
                <el-tag :type="getPriorityTag(row.priority)" size="small">{{ row.priority }}</el-tag>
              </div>
              <div class="rule-cell" style="width: 80px">
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
              </div>
              <div class="rule-cell action-cell" style="width: 220px">
                <el-button size="small" link type="primary" icon="Edit" @click="handleEditRule(row)">编辑</el-button>
                <el-button size="small" link type="success" icon="CopyDocument" @click="handleCopyRule(row)">复制</el-button>
                <el-button size="small" link type="info" icon="Clock" @click="handleViewLogs(row)">日志</el-button>
                <el-button
                    v-if="isAdmin"
                    size="small"
                    link
                    type="danger"
                    icon="Delete"
                    @click="handleDeleteRule(row)"
                >
                  删除
                </el-button>
              </div>
            </div>
          </div>
        </el-collapse-item>
      </el-collapse>

      <!-- 空状态 -->
      <el-empty v-if="totalRules === 0" description="暂无审批人规则" :image-size="120">
        <template #description>
          <p class="empty-text">请点击上方「新增规则」按钮创建</p>
        </template>
        <el-button v-if="isAdmin" type="primary" icon="Plus" @click="handleAddRule">新增规则</el-button>
      </el-empty>
    </div>

    <!-- 页脚统计 -->
    <div class="footer-stats">
      <span>共 {{ totalRules }} 条规则</span>
      <span class="divider">|</span>
      <span>全局规则 {{ globalCount }} 条</span>
      <span class="divider">|</span>
      <span>流程专属规则 {{ processCount }} 条</span>
      <span class="divider">|</span>
      <span>最后修改时间：{{ lastModifyTime }}</span>
    </div>

    <!-- 新增/编辑规则弹窗 -->
    <el-dialog
        v-model="ruleDialogVisible"
        :title="dialogTitle"
        width="800px"
        :close-on-click-modal="false"
    >
      <el-form :model="ruleForm" :rules="ruleRules" ref="ruleFormRef" label-width="130px">
        <el-form-item label="规则名称" prop="ruleName">
          <el-input v-model="ruleForm.ruleName" placeholder="请输入规则名称" />
        </el-form-item>

        <el-form-item label="规则类型" prop="ruleType">
          <el-radio-group v-model="ruleForm.ruleType">
            <el-radio label="global">全局通用规则（全系统可用）</el-radio>
            <el-radio label="process">流程专属规则（仅指定流程可用）</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item v-if="ruleForm.ruleType === 'process'" label="适用流程" prop="processName">
          <el-select v-model="ruleForm.processName" placeholder="请选择流程" style="width: 100%">
            <el-option label="请假审批流程" value="leave_approval" />
            <el-option label="会议申请审批流程" value="meeting_approval" />
            <el-option label="费用报销审批流程" value="expense_approval" />
          </el-select>
        </el-form-item>

        <el-form-item label="分配策略" prop="strategy">
          <el-select v-model="ruleForm.strategy" placeholder="请选择分配策略" style="width: 100%" @change="handleFormStrategyChange">
            <el-option label="指定人员" value="specific_user" />
            <el-option label="指定角色" value="specific_role" />
            <el-option label="指定部门" value="specific_dept" />
            <el-option label="发起人自选" value="initiator_select" />
            <el-option label="发起人上级" value="initiator_superior" />
            <el-option label="连续上级" value="continuous_superior" />
            <el-option label="条件分支" value="condition_branch" />
          </el-select>
        </el-form-item>

        <el-form-item v-if="ruleForm.strategy === 'specific_user'" label="选择人员">
          <el-select v-model="ruleForm.targetUser" multiple placeholder="请选择" style="width: 100%">
            <el-option label="张三" value="zhangsan" />
            <el-option label="李四" value="lisi" />
          </el-select>
        </el-form-item>

        <el-form-item v-if="ruleForm.strategy === 'specific_role'" label="选择角色">
          <el-select v-model="ruleForm.targetRole" multiple placeholder="请选择" style="width: 100%">
            <el-option label="部门经理" value="dept_manager" />
            <el-option label="总经理" value="general_manager" />
          </el-select>
        </el-form-item>

        <el-form-item label="优先级" prop="priority">
          <el-input-number v-model="ruleForm.priority" :min="1" :max="100" style="width: 100%" />
        </el-form-item>

        <el-form-item label="规则说明">
          <el-input v-model="ruleForm.description" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="ruleDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitRule" :loading="saving">保存</el-button>
      </template>
    </el-dialog>

    <!-- 规则详情弹窗 -->
    <RuleDetailDialog v-model="detailVisible" :rule="currentDetailRule" />

    <!-- 操作日志弹窗 -->
    <el-dialog v-model="logsVisible" title="规则操作日志" width="900px">
      <el-table :data="operationLogs" border>
        <el-table-column prop="operator" label="操作人" width="120" />
        <el-table-column prop="operateTime" label="操作时间" width="180" />
        <el-table-column prop="operateType" label="操作类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getOperateTypeTag(row.operateType)" size="small">
              {{ getOperateTypeText(row.operateType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="beforeValue" label="修改前值" min-width="120" />
        <el-table-column prop="afterValue" label="修改后值" min-width="120" />
      </el-table>
      <template #footer>
        <el-button @click="logsVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Plus, Download, Edit, CopyDocument, Clock, Delete } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import RuleDetailDialog from './components/RuleDetailDialog.vue'

const router = useRouter()
const userStore = useUserStore()
const isAdmin = computed(() => userStore.isAdmin)

// 筛选条件
const searchKeyword = ref('')
const filterStrategy = ref('')
const filterRuleType = ref('')
const filterStatus = ref('')

// 全选
const selectAll = ref(false)

// 分组折叠
const activeGroups = ref(['global', 'process'])

// 规则列表
const ruleList = ref([
  {
    id: 1,
    ruleName: '请假审批-部门经理',
    ruleType: 'global',
    processName: '全系统',
    strategy: 'initiator_superior',
    target: '发起人直接上级',
    priority: 10,
    status: 'enabled',
    selected: false
  },
  {
    id: 2,
    ruleName: '会议申请-部门经理审批-专属规则',
    ruleType: 'process',
    processName: '会议申请审批流程',
    strategy: 'initiator_select',
    target: '发起人自选',
    priority: 5,
    status: 'enabled',
    selected: false
  }
])

// 对话框
const ruleDialogVisible = ref(false)
const dialogTitle = ref('新增规则')
const ruleFormRef = ref(null)
const ruleForm = ref({
  ruleName: '',
  ruleType: 'global',
  processName: '',
  strategy: '',
  targetUser: [],
  targetRole: [],
  priority: 10,
  description: ''
})

const ruleRules = {
  ruleName: [{ required: true, message: '请输入规则名称', trigger: 'blur' }],
  ruleType: [{ required: true, message: '请选择规则类型', trigger: 'change' }],
  strategy: [{ required: true, message: '请选择分配策略', trigger: 'change' }]
}

// 详情/日志
const detailVisible = ref(false)
const currentDetailRule = ref(null)
const logsVisible = ref(false)
const operationLogs = ref([
  {
    operator: '系统管理员',
    operateTime: '2024-04-07 10:30:00',
    operateType: 'edit',
    beforeValue: 'initiator_superior',
    afterValue: 'initiator_select',
  }
])
const saving = ref(false)

// 分组后的规则
const groupedRules = computed(() => {
  let filtered = [...ruleList.value]

  if (searchKeyword.value) {
    const kw = searchKeyword.value.toLowerCase()
    filtered = filtered.filter(r => r.ruleName.toLowerCase().includes(kw))
  }
  if (filterStrategy.value) {
    filtered = filtered.filter(r => r.strategy === filterStrategy.value)
  }
  if (filterRuleType.value) {
    filtered = filtered.filter(r => r.ruleType === filterRuleType.value)
  }
  if (filterStatus.value) {
    filtered = filtered.filter(r => r.status === filterStatus.value)
  }

  const groups = { global: [], process: [] }
  filtered.forEach(rule => {
    if (groups[rule.ruleType]) {
      groups[rule.ruleType].push(rule)
    }
  })

  return groups
})

const totalRules = computed(() => ruleList.value.length)
const globalCount = computed(() => ruleList.value.filter(r => r.ruleType === 'global').length)
const processCount = computed(() => ruleList.value.filter(r => r.ruleType === 'process').length)
const selectedRules = computed(() => ruleList.value.filter(r => r.selected))
const lastModifyTime = computed(() => '2024-04-07 15:30:00')

// 方法
const handleSearch = () => ElMessage.success('查询完成')
const handleReset = () => {
  searchKeyword.value = ''
  filterStrategy.value = ''
  filterRuleType.value = ''
  filterStatus.value = ''
}

const handleSelectAll = (val) => {
  ruleList.value.forEach(r => r.selected = val)
}

const handleRowSelect = () => {
  selectAll.value = ruleList.value.every(r => r.selected)
}

const handleAddRule = () => {
  dialogTitle.value = '新增规则'
  ruleForm.value = {
    ruleName: '',
    ruleType: 'global',
    processName: '',
    strategy: '',
    targetUser: [],
    targetRole: [],
    priority: 10,
    description: ''
  }
  ruleDialogVisible.value = true
}

const handleEditRule = (row) => {
  dialogTitle.value = '编辑规则'
  ruleForm.value = {
    ...row,
    strategy: row.strategy || '',
    targetUser: row.targetUser || [],
    targetRole: row.targetRole || []
  }
  ruleDialogVisible.value = true
}

const handleCopyRule = (row) => {
  dialogTitle.value = '复制规则'
  ruleForm.value = {
    ...row,
    id: undefined,
    ruleName: row.ruleName + '（副本）',
    strategy: row.strategy || '',
    targetUser: row.targetUser || [],
    targetRole: row.targetRole || []
  }
  ruleDialogVisible.value = true
}

const handleDeleteRule = (row) => {
  ElMessageBox.confirm(`确定删除规则「${row.ruleName}」吗？`, '删除确认', { type: 'warning' }).then(() => {
    ruleList.value = ruleList.value.filter(r => r.id !== row.id)
    ElMessage.success('删除成功')
  }).catch(() => {})
}

const handleSubmitRule = () => {
  ruleFormRef.value?.validate((valid) => {
    if (!valid) return
    saving.value = true
    setTimeout(() => {
      let target = ''
      if (ruleForm.value.strategy === 'specific_user') target = ruleForm.value.targetUser.join('、')
      else if (ruleForm.value.strategy === 'specific_role') target = ruleForm.value.targetRole.join('、')
      else target = getStrategyText(ruleForm.value.strategy)

      if (ruleForm.value.id) {
        const index = ruleList.value.findIndex(r => r.id === ruleForm.value.id)
        if (index !== -1) {
          ruleList.value[index] = { ...ruleForm.value, target }
        }
        ElMessage.success('规则修改成功')
      } else {
        ruleList.value.unshift({
          ...ruleForm.value,
          id: Date.now(),
          target,
          selected: false
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

const handleViewLogs = (row) => {
  logsVisible.value = true
}

const handleJumpToProcess = (row) => {
  ElMessage.info(`跳转到流程设计器：${row.processName}`)
}

const handleBatchEnable = () => {
  selectedRules.value.forEach(r => r.status = 'enabled')
  ElMessage.success(`已批量启用 ${selectedRules.value.length} 条规则`)
  ruleList.value.forEach(r => r.selected = false)
}

const handleBatchDisable = () => {
  selectedRules.value.forEach(r => r.status = 'disabled')
  ElMessage.success(`已批量禁用 ${selectedRules.value.length} 条规则`)
  ruleList.value.forEach(r => r.selected = false)
}

const handleBatchDelete = () => {
  ElMessageBox.confirm(`确定删除选中的 ${selectedRules.value.length} 条规则吗？`, '批量删除', { type: 'warning' }).then(() => {
    ruleList.value = ruleList.value.filter(r => !r.selected)
    ElMessage.success('批量删除成功')
  }).catch(() => {})
}

const handleExportRules = () => {
  ElMessage.success('规则导出成功')
}

const handleFormStrategyChange = () => {
  ruleForm.value.targetUser = []
  ruleForm.value.targetRole = []
}

const getStrategyText = (strategy) => {
  const texts = {
    specific_user: '指定人员',
    specific_role: '指定角色',
    specific_dept: '指定部门',
    initiator_select: '发起人自选',
    initiator_superior: '发起人上级',
    continuous_superior: '连续上级',
    condition_branch: '条件分支'
  }
  return texts[strategy] || strategy
}

const getPriorityTag = (priority) => {
  if (priority >= 20) return 'danger'
  if (priority >= 10) return 'warning'
  return 'info'
}

const getOperateTypeTag = (type) => {
  const tags = { add: 'success', edit: 'primary', delete: 'danger', enable: 'success', disable: 'info' }
  return tags[type] || 'info'
}

const getOperateTypeText = (type) => {
  const texts = { add: '新增', edit: '编辑', delete: '删除', enable: '启用', disable: '禁用' }
  return texts[type] || type
}
</script>

<style scoped lang="scss">
.approver-rules-engine {
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
    border: 1px solid #ebeef5;
    border-radius: 4px;
    overflow: hidden;
  }

  .unified-header {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    background: #f5f7fa;
    border-bottom: 1px solid #ebeef5;
    font-weight: 600;
    font-size: 14px;
    color: #303133;

    .header-cell {
      padding: 0 8px;
    }
  }

  .rule-groups {
    :deep(.el-collapse-item__header) {
      padding: 12px 16px;
      background: #fafafa;
      border-bottom: 1px solid #ebeef5;
    }

    .group-title {
      display: flex;
      align-items: center;
      gap: 8px;
      padding-left: 12px;
      border-left: 3px solid;

      .group-count {
        color: #909399;
        font-size: 13px;
      }
    }

    .rule-rows {
      padding: 0;
    }

    .rule-row {
      display: flex;
      align-items: center;
      padding: 12px 16px;
      border-bottom: 1px solid #ebeef5;
      transition: background-color 0.2s;

      &:hover {
        background-color: #f5f7fa;
      }

      &:last-child {
        border-bottom: none;
      }
    }

    .rule-cell {
      padding: 0 8px;
      font-size: 14px;
      color: #606266;

      .rule-name {
        color: #409eff;
        cursor: pointer;
        font-weight: 500;

        &:hover {
          text-decoration: underline;
        }
      }

      .text-muted {
        color: #909399;
      }

      .text-ellipsis {
        display: block;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      &.action-cell {
        display: flex;
        gap: 8px;
        justify-content: flex-start;

        .el-button {
          margin: 0;
        }
      }
    }
  }

  .footer-stats {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 0;
    font-size: 14px;
    color: #606266;

    .divider {
      color: #dcdfe6;
    }
  }

  .empty-text {
    color: #909399;
    margin: 8px 0 16px;
  }
}
</style>
