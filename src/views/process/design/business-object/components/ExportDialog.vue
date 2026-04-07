<template>
  <el-dialog
      v-model="dialogVisible"
      width="750px"
      :close-on-click-modal="false"
      destroy-on-close
      @close="handleClose"
      class="export-dialog"
  >
    <div class="dialog-header">
      <el-icon class="header-icon"><Download /></el-icon>
      <div class="header-text">
        <div class="header-title">导出业务对象配置</div>
        <div class="header-subtitle">选择导出内容和格式，支持多种粒度</div>
      </div>
    </div>

    <!-- 导出内容选择 -->
    <div class="export-section">
      <div class="section-title">
        <el-icon><Document /></el-icon>
        <span>导出内容</span>
      </div>
      <div class="scope-options">
        <div
            class="scope-card"
            :class="{ 'is-checked': exportOptions.scope === 'basic' }"
            @click="exportOptions.scope = 'basic'"
        >
          <div class="card-content">
            <div class="card-top">
              <el-icon class="card-icon"><Folder /></el-icon>
              <span class="card-title">仅导出基本信息</span>
              <div class="radio-mark" v-if="exportOptions.scope === 'basic'">
                <el-icon><CircleCheckFilled /></el-icon>
              </div>
            </div>
            <div class="card-desc">包含对象名称、表名、业务域等基础配置</div>
          </div>
        </div>

        <div
            class="scope-card"
            :class="{ 'is-checked': exportOptions.scope === 'with-fields' }"
            @click="exportOptions.scope = 'with-fields'"
        >
          <div class="card-content">
            <div class="card-top">
              <el-icon class="card-icon"><List /></el-icon>
              <span class="card-title">导出基本信息 + 字段定义</span>
              <div class="radio-mark" v-if="exportOptions.scope === 'with-fields'">
                <el-icon><CircleCheckFilled /></el-icon>
              </div>
            </div>
            <div class="card-desc">包含字段列表、类型、长度、校验规则等</div>
          </div>
        </div>

        <div
            class="scope-card"
            :class="{ 'is-checked': exportOptions.scope === 'full' }"
            @click="exportOptions.scope = 'full'"
        >
          <div class="card-content">
            <div class="card-top">
              <el-icon class="card-icon"><Files /></el-icon>
              <span class="card-title">导出全部配置</span>
              <div class="radio-mark" v-if="exportOptions.scope === 'full'">
                <el-icon><CircleCheckFilled /></el-icon>
              </div>
            </div>
            <div class="card-desc">含关联关系、索引、数据规则、权限配置等完整信息</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 导出格式选择 -->
    <div class="export-section">
      <div class="section-title">
        <el-icon><Files /></el-icon>
        <span>导出格式</span>
      </div>
      <div class="format-options">
        <div
            class="format-card"
            :class="{ 'is-checked': exportOptions.format === 'xlsx' }"
            @click="exportOptions.format = 'xlsx'"
        >
          <div class="format-content">
            <el-icon class="format-icon"><Document /></el-icon>
            <span class="format-label">Excel (.xlsx)</span>
          </div>
        </div>
        <div
            class="format-card"
            :class="{ 'is-checked': exportOptions.format === 'json' }"
            @click="exportOptions.format = 'json'"
        >
          <div class="format-content">
            <el-icon class="format-icon"><DataLine /></el-icon>
            <span class="format-label">JSON</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 高级选项 -->
    <div class="export-section">
      <div class="section-title">
        <el-icon><Setting /></el-icon>
        <span>高级选项</span>
      </div>
      <div class="advanced-options">
        <div
            class="advanced-card"
            :class="{ 'is-checked': exportOptions.includeSensitive, 'is-disabled': !hasAdminPermission }"
            @click="!hasAdminPermission || (exportOptions.includeSensitive = !exportOptions.includeSensitive)"
        >
          <div class="card-content">
            <div class="card-header">
              <el-icon class="card-icon"><Lock /></el-icon>
              <span class="card-title">导出时包含敏感字段配置</span>
            </div>
            <div class="card-desc">
              <span v-if="hasAdminPermission">需要"业务对象管理员"权限</span>
              <span v-else class="no-permission">此选项需要"业务对象管理员"权限</span>
            </div>
          </div>
          <div class="checkbox-mark" v-if="exportOptions.includeSensitive && hasAdminPermission">
            <el-icon><Check /></el-icon>
          </div>
        </div>
        <div
            class="advanced-card"
            :class="{ 'is-checked': exportOptions.includeAudit }"
            @click="exportOptions.includeAudit = !exportOptions.includeAudit"
        >
          <div class="card-content">
            <div class="card-header">
              <el-icon class="card-icon"><Timer /></el-icon>
              <span class="card-title">记录审计日志</span>
            </div>
            <div class="card-desc">自动记录导出人、导出时间、导出内容等信息</div>
          </div>
          <div class="checkbox-mark" v-if="exportOptions.includeAudit">
            <el-icon><Check /></el-icon>
          </div>
        </div>
      </div>
    </div>

    <!-- 导出信息提示 -->
    <div class="export-tips">
      <div class="tip-item">
        <el-icon class="tip-icon"><CircleCheck /></el-icon>
        <span>已选择 <strong>{{ selectedCount }}</strong> 个业务对象</span>
      </div>
      <div class="tip-item">
        <el-icon class="tip-icon"><CircleCheck /></el-icon>
        <span>导出操作将自动记录审计日志</span>
      </div>
      <div class="tip-item">
        <el-icon class="tip-icon"><CircleCheck /></el-icon>
        <span>导出文件将保存到默认下载目录</span>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose" size="default">取消</el-button>
        <el-button
            type="primary"
            @click="handleExport"
            :loading="loading"
            size="default"
            class="confirm-btn"
        >
          <el-icon><Download /></el-icon>
          导出
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { CircleCheckFilled, Check } from '@element-plus/icons-vue'
import {
  Download, Document, Files, Setting, Folder, List,
  DataLine, Lock, Timer, CircleCheck
} from '@element-plus/icons-vue'

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

