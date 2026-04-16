<template>
  <el-dialog
      v-model="dialogVisible"
      width="750px"
      :close-on-click-modal="false"
      destroy-on-close
      @close="handleClose"
      class="delete-dialog"
  >
    <div class="dialog-header danger">
      <el-icon class="header-icon"><WarningFilled /></el-icon>
      <div class="header-text">
        <div class="header-title">危险操作</div>
        <div class="header-subtitle">请谨慎确认，删除后数据将无法恢复</div>
      </div>
    </div>

    <el-alert
        title="危险操作提示"
        type="error"
        :closable="false"
        show-icon
        class="danger-alert"
    >
      <template #title>
        <div class="alert-content">
          <div class="alert-text">
            <p><strong>删除后业务对象配置将永久丢失，无法恢复！</strong></p>
            <p>若业务对象已被表单或流程引用，删除后将导致这些功能无法使用。</p>
          </div>
        </div>
      </template>
    </el-alert>

    <div v-if="showList" class="delete-list">
      <div class="list-header">
        <el-icon><Document /></el-icon>
        <span>待删除对象列表（{{ deleteList.length }}个）</span>
      </div>
      <el-table
          :data="deleteList"
          border
          style="width: 100%"
          :cell-style="{ padding: '12px 0' }"
          :header-cell-style="{ background: '#fafafa', color: '#333', fontWeight: '600' }"
      >
        <el-table-column prop="name" label="对象名称" min-width="120" show-overflow-tooltip />
        <el-table-column prop="tableName" label="表名" min-width="130" show-overflow-tooltip />
        <el-table-column prop="formCount" label="关联表单" width="80" align="center" />
        <el-table-column prop="processCount" label="关联流程" width="80" align="center" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small" effect="light">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-form :model="formData" class="confirm-form">
      <el-form-item label="请输入&quot;确认删除&quot;" required>
        <el-input
            v-model="formData.confirmText"
            placeholder="请输入&quot;确认删除&quot;以继续"
            size="large"
            clearable
        >
          <template #prefix>
            <el-icon><Edit /></el-icon>
          </template>
        </el-input>
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose" size="default">取消</el-button>
        <el-button
            type="danger"
            @click="handleConfirm"
            :loading="loading"
            :disabled="!canDelete"
            size="default"
            class="confirm-btn"
        >
          <el-icon><Delete /></el-icon>
          确认删除
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { WarningFilled, Document, Edit, Delete } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: Boolean,
  selectedRows: Array,
  showList: Boolean
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const loading = ref(false)

const formData = reactive({
  confirmText: ''
})

const deleteList = computed(() => {
  return props.selectedRows.filter(row => row.status === 'draft')
})

const canDelete = computed(() => {
  return formData.confirmText === '确认删除'
})

const getStatusType = (status) => {
  const typeMap = {
    'draft': 'info',
    'published': 'success',
    'disabled': 'warning',
    'archived': 'danger'
  }
  return typeMap[status] || 'info'
}

const getStatusText = (status) => {
  const textMap = {
    'draft': '草稿',
    'published': '已发布',
    'disabled': '已停用',
    'archived': '已归档'
  }
  return textMap[status] || '未知'
}

const handleClose = () => {
  formData.confirmText = ''
  emit('update:modelValue', false)
}

const handleConfirm = async () => {
  if (!canDelete.value) {
    ElMessage.warning('请输入"确认删除"以继续')
    return
  }

  try {
    loading.value = true
    // 模拟提交
    setTimeout(() => {
      loading.value = false
      ElMessage.success('删除成功')
      emit('confirm', { ids: deleteList.value.map(item => item.id) })
      handleClose()
    }, 1000)
  } catch (error) {
    console.error('删除失败:', error)
  }
}
</script>
<style scoped lang="scss">
.delete-dialog {
  .el-dialog__header {
    padding: 0;
    border-bottom: none;
  }

  .dialog-header.danger {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 20px 24px 16px;
    background: linear-gradient(135deg, #f56c6c 0%, #e74c3c 100%);
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

  .danger-alert {
    margin-bottom: 20px;
    border-radius: 6px;
    border: none;

    :deep(.el-alert__content) {
      .alert-content {
        .alert-text {
          p {
            margin: 0 0 8px 0;
            font-size: 14px;
            line-height: 1.6;
            color: #606266;

            &:last-child {
              margin-bottom: 0;
            }
          }
        }
      }
    }
  }

  .delete-list {
    margin-bottom: 20px;

    .list-header {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
      color: #333;
      margin-bottom: 12px;
      font-size: 14px;

      .el-icon {
        color: #f56c6c;
      }
    }

    :deep(.el-table) {
      border-radius: 6px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

      .el-table__header th {
        background: #fafafa !important;
        color: #333;
        font-weight: 600;
        font-size: 14px;
      }

      .el-table__row:hover {
        background-color: #f5f7fa !important;
      }
    }
  }

  .confirm-form {
    :deep(.el-form-item) {
      margin-bottom: 0;

      .el-form-item__label {
        font-weight: 500;
        color: #333;
        font-size: 14px;
      }
    }

    :deep(.el-input__wrapper) {
      border-radius: 6px;
    }
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding: 16px 24px 0;
    border-top: 1px solid #ebeef5;

    .confirm-btn {
      min-width: 120px;
    }
  }
}
</style>