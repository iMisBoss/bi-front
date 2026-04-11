<template>
  <div class="form-permission">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h2>字段权限配置</h2>
        <p class="subtitle">精细化管控表单字段的可见/编辑权限，保障数据安全</p>
      </div>
      <div class="header-actions">
        <el-button size="small" @click="handleBatchExport">
          <el-icon><Download /></el-icon>
          批量导出权限
        </el-button>
        <el-button size="small" type="primary" @click="handlePermissionTest">
          <el-icon><View /></el-icon>
          权限测试
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
        <el-form-item label="权限状态">
          <el-select v-model="searchForm.permissionStatus" placeholder="请选择" clearable style="width: 150px">
            <el-option label="已配置" value="configured" />
            <el-option label="未配置" value="unconfigured" />
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

    <!-- 主体内容区：左侧表单列表 + 右侧权限配置 -->
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
              <el-tag size="small" :type="form.permissionStatus === 'configured' ? 'success' : 'info'">
                {{ form.permissionStatus === 'configured' ? '已配置' : '未配置' }}
              </el-tag>
            </div>
            <div class="form-item-meta">
              <el-tag size="small" :type="getCategoryType(form.category)">
                {{ getCategoryLabel(form.category) }}
              </el-tag>
              <span class="update-time">{{ form.updateTime }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧权限配置区 -->
      <div class="right-panel">
        <template v-if="selectedForm">
          <!-- Tab栏 -->
          <el-tabs v-model="activeTab" class="permission-tabs">
            <!-- Tab1: 角色权限 -->
            <el-tab-pane label="角色权限" name="role">
              <div class="tab-content">
                <div class="tab-toolbar">
                  <el-select v-model="selectedRole" placeholder="选择角色" style="width: 200px" @change="loadRolePermissions">
                    <el-option label="全部角色" value="all" />
                    <el-option label="申请人" value="applicant" />
                    <el-option label="部门经理" value="dept_manager" />
                    <el-option label="HR经理" value="hr_manager" />
                    <el-option label="财务经理" value="finance_manager" />
                    <el-option label="系统管理员" value="admin" />
                  </el-select>
                  <div class="toolbar-actions">
                    <el-button size="small" @click="handleBatchSetRole">批量设置</el-button>
                    <el-button size="small" type="primary" @click="handleCopyRolePermission">复制权限</el-button>
                  </div>
                </div>

                <!-- 权限矩阵表 -->
                <el-table :data="rolePermissionMatrix" border stripe style="width: 100%">
                  <el-table-column prop="fieldName" label="字段名称" min-width="150" fixed />
                  <el-table-column prop="fieldType" label="字段类型" width="120" align="center" />
                  <el-table-column label="可见" width="80" align="center">
                    <template #default="{ row }">
                      <el-radio-group v-model="row.permission" @change="handlePermissionChange(row)">
                        <el-radio label="visible">可见</el-radio>
                      </el-radio-group>
                    </template>
                  </el-table-column>
                  <el-table-column label="可编辑" width="100" align="center">
                    <template #default="{ row }">
                      <el-radio-group v-model="row.permission" @change="handlePermissionChange(row)">
                        <el-radio label="editable" :disabled="row.isSystemField">可编辑</el-radio>
                      </el-radio-group>
                    </template>
                  </el-table-column>
                  <el-table-column label="只读" width="80" align="center">
                    <template #default="{ row }">
                      <el-radio-group v-model="row.permission" @change="handlePermissionChange(row)">
                        <el-radio label="readonly">只读</el-radio>
                      </el-radio-group>
                    </template>
                  </el-table-column>
                  <el-table-column label="隐藏" width="80" align="center">
                    <template #default="{ row }">
                      <el-radio-group v-model="row.permission" @change="handlePermissionChange(row)">
                        <el-radio label="hidden">隐藏</el-radio>
                      </el-radio-group>
                    </template>
                  </el-table-column>
                </el-table>

                <div class="tab-footer">
                  <el-button @click="handleResetRolePermission">重置</el-button>
                  <el-button type="primary" @click="handleSaveRolePermission">保存权限</el-button>
                </div>
              </div>
            </el-tab-pane>

            <!-- Tab2: 节点权限 -->
            <el-tab-pane label="节点权限" name="node">
              <div class="tab-content">
                <div class="tab-toolbar">
                  <el-select v-model="selectedFlow" placeholder="选择流程" style="width: 200px" @change="loadFlowNodes">
                    <el-option label="请假审批流程" value="leave_flow" />
                    <el-option label="费用报销流程" value="expense_flow" />
                  </el-select>
                  <el-select v-model="selectedNode" placeholder="选择节点" style="width: 200px" @change="loadNodePermissions">
                    <el-option label="发起申请" value="start" />
                    <el-option label="部门审批" value="dept_approval" />
                    <el-option label="财务审批" value="finance_approval" />
                    <el-option label="总经理审批" value="gm_approval" />
                  </el-select>
                  <div class="toolbar-actions">
                    <el-button size="small" @click="handleInheritPrevNode">继承上一节点</el-button>
                    <el-button size="small" type="primary" @click="handleCopyNodePermission">复制权限</el-button>
                  </div>
                </div>

                <el-table :data="nodePermissionMatrix" border stripe style="width: 100%">
                  <el-table-column prop="fieldName" label="字段名称" min-width="150" fixed />
                  <el-table-column prop="fieldType" label="字段类型" width="120" align="center" />
                  <el-table-column label="可见" width="80" align="center">
                    <template #default="{ row }">
                      <el-radio-group v-model="row.permission" @change="handleNodePermissionChange(row)">
                        <el-radio label="visible">可见</el-radio>
                      </el-radio-group>
                    </template>
                  </el-table-column>
                  <el-table-column label="可编辑" width="100" align="center">
                    <template #default="{ row }">
                      <el-radio-group v-model="row.permission" @change="handleNodePermissionChange(row)">
                        <el-radio label="editable">可编辑</el-radio>
                      </el-radio-group>
                    </template>
                  </el-table-column>
                  <el-table-column label="只读" width="80" align="center">
                    <template #default="{ row }">
                      <el-radio-group v-model="row.permission" @change="handleNodePermissionChange(row)">
                        <el-radio label="readonly">只读</el-radio>
                      </el-radio-group>
                    </template>
                  </el-table-column>
                  <el-table-column label="隐藏" width="80" align="center">
                    <template #default="{ row }">
                      <el-radio-group v-model="row.permission" @change="handleNodePermissionChange(row)">
                        <el-radio label="hidden">隐藏</el-radio>
                      </el-radio-group>
                    </template>
                  </el-table-column>
                </el-table>

                <div class="tab-footer">
                  <el-button @click="handleResetNodePermission">重置</el-button>
                  <el-button type="primary" @click="handleSaveNodePermission">保存权限</el-button>
                </div>
              </div>
            </el-tab-pane>

            <!-- Tab3: 组织权限 -->
            <el-tab-pane label="组织权限" name="org">
              <div class="tab-content">
                <div class="tab-toolbar">
                  <el-tree-select
                      v-model="selectedOrg"
                      :data="orgTreeData"
                      placeholder="选择组织"
                      style="width: 250px"
                      @change="loadOrgPermissions"
                  />
                  <div class="toolbar-actions">
                    <el-button size="small" @click="handleBatchSetOrg">批量设置</el-button>
                  </div>
                </div>

                <el-table :data="orgPermissionMatrix" border stripe style="width: 100%">
                  <el-table-column prop="fieldName" label="字段名称" min-width="150" fixed />
                  <el-table-column prop="fieldType" label="字段类型" width="120" align="center" />
                  <el-table-column label="可见" width="80" align="center">
                    <template #default="{ row }">
                      <el-radio-group v-model="row.permission" @change="handleOrgPermissionChange(row)">
                        <el-radio label="visible">可见</el-radio>
                      </el-radio-group>
                    </template>
                  </el-table-column>
                  <el-table-column label="可编辑" width="100" align="center">
                    <template #default="{ row }">
                      <el-radio-group v-model="row.permission" @change="handleOrgPermissionChange(row)">
                        <el-radio label="editable">可编辑</el-radio>
                      </el-radio-group>
                    </template>
                  </el-table-column>
                  <el-table-column label="只读" width="80" align="center">
                    <template #default="{ row }">
                      <el-radio-group v-model="row.permission" @change="handleOrgPermissionChange(row)">
                        <el-radio label="readonly">只读</el-radio>
                      </el-radio-group>
                    </template>
                  </el-table-column>
                  <el-table-column label="隐藏" width="80" align="center">
                    <template #default="{ row }">
                      <el-radio-group v-model="row.permission" @change="handleOrgPermissionChange(row)">
                        <el-radio label="hidden">隐藏</el-radio>
                      </el-radio-group>
                    </template>
                  </el-table-column>
                  <el-table-column label="仅本组织可见" width="120" align="center">
                    <template #default="{ row }">
                      <el-switch
                          v-model="row.orgIsolation"
                          active-text="是"
                          inactive-text="否"
                          @change="handleOrgIsolationChange(row)"
                      />
                    </template>
                  </el-table-column>
                </el-table>

                <div class="tab-footer">
                  <el-button @click="handleResetOrgPermission">重置</el-button>
                  <el-button type="primary" @click="handleSaveOrgPermission">保存权限</el-button>
                </div>
              </div>
            </el-tab-pane>

            <!-- Tab4: 权限审计 -->
            <el-tab-pane label="权限审计" name="audit">
              <div class="tab-content">
                <div class="audit-toolbar">
                  <el-form :model="auditSearchForm" inline>
                    <el-form-item label="操作人">
                      <el-input v-model="auditSearchForm.operator" placeholder="请输入" clearable style="width: 150px" />
                    </el-form-item>
                    <el-form-item label="操作时间">
                      <el-date-picker
                          v-model="auditSearchForm.dateRange"
                          type="daterange"
                          range-separator="至"
                          start-placeholder="开始日期"
                          end-placeholder="结束日期"
                          style="width: 240px"
                      />
                    </el-form-item>
                    <el-form-item label="操作类型">
                      <el-select v-model="auditSearchForm.operationType" placeholder="请选择" clearable style="width: 150px">
                        <el-option label="新增权限" value="add" />
                        <el-option label="修改权限" value="modify" />
                        <el-option label="删除权限" value="delete" />
                        <el-option label="批量复制" value="batch_copy" />
                      </el-select>
                    </el-form-item>
                    <el-form-item>
                      <el-button type="primary" size="small" @click="handleAuditSearch">查询</el-button>
                      <el-button size="small" @click="handleAuditReset">重置</el-button>
                      <el-button size="small" type="success" @click="handleExportAuditLog">导出日志</el-button>
                    </el-form-item>
                  </el-form>
                </div>

                <el-table :data="auditLogList" border stripe style="width: 100%">
                  <el-table-column prop="operator" label="操作人" width="120" align="center" />
                  <el-table-column prop="operateTime" label="操作时间" width="180" align="center" />
                  <el-table-column prop="operationType" label="操作类型" width="120" align="center">
                    <template #default="{ row }">
                      <el-tag :type="getOperationTypeTag(row.operationType)" size="small">
                        {{ getOperationTypeLabel(row.operationType) }}
                      </el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column prop="formName" label="表单名称" min-width="150" show-overflow-tooltip />
                  <el-table-column prop="targetInfo" label="角色/节点" width="150" />
                  <el-table-column prop="operationDetail" label="操作内容明细" min-width="250" show-overflow-tooltip />
                </el-table>

                <div class="pagination-wrapper">
                  <el-pagination
                      v-model:current-page="auditPagination.currentPage"
                      v-model:page-size="auditPagination.pageSize"
                      :page-sizes="[10, 20, 50]"
                      :total="auditLogList.length"
                      layout="total, sizes, prev, pager, next"
                  />
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </template>

        <!-- 空状态 -->
        <el-empty v-else description="请从左侧选择要配置权限的表单" :image-size="120" />
      </div>
    </div>

    <!-- 批量设置弹窗 -->
    <el-dialog v-model="batchSetDialog.visible" :title="batchSetDialog.title" width="500px" append-to-body>
      <el-form :model="batchSetForm" label-width="100px">
        <el-form-item label="权限设置">
          <el-radio-group v-model="batchSetForm.permission">
            <el-radio label="visible">可见</el-radio>
            <el-radio label="editable">可编辑</el-radio>
            <el-radio label="readonly">只读</el-radio>
            <el-radio label="hidden">隐藏</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="batchSetDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="confirmBatchSet">确认设置</el-button>
      </template>
    </el-dialog>

    <!-- 权限测试弹窗 -->
    <el-dialog v-model="testDialog.visible" title="权限测试" width="700px" append-to-body>
      <el-form :model="testForm" label-width="100px">
        <el-form-item label="测试角色">
          <el-select v-model="testForm.role" placeholder="选择角色" style="width: 100%">
            <el-option label="申请人" value="applicant" />
            <el-option label="部门经理" value="dept_manager" />
            <el-option label="财务经理" value="finance_manager" />
          </el-select>
        </el-form-item>
        <el-form-item label="测试节点">
          <el-select v-model="testForm.node" placeholder="选择节点" style="width: 100%">
            <el-option label="发起申请" value="start" />
            <el-option label="部门审批" value="dept_approval" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="testDialog.visible = false">关闭</el-button>
        <el-button type="primary" @click="handleRunTest">开始测试</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Download, View } from '@element-plus/icons-vue'

