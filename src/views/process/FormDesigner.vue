<template>
  <div class="form-designer-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>表单设计器</span>
          <div class="header-actions">
            <el-button @click="handlePreview">
              <el-icon><View /></el-icon>
              预览
            </el-button>
            <el-button type="primary" @click="handleSave">
              <el-icon><Document /></el-icon>
              保存
            </el-button>
          </div>
        </div>
      </template>

      <el-row :gutter="20" class="designer-container">
        <el-col :span="6">
          <el-card class="component-card">
            <template #header>
              <span>组件库</span>
            </template>
            <el-collapse accordion>
              <el-collapse-item title="基础组件" name="1">
                <div class="component-list">
                  <div
                      v-for="comp in basicComponents"
                      :key="comp.id"
                      class="component-item"
                      @click="addComponent(comp)"
                  >
                    <el-icon><component :is="comp.icon" /></el-icon>
                    <span>{{ comp.label }}</span>
                  </div>
                </div>
              </el-collapse-item>
              <el-collapse-item title="高级组件" name="2">
                <div class="component-list">
                  <div
                      v-for="comp in advancedComponents"
                      :key="comp.id"
                      class="component-item"
                      @click="addComponent(comp)"
                  >
                    <el-icon><component :is="comp.icon" /></el-icon>
                    <span>{{ comp.label }}</span>
                  </div>
                </div>
              </el-collapse-item>
            </el-collapse>
          </el-card>
        </el-col>

        <el-col :span="12">
          <el-card class="canvas-card">
            <template #header>
              <span>表单画布</span>
            </template>
            <div class="canvas-content">
              <div v-if="formComponents.length === 0" class="empty-canvas">
                <el-empty description="点击左侧组件添加到此处" />
              </div>
              <div v-else class="form-components">
                <div
                    v-for="(element, index) in formComponents"
                    :key="element.id"
                    class="form-component"
                    :class="{ active: currentComponent?.id === element.id }"
                    @click="handleEditComponent(element)"
                >
                  <div class="component-header">
                    <span>{{ element.label }}</span>
                    <div class="component-actions">
                      <el-button link type="primary" @click.stop="handleEditComponent(element)">
                        <el-icon><EditPen /></el-icon>
                      </el-button>
                      <el-button link type="danger" @click.stop="handleDeleteComponent(index)">
                        <el-icon><Delete /></el-icon>
                      </el-button>
                    </div>
                  </div>
                  <div class="component-preview">
                    <el-input v-if="element.type === 'input'" :placeholder="element.placeholder" disabled />
                    <el-input v-if="element.type === 'textarea'" type="textarea" :rows="3" disabled />
                    <el-select v-if="element.type === 'select'" :placeholder="element.placeholder" disabled>
                      <el-option v-for="opt in element.options" :key="opt.value" :label="opt.label" :value="opt.value" />
                    </el-select>
                    <el-radio-group v-if="element.type === 'radio'" disabled>
                      <el-radio v-for="opt in element.options" :key="opt.value" :label="opt.value">{{ opt.label }}</el-radio>
                    </el-radio-group>
                    <el-checkbox-group v-if="element.type === 'checkbox'" disabled>
                      <el-checkbox v-for="opt in element.options" :key="opt.value" :label="opt.value">{{ opt.label }}</el-checkbox>
                    </el-checkbox-group>
                    <el-date-picker v-if="element.type === 'date'" disabled />
                    <el-input-number v-if="element.type === 'number'" disabled />
                  </div>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :span="6">
          <el-card class="properties-card">
            <template #header>
              <span>属性配置</span>
            </template>
            <el-form v-if="currentComponent" :model="currentComponent" label-width="80px" size="small">
              <el-form-item label="字段名">
                <el-input v-model="currentComponent.field" />
              </el-form-item>
              <el-form-item label="标签">
                <el-input v-model="currentComponent.label" />
              </el-form-item>
              <el-form-item label="占位符">
                <el-input v-model="currentComponent.placeholder" />
              </el-form-item>
              <el-form-item label="必填">
                <el-switch v-model="currentComponent.required" />
              </el-form-item>
              <el-form-item label="选项" v-if="currentComponent.options">
                <el-button type="primary" size="small" @click="handleAddOption">添加选项</el-button>
                <div v-for="(opt, idx) in currentComponent.options" :key="idx" class="option-item">
                  <el-input v-model="opt.label" size="small" placeholder="标签" />
                  <el-input v-model="opt.value" size="small" placeholder="值" />
                  <el-button link type="danger" @click="handleDeleteOption(idx)">
                    <el-icon><Close /></el-icon>
                  </el-button>
                </div>
              </el-form-item>
            </el-form>
            <el-empty v-else description="请选择组件" />
          </el-card>
        </el-col>
      </el-row>
    </el-card>

    <el-dialog v-model="previewVisible" title="表单预览" width="600px">
      <el-form :model="previewForm" label-width="100px">
        <el-form-item v-for="comp in formComponents" :key="comp.id" :label="comp.label" :required="comp.required">
          <el-input v-if="comp.type === 'input'" v-model="previewForm[comp.field]" :placeholder="comp.placeholder" />
          <el-input v-if="comp.type === 'textarea'" v-model="previewForm[comp.field]" type="textarea" :rows="3" :placeholder="comp.placeholder" />
          <el-select v-if="comp.type === 'select'" v-model="previewForm[comp.field]" :placeholder="comp.placeholder">
            <el-option v-for="opt in comp.options" :key="opt.value" :label="opt.label" :value="opt.value" />
          </el-select>
          <el-radio-group v-if="comp.type === 'radio'" v-model="previewForm[comp.field]">
            <el-radio v-for="opt in comp.options" :key="opt.value" :label="opt.value">{{ opt.label }}</el-radio>
          </el-radio-group>
          <el-checkbox-group v-if="comp.type === 'checkbox'" v-model="previewForm[comp.field]">
            <el-checkbox v-for="opt in comp.options" :key="opt.value" :label="opt.value">{{ opt.label }}</el-checkbox>
          </el-checkbox-group>
          <el-date-picker v-if="comp.type === 'date'" v-model="previewForm[comp.field]" />
          <el-input-number v-if="comp.type === 'number'" v-model="previewForm[comp.field]" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="previewVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { View, Document, EditPen, Delete, Close, Select, Check, CircleCheck, Calendar, Timer, Plus, Connection } from '@element-plus/icons-vue'

