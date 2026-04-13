<template>
  <div class="canvas-area" @drop="handleDrop" @dragover="handleDragOver" @dragenter="handleDragEnter" @dragleave="handleDragLeave">
    <!-- 画布工具栏 -->
    <div class="canvas-toolbar">
      <div class="toolbar-left">
        <el-button-group>
          <el-button size="small" @click="handleZoomIn">
            <el-icon><ZoomIn /></el-icon>
            {{ Math.round(zoom * 100) }}%
          </el-button>
          <el-button size="small" @click="handleZoomOut">
            <el-icon><ZoomOut /></el-icon>
          </el-button>
        </el-button-group>
        <el-button size="small" @click="handleResetZoom">
          <el-icon><RefreshLeft /></el-icon>
          重置
        </el-button>
        <el-divider direction="vertical" />

        <!-- 撤销、重做按钮（移到这里） -->
        <el-button-group>
          <el-tooltip content="撤销 (Ctrl+Z)" placement="top">
            <el-button size="small" @click="$emit('undo')">
              <el-icon><RefreshLeft /></el-icon>
            </el-button>
          </el-tooltip>
          <el-tooltip content="重做 (Ctrl+Y)" placement="top">
            <el-button size="small" @click="$emit('redo')">
              <el-icon><Right /></el-icon>
            </el-button>
          </el-tooltip>
        </el-button-group>

        <el-divider direction="vertical" />
        <el-switch
            v-model="gridVisible"
            active-text="网格"
            size="small"
        />
      </div>
      <div class="toolbar-right">
        <span class="node-count">共 {{ nodeCount }} 个节点</span>
      </div>
    </div>

    <!-- bpmn-js 画布容器 -->
    <div ref="canvasRef" class="bpmn-canvas" :class="{ 'drag-over': isDragOver }"></div>
  </div>
</template>

<script setup>import { ref, onMounted, onBeforeUnmount } from 'vue'
import BpmnModeler from 'bpmn-js/lib/Modeler'
import { ZoomIn, ZoomOut, RefreshLeft, Right } from '@element-plus/icons-vue'
import CustomTranslateModule from './customTranslate'

import 'bpmn-js/dist/assets/diagram-js.css'
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css'
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-codes.css'

const props = defineProps({
  nodes: { type: Array, required: true },
  connections: { type: Array, required: true },
  zoom: { type: Number, default: 1 },
  gridVisible: { type: Boolean, default: true },
  activeNode: { type: Object, default: null },
  activeConnection: { type: Object, default: null }
})

const emit = defineEmits([
  'drop', 'node-select', 'node-delete', 'connection-select',
  'canvas-click', 'zoom-change', 'grid-toggle', 'node-move',
  'modeler-ready', 'node-added', 'undo', 'redo'
])

const canvasRef = ref(null)
const gridVisible = ref(props.gridVisible)
let bpmnModeler = null
let nodeCount = ref(0)
let isDragOver = ref(false)

const nodeTypeMap = {
  start: 'bpmn:StartEvent',
  end: 'bpmn:EndEvent',
  approval: 'bpmn:UserTask',
  cc: 'bpmn:ServiceTask',
  notify: 'bpmn:ServiceTask',
  subprocess: 'bpmn:SubProcess',
  condition: 'bpmn:ExclusiveGateway',
  parallel: 'bpmn:ParallelGateway',
  timer: 'bpmn:IntermediateCatchEvent'
}

// BPMN 类型转内部类型（用于选中节点时）
const bpmnToInternalType = {
  'bpmn:StartEvent': 'start',
  'bpmn:EndEvent': 'end',
  'bpmn:UserTask': 'approval',
  'bpmn:ServiceTask': 'cc',
  'bpmn:SubProcess': 'subprocess',
  'bpmn:ExclusiveGateway': 'condition',
  'bpmn:ParallelGateway': 'parallel',
  'bpmn:IntermediateCatchEvent': 'timer',
  'bpmn:SequenceFlow': 'sequenceflow'
}

