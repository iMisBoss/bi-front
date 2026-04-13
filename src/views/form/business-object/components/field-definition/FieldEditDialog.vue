<template>
  <el-dialog
      v-model="dialogVisible"
      width="600px"
      :close-on-click-modal="false"
      @close="handleClose"
      class="field-edit-dialog"
      append-to-body
  >
    <div class="dialog-header">
      <el-icon class="header-icon"><Document /></el-icon>
      <div class="header-text">
        <div class="header-title">{{ dialogTitle }}</div>
        <div class="header-subtitle">{{ dialogSubtitle }}</div>
      </div>
    </div>

    <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="120px"
        class="edit-form"
    >
      <el-form-item prop="fieldName">
        <template #label>
          <span>字段名称</span>
          <el-tooltip v-if="isNonCoreEdit" content="原字段名称已锁定，不可修改" placement="top">
            <el-icon class="label-tip-icon"><InfoFilled /></el-icon>
          </el-tooltip>
        </template>
        <el-input
            v-model="formData.fieldName"
            placeholder="如：申请人"
            :disabled="isNonCoreEdit"
        />
      </el-form-item>

      <el-form-item prop="fieldCode">
        <template #label>
          <span>数据库列名</span>
          <el-tooltip v-if="isNonCoreEdit" content="原字段列名已锁定，不可修改" placement="top">
            <el-icon class="label-tip-icon"><InfoFilled /></el-icon>
          </el-tooltip>
          <el-tooltip v-else-if="isEditExistingField" content="已存在字段列名不可修改" placement="top">
            <el-icon class="label-tip-icon"><InfoFilled /></el-icon>
          </el-tooltip>
        </template>
        <el-input
            v-model="formData.fieldCode"
            placeholder="如：applicant"
            :disabled="isNonCoreEdit || isEditExistingField"
        />
      </el-form-item>

      <el-form-item prop="dataType">
        <template #label>
          <span>字段类型</span>
          <el-tooltip v-if="isNonCoreEdit" content="原字段类型已锁定，不可修改" placement="top">
            <el-icon class="label-tip-icon"><InfoFilled /></el-icon>
          </el-tooltip>
        </template>
        <el-select
            v-model="formData.dataType"            style="width: 100%"
            :disabled="isNonCoreEdit"
        >
          <el-option label="BIGINT - 长整型" value="BIGINT" />
          <el-option label="VARCHAR(64) - 字符串 (64)" value="VARCHAR(64)" />
          <el-option label="VARCHAR(128) - 字符串 (128)" value="VARCHAR(128)" />
          <el-option label="VARCHAR(255) - 字符串 (255)" value="VARCHAR(255)" />
          <el-option label="TEXT - 长文本" value="TEXT" />
          <el-option label="DATETIME - 日期时间" value="DATETIME" />
          <el-option label="DATE - 日期" value="DATE" />
          <el-option label="INT - 整型" value="INT" />
          <el-option label="DECIMAL(10,2) - 金额" value="DECIMAL(10,2)" />
          <el-option label="BOOLEAN - 布尔值" value="BOOLEAN" />
        </el-select>
      </el-form-item>

      <el-form-item>
        <template #label>
          <span>长度</span>
          <el-tooltip v-if="isNonCoreEdit" content="原字段长度已锁定，不可修改" placement="top">
            <el-icon class="label-tip-icon"><InfoFilled /></el-icon>
          </el-tooltip>
        </template>
        <el-input-number
            v-model="formData.length"
            :min="1"
            :max="9999"
            :disabled="!isLengthEditable || isNonCoreEdit"            style="width: 100%"
        />
      </el-form-item>

      <el-form-item>
        <template #label>
          <span>默认值</span>
          <el-tooltip v-if="isNonCoreEdit" content="原字段默认值已锁定，不可修改" placement="top">
            <el-icon class="label-tip-icon"><InfoFilled /></el-icon>
          </el-tooltip>
        </template>
        <el-input
            v-model="formData.defaultValue"
            placeholder="字段默认值"
            :disabled="isNonCoreEdit"
        />
      </el-form-item>

      <el-form-item>
        <template #label>
          <span>字段属性</span>
          <el-tooltip v-if="isNonCoreEdit" content="原字段必填、唯一属性已锁定" placement="top">
            <el-icon class="label-tip-icon"><InfoFilled /></el-icon>
          </el-tooltip>
        </template>
        <el-space>
          <el-checkbox
              v-model="formData.required"
              :disabled="isNonCoreEdit"
          >
            必填
          </el-checkbox>

          <el-checkbox
              v-model="formData.unique"
              :disabled="isNonCoreEdit"
          >
            唯一
          </el-checkbox>

          <el-checkbox v-model="formData.listVisible">列表显示</el-checkbox>
        </el-space>
      </el-form-item>

      <el-form-item label="敏感等级">
        <el-radio-group v-model="formData.sensitiveLevel">
          <el-radio label="normal">普通</el-radio>
          <el-radio label="internal">内部</el-radio>
          <el-radio label="sensitive">敏感</el-radio>
          <el-radio label="highly_sensitive">高度敏感</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="字段说明">
        <el-input
            v-model="formData.description"
            type="textarea"
            :rows="2"
            placeholder="请填写字段的业务用途"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleConfirm" :loading="loading">确定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { Document, InfoFilled } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: Boolean,
  title: {
    type: String,
    default: '新增字段'
  },
  subtitle: {
    type: String,
    default: '配置字段属性'
  },
  fieldData: {
    type: Object,
    default: null
  },
  isNonCoreEdit: {
    type: Boolean,
    default: false
  },
  isVersionEdit: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'confirm'])

