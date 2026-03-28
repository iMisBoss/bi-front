<template>
  <div class="empty-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>{{ pageTitle }}</span>
        </div>
      </template>

      <el-empty :description="emptyDescription" />
    </el-card>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const pageTitle = computed(() => {
  const pathMap = {
    '/org/department': '部门管理',
    '/org/position': '岗位管理',
    '/org/role': '角色权限',
    '/org/level': '职级体系',
    '/org/employee': '员工入职离职',
    '/process/designer': '流程设计器',
    '/process/form': '表单设计器',
    '/process/todo': '我的待办',
    '/process/done': '我已处理',
    '/process/monitor': '流程监控',
    '/process/supervise': '超时督办',
    '/cms/news': '新闻公告',
    '/cms/document': '公文管理',
    '/cms/knowledge': '知识库',
    '/cms/archive': '文档库',
    '/cms/regulation': '规章制度',
    '/cms/culture': '企业文化',
    '/office/attendance': '考勤打卡',
    '/office/leave': '请假休假',
    '/office/meeting': '会议管理',
    '/office/vehicle': '车辆申请',
    '/office/supplies': '用品申领',
    '/office/seal': '用印申请',
    '/ai/qa': 'AI 问答客服',
    '/ai/writing': '智能写作',
    '/ai/summary': '文档摘要',
    '/ai/meeting': '会议纪要',
    '/message/station': '站内消息',
    '/message/sms': '短信通知',
    '/message/email': '邮件推送',
    '/message/remind': '建行员工提醒',
    '/system/config': '参数配置',
    '/system/log': '日志审计',
    '/system/backup': '数据备份',
    '/system/version': '版本管理',
    '/mobile/integration': '移动端集成',
    '/mobile/approval': '移动审批',
    '/mobile/attendance': '移动考勤',
    '/mobile/push': '消息推送'
  }
  return pathMap[route.path] || '页面'
})

const emptyDescription = computed(() => {
  return `${pageTitle.value}功能开发中...`
})
</script>

<style lang="scss" scoped>
.empty-page {
  padding: 20px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
</style>
