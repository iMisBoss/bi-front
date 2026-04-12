<template>
  <div class="portal-designer">
    <!-- 顶部工具栏 -->
    <div class="top-toolbar">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/admin/home' }">后台首页</el-breadcrumb-item>
        <el-breadcrumb-item>门户中心</el-breadcrumb-item>
        <el-breadcrumb-item>门户设计器</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <!-- 配置行 -->
    <div class="config-row">
      <div class="config-left">
        <el-form inline size="small">
          <el-form-item label="门户名称">
            <el-input v-model="portalName" placeholder="请输入门户名称" style="width: 180px" @change="markUnsaved" />
          </el-form-item>
          <el-form-item label="门户分类">
            <el-select v-model="portalCategory" placeholder="请选择" style="width: 140px" @change="markUnsaved">
              <el-option label="办公门户" value="office" />
              <el-option label="数据门户" value="data" />
              <el-option label="管理门户" value="admin" />
            </el-select>
          </el-form-item>
          <el-form-item label="状态">
            <el-tag :type="statusTagType" effect="plain" size="small">
              {{ statusText }}
            </el-tag>
          </el-form-item>
        </el-form>
      </div>
      <div class="config-right">
        <el-button size="small" @click="handleSave" :loading="saving">保存</el-button>
        <el-button size="small" type="primary" @click="handlePublish" :loading="publishing">发布</el-button>
        <el-button size="small" @click="handlePreview">预览</el-button>
        <el-button size="small" @click="handleImport">导入模板</el-button>
        <el-button size="small" @click="handleExport">导出模板</el-button>
      </div>
    </div>

    <!-- 主体三段式布局 -->
    <div class="main-content">
      <!-- 左侧：组件库 -->
      <div class="left-panel-wrapper" :style="{ width: leftPanelCollapsed ? '0px' : leftPanelWidth + 'px' }">
        <ComponentLibrary
            v-show="!leftPanelCollapsed"
            :collapsed="leftPanelCollapsed"
            :width="leftPanelWidth"
            :search-keyword="componentSearchKeyword"
            @drag-start="handleDragStart"
            @search-change="componentSearchKeyword = $event"
        />
        <div v-if="!leftPanelCollapsed" class="resize-handle resize-right" @mousedown="startResize('left', $event)"></div>
      </div>

      <!-- 中间：设计画布 -->
      <div class="canvas-wrapper" :class="{ 'drag-over': isDragging }">
        <DesignCanvas
            :components="canvasComponents"
            :grid-visible="gridVisible"
            :zoom="zoom"
            :can-undo="canUndo"
            :can-redo="canRedo"
            :is-dragging="isDragging"
            @update:grid-visible="gridVisible = $event"
            @update:zoom="zoom = $event"
            @component-click="handleComponentClick"
            @canvas-click="handleCanvasClick"
            @component-delete="handleComponentDelete"
            @component-move="handleComponentMove"
            @component-copy="handleComponentCopy"
            @component-drop="handleComponentDrop"
            @canvas-clear="handleCanvasClear"
            @update-container="handleUpdateContainer"
            @undo="handleUndo"
            @redo="handleRedo"
            @wheel-zoom="handleWheelZoom"
        />

        <!-- 面板折叠按钮 -->
        <div class="panel-toggles">
          <el-tooltip :content="leftPanelCollapsed ? '展开组件库' : '收起组件库'" placement="right">
            <div class="toggle-btn" @click="leftPanelCollapsed = !leftPanelCollapsed">
              <el-icon><ArrowRight v-if="leftPanelCollapsed" /><ArrowLeft v-else /></el-icon>
            </div>
          </el-tooltip>
          <el-tooltip :content="rightPanelCollapsed ? '展开属性面板' : '收起属性面板'" placement="left">
            <div class="toggle-btn" @click="rightPanelCollapsed = !rightPanelCollapsed">
              <el-icon><ArrowLeft v-if="rightPanelCollapsed" /><ArrowRight v-else /></el-icon>
            </div>
          </el-tooltip>
        </div>
      </div>

      <!-- 右侧：属性面板 -->
      <div class="right-panel-wrapper" :style="{ width: rightPanelCollapsed ? '0px' : rightPanelWidth + 'px' }">
        <div v-if="!rightPanelCollapsed" class="resize-handle resize-left" @mousedown="startResize('right', $event)"></div>
        <PropertyPanel
            v-show="!rightPanelCollapsed"
            :collapsed="rightPanelCollapsed"
            :selected-component="selectedComponent"
            :portal-config="portalConfig"
            :publish-status="publishStatus"
            @update-component="handleUpdateComponent"
            @update-portal="handleUpdatePortal"
            @jump-permission="handleJumpPermission"
        />
      </div>
    </div>

    <!-- 导入模板弹窗 -->
    <ImportTemplateDialog ref="importDialogRef" @import-success="handleImportSuccess" />

    <!-- 导出模板弹窗 -->
    <ExportTemplateDialog ref="exportDialogRef" :portal-data="{ name: portalName, category: portalCategory, description: portalConfig.remark, components: canvasComponents }" />

    <!-- 预览弹窗 -->
    <PreviewDialog ref="previewDialogRef" />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, ArrowRight, ArrowDown } from '@element-plus/icons-vue'