// 搜索表单
const searchForm = ref({
  formName: '',
  category: '',
  permissionStatus: ''
})

// 选中的表单
const selectedForm = ref(null)

// 当前Tab
const activeTab = ref('role')

// 角色权限
const selectedRole = ref('')
const rolePermissionMatrix = ref([])

// 节点权限
const selectedFlow = ref('')
const selectedNode = ref('')
const nodePermissionMatrix = ref([])

// 组织权限
const selectedOrg = ref('')
const orgPermissionMatrix = ref([])

// 组织树数据
const orgTreeData = ref([
  {
    label: '总公司',
    value: 'headquarters',
    children: [
      { label: '技术部', value: 'tech_dept' },
      { label: '财务部', value: 'finance_dept' },
      { label: '人事部', value: 'hr_dept' }
    ]
  },
  {
    label: '北京分公司',
    value: 'beijing_branch',
    children: [
      { label: '北京技术部', value: 'bj_tech' },
      { label: '北京财务部', value: 'bj_finance' }
    ]
  }
])

// 审计日志
const auditSearchForm = ref({
  operator: '',
  dateRange: [],
  operationType: ''
})

const auditPagination = ref({
  currentPage: 1,
  pageSize: 10
})

// 批量设置弹窗
const batchSetDialog = ref({
  visible: false,
  title: '批量设置权限',
  type: 'role'
})

