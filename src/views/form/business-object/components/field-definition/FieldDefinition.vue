<template>
  <div class="field-definition">
    <div class="tab-toolbar">
      <div class="toolbar-left">
        <el-button type="primary" size="default" icon="Plus" @click="handleAddField">新增字段</el-button>
        <el-button size="default" icon="Setting" @click="handleBatchSettings">批量设置</el-button>
        <el-dropdown v-if="!isVersionEdit && businessObjectStatus !== 'archived'" split-button type="default" @command="handleExportCommand">
          <el-icon style="margin-right: 6px"><Download /></el-icon>
          导出字段
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="full">全量导出</el-dropdown-item>
              <el-dropdown-item command="custom">自定义导出</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <el-button
            v-if="!isVersionEdit && businessObjectStatus !== 'archived'"
            size="default"
            icon="Upload"
            @click="handleImportFields"
        >
          导入字段
        </el-button>
      </div>
      <div v-if="isVersionEdit" class="toolbar-right">
        <el-alert type="info" :closable="false" show-icon class="version-tip">
          <template #title>
            <span>新版本编辑模式：原字段禁止删除和修改核心属性，仅可调整列表显示、敏感等级等非核心配置</span>
          </template>
        </el-alert>
      </div>
    </div>

    <el-table
        :data="fieldList"
        border
        style="width: 100%"
        max-height="400"
        row-key="id"
        @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="50" align="center" />

      <el-table-column label="排序" width="60" align="center">
        <template #default="{ row, $index }">
          <div class="sort-controls">
            <el-icon
                class="sort-icon"
                :class="{ disabled: $index === 0 || !canEditField(row) }"
                @click="handleMoveUp($index, row)"
            >
              <Top />
            </el-icon>
            <el-icon
                class="sort-icon"
                :class="{ disabled: $index === fieldList.length - 1 || !canEditField(row) }"
                @click="handleMoveDown($index, row)"
            >
              <Bottom />
            </el-icon>
          </div>
        </template>
      </el-table-column>

      <el-table-column prop="fieldName" label="字段名称" min-width="200">
        <template #default="{ row }">
          <span :class="{ 'system-field': row.system }">{{ row.fieldName }}</span>
          <el-tag v-if="row.system" size="small" type="info" style="margin-left: 6px">系统</el-tag>
          <el-tag v-if="row.isNewField" size="small" type="success" style="margin-left: 6px">新增</el-tag>
          <el-tag v-if="row.status === 'deprecated'" size="small" type="warning" style="margin-left: 6px">已废弃</el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="fieldCode" label="数据库列名" min-width="150">
        <template #default="{ row }">
          <span :class="{ 'system-field': row.system }">{{ row.fieldCode }}</span>
        </template>
      </el-table-column>

      <el-table-column prop="dataType" label="字段类型" min-width="140">
        <template #default="{ row }">
          <el-tag size="small" :type="getFieldTypeTag(row.dataType)">
            {{ getDataTypeText(row.dataType) }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="length" label="长度" min-width="70" align="center">
        <template #default="{ row }">
          <span>{{ row.length || '-' }}</span>
        </template>
      </el-table-column>

      <el-table-column prop="required" label="必填" min-width="80" align="center">
        <template #default="{ row }">
          <el-tooltip
              content="开启后，表单提交时该字段必须填写"
              placement="top"
          >
            <el-switch
                v-if="canEditCoreProperty(row)"
                v-model="row.required"
                @change="handleRequiredChange(row)"
            />
            <el-icon v-else-if="row.required" style="color: #67c23a"><CircleCheckFilled /></el-icon>
            <span v-else style="color: #909399">-</span>
          </el-tooltip>
        </template>
      </el-table-column>

      <el-table-column prop="unique" label="唯一" min-width="80" align="center">
        <template #default="{ row }">
          <el-tooltip
              content="开启后，该字段值在全表中不可重复，系统将自动创建唯一索引"
              placement="top"
          >
            <el-switch
                v-if="canEditCoreProperty(row) && !row.system"
                v-model="row.unique"
                @change="handleUniqueChange(row)"
            />
            <el-icon v-else-if="row.unique" style="color: #409EFF"><CircleCheckFilled /></el-icon>
            <span v-else style="color: #909399">-</span>
          </el-tooltip>
        </template>
      </el-table-column>

      <el-table-column prop="listVisible" label="列表显示" min-width="90" align="center">
        <template #default="{ row }">
          <el-tooltip
              content="开启后，该字段将在审批列表、数据列表中展示"
              placement="top"
          >
            <el-switch
                v-if="canEditField(row)"
                v-model="row.listVisible"
                :disabled="row.system && !canEditNonCoreProperty(row)"
            />
            <el-icon v-else-if="row.listVisible" style="color: #67c23a"><CircleCheckFilled /></el-icon>
            <span v-else style="color: #909399">-</span>
          </el-tooltip>
        </template>
      </el-table-column>

      <el-table-column prop="sensitiveLevel" label="敏感等级" min-width="110" align="center">
        <template #default="{ row }">
          <el-tag :type="getSensitiveType(row.sensitiveLevel)" size="small">
            {{ getSensitiveText(row.sensitiveLevel) }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column v-if="isVersionEdit" prop="changeType" label="变更类型" min-width="100" align="center">
        <template #default="{ row }">
          <el-tag v-if="row.changeType" :type="getChangeTypeTag(row.changeType)" size="small">
            {{ getChangeTypeText(row.changeType) }}
          </el-tag>
          <span v-else style="color: #909399">-</span>
        </template>
      </el-table-column>

      <el-table-column label="操作" :width="isVersionEdit ? '420' : '360'" align="center" fixed="right">
        <template #default="{ row, $index }">
          <div class="action-buttons">
            <!-- 新增字段：完全开放编辑 -->
            <el-button
                v-if="canEditField(row)"
                size="small"
                type="primary"
                plain
                icon="Edit"
                @click="handleEditField(row)"
                class="action-btn edit-btn"
            >
              编辑
            </el-button>

            <!-- 原历史字段：限制编辑按钮（仅可编辑非核心属性） -->
            <el-button
                v-if="!canEditField(row) && canEditNonCoreProperty(row) && !row.system"
                size="small"
                type="primary"
                plain
                icon="Edit"
                @click="handleEditNonCoreProperty(row)"
                class="action-btn edit-btn limited-edit-btn"
            >
              编辑
            </el-button>

            <!-- 系统字段锁定标识 -->
            <el-tag
                v-if="row.system"
                size="small"
                type="info"
                effect="plain"
                class="lock-tag"
            >
              <el-icon><Lock /></el-icon>
              <span>锁定</span>
            </el-tag>

            <!-- 删除按钮：物理删除 -->
            <el-button
                v-if="!row.system && canDeleteField(row)"
                size="small"
                type="danger"
                plain
                icon="Delete"
                @click="handleDeleteField(row)"
                class="action-btn delete-btn"
            >
              删除
            </el-button>

            <!-- 删除按钮：禁用状态（原字段/已归档） -->
            <el-button
                v-if="!row.system && !canDeleteField(row) && row.status !== 'deprecated'"
                size="small"
                disabled
                icon="Delete"
                class="action-btn disabled-btn"
            >
              删除
            </el-button>

            <!-- 废弃按钮：软删除 -->
            <el-button
                v-if="!row.system && canDeprecateField(row)"
                size="small"
                type="warning"
                plain
                icon="CircleClose"
                @click="handleDeprecateField(row)"
                class="action-btn deprecate-btn"
            >
              废弃
            </el-button>

            <!-- 废弃按钮：禁用状态（原字段/已归档/已废弃） -->
            <el-button
                v-if="!row.system && !canDeprecateField(row) && row.status !== 'deprecated'"
                size="small"
                disabled
                icon="CircleClose"
                class="action-btn disabled-btn"
            >
              废弃
            </el-button>

            <!-- 引用查看按钮 -->
            <el-button
                size="small"
                type="info"
                plain
                icon="Connection"
                @click="handleViewReferences(row)"
                class="action-btn reference-btn"
            >
              引用
            </el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <!-- 批量操作弹窗 -->
    <el-dialog
        v-model="batchDialogVisible"
        title="批量设置"
        width="600px"
        :close-on-click-modal="false"
    >
      <el-form :model="batchForm" label-width="120px">
        <el-form-item label="已选字段">
          <el-tag v-for="field in selectedFields" :key="field.id" style="margin-right: 8px; margin-bottom: 8px">
            {{ field.fieldName }}
          </el-tag>
          <span v-if="selectedFields.length === 0" style="color: #909399">未选择字段</span>
        </el-form-item>

        <el-form-item label="敏感等级">
          <el-radio-group v-model="batchForm.sensitiveLevel">
            <el-radio label="normal">普通</el-radio>
            <el-radio label="internal">内部</el-radio>
            <el-radio label="sensitive">敏感</el-radio>
            <el-radio label="highly_sensitive">高度敏感</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="列表显示">
          <el-radio-group v-model="batchForm.listVisible">
            <el-radio :label="true">开启</el-radio>
            <el-radio :label="false">关闭</el-radio>
            <el-radio label="unchanged">不修改</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="batchDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleBatchConfirm">确定</el-button>
      </template>
    </el-dialog>

    <!-- 引用查看弹窗 -->
    <el-dialog
        v-model="referenceDialogVisible"
        title="字段引用关系"
        width="700px"
        :close-on-click-modal="false"
    >
      <div v-if="currentField" class="reference-content">
        <div class="reference-header">
          <span class="field-name">{{ currentField.fieldName }}</span>
          <span class="field-code">({{ currentField.fieldCode }})</span>
        </div>

        <el-tabs v-model="referenceTab">
          <el-tab-pane label="表单引用" name="forms">
            <el-table :data="references.forms" border style="width: 100%">
              <el-table-column prop="formName" label="表单名称" />
              <el-table-column prop="status" label="状态" width="100">
                <template #default="{ row }">
                  <el-tag size="small" :type="row.status === 'enabled' ? 'success' : 'info'">
                    {{ row.status === 'enabled' ? '启用' : '停用' }}
                  </el-tag>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>

          <el-tab-pane label="流程引用" name="processes">
            <el-table :data="references.processes" border style="width: 100%">
              <el-table-column prop="processName" label="流程名称" />
              <el-table-column prop="nodeName" label="节点名称" />
              <el-table-column prop="usage" label="用途" />
            </el-table>
          </el-tab-pane>

          <el-tab-pane label="规则引用" name="rules">
            <el-table :data="references.rules" border style="width: 100%">
              <el-table-column prop="ruleName" label="规则名称" />
              <el-table-column prop="ruleType" label="规则类型" />
            </el-table>
          </el-tab-pane>

          <el-tab-pane label="报表引用" name="reports">
            <el-empty v-if="references.reports.length === 0" description="暂无报表引用" />
            <el-table v-else :data="references.reports" border style="width: 100%">
              <el-table-column prop="reportName" label="报表名称" />
              <el-table-column prop="chartType" label="图表类型" />
            </el-table>
          </el-tab-pane>
        </el-tabs>
      </div>

      <template #footer>
        <el-button @click="referenceDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 批量设置弹窗 -->
    <BatchSettingsDialog
        v-model="batchSettingsVisible"
        :field-list="fieldList"
        :business-object-status="businessObjectStatus"
        :is-version-edit="isVersionEdit"
        @confirm="handleBatchSettingsConfirm"
    />

    <!-- 导入字段弹窗 -->
    <ImportDialog
        v-model="importDialogVisible"
        :business-object-status="businessObjectStatus"
        :existing-fields="fieldList"
        @confirm="handleImportConfirm"
    />
    <!-- 自定义导出弹窗 -->
    <CustomExportDialog
        v-model="customExportVisible"
        :field-list="fieldList"
        :business-object-name="businessObjectName"
        :version="versionInfo"
        :business-domain="businessDomain"
        :status="businessObjectStatus"
        @confirm="handleCustomExportConfirm"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Top, Bottom, CircleCheckFilled, Download, Upload, Lock, CircleClose, WarningFilled, InfoFilled } from '@element-plus/icons-vue'
import BatchSettingsDialog from './BatchSettingsDialog.vue'
import ImportDialog from './ImportDialog.vue'
import CustomExportDialog from './CustomExportDialog.vue'

const props = defineProps({
  isVersionEdit: {
    type: Boolean,
    default: false
  },
  businessObjectStatus: {
    type: String,
    default: 'draft'
  },
  businessObjectName: {
    type: String,
    default: '请假申请'
  },
  versionInfo: {
    type: String,
    default: 'V1.0'
  },
  businessDomain: {
    type: String,
    default: '人事类'
  }
})

const emit = defineEmits(['add-field', 'edit-field', 'edit-non-core-property', 'change', 'deprecate-field'])

// 批量设置弹窗
const batchSettingsVisible = ref(false)

// 导入弹窗
const importDialogVisible = ref(false)

// 字段列表（模拟数据，实际应从父组件传入）
const fieldList = ref([
  {
    id: 1,
    fieldName: '主键 ID',
    fieldCode: 'id',
    dataType: 'BIGINT',
    length: 20,
    required: true,
    unique: true,
    listVisible: false,
    sensitiveLevel: 'normal',
    system: true,
    isNewField: false,
    status: 'active',
    sort: 1,
    changeType: null,
    description: ''
  },
  {
    id: 2,
    fieldName: '单据编号',
    fieldCode: 'bill_no',
    dataType: 'VARCHAR(64)',
    length: 64,
    required: true,
    unique: true,
    listVisible: true,
    sensitiveLevel: 'normal',
    system: true,
    isNewField: false,
    status: 'active',
    sort: 2,
    changeType: null,
    description: ''
  },
  {
    id: 3,
    fieldName: '申请人',
    fieldCode: 'applicant_id',
    dataType: 'VARCHAR(32)',
    length: 32,
    required: true,
    unique: false,
    listVisible: true,
    sensitiveLevel: 'internal',
    system: true,
    isNewField: false,
    status: 'active',
    sort: 3,
    changeType: null,
    description: ''
  },
  {
    id: 4,
    fieldName: '申请部门',
    fieldCode: 'apply_dept_id',
    dataType: 'VARCHAR(32)',
    length: 32,
    required: false,
    unique: false,
    listVisible: true,
    sensitiveLevel: 'internal',
    system: true,
    isNewField: false,
    status: 'active',
    sort: 4,
    changeType: null,
    description: ''
  },
  {
    id: 5,
    fieldName: '申请日期',
    fieldCode: 'apply_date',
    dataType: 'DATE',
    length: null,
    required: true,
    unique: false,
    listVisible: true,
    sensitiveLevel: 'normal',
    system: true,
    isNewField: false,
    status: 'active',
    sort: 5,
    changeType: null,
    description: ''
  },
  {
    id: 6,
    fieldName: '车辆类型',
    fieldCode: 'vehicle_type',
    dataType: 'VARCHAR(64)',
    length: 64,
    required: true,
    unique: false,
    listVisible: true,
    sensitiveLevel: 'normal',
    system: false,
    isNewField: false,
    status: 'active',
    sort: 6,
    changeType: null,
    description: '车辆的品牌类型，如轿车、SUV、商务车等'
  },
  {
    id: 7,
    fieldName: '车牌号码',
    fieldCode: 'license_plate',
    dataType: 'VARCHAR(32)',
    length: 32,
    required: true,
    unique: true,
    listVisible: true,
    sensitiveLevel: 'normal',
    system: false,
    isNewField: false,
    status: 'active',
    sort: 7,
    changeType: null,
    description: ''
  },
  {
    id: 8,
    fieldName: '用车事由',
    fieldCode: 'usage_reason',
    dataType: 'VARCHAR(2000)',
    length: 2000,
    required: true,
    unique: false,
    listVisible: true,
    sensitiveLevel: 'normal',
    system: false,
    isNewField: false,
    status: 'active',
    sort: 8,
    changeType: null,
    description: ''
  },
  {
    id: 9,
    fieldName: '开始时间',
    fieldCode: 'start_time',
    dataType: 'DATETIME',
    length: null,
    required: true,
    unique: false,
    listVisible: true,
    sensitiveLevel: 'normal',
    system: false,
    isNewField: false,
    status: 'active',
    sort: 9,
    changeType: null,
    description: ''
  },
  {
    id: 10,
    fieldName: '结束时间',
    fieldCode: 'end_time',
    dataType: 'DATETIME',
    length: null,
    required: true,
    unique: false,
    listVisible: true,
    sensitiveLevel: 'normal',
    system: false,
    isNewField: false,
    status: 'active',
    sort: 10,
    changeType: null,
    description: ''
  },
  {
    id: 11,
    fieldName: '目的地',
    fieldCode: 'destination',
    dataType: 'VARCHAR(255)',
    length: 255,
    required: false,
    unique: false,
    listVisible: true,
    sensitiveLevel: 'normal',
    system: false,
    isNewField: false,
    status: 'active',
    sort: 11,
    changeType: null,
    description: ''
  },
  {
    id: 12,
    fieldName: '随行人数',
    fieldCode: 'passenger_count',
    dataType: 'INT',
    length: 11,
    required: false,
    unique: false,
    listVisible: true,
    sensitiveLevel: 'normal',
    system: false,
    isNewField: false,
    status: 'active',
    sort: 12,
    changeType: null,
    description: ''
  },
  {
    id: 13,
    fieldName: '紧急联系人',
    fieldCode: 'emergency_contact',
    dataType: 'VARCHAR(64)',
    length: 64,
    required: false,
    unique: false,
    listVisible: false,
    sensitiveLevel: 'sensitive',
    system: false,
    isNewField: false,
    status: 'active',
    sort: 13,
    changeType: null,
    description: ''
  },
  {
    id: 14,
    fieldName: '联系电话',
    fieldCode: 'contact_phone',
    dataType: 'VARCHAR(32)',
    length: 32,
    required: false,
    unique: false,
    listVisible: false,
    sensitiveLevel: 'sensitive',
    system: false,
    isNewField: false,
    status: 'active',
    sort: 14,
    changeType: null,
    description: ''
  },
  {
    id: 15,
    fieldName: '备注',
    fieldCode: 'remark',
    dataType: 'VARCHAR(2000)',
    length: 2000,
    required: false,
    unique: false,
    listVisible: false,
    sensitiveLevel: 'normal',
    system: false,
    isNewField: false,
    status: 'active',
    sort: 15,
    changeType: null,
    description: ''
  },
  {
    id: 16,
    fieldName: '审批状态',
    fieldCode: 'approval_status',
    dataType: 'VARCHAR(32)',
    length: 32,
    required: true,
    unique: false,
    listVisible: true,
    sensitiveLevel: 'normal',
    system: true,
    isNewField: false,
    status: 'active',
    sort: 16,
    changeType: null,
    description: ''
  },
  {
    id: 17,
    fieldName: '旧字段（已废弃）',
    fieldCode: 'old_field',
    dataType: 'VARCHAR(64)',
    length: 64,
    required: false,
    unique: false,
    listVisible: false,
    sensitiveLevel: 'normal',
    system: false,
    isNewField: false,
    status: 'deprecated',
    sort: 17,
    changeType: null,
    description: ''
  },
  // 新增字段模拟数据（版本编辑模式下展示）
  {
    id: 101,
    fieldName: '加班抵扣时长',
    fieldCode: 'overtime_offset_hours',
    dataType: 'DECIMAL(10,2)',
    length: 10,
    required: false,
    unique: false,
    listVisible: true,
    sensitiveLevel: 'normal',
    system: false,
    isNewField: true,
    status: 'active',
    sort: 18,
    changeType: '新增',
    description: '加班抵扣的时长，单位：小时'
  },
  {
    id: 102,
    fieldName: '发票类型',
    fieldCode: 'invoice_type',
    dataType: 'VARCHAR(64)',
    length: 64,
    required: true,
    unique: false,
    listVisible: true,
    sensitiveLevel: 'normal',
    system: false,
    isNewField: true,
    status: 'active',
    sort: 19,
    changeType: '新增',
    description: '报销发票类型：增值税普票、增值税专票、电子发票等'
  },
  {
    id: 103,
    fieldName: '是否跨域',
    fieldCode: 'is_cross_domain',
    dataType: 'BOOLEAN',
    length: null,
    required: true,
    unique: false,
    listVisible: true,
    sensitiveLevel: 'normal',
    system: false,
    isNewField: true,
    status: 'active',
    sort: 20,
    changeType: '新增',
    description: '标识本次用车是否跨域（跨城市）'
  }
])

// 批量操作相关
const batchDialogVisible = ref(false)
const selectedFields = ref([])
const batchForm = ref({
  sensitiveLevel: 'normal',
  listVisible: 'unchanged'
})

// 引用查看相关
const referenceDialogVisible = ref(false)
const currentField = ref(null)
const referenceTab = ref('forms')
const references = ref({
  forms: [
    { formName: '请假申请表单', status: 'enabled' },
    { formName: '加班申请表单', status: 'enabled' }
  ],
  processes: [
    { processName: '请假审批流程', nodeName: '部门经理审批', usage: '条件判断' }
  ],
  rules: [
    { ruleName: '请假天数校验', ruleType: '数据校验' }
  ],
  reports: []
})

// 判断字段是否可编辑（新增字段完全开放，原字段禁止）
const canEditField = (row) => {
  if (row.system) return false
  if (row.status === 'deprecated') return false

  // 版本编辑模式下，仅新增字段可完全编辑
  if (props.isVersionEdit && !row.isNewField) {
    return false
  }

  return true
}

// 判断是否可编辑核心属性（类型、长度、必填、唯一等）
const canEditCoreProperty = (row) => {
  if (row.system) return false
  // 版本编辑模式下，仅新增字段可编辑核心属性
  if (props.isVersionEdit && !row.isNewField) return false
  if (row.status === 'deprecated') return false
  return true
}

// 判断是否可编辑非核心属性（列表显示、敏感等级等）
const canEditNonCoreProperty = (row) => {
  if (row.system) return false
  if (row.status === 'deprecated') return false
  // 版本编辑模式下，原字段也可编辑非核心属性
  return true
}

// 判断字段是否可删除（物理删除）
const canDeleteField = (row) => {
  if (row.system) return false
  if (row.status === 'deprecated') return false

  // 草稿状态：所有非系统字段可删除
  if (props.businessObjectStatus === 'draft') return true

  // 已归档状态：禁止删除
  if (props.businessObjectStatus === 'archived') return false

  // 已发布/编辑新版本：仅新增字段可删除
  if (props.isVersionEdit && !row.isNewField) return false
  if (props.businessObjectStatus === 'published' && !row.isNewField) return false

  return true
}

// 判断字段是否可废弃（软删除）
const canDeprecateField = (row) => {
  if (row.system) return false
  if (row.status === 'deprecated') return false

  // 草稿状态：所有非系统字段可废弃
  if (props.businessObjectStatus === 'draft') return true

  // 已归档状态：禁止废弃
  if (props.businessObjectStatus === 'archived') return false

  // 已发布/编辑新版本：仅新增字段可废弃
  if (props.isVersionEdit && !row.isNewField) return false
  if (props.businessObjectStatus === 'published' && !row.isNewField) return false

  return true
}

// 新增字段
const handleAddField = () => {
  emit('add-field')
}

// 编辑字段（新增字段完全开放）
const handleEditField = (row) => {
  emit('edit-field', row)
}

// 编辑非核心属性（原历史字段限制开放）
const handleEditNonCoreProperty = (row) => {
  emit('edit-non-core-property', row)
}

// 删除字段（带引用校验）
const handleDeleteField = async (row) => {
  // 执行全链路引用校验
  const refs = await checkFieldReferences(row)

  if (refs.hasReferences) {
    const refSummary = []
    if (refs.forms.length > 0) refSummary.push(`${refs.forms.length}个表单`)
    if (refs.processes.length > 0) refSummary.push(`${refs.processes.length}个审批流程`)
    if (refs.rules.length > 0) refSummary.push(`${refs.rules.length}个数据规则`)
    if (refs.reports.length > 0) refSummary.push(`${refs.reports.length}个报表`)

    ElMessageBox.alert(
        `该字段已被${refSummary.join('、')}引用，无法删除。\n\n请先解除所有引用后再操作。`,
        '删除失败',
        {
          confirmButtonText: '查看引用详情',
          type: 'error'
        }
    ).then(() => {
      handleViewReferences(row)
    }).catch(() => {})
    return
  }

  // 无引用，二次确认
  ElMessageBox.confirm(
      `确定要删除字段"${row.fieldName}"吗？此操作不可恢复！`,
      '删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
  ).then(() => {
    fieldList.value = fieldList.value.filter(f => f.id !== row.id)
    ElMessage.success('删除成功')
    emit('change', fieldList.value)
  }).catch(() => {})
}

// 废弃字段
const handleDeprecateField = (row) => {
  // 版本编辑模式下，禁止废弃原字段（双重保障）
  if (props.isVersionEdit && !row.isNewField) {
    ElMessageBox.alert(
        '原正式版本的字段禁止废弃，否则会导致历史数据丢失、归档凭证失效。\n\n如需隐藏该字段，请关闭"列表显示"或在表单设计器中隐藏。',
        '禁止废弃原字段',
        {
          confirmButtonText: '我知道了',
          type: 'error'
        }
    )
    return
  }

  // 已发布状态，禁止废弃原字段（双重保障）
  if (props.businessObjectStatus === 'published' && !row.isNewField) {
    ElMessageBox.alert(
        '已发布状态的字段禁止废弃，否则会导致历史数据丢失。\n\n如需隐藏该字段，请关闭"列表显示"或在表单设计器中隐藏。',
        '禁止废弃原字段',
        {
          confirmButtonText: '我知道了',
          type: 'error'
        }
    )
    return
  }

  ElMessageBox.confirm(
      `<div class="deprecate-confirm-content">
        <div class="confirm-header">
          <el-icon class="header-icon"><WarningFilled /></el-icon>
          <span class="header-title">废弃字段确认</span>
        </div>
        <div class="confirm-body">
          <p class="field-info">确定要废弃字段 <span class="field-name">"${row.fieldName}"</span> 吗？</p>
          <div class="impact-list">
            <p class="impact-title">废弃后该字段将：</p>
            <ul class="impact-items">
              <li><span class="impact-icon">🚫</span> 禁止新增数据</li>
              <li><span class="impact-icon">👁️</span> 表单中隐藏显示</li>
              <li><span class="impact-icon">📦</span> 历史数据保留可查看</li>
            </ul>
          </div>
          <div class="risk-tip">
            <el-icon><InfoFilled /></el-icon>
            <span>此操作可恢复，但建议谨慎操作</span>
          </div>
        </div>
      </div>`,
      '废弃确认',
      {
        dangerouslyUseHTMLString: true,
        confirmButtonText: '确定废弃',
        cancelButtonText: '取消',
        confirmButtonClass: 'deprecate-confirm-btn',
        cancelButtonClass: 'deprecate-cancel-btn',
        customClass: 'deprecate-confirm-dialog'
      }
  ).then(() => {
    row.status = 'deprecated'
    row.changeType = '废弃'
    ElMessage.success('字段已废弃')
    emit('deprecate-field', row)
  }).catch(() => {})
}

// 查看引用关系
const handleViewReferences = async (row) => {
  currentField.value = row
  references.value = await checkFieldReferences(row)
  referenceDialogVisible.value = true
}

// 检查字段引用（模拟API调用）
const checkFieldReferences = async (row) => {
  // 实际应调用后端API
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        hasReferences: references.value.forms.length > 0 || references.value.processes.length > 0,
        ...references.value
      })
    }, 300)
  })
}

