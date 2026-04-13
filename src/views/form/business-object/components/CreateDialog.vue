<template>
  <el-dialog
      v-model="dialogVisible"
      width="750px"
      :close-on-click-modal="false"
      destroy-on-close
      @close="handleClose"
      class="create-dialog"
  >
    <div class="dialog-header">
      <el-icon class="header-icon"><Document /></el-icon>
      <div class="header-text">
        <div class="header-title">创建业务对象</div>
        <div class="header-subtitle">定义业务表结构，支持字段、关联、索引配置</div>
      </div>
    </div>

    <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="110px"
        label-position="left"
        class="create-form"
    >
      <el-form-item label="业务对象名称" prop="name">
        <el-input
            v-model="formData.name"
            placeholder="如：员工转正申请单"
            size="large"
            @input="handleNameInput"
            clearable
        >
          <template #prefix>
            <el-icon><Edit /></el-icon>
          </template>
        </el-input>
      </el-form-item>

      <el-form-item label="数据库表名" prop="tableName">
        <el-input
            v-model="formData.tableName"
            size="large"
            disabled
            class="table-name-input"
        >
          <template #prefix>
            <span class="table-prefix">biz_</span>
          </template>
          <template #suffix>
            <el-tooltip content="系统自动生成，前缀不可修改" placement="top">
              <el-icon><InfoFilled /></el-icon>
            </el-tooltip>
          </template>
        </el-input>
      </el-form-item>

      <el-form-item label="所属业务域" prop="domain">
        <el-select
            v-model="formData.domain"
            placeholder="请选择业务域"
            size="large"          style="width: 100%"
            clearable
        >
          <el-option label="人事类" value="hr">
            <span class="domain-option"><el-icon><User /></el-icon> 人事类</span>
          </el-option>
          <el-option label="财务类" value="finance">
            <span class="domain-option"><el-icon><Money /></el-icon> 财务类</span>
          </el-option>
          <el-option label="行政类" value="admin">
            <span class="domain-option"><el-icon><OfficeBuilding /></el-icon> 行政类</span>
          </el-option>
          <el-option label="风控类" value="risk">
            <span class="domain-option"><el-icon><Warning /></el-icon> 风控类</span>
          </el-option>
          <el-option label="信贷类" value="loan">
            <span class="domain-option"><el-icon><Coin /></el-icon> 信贷类</span>
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="继承通用字段">
        <el-checkbox
            v-model="formData.inheritFields"
            :checked="true"
            disabled
            class="inherit-checkbox"
        >
          <div class="checkbox-content">
            <span>自动添加 10 个通用字段</span>
            <el-tooltip placement="top">
              <template #content>
                <div>id、bill_no、process_instance_id、<br>creator、create_time、modifier、<br>modify_time、status、remark、tenant_id</div>
              </template>
              <el-icon class="tooltip-icon"><QuestionFilled /></el-icon>
            </el-tooltip>
          </div>
        </el-checkbox>
      </el-form-item>

      <el-form-item label="备注">
        <el-input
            v-model="formData.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注（选填）"
            resize="none"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose" size="default">取消</el-button>
        <el-button
            type="primary"
            @click="handleConfirm"
            :loading="loading"
            size="default"
            class="confirm-btn"
        >
          <el-icon><Check /></el-icon>
          确定
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Document, Edit, InfoFilled, User, Money, OfficeBuilding, Warning, Coin, QuestionFilled, Check } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: Boolean
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const formRef = ref(null)
const loading = ref(false)

const formData = reactive({
  name: '',
  tableName: '',
  domain: '',
  inheritFields: true,
  remark: ''
})

const formRules = {
  name: [{ required: true, message: '请输入业务对象名称', trigger: 'blur' }],
  domain: [{ required: true, message: '请选择所属业务域', trigger: 'change' }]
}

// 中文转下划线小写
const chineseToPinyin = (str) => {
  // 简单实现，实际项目中应使用拼音库
  return str.replace(/[\u4e00-\u9fa5]/g, (char) => {
    return char.charCodeAt(0).toString(16)
  }).replace(/\s+/g, '_')
}

const handleNameInput = () => {
  if (formData.name) {
    const pinyin = chineseToPinyin(formData.name)
    formData.tableName = `${pinyin}`
  } else {
    formData.tableName = ''
  }
}

const handleClose = () => {
  formRef.value?.resetFields()
  formData.name = ''
  formData.tableName = ''
  formData.domain = ''
  formData.inheritFields = true
  formData.remark = ''
  emit('update:modelValue', false)
}

const handleConfirm = async () => {
  try {
    await formRef.value.validate()
    loading.value = true

    // 模拟提交
    setTimeout(() => {
      loading.value = false
      ElMessage.success('创建成功，正在跳转到编辑页')
      emit('confirm', { ...formData })
      handleClose()
    }, 1000)
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}
</script>
<style scoped lang="scss">.create-dialog {
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
      font-size: 32px;
      color: #fff;
      flex-shrink: 0;
    }

    .header-text {
      flex: 1;

      .header-title {
        font-size: 18px;
        font-weight: 600;
        color: #fff;
        margin-bottom: 4px;
      }

      .header-subtitle {
        font-size: 13px;
        color: rgba(255, 255, 255, 0.9);
      }
    }
  }

  .create-form {
    padding: 0 8px;

    :deep(.el-form-item) {
      margin-bottom: 20px;

      .el-form-item__label {
        font-weight: 500;
        color: #333;
        font-size: 14px;
      }
    }

    :deep(.el-input__wrapper) {
      border-radius: 6px;
      box-shadow: 0 0 0 1px #dcdfe6 inset;
      transition: all 0.3s;

      &:hover {
        box-shadow: 0 0 0 1px #c0c4cc inset;
      }

      &.is-focus {
        box-shadow: 0 0 0 1px #667eea inset;
      }
    }

    .table-name-input {
      :deep(.el-input__inner) {
        background-color: #f5f7fa;
        color: #606266;
      }

      .table-prefix {
        font-weight: 600;
        color: #667eea;
        margin-right: 4px;
      }
    }

    :deep(.el-textarea__inner) {
      border-radius: 6px;
      resize: none;
    }

    .domain-option {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .inherit-checkbox {
      :deep(.el-checkbox__label) {
        width: 100%;
        font-weight: 500;
      }

      .checkbox-content {
        display: flex;
        align-items: center;
        gap: 8px;

        .tooltip-icon {
          color: #909399;
          cursor: pointer;

          &:hover {
            color: #667eea;
          }
        }
      }
    }
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding: 16px 24px 0;
    border-top: 1px solid #ebeef5;

    .confirm-btn {
      min-width: 100px;
    }
  }
}
</style>