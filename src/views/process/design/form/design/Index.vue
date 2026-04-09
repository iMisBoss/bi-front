<template>
  <div class="form-design">
    <div class="page-header">
      <h2>表单设计器</h2>
      <p class="subtitle">通过拖拽组件快速设计表单布局和字段配置</p>
    </div>

    <div class="designer-container">
      <!-- 左侧组件面板 -->
      <div class="component-panel">
        <h3 class="panel-title">组件库</h3>

        <div class="component-group">
          <div class="group-title">基础字段</div>
          <draggable
              :list="basicComponents"
              :group="{ name: 'components', pull: 'clone', put: false }"
              :clone="cloneComponent"
              item-key="type"
              class="component-list"
          >
            <template #item="{ element }">
              <div class="component-item">
                <el-icon class="component-icon"><component :is="element.icon" /></el-icon>
                <span>{{ element.label }}</span>
              </div>
            </template>
          </draggable>
        </div>

        <div class="component-group">
          <div class="group-title">高级字段</div>
          <draggable
              :list="advancedComponents"
              :group="{ name: 'components', pull: 'clone', put: false }"
              :clone="cloneComponent"
              item-key="type"
              class="component-list"
          >
            <template #item="{ element }">
              <div class="component-item">
                <el-icon class="component-icon"><component :is="element.icon" /></el-icon>
                <span>{{ element.label }}</span>
              </div>
            </template>
          </draggable>
        </div>

        <div class="component-group">
          <div class="group-title">布局组件</div>
          <draggable
              :list="layoutComponents"
              :group="{ name: 'components', pull: 'clone', put: false }"
              :clone="cloneComponent"
              item-key="type"
              class="component-list"
          >
            <template #item="{ element }">
              <div class="component-item">
                <el-icon class="component-icon"><component :is="element.icon" /></el-icon>
                <span>{{ element.label }}</span>
              </div>
            </template>
          </draggable>
        </div>
      </div>

      <!-- 中间画布区域 -->
      <div class="canvas-area">
        <div class="canvas-toolbar">
          <el-button size="small" icon="Document" @click="handlePreview">预览</el-button>
          <el-button size="small" icon="Check" type="primary" @click="handleSave">保存</el-button>
        </div>

        <div class="canvas">
          <draggable
              v-model="formFields"
              group="components"
              item-key="id"
              class="draggable-list"
              @change="handleDrop"
          >
            <template #item="{ element }">
              <div class="form-field" :class="{ active: activeField?.id === element.id }" @click="handleSelectField(element)">
                <div class="field-header">
                  <span class="field-label">{{ element.label }}</span>
                  <div class="field-actions">
                    <el-icon class="action-icon" @click.stop="handleMoveUp(element)"><Top /></el-icon>
                    <el-icon class="action-icon" @click.stop="handleMoveDown(element)"><Bottom /></el-icon>
                    <el-icon class="action-icon delete" @click.stop="handleDeleteField(element)"><Delete /></el-icon>
                  </div>
                </div>
                <div class="field-content">
                  <component :is="getFieldComponent(element.type)" v-bind="element.props" />
                </div>
              </div>
            </template>
          </draggable>

          <el-empty v-if="formFields.length === 0" description="从左侧拖拽组件到此处" />
        </div>
      </div>

      <!-- 右侧属性面板 -->
      <div class="property-panel">
        <h3 class="panel-title">属性配置</h3>

        <div v-if="activeField" class="property-content">
          <el-form :model="activeField" label-width="80px">
            <el-form-item label="字段标签">
              <el-input v-model="activeField.label" />
            </el-form-item>

            <el-form-item label="字段编码">
              <el-input v-model="activeField.code" />
            </el-form-item>

            <el-form-item label="占位符">
              <el-input v-model="activeField.props.placeholder" />
            </el-form-item>

            <el-form-item label="是否必填">
              <el-switch v-model="activeField.required" />
            </el-form-item>

            <el-form-item label="是否只读">
              <el-switch v-model="activeField.props.disabled" />
            </el-form-item>

            <el-form-item label="默认值">
              <el-input v-model="activeField.props.defaultValue" />
            </el-form-item>

            <el-form-item label="帮助文本">
              <el-input v-model="activeField.props.helpText" type="textarea" :rows="2" />
            </el-form-item>
          </el-form>
        </div>

        <el-empty v-else description="选择字段以编辑属性" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { draggable } from 'vuedraggable'
import {
  Document, Edit, Calendar, Clock, Picture, Files, Top, Bottom, Delete
} from '@element-plus/icons-vue'