// 必填属性变更
const handleRequiredChange = (row) => {
  if (props.isVersionEdit && !row.isNewField && row.required) {
    ElMessageBox.prompt('从非必填改为必填，请设置该字段的默认值', '设置默认值', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputPattern: /.+/,
      inputErrorMessage: '默认值不能为空'
    }).then(({ value }) => {
      row.defaultValue = value
      ElMessage.success('已设置默认值')
    }).catch(() => {
      row.required = false
    })
  }
}

// 唯一属性变更（二次确认）
const handleUniqueChange = (row) => {
  if (row.unique) {
    ElMessageBox.confirm(
        `开启"唯一"属性后，系统将自动为该字段创建唯一索引。\n\n若表中已存在重复数据，开启将失败。是否继续？`,
        '开启唯一索引',
        {
          confirmButtonText: '确定开启',
          cancelButtonText: '取消',
          type: 'warning'
        }
    ).then(() => {
      ElMessage.success('唯一索引创建成功')
    }).catch(() => {
      row.unique = false
    })
  }
}

// 上移
const handleMoveUp = (index, row) => {
  if (index === 0 || !canEditField(row)) return

  const temp = fieldList.value[index]
  fieldList.value[index] = fieldList.value[index - 1]
  fieldList.value[index - 1] = temp

  updateSortOrder()
  emit('change', fieldList.value)
}

