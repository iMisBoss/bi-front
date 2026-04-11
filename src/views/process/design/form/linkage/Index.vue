<template>
  <div class="form-linkage">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h2>表单联动规则</h2>
        <p class="subtitle">可视化配置表单字段联动逻辑，实现自动赋值、显隐、计算、筛选</p>
      </div>
      <div class="header-actions">
        <el-button size="small" @click="handleBatchExport">
          <el-icon><Download /></el-icon>
          导出规则
        </el-button>
        <el-button size="small" @click="handleBatchImport">
          <el-icon><Upload /></el-icon>
          导入规则
        </el-button>
      </div>
    </div>

    <!-- 搜索筛选区 -->
    <div class="search-bar">
      <el-form :model="searchForm" inline>
        <el-form-item label="表单名称">
          <el-input
              v-model="searchForm.formName"
              placeholder="请输入表单名称"
              clearable
              style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="表单分类">
          <el-select v-model="searchForm.category" placeholder="请选择" clearable style="width: 150px">
            <el-option label="人事类" value="hr" />
            <el-option label="财务类" value="finance" />
            <el-option label="行政类" value="admin" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="规则状态">
          <el-select v-model="searchForm.ruleStatus" placeholder="请选择" clearable style="width: 150px">
            <el-option label="启用" value="enabled" />
            <el-option label="禁用" value="disabled" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            查询
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 主体内容区：左侧表单列表 + 右侧规则配置 -->
    <div class="main-content">
      <!-- 左侧表单列表 -->
      <div class="left-panel">
        <div class="panel-header">
          <span>表单列表</span>
          <span class="count-badge">{{ filteredFormList.length }}</span>
        </div>
        <div class="form-list">
          <div
              v-for="form in filteredFormList"
              :key="form.id"
              class="form-item"
              :class="{ 'active': selectedForm?.id === form.id }"
              @click="handleSelectForm(form)"
          >
            <div class="form-item-header">
              <span class="form-name">{{ form.formName }}</span>
              <el-tag size="small" :type="form.ruleStatus === 'enabled' ? 'success' : 'info'">
                {{ form.ruleStatus === 'enabled' ? '启用' : '禁用' }}
              </el-tag>
            </div>
            <div class="form-item-meta">
              <el-tag size="small" :type="getCategoryType(form.category)">
                {{ getCategoryLabel(form.category) }}
              </el-tag>
              <span class="rule-count">{{ form.ruleCount }} 条规则</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧规则配置区 -->
      <div class="right-panel">
        <template v-if="selectedForm">
          <!-- Tab栏 -->
          <el-tabs v-model="activeTab" class="linkage-tabs" @tab-change="handleTabChange">
            <!-- Tab1: 规则列表 -->
            <el-tab-pane label="规则列表" name="list">
              <div class="tab-content">
                <div class="tab-toolbar">
                  <div class="toolbar-left">
                    <el-button type="primary" size="small" @click="handleAddRule">
                      <el-icon><Plus /></el-icon>
                      新建规则
                    </el-button>
                    <el-button
                        v-if="selectedRules.length > 0"
                        type="success"
                        size="small"
                        plain
                        @click="handleBatchEnable"
                    >
                      批量启用
                    </el-button>
                    <el-button
                        v-if="selectedRules.length > 0"
                        type="warning"
                        size="small"
                        plain
                        @click="handleBatchDisable"
                    >
                      批量禁用
                    </el-button>
                  </div>
                  <div class="toolbar-right">
                    <span class="total-count">共 {{ currentRules.length }} 条规则</span>
                  </div>
                </div>

                <!-- 规则列表 -->
                <el-table
                    :data="currentRules"
                    border
                    stripe
                    style="width: 100%"
                    @selection-change="handleRuleSelectionChange"
                >
                  <el-table-column type="selection" width="50" align="center" />
                  <el-table-column type="index" label="序号" width="60" align="center" />
                  <el-table-column prop="ruleName" label="规则名称" min-width="180" show-overflow-tooltip />
                  <el-table-column prop="triggerField" label="触发字段" width="120" align="center">
                    <template #default="{ row }">
                      <el-tag size="small" type="info">{{ row.triggerField }}</el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column prop="ruleType" label="规则类型" width="120" align="center">
                    <template #default="{ row }">
                      <el-tag size="small" :type="getRuleTypeTag(row.ruleType)">
                        {{ getRuleTypeLabel(row.ruleType) }}
                      </el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column prop="targetField" label="执行字段" width="120" align="center">
                    <template #default="{ row }">
                      <el-tag size="small">{{ row.targetField }}</el-tag>
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
                  <el-table-column label="操作" width="200" align="center" fixed="right">
                    <template #default="{ row }">
                      <div class="action-buttons">
                        <el-button size="small" type="success" @click="handleTestRule(row)">
                          <el-icon><View /></el-icon>
                          测试
                        </el-button>
                        <el-button size="small" type="primary" @click="handleEditRule(row)">
                          <el-icon><Edit /></el-icon>
                          编辑
                        </el-button>
                        <el-button size="small" @click="handleCopyRule(row)">
                          <el-icon><CopyDocument /></el-icon>
                          复制
                        </el-button>
                        <el-button size="small" type="danger" @click="handleDeleteRule(row)">
                          <el-icon><Delete /></el-icon>
                          删除
                        </el-button>
                      </div>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </el-tab-pane>

            <!-- Tab2: 新建/编辑规则 -->
            <el-tab-pane label="配置规则" name="config">
              <div class="tab-content config-content">
                <el-form :model="ruleForm" :rules="ruleRules" ref="ruleFormRef" label-width="120px">
                  <!-- 步骤1：基础信息 -->
                  <el-divider content-position="left">
                    <el-icon><InfoFilled /></el-icon>
                    基础信息
                  </el-divider>
                  <el-row :gutter="20">
                    <el-col :span="12">
                      <el-form-item label="规则名称" prop="ruleName">
                        <el-input v-model="ruleForm.ruleName" placeholder="如：请假类型天数显隐" />
                      </el-form-item>
                    </el-col>
                    <el-col :span="12">
                      <el-form-item label="规则状态">
                        <el-radio-group v-model="ruleForm.status">
                          <el-radio label="enabled">启用</el-radio>
                          <el-radio label="disabled">禁用</el-radio>
                        </el-radio-group>
                      </el-form-item>
                    </el-col>
                  </el-row>
                  <el-form-item label="规则备注">
                    <el-input type="textarea" :rows="2" v-model="ruleForm.description" placeholder="选填，说明规则用途" />
                  </el-form-item>

                  <!-- 步骤2：触发条件 -->
                  <el-divider content-position="left">
                    <el-icon><Connection /></el-icon>
                    触发条件（当...时）
                  </el-divider>
                  <el-row :gutter="20">
                    <el-col :span="8">
                      <el-form-item label="触发字段" prop="triggerField">
                        <el-select v-model="ruleForm.triggerField" placeholder="选择字段" style="width: 100%">
                          <el-option label="请假类型" value="leave_type" />
                          <el-option label="报销金额" value="expense_amount" />
                          <el-option label="申请部门" value="dept" />
                          <el-option label="申请人" value="applicant" />
                        </el-select>
                      </el-form-item>
                    </el-col>
                    <el-col :span="8">
                      <el-form-item label="触发条件" prop="triggerCondition">
                        <el-select v-model="ruleForm.triggerCondition" placeholder="选择条件" style="width: 100%">
                          <el-option label="等于" value="eq" />
                          <el-option label="不等于" value="neq" />
                          <el-option label="大于" value="gt" />
                          <el-option label="小于" value="lt" />
                          <el-option label="包含" value="contains" />
                          <el-option label="为空" value="empty" />
                          <el-option label="不为空" value="not_empty" />
                        </el-select>
                      </el-form-item>
                    </el-col>
                    <el-col :span="8">
                      <el-form-item label="触发值" prop="triggerValue">
                        <el-input v-model="ruleForm.triggerValue" placeholder="如：事假" />
                      </el-form-item>
                    </el-col>
                  </el-row>

                  <!-- 步骤3：执行动作 -->
                  <el-divider content-position="left">
                    <el-icon><Operation /></el-icon>
                    执行动作（则...）
                  </el-divider>
                  <el-row :gutter="20">
                    <el-col :span="8">
                      <el-form-item label="规则类型" prop="ruleType">
                        <el-select v-model="ruleForm.ruleType" placeholder="选择类型" style="width: 100%">
                          <el-option label="显示/隐藏字段" value="toggle" />
                          <el-option label="自动赋值" value="assign" />
                          <el-option label="下拉选项筛选" value="filter" />
                          <el-option label="设置必填/只读" value="required" />
                          <el-option label="自动计算" value="calculate" />
                          <el-option label="清空字段值" value="clear" />
                        </el-select>
                      </el-form-item>
                    </el-col>
                    <el-col :span="8">
                      <el-form-item label="执行字段" prop="targetField">
                        <el-select v-model="ruleForm.targetField" placeholder="选择字段" style="width: 100%">
                          <el-option label="请假天数" value="leave_days" />
                          <el-option label="请假事由" value="leave_reason" />
                          <el-option label="报销金额" value="expense_amount" />
                          <el-option label="部门负责人" value="dept_manager" />
                        </el-select>
                      </el-form-item>
                    </el-col>
                    <el-col :span="8">
                      <el-form-item label="动作值" prop="actionValue">
                        <el-input v-model="ruleForm.actionValue" placeholder="如：显示/隐藏/true" />
                      </el-form-item>
                    </el-col>
                  </el-row>

                  <!-- 计算规则特殊配置 -->
                  <el-form-item v-if="ruleForm.ruleType === 'calculate'" label="计算公式">
                    <el-input v-model="ruleForm.formula" placeholder="如：leave_days * daily_salary" />
                    <div class="tip">支持四则运算：+、-、*、/，可使用括号</div>
                  </el-form-item>

                  <!-- 筛选规则特殊配置 -->
                  <el-form-item v-if="ruleForm.ruleType === 'filter'" label="数据源">
                    <el-select v-model="ruleForm.dataSource" placeholder="选择数据源" style="width: 100%">
                      <el-option label="数据字典" value="dict" />
                      <el-option label="接口数据" value="api" />
                      <el-option label="自定义选项" value="custom" />
                    </el-select>
                  </el-form-item>
                </el-form>

                <div class="config-footer">
                  <el-button @click="activeTab = 'list'">取消</el-button>
                  <el-button type="primary" @click="handleSaveRule" :loading="saving">保存规则</el-button>
                </div>
              </div>
            </el-tab-pane>

            <!-- Tab3: 规则测试 -->
            <el-tab-pane label="规则测试" name="test">
              <div class="tab-content test-content">
                <el-alert
                    title="在下方模拟填写表单，实时验证联动规则是否生效"
                    type="info"
                    :closable="false"
                    show-icon
                    style="margin-bottom: 16px"
                />

                <div class="test-form">
                  <h4>模拟表单填写</h4>
                  <el-form label-width="120px">
                    <el-form-item label="请假类型">
                      <el-select v-model="testForm.leave_type" placeholder="请选择" style="width: 100%" @change="handleTestChange">
                        <el-option label="年假" value="年假" />
                        <el-option label="事假" value="事假" />
                        <el-option label="病假" value="病假" />
                      </el-select>
                    </el-form-item>
                    <el-form-item label="请假天数" v-if="testForm.show_leave_days">
                      <el-input-number v-model="testForm.leave_days" :min="0" style="width: 100%" />
                    </el-form-item>
                    <el-form-item label="请假事由" v-if="testForm.show_leave_reason">
                      <el-input type="textarea" v-model="testForm.leave_reason" :rows="3" />
                    </el-form-item>
                    <el-form-item label="部门负责人" v-if="testForm.show_dept_manager">
                      <el-input v-model="testForm.dept_manager" disabled />
                    </el-form-item>
                  </el-form>
                </div>

                <div class="test-log">
                  <h4>测试日志</h4>
                  <el-timeline>
                    <el-timeline-item
                        v-for="(log, index) in testLogs"
                        :key="index"
                        :type="log.type"
                        :timestamp="log.time"
                    >
                      {{ log.message }}
                    </el-timeline-item>
                  </el-timeline>
                  <el-empty v-if="testLogs.length === 0" description="暂无测试记录，请在上方操作触发规则" :image-size="80" />
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </template>

        <!-- 空状态 -->
        <el-empty v-else description="请从左侧选择要配置联动规则的表单" :image-size="120" />
      </div>
    </div>

    <!-- 导入规则弹窗 -->
    <el-dialog v-model="importDialog.visible" title="导入联动规则" width="520px" append-to-body>
      <div class="import-dialog">
        <el-upload
            class="upload-area"
            drag
            accept=".json"
            :auto-upload="false"
            :show-file-list="true"
            :limit="10"
            :on-change="handleImportFileChange"
        >
          <el-icon class="el-icon--upload"><upload-filled /></el-icon>
          <div class="el-upload__text">
            拖拽 JSON 文件到此处，或 <em>点击选择</em>
          </div>
          <template #tip>
            <div class="el-upload__tip">支持批量导入，仅支持 .json 格式的规则配置文件</div>
          </template>
        </el-upload>
      </div>
      <template #footer>
        <el-button @click="importDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="confirmImport" :disabled="importDialog.files.length === 0">
          确认导入
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search, Refresh, Plus, Edit, Delete, View, CopyDocument,
  Download, Upload, UploadFilled, InfoFilled, Connection, Operation
} from '@element-plus/icons-vue'

