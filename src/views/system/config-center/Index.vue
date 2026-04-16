<template>
  <div class="config-center-page">
    <el-card class="main-card" shadow="never">
      <!-- Tab导航栏 -->
      <el-tabs v-model="activeTab" class="config-tabs">
        <!-- Tab1: 基础平台配置 -->
        <el-tab-pane label="基础平台配置" name="platform">
          <BasePlatformConfig ref="platformRef" />
        </el-tab-pane>

        <!-- Tab2: 安全策略配置 -->
        <el-tab-pane label="安全策略配置" name="security">
          <SecurityPolicyConfig ref="securityRef" />
        </el-tab-pane>

        <!-- Tab3: 业务通用配置 -->
        <el-tab-pane label="业务通用配置" name="business">
          <BusinessGeneralConfig ref="businessRef" />
        </el-tab-pane>

        <!-- Tab4: 全局数据字典 -->
        <el-tab-pane label="全局数据字典" name="dictionary">
          <GlobalDataDict ref="dictRef" />
        </el-tab-pane>
      </el-tabs>

      <!-- 底部操作栏 -->
      <div class="footer-actions">
        <el-button @click="handleReset">恢复默认配置</el-button>
        <el-button @click="handleExport" icon="Download">导出配置</el-button>
        <el-button type="primary" @click="handleSave" icon="Check">保存配置</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import BasePlatformConfig from './components/BasePlatformConfig.vue'
import SecurityPolicyConfig from './components/SecurityPolicyConfig.vue'
import BusinessGeneralConfig from './components/BusinessGeneralConfig.vue'
import GlobalDataDict from './components/GlobalDataDict.vue'

const activeTab = ref('platform')

const handleReset = () => {
  ElMessageBox.confirm('确定要恢复所有配置为默认值吗？此操作不可恢复！', '恢复默认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('已恢复默认配置')
  }).catch(() => {})
}

const handleExport = () => {
  ElMessage.success('配置导出成功')
}

const handleSave = () => {
  ElMessage.success('配置保存成功，实时生效')
}
</script>

<style lang="scss" scoped>
.config-center-page {
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

  .config-tabs {
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
      overflow-y: auto;
    }
  }

  .footer-actions {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding-top: 20px;
    border-top: 1px solid #ebeef5;
    flex-shrink: 0;
  }
}
</style>
