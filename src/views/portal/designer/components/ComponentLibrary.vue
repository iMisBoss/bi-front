<template>
  <div class="component-library">
    <div class="library-header">
      <span class="title">组件库</span>
      <el-input
          v-model="searchKeyword"
          placeholder="搜索组件"
          size="small"
          clearable
          prefix-icon="Search"
          class="search-input"
          @input="handleSearch"
      />
    </div>

    <div class="library-content">
      <el-collapse v-model="activeNames">
        <el-collapse-item name="layout">
          <template #title>
            <span class="collapse-title">基础布局</span>
          </template>
          <div class="component-grid">
            <div
                v-for="item in filteredLayoutComponents"
                :key="item.type"
                class="component-item"
                draggable="true"
                @dragstart="handleDragStart(item, $event)"
            >
              <el-icon><component :is="item.icon" /></el-icon>
              <span class="component-name">{{ item.name }}</span>
              <div class="tooltip">{{ item.desc }}</div>
            </div>
          </div>
        </el-collapse-item>

        <el-collapse-item name="common">
          <template #title>
            <span class="collapse-title">常用功能</span>
          </template>
          <div class="component-grid">
            <div
                v-for="item in filteredCommonComponents"
                :key="item.type"
                class="component-item"
                draggable="true"
                @dragstart="handleDragStart(item, $event)"
            >
              <el-icon><component :is="item.icon" /></el-icon>
              <span class="component-name">{{ item.name }}</span>
              <div class="tooltip">{{ item.desc }}</div>
            </div>
          </div>
        </el-collapse-item>

        <el-collapse-item name="business">
          <template #title>
            <span class="collapse-title">业务联动</span>
          </template>
          <div class="component-grid">
            <div
                v-for="item in filteredBusinessComponents"
                :key="item.type"
                class="component-item"
                draggable="true"
                @dragstart="handleDragStart(item, $event)"
            >
              <el-icon><component :is="item.icon" /></el-icon>
              <span class="component-name">{{ item.name }}</span>
              <div class="tooltip">{{ item.desc }}</div>
            </div>
          </div>
        </el-collapse-item>

        <el-collapse-item name="advanced">
          <template #title>
            <span class="collapse-title">高级组件</span>
          </template>
          <div class="component-grid">
            <div
                v-for="item in filteredAdvancedComponents"
                :key="item.type"
                class="component-item"
                draggable="true"
                @dragstart="handleDragStart(item, $event)"
            >
              <el-icon><component :is="item.icon" /></el-icon>
              <span class="component-name">{{ item.name }}</span>
              <div class="tooltip">{{ item.desc }}</div>
            </div>
          </div>
        </el-collapse-item>
      </el-collapse>
    </div>
  </div>
</template>

<script setup>import { ref, computed, onMounted, watch } from 'vue'
import {
  Grid,
  Files,
  Minus,
  Link,
  Picture,
  DataLine,
  DocumentChecked,
  Finished,
  Promotion,
  List,
  TrendCharts,
  Edit,
  Document,
  User,
  Bell,
  Menu,
  Search,
  Menu as IconMenu,
  ScaleToOriginal,
  Notebook
} from '@element-plus/icons-vue'