const batchSetForm = ref({
  permission: 'visible'
})

// 权限测试弹窗
const testDialog = ref({
  visible: false
})

const testForm = ref({
  role: '',
  node: ''
})

// 表单列表数据
const formList = ref([
  {
    id: 1,
    formName: '请假申请标准模板',
    category: 'hr',
    permissionStatus: 'configured',
    updateTime: '2024-01-10 09:00:00'
  },
  {
    id: 2,
    formName: '费用报销标准模板',
    category: 'finance',
    permissionStatus: 'configured',
    updateTime: '2024-02-01 10:00:00'
  },
  {
    id: 3,
    formName: '会议申请标准模板',
    category: 'admin',
    permissionStatus: 'unconfigured',
    updateTime: '2024-03-01 11:00:00'
  },
  {
    id: 4,
    formName: '采购申请标准模板',
    category: 'finance',
    permissionStatus: 'configured',
    updateTime: '2024-03-15 14:30:00'
  }
])

// 权限配置数据
const rolePermissionData = ref({
  applicant: [
    { fieldName: '申请人', fieldCode: 'applicant', fieldType: '系统变量', permission: 'visible', isSystemField: true },
    { fieldName: '申请部门', fieldCode: 'dept', fieldType: '系统变量', permission: 'visible', isSystemField: true },
    { fieldName: '请假类型', fieldCode: 'leave_type', fieldType: '下拉选择', permission: 'editable', isSystemField: false },
    { fieldName: '请假天数', fieldCode: 'leave_days', fieldType: '数字输入', permission: 'editable', isSystemField: false },
    { fieldName: '开始时间', fieldCode: 'start_time', fieldType: '日期选择', permission: 'editable', isSystemField: false },
    { fieldName: '结束时间', fieldCode: 'end_time', fieldType: '日期选择', permission: 'editable', isSystemField: false },
    { fieldName: '请假事由', fieldCode: 'reason', fieldType: '多行文本', permission: 'editable', isSystemField: false },
    { fieldName: '审批意见', fieldCode: 'approval_comment', fieldType: '多行文本', permission: 'hidden', isSystemField: false }
  ],
  dept_manager: [
    { fieldName: '申请人', fieldCode: 'applicant', fieldType: '系统变量', permission: 'visible', isSystemField: true },
    { fieldName: '申请部门', fieldCode: 'dept', fieldType: '系统变量', permission: 'visible', isSystemField: true },
    { fieldName: '请假类型', fieldCode: 'leave_type', fieldType: '下拉选择', permission: 'readonly', isSystemField: false },
    { fieldName: '请假天数', fieldCode: 'leave_days', fieldType: '数字输入', permission: 'readonly', isSystemField: false },
    { fieldName: '开始时间', fieldCode: 'start_time', fieldType: '日期选择', permission: 'readonly', isSystemField: false },
    { fieldName: '结束时间', fieldCode: 'end_time', fieldType: '日期选择', permission: 'readonly', isSystemField: false },
    { fieldName: '请假事由', fieldCode: 'reason', fieldType: '多行文本', permission: 'readonly', isSystemField: false },
    { fieldName: '审批意见', fieldCode: 'approval_comment', fieldType: '多行文本', permission: 'editable', isSystemField: false }
  ]
})

