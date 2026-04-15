<template>
  <el-drawer
      v-model="visible"
      title="流程全字段详情"
      size="800px"
      :close-on-click-modal="false"
  >
    <el-tabs v-model="activeTab">
      <el-tab-pane label="基础信息" name="basic">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="流程编号">{{ data.processNo }}</el-descriptions-item>
          <el-descriptions-item label="流程名称">{{ data.processName }}</el-descriptions-item>
          <el-descriptions-item label="流程模板">{{ data.template }}</el-descriptions-item>
          <el-descriptions-item label="流程状态">
            <el-tag :type="getStatusType(data.status)">{{ data.status }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="发起时间">{{ data.startTime }}</el-descriptions-item>
          <el-descriptions-item label="完成时间">{{ data.endTime }}</el-descriptions-item>
          <el-descriptions-item label="耗时">{{ data.duration }}</el-descriptions-item>
          <el-descriptions-item label="是否超时">
            <el-tag v-if="data.isTimeout" type="danger">超时</el-tag>
            <span v-else>否</span>
          </el-descriptions-item>
        </el-descriptions>
      </el-tab-pane>

      <el-tab-pane label="申请人信息" name="applicant">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="发起人">{{ data.initiator }}</el-descriptions-item>
          <el-descriptions-item label="工号">{{ data.initiatorNo }}</el-descriptions-item>
          <el-descriptions-item label="所属部门">{{ data.department }}</el-descriptions-item>
          <el-descriptions-item label="职位">{{ data.position }}</el-descriptions-item>
          <el-descriptions-item label="联系方式">{{ data.phone }}</el-descriptions-item>
        </el-descriptions>
      </el-tab-pane>

      <el-tab-pane label="审批轨迹" name="approval">
        <el-timeline>
          <el-timeline-item
              v-for="(node, index) in approvalNodes"
              :key="index"
              :timestamp="node.time"
              :type="node.type"
          >
            <div class="approval-node">
              <p><strong>节点{{ index + 1 }}：</strong>{{ node.node }}</p>
              <p><strong>审批人：</strong>{{ node.approver }}</p>
              <p><strong>审批时间：</strong>{{ node.time }}</p>
              <p><strong>审批动作：</strong>{{ node.action }}</p>
              <p v-if="node.opinion"><strong>审批意见：</strong>{{ node.opinion }}</p>
            </div>
          </el-timeline-item>
        </el-timeline>
      </el-tab-pane>

      <el-tab-pane label="业务表单" name="form">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="申请事由">{{ data.reason }}</el-descriptions-item>
          <el-descriptions-item label="附件数量">{{ data.attachmentCount }}</el-descriptions-item>
          <el-descriptions-item label="关联项目">{{ data.project }}</el-descriptions-item>
          <el-descriptions-item label="关联合同">{{ data.contract }}</el-descriptions-item>
          <el-descriptions-item label="请假类型" v-if="data.leaveType">{{ data.leaveType }}</el-descriptions-item>
          <el-descriptions-item label="请假天数" v-if="data.leaveDays">{{ data.leaveDays }}</el-descriptions-item>
          <el-descriptions-item label="报销金额" v-if="data.amount">{{ data.amount }}</el-descriptions-item>
          <el-descriptions-item label="费用类型" v-if="data.expenseType">{{ data.expenseType }}</el-descriptions-item>
        </el-descriptions>
      </el-tab-pane>

      <el-tab-pane label="附件列表" name="attachments">
        <el-table :data="attachments" size="small">
          <el-table-column prop="name" label="附件名称" />
          <el-table-column prop="size" label="大小" width="120" />
          <el-table-column label="操作" width="150">
            <template #default>
              <el-button link type="primary" size="small">预览</el-button>
              <el-button link type="primary" size="small">下载</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <el-tab-pane label="操作日志" name="logs">
        <el-timeline>
          <el-timeline-item
              v-for="(log, index) in operationLogs"
              :key="index"
              :timestamp="log.time"
              :type="log.type"
          >
            <p><strong>{{ log.user }}：</strong>{{ log.action }}</p>
          </el-timeline-item>
        </el-timeline>
      </el-tab-pane>
    </el-tabs>
  </el-drawer>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  processData: Object
})

const emit = defineEmits(['update:modelValue'])

const visible = ref(false)
const activeTab = ref('basic')

const approvalNodes = ref([
  { node: '发起申请', approver: '张三', time: '2026-01-10 09:00:00', action: '提交', opinion: '', type: 'primary' },
  { node: '部门审批', approver: '李四', time: '2026-01-10 14:30:00', action: '同意', opinion: '同意', type: 'success' },
  { node: '财务审批', approver: '王五', time: '2026-01-11 10:00:00', action: '同意', opinion: '已核实', type: 'success' },
  { node: '总经理审批', approver: '赵六', time: '2026-01-11 14:30:00', action: '同意', opinion: '批准', type: 'success' }
])

const attachments = ref([
  { name: '请假申请单.docx', size: '128KB' },
  { name: '相关证明.pdf', size: '256KB' }
])

const operationLogs = ref([
  { user: '张三', action: '发起流程', time: '2026-01-10 09:00:00', type: 'primary' },
  { user: '李四', action: '审批通过', time: '2026-01-10 14:30:00', type: 'success' },
  { user: '王五', action: '审批通过', time: '2026-01-11 10:00:00', type: 'success' },
  { user: '赵六', action: '审批通过', time: '2026-01-11 14:30:00', type: 'success' },
  { user: '系统', action: '流程归档', time: '2026-01-12 09:00:00', type: 'info' }
])

watch(() => props.modelValue, (val) => {
  visible.value = val
})

watch(visible, (val) => {
  emit('update:modelValue', val)
})

const getStatusType = (status) => {
  const map = { '草稿': 'info', '审批中': 'warning', '已通过': 'success', '已驳回': 'danger' }
  return map[status] || 'info'
}
</script>

<style scoped lang="scss">
.approval-node {
  p {
    margin: 4px 0;
    font-size: 13px;
  }
}
</style>
