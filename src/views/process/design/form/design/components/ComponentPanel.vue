<template>
  <div class="component-panel" :class="{ 'is-collapsed': collapsed }" :style="{ width: collapsed ? '50px' : width + 'px' }">
    <div class="panel-header">
      <h3 class="panel-title">组件库</h3>
      <div class="panel-toggle-btn" @click="$emit('toggle')" :title="collapsed ? '展开' : '收起'">
        <el-icon>
          <DArrowLeft v-if="!collapsed" />
          <DArrowRight v-else />
        </el-icon>
      </div>
    </div>
    <div class="panel-content" v-show="!collapsed">
      <el-tabs v-model="activeTab" class="component-tabs">
        <!-- Tab1：基础组件 -->
        <el-tab-pane label="基础组件" name="basic">
          <div class="component-list">
            <div
                v-for="comp in basicComponents"
                :key="comp.type"
                class="component-item"
                draggable="true"
                @dragstart="handleDragStart($event, comp)"
            >
              <el-icon><component :is="comp.icon" /></el-icon>
              <span>{{ comp.label }}</span>
            </div>
          </div>
        </el-tab-pane>

        <!-- Tab2：业务组件 -->
        <el-tab-pane label="业务组件" name="business">
          <div class="component-list">
            <div
                v-for="comp in businessComponents"
                :key="comp.type"
                class="component-item"
                draggable="true"
                @dragstart="handleDragStart($event, comp)"
            >
              <el-icon><component :is="comp.icon" /></el-icon>
              <span>{{ comp.label }}</span>
            </div>
          </div>
        </el-tab-pane>

        <!-- Tab3：系统变量 -->
        <el-tab-pane label="系统变量" name="system">
          <div class="component-list">
            <el-tooltip
                v-for="comp in systemComponents"
                :key="comp.type"
                :content="comp.tip"
                placement="top"
            >
              <div
                  class="component-item system-variable"
                  @click="handleInsertSystemVariable(comp)"
              >
                <el-icon><component :is="comp.icon" /></el-icon>
                <span>{{ comp.label }}</span>
                <el-tag size="small" type="info">只读</el-tag>
              </div>
            </el-tooltip>
          </div>
        </el-tab-pane>

        <!-- Tab4：布局容器 -->
        <el-tab-pane label="布局容器" name="layout">
          <div class="component-list">
            <div
                v-for="comp in layoutComponents"
                :key="comp.type"
                class="component-item"
                draggable="true"
                @dragstart="handleDragStart($event, comp)"
            >
              <el-icon><component :is="comp.icon" /></el-icon>
              <span>{{ comp.label }}</span>
            </div>
          </div>
        </el-tab-pane>

        <!-- Tab5：明细表格 -->
        <el-tab-pane label="明细表格" name="detail">
          <div class="component-list">
            <el-tooltip
                v-for="comp in detailComponents"
                :key="comp.type"
                :content="comp.tip"
                placement="top"
            >
              <div
                  class="component-item"
                  draggable="true"
                  @dragstart="handleDragStart($event, comp)"
              >
                <el-icon><component :is="comp.icon" /></el-icon>
                <span>{{ comp.label }}</span>
              </div>
            </el-tooltip>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import {
  Edit, Document, Coin, Calendar, CircleCheck, Check,
  Upload, Picture, Location, User, OfficeBuilding,
  Files, Box, Grid, Notebook, DArrowLeft, DArrowRight
} from '@element-plus/icons-vue'

const props = defineProps({
  collapsed: {
    type: Boolean,
    default: false
  },
  width: {
    type: Number,
    default: 280
  }
})

const emit = defineEmits(['toggle', 'insert-system', 'drag-start'])

const activeTab = ref('basic')

const basicComponents = ref([
  { type: 'input', label: '单行文本', icon: Edit },
  { type: 'textarea', label: '多行文本', icon: Document },
  { type: 'number', label: '数字输入', icon: Coin },
  { type: 'select', label: '下拉选择', icon: CircleCheck },
  { type: 'radio', label: '单选框组', icon: Check },
  { type: 'checkbox', label: '复选框组', icon: Check },
  { type: 'date', label: '日期选择', icon: Calendar },
  { type: 'dateRange', label: '日期范围', icon: Calendar },
  { type: 'switch', label: '开关组件', icon: CircleCheck }
])

