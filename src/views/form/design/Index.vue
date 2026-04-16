<template>
  <div class="form-designer">
    <!-- 顶部操作区（可折叠） -->
    <div class="top-toolbar" v-show="!topPanelCollapsed">
      <div class="toolbar-content">
        <!-- 左侧：表单基础信息 -->
        <div class="form-info-group">
          <div class="info-item">
            <span class="info-label">表单名称</span>
            <el-input v-model="formInfo.name" placeholder="请输入表单名称" class="info-input" />
          </div>
          <div class="info-item">
            <span class="info-label">表单分类</span>
            <el-select v-model="formInfo.category" placeholder="请选择" class="info-select">
              <el-option label="人事类" value="hr" />
              <el-option label="财务类" value="finance" />
              <el-option label="行政类" value="admin" />
              <el-option label="其他" value="other" />
            </el-select>
          </div>
          <div class="info-item">
            <span class="info-label">表单描述</span>
            <el-input v-model="formInfo.description" placeholder="选填" class="info-input" />
          </div>
        </div>

        <!-- 右侧：操作按钮 -->
        <div class="action-buttons">
          <el-button size="small" type="info" @click="handleOpenImport">
            <el-icon><Download /></el-icon>
            导入
          </el-button>
          <el-button size="small" type="warning" @click="handleExportForm">
            <el-icon><Upload /></el-icon>
            导出
          </el-button>
          <el-divider direction="vertical" />
          <el-button size="small" @click="handleOpenPreview">
            <el-icon><View /></el-icon>
            预览
          </el-button>
          <el-button size="small" type="primary" @click="handleSave">
            <el-icon><Document /></el-icon>
            保存
          </el-button>
          <el-button size="small" type="success" @click="handlePublish">
            <el-icon><Promotion /></el-icon>
            发布
          </el-button>
        </div>
      </div>
    </div>

    <!-- 主体三栏布局 -->
    <div class="designer-body">
      <!-- 左侧组件库 -->
      <div class="component-panel-wrapper" :style="{ width: leftPanelCollapsed ? '0px' : leftPanelWidth + 'px' }">
        <ComponentPanel
            v-show="!leftPanelCollapsed"
            :width="leftPanelWidth"
            @drag-start="handleDragStart"
            @insert-system="handleInsertSystemVariable"
        />
        <div v-if="!leftPanelCollapsed" class="resize-handle resize-left" @mousedown="startResize('left', $event)"></div>
      </div>

      <!-- 中间设计画布 -->
      <div class="canvas-area">
        <div class="canvas-toolbar">
          <div class="layout-toolbar-left">
            <span class="toolbar-label">快捷布局</span>
            <el-button-group class="layout-buttons">
              <el-tooltip content="单列布局，适合长表单、移动端展示" placement="top">
                <el-button
                    size="small"
                    :class="{ 'is-active': canvasLayout === '1' }"
                    @click="canvasLayout = '1'"
                >
                  <el-icon><Menu /></el-icon>
                  1列
                </el-button>
              </el-tooltip>
              <el-tooltip content="双列布局，适合中等宽度屏幕，字段左右排列" placement="top">
                <el-button
                    size="small"
                    :class="{ 'is-active': canvasLayout === '2' }"
                    @click="canvasLayout = '2'"
                >
                  <el-icon><Grid /></el-icon>
                  2列
                </el-button>
              </el-tooltip>
              <el-tooltip content="三列布局，适合宽屏幕，字段紧凑排列" placement="top">
                <el-button
                    size="small"
                    :class="{ 'is-active': canvasLayout === '3' }"
                    @click="canvasLayout = '3'"
                >
                  <el-icon><Grid /></el-icon>
                  3列
                </el-button>
              </el-tooltip>
            </el-button-group>
          </div>

          <!-- 撤销、重做、重置按钮组 -->
          <div class="canvas-actions">
            <el-button-group>
              <el-button size="small" @click="handleUndo" :disabled="!canUndo">
                <el-icon><RefreshLeft /></el-icon>
                撤销
              </el-button>
              <el-button size="small" @click="handleRedo" :disabled="!canRedo">
                <el-icon><Right /></el-icon>
                重做
              </el-button>
            </el-button-group>
            <el-button size="small" @click="handleReset">
              <el-icon><Refresh /></el-icon>
              重置
            </el-button>
          </div>
        </div>

        <div
            class="canvas"
            :class="'canvas-cols-' + canvasLayout"
            @drop="handleDrop"
            @dragover="handleDragOver"
            @dragenter.prevent
        >
          <!-- 递归渲染表单字段 -->
          <template v-for="(field, index) in formFields" :key="field.id">
            <!-- 普通字段 -->
            <FormField
                v-if="!isContainer(field) && !isDetailTable(field)"
                :field="field"
                :is-active="activeField?.id === field.id"
                @select="handleSelectField"
                @move="(step) => moveField(index, step)"
                @copy="() => copyField(field)"
                @delete="() => delField(index)"
            />

            <!-- 容器字段 -->
            <ContainerField
                v-else-if="isContainer(field)"
                :field="field"
                :is-active="activeField?.id === field.id"
                :active-child="activeChildField"
                @select="handleSelectField"
                @move="(step) => moveField(index, step)"
                @copy="() => copyField(field)"
                @delete="() => delField(index)"
                @drop-to-container="handleDropToContainer"
                @drag-over="handleDragOver"
                @select-child="handleSelectChildField"
                @move-child="(childIndex, step) => moveChildField(field, childIndex, step)"
                @delete-child="(childIndex) => delChildField(field, childIndex)"
            />

            <!-- 明细表字段 -->
            <DetailTableField
                v-else
                :field="field"
                :is-active="activeField?.id === field.id"
                @select="handleSelectField"
                @config="handleConfigDetailTable"
                @move="(step) => moveField(index, step)"
                @delete="() => delField(index)"
                @add-row="addDetailRow"
                @remove-row="removeDetailRow"
            />
          </template>

          <!-- 空状态 -->
          <el-empty v-if="formFields.length === 0" description="从左侧拖拽组件到此处搭建表单" :image-size="120">
            <template #image>
              <el-icon :size="80" color="#c0c4cc"><Box /></el-icon>
            </template>
          </el-empty>
        </div>

        <!-- 面板折叠按钮（浮动在画布上） -->
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

      <!-- 右侧属性面板 -->
      <div class="property-panel-wrapper" :style="{ width: rightPanelCollapsed ? '0px' : rightPanelWidth + 'px' }">
        <div v-if="!rightPanelCollapsed" class="resize-handle resize-right" @mousedown="startResize('right', $event)"></div>
        <PropertyPanel
            v-show="!rightPanelCollapsed"
            :active-field="activeField"
            :linkage-rules="linkageRules"
            :all-fields="formFields"
            @open-linkage="handleOpenLinkageConfig"
        />
      </div>
    </div>

    <!-- 明细表列配置弹窗 -->
    <DetailTableConfig
        v-model="detailTableDialog.visible"
        :field="detailTableDialog.currentField"
        @save="handleSaveDetailTableConfig"
    />

    <!-- 表单联动规则配置弹窗 -->
    <LinkageRuleConfig
        v-model="linkageDialog.visible"
        :form-fields="formFields"
        :initial-rules="linkageRules"
        @save="handleSaveLinkageRules"
    />
    <!-- 导入/导出/预览组件 -->
    <FormImport ref="importRef" @import-success="handleImportSuccess" />
    <FormPreview ref="previewRef" :form-info="formInfo" :form-fields="formFields" />
    <FormExport
        ref="exportRef"
        :form-info="formInfo"
        :form-fields="formFields"
        :linkage-rules="linkageRules"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Menu, Grid, Box, RefreshLeft, Right, Refresh,
  Download, Upload, View, Document, Promotion,
  ArrowUp, ArrowDown, ArrowLeft, ArrowRight,
  Fold, Expand
} from '@element-plus/icons-vue'
import ComponentPanel from './components/ComponentPanel.vue'
import FormField from './components/FormField.vue'
import ContainerField from './components/ContainerField.vue'
import DetailTableField from './components/DetailTableField.vue'
import PropertyPanel from './components/PropertyPanel.vue'
import DetailTableConfig from './components/DetailTableConfig.vue'
import LinkageRuleConfig from './components/LinkageRuleConfig.vue'
import FormExport from './components/FormExport.vue'
import FormImport from './components/FormImport.vue'
import FormPreview from './components/FormPreview.vue'

