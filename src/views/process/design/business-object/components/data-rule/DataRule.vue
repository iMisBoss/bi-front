<template>
  <div class="data-rule">
    <div class="tab-toolbar">
      <div class="toolbar-left">
        <el-button type="primary" size="default" icon="Plus" @click="handleAddRule">新增规则</el-button>
        <el-button size="default" icon="Select" @click="handleBatchAction">批量启用/禁用</el-button>
        <el-button v-if="!isVersionEdit" size="default" icon="Upload" @click="handleImport">导入规则</el-button>
        <el-button v-if="!isVersionEdit" size="default" icon="Download" @click="handleExport">导出规则</el-button>
      </div>
    </div>

    <el-table
        :data="ruleList"
        border
        style="width: 100%"
        max-height="400"
        @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="50" align="center" />
      <el-table-column prop="ruleName" label="规则名称" min-width="200" />
      <el-table-column prop="ruleType" label="规则类型" width="120">
        <template #default="{ row }">
          <el-tag size="small" :type="getRuleTypeTag(row.ruleType)">
            {{ getRuleTypeText(row.ruleType) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="targetField" label="绑定字段" min-width="200">
        <template #default="{ row }">
          <div class="field-tags">
            <el-tag v-for="field in getTargetFields(row.targetField)" :key="field" size="small">
              {{ field }}
            </el-tag>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="description" label="规则描述" min-width="200" show-overflow-tooltip />
      <el-table-column prop="status" label="状态" width="80" align="center">
        <template #default="{ row }">
          <el-tag size="small" :type="row.status === 'enabled' ? 'success' : 'info'">
            {{ row.status === 'enabled' ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="220" align="center">
        <template #default="{ row }">
          <div class="action-buttons">
            <el-button size="small" type="primary" icon="Edit" @click="handleEditRule(row)">编辑</el-button>
            <el-button
                size="small"
                :type="row.status === 'enabled' ? 'warning' : 'success'"
                @click="handleToggleRuleStatus(row)"
            >
              {{ row.status === 'enabled' ? '禁用' : '启用' }}
            </el-button>
            <el-button
                v-if="!isVersionEdit || row.isNewRule"
                size="small"
                type="danger"
                icon="Delete"
                @click="handleDeleteRule(row)"
            >
              删除
            </el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>
    <!-- 批量操作确认对话框 -->
    <el-dialog
        v-model="batchDialogVisible"
        :title="batchAction === 'enable' ? '批量启用规则' : '批量禁用规则'"
        width="500px"
        :close-on-click-modal="false"
    >
      <el-alert
          :title="batchAction === 'enable' ? '启用规则后，这些规则将立即生效' : '禁用规则后，这些规则将暂时失效'"
          :type="batchAction === 'enable' ? 'success' : 'warning'"
          show-icon
          :closable="false"
          style="margin-bottom: 16px"
      />
      <p>已选择 <strong>{{ selectedRows.length }}</strong> 条规则：</p>
      <ul class="batch-rule-list">
        <li v-for="row in selectedRows" :key="row.id">
          {{ row.ruleName }} ({{ getRuleTypeText(row.ruleType) }})
        </li>
      </ul>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="batchDialogVisible = false">取消</el-button>
          <el-button :type="batchAction === 'enable' ? 'success' : 'warning'" @click="confirmBatchAction">
            {{ batchAction === 'enable' ? '确认启用' : '确认禁用' }}
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 导入规则对话框 -->
    <el-dialog
        v-model="importDialogVisible"
        title="导入规则"
        width="500px"
        :close-on-click-modal="false"
    >
      <el-alert
          title="支持导入 .json 格式的规则配置文件"
          type="info"
          show-icon
          :closable="false"
          style="margin-bottom: 16px"
      />
      <el-upload
          ref="uploadRef"
          :auto-upload="false"
          :on-change="handleFileChange"
          :limit="1"
          accept=".json"
          drag
      >
        <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
        <div class="el-upload__text">
          拖拽文件到此处或 <em>点击上传</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">只能上传 .json 文件</div>
        </template>
      </el-upload>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="importDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmImport" :loading="importLoading" :disabled="!importFile">
            开始导入
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 新增/编辑规则对话框 -->
    <el-dialog
        v-model="ruleDialogVisible"
        :title="isEditMode ? '编辑规则' : '新增规则'"
        width="700px"
        :close-on-click-modal="false"
    >
      <el-form
          ref="formRef"
          :model="formData"
          :rules="formRules"
          label-width="120px"
      >
        <el-form-item label="规则名称" prop="ruleName">
          <el-input
              v-model="formData.ruleName"
              placeholder="请输入规则名称"
              maxlength="50"
              show-word-limit
          />
        </el-form-item>

        <el-form-item label="规则类型" prop="ruleType">
          <el-select v-model="formData.ruleType" style="width: 100%" @change="handleRuleTypeChange">
            <el-option label="自动编号" value="auto_number" />
            <el-option label="数据校验" value="validation" />
            <el-option label="默认值" value="default_value" />
            <el-option label="联动规则" value="linkage" />
          </el-select>
        </el-form-item>

        <el-form-item label="绑定字段" prop="targetField">
          <el-select
              v-model="selectedFields"
              multiple
              filterable
              placeholder="请选择绑定字段"
              style="width: 100%"
              @change="handleFieldChange"
          >
            <el-option
                v-for="field in availableFields"
                :key="field.fieldCode"
                :label="`${field.fieldName} (${field.fieldCode})`"
                :value="field.fieldCode"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="规则描述" prop="description">
          <el-input
              v-model="formData.description"
              type="textarea"
              :rows="3"
              placeholder="请详细描述规则逻辑"
              maxlength="500"
              show-word-limit
          />
        </el-form-item>

        <el-form-item label="规则状态">
          <el-switch
              v-model="formData.status"
              active-value="enabled"
              inactive-value="disabled"
              active-text="启用"
              inactive-text="禁用"
          />
        </el-form-item>

        <!-- 自动编号规则配置 -->
        <template v-if="formData.ruleType === 'auto_number'">
          <el-divider content-position="left">编号规则配置</el-divider>
          <el-form-item label="选择编号规则" prop="selectedRuleId">
            <el-select
                v-model="formData.selectedRuleId"
                placeholder="请选择已配置的自动编号规则"
                style="width: 100%"
                @change="handleRuleSelectChange"
            >
              <el-option
                  v-for="rule in autoNumberRules"
                  :key="rule.id"
                  :label="rule.ruleName"
                  :value="rule.id"
              >
                <div style="display: flex; justify-content: space-between; align-items: center">
                  <span>{{ rule.ruleName }}</span>
                  <span style="color: #909399; font-size: 12px">{{ rule.numberFormat }}</span>
                </div>
              </el-option>
            </el-select>
            <div style="margin-top: 8px">
              <el-link type="primary" :icon="Plus" @click="handleAddAutoNumberRule">
                前往自动编号规则管理页面配置
              </el-link>
            </div>
          </el-form-item>
          <el-form-item v-if="selectedAutoNumberRule" label="规则详情">
            <el-descriptions :column="1" border size="small">
              <el-descriptions-item label="规则名称">{{ selectedAutoNumberRule.ruleName }}</el-descriptions-item>
              <el-descriptions-item label="编号格式">
                <el-tag size="small">{{ selectedAutoNumberRule.numberFormat }}</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="当前编号">{{ selectedAutoNumberRule.currentNumber }}</el-descriptions-item>
              <el-descriptions-item label="重置规则">{{ getResetRuleText(selectedAutoNumberRule.resetRule) }}</el-descriptions-item>
              <el-descriptions-item label="规则说明">{{ selectedAutoNumberRule.description }}</el-descriptions-item>
            </el-descriptions>
          </el-form-item>
          <el-form-item label="预览示例" v-if="selectedAutoNumberRule">
            <el-tag type="success" size="large">{{ generatePreviewNumber(selectedAutoNumberRule) }}</el-tag>
          </el-form-item>
        </template>

        <!-- 数据校验规则配置 -->
        <template v-if="formData.ruleType === 'validation'">
          <el-divider content-position="left">校验规则配置</el-divider>
          <el-form-item label="校验类型" prop="validationType">
            <el-select v-model="formData.validationType" style="width: 100%">
              <el-option label="必填校验" value="required" />
              <el-option label="长度校验" value="length" />
              <el-option label="正则表达式" value="regex" />
              <el-option label="范围校验" value="range" />
              <el-option label="自定义函数" value="custom" />
            </el-select>
          </el-form-item>
          <el-form-item v-if="formData.validationType === 'length'" label="最小长度">
            <el-input-number v-model="formData.minLength" :min="0" style="width: 100%" />
          </el-form-item>
          <el-form-item v-if="formData.validationType === 'length'" label="最大长度">
            <el-input-number v-model="formData.maxLength" :min="0" style="width: 100%" />
          </el-form-item>
          <el-form-item v-if="formData.validationType === 'regex'" label="正则表达式">
            <el-input v-model="formData.regexPattern" placeholder="例如：^1[3-9]\d{9}$" />
          </el-form-item>
          <el-form-item v-if="formData.validationType === 'range'" label="最小值">
            <el-input-number v-model="formData.minValue" style="width: 100%" />
          </el-form-item>
          <el-form-item v-if="formData.validationType === 'range'" label="最大值">
            <el-input-number v-model="formData.maxValue" style="width: 100%" />
          </el-form-item>
          <el-form-item label="错误提示" prop="errorMessage">
            <el-input
                v-model="formData.errorMessage"
                placeholder="校验失败时显示的提示信息"
                maxlength="200"
            />
          </el-form-item>
        </template>

        <!-- 默认值规则配置 -->
        <template v-if="formData.ruleType === 'default_value'">
          <el-divider content-position="left">默认值配置</el-divider>
          <el-form-item label="默认值类型" prop="defaultValueType">
            <el-select v-model="formData.defaultValueType" style="width: 100%">
              <el-option label="固定值" value="fixed" />
              <el-option label="当前日期" value="current_date" />
              <el-option label="当前时间" value="current_datetime" />
              <el-option label="当前用户" value="current_user" />
              <el-option label="表达式" value="expression" />
            </el-select>
          </el-form-item>
          <el-form-item v-if="formData.defaultValueType === 'fixed'" label="固定值">
            <el-input v-model="formData.defaultValue" placeholder="请输入默认值" />
          </el-form-item>
          <el-form-item v-if="formData.defaultValueType === 'expression'" label="表达式">
            <el-input v-model="formData.defaultValue" placeholder="例如：${now()}" />
          </el-form-item>
        </template>

        <!-- 联动规则配置 -->
        <template v-if="formData.ruleType === 'linkage'">
          <el-divider content-position="left">联动规则配置</el-divider>
          <el-form-item label="触发字段" prop="triggerField">
            <el-select v-model="formData.triggerField" style="width: 100%">
              <el-option
                  v-for="field in availableFields"
                  :key="field.fieldCode"
                  :label="`${field.fieldName} (${field.fieldCode})`"
                  :value="field.fieldCode"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="触发条件" prop="triggerCondition">
            <el-input v-model="formData.triggerCondition" placeholder="例如：value > 5" />
          </el-form-item>
          <el-form-item label="联动动作" prop="linkageAction">
            <el-select v-model="formData.linkageAction" style="width: 100%">
              <el-option label="设为必填" value="set_required" />
              <el-option label="设为只读" value="set_readonly" />
              <el-option label="隐藏字段" value="hide" />
              <el-option label="设置默认值" value="set_default" />
            </el-select>
          </el-form-item>
        </template>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="ruleDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSaveRule" :loading="saving">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { UploadFilled, Plus } from '@element-plus/icons-vue'

const props = defineProps({
  isVersionEdit: {
    type: Boolean,
    default: false
  },
  // 从父组件传入的字段列表
  fieldList: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['change'])

const ruleList = ref([
  {
    id: 1,
    ruleName: '单据编号自动生成',
    ruleType: 'auto_number',
    targetField: 'bill_no',
    description: '使用规则 CL{YYYYMMDD}{0000} 自动生成单据编号',
    status: 'enabled',
    system: true,
    selectedRuleId: 4,
    prefix: 'CL',
    dateFormat: 'YYYYMMDD',
    serialLength: 4
  },
  {
    id: 2,
    ruleName: '车牌号格式校验',
    ruleType: 'validation',
    targetField: 'license_plate',
    description: '必须符合中国大陆车牌号格式（如：京A12345）',
    status: 'enabled',
    system: false,
    validationType: 'regex',
    regexPattern: '^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领][A-Z][A-Z0-9]{4,5}[A-Z0-9挂学警港澳]$',
    errorMessage: '车牌号格式不正确'
  },
  {
    id: 3,
    ruleName: '用车时间逻辑校验',
    ruleType: 'validation',
    targetField: 'start_time,end_time',
    description: '结束时间必须晚于开始时间，且不能早于当前时间',
    status: 'enabled',
    system: false,
    validationType: 'custom',
    errorMessage: '时间逻辑错误'
  },
  {
    id: 4,
    ruleName: '随行人数范围限制',
    ruleType: 'validation',
    targetField: 'passenger_count',
    description: '随行人数必须在 1-20 之间',
    status: 'enabled',
    system: false,
    validationType: 'range',
    minValue: 1,
    maxValue: 20,
    errorMessage: '随行人数必须在1-20之间'
  },
  {
    id: 5,
    ruleName: '紧急联系人联动',
    ruleType: 'linkage',
    targetField: 'emergency_contact',
    description: '当随行人数超过 5 人时，紧急联系人必填',
    status: 'enabled',
    system: false,
    triggerField: 'passenger_count',
    triggerCondition: 'value > 5',
    linkageAction: 'set_required'
  },
  {
    id: 6,
    ruleName: '联系电话格式校验',
    ruleType: 'validation',
    targetField: 'contact_phone',
    description: '必须符合中国大陆手机号格式（11位数字）',
    status: 'enabled',
    system: false,
    validationType: 'regex',
    regexPattern: '^1[3-9]\\d{9}$',
    errorMessage: '手机号格式不正确'
  },
  {
    id: 7,
    ruleName: '用车事由长度限制',
    ruleType: 'validation',
    targetField: 'usage_reason',
    description: '用车事由不能少于 10 个字符',
    status: 'enabled',
    system: false,
    validationType: 'length',
    minLength: 10,
    errorMessage: '用车事由不能少于10个字符'
  },
  {
    id: 8,
    ruleName: '申请日期默认值',
    ruleType: 'default_value',
    targetField: 'apply_date',
    description: '默认值为当前日期',
    status: 'enabled',
    system: true,
    defaultValueType: 'current_date'
  }
])

// 对话框相关
const ruleDialogVisible = ref(false)
const isEditMode = ref(false)
const saving = ref(false)
const formRef = ref(null)
// 批量操作相关
const selectedRows = ref([])
const batchDialogVisible = ref(false)
const batchAction = ref('enable') // 'enable' or 'disable'

// 导入导出相关
const importDialogVisible = ref(false)
const importFile = ref(null)
const importLoading = ref(false)
// 表单数据
const formData = ref({
  id: null,
  ruleName: '',
  ruleType: 'validation',
  targetField: '',
  description: '',
  status: 'enabled',
  selectedRuleId: null,
  // 自动编号
  prefix: '',
  dateFormat: 'YYYYMMDD',
  serialLength: 4,
  // 数据校验
  validationType: 'required',
  minLength: 0,
  maxLength: 100,
  regexPattern: '',
  minValue: 0,
  maxValue: 100,
  errorMessage: '',
  // 默认值
  defaultValueType: 'fixed',
  defaultValue: '',
  // 联动规则
  triggerField: '',
  triggerCondition: '',
  linkageAction: 'set_required'
})

const selectedFields = ref([])

// 表单验证规则
const formRules = {
  ruleName: [
    { required: true, message: '请输入规则名称', trigger: 'blur' },
    { max: 50, message: '规则名称不能超过50个字符', trigger: 'blur' }
  ],
  ruleType: [
    { required: true, message: '请选择规则类型', trigger: 'change' }
  ],
  targetField: [
    { required: true, message: '请选择绑定字段', trigger: 'change' }
  ],
  description: [
    { required: true, message: '请输入规则描述', trigger: 'blur' }
  ]
}

// 可用字段（模拟数据，实际应从父组件传入）
const availableFields = computed(() => {
  if (props.fieldList.length > 0) {
    return props.fieldList
  }
  // 默认模拟字段
  return [
    { fieldName: '单据编号', fieldCode: 'bill_no', dataType: 'String' },
    { fieldName: '申请人', fieldCode: 'applicant_id', dataType: 'String' },
    { fieldName: '车牌号码', fieldCode: 'license_plate', dataType: 'String' },
    { fieldName: '开始时间', fieldCode: 'start_time', dataType: 'Date' },
    { fieldName: '结束时间', fieldCode: 'end_time', dataType: 'Date' },
    { fieldName: '随行人数', fieldCode: 'passenger_count', dataType: 'Number' },
    { fieldName: '紧急联系人', fieldCode: 'emergency_contact', dataType: 'String' },
    { fieldName: '联系电话', fieldCode: 'contact_phone', dataType: 'String' },
    { fieldName: '用车事由', fieldCode: 'usage_reason', dataType: 'String' },
    { fieldName: '申请日期', fieldCode: 'apply_date', dataType: 'Date' }
  ]
})

// 自动编号规则列表（从自动编号规则管理页面获取）
const autoNumberRules = ref([
  {
    id: 1,
    ruleName: '请假申请编号规则',
    businessObject: '请假申请',
    numberFormat: 'QJ{YYYY}{MM}{DD}-{SEQ:4}',
    currentNumber: 'QJ20240408-0015',
    startNumber: 1,
    resetRule: 'daily',
    description: '请假申请单自动生成编号，每日重置流水号'
  },
  {
    id: 2,
    ruleName: '加班申请编号规则',
    businessObject: '加班申请',
    numberFormat: 'JB{YYYY}{MM}{DD}-{SEQ:4}',
    currentNumber: 'JB20240408-0008',
    startNumber: 1,
    resetRule: 'daily',
    description: '加班申请单自动生成编号'
  },
  {
    id: 3,
    ruleName: '会议申请编号规则',
    businessObject: '会议申请',
    numberFormat: 'HY{YYYY}{MM}-{SEQ:4}',
    currentNumber: 'HY202404-0023',
    startNumber: 1,
    resetRule: 'monthly',
    description: '会议申请单自动生成编号，每月重置'
  },
  {
    id: 4,
    ruleName: '车辆申请编号规则',
    businessObject: '车辆申请',
    numberFormat: 'CL{YYYY}{SEQ:6}',
    currentNumber: 'CL2024000125',
    startNumber: 1,
    resetRule: 'yearly',
    description: '车辆申请单自动生成编号，每年重置'
  },
  {
    id: 5,
    ruleName: '费用报销编号规则',
    businessObject: '费用报销',
    numberFormat: 'BX{YYYY}{MM}{DD}-{SEQ:6}',
    currentNumber: 'BX20240408-000042',
    startNumber: 1,
    resetRule: 'daily',
    description: '费用报销单自动生成编号'
  }
])

// 选中的自动编号规则
const selectedAutoNumberRule = computed(() => {
  if (!formData.value.selectedRuleId) return null
  return autoNumberRules.value.find(rule => rule.id === formData.value.selectedRuleId)
})

// 获取重置规则文本
const getResetRuleText = (resetRule) => {
  const texts = {
    never: '永不重置',
    daily: '每天重置',
    monthly: '每月重置',
    yearly: '每年重置'
  }
  return texts[resetRule] || '未知'
}

// 生成预览编号
const generatePreviewNumber = (rule) => {
  const now = new Date()
  let number = rule.numberFormat
  number = number.replace('{YYYY}', now.getFullYear())
  number = number.replace('{MM}', String(now.getMonth() + 1).padStart(2, '0'))
  number = number.replace('{DD}', String(now.getDate()).padStart(2, '0'))

  const seqMatch = rule.numberFormat.match(/\{SEQ:(\d+)\}/)
  if (seqMatch) {
    const length = parseInt(seqMatch[1])
    const currentSeq = parseInt(rule.currentNumber.match(/\d+$/)?.[0] || '0') + 1
    number = number.replace(seqMatch[0], String(currentSeq).padStart(length, '0'))
  }
  return number
}

// 规则选择变更
const handleRuleSelectChange = (ruleId) => {
  const rule = autoNumberRules.value.find(r => r.id === ruleId)
  if (rule) {
    formData.value.description = `使用规则 ${rule.numberFormat} 自动生成单据编号`
  }
}

// 前往自动编号规则管理页面
const handleAddAutoNumberRule = () => {
  window.open('/process/design/auto-number', '_blank')
}

const getRuleTypeTag = (type) => {
  const tags = {
    'validation': 'warning',
    'default_value': 'info',
    'auto_number': 'primary',
    'linkage': 'success'
  }
  return tags[type] || 'info'
}

const getRuleTypeText = (type) => {
  const texts = {
    'validation': '数据校验',
    'default_value': '默认值',
    'auto_number': '自动编号',
    'linkage': '联动规则'
  }
  return texts[type] || type
}

// 获取目标字段数组
const getTargetFields = (targetField) => {
  if (!targetField) return []
  return targetField.split(',').map(f => f.trim())
}

// 新增规则
const handleAddRule = () => {
  isEditMode.value = false
  resetForm()
  ruleDialogVisible.value = true
}

// 编辑规则
const handleEditRule = (row) => {
  isEditMode.value = true
  // 填充表单数据
  Object.keys(formData.value).forEach(key => {
    if (row[key] !== undefined) {
      formData.value[key] = row[key]
    }
  })
  // 处理绑定字段
  selectedFields.value = getTargetFields(row.targetField)
  // 如果是自动编号规则，设置选中的规则ID
  if (row.ruleType === 'auto_number' && row.selectedRuleId) {
    formData.value.selectedRuleId = row.selectedRuleId
  }
  ruleDialogVisible.value = true
}

// 规则类型变更
const handleRuleTypeChange = () => {
  // 重置特定类型的配置
  formData.value.validationType = 'required'
  formData.value.defaultValueType = 'fixed'
  formData.value.defaultValue = ''
  formData.value.triggerField = ''
  formData.value.triggerCondition = ''
  formData.value.linkageAction = 'set_required'
  formData.value.selectedRuleId = null
}

// 字段选择变更
const handleFieldChange = () => {
  formData.value.targetField = selectedFields.value.join(',')
}

// 表格选择变更
const handleSelectionChange = (selection) => {
  selectedRows.value = selection
}

// 批量启用/禁用
const handleBatchAction = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要操作的规则')
    return
  }

  // 检查是否有已选中状态相同的规则
  const allEnabled = selectedRows.value.every(row => row.status === 'enabled')
  const allDisabled = selectedRows.value.every(row => row.status === 'disabled')

  if (allEnabled) {
    batchAction.value = 'disable'
  } else if (allDisabled) {
    batchAction.value = 'enable'
  } else {
    // 混合状态，询问用户操作类型
    ElMessageBox.confirm(
        '选中的规则包含已启用和已禁用的状态，请选择操作类型：',
        '批量操作',
        {
          confirmButtonText: '批量启用',
          cancelButtonText: '批量禁用',
          type: 'warning',
          distinguishCancelAndClose: true
        }
    ).then(() => {
      batchAction.value = 'enable'
      batchDialogVisible.value = true
    }).catch((action) => {
      if (action === 'cancel') {
        batchAction.value = 'disable'
        batchDialogVisible.value = true
      }
    })
    return
  }

  batchDialogVisible.value = true
}

// 确认批量操作
const confirmBatchAction = () => {
  const actionText = batchAction.value === 'enable' ? '启用' : '禁用'
  const newStatus = batchAction.value === 'enable' ? 'enabled' : 'disabled'

  selectedRows.value.forEach(row => {
    row.status = newStatus
    if (props.isVersionEdit && !row.isNewRule) {
      row.changeType = row.changeType === '新增' ? '新增' : '修改'
    }
  })

  ElMessage.success(`成功${actionText} ${selectedRows.value.length} 条规则`)
  batchDialogVisible.value = false
  emit('change', ruleList.value)
}

// 导入规则
const handleImport = () => {
  importFile.value = null
  importDialogVisible.value = true
}

const handleFileChange = (file) => {
  importFile.value = file.raw
}

const confirmImport = () => {
  if (!importFile.value) {
    ElMessage.warning('请选择要导入的文件')
    return
  }

  importLoading.value = true

  // 读取文件内容
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const rules = JSON.parse(e.target.result)

      if (!Array.isArray(rules)) {
        throw new Error('文件格式错误：应为规则数组')
      }

      // 验证规则格式
      const validRules = rules.filter(rule => {
        return rule.ruleName && rule.ruleType && rule.targetField
      })

      if (validRules.length === 0) {
        throw new Error('文件中没有有效的规则数据')
      }

      // 添加到规则列表
      validRules.forEach(rule => {
        const newRule = {
          id: Date.now() + Math.random(),
          ...rule,
          status: rule.status || 'disabled',
          system: false,
          isNewRule: true,
          changeType: '导入'
        }
        ruleList.value.push(newRule)
      })

      ElMessage.success(`成功导入 ${validRules.length} 条规则`)
      importDialogVisible.value = false
      emit('change', ruleList.value)
    } catch (error) {
      ElMessage.error(`导入失败：${error.message}`)
    } finally {
      importLoading.value = false
    }
  }

  reader.onerror = () => {
    ElMessage.error('文件读取失败')
    importLoading.value = false
  }

  reader.readAsText(importFile.value)
}

// 导出规则
const handleExport = () => {
  if (ruleList.value.length === 0) {
    ElMessage.warning('没有可导出的规则')
    return
  }

  // 准备导出数据（移除内部使用的字段）
  const exportData = ruleList.value.map(rule => ({
    ruleName: rule.ruleName,
    ruleType: rule.ruleType,
    targetField: rule.targetField,
    description: rule.description,
    status: rule.status,
    prefix: rule.prefix,
    dateFormat: rule.dateFormat,
    serialLength: rule.serialLength,
    validationType: rule.validationType,
    minLength: rule.minLength,
    maxLength: rule.maxLength,
    regexPattern: rule.regexPattern,
    minValue: rule.minValue,
    maxValue: rule.maxValue,
    errorMessage: rule.errorMessage,
    defaultValueType: rule.defaultValueType,
    defaultValue: rule.defaultValue,
    triggerField: rule.triggerField,
    triggerCondition: rule.triggerCondition,
    linkageAction: rule.linkageAction
  }))

  // 生成 JSON 文件
  const jsonStr = JSON.stringify(exportData, null, 2)
  const blob = new Blob([jsonStr], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  // 创建下载链接
  const a = document.createElement('a')
  a.href = url
  a.download = `rules_${new Date().getTime()}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)

  ElMessage.success(`成功导出 ${exportData.length} 条规则`)
}

// 切换规则状态
const handleToggleRuleStatus = (row) => {
  const action = row.status === 'enabled' ? '禁用' : '启用'

  ElMessageBox.confirm(
      `确定要${action}规则"${row.ruleName}"吗？`,
      `${action}确认`,
      {
        confirmButtonText: `确认${action}`,
        cancelButtonText: '取消',
        type: row.status === 'enabled' ? 'warning' : 'success'
      }
  ).then(() => {
    row.status = row.status === 'enabled' ? 'disabled' : 'enabled'
    ElMessage.success(`已${action}`)
    emit('change', ruleList.value)
  }).catch(() => {})
}

// 删除规则
const handleDeleteRule = (row) => {
  ElMessageBox.confirm(
      `确定要删除规则"${row.ruleName}"吗？此操作不可恢复。`,
      '删除确认',
      {
        confirmButtonText: '确认删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
  ).then(() => {
    ruleList.value = ruleList.value.filter(r => r.id !== row.id)
    ElMessage.success('删除成功')
    emit('change', ruleList.value)
  }).catch(() => {})
}
// 保存规则
const handleSaveRule = async () => {
  try {
    await formRef.value.validate()
    saving.value = true

    setTimeout(() => {
      if (isEditMode.value) {
        // 编辑模式：更新现有规则
        const index = ruleList.value.findIndex(r => r.id === formData.value.id)
        if (index !== -1) {
          Object.assign(ruleList.value[index], formData.value)
          if (props.isVersionEdit && !ruleList.value[index].isNewRule) {
            ruleList.value[index].changeType = '修改'
          }
        }
        ElMessage.success('修改成功')
      } else {
        // 新增模式：添加新规则
        const newRule = {
          id: Date.now(),
          ...formData.value,
          system: false,
          isNewRule: props.isVersionEdit,
          changeType: props.isVersionEdit ? '新增' : undefined
        }
        ruleList.value.push(newRule)
        ElMessage.success('新增成功')
      }

      saving.value = false
      ruleDialogVisible.value = false
      emit('change', ruleList.value)
    }, 500)
  } catch (error) {
    console.error('验证失败:', error)
    saving.value = false
  }
}

// 重置表单
const resetForm = () => {
  formData.value = {
    id: null,
    ruleName: '',
    ruleType: 'validation',
    targetField: '',
    description: '',
    status: 'enabled',
    selectedRuleId: null,
    prefix: '',
    dateFormat: 'YYYYMMDD',
    serialLength: 4,
    validationType: 'required',
    minLength: 0,
    maxLength: 100,
    regexPattern: '',
    minValue: 0,
    maxValue: 100,
    errorMessage: '',
    defaultValueType: 'fixed',
    defaultValue: '',
    triggerField: '',
    triggerCondition: '',
    linkageAction: 'set_required'
  }
  selectedFields.value = []
}

defineExpose({
  ruleList
})
</script>

<style scoped lang="scss">
.data-rule {
  .tab-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    flex-wrap: wrap;
    gap: 12px;

    .toolbar-left {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }
  }

  .field-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }

  .action-buttons {
    display: flex;
    gap: 8px;
    justify-content: center;
    flex-wrap: nowrap;

    .el-button {
      margin: 0;
      white-space: nowrap;
    }
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }

  .batch-rule-list {
    max-height: 200px;
    overflow-y: auto;
    padding-left: 20px;
    margin: 12px 0;

    li {
      padding: 4px 0;
      color: #606266;
      font-size: 14px;
    }
  }

  .el-upload {
    width: 100%;

    :deep(.el-upload-dragger) {
      width: 100%;
    }
  }
}
</style>
