<template>
  <div class="global-process-params">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>流程参数管理</h2>
      <p class="subtitle">配置流程运行时的系统参数（全局生效，修改需谨慎）</p>
    </div>

    <!-- 筛选与操作栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <el-input
            v-model="searchKeyword"
            placeholder="搜索参数名称/说明"
            clearable
            style="width: 280px"
            @keyup.enter="handleSearch"
        >
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>
        <el-button type="primary" icon="Search" @click="handleSearch">查询</el-button>
        <el-button icon="Refresh" @click="handleReset">重置</el-button>
      </div>
      <div class="toolbar-right" v-if="isAdmin">
        <el-button type="primary" icon="Plus" @click="handleAddParam">新增参数</el-button>
        <el-button type="success" icon="Download" @click="handleExportParams">导出参数</el-button>
        <el-button type="danger" plain icon="RefreshLeft" class="danger-btn" @click="handleRestoreDefaults">
          ⚠️ 恢复默认配置
        </el-button>
      </div>
    </div>

    <!-- 批量操作栏（仅选中参数时显示） -->
    <div v-if="selectedParams.length > 0 && isAdmin" class="batch-toolbar">
      <span class="batch-info">已选择 {{ selectedParams.length }} 项</span>
      <el-button size="small" type="info" icon="RefreshLeft" @click="handleBatchRestoreDefaults">批量恢复默认</el-button>
      <el-button size="small" type="success" icon="Download" @click="handleBatchExport">批量导出选中参数</el-button>
      <el-button size="small" :type="hasDisabledSelected ? 'success' : 'warning'" icon="Switch" @click="handleBatchToggleStatus">
        {{ hasDisabledSelected ? '批量启用' : '批量禁用' }}
      </el-button>
    </div>

    <!-- 统一表头 + 分组展示 -->
    <div class="params-table-container">
      <!-- 统一表头（仅1次） -->
      <div class="unified-header">
        <el-checkbox
            v-if="isAdmin"
            v-model="selectAll"
            @change="handleSelectAll"
            style="width: 50px"
        />
        <div class="header-cell" style="flex: 2">参数名</div>
        <div class="header-cell" style="flex: 1.5">参数值</div>
        <div class="header-cell" style="flex: 1">默认值</div>
        <div class="header-cell" style="flex: 3">参数说明</div>
        <div class="header-cell" style="width: 80px">状态</div>
        <div class="header-cell" style="width: 180px">操作</div>
      </div>

      <!-- 分组折叠区 -->
      <el-collapse v-model="activeGroups" class="param-groups">
        <el-collapse-item
            v-for="(group, category) in groupedParams"
            :key="category"
            :name="category"
        >
          <template #title>
            <div class="group-title" :style="{ borderLeftColor: getCategoryColor(category) }">
              <el-tag :type="getCategoryTag(category)" size="default">
                {{ getCategoryText(category) }}
              </el-tag>
              <span class="group-count">({{ group.length }} 个参数)</span>
            </div>
          </template>

          <!-- 参数行列表 -->
          <div class="param-rows">
            <div
                v-for="row in group"
                :key="row.id"
                class="param-row"
                :class="{ 'modified-row': row.currentValue !== row.defaultValue }"
            >
              <el-checkbox
                  v-if="isAdmin"
                  v-model="row.selected"
                  @change="handleRowSelect"
                  style="width: 50px"
              />

              <div class="param-cell" style="flex: 2">
                <span class="param-name" @click="toggleParamDetail(row)">{{ row.paramName }}</span>
                <div v-if="isAdmin" class="param-code-small" @click="copyParamCode(row.paramCode)">
                  {{ row.paramCode }}
                  <el-icon :size="12"><CopyDocument /></el-icon>
                </div>
              </div>

              <div class="param-cell" style="flex: 1.5">
                <div class="param-value-wrapper">
                  <el-tag
                      v-if="row.paramType === 'boolean'"
                      :type="row.currentValue === 'true' ? 'success' : 'info'"
                      size="small"
                  >
                    {{ row.currentValue === 'true' ? '开启' : '关闭' }}
                  </el-tag>
                  <span v-else class="value-text">{{ row.currentValue }}</span>

                  <!-- 已修改提示（独立标签） -->
                  <el-tooltip
                      v-if="row.currentValue !== row.defaultValue"
                      :content="`默认值：${row.defaultValue}`"
                      placement="top"
                  >
                    <el-tag type="warning" size="small" class="modified-tag">
                      <el-icon><WarningFilled /></el-icon>
                      已修改
                    </el-tag>
                  </el-tooltip>
                </div>
              </div>

              <div class="param-cell" style="flex: 1">
                <span class="default-value">{{ row.defaultValue }}</span>
              </div>

              <div class="param-cell" style="flex: 3">
                <el-tooltip :content="row.fullDescription || row.description" placement="top">
                  <span class="description-text">{{ row.description }}</span>
                </el-tooltip>
              </div>

              <div class="param-cell" style="width: 80px">
                <el-tooltip
                    :content="row.status === 'enabled' ? '启用：使用当前值' : '禁用：使用默认值'"
                    placement="top"
                >
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
                </el-tooltip>
              </div>

              <div class="param-cell action-cell" style="width: 180px">
                <el-button
                    v-if="isAdmin"
                    size="small"
                    type="primary"
                    link
                    icon="Edit"
                    @click="handleEditParam(row)"
                >
                  编辑
                </el-button>
                <el-button
                    v-if="isAdmin && !row.isSystemBuiltIn"
                    size="small"
                    type="danger"
                    link
                    icon="Delete"
                    @click="handleDeleteParam(row)"
                >
                  删除
                </el-button>
                <el-button
                    size="small"
                    type="info"
                    link
                    icon="Clock"
                    @click="handleViewLogs(row)"
                >
                  查看日志
                </el-button>
              </div>
            </div>
          </div>
        </el-collapse-item>
      </el-collapse>

      <!-- 空状态 -->
      <el-empty v-if="totalParams === 0" description="暂无全局流程参数" :image-size="120">
        <template #description>
          <p class="empty-text">请点击上方「新增参数」按钮创建</p>
        </template>
        <el-button v-if="isAdmin" type="primary" icon="Plus" @click="handleAddParam">新增参数</el-button>
      </el-empty>
    </div>

    <!-- 页脚统计（删除分页） -->
    <div class="footer-stats">
      <span>共 {{ totalParams }} 条参数</span>
      <span class="divider">|</span>
      <span class="modified-count">其中 {{ modifiedCount }} 条已修改</span>
      <span class="divider">|</span>
      <span>最后修改时间：{{ lastModifyTime }}</span>
    </div>

    <!-- 新增/编辑参数弹窗 -->
    <el-dialog
        v-model="paramDialogVisible"
        :title="dialogTitle"
        width="700px"
        :close-on-click-modal="false"
    >
      <el-form :model="paramForm" :rules="paramRules" ref="paramFormRef" label-width="130px">
        <el-form-item label="参数名称" prop="paramName">
          <el-input v-model="paramForm.paramName" placeholder="请输入参数名称" />
        </el-form-item>

        <el-form-item label="参数编码" prop="paramCode">
          <el-input
              v-model="paramForm.paramCode"
              placeholder="仅新增时可填，如：max_approve_days"
              :disabled="!!paramForm.id"
          />
          <div class="form-tip">仅允许字母、数字、下划线，系统唯一标识</div>
        </el-form-item>

        <el-form-item label="参数分类" prop="category">
          <el-select v-model="paramForm.category" placeholder="请选择参数分类" style="width: 100%">
            <el-option label="审批参数" value="approval" />
            <el-option label="超时参数" value="timeout" />
            <el-option label="通知参数" value="notification" />
            <el-option label="安全参数" value="security" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>

        <el-form-item label="参数类型" prop="paramType">
          <el-select
              v-model="paramForm.paramType"
              placeholder="请选择参数类型"
              style="width: 100%"
              :disabled="!!paramForm.id && paramForm.isSystemBuiltIn"
              @change="handleParamTypeChange"
          >
            <el-option label="布尔值" value="boolean" />
            <el-option label="数字" value="number" />
            <el-option label="文本" value="text" />
            <el-option label="枚举" value="enum" />
          </el-select>
        </el-form-item>

        <!-- 动态输入组件 -->
        <el-form-item label="参数默认值" prop="defaultValue">
          <el-switch
              v-if="paramForm.paramType === 'boolean'"
              v-model="paramForm.defaultValue"
              active-value="true"
              inactive-value="false"
          />
          <el-input-number
              v-else-if="paramForm.paramType === 'number'"
              v-model="paramForm.defaultValue"
              :min="getParamMinValue()"
              style="width: 100%"
          />
          <el-input
              v-else-if="paramForm.paramType === 'text'"
              v-model="paramForm.defaultValue"
              type="textarea"
              :rows="2"
          />
          <el-select
              v-else-if="paramForm.paramType === 'enum'"
              v-model="paramForm.defaultValue"
              placeholder="请选择枚举值"
              style="width: 100%"
          >
            <el-option label="邮件" value="email" />
            <el-option label="短信" value="sms" />
            <el-option label="钉钉" value="dingtalk" />
            <el-option label="企业微信" value="wecom" />
          </el-select>
        </el-form-item>

        <el-form-item label="参数当前值" prop="currentValue">
          <el-switch
              v-if="paramForm.paramType === 'boolean'"
              v-model="paramForm.currentValue"
              active-value="true"
              inactive-value="false"
          />
          <el-input-number
              v-else-if="paramForm.paramType === 'number'"
              v-model="paramForm.currentValue"
              :min="getParamMinValue()"
              style="width: 100%"
          />
          <el-input
              v-else-if="paramForm.paramType === 'text'"
              v-model="paramForm.currentValue"
              type="textarea"
              :rows="2"
          />
          <el-select
              v-else-if="paramForm.paramType === 'enum'"
              v-model="paramForm.currentValue"
              placeholder="请选择枚举值"
              style="width: 100%"
          >
            <el-option label="邮件" value="email" />
            <el-option label="短信" value="sms" />
            <el-option label="钉钉" value="dingtalk" />
            <el-option label="企业微信" value="wecom" />
          </el-select>
        </el-form-item>

        <el-form-item label="参数说明" prop="description">
          <el-input
              v-model="paramForm.description"
              type="textarea"
              :rows="3"
              placeholder="请输入参数功能说明"
          />
        </el-form-item>

        <el-divider content-position="left">高级配置（可选）</el-divider>

        <el-form-item label="允许流程级覆盖">
          <el-switch v-model="paramForm.allowProcessOverride" />
          <div class="form-tip">勾选后，单个流程可单独配置该参数，覆盖全局设置</div>
        </el-form-item>

        <el-form-item label="启用参数">
          <el-switch v-model="paramForm.status" active-value="enabled" inactive-value="disabled" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="paramDialogVisible = false">取消</el-button>
        <el-button type="warning" plain @click="handleTestParam">测试参数</el-button>
        <el-button type="primary" @click="handleSubmitParam" :loading="saving">保存</el-button>
      </template>
    </el-dialog>

    <!-- 操作日志弹窗 -->
    <el-dialog v-model="logsVisible" title="参数操作日志" width="900px" :close-on-click-modal="false">
      <div class="logs-filter">
        <el-date-picker
            v-model="logDateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 240px"
        />
        <el-input
            v-model="logOperatorFilter"
            placeholder="操作人"
            clearable
            style="width: 150px; margin-left: 12px"
        />
        <el-button type="primary" icon="Search" @click="handleLogSearch">查询</el-button>
        <el-button icon="Download" @click="handleExportLogs">导出日志</el-button>
      </div>

      <el-table :data="operationLogs" border style="width: 100%; margin-top: 12px">
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
        <el-table-column prop="ipAddress" label="IP地址" width="140" />
      </el-table>

      <template #footer>
        <el-button @click="logsVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 恢复默认确认弹窗 -->
    <el-dialog v-model="restoreConfirmVisible" title="⚠️ 高危操作确认" width="600px" :close-on-click-modal="false">
      <el-alert
          title="确定将所有全局流程参数恢复为系统默认值吗？此操作将覆盖所有自定义配置，且不可撤销！"
          type="error"
          show-icon
          :closable="false"
      />
      <div class="restore-confirm-content">
        <p>恢复后将影响以下参数：</p>
        <ul>
          <li>最大审批天数：恢复为 30 天</li>
          <li>会话超时时间：恢复为 30 分钟</li>
          <li>通知渠道：恢复为 邮件+系统</li>
          <li>...</li>
        </ul>
        <el-input
            v-model="restoreConfirmText"
            placeholder="请输入「确认恢复」以继续"
            style="margin-top: 16px"
        />
      </div>
      <template #footer>
        <el-button @click="restoreConfirmVisible = false">取消</el-button>
        <el-button
            type="danger"
            :disabled="restoreConfirmText !== '确认恢复'"
            @click="confirmRestoreDefaults"
        >
          确认恢复
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search, Refresh, Plus, Download, RefreshLeft, Switch,
  CopyDocument, Edit, Delete, Clock, WarningFilled
} from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

