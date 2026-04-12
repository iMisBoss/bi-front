<template>
  <div class="design-canvas">
    <!-- 画布工具栏 -->
    <div class="canvas-toolbar">
      <div class="toolbar-left">
        <el-checkbox v-model="localGridVisible" label="网格线" size="small" />
        <el-divider direction="vertical" />
        <span class="zoom-label">缩放：</span>
        <el-button-group size="small">
          <el-button :type="localZoom === 80 ? 'primary' : ''" @click="localZoom = 80">80%</el-button>
          <el-button :type="localZoom === 100 ? 'primary' : ''" @click="localZoom = 100">100%</el-button>
          <el-button :type="localZoom === 120 ? 'primary' : ''" @click="localZoom = 120">120%</el-button>
        </el-button-group>
      </div>

      <div class="toolbar-right">
        <el-button-group size="small">
          <el-button :disabled="!canUndo" @click="$emit('undo')">
            <el-icon><RefreshLeft /></el-icon>撤销
          </el-button>
          <el-button :disabled="!canRedo" @click="$emit('redo')">
            <el-icon><RefreshRight /></el-icon>重做
          </el-button>
        </el-button-group>
        <el-divider direction="vertical" />
        <el-button size="small" @click="handleClear">清空画布</el-button>
      </div>
    </div>

    <!-- 画布区域 -->
    <div
        class="canvas-area"
        :class="{ 'drag-over': isDragging }"
        :style="{ transform: `scale(${localZoom / 100})` }"
        @click="handleCanvasClick"
        @dragover.prevent
        @drop="handleDrop"
        @wheel.prevent="handleWheel"
    >
      <div
          class="canvas-inner"
          :class="{ 'show-grid': localGridVisible }"
          @click.stop
      >
        <!-- 空状态 -->
        <div v-if="components.length === 0" class="empty-state">
          <el-icon class="empty-icon"><Grid /></el-icon>
          <p class="empty-text">请拖拽左侧组件至画布，开始设计门户</p>
        </div>

        <!-- 组件列表 -->
        <div
            v-for="component in components"
            :key="component.id"
            class="canvas-component"
            :class="{ selected: selectedId === component.id }"
            @click.stop="handleComponentClick(component)"
            @contextmenu.prevent="handleContextMenu($event, component)"
        >
          <!-- 选中时的拖拽控制点 -->
          <div v-if="selectedId === component.id" class="resize-handles">
            <div class="handle handle-tl"></div>
            <div class="handle handle-tr"></div>
            <div class="handle handle-bl"></div>
            <div class="handle handle-br"></div>
          </div>

          <!-- 半透明遮罩层 -->
          <div v-if="selectedId === component.id" class="select-mask"></div>

          <!-- 组件操作按钮 -->
          <div class="component-actions-overlay" :class="{ 'show-actions': selectedId === component.id }">
            <el-tooltip content="复制" placement="top">
              <div class="action-btn" @click.stop="handleCopy(component)">
                <el-icon><CopyDocument /></el-icon>
              </div>
            </el-tooltip>
            <el-tooltip content="上移" placement="top">
              <div class="action-btn" @click.stop="handleMove(component, 'up')">
                <el-icon><Top /></el-icon>
              </div>
            </el-tooltip>
            <el-tooltip content="下移" placement="top">
              <div class="action-btn" @click.stop="handleMove(component, 'down')">
                <el-icon><Bottom /></el-icon>
              </div>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <div class="action-btn danger" @click.stop="handleDelete(component)">
                <el-icon><Delete /></el-icon>
              </div>
            </el-tooltip>
          </div>

          <div class="component-header">
            <span class="component-type">{{ getComponentTypeLabel(component.type) }}</span>
          </div>

          <!-- 容器组件的嵌套放置区 -->
          <div
              v-if="isContainerComponent(component.type)"
              class="container-drop-zone"
              :class="{ 'drag-over': isDragging && selectedId === component.id }"
              @dragover.prevent.stop="handleContainerDragOver(component)"
              @drop.prevent.stop="handleContainerDrop($event, component)"
          >
            <!-- 已放置的子组件 -->
            <div v-if="component.children && component.children.length > 0" class="child-components">
              <div v-for="child in component.children" :key="child.id" class="child-component">
                <span>{{ getComponentTypeLabel(child.type) }}</span>
              </div>
            </div>
            <!-- 空状态提示 -->
            <div v-else class="empty-container-tip">
              <el-icon><Plus /></el-icon>
              <span>拖拽组件放入此处</span>
            </div>
          </div>

          <!-- 非容器组件内容 -->
          <div v-else class="component-content">
            <template v-if="isGridComponent(component.type)">
              <div class="grid-placeholder" :class="'grid-cols-' + getGridCols(component.type)">
                <div v-for="n in getGridCols(component.type)" :key="n" class="grid-cell">
                  <span>列 {{ n }}</span>
                </div>
              </div>
            </template>
            <template v-else-if="component.type === 'card'">
              <div class="card-placeholder">
                <el-icon><Files /></el-icon>
                <span>卡片容器内容区</span>
              </div>
            </template>
            <template v-else-if="component.type === 'divider'">
              <div class="divider-placeholder"></div>
            </template>
            <template v-else-if="component.type === 'spacer'">
              <div class="spacer-placeholder">空白占位区域</div>
            </template>
            <span v-else class="placeholder-text">{{ getComponentText(component.type) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 右键菜单 -->
    <div v-show="contextMenuVisible" class="context-menu" :style="{ left: contextMenuX + 'px', top: contextMenuY + 'px' }">
      <div class="menu-item" @click="handleCopy(contextComponent)">复制</div>
      <div class="menu-item" @click="handleDelete(contextComponent)">删除</div>
      <el-divider class="menu-divider" />
      <div class="menu-item" @click="handleMove(contextComponent, 'up')">上移一层</div>
      <div class="menu-item" @click="handleMove(contextComponent, 'down')">下移一层</div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Grid, Top, Bottom, Delete, RefreshLeft, RefreshRight, CopyDocument, Plus, Files } from '@element-plus/icons-vue'

const props = defineProps({
  components: {
    type: Array,
    default: () => []
  },
  gridVisible: {
    type: Boolean,
    default: true
  },
  zoom: {
    type: Number,
    default: 100
  },
  canUndo: {
    type: Boolean,
    default: false
  },
  canRedo: {
    type: Boolean,
    default: false
  },
  isDragging: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'component-click', 'canvas-click', 'component-delete', 'component-move', 'component-copy', 'canvas-clear',
  'update:gridVisible', 'update:zoom', 'undo', 'redo', 'wheel-zoom'
])

const selectedId = ref(null)
const contextMenuVisible = ref(false)
const contextMenuX = ref(0)
const contextMenuY = ref(0)
const contextComponent = ref(null)

const localGridVisible = ref(props.gridVisible)
const localZoom = ref(props.zoom)

watch(() => props.gridVisible, (val) => { localGridVisible.value = val })
watch(() => props.zoom, (val) => { localZoom.value = val })
watch(localGridVisible, (val) => { emit('update:gridVisible', val) })
watch(localZoom, (val) => { emit('update:zoom', val) })

const handleCanvasClick = () => {
  emit('canvas-click')
  selectedId.value = null
}

const handleComponentClick = (component) => {
  selectedId.value = component.id
  emit('component-click', component)
}

const handleContextMenu = (event, component) => {
  contextMenuVisible.value = true
  contextMenuX.value = event.clientX
  contextMenuY.value = event.clientY
  contextComponent.value = component
  selectedId.value = component.id
  emit('component-click', component)
}

const handleDelete = (component) => {
  emit('component-delete', component)
  contextMenuVisible.value = false
}

const handleMove = (component, direction) => {
  emit('component-move', { component, direction })
  contextMenuVisible.value = false
}

const handleCopy = (component) => {
  emit('component-copy', component)
  contextMenuVisible.value = false
}

const handleClear = () => {
  emit('canvas-clear')
}

const handleDrop = (event) => {
  const componentData = event.dataTransfer.getData('component')
  if (!componentData) return

  try {
    const component = JSON.parse(componentData)
    const newComponent = {
      id: Date.now(),
      type: component.type,
      name: component.name,
      showTitle: true,
      title: component.name,
      heightMode: 'auto',
      height: 200,
      visible: true,
      borderRadius: 'small',
      showShadow: true,
      padding: 'default',
      titleColor: 'primary'
    }
    emit('component-drop', newComponent)
  } catch (e) {
    console.error('解析组件数据失败:', e)
  }
}

const isContainerComponent = (type) => {
  return ['grid-1', 'grid-2', 'grid-3', 'grid-4', 'card'].includes(type)
}
const isGridComponent = (type) => {
  return ['grid-1', 'grid-2', 'grid-3', 'grid-4'].includes(type)
}

const getGridCols = (type) => {
  const map = { 'grid-1': 1, 'grid-2': 2, 'grid-3': 3, 'grid-4': 4 }
  return map[type] || 1
}

const handleContainerDragOver = (component) => {
  // 触发父组件高亮当前容器
  emit('component-click', component)
}

const handleContainerDrop = (event, containerComponent) => {
  const componentData = event.dataTransfer.getData('component')
  if (!componentData) return

  try {
    const component = JSON.parse(componentData)
    const newChild = {
      id: Date.now(),
      type: component.type,
      name: component.name,
      showTitle: true,
      title: component.name,
      heightMode: 'auto',
      height: 100,
      visible: true
    }

    // 将子组件加入容器的 children 数组
    if (!containerComponent.children) {
      containerComponent.children = []
    }
    containerComponent.children.push(newChild)

    // 更新画布并记录历史
    emit('update-container', containerComponent)
    emit('component-drop', newChild)
  } catch (e) {
    console.error('解析组件数据失败:', e)
  }
}
const handleWheel = (event) => {
  const delta = event.deltaY > 0 ? -5 : 5
  emit('wheel-zoom', delta)
}

const getComponentText = (type) => {
  const texts = {
    'grid-1': '1 列栅格容器',
    'grid-2': '2 列栅格容器',
    'grid-3': '3 列栅格容器',
    'grid-4': '4 列栅格容器',
    'card': '卡片容器',
    'divider': '分割线',
    'spacer': '空白占位',
    'user-card': '个人信息卡（头像+姓名+部门+退出）',
    'scroll-notice': '单行滚动公告',
    'nav-menu': '横向快捷导航菜单',
    'shortcut': '快捷入口',
    'carousel': '公告轮播',
    'article-list': '图文列表',
    'stat-card': '数据卡片',
    'todo-list': '待办审批列表',
    'done-list': '已办审批列表',
    'launched-list': '我的发起列表',
    'form-data': '表单数据列表',
    'flow-stats': '流程统计图表',
    'rich-text': '富文本内容',
    'html': '自定义 HTML',
    'iframe': 'iframe 嵌入'
  }
  return texts[type] || type
}

const getComponentTypeLabel = (type) => {
  const labels = {
    'grid-1': '1列栅格',
    'grid-2': '2列栅格',
    'grid-3': '3列栅格',
    'grid-4': '4列栅格',
    'card': '卡片容器',
    'divider': '分割线',
    'spacer': '空白占位',
    'user-card': '个人信息卡',
    'scroll-notice': '单行公告',
    'nav-menu': '快捷导航',
    'shortcut': '快捷入口',
    'carousel': '公告轮播',
    'article-list': '图文列表',
    'stat-card': '数据卡片',
    'todo-list': '待办审批',
    'done-list': '已办审批',
    'launched-list': '我的发起',
    'form-data': '表单数据',
    'flow-stats': '流程统计',
    'rich-text': '富文本',
    'html': '自定义HTML',
    'iframe': 'iframe嵌入'
  }
  return labels[type] || type
}

watch(contextMenuVisible, (val) => {
  if (val) {
    setTimeout(() => {
      document.addEventListener('click', () => {
        contextMenuVisible.value = false
      }, { once: true })
    }, 0)
  }
})
</script>

<style scoped lang="scss">
.design-canvas {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #f0f2f5;
  position: relative;

  .canvas-toolbar {
    height: 44px;
    background: #fff;
    border-bottom: 1px solid #e4e7ed;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 16px;
    flex-shrink: 0;

    .toolbar-left,
    .toolbar-right {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .zoom-label {
      font-size: 13px;
      color: #606266;
    }
  }

  .canvas-area {
    flex: 1;
    overflow: auto;
    padding: 8px;
    transform-origin: top left;

    &.drag-over {
      background: #ecf5ff;
    }

    .canvas-inner {
      min-height: 600px;
      background: #fff;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

      &.show-grid {
        background-image:
            linear-gradient(rgba(0, 0, 0, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 0, 0, 0.05) 1px, transparent 1px);
        background-size: 20px 20px;
      }

      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 400px;

        .empty-icon {
          font-size: 64px;
          color: #c0c4cc;
          margin-bottom: 16px;
        }

        .empty-text {
          font-size: 14px;
          color: #909399;
        }
      }

      .canvas-component {
        margin-bottom: 16px;
        border: 2px solid transparent;
        border-radius: 4px;
        transition: all 0.2s;
        position: relative;

        &.selected {
          border-color: #409eff;
          box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
        }

        &:hover {
          border-color: #c6e2ff;
        }

        .select-mask {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(64, 158, 255, 0.05);
          pointer-events: none;
          z-index: 5;
        }

        .resize-handles {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          z-index: 10;

          .handle {
            position: absolute;
            width: 8px;
            height: 8px;
            background: #fff;
            border: 2px solid #409eff;
            border-radius: 50%;

            &.handle-tl { top: -4px; left: -4px; cursor: nwse-resize; }
            &.handle-tr { top: -4px; right: -4px; cursor: nesw-resize; }
            &.handle-bl { bottom: -4px; left: -4px; cursor: nesw-resize; }
            &.handle-br { bottom: -4px; right: -4px; cursor: nwse-resize; }
          }
        }

        .component-actions-overlay {
          position: absolute;
          top: -32px;
          right: 0;
          display: flex;
          gap: 4px;
          opacity: 0;
          transition: opacity 0.2s;
          z-index: 20;

          &.show-actions {
            opacity: 1;
          }

          .action-btn {
            width: 28px;
            height: 28px;
            background: #fff;
            border: 1px solid #e4e7ed;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s;

            &:hover {
              background: #ecf5ff;
              border-color: #409eff;
              color: #409eff;
            }

            &.danger:hover {
              background: #fef0f0;
              border-color: #f56c6c;
              color: #f56c6c;
            }

            .el-icon {
              font-size: 14px;
            }
          }
        }

        .component-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 12px;
          background: #f5f7fa;
          border-bottom: 1px solid #e4e7ed;

          .component-type {
            font-size: 12px;
            color: #909399;
          }
        }

        .component-content {
          padding: 20px;
          min-height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;

          .placeholder-text {
            font-size: 14px;
            color: #c0c4cc;
          }

          .grid-placeholder {
            display: flex;
            gap: 8px;
            width: 100%;
            height: 60px;

            .grid-cell {
              flex: 1;
              background: #f5f7fa;
              border: 1px dashed #dcdfe6;
              border-radius: 4px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 12px;
              color: #909399;
            }
          }

          .card-placeholder {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
            color: #c0c4cc;
            font-size: 13px;

            .el-icon {
              font-size: 24px;
            }
          }

          .divider-placeholder {
            width: 100%;
            height: 1px;
            background: #dcdfe6;
          }

          .spacer-placeholder {
            width: 100%;
            height: 40px;
            background: #fafafa;
            border: 1px dashed #e4e7ed;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            color: #c0c4cc;
          }
        }
      }
    }
  }

  .context-menu {
    position: fixed;
    background: #fff;
    border: 1px solid #e4e7ed;
    border-radius: 4px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
    padding: 4px 0;
    z-index: 9999;

    .menu-item {
      padding: 8px 16px;
      font-size: 13px;
      color: #606266;
      cursor: pointer;

      &:hover {
        background: #f5f7fa;
        color: #409eff;
      }
    }

    .menu-divider {
      margin: 4px 0;
    }
  }
}
</style>
