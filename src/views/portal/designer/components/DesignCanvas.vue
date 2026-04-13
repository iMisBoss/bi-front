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

          <!-- 组件操作按钮（仅hover时显示） -->
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

          <!-- 组件内容区（所见即所得） -->
          <div class="component-body">
            <!-- 标题栏 -->
            <div v-if="component.showTitle !== false" class="component-title-bar" :class="'title-' + (component.titleColor || 'primary')">
              <span class="title-text">{{ component.title || getComponentTypeLabel(component.type) }}</span>
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

            <!-- 非容器组件内容（真实效果展示） -->
            <div v-else class="component-real-content" :style="getComponentStyle(component)">
              <!-- 个人信息卡 -->
              <template v-if="component.type === 'user-card'">
                <div class="user-card-preview">
                  <el-avatar :size="48" :src="mockUser.avatar">{{ mockUser.name[0] }}</el-avatar>
                  <div class="user-info">
                    <div class="user-name">{{ mockUser.name }}</div>
                    <div class="user-dept">{{ mockUser.dept }}</div>
                  </div>
                  <el-button size="small" type="danger" plain>退出</el-button>
                </div>
              </template>

              <!-- 单行公告 -->
              <template v-else-if="component.type === 'scroll-notice'">
                <div class="notice-preview">
                  <el-icon class="notice-icon"><Bell /></el-icon>
                  <span class="notice-text">欢迎使用OA办公系统，请及时处理待办事项</span>
                </div>
              </template>

              <!-- 快捷导航 -->
              <template v-else-if="component.type === 'nav-menu'">
                <div class="nav-menu-preview">
                  <div v-for="(item, index) in mockNavItems" :key="index" class="nav-item">
                    <el-icon><component :is="item.icon" /></el-icon>
                    <span>{{ item.name }}</span>
                  </div>
                </div>
              </template>

              <!-- 快捷入口 -->
              <template v-else-if="component.type === 'shortcut'">
                <div class="shortcut-preview">
                  <div v-for="(item, index) in mockShortcuts" :key="index" class="shortcut-item">
                    <el-icon><component :is="item.icon" /></el-icon>
                    <span>{{ item.name }}</span>
                  </div>
                </div>
              </template>

              <!-- 公告轮播 -->
              <template v-else-if="component.type === 'carousel'">
                <div class="carousel-preview">
                  <div class="carousel-item">
                    <el-icon><Picture /></el-icon>
                    <span>轮播图预览</span>
                  </div>
                </div>
              </template>

              <!-- 图文列表 -->
              <template v-else-if="component.type === 'article-list' || component.type === 'image-text-list'">
                <div class="article-list-preview">
                  <div v-for="i in 3" :key="i" class="article-item">
                    <div class="article-image">
                      <el-icon><Picture /></el-icon>
                    </div>
                    <div class="article-content">
                      <div class="article-title">公司新闻标题示例 {{ i }}</div>
                      <div class="article-time">2024-01-{{ 10 + i }} 10:00</div>
                    </div>
                  </div>
                </div>
              </template>

              <!-- 新闻列表 -->
              <template v-else-if="component.type === 'news-list'">
                <div class="news-list-preview">
                  <div v-for="i in 5" :key="i" class="news-item">
                    <span class="news-title">公司内部通知公告 {{ i }}</span>
                    <span class="news-time">01-{{ 10 + i }}</span>
                  </div>
                </div>
              </template>

              <!-- 数据卡片 -->
              <template v-else-if="component.type === 'stat-card'">
                <div class="stat-card-preview">
                  <div class="stat-value">128</div>
                  <div class="stat-label">待办事项</div>
                  <div class="stat-trend up">↑ 12%</div>
                </div>
              </template>

              <!-- 待办审批 -->
              <template v-else-if="component.type === 'todo-list'">
                <div class="todo-list-preview">
                  <div v-for="i in 3" :key="i" class="todo-item">
                    <div class="todo-header">
                      <el-tag size="small" type="warning">待审批</el-tag>
                      <span class="todo-time">2小时前</span>
                    </div>
                    <div class="todo-title">请假申请 - 张三</div>
                    <div class="todo-desc">申请时间：2024-01-15 至 2024-01-17</div>
                  </div>
                </div>
              </template>

              <!-- 已办审批 -->
              <template v-else-if="component.type === 'done-list'">
                <div class="done-list-preview">
                  <div v-for="i in 3" :key="i" class="done-item">
                    <div class="done-header">
                      <el-tag size="small" type="success">已办结</el-tag>
                      <span class="done-time">昨天</span>
                    </div>
                    <div class="done-title">报销申请 - 李四</div>
                  </div>
                </div>
              </template>

              <!-- 我的发起 -->
              <template v-else-if="component.type === 'launched-list'">
                <div class="launched-list-preview">
                  <div v-for="i in 3" :key="i" class="launched-item">
                    <div class="launched-header">
                      <el-tag size="small" type="primary">审批中</el-tag>
                      <span class="launched-time">3天前</span>
                    </div>
                    <div class="launched-title">出差申请 - 王五</div>
                  </div>
                </div>
              </template>

              <!-- 流程统计 -->
              <template v-else-if="component.type === 'flow-stats'">
                <div class="flow-stats-preview">
                  <div class="stats-chart">
                    <div class="chart-bar" style="height: 60%"></div>
                    <div class="chart-bar" style="height: 80%"></div>
                    <div class="chart-bar" style="height: 45%"></div>
                    <div class="chart-bar" style="height: 90%"></div>
                  </div>
                  <div class="stats-label">流程效率统计</div>
                </div>
              </template>

              <!-- 表单数据 -->
              <template v-else-if="component.type === 'form-data'">
                <div class="form-data-preview">
                  <el-table :data="mockFormData.slice(0, 3)" size="small" border>
                    <el-table-column prop="name" label="名称" width="120" />
                    <el-table-column prop="status" label="状态" width="80">
                      <template #default="{ row }">
                        <el-tag size="small" :type="row.status === '已完成' ? 'success' : 'warning'">{{ row.status }}</el-tag>
                      </template>
                    </el-table-column>
                    <el-table-column prop="time" label="时间" />
                  </el-table>
                </div>
              </template>

              <!-- 业务图表 -->
              <template v-else-if="component.type === 'data-chart'">
                <div class="data-chart-preview">
                  <div class="chart-placeholder">
                    <el-icon><TrendCharts /></el-icon>
                    <span>图表预览区域</span>
                  </div>
                </div>
              </template>

              <!-- 富文本 -->
              <template v-else-if="component.type === 'rich-text'">
                <div class="rich-text-preview">
                  <h3>富文本内容示例</h3>
                  <p>这是一段富文本内容的预览，支持HTML格式。</p>
                </div>
              </template>

              <!-- 自定义HTML -->
              <template v-else-if="component.type === 'html'">
                <div class="html-preview">
                  <code>&lt;div&gt;自定义HTML内容&lt;/div&gt;</code>
                </div>
              </template>

              <!-- iframe嵌入 -->
              <template v-else-if="component.type === 'iframe'">
                <div class="iframe-preview">
                  <el-icon><Link /></el-icon>
                  <span>外部页面嵌入区域</span>
                </div>
              </template>

              <!-- 栅格布局 -->
              <template v-else-if="isGridComponent(component.type)">
                <div class="grid-placeholder" :class="'grid-cols-' + getGridCols(component.type)">
                  <div v-for="n in getGridCols(component.type)" :key="n" class="grid-cell">
                    <span>列 {{ n }}</span>
                  </div>
                </div>
              </template>

              <!-- 卡片容器 -->
              <template v-else-if="component.type === 'card'">
                <div class="card-placeholder">
                  <el-icon><Files /></el-icon>
                  <span>卡片容器内容区</span>
                </div>
              </template>

              <!-- 分割线 -->
              <template v-else-if="component.type === 'divider'">
                <div class="divider-placeholder"></div>
              </template>

              <!-- 空白占位 -->
              <template v-else-if="component.type === 'spacer'">
                <div class="spacer-placeholder">空白占位区域</div>
              </template>

              <!-- 其他组件 -->
              <span v-else class="placeholder-text">{{ getComponentText(component.type) }}</span>
            </div>
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
import {
  Grid, Top, Bottom, Delete, RefreshLeft, RefreshRight, CopyDocument, Plus, Files,
  Bell, Picture, Link, TrendCharts, Avatar
} from '@element-plus/icons-vue'