// 权限判断
const isAdmin = computed(() => userStore.isAdmin)

// 筛选条件
const searchKeyword = ref('')
const loading = ref(false)
const saving = ref(false)

// 全选
const selectAll = ref(false)

// 选中参数
const selectedParams = ref([])

// 分组折叠
const activeGroups = ref(['approval', 'timeout', 'notification', 'security', 'other'])

// 展开的参数详情
const expandedParamId = ref(null)

// 参数列表数据
const paramList = ref([
  {
    id: 1,
    paramName: '最大审批天数',
    paramCode: 'max_approve_days',
    category: 'approval',
    paramType: 'number',
    defaultValue: 30,
    currentValue: 45,
    description: '流程中单个节点的最大审批时长限制',
    fullDescription: '当审批节点超过此时长未处理，将触发超时动作（提醒/转交/自动通过/自动驳回）。建议设置为15-30天。',
    status: 'enabled',
    isSystemBuiltIn: true,
    allowProcessOverride: false,
    lastModifier: '系统管理员',
    lastModifyTime: '2024-04-01 10:30:00',
    selected: false
  },
  {
    id: 2,
    paramName: '会话超时时间',
    paramCode: 'session_timeout_minutes',
    category: 'security',
    paramType: 'number',
    defaultValue: 30,
    currentValue: 30,
    description: '用户登录后的会话保持时长',
    fullDescription: '超过此时长无操作，用户需重新登录。建议设置为15-60分钟，兼顾安全性和用户体验。',
    status: 'enabled',
    isSystemBuiltIn: true,
    allowProcessOverride: false,
    lastModifier: '-',
    lastModifyTime: '-',
    selected: false
  },
  {
    id: 3,
    paramName: '启用验证码',
    paramCode: 'enable_captcha',
    category: 'security',
    paramType: 'boolean',
    defaultValue: 'true',
    currentValue: 'true',
    description: '登录时是否启用图形验证码',
    fullDescription: '开启后可防止暴力破解密码，但会增加用户登录步骤。建议在公网环境开启。',
    status: 'enabled',
    isSystemBuiltIn: true,
    allowProcessOverride: false,
    lastModifier: '-',
    lastModifyTime: '-',
    selected: false
  },
  {
    id: 4,
    paramName: '通知渠道',
    paramCode: 'notification_channels',
    category: 'notification',
    paramType: 'enum',
    defaultValue: 'email',
    currentValue: 'email,sms',
    description: '流程通知的发送渠道',
    fullDescription: '支持邮件、短信、钉钉、企业微信等多种渠道。可多选，多个渠道同时发送。',
    status: 'enabled',
    isSystemBuiltIn: true,
    allowProcessOverride: true,
    lastModifier: '流程管理员',
    lastModifyTime: '2024-03-28 14:20:00',
    selected: false
  },
  {
    id: 5,
    paramName: '超时自动提醒',
    paramCode: 'auto_remind_on_timeout',
    category: 'timeout',
    paramType: 'boolean',
    defaultValue: 'true',
    currentValue: 'true',
    description: '节点超时时是否自动发送提醒通知',
    fullDescription: '开启后，当审批节点超过设定时长未处理，系统将自动向审批人发送提醒通知。',
    status: 'enabled',
    isSystemBuiltIn: true,
    allowProcessOverride: true,
    lastModifier: '-',
    lastModifyTime: '-',
    selected: false
  },
  {
    id: 6,
    paramName: '自定义业务参数',
    paramCode: 'custom_business_param',
    category: 'other',
    paramType: 'text',
    defaultValue: 'default_value',
    currentValue: 'custom_value',
    description: '用户自定义的业务相关参数',
    fullDescription: '用于存储特定业务场景下的配置参数，可根据实际需求灵活配置。',
    status: 'enabled',
    isSystemBuiltIn: false,
    allowProcessOverride: true,
    lastModifier: '业务管理员',
    lastModifyTime: '2024-04-05 09:15:00',
    selected: false
  }
])

