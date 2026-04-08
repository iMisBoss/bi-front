<template>
  <div class="relation-management">
    <div class="tab-toolbar">
      <div class="toolbar-left">
        <el-button
            v-if="canAddRelation"
            type="primary"
            size="default"
            icon="Plus"
            @click="handleAddRelation"
        >
          新增关联
        </el-button>
        <el-button
            v-if="canBatchOperate"
            size="default"
            icon="Connection"
            :disabled="selectedRelations.length === 0"
            @click="handleBatchDelete"
        >
          批量删除
        </el-button>
        <el-button
            v-if="!isVersionEdit && businessObjectStatus !== 'archived'"
            size="default"
            icon="Connection"
        >
          可视化视图
        </el-button>
      </div>
    </div>

    <el-table
        :data="relationList"
        border
        style="width: 100%"
        max-height="400"
        @selection-change="handleSelectionChange"
    >
      <el-table-column
          v-if="canBatchOperate"
          type="selection"
          width="50"
          align="center"
      />

      <el-table-column prop="relationName" label="关联名称" min-width="150" show-overflow-tooltip>
        <template #default="{ row }">
          <span :class="{ 'system-relation': row.system }">{{ row.relationName }}</span>
          <el-tag v-if="row.system" size="small" type="info" style="margin-left: 6px">系统</el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="relationType" label="关联类型" width="110" align="center">
        <template #default="{ row }">
          <el-tag size="small" :type="getRelationTypeTag(row.relationType)">
            {{ getRelationTypeText(row.relationType) }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="targetObject" label="关联业务对象" min-width="150" show-overflow-tooltip />

      <el-table-column prop="foreignKey" label="外键列名" min-width="120" show-overflow-tooltip />

      <el-table-column prop="targetKey" label="主表关联列" min-width="120" show-overflow-tooltip />

      <el-table-column prop="cascadeDelete" label="级联删除" width="100" align="center">
        <template #default="{ row }">
          <el-switch
              v-if="canEditCascadeDelete(row)"
              v-model="row.cascadeDelete"
              @change="handleCascadeDeleteChange(row)"
          />
          <el-icon v-else-if="row.cascadeDelete" style="color: #f56c6c"><CircleCheckFilled /></el-icon>
          <span v-else style="color: #909399">-</span>
        </template>
      </el-table-column>

      <el-table-column prop="status" label="状态" width="80" align="center">
        <template #default="{ row }">
          <el-tag :type="row.status === 'enabled' ? 'success' : 'info'" size="small">
            {{ row.status === 'enabled' ? '启用' : '停用' }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="description" label="关联说明" min-width="150" show-overflow-tooltip />

      <el-table-column v-if="isVersionEdit" prop="changeType" label="变更类型" width="100" align="center">
        <template #default="{ row }">
          <el-tag v-if="row.changeType" :type="getChangeTypeTag(row.changeType)" size="small">
            {{ getChangeTypeText(row.changeType) }}
          </el-tag>
          <span v-else style="color: #909399">-</span>
        </template>
      </el-table-column>

      <el-table-column
          label="操作"
          :width="getOperationWidth()"
          align="center"
          fixed="right"
      >
        <template #default="{ row }">
          <div class="action-buttons">
            <el-button
                v-if="canEditRelation(row)"
                size="small"
                type="primary"
                icon="Edit"
                @click="handleEditRelation(row)"
                class="action-btn"
            >
              编辑
            </el-button>

            <el-button
                v-if="canDeleteRelation(row)"
                size="small"
                type="danger"
                icon="Delete"
                @click="handleDeleteRelation(row)"
                class="action-btn"
            >
              删除
            </el-button>

            <el-button
                v-if="canToggleStatus(row)"
                size="small"
                :type="row.status === 'enabled' ? 'warning' : 'success'"
                :icon="row.status === 'enabled' ? 'Close' : 'Check'"
                @click="handleToggleStatus(row)"
                class="action-btn"
            >
              {{ row.status === 'enabled' ? '停用' : '启用' }}
            </el-button>

            <el-button
                v-if="!canEditRelation(row) && !canDeleteRelation(row)"
                size="small"
                disabled
                icon="Lock"
                class="action-btn"
            >
              锁定
            </el-button>

            <el-button
                v-if="!row.system"
                size="small"
                icon="Document"
                @click="handleViewLogs(row)"
                class="action-btn"
            >
              日志
            </el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <!-- 关联编辑弹窗 -->
    <RelationEditDialog
        v-model="editDialogVisible"
        :relation-data="editingRelation"
        :field-list="fieldList"
        :available-objects="availableObjects"
        :business-domain="businessDomain"
        :is-version-edit="isVersionEdit"
        @confirm="handleEditConfirm"
    />

    <!-- 操作日志弹窗 -->
    <el-dialog
        v-model="logDialogVisible"
        title="关联操作日志"
        width="800px"
        :close-on-click-modal="false"
    >
      <el-table :data="operationLogs" border max-height="400">
        <el-table-column prop="operationTime" label="操作时间" width="180" />
        <el-table-column prop="operator" label="操作人" width="120" />
        <el-table-column prop="operationType" label="操作类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getLogTypeTag(row.operationType)" size="small">
              {{ row.operationType }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="operationContent" label="操作内容" min-width="200" show-overflow-tooltip />
        <el-table-column prop="ipAddress" label="IP地址" width="140" />
      </el-table>

      <template #footer>
        <el-button @click="logDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { CircleCheckFilled } from '@element-plus/icons-vue'
import RelationEditDialog from './RelationEditDialog.vue'

const props = defineProps({
  isVersionEdit: {
    type: Boolean,
    default: false
  },
  businessObjectStatus: {
    type: String,
    default: 'draft' // draft, published, deprecated, archived
  },
  businessDomain: {
    type: String,
    default: 'hr'
  },
  fieldList: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['change'])

// 模拟字段列表（实际应从父组件传入）
const fieldList = ref([
  { id: 1, fieldName: '申请人', fieldCode: 'applicant_id', dataType: 'VARCHAR(32)' },
  { id: 2, fieldName: '申请部门', fieldCode: 'apply_dept_id', dataType: 'VARCHAR(32)' }
])

// 模拟可用业务对象（实际应从API获取）
const availableObjects = ref([
  { id: 1, name: '员工信息', domain: 'hr', status: 'published' },
  { id: 2, name: '部门信息', domain: 'hr', status: 'published' },
  { id: 3, name: '费用明细', domain: 'finance', status: 'published' }
])

const relationList = ref([
  {
    id: 1,
    relationName: '申请人信息',
    relationType: 'many-to-one',
    targetObject: '员工信息',
    foreignKey: 'applicant_id',
    targetKey: 'id',
    cascadeDelete: false,
    status: 'enabled',
    description: '关联员工基本信息表，用于获取申请人详细信息',
    system: true,
    isNewRelation: false
  },
  {
    id: 2,
    relationName: '申请部门',
    relationType: 'many-to-one',
    targetObject: '部门信息',
    foreignKey: 'apply_dept_id',
    targetKey: 'id',
    cascadeDelete: false,
    status: 'enabled',
    description: '关联部门信息表，用于获取部门层级结构',
    system: true,
    isNewRelation: false
  },
  {
    id: 3,
    relationName: '车辆信息',
    relationType: 'many-to-one',
    targetObject: '车辆台账',
    foreignKey: 'vehicle_id',
    targetKey: 'id',
    cascadeDelete: false,
    status: 'enabled',
    description: '关联车辆台账表，用于获取车辆详细配置信息',
    system: false,
    isNewRelation: false
  },
  {
    id: 4,
    relationName: '驾驶员信息',
    relationType: 'many-to-one',
    targetObject: '驾驶员档案',
    foreignKey: 'driver_id',
    targetKey: 'id',
    cascadeDelete: false,
    status: 'enabled',
    description: '关联驾驶员档案表，用于获取驾驶员资质信息',
    system: false,
    isNewRelation: false
  },
  {
    id: 5,
    relationName: '费用明细',
    relationType: 'one-to-many',
    targetObject: '用车费用明细',
    foreignKey: 'application_id',
    targetKey: 'id',
    cascadeDelete: false,
    status: 'enabled',
    description: '一对多关联费用明细表，记录本次用车产生的各项费用',
    system: false,
    isNewRelation: false
  },
  {
    id: 6,
    relationName: '审批记录',
    relationType: 'one-to-many',
    targetObject: '审批流水',
    foreignKey: 'application_id',
    targetKey: 'id',
    cascadeDelete: false,
    status: 'enabled',
    description: '一对多关联审批流水表，记录完整审批链路',
    system: true,
    isNewRelation: false
  },
  {
    id: 7,
    relationName: '附件列表',
    relationType: 'one-to-many',
    targetObject: '附件管理',
    foreignKey: 'application_id',
    targetKey: 'id',
    cascadeDelete: false,
    status: 'enabled',
    description: '一对多关联附件表，存储相关证明材料',
    system: false,
    isNewRelation: false
  }
])

const selectedRelations = ref([])
const editDialogVisible = ref(false)
const editingRelation = ref(null)
const logDialogVisible = ref(false)
const operationLogs = ref([])

// 是否可以新增关联
const canAddRelation = computed(() => {
  return props.businessObjectStatus !== 'archived'
})

// 是否可以批量操作
const canBatchOperate = computed(() => {
  return props.businessObjectStatus === 'draft'
})

// 是否可以编辑关联
const canEditRelation = (row) => {
  if (row.system) return false
  if (props.businessObjectStatus === 'archived') return false
  if (props.isVersionEdit && !row.isNewRelation) return false
  if (props.businessObjectStatus !== 'draft') return false
  return true
}

// 是否可以删除关联
const canDeleteRelation = (row) => {
  if (row.system) return false
  if (props.businessObjectStatus === 'archived') return false
  if (props.isVersionEdit && !row.isNewRelation) return false
  if (props.businessObjectStatus !== 'draft') return false
  return true
}

// 是否可以编辑级联删除
const canEditCascadeDelete = (row) => {
  // 财务、风控、信贷等强合规业务域，强制禁用
  const restrictedDomains = ['finance', 'risk', 'loan']
  if (restrictedDomains.includes(props.businessDomain)) return false

  // 仅草稿状态可编辑
  if (props.businessObjectStatus !== 'draft') return false

  // 已存在的关联禁止修改级联删除
  if (!row.isNewRelation) return false

  return true
}

// 是否可以切换状态
const canToggleStatus = (row) => {
  if (row.system) return false
  if (props.businessObjectStatus === 'archived') return false
  if (props.isVersionEdit && !row.isNewRelation) return false
  return props.businessObjectStatus === 'draft' || props.businessObjectStatus === 'published'
}

// 获取操作列宽度
const getOperationWidth = () => {
  let width = 160
  if (props.isVersionEdit) width += 40
  if (!props.businessObjectStatus === 'archived') width += 60
  return width
}

// 表格选择变化
const handleSelectionChange = (selection) => {
  selectedRelations.value = selection
}

// 新增关联
const handleAddRelation = () => {
  editingRelation.value = null
  editDialogVisible.value = true
}

// 编辑关联
const handleEditRelation = async (row) => {
  // 全链路引用校验
  const refs = await checkRelationReferences(row)

  if (refs.hasReferences) {
    const refSummary = []
    if (refs.forms.length > 0) refSummary.push(`${refs.forms.length}个表单`)
    if (refs.processes.length > 0) refSummary.push(`${refs.processes.length}个审批流程`)
    if (refs.rules.length > 0) refSummary.push(`${refs.rules.length}个数据规则`)
    if (refs.reports.length > 0) refSummary.push(`${refs.reports.length}个报表`)

    ElMessageBox.alert(
        `该关联关系已被${refSummary.join('、')}引用，无法修改。\n\n请先解除所有引用后再操作。`,
        '编辑失败',
        {
          confirmButtonText: '查看引用详情',
          type: 'error'
        }
    )
    return
  }

  editingRelation.value = { ...row }
  editDialogVisible.value = true
}

// 删除关联
const handleDeleteRelation = async (row) => {
  // 全链路引用校验
  const refs = await checkRelationReferences(row)

  if (refs.hasReferences) {
    const refSummary = []
    if (refs.forms.length > 0) refSummary.push(`${refs.forms.length}个表单`)
    if (refs.processes.length > 0) refSummary.push(`${refs.processes.length}个审批流程`)
    if (refs.rules.length > 0) refSummary.push(`${refs.rules.length}个数据规则`)

    ElMessageBox.alert(
        `该关联关系已被${refSummary.join('、')}引用，无法删除。\n\n请先解除所有引用后再操作。`,
        '删除失败',
        {
          confirmButtonText: '确定',
          type: 'error'
        }
    )
    return
  }

  // 二次确认
  ElMessageBox.confirm(
      `确定要删除关联"${row.relationName}"吗？此操作不可恢复！`,
      '删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
  ).then(() => {
    relationList.value = relationList.value.filter(r => r.id !== row.id)
    ElMessage.success('删除成功')
    emit('change', relationList.value)
    // 记录审计日志
    logOperation(row, '删除', `删除关联：${row.relationName}`)
  }).catch(() => {})
}

// 批量删除
const handleBatchDelete = () => {
  if (selectedRelations.value.length === 0) {
    ElMessage.warning('请先选择要删除的关联')
    return
  }

  const systemRelations = selectedRelations.value.filter(r => r.system)
  if (systemRelations.length > 0) {
    ElMessage.warning('系统内置关联不可删除')
    return
  }

  ElMessageBox.confirm(
      `确定要删除选中的 ${selectedRelations.value.length} 个关联吗？此操作不可恢复！`,
      '批量删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
  ).then(() => {
    const selectedIds = new Set(selectedRelations.value.map(r => r.id))
    relationList.value = relationList.value.filter(r => !selectedIds.has(r.id))
    ElMessage.success('批量删除成功')
    emit('change', relationList.value)
  }).catch(() => {})
}

// 切换状态
const handleToggleStatus = (row) => {
  const action = row.status === 'enabled' ? '停用' : '启用'

  ElMessageBox.confirm(
      `确定要${action}关联"${row.relationName}"吗？`,
      `${action}确认`,
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
  ).then(() => {
    row.status = row.status === 'enabled' ? 'disabled' : 'enabled'
    ElMessage.success(`${action}成功`)
    emit('change', relationList.value)
    logOperation(row, action, `${action}关联：${row.relationName}`)
  }).catch(() => {})
}

// 级联删除变更
const handleCascadeDeleteChange = (row) => {
  if (row.cascadeDelete) {
    ElMessageBox.confirm(
        '开启级联删除后，删除关联主表数据将同步删除当前业务对象的对应业务数据，会导致历史/归档数据丢失，违反合规要求，是否确认开启？',
        '⚠️ 高风险操作提示',
        {
          confirmButtonText: '确认开启',
          cancelButtonText: '取消',
          type: 'error',
          dangerouslyUseHTMLString: true,
          customClass: 'high-risk-confirm'
        }
    ).then(() => {
      ElMessage.warning('已开启级联删除，请谨慎操作')
      logOperation(row, '开启级联删除', '开启级联删除功能')
    }).catch(() => {
      row.cascadeDelete = false
    })
  } else {
    logOperation(row, '关闭级联删除', '关闭级联删除功能')
  }
}

// 查看操作日志
const handleViewLogs = (row) => {
  // 模拟日志数据
  operationLogs.value = [
    {
      operationTime: '2024-01-15 10:30:00',
      operator: '张三',
      operationType: '创建',
      operationContent: `创建关联：${row.relationName}`,
      ipAddress: '192.168.1.100'
    },
    {
      operationTime: '2024-01-20 14:20:00',
      operator: '李四',
      operationType: '修改',
      operationContent: '修改关联说明',
      ipAddress: '192.168.1.101'
    }
  ]
  logDialogVisible.value = true
}

// 检查关联引用
const checkRelationReferences = async (row) => {
  // 模拟API调用
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        hasReferences: false,
        forms: [],
        processes: [],
        rules: [],
        reports: []
      })
    }, 300)
  })
}

