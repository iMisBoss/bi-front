<template>
  <el-dialog v-model="visible" title="测试规则" width="600px" :close-on-click-modal="false">
    <el-alert
        title="输入模拟数据，验证规则计算结果"
        type="info"
        show-icon
        :closable="false"
        style="margin-bottom: 16px"
    />

    <el-form :model="testForm" label-width="100px">
      <el-form-item label="发起人">
        <el-input v-model="testForm.initiator" placeholder="请输入发起人姓名" />
      </el-form-item>
      <el-form-item label="请假天数">
        <el-input-number v-model="testForm.leaveDays" :min="0" style="width: 100%" />
      </el-form-item>
      <el-form-item label="报销金额">
        <el-input-number v-model="testForm.expenseAmount" :min="0" style="width: 100%" />
      </el-form-item>
      <el-form-item label="申请人职级">
        <el-select v-model="testForm.applicantLevel" placeholder="请选择" style="width: 100%">
          <el-option label="普通员工" value="employee" />
          <el-option label="部门经理" value="manager" />
          <el-option label="总监" value="director" />
        </el-select>
      </el-form-item>
    </el-form>

    <div v-if="testResult" class="test-result">
      <el-divider content-position="left">测试结果</el-divider>
      <el-alert
          :title="testResult"
          type="success"
          show-icon
          :closable="false"
      />
      <div class="result-detail" v-if="resultDetail">
        <p><strong>计算逻辑：</strong>{{ resultDetail }}</p>
      </div>
    </div>

    <template #footer>
      <el-button @click="visible = false">关闭</el-button>
      <el-button type="primary" icon="Promotion" @click="runTest">开始测试</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  rule: Object
})

const emit = defineEmits(['update:modelValue'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const testForm = ref({
  initiator: '',
  leaveDays: 0,
  expenseAmount: 0,
  applicantLevel: ''
})

const testResult = ref('')
const resultDetail = ref('')

const runTest = () => {
  if (!props.rule) return

  const strategy = props.rule.strategy
  let result = ''
  let detail = ''

  switch (strategy) {
    case 'initiator_superior':
      result = `${testForm.value.initiator || '发起人'}的直接上级`
      detail = '根据组织架构自动获取发起人的直接上级作为审批人'
      break
    case 'specific_role':
      result = props.rule.target || '指定角色人员'
      detail = `从系统中查找具有「${props.rule.target}」角色的人员`
      break
    case 'specific_user':
      result = props.rule.target || '指定人员'
      detail = `直接指定「${props.rule.target}」为审批人`
      break
    case 'condition_branch':
      if (testForm.value.leaveDays > 5) {
        result = '总经理审批'
        detail = `请假天数 ${testForm.value.leaveDays} 天 > 5天，触发条件分支，由总经理审批`
      } else if (testForm.value.expenseAmount > 10000) {
        result = '总经理审批'
        detail = `报销金额 ${testForm.value.expenseAmount} 元 > 10000元，触发条件分支，由总经理审批`
      } else {
        result = '部门经理审批'
        detail = `未满足特殊条件，由默认审批人（部门经理）审批`
      }
      break
    default:
      result = props.rule.target || '未知审批人'
      detail = '使用默认配置'
  }

  testResult.value = `最终审批人：${result}`
  resultDetail.value = detail
}
</script>

<style scoped lang="scss">
.test-result {
  margin-top: 16px;

  .result-detail {
    margin-top: 12px;
    padding: 12px;
    background: #f5f7fa;
    border-radius: 4px;
    font-size: 13px;
    color: #606266;

    p {
      margin: 0;
    }
  }
}
</style>