// 搜索表单
const searchForm = ref({
  formName: '',
  category: '',
  ruleStatus: ''
})

// 当前Tab
const activeTab = ref('list')

// 选中的表单
const selectedForm = ref(null)

// 选中的规则
const selectedRules = ref([])

// 保存状态
const saving = ref(false)

// 表单列表数据
const formList = ref([
  {
    id: 1,
    formName: '请假申请表单',
    category: 'hr',
    ruleCount: 3,
    ruleStatus: 'enabled',
    updateTime: '2024-01-10 09:00:00'
  },
  {
    id: 2,
    formName: '费用报销表单',
    category: 'finance',
    ruleCount: 2,
    ruleStatus: 'enabled',
    updateTime: '2024-02-01 10:00:00'
  },
  {
    id: 3,
    formName: '会议申请表单',
    category: 'admin',
    ruleCount: 1,
    ruleStatus: 'enabled',
    updateTime: '2024-03-01 11:00:00'
  }
])

// 规则数据
const ruleData = ref({
  1: [
    {
      id: 1,
      ruleName: '病假显示请假事由',
      triggerField: '请假类型',
      triggerCondition: 'eq',
      triggerValue: '病假',
      ruleType: 'toggle',
      targetField: '请假事由',
      actionValue: '显示',
      status: 'enabled',
      description: '病假时显示请假事由字段'
    },
    {
      id: 2,
      ruleName: '事假设置请假天数为必填',
      triggerField: '请假类型',
      triggerCondition: 'eq',
      triggerValue: '事假',
      ruleType: 'required',
      targetField: '请假天数',
      actionValue: 'true',
      status: 'enabled',
      description: '事假必须填写请假天数'
    },
    {
      id: 3,
      ruleName: '年假自动赋值天数',
      triggerField: '请假类型',
      triggerCondition: 'eq',
      triggerValue: '年假',
      ruleType: 'assign',
      targetField: '请假天数',
      actionValue: '5',
      status: 'enabled',
      description: '年假默认赋值5天'
    }
  ],
  2: [
    {
      id: 4,
      ruleName: '报销金额大于5000设置只读',
      triggerField: '报销金额',
      triggerCondition: 'gt',
      triggerValue: '5000',
      ruleType: 'required',
      targetField: '报销事由',
      actionValue: '只读',
      status: 'enabled',
      description: '报销金额超过5000时，报销事由不可修改'
    },
    {
      id: 5,
      ruleName: '费用类型筛选报销科目',
      triggerField: '费用类型',
      triggerCondition: 'eq',
      triggerValue: '差旅费',
      ruleType: 'filter',
      targetField: '报销科目',
      actionValue: '差旅科目',
      status: 'enabled',
      description: '选择差旅费后，报销科目只显示差旅相关科目'
    }
  ],
  3: [
    {
      id: 6,
      ruleName: '会议类型显示参会人数',
      triggerField: '会议类型',
      triggerCondition: 'eq',
      triggerValue: '全员大会',
      ruleType: 'toggle',
      targetField: '参会人数',
      actionValue: '显示',
      status: 'enabled',
      description: '全员大会时显示参会人数字段'
    }
  ]
})

