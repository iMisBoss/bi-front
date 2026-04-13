<template>
  <div class="flow-properties">
    <el-form :model="localFlowInfo" label-width="80px" size="small">
      <el-form-item label="流程名称">
        <el-input v-model="localFlowInfo.name" placeholder="请输入流程名称" @input="emitChange" />
      </el-form-item>

      <el-form-item label="流程分类">
        <el-select v-model="localFlowInfo.category" style="width: 100%" @change="emitChange">
          <el-option label="人事类" value="hr" />
          <el-option label="财务类" value="finance" />
          <el-option label="行政类" value="admin" />
          <el-option label="其他" value="other" />
        </el-select>
      </el-form-item>

      <el-form-item label="流程编号">
        <el-input v-model="localFlowInfo.flowCode" placeholder="如：FLOW-2024-001" @input="emitChange" />
        <div class="tip">自动生成，用于流程追溯</div>
      </el-form-item>

      <el-form-item label="流程优先级">
        <el-select v-model="localFlowInfo.priority" style="width: 100%" @change="emitChange">
          <el-option label="高" value="high" />
          <el-option label="中" value="medium" />
          <el-option label="低" value="low" />
        </el-select>
      </el-form-item>

      <el-form-item label="流程说明">
        <el-input
            v-model="localFlowInfo.description"
            type="textarea"
            :rows="3"
            placeholder="请输入流程说明"
            @input="emitChange"
        />
      </el-form-item>

      <el-divider content-position="left">发起权限</el-divider>

      <el-form-item label="发起权限">
        <el-select v-model="localFlowInfo.initPermissionType" style="width: 100%" @change="emitChange">
          <el-option label="全体员工" value="all" />
          <el-option label="指定部门" value="dept" />
          <el-option label="指定角色" value="role" />
          <el-option label="指定人员" value="user" />
          <el-option label="指定岗位" value="position" />
          <el-option label="发起人所在部门" value="initiator_dept" />
        </el-select>
      </el-form-item>

      <el-form-item label="权限范围" v-if="localFlowInfo.initPermissionType !== 'all' && localFlowInfo.initPermissionType !== 'initiator_dept'">
        <el-select
            v-model="localFlowInfo.initPermissionValue"
            multiple
            placeholder="选择权限范围"
            style="width: 100%"
            @change="emitChange"
        >
          <el-option label="技术部" value="dept_tech" />
          <el-option label="财务部" value="dept_finance" />
          <el-option label="人事经理" value="role_hr_manager" />
          <el-option label="部门经理" value="role_dept_manager" />
        </el-select>
      </el-form-item>

      <el-divider content-position="left">有效期设置</el-divider>

      <el-form-item label="有效期">
        <el-select v-model="localFlowInfo.validType" style="width: 100%" @change="emitChange">
          <el-option label="永久有效" value="permanent" />
          <el-option label="指定天数" value="days" />
        </el-select>
      </el-form-item>

      <el-form-item label="有效天数" v-if="localFlowInfo.validType === 'days'">
        <el-input-number v-model="localFlowInfo.validDays" :min="1" :max="365" style="width: 100%" @change="emitChange" />
        <span class="unit">天</span>
      </el-form-item>

      <el-form-item label="到期处理" v-if="localFlowInfo.validType === 'days'">
        <el-select v-model="localFlowInfo.expireAction" style="width: 100%" @change="emitChange">
          <el-option label="自动驳回" value="auto_reject" />
          <el-option label="自动归档" value="auto_archive" />
          <el-option label="发送提醒" value="send_remind" />
        </el-select>
      </el-form-item>

      <el-divider content-position="left">绑定表单</el-divider>

      <el-form-item label="绑定表单">
        <el-select v-model="localFlowInfo.bindFormId" placeholder="选择已发布的表单" style="width: 100%" @change="emitChange">
          <el-option label="请假申请表单" value="1" />
          <el-option label="费用报销表单" value="2" />
          <el-option label="出差申请表单" value="3" />
          <el-option label="会议申请表单" value="4" />
          <el-option label="采购申请表单" value="5" />
        </el-select>
      </el-form-item>

      <el-form-item label="允许附件">
        <el-switch v-model="localFlowInfo.allowAttachment" @change="emitChange" />
      </el-form-item>

      <el-divider content-position="left">全局通知规则</el-divider>

      <el-form-item label="发起通知">
        <el-checkbox-group v-model="localFlowInfo.startNotifyMethods" @change="emitChange">
          <el-checkbox value="message">站内消息</el-checkbox>
          <el-checkbox value="email">邮件</el-checkbox>
          <el-checkbox value="sms">短信</el-checkbox>
        </el-checkbox-group>
      </el-form-item>

      <el-form-item label="审批通知">
        <el-checkbox-group v-model="localFlowInfo.approveNotifyMethods" @change="emitChange">
          <el-checkbox value="message">站内消息</el-checkbox>
          <el-checkbox value="email">邮件</el-checkbox>
          <el-checkbox value="sms">短信</el-checkbox>
        </el-checkbox-group>
      </el-form-item>

      <el-form-item label="结束通知">
        <el-checkbox-group v-model="localFlowInfo.endNotifyMethods" @change="emitChange">
          <el-checkbox value="message">站内消息</el-checkbox>
          <el-checkbox value="email">邮件</el-checkbox>
          <el-checkbox value="sms">短信</el-checkbox>
        </el-checkbox-group>
      </el-form-item>

      <el-divider content-position="left">全局规则</el-divider>

      <el-form-item label="允许撤回">
        <el-switch v-model="localFlowInfo.allowWithdraw" @change="emitChange" />
      </el-form-item>

      <el-form-item label="撤回条件" v-if="localFlowInfo.allowWithdraw">
        <el-select v-model="localFlowInfo.withdrawCondition" style="width: 100%" @change="emitChange">
          <el-option label="任何节点都可撤回" value="any" />
          <el-option label="仅第一个审批节点前可撤回" value="first" />
          <el-option label="发起后X小时内可撤回" value="time_limit" />
        </el-select>
      </el-form-item>

      <el-form-item label="撤回时限" v-if="localFlowInfo.allowWithdraw && localFlowInfo.withdrawCondition === 'time_limit'">
        <el-input-number v-model="localFlowInfo.withdrawHours" :min="1" :max="72" style="width: 100%" @change="emitChange" />
        <span class="unit">小时</span>
      </el-form-item>

      <el-form-item label="需审批人同意" v-if="localFlowInfo.allowWithdraw">
        <el-switch v-model="localFlowInfo.withdrawNeedApprove" @change="emitChange" />
      </el-form-item>

      <el-form-item label="允许加签">
        <el-switch v-model="localFlowInfo.allowAddSign" @change="emitChange" />
      </el-form-item>

      <el-form-item label="加签类型" v-if="localFlowInfo.allowAddSign">
        <el-checkbox-group v-model="localFlowInfo.addSignTypes" @change="emitChange">
          <el-checkbox value="before">会前签</el-checkbox>
          <el-checkbox value="after">会后签</el-checkbox>
          <el-checkbox value="parallel">并行加签</el-checkbox>
        </el-checkbox-group>
      </el-form-item>

      <el-form-item label="允许多级加签" v-if="localFlowInfo.allowAddSign">
        <el-switch v-model="localFlowInfo.allowMultiAddSign" @change="emitChange" />
      </el-form-item>

      <el-form-item label="允许转办">
        <el-switch v-model="localFlowInfo.allowTransfer" @change="emitChange" />
      </el-form-item>

      <el-form-item label="转办规则" v-if="localFlowInfo.allowTransfer">
        <el-checkbox-group v-model="localFlowInfo.transferRules" @change="emitChange">
          <el-checkbox value="allow_transfer_multi">允许转办多人</el-checkbox>
          <el-checkbox value="need_original_confirm">需原审批人确认</el-checkbox>
        </el-checkbox-group>
      </el-form-item>

      <el-form-item label="允许传阅">
        <el-switch v-model="localFlowInfo.allowCirculate" @change="emitChange" />
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { reactive, watch } from 'vue'

const props = defineProps({
  flowInfo: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update:flowInfo'])

const localFlowInfo = reactive({ ...props.flowInfo })

watch(() => props.flowInfo, (newVal) => {
  Object.assign(localFlowInfo, newVal)
}, { deep: true })

const emitChange = () => {
  emit('update:flowInfo', { ...localFlowInfo })
}
</script>

<style scoped lang="scss">
.flow-properties {
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
}
</style>