// 对话框状态
const paramDialogVisible = ref(false)
const dialogTitle = ref('新增全局流程参数')
const paramFormRef = ref(null)
const paramForm = ref({
  id: null,
  paramName: '',
  paramCode: '',
  category: '',
  paramType: 'text',
  defaultValue: '',
  currentValue: '',
  description: '',
  allowProcessOverride: false,
  status: 'enabled',
  isSystemBuiltIn: false
})

// 表单验证规则
const paramRules = {
  paramName: [{ required: true, message: '请输入参数名称', trigger: 'blur' }],
  paramCode: [
    { required: true, message: '请输入参数编码', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: '仅允许字母、数字、下划线', trigger: 'blur' }
  ],
  category: [{ required: true, message: '请选择参数分类', trigger: 'change' }],
  paramType: [{ required: true, message: '请选择参数类型', trigger: 'change' }],
  defaultValue: [{ required: true, message: '请输入参数默认值', trigger: 'blur' }],
  currentValue: [{ required: true, message: '请输入参数当前值', trigger: 'blur' }]
}

// 日志弹窗
const logsVisible = ref(false)
const logDateRange = ref([])
const logOperatorFilter = ref('')
const operationLogs = ref([
  {
    operator: '系统管理员',
    operateTime: '2024-04-01 10:30:00',
    operateType: 'edit',
    beforeValue: '30',
    afterValue: '45',
    ipAddress: '192.168.1.100'
  },
  {
    operator: '流程管理员',
    operateTime: '2024-03-28 14:20:00',
    operateType: 'edit',
    beforeValue: 'email',
    afterValue: 'email,sms',
    ipAddress: '192.168.1.105'
  }
])