const props = defineProps({
  components: {
    type: Array,
    default: () => []
  },
  gridVisible: {
    type: Boolean,
    default: false
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
  'update:gridVisible', 'update:zoom', 'undo', 'redo', 'wheel-zoom', 'component-drop', 'update-container'
])

const selectedId = ref(null)
const contextMenuVisible = ref(false)
const contextMenuX = ref(0)
const contextMenuY = ref(0)
const contextComponent = ref(null)

const localGridVisible = ref(props.gridVisible)
const localZoom = ref(props.zoom)

// 模拟数据
const mockUser = {
  name: '张三',
  dept: '技术部',
  avatar: ''
}

const mockNavItems = [
  { name: '首页', icon: 'HomeFilled' },
  { name: '流程', icon: 'Connection' },
  { name: '公文', icon: 'Document' },
  { name: '会议', icon: 'VideoCamera' }
]

const mockShortcuts = [
  { name: '请假', icon: 'Calendar' },
  { name: '报销', icon: 'Money' },
  { name: '用车', icon: 'Van' },
  { name: '用印', icon: 'Stamp' }
]

const mockFormData = [
  { name: '请假申请', status: '已完成', time: '2024-01-15' },
  { name: '报销申请', status: '审批中', time: '2024-01-16' },
  { name: '出差申请', status: '已完成', time: '2024-01-17' }
]

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

    if (!containerComponent.children) {
      containerComponent.children = []
    }
    containerComponent.children.push(newChild)

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

const getComponentStyle = (component) => {
  const styles = {}

  // 圆角
  const borderRadiusMap = { small: '4px', medium: '8px', large: '12px' }
  styles.borderRadius = borderRadiusMap[component.borderRadius] || '4px'

  // 阴影
  if (component.showShadow !== false) {
    styles.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)'
  }

  // 内边距
  const paddingMap = { default: '16px', compact: '8px', loose: '24px' }
  styles.padding = paddingMap[component.padding] || '16px'

  // 高度
  if (component.heightMode === 'fixed' && component.height) {
    styles.minHeight = component.height + 'px'
  } else {
    styles.minHeight = '80px'
  }

  return styles
}

