<template>
  <div class="business-general-config">
    <!-- 流程审批配置 -->
    <el-card class="config-card" shadow="never">
      <template #header>
        <span class="card-title">流程审批配置</span>
      </template>
      <el-form label-width="180px">
        <el-form-item label="审批超时提醒">
          <el-input-number v-model="business.approvalTimeoutReminder" :min="1" :max="72" />
          <span style="margin-left: 10px">小时</span>
        </el-form-item>
        <el-form-item label="驳回允许撤回">
          <el-switch v-model="business.allowRejectWithdraw" />
        </el-form-item>
        <el-form-item label="默认审批规则">
          <el-radio-group v-model="business.defaultApprovalRule">
            <el-radio label="countersign">会签（全部通过）</el-radio>
            <el-radio label="orsign">或签（一人通过）</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="审批意见必填">
          <el-switch v-model="business.requireApprovalComment" />
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 内容发布配置 -->
    <el-card class="config-card" shadow="never" style="margin-top: 20px">
      <template #header>
        <span class="card-title">内容发布配置</span>
      </template>
      <el-form label-width="180px">
        <el-form-item label="公告默认有效期">
          <el-input-number v-model="business.announcementDefaultDays" :min="1" :max="365" />
          <span style="margin-left: 10px">天</span>
        </el-form-item>
        <el-form-item label="置顶最大时长">
          <el-input-number v-model="business.maxTopDuration" :min="1" :max="30" />
          <span style="margin-left: 10px">天</span>
        </el-form-item>
        <el-form-item label="内容审核全局开关">
          <el-switch v-model="business.contentAuditEnabled" />
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 消息通知配置 -->
    <el-card class="config-card" shadow="never" style="margin-top: 20px">
      <template #header>
        <span class="card-title">消息通知配置</span>
      </template>
      <el-form label-width="180px">
        <el-form-item label="系统内消息推送">
          <el-switch v-model="business.messagePushEnabled" />
        </el-form-item>
        <el-form-item label="弹窗提醒">
          <el-switch v-model="business.popupReminder" />
        </el-form-item>
        <el-form-item label="已读消息保留周期">
          <el-select v-model="business.readMessageRetention" style="width: 200px">
            <el-option label="7天" :value="7" />
            <el-option label="30天" :value="30" />
            <el-option label="90天" :value="90" />
            <el-option label="永久" :value="0" />
          </el-select>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 组织人员配置 -->
    <el-card class="config-card" shadow="never" style="margin-top: 20px">
      <template #header>
        <span class="card-title">组织人员配置</span>
      </template>
      <el-form label-width="180px">
        <el-form-item label="离职自动权限回收">
          <el-switch v-model="business.autoRevokeOnResign" />
        </el-form-item>
        <el-form-item label="部门层级最大限制">
          <el-input-number v-model="business.maxDeptLevels" :min="3" :max="10" />
          <span style="margin-left: 10px">级</span>
        </el-form-item>
        <el-form-item label="工号生成规则">
          <el-select v-model="business.employeeNoRule" style="width: 200px">
            <el-option label="数字递增" value="increment" />
            <el-option label="年月+序号" value="yearMonthSeq" />
            <el-option label="自定义" value="custom" />
          </el-select>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { reactive } from 'vue'

const business = reactive({
  approvalTimeoutReminder: 24,
  allowRejectWithdraw: true,
  defaultApprovalRule: 'countersign',
  requireApprovalComment: true,
  announcementDefaultDays: 30,
  maxTopDuration: 7,
  contentAuditEnabled: true,
  messagePushEnabled: true,
  popupReminder: true,
  readMessageRetention: 30,
  autoRevokeOnResign: true,
  maxDeptLevels: 5,
  employeeNoRule: 'yearMonthSeq'
})
</script>

<style lang="scss" scoped>
.business-general-config {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-bottom: 20px;

  .config-card {
    border-radius: 8px;

    .card-title {
      font-size: 16px;
      font-weight: 600;
    }
  }
}
</style>
