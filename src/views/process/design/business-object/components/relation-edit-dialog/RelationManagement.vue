<template>
  <div class="relation-management">
    <!-- 顶部工具栏 -->
    <div class="tab-toolbar">
      <div class="toolbar-left">
        <el-button type="primary" icon="Plus" @click="handleAddRelation">新增关联</el-button>
        <el-button
            v-if="canBatchDelete"
            type="danger"
            plain
            icon="Delete"
            @click="handleBatchDelete"
        >
          批量删除
        </el-button>
        <el-button
            type="info"
            plain
            icon="Share"
            @click="handleToggleView"
        >
          {{ isGraphView ? '列表视图' : '可视化视图' }}
        </el-button>
      </div>
      <div class="toolbar-right" v-if="isVersionEdit">
        <el-alert
            type="info"
            :closable="false"
            show-icon
            class="version-alert"
        >
          <template #title>
            新版本编辑模式：原版本关联仅可查看，本次新增/修改的关联可编辑
          </template>
        </el-alert>
      </div>
    </div>

    <!-- 筛选栏 -->
    <div class="filter-bar" v-if="isVersionEdit">
      <el-radio-group v-model="filterChangeType" size="small" @change="handleFilterChange">
        <el-radio-button label="all">全部关联</el-radio-button>
        <el-radio-button label="original">原版本存量</el-radio-button>
        <el-radio-button label="新增">本次新增</el-radio-button>
        <el-radio-button label="修改">本次修改</el-radio-button>
        <el-radio-button label="停用">本次停用</el-radio-button>
      </el-radio-group>
    </div>

    <!-- 列表视图 -->
    <el-table
        v-if="!isGraphView"
        v-loading="loading"
        :data="filteredRelationList"
        border
        stripe
        style="width: 100%"
        @selection-change="handleSelectionChange"
        :row-class-name="getRowClassName"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column type="index" label="序号" width="60" align="center" />

      <el-table-column label="关联名称" min-width="180">
        <template #default="{ row }">
          <div class="relation-name-cell">
            <span :class="{ 'system-relation': row.system, 'relation-name': true }">{{ row.relationName }}</span>
            <el-tag v-if="row.system" size="small" type="info" effect="dark" class="system-tag">
              <el-icon><Setting /></el-icon>
              系统
            </el-tag>
            <el-tag v-if="row.isNewRelation" size="small" type="success" class="new-tag">新增</el-tag>
          </div>
        </template>
      </el-table-column>

      <el-table-column prop="relationType" label="关联类型" width="120" align="center">
        <template #default="{ row }">
          <el-tag :type="getRelationTypeTag(row.relationType)" size="small" effect="light">
            {{ getRelationTypeText(row.relationType) }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="targetObject" label="关联业务对象" min-width="150" />
      <el-table-column prop="foreignKey" label="外键列名" width="150" />
      <el-table-column prop="primaryKey" label="主表关联列" width="150" />

      <el-table-column prop="cascadeDelete" label="级联删除" width="120" align="center">
        <template #default="{ row }">
          <el-tooltip
              :content="getCascadeDeleteTooltip(row)"
              placement="top"
          >
            <el-switch
                v-model="row.cascadeDelete"
                :disabled="!canEditCascadeDelete(row)"
                @change="handleCascadeDeleteChange(row)"
            />
          </el-tooltip>
        </template>
      </el-table-column>

      <el-table-column prop="status" label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="row.status === 'enabled' ? 'success' : 'danger'" size="small">
            {{ row.status === 'enabled' ? '启用' : '停用' }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="description" label="关联说明" min-width="200" show-overflow-tooltip />

      <!-- 变更类型列 -->
      <el-table-column prop="changeType" label="变更类型" width="140" align="center">
        <template #default="{ row }">
          <div :class="getChangeTypeClass(row)">
            <el-icon v-if="row.changeType === '新增'"><CirclePlus /></el-icon>
            <el-icon v-else-if="row.changeType === '修改'"><Edit /></el-icon>
            <el-icon v-else-if="row.changeType === '停用'"><CircleClose /></el-icon>
            <el-icon v-else><Minus /></el-icon>
            <span class="change-type-text">{{ getChangeTypeText(row.changeType) }}</span>
          </div>
        </template>
      </el-table-column>

      <!-- 操作列 -->
      <el-table-column label="操作" :width="isVersionEdit ? '440' : '400'" align="center" fixed="right">
        <template #default="{ row }">
          <div class="action-buttons">
            <!-- 新增关联：完整操作权限 -->
            <template v-if="canEditRelation(row)">
              <!-- 编辑按钮（蓝色，风险最低） -->
              <el-button
                  size="small"
                  type="primary"
                  plain
                  icon="Edit"
                  @click="handleEditRelation(row)"
                  class="action-btn edit-btn"
              >
                编辑
              </el-button>

              <!-- 停用按钮（橙色，中等风险） -->
              <el-button
                  size="small"
                  type="warning"
                  plain
                  icon="CircleClose"
                  @click="handleToggleStatus(row)"
                  class="action-btn toggle-btn"
              >
                {{ row.status === 'enabled' ? '停用' : '启用' }}
              </el-button>

              <!-- 删除按钮（红色，最高风险） -->
              <el-button
                  size="small"
                  type="danger"
                  plain
                  icon="Delete"
                  @click="handleDeleteRelation(row)"
                  class="action-btn delete-btn"
              >
                删除
              </el-button>

              <!-- 日志按钮（灰色，无风险） -->
              <el-button
                  size="small"
                  type="info"
                  plain
                  icon="Document"
                  @click="handleViewLogs(row)"
                  class="action-btn log-btn"
              >
                日志
              </el-button>
            </template>

            <!-- 原版本关联：仅查看权限 -->
            <template v-else>
              <el-tag
                  size="small"
                  type="info"
                  effect="plain"
                  class="lock-tag"
              >
                <el-icon><Lock /></el-icon>
                <span>锁定</span>
              </el-tag>

              <el-button
                  size="small"
                  type="info"
                  plain
                  icon="Document"
                  @click="handleViewLogs(row)"
                  class="action-btn log-btn"
              >
                日志
              </el-button>
            </template>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <!-- 可视化视图（简化版） -->
    <div v-else class="graph-view">
      <div class="graph-placeholder">
        <el-icon :size="80" color="#c0c4cc"><Connection /></el-icon>
        <p>关联关系可视化视图</p>
        <p class="sub-text">展示业务对象之间的关联拓扑关系</p>
        <el-button type="primary" @click="handleToggleView">返回列表视图</el-button>
      </div>
    </div>

    <!-- 分页 -->
    <div class="pagination-wrapper" v-if="!isGraphView">
      <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="filteredRelationList.length"
          background
      />
    </div>
    <!-- 关联编辑弹窗 -->
    <RelationEditDialog
        v-model="editDialogVisible"
        :relation-data="editingRelation"
        :is-version-edit="isVersionEdit"
        @confirm="handleRelationConfirm"
    />

    <!-- 操作日志弹窗 -->
    <RelationLogDialog
        v-model="logDialogVisible"
        :relation-name="currentRelationName"
    />

    <!-- 可视化视图弹窗 -->
    <RelationVisualDialog
        v-model="visualDialogVisible"
        :relation-data="relationList"
        :current-biz-object="currentBizObject"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus, Delete, Share, Edit, CircleClose, Document, Lock, Setting,
  CirclePlus, Minus, Connection
} from '@element-plus/icons-vue'
import RelationEditDialog from './RelationEditDialog.vue'
import RelationLogDialog from './RelationLogDialog.vue'
import RelationVisualDialog from './RelationVisualDialog.vue'

const props = defineProps({
  isVersionEdit: {
    type: Boolean,
    default: false
  },
  businessObjectStatus: {
    type: String,
    default: 'draft'
  },
  businessDomain: {
    type: String,
    default: 'hr'
  }
})

const emit = defineEmits(['change'])

// 当前业务对象信息（从父组件传入或使用默认值）
const currentBizObject = ref({
  name: '请假申请',
  tableName: 'biz_leave_application'
})

// 关联编辑弹窗
const editDialogVisible = ref(false)
const editingRelation = ref(null)

// 可视化视图弹窗
const visualDialogVisible = ref(false)

// 操作日志弹窗
const logDialogVisible = ref(false)
const currentRelationName = ref('')

const loading = ref(false)
const isGraphView = ref(false)
const currentPage = ref(1)
const pageSize = ref(20)
const filterChangeType = ref('all')
const selectedRows = ref([])

// 模拟数据
const relationList = ref([
  {
    id: 1,
    relationName: '申请人信息',
    relationType: 'many_to_one',
    targetObject: '员工信息',
    foreignKey: 'applicant_id',
    primaryKey: 'id',
    cascadeDelete: false,
    status: 'enabled',
    description: '关联员工基本信息表',
    system: true,
    isNewRelation: false,
    changeType: null,
    references: { forms: 3, processes: 2 }
  },
  {
    id: 2,
    relationName: '申请部门',
    relationType: 'many_to_one',
    targetObject: '部门信息',
    foreignKey: 'apply_dept_id',
    primaryKey: 'id',
    cascadeDelete: false,
    status: 'enabled',
    description: '关联部门信息表',
    system: true,
    isNewRelation: false,
    changeType: null,
    references: { forms: 2, processes: 1 }
  },
  {
    id: 3,
    relationName: '车辆信息',
    relationType: 'many_to_one',
    targetObject: '车辆台账',
    foreignKey: 'vehicle_id',
    primaryKey: 'id',
    cascadeDelete: false,
    status: 'enabled',
    description: '关联车辆台账表',
    system: false,
    isNewRelation: false,
    changeType: null,
    references: { forms: 1, processes: 0 }
  },
  {
    id: 4,
    relationName: '驾驶员信息',
    relationType: 'many_to_one',
    targetObject: '驾驶员档案',
    foreignKey: 'driver_id',
    primaryKey: 'id',
    cascadeDelete: false,
    status: 'enabled',
    description: '关联驾驶员档案表',
    system: false,
    isNewRelation: false,
    changeType: null,
    references: { forms: 1, processes: 0 }
  },
  {
    id: 5,
    relationName: '费用明细',
    relationType: 'one_to_many',
    targetObject: '用车费用明细',
    foreignKey: 'application_id',
    primaryKey: 'id',
    cascadeDelete: false,
    status: 'enabled',
    description: '一对多关联费用明细',
    system: false,
    isNewRelation: false,
    changeType: null,
    references: { forms: 2, processes: 1 }
  },
  {
    id: 6,
    relationName: '审批记录',
    relationType: 'one_to_many',
    targetObject: '审批流水',
    foreignKey: 'application_id',
    primaryKey: 'id',
    cascadeDelete: false,
    status: 'enabled',
    description: '一对多关联审批流水',
    system: true,
    isNewRelation: false,
    changeType: null,
    references: { forms: 5, processes: 3 }
  },
  {
    id: 7,
    relationName: '附件列表',
    relationType: 'one_to_many',
    targetObject: '附件管理',
    foreignKey: 'application_id',
    primaryKey: 'id',
    cascadeDelete: false,
    status: 'enabled',
    description: '一对多关联附件表',
    system: false,
    isNewRelation: false,
    changeType: null,
    references: { forms: 4, processes: 2 }
  },
  // 新增关联模拟数据
  {
    id: 101,
    relationName: '加班记录',
    relationType: 'many_to_one',
    targetObject: '加班台账',
    foreignKey: 'overtime_record_id',
    primaryKey: 'id',
    cascadeDelete: false,
    status: 'enabled',
    description: '关联加班记录表',
    system: false,
    isNewRelation: true,
    changeType: '新增',
    references: { forms: 0, processes: 0 }
  },
  {
    id: 102,
    relationName: '发票信息',
    relationType: 'one_to_many',
    targetObject: '发票明细',
    foreignKey: 'application_id',
    primaryKey: 'id',
    cascadeDelete: false,
    status: 'enabled',
    description: '一对多关联发票明细',
    system: false,
    isNewRelation: true,
    changeType: '新增',
    references: { forms: 0, processes: 0 }
  }
])

// 判断是否允许批量删除（与标签页联动）
const canBatchDelete = computed(() => {
  // 草稿状态：允许批量删除
  if (props.businessObjectStatus === 'draft') return true

  // 版本编辑模式：仅在"本次新增"标签页下允许批量删除
  if (props.isVersionEdit) {
    return filterChangeType.value === '新增'
  }

  return false
})

// 筛选后的关联列表
const filteredRelationList = computed(() => {
  if (filterChangeType.value === 'all') {
    return relationList.value
  }
  if (filterChangeType.value === 'original') {
    return relationList.value.filter(r => !r.isNewRelation && !r.changeType)
  }
  return relationList.value.filter(r => r.changeType === filterChangeType.value)
})

// 获取行类名
const getRowClassName = ({ row }) => {
  if (row.isNewRelation && row.changeType === '新增') {
    return 'new-relation-row'
  }
  if (row.changeType === '修改') {
    return 'modified-relation-row'
  }
  if (row.changeType === '停用') {
    return 'disabled-relation-row'
  }
  if (!row.isNewRelation && !row.changeType) {
    return 'original-relation-row'
  }
  return ''
}

// 获取变更类型样式类
const getChangeTypeClass = (row) => {
  const baseClass = 'change-type-cell'
  if (row.changeType === '新增') return `${baseClass} change-type-add`
  if (row.changeType === '修改') return `${baseClass} change-type-modify`
  if (row.changeType === '停用') return `${baseClass} change-type-disable`
  return `${baseClass} change-type-original`
}

// 获取变更类型文本
const getChangeTypeText = (changeType) => {
  const textMap = {
    '新增': '本次新增',
    '修改': '本次修改',
    '停用': '本次停用',
    null: '原版本'
  }
  return textMap[changeType] || '原版本'
}

// 获取关联类型标签
const getRelationTypeTag = (type) => {
  const tagMap = {
    'many_to_one': 'warning',
    'one_to_many': 'success',
    'one_to_one': 'info',
    'many_to_many': 'danger'
  }
  return tagMap[type] || 'info'
}

// 获取关联类型文本
const getRelationTypeText = (type) => {
  const textMap = {
    'many_to_one': '多对一',
    'one_to_many': '一对多',
    'one_to_one': '一对一',
    'many_to_many': '多对多'
  }
  return textMap[type] || type
}

// 判断是否可编辑关联
const canEditRelation = (row) => {
  if (row.system) return false
  if (!props.isVersionEdit) return true
  // 版本编辑模式下，仅新增关联可编辑
  return row.isNewRelation
}

// 判断是否可编辑级联删除（原版本关联锁定）
const canEditCascadeDelete = (row) => {
  // 系统关联永久锁定
  if (row.system) return false

  // 草稿状态：允许编辑
  if (props.businessObjectStatus === 'draft') return true

  // 版本编辑模式：仅新增关联可编辑
  if (props.isVersionEdit) {
    return row.isNewRelation && row.changeType === '新增'
  }

  return false
}

// 获取级联删除提示
const getCascadeDeleteTooltip = (row) => {
  if (row.system) return '系统关联级联删除已锁定'
  if (!props.isVersionEdit) return '点击开启/关闭级联删除'
  if (!row.isNewRelation) return '原版本关联级联删除已锁定'
  return '新增关联可配置级联删除'
}

// 切换视图
const handleToggleView = () => {
  if (isGraphView.value) {
    isGraphView.value = false
  } else {
    // 打开可视化视图弹窗
    console.log('=== 打开可视化视图 ===')
    console.log('数据条数:', relationList.value.length)
    console.log('当前业务对象:', currentBizObject.value)
    console.log('第一条数据:', relationList.value[0])
    visualDialogVisible.value = true
  }
}

// 筛选变更
const handleFilterChange = () => {
  currentPage.value = 1
}

// 新增关联
const handleAddRelation = () => {
  editingRelation.value = null
  editDialogVisible.value = true
}

// 编辑关联
const handleEditRelation = async (row) => {
  // 前置引用校验
  if (row.references && (row.references.forms > 0 || row.references.processes > 0)) {
    try {
      await ElMessageBox.confirm(
          `该关联已被 ${row.references.forms} 个表单、${row.references.processes} 个审批流程引用，修改可能导致流程异常，是否继续？`,
          '引用校验提示',
          {
            confirmButtonText: '继续修改',
            cancelButtonText: '取消',
            type: 'warning'
          }
      )
    } catch {
      return
    }
  }

  editingRelation.value = { ...row }
  editDialogVisible.value = true
}

// 关联确认提交
const handleRelationConfirm = (relationData) => {
  if (relationData.id) {
    // 编辑模式：更新现有关联
    const index = relationList.value.findIndex(r => r.id === relationData.id)
    if (index !== -1) {
      Object.assign(relationList.value[index], relationData)
      if (props.isVersionEdit && !relationList.value[index].isNewRelation) {
        relationList.value[index].changeType = '修改'
      }
    }
  } else {
    // 新增模式：添加新关联
    const newRelation = {
      id: Date.now(),
      ...relationData,
      system: false,
      isNewRelation: true,
      changeType: '新增',
      references: { forms: 0, processes: 0 }
    }
    relationList.value.push(newRelation)
  }

  emit('change', relationList.value)
}

// 删除关联
const handleDeleteRelation = async (row) => {
  // 前置引用校验
  if (row.references && (row.references.forms > 0 || row.references.processes > 0)) {
    ElMessageBox.alert(
        `该关联已被 ${row.references.forms} 个表单、${row.references.processes} 个审批流程引用，无法删除。\n\n请先解除所有引用后再操作。`,
        '删除拦截',
        {
          confirmButtonText: '我知道了',
          type: 'error'
        }
    )
    return
  }

  try {
    await ElMessageBox.confirm(
        `删除关联"${row.relationName}"后，将彻底移除该配置，是否确认删除？`,
        '删除确认',
        {
          confirmButtonText: '确定删除',
          cancelButtonText: '取消',
          type: 'warning'
        }
    )

    const index = relationList.value.findIndex(r => r.id === row.id)
    if (index !== -1) {
      relationList.value.splice(index, 1)
      ElMessage.success('删除成功')
      emit('change', relationList.value)
    }
  } catch {
    // 用户取消
  }
}

// 切换状态
const handleToggleStatus = async (row) => {
  const action = row.status === 'enabled' ? '停用' : '启用'

  // 前置引用校验（停用时需要检查引用）
  if (action === '停用' && row.references && (row.references.forms > 0 || row.references.processes > 0)) {
    try {
      await ElMessageBox.confirm(
          `该关联已被 ${row.references.forms} 个表单、${row.references.processes} 个审批流程引用，停用可能导致流程异常，是否继续？`,
          '引用校验提示',
          {
            confirmButtonText: '继续停用',
            cancelButtonText: '取消',
            type: 'warning'
          }
      )
    } catch {
      return
    }
  }

  // 二次确认弹窗
  try {
    await ElMessageBox.confirm(
        action === '停用'
            ? `确定要停用关联"${row.relationName}"吗？\n\n停用后：\n• 该关联将在表单中隐藏\n• 新建流程无法使用该关联\n• 历史数据不受影响`
            : `确定要启用关联"${row.relationName}"吗？\n\n启用后：\n• 该关联将在表单中显示\n• 新建流程可以使用该关联`,
        `${action}确认`,
        {
          confirmButtonText: `确定${action}`,
          cancelButtonText: '取消',
          type: action === '停用' ? 'warning' : 'success',
          dangerouslyUseHTMLString: true
        }
    )

    // 执行状态切换
    row.status = row.status === 'enabled' ? 'disabled' : 'enabled'
    row.changeType = row.isNewRelation ? row.changeType : action

    ElMessage.success(`${action}成功`)
    emit('change', relationList.value)
  } catch {
    // 用户取消
  }
}

// 批量删除
const handleBatchDelete = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要删除的关联')
    return
  }

  ElMessageBox.confirm(
      `确定要批量删除选中的 ${selectedRows.value.length} 个关联吗？`,
      '批量删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
  ).then(() => {
    const ids = selectedRows.value.map(r => r.id)
    relationList.value = relationList.value.filter(r => !ids.includes(r.id))
    ElMessage.success('批量删除成功')
    emit('change', relationList.value)
  }).catch(() => {})
}