// 模拟管理员权限（实际应从用户权限中获取）
const hasAdminPermission = ref(true)

const exportOptions = reactive({
  scope: 'with-fields', // 'basic' | 'with-fields' | 'full'
  format: 'xlsx', // 'xlsx' | 'json'
  includeSensitive: false,
  includeAudit: true
})

const selectedCount = computed(() => {
  return props.selectedRows?.length || 0
})

const handleClose = () => {
  exportOptions.scope = 'with-fields'
  exportOptions.format = 'xlsx'
  exportOptions.includeSensitive = false
  exportOptions.includeAudit = true
  emit('update:modelValue', false)
}

const handleExport = async () => {
  if (selectedCount.value === 0) {
    ElMessage.warning('请先选择要导出的业务对象')
    return
  }

  try {
    loading.value = true

    // 模拟导出
    setTimeout(() => {
      loading.value = false
      const formatText = exportOptions.format === 'xlsx' ? 'Excel' : 'JSON'
      const scopeText = {
        'basic': '基本信息',
        'with-fields': '基本信息 + 字段定义',
        'full': '全部配置'
      }[exportOptions.scope]

      ElMessage.success(`已导出 ${selectedCount.value} 个业务对象（${scopeText}）到 ${formatText} 文件`)

      emit('confirm', {
        ids: props.selectedRows.map(item => item.id),
        options: { ...exportOptions },
        count: selectedCount.value
      })

      handleClose()
    }, 1500)
  } catch (error) {
    console.error('导出失败:', error)
  }
}
</script>

