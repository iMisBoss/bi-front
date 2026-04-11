<template>
  <div class="bpmn-designer">
    <!-- 顶部工具栏（支持折叠） -->
    <TopToolbar
        :flow-info="flowInfo"
        :collapsed="topPanelCollapsed"
        @update:flow-info="handleFlowInfoUpdate"
        @toggle-top="topPanelCollapsed = !topPanelCollapsed"
        @save="handleSave"
        @publish="handlePublish"
        @test="handleTest"
        @preview="handlePreview"
        @import="handleImport"
        @export="handleExport"
    />

    <div class="designer-container">
      <!-- 左侧节点库（支持折叠/展开和宽度拖拽） -->
      <div class="node-panel-wrapper" :style="{ width: leftPanelCollapsed ? '0px' : leftPanelWidth + 'px' }">
        <NodePanel
            :collapsed="leftPanelCollapsed"
            :width="leftPanelWidth"
            @node-drag-start="handleNodeDragStart"
        />
        <!-- 右侧拖拽条 -->
        <div v-if="!leftPanelCollapsed" class="resize-handle resize-right" @mousedown="startResize('left', $event)"></div>
      </div>

      <!-- 中间 bpmn-js 画布 -->
      <div class="canvas-wrapper">
        <CanvasArea
            ref="canvasAreaRef"
            :nodes="flowNodes"
            :connections="connections"
            :zoom="zoom"
            :grid-visible="gridVisible"
            :active-node="activeNode"
            :active-connection="activeConnection"
            @node-select="handleNodeSelect"
            @node-delete="handleNodeDelete"
            @connection-select="handleConnectionSelect"
            @canvas-click="handleCanvasClick"
            @zoom-change="handleZoomChange"
            @grid-toggle="handleGridToggle"
            @node-move="handleNodeMove"
            @modeler-ready="handleModelerReady"
            @node-added="handleNodeAdded"
            @undo="handleUndo"
            @redo="handleRedo"
        />

        <!-- 面板折叠按钮（浮动在画布上） -->
        <div class="panel-toggles">
          <el-tooltip :content="leftPanelCollapsed ? '展开节点库' : '收起节点库'" placement="right">
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

      <!-- 右侧属性面板（支持折叠/展开和宽度拖拽） -->
      <div class="property-panel-wrapper" :style="{ width: rightPanelCollapsed ? '0px' : rightPanelWidth + 'px' }">
        <!-- 左侧拖拽条 -->
        <div v-if="!rightPanelCollapsed" class="resize-handle resize-left" @mousedown="startResize('right', $event)"></div>
        <PropertyPanel
            :collapsed="rightPanelCollapsed"
            :key="activeNode ? activeNode.id : 'empty'"
            :active-node="activeNode"
            :active-connection="activeConnection"
            :flow-info="flowInfo"
            :all-nodes="flowNodes"
            @update:flow-info="handleFlowInfoUpdate"
            @update-node="handleNodeUpdate"
            @update-connection="handleConnectionUpdate"
        />
      </div>
    </div>

    <!-- 预览弹窗 -->
    <el-dialog v-model="previewDialog.visible" title="流程预览" width="900px" append-to-body>
      <div class="preview-content">
        <el-empty v-if="flowNodes.length === 0" description="暂无流程数据" />
        <div v-else class="preview-flow">
          <div class="preview-node" v-for="node in flowNodes" :key="node.id">
            <div class="node-shape" :class="`node-${node.type}`">
              <span>{{ node.name }}</span>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 测试弹窗 -->
    <el-dialog v-model="testDialog.visible" title="流程测试" width="1000px" append-to-body>
      <div class="test-content">
        <el-steps :active="testDialog.currentStep" finish-status="success" align-center>
          <el-step v-for="(step, index) in testDialog.steps" :key="index" :title="step.title" />
        </el-steps>
        <div class="test-logs" v-if="testDialog.logs.length > 0">
          <h4>执行日志</h4>
          <el-timeline>
            <el-timeline-item v-for="(log, index) in testDialog.logs" :key="index" :type="log.type" :timestamp="log.time">
              {{ log.message }}
            </el-timeline-item>
          </el-timeline>
        </div>
      </div>
      <template #footer>
        <el-button @click="testDialog.visible = false">关闭</el-button>
        <el-button type="success" @click="handlePublish">测试通过，发布流程</el-button>
      </template>
    </el-dialog>

    <!-- 导入弹窗 -->
    <el-dialog v-model="importDialog.visible" title="导入流程" width="520px" append-to-body>
      <el-upload class="upload-area" drag accept=".bpmn,.xml" :auto-upload="false" :show-file-list="true" :limit="1" :on-change="handleImportFileChange">
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">拖拽 BPMN 文件到此处，或 <em>点击选择</em></div>
        <template #tip><div class="el-upload__tip">支持 .bpmn 或 .xml 格式文件</div></template>
      </el-upload>
      <template #footer>
        <el-button @click="importDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="confirmImport" :disabled="!importDialog.file">确认导入</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, ArrowRight } from '@element-plus/icons-vue'