// 下移
const handleMoveDown = (index, row) => {
  if (index === fieldList.value.length - 1 || !canEditField(row)) return

  const temp = fieldList.value[index]
  fieldList.value[index] = fieldList.value[index + 1]
  fieldList.value[index + 1] = temp

  updateSortOrder()
  emit('change', fieldList.value)
}

// 更新排序序号
const updateSortOrder = () => {
  fieldList.value.forEach((field, index) => {
    field.sort = index + 1
  })
}

// 批量操作
const handleBatchOperation = () => {
  if (selectedFields.value.length === 0) {
    ElMessage.warning('请先选择要批量设置的字段')
    return
  }
  batchDialogVisible.value = true
}

// 批量确认
const handleBatchConfirm = () => {
  selectedFields.value.forEach(field => {
    field.sensitiveLevel = batchForm.value.sensitiveLevel

    if (batchForm.value.listVisible !== 'unchanged') {
      field.listVisible = batchForm.value.listVisible
    }
  })

  ElMessage.success(`已批量设置${selectedFields.value.length}个字段`)
  batchDialogVisible.value = false
  emit('change', fieldList.value)
}

// 批量设置确认
const handleBatchSettingsConfirm = (updatedFields) => {
  // 更新字段列表
  updatedFields.forEach(updatedField => {
    const index = fieldList.value.findIndex(f => f.id === updatedField.id)
    if (index !== -1) {
      Object.assign(fieldList.value[index], updatedField)
    }
  })

  ElMessage.success('批量设置成功')
  emit('change', fieldList.value)
}

