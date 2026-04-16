<template>
  <div class="integration-admin-page">
    <el-card class="main-card" shadow="never">
      <!-- Tab导航栏 -->
      <el-tabs v-model="activeTab" class="integration-tabs">
        <!-- Tab1: 应用集成管理 -->
        <el-tab-pane label="应用集成管理" name="appIntegration">
          <AppIntegration ref="appRef" />
        </el-tab-pane>

        <!-- Tab2: 定时任务配置 -->
        <el-tab-pane label="定时任务配置" name="taskConfig">
          <TaskConfig ref="taskConfigRef" />
        </el-tab-pane>

        <!-- Tab3: 任务执行日志 -->
        <el-tab-pane label="任务执行日志" name="taskLog">
          <TaskExecutionLog ref="taskLogRef" />
        </el-tab-pane>

        <!-- Tab4: 公共接口管理 -->
        <el-tab-pane label="公共接口管理" name="apiManage">
          <ApiManagement ref="apiRef" />
        </el-tab-pane>

        <!-- Tab5: 接口调用日志 -->
        <el-tab-pane label="接口调用日志" name="apiLog">
          <ApiCallLog ref="apiLogRef" />
        </el-tab-pane>

        <!-- Tab6: 组件包管理（JAR） -->
        <el-tab-pane label="组件包管理" name="jarManage">
          <JarManagement ref="jarRef" />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import AppIntegration from './components/AppIntegration.vue'
import TaskConfig from './components/TaskConfig.vue'
import TaskExecutionLog from './components/TaskExecutionLog.vue'
import ApiManagement from './components/ApiManagement.vue'
import ApiCallLog from './components/ApiCallLog.vue'
import JarManagement from './components/JarManagement.vue'

const activeTab = ref('appIntegration')
</script>

<style lang="scss" scoped>
.integration-admin-page {
  height: 100%;
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

  .integration-tabs {
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
