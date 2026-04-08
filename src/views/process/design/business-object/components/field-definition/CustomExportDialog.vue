<template>
  <el-dialog
      v-model="dialogVisible"
      title="自定义导出配置"
      width="900px"
      :close-on-click-modal="false"
      @close="handleClose"
  >
    <!-- 导出信息 -->
    <el-descriptions :column="2" border class="export-info">
      <el-descriptions-item label="业务对象">{{ businessObjectName }}</el-descriptions-item>
      <el-descriptions-item label="版本号">{{ version }}</el-descriptions-item>
      <el-descriptions-item label="所属业务域">{{ businessDomain }}</el-descriptions-item>
      <el-descriptions-item label="当前状态">
        <el-tag :type="getStatusType(status)" size="small">
          {{ getStatusText(status) }}
        </el-tag>
      </el-descriptions-item>
    </el-descriptions>

    <!-- 配置表单 -->
    <el-form :model="exportForm" label-width="120px" style="margin-top: 24px">
      <!-- 字段选择 -->
      <el-form-item label="选择导出字段">
        <div class="field-selection">
          <div class="selection-header">
            <el-checkbox v-model="selectAllFields" @change="handleSelectAllFields">全选</el-checkbox>
            <span class="selection-count">已选择 {{ selectedFields.length }} / {{ fieldList.length }} 个字段</span>
          </div>
          <div class="field-list">
            <el-checkbox-group v-model="selectedFields">
              <el-checkbox
                  v-for="field in fieldList"
                  :key="field.id"
                  :label="field.id"
                  class="field-item"
              >
                <span class="field-name">{{ field.fieldName }}</span>
                <span class="field-code">({{ field.fieldCode }})</span>
                <el-tag v-if="field.system" size="small" type="info" style="margin-left: 6px">系统</el-tag>
                <el-tag v-if="field.status === 'deprecated'" size="small" type="warning" style="margin-left: 6px">已废弃</el-tag>
              </el-checkbox>
            </el-checkbox-group>
          </div>
        </div>
      </el-form-item>

      <!-- 导出列选择 -->
      <el-form-item label="选择导出属性">
        <div class="column-selection">
          <div class="selection-header">
            <el-checkbox v-model="selectAllColumns" @change="handleSelectAllColumns">全选</el-checkbox>
            <span class="selection-count">已选择 {{ selectedColumns.length }} / {{ exportColumns.length }} 个属性</span>
          </div>
          <div class="column-list">
            <el-checkbox-group v-model="selectedColumns">
              <el-checkbox
                  v-for="column in exportColumns"
                  :key="column.value"
                  :label="column.value"
                  class="column-item"
              >
                {{ column.label }}
              </el-checkbox>
            </el-checkbox-group>
          </div>
        </div>
      </el-form-item>

      <!-- 导出格式 -->
      <el-form-item label="导出格式">
        <el-radio-group v-model="exportForm.format">
          <el-radio label="excel" border>
            <el-icon style="margin-right: 4px"><Document /></el-icon>
            Excel（可编辑）
          </el-radio>
          <el-radio label="pdf" border>
            <el-icon style="margin-right: 4px"><Reading /></el-icon>
            PDF（审计存档）
          </el-radio>
        </el-radio-group>
        <el-alert
            v-if="exportForm.format === 'pdf'"
            type="info"
            :closable="false"
            show-icon
            style="margin-top: 12px"
        >
          <template #title>
            <span>PDF 格式用于审计存档，文件生成后不可修改，符合金融合规要求</span>
          </template>
        </el-alert>
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button
            type="primary"
            @click="handleConfirm"
            :disabled="!canExport"
        >
          确认导出
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Document, Reading } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: Boolean,
  fieldList: {
    type: Array,
    default: () => []
  },
  businessObjectName: {
    type: String,
    default: '请假申请'
  },
  version: {
    type: String,
    default: 'V1.0'
  },
  businessDomain: {
    type: String,
    default: '人事类'
  },
  status: {
    type: String,
    default: 'draft'
  }
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

// 导出配置表单
const exportForm = ref({
  format: 'excel'
})

// 选中的字段
const selectedFields = ref([])
const selectAllFields = ref(true)