// 过滤后的表单列表
const filteredFormList = computed(() => {
  let result = [...formList.value]

  if (searchForm.value.formName) {
    const keyword = searchForm.value.formName.toLowerCase()
    result = result.filter(f => f.formName.toLowerCase().includes(keyword))
  }

  if (searchForm.value.category) {
    result = result.filter(f => f.category === searchForm.value.category)
  }

  if (searchForm.value.ruleStatus) {
    result = result.filter(f => f.ruleStatus === searchForm.value.ruleStatus)
  }

  return result
})

// 当前表单的规则
const currentRules = computed(() => {
  if (!selectedForm.value) return []
  return ruleData.value[selectedForm.value.id] || []
})

// 规则表单
const ruleFormRef = ref(null)
const ruleForm = ref({
  ruleName: '',
  triggerField: '',
  triggerCondition: '',
  triggerValue: '',
  ruleType: '',
  targetField: '',
  actionValue: '',
  formula: '',
  dataSource: '',
  description: '',
  status: 'enabled'
})

const ruleRules = {
  ruleName: [{ required: true, message: '请输入规则名称', trigger: 'blur' }],
  triggerField: [{ required: true, message: '请选择触发字段', trigger: 'change' }],
  triggerCondition: [{ required: true, message: '请选择触发条件', trigger: 'change' }],
  ruleType: [{ required: true, message: '请选择规则类型', trigger: 'change' }],
  targetField: [{ required: true, message: '请选择执行字段', trigger: 'change' }]
}