const getComponentText = (type) => {
  const texts = {
    'grid-1': '1列栅格容器',
    'grid-2': '2列栅格容器',
    'grid-3': '3列栅格容器',
    'grid-4': '4列栅格容器',
    'card': '卡片容器',
    'divider': '分割线',
    'spacer': '空白占位',
    'user-card': '个人信息卡',
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
    'html': '自定义HTML',
    'iframe': 'iframe嵌入'
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
    'image-text-list': '图文列表',
    'news-list': '新闻列表',
    'stat-card': '数据卡片',
    'todo-list': '待办审批',
    'done-list': '已办审批',
    'launched-list': '我的发起',
    'form-data': '表单数据',
    'flow-stats': '流程统计',
    'data-chart': '业务图表',
    'rich-text': '富文本',
    'html': '自定义HTML',
    'iframe': 'iframe嵌入',
    'quick-tools': '常用工具',
    'file-handle': '文件办理'
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
    overflow: visible;
    padding: 24px;
    transform-origin: top left;

    &.drag-over {
      background: #ecf5ff;
    }

    .canvas-inner {
      min-height: 600px;
      background: #fff;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      overflow: visible;

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
          z-index: 10000;
          pointer-events: auto;

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
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);

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

        .component-body {
          background: #fff;

          .component-title-bar {
            padding: 12px 16px;
            border-bottom: 1px solid #e4e7ed;

            &.title-primary {
              .title-text {
                color: #409eff;
                font-weight: 600;
              }
            }

            &.title-gray {
              .title-text {
                color: #606266;
                font-weight: 500;
              }
            }

            .title-text {
              font-size: 14px;
            }
          }

          .component-real-content {
            padding: 16px;
            min-height: 80px;

            // 个人信息卡
            .user-card-preview {
              display: flex;
              align-items: center;
              gap: 12px;

              .user-info {
                flex: 1;

                .user-name {
                  font-size: 16px;
                  font-weight: 600;
                  color: #303133;
                  margin-bottom: 4px;
                }

                .user-dept {
                  font-size: 13px;
                  color: #909399;
                }
              }
            }

            // 单行公告
            .notice-preview {
              display: flex;
              align-items: center;
              gap: 8px;
              padding: 8px 12px;
              background: #f5f7fa;
              border-radius: 4px;

              .notice-icon {
                color: #409eff;
              }

              .notice-text {
                flex: 1;
                font-size: 13px;
                color: #606266;
              }
            }

            // 快捷导航
            .nav-menu-preview {
              display: flex;
              gap: 16px;

              .nav-item {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 4px;
                padding: 8px 12px;
                cursor: pointer;
                border-radius: 4px;
                transition: all 0.2s;

                &:hover {
                  background: #f5f7fa;
                }

                .el-icon {
                  font-size: 20px;
                  color: #409eff;
                }

                span {
                  font-size: 12px;
                  color: #606266;
                }
              }
            }

            // 快捷入口
            .shortcut-preview {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 12px;

              .shortcut-item {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 6px;
                padding: 12px;
                background: #f5f7fa;
                border-radius: 4px;
                cursor: pointer;
                transition: all 0.2s;

                &:hover {
                  background: #ecf5ff;
                  transform: translateY(-2px);
                }

                .el-icon {
                  font-size: 24px;
                  color: #409eff;
                }

                span {
                  font-size: 12px;
                  color: #606266;
                }
              }
            }

            // 公告轮播
            .carousel-preview {
              .carousel-item {
                height: 150px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 4px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                color: #fff;

                .el-icon {
                  font-size: 32px;
                  margin-bottom: 8px;
                }

                span {
                  font-size: 14px;
                }
              }
            }

            // 图文列表
            .article-list-preview {
              .article-item {
                display: flex;
                gap: 12px;
                padding: 12px 0;
                border-bottom: 1px solid #e4e7ed;

                &:last-child {
                  border-bottom: none;
                }

                .article-image {
                  width: 80px;
                  height: 60px;
                  background: #f5f7fa;
                  border-radius: 4px;
                  display: flex;
                  align-items: center;
                  justify-content: center;

                  .el-icon {
                    font-size: 24px;
                    color: #c0c4cc;
                  }
                }

                .article-content {
                  flex: 1;

                  .article-title {
                    font-size: 14px;
                    color: #303133;
                    margin-bottom: 4px;
                  }

                  .article-time {
                    font-size: 12px;
                    color: #909399;
                  }
                }
              }
            }

            // 新闻列表
            .news-list-preview {
              .news-item {
                display: flex;
                justify-content: space-between;
                padding: 10px 0;
                border-bottom: 1px dashed #e4e7ed;

                &:last-child {
                  border-bottom: none;
                }

                .news-title {
                  flex: 1;
                  font-size: 13px;
                  color: #606266;
                }

                .news-time {
                  font-size: 12px;
                  color: #909399;
                  margin-left: 12px;
                }
              }
            }

            // 数据卡片
            .stat-card-preview {
              text-align: center;
              padding: 20px;

              .stat-value {
                font-size: 36px;
                font-weight: 600;
                color: #409eff;
                margin-bottom: 8px;
              }

              .stat-label {
                font-size: 14px;
                color: #909399;
                margin-bottom: 8px;
              }

              .stat-trend {
                font-size: 13px;
                font-weight: 500;

                &.up {
                  color: #67c23a;
                }

                &.down {
                  color: #f56c6c;
                }
              }
            }

            // 待办审批
            .todo-list-preview {
              .todo-item {
                padding: 12px;
                background: #f5f7fa;
                border-radius: 4px;
                margin-bottom: 8px;

                &:last-child {
                  margin-bottom: 0;
                }

                .todo-header {
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  margin-bottom: 8px;

                  .todo-time {
                    font-size: 12px;
                    color: #909399;
                  }
                }

                .todo-title {
                  font-size: 14px;
                  color: #303133;
                  margin-bottom: 4px;
                }

                .todo-desc {
                  font-size: 12px;
                  color: #909399;
                }
              }
            }

            // 已办审批
            .done-list-preview {
              .done-item {
                padding: 12px;
                background: #f5f7fa;
                border-radius: 4px;
                margin-bottom: 8px;

                &:last-child {
                  margin-bottom: 0;
                }

                .done-header {
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  margin-bottom: 8px;

                  .done-time {
                    font-size: 12px;
                    color: #909399;
                  }
                }

                .done-title {
                  font-size: 14px;
                  color: #303133;
                }
              }
            }

            // 我的发起
            .launched-list-preview {
              .launched-item {
                padding: 12px;
                background: #f5f7fa;
                border-radius: 4px;
                margin-bottom: 8px;

                &:last-child {
                  margin-bottom: 0;
                }

                .launched-header {
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  margin-bottom: 8px;

                  .launched-time {
                    font-size: 12px;
                    color: #909399;
                  }
                }

                .launched-title {
                  font-size: 14px;
                  color: #303133;
                }
              }
            }

            // 流程统计
            .flow-stats-preview {
              text-align: center;

              .stats-chart {
                display: flex;
                align-items: flex-end;
                justify-content: center;
                gap: 12px;
                height: 120px;
                padding: 12px;
                background: #f5f7fa;
                border-radius: 4px;
                margin-bottom: 8px;

                .chart-bar {
                  width: 30px;
                  background: linear-gradient(180deg, #409eff 0%, #66b1ff 100%);
                  border-radius: 4px 4px 0 0;
                  transition: all 0.3s;
                }
              }

              .stats-label {
                font-size: 13px;
                color: #909399;
              }
            }

            // 表单数据
            .form-data-preview {
              :deep(.el-table) {
                font-size: 13px;
              }
            }

            // 业务图表
            .data-chart-preview {
              .chart-placeholder {
                height: 150px;
                background: #f5f7fa;
                border-radius: 4px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                color: #c0c4cc;

                .el-icon {
                  font-size: 32px;
                  margin-bottom: 8px;
                }

                span {
                  font-size: 13px;
                }
              }
            }

            // 富文本
            .rich-text-preview {
              h3 {
                font-size: 16px;
                color: #303133;
                margin-bottom: 8px;
              }

              p {
                font-size: 14px;
                color: #606266;
                line-height: 1.6;
              }
            }

            // 自定义HTML
            .html-preview {
              code {
                display: block;
                padding: 12px;
                background: #f5f7fa;
                border-radius: 4px;
                font-size: 13px;
                color: #606266;
              }
            }

            // iframe嵌入
            .iframe-preview {
              height: 150px;
              background: #f5f7fa;
              border: 2px dashed #dcdfe6;
              border-radius: 4px;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              color: #c0c4cc;

              .el-icon {
                font-size: 32px;
                margin-bottom: 8px;
              }

              span {
                font-size: 13px;
              }
            }

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