// 选中的列
const selectedColumns = ref([])
const selectAllColumns = ref(true)

// 可导出的属性列配置
const exportColumns = [
  { label: '字段名称', value: 'fieldName' },
  { label: '数据库列名', value: 'fieldCode' },
  { label: '字段类型', value: 'dataType' },
  { label: '长度', value: 'length' },
  { label: '必填', value: 'required' },
  { label: '唯一', value: 'unique' },
  { label: '列表显示', value: 'listVisible' },
  { label: '敏感等级', value: 'sensitiveLevel' },
  { label: '系统内置', value: 'system' },
  { label: '状态', value: 'status' },
  { label: '排序', value: 'sort' }
]

// 判断是否可以导出
const canExport = computed(() => {
  return selectedFields.value.length > 0 && selectedColumns.value.length > 0
})

// 监听弹窗打开
watch(dialogVisible, (val) => {
  if (val) {
    initForm()
  }
})

// 初始化表单
const initForm = () => {
  // 默认全选字段
  selectedFields.value = props.fieldList.map(f => f.id)
  selectAllFields.value = true

  // 默认全选列
  selectedColumns.value = exportColumns.map(c => c.value)
  selectAllColumns.value = true

  // 默认格式
  exportForm.value.format = 'excel'
}

// 全选/取消全选字段
const handleSelectAllFields = (val) => {
  if (val) {
    selectedFields.value = props.fieldList.map(f => f.id)
  } else {
    selectedFields.value = []
  }
}

// 全选/取消全选列
const handleSelectAllColumns = (val) => {
  if (val) {
    selectedColumns.value = exportColumns.map(c => c.value)
  } else {
    selectedColumns.value = []
  }
}

// 确认导出
const handleConfirm = () => {
  emit('confirm', {
    selectedFields: selectedFields.value,
    selectedColumns: selectedColumns.value,
    format: exportForm.value.format
  })
  handleClose()
}

// 关闭弹窗
const handleClose = () => {
  dialogVisible.value = false
}

// 获取状态类型
const getStatusType = (status) => {
  const types = {
    draft: 'info',
    published: 'success',
    deprecated: 'warning',
    archived: 'danger'
  }
  return types[status] || 'info'
}

// 获取状态文本
const getStatusText = (status) => {
  const texts = {
    draft: '草稿',
    published: '已发布',
    deprecated: '已停用',
    archived: '已归档'
  }
  return texts[status] || status
}
</script>

<style scoped lang="scss">
.export-info {
  :deep(.el-descriptions__label) {
    font-weight: 600;
    background: #f5f7fa;
  }
}

// 字段选择区域
.field-selection,
.column-selection {
  width: 100%;

  .selection-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    padding: 10px 14px;
    background: #f5f7fa;
    border-radius: 6px;

    .selection-count {
      font-size: 13px;
      color: #606266;
    }
  }
}

// 字段列表
.field-list {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  padding: 12px;
  background: #fafafa;

  .field-item {
    display: flex;
    align-items: center;
    width: 100%;
    padding: 8px 12px;
    margin-bottom: 6px;
    border-radius: 4px;
    transition: all 0.2s;

    &:hover {
      background: #fff;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }

    &:last-child {
      margin-bottom: 0;
    }

    .field-name {
      font-size: 14px;
      color: #303133;
      font-weight: 500;
    }

    .field-code {
      font-size: 12px;
      color: #909399;
      margin-left: 8px;
    }
  }
}

// 列选择列表
.column-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  padding: 12px;
  background: #fafafa;
  border: 1px solid #e4e7ed;
  border-radius: 6px;

  .column-item {
    padding: 10px 12px;
    border-radius: 4px;
    transition: all 0.2s;

    &:hover {
      background: #fff;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }
  }
}

// 底部按钮区
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 8px;

  .el-button {
    min-width: 80px;
  }
}

// 单选按钮组优化
:deep(.el-radio-group) {
  display: flex;
  gap: 16px;

  .el-radio.is-bordered {
    padding: 12px 20px;
    border-radius: 6px;
    transition: all 0.3s;

    &:hover {
      border-color: #409eff;
    }

    &.is-checked {
      border-color: #409eff;
      background: #ecf5ff;
    }
  }
}
</style>
