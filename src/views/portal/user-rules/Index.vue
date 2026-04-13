<template>
  <div class="custom-rules-management">
    <!-- 面包屑 -->
    <el-breadcrumb separator="/" class="breadcrumb">
      <el-breadcrumb-item :to="{ path: '/admin/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>门户中心</el-breadcrumb-item>
      <el-breadcrumb-item>基础配置</el-breadcrumb-item>
      <el-breadcrumb-item>自定义规则配置</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 顶部操作栏 -->
    <div class="top-actions">
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>新增规则
      </el-button>
      <el-button @click="handleBatchEnable" :disabled="selectedRows.length === 0">
        <el-icon><CircleCheck /></el-icon>批量启用
      </el-button>
      <el-button @click="handleBatchDisable" :disabled="selectedRows.length === 0">
        <el-icon><CircleClose /></el-icon>批量禁用
      </el-button>
      <el-button @click="handleBatchDelete" :disabled="canBatchDelete">
        <el-icon><Delete /></el-icon>批量删除
      </el-button>
      <el-button @click="refreshData">
        <el-icon><Refresh /></el-icon>刷新
      </el-button>
    </div>

    <!-- 筛选区 -->
    <el-card class="filter-card" shadow="never">
      <el-form :inline="true" :model="searchForm" size="default">
        <el-form-item label="规则名称">
          <el-input
              v-model="searchForm.name"
              placeholder="请输入规则名称"
              clearable
              style="width: 200px"
              @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="规则类型">
          <el-select v-model="searchForm.type" placeholder="请选择" clearable style="width: 160px">
            <el-option label="组件显示规则" value="component_display" />
            <el-option label="门户访问规则" value="portal_access" />
            <el-option label="数据筛选规则" value="data_filter" />
            <el-option label="交互规则" value="interaction" />
          </el-select>
        </el-form-item>
        <el-form-item label="规则状态">
          <el-select v-model="searchForm.status" placeholder="请选择" clearable style="width: 140px">
            <el-option label="启用" value="enabled" />
            <el-option label="禁用" value="disabled" />
            <el-option label="测试中" value="testing" />
          </el-select>
        </el-form-item>
        <el-form-item label="适用门户">
          <el-select v-model="searchForm.portalId" placeholder="请选择" clearable style="width: 180px">
            <el-option label="全部" value="" />
            <el-option v-for="item in portalOptions" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 核心列表区 -->
    <el-card class="main-card" shadow="never">
      <el-table
          :data="tableData"
          v-loading="loading"
          @selection-change="handleSelectionChange"
          stripe
          border
          row-key="id"
      >
        <el-table-column type="selection" width="50" align="center" />
        <el-table-column prop="name" label="规则名称" min-width="180">
          <template #default="{ row }">
            <el-link type="primary" @click="handleEdit(row)">{{ row.name }}</el-link>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="规则类型" width="140" align="center">
          <template #default="{ row }">
            <el-tag :type="getRuleTypeColor(row.type)" size="small">
              {{ getRuleTypeLabel(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="portals" label="适用门户" min-width="200">
          <template #default="{ row }">
            <el-tooltip placement="top">
              <template #content>
                <div>{{ row.portals.join('、') }}</div>
              </template>
              <span class="portal-text">
                {{ row.portals.slice(0, 3).join('、') }}{{ row.portals.length > 3 ? '...' : '' }}
              </span>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="规则状态" width="100" align="center">
          <template #default="{ row }">
            <el-tooltip :content="getStatusTip(row)" placement="top">
              <el-tag :type="getStatusColor(row.status)" size="small">
                {{ getStatusLabel(row.status) }}
              </el-tag>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column prop="configurer" label="配置人" width="140" />
        <el-table-column prop="configureTime" label="配置时间" width="160" />
        <el-table-column label="操作" width="280" align="center" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button
                v-if="row.status === 'enabled'"
                link
                type="warning"
                size="small"
                @click="handleDisable(row)"
            >
              禁用
            </el-button>
            <el-button
                v-else
                link
                type="success"
                size="small"
                @click="handleEnable(row)"
            >
              启用
            </el-button>
            <el-button
                v-if="row.status === 'testing'"
                link
                type="primary"
                size="small"
                @click="handleTest(row)"
            >
              测试
            </el-button>
            <el-button link type="info" size="small" @click="handleCopy(row)">复制</el-button>
            <el-button link type="danger" size="small" @click="handleDelete(row)" :disabled="row.status === 'enabled'">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          class="pagination"
          @size-change="fetchData"
          @current-change="fetchData"
      />
    </el-card>

    <!-- 新增/编辑弹窗（分步表单） -->
    <el-dialog
        v-model="dialogVisible"
        :title="dialogTitle"
        width="800px"
        :close-on-click-modal="false"
    >
      <el-steps :active="currentStep" finish-status="success" class="steps">
        <el-step title="基础信息" />
        <el-step title="规则配置" />
      </el-steps>

      <!-- 步骤1：基础信息 -->
      <div v-show="currentStep === 0" class="step-content">
        <el-form
            ref="formRef"
            :model="formData"
            :rules="formRules"
            label-width="100px"
        >
          <el-form-item label="规则名称" prop="name">
            <el-input
                v-model="formData.name"
                placeholder="请输入规则名称"
                maxlength="20"
                show-word-limit
            />
          </el-form-item>
          <el-form-item label="规则类型" prop="type">
            <el-select
                v-model="formData.type"
                placeholder="请选择规则类型"
                style="width: 100%"
                :disabled="isEdit"
                @change="handleTypeChange"
            >
              <el-option label="组件显示规则" value="component_display" />
              <el-option label="门户访问规则" value="portal_access" />
              <el-option label="数据筛选规则" value="data_filter" />
              <el-option label="交互规则" value="interaction" />
            </el-select>
          </el-form-item>
          <el-form-item label="适用门户" prop="portalIds">
            <el-select
                v-model="formData.portalIds"
                multiple
                placeholder="请选择适用门户"
                style="width: 100%"
            >
              <el-option v-for="item in portalOptions" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="规则状态" prop="status">
            <el-radio-group v-model="formData.status">
              <el-radio value="testing">测试中</el-radio>
              <el-radio value="enabled">启用</el-radio>
              <el-radio value="disabled">禁用</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="规则描述" prop="description">
            <el-input
                v-model="formData.description"
                type="textarea"
                :rows="3"
                placeholder="请输入规则描述"
                maxlength="50"
                show-word-limit
            />
          </el-form-item>
        </el-form>
      </div>

      <!-- 步骤2：规则配置（根据类型动态显示） -->
      <div v-show="currentStep === 1" class="step-content">
        <!-- 组件显示规则 -->
        <el-form v-if="formData.type === 'component_display'" :model="ruleConfig" label-width="100px">
          <el-form-item label="选择组件">
            <el-select v-model="ruleConfig.componentId" placeholder="请选择组件" style="width: 100%">
              <el-option label="数据统计卡片" value="stat_card" />
              <el-option label="待办审批" value="todo_list" />
              <el-option label="新闻列表" value="news_list" />
            </el-select>
          </el-form-item>
          <el-form-item label="显示条件">
            <div v-for="(condition, index) in ruleConfig.conditions" :key="index" class="condition-item">
              <el-row :gutter="8">
                <el-col :span="6">
                  <el-select v-model="condition.field" placeholder="字段" style="width: 100%">
                    <el-option label="角色" value="role" />
                    <el-option label="部门" value="department" />
                    <el-option label="时间" value="time" />
                  </el-select>
                </el-col>
                <el-col :span="6">
                  <el-select v-model="condition.operator" placeholder="运算符" style="width: 100%">
                    <el-option label="等于" value="eq" />
                    <el-option label="不等于" value="neq" />
                    <el-option label="包含" value="in" />
                  </el-select>
                </el-col>
                <el-col :span="10">
                  <el-input v-model="condition.value" placeholder="值" />
                </el-col>
                <el-col :span="2">
                  <el-button link type="danger" @click="removeCondition(index)">
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </el-col>
              </el-row>
            </div>
            <el-button size="small" @click="addCondition">+ 新增条件</el-button>
          </el-form-item>
          <el-form-item label="生效优先级">
            <el-input-number v-model="ruleConfig.priority" :min="1" :max="10" controls-position="right" />
          </el-form-item>
        </el-form>

        <!-- 门户访问规则 -->
        <el-form v-if="formData.type === 'portal_access'" :model="ruleConfig" label-width="100px">
          <el-form-item label="访问条件">
            <div v-for="(condition, index) in ruleConfig.accessConditions" :key="index" class="condition-item">
              <el-row :gutter="8">
                <el-col :span="8">
                  <el-select v-model="condition.type" placeholder="条件类型" style="width: 100%">
                    <el-option label="角色" value="role" />
                    <el-option label="部门" value="department" />
                    <el-option label="时间" value="time" />
                    <el-option label="IP段" value="ip" />
                  </el-select>
                </el-col>
                <el-col :span="14">
                  <el-input v-model="condition.value" placeholder="条件值" />
                </el-col>
                <el-col :span="2">
                  <el-button link type="danger" @click="removeAccessCondition(index)">
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </el-col>
              </el-row>
            </div>
            <el-button size="small" @click="addAccessCondition">+ 新增条件</el-button>
          </el-form-item>
          <el-form-item label="拒绝提示">
            <el-input v-model="ruleConfig.rejectMessage" placeholder="您无权限访问该门户，请联系管理员" />
          </el-form-item>
        </el-form>

        <!-- 数据筛选规则 -->
        <el-form v-if="formData.type === 'data_filter'" :model="ruleConfig" label-width="100px">
          <el-form-item label="选择组件">
            <el-select v-model="ruleConfig.componentId" placeholder="请选择组件" style="width: 100%">
              <el-option label="待办审批" value="todo_list" />
              <el-option label="新闻列表" value="news_list" />
              <el-option label="表单数据" value="form_data" />
            </el-select>
          </el-form-item>
          <el-form-item label="筛选条件">
            <div v-for="(filter, index) in ruleConfig.filters" :key="index" class="condition-item">
              <el-row :gutter="8">
                <el-col :span="8">
                  <el-select v-model="filter.field" placeholder="筛选字段" style="width: 100%">
                    <el-option label="流程类型" value="flow_type" />
                    <el-option label="紧急程度" value="urgency" />
                    <el-option label="发布时间" value="publish_time" />
                  </el-select>
                </el-col>
                <el-col :span="14">
                  <el-input v-model="filter.value" placeholder="筛选值" />
                </el-col>
                <el-col :span="2">
                  <el-button link type="danger" @click="removeFilter(index)">
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </el-col>
              </el-row>
            </div>
            <el-button size="small" @click="addFilter">+ 新增条件</el-button>
          </el-form-item>
          <el-form-item label="排序规则">
            <el-select v-model="ruleConfig.sortRule" placeholder="请选择排序规则" style="width: 100%">
              <el-option label="按时间降序" value="time_desc" />
              <el-option label="按时间升序" value="time_asc" />
              <el-option label="按紧急程度" value="urgency" />
            </el-select>
          </el-form-item>
        </el-form>

        <!-- 交互规则 -->
        <el-form v-if="formData.type === 'interaction'" :model="ruleConfig" label-width="100px">
          <el-form-item label="选择组件">
            <el-select v-model="ruleConfig.componentId" placeholder="请选择组件" style="width: 100%">
              <el-option label="快捷入口" value="shortcut" />
              <el-option label="卡片容器" value="card" />
            </el-select>
          </el-form-item>
          <el-form-item label="触发事件">
            <el-select v-model="ruleConfig.triggerEvent" placeholder="请选择触发事件" style="width: 100%">
              <el-option label="点击组件" value="click" />
              <el-option label="门户加载完成" value="load" />
            </el-select>
          </el-form-item>
          <el-form-item label="执行动作">
            <el-select v-model="ruleConfig.action" placeholder="请选择执行动作" style="width: 100%">
              <el-option label="跳转指定页面" value="jump" />
              <el-option label="弹出弹窗" value="popup" />
              <el-option label="打开链接" value="link" />
            </el-select>
          </el-form-item>
          <el-form-item label="动作参数">
            <el-input v-model="ruleConfig.actionParam" placeholder="如：流程中心、今日公告内容" />
          </el-form-item>
        </el-form>
      </div>

      <template #footer>
        <el-button v-if="currentStep > 0" @click="currentStep--">上一步</el-button>
        <el-button v-if="currentStep < 1" type="primary" @click="handleNextStep">下一步</el-button>
        <el-button v-if="currentStep === 1" type="primary" @click="handleSubmit" :loading="submitting">确定</el-button>
        <el-button @click="dialogVisible = false">取消</el-button>
      </template>
    </el-dialog>

    <!-- 测试窗口 -->
    <el-dialog v-model="testDialogVisible" title="规则测试" width="900px">
      <div class="test-container">
        <el-alert title="当前为测试模式，仅管理员可见效果" type="info" :closable="false" />
        <div class="test-preview">
          <p>规则名称：{{ currentTestRule?.name }}</p>
          <p>规则类型：{{ getRuleTypeLabel(currentTestRule?.type) }}</p>
          <p>测试结果：规则配置正确，可正常生效</p>
        </div>
      </div>
      <template #footer>
        <el-button @click="testDialogVisible = false">关闭测试</el-button>
        <el-button type="primary" @click="handleEnableFromTest">启用规则</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, CircleCheck, CircleClose, Delete, Refresh } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 状态管理
const loading = ref(false)
const submitting = ref(false)
const dialogVisible = ref(false)
const testDialogVisible = ref(false)
const isEdit = ref(false)
const dialogTitle = ref('新增规则')
const currentStep = ref(0)
const formRef = ref(null)
const currentTestRule = ref(null)

// 搜索表单
const searchForm = reactive({
  name: '',
  type: '',
  status: '',
  portalId: ''
})

// 分页
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 表格数据
const tableData = ref([])
const selectedRows = ref([])
const portalOptions = ref([])

// 表单数据
const formData = reactive({
  id: null,
  name: '',
  type: '',
  portalIds: [],
  status: 'testing',
  description: ''
})

// 规则配置
const ruleConfig = reactive({
  componentId: '',
  conditions: [],
  accessConditions: [],
  filters: [],
  priority: 5,
  rejectMessage: '您无权限访问该门户，请联系管理员',
  sortRule: 'time_desc',
  triggerEvent: '',
  action: '',
  actionParam: ''
})

// 表单校验规则
const formRules = {
  name: [
    { required: true, message: '请输入规则名称', trigger: 'blur' },
    { min: 1, max: 20, message: '长度限制1-20字', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择规则类型', trigger: 'change' }
  ],
  portalIds: [
    { required: true, message: '请选择适用门户', trigger: 'change' }
  ]
}

// 计算属性
const canBatchDelete = computed(() => {
  return selectedRows.value.length === 0 ||
      selectedRows.value.some(row => row.status === 'enabled')
})

// 获取数据
const fetchData = () => {
  loading.value = true
  setTimeout(() => {
    tableData.value = [
      {
        id: 1,
        name: '管理层数据显示规则',
        type: 'component_display',
        portals: ['员工门户', '管理员门户'],
        status: 'enabled',
        configurer: '张三/技术部',
        configureTime: '2024-01-15 10:30'
      },
      {
        id: 2,
        name: '上班时间访问限制',
        type: 'portal_access',
        portals: ['管理员门户'],
        status: 'testing',
        configurer: '李四/人事部',
        configureTime: '2024-01-14 15:20'
      },
      {
        id: 3,
        name: '紧急待办筛选',
        type: 'data_filter',
        portals: ['员工门户'],
        status: 'disabled',
        configurer: '王五/财务部',
        configureTime: '2024-01-13 09:15'
      }
    ]
    pagination.total = 3
    loading.value = false
  }, 500)
}

// 工具函数
const getRuleTypeLabel = (type) => {
  const map = {
    component_display: '组件显示规则',
    portal_access: '门户访问规则',
    data_filter: '数据筛选规则',
    interaction: '交互规则'
  }
  return map[type] || type
}

const getRuleTypeColor = (type) => {
  const map = {
    component_display: '',
    portal_access: 'success',
    data_filter: 'warning',
    interaction: ''
  }
  return map[type] || 'info'
}

const getStatusLabel = (status) => {
  const map = { enabled: '启用', disabled: '禁用', testing: '测试中' }
  return map[status] || status
}

const getStatusColor = (status) => {
  const map = { enabled: 'success', disabled: 'info', testing: '' }
  return map[status] || 'info'
}

const getStatusTip = (row) => {
  if (row.status === 'enabled') return '规则已启用，正在生效'
  if (row.status === 'disabled') return '规则已禁用，暂不生效'
  if (row.status === 'testing') return '规则测试中，仅管理员可见'
  return ''
}

// 事件处理
const handleSearch = () => {
  pagination.currentPage = 1
  fetchData()
}

const handleReset = () => {
  Object.assign(searchForm, {
    name: '',
    type: '',
    status: '',
    portalId: ''
  })
  handleSearch()
}

const handleSelectionChange = (rows) => {
  selectedRows.value = rows
}

const handleAdd = () => {
  isEdit.value = false
  dialogTitle.value = '新增规则'
  currentStep.value = 0
  resetForm()
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  dialogTitle.value = '编辑规则'
  currentStep.value = 0
  Object.assign(formData, {
    id: row.id,
    name: row.name,
    type: row.type,
    portalIds: [1, 2],
    status: row.status,
    description: ''
  })
  dialogVisible.value = true
}

const handleNextStep = async () => {
  if (!formRef.value) return

  await formRef.value.validate((valid) => {
    if (valid) {
      currentStep.value++
    }
  })
}

const handleSubmit = async () => {
  submitting.value = true
  setTimeout(() => {
    submitting.value = false
    dialogVisible.value = false
    ElMessage.success(isEdit.value ? '编辑成功' : '新增成功')
    fetchData()
  }, 500)
}

const handleEnable = (row) => {
  if (row.status === 'testing') {
    ElMessageBox.confirm('确定要启用该规则吗？启用后将对所有关联门户的前台用户生效', '启用确认', { type: 'warning' }).then(() => {
      ElMessage.success('启用成功')
      fetchData()
    }).catch(() => {})
  } else {
    ElMessageBox.confirm(`确定要启用规则"${row.name}"吗？`, '启用确认', { type: 'info' }).then(() => {
      ElMessage.success('启用成功')
      fetchData()
    }).catch(() => {})
  }
}

const handleDisable = (row) => {
  ElMessageBox.confirm('确定要禁用该规则吗？禁用后，关联门户将恢复默认配置，不影响现有数据', '禁用确认', { type: 'warning' }).then(() => {
    ElMessage.success('禁用成功')
    fetchData()
  }).catch(() => {})
}

const handleDelete = (row) => {
  if (row.status === 'enabled') {
    ElMessage.warning('请先禁用该规则再删除')
    return
  }

  ElMessageBox.confirm('确定要删除该规则吗？删除后不可恢复，若规则已启用，将立即停止生效', '删除确认', { type: 'error' }).then(() => {
    ElMessage.success('删除成功')
    fetchData()
  }).catch(() => {})
}

const handleCopy = (row) => {
  ElMessageBox.confirm(`确定复制规则"${row.name}"？`, '复制确认', { type: 'info' }).then(() => {
    ElMessage.success('复制成功')
    fetchData()
  }).catch(() => {})
}

const handleTest = (row) => {
  currentTestRule.value = row
  testDialogVisible.value = true
}

const handleEnableFromTest = () => {
  ElMessageBox.confirm('测试通过，确定要启用该规则吗？', '启用确认', { type: 'warning' }).then(() => {
    testDialogVisible.value = false
    ElMessage.success('启用成功')
    fetchData()
  }).catch(() => {})
}

const handleBatchEnable = () => {
  const disabledRows = selectedRows.value.filter(row => row.status !== 'enabled')
  if (disabledRows.length === 0) {
    ElMessage.warning('请选择需要启用的规则')
    return
  }

  ElMessageBox.confirm(`确定要启用选中的 ${disabledRows.length} 个规则吗？`, '批量启用', { type: 'warning' }).then(() => {
    ElMessage.success('批量启用成功')
    fetchData()
  }).catch(() => {})
}

const handleBatchDisable = () => {
  const enabledRows = selectedRows.value.filter(row => row.status !== 'disabled')
  if (enabledRows.length === 0) {
    ElMessage.warning('请选择需要禁用的规则')
    return
  }

  ElMessageBox.confirm(`确定要禁用选中的 ${enabledRows.length} 个规则吗？`, '批量禁用', { type: 'warning' }).then(() => {
    ElMessage.success('批量禁用成功')
    fetchData()
  }).catch(() => {})
}

const handleBatchDelete = () => {
  const deletableRows = selectedRows.value.filter(row => row.status !== 'enabled')
  if (deletableRows.length === 0) {
    ElMessage.warning('已启用的规则不可批量删除')
    return
  }

  ElMessageBox.confirm(`确定要删除选中的 ${deletableRows.length} 个规则吗？`, '批量删除', { type: 'error' }).then(() => {
    ElMessage.success('批量删除成功')
    fetchData()
  }).catch(() => {})
}

const refreshData = () => {
  fetchData()
  ElMessage.success('刷新成功')
}

const handleTypeChange = () => {
  // 清空规则配置
  Object.assign(ruleConfig, {
    componentId: '',
    conditions: [],
    accessConditions: [],
    filters: [],
    priority: 5,
    rejectMessage: '您无权限访问该门户，请联系管理员',
    sortRule: 'time_desc',
    triggerEvent: '',
    action: '',
    actionParam: ''
  })
}

const addCondition = () => {
  ruleConfig.conditions.push({ field: '', operator: '', value: '' })
}

const removeCondition = (index) => {
  ruleConfig.conditions.splice(index, 1)
}

const addAccessCondition = () => {
  ruleConfig.accessConditions.push({ type: '', value: '' })
}

const removeAccessCondition = (index) => {
  ruleConfig.accessConditions.splice(index, 1)
}

const addFilter = () => {
  ruleConfig.filters.push({ field: '', value: '' })
}

const removeFilter = (index) => {
  ruleConfig.filters.splice(index, 1)
}

const resetForm = () => {
  Object.assign(formData, {
    id: null,
    name: '',
    type: '',
    portalIds: [],
    status: 'testing',
    description: ''
  })
  Object.assign(ruleConfig, {
    componentId: '',
    conditions: [],
    accessConditions: [],
    filters: [],
    priority: 5,
    rejectMessage: '您无权限访问该门户，请联系管理员',
    sortRule: 'time_desc',
    triggerEvent: '',
    action: '',
    actionParam: ''
  })
  if (formRef.value) {
    formRef.value.clearValidate()
  }
}

onMounted(() => {
  fetchData()
  portalOptions.value = [
    { id: 1, name: '员工门户' },
    { id: 2, name: '管理员门户' },
    { id: 3, name: '部门门户' }
  ]
})
</script>

<style scoped lang="scss">
.custom-rules-management {
  padding: 16px;
  background: #f0f2f5;
  min-height: calc(100vh - 50px);

  .breadcrumb {
    margin-bottom: 16px;
  }

  .top-actions {
    margin-bottom: 16px;
    display: flex;
    gap: 8px;
  }

  .filter-card {
    margin-bottom: 16px;

    :deep(.el-card__body) {
      padding: 16px;
    }
  }

  .main-card {
    :deep(.el-card__body) {
      padding: 16px;
    }
  }

  .portal-text {
    color: #606266;
    cursor: pointer;

    &:hover {
      color: #409eff;
    }
  }

  .pagination {
    margin-top: 16px;
    display: flex;
    justify-content: flex-end;
  }

  .steps {
    margin-bottom: 24px;
  }

  .step-content {
    min-height: 300px;
    max-height: 500px;
    overflow-y: auto;
  }

  .condition-item {
    margin-bottom: 12px;
    padding: 12px;
    background: #f5f7fa;
    border-radius: 4px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .test-container {
    .test-preview {
      margin-top: 16px;
      padding: 20px;
      background: #f5f7fa;
      border-radius: 4px;

      p {
        margin: 8px 0;
        font-size: 14px;
        color: #606266;
      }
    }
  }
}
</style>