// 节点权限数据
const nodePermissionData = ref({
  start: [
    { fieldName: '申请人', fieldCode: 'applicant', fieldType: '系统变量', permission: 'visible', isSystemField: true },
    { fieldName: '请假类型', fieldCode: 'leave_type', fieldType: '下拉选择', permission: 'editable', isSystemField: false },
    { fieldName: '请假天数', fieldCode: 'leave_days', fieldType: '数字输入', permission: 'editable', isSystemField: false },
    { fieldName: '审批意见', fieldCode: 'approval_comment', fieldType: '多行文本', permission: 'hidden', isSystemField: false }
  ],
  dept_approval: [
    { fieldName: '申请人', fieldCode: 'applicant', fieldType: '系统变量', permission: 'visible', isSystemField: true },
    { fieldName: '请假类型', fieldCode: 'leave_type', fieldType: '下拉选择', permission: 'readonly', isSystemField: false },
    { fieldName: '请假天数', fieldCode: 'leave_days', fieldType: '数字输入', permission: 'readonly', isSystemField: false },
    { fieldName: '审批意见', fieldCode: 'approval_comment', fieldType: '多行文本', permission: 'editable', isSystemField: false }
  ]
})

// 组织权限数据
const orgPermissionData = ref({
  tech_dept: [
    { fieldName: '申请人', fieldCode: 'applicant', fieldType: '系统变量', permission: 'visible', isSystemField: true, orgIsolation: false },
    { fieldName: '请假类型', fieldCode: 'leave_type', fieldType: '下拉选择', permission: 'visible', isSystemField: false, orgIsolation: true },
    { fieldName: '审批意见', fieldCode: 'approval_comment', fieldType: '多行文本', permission: 'hidden', isSystemField: false, orgIsolation: false }
  ]
})