// 记录操作日志
const logOperation = (row, operationType, content) => {
  const log = {
    relationId: row.id,
    operationTime: new Date().toISOString(),
    operator: '当前用户',
    operationType,
    operationContent: content,
    ipAddress: '192.168.1.100'
  }
  console.log('操作日志:', log)
  // 实际应调用后端API保存日志
}

// 编辑确认
const handleEditConfirm = (relationData) => {
  if (editingRelation.value) {
    // 编辑模式
    const index = relationList.value.findIndex(r => r.id === relationData.id)
    if (index !== -1) {
      Object.assign(relationList.value[index], relationData)
    }
  } else {
    // 新增模式
    const newId = Math.max(...relationList.value.map(r => r.id), 0) + 1
    relationList.value.push({
      ...relationData,
      id: newId,
      isNewRelation: props.isVersionEdit
    })
  }

  ElMessage.success(editingRelation.value ? '编辑成功' : '新增成功')
  emit('change', relationList.value)
}

// 获取关联类型标签
const getRelationTypeTag = (type) => {
  const tags = {
    'one-to-one': '',
    'one-to-many': 'success',
    'many-to-one': 'warning',
    'many-to-many': 'danger'
  }
  return tags[type] || ''
}

// 获取关联类型文本
const getRelationTypeText = (type) => {
  const texts = {
    'one-to-one': '一对一',
    'one-to-many': '一对多',
    'many-to-one': '多对一',
    'many-to-many': '多对多'
  }
  return texts[type] || type
}

