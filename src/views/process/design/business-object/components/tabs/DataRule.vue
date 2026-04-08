<template>
  <div class="data-rule">
    <div class="tab-toolbar">
      <div class="toolbar-left">
        <el-button type="primary" size="default" icon="Plus" @click="handleAddRule">新增规则</el-button>
        <el-button size="default" icon="Select">批量启用/禁用</el-button>
        <el-button v-if="!isVersionEdit" size="default" icon="Upload">导入规则</el-button>
        <el-button v-if="!isVersionEdit" size="default" icon="Download">导出规则</el-button>
      </div>
    </div>

    <el-table :data="ruleList" border style="width: 100%" max-height="400">
      <el-table-column prop="ruleName" label="规则名称" min-width="200" />
      <el-table-column prop="ruleType" label="规则类型" width="120">
        <template #default="{ row }">
          <el-tag size="small" :type="row.ruleType === 'validation' ? 'warning' : 'info'">
            {{ row.ruleType === 'validation' ? '数据校验' : '默认值' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="targetField" label="绑定字段" min-width="150">
        <template #default="{ row }">
          <el-tag v-for="field in getTargetFields(row.targetField)" :key="field" size="small" style="margin-right: 4px">
            {{ field }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="triggerTime" label="触发时机" width="180">
        <template #default="{ row }">
          <span>{{ (row.triggerTime || []).join('、') }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="80" align="center">
        <template #default="{ row }">
          <el-tag size="small" :type="row.status ? 'success' : 'info'">
            {{ row.status ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" align="center">
        <template #default="{ row }">
          <el-button size="small" type="primary" icon="Edit" @click="handleEditRule(row)">编辑</el-button>
          <el-button size="small" :type="row.status ? 'warning' : 'success'" @click="handleToggleRuleStatus(row)">
            {{ row.status ? '禁用' : '启用' }}
          </el-button>
          <el-button v-if="!isVersionEdit || row.isNewRule" size="small" type="danger" icon="Delete" @click="handleDeleteRule(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const props = defineProps({
  isVersionEdit: {
    type: Boolean,
    default: false
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
    system: true
  },
  {
    id: 2,
    ruleName: '车牌号格式校验',
    ruleType: 'validation',
    targetField: 'license_plate',
    description: '必须符合中国大陆车牌号格式（如：京A12345）',
    status: 'enabled',
    system: false
  },
  {
    id: 3,
    ruleName: '用车时间逻辑校验',
    ruleType: 'validation',
    targetField: 'start_time,end_time',
    description: '结束时间必须晚于开始时间，且不能早于当前时间',
    status: 'enabled',
    system: false
  },
  {
    id: 4,
    ruleName: '随行人数范围限制',
    ruleType: 'validation',
    targetField: 'passenger_count',
    description: '随行人数必须在 1-20 之间',
    status: 'enabled',
    system: false
  },
  {
    id: 5,
    ruleName: '紧急联系人联动',
    ruleType: 'linkage',
    targetField: 'emergency_contact',
    description: '当随行人数超过 5 人时，紧急联系人必填',
    status: 'enabled',
    system: false
  },
  {
    id: 6,
    ruleName: '联系电话格式校验',
    ruleType: 'validation',
    targetField: 'contact_phone',
    description: '必须符合中国大陆手机号格式（11位数字）',
    status: 'enabled',
    system: false
  },
  {
    id: 7,
    ruleName: '用车事由长度限制',
    ruleType: 'validation',
    targetField: 'usage_reason',
    description: '用车事由不能少于 10 个字符',
    status: 'enabled',
    system: false
  },
  {
    id: 8,
    ruleName: '申请日期默认值',
    ruleType: 'default_value',
    targetField: 'apply_date',
    description: '默认值为当前日期',
    status: 'enabled',
    system: true
  }
])

const handleAddRule = () => {
  ElMessage.info('新增规则功能开发中...')
}

const handleEditRule = (row) => {
  ElMessage.info('编辑规则功能开发中...')
}

const handleToggleRuleStatus = (row) => {
  row.status = !row.status
  ElMessage.success(row.status ? '已启用' : '已禁用')
  emit('change', ruleList.value)
}

const handleDeleteRule = (row) => {
  ElMessageBox.confirm(`确定要删除规则"${row.ruleName}"吗？`, '删除确认', { type: 'warning' }).then(() => {
    ruleList.value = ruleList.value.filter(r => r.id !== row.id)
    ElMessage.success('删除成功')
    emit('change', ruleList.value)
  }).catch(() => {})
}

// 获取目标字段数组（处理逗号分隔的字符串）
const getTargetFields = (targetField) => {
  if (!targetField) return []
  return targetField.split(',').map(f => f.trim())
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

    .toolbar-left {
      display: flex;
      gap: 12px;
    }
  }
}
</style>