// 恢复默认确认
const restoreConfirmVisible = ref(false)
const restoreConfirmText = ref('')

// 分组后的参数列表
const groupedParams = computed(() => {
  let filtered = [...paramList.value]

  // 关键词筛选
  if (searchKeyword.value) {
    const kw = searchKeyword.value.toLowerCase()
    filtered = filtered.filter(p =>
        p.paramName.toLowerCase().includes(kw) ||
        p.description.toLowerCase().includes(kw) ||
        p.paramCode.toLowerCase().includes(kw)
    )
  }

  // 按分类分组
  const groups = {}
  filtered.forEach(param => {
    if (!groups[param.category]) {
      groups[param.category] = []
    }
    groups[param.category].push(param)
  })

  return groups
})

// 统计数据
const totalParams = computed(() => paramList.value.length)
const modifiedCount = computed(() => {
  return paramList.value.filter(p => p.currentValue !== p.defaultValue).length
})
const lastModifyTime = computed(() => {
  const validTimes = paramList.value
      .filter(p => p.lastModifyTime && p.lastModifyTime !== '-')
      .map(p => new Date(p.lastModifyTime).getTime())

  if (validTimes.length === 0) return '-'

  const maxTime = Math.max(...validTimes)
  return new Date(maxTime).toLocaleString('zh-CN')
})