// 测试表单
const testForm = ref({
  leave_type: '',
  leave_days: 0,
  leave_reason: '',
  dept_manager: '',
  show_leave_days: true,
  show_leave_reason: true,
  show_dept_manager: false
})

const testLogs = ref([])

// 导入弹窗
const importDialog = ref({
  visible: false,
  files: []
})

// 获取分类标签类型
const getCategoryType = (category) => {
  const typeMap = {
    hr: '',
    finance: 'warning',
    admin: 'success',
    other: 'info'
  }
  return typeMap[category] || ''
}

// 获取分类标签文本
const getCategoryLabel = (category) => {
  const labelMap = {
    hr: '人事类',
    finance: '财务类',
    admin: '行政类',
    other: '其他'
  }
  return labelMap[category] || category
}

// 获取规则类型标签
const getRuleTypeTag = (type) => {
  const tagMap = {
    toggle: 'success',
    assign: 'primary',
    filter: 'warning',
    required: 'info',
    calculate: 'danger',
    clear: ''
  }
  return tagMap[type] || ''
}

// 获取规则类型文本
const getRuleTypeLabel = (type) => {
  const labelMap = {
    toggle: '显示/隐藏',
    assign: '自动赋值',
    filter: '下拉筛选',
    required: '必填/只读',
    calculate: '自动计算',
    clear: '清空字段'
  }
  return labelMap[type] || type
}