import ComponentLibrary from './components/ComponentLibrary.vue'
import DesignCanvas from './components/DesignCanvas.vue'
import PropertyPanel from './components/PropertyPanel.vue'
import ImportTemplateDialog from './components/ImportTemplateDialog.vue'
import ExportTemplateDialog from './components/ExportTemplateDialog.vue'
import PreviewDialog from './components/PreviewDialog.vue'

const portalName = ref('新门户')
const portalCategory = ref('')
const publishStatus = ref('draft')
const isSaved = ref(true)

const canvasComponents = ref([])
const selectedComponent = ref(null)
const gridVisible = ref(true)
const zoom = ref(100)
const isDragging = ref(false)
const componentSearchKeyword = ref('')

const saving = ref(false)
const publishing = ref(false)

// 弹窗引用
const importDialogRef = ref(null)
const exportDialogRef = ref(null)
const previewDialogRef = ref(null)

// 操作历史
const history = ref([])
const historyIndex = ref(-1)
const MAX_HISTORY = 20
const canUndo = computed(() => historyIndex.value > 0)
const canRedo = computed(() => historyIndex.value < history.value.length - 1)

const statusText = computed(() => {
  if (publishStatus.value === 'published') {
    return isSaved.value ? '已发布（无更新）' : '已发布（有更新）'
  }
  return isSaved.value ? '草稿（已保存）' : '草稿（未保存）'
})

const statusTagType = computed(() => {
  if (publishStatus.value === 'published') return 'success'
  return isSaved.value ? 'info' : 'warning'
})

const portalConfig = reactive({
  name: portalName,
  category: portalCategory,
  remark: '',
  layoutMode: 'fixed',
  background: '#ffffff'
})

const leftPanelCollapsed = ref(false)
const rightPanelCollapsed = ref(false)
const leftPanelWidth = ref(280)
const rightPanelWidth = ref(320)
const minPanelWidth = 200
const maxPanelWidth = 500

let isResizing = false
let resizeDirection = ''
let startX = 0
let startWidth = 0

const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj.getTime())
  if (obj instanceof Array) return obj.map(item => deepClone(item))
  if (obj instanceof Object) {
    const clonedObj = {}
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key])
      }
    }
    return clonedObj
  }
}

const saveHistory = () => {
  history.value = history.value.slice(0, historyIndex.value + 1)
  const currentState = deepClone(canvasComponents.value)
  history.value.push(currentState)
  historyIndex.value = history.value.length - 1

  if (history.value.length > MAX_HISTORY) {
    history.value.shift()
    historyIndex.value--
  }
}

const markUnsaved = () => {
  isSaved.value = false
}

const startResize = (direction, event) => {
  isResizing = true
  resizeDirection = direction
  startX = event.clientX
  startWidth = direction === 'left' ? leftPanelWidth.value : rightPanelWidth.value
  document.addEventListener('mousemove', handleResize)
  document.addEventListener('mouseup', stopResize)
  event.preventDefault()
  document.body.style.cursor = 'col-resize'
  document.body.style.userSelect = 'none'
}

const handleResize = (event) => {
  if (!isResizing) return
  const deltaX = event.clientX - startX
  if (resizeDirection === 'left') {
    const newWidth = startWidth + deltaX
    leftPanelWidth.value = Math.max(minPanelWidth, Math.min(maxPanelWidth, newWidth))
  } else {
    const newWidth = startWidth - deltaX
    rightPanelWidth.value = Math.max(minPanelWidth, Math.min(maxPanelWidth, newWidth))
  }
}

