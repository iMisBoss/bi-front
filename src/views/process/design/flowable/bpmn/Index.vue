<template>
  <div class="bpmn-designer">
    <div class="page-header">
      <h2>BPMN 流程设计器</h2>
      <p class="subtitle">可视化设计审批流程，拖拽节点快速搭建流程图</p>
    </div>

    <div class="designer-container">
      <!-- 左侧节点面板 -->
      <div class="node-panel">
        <h3 class="panel-title">节点库</h3>

        <div class="node-group">
          <div class="group-title">事件节点</div>
          <div class="node-list">
            <div class="node-item" draggable="true" @dragstart="handleDragStart($event, 'start')">
              <el-icon class="node-icon"><VideoPlay /></el-icon>
              <span>开始事件</span>
            </div>
            <div class="node-item" draggable="true" @dragstart="handleDragStart($event, 'end')">
              <el-icon class="node-icon"><VideoPause /></el-icon>
              <span>结束事件</span>
            </div>
          </div>
        </div>

        <div class="node-group">
          <div class="group-title">任务节点</div>
          <div class="node-list">
            <div class="node-item" draggable="true" @dragstart="handleDragStart($event, 'user_task')">
              <el-icon class="node-icon"><User /></el-icon>
              <span>用户任务</span>
            </div>
            <div class="node-item" draggable="true" @dragstart="handleDragStart($event, 'service_task')">
              <el-icon class="node-icon"><Setting /></el-icon>
              <span>服务任务</span>
            </div>
            <div class="node-item" draggable="true" @dragstart="handleDragStart($event, 'mail_task')">
              <el-icon class="node-icon"><Message /></el-icon>
              <span>邮件任务</span>
            </div>
          </div>
        </div>

        <div class="node-group">
          <div class="group-title">网关</div>
          <div class="node-list">
            <div class="node-item" draggable="true" @dragstart="handleDragStart($event, 'exclusive_gateway')">
              <el-icon class="node-icon"><Connection /></el-icon>
              <span>排他网关</span>
            </div>
            <div class="node-item" draggable="true" @dragstart="handleDragStart($event, 'parallel_gateway')">
              <el-icon class="node-icon"><Share /></el-icon>
              <span>并行网关</span>
            </div>
            <div class="node-item" draggable="true" @dragstart="handleDragStart($event, 'inclusive_gateway')">
              <el-icon class="node-icon"><Operation /></el-icon>
              <span>包容网关</span>
            </div>
          </div>
        </div>

        <div class="node-group">
          <div class="group-title">子流程</div>
          <div class="node-list">
            <div class="node-item" draggable="true" @dragstart="handleDragStart($event, 'subprocess')">
              <el-icon class="node-icon"><Menu /></el-icon>
              <span>子流程</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 中间画布 -->
      <div class="canvas-area">
        <div class="canvas-toolbar">
          <div class="toolbar-left">
            <el-button size="small" icon="ZoomIn" @click="handleZoomIn">放大</el-button>
            <el-button size="small" icon="ZoomOut" @click="handleZoomOut">缩小</el-button>
            <el-button size="small" icon="RefreshLeft" @click="handleResetZoom">重置</el-button>
          </div>
          <div class="toolbar-right">
            <el-button size="small" icon="View" @click="handlePreview">预览</el-button>
            <el-button size="small" icon="Check" type="primary" @click="handleSave">保存流程</el-button>
          </div>
        </div>

        <div
            class="canvas"
            @drop="handleDrop"
            @dragover.prevent
            @dragenter.prevent
        >
          <div class="canvas-content" :style="{ transform: `scale(${zoom})` }">
            <template v-for="node in flowNodes" :key="node.id">
              <div
                  class="flow-node"
                  :class="[`node-${node.type}`, { active: activeNode?.id === node.id }]"
                  :style="{ left: node.x + 'px', top: node.y + 'px' }"
                  @click="handleSelectNode(node)"
              >
                <div class="node-shape">
                  <el-icon v-if="node.type === 'start'" class="shape-icon"><VideoPlay /></el-icon>
                  <el-icon v-else-if="node.type === 'end'" class="shape-icon"><VideoPause /></el-icon>
                  <el-icon v-else-if="['user_task', 'service_task', 'mail_task'].includes(node.type)" class="shape-icon">
                    <User v-if="node.type === 'user_task'" />
                    <Setting v-else-if="node.type === 'service_task'" />
                    <Message v-else />
                  </el-icon>
                  <el-icon v-else class="shape-icon"><Connection /></el-icon>
                </div>
                <div class="node-label">{{ node.name }}</div>
                <div class="node-delete" @click.stop="handleDeleteNode(node)">
                  <el-icon><Close /></el-icon>
                </div>
              </div>
            </template>

            <!-- 连接线 -->
            <svg class="connections" width="100%" height="100%">
              <template v-for="conn in connections" :key="conn.id">
                <line
                    :x1="conn.sourceX"
                    :y1="conn.sourceY"
                    :x2="conn.targetX"
                    :y2="conn.targetY"
                    stroke="#409eff"
                    stroke-width="2"
                    marker-end="url(#arrowhead)"
                />
              </template>
              <defs>
                <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="#409eff" />
                </marker>
              </defs>
            </svg>
          </div>
        </div>
      </div>

      <!-- 右侧属性面板 -->
      <div class="property-panel">
        <h3 class="panel-title">节点属性</h3>

        <div v-if="activeNode" class="property-content">
          <el-form :model="activeNode" label-width="80px">
            <el-form-item label="节点名称">
              <el-input v-model="activeNode.name" />
            </el-form-item>

            <el-form-item label="节点ID">
              <el-input v-model="activeNode.id" disabled />
            </el-form-item>

            <el-form-item label="节点类型">
              <el-tag>{{ getNodeTypeText(activeNode.type) }}</el-tag>
            </el-form-item>

            <el-form-item v-if="activeNode.type === 'user_task'" label="审批人">
              <el-select v-model="activeNode.assignee" placeholder="选择审批人" style="width: 100%">
                <el-option label="部门经理" value="dept_manager" />
                <el-option label="总经理" value="general_manager" />
                <el-option label="HR经理" value="hr_manager" />
              </el-select>
            </el-form-item>

            <el-form-item v-if="activeNode.type === 'user_task'" label="审批方式">
              <el-select v-model="activeNode.approvalType" style="width: 100%">
                <el-option label="单人审批" value="single" />
                <el-option label="会签" value="countersign" />
                <el-option label="或签" value="orsign" />
              </el-select>
            </el-form-item>

            <el-form-item label="完成条件">
              <el-input v-model="activeNode.condition" placeholder="条件表达式" />
            </el-form-item>

            <el-form-item label="节点说明">
              <el-input
                  v-model="activeNode.description"
                  type="textarea"
                  :rows="3"
              />
            </el-form-item>
          </el-form>
        </div>

        <el-empty v-else description="选择节点以编辑属性" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import {
  VideoPlay, VideoPause, User, Setting, Message, Connection, Share, Operation, Menu,
  ZoomIn, ZoomOut, RefreshLeft, View, Check, Close
} from '@element-plus/icons-vue'