// 查询
const handleSearch = () => {
  ElMessage.success('查询完成')
}

// 重置
const handleReset = () => {
  searchForm.value = {
    formName: '',
    category: '',
    ruleStatus: ''
  }
  ElMessage.success('已重置查询条件')
}

// 选择表单
const handleSelectForm = (form) => {
  selectedForm.value = form
  activeTab.value = 'list'
  ElMessage.success(`已加载表单：${form.formName}`)
}

// Tab切换
const handleTabChange = (tab) => {
  if (tab === 'config' && !ruleForm.value.id) {
    // 新建模式
    ruleForm.value = {
      ruleName: '',
      triggerField: '',
      triggerCondition: '',
      triggerValue: '',
      ruleType: '',
      targetField: '',
      actionValue: '',
      formula: '',
      dataSource: '',
      description: '',
      status: 'enabled'
    }
  }
}

// 新建规则
const handleAddRule = () => {
  activeTab.value = 'config'
  ruleForm.value = {
    ruleName: '',
    triggerField: '',
    triggerCondition: '',
    triggerValue: '',
    ruleType: '',
    targetField: '',
    actionValue: '',
    formula: '',
    dataSource: '',
    description: '',
    status: 'enabled'
  }
}

// 编辑规则
const handleEditRule = (row) => {
  activeTab.value = 'config'
  ruleForm.value = { ...row }
}

