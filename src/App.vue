<template>
  <div id="bi-front-app">
    <!-- 登录页面 -->
    <template v-if="route.path === '/login'">
      <router-view />
    </template>

    <!-- 主界面 -->
    <el-container v-else>
      <!-- 左侧菜单栏 -->
      <el-aside width="220px" class="app-aside">
        <div class="logo-wrapper">
          <el-icon :size="32" color="#1890ff"><OfficeBuilding /></el-icon>
          <span>建信消金 OA</span>
        </div>

        <el-menu
            :default-active="activeMenu"
            class="side-menu"
            background-color="#001529"
            text-color="rgba(255,255,255,0.65)"
            active-text-color="#1890ff"
            :router="false"
            @select="handleMenuSelect"
        >
          <el-menu-item index="home">
            <el-icon><HomeFilled /></el-icon>
            <span>首页</span>
          </el-menu-item>

          <el-sub-menu index="org">
            <template #title>
              <el-icon><User /></el-icon>
              <span>组织人事管理</span>
            </template>
            <el-menu-item index="/org/staff">人员档案管理</el-menu-item>
            <el-menu-item index="/org/department">部门管理</el-menu-item>
            <el-menu-item index="/org/position">岗位管理</el-menu-item>
            <el-menu-item index="/org/role">角色权限</el-menu-item>
            <el-menu-item index="/org/level">职级体系</el-menu-item>
            <el-menu-item index="/org/employee">员工入职离职</el-menu-item>
          </el-sub-menu>

          <el-sub-menu index="process">
            <template #title>
              <el-icon><Document /></el-icon>
              <span>工作台</span>
            </template>
            <el-menu-item index="/process/approval/start">
              <el-icon><Plus /></el-icon>
              <span>发起审批</span>
            </el-menu-item>
            <el-menu-item index="/process/approval/todo">
              <el-icon><Bell /></el-icon>
              <span>我的待办</span>
            </el-menu-item>
            <el-menu-item index="/process/approval/done">
              <el-icon><CircleCheck /></el-icon>
              <span>我已处理</span>
            </el-menu-item>
            <el-menu-item index="/process/approval/launched">
              <el-icon><Promotion /></el-icon>
              <span>我发起的</span>
            </el-menu-item>
            <el-menu-item index="/process/approval/cced">
              <el-icon><Message /></el-icon>
              <span>抄送我的</span>
            </el-menu-item>
            <el-menu-item index="/process/approval/delegate">
              <el-icon><UserFilled /></el-icon>
              <span>审批委托</span>
            </el-menu-item>
            <el-menu-item index="/process/approval/progress">
              <el-icon><Connection /></el-icon>
              <span>流程进度查询</span>
            </el-menu-item>
          </el-sub-menu>
          <el-sub-menu index="process-center">
            <template #title>
              <el-icon><Document /></el-icon>
              <span>流程中心</span>
            </template>

            <!-- 全局流程管理（原"我的流程"位置） -->
            <el-menu-item index="/process/approval/handle-query">
              <el-icon><Monitor /></el-icon>
              <span>全局流程管理</span>
            </el-menu-item>

            <!-- 流程设计中心（管理员设计态入口） -->
            <el-sub-menu index="process-center-design">
              <template #title>
                <span>流程设计中心</span>
              </template>
              <!-- 基础能力配置 -->
              <el-sub-menu index="process-design-basic">
                <template #title>
                  <span>基础能力配置</span>
                </template>
                <el-menu-item index="/process/design/business-object">业务对象管理</el-menu-item>
                <el-menu-item index="/process/design/auto-number">自动编号规则配置</el-menu-item>
                <el-menu-item index="/process/design/approver-rules">审批人规则引擎</el-menu-item>
                <el-menu-item index="/process/design/params">全局流程参数</el-menu-item>
                <el-menu-item index="/process/design/variables">系统变量库</el-menu-item>
              </el-sub-menu>

              <!-- 低代码表单设计器 -->
              <el-sub-menu index="process-design-form">
                <template #title>
                  <span>低代码表单设计器</span>
                </template>
                <el-menu-item index="/process/design/form/design">表单设计</el-menu-item>
                <el-menu-item index="/process/design/form/template">表单模板</el-menu-item>
                <el-menu-item index="/process/design/form/permission">字段权限</el-menu-item>
                <el-menu-item index="/process/design/form/linkage">联动规则</el-menu-item>
              </el-sub-menu>

              <!-- Flowable 流程设计器 -->
              <el-sub-menu index="process-design-flowable">
                <template #title>
                  <span>Flowable 流程设计器</span>
                </template>
                <el-menu-item index="/process/design/flowable/bpmn">BPMN 可视化设计</el-menu-item>
                <el-menu-item index="/process/design/flowable/form-bind">流程 - 表单绑定</el-menu-item>
                <el-menu-item index="/process/design/flowable/node-config">节点属性配置</el-menu-item>
                <el-menu-item index="/process/design/flowable/version">流程版本管理</el-menu-item>
              </el-sub-menu>

              <!-- 模板发布管理 -->
              <el-sub-menu index="process-design-template">
                <template #title>
                  <span>模板发布管理</span>
                </template>
                <el-menu-item index="/process/design/template/process">流程模板管理</el-menu-item>
                <el-menu-item index="/process/design/template/notification">通知模板</el-menu-item>
                <el-menu-item index="/process/design/template/opinion">审批意见模板</el-menu-item>
                <el-menu-item index="/process/design/template/print">打印模板</el-menu-item>
              </el-sub-menu>
            </el-sub-menu>

            <!-- 流程监控与运维（管理员运行态入口） -->
            <el-sub-menu index="process-center-monitor">
              <template #title>
                <span>流程监控与运维</span>
              </template>
              <el-menu-item index="/process/monitor/instances">流程实例监控</el-menu-item>
              <el-menu-item index="/process/monitor/tasks">待办任务全局管理</el-menu-item>
              <el-menu-item index="/process/monitor/proxy">审批代理管理</el-menu-item>
              <el-menu-item index="/process/monitor/urge">催办与提醒</el-menu-item>
              <el-menu-item index="/process/monitor/logs">流程操作审计日志</el-menu-item>
              <el-menu-item index="/process/monitor/exceptions">异常流程处理</el-menu-item>
            </el-sub-menu>
          </el-sub-menu>
          <el-sub-menu index="cms">
            <template #title>
              <el-icon><Folder /></el-icon>
              <span>内容管理中心</span>
            </template>
            <el-menu-item index="/cms/news">新闻公告</el-menu-item>
            <el-menu-item index="/cms/document">公文管理</el-menu-item>
            <el-menu-item index="/cms/knowledge">知识库</el-menu-item>
            <el-menu-item index="/cms/archive-library">档案库</el-menu-item>
            <el-menu-item index="/cms/regulation">规章制度</el-menu-item>
            <el-menu-item index="/cms/culture">企业文化</el-menu-item>
          </el-sub-menu>

          <el-sub-menu index="office">
            <template #title>
              <el-icon><Briefcase /></el-icon>
              <span>日常办公</span>
            </template>
            <el-menu-item index="/office/attendance">考勤打卡</el-menu-item>
            <el-menu-item index="/office/leave">请假休假</el-menu-item>
            <el-menu-item index="/office/meeting">会议管理</el-menu-item>
            <el-menu-item index="/office/vehicle">车辆申请</el-menu-item>
            <el-menu-item index="/office/supplies">用品申领</el-menu-item>
            <el-menu-item index="/office/seal">用印申请</el-menu-item>
          </el-sub-menu>

          <el-sub-menu index="ai">
            <template #title>
              <el-icon><ChatDotRound /></el-icon>
              <span>AI 智能助手</span>
            </template>
            <el-menu-item index="/ai/qa">AI 问答客服</el-menu-item>
            <el-menu-item index="/ai/writing">智能写作</el-menu-item>
            <el-menu-item index="/ai/summary">文档摘要</el-menu-item>
            <el-menu-item index="/ai/meeting">会议纪要</el-menu-item>
          </el-sub-menu>

          <el-sub-menu index="message">
            <template #title>
              <el-icon><Bell /></el-icon>
              <span>消息中心</span>
            </template>
            <el-menu-item index="/message/station">站内消息</el-menu-item>
            <el-menu-item index="/message/sms">短信通知</el-menu-item>
            <el-menu-item index="/message/email">邮件推送</el-menu-item>
            <el-menu-item index="/message/remind">建行员工提醒</el-menu-item>
          </el-sub-menu>

          <el-sub-menu index="system">
            <template #title>
              <el-icon><Setting /></el-icon>
              <span>系统管理</span>
            </template>
            <el-menu-item index="/system/config">参数配置</el-menu-item>
            <el-menu-item index="/system/log">日志审计</el-menu-item>
            <el-menu-item index="/system/backup">数据备份</el-menu-item>
            <el-menu-item index="/system/version">版本管理</el-menu-item>
          </el-sub-menu>

          <el-sub-menu index="mobile">
            <template #title>
              <el-icon><Cellphone /></el-icon>
              <span>移动端</span>
            </template>
            <el-menu-item index="/mobile/integration">移动端集成</el-menu-item>
            <el-menu-item index="/mobile/approval">移动审批</el-menu-item>
            <el-menu-item index="/mobile/attendance">移动考勤</el-menu-item>
            <el-menu-item index="/mobile/push">消息推送</el-menu-item>
          </el-sub-menu>
        </el-menu>
      </el-aside>

      <el-container>
        <!-- 顶部导航 -->
        <el-header class="app-header">
          <div class="header-content">
            <div class="header-left">
              <el-button link class="collapse-btn" @click="toggleCollapse">
                <el-icon v-if="!collapsed"><Fold /></el-icon>
                <el-icon v-else><Expand /></el-icon>
              </el-button>
              <el-breadcrumb separator="/">
                <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
                <el-breadcrumb-item v-if="currentRouteName">{{ currentRouteName }}</el-breadcrumb-item>
              </el-breadcrumb>
            </div>

            <div class="user-info">
              <el-badge :value="unreadCount" class="message-badge" @click="goToMessage">
                <el-icon><Bell /></el-icon>
              </el-badge>
              <el-dropdown>
                <span class="user-name">
                  {{ currentUser?.name || '用户' }}
                  <el-icon><arrow-down /></el-icon>
                </span>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item>个人中心</el-dropdown-item>
                    <el-dropdown-item divided @click="handleLogout">退出登录</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
        </el-header>

        <!-- 主内容区 -->
        <el-main class="app-main">
          <div class="app-main-wrapper">
            <router-view />
          </div>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import {
  HomeFilled, User, Document, Folder, Briefcase,
  ChatDotRound, Bell, Setting, Cellphone, Fold, Expand,
  OfficeBuilding, Plus, CircleCheck, Promotion, Message,
  UserFilled, Connection, Monitor
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const currentUser = computed(() => userStore.currentUser)
const collapsed = ref(false)

const activeMenu = computed(() => {
  const path = route.path
  if (path === '/') return 'home'
  if (path.startsWith('/org')) return 'org'
  if (path.startsWith('/process')) return 'process'
  if (path.startsWith('/cms')) return 'cms'
  if (path.startsWith('/office')) return 'office'
  if (path.startsWith('/ai')) return 'ai'
  if (path.startsWith('/message')) return 'message'
  if (path.startsWith('/system')) return 'system'
  if (path.startsWith('/mobile')) return 'mobile'
  return 'home'
})

const currentRouteName = computed(() => {
  const routeMap = {
    '/org/staff': '人员档案管理',
    '/org/department': '部门管理',
    '/org/position': '岗位管理',
    '/org/role': '角色权限',
    '/org/level': '职级体系',
    '/org/employee': '员工入职离职',
    '/process/approval/start': '发起审批',
    '/process/approval/todo': '我的待办',
    '/process/approval/done': '我已处理',
    '/process/approval/launched': '我发起的',
    '/process/approval/cced': '抄送我的',
    '/process/approval/delegate': '审批委托',
    '/process/approval/progress': '流程进度查询',
    // 流程中心 - 全局流程管理
    '/process/approval/handle-query': '全局流程管理',

    // 流程中心 - 基础能力配置
    '/process/design/business-object': '业务对象管理',
    '/process/design/auto-number': '自动编号规则配置',
    '/process/design/approver-rules': '审批人规则引擎',
    '/process/design/params': '全局流程参数',
    '/process/design/variables': '系统变量库',

    // 流程中心 - 低代码表单设计器
    '/process/design/form/design': '表单设计',
    '/process/design/form/template': '表单模板',
    '/process/design/form/permission': '字段权限',
    '/process/design/form/linkage': '联动规则',

    // 流程中心 - Flowable 流程设计器
    '/process/design/flowable/bpmn': 'BPMN 可视化设计',
    '/process/design/flowable/form-bind': '流程 - 表单绑定',
    '/process/design/flowable/node-config': '节点属性配置',
    '/process/design/flowable/version': '流程版本管理',

    // 流程中心 - 模板发布管理
    '/process/design/template/process': '流程模板管理',
    '/process/design/template/notification': '通知模板',
    '/process/design/template/opinion': '审批意见模板',
    '/process/design/template/print': '打印模板',

    // 流程中心 - 流程监控与运维
    '/process/monitor/instances': '流程实例监控',
    '/process/monitor/tasks': '待办任务全局管理',
    '/process/monitor/proxy': '审批代理管理',
    '/process/monitor/urge': '催办与提醒',
    '/process/monitor/logs': '流程操作审计日志',
    '/process/monitor/exceptions': '异常流程处理',

    '/cms/news': '新闻公告',
    '/cms/document': '公文管理',
    '/cms/knowledge': '知识库',
    '/cms/archive-library': '档案库',
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
    '/mobile/push': '消息推送',
  }
  return routeMap[route.path] || ''
})

const unreadCount = ref(5)

const handleMenuSelect = (index) => {
  if (index !== 'home') {
    router.push(index)
  } else {
    router.push('/')
  }
}

const toggleCollapse = () => {
  collapsed.value = !collapsed.value
}

const goToMessage = () => {
  router.push('/message/station')
}

const handleLogout = async () => {
  await userStore.logout()
  router.push('/login')
}

onMounted(async () => {
  if (route.path !== '/login') {
    await userStore.loadUserInfo()
    loadUnreadCount()
  }
})

const loadUnreadCount = async () => {
  try {
    // 模拟未读消息数量
    // const res = await fetch('/x_message_assemble_communicate/jaxrs/message/count/unread')
    // if (res.ok) {
    //   const data = await res.json()
    //   unreadCount.value = data.count || 0
    // }

    // 使用模拟数据
    unreadCount.value = 5
  } catch (error) {
    console.error('加载未读消息失败:', error)
    // 失败时使用默认值
    unreadCount.value = 0
  }
}
</script>

<style lang="scss" scoped>
#bi-front-app {
  height: 100vh;
}

