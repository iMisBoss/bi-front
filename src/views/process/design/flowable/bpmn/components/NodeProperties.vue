<template>
  <div class="node-properties">
    <el-form :model="activeNode" label-width="80px" size="small">
      <el-form-item label="节点名称">
        <el-input v-model="activeNode.name" @change="handleNodeChange" />
      </el-form-item>

      <el-form-item label="节点类型">
        <el-tag :type="getNodeTagType(activeNode.type)" size="small">
          {{ getNodeTypeName(activeNode.type) }}
        </el-tag>
      </el-form-item>

      <!-- 开始节点 -->
      <template v-if="activeNode.type === 'start'">
        <el-divider content-position="left">开始节点</el-divider>
        <el-alert type="info" :closable="false" show-icon>
          开始节点是流程的起点，无需特殊配置
        </el-alert>
      </template>

      <!-- 结束节点 -->
      <template v-if="activeNode.type === 'end'">
        <el-divider content-position="left">结束节点</el-divider>
        <el-form-item label="结束处理">
          <el-select v-model="activeNode.endAction" style="width: 100%" @change="handleNodeChange">
            <el-option label="正常结束" value="normal" />
            <el-option label="自动归档" value="auto_archive" />
            <el-option label="发送结束通知" value="send_notify" />
          </el-select>
        </el-form-item>
      </template>

      <!-- 审批节点特有属性 -->
      <!-- 审批节点特有属性 -->
      <template v-if="activeNode.type === 'approval'">
        <el-divider content-position="left">审批人配置</el-divider>

        <el-form-item label="审批人来源">
          <el-select v-model="activeNode.assigneeType" style="width: 100%" @change="handleNodeChange">
            <el-option label="指定人员" value="user" />
            <el-option label="指定角色" value="role" />
            <el-option label="指定部门" value="dept" />
            <el-option label="部门负责人" value="dept_manager" />
            <el-option label="多级上级" value="multi_leader" />
            <el-option label="发起人自选" value="initiator_choice" />
            <el-option label="指定岗位" value="position" />
            <el-option label="动态接口" value="api" />
          </el-select>
        </el-form-item>

        <el-form-item label="审批人">
          <el-select
              v-model="activeNode.assignee"
              multiple
              placeholder="选择审批人"              style="width: 100%"
              @change="handleNodeChange"
          >
            <el-option label="张三" value="user_zhangsan" />
            <el-option label="李四" value="user_lisi" />
            <el-option label="部门经理" value="role_dept_manager" />
            <el-option label="总经理" value="role_general_manager" />
            <el-option label="HR经理" value="role_hr_manager" />
            <el-option label="财务主管" value="role_finance_manager" />
          </el-select>
          <div class="tip" v-if="activeNode.assigneeType === 'multi_leader'">
            多级上级：自动获取1级/2级/N级上级审批
          </div>
        </el-form-item>

        <el-form-item label="上级级别" v-if="activeNode.assigneeType === 'multi_leader'">
          <el-select v-model="activeNode.leaderLevel" style="width: 100%" @change="handleNodeChange">
            <el-option label="直接上级（1级）" value="1" />
            <el-option label="2级上级" value="2" />
            <el-option label="3级上级" value="3" />
            <el-option label="最高级上级" value="top" />
          </el-select>
        </el-form-item>

        <el-divider content-position="left">审批方式</el-divider>

        <el-form-item label="审批方式">
          <el-select v-model="activeNode.approvalType" style="width: 100%" @change="handleNodeChange">
            <el-option label="或签（单人通过即可）" value="single" />
            <el-option label="会签（全部通过）" value="countersign" />
            <el-option label="依次审批（顺序审批）" value="sequential" />
            <el-option label="票决制（按比例通过）" value="vote" />
          </el-select>
        </el-form-item>

        <el-form-item label="通过比例" v-if="activeNode.approvalType === 'vote'">
          <el-input-number v-model="activeNode.voteRatio" :min="50" :max="100" style="width: 100%" @change="handleNodeChange" />
          <span class="unit">%</span>
        </el-form-item>

        <el-form-item label="审批意见必填">
          <el-switch v-model="activeNode.commentRequired" @change="handleNodeChange" />
        </el-form-item>

        <el-divider content-position="left">驳回规则</el-divider>

        <el-form-item label="驳回规则">
          <el-select v-model="activeNode.rejectRule" style="width: 100%" @change="handleNodeChange">
            <el-option label="驳回到发起人" value="to_initiator" />
            <el-option label="驳回到上一节点" value="to_prev" />
            <el-option label="驳回到指定节点" value="to_specific" />
            <el-option label="不允许驳回" value="no_reject" />
          </el-select>
        </el-form-item>

        <el-form-item label="指定节点" v-if="activeNode.rejectRule === 'to_specific'">
          <el-select v-model="activeNode.rejectToNode" placeholder="选择节点" style="width: 100%" @change="handleNodeChange">
            <el-option v-for="node in allNodes" :key="node.id" :label="node.name" :value="node.id" />
          </el-select>
        </el-form-item>

        <el-divider content-position="left">超时处理</el-divider>

        <el-form-item label="超时处理">
          <el-select v-model="activeNode.timeoutAction" style="width: 100%" @change="handleNodeChange">
            <el-option label="不处理" value="none" />
            <el-option label="自动提醒" value="remind" />
            <el-option label="自动通过" value="auto_pass" />
            <el-option label="自动驳回" value="auto_reject" />
            <el-option label="转办指定人" value="transfer" />
          </el-select>
        </el-form-item>

        <el-form-item label="超时时间" v-if="activeNode.timeoutAction !== 'none'">
          <el-input-number v-model="activeNode.timeoutHours" :min="1" :max="720" style="width: 100%" @change="handleNodeChange" />
          <span class="unit">小时</span>
        </el-form-item>

        <el-form-item label="转办人" v-if="activeNode.timeoutAction === 'transfer'">
          <el-select v-model="activeNode.transferTo" placeholder="选择转办人" style="width: 100%" @change="handleNodeChange">
            <el-option label="部门经理" value="role_dept_manager" />
            <el-option label="总经理" value="role_general_manager" />
            <el-option label="指定人员" value="specific" />
          </el-select>
        </el-form-item>

        <el-divider content-position="left">节点通知</el-divider>

        <el-form-item label="到达通知">
          <el-checkbox-group v-model="activeNode.arriveNotify" @change="handleNodeChange">
            <el-checkbox value="message">站内消息</el-checkbox>
            <el-checkbox value="email">邮件</el-checkbox>
            <el-checkbox value="sms">短信</el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <el-form-item label="超时提醒">
          <el-checkbox-group v-model="activeNode.timeoutNotify" @change="handleNodeChange">
            <el-checkbox value="message">站内消息</el-checkbox>
            <el-checkbox value="email">邮件</el-checkbox>
            <el-checkbox value="sms">短信</el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <el-divider content-position="left">节点级权限</el-divider>

        <el-form-item label="覆盖全局撤回">
          <el-switch v-model="activeNode.overrideWithdraw" @change="handleNodeChange" />
        </el-form-item>

        <el-form-item label="允许节点级撤回" v-if="activeNode.overrideWithdraw">
          <el-switch v-model="activeNode.allowNodeWithdraw" @change="handleNodeChange" />
        </el-form-item>

        <el-form-item label="覆盖全局加签">
          <el-switch v-model="activeNode.overrideAddSign" @change="handleNodeChange" />
        </el-form-item>

        <el-form-item label="允许节点级加签" v-if="activeNode.overrideAddSign">
          <el-switch v-model="activeNode.allowNodeAddSign" @change="handleNodeChange" />
        </el-form-item>

        <el-form-item label="可见权限">
          <el-select v-model="activeNode.visibleRoles" multiple placeholder="选择可见角色" style="width: 100%" @change="handleNodeChange">
            <el-option label="全体员工" value="all" />
            <el-option label="发起人" value="initiator" />
            <el-option label="审批人" value="approver" />
            <el-option label="指定部门" value="specific_dept" />
            <el-option label="指定角色" value="specific_role" />
          </el-select>
        </el-form-item>
      </template>

      <!-- 抄送节点属性 -->
      <template v-if="activeNode.type === 'cc'">
        <el-divider content-position="left">抄送配置</el-divider>

        <el-form-item label="抄送对象">
          <el-select v-model="activeNode.ccTo" multiple placeholder="选择抄送对象" style="width: 100%" @change="handleNodeChange">
            <el-option label="部门经理" value="role_dept_manager" />
            <el-option label="HR经理" value="role_hr_manager" />
            <el-option label="行政经理" value="role_admin_manager" />
            <el-option label="指定人员" value="specific_user" />
          </el-select>
        </el-form-item>

        <el-form-item label="抄送时机">
          <el-select v-model="activeNode.ccTiming" style="width: 100%" @change="handleNodeChange">
            <el-option label="节点到达前" value="before" />
            <el-option label="节点到达时" value="on_arrive" />
            <el-option label="节点完成时" value="on_complete" />
            <el-option label="流程结束时" value="on_finish" />
          </el-select>
        </el-form-item>

        <el-form-item label="需确认">
          <el-switch v-model="activeNode.ccNeedConfirm" @change="handleNodeChange" />
          <div class="tip">开启后抄送人需确认已阅</div>
        </el-form-item>

        <el-form-item label="通知方式">
          <el-checkbox-group v-model="activeNode.notifyMethods" @change="handleNodeChange">
            <el-checkbox value="message">站内消息</el-checkbox>
            <el-checkbox value="email">邮件通知</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </template>

      <!-- 通知节点属性 -->
      <template v-if="activeNode.type === 'notify'">
        <el-divider content-position="left">通知配置</el-divider>

        <el-form-item label="通知对象">
          <el-select v-model="activeNode.notifyTo" multiple placeholder="选择通知对象" style="width: 100%" @change="handleNodeChange">
            <el-option label="发起人" value="initiator" />
            <el-option label="审批人" value="approver" />
            <el-option label="指定人员" value="specific" />
            <el-option label="指定部门" value="specific_dept" />
          </el-select>
        </el-form-item>

        <el-form-item label="通知时机">
          <el-select v-model="activeNode.notifyTiming" style="width: 100%" @change="handleNodeChange">
            <el-option label="节点到达时" value="on_arrive" />
            <el-option label="节点完成时" value="on_complete" />
            <el-option label="流程结束时" value="on_finish" />
          </el-select>
        </el-form-item>

        <el-form-item label="通知方式">
          <el-checkbox-group v-model="activeNode.notifyMethods" @change="handleNodeChange">
            <el-checkbox value="message">站内消息</el-checkbox>
            <el-checkbox value="email">邮件通知</el-checkbox>
            <el-checkbox value="sms">短信通知</el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <el-form-item label="通知标题">
          <el-input v-model="activeNode.notifyTitle" placeholder="请输入通知标题" @change="handleNodeChange" />
        </el-form-item>

        <el-form-item label="通知内容">
          <el-input
              v-model="activeNode.notifyContent"
              type="textarea"
              :rows="4"
              placeholder="支持变量：{{发起人}}、{{流程名称}}、{{审批时间}}"
              @change="handleNodeChange"
          />
          <div class="tip">支持系统变量：{{发起人}}、{{流程名称}}、{{审批时间}}、{{节点名称}}</div>
        </el-form-item>
      </template>

      <!-- 条件分支节点属性 -->
      <template v-if="activeNode.type === 'condition'">
        <el-divider content-position="left">分支条件配置</el-divider>

        <el-form-item label="分支名称">
          <el-input v-model="activeNode.branchName" placeholder="如：金额>5000" @change="handleNodeChange" />
        </el-form-item>

        <el-form-item label="条件字段">
          <el-select v-model="activeNode.conditionField" placeholder="选择字段" style="width: 100%" @change="handleNodeChange">
            <el-option label="报销金额" value="expense_amount" />
            <el-option label="请假天数" value="leave_days" />
            <el-option label="申请部门" value="dept" />
            <el-option label="申请人职级" value="level" />
          </el-select>
        </el-form-item>

        <el-form-item label="条件运算符">
          <el-select v-model="activeNode.conditionOperator" style="width: 100%" @change="handleNodeChange">
            <el-option label="等于" value="eq" />
            <el-option label="不等于" value="neq" />
            <el-option label="大于" value="gt" />
            <el-option label="小于" value="lt" />
            <el-option label="大于等于" value="gte" />
            <el-option label="小于等于" value="lte" />
            <el-option label="包含" value="contains" />
          </el-select>
        </el-form-item>

        <el-form-item label="条件值">
          <el-input v-model="activeNode.conditionValue" placeholder="如：5000" @change="handleNodeChange" />
        </el-form-item>

        <el-form-item label="条件组合">
          <el-radio-group v-model="activeNode.conditionLogic" @change="handleNodeChange">
            <el-radio label="and">且（同时满足）</el-radio>
            <el-radio label="or">或（满足任一）</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="分支优先级">
          <el-input-number v-model="activeNode.priority" :min="1" :max="100" style="width: 100%" @change="handleNodeChange" />
          <div class="tip">数字越小优先级越高</div>
        </el-form-item>
      </template>

      <!-- 并行审批节点属性 -->
      <template v-if="activeNode.type === 'parallel'">
        <el-divider content-position="left">并行审批配置</el-divider>

        <el-form-item label="并行策略">
          <el-select v-model="activeNode.parallelStrategy" style="width: 100%" @change="handleNodeChange">
            <el-option label="全部通过（会签）" value="all" />
            <el-option label="任意通过（或签）" value="any" />
            <el-option label="按比例通过" value="ratio" />
          </el-select>
        </el-form-item>

        <el-form-item label="通过比例" v-if="activeNode.parallelStrategy === 'ratio'">
          <el-input-number v-model="activeNode.voteRatio" :min="50" :max="100" style="width: 100%" @change="handleNodeChange" />
          <span class="unit">%</span>
        </el-form-item>

        <el-alert type="warning" :closable="false" show-icon>
          并行节点会同时发起多个审批任务，所有任务完成后根据策略判断是否通过
        </el-alert>
      </template>

      <!-- 定时事件节点属性 -->
      <template v-if="activeNode.type === 'timer'">
        <el-divider content-position="left">定时配置</el-divider>

        <el-form-item label="定时类型">
          <el-select v-model="activeNode.timerType" style="width: 100%" @change="handleNodeChange">
            <el-option label="绝对时间" value="absolute" />
            <el-option label="相对时间" value="relative" />
            <el-option label="循环定时" value="cycle" />
          </el-select>
        </el-form-item>

        <el-form-item label="定时时间" v-if="activeNode.timerType === 'absolute'">
          <el-date-picker
              v-model="activeNode.timerTime"
              type="datetime"
              placeholder="选择日期时间"
              style="width: 100%"
              @change="handleNodeChange"
          />
        </el-form-item>

        <el-form-item label="延迟时间" v-if="activeNode.timerType === 'relative'">
          <el-input-number v-model="activeNode.timerDelay" :min="1" style="width: 100%" @change="handleNodeChange" />
          <span class="unit">小时</span>
        </el-form-item>

        <el-form-item label="触发动作">
          <el-select v-model="activeNode.timerAction" style="width: 100%" @change="handleNodeChange">
            <el-option label="自动通过" value="auto_pass" />
            <el-option label="自动驳回" value="auto_reject" />
            <el-option label="发送提醒" value="remind" />
            <el-option label="转办" value="transfer" />
          </el-select>
        </el-form-item>
      </template>

      <!-- 子流程节点属性 -->
      <template v-if="activeNode.type === 'subprocess'">
        <el-divider content-position="left">子流程配置</el-divider>

        <el-form-item label="关联子流程">
          <el-select v-model="activeNode.subProcessId" placeholder="选择子流程" style="width: 100%" @change="handleNodeChange">
            <el-option label="合同审批子流程" value="1" />
            <el-option label="预算审批子流程" value="2" />
          </el-select>
        </el-form-item>

        <el-form-item label="执行规则">
          <el-select v-model="activeNode.subProcessRule" style="width: 100%" @change="handleNodeChange">
            <el-option label="串行执行" value="sequential" />
            <el-option label="并行执行" value="parallel" />
          </el-select>
        </el-form-item>

        <el-alert type="info" :closable="false" show-icon style="margin-bottom: 12px">
          子流程会在当前节点处暂停主流程，子流程完成后自动继续主流程
        </el-alert>

        <el-form-item label="参数映射">
          <el-button size="small" type="primary" plain @click="handleParamMapping">
            配置参数映射
          </el-button>
          <div class="tip">将主流程字段映射到子流程输入参数</div>
        </el-form-item>
      </template>

      <el-divider content-position="left">其他配置</el-divider>

      <el-form-item label="节点说明">
        <el-input
            v-model="activeNode.description"
            type="textarea"
            :rows="3"
            placeholder="请输入节点说明"
            @change="handleNodeChange"
        />
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { reactive, watch } from 'vue'
import ApproverRuleConfig from './ApproverRuleConfig.vue'