const formFields = ref([])
const activeField = ref(null)

// 基础组件
const basicComponents = ref([
  { type: 'input', label: '单行文本', icon: 'Edit' },
  { type: 'textarea', label: '多行文本', icon: 'Document' },
  { type: 'number', label: '数字输入', icon: 'Edit' },
  { type: 'select', label: '下拉选择', icon: 'Files' },
  { type: 'radio', label: '单选框', icon: 'Edit' },
  { type: 'checkbox', label: '复选框', icon: 'Edit' },
  { type: 'date', label: '日期选择', icon: 'Calendar' },
  { type: 'time', label: '时间选择', icon: 'Clock' }
])

// 高级组件
const advancedComponents = ref([
  { type: 'upload', label: '文件上传', icon: 'Picture' },
  { type: 'cascader', label: '级联选择', icon: 'Files' },
  { type: 'table', label: '明细表格', icon: 'Files' },
  { type: 'rich-text', label: '富文本', icon: 'Document' }
])

// 布局组件
const layoutComponents = ref([
  { type: 'divider', label: '分割线', icon: 'Document' },
  { type: 'card', label: '卡片容器', icon: 'Files' },
  { type: 'tabs', label: '标签页', icon: 'Files' }
])

const cloneComponent = (comp) => {
  return {
    id: Date.now() + Math.random(),
    type: comp.type,
    label: comp.label,
    code: comp.type + '_' + Date.now(),
    required: false,
    props: {
      placeholder: `请输入${comp.label}`,
      disabled: false,
      defaultValue: '',
      helpText: ''
    }
  }
}

const handleSelectField = (field) => {
  activeField.value = field
}

const handleDrop = () => {
  ElMessage.success('组件已添加到表单')
}

const handleMoveUp = (field) => {
  const index = formFields.value.findIndex(f => f.id === field.id)
  if (index > 0) {
    const temp = formFields.value[index]
    formFields.value[index] = formFields.value[index - 1]
    formFields.value[index - 1] = temp
  }
}

const handleMoveDown = (field) => {
  const index = formFields.value.findIndex(f => f.id === field.id)
  if (index < formFields.value.length - 1) {
    const temp = formFields.value[index]
    formFields.value[index] = formFields.value[index + 1]
    formFields.value[index + 1] = temp
  }
}

const handleDeleteField = (field) => {
  formFields.value = formFields.value.filter(f => f.id !== field.id)
  if (activeField.value?.id === field.id) {
    activeField.value = null
  }
  ElMessage.success('字段已删除')
}

const handlePreview = () => {
  ElMessage.info('预览功能开发中...')
}

const handleSave = () => {
  ElMessage.success('表单保存成功')
}

const getFieldComponent = (type) => {
  const components = {
    'input': 'el-input',
    'textarea': 'el-input',
    'number': 'el-input-number',
    'select': 'el-select',
    'radio': 'el-radio-group',
    'checkbox': 'el-checkbox-group',
    'date': 'el-date-picker',
    'time': 'el-time-picker'
  }
  return components[type] || 'el-input'
}
</script>

<style scoped lang="scss">
.form-design {
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

  .component-panel,
  .property-panel {
    width: 280px;
    background: #fff;
    border-radius: 8px;
    padding: 16px;
    overflow-y: auto;

    .panel-title {
      margin: 0 0 16px;
      font-size: 16px;
      color: #303133;
    }
  }

  .component-group {
    margin-bottom: 16px;

    .group-title {
      font-size: 13px;
      color: #909399;
      margin-bottom: 8px;
    }

    .component-list {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;
    }

    .component-item {
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

      .component-icon {
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
      justify-content: flex-end;
      gap: 12px;
    }

    .canvas {
      flex: 1;
      padding: 20px;
      overflow-y: auto;
      background: #f5f7fa;
    }
  }

  .form-field {
    background: #fff;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    padding: 16px;
    margin-bottom: 12px;
    cursor: pointer;

    &:hover {
      border-color: #409eff;
    }

    &.active {
      border-color: #409eff;
      box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
    }

    .field-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;

      .field-label {
        font-size: 14px;
        font-weight: 500;
      }

      .field-actions {
        display: flex;
        gap: 8px;

        .action-icon {
          cursor: pointer;
          font-size: 16px;
          color: #909399;

          &:hover {
            color: #409eff;
          }

          &.delete:hover {
            color: #f56c6c;
          }
        }
      }
    }

    .field-content {
      padding: 8px 0;
    }
  }

  .property-content {
    :deep(.el-form-item) {
      margin-bottom: 16px;
    }
  }
}
</style>