// 保存规则
const handleSaveRule = () => {
  ruleFormRef.value.validate((valid) => {
    if (valid) {
      saving.value = true
      setTimeout(() => {
        if (ruleForm.value.id) {
          // 编辑模式
          const rules = ruleData.value[selectedForm.value.id]
          const index = rules.findIndex(r => r.id === ruleForm.value.id)
          if (index !== -1) {
            rules[index] = { ...ruleForm.value }
          }
          ElMessage.success('规则修改成功')
        } else {
          // 新建模式
          const newRule = {
            ...ruleForm.value,
            id: Date.now(),
            creator: '当前用户',
            createTime: new Date().toLocaleString()
          }
          if (!ruleData.value[selectedForm.value.id]) {
            ruleData.value[selectedForm.value.id] = []
          }
          ruleData.value[selectedForm.value.id].unshift(newRule)

          // 更新表单规则数量
          const form = formList.value.find(f => f.id === selectedForm.value.id)
          if (form) {
            form.ruleCount++
          }

          ElMessage.success('规则新增成功')
        }
        saving.value = false
        activeTab.value = 'list'
      }, 500)
    }
  })
}

// 复制规则
const handleCopyRule = (row) => {
  const newRule = {
    ...row,
    id: Date.now(),
    ruleName: row.ruleName + ' (副本)',
    creator: '当前用户',
    createTime: new Date().toLocaleString()
  }
  ruleData.value[selectedForm.value.id].unshift(newRule)

  const form = formList.value.find(f => f.id === selectedForm.value.id)
  if (form) {
    form.ruleCount++
  }

  ElMessage.success('规则复制成功')
}

