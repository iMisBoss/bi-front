
<template>
  <div class="ai-admin-page">
    <!-- 面包屑 -->
    <el-breadcrumb separator="/" class="breadcrumb">
      <el-breadcrumb-item :to="{ path: '/' }">后台首页</el-breadcrumb-item>
      <el-breadcrumb-item>AI 智能助手</el-breadcrumb-item>
      <el-breadcrumb-item>AI 管理中心</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card class="main-card" shadow="never">
      <!-- 左侧组织树 + 右侧内容区 -->
      <div class="content-wrapper">
        <!-- 左侧：组织架构树 -->
        <div class="left-panel">
          <el-tree
              :data="orgTree"
              :props="{ label: 'name', children: 'children' }"
              node-key="id"
              default-expand-all
              @node-click="handleOrgNodeClick"
          >
            <template #default="{ node, data }">
              <div class="tree-node">
                <el-icon class="node-icon"><OfficeBuilding /></el-icon>
                <span class="node-name">{{ node.label }}</span>
              </div>
            </template>
          </el-tree>
        </div>

        <!-- 右侧：Tab内容区 -->
        <div class="right-panel">
          <el-tabs v-model="activeTab" class="content-tabs">
            <!-- Tab1: 模型配置 -->
            <el-tab-pane label="模型配置" name="model">
              <ModelConfig ref="modelRef" :org-data="selectedOrg" />
            </el-tab-pane>

            <!-- Tab2: 功能权限 -->
            <el-tab-pane label="功能权限" name="permission">
              <FunctionPermission ref="permissionRef" :org-data="selectedOrg" />
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
              <OperationsSettings ref="opsRef" />
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>import { ref } from 'vue'
import { OfficeBuilding } from '@element-plus/icons-vue'
import ModelConfig from './components/ModelConfig.vue'
import FunctionPermission from './components/FunctionPermission.vue'
import SecurityControl from './components/SecurityControl.vue'
import UsageAudit from './components/UsageAudit.vue'
import OperationsSettings from './components/OperationsSettings.vue'

const activeTab = ref('model')
const selectedOrg = ref(null)

const orgTree = ref([
  {
    id: 1,
    name: '公司总部',
    children: [
      { id: 2, name: '技术部', children: [
          { id: 3, name: '前端开发组', children: [] },
          { id: 4, name: '后端开发组', children: [] }
        ]
      },
      { id: 5, name: '产品部', children: [] },
      { id: 6, name: '财务部', children: [] },
      { id: 7, name: '行政部', children: [] }
    ]
  }
])

const handleOrgNodeClick = (data) => {
  selectedOrg.value = data
}
</script>

<style lang="scss" scoped>.ai-admin-page {
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

  .content-wrapper {
    display: flex;
    gap: 16px;
    flex: 1;
    overflow: hidden;

    .left-panel {
      width: 240px;
      border-right: 1px solid #ebeef5;
      overflow-y: auto;
      padding-right: 16px;

      .tree-node {
        display: flex;
        align-items: center;
        gap: 8px;

        .node-icon {
          color: #409eff;
        }

        .node-name {
          font-size: 14px;
        }
      }
    }

    .right-panel {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;

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
  }
}
</style>