const router = useRouter()

// 组件引用
const importRef = ref(null)
const exportRef = ref(null)
const previewRef = ref(null)

// 表单基础信息
const formInfo = reactive({
  name: '新建表单',
  category: '',
  description: ''
})

// Tab与状态
const componentTab = ref('basic')
const propertyTab = ref('basic')
const canvasLayout = ref('1')
const formFields = ref([])
const activeField = ref(null)
const activeChildField = ref(null)
const isPublished = ref(false)

// 面板折叠状态
const topPanelCollapsed = ref(false)
const leftPanelCollapsed = ref(false)
const rightPanelCollapsed = ref(false)
const menuTreeVisible = ref(true)

// 面板宽度
const leftPanelWidth = ref(280)
const rightPanelWidth = ref(360)
const minPanelWidth = 200
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

// 撤销重做历史
const historyStack = ref([])
const currentHistoryIndex = ref(-1)
const MAX_HISTORY = 50

const canUndo = computed(() => currentHistoryIndex.value > 0)
const canRedo = computed(() => currentHistoryIndex.value < historyStack.value.length - 1)

// 联动规则
const linkageRules = ref([])

// 明细表配置弹窗
const detailTableDialog = reactive({
  visible: false,
  currentField: null
})

// 联动规则配置弹窗
const linkageDialog = reactive({
  visible: false
})

