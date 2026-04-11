<template>
  <div class="variables-management">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator=">" class="breadcrumb">
      <el-breadcrumb-item :to="{ path: '/admin' }">后台首页</el-breadcrumb-item>
      <el-breadcrumb-item>低代码设计平台</el-breadcrumb-item>
      <el-breadcrumb-item>基础能力配置</el-breadcrumb-item>
      <el-breadcrumb-item>变量管理</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 标题区 -->
    <div class="page-header">
      <div class="header-left">
        <h2>变量管理</h2>
        <p class="subtitle">管理系统内置变量和业务自定义变量，支撑表单绑定、流程条件、审批规则配置</p>
      </div>
    </div>

    <!-- Tab导航栏 -->
    <el-tabs v-model="activeTab" class="variable-tabs">
      <!-- Tab1：流程变量管理 -->
      <el-tab-pane label="流程变量管理" name="process">
        <template #label>
          <span class="tab-label">
            <el-icon><Edit /></el-icon>
            流程变量管理
            <el-badge :value="processVariableCount" :max="99" class="tab-badge" />
          </span>
        </template>
        <div class="tab-tip">
          <el-alert
              title="流程变量 = 业务自定义变量，由管理员手动新增、编辑、删除，用于承载业务字段（请假天数、报销金额等）"
              type="info"
              :closable="false"
              show-icon
          />
        </div>
        <ProcessVariables />
      </el-tab-pane>

      <!-- Tab2：系统变量库 -->
      <el-tab-pane label="系统变量库" name="system">
        <template #label>
          <span class="tab-label">
            <el-icon><Lock /></el-icon>
            系统变量库
            <el-badge :value="systemVariableCount" :max="99" class="tab-badge" />
          </span>
        </template>
        <div class="tab-tip">
          <el-alert
              title="系统变量 = 平台内置全局变量，不可新增、删除或编辑，仅支持启用/禁用，自动获取用户/流程上下文"
              type="warning"
              :closable="false"
              show-icon
          />
        </div>
        <SystemVariables />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Edit, Lock } from '@element-plus/icons-vue'
import ProcessVariables from './components/ProcessVariables.vue'
import SystemVariables from './components/SystemVariables.vue'

const activeTab = ref('process')

// 统计数量（这里可以接入实际数据）
const processVariableCount = ref(5)
const systemVariableCount = ref(16)
</script>

<style scoped lang="scss">
.variables-management {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 60px);

  .breadcrumb {
    margin-bottom: 20px;
    font-size: 14px;
  }

  .page-header {
    margin-bottom: 24px;
    padding: 20px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

    .header-left {
      h2 {
        margin: 0 0 8px;
        font-size: 22px;
        color: #303133;
        font-weight: 600;
      }

      .subtitle {
        margin: 0;
        font-size: 14px;
        color: #909399;
      }
    }
  }

  .variable-tabs {
    background: #fff;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

    .tab-label {
      display: flex;
      align-items: center;
      gap: 6px;

      .tab-badge {
        margin-left: 4px;
      }
    }
  }

  .tab-tip {
    margin-bottom: 16px;
  }
}
</style>