import TopToolbar from './components/TopToolbar.vue'
import NodePanel from './components/NodePanel.vue'
import CanvasArea from './components/CanvasArea.vue'
import PropertyPanel from './components/PropertyPanel.vue'

const canvasAreaRef = ref(null)
let bpmnModeler = null

// 流程信息
const flowInfo = ref({
  name: '新建审批流程',
  category: 'hr',
  status: 'draft',
  description: '',
  initPermission: 'all',
  validDays: 30,
  bindFormId: null
})

// 流程节点 & 连线
const flowNodes = ref([])
const connections = ref([])

// 状态
const zoom = ref(0.8)
const gridVisible = ref(true)
const activeNode = ref(null)
const activeConnection = ref(null)

// 操作历史
const historyStack = ref([])
const redoStack = ref([])

// 预览/测试/导入弹窗状态
const previewDialog = ref({ visible: false })
const testDialog = ref({ visible: false, currentStep: 0, steps: [], logs: [] })
const importDialog = ref({ visible: false, file: null })

// 面板折叠状态
const topPanelCollapsed = ref(false)
const leftPanelCollapsed = ref(false)
const rightPanelCollapsed = ref(false)

const leftPanelWidth = ref(220)
const rightPanelWidth = ref(350)
const minPanelWidth = 180
const maxPanelWidth = 500

// 拖拽调整宽度
let isResizing = false
let resizeDirection = ''
let startX = 0
let startWidth = 0

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

// ==================== 核心逻辑 ====================

const handleFlowInfoUpdate = (info) => {
  flowInfo.value = { ...flowInfo.value, ...info }
}

// bpmn modeler 就绪
const handleModelerReady = (modeler) => {
  bpmnModeler = modeler
  saveHistory()
  syncNodeList()
}

// 拖拽开始
const handleNodeDragStart = (nodeType) => {
  return true
}

// 选中节点
const handleNodeSelect = (node) => {
  activeNode.value = JSON.parse(JSON.stringify(node))
  activeConnection.value = null
  console.log('选中节点:', activeNode.value)
}

// 节点添加成功
const handleNodeAdded = (node) => {
  flowNodes.value.push(node)
  saveHistory()
  ElMessage.success(`已添加「${node.name}」节点`)
}

// 同步节点列表（从 bpmn-js 读取）
const syncNodeList = () => {
  if (!bpmnModeler) return

  const elementRegistry = bpmnModeler.get('elementRegistry')
  const elements = elementRegistry.filter(element => {
    return element.type.startsWith('bpmn:') &&
        element.type !== 'bpmn:Process' &&
        element.type !== 'bpmn:Definitions' &&
        !element.waypoints
  })

  flowNodes.value = elements.map(el => ({
    id: el.id,
    type: el.type.replace('bpmn:', '').toLowerCase(),
    name: el.businessObject.name || el.id,
    businessObject: el.businessObject
  }))
}

// 节点移动
const handleNodeMove = (nodeId, position) => {
  // bpmn-js 已自动处理
}

