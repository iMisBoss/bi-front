<template>
  <div class="ai-admin-page">
    <el-card class="main-card" shadow="never">
      <!-- Tab导航栏 -->
      <el-tabs v-model="activeTab" class="ai-tabs">
        <!-- Tab1: 模型配置 -->
        <el-tab-pane label="模型配置" name="model">
          <ModelConfig ref="modelRef" />
        </el-tab-pane>

        <!-- Tab2: 功能权限 -->
        <el-tab-pane label="功能权限" name="permission">
          <FunctionPermission ref="permissionRef" />
        </el-tab-pane>

        <!-- Tab3: 安全管控 -->
        <el-tab-pane label="安全管控" name="security">
          <SecurityControl ref="securityRef" />
        </el-tab-pane>

        <!-- Tab4: 使用审计 -->
        <el-tab-pane label="使用审计" name="audit">
          <UsageAudit ref="auditRef" />
        </el-tab-pane>

        <!-- Tab5: 运维设置 -->
        <el-tab-pane label="运维设置" name="operations">
          <OperationsSettings ref="operationsRef" />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ModelConfig from './components/ModelConfig.vue'
import FunctionPermission from './components/FunctionPermission.vue'
import SecurityControl from './components/SecurityControl.vue'
import UsageAudit from './components/UsageAudit.vue'
import OperationsSettings from './components/OperationsSettings.vue'

const activeTab = ref('model')
</script>

<style lang="scss" scoped>
.ai-admin-page {
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

  .ai-tabs {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    :deep(.el-tabs__header) {
      margin: 0 0 20px 0;
      padding-bottom: 0;
      border-bottom: 1px solid #ebeef5;
      flex-shrink: 0;
    }

    :deep(.el-tabs__content) {
      flex: 1;
      overflow: auto;
      padding: 0;
    }

    :deep(.el-tab-pane) {
      height: 100%;
    }
  }
}
</style>