// 导入确认
const handleImportConfirm = (newFields) => {
  // 添加新字段到列表
  const maxId = Math.max(...fieldList.value.map(f => f.id), 0)
  newFields.forEach((field, index) => {
    field.id = maxId + index + 1
    field.isNewField = true
    field.status = 'active'
    field.sort = fieldList.value.length + index + 1
    fieldList.value.push(field)
  })

  ElMessage.success(`成功导入${newFields.length}个字段`)
  emit('change', fieldList.value)
}

// 表格选择变化
const handleSelectionChange = (selection) => {
  selectedFields.value = selection
}

// 批量设置
const handleBatchSettings = () => {
  if (props.businessObjectStatus === 'archived') {
    ElMessage.warning('已归档状态不支持批量设置')
    return
  }
  batchSettingsVisible.value = true
}

// 导入字段
const handleImportFields = () => {
  if (props.businessObjectStatus === 'archived') {
    ElMessage.warning('已归档状态不支持导入字段')
    return
  }
  importDialogVisible.value = true
}

// 导出命令处理
const handleExportCommand = (command) => {
  if (command === 'full') {
    handleFullExport()
  } else if (command === 'custom') {
    handleCustomExport()
  }
}

// 全量导出
const handleFullExport = () => {
  const exportData = fieldList.value.map(field => ({
    '字段名称': field.fieldName,
    '数据库列名': field.fieldCode,
    '字段类型': getDataTypeText(field.dataType),
    '长度': field.length || '-',
    '必填': field.required ? '是' : '否',
    '唯一': field.unique ? '是' : '否',
    '列表显示': field.listVisible ? '是' : '否',
    '敏感等级': getSensitiveText(field.sensitiveLevel),
    '系统内置': field.system ? '是' : '否',
    '状态': field.status === 'deprecated' ? '已废弃' : '正常',
    '排序': field.sort
  }))

  // 添加导出说明页
  const exportInfo = [
    ['业务对象名称', '请假申请'],
    ['版本号', props.isVersionEdit ? 'V1.1（草稿）' : 'V1.0'],
    ['所属业务域', '人事类'],
    ['导出人', '当前用户'],
    ['导出时间', new Date().toLocaleString('zh-CN')],
    ['状态', props.businessObjectStatus === 'draft' ? '草稿' : '已发布']
  ]

  downloadExcel(exportData, `请假申请_字段配置_${formatDate(new Date())}.xlsx`, exportInfo)
  ElMessage.success('导出成功')
}