// 删除节点
const handleNodeDelete = (node) => {
  if (!bpmnModeler) return

  const elementRegistry = bpmnModeler.get('elementRegistry')
  const element = elementRegistry.get(node.id)

  if (element) {
    ElMessageBox.confirm(`确定要删除「${node.name}」节点吗？`, '删除确认', { type: 'warning' }).then(() => {
      const modeling = bpmnModeler.get('modeling')
      modeling.removeShape(element)
      if (activeNode.value?.id === node.id) activeNode.value = null

      syncNodeList()
      saveHistory()
      ElMessage.success('节点已删除')
    }).catch(() => {})
  }
}

// 选择连线
const handleConnectionSelect = (conn) => {
  activeConnection.value = conn
  activeNode.value = null
}

// 点击画布空白
const handleCanvasClick = () => {
  activeNode.value = null
  activeConnection.value = null
}

// 缩放
const handleZoomChange = (val) => zoom.value = val
const handleGridToggle = (val) => gridVisible.value = val

// 节点属性更新
const handleNodeUpdate = (updatedNode) => {
  if (!bpmnModeler) return

  const elementRegistry = bpmnModeler.get('elementRegistry')
  const element = elementRegistry.get(updatedNode.id)

  if (element) {
    const modeling = bpmnModeler.get('modeling')

    if (updatedNode.name) {
      modeling.updateLabel(element, updatedNode.name)
    }

    if (updatedNode.businessObject) {
      Object.assign(element.businessObject, updatedNode.businessObject)
    }

    if (activeNode.value?.id === updatedNode.id) {
      activeNode.value = { ...activeNode.value, ...updatedNode }
    }

    syncNodeList()
    saveHistory()
  }
}

// 连线属性更新
const handleConnectionUpdate = (updatedConn) => {
  if (!bpmnModeler) return

  const elementRegistry = bpmnModeler.get('elementRegistry')
  const element = elementRegistry.get(updatedConn.id)

  if (element) {
    const modeling = bpmnModeler.get('modeling')
    modeling.updateLabel(element, updatedConn.name)
    saveHistory()
  }
}

// 历史记录
const saveHistory = async () => {
  if (!bpmnModeler) return

  try {
    const { xml } = await bpmnModeler.saveXML({ format: true })

    if (historyStack.value.length > 0) {
      const last = historyStack.value[historyStack.value.length - 1]
      if (last === xml) return
    }

    historyStack.value.push(xml)
    redoStack.value = []
  } catch (err) {
    console.error('保存历史失败:', err)
  }
}

// 撤销
const handleUndo = () => {
  if (!bpmnModeler || historyStack.value.length <= 1) {
    ElMessage.warning('无法继续撤销')
    return
  }

  redoStack.value.push(historyStack.value.pop())
  const prev = historyStack.value[historyStack.value.length - 1]

  bpmnModeler.importXML(prev).then(() => {
    activeNode.value = null
    syncNodeList()
    ElMessage.success('已撤销')
  })
}

// 重做
const handleRedo = () => {
  if (!bpmnModeler || redoStack.value.length === 0) {
    ElMessage.warning('无法继续重做')
    return
  }

  const next = redoStack.value.pop()
  historyStack.value.push(next)

  bpmnModeler.importXML(next).then(() => {
    activeNode.value = null
    syncNodeList()
    ElMessage.success('已重做')
  })
}

// 保存流程
const handleSave = async () => {
  if (!validateFlow()) return

  try {
    const xml = await canvasAreaRef.value.saveToXml()
    console.log('保存流程 XML:', xml)
    ElMessage.success('流程保存成功')
  } catch (err) {
    ElMessage.error('保存失败')
  }
}

// 发布流程
const handlePublish = async () => {
  if (!validateFlow()) return

  ElMessageBox.confirm('发布后流程将对用户可见，是否确认发布？', '发布确认', { type: 'info' }).then(async () => {
    try {
      const xml = await canvasAreaRef.value.saveToXml()
      flowInfo.value.status = 'published'
      console.log('发布流程 XML:', xml)
      ElMessage.success('流程发布成功')
    } catch (err) {
      ElMessage.error('发布失败')
    }
  }).catch(() => {})
}