const nodeDefaultNames = {
  start: '开始',
  end: '结束',
  approval: '审批',
  cc: '抄送',
  notify: '通知',
  subprocess: '子流程',
  condition: '条件分支',
  parallel: '并行审批',
  timer: '定时事件'
}

const initBpmn = async () => {
  if (!canvasRef.value) return

  try {
    bpmnModeler = new BpmnModeler({
      container: canvasRef.value,
      additionalModules: [
        CustomTranslateModule
      ]
    })

    const emptyXml = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
                  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
                  xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
                  xmlns:di="http://www.omg.org/spec/DD/20100524/DI"
                  id="Definitions_1"
                  targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_1" isExecutable="true">
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`

    await bpmnModeler.importXML(emptyXml)

    const canvas = bpmnModeler.get('canvas')
    canvas.zoom(0.8, 'auto')

    bindEvents()
    updateNodeCount()
    emit('modeler-ready', bpmnModeler)

    console.log('bpmn-js 初始化成功（空白画布）')
  } catch (err) {
    console.error('bpmn-js 初始化失败:', err)
  }
}

const bindEvents = () => {
  const eventBus = bpmnModeler.get('eventBus')
  const selection = bpmnModeler.get('selection')

  // 节点和连线点击事件
  eventBus.on('element.click', (event) => {
    const { element } = event

    if (element.type === 'bpmn:Process' || element.type === 'bpmn:Definitions') {
      return
    }

    // 连线（有 waypoints 的是连线）
    if (element.waypoints) {
      const connData = {
        id: element.id,
        type: 'sequenceflow',
        name: element.businessObject.name || element.id,
        source: element.source?.id,
        target: element.target?.id,
        businessObject: element.businessObject
      }

      emit('connection-select', connData)
      return
    }

    // 节点（使用映射转换类型）
    const internalType = bpmnToInternalType[element.type] || element.type.replace('bpmn:', '').toLowerCase()
    const nodeData = {
      id: element.id,
      type: internalType,
      name: element.businessObject.name || element.id,
      businessObject: element.businessObject
    }

    emit('node-select', nodeData)
  })

  // 点击画布空白区域
  eventBus.on('canvas.click', () => {
    // 清空选中状态
    selection.select(null)
    emit('canvas-click')
  })

  // 节点移动
  eventBus.on('element.changed', (event) => {
    const { element } = event
    if (element.waypoints) return

    emit('node-move', element.id, {
      x: element.x,
      y: element.y
    })
  })

  // 节点创建（只触发一次，避免重复）
  eventBus.on('commandStack.shape.create.postExecute', (event) => {
    const { context } = event
    if (context && context.shape) {
      const shape = context.shape
      const nodeData = {
        id: shape.id,
        type: shape.type.replace('bpmn:', '').toLowerCase(),
        name: shape.businessObject.name || shape.id,
        businessObject: shape.businessObject
      }
      emit('node-added', nodeData)
    }
  })

  // 节点删除
  eventBus.on('commandStack.shape.delete.postExecute', () => {
    updateNodeCount()
  })

  // 任何命令变化
  eventBus.on('commandStack.changed', () => {
    updateNodeCount()
  })
}

const updateNodeCount = () => {
  if (!bpmnModeler) return

  const elementRegistry = bpmnModeler.get('elementRegistry')
  const elements = elementRegistry.filter(element => {
    return element.type.startsWith('bpmn:') &&
        element.type !== 'bpmn:Process' &&
        element.type !== 'bpmn:Definitions' &&
        !element.waypoints
  })
  nodeCount.value = elements.length
}

const handleZoomIn = () => {
  if (!bpmnModeler) return
  const canvas = bpmnModeler.get('canvas')
  const newZoom = Math.min(canvas.zoom() + 0.1, 2)
  canvas.zoom(newZoom)
  emit('zoom-change', newZoom)
}

const handleZoomOut = () => {
  if (!bpmnModeler) return
  const canvas = bpmnModeler.get('canvas')
  const newZoom = Math.max(canvas.zoom() - 0.1, 0.5)
  canvas.zoom(newZoom)
  emit('zoom-change', newZoom)
}

const handleResetZoom = () => {
  if (!bpmnModeler) return
  const canvas = bpmnModeler.get('canvas')
  canvas.zoom(0.8, 'auto')
  emit('zoom-change', 0.8)
}

const handleDragOver = (event) => {
  event.preventDefault()
  event.dataTransfer.dropEffect = 'copy'
}

const handleDragEnter = (event) => {
  event.preventDefault()
  isDragOver.value = true
}

const handleDragLeave = (event) => {
  if (!canvasRef.value.contains(event.relatedTarget)) {
    isDragOver.value = false
  }
}

const handleDrop = async (event) => {
  event.preventDefault()
  isDragOver.value = false

  if (!bpmnModeler) return

  const nodeType = event.dataTransfer.getData('nodeType')
  if (!nodeType) return

  try {
    const rect = canvasRef.value.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    const canvas = bpmnModeler.get('canvas')
    const point = canvas.viewbox()
    const canvasX = (x / point.scale) - point.x
    const canvasY = (y / point.scale) - point.y

    const bpmnType = nodeTypeMap[nodeType]
    const nodeName = nodeDefaultNames[nodeType] || nodeType

    if (bpmnType) {
      const modeling = bpmnModeler.get('modeling')
      const elementFactory = bpmnModeler.get('elementFactory')

      const shape = elementFactory.createShape({
        type: bpmnType
      })

      if (shape.businessObject) {
        shape.businessObject.name = nodeName
      }

      modeling.createShape(shape, { x: canvasX, y: canvasY }, canvas.getRootElement())

      const selection = bpmnModeler.get('selection')
      selection.select(shape)

      updateNodeCount()

      const nodeData = {
        id: shape.id,
        type: nodeType,
        name: nodeName,
        businessObject: shape.businessObject
      }
      emit('node-select', nodeData)
    }
  } catch (err) {
    console.error('创建节点失败:', err)
  }
}

const loadFromXml = async (xml) => {
  if (!bpmnModeler || !xml) return
  try {
    await bpmnModeler.importXML(xml)
    const canvas = bpmnModeler.get('canvas')
    canvas.zoom('fit-viewport', 'auto')
    updateNodeCount()
  } catch (err) {
    console.error('加载 BPMN XML 失败:', err)
  }
}

const saveToXml = async () => {
  if (!bpmnModeler) return ''
  try {
    const { xml } = await bpmnModeler.saveXML({ format: true })
    return xml
  } catch (err) {
    console.error('保存 BPMN XML 失败:', err)
    return ''
  }
}

const getModeler = () => bpmnModeler

onMounted(() => {
  initBpmn()
})

onBeforeUnmount(() => {
  if (bpmnModeler) {
    bpmnModeler.destroy()
    bpmnModeler = null
  }
})

defineExpose({
  loadFromXml,
  saveToXml,
  getModeler
})
</script>

<style scoped lang="scss">
.canvas-area {
  flex: 1;
  background: #fff;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .canvas-toolbar {
    padding: 10px 16px;
    border-bottom: 1px solid #e4e7ed;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #fff;
    z-index: 10;

    .toolbar-left, .toolbar-right {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .node-count {
      font-size: 13px;
      color: #909399;
    }
  }

  .bpmn-canvas {
    flex: 1;
    position: relative;
    overflow: hidden;
    background-color: #fafafa;
    transition: background-color 0.3s;

    &.drag-over {
      background-color: #ecf5ff;
    }

    :deep(.djs-container) {
      height: 100% !important;
      background-color: #fafafa;
    }

    :deep(.djs-palette) {
      display: none;
    }

    :deep(.djs-properties-panel) {
      display: none;
    }

    :deep(.bjs-powered-by) {
      display: none !important;
    }
  }
}
</style>