const props = defineProps({
  searchKeyword: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['drag-start', 'search-change'])

const searchKeyword = ref(props.searchKeyword)
const activeNames = ref(['layout'])

// 从localStorage加载分组状态
onMounted(() => {
  const savedState = localStorage.getItem('portal-designer-collapse-state')
  if (savedState) {
    try {
      activeNames.value = JSON.parse(savedState)
    } catch (e) {
      console.error('解析分组状态失败:', e)
    }
  }
})

// 监听分组状态变化并保存
watch(activeNames, (newVal) => {
  localStorage.setItem('portal-designer-collapse-state', JSON.stringify(newVal))
}, { deep: true })

const layoutComponents = [
  { type: 'grid-1', name: '1 列栅格', icon: Grid, desc: '单列布局容器' },
  { type: 'grid-2', name: '2 列栅格', icon: ScaleToOriginal, desc: '双列布局容器' },
  { type: 'grid-3', name: '3 列栅格', icon: IconMenu, desc: '三列布局容器' },
  { type: 'grid-4', name: '4 列栅格', icon: Grid, desc: '四列布局容器' },
  { type: 'card', name: '卡片容器', icon: Files, desc: '基础卡片容器' },
  { type: 'divider', name: '分割线', icon: Minus, desc: '水平分割线' },
  { type: 'spacer', name: '空白占位', icon: Notebook, desc: '空白占位符' }
]

const commonComponents = [
  { type: 'user-card', name: '个人信息卡', icon: User, desc: '头像+姓名+部门+退出' },
  { type: 'scroll-notice', name: '单行公告', icon: Bell, desc: '滚动文字通知' },
  { type: 'nav-menu', name: '快捷导航', icon: Menu, desc: '横向菜单导航' },
  { type: 'shortcut', name: '快捷入口', icon: Link, desc: '图标快捷入口' },
  { type: 'carousel', name: '公告轮播', icon: Picture, desc: '图片轮播展示' },
  { type: 'article-list', name: '图文列表', icon: List, desc: '文章图文列表' },
  { type: 'stat-card', name: '数据卡片', icon: DataLine, desc: '数据统计展示' }
]

const businessComponents = [
  { type: 'todo-list', name: '待办审批', icon: DocumentChecked, desc: '待办审批列表' },
  { type: 'done-list', name: '已办审批', icon: Finished, desc: '已办审批列表' },
  { type: 'launched-list', name: '我的发起', icon: Promotion, desc: '我的发起列表' },
  { type: 'form-data', name: '表单数据', icon: List, desc: '表单数据列表' },
  { type: 'flow-stats', name: '流程统计', icon: TrendCharts, desc: '流程统计图表' }
]

const advancedComponents = [
  { type: 'rich-text', name: '富文本', icon: Edit, desc: '富文本编辑器' },
  { type: 'html', name: '自定义 HTML', icon: Document, desc: '自定义HTML代码' },
  { type: 'iframe', name: 'iframe 嵌入', icon: Document, desc: '外部页面嵌入' }
]

const filterComponents = (components, keyword) => {
  if (!keyword) return components
  return components.filter(item =>
      item.name.toLowerCase().includes(keyword.toLowerCase()) ||
      item.desc.toLowerCase().includes(keyword.toLowerCase())
  )
}

const filteredLayoutComponents = computed(() => filterComponents(layoutComponents, searchKeyword.value))
const filteredCommonComponents = computed(() => filterComponents(commonComponents, searchKeyword.value))
const filteredBusinessComponents = computed(() => filterComponents(businessComponents, searchKeyword.value))
const filteredAdvancedComponents = computed(() => filterComponents(advancedComponents, searchKeyword.value))

const handleSearch = () => {
  emit('search-change', searchKeyword.value)
}

const handleDragStart = (component, event) => {
  event.dataTransfer.setData('component', JSON.stringify(component))
  emit('drag-start', component)
}
</script>

<style scoped lang="scss">.component-library {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-right: 1px solid #e4e7ed;

  .library-header {
    padding: 12px 16px;
    border-bottom: 1px solid #e4e7ed;

    .title {
      font-size: 14px;
      color: #303133;
      display: block;
      margin-bottom: 8px;
    }

    .search-input {
      :deep(.el-input__wrapper) {
        box-shadow: none;
        border: 1px solid #e4e7ed;

        &:hover {
          border-color: #c0c4cc;
        }

        &.is-focus {
          border-color: #409eff;
        }
      }
    }
  }

  .library-content {
    flex: 1;
    overflow-y: auto;
    padding: 8px;

    :deep(.el-collapse) {
      border: none;

      .el-collapse-item__header {
        height: 36px;
        line-height: 36px;
        padding: 0 8px;
        font-size: 13px;
        font-weight: 500;
        background: #fafafa;
        border-radius: 4px;
        margin-bottom: 4px;
      }

      .el-collapse-item__content {
        padding: 8px 0;
      }
    }

    .collapse-title {
      font-size: 13px;
      color: #606266;
    }

    .component-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 6px;
      padding: 4px 0;

      .component-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 10px 4px;
        background: #fff;
        border: 1px solid #e4e7ed;
        border-radius: 4px;
        cursor: move;
        transition: all 0.2s;
        min-height: 64px;
        position: relative;

        &:hover {
          background: #ecf5ff;
          border-color: #409eff;
          transform: translateY(-1px);

          .tooltip {
            opacity: 1;
            visibility: visible;
          }
        }

        .el-icon {
          font-size: 18px;
          color: #409eff;
          margin-bottom: 4px;
        }

        .component-name {
          font-size: 11px;
          color: #606266;
          text-align: center;
          line-height: 1.2;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 100%;
        }

        .tooltip {
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          padding: 4px 8px;
          background: #303133;
          color: #fff;
          font-size: 11px;
          border-radius: 4px;
          white-space: nowrap;
          opacity: 0;
          visibility: hidden;
          transition: all 0.2s;
          z-index: 10;
          pointer-events: none;

          &::after {
            content: '';
            position: absolute;
            top: 100%;
            left: 50%;
            transform: translateX(-50%);
            border: 4px solid transparent;
            border-top-color: #303133;
          }
        }
      }
    }
  }
}
</style>