// ========== 深拷贝工具函数 ==========
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

// ========== 拖拽核心逻辑 ==========
let draggedComponent = null

const handleDragStart = (event, comp) => {
  draggedComponent = comp
  event.dataTransfer.effectAllowed = 'copy'
  event.dataTransfer.setData('text/plain', JSON.stringify(comp))
}

const handleDragOver = (event) => {
  event.preventDefault()
  event.dataTransfer.dropEffect = 'copy'
}

// ========== 系统变量点击插入 ==========
const handleInsertSystemVariable = (comp) => {
  const id = Date.now() + Math.random()
  const code = comp.type + '_' + id.toString(36)

  const systemField = {
    id,
    type: comp.type,
    label: comp.label,
    code,
    required: false,
    readonly: true,
    hidden: false,
    sys: true,
    helpText: '',
    props: {
      placeholder: `自动获取${comp.label}`,
      defaultValue: '',
      width: '100%'
    },
    validation: {
      maxLength: null,
      minLength: null,
      max: null,
      min: null,
      decimals: 2,
      dateRange: 'none',
      pattern: '',
      message: ''
    },
    dataBinding: '',
    variableBinding: '',
    fieldPermission: 'readonly',
    formula: ''
  }

  formFields.value.unshift(systemField)
  activeField.value = systemField
  activeChildField.value = null

  saveHistory()
  ElMessage.success(`已插入：${comp.label}`)
}

// 克隆组件
const cloneComponent = (comp) => {
  const id = Date.now() + Math.random()
  const code = comp.type + '_' + id.toString(36)

  const baseField = {
    id,
    type: comp.type,
    label: comp.label,
    code,
    required: false,
    readonly: comp.sys || false,
    hidden: false,
    sys: comp.sys || false,
    helpText: '',
    props: {
      placeholder: `请输入${comp.label}`,
      defaultValue: '',
      width: '100%'
    },
    validation: {
      maxLength: null,
      minLength: null,
      max: null,
      min: null,
      decimals: 2,
      dateRange: 'none',
      pattern: '',
      message: ''
    },
    dataBinding: '',
    variableBinding: '',
    fieldPermission: 'edit',
    formula: ''
  }

  if (comp.type === 'grid') {
    return { ...baseField, cols: 2, children: [] }
  }
  if (comp.type === 'group' || comp.type === 'card') {
    return { ...baseField, title: comp.label, children: [] }
  }

  if (comp.type.includes('Detail')) {
    return {
      ...baseField,
      columns: getDefaultDetailColumns(comp.type),
      rows: []
    }
  }

  return baseField
}