// 审计日志数据
const auditLogList = ref([
  {
    id: 1,
    operator: '系统管理员',
    operateTime: '2024-01-10 09:30:00',
    operationType: 'modify',
    formName: '请假申请标准模板',
    targetInfo: '部门经理',
    operationDetail: '请假天数：可编辑→只读；审批意见：隐藏→可编辑'
  },
  {
    id: 2,
    operator: '财务管理员',
    operateTime: '2024-01-11 14:20:00',
    operationType: 'add',
    formName: '费用报销标准模板',
    targetInfo: '财务审批节点',
    operationDetail: '金额列：新增可编辑权限'
  },
  {
    id: 3,
    operator: '系统管理员',
    operateTime: '2024-01-12 10:15:00',
    operationType: 'batch_copy',
    formName: '请假申请标准模板',
    targetInfo: '部门经理→HR经理',
    operationDetail: '批量复制角色权限配置'
  }
])

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

  if (searchForm.value.permissionStatus) {
    result = result.filter(f => f.permissionStatus === searchForm.value.permissionStatus)
  }

  return result
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

// 获取操作类型标签
const getOperationTypeTag = (type) => {
  const tagMap = {
    add: 'success',
    modify: 'warning',
    delete: 'danger',
    batch_copy: 'info'
  }
  return tagMap[type] || ''
}

