<template>
  <div id="bi-front-app">
    <template v-if="route.path === '/login'">
      <router-view />
    </template>

    <el-container v-else>
      <!-- 左侧菜单栏 -->
      <el-aside v-show="sidebarVisible" :width="'220px'" class="app-aside">
        <div class="logo-wrapper">
          <el-icon :size="32" color="#1890ff"><OfficeBuilding /></el-icon>
          <span>{{ isAdmin ? '管理后台' : '建信消金 OA' }}</span>
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
          <template v-for="(menu, index) in menus" :key="index">
            <el-sub-menu v-if="menu.children && menu.children.length > 0" :index="menu.title">
              <template #title>
                <el-icon v-if="menu.icon"><component :is="menu.icon" /></el-icon>
                <span>{{ menu.title }}</span>
              </template>

              <template v-for="(child, childIndex) in menu.children" :key="childIndex">
                <el-sub-menu v-if="child.children && child.children.length > 0" :index="child.title">
                  <template #title>
                    <span>{{ child.title }}</span>
                  </template>

                  <el-menu-item
                      v-for="(grandChild, grandChildIndex) in child.children"
                      :key="grandChildIndex"
                      :index="grandChild.path"
                  >
                    {{ grandChild.title }}
                  </el-menu-item>
                </el-sub-menu>

                <el-menu-item v-else :index="child.path">
                  <el-icon v-if="child.icon"><component :is="child.icon" /></el-icon>
                  <span>{{ child.title }}</span>
                </el-menu-item>
              </template>
            </el-sub-menu>

            <el-menu-item v-else :index="menu.path">
              <el-icon v-if="menu.icon"><component :is="menu.icon" /></el-icon>
              <span>{{ menu.title }}</span>
            </el-menu-item>
          </template>
        </el-menu>
      </el-aside>

      <!-- 折叠按钮（侧栏边缘） -->
      <div class="sidebar-toggle-btn" :style="{ left: sidebarVisible ? '220px' : '0px' }" @click="toggleSidebar" :title="sidebarVisible ? '收起菜单' : '展开菜单'">
        <el-icon v-if="sidebarVisible"><Fold /></el-icon>
        <el-icon v-else><Expand /></el-icon>
      </div>

      <el-container>
        <!-- 顶部导航 -->
        <el-header class="app-header">
          <div class="header-content">
            <div class="header-left">
              <el-breadcrumb separator="/">
                <el-breadcrumb-item :to="{ path: isAdmin ? '/admin/home' : '/' }">
                  {{ isAdmin ? '后台首页' : '首页' }}
                </el-breadcrumb-item>
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
                  <el-tag v-if="isAdmin" size="small" type="danger" style="margin-left: 8px;">管理员</el-tag>
                  <el-icon><ArrowDown /></el-icon>
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

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { getMenusByRole } from '@/config/menus'
import PortalSwitcher from '@/components/PortalSwitcher.vue'
import { Fold, Expand, OfficeBuilding, Bell, ArrowDown } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const currentUser = computed(() => userStore.currentUser)
const isAdmin = computed(() => userStore.isAdmin)
const sidebarVisible = ref(true)

const menus = computed(() => {
  return getMenusByRole(userStore.userRole)
})

const activeMenu = computed(() => {
  const path = route.path
  if (path === '/') return isAdmin.value ? '/admin/home' : '/'
  if (path === '/admin/home') return '/admin/home'

  const findActiveMenu = (menuList: any[]) => {
    for (const menu of menuList) {
      if (menu.path === path) {
        return menu.path
      }
      if (menu.children) {
        const found = findActiveMenu(menu.children)
        if (found) return found
      }
    }
    return null
  }

  return findActiveMenu(menus.value) || (isAdmin.value ? '/admin/home' : '/')
})