// 获取明细表默认列配置
const getDefaultDetailColumns = (type) => {
  if (type === 'expenseDetail') {
    return [
      { code: 'expenseType', label: '费用类型', type: 'select', width: 150 },
      { code: 'amount', label: '金额', type: 'number', width: 120 },
      { code: 'remark', label: '备注', type: 'input', width: 200 },
      { code: 'invoice', label: '发票附件', type: 'upload', width: 150 }
    ]
  }
  if (type === 'purchaseDetail') {
    return [
      { code: 'itemName', label: '物品名称', type: 'input', width: 150 },
      { code: 'quantity', label: '数量', type: 'number', width: 100 },
      { code: 'unitPrice', label: '单价', type: 'number', width: 100 },
      { code: 'totalPrice', label: '总价', type: 'number', width: 100 }
    ]
  }
  if (type === 'tripDetail') {
    return [
      { code: 'date', label: '日期', type: 'date', width: 120 },
      { code: 'from', label: '出发地', type: 'input', width: 120 },
      { code: 'to', label: '目的地', type: 'input', width: 120 },
      { code: 'transport', label: '交通工具', type: 'select', width: 120 }
    ]
  }
  return [
    { code: 'col1', label: '列1', type: 'input', width: 150 },
    { code: 'col2', label: '列2', type: 'input', width: 150 }
  ]
}

// 放置到画布
const handleDrop = (event) => {
  event.preventDefault()

  if (!draggedComponent) {
    ElMessage.warning('拖拽数据异常')
    return
  }

  const newField = cloneComponent(draggedComponent)
  formFields.value.push(newField)
  activeField.value = newField
  activeChildField.value = null

  saveHistory()
  ElMessage.success(`已添加：${draggedComponent.label}`)
  draggedComponent = null
}

// 放置到容器
const handleDropToContainer = (event, container) => {
  event.preventDefault()
  event.stopPropagation()

  if (!draggedComponent) return

  const newField = cloneComponent(draggedComponent)
  if (!container.children) container.children = []
  container.children.push(newField)
  activeChildField.value = newField

  saveHistory()
  ElMessage.success(`已添加到容器：${draggedComponent.label}`)
  draggedComponent = null
}

// 判断是否为容器
const isContainer = (field) => {
  return ['grid', 'group', 'card'].includes(field.type)
}

// 判断是否为明细表
const isDetailTable = (field) => {
  return field.type.includes('Detail')
}

// ========== 字段操作 ==========
const handleSelectField = (field) => {
  activeField.value = field
  activeChildField.value = null
}

const handleSelectChildField = (field) => {
  activeChildField.value = field
}

const moveField = (index, step) => {
  const target = index + step
  if (target < 0 || target >= formFields.value.length) return

  const temp = formFields.value[index]
  formFields.value[index] = formFields.value[target]
  formFields.value[target] = temp

  saveHistory()
}

const copyField = (field) => {
  const copy = deepClone(field)
  copy.id = Date.now()
  copy.label += '（副本）'
  copy.code = field.type + '_' + copy.id.toString(36)
  formFields.value.push(copy)

  saveHistory()
  ElMessage.success('已复制字段')
}

const delField = (index) => {
  ElMessageBox.confirm('确认删除该字段？', '提示', { type: 'warning' }).then(() => {
    const removed = formFields.value.splice(index, 1)[0]
    if (activeField.value === removed) {
      activeField.value = null
      activeChildField.value = null
    }

    saveHistory()
    ElMessage.success('已删除字段')
  })
}

// 容器内子字段操作
const moveChildField = (container, childIndex, step) => {
  const target = childIndex + step
  if (target < 0 || target >= container.children.length) return

  const temp = container.children[childIndex]
  container.children[childIndex] = container.children[target]
  container.children[target] = temp

  saveHistory()
}

const delChildField = (container, childIndex) => {
  ElMessageBox.confirm('确认删除该字段？', '提示', { type: 'warning' }).then(() => {
    container.children.splice(childIndex, 1)

    saveHistory()
    ElMessage.success('已删除字段')
  })
}

