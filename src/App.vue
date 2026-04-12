<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { getMenusByRole } from '@/config/menus'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import PortalSwitcher from '@/components/PortalSwitcher.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const currentUser = computed(() => userStore.currentUser)
const isAdmin = computed(() => userStore.isAdmin)
const collapsed = ref(false)

// 根据角色动态获取菜单
const menus = computed(() => {
  return getMenusByRole(userStore.userRole)
})

const activeMenu = computed(() => {
  const path = route.path
  if (path === '/') return isAdmin.value ? '/admin/home' : '/'
  if (path === '/admin/home') return '/admin/home'

  const findActiveMenu = (menuList) => {
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
  const routeMap = {
    '/admin/home': '后台首页',
    '/': '首页看板',
    '/org/staff': '组织用户管理',
    '/org/department': '部门架构维护',
    '/org/position': '职务管理',
    '/org/role': '角色与权限管理',
    '/org/level': '岗位职级体系维护',
    '/org/employee': '在职人员管理',
    '/process/approval/start': '发起审批',
    '/process/approval/todo': '我的待办',
    '/process/approval/done': '我已处理',
    '/process/approval/launched': '我发起的',
    '/process/approval/cced': '抄送管理',
    '/process/approval/delegate': '审批委托',
    '/process/approval/delegate/received': '我收到的委托',
    '/process/approval/progress': '流程进度查询',
    '/process/approval/handle-query': '全局流程管理',
    '/process/approval/archive': '流程归档查询',
    '/process/design/business-object': '业务对象管理',
    '/process/design/auto-number': '自动编号规则配置',
    '/process/design/approver-rules': '审批人规则引擎',
    '/process/design/params': '全局流程参数',
    '/process/design/variables': '变量管理',
    '/process/design/form/design': '表单可视化设计',
    '/process/design/form/template': '表单模板管理',
    '/process/design/form/permission': '字段权限配置',
    '/process/design/form/linkage': '表单联动规则',
    '/process/design/flowable/bpmn': 'BPMN可视化设计',
    '/process/design/flowable/form-bind': '流程-表单绑定',
    '/process/design/flowable/version': '流程版本管理',
    '/cms/news': '新闻公告',
    '/cms/document/personal': '个人公文中心',
    '/cms/document/send-receive': '收发文管理',
    '/cms/document/circulation': '流转与督办',
    '/cms/document/query-archive': '查询与归档',
    '/cms/document/document-number': '文号管理',
    '/cms/knowledge': '企业知识库',
    '/cms/archive-library': '文档中心',
    '/cms/regulation': '规章制度',
    '/office/meeting': '会议管理',
    '/ai/qa': 'AI问答客服',
    '/ai/writing': '智能写作',
    '/ai/summary': '文档智能摘要',
    '/ai/meeting': '会议纪要自动生成',
    '/message/station': '我的消息',
    '/message/email': '内部邮件',
    '/system/config': '系统参数配置',
    '/system/log': '全量操作日志',
    '/system/backup': '备份规则设置',
    '/org/security/masking-rules': '敏感字段脱敏规则',
    '/process/admin/template-control': '流程模板运行管控',
    '/process/admin/delegate-control': '审批委托管控',
    '/ai/admin/permission': 'AI功能权限配置',
    '/system/menus': '系统菜单管理',
  }
  return routeMap[route.path] || ''
})

const unreadCount = ref(5)

const handleMenuSelect = (index) => {
  if (index && index !== '/') {
    router.push(index)
  } else if (isAdmin.value) {
    router.push('/admin/home')
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

const handlePortalChange = (portal) => {
  // 更新面包屑
  if (route.path === '/') {
    // 如果在首页，刷新首页内容
    router.replace('/?portal=' + portal.id)
  }
}

onMounted(async () => {
  if (route.path !== '/login') {
    await userStore.loadUserInfo()
    loadUnreadCount()
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
          <!-- 递归渲染菜单 -->
          <template v-for="(menu, index) in menus" :key="index">
            <!-- 有子菜单 -->
            <el-sub-menu v-if="menu.children && menu.children.length > 0" :index="menu.title">
              <template #title>
                <el-icon v-if="menu.icon"><component :is="menu.icon" /></el-icon>
                <span>{{ menu.title }}</span>
              </template>

              <!-- 递归渲染子菜单 -->
              <template v-for="(child, childIndex) in menu.children" :key="childIndex">
                <!-- 三级菜单 -->
                <el-sub-menu v-if="child.children && child.children.length > 0" :index="child.title">
                  <template #title>
                    <span>{{ child.title }}</span>
                  </template>

                  <!-- 四级菜单项 -->
                  <el-menu-item
                      v-for="(grandChild, grandChildIndex) in child.children"
                      :key="grandChildIndex"
                      :index="grandChild.path"
                  >
                    {{ grandChild.title }}
                  </el-menu-item>
                </el-sub-menu>

                <!-- 二级菜单项 -->
                <el-menu-item v-else :index="child.path">
                  <el-icon v-if="child.icon"><component :is="child.icon" /></el-icon>
                  <span>{{ child.title }}</span>
                </el-menu-item>
              </template>
            </el-sub-menu>

            <!-- 无子菜单 -->
            <el-menu-item v-else :index="menu.path">
              <el-icon v-if="menu.icon"><component :is="menu.icon" /></el-icon>
              <span>{{ menu.title }}</span>
            </el-menu-item>
          </template>
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

              <!-- 门户切换器（仅普通用户显示） -->
              <PortalSwitcher v-if="!isAdmin" @portal-change="handlePortalChange" />

              <el-breadcrumb separator="/">
                <el-breadcrumb-item :to="{ path: isAdmin ? '/admin/home' : '/' }">{{ isAdmin ? '后台首页' : '首页' }}</el-breadcrumb-item>
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
        display: flex;
        align-items: center;

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
  }
}
</style>