// 自定义导出弹窗
const customExportVisible = ref(false)

// 自定义导出
const handleCustomExport = () => {
  if (props.businessObjectStatus === 'archived') {
    ElMessage.warning('已归档状态仅支持全量导出')
    return
  }
  customExportVisible.value = true
}

// 自定义导出确认
const handleCustomExportConfirm = (exportConfig) => {
  const { selectedFields, selectedColumns, format } = exportConfig

  // 过滤选中的字段
  const filteredFields = fieldList.value.filter(field =>
      selectedFields.includes(field.id)
  )

  // 构建导出数据
  const exportData = filteredFields.map(field => {
    const rowData = {}

    if (selectedColumns.includes('fieldName')) {
      rowData['字段名称'] = field.fieldName
    }
    if (selectedColumns.includes('fieldCode')) {
      rowData['数据库列名'] = field.fieldCode
    }
    if (selectedColumns.includes('dataType')) {
      rowData['字段类型'] = getDataTypeText(field.dataType)
    }
    if (selectedColumns.includes('length')) {
      rowData['长度'] = field.length || '-'
    }
    if (selectedColumns.includes('required')) {
      rowData['必填'] = field.required ? '是' : '否'
    }
    if (selectedColumns.includes('unique')) {
      rowData['唯一'] = field.unique ? '是' : '否'
    }
    if (selectedColumns.includes('listVisible')) {
      rowData['列表显示'] = field.listVisible ? '是' : '否'
    }
    if (selectedColumns.includes('sensitiveLevel')) {
      rowData['敏感等级'] = getSensitiveText(field.sensitiveLevel)
    }
    if (selectedColumns.includes('system')) {
      rowData['系统内置'] = field.system ? '是' : '否'
    }
    if (selectedColumns.includes('status')) {
      rowData['状态'] = field.status === 'deprecated' ? '已废弃' : '正常'
    }
    if (selectedColumns.includes('sort')) {
      rowData['排序'] = field.sort
    }

    return rowData
  })

  // 生成文件名
  const extension = format === 'pdf' ? 'pdf' : 'xlsx'
  const filename = `${props.businessObjectName}_字段配置_${formatDate(new Date())}.${extension}`

  // 导出信息
  const exportInfo = [
    ['业务对象名称', props.businessObjectName],
    ['版本号', props.versionInfo],
    ['所属业务域', props.businessDomain],
    ['导出人', '当前用户'],
    ['导出时间', new Date().toLocaleString('zh-CN')],
    ['导出格式', format === 'pdf' ? 'PDF（审计存档）' : 'Excel'],
    ['状态', props.businessObjectStatus === 'draft' ? '草稿' : '已发布'],
    ['导出字段数', filteredFields.length]
  ]

  // 下载文件
  if (format === 'pdf') {
    downloadPDF(exportData, filename, exportInfo)
  } else {
    downloadExcel(exportData, filename, exportInfo)
  }

  ElMessage.success(`成功导出${filteredFields.length}个字段，格式：${format.toUpperCase()}`)
}

