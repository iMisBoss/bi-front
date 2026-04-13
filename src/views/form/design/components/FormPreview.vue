<template>
  <el-dialog
      v-model="dialogVisible"
      title="表单预览"
      width="900px"
      append-to-body
      :close-on-click-modal="false"
      top="5vh"
  >
    <div class="preview-container">
      <!-- 表单头部信息 -->
      <div class="preview-header">
        <h3>{{ formInfo.name || '未命名表单' }}</h3>
        <div class="preview-meta">
          <el-tag v-if="formInfo.category" size="small">{{ getCategoryLabel(formInfo.category) }}</el-tag>
          <span v-if="formInfo.description" class="preview-desc">{{ formInfo.description }}</span>
        </div>
      </div>

      <!-- 表单内容区 -->
      <div class="preview-body">
        <template v-for="field in formFields" :key="field.id">
          <!-- 普通字段 -->
          <div v-if="!isContainer(field) && !isDetailTable(field)" class="preview-field-item">
            <div class="preview-field-label">
              <span v-if="field.required" class="required-mark">*</span>
              {{ field.label }}
              <el-tooltip v-if="field.helpText" :content="field.helpText" placement="top">
                <el-icon class="help-icon"><QuestionFilled /></el-icon>
              </el-tooltip>
            </div>
            <div class="preview-field-control">
              <!-- 系统变量只读 -->
              <el-input
                  v-if="field.sys"
                  disabled
                  placeholder="系统自动填充"
                  :model-value="`[系统变量] ${field.label}`"
              />
              <!-- 普通输入框 -->
              <el-input
                  v-else-if="field.type==='input'"
                  :placeholder="field.props?.placeholder || `请输入${field.label}`"
              />
              <el-input
                  v-else-if="field.type==='textarea'"
                  type="textarea"
                  :rows="3"
                  :placeholder="field.props?.placeholder || `请输入${field.label}`"
              />
              <el-input-number
                  v-else-if="field.type==='number'"
                  style="width:100%"
                  :placeholder="field.props?.placeholder"
              />
              <el-select
                  v-else-if="field.type==='select'"
                  style="width:100%"
                  :placeholder="field.props?.placeholder || `请选择${field.label}`"
              />
              <el-date-picker
                  v-else-if="field.type==='date'"
                  style="width:100%"
                  :placeholder="field.props?.placeholder || `请选择${field.label}`"
              />
              <el-switch v-else-if="field.type==='switch'" />
              <el-radio-group v-else-if="field.type==='radio'">
                <el-radio label="选项1">选项1</el-radio>
                <el-radio label="选项2">选项2</el-radio>
              </el-radio-group>
              <el-checkbox-group v-else-if="field.type==='checkbox'">
                <el-checkbox label="选项1">选项1</el-checkbox>
                <el-checkbox label="选项2">选项2</el-checkbox>
              </el-checkbox-group>
              <el-input v-else disabled placeholder="该组件类型暂不支持预览" />
            </div>
          </div>

          <!-- 明细表预览 -->
          <div v-else-if="isDetailTable(field)" class="preview-detail-table">
            <div class="preview-field-label">
              <span v-if="field.required" class="required-mark">*</span>
              {{ field.label }}
            </div>
            <el-table :data="field.rows || []" border size="small" style="width: 100%">
              <el-table-column
                  v-for="col in field.columns"
                  :key="col.code"
                  :label="col.label"
                  :width="col.width"
              >
                <template #default>
                  <el-input size="small" placeholder="请输入" />
                </template>
              </el-table-column>
              <el-table-column label="操作" width="80" align="center">
                <template #default="{ $index }">
                  <el-button type="danger" link size="small" @click="removeRow(field, $index)">
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
            <el-button type="primary" size="small" class="add-row-btn" @click="addRow(field)">
              <el-icon><Plus /></el-icon>
              新增行
            </el-button>
          </div>

          <!-- 容器预览 -->
          <div v-else-if="isContainer(field)" class="preview-container-field">
            <div class="container-title">{{ field.title || field.label }}</div>
            <div class="container-body">
              <template v-for="child in field.children" :key="child.id">
                <div class="preview-field-item">
                  <div class="preview-field-label">
                    <span v-if="child.required" class="required-mark">*</span>
                    {{ child.label }}
                  </div>
                  <div class="preview-field-control">
                    <el-input
                        v-if="child.type==='input'"
                        :placeholder="child.props?.placeholder || `请输入${child.label}`"
                    />
                    <el-select
                        v-else-if="child.type==='select'"
                        style="width:100%"
                        :placeholder="child.props?.placeholder || `请选择${child.label}`"
                    />
                    <el-input v-else disabled placeholder="该组件类型暂不支持预览" />
                  </div>
                </div>
              </template>
            </div>
          </div>
        </template>

        <!-- 空状态 -->
        <el-empty v-if="formFields.length === 0" description="暂无表单组件" :image-size="80" />
      </div>
    </div>

    <template #footer>
      <el-button @click="dialogVisible = false">关闭预览</el-button>
      <el-button type="primary" @click="handleTestSubmit">
        <el-icon><Check /></el-icon>
        测试提交
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { QuestionFilled, Plus, Check } from '@element-plus/icons-vue'

