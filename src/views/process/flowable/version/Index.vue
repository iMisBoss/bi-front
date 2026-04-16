
<template>
  <div class="template-center">
    <!-- 全局操作栏 -->
    <div class="global-toolbar">
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>新建流程
      </el-button>
      <el-button @click="handleImport">
        <el-icon><Upload /></el-icon>导入流程
      </el-button>
      <el-button @click="handleExport">
        <el-icon><Download /></el-icon>导出模板
      </el-button>
      <el-divider direction="vertical" />
      <el-button @click="handleRefresh">
        <el-icon><Refresh /></el-icon>刷新
      </el-button>
    </div>

    <!-- 核心Tab栏 -->
    <el-tabs v-model="activeTab" class="main-tabs" @tab-change="handleTabChange">
      <el-tab-pane name="design">
        <template #label>
          <span class="tab-label"><el-icon><EditPen /></el-icon>设计版本<el-badge :value="designCount" :max="99" class="tab-badge" /></span>
        </template>
        <DesignVersion ref="designRef" @refresh="handleRefresh" />
      </el-tab-pane>

      <el-tab-pane name="running">
        <template #label>
          <span class="tab-label"><el-icon><VideoPlay /></el-icon>运行版本<el-badge :value="runningCount" :max="99" class="tab-badge" /></span>
        </template>
        <RunningVersion ref="runningRef" @refresh="handleRefresh" />
      </el-tab-pane>

      <el-tab-pane name="control">
        <template #label>
          <span class="tab-label"><el-icon><Setting /></el-icon>模板管控</span>
        </template>
        <TemplateControl />
      </el-tab-pane>

      <el-tab-pane name="permission">
        <template #label>
          <span class="tab-label"><el-icon><Lock /></el-icon>权限分配</span>
        </template>
        <PermissionAssign />
      </el-tab-pane>
    </el-tabs>

    <!-- 流程图预览弹窗 -->
    <el-dialog v-model="previewVisible" title="流程预览" width="900px" top="5vh">
      <div class="preview-placeholder">
        <el-empty description="流程图预览区域（集成 BPMN.js 只读视图）" />
      </div>
    </el-dialog>
  </div>
</template>

<script setup>import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus, Upload, Download, Refresh, EditPen, VideoPlay, Setting, Lock } from '@element-plus/icons-vue'
import DesignVersion from './components/DesignVersion.vue'
import RunningVersion from './components/RunningVersion.vue'
import TemplateControl from './components/TemplateControl.vue'
import PermissionAssign from './components/PermissionAssign.vue'

const router = useRouter()
const activeTab = ref('design')
const previewVisible = ref(false)

const designRef = ref(null)
const runningRef = ref(null)
const designCount = ref(5)
const runningCount = ref(3)

const handleAdd = () => { router.push({ path: '/process/design/flowable/bpmn' }) }
const handleImport = () => { ElMessage.info('导入功能开发中...') }
const handleExport = () => { ElMessage.info('导出功能开发中...') }
const handleRefresh = () => { ElMessage.success('刷新成功') }

const handleTabChange = (tab) => {
  if (tab === 'design') designCount.value = 5
  if (tab === 'running') runningCount.value = 3
}
</script>

<style scoped lang="scss">
.template-center {
  height: calc(100vh - 50px);
  background: #f5f7fa;
  display: flex;
  flex-direction: column;

  .global-toolbar {
    background: #fff;
    border-bottom: 1px solid #dee0e3;
    padding: 14px 24px;
    display: flex;
    align-items: center;
    gap: 10px;

    :deep(.el-button) {
      height: 36px;
      border-radius: 4px;
      font-size: 14px;

      .el-icon { margin-right: 6px; }
    }

    :deep(.el-divider--vertical) { margin: 0 6px; height: 20px; }
  }

  .main-tabs {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    background: #fff;

    :deep(.el-tabs__header) {
      padding: 0 24px;
      margin: 0;
      border-bottom: 1px solid #dee0e3;

      .el-tabs__nav-wrap::after { display: none; }
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

  .tab-label {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
    font-weight: 500;

    .tab-badge {
      margin-left: 4px;
      :deep(.el-badge__content) { font-size: 11px; height: 16px; line-height: 16px; }
    }
  }

  .preview-placeholder {
    min-height: 500px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>