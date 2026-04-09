<template>
  <div class="approver-rules-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>审批人规则管理</h2>
      <p class="subtitle">配置流程节点的审批人分配规则，支持多种分配策略</p>
    </div>

    <!-- 工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <el-input
            v-model="searchKeyword"
            placeholder="搜索规则名称、节点名称"
            clearable
            style="width: 300px"
            @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-select v-model="filterStrategy" placeholder="分配策略" clearable style="width: 150px">
          <el-option label="指定人员" value="specific_user" />
          <el-option label="指定角色" value="specific_role" />
          <el-option label="指定部门" value="specific_dept" />
          <el-option label="发起人自选" value="initiator_select" />
          <el-option label="发起人上级" value="initiator_superior" />
          <el-option label="连续上级" value="continuous_superior" />
        </el-select>
        <el-button type="primary" icon="Search" @click="handleSearch">查询</el-button>
        <el-button icon="Refresh" @click="handleReset">重置</el-button>
      </div>
      <div class="toolbar-right">
        <el-button type="primary" icon="Plus" @click="handleAdd">新增规则</el-button>
        <el-button type="success" icon="Download" @click="handleExport">导出规则</el-button>
      </div>
    </div>

    <!-- 数据表格 -->
    <el-table
        :data="filteredRuleList"
        border
        style="width: 100%"
        v-loading="loading"
        @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column prop="ruleName" label="规则名称" min-width="180" />
      <el-table-column prop="nodeName" label="适用节点" min-width="150" />
      <el-table-column prop="strategy" label="分配策略" width="120">
        <template #default="{ row }">
          <el-tag size="small" :type="getStrategyTag(row.strategy)">
            {{ getStrategyText(row.strategy) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="target" label="审批人/角色/部门" min-width="200" show-overflow-tooltip />
      <el-table-column label="优先级" width="80" align="center">
        <template #default="{ row }">
          <el-tag size="small" :type="getPriorityTag(row.priority)">
            {{ row.priority }}
          </el-tag>
        </template>
      </el-table-column>
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
      <el-table-column label="操作" width="320" align="center" fixed="right">
        <template #default="{ row }">
          <div class="action-buttons">
            <el-button size="small" type="primary" icon="Edit" @click="handleEdit(row)">编辑</el-button>
            <el-button size="small" type="success" icon="CopyDocument" @click="handleCopy(row)">复制</el-button>
            <el-button size="small" type="info" icon="View" @click="handleView(row)">详情</el-button>
            <el-button size="small" type="danger" icon="Delete" @click="handleDelete(row)">删除</el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-bar">
      <span>共 {{ filteredRuleList.length }} 条记录</span>
      <el-pagination
          layout="total, sizes, prev, pager, next, jumper"
          :total="filteredRuleList.length"
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
        width="900px"
        :close-on-click-modal="false"
    >
      <el-form :model="ruleForm" :rules="formRules" ref="formRef" label-width="120px">
        <el-form-item label="规则名称" prop="ruleName">
          <el-input v-model="ruleForm.ruleName" placeholder="请输入规则名称" />
        </el-form-item>

        <el-form-item label="适用流程" prop="processName">
          <el-select v-model="ruleForm.processName" placeholder="请选择流程" style="width: 100%">
            <el-option label="请假审批流程" value="leave_approval" />
            <el-option label="加班审批流程" value="overtime_approval" />
            <el-option label="会议申请审批流程" value="meeting_approval" />
            <el-option label="车辆申请审批流程" value="vehicle_approval" />
            <el-option label="费用报销审批流程" value="expense_approval" />
          </el-select>
        </el-form-item>

        <el-form-item label="适用节点" prop="nodeName">
          <el-select v-model="ruleForm.nodeName" placeholder="请选择节点" style="width: 100%">
            <el-option label="部门经理审批" value="dept_manager_approval" />
            <el-option label="总经理审批" value="general_manager_approval" />
            <el-option label="HR审批" value="hr_approval" />
            <el-option label="财务审批" value="finance_approval" />
            <el-option label="任意节点" value="any" />
          </el-select>
        </el-form-item>

        <el-form-item label="分配策略" prop="strategy">
          <el-select v-model="ruleForm.strategy" placeholder="请选择分配策略" style="width: 100%" @change="handleStrategyChange">
            <el-option label="指定人员" value="specific_user" />
            <el-option label="指定角色" value="specific_role" />
            <el-option label="指定部门" value="specific_dept" />
            <el-option label="发起人自选" value="initiator_select" />
            <el-option label="发起人上级" value="initiator_superior" />
            <el-option label="连续上级" value="continuous_superior" />
            <el-option label="条件分支" value="condition_branch" />
          </el-select>
        </el-form-item>

        <!-- 指定人员 -->
        <el-form-item
            v-if="ruleForm.strategy === 'specific_user'"
            label="选择人员"
            prop="targetUser"
        >
          <el-select
              v-model="ruleForm.targetUser"
              multiple
              placeholder="请选择审批人员"
              style="width: 100%"
              filterable
          >
            <el-option label="张三" value="zhangsan" />
            <el-option label="李四" value="lisi" />
            <el-option label="王五" value="wangwu" />
            <el-option label="赵六" value="zhaoliu" />
          </el-select>
        </el-form-item>

        <!-- 指定角色 -->
        <el-form-item
            v-if="ruleForm.strategy === 'specific_role'"
            label="选择角色"
            prop="targetRole"
        >
          <el-select
              v-model="ruleForm.targetRole"
              multiple
              placeholder="请选择审批角色"
              style="width: 100%"
          >
            <el-option label="部门经理" value="dept_manager" />
            <el-option label="总经理" value="general_manager" />
            <el-option label="HR经理" value="hr_manager" />
            <el-option label="财务经理" value="finance_manager" />
          </el-select>
        </el-form-item>

        <!-- 指定部门 -->
        <el-form-item
            v-if="ruleForm.strategy === 'specific_dept'"
            label="选择部门"
            prop="targetDept"
        >
          <el-select
              v-model="ruleForm.targetDept"
              multiple
              placeholder="请选择审批部门"
              style="width: 100%"
          >
            <el-option label="技术部" value="tech_dept" />
            <el-option label="财务部" value="finance_dept" />
            <el-option label="人事部" value="hr_dept" />
            <el-option label="市场部" value="market_dept" />
          </el-select>
        </el-form-item>

        <!-- 条件分支 -->
        <el-form-item
            v-if="ruleForm.strategy === 'condition_branch'"
            label="条件设置"
            prop="conditions"
        >
          <div class="condition-group">
            <el-button type="primary" size="small" icon="Plus" @click="addCondition">添加条件</el-button>
            <div v-for="(condition, index) in ruleForm.conditions" :key="index" class="condition-item">
              <el-select v-model="condition.field" placeholder="选择字段" style="width: 200px">
                <el-option label="请假天数" value="leave_days" />
                <el-option label="报销金额" value="expense_amount" />
                <el-option label="申请人职级" value="applicant_level" />
              </el-select>
              <el-select v-model="condition.operator" placeholder="操作符" style="width: 120px">
                <el-option label="大于" value=">" />
                <el-option label="小于" value="<" />
                <el-option label="等于" value="=" />
                <el-option label="大于等于" value=">=" />
                <el-option label="小于等于" value="<=" />
              </el-select>
              <el-input v-model="condition.value" placeholder="值" style="width: 150px" />
              <el-select v-model="condition.targetUser" placeholder="审批人" style="width: 200px">
                <el-option label="部门经理" value="dept_manager" />
                <el-option label="总经理" value="general_manager" />
              </el-select>
              <el-button type="danger" size="small" icon="Delete" @click="removeCondition(index)" />
            </div>
          </div>
        </el-form-item>

        <el-form-item label="优先级" prop="priority">
          <el-input-number v-model="ruleForm.priority" :min="1" :max="100" style="width: 100%" />
          <div class="tip">优先级越高越先匹配，数字越大优先级越高</div>
        </el-form-item>

        <el-form-item label="规则说明" prop="description">
          <el-input
              v-model="ruleForm.description"
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

    <!-- 详情对话框 -->
    <el-dialog
        v-model="detailVisible"
        title="规则详情"
        width="700px"
        :close-on-click-modal="false"
    >
      <el-descriptions :column="1" border v-if="currentRule">
        <el-descriptions-item label="规则名称">{{ currentRule.ruleName }}</el-descriptions-item>
        <el-descriptions-item label="适用流程">{{ currentRule.processName }}</el-descriptions-item>
        <el-descriptions-item label="适用节点">{{ currentRule.nodeName }}</el-descriptions-item>
        <el-descriptions-item label="分配策略">
          <el-tag :type="getStrategyTag(currentRule.strategy)">
            {{ getStrategyText(currentRule.strategy) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="审批目标">{{ currentRule.target }}</el-descriptions-item>
        <el-descriptions-item label="优先级">
          <el-tag :type="getPriorityTag(currentRule.priority)">
            {{ currentRule.priority }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="currentRule.status === 'enabled' ? 'success' : 'info'">
            {{ currentRule.status === 'enabled' ? '已启用' : '已停用' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建人">{{ currentRule.creator }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ currentRule.createTime }}</el-descriptions-item>
        <el-descriptions-item label="规则说明">{{ currentRule.description || '-' }}</el-descriptions-item>
      </el-descriptions>

      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Plus, Download, Edit, CopyDocument, View, Delete } from '@element-plus/icons-vue'

const searchKeyword = ref('')
const filterStrategy = ref('')
const loading = ref(false)
const saving = ref(false)

// 规则列表
const ruleList = ref([
  {
    id: 1,
    ruleName: '请假审批-部门经理',
    processName: '请假审批流程',
    nodeName: '部门经理审批',
    strategy: 'initiator_superior',
    target: '发起人直接上级',
    priority: 10,
    status: 'enabled',
    description: '请假申请由发起人的直接上级审批',
    creator: '系统管理员',
    createTime: '2024-01-10 09:00:00'
  },
  {
    id: 2,
    ruleName: '请假审批-总经理（超过5天）',
    processName: '请假审批流程',
    nodeName: '总经理审批',
    strategy: 'condition_branch',
    target: '请假天数>5天：总经理审批',
    priority: 20,
    status: 'enabled',
    description: '请假超过5天需要总经理审批',
    creator: '系统管理员',
    createTime: '2024-01-10 09:30:00'
  },
  {
    id: 3,
    ruleName: '费用报销-财务经理',
    processName: '费用报销审批流程',
    nodeName: '财务审批',
    strategy: 'specific_role',
    target: '财务经理',
    priority: 10,
    status: 'enabled',
    description: '费用报销由财务经理统一审批',
    creator: '财务管理员',
    createTime: '2024-02-01 10:00:00'
  },
  {
    id: 4,
    ruleName: '费用报销-总经理（超过1万）',
    processName: '费用报销审批流程',
    nodeName: '总经理审批',
    strategy: 'condition_branch',
    target: '报销金额>10000：总经理审批',
    priority: 20,
    status: 'enabled',
    description: '报销金额超过1万元需要总经理审批',
    creator: '财务管理员',
    createTime: '2024-02-01 10:30:00'
  },
  {
    id: 5,
    ruleName: '车辆申请-车队队长',
    processName: '车辆申请审批流程',
    nodeName: '车辆管理员审批',
    strategy: 'specific_user',
    target: '张三（车队队长）',
    priority: 10,
    status: 'disabled',
    description: '车辆申请由车队队长审批',
    creator: '系统管理员',
    createTime: '2024-03-01 14:00:00'
  },
  {
    id: 6,
    ruleName: '会议申请-发起人自选',
    processName: '会议申请审批流程',
    nodeName: '部门经理审批',
    strategy: 'initiator_select',
    target: '发起人自选审批人',
    priority: 5,
    status: 'enabled',
    description: '会议申请由发起人自选审批人',
    creator: '流程管理员',
    createTime: '2024-03-15 09:00:00'
  }
])

const pageSize = ref(10)
const currentPage = ref(1)

// 筛选后的列表
const filteredRuleList = computed(() => {
  let result = [...ruleList.value]

  // 关键词搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(rule =>
        rule.ruleName.toLowerCase().includes(keyword) ||
        rule.nodeName.toLowerCase().includes(keyword)
    )
  }

  // 策略筛选
  if (filterStrategy.value) {
    result = result.filter(rule => rule.strategy === filterStrategy.value)
  }

  return result
})

// 对话框状态
const dialogVisible = ref(false)
const dialogTitle = ref('新增规则')
const formRef = ref(null)
const ruleForm = ref({
  ruleName: '',
  processName: '',
  nodeName: '',
  strategy: '',
  targetUser: [],
  targetRole: [],
  targetDept: [],
  conditions: [],
  priority: 10,
  description: ''
})

// 表单验证规则
const formRules = {
  ruleName: [
    { required: true, message: '请输入规则名称', trigger: 'blur' },
    { max: 50, message: '规则名称不能超过50个字符', trigger: 'blur' }
  ],
  processName: [
    { required: true, message: '请选择适用流程', trigger: 'change' }
  ],
  nodeName: [
    { required: true, message: '请选择适用节点', trigger: 'change' }
  ],
  strategy: [
    { required: true, message: '请选择分配策略', trigger: 'change' }
  ],
  targetUser: [
    {
      required: true,
      message: '请选择审批人员',
      trigger: 'change',
      validator: (rule, value, callback) => {
        if (ruleForm.value.strategy === 'specific_user' && (!value || value.length === 0)) {
          callback(new Error('请至少选择一个审批人员'))
        } else {
          callback()
        }
      }
    }
  ],
  targetRole: [
    {
      required: true,
      message: '请选择审批角色',
      trigger: 'change',
      validator: (rule, value, callback) => {
        if (ruleForm.value.strategy === 'specific_role' && (!value || value.length === 0)) {
          callback(new Error('请至少选择一个审批角色'))
        } else {
          callback()
        }
      }
    }
  ],
  targetDept: [
    {
      required: true,
      message: '请选择审批部门',
      trigger: 'change',
      validator: (rule, value, callback) => {
        if (ruleForm.value.strategy === 'specific_dept' && (!value || value.length === 0)) {
          callback(new Error('请至少选择一个审批部门'))
        } else {
          callback()
        }
      }
    }
  ],
  priority: [
    { required: true, message: '请输入优先级', trigger: 'blur' }
  ]
}

// 详情对话框
const detailVisible = ref(false)
const currentRule = ref(null)

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
  filterStrategy.value = ''
  currentPage.value = 1
  ElMessage.success('已重置查询条件')
}

// 新增
const handleAdd = () => {
  dialogTitle.value = '新增规则'
  ruleForm.value = {
    ruleName: '',
    processName: '',
    nodeName: '',
    strategy: '',
    targetUser: [],
    targetRole: [],
    targetDept: [],
    conditions: [],
    priority: 10,
    description: ''
  }
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row) => {
  dialogTitle.value = '编辑规则'
  ruleForm.value = { ...row }
  dialogVisible.value = true
}

// 复制
const handleCopy = (row) => {
  dialogTitle.value = '复制规则'
  ruleForm.value = {
    ...row,
    id: undefined,
    ruleName: row.ruleName + '（复制）'
  }
  dialogVisible.value = true
}

// 策略变更
const handleStrategyChange = () => {
  ruleForm.value.targetUser = []
  ruleForm.value.targetRole = []
  ruleForm.value.targetDept = []
  ruleForm.value.conditions = []
}

// 添加条件
const addCondition = () => {
  ruleForm.value.conditions.push({
    field: '',
    operator: '',
    value: '',
    targetUser: ''
  })
}

// 删除条件
const removeCondition = (index) => {
  ruleForm.value.conditions.splice(index, 1)
}

// 提交表单
const handleSubmit = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      saving.value = true

      setTimeout(() => {
        // 构建 target 字段
        let target = ''
        if (ruleForm.value.strategy === 'specific_user') {
          target = ruleForm.value.targetUser.join('、')
        } else if (ruleForm.value.strategy === 'specific_role') {
          target = ruleForm.value.targetRole.join('、')
        } else if (ruleForm.value.strategy === 'specific_dept') {
          target = ruleForm.value.targetDept.join('、')
        } else if (ruleForm.value.strategy === 'condition_branch') {
          target = ruleForm.value.conditions.map(c =>
              `${c.field}${c.operator}${c.value}：${c.targetUser}`
          ).join('；')
        } else {
          target = getStrategyText(ruleForm.value.strategy)
        }

        if (ruleForm.value.id) {
          // 编辑
          const index = ruleList.value.findIndex(r => r.id === ruleForm.value.id)
          if (index !== -1) {
            ruleList.value[index] = {
              ...ruleForm.value,
              target
            }
          }
          ElMessage.success('规则修改成功')
        } else {
          // 新增
          const newRule = {
            ...ruleForm.value,
            id: Date.now(),
            target,
            creator: '当前用户',
            createTime: new Date().toLocaleString('zh-CN')
          }
          ruleList.value.unshift(newRule)
          ElMessage.success('规则新增成功')
        }

        saving.value = false
        dialogVisible.value = false
      }, 500)
    }
  })
}

