<template>
  <div class="cms-admin-page">
    <!-- 面包屑 -->
    <el-breadcrumb separator="/" class="breadcrumb">
      <el-breadcrumb-item :to="{ path: '/' }">后台首页</el-breadcrumb-item>
      <el-breadcrumb-item>公文与内容管理</el-breadcrumb-item>
      <el-breadcrumb-item>内容管理中心</el-breadcrumb-item>
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
            <!-- Tab1: 栏目管理 -->
            <el-tab-pane label="栏目管理" name="column">
              <ColumnManage ref="columnRef" :org-data="selectedOrg" />
            </el-tab-pane>

            <!-- Tab2: 内容管理 -->
            <el-tab-pane label="内容管理" name="content">
              <ContentManage ref="contentRef" :org-data="selectedOrg" />
            </el-tab-pane>

            <!-- Tab3: 知识库管理 -->
            <el-tab-pane label="知识库管理" name="knowledge">
              <KnowledgeManage ref="knowledgeRef" :org-data="selectedOrg" />
            </el-tab-pane>

            <!-- Tab4: 全局权限配置 -->
            <el-tab-pane label="全局权限配置" name="permission">
              <PermissionConfig />
            </el-tab-pane>

            <!-- Tab5: 发布审批配置 -->
            <el-tab-pane label="发布审批配置" name="approval">
              <ApprovalConfig />
            </el-tab-pane>

            <!-- Tab6: 内容运维中心 -->
            <el-tab-pane label="内容运维中心" name="operations">
              <OperationsCenter />
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { OfficeBuilding } from '@element-plus/icons-vue'
import ColumnManage from './components/ColumnManage.vue'
import ContentManage from './components/ContentManage.vue'
import KnowledgeManage from './components/KnowledgeManage.vue'
import PermissionConfig from './components/PermissionConfig.vue'
import ApprovalConfig from './components/ApprovalConfig.vue'
import OperationsCenter from './components/OperationsCenter.vue'

const activeTab = ref('column')
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

<style lang="scss" scoped>
.cms-admin-page {
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
