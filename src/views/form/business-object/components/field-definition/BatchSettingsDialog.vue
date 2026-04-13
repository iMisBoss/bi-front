<template>
  <el-dialog
      v-model="dialogVisible"
      title="批量设置字段属性"
      width="1100px"
      :close-on-click-modal="false"
      @close="handleClose"
  >
    <div class="batch-settings">
      <!-- 区域1：操作说明 -->
      <el-alert
          type="info"
          :closable="false"
          class="operation-tip"
      >
        <template #title>
          <span>仅可修改字段非核心属性，系统内置字段、已发布版本的核心属性不可批量修改，操作将记录审计日志。</span>
        </template>
      </el-alert>

      <div class="content-wrapper">
        <!-- 区域2：左侧字段选择区 -->
        <div class="field-selection">
          <div class="selection-header">
            <h4>选择字段</h4>
            <div class="selection-actions">
              <el-checkbox v-model="selectAll" @change="handleSelectAll">全选</el-checkbox>
              <el-button link type="primary" @click="handleInverse">反选</el-button>
            </div>
          </div>

          <!-- 筛选条件 -->
          <div class="filter-bar">
            <el-select
                v-model="filterType"
                placeholder="按类型筛选"
                clearable
                size="small"
                style="width: 120px"
                @change="handleFilterChange"
            >
              <el-option label="字符串" value="VARCHAR" />
              <el-option label="整型" value="INT" />
              <el-option label="日期" value="DATE" />
              <el-option label="长文本" value="TEXT" />
            </el-select>
            <el-select
                v-model="filterRequired"
                placeholder="按必填筛选"
                clearable
                size="small"
                style="width: 100px"
                @change="handleFilterChange"
            >
              <el-option label="必填" :value="true" />
              <el-option label="非必填" :value="false" />
            </el-select>
            <el-select
                v-model="filterSensitive"
                placeholder="按敏感等级"
                clearable
                size="small"
                style="width: 120px"
                @change="handleFilterChange"
            >
              <el-option label="普通" value="normal" />
              <el-option label="内部" value="internal" />
              <el-option label="敏感" value="sensitive" />
              <el-option label="高度敏感" value="highly_sensitive" />
            </el-select>
          </div>

          <!-- 字段列表 -->
          <el-table
              ref="fieldTableRef"
              :data="filteredFields"
              height="380"
              border
              stripe
              @selection-change="handleSelectionChange"
          >
            <el-table-column
                type="selection"
                width="50"
                align="center"
                :selectable="canBatchEdit"
            />
            <el-table-column prop="fieldName" label="字段名称" min-width="130">
              <template #default="{ row }">
                <span :class="{ 'system-field': row.system, 'disabled-field': !canBatchEdit(row) }">
                  {{ row.fieldName }}
                </span>
                <el-tag v-if="row.system" size="small" type="info" style="margin-left: 4px">系统</el-tag>
                <el-tag v-if="row.status === 'deprecated'" size="small" type="warning" style="margin-left: 4px">已废弃</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="fieldCode" label="数据库列名" min-width="130">
              <template #default="{ row }">
                <span :class="{ 'system-field': row.system }">{{ row.fieldCode }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="dataType" label="字段类型" width="110">
              <template #default="{ row }">
                <el-tag size="small" :type="getFieldTypeColor(row.dataType)">
                  {{ getDataTypeShortText(row.dataType) }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>

          <div class="selection-summary">
            可编辑字段：<span class="highlight">{{ filteredFields.length }}</span> 个 |
            已选择：<span class="highlight">{{ selectedFields.length }}</span> 个
          </div>
        </div>

        <!-- 区域3：右侧属性配置区 -->
        <div class="property-config">
          <h4>批量配置属性</h4>

          <el-form :model="configForm" label-width="140px" class="config-form">
            <!-- 基础展示属性：列表显示 -->
            <el-form-item>
              <template #label>
                <div class="config-label">
                  <el-checkbox v-model="configForm.listVisibleEnabled">列表显示</el-checkbox>
                </div>
              </template>
              <el-radio-group v-model="configForm.listVisible" :disabled="!configForm.listVisibleEnabled">
                <el-radio :label="true">开启</el-radio>
                <el-radio :label="false">关闭</el-radio>
              </el-radio-group>
              <div class="config-tip">控制字段是否在审批列表、数据列表中展示</div>
            </el-form-item>

            <!-- 数据安全属性：敏感等级 -->
            <el-form-item>
              <template #label>
                <div class="config-label">
                  <el-checkbox v-model="configForm.sensitiveEnabled">敏感等级</el-checkbox>
                </div>
              </template>
              <el-select
                  v-model="configForm.sensitiveLevel"
                  :disabled="!configForm.sensitiveEnabled"
                  style="width: 100%"
                  placeholder="请选择敏感等级"
              >
                <el-option label="普通" value="normal">
                  <div class="option-content">
                    <span>普通</span>
                    <span class="option-desc">无脱敏，全员可看</span>
                  </div>
                </el-option>
                <el-option label="内部" value="internal">
                  <div class="option-content">
                    <span>内部</span>
                    <span class="option-desc">仅公司内部人员可看</span>
                  </div>
                </el-option>
                <el-option label="敏感" value="sensitive">
                  <div class="option-content">
                    <span>敏感</span>
                    <span class="option-desc">默认脱敏展示（如138****1234）</span>
                  </div>
                </el-option>
                <el-option label="高度敏感" value="highly_sensitive">
                  <div class="option-content">
                    <span>高度敏感</span>
                    <span class="option-desc">全程脱敏，仅管理员可见明文</span>
                  </div>
                </el-option>
              </el-select>
              <div class="config-tip">符合《数据安全法》金融分级管控要求</div>
            </el-form-item>

            <!-- 数据安全属性：脱敏规则 -->
            <el-form-item>
              <template #label>
                <div class="config-label">
                  <el-checkbox v-model="configForm.maskingEnabled">脱敏规则</el-checkbox>
                </div>
              </template>
              <el-select
                  v-model="configForm.maskingRule"
                  :disabled="!configForm.maskingEnabled"
                  style="width: 100%"
                  placeholder="请选择脱敏规则"
              >
                <el-option label="手机号脱敏" value="phone">
                  <div class="option-content">
                    <span>手机号脱敏</span>
                    <span class="option-desc">138****1234</span>
                  </div>
                </el-option>
                <el-option label="身份证号脱敏" value="idcard">
                  <div class="option-content">
                    <span>身份证号脱敏</span>
                    <span class="option-desc">110101********1234</span>
                  </div>
                </el-option>
                <el-option label="银行卡号脱敏" value="bankcard">
                  <div class="option-content">
                    <span>银行卡号脱敏</span>
                    <span class="option-desc">6222 **** **** 1234</span>
                  </div>
                </el-option>
                <el-option label="姓名脱敏" value="name">
                  <div class="option-content">
                    <span>姓名脱敏</span>
                    <span class="option-desc">张*</span>
                  </div>
                </el-option>
                <el-option label="自定义掩码" value="custom">
                  <div class="option-content">
                    <span>自定义掩码</span>
                    <span class="option-desc">前N位+****+后M位</span>
                  </div>
                </el-option>
              </el-select>
              <div class="config-tip">敏感等级≥敏感时强制启用脱敏</div>
            </el-form-item>

            <!-- 表单校验属性：必填开关（状态联动） -->
            <el-form-item v-if="businessObjectStatus !== 'archived'">
              <template #label>
                <div class="config-label">
                  <el-checkbox
                      v-model="configForm.requiredEnabled"
                      :disabled="isRequiredDisabled"
                  >
                    必填校验
                  </el-checkbox>
                </div>
              </template>

              <!-- 草稿状态：双向切换 -->
              <el-radio-group
                  v-if="businessObjectStatus === 'draft'"
                  v-model="configForm.required"
                  :disabled="!configForm.requiredEnabled || isRequiredDisabled"
              >
                <el-radio :label="true">开启</el-radio>
                <el-radio :label="false">关闭</el-radio>
              </el-radio-group>

              <!-- 已发布/已停用状态：仅单向开启 -->
              <el-radio-group
                  v-else-if="businessObjectStatus === 'published' || businessObjectStatus === 'deprecated'"
                  v-model="configForm.required"
                  :disabled="!configForm.requiredEnabled || isRequiredDisabled"
              >
                <el-radio :label="true">开启（需设置默认值）</el-radio>
              </el-radio-group>

              <div v-if="configForm.requiredEnabled && configForm.required && businessObjectStatus !== 'draft'" class="config-tip warning-tip">
                <el-icon><WarningFilled /></el-icon>
                <span>从非必填改为必填，必须同步设置默认值</span>
              </div>

              <div v-if="businessObjectStatus === 'published' || businessObjectStatus === 'deprecated'" class="config-tip info-tip">
                <el-icon><InfoFilled /></el-icon>
                <span>已发布状态下，仅支持从「非必填」改为「必填」，禁止反向操作</span>
              </div>
            </el-form-item>

            <!-- 权限属性：字段查看/编辑权限 -->
            <el-form-item>
              <template #label>
                <div class="config-label">
                  <el-checkbox v-model="configForm.permissionEnabled">字段权限</el-checkbox>
                </div>
              </template>
              <el-select
                  v-model="configForm.permissionRole"
                  :disabled="!configForm.permissionEnabled"
                  style="width: 100%"
                  placeholder="请选择适用角色"
                  multiple
                  collapse-tags
                  collapse-tags-tooltip
              >
                <el-option label="普通员工" value="employee" />
                <el-option label="部门经理" value="manager" />
                <el-option label="HR专员" value="hr" />
                <el-option label="财务专员" value="finance" />
                <el-option label="系统管理员" value="admin" />
              </el-select>
              <div class="config-tip">配置后可查看/编辑该字段的角色范围</div>
            </el-form-item>

            <!-- 已归档状态提示 -->
            <el-alert
                v-if="businessObjectStatus === 'archived'"
                type="error"
                :closable="false"
                style="margin-top: 16px"
            >
              <template #title>
                <span>已归档状态下，所有字段属性完全锁定，禁止批量修改</span>
              </template>
            </el-alert>

            <!-- 已发布/已停用状态限制提示 -->
            <el-alert
                v-if="businessObjectStatus === 'published' || businessObjectStatus === 'deprecated'"
                type="warning"
                :closable="false"
                style="margin-top: 16px"
            >
              <template #title>
                <span>当前状态下，仅可批量修改：列表显示、敏感等级、脱敏规则、权限配置；必填项仅可单向开启</span>
              </template>
            </el-alert>
          </el-form>
        </div>
      </div>

      <!-- 区域4：风险提示与操作按钮 -->
      <div class="footer-section">
        <div class="impact-info">
          <span class="impact-text">
            本次将修改 <span class="highlight">{{ selectedFields.length }}</span> 个字段的
            <span class="highlight">{{ enabledConfigCount }}</span> 项属性
          </span>
          <span v-if="hasHighRiskOperation" class="risk-warning">
            <el-icon><WarningFilled /></el-icon>
            高风险操作，请谨慎确认
          </span>
        </div>
        <div class="action-buttons">
          <el-button @click="handleClose">取消</el-button>
          <el-button @click="handlePreview" :disabled="selectedFields.length === 0 || enabledConfigCount === 0">
            预览效果
          </el-button>
          <el-button
              type="primary"
              @click="handleConfirm"
              :disabled="selectedFields.length === 0 || enabledConfigCount === 0 || businessObjectStatus === 'archived'"
          >
            确认执行
          </el-button>
        </div>
      </div>
    </div>
  </el-dialog>

  <!-- 预览弹窗：修改前后对比 -->
  <el-dialog
      v-model="previewVisible"
      title="修改前后对比"
      width="1000px"
      :close-on-click-modal="false"
  >
    <el-alert
        type="info"
        :closable="false"
        style="margin-bottom: 16px"
    >
      <template #title>
        <span>请仔细核对以下修改内容，确认无误后再执行</span>
      </template>
    </el-alert>

    <el-table :data="previewData" border max-height="450" stripe>
      <el-table-column prop="fieldName" label="字段名称" width="150" fixed />
      <el-table-column prop="fieldCode" label="列名" width="130" />
      <el-table-column prop="propertyName" label="修改属性" width="120" />
      <el-table-column prop="beforeValue" label="修改前" min-width="150" />
      <el-table-column prop="afterValue" label="修改后" min-width="150">
        <template #default="{ row }">
          <span class="after-value">{{ row.afterValue }}</span>
        </template>
      </el-table-column>
    </el-table>

    <template #footer>
      <div class="preview-footer">
        <el-button @click="previewVisible = false">返回修改</el-button>
        <el-button type="primary" @click="handleFinalConfirm">确认执行</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { WarningFilled, InfoFilled } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: Boolean,
  fieldList: {
    type: Array,
    default: () => []
  },
  businessObjectStatus: {
    type: String,
    default: 'draft' // draft, published, deprecated, archived
  },
  isVersionEdit: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

// 表格引用
const fieldTableRef = ref(null)

// 字段选择相关
const selectAll = ref(false)
const selectedFields = ref([])
const filterType = ref('')
const filterRequired = ref('')
const filterSensitive = ref('')

// 配置表单
const configForm = ref({
  listVisibleEnabled: false,
  listVisible: true,
  sensitiveEnabled: false,
  sensitiveLevel: 'normal',
  maskingEnabled: false,
  maskingRule: '',
  requiredEnabled: false,
  required: true,
  permissionEnabled: false,
  permissionRole: []
})

// 预览相关
const previewVisible = ref(false)
const previewData = ref([])

// 过滤后的字段列表（排除系统内置字段和已废弃字段）
const filteredFields = computed(() => {
  let fields = props.fieldList.filter(field => {
    // 排除系统内置字段
    if (field.system) return false
    // 排除已废弃字段
    if (field.status === 'deprecated') return false
    // 版本编辑模式下，排除原版本字段
    if (props.isVersionEdit && !field.isNewField) return false
    return true
  })

  if (filterType.value) {
    fields = fields.filter(f => f.dataType.includes(filterType.value))
  }

  if (filterRequired.value !== '') {
    fields = fields.filter(f => f.required === filterRequired.value)
  }

  if (filterSensitive.value) {
    fields = fields.filter(f => f.sensitiveLevel === filterSensitive.value)
  }

  return fields
})

// 已启用的配置项数量
const enabledConfigCount = computed(() => {
  let count = 0
  if (configForm.value.listVisibleEnabled) count++
  if (configForm.value.sensitiveEnabled) count++
  if (configForm.value.maskingEnabled) count++
  if (configForm.value.requiredEnabled) count++
  if (configForm.value.permissionEnabled) count++
  return count
})

// 是否有高风险操作
const hasHighRiskOperation = computed(() => {
  // 批量开启必填为高风险
  if (configForm.value.requiredEnabled && configForm.value.required) {
    return true
  }
  // 批量设置为高度敏感
  if (configForm.value.sensitiveEnabled && configForm.value.sensitiveLevel === 'highly_sensitive') {
    return true
  }
  return false
})

// 必填是否禁用
const isRequiredDisabled = computed(() => {
  return props.businessObjectStatus === 'archived'
})

// 判断字段是否可批量编辑
const canBatchEdit = (row) => {
  // 系统内置字段不可编辑
  if (row.system) return false
  // 已归档状态完全禁用
  if (props.businessObjectStatus === 'archived') return false
  // 已废弃字段不可编辑
  if (row.status === 'deprecated') return false
  // 版本编辑模式下，原版本字段不可批量编辑
  if (props.isVersionEdit && !row.isNewField) return false
  return true
}

// 监听业务对象状态变化
watch(() => props.businessObjectStatus, (newStatus) => {
  if (newStatus === 'archived') {
    resetForm()
  }
})

// 获取可批量编辑的字段列表
const getEditableFields = () => {
  return filteredFields.value.filter(field => canBatchEdit(field))
}

// 全选/取消全选
const handleSelectAll = (val) => {
  if (!fieldTableRef.value) return

  const editableFields = getEditableFields()

  if (val) {
    // 全选：先清空，再逐个选中可编辑字段
    fieldTableRef.value.clearSelection()
    editableFields.forEach(field => {
      fieldTableRef.value.toggleRowSelection(field, true)
    })
  } else {
    // 取消全选
    fieldTableRef.value.clearSelection()
  }
}

// 反选
const handleInverse = () => {
  if (!fieldTableRef.value) return

  const editableFields = getEditableFields()
  const selectedIds = new Set(selectedFields.value.map(f => f.id))

  // 遍历所有可编辑字段，已选的取消，未选的选中
  editableFields.forEach(field => {
    const isSelected = selectedIds.has(field.id)
    fieldTableRef.value.toggleRowSelection(field, !isSelected)
  })
}

// 筛选条件变化
const handleFilterChange = () => {
  // 清空已选字段，避免筛选后选中不存在的字段
  selectedFields.value = []
  selectAll.value = false
}

// 表格选择变化
const handleSelectionChange = (selection) => {
  selectedFields.value = selection

  // 更新全选状态：只有当所有可编辑字段都被选中时，全选框才勾选
  const editableFields = getEditableFields()
  const allSelected = editableFields.length > 0 &&
      editableFields.every(f => selection.some(s => s.id === f.id))
  selectAll.value = allSelected
}

// 关闭弹窗
const handleClose = () => {
  resetForm()
  dialogVisible.value = false
}

// 重置表单
const resetForm = () => {
  selectAll.value = false
  selectedFields.value = []
  filterType.value = ''
  filterRequired.value = ''
  filterSensitive.value = ''
  configForm.value = {
    listVisibleEnabled: false,
    listVisible: true,
    sensitiveEnabled: false,
    sensitiveLevel: 'normal',
    maskingEnabled: false,
    maskingRule: '',
    requiredEnabled: false,
    required: true,
    permissionEnabled: false,
    permissionRole: []
  }
}

// 预览效果
const handlePreview = () => {
  if (selectedFields.value.length === 0) {
    ElMessage.warning('请先选择要批量设置的字段')
    return
  }

  if (enabledConfigCount.value === 0) {
    ElMessage.warning('请至少启用一项配置')
    return
  }

  previewData.value = []

  selectedFields.value.forEach(field => {
    // 列表显示
    if (configForm.value.listVisibleEnabled) {
      previewData.value.push({
        fieldName: field.fieldName,
        fieldCode: field.fieldCode,
        propertyName: '列表显示',
        beforeValue: field.listVisible ? '开启' : '关闭',
        afterValue: configForm.value.listVisible ? '开启' : '关闭'
      })
    }

    // 敏感等级
    if (configForm.value.sensitiveEnabled) {
      previewData.value.push({
        fieldName: field.fieldName,
        fieldCode: field.fieldCode,
        propertyName: '敏感等级',
        beforeValue: getSensitiveText(field.sensitiveLevel),
        afterValue: getSensitiveText(configForm.value.sensitiveLevel)
      })
    }

    // 脱敏规则
    if (configForm.value.maskingEnabled) {
      previewData.value.push({
        fieldName: field.fieldName,
        fieldCode: field.fieldCode,
        propertyName: '脱敏规则',
        beforeValue: field.maskingRule ? getMaskingText(field.maskingRule) : '未设置',
        afterValue: getMaskingText(configForm.value.maskingRule)
      })
    }

    // 必填校验
    if (configForm.value.requiredEnabled) {
      previewData.value.push({
        fieldName: field.fieldName,
        fieldCode: field.fieldCode,
        propertyName: '必填校验',
        beforeValue: field.required ? '开启' : '关闭',
        afterValue: configForm.value.required ? '开启' : '关闭'
      })
    }

    // 字段权限
    if (configForm.value.permissionEnabled) {
      previewData.value.push({
        fieldName: field.fieldName,
        fieldCode: field.fieldCode,
        propertyName: '字段权限',
        beforeValue: field.permissionRole?.length > 0 ? field.permissionRole.join('、') : '全员',
        afterValue: configForm.value.permissionRole.length > 0 ? configForm.value.permissionRole.join('、') : '全员'
      })
    }
  })

  previewVisible.value = true
}

// 最终确认
const handleFinalConfirm = () => {
  ElMessageBox.confirm(
      '本次批量操作不可逆，是否确认执行？系统将自动生成审计日志和回滚快照。',
      '二次确认',
      {
        confirmButtonText: '确认执行',
        cancelButtonText: '取消',
        type: 'warning',
        distinguishCancelAndClose: true
      }
  ).then(() => {
    executeBatchUpdate()
    previewVisible.value = false
    handleClose()
  }).catch(() => {})
}

// 确认执行
const handleConfirm = () => {
  if (selectedFields.value.length === 0) {
    ElMessage.warning('请先选择要批量设置的字段')
    return
  }

  if (enabledConfigCount.value === 0) {
    ElMessage.warning('请至少启用一项配置')
    return
  }

  // 已发布状态下，从非必填改为必填需要设置默认值
  if (
      (props.businessObjectStatus === 'published' || props.businessObjectStatus === 'deprecated') &&
      configForm.value.requiredEnabled &&
      configForm.value.required
  ) {
    ElMessageBox.prompt(
        '从非必填改为必填，请输入默认值（所有选中字段将使用同一默认值）',
        '设置默认值',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          inputPattern: /.+/,
          inputErrorMessage: '默认值不能为空'
        }
    ).then(({ value }) => {
      configForm.value.defaultValue = value
      handlePreview()
    }).catch(() => {})
    return
  }

  handlePreview()
}

// 执行批量更新
const executeBatchUpdate = () => {
  const updatedFields = selectedFields.value.map(field => {
    const updated = { ...field }

    if (configForm.value.listVisibleEnabled) {
      updated.listVisible = configForm.value.listVisible
    }

    if (configForm.value.sensitiveEnabled) {
      updated.sensitiveLevel = configForm.value.sensitiveLevel
    }

    if (configForm.value.maskingEnabled) {
      updated.maskingRule = configForm.value.maskingRule
    }

    if (configForm.value.requiredEnabled) {
      updated.required = configForm.value.required
      if (configForm.value.defaultValue) {
        updated.defaultValue = configForm.value.defaultValue
      }
    }

    if (configForm.value.permissionEnabled) {
      updated.permissionRole = configForm.value.permissionRole
    }

    return updated
  })

  // 生成审计日志
  generateAuditLog(updatedFields)

  // 生成回滚快照
  generateRollbackSnapshot(updatedFields)

  emit('confirm', updatedFields)
  ElMessage.success(`批量设置成功，已更新${updatedFields.length}个字段`)
}

// 生成审计日志
const generateAuditLog = (updatedFields) => {
  const auditLog = {
    operation: '批量设置字段属性',
    operator: '当前用户', // 实际应从用户信息中获取
    operationTime: new Date().toISOString(),
    businessObject: '请假申请', // 实际应从父组件传入
    status: props.businessObjectStatus,
    affectedFields: updatedFields.map(f => ({
      fieldName: f.fieldName,
      fieldCode: f.fieldCode,
      changes: []
    })),
    ipAddress: '192.168.1.100' // 实际应获取真实IP
  }

  // 记录每个字段的具体变更
  updatedFields.forEach((field, index) => {
    const originalField = props.fieldList.find(f => f.id === field.id)
    if (!originalField) return

    const changes = []
    if (configForm.value.listVisibleEnabled && originalField.listVisible !== field.listVisible) {
      changes.push({ property: '列表显示', before: originalField.listVisible, after: field.listVisible })
    }
    if (configForm.value.sensitiveEnabled && originalField.sensitiveLevel !== field.sensitiveLevel) {
      changes.push({ property: '敏感等级', before: originalField.sensitiveLevel, after: field.sensitiveLevel })
    }
    if (configForm.value.maskingEnabled && originalField.maskingRule !== field.maskingRule) {
      changes.push({ property: '脱敏规则', before: originalField.maskingRule, after: field.maskingRule })
    }
    if (configForm.value.requiredEnabled && originalField.required !== field.required) {
      changes.push({ property: '必填校验', before: originalField.required, after: field.required })
    }
    if (configForm.value.permissionEnabled && JSON.stringify(originalField.permissionRole) !== JSON.stringify(field.permissionRole)) {
      changes.push({ property: '字段权限', before: originalField.permissionRole, after: field.permissionRole })
    }

    auditLog.affectedFields[index].changes = changes
  })

  console.log('审计日志:', auditLog)
  // 实际应调用后端API保存审计日志
}

// 生成回滚快照
const generateRollbackSnapshot = (updatedFields) => {
  const snapshot = {
    snapshotId: `SNAPSHOT_${Date.now()}`,
    createTime: new Date().toISOString(),
    businessObject: '请假申请',
    status: props.businessObjectStatus,
    fields: updatedFields.map(field => {
      const originalField = props.fieldList.find(f => f.id === field.id)
      return {
        id: field.id,
        fieldName: field.fieldName,
        fieldCode: field.fieldCode,
        snapshot: {
          listVisible: originalField?.listVisible,
          sensitiveLevel: originalField?.sensitiveLevel,
          maskingRule: originalField?.maskingRule,
          required: originalField?.required,
          permissionRole: originalField?.permissionRole
        }
      }
    })
  }

  console.log('回滚快照:', snapshot)
  // 实际应保存到localStorage或后端，用于一键回滚
  localStorage.setItem(`rollback_snapshot_${snapshot.snapshotId}`, JSON.stringify(snapshot))
}

// 获取数据类型简短文本
const getDataTypeShortText = (dataType) => {
  const texts = {
    'BIGINT': '长整型',
    'VARCHAR(32)': '字符串',
    'VARCHAR(64)': '字符串',
    'VARCHAR(2000)': '长文本',
    'TEXT': '超长文本',
    'DATE': '日期',
    'DATETIME': '日期时间',
    'INT': '整型',
    'DECIMAL(10,2)': '金额',
    'BOOLEAN': '布尔值'
  }
  return texts[dataType] || dataType
}

// 获取字段类型颜色
const getFieldTypeColor = (dataType) => {
  if (dataType.includes('VARCHAR')) return 'success'
  if (dataType.includes('INT')) return ''
  if (dataType.includes('DATE')) return 'info'
  if (dataType.includes('TEXT')) return 'warning'
  if (dataType.includes('DECIMAL')) return 'warning'
  return ''
}

// 获取敏感等级文本
const getSensitiveText = (level) => {
  const texts = {
    normal: '普通',
    internal: '内部',
    sensitive: '敏感',
    highly_sensitive: '高度敏感'
  }
  return texts[level] || level
}

// 获取脱敏规则文本
const getMaskingText = (rule) => {
  const texts = {
    phone: '手机号脱敏',
    idcard: '身份证号脱敏',
    bankcard: '银行卡号脱敏',
    name: '姓名脱敏',
    custom: '自定义掩码'
  }
  return texts[rule] || rule || '未设置'
}
</script>

<style scoped lang="scss">
.batch-settings {
  .operation-tip {
    margin-bottom: 20px;
  }

  .content-wrapper {
    display: flex;
    gap: 24px;
    margin-bottom: 24px;

    .field-selection {
      flex: 1;
      border-right: 1px solid #ebeef5;
      padding-right: 24px;

      .selection-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;

        h4 {
          margin: 0;
          font-size: 15px;
          font-weight: 600;
          color: #303133;
        }

        .selection-actions {
          display: flex;
          gap: 12px;
          align-items: center;
        }
      }

      .filter-bar {
        display: flex;
        gap: 10px;
        margin-bottom: 16px;
      }

      .system-field {
        color: #909399;
        font-style: italic;
      }

      .disabled-field {
        color: #dcdfe6;
      }

      .selection-summary {
        margin-top: 16px;
        padding: 12px;
        background-color: #f5f7fa;
        border-radius: 4px;
        font-size: 13px;
        color: #606266;

        .highlight {
          color: #409eff;
          font-weight: 600;
          font-size: 16px;
        }
      }
    }

    .property-config {
      flex: 1;
      padding-left: 24px;

      h4 {
        margin: 0 0 20px 0;
        font-size: 15px;
        font-weight: 600;
        color: #303133;
      }

      .config-form {
        .config-label {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .config-tip {
          font-size: 12px;
          color: #909399;
          margin-top: 6px;
          line-height: 1.5;

          &.warning-tip {
            color: #e6a23c;
            display: flex;
            align-items: center;
            gap: 4px;
          }

          &.info-tip {
            color: #409eff;
            display: flex;
            align-items: center;
            gap: 4px;
          }
        }

        .option-content {
          display: flex;
          justify-content: space-between;
          align-items: center;

          .option-desc {
            color: #909399;
            font-size: 12px;
            margin-left: 12px;
          }
        }
      }
    }
  }

  .footer-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 20px;
    border-top: 2px solid #ebeef5;

    .impact-info {
      display: flex;
      align-items: center;
      gap: 20px;

      .impact-text {
        font-size: 14px;
        color: #606266;

        .highlight {
          color: #409eff;
          font-weight: 700;
          font-size: 20px;
        }
      }

      .risk-warning {
        display: flex;
        align-items: center;
        gap: 6px;
        color: #f56c6c;
        font-size: 14px;
        font-weight: 600;
        padding: 6px 12px;
        background-color: #fef0f0;
        border-radius: 4px;
      }
    }

    .action-buttons {
      display: flex;
      gap: 12px;
    }
  }
}

.preview-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.after-value {
  color: #67c23a;
  font-weight: 600;
}
</style>