// 状态变更
const handleStatusChange = (row) => {
  const action = row.status === 'enabled' ? '启用' : '停用'
  ElMessage.success(`已${action}规则"${row.ruleName}"`)
}

// 查看详情
const handleView = (row) => {
  currentRule.value = { ...row }
  detailVisible.value = true
}

// 删除
const handleDelete = (row) => {
  ElMessageBox.confirm(
      `确定要删除规则"${row.ruleName}"吗？此操作不可恢复！`,
      '删除确认',
      {
        confirmButtonText: '确认删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
  ).then(() => {
    ruleList.value = ruleList.value.filter(r => r.id !== row.id)
    ElMessage.success('删除成功')
  }).catch(() => {})
}

// 导出
const handleExport = () => {
  ElMessage.success('导出功能开发中...')
}

// 选择变化
const handleSelectionChange = (selection) => {
  console.log('选中的规则:', selection)
}

// 分页相关
const handleSizeChange = (size) => {
  pageSize.value = size
}

const handleCurrentChange = (page) => {
  currentPage.value = page
}

// 工具方法
const getStrategyTag = (strategy) => {
  const tags = {
    'specific_user': 'success',
    'specific_role': 'primary',
    'specific_dept': 'warning',
    'initiator_select': 'info',
    'initiator_superior': '',
    'continuous_superior': '',
    'condition_branch': 'danger'
  }
  return tags[strategy] || 'info'
}

const getStrategyText = (strategy) => {
  const texts = {
    'specific_user': '指定人员',
    'specific_role': '指定角色',
    'specific_dept': '指定部门',
    'initiator_select': '发起人自选',
    'initiator_superior': '发起人上级',
    'continuous_superior': '连续上级',
    'condition_branch': '条件分支'
  }
  return texts[strategy] || strategy
}

const getPriorityTag = (priority) => {
  if (priority >= 20) return 'danger'
  if (priority >= 10) return 'warning'
  return 'info'
}
</script>

<style scoped lang="scss">
.approver-rules-management {
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

  // 操作按钮组不换行
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

  .condition-group {
    width: 100%;

    .condition-item {
      display: flex;
      gap: 12px;
      align-items: center;
      margin-top: 12px;
      padding: 12px;
      background: #f5f7fa;
      border-radius: 4px;
    }
  }
}
</style>