// 删除规则
const handleDeleteRule = (row) => {
  ElMessageBox.confirm(
      `确定要删除规则「${row.ruleName}」吗？`,
      '删除确认',
      {
        confirmButtonText: '确认删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
  ).then(() => {
    const rules = ruleData.value[selectedForm.value.id]
    ruleData.value[selectedForm.value.id] = rules.filter(r => r.id !== row.id)

    const form = formList.value.find(f => f.id === selectedForm.value.id)
    if (form) {
      form.ruleCount--
    }

    ElMessage.success('删除成功')
  }).catch(() => {})
}

// 状态变更
const handleStatusChange = (row) => {
  const action = row.status === 'enabled' ? '启用' : '禁用'
  ElMessage.success(`已${action}规则「${row.ruleName}」`)
}

// 规则选择
const handleRuleSelectionChange = (rows) => {
  selectedRules.value = rows
}

// 批量启用
const handleBatchEnable = () => {
  if (selectedRules.value.length === 0) {
    ElMessage.warning('请先选择要启用的规则')
    return
  }

  ElMessageBox.confirm(
      `确认启用选中的 ${selectedRules.value.length} 条规则？`,
      '批量启用',
      {
        confirmButtonText: '确认启用',
        cancelButtonText: '取消',
        type: 'info'
      }
  ).then(() => {
    selectedRules.value.forEach(rule => {
      rule.status = 'enabled'
    })
    ElMessage.success(`已启用 ${selectedRules.value.length} 条规则`)
  }).catch(() => {})
}

// 批量禁用
const handleBatchDisable = () => {
  if (selectedRules.value.length === 0) {
    ElMessage.warning('请先选择要禁用的规则')
    return
  }

  ElMessageBox.confirm(
      `确认禁用选中的 ${selectedRules.value.length} 条规则？`,
      '批量禁用',
      {
        confirmButtonText: '确认禁用',
        cancelButtonText: '取消',
        type: 'warning'
      }
  ).then(() => {
    selectedRules.value.forEach(rule => {
      rule.status = 'disabled'
    })
    ElMessage.success(`已禁用 ${selectedRules.value.length} 条规则`)
  }).catch(() => {})
}

// 测试规则
const handleTestRule = (row) => {
  activeTab.value = 'test'
  testLogs.value = []

  // 模拟测试
  testLogs.value.push({
    type: 'success',
    time: new Date().toLocaleTimeString(),
    message: `开始测试规则：${row.ruleName}`
  })
}

// 测试表单变更
const handleTestChange = (value) => {
  testLogs.value.push({
    type: 'primary',
    time: new Date().toLocaleTimeString(),
    message: `触发字段变更：请假类型 = ${value}`
  })

  if (value === '病假') {
    testForm.value.show_leave_reason = true
    testLogs.value.push({
      type: 'success',
      time: new Date().toLocaleTimeString(),
      message: '执行动作：显示「请假事由」字段'
    })
  } else if (value === '事假') {
    testForm.value.show_leave_days = true
    testLogs.value.push({
      type: 'success',
      time: new Date().toLocaleTimeString(),
      message: '执行动作：设置「请假天数」为必填'
    })
  } else if (value === '年假') {
    testForm.value.leave_days = 5
    testLogs.value.push({
      type: 'success',
      time: new Date().toLocaleTimeString(),
      message: '执行动作：自动赋值「请假天数」= 5'
    })
  }
}

// 批量导出
const handleBatchExport = () => {
  if (!selectedForm.value) {
    ElMessage.warning('请先选择要导出规则的表单')
    return
  }

  const rules = ruleData.value[selectedForm.value.id] || []
  if (rules.length === 0) {
    ElMessage.warning('该表单暂无联动规则')
    return
  }

  const exportData = {
    formName: selectedForm.value.formName,
    rules: rules,
    exportTime: new Date().toLocaleString(),
    version: '1.0'
  }

  const jsonStr = JSON.stringify(exportData, null, 2)
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${selectedForm.value.formName}_联动规则.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)

  ElMessage.success('规则导出成功')
}

// 批量导入
const handleBatchImport = () => {
  importDialog.value.visible = true
  importDialog.value.files = []
}

const handleImportFileChange = (file) => {
  importDialog.value.files.push(file)
}

const confirmImport = async () => {
  if (importDialog.value.files.length === 0) {
    ElMessage.warning('请先选择文件')
    return
  }

  try {
    let successCount = 0

    for (const file of importDialog.value.files) {
      const text = await file.raw.text()
      const config = JSON.parse(text)

      if (config.rules && Array.isArray(config.rules)) {
        if (!ruleData.value[selectedForm.value.id]) {
          ruleData.value[selectedForm.value.id] = []
        }

        config.rules.forEach(rule => {
          ruleData.value[selectedForm.value.id].unshift({
            ...rule,
            id: Date.now() + Math.random()
          })
          successCount++
        })

        const form = formList.value.find(f => f.id === selectedForm.value.id)
        if (form) {
          form.ruleCount += config.rules.length
        }
      }
    }

    importDialog.value.visible = false
    importDialog.value.files = []

    ElMessage.success(`成功导入 ${successCount} 条规则`)
  } catch (e) {
    ElMessage.error('文件解析失败，请检查JSON格式')
    console.error('导入错误:', e)
  }
}
</script>

