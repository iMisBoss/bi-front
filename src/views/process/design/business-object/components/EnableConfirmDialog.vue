<template>
  <el-dialog
      v-model="dialogVisible"
      width="600px"
      :close-on-click-modal="false"
      @close="handleClose"
      class="enable-dialog"
  >
    <div class="dialog-header success">
      <el-icon class="header-icon"><CircleCheckFilled /></el-icon>
      <span class="header-title">确认启用该业务对象？</span>
    </div>

    <div class="dialog-content">
      <!-- 校验失败提示 -->
      <div v-if="validationErrors.length > 0" class="error-section">
        <div class="error-header">
          <el-icon class="error-icon"><WarningFilled /></el-icon>
          <span class="error-title">启用失败</span>
        </div>
        <div class="error-list">
          <p class="error-intro">系统检测到该业务对象存在以下异常，无法启用：</p>
          <ol class="error-items">
            <li v-for="(error, index) in validationErrors" :key="index">
              {{ error }}
            </li>
          </ol>
          <p class="error-tip">请先编辑修复异常后，再执行启用操作。</p>
        </div>
      </div>

      <!-- 校验通过提示 -->
      <div v-else class="success-section">
        <div class="success-info">
          <el-icon class="success-icon"><SuccessFilled /></el-icon>
          <span>启用后，该业务对象将恢复上线，对应权限的人员可正常发起相关审批流程。</span>
        </div>

        <!-- 强合规业务域需要填写启用原因 -->
        <el-form v-if="requireReason" :model="form" class="reason-form">
          <el-form-item label="启用原因（选填）">
            <el-input
                v-model="form.reason"
                type="textarea"
                :rows="3"
                placeholder="请填写启用原因（选填，用于审计追溯）"
                maxlength="200"
                show-word-limit
            />
          </el-form-item>
        </el-form>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button
            v-if="validationErrors.length > 0"
            type="primary"
            @click="handleGoEdit"
        >
          前往编辑
        </el-button>
        <el-button
            v-else
            type="success"
            @click="handleConfirm"
            :loading="loading"
        >
          确认启用
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { CircleCheckFilled, WarningFilled, SuccessFilled } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: Boolean,
  data: Object
})

const emit = defineEmits(['update:modelValue', 'confirm', 'edit'])

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const loading = ref(false)

const form = reactive({
  reason: ''
})

// 模拟系统校验结果（实际应从后端获取）
const validationErrors = ref([])

// 判断是否为强合规业务域
const requireReason = computed(() => {
  if (!props.data?.domain) return false
  const complianceDomains = ['财务类', '风控类', '信贷类']
  return complianceDomains.includes(props.data.domain)
})

watch(dialogVisible, (newVal) => {
  if (newVal) {
    form.reason = ''
    // TODO: 调用后端接口进行前置校验
    // validateBeforeEnable(props.data?.id).then(res => {
    //   validationErrors.value = res.errors || []
    // })

    // 模拟校验通过
    validationErrors.value = []
  }
})

const handleClose = () => {
  emit('update:modelValue', false)
}

const handleConfirm = async () => {
  loading.value = true
  emit('confirm', {
    ...props.data,
    reason: form.reason,
    action: 'enable'
  })

  setTimeout(() => {
    loading.value = false
    handleClose()
  }, 1000)
}

const handleGoEdit = () => {
  emit('edit', props.data)
  handleClose()
}
</script>

<style scoped lang="scss">
.enable-dialog {
  .dialog-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 20px 24px;
    border-radius: 8px 8px 0 0;

    &.success {
      background: linear-gradient(135deg, #67c23a 0%, #529b2e 100%);
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

    .error-section {
      background: #fef0f0;
      border: 1px solid #fbc4c4;
      border-radius: 8px;
      padding: 16px;

      .error-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 12px;

        .error-icon {
          font-size: 20px;
          color: #f56c6c;
        }

        .error-title {
          font-size: 16px;
          font-weight: 600;
          color: #f56c6c;
        }
      }

      .error-list {
        .error-intro {
          font-size: 14px;
          color: #606266;
          margin-bottom: 12px;
        }

        .error-items {
          padding-left: 20px;
          margin-bottom: 12px;

          li {
            font-size: 14px;
            color: #f56c6c;
            line-height: 2;
            font-weight: 500;
          }
        }

        .error-tip {
          font-size: 13px;
          color: #909399;
        }
      }
    }

    .success-section {
      .success-info {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        padding: 16px;
        background: #f0f9eb;
        border: 1px solid #c2e7b0;
        border-radius: 8px;
        font-size: 14px;
        line-height: 1.8;
        color: #606266;

        .success-icon {
          font-size: 20px;
          color: #67c23a;
          flex-shrink: 0;
          margin-top: 2px;
        }
      }

      .reason-form {
        margin-top: 20px;

        :deep(.el-form-item__label) {
          font-weight: 500;
          color: #303133;
        }
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
