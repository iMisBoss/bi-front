NEW_FILE_CODE
<template>
  <div class="email-admin-page">
    <!-- 面包屑 -->
    <el-breadcrumb separator="/" class="breadcrumb">
      <el-breadcrumb-item :to="{ path: '/' }">后台首页</el-breadcrumb-item>
      <el-breadcrumb-item>日常办公管理</el-breadcrumb-item>
      <el-breadcrumb-item>内部邮件管控</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card class="main-card" shadow="never">
      <!-- 核心Tab栏 -->
      <el-tabs v-model="activeTab" class="content-tabs">
        <!-- Tab1: 邮件数据管控 -->
        <el-tab-pane label="邮件数据管控" name="data">
          <EmailDataControl ref="emailDataRef" />
        </el-tab-pane>

        <!-- Tab2: 邮箱账号管理 -->
        <el-tab-pane label="邮箱账号管理" name="account">
          <EmailAccountManage ref="emailAccountRef" />
        </el-tab-pane>

        <!-- Tab3: 邮件全局配置 -->
        <el-tab-pane label="邮件全局配置" name="config">
          <EmailGlobalConfig />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import EmailDataControl from './components/EmailDataControl.vue'
import EmailAccountManage from './components/EmailAccountManage.vue'
import EmailGlobalConfig from './components/EmailGlobalConfig.vue'

const activeTab = ref('data')
const emailDataRef = ref(null)
const emailAccountRef = ref(null)
</script>

<style lang="scss" scoped>
.email-admin-page {
  padding: 20px;
  height: calc(100vh - 60px);
  display: flex;
  flex-direction: column;
  background: #f5f7fa;

  .breadcrumb {
    margin-bottom: 16px;
    font-size: 14px;
  }

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
      padding: 16px;
    }
  }

  .content-tabs {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    :deep(.el-tabs__header) {
      margin: 0 0 16px 0;
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