// 获取日志类型标签
const getLogTypeTag = (type) => {
  const tags = {
    '创建': 'success',
    '修改': 'warning',
    '删除': 'danger',
    '启用': 'success',
    '停用': 'info',
    '开启级联删除': 'danger',
    '关闭级联删除': 'info'
  }
  return tags[type] || 'info'
}

// 获取变更类型标签
const getChangeTypeTag = (type) => {
  const tags = { '新增': 'success', '修改': 'warning', '删除': 'danger' }
  return tags[type] || 'info'
}

// 获取变更类型文本
const getChangeTypeText = (type) => {
  return type || '-'
}

defineExpose({
  relationList
})
</script>

<style scoped lang="scss">
.relation-management {
  .tab-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    .toolbar-left {
      display: flex;
      gap: 12px;
    }
  }

  .system-relation {
    color: #909399;
    font-style: italic;
  }

  .action-buttons {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    white-space: nowrap;

    .action-btn {
      margin: 0;
      padding: 5px 8px;
      font-size: 12px;
    }
  }
}

// 高风险确认弹窗样式
:deep(.high-risk-confirm) {
  .el-message-box__header {
    background: #fef0f0;
    border-bottom: 1px solid #fbc4c4;
  }

  .el-message-box__title {
    color: #f56c6c;
    font-weight: 600;
  }

  .el-message-box__content {
    color: #f56c6c;
    font-weight: 500;
  }

  .el-button--primary {
    background-color: #f56c6c;
    border-color: #f56c6c;
  }
}
</style>
