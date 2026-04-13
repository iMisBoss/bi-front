<template>
  <el-dialog
      v-model="dialogVisible"
      width="600px"
      :close-on-click-modal="false"
      @close="handleClose"
      class="disable-dialog"
  >
    <div class="dialog-header warning">
      <el-icon class="header-icon"><WarningFilled /></el-icon>
      <span class="header-title">确认停用该业务对象？</span>
    </div>

    <div class="dialog-content">
      <!-- 核心影响区 -->
      <div class="impact-section">
        <div class="impact-item">
          <span class="label">业务对象名称：</span>
          <span class="value">{{ data?.name }}</span>
        </div>
        <div class="impact-item">
          <span class="label">关联审批流程：</span>
          <span class="value highlight">{{ data?.processCount || 0 }}个</span>
        </div>
        <div class="impact-item">
          <span class="label">当前未办结审批单：</span>
          <span class="value highlight">{{ data?.pendingCount || 0 }}条</span>
        </div>
        <div class="impact-rule">
          <el-icon class="rule-icon"><InfoFilled /></el-icon>
          <div class="rule-content">
            <span>停用规则：</span>
            <strong>停用后将禁止所有人员新发起审批</strong>，已发起的未办结审批单可正常流转至办结，历史数据可正常查看、导出。
          </div>
        </div>
      </div>

      <!-- 操作原因 -->
      <el-form :model="form" class="reason-form">
        <el-form-item
            :label="requireReason ? '停用原因' : '停用原因（选填）'"
            :required="requireReason"
        >
          <el-input
              v-model="form.reason"
              type="textarea"
              :rows="3"
              :placeholder="requireReason ? '请填写停用原因（必填，用于审计追溯）' : '请填写停用原因（选填）'"
              maxlength="200"
              show-word-limit
          />
        </el-form-item>
      </el-form>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button
            type="danger"
            @click="handleConfirm"
            :loading="loading"
            :disabled="requireReason && !form.reason"
        >
          确认停用
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { WarningFilled, InfoFilled } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: Boolean,
  data: Object
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const loading = ref(false)

const form = reactive({
  reason: ''
})

// 判断是否为强合规业务域（财务、风控、信贷）
const requireReason = computed(() => {
  if (!props.data?.domain) return false
  const complianceDomains = ['财务类', '风控类', '信贷类']
  return complianceDomains.includes(props.data.domain)
})

watch(dialogVisible, (newVal) => {
  if (newVal) {
    form.reason = ''
  }
})

const handleClose = () => {
  emit('update:modelValue', false)
}

const handleConfirm = async () => {
  if (requireReason.value && !form.reason.trim()) {
    return
  }

  loading.value = true
  emit('confirm', {
    ...props.data,
    reason: form.reason,
    action: 'disable'
  })

  setTimeout(() => {
    loading.value = false
    handleClose()
  }, 1000)
}
</script>

<style scoped lang="scss">
.disable-dialog {
  .dialog-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 20px 24px;
    border-radius: 8px 8px 0 0;

    &.warning {
      background: linear-gradient(135deg, #f56c6c 0%, #d93025 100%);
    }

    .header-icon {
      font-size: 28px;
      color: #fff;
    }

    .header-title {
      font-size: 18px;
      font-weight: 600;
      color: #fff;
    }
  }

  .dialog-content {
    padding: 24px;

    .impact-section {
      background: #fff5f5;
      border: 1px solid #feb2b2;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 20px;

      .impact-item {
        display: flex;
        align-items: center;
        margin-bottom: 12px;
        font-size: 14px;

        &:last-of-type {
          margin-bottom: 16px;
        }

        .label {
          color: #606266;
          min-width: 140px;
        }

        .value {
          color: #303133;
          font-weight: 500;

          &.highlight {
            color: #f56c6c;
            font-weight: 600;
          }
        }
      }

      .impact-rule {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        padding: 12px;
        background: #fff;
        border-radius: 6px;
        font-size: 13px;
        line-height: 1.6;
        color: #606266;

        .rule-icon {
          color: #f56c6c;
          font-size: 16px;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .rule-content {
          flex: 1;

          strong {
            color: #f56c6c;
            font-weight: 600;
          }
        }
      }
    }

    .reason-form {
      :deep(.el-form-item__label) {
        font-weight: 500;
        color: #303133;
      }
    }
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding: 16px 24px;
    border-top: 1px solid #ebeef5;

    .el-button {
      padding: 10px 24px;
      font-weight: 500;
    }
  }
}
</style>