// 获取操作类型文本
const getOperationTypeLabel = (type) => {
  const labelMap = {
    add: '新增权限',
    modify: '修改权限',
    delete: '删除权限',
    batch_copy: '批量复制'
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
    permissionStatus: ''
  }
  ElMessage.success('已重置查询条件')
}

// 选择表单
const handleSelectForm = (form) => {
  selectedForm.value = form
  ElMessage.success(`已加载表单：${form.formName}`)
}

// 加载角色权限
const loadRolePermissions = () => {
  if (selectedRole.value === 'all') {
    ElMessage.info('请选择具体角色')
    return
  }

  const roleData = rolePermissionData.value[selectedRole.value]
  if (roleData) {
    rolePermissionMatrix.value = JSON.parse(JSON.stringify(roleData))
    ElMessage.success(`已加载角色权限配置`)
  } else {
    rolePermissionMatrix.value = []
    ElMessage.warning('该角色暂无权限配置')
  }
}

// 加载流程节点
const loadFlowNodes = () => {
  ElMessage.success('已加载流程节点')
}

// 加载节点权限
const loadNodePermissions = () => {
  const nodeData = nodePermissionData.value[selectedNode.value]
  if (nodeData) {
    nodePermissionMatrix.value = JSON.parse(JSON.stringify(nodeData))
    ElMessage.success('已加载节点权限配置')
  } else {
    nodePermissionMatrix.value = []
  }
}

// 加载组织权限
const loadOrgPermissions = () => {
  const orgData = orgPermissionData.value[selectedOrg.value]
  if (orgData) {
    orgPermissionMatrix.value = JSON.parse(JSON.stringify(orgData))
    ElMessage.success('已加载组织权限配置')
  } else {
    orgPermissionMatrix.value = []
  }
}

// 权限变更
const handlePermissionChange = (row) => {
  console.log('权限变更:', row)
}

const handleNodePermissionChange = (row) => {
  console.log('节点权限变更:', row)
}

const handleOrgPermissionChange = (row) => {
  console.log('组织权限变更:', row)
}

const handleOrgIsolationChange = (row) => {
  console.log('数据隔离变更:', row)
}

// 保存角色权限
const handleSaveRolePermission = () => {
  ElMessageBox.confirm('确认保存当前角色权限配置？', '保存确认', {
    confirmButtonText: '确认保存',
    cancelButtonText: '取消',
    type: 'info'
  }).then(() => {
    // 添加到审计日志
    auditLogList.value.unshift({
      id: Date.now(),
      operator: '当前用户',
      operateTime: new Date().toLocaleString(),
      operationType: 'modify',
      formName: selectedForm.value?.formName,
      targetInfo: selectedRole.value,
      operationDetail: '修改角色权限配置'
    })

    ElMessage.success('权限保存成功')
  }).catch(() => {})
}

// 保存节点权限
const handleSaveNodePermission = () => {
  ElMessage.success('节点权限保存成功')
}

