<template>
  <div class="ops-center-page">
    <el-card class="main-card" shadow="never">
      <!-- Tab导航栏 -->
      <el-tabs v-model="activeTab" class="ops-tabs">
        <!-- Tab1: 日志采集配置 -->
        <el-tab-pane label="日志采集配置" name="logCollect">
          <LogCollectConfig ref="logCollectRef" />
        </el-tab-pane>

        <!-- Tab2: IP黑白名单 -->
        <el-tab-pane label="IP黑白名单" name="ipBlackWhite">
          <IPBlackWhiteList ref="ipRef" />
        </el-tab-pane>

        <!-- Tab3: 系统服务监控 -->
        <el-tab-pane label="系统服务监控" name="serviceMonitor">
          <ServiceMonitor ref="monitorRef" />
        </el-tab-pane>

        <!-- Tab4: 数据备份规则 -->
        <el-tab-pane label="数据备份规则" name="backupRule">
          <BackupRule ref="backupRuleRef" />
        </el-tab-pane>

        <!-- Tab5: 备份执行记录 -->
        <el-tab-pane label="备份执行记录" name="backupRecord">
          <BackupRecord ref="backupRecordRef" />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import LogCollectConfig from './components/LogCollectConfig.vue'
import IPBlackWhiteList from './components/IPBlackWhiteList.vue'
import ServiceMonitor from './components/ServiceMonitor.vue'
import BackupRule from './components/BackupRule.vue'
import BackupRecord from './components/BackupRecord.vue'

const activeTab = ref('logCollect')
</script>

<style lang="scss" scoped>
.ops-center-page {
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

  .ops-tabs {
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