// 判断是否为编辑已存在字段
const isEditExistingField = computed(() => {
  return props.fieldData && props.fieldData.id && !props.fieldData.isNewField
})

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const formRef = ref(null)
const loading = ref(false)

const dialogTitle = ref(props.title)
const dialogSubtitle = ref(props.subtitle)

const formData = reactive({
  fieldName: '',
  fieldCode: '',
  dataType: 'VARCHAR(64)',
  length: null,
  defaultValue: '',
  required: false,
  unique: false,
  listVisible: false,
  sensitiveLevel: 'normal',
  description: ''
})

const formRules = {
  fieldName: [
    { required: true, message: '请输入字段名称', trigger: 'blur' }
  ],
  fieldCode: [
    { required: true, message: '请输入数据库列名', trigger: 'blur' },
    { pattern: /^[a-z_][a-z0-9_]*$/, message: '只能包含小写字母、数字和下划线', trigger: 'blur' }
  ],
  dataType: [
    { required: true, message: '请选择字段类型', trigger: 'change' }
  ]
}

// 判断长度字段是否可编辑
const isLengthEditable = computed(() => {
  const editableTypes = ['VARCHAR(64)', 'VARCHAR(128)', 'VARCHAR(255)', 'BIGINT', 'INT']
  return editableTypes.includes(formData.dataType)
})

// 监听弹窗打开，初始化数据
watch(dialogVisible, (newVal) => {
  if (newVal) {
    // 等待下一个 tick 确保 props.fieldData 已更新
    setTimeout(() => {
      if (props.fieldData) {
        // 编辑模式：填充数据
        initForm()
      } else {
        // 新增模式：重置表单
        resetForm()
      }
    }, 0)
  }
})

// 初始化表单数据（编辑模式）
const initForm = () => {
  formData.fieldName = props.fieldData.fieldName || ''
  formData.fieldCode = props.fieldData.fieldCode || ''
  formData.dataType = props.fieldData.dataType || 'VARCHAR(64)'
  formData.length = props.fieldData.length || null
  formData.defaultValue = props.fieldData.defaultValue || ''
  formData.required = props.fieldData.required || false
  formData.unique = props.fieldData.unique || false
  formData.listVisible = props.fieldData.listVisible || false
  formData.sensitiveLevel = props.fieldData.sensitiveLevel || 'normal'
  formData.description = props.fieldData.description || ''
}

// 关闭弹窗
const handleClose = () => {
  resetForm()
  emit('update:modelValue', false)
}

// 取消
const handleCancel = () => {
  emit('update:modelValue', false)
}

// 确定
const handleConfirm = async () => {
  try {
    await formRef.value.validate()
    loading.value = true

    setTimeout(() => {
      loading.value = false
      emit('confirm', { ...formData })
      emit('update:modelValue', false)
    }, 500)
  } catch (error) {
    console.error('验证失败:', error)
  }
}

// 重置表单（新增模式）
const resetForm = () => {
  formData.fieldName = ''
  formData.fieldCode = ''
  formData.dataType = 'VARCHAR(64)'
  formData.length = null
  formData.defaultValue = ''
  formData.required = false
  formData.unique = false
  formData.listVisible = false
  formData.sensitiveLevel = 'normal'
  formData.description = ''

  // 清除验证状态
  setTimeout(() => {
    formRef.value?.clearValidate()
  }, 0)
}

defineExpose({
  resetForm
})
</script>

<style scoped lang="scss">
.field-edit-dialog {
  .el-dialog__header {
    padding: 0;
    border-bottom: none;
  }

  .dialog-header {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 20px 24px 16px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 8px 8px 0 0;
    margin: -24px -24px 20px;

    .header-icon {
      font-size: 28px;
      color: #fff;
      flex-shrink: 0;
    }

    .header-text {
      flex: 1;

      .header-title {
        font-size: 16px;
        font-weight: 600;
        color: #fff;
        margin-bottom: 4px;
      }

      .header-subtitle {
        font-size: 12px;
        color: rgba(255, 255, 255, 0.9);
      }
    }
  }

  .edit-form {
    padding: 10px 20px;

    .el-form-item {
      margin-bottom: 18px;
    }

    // 标签旁的 tooltip 图标样式
    .label-tip-icon {
      color: #909399;
      font-size: 14px;
      margin-left: 6px;
      cursor: pointer;
      vertical-align: middle;

      &:hover {
        color: #606266;
      }
    }
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding: 16px 24px 0;
    border-top: 1px solid #ebeef5;
  }
}
</style>
