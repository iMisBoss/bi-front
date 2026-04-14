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
            <span>原版本生效时间：{{ data?.createTime || '2026-01-01' }}</span>
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
          <!-- 版本编辑模式：基本信息在一行 -->
          <div v-if="isVersionEdit" class="form-row version-edit-row">
            <el-form-item label="业务对象名称" prop="name" class="compact-item">
              <el-input v-model="formData.name" placeholder="请输入业务对象名称" />
            </el-form-item>

            <el-form-item label="数据库表名" prop="tableName" class="compact-item">
              <el-input
                  v-model="formData.tableName"
                  disabled
                  class="locked-input"
              />
              <el-tooltip content="表名锁定，版本发布后不可修改" placement="top">
                <el-icon class="tip-icon"><InfoFilled /></el-icon>
              </el-tooltip>
            </el-form-item>

            <el-form-item label="所属业务域" prop="domain" class="compact-item">
              <el-select
                  v-model="formData.domain"
                  placeholder="请选择业务域"
                  disabled
                  class="locked-input"
                  @change="handleDomainChange"
              >
                <el-option label="人事类" value="hr" />
                <el-option label="财务类" value="finance" />
                <el-option label="行政类" value="admin" />
                <el-option label="风控类" value="risk" />
                <el-option label="信贷类" value="loan" />
              </el-select>
              <el-tooltip content="业务域锁定，版本迭代中禁止跨域修改" placement="top">
                <el-icon class="tip-icon"><InfoFilled /></el-icon>
              </el-tooltip>
            </el-form-item>
          </div>

          <!-- 普通编辑模式：保持原有布局 -->
          <template v-else>
            <div class="form-row">
              <el-form-item label="业务对象名称" prop="name">
                <el-input v-model="formData.name" placeholder="请输入业务对象名称" style="width: 280px" />
              </el-form-item>

              <el-form-item label="数据库表名" prop="tableName" class="table-name-item">
                <el-input
                    v-model="formData.tableName"                    style="width: 280px"
                >
                </el-input>
              </el-form-item>

              <el-form-item label="所属业务域" prop="domain" class="domain-item">
                <el-select
                    v-model="formData.domain"
                    placeholder="请选择业务域"                    style="width: 200px"
                    @change="handleDomainChange"
                >
                  <el-option label="人事类" value="hr" />
                  <el-option label="财务类" value="finance" />
                  <el-option label="行政类" value="admin" />
                  <el-option label="风控类" value="risk" />
                  <el-option label="信贷类" value="loan" />
                </el-select>
              </el-form-item>
            </div>
          </template>

          <!-- 备注和版本说明在同一行（版本编辑模式） -->
          <div v-if="isVersionEdit" class="remark-version-row">
            <el-form-item label="备注" prop="remark" class="remark-item half-width">
              <el-input
                  v-model="formData.remark"
                  type="textarea"
                  :rows="1"
                  autosize
                  placeholder="请输入备注信息"
                  class="remark-textarea"
              />
            </el-form-item>

            <el-form-item class="version-description-item half-width">
              <template #label>
                <span>版本说明</span>
                <span class="required-star">*</span>
                <el-tooltip content="必填项，发布前必须填写" placement="top">
                  <el-icon class="tip-icon"><QuestionFilled /></el-icon>
                </el-tooltip>
              </template>
              <el-input
                  v-model="versionDescription"
                  placeholder="请详细描述本次版本修改内容"
                  maxlength="200"
                  show-word-limit
                  clearable
              />
            </el-form-item>
          </div>

          <!-- 备注（普通编辑模式，独占一行） -->
          <el-form-item v-else label="备注" prop="remark" class="remark-item">
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
              @edit-non-core-property="handleEditNonCoreProperty"
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
          <RelationManagement
              :is-version-edit="isVersionEdit"
              :business-object-status="formData.status"
              :business-object-name="formData.name"
              :business-domain="getDomainText(formData.domain)"
              @change="handleRelationChange"
          />
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
        <el-button @click="handleClose" size="default">取消</el-button>
        <el-button v-if="isVersionEdit" @click="handleSaveDraft" :loading="saving" size="default">保存草稿</el-button>
        <el-button v-if="isVersionEdit" type="info" @click="handleViewDiff" icon="View" size="default">查看差异</el-button>
        <el-button
            v-if="!isVersionEdit"
            type="primary"
            @click="handleSave"
            :loading="saving"
            icon="Check"
            size="default"
        >
          保存
        </el-button>
        <el-button
            v-if="formData.status === 'draft' && !isVersionEdit"
            type="success"
            @click="handlePublish"
            :loading="publishing"
            icon="CircleCheck"
            size="default"
        >
          保存并发布
        </el-button>
        <el-button
            v-if="isVersionEdit"
            type="success"
            @click="handlePublish"
            :loading="publishing"
            icon="CircleCheck"
            size="default"
            class="publish-btn"
        >
          发布新版本
        </el-button>
      </div>
    </template>

    <!-- 字段编辑弹窗 -->
    <FieldEditDialog
        v-model="fieldDialogVisible"
        :title="fieldDialogTitle"
        :subtitle="getFieldDialogSubtitle()"
        :field-data="editingField"
        :is-non-core-edit="isNonCoreEdit"
        :is-version-edit="isVersionEdit"
        @confirm="handleFieldConfirm"
    />
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Check, CircleCheck, Document, View, Lock, Connection, Menu, Tickets, Notebook, Share, Clock, ScaleToOriginal, InfoFilled, QuestionFilled
} from '@element-plus/icons-vue'
import FieldDefinition from './field-definition/FieldDefinition.vue'
import RelationManagement from './relation-edit-dialog/RelationManagement.vue'
import IndexManagement from './index-management/IndexManagement.vue'
import FieldPermission from './field-permission/FieldPermission.vue'
import DataRule from './data-rule/DataRule.vue'
import DataPreview from './data-preview/DataPreview.vue'
import SqlPreview from './sql-preview/SqlPreview.vue'
import DependencyManagement from './dependency-management/DependencyManagement.vue'
import VersionHistory from './version-history/VersionHistory.vue'
import VersionDiff from './version-diff/VersionDiff.vue'
import FieldEditDialog from './field-definition/FieldEditDialog.vue'

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
const fieldDialogTitle = ref('新增字段')
const editingField = ref(null)
const isNonCoreEdit = ref(false)

