<template>
  <el-dialog
      v-model="dialogVisible"
      :width="isVersionEdit ? '1400px' : '1200px'"
      :close-on-click-modal="false"
      destroy-on-close
      @close="handleDialogClose"
      :class="['edit-dialog', { 'version-edit': isVersionEdit }]"
  >
    <!-- 版本编辑模式的顶部版本信息栏 -->
    <div v-if="isVersionEdit" class="version-header">
      <div class="version-header-left">
        <el-icon class="header-icon"><Document /></el-icon>
        <div class="header-text">
          <div class="header-title">编辑业务对象 - {{ formData.name }}（V{{ newVersion }} 新版本编辑）</div>
          <div class="version-info-bar">
            <span>基于正式版本 V{{ originalVersion }} 创建</span>
            <span class="divider">|</span>
            <span>原版本生效时间：{{ data?.createTime || '2024-01-01' }}</span>
            <span class="divider">|</span>
            <span>新版本创建人：当前用户</span>
            <span class="divider">|</span>
            <span>创建时间：{{ currentTime }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 普通编辑模式的顶部 -->
    <div v-else class="dialog-header">
      <el-icon class="header-icon"><Document /></el-icon>
      <div class="header-text">
        <div class="header-title">编辑业务对象</div>
        <div class="header-subtitle">配置业务对象的字段、关联、索引等</div>
      </div>
    </div>

    <div class="dialog-content">
      <!-- 顶部基本信息 -->
      <div class="basic-info">
        <el-form :model="formData" :rules="formRules" ref="formRef" :label-width="isVersionEdit ? '110px' : '100px'" class="basic-form">
          <!-- 版本说明（仅版本编辑模式显示） -->
          <el-form-item v-if="isVersionEdit" label="版本说明" prop="versionDescription" class="version-description-item">
            <el-input
                v-model="versionDescription"
                type="textarea"
                :rows="2"
                placeholder="请详细描述本次版本修改内容"
                maxlength="500"
                show-word-limit
                class="version-textarea"
            />
            <span class="version-tip">必填项，发布前必须填写</span>
          </el-form-item>

          <div class="form-row">
            <el-form-item label="业务对象名称" prop="name">
              <el-input v-model="formData.name" placeholder="请输入业务对象名称" style="width: 280px" />
            </el-form-item>

            <el-form-item label="数据库表名" prop="tableName" class="table-name-item">
              <el-input
                  v-model="formData.tableName"
                  :disabled="isVersionEdit"
                  :class="{ 'locked-input': isVersionEdit }"                  style="width: 280px"
              >
              </el-input>
              <el-tooltip v-if="isVersionEdit" content="表名锁定，版本发布后不可修改" placement="top">
                <el-icon class="tip-icon"><InfoFilled /></el-icon>
              </el-tooltip>
            </el-form-item>

            <el-form-item label="所属业务域" prop="domain" class="domain-item">
              <el-select
                  v-model="formData.domain"
                  placeholder="请选择业务域"
                  :disabled="isVersionEdit"
                  :class="{ 'locked-input': isVersionEdit }"                  style="width: 200px"
                  @change="handleDomainChange"
              >
                <el-option label="人事类" value="hr" />
                <el-option label="财务类" value="finance" />
                <el-option label="行政类" value="admin" />
                <el-option label="风控类" value="risk" />
                <el-option label="信贷类" value="loan" />
              </el-select>
              <el-tooltip v-if="isVersionEdit" content="业务域锁定，版本迭代中禁止跨域修改" placement="top">
                <el-icon class="tip-icon"><InfoFilled /></el-icon>
              </el-tooltip>
            </el-form-item>
          </div>

          <el-form-item label="备注" prop="remark" class="remark-item">
            <el-input
                v-model="formData.remark"
                type="textarea"
                :rows="2"
                placeholder="请输入备注信息"
                class="remark-textarea"
            />
          </el-form-item>
        </el-form>
      </div>

      <!-- Tab 标签栏 -->
      <el-tabs v-model="activeTab" class="edit-tabs">
        <!-- 1. 字段定义（最高优先级） -->
        <el-tab-pane name="fields">
          <template #label>
            <span class="tab-label">
              <el-icon class="tab-icon"><Document /></el-icon>
              <span>字段定义</span>
            </span>
          </template>
          <FieldDefinition
              :is-version-edit="isVersionEdit"
              :business-object-status="formData.status"
              :business-object-name="formData.name"
              :version-info="isVersionEdit ? `V${newVersion}` : `V${originalVersion}`"
              :business-domain="getDomainText(formData.domain)"
              @add-field="handleAddField"
              @edit-field="handleEditField"
          />
        </el-tab-pane>

        <!-- 2. 关联关系（高优先级） -->
        <el-tab-pane name="relations">
          <template #label>
            <span class="tab-label">
              <el-icon class="tab-icon"><Connection /></el-icon>
              <span>关联关系</span>
            </span>
          </template>
          <RelationManagement :is-version-edit="isVersionEdit" />
        </el-tab-pane>

        <!-- 3. 字段权限（高优先级） -->
        <el-tab-pane name="permissions">
          <template #label>
            <span class="tab-label">
              <el-icon class="tab-icon"><Lock /></el-icon>
              <span>字段权限</span>
            </span>
          </template>
          <FieldPermission :is-version-edit="isVersionEdit" />
        </el-tab-pane>

        <!-- 4. 数据规则（高优先级） -->
        <el-tab-pane name="rules">
          <template #label>
            <span class="tab-label">
              <el-icon class="tab-icon"><Tickets /></el-icon>
              <span>数据规则</span>
            </span>
          </template>
          <DataRule :is-version-edit="isVersionEdit" />
        </el-tab-pane>

        <!-- 5. 索引管理（中优先级） -->
        <el-tab-pane name="indexes">
          <template #label>
            <span class="tab-label">
              <el-icon class="tab-icon"><Menu /></el-icon>
              <span>索引管理</span>
            </span>
          </template>
          <IndexManagement :is-version-edit="isVersionEdit" />
        </el-tab-pane>

        <!-- 6. 关联依赖（中优先级） -->
        <el-tab-pane name="dependencies">
          <template #label>
            <span class="tab-label">
              <el-icon class="tab-icon"><Share /></el-icon>
              <span>关联依赖</span>
            </span>
          </template>
          <DependencyManagement />
        </el-tab-pane>

        <!-- 7. 数据预览（低优先级） -->
        <el-tab-pane name="preview">
          <template #label>
            <span class="tab-label">
              <el-icon class="tab-icon"><View /></el-icon>
              <span>数据预览</span>
            </span>
          </template>
          <DataPreview />
        </el-tab-pane>

        <!-- 8. SQL 预览（低优先级） -->
        <el-tab-pane name="sql">
          <template #label>
            <span class="tab-label">
              <el-icon class="tab-icon"><Notebook /></el-icon>
              <span>SQL 预览</span>
            </span>
          </template>
          <SqlPreview />
        </el-tab-pane>

        <!-- 9. 版本历史（低优先级） -->
        <el-tab-pane name="versions">
          <template #label>
            <span class="tab-label">
              <el-icon class="tab-icon"><Clock /></el-icon>
              <span>版本历史</span>
            </span>
          </template>
          <VersionHistory ref="versionHistoryRef" />
        </el-tab-pane>

        <!-- 版本差异对比标签（仅版本编辑模式显示） -->
        <el-tab-pane v-if="isVersionEdit" name="diff">
          <template #label>
            <span class="tab-label">
              <el-icon class="tab-icon"><ScaleToOriginal /></el-icon>
              <span>版本差异对比</span>
            </span>
          </template>
          <VersionDiff
              ref="versionDiffRef"
              :original-version="originalVersion"
              :new-version="newVersion"
              :diff-data="diffList"
              @refresh="handleRefreshDiff"
          />
        </el-tab-pane>
      </el-tabs>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button v-if="isVersionEdit" @click="handleSaveDraft" :loading="saving">保存草稿</el-button>
        <el-button v-if="isVersionEdit" type="info" @click="handleViewDiff" icon="View">查看差异</el-button>
        <el-button
            v-if="!isVersionEdit"
            type="primary"
            @click="handleSave"
            :loading="saving"
            icon="Check"
        >
          保存
        </el-button>
        <el-button
            v-if="formData.status === 'draft' && !isVersionEdit"
            type="success"
            @click="handlePublish"
            :loading="publishing"
            icon="CircleCheck"
        >
          保存并发布
        </el-button>
        <el-button
            v-if="isVersionEdit"
            type="success"
            @click="handlePublish"
            :loading="publishing"
            icon="CircleCheck"
        >
          发布新版本
        </el-button>
      </div>
    </template>

    <!-- 字段编辑弹窗 -->
    <el-dialog
        v-model="fieldDialogVisible"
        width="550px"
        :close-on-click-modal="false"
        @close="handleFieldDialogClose"
        class="field-dialog"
        append-to-parent
    >
      <div class="field-dialog-header">
        <el-icon class="header-icon"><Document /></el-icon>
        <div class="header-text">
          <div class="header-title">{{ fieldDialogTitle }}</div>
          <div class="header-subtitle">配置字段属性</div>
        </div>
      </div>

      <el-form
          ref="fieldFormRef"
          :model="fieldForm"
          :rules="fieldRules"
          label-width="110px"
          class="field-form"
      >
        <el-form-item label="字段名称" prop="fieldName">
          <el-input v-model="fieldForm.fieldName" placeholder="如：申请人" />
        </el-form-item>

        <el-form-item label="数据库列名" prop="fieldCode">
          <el-input v-model="fieldForm.fieldCode" placeholder="如：applicant" :disabled="editingField?.system || (isVersionEdit && !editingField?.isNewField)" />
        </el-form-item>

        <el-form-item label="字段类型" prop="dataType">
          <el-select v-model="fieldForm.dataType" style="width: 100%" :disabled="isVersionEdit && !editingField?.isNewField">
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

        <el-form-item label="长度">
          <el-input-number
              v-model="fieldForm.length"
              :min="1"
              :max="9999"
              :disabled="!isLengthEditable || (isVersionEdit && !editingField?.isNewField)"
              style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="默认值">
          <el-input v-model="fieldForm.defaultValue" placeholder="字段默认值" />
        </el-form-item>

        <el-form-item label="字段属性">
          <el-space>
            <el-checkbox v-model="fieldForm.required">必填</el-checkbox>
            <el-checkbox v-model="fieldForm.unique" :disabled="isVersionEdit && !editingField?.isNewField">唯一</el-checkbox>
            <el-checkbox v-model="fieldForm.listVisible">列表显示</el-checkbox>
          </el-space>
        </el-form-item>

        <el-form-item label="敏感等级">
          <el-radio-group v-model="fieldForm.sensitiveLevel">
            <el-radio label="normal">普通</el-radio>
            <el-radio label="general">一般敏感</el-radio>
            <el-radio label="high">高度敏感</el-radio>
            <el-radio label="core">核心敏感</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="field-dialog-footer">
          <el-button @click="fieldDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleFieldConfirm" :loading="fieldLoading">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Check, CircleCheck, CircleCheckFilled, Document, Setting, Plus, Upload, Download,
  Edit, Delete, View, Lock, Connection, Top, Menu, Tickets, Notebook, Share, Clock, ScaleToOriginal, InfoFilled
} from '@element-plus/icons-vue'
import FieldDefinition from './tabs/FieldDefinition.vue'
import RelationManagement from './tabs/RelationManagement.vue'
import IndexManagement from './tabs/IndexManagement.vue'
import FieldPermission from './tabs/FieldPermission.vue'
import DataRule from './tabs/DataRule.vue'
import DataPreview from './tabs/DataPreview.vue'
import SqlPreview from './tabs/SqlPreview.vue'
import DependencyManagement from './tabs/DependencyManagement.vue'
import VersionHistory from './tabs/VersionHistory.vue'
import VersionDiff from './tabs/VersionDiff.vue'