const businessComponents = ref([
  { type: 'money', label: '金额输入', icon: Coin },
  { type: 'upload', label: '附件上传', icon: Upload },
  { type: 'image', label: '图片上传', icon: Picture },
  { type: 'signature', label: '签名控件', icon: Edit },
  { type: 'address', label: '地址选择', icon: Location },
  { type: 'userSelect', label: '人员选择器', icon: User },
  { type: 'deptSelect', label: '部门选择器', icon: OfficeBuilding },
  { type: 'orgSelect', label: '组织架构选择', icon: OfficeBuilding }
])

const systemComponents = ref([
  { type: 'sysUser', label: '申请人', icon: User, sys: true, tip: '点击插入，自动获取当前用户，只读' },
  { type: 'sysDept', label: '申请部门', icon: OfficeBuilding, sys: true, tip: '点击插入，自动获取所属部门，只读' },
  { type: 'sysPosition', label: '申请人职级', icon: User, sys: true, tip: '点击插入，自动获取当前用户职级，只读' },
  { type: 'sysLeader', label: '直属领导', icon: User, sys: true, tip: '点击插入，自动获取直属领导，只读' },
  { type: 'sysTime', label: '申请时间', icon: Calendar, sys: true, tip: '点击插入，自动获取当前时间，只读' },
  { type: 'sysFlowNo', label: '流程编号', icon: Document, sys: true, tip: '点击插入，自动生成流程编号，只读' }
])

const layoutComponents = ref([
  { type: 'grid', label: '栅格行容器', icon: Grid },
  { type: 'group', label: '分组容器', icon: Files },
  { type: 'card', label: '卡片容器', icon: Files },
  { type: 'divider', label: '分割线', icon: Document },
  { type: 'title', label: '标题栏', icon: Document },
  { type: 'blank', label: '空白占位', icon: Box }
])

const detailComponents = ref([
  { type: 'expenseDetail', label: '费用明细表', icon: Notebook, tip: '拖拽添加，支持多行填报' },
  { type: 'purchaseDetail', label: '采购清单表', icon: Notebook, tip: '拖拽添加，支持多行填报' },
  { type: 'tripDetail', label: '行程明细表', icon: Notebook, tip: '拖拽添加，支持多行填报' },
  { type: 'customDetail', label: '自定义明细表', icon: Notebook, tip: '拖拽后可自由配置列字段' }
])

const handleDragStart = (event, comp) => {
  emit('drag-start', event, comp)
}

const handleInsertSystemVariable = (comp) => {
  emit('insert-system', comp)
}
</script>

<style scoped lang="scss">
.component-panel {
  background: #fff;
  border-right: 1px solid #e8e8e8;
  display: flex;
  flex-direction: column;
  height: 100%;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.05);

  &.is-collapsed {
    .panel-header {
      padding: 12px 8px;
      justify-content: center;

      .panel-title {
        display: none;
      }
    }

    .panel-content {
      display: none;
    }
  }

  .panel-header {
    padding: 12px 16px;
    border-bottom: 1px solid #e8e8e8;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;

    .panel-title {
      margin: 0;
      font-size: 15px;
      font-weight: 600;
    }

    .panel-toggle-btn {
      width: 24px;
      height: 24px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.2s;

      &:hover {
        background: rgba(255, 255, 255, 0.3);
      }
    }
  }

  .panel-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .component-tabs {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    :deep(.el-tabs__header) {
      margin: 0;
      padding: 0 12px;
      border-bottom: 1px solid #e8e8e8;
    }

    :deep(.el-tabs__content) {
      flex: 1;
      overflow-y: auto;
      padding: 12px;
    }
  }

  .component-list {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;

    .component-item {
      padding: 10px 8px;
      background: #f8f9fa;
      border-radius: 6px;
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      cursor: grab;
      transition: all 0.2s;
      user-select: none;
      border: 1px solid transparent;

      &:hover {
        background: #e8f4ff;
        color: #409eff;
        transform: translateY(-2px);
        box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
        border-color: #409eff;
      }

      &:active {
        cursor: grabbing;
      }

      &.disabled {
        opacity: 0.5;
        cursor: not-allowed;

        &:hover {
          background: #f8f9fa;
          color: inherit;
          transform: none;
          box-shadow: none;
          border-color: transparent;
        }
      }

      &.system-variable {
        cursor: pointer;

        &:hover {
          background: #e8f4ff;
          color: #409eff;
          transform: translateY(-2px);
          box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
          border-color: #409eff;
        }

        &:active {
          cursor: pointer;
          transform: scale(0.98);
        }
      }
    }
  }
}
</style>
