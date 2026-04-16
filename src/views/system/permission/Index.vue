<template>
  <div class="permission-admin-page">
    <el-card class="main-card" shadow="never">
      <!-- Tab导航栏 -->
      <el-tabs v-model="activeTab" class="permission-tabs">
        <!-- Tab1: 系统菜单管理 -->
        <el-tab-pane label="系统菜单管理" name="menu">
          <SystemMenuManage ref="menuRef" />
        </el-tab-pane>

        <!-- Tab2: 角色权限配置 -->
        <el-tab-pane label="角色权限配置" name="role">
          <RolePermission ref="roleRef" />
        </el-tab-pane>

        <!-- Tab3: 门户导航配置 -->
        <el-tab-pane label="门户导航配置" name="navigation">
          <PortalNavigation ref="navRef" />
        </el-tab-pane>

        <!-- Tab4: 权限运维同步 -->
        <el-tab-pane label="权限运维同步" name="operations">
          <PermissionOperations ref="opsRef" />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import SystemMenuManage from './components/SystemMenuManage.vue'
import RolePermission from './components/RolePermission.vue'
import PortalNavigation from './components/PortalNavigation.vue'
import PermissionOperations from './components/PermissionOperations.vue'

const activeTab = ref('menu')
</script>

<style lang="scss" scoped>
.permission-admin-page {
  padding: 20px;
  height: calc(100vh - 60px);
  display: flex;
  flex-direction: column;
  background: #f5f7fa;

  .main-card {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border-radius: 8px;

    :deep(.el-card__body) {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      padding: 20px;
    }
  }

  .permission-tabs {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    :deep(.el-tabs__header) {
      margin: 0 0 20px 0;
      padding-bottom: 0;
      border-bottom: 1px solid #ebeef5;
    }

    :deep(.el-tabs__content) {
      flex: 1;
      overflow: hidden;
      padding: 0;
    }

    :deep(.el-tab-pane) {
      height: 100%;
      display: flex;
      flex-direction: column;
    }
  }
}
</style>