const props = defineProps({
  modelValue: Boolean,
  data: Object,
  isVersionEdit: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const formRef = ref(null)
const fieldFormRef = ref(null)
const versionHistoryRef = ref(null)
const versionDiffRef = ref(null)
const saving = ref(false)
const publishing = ref(false)
const activeTab = ref('fields')
const versionDescription = ref('')

// 版本信息
const originalVersion = ref('1.0')
const newVersion = ref('1.1')
const currentTime = ref(new Date().toLocaleString('zh-CN'))

// 表单数据
const formData = reactive({
  id: null,
  name: '',
  tableName: '',
  domain: '',
  remark: '',
  status: 'draft'
})

// 表单验证规则
const formRules = {
  name: [
    { required: true, message: '请输入业务对象名称', trigger: 'blur' }
  ],
  tableName: [
    { required: true, message: '请输入数据库表名', trigger: 'blur' }
  ],
  domain: [
    { required: true, message: '请选择所属业务域', trigger: 'change' }
  ]
}

// 差异列表
const diffList = ref([])

// 字段编辑弹窗
const fieldDialogVisible = ref(false)
const fieldLoading = ref(false)
const fieldDialogTitle = ref('新增字段')
const editingField = ref(null)

const fieldForm = reactive({
  fieldName: '',
  fieldCode: '',
  dataType: 'VARCHAR(64)',
  length: null,
  defaultValue: '',
  required: false,
  unique: false,
  listVisible: false,
  sensitiveLevel: 'normal'
})

const fieldRules = {
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
  return editableTypes.includes(fieldForm.dataType)
})

// 监听弹窗打开，初始化数据
watch(dialogVisible, (newVal) => {
  if (newVal) {
    initForm()
  }
})

// 处理弹窗关闭事件
const handleDialogClose = () => {
  if (!props.isVersionEdit) {
    resetForm()
  }
}

// 重置表单
const resetForm = () => {
  formRef.value?.resetFields()
  fieldFormRef.value?.resetFields()
}

// 初始化数据
const initForm = () => {
  activeTab.value = 'fields'
  versionDescription.value = ''
  if (props.data) {
    formData.id = props.data.id
    formData.name = props.data.name
    formData.tableName = props.data.tableName
    formData.domain = props.data.domain
    formData.remark = props.data.remark || ''
    formData.status = props.data.status || 'draft'

    if (props.isVersionEdit) {
      originalVersion.value = props.data.version || '1.0'
      const versionParts = originalVersion.value.split('.')
      newVersion.value = `${versionParts[0]}.${parseInt(versionParts[1] || 0) + 1}`
      currentTime.value = new Date().toLocaleString('zh-CN')
      generateDiffList()
    }
  }
}

// 生成差异列表
const generateDiffList = () => {
  diffList.value = []
}

// 业务域变更处理
const handleDomainChange = (value) => {
  if (props.isVersionEdit) {
    ElMessageBox.alert(
        '版本编辑模式下不支持跨域修改，业务域必须与原版本保持一致',
        '禁止修改业务域',
        {
          confirmButtonText: '我知道了',
          type: 'error'
        }
    ).then(() => {
      formData.domain = props.data.domain
    })
  }
}

const handleClose = () => {
  if (props.isVersionEdit) {
    ElMessageBox.confirm(
        '放弃当前所有修改，不保留新版本草稿？',
        '取消确认',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
    ).then(() => {
      resetForm()
      emit('update:modelValue', false)
    }).catch(() => {})
  } else {
    resetForm()
    emit('update:modelValue', false)
  }
}

const handleSave = async () => {
  try {
    await formRef.value.validate()
    saving.value = true

    setTimeout(() => {
      saving.value = false
      ElMessage.success('保存成功')
      emit('confirm', { ...formData, action: 'save', isVersionEdit: props.isVersionEdit })
      handleClose()
    }, 1000)
  } catch (error) {
    console.error('验证失败:', error)
  }
}

const handlePublish = async () => {
  if (props.isVersionEdit) {
    if (!versionDescription.value.trim()) {
      ElMessage.warning('请填写版本说明')
      activeTab.value = 'fields'
      return
    }

    // 校验高风险改动
    const highRiskChanges = diffList.value.filter(item => item.changeType === '修改')
    if (highRiskChanges.length > 0) {
      ElMessageBox.confirm(
          `检测到${highRiskChanges.length}处高风险改动，可能影响正在运行的流程和历史数据，是否继续发布？`,
          '高风险提示',
          {
            confirmButtonText: '确认发布',
            cancelButtonText: '取消',
            type: 'warning'
          }
      ).then(() => {
        doPublish()
      }).catch(() => {
        publishing.value = false
      })
      return
    }
  }

  try {
    await formRef.value.validate()
    publishing.value = true

    if (props.isVersionEdit) {
      ElMessageBox.confirm(
          `新版本V${newVersion.value}发布后，新发起的单据将使用新版本，历史单据仍绑定原版本V${originalVersion.value}，是否确认发布？`,
          '发布确认',
          {
            confirmButtonText: '确定发布',
            cancelButtonText: '取消',
            type: 'success'
          }
      ).then(() => {
        doPublish()
      }).catch(() => {
        publishing.value = false
      })
    } else {
      doPublish()
    }
  } catch (error) {
    console.error('发布失败:', error)
  }
}

const doPublish = () => {
  setTimeout(() => {
    publishing.value = false
    ElMessage.success('发布成功')
    emit('confirm', { ...formData, action: 'publish', isVersionEdit: props.isVersionEdit, version: newVersion.value })
    handleClose()
  }, 1500)
}

const handleSaveDraft = () => {
  saving.value = true
  setTimeout(() => {
    saving.value = false
    ElMessage.success('草稿保存成功')
    emit('confirm', { ...formData, action: 'save_draft', isVersionEdit: true, version: newVersion.value })
  }, 1000)
}

const handleViewDiff = () => {
  activeTab.value = 'diff'
  generateDiffList()
}

const handleRefreshDiff = () => {
  generateDiffList()
  ElMessage.success('差异对比已刷新')
}

// 字段编辑相关
const handleAddField = () => {
  // 版本编辑模式下，允许新增字段
  fieldDialogTitle.value = '新增字段'
  editingField.value = null
  resetFieldForm()
  fieldDialogVisible.value = true
}

const handleEditField = (row) => {
  // 版本编辑模式下，原字段禁止编辑核心属性
  if (props.isVersionEdit && !row.isNewField) {
    ElMessage.info('原字段仅可调整列表显示、敏感等级等非核心配置')
    return
  }

  fieldDialogTitle.value = '编辑字段'
  editingField.value = row
  fieldForm.fieldName = row.fieldName
  fieldForm.fieldCode = row.fieldCode
  fieldForm.dataType = row.dataType
  fieldForm.defaultValue = row.defaultValue || ''
  fieldForm.required = row.required
  fieldForm.unique = row.unique
  fieldForm.listVisible = row.listVisible
  fieldForm.sensitiveLevel = row.sensitiveLevel
  fieldForm.length = row.length
  fieldDialogVisible.value = true
}

const handleFieldDialogClose = () => {
  fieldFormRef.value?.resetFields()
  editingField.value = null
}

const handleFieldConfirm = async () => {
  try {
    await fieldFormRef.value.validate()
    fieldLoading.value = true

    setTimeout(() => {
      fieldLoading.value = false
      ElMessage.success(editingField.value ? '修改成功' : '新增成功')
      fieldDialogVisible.value = false
      if (props.isVersionEdit) {
        generateDiffList()
      }
    }, 500)
  } catch (error) {
    console.error('验证失败:', error)
  }
}

// 获取业务域文本
const getDomainText = (domain) => {
  const domainMap = {
    'hr': '人事类',
    'finance': '财务类',
    'admin': '行政类',
    'risk': '风控类',
    'loan': '信贷类'
  }
  return domainMap[domain] || '未知'
}

const resetFieldForm = () => {
  fieldForm.fieldName = ''
  fieldForm.fieldCode = ''
  fieldForm.dataType = 'VARCHAR(64)'
  fieldForm.length = null
  fieldForm.defaultValue = ''
  fieldForm.required = false
  fieldForm.unique = false
  fieldForm.listVisible = false
  fieldForm.sensitiveLevel = 'normal'
}
</script>

<style scoped lang="scss">
.edit-dialog {
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

  .version-header {
    padding: 20px 24px 16px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 8px 8px 0 0;
    margin: -24px -24px 20px;

    .version-header-left {
      display: flex;
      align-items: flex-start;
      gap: 16px;

      .header-icon {
        font-size: 32px;
        color: #fff;
        flex-shrink: 0;
        margin-top: 4px;
      }

      .header-text {
        flex: 1;

        .header-title {
          font-size: 18px;
          font-weight: 600;
          color: #fff;
          margin-bottom: 8px;
        }

        .version-info-bar {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: rgba(255, 255, 255, 0.9);
          flex-wrap: wrap;

          .divider {
            color: rgba(255, 255, 255, 0.5);
          }
        }
      }
    }
  }

  .dialog-content {
    .version-description-item {
      margin-bottom: 24px;

      :deep(.el-form-item__label) {
        font-weight: 600;
        color: #303133;
      }

      :deep(.el-form-item__content) {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
      }

      .version-textarea {
        width: 100%;
      }

      .version-tip {
        display: block;
        font-size: 12px;
        color: #f56c6c;
        margin-top: 6px;
        font-weight: 500;
      }
    }

    .remark-item {
      :deep(.el-form-item__content) {
        width: 100%;
      }

      .remark-textarea {
        width: 100%;
      }
    }
  }

  .basic-info {
    margin-bottom: 20px;
    padding: 0 8px;

    .basic-form {
      .form-row {
        display: flex;
        gap: 24px;
        flex-wrap: nowrap;
        align-items: flex-start;

        :deep(.el-form-item) {
          margin-bottom: 18px;
          flex-shrink: 0;

          .el-form-item__label {
            white-space: nowrap;
          }
        }

        .domain-item {
          display: flex;
          align-items: flex-start;
          gap: 8px;

          :deep(.el-form-item__content) {
            display: flex;
            align-items: flex-start;
            gap: 8px;
          }
        }

        .table-name-item {
          display: flex;
          align-items: flex-start;
          gap: 8px;

          :deep(.el-form-item__content) {
            display: flex;
            align-items: flex-start;
            gap: 8px;
          }
        }

        .locked-input {
          :deep(.el-input__wrapper) {
            background-color: #f5f7fa;
            cursor: not-allowed;
          }
        }

        .tip-icon {
          color: #909399;
          font-size: 16px;
          margin-top: 10px;
          cursor: pointer;

          &:hover {
            color: #606266;
          }
        }
      }
    }
  }

  .edit-tabs {
    :deep(.el-tabs__header) {
      margin-bottom: 20px;
      background: linear-gradient(to right, #f8f9fa, #ffffff);
      border-radius: 8px 8px 0 0;
      padding: 4px 8px 0;
      border-bottom: 2px solid #e4e7ed;

      .el-tabs__nav-wrap {
        padding: 0 4px;
      }

      .el-tabs__item {
        font-size: 14px;
        font-weight: 500;
        padding: 12px 20px;
        color: #606266;
        transition: all 0.3s ease;
        border-radius: 6px 6px 0 0;
        margin: 0 2px;
        position: relative;

        &:hover {
          color: #667eea;
          background-color: rgba(102, 126, 234, 0.05);
        }

        &.is-active {
          color: #667eea;
          background-color: #ffffff;
          font-weight: 600;
          box-shadow: 0 -2px 8px rgba(102, 126, 234, 0.15);

          &::after {
            content: '';
            position: absolute;
            bottom: -2px;
            left: 0;
            right: 0;
            height: 2px;
            background: linear-gradient(to right, #667eea, #764ba2);
          }

          .tab-label {
            .el-icon {
              color: #667eea;
              transform: scale(1.1);
            }
          }
        }
      }

      .el-tabs__active-bar {
        display: none;
      }
    }

    :deep(.el-tabs__content) {
      padding: 0;
    }

    .tab-label {
      display: flex;
      align-items: center;
      gap: 6px;

      .el-icon {
        font-size: 16px;
        transition: all 0.3s ease;
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

  .field-form {
    padding: 10px 20px;

    .el-form-item {
      margin-bottom: 18px;
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
