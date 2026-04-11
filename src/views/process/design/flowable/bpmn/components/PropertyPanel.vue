<template>
  <div class="property-panel">
    <el-tabs v-model="activeTab" class="property-tabs">
      <!-- Tab1: 流程属性 -->
      <el-tab-pane label="流程属性" name="flow">
        <div class="tab-content">
          <el-form :model="flowInfo" label-width="80px" size="small">
            <el-form-item label="流程名称">
              <el-input v-model="flowInfo.name" placeholder="请输入流程名称" />
            </el-form-item>

            <el-form-item label="流程分类">
              <el-select v-model="flowInfo.category" style="width: 100%">
                <el-option label="人事类" value="hr" />
                <el-option label="财务类" value="finance" />
                <el-option label="行政类" value="admin" />
                <el-option label="其他" value="other" />
              </el-select>
            </el-form-item>

            <el-form-item label="流程编号">
              <el-input v-model="flowInfo.flowCode" placeholder="如：FLOW-2024-001" />
              <div class="tip">自动生成，用于流程追溯</div>
            </el-form-item>

            <el-form-item label="流程优先级">
              <el-select v-model="flowInfo.priority" style="width: 100%">
                <el-option label="高" value="high" />
                <el-option label="中" value="medium" />
                <el-option label="低" value="low" />
              </el-select>
            </el-form-item>

            <el-form-item label="流程说明">
              <el-input
                  v-model="flowInfo.description"
                  type="textarea"
                  :rows="3"
                  placeholder="请输入流程说明"
              />
            </el-form-item>

            <el-divider content-position="left">发起权限</el-divider>

            <el-form-item label="发起权限">
              <el-select v-model="flowInfo.initPermissionType" style="width: 100%">
                <el-option label="全体员工" value="all" />
                <el-option label="指定部门" value="dept" />
                <el-option label="指定角色" value="role" />
                <el-option label="指定人员" value="user" />
                <el-option label="指定岗位" value="position" />
                <el-option label="发起人所在部门" value="initiator_dept" />
              </el-select>
            </el-form-item>

            <el-form-item label="权限范围" v-if="flowInfo.initPermissionType !== 'all' && flowInfo.initPermissionType !== 'initiator_dept'">
              <el-select
                  v-model="flowInfo.initPermissionValue"
                  multiple
                  placeholder="选择权限范围"
                  style="width: 100%"
              >
                <el-option label="技术部" value="dept_tech" />
                <el-option label="财务部" value="dept_finance" />
                <el-option label="人事经理" value="role_hr_manager" />
                <el-option label="部门经理" value="role_dept_manager" />
              </el-select>
            </el-form-item>

            <el-divider content-position="left">有效期设置</el-divider>

            <el-form-item label="有效期">
              <el-select v-model="flowInfo.validType" style="width: 100%">
                <el-option label="永久有效" value="permanent" />
                <el-option label="指定天数" value="days" />
              </el-select>
            </el-form-item>

            <el-form-item label="有效天数" v-if="flowInfo.validType === 'days'">
              <el-input-number v-model="flowInfo.validDays" :min="1" :max="365" style="width: 100%" />
              <span class="unit">天</span>
            </el-form-item>

            <el-form-item label="到期处理" v-if="flowInfo.validType === 'days'">
              <el-select v-model="flowInfo.expireAction" style="width: 100%">
                <el-option label="自动驳回" value="auto_reject" />
                <el-option label="自动归档" value="auto_archive" />
                <el-option label="发送提醒" value="send_remind" />
              </el-select>
            </el-form-item>

            <el-divider content-position="left">绑定表单</el-divider>

            <el-form-item label="绑定表单">
              <el-select v-model="flowInfo.bindFormId" placeholder="选择已发布的表单" style="width: 100%">
                <el-option label="请假申请表单" value="1" />
                <el-option label="费用报销表单" value="2" />
                <el-option label="出差申请表单" value="3" />
                <el-option label="会议申请表单" value="4" />
                <el-option label="采购申请表单" value="5" />
              </el-select>
            </el-form-item>

            <el-form-item label="允许附件">
              <el-switch v-model="flowInfo.allowAttachment" />
            </el-form-item>

            <el-divider content-position="left">全局通知规则</el-divider>

            <el-form-item label="发起通知">
              <el-checkbox-group v-model="flowInfo.startNotifyMethods">
                <el-checkbox value="message">站内消息</el-checkbox>
                <el-checkbox value="email">邮件</el-checkbox>
                <el-checkbox value="sms">短信</el-checkbox>
              </el-checkbox-group>
            </el-form-item>

            <el-form-item label="审批通知">
              <el-checkbox-group v-model="flowInfo.approveNotifyMethods">
                <el-checkbox value="message">站内消息</el-checkbox>
                <el-checkbox value="email">邮件</el-checkbox>
                <el-checkbox value="sms">短信</el-checkbox>
              </el-checkbox-group>
            </el-form-item>

            <el-form-item label="结束通知">
              <el-checkbox-group v-model="flowInfo.endNotifyMethods">
                <el-checkbox value="message">站内消息</el-checkbox>
                <el-checkbox value="email">邮件</el-checkbox>
                <el-checkbox value="sms">短信</el-checkbox>
              </el-checkbox-group>
            </el-form-item>

            <el-divider content-position="left">全局规则</el-divider>

            <el-form-item label="允许撤回">
              <el-switch v-model="flowInfo.allowWithdraw" />
            </el-form-item>

            <el-form-item label="撤回条件" v-if="flowInfo.allowWithdraw">
              <el-select v-model="flowInfo.withdrawCondition" style="width: 100%">
                <el-option label="任何节点都可撤回" value="any" />
                <el-option label="仅第一个审批节点前可撤回" value="first" />
                <el-option label="发起后X小时内可撤回" value="time_limit" />
              </el-select>
            </el-form-item>

            <el-form-item label="撤回时限" v-if="flowInfo.allowWithdraw && flowInfo.withdrawCondition === 'time_limit'">
              <el-input-number v-model="flowInfo.withdrawHours" :min="1" :max="72" style="width: 100%" />
              <span class="unit">小时</span>
            </el-form-item>

            <el-form-item label="需审批人同意" v-if="flowInfo.allowWithdraw">
              <el-switch v-model="flowInfo.withdrawNeedApprove" />
            </el-form-item>

            <el-form-item label="允许加签">
              <el-switch v-model="flowInfo.allowAddSign" />
            </el-form-item>

            <el-form-item label="加签类型" v-if="flowInfo.allowAddSign">
              <el-checkbox-group v-model="flowInfo.addSignTypes">
                <el-checkbox value="before">会前签</el-checkbox>
                <el-checkbox value="after">会后签</el-checkbox>
                <el-checkbox value="parallel">并行加签</el-checkbox>
              </el-checkbox-group>
            </el-form-item>

            <el-form-item label="允许多级加签" v-if="flowInfo.allowAddSign">
              <el-switch v-model="flowInfo.allowMultiAddSign" />
            </el-form-item>

            <el-form-item label="允许转办">
              <el-switch v-model="flowInfo.allowTransfer" />
            </el-form-item>

            <el-form-item label="转办规则" v-if="flowInfo.allowTransfer">
              <el-checkbox-group v-model="flowInfo.transferRules">
                <el-checkbox value="allow_transfer_multi">允许转办多人</el-checkbox>
                <el-checkbox value="need_original_confirm">需原审批人确认</el-checkbox>
              </el-checkbox-group>
            </el-form-item>

            <el-form-item label="允许传阅">
              <el-switch v-model="flowInfo.allowCirculate" />
            </el-form-item>

          </el-form>
        </div>
      </el-tab-pane>

      <!-- Tab2: 节点属性 -->
      <el-tab-pane label="节点属性" name="node">
        <template v-if="activeNode">
          <div class="tab-content">
            <el-form :model="activeNode" label-width="80px" size="small">
              <el-form-item label="节点名称">
                <el-input v-model="activeNode.name" @change="handleNodeChange" />
              </el-form-item>

              <!-- 隐藏节点ID，仅显示业务名称 -->
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
                      placeholder="选择审批人"
                      style="width: 100%"
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
        <el-empty v-else description="请选择节点" :image-size="100" />
      </el-tab-pane>

      <!-- Tab3: 连线属性 -->
      <el-tab-pane label="连线属性" name="connection">
        <template v-if="activeConnection">
          <div class="tab-content">
            <el-form :model="activeConnection" label-width="80px" size="small">
              <!-- 隐藏连线ID，显示业务信息 -->
              <el-form-item label="源节点">
                <el-tag>{{ getSourceNodeName() }}</el-tag>
              </el-form-item>

              <el-form-item label="目标节点">
                <el-tag>{{ getTargetNodeName() }}</el-tag>
              </el-form-item>

              <el-divider content-position="left">流转条件</el-divider>

              <el-form-item label="条件类型">
                <el-select v-model="activeConnection.conditionType" style="width: 100%" @change="handleConnectionChange">
                  <el-option label="无条件（默认路径）" value="none" />
                  <el-option label="表单条件" value="form" />
                  <el-option label="表达式" value="expression" />
                </el-select>
              </el-form-item>

              <template v-if="activeConnection.conditionType === 'form'">
                <el-form-item label="条件字段">
                  <el-select v-model="activeConnection.conditionField" placeholder="选择字段" style="width: 100%" @change="handleConnectionChange">
                    <el-option label="报销金额" value="expense_amount" />
                    <el-option label="请假天数" value="leave_days" />
                    <el-option label="请假类型" value="leave_type" />
                    <el-option label="申请部门" value="dept" />
                  </el-select>
                </el-form-item>

                <el-form-item label="条件运算符">
                  <el-select v-model="activeConnection.conditionOperator" style="width: 100%" @change="handleConnectionChange">
                    <el-option label="等于" value="eq" />
                    <el-option label="不等于" value="neq" />
                    <el-option label="大于" value="gt" />
                    <el-option label="小于" value="lt" />
                    <el-option label="包含" value="contains" />
                  </el-select>
                </el-form-item>

                <el-form-item label="条件值">
                  <el-input v-model="activeConnection.conditionValue" placeholder="如：5000" @change="handleConnectionChange" />
                </el-form-item>

                <el-form-item label="条件组合">
                  <el-radio-group v-model="activeConnection.conditionLogic" @change="handleConnectionChange">
                    <el-radio label="and">且（同时满足）</el-radio>
                    <el-radio label="or">或（满足任一）</el-radio>
                  </el-radio-group>
                </el-form-item>

                <el-alert type="success" :closable="false" show-icon>
                  流转条件示例：{{ getConditionExample() }}
                </el-alert>
              </template>

              <el-form-item label="流转优先级">
                <el-input-number v-model="activeConnection.priority" :min="1" :max="100" style="width: 100%" @change="handleConnectionChange" />
                <div class="tip">数字越小优先级越高，多分支时按优先级执行</div>
              </el-form-item>

              <el-divider content-position="left">自动流转</el-divider>

              <el-form-item label="自动流转">
                <el-switch v-model="activeConnection.autoFlow" @change="handleConnectionChange" />
                <div class="tip">开启后无需人工操作，满足条件自动流转</div>
              </el-form-item>

              <el-form-item label="超时处理" v-if="!activeConnection.autoFlow">
                <el-select v-model="activeConnection.timeoutAction" style="width: 100%" @change="handleConnectionChange">
                  <el-option label="不处理" value="none" />
                  <el-option label="自动驳回" value="auto_reject" />
                  <el-option label="自动提醒" value="remind" />
                </el-select>
              </el-form-item>

              <el-form-item label="超时时间" v-if="activeConnection.timeoutAction !== 'none'">
                <el-input-number v-model="activeConnection.timeoutHours" :min="1" :max="720" style="width: 100%" @change="handleConnectionChange" />
                <span class="unit">小时</span>
              </el-form-item>

              <el-form-item label="流转说明">
                <el-input
                    v-model="activeConnection.description"
                    type="textarea"
                    :rows="2"
                    placeholder="选填，说明流转规则"
                    @change="handleConnectionChange"
                />
              </el-form-item>
            </el-form>
          </div>
        </template>
        <el-empty v-else description="请选择连线" :image-size="100" />
      </el-tab-pane>

      <!-- Tab4: 流程规则 -->
      <el-tab-pane label="流程规则" name="rules">
        <div class="tab-content">
          <el-divider content-position="left">驳回规则</el-divider>
          <el-form label-width="100px" size="small">
            <el-form-item label="全局驳回策略">
              <el-select v-model="flowInfo.globalRejectRule" style="width: 100%">
                <el-option label="驳回到发起人" value="to_initiator" />
                <el-option label="驳回到上一节点" value="to_prev" />
                <el-option label="驳回到指定节点" value="to_specific" />
                <el-option label="各节点独立配置" value="node_custom" />
              </el-select>
            </el-form-item>
            <el-form-item label="驳回到指定节点" v-if="flowInfo.globalRejectRule === 'to_specific'">
              <el-select v-model="flowInfo.rejectToNode" placeholder="选择节点" style="width: 100%">
                <el-option v-for="node in allNodes" :key="node.id" :label="node.name" :value="node.id" />
              </el-select>
            </el-form-item>
          </el-form>

          <el-divider content-position="left">加签规则</el-divider>
          <el-form label-width="120px" size="small">
            <el-form-item label="允许加签">
              <el-switch v-model="flowInfo.allowAddSign" />
            </el-form-item>
            <el-form-item label="加签类型" v-if="flowInfo.allowAddSign">
              <el-checkbox-group v-model="flowInfo.addSignTypes">
                <el-checkbox value="before">会前签</el-checkbox>
                <el-checkbox value="after">会后签</el-checkbox>
                <el-checkbox value="parallel">并行加签</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-form>

          <el-divider content-position="left">撤回规则</el-divider>
          <el-form label-width="120px" size="small">
            <el-form-item label="允许撤回">
              <el-switch v-model="flowInfo.allowWithdraw" />
            </el-form-item>
            <el-form-item label="撤回条件" v-if="flowInfo.allowWithdraw">
              <el-radio-group v-model="flowInfo.withdrawCondition">
                <el-radio label="any">任何节点都可撤回</el-radio>
                <el-radio label="first">仅第一个审批节点前可撤回</el-radio>
                <el-radio label="custom">指定节点前可撤回</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-form>

          <el-divider content-position="left">版本与审计</el-divider>
          <el-form label-width="120px" size="small">
            <el-form-item label="版本管理">
              <el-switch v-model="flowInfo.versionControl" />
              <div class="tip">开启后每次修改自动生成新版本</div>
            </el-form-item>
            <el-form-item label="历史版本保留">
              <el-input-number v-model="flowInfo.versionKeepCount" :min="1" :max="50" style="width: 100%" />
              <span class="unit">个</span>
            </el-form-item>
            <el-form-item label="审计日志">
              <el-switch v-model="flowInfo.auditLog" />
              <div class="tip">记录所有流程操作日志，满足合规要求</div>
            </el-form-item>
          </el-form>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