<style scoped lang="scss">
.export-dialog {
  .el-dialog__header {
    padding: 0;
    border-bottom: none;
  }

  .dialog-header {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 20px 24px 16px;
    background: linear-gradient(135deg, #e6a23c 0%, #d4880b 100%);
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

  .export-section {
    margin-bottom: 24px;

    .section-title {
      display: flex;
      align-items: center;
      gap: 10px;
      font-weight: 600;
      color: #333;
      margin-bottom: 16px;
      font-size: 15px;

      .el-icon {
        color: #67c23a;
        font-size: 18px;
      }
    }

    .scope-options {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;

      .scope-card {
        position: relative;
        cursor: pointer;
        transition: all 0.3s;
        flex: 1;

        .card-content {
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding: 20px;
          border-radius: 10px;
          border: 2px solid #e4e7ed;
          background: #fafafa;
          height: 100%;
          box-sizing: border-box;
          transition: all 0.3s;

          &:hover {
            border-color: #67c23a;
            background: #f0f9ff;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(103, 194, 58, 0.15);
          }
        }

        &.is-checked {
          .card-content {
            border-color: #67c23a;
            background: linear-gradient(135deg, rgba(103, 194, 58, 0.05) 0%, rgba(103, 194, 58, 0.1) 100%);
            box-shadow: 0 4px 12px rgba(103, 194, 58, 0.2);
          }

          .card-top {
            .card-icon {
              color: #67c23a;
            }

            .card-title {
              color: #67c23a;
              font-weight: 600;
            }
          }

          .radio-mark {
            opacity: 1;
            transform: scale(1);
          }
        }

        .card-top {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          position: relative;
          min-height: 24px;

          .card-icon {
            font-size: 20px;
            color: #67c23a;
            flex-shrink: 0;
            margin-top: 2px;
          }

          .card-title {
            font-size: 15px;
            font-weight: 600;
            color: #333;
            flex: 1;
            line-height: 1.4;
            word-break: break-word;
          }

          .radio-mark {
            color: #67c23a;
            font-size: 20px;
            flex-shrink: 0;
            margin-top: 2px;
            opacity: 0;
            transform: scale(0.8);
            transition: all 0.3s;
          }
        }

        .card-desc {
          font-size: 13px;
          color: #909399;
          line-height: 1.6;
          padding-left: 30px;
          flex: 1;
        }
      }
    }

    .format-options {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;

      .format-card {
        position: relative;
        cursor: pointer;
        transition: all 0.3s;
        border-radius: 10px;
        border: 2px solid #e4e7ed;
        background: #fafafa;
        padding: 18px;
        text-align: center;

        &:hover {
          border-color: #67c23a;
          background: #f0f9ff;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(103, 194, 58, 0.15);
        }

        &.is-checked {
          border-color: #67c23a;
          background: linear-gradient(135deg, rgba(103, 194, 58, 0.08) 0%, rgba(103, 194, 58, 0.15) 100%);
          box-shadow: 0 4px 12px rgba(103, 194, 58, 0.25);

          .format-icon {
            color: #67c23a;
          }

          .format-label {
            color: #67c23a;
            font-weight: 600;
          }
        }

        .format-content {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;

          .format-icon {
            font-size: 22px;
            color: #67c23a;
            flex-shrink: 0;
          }

          .format-label {
            font-size: 15px;
            font-weight: 500;
            color: #333;
          }
        }
      }
    }

    .advanced-options {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;

      .advanced-card {
        position: relative;
        cursor: pointer;
        transition: all 0.3s;

        .card-content {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding: 18px 20px;
          border-radius: 10px;
          border: 2px solid #e4e7ed;
          background: #fafafa;
          min-height: 90px;
          transition: all 0.3s;

          &:hover:not(.is-disabled) {
            border-color: #67c23a;
            background: #f0f9ff;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(103, 194, 58, 0.15);
          }
        }

        &.is-checked {
          .card-content {
            border-color: #67c23a;
            background: linear-gradient(135deg, rgba(103, 194, 58, 0.05) 0%, rgba(103, 194, 58, 0.1) 100%);
            box-shadow: 0 4px 12px rgba(103, 194, 58, 0.2);
          }

          .checkbox-mark {
            opacity: 1;
            transform: scale(1);
          }
        }

        &.is-disabled {
          opacity: 0.5;
          cursor: not-allowed;

          .card-content {
            &:hover {
              border-color: #e4e7ed;
              background: #fafafa;
              transform: none;
              box-shadow: none;
            }
          }
        }

        .card-header {
          display: flex;
          align-items: center;
          gap: 10px;

          .card-icon {
            font-size: 18px;
            color: #67c23a;
            flex-shrink: 0;
          }

          .card-title {
            font-size: 14px;
            font-weight: 600;
            color: #333;
          }
        }

        .card-desc {
          font-size: 13px;
          color: #909399;
          line-height: 1.6;
          padding-left: 28px;

          .no-permission {
            color: #f56c6c;
            font-weight: 500;
          }
        }

        .checkbox-mark {
          position: absolute;
          top: 16px;
          right: 16px;
          color: #67c23a;
          font-size: 18px;
          opacity: 0;
          transform: scale(0.8);
          transition: all 0.3s;
        }
      }
    }
  }

  .export-tips {
    background: #f5f7fa;
    border-radius: 8px;
    padding: 16px 20px;
    margin-bottom: 20px;

    .tip-item {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
      font-size: 13px;
      color: #606266;

      &:last-child {
        margin-bottom: 0;
      }

      .tip-icon {
        color: #67c23a;
        font-size: 16px;
        flex-shrink: 0;
      }

      strong {
        color: #67c23a;
        font-weight: 600;
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