// 是否有禁用的选中参数
const hasDisabledSelected = computed(() => {
  return paramList.value.some(p => p.selected && p.status === 'disabled')
})

// 展开的参数对象
const expandedParam = computed(() => {
  if (!expandedParamId.value) return null
  return paramList.value.find(p => p.id === expandedParamId.value)
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
  ElMessage.success('已重置查询条件')
}

// 全选/取消全选
const handleSelectAll = (val) => {
  paramList.value.forEach(p => p.selected = val)
}

// 单行选择
const handleRowSelect = () => {
  const allSelected = paramList.value.every(p => p.selected)
  selectAll.value = allSelected
}

// 新增参数
const handleAddParam = () => {
  dialogTitle.value = '新增全局流程参数'
  paramForm.value = {
    id: null,
    paramName: '',
    paramCode: '',
    category: '',
    paramType: 'text',
    defaultValue: '',
    currentValue: '',
    description: '',
    allowProcessOverride: false,
    status: 'enabled',
    isSystemBuiltIn: false
  }
  paramDialogVisible.value = true
}

// 编辑参数
const handleEditParam = (row) => {
  dialogTitle.value = row.isSystemBuiltIn ? '编辑系统内置参数' : '编辑全局流程参数'
  paramForm.value = { ...row }
  paramDialogVisible.value = true
}

// 删除参数
const handleDeleteParam = (row) => {
  ElMessageBox.confirm(
      `确定要删除参数「${row.paramName}」吗？此操作不可恢复！`,
      '删除确认',
      { confirmButtonText: '确认删除', cancelButtonText: '取消', type: 'warning' }
  ).then(() => {
    paramList.value = paramList.value.filter(p => p.id !== row.id)
    ElMessage.success('删除成功')
  }).catch(() => {})
}

// 参数类型变更
const handleParamTypeChange = () => {
  paramForm.value.defaultValue = ''
  paramForm.value.currentValue = ''
}

// 获取参数最小值
const getParamMinValue = () => {
  if (paramForm.value.paramCode === 'max_approve_days') return 1
  if (paramForm.value.paramCode === 'session_timeout_minutes') return 5
  return 0
}

// 测试参数
const handleTestParam = () => {
  if (paramForm.value.paramType === 'number') {
    const val = Number(paramForm.value.currentValue)
    if (val < getParamMinValue()) {
      ElMessage.error(`参数值不能小于 ${getParamMinValue()}`)
      return
    }
  }
  ElMessage.success(`参数测试通过，当前值：${paramForm.value.currentValue}`)
}

// 提交参数
const handleSubmitParam = () => {
  paramFormRef.value?.validate((valid) => {
    if (!valid) return

    saving.value = true
    setTimeout(() => {
      if (paramForm.value.id) {
        const index = paramList.value.findIndex(p => p.id === paramForm.value.id)
        if (index !== -1) {
          paramList.value[index] = {
            ...paramForm.value,
            lastModifier: userStore.currentUser?.name || '当前用户',
            lastModifyTime: new Date().toLocaleString('zh-CN')
          }
        }
        ElMessage.success('参数修改成功，全局实时生效')
      } else {
        paramList.value.unshift({
          ...paramForm.value,
          id: Date.now(),
          lastModifier: userStore.currentUser?.name || '当前用户',
          lastModifyTime: new Date().toLocaleString('zh-CN'),
          selected: false
        })
        ElMessage.success('参数新增成功，全局实时生效')
      }

      saving.value = false
      paramDialogVisible.value = false
    }, 500)
  })
}

// 状态变更
const handleStatusChange = (row) => {
  const action = row.status === 'enabled' ? '启用' : '禁用'
  ElMessageBox.confirm(
      `确定${action}参数「${row.paramName}」吗？${row.status === 'disabled' ? '禁用后将使用默认值' : ''}`,
      '状态确认',
      { confirmButtonText: '确定', cancelButtonText: '取消', type: 'info' }
  ).then(() => {
    ElMessage.success(`已${action}参数`)
  }).catch(() => {
    row.status = row.status === 'enabled' ? 'disabled' : 'enabled'
  })
}

// 查看日志
const handleViewLogs = (row) => {
  logsVisible.value = true
}

// 日志搜索
const handleLogSearch = () => {
  ElMessage.success('日志查询完成')
}

// 导出日志
const handleExportLogs = () => {
  ElMessage.success('日志导出成功')
}

// 复制参数编码
const copyParamCode = (code) => {
  navigator.clipboard.writeText(code).then(() => {
    ElMessage.success('参数编码已复制')
  })
}

// 切换参数详情
const toggleParamDetail = (row) => {
  expandedParamId.value = expandedParamId.value === row.id ? null : row.id
}

// 批量恢复默认
const handleBatchRestoreDefaults = () => {
  ElMessageBox.confirm(
      `确定将选中的 ${selectedParams.value.length} 个参数恢复为默认值吗？`,
      '批量恢复默认',
      { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
  ).then(() => {
    selectedParams.value.forEach(p => p.currentValue = p.defaultValue)
    ElMessage.success('已批量恢复默认值')
    paramList.value.forEach(p => p.selected = false)
    selectAll.value = false
  }).catch(() => {})
}

// 批量导出
const handleBatchExport = () => {
  ElMessage.success(`已导出 ${selectedParams.value.length} 个参数`)
  paramList.value.forEach(p => p.selected = false)
  selectAll.value = false
}

// 批量切换状态
const handleBatchToggleStatus = () => {
  const action = hasDisabledSelected.value ? '启用' : '禁用'
  ElMessageBox.confirm(
      `确定${action}选中的 ${selectedParams.value.length} 个参数吗？`,
      `批量${action}`,
      { confirmButtonText: '确定', cancelButtonText: '取消', type: 'info' }
  ).then(() => {
    selectedParams.value.forEach(p => p.status = hasDisabledSelected.value ? 'enabled' : 'disabled')
    ElMessage.success(`已批量${action}`)
    paramList.value.forEach(p => p.selected = false)
    selectAll.value = false
  }).catch(() => {})
}

// 导出参数
const handleExportParams = () => {
  ElMessage.success('参数导出成功，已下载 Excel 文件')
}

// 恢复默认配置
const handleRestoreDefaults = () => {
  restoreConfirmText.value = ''
  restoreConfirmVisible.value = true
}

const confirmRestoreDefaults = () => {
  paramList.value.forEach(p => p.currentValue = p.defaultValue)
  restoreConfirmVisible.value = false
  ElMessage.success('所有参数已恢复为默认值')
}

// 工具方法
const getCategoryTag = (category) => {
  const tags = { approval: 'success', timeout: 'warning', notification: 'primary', security: 'danger', other: 'info' }
  return tags[category] || 'info'
}

const getCategoryText = (category) => {
  const texts = { approval: '审批参数', timeout: '超时参数', notification: '通知参数', security: '安全参数', other: '其他' }
  return texts[category] || category
}

const getCategoryColor = (category) => {
  const colors = { approval: '#67C23A', timeout: '#E6A23C', notification: '#409EFF', security: '#F56C6C', other: '#909399' }
  return colors[category] || '#909399'
}

const getOperateTypeTag = (type) => {
  const tags = { add: 'success', edit: 'primary', delete: 'danger', restore: 'warning', enable: 'success', disable: 'info' }
  return tags[type] || 'info'
}

const getOperateTypeText = (type) => {
  const texts = { add: '新增', edit: '编辑', delete: '删除', restore: '恢复默认', enable: '启用', disable: '禁用' }
  return texts[type] || type
}
</script>

<style scoped lang="scss">
.global-process-params {
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

    .danger-btn {
      border-color: #F56C6C;
      color: #F56C6C;

      &:hover {
        background-color: #fef0f0;
        border-color: #f56c6c;
        color: #f56c6c;
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

  .params-table-container {
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

  .param-groups {
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

    .param-rows {
      padding: 0;
    }

    .param-row {
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

      &.modified-row {
        background-color: #fdf6ec;

        &:hover {
          background-color: #faecd8;
        }
      }
    }

    .param-cell {
      padding: 0 8px;
      font-size: 14px;
      color: #606266;

      .param-name {
        color: #409eff;
        cursor: pointer;
        font-weight: 500;

        &:hover {
          text-decoration: underline;
        }
      }

      .param-code-small {
        margin-top: 4px;
        font-size: 12px;
        color: #909399;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 4px;

        &:hover {
          color: #409eff;
        }
      }

      .param-value-wrapper {
        display: flex;
        align-items: center;
        gap: 8px;

        .value-text {
          font-weight: 500;
        }

        .modified-tag {
          margin-left: 0;
        }
      }

      .default-value {
        color: #909399;
        font-size: 13px;
      }

      .description-text {
        display: block;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: #606266;
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

    .modified-count {
      color: #E6A23C;
      font-weight: 500;
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

  .logs-filter {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .restore-confirm-content {
    margin-top: 16px;

    ul {
      margin: 12px 0;
      padding-left: 20px;
      color: #606266;

      li {
        margin: 4px 0;
      }
    }
  }
}
</style>
