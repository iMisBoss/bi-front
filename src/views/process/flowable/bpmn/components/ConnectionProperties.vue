<template>
  <div class="connection-properties">
    <el-form :model="localConnection" label-width="80px" size="small">
      <el-form-item label="源节点">
        <el-tag>{{ getSourceNodeName() }}</el-tag>
      </el-form-item>

      <el-form-item label="目标节点">
        <el-tag>{{ getTargetNodeName() }}</el-tag>
      </el-form-item>

      <el-divider content-position="left">流转条件</el-divider>

      <el-form-item label="条件类型">
        <el-select v-model="localConnection.conditionType" style="width: 100%" @change="emitChange">
          <el-option label="无条件（默认路径）" value="none" />
          <el-option label="表单条件" value="form" />
          <el-option label="表达式" value="expression" />
        </el-select>
      </el-form-item>

      <template v-if="localConnection.conditionType === 'form'">
        <el-form-item label="条件字段">
          <el-select v-model="localConnection.conditionField" placeholder="选择字段" style="width: 100%" @change="emitChange">
            <el-option label="报销金额" value="expense_amount" />
            <el-option label="请假天数" value="leave_days" />
            <el-option label="请假类型" value="leave_type" />
            <el-option label="申请部门" value="dept" />
          </el-select>
        </el-form-item>

        <el-form-item label="条件运算符">
          <el-select v-model="localConnection.conditionOperator" style="width: 100%" @change="emitChange">
            <el-option label="等于" value="eq" />
            <el-option label="不等于" value="neq" />
            <el-option label="大于" value="gt" />
            <el-option label="小于" value="lt" />
            <el-option label="包含" value="contains" />
          </el-select>
        </el-form-item>

        <el-form-item label="条件值">
          <el-input v-model="localConnection.conditionValue" placeholder="如：5000" @input="emitChange" />
        </el-form-item>

        <el-form-item label="条件组合">
          <el-radio-group v-model="localConnection.conditionLogic" @change="emitChange">
            <el-radio label="and">且（同时满足）</el-radio>
            <el-radio label="or">或（满足任一）</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-alert type="success" :closable="false" show-icon>
          流转条件示例：{{ getConditionExample() }}
        </el-alert>
      </template>

      <el-form-item label="流转优先级">
        <el-input-number v-model="localConnection.priority" :min="1" :max="100" style="width: 100%" @change="emitChange" />
        <div class="tip">数字越小优先级越高，多分支时按优先级执行</div>
      </el-form-item>

      <el-divider content-position="left">自动流转</el-divider>

      <el-form-item label="自动流转">
        <el-switch v-model="localConnection.autoFlow" @change="emitChange" />
        <div class="tip">开启后无需人工操作，满足条件自动流转</div>
      </el-form-item>

      <el-form-item label="超时处理" v-if="!localConnection.autoFlow">
        <el-select v-model="localConnection.timeoutAction" style="width: 100%" @change="emitChange">
          <el-option label="不处理" value="none" />
          <el-option label="自动驳回" value="auto_reject" />
          <el-option label="自动提醒" value="remind" />
        </el-select>
      </el-form-item>

      <el-form-item label="超时时间" v-if="localConnection.timeoutAction !== 'none'">
        <el-input-number v-model="localConnection.timeoutHours" :min="1" :max="720" style="width: 100%" @change="emitChange" />
        <span class="unit">小时</span>
      </el-form-item>

      <el-form-item label="流转说明">
        <el-input
            v-model="localConnection.description"
            type="textarea"
            :rows="2"
            placeholder="选填，说明流转规则"
            @input="emitChange"
        />
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { reactive, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Object,
    default: null
  },
  allNodes: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue'])

const localConnection = reactive({ ...props.modelValue })

const getSourceNodeName = () => {
  if (!localConnection || !props.allNodes) return '-'
  const node = props.allNodes.find(n => n.id === localConnection.source)
  return node ? node.name : '-'
}

const getTargetNodeName = () => {
  if (!localConnection || !props.allNodes) return '-'
  const node = props.allNodes.find(n => n.id === localConnection.target)
  return node ? node.name : '-'
}

const getConditionExample = () => {
  if (!localConnection) return ''
  const { conditionField, conditionOperator, conditionValue } = localConnection

  const fieldNames = {
    expense_amount: '报销金额',
    leave_days: '请假天数',
    leave_type: '请假类型',
    dept: '申请部门'
  }

  const operatorMap = {
    eq: '等于',
    neq: '不等于',
    gt: '大于',
    lt: '小于',
    contains: '包含'
  }

  const fieldName = fieldNames[conditionField] || conditionField
  const operator = operatorMap[conditionOperator] || conditionOperator

  return `${fieldName} ${operator} ${conditionValue}`
}

const emitChange = () => {
  emit('update:modelValue', { ...localConnection })
}

watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    Object.assign(localConnection, newVal)
  }
}, { deep: true })
</script>

<style scoped lang="scss">
.connection-properties {
  .unit {
    margin-left: 8px;
    font-size: 12px;
    color: #909399;
  }

  .tip {
    margin-top: 4px;
    font-size: 12px;
    color: #909399;
    line-height: 1.5;
  }

  :deep(.el-divider) {
    margin: 10px 0;
  }

  :deep(.el-alert) {
    margin-bottom: 12px;
  }
}
</style>