const flowNodes = ref([])
const connections = ref([])
const activeNode = ref(null)
const zoom = ref(1)
const nodeIdCounter = ref(0)

const nodeTypes = {
  start: '开始事件',
  end: '结束事件',
  user_task: '用户任务',
  service_task: '服务任务',
  mail_task: '邮件任务',
  exclusive_gateway: '排他网关',
  parallel_gateway: '并行网关',
  inclusive_gateway: '包容网关',
  subprocess: '子流程'
}

const handleDragStart = (event, type) => {
  event.dataTransfer.setData('nodeType', type)
}

const handleDrop = (event) => {
  const nodeType = event.dataTransfer.getData('nodeType')
  if (!nodeType) return

  const rect = event.currentTarget.getBoundingClientRect()
  const x = event.clientX - rect.left - 50
  const y = event.clientY - rect.top - 25

  nodeIdCounter.value++
  const newNode = {
    id: `node_${nodeIdCounter.value}`,
    type: nodeType,
    name: nodeTypes[nodeType],
    x: x / zoom.value,
    y: y / zoom.value,
    assignee: '',
    approvalType: 'single',
    condition: '',
    description: ''
  }

  flowNodes.value.push(newNode)
  activeNode.value = newNode
  ElMessage.success(`已添加${nodeTypes[nodeType]}节点`)
}