const stopResize = () => {
  isResizing = false
  resizeDirection = ''
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', stopResize)
  document.body.style.cursor = ''
  document.body.style.userSelect = ''
}

const handleDragStart = (component) => {
  isDragging.value = true
}

const handleWheelZoom = (delta) => {
  const newZoom = Math.max(50, Math.min(150, zoom.value + delta))
  zoom.value = newZoom
}

const handleComponentDrop = (component) => {
  canvasComponents.value.push(component)
  selectedComponent.value = component
  isDragging.value = false
  markUnsaved()
  saveHistory()
  ElMessage.success('组件已添加')
}
const handleUpdateContainer = (updatedContainer) => {
  const index = canvasComponents.value.findIndex(c => c.id === updatedContainer.id)
  if (index !== -1) {
    canvasComponents.value[index] = updatedContainer
    markUnsaved()
    saveHistory()
  }
}
const handleCanvasClick = () => {
  selectedComponent.value = null
}

const handleComponentClick = (component) => {
  selectedComponent.value = component
}

const handleComponentDelete = (component) => {
  ElMessageBox.confirm('确定删除该组件？此操作不可恢复。', '删除确认', { type: 'warning' }).then(() => {
    const index = canvasComponents.value.findIndex(c => c.id === component.id)
    if (index !== -1) canvasComponents.value.splice(index, 1)
    if (selectedComponent.value?.id === component.id) {
      selectedComponent.value = null
    }
    markUnsaved()
    saveHistory()
    ElMessage.success('删除成功')
  }).catch(() => {})
}

const handleComponentCopy = (component) => {
  const copy = { ...deepClone(component), id: Date.now(), name: component.name + ' 副本' }
  canvasComponents.value.push(copy)
  markUnsaved()
  saveHistory()
  ElMessage.success('复制成功')
}

const handleComponentMove = ({ component, direction }) => {
  const index = canvasComponents.value.findIndex(c => c.id === component.id)
  if (direction === 'up' && index > 0) {
    [canvasComponents.value[index], canvasComponents.value[index - 1]] = [canvasComponents.value[index - 1], canvasComponents.value[index]]
    markUnsaved()
    saveHistory()
  } else if (direction === 'down' && index < canvasComponents.value.length - 1) {
    [canvasComponents.value[index], canvasComponents.value[index + 1]] = [canvasComponents.value[index + 1], canvasComponents.value[index]]
    markUnsaved()
    saveHistory()
  }
}

const handleUpdateComponent = (updatedComponent) => {
  const index = canvasComponents.value.findIndex(c => c.id === updatedComponent.id)
  if (index !== -1) {
    canvasComponents.value[index] = updatedComponent
    markUnsaved()
    saveHistory()
  }
}

const handleUpdatePortal = (config) => {
  Object.assign(portalConfig, config)
  markUnsaved()
}

const handleJumpPermission = () => {
  if (publishStatus.value !== 'published') {
    ElMessage.warning('请先发布门户后，再配置访问权限')
    return
  }
  ElMessage.info('跳转到门户管理中心权限配置页')
}

const handleUndo = () => {
  if (historyIndex.value > 0) {
    historyIndex.value--
    canvasComponents.value = deepClone(history.value[historyIndex.value])
    selectedComponent.value = null
    ElMessage.success('已撤销')
  } else {
    ElMessage.warning('没有可撤销的操作')
  }
}

const handleRedo = () => {
  if (historyIndex.value < history.value.length - 1) {
    historyIndex.value++
    canvasComponents.value = deepClone(history.value[historyIndex.value])
    selectedComponent.value = null
    ElMessage.success('已重做')
  } else {
    ElMessage.warning('没有可重做的操作')
  }
}

const handleSave = () => {
  saving.value = true
  setTimeout(() => {
    saving.value = false
    isSaved.value = true
    ElMessage.success('保存成功')
  }, 800)
}

const handlePublish = () => {
  if (!portalCategory.value) {
    ElMessage.warning('请选择门户分类')
    return
  }
  if (canvasComponents.value.length === 0) {
    ElMessage.warning('画布为空，无法发布')
    return
  }

  ElMessageBox.confirm('发布后门户将在前台生效。是否确认发布？', '发布确认', {
    confirmButtonText: '确认发布',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    publishing.value = true
    setTimeout(() => {
      publishing.value = false
      publishStatus.value = 'published'
      isSaved.value = true
      ElMessage.success('发布成功')
    }, 800)
  }).catch(() => {})
}