// 下载PDF文件（审计存档格式）
const downloadPDF = (data, filename, info) => {
  console.log('导出PDF数据:', data)
  console.log('文件名:', filename)
  console.log('导出信息:', info)

  // 实际项目中应使用 jsPDF 或 pdfmake 库生成PDF
  // PDF格式用于审计存档，不可修改
  ElMessage.info('PDF导出功能需要集成jsPDF库，当前为模拟实现')
}

// 下载Excel文件（简化实现，实际应使用xlsx库）
const downloadExcel = (data, filename, info = null) => {
  // 实际项目中应使用 xlsx 或 exceljs 库生成真正的Excel文件
  // 这里仅提供模拟实现
  console.log('导出数据:', data)
  console.log('文件名:', filename)
  console.log('导出信息:', info)

  // 模拟下载
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename.replace('.xlsx', '.json') // 模拟环境用json替代
  a.click()
  URL.revokeObjectURL(url)
}

// 格式化日期
const formatDate = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}${month}${day}`
}

// 获取字段类型标签颜色
const getFieldTypeTag = (dataType) => {
  const tags = {
    'BIGINT': '',
    'VARCHAR(32)': 'success',
    'VARCHAR(64)': 'success',
    'VARCHAR(2000)': 'warning',
    'TEXT': 'warning',
    'DATE': 'info',
    'DATETIME': 'info',
    'INT': '',
    'DECIMAL(10,2)': 'warning',
    'BOOLEAN': 'info'
  }
  return tags[dataType] || ''
}

// 获取数据类型文本
const getDataTypeText = (dataType) => {
  const texts = {
    'BIGINT': '长整型',
    'VARCHAR(32)': '字符串(32)',
    'VARCHAR(64)': '字符串(64)',
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

// 获取敏感等级类型
const getSensitiveType = (level) => {
  const types = {
    normal: 'info',
    internal: '',
    sensitive: 'warning',
    highly_sensitive: 'danger'
  }
  return types[level] || 'info'
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

// 获取变更类型标签
const getChangeTypeTag = (type) => {
  const tags = {
    '新增': 'success',
    '修改': 'warning',
    '废弃': 'danger',
    '无变化': 'info'
  }
  return tags[type] || 'info'
}

// 获取变更类型文本
const getChangeTypeText = (type) => {
  return type || '无变化'
}

// 更新字段变更类型（监听字段变化）
const updateFieldChangeType = (field) => {
  if (!props.isVersionEdit) return

  if (field.isNewField) {
    field.changeType = '新增'
  } else if (field.status === 'deprecated') {
    field.changeType = '废弃'
  } else {
    // 检查是否有非核心属性修改
    const hasNonCoreChange = field.listVisible !== field.originalListVisible ||
        field.sensitiveLevel !== field.originalSensitiveLevel
    field.changeType = hasNonCoreChange ? '修改' : '无变化'
  }
}

defineExpose({
  fieldList,
  updateFieldChangeType
})
</script>

<style scoped lang="scss">.field-definition {
  .tab-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    .toolbar-left {
      display: flex;
      gap: 12px;
    }

    .toolbar-right {
      flex: 1;
      margin-left: 16px;
    }
  }

  .sort-controls {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;

    .sort-icon {
      font-size: 14px;
      color: #409eff;
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        color: #667eea;
        transform: scale(1.2);
      }

      &.disabled {
        color: #dcdfe6;
        cursor: not-allowed;

        &:hover {
          transform: none;
        }
      }
    }
  }

  .system-field {
    color: #909399;
    font-style: italic;
  }

  // 新增字段行高亮
  :deep(.el-table__row) {
    &.new-field-row {
      background-color: rgba(103, 194, 58, 0.06) !important;

      &:hover {
        background-color: rgba(103, 194, 58, 0.1) !important;
      }
    }
  }

  // 操作按钮统一样式
  .action-buttons {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    white-space: nowrap;
    flex-wrap: nowrap;

    .action-btn {
      margin: 0;
      padding: 6px 12px;
      font-size: 13px;
      border-radius: 6px;
      transition: all 0.3s;

      &.edit-btn {
        &:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
        }
      }

      &.delete-btn {
        &:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(245, 108, 108, 0.3);
        }
      }

      &.deprecate-btn {
        &:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(230, 162, 60, 0.3);
        }
      }

      &.reference-btn {
        &:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(144, 147, 153, 0.3);
        }
      }

      // 禁用按钮样式（与锁定标签一致）
      &.disabled-btn {
        background-color: #f5f7fa;
        border-color: #e4e7ed;
        color: #c0c4cc;
        cursor: not-allowed;

        &:hover {
          transform: none;
          box-shadow: none;
        }
      }
    }

    // 受限编辑按钮样式优化
    .limited-edit-btn {
      background-color: #f5f7fa;
      border-color: #dcdfe6;
      color: #606266;

      &:hover {
        background-color: #ecf5ff;
        border-color: #409eff;
        color: #409eff;
      }
    }

    // 锁定标签样式
    .lock-tag {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 4px 12px;
      font-size: 13px;
      border-radius: 6px;
      background-color: #f5f7fa;
      border: 1px solid #e4e7ed;

      .el-icon {
        font-size: 12px;
      }
    }
  }

  .new-icon {
    margin-left: 4px;
  }

  .reference-content {
    .reference-header {
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 1px solid #ebeef5;

      .field-name {
        font-size: 16px;
        font-weight: 600;
        color: #303133;
      }

      .field-code {
        font-size: 14px;
        color: #909399;
        margin-left: 8px;
      }
    }
  }
}
</style>

// 全局样式（废弃确认弹窗）
<style lang="scss">.deprecate-confirm-dialog {
  border-radius: 12px;
  overflow: hidden;

  .el-message-box__header {
    padding: 20px 24px 16px;
    background: linear-gradient(135deg, #fef0f0 0%, #fff 100%);
    border-bottom: 1px solid #fbc4c4;
  }

  .el-message-box__title {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
  }

  .el-message-box__content {
    padding: 24px;

    .deprecate-confirm-content {
      .confirm-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 20px;
        padding-bottom: 16px;
        border-bottom: 1px solid #ebeef5;

        .header-icon {
          font-size: 24px;
          color: #e6a23c;
        }

        .header-title {
          font-size: 16px;
          font-weight: 600;
          color: #303133;
        }
      }

      .confirm-body {
        .field-info {
          font-size: 14px;
          color: #606266;
          margin-bottom: 16px;
          line-height: 1.6;

          .field-name {
            font-weight: 600;
            color: #409eff;
            background: #ecf5ff;
            padding: 2px 8px;
            border-radius: 4px;
          }
        }

        .impact-list {
          margin-bottom: 16px;

          .impact-title {
            font-size: 14px;
            font-weight: 600;
            color: #303133;
            margin-bottom: 12px;
          }

          .impact-items {
            list-style: none;
            padding: 0;
            margin: 0;

            li {
              display: flex;
              align-items: center;
              gap: 8px;
              padding: 8px 12px;
              margin-bottom: 8px;
              background: #f5f7fa;
              border-radius: 6px;
              font-size: 14px;
              color: #606266;
              line-height: 1.5;

              .impact-icon {
                font-size: 16px;
                flex-shrink: 0;
              }
            }
          }
        }

        .risk-tip {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          background: #ecf5ff;
          border-left: 3px solid #409eff;
          border-radius: 6px;
          font-size: 13px;
          color: #409eff;

          .el-icon {
            font-size: 16px;
            flex-shrink: 0;
          }
        }
      }
    }
  }

  .el-message-box__btns {
    padding: 16px 24px 20px;
    display: flex;
    gap: 12px;
    justify-content: flex-end;

    .deprecate-cancel-btn {
      padding: 10px 24px;
      border-radius: 8px;
      font-size: 14px;
      border: 1px solid #dcdfe6;
      background: #fff;
      color: #606266;
      transition: all 0.3s;

      &:hover {
        border-color: #409eff;
        color: #409eff;
      }
    }

    .deprecate-confirm-btn {
      padding: 10px 24px;
      border-radius: 8px;
      font-size: 14px;
      border: none;
      background: linear-gradient(135deg, #e6a23c 0%, #f0c78a 100%);
      color: #fff;
      font-weight: 600;
      box-shadow: 0 4px 12px rgba(230, 162, 60, 0.3);
      transition: all 0.3s;

      &:hover {
        box-shadow: 0 6px 16px rgba(230, 162, 60, 0.4);
        transform: translateY(-1px);
      }

      &:active {
        transform: translateY(0);
      }
    }
  }
}
</style>
