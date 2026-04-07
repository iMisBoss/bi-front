<template>
  <el-dialog
      v-model="dialogVisible"
      width="750px"
      :close-on-click-modal="false"
      destroy-on-close
      @close="handleClose"
      class="import-dialog"
  >
    <div class="dialog-header">
      <el-icon class="header-icon"><Upload /></el-icon>
      <div class="header-text">
        <div class="header-title">导入业务对象</div>
        <div class="header-subtitle">批量导入业务对象及字段定义，支持 Excel 模板</div>
      </div>
    </div>

    <!-- 下载模板 -->
    <div class="template-download">
      <el-button type="primary" @click="handleDownloadTemplate" icon="Download" size="default">
        下载导入模板
      </el-button>
      <el-alert
          title="请先下载模板，按照模板格式填写后上传"
          type="info"
          :closable="false"
          show-icon
          style="margin-left: 12px; flex: 1;"
      />
    </div>

    <!-- 文件上传 -->
    <div class="upload-section">
      <div class="section-title">
        <el-icon><Document /></el-icon>
        <span>请上传 Excel 文件</span>
      </div>
      <el-upload
          ref="uploadRef"
          class="upload-area"
          drag
          :auto-upload="false"
          :on-change="handleFileChange"
          :on-remove="handleFileRemove"
          :limit="1"
          accept=".xlsx,.xls"
      >
        <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
        <div class="el-upload__text">
          将文件拖到此处，或<em>点击上传</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">
            支持格式：.xlsx / .xls，单个文件最大 10MB
          </div>
        </template>
      </el-upload>
    </div>

    <!-- 导入选项 -->
    <div class="import-options">
      <div class="section-title">
        <el-icon><Setting /></el-icon>
        <span>导入选项</span>
      </div>
      <div class="options-grid">
        <el-checkbox
            v-model="importOptions.override"
            border
            class="option-checkbox"
        >
          <div class="option-content">
            <div class="option-title">
              <el-icon><RefreshRight /></el-icon>
              <span>覆盖已存在的业务对象</span>
            </div>
            <div class="option-desc">若表名已存在，将覆盖原有配置，谨慎使用</div>
          </div>
        </el-checkbox>
        <el-checkbox
            v-model="importOptions.includeData"
            border
            class="option-checkbox"
        >
          <div class="option-content">
            <div class="option-title">
              <el-icon><DataLine /></el-icon>
              <span>导入测试数据</span>
            </div>
            <div class="option-desc">同时导入模板中的测试数据，便于快速验证</div>
          </div>
        </el-checkbox>
      </div>
    </div>

    <!-- 导入预览 -->
    <div v-if="showPreview" class="preview-section">
      <div class="preview-header">
        <div class="section-title">
          <el-icon><Document /></el-icon>
          <span>导入预览</span>
          <el-tag :type="previewHasError ? 'danger' : 'success'" size="small">
            {{ previewHasError ? '存在错误' : '全部正常' }}
          </el-tag>
        </div>
        <div class="preview-stats">
          <el-tag type="info" size="small">共 {{ previewData.length }} 条</el-tag>
          <el-tag :type="successCount > 0 ? 'success' : 'info'" size="small" style="margin-left: 8px">
            成功 {{ successCount }} 条
          </el-tag>
          <el-tag :type="errorCount > 0 ? 'danger' : 'info'" size="small" style="margin-left: 8px">
            失败 {{ errorCount }} 条
          </el-tag>
        </div>
      </div>
      <el-table
          :data="previewData"
          border
          style="width: 100%"
          max-height="250"
          :cell-style="{ padding: '10px 0' }"
          :header-cell-style="{ background: '#fafafa', color: '#333', fontWeight: '600' }"
          :row-class-name="tableRowClassName"
      >
        <el-table-column prop="index" label="序号" width="60" align="center" />
        <el-table-column prop="name" label="对象名称" min-width="120" show-overflow-tooltip />
        <el-table-column prop="tableName" label="表名" min-width="140" show-overflow-tooltip />
        <el-table-column prop="fieldCount" label="字段数量" width="90" align="center" />
        <el-table-column prop="error" label="状态/错误信息" min-width="180" show-overflow-tooltip>
          <template #default="{ row }">
            <div v-if="row.error" class="error-row">
              <el-icon class="error-icon"><CircleCloseFilled /></el-icon>
              <span class="error-text">{{ row.error }}</span>
            </div>
            <div v-else class="success-row">
              <el-icon class="success-icon"><CircleCheckFilled /></el-icon>
              <span class="success-text">校验通过</span>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose" size="default">取消</el-button>
        <el-button
            type="primary"
            @click="handleImport"
            :loading="loading"
            :disabled="!canImport"
            size="default"
            class="confirm-btn"
        >
          <el-icon><Upload /></el-icon>
          开始导入
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Upload, UploadFilled, Document, Setting, Download, RefreshRight, DataLine, CircleCheck, CircleClose, CircleCheckFilled, CircleCloseFilled } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: Boolean
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const uploadRef = ref(null)
const loading = ref(false)
const showPreview = ref(false)
const uploadedFile = ref(null)

