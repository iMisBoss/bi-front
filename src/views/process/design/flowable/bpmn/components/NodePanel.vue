<template>
  <div class="node-panel" :class="{ 'collapsed': collapsed }">
    <!-- 折叠状态：只显示图标 -->
    <div v-if="collapsed" class="panel-header collapsed-header">
      <el-tooltip content="展开节点库" placement="right">
        <span class="collapsed-icon">📦</span>
      </el-tooltip>
    </div>

    <!-- 展开状态：完整显示 -->
    <div v-else>
      <div class="panel-header">
        <span>流程组件库</span>
      </div>

      <el-collapse v-model="activeGroups" accordion>
        <!-- 常用节点 -->
        <el-collapse-item name="common">
          <template #title>
            <span class="group-title">常用节点</span>
          </template>
          <div class="node-list">
            <div
                v-for="node in commonNodes"
                :key="node.type"
                class="node-item"
                draggable="true"
                @dragstart="handleDragStart($event, node.type)"
            >
              <el-icon class="node-icon" :class="node.iconClass">
                <component :is="node.icon" />
              </el-icon>
              <span class="node-name">{{ node.name }}</span>
              <el-tooltip :content="node.description" placement="right">
                <el-icon class="node-tip"><InfoFilled /></el-icon>
              </el-tooltip>
            </div>
          </div>
        </el-collapse-item>

        <!-- 分支网关 -->
        <el-collapse-item name="gateway">
          <template #title>
            <span class="group-title">分支网关</span>
          </template>
          <div class="node-list">
            <div
                v-for="node in gatewayNodes"
                :key="node.type"
                class="node-item"
                draggable="true"
                @dragstart="handleDragStart($event, node.type)"
            >
              <el-icon class="node-icon" :class="node.iconClass">
                <component :is="node.icon" />
              </el-icon>
              <span class="node-name">{{ node.name }}</span>
              <el-tooltip :content="node.description" placement="right">
                <el-icon class="node-tip"><InfoFilled /></el-icon>
              </el-tooltip>
            </div>
          </div>
        </el-collapse-item>

        <!-- 事件节点 -->
        <el-collapse-item name="event">
          <template #title>
            <span class="group-title">事件节点</span>
          </template>
          <div class="node-list">
            <div
                v-for="node in eventNodes"
                :key="node.type"
                class="node-item"
                draggable="true"
                @dragstart="handleDragStart($event, node.type)"
            >
              <el-icon class="node-icon" :class="node.iconClass">
                <component :is="node.icon" />
              </el-icon>
              <span class="node-name">{{ node.name }}</span>
              <el-tooltip :content="node.description" placement="right">
                <el-icon class="node-tip"><InfoFilled /></el-icon>
              </el-tooltip>
            </div>
          </div>
        </el-collapse-item>
      </el-collapse>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import {
  VideoPlay, VideoPause, User, Bell, Message, Menu,
  Share, Grid, Connection, Clock, ChatDotRound, InfoFilled
} from '@element-plus/icons-vue'

const props = defineProps({
  collapsed: { type: Boolean, default: false },
  width: { type: Number, default: 260 }
})

const emit = defineEmits(['node-drag-start'])

const activeGroups = ref(['common'])

const commonNodes = [
  {
    type: 'start',
    name: '开始节点',
    icon: VideoPlay,
    iconClass: 'icon-green',
    description: '流程入口，每个流程只能有一个开始节点'
  },
  {
    type: 'end',
    name: '结束节点',
    icon: VideoPause,
    iconClass: 'icon-red',
    description: '流程出口，可以有多个结束节点'
  },
  {
    type: 'approval',
    name: '审批节点',
    icon: User,
    iconClass: 'icon-blue',
    description: '核心审批节点，可配置审批人、审批方式、驳回规则'
  },
  {
    type: 'cc',
    name: '抄送节点',
    icon: Bell,
    iconClass: 'icon-orange',
    description: '流程流转时抄送相关人员，不参与审批'
  },
  {
    type: 'notify',
    name: '通知节点',
    icon: Message,
    iconClass: 'icon-purple',
    description: '自动发送消息、邮件或短信通知'
  },
  {
    type: 'subprocess',
    name: '子流程',
    icon: Menu,
    iconClass: 'icon-gray',
    description: '嵌套子流程，简化复杂流程结构'
  }
]

const gatewayNodes = [
  {
    type: 'condition',
    name: '条件分支',
    icon: Connection,
    iconClass: 'icon-blue',
    description: '按条件分流，满足条件走对应分支'
  },
  {
    type: 'parallel',
    name: '并行审批',
    icon: Grid,
    iconClass: 'icon-green',
    description: '多个节点同时审批，全部通过后流转'
  }
]

const eventNodes = [
  {
    type: 'timer',
    name: '定时事件',
    icon: Clock,
    iconClass: 'icon-orange',
    description: '定时触发动作，如超时自动审批'
  }
]

const handleDragStart = (event, nodeType) => {
  const canDrag = emit('node-drag-start', nodeType)
  if (canDrag === false) {
    event.preventDefault()
    return
  }
  event.dataTransfer.setData('nodeType', nodeType)
}
</script>

<style scoped lang="scss">
.node-panel {
  height: 100%;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  &.collapsed {
    width: 50px;

    .collapsed-header {
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      border-bottom: none;

      .collapsed-icon {
        font-size: 24px;
        cursor: pointer;
      }
    }
  }

  .panel-header {
    padding: 10px 12px;
    border-bottom: 1px solid #e4e7ed;
    font-weight: 600;
    color: #303133;
    font-size: 14px;
  }

  :deep(.el-collapse) {
    border: none;

    .el-collapse-item__header {
      padding: 8px 12px;
      background: #fafafa;
      border-bottom: 1px solid #e4e7ed;
      height: auto;
      line-height: normal;

      .group-title {
        font-size: 13px;
        font-weight: 500;
        color: #303133;
      }
    }
  }

  .node-list {
    padding: 8px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .node-list {
    padding: 6px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .node-item {
    padding: 8px 10px;
    background: #f5f7fa;
    border-radius: 4px;
    cursor: grab;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.2s;
    border: 1px solid transparent;

    &:hover {
      background: #ecf5ff;
      border-color: #409eff;
    }

    &:active {
      cursor: grabbing;
    }

    .node-icon {
      font-size: 18px;
      flex-shrink: 0;

      &.icon-green { color: #67c23a; }
      &.icon-red { color: #f56c6c; }
      &.icon-blue { color: #409eff; }
      &.icon-orange { color: #e6a23c; }
      &.icon-purple { color: #909399; }
      &.icon-gray { color: #c0c4cc; }
    }

    .node-name {
      flex: 1;
      font-size: 13px;
      color: #303133;
    }

    .node-tip {
      font-size: 13px;
      color: #909399;
      cursor: help;
    }
  }
}
</style>