// 明细表行操作
const addDetailRow = (field) => {
  if (!field.rows) field.rows = []
  const newRow = {}
  field.columns.forEach(col => {
    newRow[col.code] = ''
  })
  field.rows.push(newRow)

  saveHistory()
  ElMessage.success('已新增行')
}

const removeDetailRow = (field, index) => {
  field.rows.splice(index, 1)
}

// ========== 撤销重做 ==========
const initHistory = () => {
  historyStack.value = [deepClone(formFields.value)]
  currentHistoryIndex.value = 0
}

const saveHistory = () => {
  if (currentHistoryIndex.value < historyStack.value.length - 1) {
    historyStack.value = historyStack.value.slice(0, currentHistoryIndex.value + 1)
  }

  const currentState = deepClone(formFields.value)
  historyStack.value.push(currentState)
  currentHistoryIndex.value = historyStack.value.length - 1

  if (historyStack.value.length > MAX_HISTORY) {
    historyStack.value.shift()
    currentHistoryIndex.value--
  }
}

const handleUndo = () => {
  if (currentHistoryIndex.value > 0) {
    currentHistoryIndex.value--
    formFields.value = deepClone(historyStack.value[currentHistoryIndex.value])
    activeField.value = null
    activeChildField.value = null
    ElMessage.info('已撤销')
  } else {
    ElMessage.warning('没有可撤销的操作')
  }
}

const handleRedo = () => {
  if (currentHistoryIndex.value < historyStack.value.length - 1) {
    currentHistoryIndex.value++
    formFields.value = deepClone(historyStack.value[currentHistoryIndex.value])
    activeField.value = null
    activeChildField.value = null
    ElMessage.info('已重做')
  } else {
    ElMessage.warning('没有可重做的操作')
  }
}

// ========== 按钮事件 ==========
const handleSave = () => {
  ElMessage.success('保存成功')
}

const handlePreview = () => {
  if (formFields.value.length === 0) {
    ElMessage.warning('请先添加表单组件')
    return
  }
  ElMessage.info('预览功能开发中...')
}

const handlePublish = () => {
  if (formFields.value.length === 0) {
    ElMessage.warning('请先添加表单组件')
    return
  }

  ElMessageBox.confirm('发布后表单将生效，可绑定流程使用。是否确认发布？', '发布确认', {
    confirmButtonText: '确认发布',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    isPublished.value = true
    ElMessage.success('发布成功')
  })
}

const handleReset = () => {
  ElMessageBox.confirm('确定要重置表单吗？将清空所有组件。', '重置确认', {
    confirmButtonText: '确定重置',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    formFields.value = []
    activeField.value = null
    activeChildField.value = null

    saveHistory()
    ElMessage.success('表单已重置')
  })
}

// ========== 导入/导出/预览 ==========
const handleOpenImport = () => {
  if (importRef.value) {
    importRef.value.open()
  }
}

const handleExportForm = () => {
  if (exportRef.value) {
    exportRef.value.handleExport()
  }
}

const handleOpenPreview = () => {
  if (previewRef.value) {
    previewRef.value.open()
  }
}

// 导入成功回调
const handleImportSuccess = (config) => {
  formInfo.name = config.formName || '新建表单'
  formInfo.category = config.formCategory || ''
  formInfo.description = config.formDesc || ''
  formFields.value = config.fields
  linkageRules.value = config.linkageRules || []

  // 重置激活状态
  activeField.value = null
  activeChildField.value = null

  // 保存历史记录
  saveHistory()
}

// ========== 明细表列配置 ==========
const handleConfigDetailTable = (field) => {
  detailTableDialog.currentField = field
  detailTableDialog.visible = true
}

const handleSaveDetailTableConfig = ({ tableName, columns }) => {
  if (detailTableDialog.currentField) {
    detailTableDialog.currentField.label = tableName
    detailTableDialog.currentField.columns = columns
    ElMessage.success('明细表配置已应用')
  }
}

// ========== 联动规则配置 ==========
const handleOpenLinkageConfig = () => {
  linkageDialog.visible = true
}

const handleSaveLinkageRules = (rules) => {
  linkageRules.value = rules
  ElMessage.success(`已保存 ${rules.length} 条联动规则`)
}

// 页面加载时初始化历史记录
onMounted(() => {
  initHistory()
})

