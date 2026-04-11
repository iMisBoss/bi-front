<template>
  <el-dialog
      v-model="visible"
      title="表单联动规则配置"
      width="1000px"
      :close-on-click-modal="false"
      @close="handleClose"
  >
    <div class="linkage-config-dialog">
      <div class="linkage-header">
        <span class="header-title">已配置规则列表</span>
        <el-button type="primary" size="small" icon="Plus" @click="openRuleDrawer()">新增规则</el-button>
      </div>

      <el-empty v-if="rules.length === 0" description="暂无联动规则，点击右上角新增" :image-size="80" />

      <div v-else class="rule-list">
        <div
            v-for="(rule, index) in rules"
            :key="index"
            class="rule-item"
        >
          <div class="rule-content">
            <div class="rule-name">
              <el-tag size="small" type="primary">规则{{ index + 1 }}</el-tag>
              <span class="rule-desc">{{ rule.description }}</span>
            </div>
            <div class="rule-status">
              <el-switch
                  v-model="rule.enabled"
                  size="small"
                  inline-prompt
                  active-text="启用"
                  inactive-text="禁用"
              />
            </div>
          </div>
          <div class="rule-actions">
            <el-button size="small" type="primary" link @click="openRuleDrawer(rule, index)">编辑</el-button>
            <el-button size="small" type="danger" link @click="deleteRule(index)">删除</el-button>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleSave">保存</el-button>
    </template>

    <!-- 联动规则配置抽屉 -->
    <el-drawer
        v-model="ruleDrawer.visible"
        :title="ruleDrawer.isEdit ? '编辑联动规则' : '新增联动规则'"
        size="600px"
        :close-on-click-modal="false"
    >
      <el-form :model="ruleDrawer.form" label-width="100px" size="small">
        <el-divider content-position="left">1. 触发条件（IF）</el-divider>

        <div v-for="(condition, cIndex) in ruleDrawer.form.conditions" :key="cIndex" class="condition-item">
          <el-form-item label="当" required>
            <el-select v-model="condition.field" placeholder="选择控件" style="width: 140px">
              <el-option
                  v-for="field in availableFields"
                  :key="field.code"
                  :label="field.label"
                  :value="field.code"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="" required>
            <el-select v-model="condition.operator" placeholder="条件" style="width: 120px">
              <el-option label="等于" value="eq" />
              <el-option label="不等于" value="neq" />
              <el-option label="包含" value="contains" />
              <el-option label="为空" value="empty" />
            </el-select>
          </el-form-item>
          <el-form-item label="">
            <el-input v-model="condition.value" placeholder="值" style="width: 140px" />
          </el-form-item>
          <el-button
              v-if="cIndex > 0"
              size="small"
              type="danger"
              link
              icon="Delete"
              @click="removeCondition(cIndex)"
          >
            删除
          </el-button>
        </div>

        <el-button size="small" type="primary" link icon="Plus" @click="addCondition" style="margin-bottom: 20px">
          添加条件
        </el-button>

        <el-divider content-position="left">2. 执行动作（THEN）</el-divider>

        <el-form-item label="动作类型" required>
          <el-select v-model="ruleDrawer.form.actionType" placeholder="选择动作" style="width: 100%">
            <el-option label="显示控件" value="show" />
            <el-option label="隐藏控件" value="hide" />
            <el-option label="赋值" value="assign" />
            <el-option label="设为必填" value="required" />
            <el-option label="取消必填" value="optional" />
          </el-select>
        </el-form-item>

        <el-form-item label="目标控件" required>
          <el-select v-model="ruleDrawer.form.targetField" placeholder="选择目标控件" style="width: 100%">
            <el-option
                v-for="field in availableFields"
                :key="field.code"
                :label="field.label"
                :value="field.code"
            />
          </el-select>
        </el-form-item>

        <el-form-item v-if="ruleDrawer.form.actionType === 'assign'" label="赋值内容">
          <el-input v-model="ruleDrawer.form.assignValue" placeholder="固定值或变量" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="ruleDrawer.visible = false">取消</el-button>
        <el-button type="primary" @click="saveRule">确定</el-button>
      </template>
    </el-drawer>
  </el-dialog>
</template>

<script setup>import { ref, reactive, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Delete } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  formFields: {
    type: Array,
    default: () => []
  },
  initialRules: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue', 'save'])

const visible = ref(false)
const rules = ref([])

// 可用字段列表（排除容器和明细表）
const availableFields = computed(() => {
  return props.formFields.filter(field =>
      !['grid', 'group', 'card'].includes(field.type) &&
      !field.type.includes('Detail')
  )
})