const importOptions = reactive({
  override: false,
  includeData: false
})

const previewData = ref([
  { index: 1, name: '出差申请', tableName: 'biz_trip', fieldCount: 12, error: null },
  { index: 2, name: '采购申请', tableName: 'biz_purchase', fieldCount: 18, error: null },
  { index: 3, name: '招待费报销', tableName: 'biz_entertainment_expense', fieldCount: 15, error: null },
  { index: 4, name: '测试对象', tableName: 'biz_test', fieldCount: 10, error: '表名已存在，请检查' },
  { index: 5, name: '培训申请', tableName: 'biz_training', fieldCount: 20, error: null }
])

const successCount = computed(() => {
  return previewData.value.filter(item => !item.error).length
})

const errorCount = computed(() => {
  return previewData.value.filter(item => item.error).length
})

const previewHasError = computed(() => {
  return errorCount.value > 0
})

const tableRowClassName = ({ row }) => {
  if (row.error) {
    return 'error-row-class'
  }
  return ''
}

const canImport = computed(() => {
  return uploadedFile.value !== null
})

const handleDownloadTemplate = () => {
  ElMessage.success('模板文件已下载')
  // TODO: 实际应下载 Excel 模板文件
}

const handleFileChange = (file) => {
  uploadedFile.value = file
  showPreview.value = true
  // TODO: 解析 Excel 文件，填充 previewData
}

const handleFileRemove = () => {
  uploadedFile.value = null
  showPreview.value = false
}

const handleClose = () => {
  uploadRef.value?.clearFiles()
  uploadedFile.value = null
  showPreview.value = false
  importOptions.override = false
  importOptions.includeData = false
  emit('update:modelValue', false)
}

const handleImport = async () => {
  if (!uploadedFile.value) {
    ElMessage.warning('请先上传文件')
    return
  }

  try {
    loading.value = true

    // 模拟导入
    setTimeout(() => {
      loading.value = false
      const successCount = previewData.value.filter(item => !item.error).length
      const failCount = previewData.value.filter(item => item.error).length

      ElMessage.success(`导入完成：成功 ${successCount} 条，失败 ${failCount} 条`)
      emit('confirm', {
        file: uploadedFile.value,
        options: importOptions,
        successCount,
        failCount
      })
      handleClose()
    }, 2000)
  } catch (error) {
    console.error('导入失败:', error)
  }
}
</script>

