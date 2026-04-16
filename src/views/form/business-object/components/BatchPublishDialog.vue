<template>
  <el-dialog
      v-model="dialogVisible"
      width="750px"
      :close-on-click-modal="false"
      destroy-on-close
      @close="handleClose"
      class="publish-dialog"
  >
    <div class="dialog-header">
      <el-icon class="header-icon"><CircleCheck /></el-icon>
      <div class="header-text">
        <div class="header-title">批量发布业务对象</div>
        <div class="header-subtitle">发布后将生成数据库表结构，请谨慎操作</div>
      </div>
    </div>

    <el-alert
        title="重要提示"
        type="warning"
        :closable="false"
        show-icon
        class="important-alert"
    >
      <template #title>
        <div class="alert-content">
          <span class="alert-icon"><el-icon><Warning /></el-icon></span>
          <div class="alert-text">
            <p>1. 发布后将生成数据库表结构，已发布的字段不可删除或修改类型</p>
            <p>2. 生产环境禁止系统自动执行 SQL，请下载脚本提交 DBA 审核</p>
          </div>
        </div>
      </template>
    </el-alert>

    <!-- 待发布对象列表 -->
    <div class="publish-section">
      <div class="section-title">
        <el-icon><Document /></el-icon>
        <span>待发布对象列表（{{ selectedRows.length }}个）</span>
      </div>

      <el-table
          :data="selectedRows"
          border
          style="width: 100%"
          max-height="300"
          @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="40" :selectable="isRowSelectable" />
        <el-table-column prop="name" label="对象名称" min-width="150" show-overflow-tooltip />
        <el-table-column prop="tableName" label="表名" min-width="200" show-overflow-tooltip />
        <el-table-column prop="domain" label="业务域" width="120" />
        <el-table-column label="发布状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.status === 'published'" type="success" size="small">已发布</el-tag>
            <el-tag v-else type="warning" size="small">待发布</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 变更说明 -->
    <el-form :model="publishForm" label-width="80px" class="publish-form">
      <el-form-item label="变更说明" required>
        <el-input
            v-model="publishForm.changeDescription"
            type="textarea"
            :rows="3"
            placeholder="必填，记录本次发布的变更内容，用于审计"
            maxlength="500"
            show-word-limit
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <div class="footer-left">
          <el-button @click="handleDownloadSQL" :disabled="!hasSelectedItems" icon="Download">
            下载 SQL 脚本
          </el-button>
        </div>
        <div class="footer-right">
          <el-button @click="handleClose">取消</el-button>
          <el-button
              type="primary"
              @click="handlePublish"
              :loading="loading"
              :disabled="!hasSelectedItems"
              icon="CircleCheck"
          >
            确认发布
          </el-button>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { CircleCheck, Document, Download, Warning } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: Boolean,
  selectedRows: Array
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const loading = ref(false)

// 发布表单
const publishForm = reactive({
  changeDescription: ''
})

// 已选择的发布项
const checkedPublishItems = ref([])

// 表格选择变化
const handleSelectionChange = (selection) => {
  checkedPublishItems.value = selection.map(item => item.id)
}

// 是否有已选择的项目
const hasSelectedItems = computed(() => {
  return checkedPublishItems.value.length > 0
})

// 判断行是否可选
const isRowSelectable = (row) => {
  return row.status !== 'published'
}

const handleClose = () => {
  publishForm.changeDescription = ''
  checkedPublishItems.value = []
  emit('update:modelValue', false)
}

// 下载 SQL 脚本
const handleDownloadSQL = async () => {
  if (!hasSelectedItems.value) {
    ElMessage.warning('请选择要发布的内容')
    return
  }

  try {
    loading.value = true

    // 模拟下载
    setTimeout(() => {
      loading.value = false
      ElMessage.success('SQL 脚本已下载')

      // TODO: 调用 API 下载 SQL 脚本
      console.log('下载 SQL 脚本:', {
        ids: checkedPublishItems.value,
        changeDescription: publishForm.changeDescription
      })
    }, 1000)
  } catch (error) {
    console.error('下载失败:', error)
  }
}

// 确认发布
const handlePublish = async () => {
  if (!hasSelectedItems.value) {
    ElMessage.warning('请选择要发布的内容')
    return
  }

  if (!publishForm.changeDescription.trim()) {
    ElMessage.warning('请填写变更说明')
    return
  }

  try {
    loading.value = true

    // 模拟发布
    setTimeout(() => {
      loading.value = false
      ElMessage.success('发布成功')

      emit('confirm', {
        ids: checkedPublishItems.value,
        changeDescription: publishForm.changeDescription
      })

      handleClose()
    }, 1500)
  } catch (error) {
    console.error('发布失败:', error)
  }
}
</script>
<style scoped lang="scss">
.publish-dialog {
  .el-dialog__header {
    padding: 0;
    border-bottom: none;
  }

  .dialog-header {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 20px 24px 16px;
    background: linear-gradient(135deg, #67c23a 0%, #52c41a 100%);
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

  .important-alert {
    margin-bottom: 20px;
    border-radius: 6px;
    border: none;

    :deep(.el-alert__content) {
      .alert-content {
        display: flex;
        gap: 12px;
        align-items: flex-start;

        .alert-icon {
          font-size: 18px;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .alert-text {
          flex: 1;

          p {
            margin: 0 0 6px 0;
            font-size: 13px;
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

  .publish-list {
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
        color: #667eea;
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

  .remark-form {
    :deep(.el-form-item) {
      margin-bottom: 0;

      .el-form-item__label {
        font-weight: 500;
        color: #333;
      }
    }

    :deep(.el-textarea__inner) {
      border-radius: 6px;
      resize: none;
    }
  }

  .dialog-footer {
    display: flex;
    justify-content: space-between;
    padding: 16px 24px 0;
    border-top: 1px solid #ebeef5;

    .confirm-btn {
      min-width: 120px;
    }
  }

  .publish-section {
    margin-bottom: 20px;

    .section-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
      color: #333;
      margin-bottom: 12px;
      font-size: 14px;

      .el-icon {
        color: #67c23a;
        font-size: 16px;
      }
    }
  }

  .publish-form {
    margin-bottom: 20px;
  }

  .dialog-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 24px 0;
    border-top: 1px solid #ebeef5;

    .footer-left {
      .el-button {
        min-width: 120px;
      }
    }

    .footer-right {
      display: flex;
      gap: 12px;

      .el-button {
        min-width: 100px;
      }
    }
  }
}
</style>