<template>
  <el-dialog
      v-model="dialogVisible"
      title="导入字段"
      width="1200px"
      :close-on-click-modal="false"
      @close="handleClose"
  >
    <!-- 分步向导 -->
    <el-steps :active="currentStep" finish-status="success" style="margin-bottom: 30px">
      <el-step title="选择导入模式" />
      <el-step title="校验与冲突处理" />
      <el-step title="预览与确认" />
    </el-steps>

    <!-- 第一步：选择导入模式 -->
    <div v-show="currentStep === 0" class="step-content">
      <el-radio-group v-model="importMode" style="width: 100%">
        <div class="mode-selection">
          <el-radio label="excel" border class="mode-card">
            <div class="mode-content">
              <el-icon :size="40" color="#409eff"><Document /></el-icon>
              <div class="mode-info">
                <h4>Excel 模板导入</h4>
                <p>基于标准 Excel 模板，批量导入几十上百个字段，快速搭建复杂审批表单</p>
              </div>
            </div>
          </el-radio>

          <el-radio label="reuse" border class="mode-card">
            <div class="mode-content">
              <el-icon :size="40" color="#67c23a"><Connection /></el-icon>
              <div class="mode-info">
                <h4>从已有业务对象导入</h4>
                <p>从已发布的同类型业务对象复用成熟的字段配置，避免重复工作</p>
              </div>
            </div>
          </el-radio>
        </div>
      </el-radio-group>

      <!-- Excel 模板导入区域 -->
      <div v-if="importMode === 'excel'" class="import-section">
        <div class="section-header">
          <h4>Excel 模板导入</h4>
          <el-button type="primary" link icon="Download" @click="downloadTemplate">
            下载标准模板
          </el-button>
        </div>

        <el-upload
            ref="uploadRef"
            :auto-upload="false"
            :on-change="handleFileChange"
            :limit="1"
            accept=".xlsx,.xls"
            drag
            style="width: 100%"
        >
          <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
          <div class="el-upload__text">
            拖拽文件到此处，或 <em>点击上传</em>
          </div>
          <template #tip>
            <div class="el-upload__tip">
              仅支持 .xlsx/.xls 格式，文件大小不超过 10MB
            </div>
          </template>
        </el-upload>

        <el-alert
            type="info"
            :closable="false"
            style="margin-top: 16px"
        >
          <template #title>
            <span>模板内置数据验证、下拉选项、格式限制，从源头降低填写错误概率</span>
          </template>
        </el-alert>
      </div>

      <!-- 从已有业务对象导入区域 -->
      <div v-else-if="importMode === 'reuse'" class="import-section">
        <div class="section-header">
          <h4>从已有业务对象导入</h4>
        </div>

        <el-form :model="reuseForm" label-width="120px">
          <el-form-item label="业务域">
            <el-select
                v-model="reuseForm.domainId"
                placeholder="请选择业务域"
                style="width: 100%"
                @change="handleDomainChange"
            >
              <el-option label="人事类" value="hr" />
              <el-option label="财务类" value="finance" />
              <el-option label="行政类" value="admin" />
            </el-select>
          </el-form-item>

          <el-form-item label="业务对象">
            <el-select
                v-model="reuseForm.objectId"
                placeholder="请选择已发布的业务对象"
                filterable
                style="width: 100%"
                @change="handleObjectChange"
            >
              <el-option label="请假申请" value="leave" />
              <el-option label="加班申请" value="overtime" />
              <el-option label="出差申请" value="travel" />
            </el-select>
          </el-form-item>
        </el-form>

        <!-- 字段选择列表 -->
        <div v-if="reuseFields.length > 0" class="field-selection-area">
          <div class="selection-header">
            <h5>选择要导入的字段</h5>
            <div class="selection-actions">
              <el-checkbox v-model="selectAllReuse" @change="handleSelectAllReuse">全选</el-checkbox>
              <el-button link type="primary" @click="handleInverseReuse">反选</el-button>
            </div>
          </div>

          <el-table
              :data="reuseFields"
              height="300"
              border
              @selection-change="handleReuseSelectionChange"
          >
            <el-table-column type="selection" width="50" align="center" />
            <el-table-column prop="fieldName" label="字段名称" min-width="150" />
            <el-table-column prop="fieldCode" label="数据库列名" min-width="150" />
            <el-table-column prop="dataType" label="字段类型" width="120">
              <template #default="{ row }">
                <el-tag size="small">{{ getDataTypeText(row.dataType) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="required" label="必填" width="80" align="center">
              <template #default="{ row }">
                <el-tag :type="row.required ? 'success' : 'info'" size="small">
                  {{ row.required ? '是' : '否' }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>

          <div class="selection-summary">
            已选择 <span class="highlight">{{ selectedReuseFields.length }}</span> 个字段
          </div>
        </div>
      </div>
    </div>

    <!-- 第二步：导入校验与冲突处理 -->
    <div v-show="currentStep === 1" class="step-content">
      <el-alert
          type="info"
          :closable="false"
          style="margin-bottom: 16px"
      >
        <template #title>
          <span>系统正在执行全量校验，请稍候...</span>
        </template>
      </el-alert>

      <!-- 校验结果 -->
      <div v-if="validationResults.length > 0" class="validation-results">
        <h4>校验结果</h4>
        <el-table :data="validationResults" border max-height="300">
          <el-table-column prop="rowNumber" label="行号" width="80" align="center" />
          <el-table-column prop="fieldName" label="字段名称" min-width="150" />
          <el-table-column prop="status" label="校验结果" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="row.status === 'pass' ? 'success' : 'danger'" size="small">
                {{ row.status === 'pass' ? '通过' : '失败' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="errorMessage" label="错误原因" min-width="200">
            <template #default="{ row }">
              <span v-if="row.status === 'fail'" style="color: #f56c6c">{{ row.errorMessage }}</span>
              <span v-else style="color: #67c23a">-</span>
            </template>
          </el-table-column>
          <el-table-column prop="suggestion" label="修改建议" min-width="200" />
        </el-table>

        <div v-if="hasValidationErrors" class="error-actions">
          <el-button type="warning" icon="Download" @click="exportErrorReport">
            导出错误清单
          </el-button>
          <el-button @click="currentStep = 0">返回修改</el-button>
        </div>
      </div>

      <!-- 冲突处理（仅草稿状态） -->
      <div v-if="conflicts.length > 0 && businessObjectStatus === 'draft'" class="conflict-handling">
        <el-alert
            type="warning"
            :closable="false"
            style="margin-bottom: 16px"
        >
          <template #title>
            <span>检测到 {{ conflicts.length }} 个冲突字段（数据库列名已存在）</span>
          </template>
        </el-alert>

        <el-form label-width="120px">
          <el-form-item label="冲突处理策略">
            <el-radio-group v-model="conflictStrategy">
              <el-radio label="skip">跳过冲突字段</el-radio>
              <el-radio label="overwrite">覆盖原有字段</el-radio>
              <el-radio label="abort">终止导入</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>

        <el-table :data="conflicts" border max-height="200">
          <el-table-column prop="fieldName" label="字段名称" min-width="150" />
          <el-table-column prop="fieldCode" label="数据库列名" min-width="150" />
          <el-table-column label="处理方式" width="150" align="center">
            <template #default>
              <el-tag size="small">
                {{ conflictStrategy === 'skip' ? '跳过' : conflictStrategy === 'overwrite' ? '覆盖' : '终止' }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 已发布状态的强制跳过提示 -->
      <el-alert
          v-if="conflicts.length > 0 && (businessObjectStatus === 'published' || businessObjectStatus === 'deprecated')"
          type="warning"
          :closable="false"
          style="margin-top: 16px"
      >
        <template #title>
          <span>当前状态下，系统将自动跳过所有冲突字段，禁止覆盖原有字段</span>
        </template>
      </el-alert>
    </div>

    <!-- 第三步：导入预览与最终确认 -->
    <div v-show="currentStep === 2" class="step-content">
      <el-alert
          type="success"
          :closable="false"
          style="margin-bottom: 16px"
      >
        <template #title>
          <span>
            本次共导入 <span class="highlight">{{ importFields.length }}</span> 个字段，
            跳过 <span class="highlight">{{ skippedCount }}</span> 个冲突字段
          </span>
        </template>
      </el-alert>

      <el-table :data="importFields" border max-height="400">
        <el-table-column prop="fieldName" label="字段名称" min-width="150" fixed />
        <el-table-column prop="fieldCode" label="数据库列名" min-width="150" />
        <el-table-column prop="dataType" label="字段类型" width="120">
          <template #default="{ row }">
            <el-tag size="small">{{ getDataTypeText(row.dataType) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="length" label="长度" width="80" align="center">
          <template #default="{ row }">
            {{ row.length || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="required" label="必填" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.required ? 'success' : 'info'" size="small">
              {{ row.required ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="unique" label="唯一" width="80" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.unique" type="warning" size="small">是</el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="sensitiveLevel" label="敏感等级" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getSensitiveType(row.sensitiveLevel)" size="small">
              {{ getSensitiveText(row.sensitiveLevel) }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>

      <el-alert
          v-if="hasHighRiskFields"
          type="error"
          :closable="false"
          style="margin-top: 16px"
      >
        <template #title>
          <span>高风险配置提醒：部分字段开启了唯一校验或设置为高度敏感等级，请谨慎确认</span>
        </template>
      </el-alert>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button v-if="currentStep > 0" @click="currentStep--">上一步</el-button>
        <el-button
            v-if="currentStep < 2"
            type="primary"
            @click="handleNextStep"
            :disabled="!canProceedToNext"
        >
          下一步
        </el-button>
        <el-button
            v-if="currentStep === 2"
            type="success"
            @click="handleFinalConfirm"
        >
          确认导入
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Document, Connection, UploadFilled } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: Boolean,
  businessObjectStatus: {
    type: String,
    default: 'draft'
  },
  existingFields: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

// 步骤控制
const currentStep = ref(0)

// 导入模式
const importMode = ref('excel')

// Excel 上传相关
const uploadRef = ref(null)
const uploadedFile = ref(null)

// 从已有业务对象导入相关
const reuseForm = ref({
  domainId: '',
  objectId: ''
})
const reuseFields = ref([])
const selectAllReuse = ref(false)
const selectedReuseFields = ref([])

// 校验结果
const validationResults = ref([])
const conflicts = ref([])
const conflictStrategy = ref('skip')

// 导入字段列表
const importFields = ref([])
const skippedCount = ref(0)

// 判断是否可以进入下一步
const canProceedToNext = computed(() => {
  if (currentStep.value === 0) {
    if (importMode.value === 'excel') {
      return !!uploadedFile.value
    } else {
      return reuseForm.value.objectId && selectedReuseFields.value.length > 0
    }
  }
  if (currentStep.value === 1) {
    // 有校验错误且不是草稿状态，不能继续
    if (hasValidationErrors.value && props.businessObjectStatus !== 'draft') {
      return false
    }
    return true
  }
  return true
})

// 是否有校验错误
const hasValidationErrors = computed(() => {
  return validationResults.value.some(r => r.status === 'fail')
})

// 是否有高风险字段
const hasHighRiskFields = computed(() => {
  return importFields.value.some(f => f.unique || f.sensitiveLevel === 'highly_sensitive')
})

// 监听弹窗关闭
watch(dialogVisible, (val) => {
  if (!val) {
    resetForm()
  }
})

// 重置表单
const resetForm = () => {
  currentStep.value = 0
  importMode.value = 'excel'
  uploadedFile.value = null
  reuseForm.value = { domainId: '', objectId: '' }
  reuseFields.value = []
  selectAllReuse.value = false
  selectedReuseFields.value = []
  validationResults.value = []
  conflicts.value = []
  conflictStrategy.value = 'skip'
  importFields.value = []
  skippedCount.value = 0
}

// 下载标准模板
const downloadTemplate = () => {
  const templateData = [
    ['字段名称*', '数据库列名*', '字段类型*', '长度', '必填', '唯一', '列表显示', '敏感等级', '备注'],
    ['示例字段', 'example_field', 'VARCHAR', '64', '否', '否', '是', '普通', '这是一个示例字段']
  ]

  // 实际应使用 xlsx 库生成真正的 Excel 文件
  console.log('下载模板:', templateData)
  ElMessage.success('模板下载成功')
}

// 文件上传变化
const handleFileChange = (file) => {
  uploadedFile.value = file.raw
  ElMessage.success(`文件"${file.name}"上传成功`)
}

// 业务域变化
const handleDomainChange = () => {
  reuseForm.value.objectId = ''
  reuseFields.value = []
  selectedReuseFields.value = []
}

// 业务对象变化
const handleObjectChange = () => {
  // 模拟加载字段列表
  reuseFields.value = [
    { id: 1, fieldName: '申请人姓名', fieldCode: 'applicant_name', dataType: 'VARCHAR(64)', required: true, unique: false, listVisible: true, sensitiveLevel: 'normal' },
    { id: 2, fieldName: '申请部门', fieldCode: 'apply_dept', dataType: 'VARCHAR(64)', required: true, unique: false, listVisible: true, sensitiveLevel: 'internal' },
    { id: 3, fieldName: '请假天数', fieldCode: 'leave_days', dataType: 'DECIMAL(10,2)', required: true, unique: false, listVisible: true, sensitiveLevel: 'normal' }
  ]
  selectAllReuse.value = false
  selectedReuseFields.value = []
}

// 全选/取消全选（复用字段）
const handleSelectAllReuse = (val) => {
  if (val) {
    selectedReuseFields.value = [...reuseFields.value]
  } else {
    selectedReuseFields.value = []
  }
}

// 反选（复用字段）
const handleInverseReuse = () => {
  const selectedIds = new Set(selectedReuseFields.value.map(f => f.id))
  selectedReuseFields.value = reuseFields.value.filter(f => !selectedIds.has(f.id))
  selectAllReuse.value = selectedReuseFields.value.length === reuseFields.value.length
}

// 复用字段选择变化
const handleReuseSelectionChange = (selection) => {
  selectedReuseFields.value = selection
  selectAllReuse.value = selectedReuseFields.value.length === reuseFields.value.length
}

// 下一步
const handleNextStep = () => {
  if (currentStep.value === 0) {
    // 执行校验
    performValidation()
    currentStep.value++
  } else if (currentStep.value === 1) {
    // 生成导入预览
    generateImportPreview()
    currentStep.value++
  }
}

// 执行校验
const performValidation = () => {
  // 模拟校验逻辑
  validationResults.value = [
    { rowNumber: 1, fieldName: '申请人姓名', status: 'pass', errorMessage: '', suggestion: '' },
    { rowNumber: 2, fieldName: '申请部门', status: 'pass', errorMessage: '', suggestion: '' },
    { rowNumber: 3, fieldName: '请假天数', status: 'fail', errorMessage: '数据库列名已存在', suggestion: '修改列名或跳过该字段' }
  ]

  // 检测冲突
  conflicts.value = [
    { fieldName: '请假天数', fieldCode: 'leave_days' }
  ]

  if (hasValidationErrors.value) {
    ElMessage.warning('检测到校验错误，请查看错误详情')
  }
}

// 生成导入预览
const generateImportPreview = () => {
  if (importMode.value === 'excel') {
    // 模拟从 Excel 解析的字段
    importFields.value = [
      { fieldName: '申请人姓名', fieldCode: 'applicant_name', dataType: 'VARCHAR(64)', length: 64, required: true, unique: false, listVisible: true, sensitiveLevel: 'normal' },
      { fieldName: '申请部门', fieldCode: 'apply_dept', dataType: 'VARCHAR(64)', length: 64, required: true, unique: false, listVisible: true, sensitiveLevel: 'internal' }
    ]
  } else {
    // 从复用字段中获取
    importFields.value = selectedReuseFields.value.map(f => ({ ...f }))
  }

  // 计算跳过的冲突字段数
  if (conflictStrategy.value === 'skip' || props.businessObjectStatus !== 'draft') {
    skippedCount.value = conflicts.value.length
  } else {
    skippedCount.value = 0
  }
}

// 导出错误报告
const exportErrorReport = () => {
  ElMessage.success('错误清单导出成功')
}

// 最终确认
const handleFinalConfirm = () => {
  ElMessageBox.confirm(
      `确认导入 ${importFields.value.length} 个字段吗？系统将自动生成审计日志和回滚快照。`,
      '二次确认',
      {
        confirmButtonText: '确认导入',
        cancelButtonText: '取消',
        type: 'warning'
      }
  ).then(() => {
    // 过滤掉跳过的冲突字段
    const finalFields = importFields.value.filter(field => {
      const isConflict = conflicts.value.some(c => c.fieldCode === field.fieldCode)
      if (isConflict && (conflictStrategy.value === 'skip' || props.businessObjectStatus !== 'draft')) {
        return false
      }
      return true
    })

    // 生成审计日志
    generateAuditLog(finalFields)

    // 生成回滚快照
    generateRollbackSnapshot()

    emit('confirm', finalFields)
    handleClose()
  }).catch(() => {})
}

// 关闭弹窗
const handleClose = () => {
  dialogVisible.value = false
}

// 生成审计日志
const generateAuditLog = (importedFields) => {
  const auditLog = {
    operation: '导入字段',
    operator: '当前用户',
    operationTime: new Date().toISOString(),
    importMode: importMode.value === 'excel' ? 'Excel模板导入' : '从业务对象复用',
    sourceFile: uploadedFile.value?.name || reuseForm.value.objectId,
    importedFields: importedFields.map(f => ({
      fieldName: f.fieldName,
      fieldCode: f.fieldCode,
      dataType: f.dataType
    })),
    skippedConflicts: skippedCount.value,
    ipAddress: '192.168.1.100'
  }

  console.log('审计日志:', auditLog)
  // 实际应调用后端API保存审计日志
}

// 生成回滚快照
const generateRollbackSnapshot = () => {
  const snapshot = {
    snapshotId: `SNAPSHOT_${Date.now()}`,
    createTime: new Date().toISOString(),
    action: '导入字段',
    fieldsBefore: [...props.existingFields],
    importedFields: [...importFields.value]
  }

  console.log('回滚快照:', snapshot)
  localStorage.setItem(`rollback_snapshot_${snapshot.snapshotId}`, JSON.stringify(snapshot))
}

// 获取数据类型文本
const getDataTypeText = (dataType) => {
  const texts = {
    'BIGINT': '长整型',
    'VARCHAR': '字符串',
    'VARCHAR(64)': '字符串',
    'DATE': '日期',
    'DATETIME': '日期时间',
    'TEXT': '超长文本',
    'DECIMAL(10,2)': '金额',
    'INT': '整型',
    'BOOLEAN': '布尔值'
  }
  return texts[dataType] || dataType
}

// 获取敏感等级类型
const getSensitiveType = (level) => {
  const types = {
    normal: 'info',
    internal: '',
    sensitive: 'warning',
    highly_sensitive: 'danger'
  }
  return types[level] || 'info'
}

// 获取敏感等级文本
const getSensitiveText = (level) => {
  const texts = {
    normal: '普通',
    internal: '内部',
    sensitive: '敏感',
    highly_sensitive: '高度敏感'
  }
  return texts[level] || level
}
</script>

// ... existing code ...
<style scoped lang="scss">
.step-content {
  min-height: 450px;
  padding: 8px 0;
}

// 模式选择卡片优化
.mode-selection {
  display: grid;
  grid-template-columns: 1fr 1fr; // 两个卡片等宽并排
  gap: 20px;
  margin-bottom: 28px;

  .mode-card {
    padding: 20px 24px;
    border: 1.5px solid #e4e7ed;
    border-radius: 8px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: pointer;
    background: #fff;
    min-height: 100px; // 增加最小高度
    display: flex;
    align-items: center;

    &:hover {
      border-color: #409eff;
      box-shadow: 0 4px 16px rgba(64, 158, 255, 0.15);
      transform: translateY(-2px);
    }

    :deep(.el-radio__input) {
      margin-right: 12px;
    }

    :deep(.el-radio__input.is-checked + .el-radio__label) {
      color: #303133;
    }

    :deep(.el-radio__label) {
      padding-left: 0;
      width: 100%;
    }

    .mode-content {
      display: flex;
      align-items: center;
      gap: 16px;
      width: 100%;

      .mode-info {
        flex: 1;
        min-width: 0;

        h4 {
          margin: 0 0 8px 0;
          font-size: 15px;
          font-weight: 600;
          color: #303133;
          line-height: 1.4;
        }

        p {
          margin: 0;
          font-size: 13px;
          color: #909399;
          line-height: 1.6;
        }
      }
    }
  }
}

// 导入区域优化
.import-section {
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid #f0f0f0;

    h4 {
      margin: 0;
      font-size: 15px;
      font-weight: 600;
      color: #303133;
    }

    .el-button {
      font-size: 13px;
    }
  }

  // 上传组件优化
  :deep(.el-upload) {
    width: 100%;

    .el-upload-dragger {
      padding: 32px 20px;
      border: 2px dashed #d9d9d9;
      border-radius: 8px;
      background: #fafafa;
      transition: all 0.3s;

      &:hover {
        border-color: #409eff;
        background: #f5f9ff;
      }

      .el-icon--upload {
        font-size: 48px;
        color: #c0c4cc;
        margin-bottom: 12px;
      }

      .el-upload__text {
        color: #606266;
        font-size: 14px;

        em {
          color: #409eff;
          font-style: normal;
          font-weight: 500;
        }
      }
    }
  }

  :deep(.el-upload__tip) {
    font-size: 12px;
    color: #909399;
    margin-top: 8px;
  }
}

// 字段选择区域优化
.field-selection-area {
  margin-top: 20px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 16px;
  background: #fafafa;

  .selection-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 14px;

    h5 {
      margin: 0;
      font-size: 14px;
      font-weight: 600;
      color: #303133;
    }

    .selection-actions {
      display: flex;
      gap: 12px;
      align-items: center;
    }
  }

  .selection-summary {
    margin-top: 14px;
    padding: 10px 14px;
    background: #fff;
    border-radius: 6px;
    font-size: 13px;
    color: #606266;
    border: 1px solid #e4e7ed;

    .highlight {
      color: #409eff;
      font-weight: 600;
      font-size: 16px;
    }
  }
}

// 校验结果优化
.validation-results {
  h4 {
    margin: 0 0 14px 0;
    font-size: 15px;
    font-weight: 600;
    color: #303133;
    padding-left: 10px;
    border-left: 3px solid #409eff;
  }

  .error-actions {
    margin-top: 18px;
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }
}

// 冲突处理优化
.conflict-handling {
  margin-top: 20px;
  padding: 16px;
  background: #fff8e6;
  border: 1px solid #ffe58f;
  border-radius: 8px;
}

// 统计数字高亮
.highlight {
  color: #409eff;
  font-weight: 700;
  font-size: 18px;
}

// 底部按钮区优化
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 8px;

  .el-button {
    min-width: 80px;
    font-size: 14px;
  }
}

// 表单优化
:deep(.el-form) {
  .el-form-item {
    margin-bottom: 18px;
  }

  .el-form-item__label {
    font-size: 13.5px;
    color: #606266;
    font-weight: 500;
  }
}

// 步骤条优化
:deep(.el-steps) {
  .el-step__title {
    font-size: 14px;
    font-weight: 500;
  }

  .el-step__description {
    font-size: 12px;
  }
}

// Alert 组件优化
:deep(.el-alert) {
  border-radius: 6px;

  .el-alert__title {
    font-size: 13.5px;
    font-weight: 500;
  }
}

// 表格优化
:deep(.el-table) {
  border-radius: 6px;
  overflow: hidden;

  .el-table__header th {
    background: #f5f7fa;
    font-weight: 600;
    color: #303133;
    font-size: 13px;
  }

  .el-table__body td {
    font-size: 13px;
  }
}
</style>