const dialogVisible = ref(false)

const props = defineProps({
  formInfo: {
    type: Object,
    required: true
  },
  formFields: {
    type: Array,
    required: true
  }
})

// 打开预览
const open = () => {
  dialogVisible.value = true
}

// 判断是否为容器
const isContainer = (field) => {
  return ['grid', 'group', 'card'].includes(field.type)
}

// 判断是否为明细表
const isDetailTable = (field) => {
  return field.type.includes('Detail')
}

// 获取分类标签
const getCategoryLabel = (category) => {
  const map = {
    hr: '人事类',
    finance: '财务类',
    admin: '行政类',
    other: '其他'
  }
  return map[category] || category
}

// 明细表新增行
const addRow = (field) => {
  if (!field.rows) field.rows = []
  const newRow = {}
  field.columns.forEach(col => {
    newRow[col.code] = ''
  })
  field.rows.push(newRow)
  ElMessage.success('已新增行')
}

// 明细表删除行
const removeRow = (field, index) => {
  field.rows.splice(index, 1)
  ElMessage.success('已删除行')
}

// 测试提交
const handleTestSubmit = () => {
  ElMessage.success('测试提交成功（演示功能）')
}

defineExpose({
  open
})
</script>

<style scoped lang="scss">
.preview-container {
  .preview-header {
    padding-bottom: 20px;
    border-bottom: 2px solid #667eea;
    margin-bottom: 24px;

    h3 {
      margin: 0 0 12px 0;
      font-size: 20px;
      color: #303133;
      font-weight: 600;
    }

    .preview-meta {
      display: flex;
      align-items: center;
      gap: 12px;

      .preview-desc {
        font-size: 13px;
        color: #909399;
      }
    }
  }

  .preview-body {
    max-height: 60vh;
    overflow-y: auto;
    padding-right: 8px;

    // 普通字段
    .preview-field-item {
      margin-bottom: 20px;

      .preview-field-label {
        font-size: 14px;
        color: #606266;
        margin-bottom: 8px;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 4px;

        .required-mark {
          color: #f56c6c;
          font-weight: bold;
        }

        .help-icon {
          font-size: 14px;
          color: #909399;
          cursor: help;
        }
      }

      .preview-field-control {
        width: 100%;
      }
    }

    // 明细表
    .preview-detail-table {
      margin-bottom: 24px;
      padding: 16px;
      background: #f8f9fa;
      border-radius: 8px;
      border: 1px solid #e4e7ed;

      .preview-field-label {
        font-size: 15px;
        color: #303133;
        margin-bottom: 12px;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 4px;

        .required-mark {
          color: #f56c6c;
          font-weight: bold;
        }
      }

      .add-row-btn {
        margin-top: 12px;
      }
    }

    // 容器
    .preview-container-field {
      margin-bottom: 24px;
      padding: 16px;
      background: #fff;
      border: 1px solid #e4e7ed;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);

      .container-title {
        font-size: 15px;
        color: #303133;
        font-weight: 600;
        margin-bottom: 16px;
        padding-bottom: 12px;
        border-bottom: 1px solid #e4e7ed;
      }

      .container-body {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 16px;
      }
    }
  }
}
</style>
