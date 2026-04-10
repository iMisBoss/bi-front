<template>
  <el-dialog v-model="visible" title="规则详情" width="700px" :close-on-click-modal="false">
    <el-descriptions :column="1" border v-if="rule">
      <el-descriptions-item label="规则名称">{{ rule.ruleName }}</el-descriptions-item>
      <el-descriptions-item label="规则类型">
        <el-tag :type="rule.ruleType === 'global' ? 'primary' : 'info'" size="small">
          {{ rule.ruleType === 'global' ? '全局通用规则' : '流程专属规则' }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="适用流程">{{ rule.processName || '-' }}</el-descriptions-item>
      <el-descriptions-item label="绑定节点">
        {{ (rule.boundNodes || []).join('、') || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="分配策略">{{ getStrategyText(rule.strategy) }}</el-descriptions-item>
      <el-descriptions-item label="审批目标">{{ rule.target }}</el-descriptions-item>
      <el-descriptions-item label="优先级">
        <el-tag :type="getPriorityTag(rule.priority)" size="small">{{ rule.priority }}</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="规则说明">{{ rule.description || '-' }}</el-descriptions-item>
    </el-descriptions>
    <template #footer>
      <el-button @click="visible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  rule: Object
})

const emit = defineEmits(['update:modelValue'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const getStrategyText = (strategy) => {
  const texts = { specific_user: '指定人员', specific_role: '指定角色', initiator_superior: '发起人上级', condition_branch: '条件分支' }
  return texts[strategy] || strategy
}

const getPriorityTag = (priority) => {
  if (priority >= 20) return 'danger'
  if (priority >= 10) return 'warning'
  return 'info'
}
</script>