const currentRouteName = computed(() => {
  const routeMap: Record<string, string> = {
    '/admin/home': '后台首页',
    '/': '首页看板',
    '/process/approval/start': '发起审批',
    '/process/approval/todo': '我的待办',
    '/process/approval/done': '我已处理',
    '/process/approval/launched': '我发起的',
    '/process/approval/cced': '抄送管理',
    '/process/approval/delegate': '审批委托',
    '/process/approval/progress': '流程进度查询',
    '/process/approval/archive': '流程归档查询',
    '/process/approval/message': '我的消息',
    '/process/approval/my-schedule': '我的日程',
    '/form/design': '表单可视化设计',
    '/form/management': '表单管理',
    '/form/business-object': '业务对象管理',
    '/form/auto-number': '自动编号规则配置',
    '/process/flowable/bpmn': '流程建模设计',
    '/process/flowable/version': '流程版本管理',
    '/process/flowable/categories': '流程分类管理',
    '/process/flowable/params': '全局参数设置',
    '/process/flowable/variables': '变量管理',
    '/process/flowable/data-resources': '数据资源管理',
    '/process/flowable/handle-query': '流程实例中心',
    '/process/flowable/delegate-control': '审批委托管控',
    '/portal/designer': '门户设计器',
    '/portal/management': '门户管理中心',
    '/portal/categories': '门户分类管理',
    '/portal/components-lib': '组件库管理',
    '/portal/user-rules': '自定义规则配置',
    '/portal/global-config': '全局配置',
    '/office/org/admin/structure': '组织架构管理',
    '/office/org/admin/users': '人员用户管理',
    '/office/org/admin/contacts': '通讯录管理',
    '/office/org/admin/security': '数据安全配置',
    '/office/org/admin/groups': '群组管理',
    '/office/org/contacts/employee': '组织架构通讯录',
    '/office/org/contacts/favorites': '我的常用联系人',
    '/office/org/contacts/external': '外部联系人',
    '/office/org/contacts/my-card': '个人名片维护',
    '/office/meeting/my-meetings': '我的会议',
    '/office/meeting/create': '发起会议',
    '/office/meeting/room-booking': '会议室预约',
    '/office/meeting/notifications': '会议通知',
    '/office/meeting/minutes': '会议纪要',
    '/office/meeting/statistics': '会议统计分析',
    '/office/meeting-admin': '会议管理',
    '/office/reports': '报表汇总',
    '/cms/news': '新闻公告',
    '/cms/document/personal': '个人公文中心',
    '/cms/document/send-receive': '收发文管理',
    '/cms/document/circulation': '流转与督办',
    '/cms/document/query-archive': '查询与归档',
    '/cms/document/document-number': '文号管理',
    '/cms/regulation': '规章制度',
    '/cms/knowledge': '企业知识库',
    '/cms/archive-library': '文档中心',
    '/cms/document-admin': '公文管理',
    '/cms/content-admin': '内容管理',
    '/ai/qa': 'AI问答客服',
    '/ai/writing': '智能写作',
    '/ai/summary': '文档智能摘要',
    '/ai/meeting': '会议纪要自动生成',
    '/ai/admin': 'AI管理',
    '/message/email': '内部邮件',
    '/message/station': '站内消息',
    '/personal/info': '个人信息',
    '/personal/security/password': '登录密码修改',
    '/personal/security/phone': '手机号绑定',
    '/personal/security/devices': '登录设备管理',
    '/personal/security/login-log': '个人登录日志',
    '/personal/security/settings': '账号安全设置',
    '/personal/favorites': '我的收藏',
    '/personal/downloads': '我的下载',
    '/personal/preferences': '系统偏好设置',
    '/system/permission': '权限菜单管理',
    '/system/config': '系统参数配置',
    '/system/role': '角色管理',
    '/system/audit': '审计管理',
    '/system/log': '操作日志',
    '/system/operations': '运维管理',
    '/system/backup': '备份管理',
    '/system/version': '版本管理',
    '/integration/admin': '集成管理'
  }
  return routeMap[route.path] || ''
})

const unreadCount = ref(5)

const handleMenuSelect = (index: string) => {
  if (index && index !== '/') {
    router.push(index)
  } else if (isAdmin.value) {
    router.push('/admin/home')
  } else {
    router.push('/')
  }
}

const toggleSidebar = () => {
  sidebarVisible.value = !sidebarVisible.value
  localStorage.setItem('sidebar-visible', String(sidebarVisible.value))
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

    const savedVisible = localStorage.getItem('sidebar-visible')
    if (savedVisible !== null) {
      sidebarVisible.value = savedVisible === 'true'
    }
  }
})

const loadUnreadCount = async () => {
  try {
    unreadCount.value = 5
  } catch (error) {
    console.error('加载未读消息失败:', error)
    unreadCount.value = 0
  }
}
</script>

<style lang="scss" scoped>
#bi-front-app {
  height: 100vh;
  overflow: hidden;
  position: relative;
}

.app-aside {
  background: #001529;
  overflow: hidden;
  height: 100vh;
  transition: all 0.3s;
  box-shadow: 2px 0 6px rgba(0, 21, 41, 0.35);

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
    height: calc(100vh - 60px);
    overflow-y: auto;
    overflow-x: hidden;

    :deep(.el-sub-menu__title:hover),
    :deep(.el-menu-item:hover) {
      background-color: rgba(255, 255, 255, 0.08) !important;
    }

    :deep(.el-menu-item.is-active) {
      background-color: #096dd9 !important;
    }
  }
}

.sidebar-toggle-btn {
  position: absolute;
  left: 220px;
  top: 50%;
  transform: translateY(-50%);
  width: 24px;
  height: 48px;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-left: none;
  border-radius: 0 4px 4px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 100;
  box-shadow: 2px 0 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
  font-size: 16px;
  color: #606266;

  &:hover {
    background: #f5f7fa;
    color: #409eff;
  }

  &:active {
    background: #e4e7ed;
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
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 15px;

      .message-badge {
        cursor: pointer;
        font-size: 20px;
      }

      .user-name {
        cursor: pointer;
        color: #606266;
        display: flex;
        align-items: center;
        gap: 4px;

        &:hover {
          color: #1890ff;
        }
      }
    }
  }
}

.app-main {
  background: #f0f2f5;
  padding: 0;
  overflow-y: auto;
  height: calc(100vh - 60px);

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
    padding: 16px;
  }
}
</style>