// 查看日志
const handleViewLogs = (row) => {
  currentRelationName.value = row.relationName
  logDialogVisible.value = true
}

// 选择变化
const handleSelectionChange = (rows) => {
  selectedRows.value = rows
}

// 级联删除变化
const handleCascadeDeleteChange = async (row) => {
  if (row.cascadeDelete) {
    // 强合规业务域强制禁用
    const strictDomains = ['hr', 'finance', 'risk']
    if (strictDomains.includes(props.businessDomain)) {
      row.cascadeDelete = false
      ElMessageBox.alert(
          '人事/财务/风控等强合规业务域强制禁用级联删除功能，任何关联都不可开启。',
          '合规限制',
          {
            confirmButtonText: '我知道了',
            type: 'error'
          }
      )
      return
    }

    try {
      await ElMessageBox.confirm(
          '开启级联删除后，删除主表数据将同步删除当前业务对象的对应数据，违反金融合规要求，是否确认？',
          '高风险操作确认',
          {
            confirmButtonText: '确认开启',
            cancelButtonText: '取消',
            type: 'error',
            confirmButtonClass: 'el-button--danger'
          }
      )
    } catch {
      row.cascadeDelete = false
    }
  }
}
</script>

<style scoped lang="scss">.relation-management {
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

    .version-alert {
      margin: 0;
      flex: 1;
    }
  }

  .filter-bar {
    margin-bottom: 16px;
    padding: 12px 16px;
    background: #f5f7fa;
    border-radius: 8px;
  }

  .relation-name-cell {
    display: flex;
    align-items: center;
    gap: 8px;

    .relation-name {
      font-size: 14px;
      color: #303133;
    }

    .system-relation {
      color: #909399;
    }

    .system-tag {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
    }

    .new-tag {
      font-size: 12px;
    }
  }

  // 变更类型样式（视觉强化，防止换行）
  .change-type-cell {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px; // 减小间距
    font-size: 13px;
    font-weight: 600;
    padding: 6px 10px; // 减小左右内边距
    border-radius: 6px;
    border: 1px solid;
    white-space: nowrap; // 防止换行
    min-width: max-content; // 最小宽度自适应内容

    .change-type-text {
      white-space: nowrap;
      flex-shrink: 0; // 防止文字被压缩
    }

    .el-icon {
      flex-shrink: 0; // 防止图标被压缩
    }

    &.change-type-add {
      color: #67c23a;
      background: rgba(103, 194, 58, 0.15);
      border-color: rgba(103, 194, 58, 0.3);
    }

    &.change-type-modify {
      color: #e6a23c;
      background: rgba(230, 162, 60, 0.15);
      border-color: rgba(230, 162, 60, 0.3);
    }

    &.change-type-disable {
      color: #f56c6c;
      background: rgba(245, 108, 108, 0.15);
      border-color: rgba(245, 108, 108, 0.3);
    }

    &.change-type-original {
      color: #909399;
      background: rgba(144, 147, 153, 0.08);
      border-color: rgba(144, 147, 153, 0.2);
    }
  }

  // 行背景色
  :deep(.el-table__row) {
    &.new-relation-row {
      background-color: rgba(103, 194, 58, 0.06) !important;

      &:hover {
        background-color: rgba(103, 194, 58, 0.12) !important;
      }
    }

    &.modified-relation-row {
      background-color: rgba(230, 162, 60, 0.06) !important;

      &:hover {
        background-color: rgba(230, 162, 60, 0.12) !important;
      }
    }

    &.disabled-relation-row {
      background-color: rgba(245, 108, 108, 0.06) !important;

      &:hover {
        background-color: rgba(245, 108, 108, 0.12) !important;
      }
    }

    &.original-relation-row {
      background-color: #f9fafb;

      &:hover {
        background-color: #f0f2f5 !important;
      }
    }
  }

  // 操作按钮
  .action-buttons {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px; // 增加按钮间距
    white-space: nowrap;
    flex-wrap: nowrap;
    padding: 4px 8px; // 添加左右内边距

    .action-btn {
      margin: 0;
      padding: 8px 16px; // 增加按钮内边距
      font-size: 13px;
      font-weight: 500;
      border-radius: 6px;
      transition: all 0.3s;

      &.edit-btn {
        &:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(64, 158, 255, 0.35);
        }
      }

      &.toggle-btn {
        &:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(230, 162, 60, 0.35);
        }
      }

      &.delete-btn {
        &:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(245, 108, 108, 0.35);
        }
      }

      &.log-btn {
        &:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(144, 147, 153, 0.35);
        }
      }
    }

    .lock-tag {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 6px 16px; // 增加内边距
      font-size: 13px;
      border-radius: 6px;
      background-color: #f5f7fa;
      border: 1px solid #e4e7ed;
      color: #909399;

      .el-icon {
        font-size: 12px;
      }
    }
  }

  .graph-view {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    background: #f5f7fa;
    border-radius: 8px;

    .graph-placeholder {
      text-align: center;
      color: #909399;

      p {
        margin: 16px 0 8px;
        font-size: 16px;
      }

      .sub-text {
        font-size: 14px;
        color: #c0c4cc;
        margin-bottom: 24px;
      }
    }
  }

  .pagination-wrapper {
    margin-top: 16px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>
