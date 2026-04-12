<template>
  <div class="form-linkage-config">
    <el-empty v-if="!formId" description="请先选择表单" :image-size="80" />
    <div v-else class="linkage-content">
      <div class="toolbar">
        <el-button type="primary" size="small" @click="handleAddRule">
          <el-icon><Plus /></el-icon>
          新建规则
        </el-button>
        <span class="total-count">共 {{ rules.length }} 条规则</span>
      </div>
      <el-table :data="rules" border stripe>
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
            <el-button size="small" type="primary" @click="handleEditRule(row)">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button size="small" type="danger" @click="handleDeleteRule(row)">
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 规则编辑弹窗 -->
    <el-dialog v-model="editDialog.visible" :title="editDialog.isEdit ? '编辑规则' : '新建规则'" width="600px" append-to-body>
      <el-form :model="editDialog.form" label-width="100px">
        <el-form-item label="规则名称">
          <el-input v-model="editDialog.form.ruleName" placeholder="如：请假类型天数显隐" />
        </el-form-item>
        <el-form-item label="触发字段">
          <el-select v-model="editDialog.form.triggerField" placeholder="选择字段" style="width: 100%">
            <el-option label="请假类型" value="leave_type" />
            <el-option label="报销金额" value="expense_amount" />
            <el-option label="申请部门" value="dept" />
          </el-select>
        </el-form-item>
        <el-form-item label="触发条件">
          <el-select v-model="editDialog.form.triggerCondition" placeholder="选择条件" style="width: 100%">
            <el-option label="等于" value="eq" />
            <el-option label="不等于" value="neq" />
            <el-option label="大于" value="gt" />
            <el-option label="小于" value="lt" />
          </el-select>
        </el-form-item>
        <el-form-item label="触发值">
          <el-input v-model="editDialog.form.triggerValue" placeholder="如：事假" />
        </el-form-item>
        <el-form-item label="规则类型">
          <el-select v-model="editDialog.form.ruleType" placeholder="选择类型" style="width: 100%">
            <el-option label="显示/隐藏字段" value="toggle" />
            <el-option label="自动赋值" value="assign" />
            <el-option label="下拉选项筛选" value="filter" />
            <el-option label="设置必填/只读" value="required" />
          </el-select>
        </el-form-item>
        <el-form-item label="执行字段">
          <el-select v-model="editDialog.form.targetField" placeholder="选择字段" style="width: 100%">
            <el-option label="请假天数" value="leave_days" />
            <el-option label="请假事由" value="leave_reason" />
            <el-option label="报销金额" value="expense_amount" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveRule">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Delete } from '@element-plus/icons-vue'

const props = defineProps({
  formId: {
    type: [String, Number],
    default: null
  },
  formName: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['saved'])

const rules = ref([
  {
    id: 1,
    ruleName: '病假显示请假事由',
    triggerField: '请假类型',
    triggerCondition: 'eq',
    triggerValue: '病假',
    ruleType: 'toggle',
    targetField: '请假事由',
    actionValue: '显示',
    status: 'enabled'
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
    status: 'enabled'
  }
])

const editDialog = ref({
  visible: false,
  isEdit: false,
  form: {
    ruleName: '',
    triggerField: '',
    triggerCondition: '',
    triggerValue: '',
    ruleType: '',
    targetField: ''
  }
})

const getRuleTypeTag = (type) => {
  const map = { toggle: 'primary', assign: 'success', filter: 'warning', required: 'danger' }
  return map[type] || ''
}

const getRuleTypeLabel = (type) => {
  const map = { toggle: '显隐', assign: '赋值', filter: '筛选', required: '必填' }
  return map[type] || type
}

const handleAddRule = () => {
  editDialog.value.isEdit = false
  editDialog.value.form = {
    ruleName: '',
    triggerField: '',
    triggerCondition: '',
    triggerValue: '',
    ruleType: '',
    targetField: ''
  }
  editDialog.value.visible = true
}

const handleEditRule = (row) => {
  editDialog.value.isEdit = true
  editDialog.value.form = { ...row }
  editDialog.value.visible = true
}

const handleSaveRule = () => {
  if (!editDialog.value.form.ruleName) {
    ElMessage.warning('请输入规则名称')
    return
  }
  if (editDialog.value.isEdit) {
    const idx = rules.value.findIndex(r => r.id === editDialog.value.form.id)
    if (idx !== -1) rules.value[idx] = { ...editDialog.value.form }
  } else {
    rules.value.push({ ...editDialog.value.form, id: Date.now(), status: 'enabled' })
  }
  editDialog.value.visible = false
  ElMessage.success('保存成功')
  emit('saved')
}

const handleDeleteRule = (row) => {
  ElMessageBox.confirm('确认删除该规则？', '删除确认', { type: 'warning' }).then(() => {
    rules.value = rules.value.filter(r => r.id !== row.id)
    ElMessage.success('删除成功')
  }).catch(() => {})
}

const handleStatusChange = (row) => {
  ElMessage.success(`规则已${row.status === 'enabled' ? '启用' : '禁用'}`)
}
</script>

<style scoped lang="scss">
.form-linkage-config {
  .toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    .total-count {
      font-size: 13px;
      color: #909399;
    }
  }
}
</style>