const basicComponents = ref([
  { id: 'input', label: '输入框', type: 'input', icon: EditPen, field: '', placeholder: '', required: false },
  { id: 'textarea', label: '多行文本', type: 'textarea', icon: Document, field: '', placeholder: '', required: false },
  { id: 'number', label: '计数器', type: 'number', icon: Timer, field: '', required: false },
  { id: 'date', label: '日期选择', type: 'date', icon: Calendar, field: '', required: false }
])

const advancedComponents = ref([
  { id: 'select', label: '下拉选择', type: 'select', icon: Connection, field: '', placeholder: '', required: false, options: [] },
  { id: 'radio', label: '单选框组', type: 'radio', icon: CircleCheck, field: '', required: false, options: [] },
  { id: 'checkbox', label: '多选框组', type: 'checkbox', icon: Check, field: '', required: false, options: [] }
])

const formComponents = ref([])
const currentComponent = ref(null)
const previewVisible = ref(false)
const previewForm = ref({})

let componentId = 0

const addComponent = (origin) => {
  componentId++
  const newComponent = {
    ...origin,
    id: `component_${componentId}`,
    field: origin.type + '_' + componentId,
    options: origin.options ? [...origin.options] : undefined
  }
  formComponents.value.push(newComponent)
  currentComponent.value = newComponent
}

const handleEditComponent = (component) => {
  currentComponent.value = { ...component }
}

const handleDeleteComponent = (index) => {
  formComponents.value.splice(index, 1)
  currentComponent.value = null
}

const handleAddOption = () => {
  if (currentComponent.value && currentComponent.value.options) {
    currentComponent.value.options.push({ label: '选项', value: 'value' })
  }
}

const handleDeleteOption = (index) => {
  if (currentComponent.value && currentComponent.value.options) {
    currentComponent.value.options.splice(index, 1)
  }
}

const handlePreview = () => {
  previewForm.value = {}
  previewVisible.value = true
}

const handleSave = () => {
  ElMessage.success('表单保存成功')
}
</script>

<style lang="scss" scoped>
.form-designer-page {
  padding: 20px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .header-actions {
      display: flex;
      gap: 10px;
    }
  }

  .designer-container {
    height: calc(100vh - 200px);

    .component-card,
    .canvas-card,
    .properties-card {
      height: 100%;
    }

    .component-list {
      min-height: 100px;

      .component-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px;
        margin-bottom: 8px;
        background: #f5f7fa;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.3s;

        &:hover {
          background: #ecf5ff;
          transform: translateX(5px);
        }
      }
    }

    .canvas-content {
      min-height: 400px;

      .empty-canvas {
        height: 400px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .form-components {
        min-height: 400px;

        .form-component {
          margin-bottom: 15px;
          padding: 15px;
          border: 1px solid #dcdfe6;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.3s;

          &.active {
            border-color: #409eff;
            box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
          }

          .component-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;

            .component-actions {
              display: flex;
              gap: 5px;
            }
          }

          .component-preview {
            padding: 10px;
            background: #fafafa;
            border-radius: 4px;
          }
        }
      }
    }

    .option-item {
      display: flex;
      align-items: center;
      gap: 5px;
      margin-top: 5px;
    }
  }
}
</style>