// 保存组织权限
const handleSaveOrgPermission = () => {
  ElMessage.success('组织权限保存成功')
}

// 重置权限
const handleResetRolePermission = () => {
  loadRolePermissions()
  ElMessage.success('已重置权限配置')
}

const handleResetNodePermission = () => {
  loadNodePermissions()
  ElMessage.success('已重置节点权限')
}

const handleResetOrgPermission = () => {
  loadOrgPermissions()
  ElMessage.success('已重置组织权限')
}

// 批量设置
const handleBatchSetRole = () => {
  batchSetDialog.value.title = '批量设置角色权限'
  batchSetDialog.value.type = 'role'
  batchSetDialog.value.visible = true
}

const handleBatchSetOrg = () => {
  batchSetDialog.value.title = '批量设置组织权限'
  batchSetDialog.value.type = 'org'
  batchSetDialog.value.visible = true
}

// 确认批量设置
const confirmBatchSet = () => {
  const permission = batchSetForm.value.permission

  if (batchSetDialog.value.type === 'role') {
    rolePermissionMatrix.value.forEach(row => {
      if (!row.isSystemField) {
        row.permission = permission
      }
    })
  } else if (batchSetDialog.value.type === 'org') {
    orgPermissionMatrix.value.forEach(row => {
      if (!row.isSystemField) {
        row.permission = permission
      }
    })
  }

  batchSetDialog.value.visible = false
  ElMessage.success('批量设置成功')
}

// 复制权限
const handleCopyRolePermission = () => {
  ElMessage.info('复制权限功能开发中...')
}

const handleCopyNodePermission = () => {
  ElMessage.info('复制节点权限功能开发中...')
}

// 继承上一节点权限
const handleInheritPrevNode = () => {
  ElMessage.success('已继承上一节点权限')
}

// 批量导出权限
const handleBatchExport = () => {
  if (!selectedForm.value) {
    ElMessage.warning('请先选择要导出权限的表单')
    return
  }

  const exportData = {
    formName: selectedForm.value.formName,
    rolePermissions: rolePermissionData.value,
    nodePermissions: nodePermissionData.value,
    orgPermissions: orgPermissionData.value,
    exportTime: new Date().toLocaleString()
  }

  const jsonStr = JSON.stringify(exportData, null, 2)
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${selectedForm.value.formName}_权限配置.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)

  ElMessage.success('权限配置导出成功')
}

// 权限测试
const handlePermissionTest = () => {
  testDialog.value.visible = true
}

const handleRunTest = () => {
  ElMessage.success('权限测试通过，配置生效')
  testDialog.value.visible = false
}

// 审计日志查询
const handleAuditSearch = () => {
  ElMessage.success('查询完成')
}

const handleAuditReset = () => {
  auditSearchForm.value = {
    operator: '',
    dateRange: [],
    operationType: ''
  }
  ElMessage.success('已重置查询条件')
}

const handleExportAuditLog = () => {
  ElMessage.success('审计日志导出成功')
}
</script>

<style scoped lang="scss">
.form-permission {
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

            .update-time {
              font-size: 11px;
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

      .permission-tabs {
        flex: 1;
        display: flex;
        flex-direction: column;

        :deep(.el-tabs__content) {
          flex: 1;
          overflow: hidden;
        }

        :deep(.el-tab-pane) {
          height: 100%;
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

          .toolbar-actions {
            display: flex;
            gap: 8px;
          }
        }

        :deep(.el-table) {
          flex: 1;

          .el-table__body-wrapper {
            overflow-y: auto;
          }
        }

        .tab-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid #e4e7ed;
        }
      }

      .audit-toolbar {
        margin-bottom: 16px;
        padding: 16px;
        background: #f5f7fa;
        border-radius: 6px;

        :deep(.el-form-item) {
          margin-bottom: 0;
          margin-right: 12px;
        }
      }

      .pagination-wrapper {
        display: flex;
        justify-content: flex-end;
        margin-top: 16px;
        padding-top: 16px;
        border-top: 1px solid #e4e7ed;
      }
    }
  }
}
</style>