// 测试流程
const handleTest = () => {
  if (flowNodes.value.length === 0) return ElMessage.warning('请先设计流程')

  testDialog.value.visible = true
  testDialog.value.currentStep = 0
  testDialog.value.steps = flowNodes.value.map(n => ({ title: n.name, type: n.type }))
  testDialog.value.logs = [{ type: 'success', time: new Date().toLocaleTimeString(), message: '流程校验通过' }]

  testDialog.value.steps.forEach((step, i) => {
    setTimeout(() => {
      testDialog.value.currentStep = i + 1
      testDialog.value.logs.push({ type: 'primary', time: new Date().toLocaleTimeString(), message: `执行节点：${step.title}` })
    }, i * 1000)
  })
}

const handlePreview = () => previewDialog.value.visible = true

// 导入
const handleImport = () => { importDialog.value.visible = true; importDialog.value.file = null }
const handleImportFileChange = (file) => importDialog.value.file = file

const confirmImport = async () => {
  if (!importDialog.value.file) return ElMessage.warning('请先选择文件')

  try {
    const text = await importDialog.value.file.raw.text()
    await canvasAreaRef.value.loadFromXml(text)

    importDialog.value.visible = false
    syncNodeList()
    saveHistory()
    ElMessage.success('导入成功')
  } catch (e) {
    ElMessage.error('导入失败，请检查文件格式')
    console.error(e)
  }
}

// 导出
const handleExport = async () => {
  try {
    const xml = await canvasAreaRef.value.saveToXml()
    const blob = new Blob([xml], { type: 'application/xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${flowInfo.value.name}.bpmn`
    a.click()
    URL.revokeObjectURL(url)
    ElMessage.success('导出成功')
  } catch (err) {
    ElMessage.error('导出失败')
  }
}

// 校验流程
const validateFlow = () => {
  if (!bpmnModeler) return false

  const elementRegistry = bpmnModeler.get('elementRegistry')
  const elements = elementRegistry.filter(el => el.type.startsWith('bpmn:'))

  const startNodes = elements.filter(el => el.type === 'bpmn:StartEvent')
  const endNodes = elements.filter(el => el.type === 'bpmn:EndEvent')

  if (startNodes.length === 0) return ElMessage.error('流程必须包含开始节点'), false
  if (startNodes.length > 1) return ElMessage.error('流程只能有一个开始节点'), false
  if (endNodes.length === 0) return ElMessage.error('流程必须包含结束节点'), false

  return true
}

// 生命周期
onUnmounted(() => {
  // 清理事件监听
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', stopResize)
})
</script>

<style scoped lang="scss">
.bpmn-designer {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f0f2f5;
  margin: 0;
  padding: 0;

  .designer-container {
    display: flex;
    flex: 1;
    overflow: hidden;
    padding: 0;
    gap: 0;
  }

  // 左侧面板容器
  .node-panel-wrapper {
    position: relative;
    flex-shrink: 0;
    transition: width 0.3s ease;
    overflow: hidden;
  }

  // 右侧面板容器
  .property-panel-wrapper {
    position: relative;
    flex-shrink: 0;
    transition: width 0.3s ease;
    overflow: hidden;
  }

  // 中间画布容器
  .canvas-wrapper {
    flex: 1;
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  // 面板折叠按钮
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

  // 拖拽条
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

  // 预览弹窗样式
  .preview-content {
    min-height: 400px;

    .preview-flow {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      padding: 20px;

      .preview-node {
        .node-shape {
          padding: 12px 24px;
          background: #fff;
          border: 2px solid #409eff;
          border-radius: 8px;
          text-align: center;

          &.node-start, &.node-end {
            border-radius: 24px;
            width: 48px;
            height: 48px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
        }
      }
    }
  }

  // 测试弹窗样式
  .test-content {
    .test-logs {
      margin-top: 24px;
      padding: 20px;
      background: #f5f7fa;
      border-radius: 8px;

      h4 {
        margin: 0 0 16px 0;
        font-size: 16px;
        color: #303133;
      }
    }
  }
}
</style>