const handlePreview = () => {
  if (canvasComponents.value.length === 0) {
    ElMessage.warning('画布为空，无法预览')
    return
  }
  if (previewDialogRef.value) {
    previewDialogRef.value.open({
      name: portalName.value,
      background: portalConfig.background,
      components: canvasComponents.value
    })
  }
}

const handleImport = () => {
  if (importDialogRef.value) {
    importDialogRef.value.open()
  }
}

const handleExport = () => {
  if (exportDialogRef.value) {
    exportDialogRef.value.open({
      name: portalName.value,
      category: portalCategory.value,
      description: portalConfig.remark,
      components: canvasComponents.value
    })
  }
}

const handleImportSuccess = (data) => {
  portalName.value = data.name || '新门户'
  portalCategory.value = data.category || ''
  canvasComponents.value = data.components || []
  selectedComponent.value = null
  markUnsaved()
  saveHistory()
}

const handleCanvasClear = () => {
  ElMessageBox.confirm('确定清空画布？此操作不可恢复。', '清空确认', { type: 'warning' }).then(() => {
    canvasComponents.value = []
    selectedComponent.value = null
    markUnsaved()
    saveHistory()
    ElMessage.success('画布已清空')
  }).catch(() => {})
}

const initHistory = () => {
  saveHistory()
}

onMounted(() => {
  initHistory()
})

onUnmounted(() => {
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', stopResize)
})
</script>

<style scoped lang="scss">
.portal-designer {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f0f2f5;
  overflow: hidden;

  .top-toolbar {
    height: 48px;
    padding: 0 16px;
    background: #fff;
    border-bottom: 1px solid #e4e7ed;
    display: flex;
    align-items: center;
    flex-shrink: 0;
  }

  .config-row {
    height: 48px;
    padding: 0 16px;
    background: #fff;
    border-bottom: 1px solid #e4e7ed;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-shrink: 0;

    .config-left {
      :deep(.el-form) {
        margin-bottom: 0;
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: nowrap;

        .el-form-item {
          margin-bottom: 0;
        }

        .el-form-item__label {
          font-size: 13px;
          padding: 0 4px 0 0;
        }
      }
    }

    .config-right {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: nowrap;
      flex-shrink: 0;
    }
  }

  .main-content {
    display: flex;
    flex: 1;
    overflow: hidden;
    padding: 0;
    gap: 0;
  }

  .left-panel-wrapper,
  .right-panel-wrapper {
    position: relative;
    flex-shrink: 0;
    transition: width 0.3s ease;
    overflow: hidden;
  }

  .canvas-wrapper {
    flex: 1;
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;

    &.drag-over {
      background: #ecf5ff;
    }
  }

  .panel-toggles {
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    transform: translateY(-50%);
    pointer-events: none;
    z-index: 10;

    .toggle-btn {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      width: 24px;
      height: 60px;
      background: rgba(255, 255, 255, 0.9);
      border: 1px solid #e4e7ed;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      pointer-events: all;
      transition: all 0.2s;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

      &:hover {
        background: #fff;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
        color: #409eff;
      }

      &:first-child {
        left: 8px;
      }

      &:last-child {
        right: 8px;
      }
    }
  }

  .resize-handle {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 6px;
    cursor: col-resize;
    z-index: 100;

    &::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 2px;
      height: 40px;
      background: #dcdfe6;
      border-radius: 2px;
      transition: all 0.2s;
    }

    &:hover::after {
      background: #409eff;
      height: 60px;
    }

    &.resize-left {
      left: -3px;
    }

    &.resize-right {
      right: -3px;
    }
  }
  .container-drop-zone {
    min-height: 80px;
    padding: 12px;
    background: #fafafa;
    transition: all 0.2s;
    position: relative;

    &.drag-over {
      background: #ecf5ff;
      border: 2px dashed #409eff;
    }

    .empty-container-tip {
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #909399;
      font-size: 13px;
      border: 1px dashed #dcdfe6;
      border-radius: 4px;
      min-height: 60px;

      .el-icon {
        font-size: 20px;
        margin-bottom: 4px;
      }
    }

    .child-components {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;

      .child-component {
        padding: 8px 12px;
        background: #fff;
        border: 1px solid #e4e7ed;
        border-radius: 4px;
        font-size: 12px;
        color: #606266;
      }
    }
  }
}
</style>