const props = defineProps({
  activeNode: {
    type: Object,
    default: null
  },
  activeConnection: {
    type: Object,
    default: null
  },
  flowInfo: {
    type: Object,
    required: true
  },
  allNodes: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits([
  'update:flow-info',
  'update-node',
  'update-connection',
  'param-mapping'
])

const activeTab = ref('flow')

// 节点类型映射
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

// 节点标签颜色
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

// 获取节点类型名称
const getNodeTypeName = (type) => {
  return nodeTypeMap[type] || type
}

// 获取节点标签类型
const getNodeTagType = (type) => {
  return nodeTagMap[type] || ''
}

// 节点变更
const handleNodeChange = () => {
  if (props.activeNode) {
    emit('update-node', { ...props.activeNode })
  }
}

// 连线变更
const handleConnectionChange = () => {
  if (props.activeConnection) {
    emit('update-connection', { ...props.activeConnection })
  }
}

// 获取源节点名称
const getSourceNodeName = () => {
  if (!props.activeConnection || !props.allNodes) return '-'
  const node = props.allNodes.find(n => n.id === props.activeConnection.source)
  return node ? node.name : '-'
}

// 获取目标节点名称
const getTargetNodeName = () => {
  if (!props.activeConnection || !props.allNodes) return '-'
  const node = props.allNodes.find(n => n.id === props.activeConnection.target)
  return node ? node.name : '-'
}

// 获取条件示例
const getConditionExample = () => {
  if (!props.activeConnection) return ''
  const { conditionField, conditionOperator, conditionValue } = props.activeConnection

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

// 参数映射
const handleParamMapping = () => {
  emit('param-mapping')
}

// 监听选中对象变化，自动切换Tab
watch(() => props.activeNode, (newNode) => {
  if (newNode) {
    activeTab.value = 'node'
  } else if (!props.activeConnection) {
    activeTab.value = 'flow'
  }
})

watch(() => props.activeConnection, (newConn) => {
  if (newConn) {
    activeTab.value = 'connection'
  } else if (!props.activeNode) {
    activeTab.value = 'flow'
  }
})
</script>
<style scoped lang="scss">
.property-panel {
  width: 340px;
  min-width: 300px;
  max-width: 450px;
  background: #fff;
  border-left: 1px solid #e8e8e8;
  display: flex;
  flex-direction: column;
  height: 100%;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.05);

  .property-tabs {
    flex: 1;
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;

    :deep(.el-tabs__header) {
      padding: 0 10px;
      margin: 0;
      flex-shrink: 0;
      min-height: 36px;

      .el-tabs__nav-wrap::after {
        height: 1px;
      }

      .el-tabs__item {
        padding: 0 10px;
        height: 36px;
        line-height: 36px;
        font-size: 13px;
      }
    }

    :deep(.el-tabs__content) {
      flex: 1;
      overflow: hidden;
      padding: 0;
      height: 0;
    }

    :deep(.el-tab-pane) {
      height: 100%;
      overflow: hidden;
    }
  }

  .tab-content {
    height: 100%;
    padding: 10px;
    overflow-y: auto;
    overflow-x: hidden;

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-thumb {
      background: #dcdfe6;
      border-radius: 3px;
      transition: background 0.2s;

      &:hover {
        background: #c0c4cc;
      }
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    :deep(.el-form) {
      .el-form-item {
        margin-bottom: 8px;

        &:last-child {
          margin-bottom: 0;
        }

        .el-form-item__label {
          padding: 0 6px 0 0;
          font-size: 13px;
          color: #606266;
          line-height: 28px;
          white-space: nowrap;
          width: 70px;
          flex-shrink: 0;
        }

        .el-form-item__content {
          flex: 1;
          min-width: 0;
        }
      }
    }

    :deep(.el-divider) {
      margin: 10px 0;

      .el-divider__text {
        font-weight: bold;
        font-size: 13px;
        color: #606266;
        padding: 0 6px;
      }
    }

    :deep(.el-input__wrapper),
    :deep(.el-select .el-input__wrapper),
    :deep(.el-textarea__inner) {
      padding: 4px 11px;
    }

    :deep(.el-switch) {
      height: 24px;
    }
  }

  :deep(.el-empty) {
    padding: 20px 0;
  }
}

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
</style>


