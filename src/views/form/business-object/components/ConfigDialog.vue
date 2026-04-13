<template>
  <el-dialog
      v-model="dialogVisible"
      width="700px"
      :close-on-click-modal="false"
      destroy-on-close
      @close="handleClose"
      class="config-dialog"
  >
    <div class="dialog-header">
      <el-icon class="header-icon"><Setting /></el-icon>
      <div class="header-text">
        <div class="header-title">全局配置</div>
        <div class="header-subtitle">业务对象管理全局配置，仅超级管理员可见</div>
      </div>
    </div>

    <el-tabs v-model="activeTab" class="config-tabs">
      <!-- Tab1: 通用字段配置 -->
      <el-tab-pane label="通用字段配置" name="fields">
        <div class="tab-content">
          <div class="tab-header">
            <div class="header-left">
              <el-icon><Document /></el-icon>
              <span>配置所有新建业务对象默认继承的通用字段</span>
            </div>
            <el-button type="primary" size="small" icon="Plus" @click="handleAddField">添加通用字段</el-button>
          </div>

          <el-table :data="commonFields" border style="width: 100%">
            <el-table-column prop="fieldName" label="字段名称" min-width="150" />
            <el-table-column prop="fieldCode" label="字段编码" min-width="180" />
            <el-table-column prop="dataType" label="数据类型" width="120">
              <template #default="{ row }">
                <el-tag size="small" type="info">{{ row.dataType }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="required" label="必填" width="80" align="center">
              <template #default="{ row }">
                <el-icon v-if="row.required" style="color: #67c23a"><CircleCheckFilled /></el-icon>
              </template>
            </el-table-column>
            <el-table-column prop="description" label="说明" min-width="200" show-overflow-tooltip />
            <el-table-column label="操作" width="150" align="center">
              <template #default="{ row }">
                <el-button
                    size="small"
                    type="primary"
                    icon="Edit"
                    circle
                    @click="handleEditField(row)"
                    title="编辑"
                />
                <el-button
                    size="small"
                    type="danger"
                    icon="Delete"
                    circle
                    @click="handleDeleteField(row)"
                    :disabled="row.required"
                    title="删除"
                />
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>

      <!-- Tab2: 数据库配置 -->
      <el-tab-pane label="数据库配置" name="database">
        <div class="tab-content">
          <div class="tab-header">
            <div class="header-left">
              <el-icon><DataLine /></el-icon>
              <span>配置数据库连接和表结构相关参数</span>
            </div>
          </div>

          <el-form :model="dbConfig" label-width="140px" class="db-form">
            <el-form-item label="表名前缀">
              <el-input v-model="dbConfig.tablePrefix" style="width: 300px">
                <template #prefix>
                  <el-icon><Document /></el-icon>
                </template>
              </el-input>
              <div class="form-tip">所有新建业务对象的表名前缀，建议统一为 biz_</div>
            </el-form-item>

            <el-form-item label="默认字符集">
              <el-select v-model="dbConfig.charset" style="width: 300px">
                <el-option label="utf8mb4 (推荐)" value="utf8mb4" />
                <el-option label="utf8" value="utf8" />
                <el-option label="gbk" value="gbk" />
              </el-select>
              <div class="form-tip">utf8mb4 支持 emoji 和特殊字符，推荐使用</div>
            </el-form-item>

            <el-form-item label="默认排序规则">
              <el-select v-model="dbConfig.collation" style="width: 300px">
                <el-option label="utf8mb4_general_ci" value="utf8mb4_general_ci" />
                <el-option label="utf8mb4_unicode_ci" value="utf8mb4_unicode_ci" />
                <el-option label="utf8mb4_bin" value="utf8mb4_bin" />
              </el-select>
              <div class="form-tip">_ci 表示大小写不敏感，_bin 表示二进制排序</div>
            </el-form-item>

            <el-form-item label="默认存储引擎">
              <el-select v-model="dbConfig.engine" style="width: 300px">
                <el-option label="InnoDB (推荐)" value="InnoDB" />
                <el-option label="MyISAM" value="MyISAM" />
                <el-option label="Memory" value="Memory" />
              </el-select>
              <div class="form-tip">InnoDB 支持事务和行级锁，推荐使用</div>
            </el-form-item>

            <el-divider />

            <el-form-item label="连接池配置">
              <el-space direction="vertical" style="width: 100%">
                <el-checkbox v-model="dbConfig.enableConnectionPool">启用连接池</el-checkbox>
                <div class="form-tip">启用后可提高数据库连接效率</div>
              </el-space>
            </el-form-item>
          </el-form>
        </div>
      </el-tab-pane>

      <!-- Tab3: 安全配置 -->
      <el-tab-pane label="安全配置" name="security">
        <div class="tab-content">
          <div class="tab-header">
            <div class="header-left">
              <el-icon><Lock /></el-icon>
              <span>配置数据安全和权限控制相关选项</span>
            </div>
          </div>

          <div class="security-options">
            <div class="security-card is-checked">
              <div class="card-content">
                <div class="card-header">
                  <el-icon class="card-icon"><Lock /></el-icon>
                  <span class="card-title">自动加密敏感字段</span>
                </div>
                <div class="card-desc">对标记为敏感的字段自动进行加密存储，防止数据泄露</div>
              </div>
              <el-switch v-model="securityConfig.autoEncryptSensitive" class="card-switch" />
            </div>

            <div class="security-card is-checked">
              <div class="card-content">
                <div class="card-header">
                  <el-icon class="card-icon"><User /></el-icon>
                  <span class="card-title">导出敏感数据需要双人复核</span>
                </div>
                <div class="card-desc">导出包含敏感数据的文件时，需要第二人复核确认后才能下载</div>
              </div>
              <el-switch v-model="securityConfig.requireDualApproval" class="card-switch" />
            </div>

            <div class="security-card">
              <div class="card-content">
                <div class="card-header">
                  <el-icon class="card-icon"><Timer /></el-icon>
                  <span class="card-title">启用数据访问审计</span>
                </div>
                <div class="card-desc">记录所有用户对业务对象数据的访问和操作日志</div>
              </div>
              <el-switch v-model="securityConfig.enableAuditLog" class="card-switch" />
            </div>

            <div class="security-card">
              <div class="card-content">
                <div class="card-header">
                  <el-icon class="card-icon"><Folder /></el-icon>
                  <span class="card-title">启用数据隔离</span>
                </div>
                <div class="card-desc">根据组织架构自动隔离不同部门的数据访问权限</div>
              </div>
              <el-switch v-model="securityConfig.enableDataIsolation" class="card-switch" />
            </div>
          </div>

          <el-alert
              title="安全提示"
              type="warning"
              :closable="false"
              show-icon
              class="security-tips"
          >
            <template #title>
              <div class="tips-content">
                <p>⚠ 以上安全配置修改后，需要重启服务才能生效</p>
                <p>⚠ 建议在生产环境启用所有安全选项</p>
                <p>⚠ 双人复核功能需要提前配置复核人员</p>
              </div>
            </template>
          </el-alert>
        </div>
      </el-tab-pane>
    </el-tabs>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose" size="default">取消</el-button>
        <el-button
            type="primary"
            @click="handleSave"
            :loading="loading"
            size="default"
            class="confirm-btn"
        >
          <el-icon><Check /></el-icon>
          保存
        </el-button>
      </div>
    </template>
  </el-dialog>

  <!-- 字段编辑弹窗 -->
  <el-dialog
      v-model="fieldDialogVisible"
      width="500px"
      :close-on-click-modal="false"
      @close="handleFieldDialogClose"
      class="field-dialog"
  >
    <div class="field-dialog-header">
      <el-icon class="header-icon"><Document /></el-icon>
      <div class="header-text">
        <div class="header-title">{{ fieldDialogTitle }}</div>
        <div class="header-subtitle">配置通用字段属性</div>
      </div>
    </div>

    <el-form
        ref="fieldFormRef"
        :model="fieldForm"
        :rules="fieldRules"
        label-width="100px"
        class="field-form"
    >
      <el-form-item label="字段名称" prop="fieldName">
        <el-input v-model="fieldForm.fieldName" placeholder="如：主键 ID" />
      </el-form-item>

      <el-form-item label="字段编码" prop="fieldCode">
        <el-input v-model="fieldForm.fieldCode" placeholder="如：id" />
      </el-form-item>

      <el-form-item label="数据类型" prop="dataType">
        <el-select v-model="fieldForm.dataType" style="width: 100%">
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

      <el-form-item label="是否必填">
        <el-switch v-model="fieldForm.required" />
      </el-form-item>

      <el-form-item label="说明描述" prop="description">
        <el-input
            v-model="fieldForm.description"
            type="textarea"
            :rows="3"
            placeholder="字段用途说明"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="field-dialog-footer">
        <el-button @click="fieldDialogVisible = false">取消</el-button>
        <el-button
            type="primary"
            @click="handleFieldConfirm"
            :loading="fieldLoading"
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
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Setting, Document, DataLine, Lock, User, Timer, Folder,
  Plus, Edit, Delete, CircleCheckFilled, Check
} from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: Boolean
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const loading = ref(false)
const activeTab = ref('fields')
const fieldFormRef = ref(null)