const handleSelectNode = (node) => {
  activeNode.value = node
}

const handleDeleteNode = (node) => {
  flowNodes.value = flowNodes.value.filter(n => n.id !== node.id)
  connections.value = connections.value.filter(c =>
      c.source !== node.id && c.target !== node.id
  )
  if (activeNode.value?.id === node.id) {
    activeNode.value = null
  }
  ElMessage.success('节点已删除')
}

const handleZoomIn = () => {
  zoom.value = Math.min(zoom.value + 0.1, 2)
}

const handleZoomOut = () => {
  zoom.value = Math.max(zoom.value - 0.1, 0.5)
}

const handleResetZoom = () => {
  zoom.value = 1
}

const handlePreview = () => {
  ElMessage.info('预览功能开发中...')
}

const handleSave = () => {
  ElMessage.success('流程保存成功')
}

const getNodeTypeText = (type) => {
  return nodeTypes[type] || type
}
</script>

<style scoped lang="scss">
.bpmn-designer {
  padding: 20px;

  .page-header {
    margin-bottom: 24px;

    h2 {
      margin: 0 0 8px;
      font-size: 20px;
    }

    .subtitle {
      margin: 0;
      font-size: 14px;
      color: #909399;
    }
  }

  .designer-container {
    display: flex;
    gap: 16px;
    height: calc(100vh - 200px);
  }

  .node-panel,
  .property-panel {
    width: 280px;
    background: #fff;
    border-radius: 8px;
    padding: 16px;
    overflow-y: auto;

    .panel-title {
      margin: 0 0 16px;
      font-size: 16px;
    }
  }

  .node-group {
    margin-bottom: 16px;

    .group-title {
      font-size: 13px;
      color: #909399;
      margin-bottom: 8px;
    }

    .node-list {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;
    }

    .node-item {
      padding: 12px;
      background: #f5f7fa;
      border-radius: 4px;
      cursor: grab;
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;

      &:hover {
        background: #e4e7ed;
      }

      .node-icon {
        font-size: 16px;
      }
    }
  }

  .canvas-area {
    flex: 1;
    background: #fff;
    border-radius: 8px;
    display: flex;
    flex-direction: column;

    .canvas-toolbar {
      padding: 12px;
      border-bottom: 1px solid #ebeef5;
      display: flex;
      justify-content: space-between;

      .toolbar-left,
      .toolbar-right {
        display: flex;
        gap: 12px;
      }
    }

    .canvas {
      flex: 1;
      overflow: auto;
      background: #f5f7fa;
      position: relative;
    }

    .canvas-content {
      position: relative;
      width: 2000px;
      height: 2000px;
      transform-origin: 0 0;
    }
  }

  .flow-node {
    position: absolute;
    cursor: pointer;

    &.active {
      .node-shape {
        border-color: #409eff;
        box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.3);
      }
    }

    .node-shape {
      width: 100px;
      height: 50px;
      background: #fff;
      border: 2px solid #dcdfe6;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;

      .shape-icon {
        font-size: 24px;
        color: #409eff;
      }
    }

    &.node-start .node-shape,
    &.node-end .node-shape {
      border-radius: 25px;
      width: 50px;
      height: 50px;
    }

    .node-label {
      text-align: center;
      font-size: 12px;
      margin-top: 4px;
      white-space: nowrap;
    }

    .node-delete {
      position: absolute;
      top: -10px;
      right: -10px;
      width: 20px;
      height: 20px;
      background: #f56c6c;
      color: #fff;
      border-radius: 50%;
      display: none;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 12px;
    }

    &:hover .node-delete {
      display: flex;
    }
  }

  .connections {
    position: absolute;
    top: 0;
    left: 0;
    pointer-events: none;
  }

  .property-content {
    :deep(.el-form-item) {
      margin-bottom: 16px;
    }
  }
}
</style>