// 规则配置抽屉
const ruleDrawer = reactive({
  visible: false,
  isEdit: false,
  editIndex: -1,
  form: {
    conditions: [
      { field: '', operator: 'eq', value: '' }
    ],
    actionType: 'show',
    targetField: '',
    assignValue: ''
  }
})

watch(() => props.modelValue, (val) => {
  visible.value = val
  if (val) {
    rules.value = JSON.parse(JSON.stringify(props.initialRules || []))
  }
})

watch(visible, (val) => {
  emit('update:modelValue', val)
})

const generateRuleDescription = (rule) => {
  if (!rule.conditions || rule.conditions.length === 0) return '未配置条件'

  const condition = rule.conditions[0]
  const field = availableFields.value.find(f => f.code === condition.field)
  const targetField = availableFields.value.find(f => f.code === rule.targetField)

  const fieldName = field ? field.label : condition.field
  const targetName = targetField ? targetField.label : rule.targetField

  const actionMap = {
    show: `显示「${targetName}」`,
    hide: `隐藏「${targetName}」`,
    assign: `赋值「${targetName}」为${rule.assignValue}`,
    required: `将「${targetName}」设为必填`,
    optional: `取消「${targetName}」必填`
  }

  return `${fieldName} ${getOperatorLabel(condition.operator)} ${condition.value} → ${actionMap[rule.actionType] || '未知操作'}`
}

const getOperatorLabel = (operator) => {
  const map = {
    eq: '=',
    neq: '≠',
    contains: '包含',
    empty: '为空'
  }
  return map[operator] || operator
}

const openRuleDrawer = (rule = null, index = -1) => {
  if (rule) {
    ruleDrawer.isEdit = true
    ruleDrawer.editIndex = index
    ruleDrawer.form = JSON.parse(JSON.stringify(rule))
  } else {
    ruleDrawer.isEdit = false
    ruleDrawer.editIndex = -1
    ruleDrawer.form = {
      conditions: [
        { field: '', operator: 'eq', value: '' }
      ],
      actionType: 'show',
      targetField: '',
      assignValue: ''
    }
  }
  ruleDrawer.visible = true
}

const addCondition = () => {
  ruleDrawer.form.conditions.push({
    field: '',
    operator: 'eq',
    value: ''
  })
}

const removeCondition = (index) => {
  ruleDrawer.form.conditions.splice(index, 1)
}

const saveRule = () => {
  // 验证
  for (const condition of ruleDrawer.form.conditions) {
    if (!condition.field) {
      ElMessage.warning('请选择触发条件的控件')
      return
    }
  }

  if (!ruleDrawer.form.targetField) {
    ElMessage.warning('请选择目标控件')
    return
  }

  // 生成描述
  ruleDrawer.form.description = generateRuleDescription(ruleDrawer.form)

  if (ruleDrawer.isEdit) {
    rules.value[ruleDrawer.editIndex] = JSON.parse(JSON.stringify(ruleDrawer.form))
    ElMessage.success('规则已更新')
  } else {
    rules.value.push(JSON.parse(JSON.stringify(ruleDrawer.form)))
    ElMessage.success('规则已添加')
  }

  ruleDrawer.visible = false
}

const deleteRule = (index) => {
  rules.value.splice(index, 1)
  ElMessage.success('规则已删除')
}

const handleSave = () => {
  emit('save', rules.value)
  visible.value = false
  ElMessage.success('联动规则配置已保存')
}

const handleClose = () => {
  visible.value = false
}
</script>

<style scoped lang="scss">.linkage-config-dialog {
  .linkage-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    .header-title {
      font-size: 14px;
      font-weight: 600;
      color: #303133;
    }
  }

  .rule-list {
    max-height: 400px;
    overflow-y: auto;

    .rule-item {
      padding: 12px;
      background: #f5f7fa;
      border-radius: 6px;
      margin-bottom: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      transition: all 0.2s;

      &:hover {
        background: #e8f4ff;
      }

      .rule-content {
        flex: 1;
        display: flex;
        justify-content: space-between;
        align-items: center;

        .rule-name {
          display: flex;
          align-items: center;
          gap: 8px;

          .rule-desc {
            font-size: 13px;
            color: #606266;
          }
        }

        .rule-status {
          margin-left: 16px;
        }
      }

      .rule-actions {
        display: flex;
        gap: 8px;
        margin-left: 16px;
      }
    }
  }

  .condition-item {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
  }
}
</style>