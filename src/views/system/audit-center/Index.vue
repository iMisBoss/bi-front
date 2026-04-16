<template>
  <div class="audit-center-page">
    <el-card class="main-card" shadow="never">
      <!-- Tab导航栏 -->
      <el-tabs v-model="activeTab" class="audit-tabs">
        <!-- Tab1: 全量操作日志 -->
        <el-tab-pane label="全量操作日志" name="operations">
          <OperationLogs ref="opsRef" />
        </el-tab-pane>

        <!-- Tab2: 登录登出日志 -->
        <el-tab-pane label="登录登出日志" name="login">
          <LoginLogs ref="loginRef" />
        </el-tab-pane>

        <!-- Tab3: 审计规则配置 -->
        <el-tab-pane label="审计规则配置" name="rules">
          <AuditRules ref="rulesRef" />
        </el-tab-pane>

        <!-- Tab4: 敏感行为告警 -->
        <el-tab-pane label="敏感行为告警" name="alerts">
          <SensitiveAlerts ref="alertsRef" />
        </el-tab-pane>

        <!-- Tab5: 日志归档管理 -->
        <el-tab-pane label="日志归档管理" name="archive">
          <LogArchive ref="archiveRef" />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import OperationLogs from './components/OperationLogs.vue'
import LoginLogs from './components/LoginLogs.vue'
import AuditRules from './components/AuditRules.vue'
import SensitiveAlerts from './components/SensitiveAlerts.vue'
import LogArchive from './components/LogArchive.vue'

const activeTab = ref('operations')
</script>

<style lang="scss" scoped>
.audit-center-page {
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

  .audit-tabs {
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