// 清理事件监听
onUnmounted(() => {
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', stopResize)
})
</script>

<style scoped lang="scss">
.form-designer {
  height: calc(100vh - 50px);
  background: #fff;
  display: flex;
  flex-direction: column;
  font-size: 13px;
  color: #303133;

  // 顶部头部区域（面包屑 + 折叠按钮）
  .top-header {
    background: #fff;
    border-bottom: 1px solid #e8e8e8;
    padding: 8px 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .header-actions {
      display: flex;
      align-items: center;
      gap: 8px;

      .header-toggle {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 4px 10px;
        background: #fff;
        border: 1px solid #dcdfe6;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
        color: #606266;
        transition: all 0.2s;
        user-select: none;

        &:hover {
          color: #409eff;
          border-color: #409eff;
          background: #ecf5ff;
        }

        .toggle-text {
          font-weight: 500;
        }
      }
    }
  }

  // 顶部操作区
  .top-toolbar {
    background: #fff;
    border-bottom: 1px solid #e8e8e8;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
    padding: 10px 16px;
    transition: all 0.3s ease;

    .toolbar-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      flex-wrap: nowrap;
      overflow-x: auto;
    }

    // 左侧表单信息
    .form-info-group {
      display: flex;
      align-items: center;
      gap: 12px;
      flex: 1;
      min-width: 0;

      .info-item {
        display: flex;
        align-items: center;
        gap: 6px;
        flex-shrink: 0;

        .info-label {
          font-size: 12px;
          color: #606266;
          white-space: nowrap;
          font-weight: 500;
        }

        :deep(.el-input__wrapper) {
          padding: 0 10px;
          height: 28px;
        }

        :deep(.el-select .el-input__wrapper) {
          padding: 0 10px;
          height: 28px;
        }

        .info-input {
          width: 160px;
          font-size: 12px;
        }

        .info-select {
          width: 120px;
          font-size: 12px;
        }
      }
    }

    // 右侧操作按钮
    .action-buttons {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-shrink: 0;

      :deep(.el-button) {
        padding: 6px 10px;
        font-size: 12px;
        font-weight: 500;
        height: 28px;

        .el-icon {
          margin-right: 2px;
          font-size: 12px;
        }
      }

      :deep(.el-divider--vertical) {
        margin: 0 3px;
        height: 18px;
      }
    }
  }

  .designer-body {
    flex: 1;
    display: flex;
    overflow: hidden;
    background: #fff;
  }

  .component-panel-wrapper,
  .property-panel-wrapper {
    position: relative;
    flex-shrink: 0;
    transition: width 0.3s ease;
    overflow: hidden;
  }

  .canvas-area {
    flex: 1;
    display: flex;
    flex-direction: column;
    position: relative;
    overflow: hidden;
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

  // 拖拽调整宽度手柄
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

  .canvas-toolbar {
    height: 48px;
    padding: 0 16px;
    background: #fff;
    border-bottom: 1px solid #e8e8e8;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-shrink: 0;

    .layout-toolbar-left {
      display: flex;
      align-items: center;
      gap: 8px;

      .toolbar-label {
        font-size: 13px;
        color: #606266;
        font-weight: 500;
      }

      .layout-buttons {
        :deep(.el-button) {
          padding: 6px 12px;
          font-size: 12px;

          &.is-active {
            background: #409eff;
            border-color: #409eff;
            color: #fff;
          }
        }
      }
    }

    .canvas-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }

  .canvas {
    flex: 1;
    padding: 16px;
    overflow-y: auto;
    background: #f5f7fa;

    &.canvas-cols-1 {
      display: flex;
      flex-direction: column;
      gap: 12px;

      .form-field,
      .container-field,
      .detail-table-field {
        max-width: 100%;
        width: 100%;
      }
    }

    &.canvas-cols-2 {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
      align-content: start;

      .form-field,
      .container-field,
      .detail-table-field {
        max-width: 100%;
        width: 100%;
      }
    }

    &.canvas-cols-3 {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      align-content: start;

      .form-field,
      .container-field,
      .detail-table-field {
        max-width: 100%;
        width: 100%;
      }
    }
  }
}
</style>