.app-aside {
  background: #001529;
  transition: width 0.3s;
  overflow-y: auto;
  overflow-x: hidden;
  height: 100vh;
  /* 自定义滚动条样式 */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #001529;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 3px;

    &:hover {
      background: rgba(255, 255, 255, 0.3);
    }
  }
  .logo-wrapper {
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    background: #002140;
    flex-shrink: 0;

    img {
      height: 32px;
    }

    span {
      color: #fff;
      font-size: 16px;
      font-weight: 600;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    }
  }

  .side-menu {
    border-right: none;

    max-height: calc(100vh - 60px);
    overflow-y: auto;
    overflow-x: hidden;

    .el-sub-menu__title:hover {
      background-color: rgba(255, 255, 255, 0.08);
    }

    .el-menu-item:hover {
      background-color: rgba(255, 255, 255, 0.08);
    }

    .el-menu-item.is-active {
      background-color: #096dd9;
    }
  }
}

.app-header {
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 0;
  height: 60px;

  .header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 100%;
    padding: 0 20px;

    .header-left {
      display: flex;
      align-items: center;
      gap: 15px;

      .collapse-btn {
        font-size: 18px;
        cursor: pointer;
      }
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 15px;

      .message-badge {
        cursor: pointer;
        font-size: 18px;
      }

      .user-name {
        cursor: pointer;
        color: #606266;

        &:hover {
          color: #1890ff;
        }
      }
    }
  }
}

.app-main {
  background: #f0f2f5;
  padding: 20px;
  overflow-y: auto;
  height: calc(100vh - 60px);

  /* 自定义滚动条样式 */
  &::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f0f2f5;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 3px;

    &:hover {
      background: rgba(0, 0, 0, 0.3);
    }
  }

  .app-main-wrapper {
    min-height: 100%;
  }
}
</style>