// 并在初始化时获取 fieldList
watch(dialogVisible, (newVal) => {
  if (newVal) {
    initForm()
    // 延迟获取 fieldList
    setTimeout(() => {
      if (fieldDefinitionRef.value) {
        fieldList.value = fieldDefinitionRef.value.fieldList
      }
    }, 100)
  }
})

const fieldDefinitionRef = ref(null)

// 处理弹窗关闭事件
const handleDialogClose = () => {
  if (!props.isVersionEdit) {
    resetForm()
  }
}

// 重置表单
const resetForm = () => {
  formRef.value?.resetFields()
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
    publishing.value = false
  }
}

const doPublish = () => {
  setTimeout(() => {
    publishing.value = false
    ElMessage.success('发布成功')
    emit('confirm', { ...formData, action: 'publish', isVersionEdit: props.isVersionEdit, version: newVersion.value })

    // 直接关闭弹窗，不触发 handleDialogClose
    dialogVisible.value = false
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
  fieldDialogTitle.value = '新增字段'
  editingField.value = null
  isNonCoreEdit.value = false
  fieldDialogVisible.value = true
}

const handleEditField = (row) => {
  isNonCoreEdit.value = false
  fieldDialogTitle.value = '编辑字段'
  editingField.value = { ...row }
  fieldDialogVisible.value = true
}

const handleEditNonCoreProperty = (row) => {
  isNonCoreEdit.value = true
  fieldDialogTitle.value = '编辑非核心属性'
  editingField.value = { ...row }
  fieldDialogVisible.value = true
}

const handleFieldConfirm = (fieldData) => {
  if (editingField.value && editingField.value.id) {
    // 编辑模式：更新现有字段
    const index = fieldList.value.findIndex(f => f.id === editingField.value.id)
    if (index !== -1) {
      Object.assign(fieldList.value[index], fieldData)
      if (props.isVersionEdit && !fieldList.value[index].isNewField) {
        fieldList.value[index].changeType = '修改'
      }
    }
    ElMessage.success('修改成功')
  } else {
    // 新增模式：添加新字段
    const newField = {
      id: Date.now(),
      ...fieldData,
      system: false,
      isNewField: true,
      status: 'active',
      sort: fieldList.value.length + 1,
      changeType: '新增'
    }
    fieldList.value.push(newField)
    ElMessage.success('新增成功')
  }

  if (props.isVersionEdit) {
    generateDiffList()
  }
}

// 获取字段列表（通过 ref）
const fieldList = ref([])

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

// 获取字段编辑弹窗副标题
const getFieldDialogSubtitle = () => {
  if (isNonCoreEdit.value) {
    return '仅可调整列表显示、敏感等级、字段说明等非核心配置'
  }
  if (props.isVersionEdit && editingField.value?.isNewField) {
    return '本次新版本新增字段，所有属性均可自由编辑'
  }
  if (props.isVersionEdit && !editingField.value?.isNewField) {
    return '原字段核心属性已锁定'
  }
  return '配置字段属性'
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
    // 版本编辑模式：备注和版本说明在同一行
    .remark-version-row {
      display: flex;
      gap: 24px;
      margin-bottom: 0;

      .half-width {
        flex: 1;
        margin-bottom: 0;
        min-width: 0;

        :deep(.el-form-item__content) {
          width: 100%;
        }
      }

      .remark-item {
        .remark-textarea {
          width: 100%;

          :deep(.el-textarea__inner) {
            resize: vertical;
            min-height: 32px;
            line-height: 1.5;
          }
        }
      }

      .version-description-item {
        :deep(.el-form-item__label) {
          font-weight: 600;
          color: #303133;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        :deep(.el-form-item__content) {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        :deep(.el-input__wrapper) {
          padding: 0 12px;
        }

        .required-star {
          color: #f56c6c;
          font-size: 14px;
          font-weight: bold;
          margin-left: 2px;
        }

        .tip-icon {
          color: #909399;
          font-size: 14px;
          cursor: pointer;
          margin-left: 4px;

          &:hover {
            color: #606266;
          }
        }
      }
    }

    // 普通版本说明样式（兼容旧版）
    .version-description-item {
      margin-bottom: 16px;

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

    // 备注样式（普通模式）
    .remark-item {
      margin-bottom: 16px;

      :deep(.el-form-item__content) {
        width: 100%;
      }

      .remark-textarea {
        width: 100%;
      }
    }
  }

  .basic-info {
    margin-bottom: 16px;
    padding: 0 8px;

    .basic-form {
      .form-row {
        display: flex;
        gap: 24px;
        flex-wrap: nowrap;
        align-items: flex-start;
        margin-bottom: 16px;

        :deep(.el-form-item) {
          margin-bottom: 0;
          flex-shrink: 0;

          .el-form-item__label {
            white-space: nowrap;
          }
        }

        .compact-item {
          flex: 0 0 auto;

          :deep(.el-form-item__content) {
            display: flex;
            align-items: center;
            gap: 6px;
          }

          :deep(.el-input),
          :deep(.el-select) {
            width: 200px;
          }

          .locked-input {
            :deep(.el-input__wrapper) {
              background-color: #f5f7fa;
              cursor: not-allowed;
            }
          }

          .tip-icon {
            color: #909399;
            font-size: 14px;
            cursor: pointer;

            &:hover {
              color: #606266;
            }
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
    padding: 20px 24px 0;
    border-top: 1px solid #ebeef5;
    background: linear-gradient(to bottom, #ffffff, #fafbfc);

    .el-button {
      padding: 10px 20px;
      font-size: 14px;
      border-radius: 8px;
      transition: all 0.3s;

      &:hover {
        transform: translateY(-1px);
      }
    }

    .publish-btn {
      background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
      border: none;
      color: #fff;
      font-weight: 600;
      box-shadow: 0 4px 12px rgba(103, 194, 58, 0.3);

      &:hover {
        box-shadow: 0 6px 16px rgba(103, 194, 58, 0.4);
        transform: translateY(-2px);
      }

      &:active {
        transform: translateY(0);
      }
    }
  }
}
</style>