const props = defineProps({
  activeNode: {
    type: Object,
    required: true
  },
  allNodes: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update-node', 'param-mapping'])

// 审批人规则配置
const approverRule = reactive({
  nodeName: '',
  nodeId: '',
  type: 'fixed',
  fixedUsers: [],
  roles: [],
  orgType: 'direct_leader',
  leaderLevel: 1,
  emptyHandler: 'auto_pass',
  ruleId: '',
  ruleDescription: '',
  formField: '',
  multiType: 'sequential',
  enableTimeout: false,
  timeoutHours: 24,
  timeoutAction: 'remind',
  allowReject: true,
  allowTransfer: true,
  allowAddSign: true,
  allowWithdraw: false,
  hideComment: false,
  eventsOnEnter: [],
  eventsOnPass: [],
  eventsOnReject: []
})

const nodeTypeMap = {
  start: '开始节点',
  end: '结束节点',
  approval: '审批节点',
  cc: '抄送节点',
  notify: '通知节点',
  condition: '条件分支',
  parallel: '并行审批',
  timer: '定时事件',
  subprocess: '子流程'
}

const nodeTagMap = {
  start: 'success',
  end: 'danger',
  approval: 'primary',
  cc: 'warning',
  notify: 'info',
  condition: 'primary',
  parallel: 'success',
  timer: 'warning',
  subprocess: ''
}

const getNodeTypeName = (type) => {
  return nodeTypeMap[type] || type
}

const getNodeTagType = (type) => {
  return nodeTagMap[type] || ''
}

const handleNodeChange = () => {
  if (props.activeNode.type === 'approval') {
    props.activeNode.approverRule = { ...approverRule }
  }
  emit('update-node', { ...props.activeNode })
}

const handleParamMapping = () => {
  emit('param-mapping')
}

// 监听节点变化，加载审批人规则
watch(() => props.activeNode, (newNode) => {
  if (newNode) {
    if (newNode.type === 'approval') {
      if (newNode.approverRule) {
        Object.assign(approverRule, newNode.approverRule)
      } else {
        approverRule.nodeName = newNode.name || '审批节点'
        approverRule.nodeId = newNode.id || ''
      }
    }
  }
}, { deep: true, immediate: true })

// 监听审批人规则变化
watch(approverRule, (newVal) => {
  if (props.activeNode && props.activeNode.type === 'approval') {
    props.activeNode.approverRule = { ...newVal }
    emit('update-node', { ...props.activeNode })
  }
}, { deep: true })
</script>

<style scoped lang="scss">
.node-properties {
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