// 字段编辑弹窗控制
const fieldDialogVisible = ref(false)
const fieldLoading = ref(false)
const fieldDialogTitle = ref('新增通用字段')
const editingFieldId = ref(null)

// 字段表单数据
const fieldForm = reactive({
  fieldName: '',
  fieldCode: '',
  dataType: 'VARCHAR(64)',
  required: false,
  description: ''
})

// 字段表单验证规则
const fieldRules = {
  fieldName: [
    { required: true, message: '请输入字段名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  fieldCode: [
    { required: true, message: '请输入字段编码', trigger: 'blur' },
    {
      pattern: /^[a-z_][a-z0-9_]*$/,
      message: '只能包含小写字母、数字和下划线，且不能以数字开头',
      trigger: 'blur'
    }
  ],
  dataType: [
    { required: true, message: '请选择数据类型', trigger: 'change' }
  ]
}

// 通用字段配置
const commonFields = ref([
  { id: 1, fieldName: '主键 ID', fieldCode: 'id', dataType: 'BIGINT', required: true, description: '自增主键' },
  { id: 2, fieldName: '单据编号', fieldCode: 'bill_no', dataType: 'VARCHAR(64)', required: true, description: '业务单据编号' },
  { id: 3, fieldName: '流程实例 ID', fieldCode: 'process_instance_id', dataType: 'VARCHAR(64)', required: false, description: '关联的流程实例 ID' },
  { id: 4, fieldName: '创建人', fieldCode: 'creator', dataType: 'VARCHAR(64)', required: true, description: '创建人 ID' },
  { id: 5, fieldName: '创建时间', fieldCode: 'create_time', dataType: 'DATETIME', required: true, description: '创建时间' },
  { id: 6, fieldName: '修改人', fieldCode: 'modifier', dataType: 'VARCHAR(64)', required: false, description: '最后修改人 ID' },
  { id: 7, fieldName: '修改时间', fieldCode: 'modify_time', dataType: 'DATETIME', required: false, description: '最后修改时间' },
  { id: 8, fieldName: '状态', fieldCode: 'status', dataType: 'VARCHAR(32)', required: false, description: '数据状态' },
  { id: 9, fieldName: '备注', fieldCode: 'remark', dataType: 'TEXT', required: false, description: '备注信息' },
  { id: 10, fieldName: '租户 ID', fieldCode: 'tenant_id', dataType: 'VARCHAR(64)', required: false, description: '多租户隔离' }
])

// 数据库配置
const dbConfig = reactive({
  tablePrefix: 'biz_',
  charset: 'utf8mb4',
  collation: 'utf8mb4_general_ci',
  engine: 'InnoDB',
  enableConnectionPool: true
})

// 安全配置
const securityConfig = reactive({
  autoEncryptSensitive: true,
  requireDualApproval: true,
  enableAuditLog: false,
  enableDataIsolation: false
})

const handleClose = () => {
  emit('update:modelValue', false)
}

const handleSave = async () => {
  try {
    loading.value = true

    // 模拟保存
    setTimeout(() => {
      loading.value = false
      ElMessage.success('配置保存成功')
      emit('confirm', {
        commonFields: commonFields.value,
        dbConfig: { ...dbConfig },
        securityConfig: { ...securityConfig }
      })
      handleClose()
    }, 1000)
  } catch (error) {
    console.error('保存失败:', error)
  }
}

// 字段管理相关方法
const handleAddField = () => {
  fieldDialogTitle.value = '新增通用字段'
  editingFieldId.value = null
  fieldForm.fieldName = ''
  fieldForm.fieldCode = ''
  fieldForm.dataType = 'VARCHAR(64)'
  fieldForm.required = false
  fieldForm.description = ''
  fieldDialogVisible.value = true
}

const handleEditField = (row) => {
  fieldDialogTitle.value = '修改通用字段'
  editingFieldId.value = row.id
  fieldForm.fieldName = row.fieldName
  fieldForm.fieldCode = row.fieldCode
  fieldForm.dataType = row.dataType
  fieldForm.required = row.required
  fieldForm.description = row.description
  fieldDialogVisible.value = true
}

const handleDeleteField = (row) => {
  if (row.required) {
    ElMessage.warning('系统必填字段不能删除')
    return
  }

  ElMessageBox.confirm(
      `确定要删除字段"${row.fieldName}"吗？删除后不可恢复`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
  ).then(() => {
    commonFields.value = commonFields.value.filter(field => field.id !== row.id)
    ElMessage.success('删除成功')
  }).catch(() => {
    // 取消删除
  })
}

const handleFieldConfirm = async () => {
  if (!fieldFormRef.value) return

  await fieldFormRef.value.validate(async (valid) => {
    if (valid) {
      fieldLoading.value = true

      setTimeout(() => {
        fieldLoading.value = false

        if (editingFieldId.value !== null) {
          // 修改
          const index = commonFields.value.findIndex(field => field.id === editingFieldId.value)
          if (index !== -1) {
            commonFields.value[index] = {
              ...commonFields.value[index],
              fieldName: fieldForm.fieldName,
              fieldCode: fieldForm.fieldCode,
              dataType: fieldForm.dataType,
              required: fieldForm.required,
              description: fieldForm.description
            }
            ElMessage.success('修改成功')
          }
        } else {
          // 新增
          const newId = Math.max(...commonFields.value.map(f => f.id), 0) + 1
          commonFields.value.push({
            id: newId,
            fieldName: fieldForm.fieldName,
            fieldCode: fieldForm.fieldCode,
            dataType: fieldForm.dataType,
            required: fieldForm.required,
            description: fieldForm.description
          })
          ElMessage.success('新增成功')
        }

        fieldDialogVisible.value = false
      }, 500)
    }
  })
}

const handleFieldDialogClose = () => {
  fieldFormRef.value?.resetFields()
  editingFieldId.value = null
}
</script>

<style scoped lang="scss">
.config-dialog {
  .el-dialog__header {
    padding: 0;
    border-bottom: none;
  }

  .dialog-header {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 20px 24px 16px;
    background: linear-gradient(135deg, #909399 0%, #73767a 100%);
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

  .config-tabs {
    :deep(.el-tabs__header) {
      padding: 0 20px;
      margin-bottom: 20px;

      .el-tabs__item {
        font-size: 15px;
        font-weight: 500;
        padding: 12px 24px;
      }
    }
  }

  .tab-content {
    padding: 0 8px 8px;

    .tab-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      padding: 14px 16px;
      background: #f5f7fa;
      border-radius: 8px;

      .header-left {
        display: flex;
        align-items: center;
        gap: 10px;
        font-weight: 600;
        color: #333;
        font-size: 14px;

        .el-icon {
          color: #909399;
          font-size: 18px;
        }
      }
    }

    .el-table {
      margin-top: 16px;
    }

    .db-form {
      max-width: 600px;
      margin-top: 20px;

      .form-tip {
        font-size: 12px;
        color: #909399;
        margin-top: 6px;
        line-height: 1.5;
      }
    }

    .security-options {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      margin-bottom: 20px;

      .security-card {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 18px;
        border-radius: 10px;
        border: 2px solid #e4e7ed;
        background: #fafafa;
        transition: all 0.3s;

        &:hover {
          border-color: #909399;
          background: #f0f9ff;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(144, 147, 153, 0.15);
        }

        &.is-checked {
          border-color: #909399;
          background: linear-gradient(135deg, rgba(144, 147, 153, 0.05) 0%, rgba(144, 147, 153, 0.1) 100%);
          box-shadow: 0 4px 12px rgba(144, 147, 153, 0.2);
        }

        .card-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 6px;

          .card-header {
            display: flex;
            align-items: center;
            gap: 10px;

            .card-icon {
              font-size: 18px;
              color: #909399;
            }

            .card-title {
              font-size: 14px;
              font-weight: 600;
              color: #333;
            }
          }

          .card-desc {
            font-size: 12px;
            color: #909399;
            line-height: 1.6;
            padding-left: 28px;
          }
        }

        .card-switch {
          flex-shrink: 0;
          margin-left: 16px;
        }
      }
    }

    .security-tips {
      border-radius: 8px;
      border: none;

      :deep(.el-alert__content) {
        .tips-content {
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

.field-dialog {
  .el-dialog__header {
    padding: 0;
    border-bottom: none;
  }

  .field-dialog-header {
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

  .field-form {
    padding: 10px 20px;

    .el-form-item {
      margin-bottom: 20px;
    }
  }

  .field-dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding: 16px 24px 0;
    border-top: 1px solid #ebeef5;
  }
}
</style>