<style scoped lang="scss">
.form-linkage {
  padding: 20px;
  background: #f0f2f5;
  min-height: calc(100vh - 50px);

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding: 20px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);

    .header-left {
      h2 {
        margin: 0 0 8px;
        font-size: 20px;
        color: #303133;
        font-weight: 600;
      }

      .subtitle {
        margin: 0;
        font-size: 13px;
        color: #909399;
      }
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }
  }

  .search-bar {
    padding: 16px 20px;
    margin-bottom: 16px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);

    :deep(.el-form-item) {
      margin-bottom: 0;
      margin-right: 16px;
    }
  }

  .main-content {
    display: flex;
    gap: 16px;
    height: calc(100vh - 280px);

    .left-panel {
      width: 280px;
      flex-shrink: 0;
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
      display: flex;
      flex-direction: column;
      overflow: hidden;

      .panel-header {
        padding: 16px;
        border-bottom: 1px solid #e4e7ed;
        font-weight: 600;
        color: #303133;
        display: flex;
        justify-content: space-between;
        align-items: center;

        .count-badge {
          background: #667eea;
          color: #fff;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 12px;
        }
      }

      .form-list {
        flex: 1;
        overflow-y: auto;
        padding: 8px;

        .form-item {
          padding: 12px;
          margin-bottom: 8px;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
          border: 1px solid transparent;

          &:hover {
            background: #f5f7fa;
          }

          &.active {
            background: #ecf5ff;
            border-color: #667eea;
          }

          .form-item-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;

            .form-name {
              font-size: 14px;
              color: #303133;
              font-weight: 500;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
              flex: 1;
              margin-right: 8px;
            }
          }

          .form-item-meta {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 12px;
            color: #909399;

            .rule-count {
              color: #f56c6c;
              font-weight: 600;
            }
          }
        }
      }
    }

    .right-panel {
      flex: 1;
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
      overflow: hidden;
      display: flex;
      flex-direction: column;

      .linkage-tabs {
        flex: 1;
        display: flex;
        flex-direction: column;

        :deep(.el-tabs__content) {
          flex: 1;
          overflow: hidden;
        }
      }

      .tab-content {
        padding: 16px;
        height: 100%;
        display: flex;
        flex-direction: column;

        .tab-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;

          .toolbar-left {
            display: flex;
            gap: 8px;
          }

          .toolbar-right {
            .total-count {
              font-size: 13px;
              color: #909399;
            }
          }
        }

        :deep(.el-table) {
          flex: 1;
        }

        .action-buttons {
          display: inline-flex !important;
          gap: 6px;
          justify-content: center;
          align-items: center;
          flex-wrap: nowrap !important;
          white-space: nowrap !important;

          .el-button {
            margin: 0 !important;
            padding: 5px 8px;
            font-size: 12px;
          }
        }
      }

      .config-content {
        overflow-y: auto;

        :deep(.el-divider__text) {
          font-weight: 600;
          color: #303133;
        }

        .tip {
          margin-top: 4px;
          font-size: 12px;
          color: #909399;
        }

        .config-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 24px;
          padding-top: 16px;
          border-top: 1px solid #e4e7ed;
        }
      }

      .test-content {
        overflow-y: auto;

        .test-form {
          padding: 20px;
          background: #f5f7fa;
          border-radius: 8px;
          margin-bottom: 20px;

          h4 {
            margin: 0 0 16px 0;
            font-size: 16px;
            color: #303133;
          }
        }

        .test-log {
          padding: 20px;
          background: #fff;
          border: 1px solid #e4e7ed;
          border-radius: 8px;

          h4 {
            margin: 0 0 16px 0;
            font-size: 16px;
            color: #303133;
          }
        }
      }
    }
  }

  // 导入弹窗样式
  .import-dialog {
    .upload-area {
      :deep(.el-upload-dragger) {
        padding: 30px 20px;
        border: 2px dashed #dcdfe6;
        border-radius: 8px;
        transition: all 0.3s;

        &:hover {
          border-color: #667eea;
        }
      }

      .el-icon--upload {
        font-size: 48px;
        color: #c0c4cc;
        margin-bottom: 12px;
      }

      .el-upload__text {
        color: #606266;
        font-size: 14px;

        em {
          color: #667eea;
          font-style: normal;
          font-weight: 500;
        }
      }

      .el-upload__tip {
        font-size: 12px;
        color: #909399;
        margin-top: 8px;
      }
    }
  }
}
</style>