<style scoped lang="scss">
.import-dialog {
  .el-dialog__header {
    padding: 0;
    border-bottom: none;
  }

  .dialog-header {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 20px 24px 16px;
    background: linear-gradient(135deg, #409EFF 0%, #337ecc 100%);
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

  .template-download {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
    padding: 16px;
    background: #f5f7fa;
    border-radius: 6px;
  }

  .upload-section {
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
        color: #409EFF;
      }
    }

    .upload-area {
      width: 100%;

      :deep(.el-upload-dragger) {
        padding: 40px 20px;
        border-radius: 6px;
        border: 2px dashed #dcdfe6;
        transition: all 0.3s;

        &:hover {
          border-color: #409EFF;
          background-color: #f5f7fa;
        }

        .el-icon--upload {
          font-size: 48px;
          color: #409EFF;
          margin-bottom: 16px;
        }

        .el-upload__text {
          font-size: 14px;
          color: #606266;

          em {
            color: #409EFF;
            font-style: normal;
            font-weight: 500;
          }
        }

        .el-upload__tip {
          font-size: 12px;
          color: #909399;
          margin-top: 8px;
        }
      }
    }
  }

  .import-options {
    margin-bottom: 20px;

    .section-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
      color: #333;
      margin-bottom: 16px;
      font-size: 15px;

      .el-icon {
        color: #409EFF;
        font-size: 18px;
      }
    }

    .options-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }

    .option-checkbox {
      border-radius: 10px;
      padding: 20px 18px;
      transition: all 0.3s;
      border: 2px solid #e4e7ed;
      background: #fafafa;
      min-height: 100px;

      &:hover {
        border-color: #409EFF;
        background: #f0f9ff;
        transform: translateY(-3px);
        box-shadow: 0 6px 16px rgba(64, 158, 255, 0.2);
      }

      &.is-checked {
        border-color: #409EFF;
        background: linear-gradient(135deg, rgba(64, 158, 255, 0.08) 0%, rgba(64, 158, 255, 0.15) 100%);
        box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
      }

      :deep(.el-checkbox__label) {
        width: 100%;
        line-height: 1.6;
      }

      .option-content {
        display: flex;
        flex-direction: column;
        gap: 8px;
        height: 100%;
        justify-content: center;

        .option-title {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 600;
          color: #333;
          font-size: 15px;

          .el-icon {
            color: #409EFF;
            font-size: 18px;
            flex-shrink: 0;
          }
        }

        .option-desc {
          font-size: 13px;
          color: #606266;
          line-height: 1.6;
          padding-left: 28px;
        }
      }
    }
  }

  .preview-section {
    margin-bottom: 20px;
    background: #f5f7fa;
    border-radius: 8px;
    padding: 16px;

    .preview-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;

      .section-title {
        display: flex;
        align-items: center;
        gap: 10px;
        font-weight: 600;
        color: #333;
        font-size: 14px;

        .el-icon {
          color: #409EFF;
        }

        .el-tag {
          margin-left: 8px;
        }
      }

      .preview-stats {
        display: flex;
        align-items: center;
        gap: 8px;
      }
    }

    :deep(.el-table) {
      border-radius: 6px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

      .error-row-class {
        background-color: #fef0f0 !important;

        &:hover {
          background-color: #ffe6e6 !important;
        }
      }

      .error-row {
        display: flex;
        align-items: center;
        gap: 6px;
        color: #f56c6c;
        font-weight: 500;

        .error-icon {
          font-size: 16px;
          flex-shrink: 0;
        }

        .error-text {
          flex: 1;
        }
      }

      .success-row {
        display: flex;
        align-items: center;
        gap: 6px;
        color: #67c23a;
        font-weight: 500;

        .success-icon {
          font-size: 16px;
          flex-shrink: 0;
        }

        .success-text {
          flex: 1;
        }
      }
    }
  }

  .preview-section {
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
        color: #409EFF;
      }
    }

    :deep(.el-table) {
      border-radius: 6px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

      .error-text {
        color: #f56c6c;
        display: flex;
        align-items: center;
        gap: 4px;
        font-weight: 500;
      }

      .success-text {
        color: #67c23a;
        display: flex;
        align-items: center;
        gap: 4px;
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
      min-width: 120px;
    }
  }
}
</style>
