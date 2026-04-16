<template>
  <div class="form-management">
    <!-- Tab页切换 -->
    <el-tabs v-model="activeTab" class="management-tabs" @tab-change="handleTabChange">
      <!-- Tab1: 表单管理 -->
      <el-tab-pane label="表单管理" name="form">
        <FormManagement
            :form-list="formList"
            :search-form="formSearchForm"
            :loading="formLoading"
            @search="handleFormSearch"
            @reset="handleFormReset"
            @selection-change="handleFormSelectionChange"
            @preview="handlePreviewForm"
            @edit="handleEditForm"
            @bind-flow="handleBindFlow"
            @save-as-template="handleSaveAsTemplate"
            @toggle-status="handleToggleFormStatus"
            @delete="handleDeleteForm"
            @batch-import="handleBatchImportForm"
            @batch-export="handleBatchExportForm"
            @batch-toggle-status="handleBatchEnableForms"
            @batch-disable="handleBatchDisableForms"
            @batch-delete="handleBatchDeleteForms"
            @add="handleAddForm"
            @field-permission="handleFieldPermission"
            @form-linkage="handleFormLinkage"
        />
      </el-tab-pane>

      <!-- Tab2: 表单模板管理 -->
      <el-tab-pane label="表单模板管理" name="template">
        <TemplateManagement
            :template-list="templateList"
            :search-form="templateSearchForm"
            :loading="templateLoading"
            @search="handleTemplateSearch"
            @reset="handleTemplateReset"
            @selection-change="handleTemplateSelectionChange"
            @preview="handlePreviewTemplate"
            @use="handleUseTemplate"
            @edit="handleEditTemplate"
            @toggle-status="handleToggleTemplateStatus"
            @delete="handleDeleteTemplate"
            @batch-import="handleBatchImportTemplate"
            @batch-export="handleBatchExportTemplate"
            @batch-toggle-status="handleBatchEnableTemplates"
            @batch-disable="handleBatchDisableTemplates"
            @batch-delete="handleBatchDeleteTemplates"
            @add="handleAddTemplate"
        />
      </el-tab-pane>
    </el-tabs>

    <!-- 表单预览弹窗 -->
    <el-dialog v-model="previewDialog.visible" :title="previewDialog.title" width="900px" append-to-body top="5vh">
      <div class="preview-container">
        <div class="preview-header">
          <h3>{{ previewDialog.currentItem?.formName || previewDialog.currentItem?.templateName }}</h3>
          <div class="preview-meta">
            <el-tag size="small">{{ getCategoryLabel(previewDialog.currentItem?.category) }}</el-tag>
            <span class="preview-desc">{{ previewDialog.currentItem?.description }}</span>
          </div>
        </div>
        <div class="preview-body">
          <el-empty v-if="!previewDialog.currentItem?.fields || previewDialog.currentItem.fields.length === 0"
                    description="暂无字段配置" :image-size="80" />
          <div v-else class="preview-fields">
            <div v-for="field in previewDialog.currentItem.fields" :key="field.id" class="preview-field-item">
              <div class="preview-field-label">
                <span v-if="field.required" class="required-mark">*</span>
                {{ field.label }}
              </div>
              <div class="preview-field-control">
                <el-input disabled placeholder="预览模式（只读）" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="previewDialog.visible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 绑定流程弹窗 -->
    <el-dialog v-model="bindFlowDialog.visible" title="绑定审批流程" width="600px" append-to-body>
      <div class="bind-flow-content">
        <el-alert
            title="绑定流程后，用户可在审批中心发起该表单的审批申请"
            type="info"
            :closable="false"
            show-icon
            style="margin-bottom: 16px"
        />
        <el-form :model="bindFlowForm" label-width="100px">
          <el-form-item label="选择流程">
            <el-select v-model="bindFlowForm.flowId" placeholder="请选择要绑定的流程" style="width: 100%">
              <el-option label="请假审批流程" value="leave_flow" />
              <el-option label="费用报销流程" value="expense_flow" />
              <el-option label="会议申请流程" value="meeting_flow" />
            </el-select>
          </el-form-item>
          <el-form-item label="流程说明">
            <el-input type="textarea" :rows="3" placeholder="请输入流程说明（选填）" />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="bindFlowDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="confirmBindFlow">确认绑定</el-button>
      </template>
    </el-dialog>
    <!-- 导入表单弹窗 -->
    <el-dialog v-model="importFormDialog.visible" title="导入表单" width="520px" append-to-body>
      <div class="import-dialog">
        <el-upload
            class="upload-area"
            drag
            accept=".json"
            :auto-upload="false"
            :show-file-list="true"
            :limit="10"
            :on-change="handleImportFormFileChange"
            :on-remove="handleRemoveImportFormFile"
        >
          <el-icon class="el-icon--upload"><upload-filled /></el-icon>
          <div class="el-upload__text">
            拖拽 JSON 文件到此处，或 <em>点击选择</em>
          </div>
          <template #tip>
            <div class="el-upload__tip">支持批量导入，仅支持 .json 格式的表单配置文件</div>
          </template>
        </el-upload>
      </div>
      <template #footer>
        <el-button @click="importFormDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="confirmImportForm" :loading="importFormDialog.loading" :disabled="importFormDialog.files.length === 0">
          确认导入
        </el-button>
      </template>
    </el-dialog>
    <!-- 导入模板弹窗 -->
    <el-dialog v-model="importTemplateDialog.visible" title="导入模板" width="520px" append-to-body>
      <div class="import-dialog">
        <el-upload
            class="upload-area"
            drag
            accept=".json"
            :auto-upload="false"
            :show-file-list="true"
            :limit="10"
            :on-change="handleImportTemplateFileChange"
        >
          <el-icon class="el-icon--upload"><upload-filled /></el-icon>
          <div class="el-upload__text">
            拖拽 JSON 文件到此处，或 <em>点击选择</em>
          </div>
          <template #tip>
            <div class="el-upload__tip">支持批量导入，仅支持 .json 格式的模板文件</div>
          </template>
        </el-upload>
      </div>
      <template #footer>
        <el-button @click="importTemplateDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="confirmImportTemplate" :disabled="importTemplateDialog.files.length === 0">
          确认导入
        </el-button>
      </template>
    </el-dialog>

    <!-- 保存为模板弹窗 -->
    <el-dialog v-model="saveAsTemplateDialog.visible" title="保存为模板" width="500px" append-to-body>
      <el-form :model="saveAsTemplateForm" label-width="100px">
        <el-form-item label="模板名称">
          <el-input v-model="saveAsTemplateForm.templateName" placeholder="请输入模板名称" />
        </el-form-item>
        <el-form-item label="模板分类">
          <el-select v-model="saveAsTemplateForm.category" placeholder="请选择" style="width: 100%">
            <el-option label="人事类" value="hr" />
            <el-option label="财务类" value="finance" />
            <el-option label="行政类" value="admin" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="模板说明">
          <el-input type="textarea" :rows="3" v-model="saveAsTemplateForm.description" placeholder="请输入模板说明（选填）" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="saveAsTemplateDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="confirmSaveAsTemplate">确认保存</el-button>
      </template>
    </el-dialog>
    <!-- 字段权限配置弹窗 -->
    <el-dialog v-model="fieldPermissionDialog.visible" title="字段权限配置" width="900px" append-to-body top="5vh">
      <field-permission-config
          :form-id="fieldPermissionDialog.formId"
          :form-name="fieldPermissionDialog.formName"
          @saved="fieldPermissionDialog.visible = false"
      />
    </el-dialog>

    <!-- 表单联动规则弹窗 -->
    <el-dialog v-model="formLinkageDialog.visible" title="表单联动规则" width="900px" append-to-body top="5vh">
      <form-linkage-config
          :form-id="formLinkageDialog.formId"
          :form-name="formLinkageDialog.formName"
          @saved="formLinkageDialog.visible = false"
      />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { UploadFilled } from '@element-plus/icons-vue'
import FormManagement from './components/FormManagement.vue'
import TemplateManagement from './components/TemplateManagement.vue'
import FieldPermissionConfig from './components/FieldPermissionConfig.vue'
import FormLinkageConfig from './components/FormLinkageConfig.vue'

const router = useRouter()

// 当前Tab
const activeTab = ref('form')

// ==================== 表单管理 ====================
const formSearchForm = ref({
  formName: '',
  category: '',
  status: ''
})

const formLoading = ref(false)

const importFormDialog = ref({
  visible: false,
  files: [],
  loading: false
})

const fieldPermissionDialog = ref({
  visible: false,
  formId: null,
  formName: ''
})

const formLinkageDialog = ref({
  visible: false,
  formId: null,
  formName: ''
})

const formList = ref([
  {
    id: 1,
    formName: '请假申请表单',
    category: 'hr',
    fieldCount: 8,
    boundFlowCount: 2,
    launchCount: 125,
    status: 'enabled',
    description: '员工请假申请标准表单，已绑定请假审批流程',
    creator: '系统管理员',
    createTime: '2026-01-10 09:00:00',
    fields: [
      { id: 1, label: '请假类型', type: 'select', required: true },
      { id: 2, label: '请假天数', type: 'number', required: true },
      { id: 3, label: '开始时间', type: 'date', required: true },
      { id: 4, label: '结束时间', type: 'date', required: true },
      { id: 5, label: '请假事由', type: 'textarea', required: true }
    ]
  },
  {
    id: 2,
    formName: '费用报销表单',
    category: 'finance',
    fieldCount: 10,
    boundFlowCount: 1,
    launchCount: 86,
    status: 'enabled',
    description: '员工费用报销申请表单，支持明细表',
    creator: '财务管理员',
    createTime: '2026-02-01 10:00:00',
    fields: [
      { id: 1, label: '报销类型', type: 'select', required: true },
      { id: 2, label: '报销金额', type: 'number', required: true },
      { id: 3, label: '发票附件', type: 'upload', required: true },
      { id: 4, label: '报销事由', type: 'textarea', required: true }
    ]
  },
  {
    id: 3,
    formName: '会议申请表单',
    category: 'admin',
    fieldCount: 7,
    boundFlowCount: 1,
    launchCount: 52,
    status: 'enabled',
    description: '会议室预订和会议申请表单',
    creator: '行政管理员',
    createTime: '2026-03-01 11:00:00',
    fields: [
      { id: 1, label: '会议主题', type: 'input', required: true },
      { id: 2, label: '会议时间', type: 'date', required: true },
      { id: 3, label: '会议地点', type: 'input', required: true }
    ]
  },
  {
    id: 4,
    formName: '出差申请表单',
    category: 'hr',
    fieldCount: 12,
    boundFlowCount: 3,
    launchCount: 98,
    status: 'enabled',
    description: '员工出差申请标准表单，包含交通、住宿、差旅费等明细',
    creator: '系统管理员',
    createTime: '2026-03-15 14:30:00',
    fields: [
      { id: 1, label: '出差地点', type: 'input', required: true },
      { id: 2, label: '出差事由', type: 'textarea', required: true },
      { id: 3, label: '预算金额', type: 'number', required: true }
    ]
  },
  {
    id: 5,
    formName: '采购申请表单',
    category: 'finance',
    fieldCount: 15,
    boundFlowCount: 2,
    launchCount: 67,
    status: 'enabled',
    description: '办公用品及设备采购申请表单',
    creator: '采购管理员',
    createTime: '2026-04-01 09:00:00',
    fields: [
      { id: 1, label: '采购物品', type: 'input', required: true },
      { id: 2, label: '采购数量', type: 'number', required: true },
      { id: 3, label: '预算金额', type: 'number', required: true }
    ]
  },
  {
    id: 6,
    formName: '加班申请表单',
    category: 'hr',
    fieldCount: 6,
    boundFlowCount: 1,
    launchCount: 156,
    status: 'enabled',
    description: '员工加班申请标准表单',
    creator: '系统管理员',
    createTime: '2026-04-10 10:00:00',
    fields: [
      { id: 1, label: '加班日期', type: 'date', required: true },
      { id: 2, label: '加班时长', type: 'number', required: true },
      { id: 3, label: '加班事由', type: 'textarea', required: true }
    ]
  },
  {
    id: 7,
    formName: '用印申请表单',
    category: 'admin',
    fieldCount: 8,
    boundFlowCount: 2,
    launchCount: 43,
    status: 'enabled',
    description: '公司印章使用申请表单',
    creator: '行政管理员',
    createTime: '2026-05-01 11:00:00',
    fields: [
      { id: 1, label: '用印类型', type: 'select', required: true },
      { id: 2, label: '用印文件', type: 'upload', required: true },
      { id: 3, label: '用印事由', type: 'textarea', required: true }
    ]
  },
  {
    id: 8,
    formName: '车辆使用申请表单',
    category: 'admin',
    fieldCount: 9,
    boundFlowCount: 1,
    launchCount: 35,
    status: 'disabled',
    description: '公司公务车辆使用申请表单（已停用）',
    creator: '行政管理员',
    createTime: '2026-05-15 14:00:00',
    fields: [
      { id: 1, label: '用车时间', type: 'date', required: true },
      { id: 2, label: '用车事由', type: 'textarea', required: true },
      { id: 3, label: '目的地', type: 'input', required: true }
    ]
  },
  {
    id: 9,
    formName: '入职申请表单',
    category: 'hr',
    fieldCount: 20,
    boundFlowCount: 4,
    launchCount: 210,
    status: 'enabled',
    description: '新员工入职信息登记标准表单',
    creator: '人事管理员',
    createTime: '2026-06-01 09:00:00',
    fields: [
      { id: 1, label: '姓名', type: 'input', required: true },
      { id: 2, label: '身份证号', type: 'input', required: true },
      { id: 3, label: '入职日期', type: 'date', required: true }
    ]
  },
  {
    id: 10,
    formName: '离职申请表单',
    category: 'hr',
    fieldCount: 10,
    boundFlowCount: 3,
    launchCount: 28,
    status: 'enabled',
    description: '员工离职申请标准表单',
    creator: '人事管理员',
    createTime: '2026-06-15 10:00:00',
    fields: [
      { id: 1, label: '离职日期', type: 'date', required: true },
      { id: 2, label: '离职原因', type: 'textarea', required: true },
      { id: 3, label: '交接事项', type: 'textarea', required: true }
    ]
  }
])

const handleFormSearch = () => {
  formLoading.value = true
  setTimeout(() => {
    formLoading.value = false
    ElMessage.success('查询完成')
  }, 500)
}

const handleFormReset = () => {
  formSearchForm.value = {
    formName: '',
    category: '',
    status: ''
  }
  ElMessage.success('已重置查询条件')
}

const handleFormSelectionChange = (rows) => {
  console.log('选中表单:', rows)
}

const handleAddForm = () => {
  router.push({
    path: '/process/design/form/design',
    query: { mode: 'form', formId: null }
  })
}

const handleFieldPermission = (row) => {
  fieldPermissionDialog.value.formId = row.id
  fieldPermissionDialog.value.formName = row.formName
  fieldPermissionDialog.value.visible = true
}

const handleFormLinkage = (row) => {
  formLinkageDialog.value.formId = row.id
  formLinkageDialog.value.formName = row.formName
  formLinkageDialog.value.visible = true
}

// 批量启用表单
const handleBatchEnableForms = (rows) => {
  if (rows.length === 0) {
    ElMessage.warning('请先选择要启用的表单')
    return
  }

  ElMessageBox.confirm(
      `确认启用选中的 ${rows.length} 个表单？`,
      '批量启用',
      {
        confirmButtonText: '确认启用',
        cancelButtonText: '取消',
        type: 'info'
      }
  ).then(() => {
    rows.forEach(form => {
      form.status = 'enabled'
    })
    ElMessage.success(`已启用 ${rows.length} 个表单`)
  }).catch(() => {})
}

// 批量禁用表单
const handleBatchDisableForms = (rows) => {
  if (rows.length === 0) {
    ElMessage.warning('请先选择要禁用的表单')
    return
  }

  ElMessageBox.confirm(
      `确认禁用选中的 ${rows.length} 个表单？禁用后用户将无法发起这些表单。`,
      '批量禁用',
      {
        confirmButtonText: '确认禁用',
        cancelButtonText: '取消',
        type: 'warning'
      }
  ).then(() => {
    rows.forEach(form => {
      form.status = 'disabled'
    })
    ElMessage.success(`已禁用 ${rows.length} 个表单`)
  }).catch(() => {})
}

// 批量删除表单
const handleBatchDeleteForms = (rows) => {
  if (rows.length === 0) {
    ElMessage.warning('请先选择要删除的表单')
    return
  }

  // 检查是否有已发起的表单
  const hasLaunched = rows.some(form => form.launchCount > 0)

  if (hasLaunched) {
    ElMessageBox.confirm(
        `选中的表单中包含已被发起的表单，删除后将无法恢复。是否确认删除？`,
        '批量删除确认',
        {
          confirmButtonText: '确认删除',
          cancelButtonText: '取消',
          type: 'warning'
        }
    ).then(() => {
      const idsToDelete = rows.map(form => form.id)
      formList.value = formList.value.filter(form => !idsToDelete.includes(form.id))
      ElMessage.success(`已删除 ${rows.length} 个表单`)
    }).catch(() => {})
  } else {
    ElMessageBox.confirm(
        `确认删除选中的 ${rows.length} 个表单？删除后无法恢复。`,
        '批量删除确认',
        {
          confirmButtonText: '确认删除',
          cancelButtonText: '取消',
          type: 'warning'
        }
    ).then(() => {
      const idsToDelete = rows.map(form => form.id)
      formList.value = formList.value.filter(form => !idsToDelete.includes(form.id))
      ElMessage.success(`已删除 ${rows.length} 个表单`)
    }).catch(() => {})
  }
}

const handlePreviewForm = (row) => {
  previewDialog.value = {
    visible: true,
    title: '表单预览',
    currentItem: row
  }
}

const handleEditForm = (row) => {
  router.push({
    path: '/process/design/form/design',
    query: { mode: 'edit-form', formId: row.id }
  })
}

const bindFlowDialog = ref({
  visible: false,
  currentForm: null
})

const bindFlowForm = ref({
  flowId: ''
})

const handleBindFlow = (row) => {
  bindFlowDialog.value.currentForm = row
  bindFlowDialog.value.visible = true
}

const confirmBindFlow = () => {
  if (!bindFlowForm.value.flowId) {
    ElMessage.warning('请选择要绑定的流程')
    return
  }

  const form = formList.value.find(f => f.id === bindFlowDialog.value.currentForm.id)
  if (form) {
    form.boundFlowCount++
  }

  bindFlowDialog.value.visible = false
  bindFlowForm.value.flowId = ''
  ElMessage.success('流程绑定成功')
}

const saveAsTemplateDialog = ref({
  visible: false,
  currentForm: null
})

const saveAsTemplateForm = ref({
  templateName: '',
  category: '',
  description: ''
})

const handleSaveAsTemplate = (row) => {
  saveAsTemplateDialog.value.currentForm = row
  saveAsTemplateForm.value = {
    templateName: row.formName + '模板',
    category: row.category,
    description: row.description
  }
  saveAsTemplateDialog.value.visible = true
}

const confirmSaveAsTemplate = () => {
  if (!saveAsTemplateForm.value.templateName) {
    ElMessage.warning('请输入模板名称')
    return
  }

  const newTemplate = {
    id: Date.now(),
    templateName: saveAsTemplateForm.value.templateName,
    category: saveAsTemplateForm.value.category,
    fieldCount: saveAsTemplateDialog.value.currentForm.fieldCount,
    useCount: 0,
    status: 'enabled',
    description: saveAsTemplateForm.value.description,
    creator: '当前用户',
    createTime: new Date().toLocaleString(),
    fields: saveAsTemplateDialog.value.currentForm.fields || []
  }

  templateList.value.unshift(newTemplate)
  saveAsTemplateDialog.value.visible = false

  ElMessage.success('保存为模板成功')
  activeTab.value = 'template'
}

const handleToggleFormStatus = (row) => {
  row.status = row.status === 'enabled' ? 'disabled' : 'enabled'
  ElMessage.success(`${row.status === 'enabled' ? '启用' : '禁用'}成功`)
}

const handleDeleteForm = (row) => {
  formList.value = formList.value.filter(f => f.id !== row.id)
  ElMessage.success('删除成功')
}

const handleBatchImportForm = () => {
  importFormDialog.value.visible = true
  importFormDialog.value.files = []
  importFormDialog.value.loading = false
}

const handleImportFormFileChange = (file, fileList) => {
  importFormDialog.value.files = fileList
}

const handleRemoveImportFormFile = (file, fileList) => {
  importFormDialog.value.files = fileList
}

const confirmImportForm = async () => {
  if (importFormDialog.value.files.length === 0) {
    ElMessage.warning('请先选择文件')
    return
  }

  importFormDialog.value.loading = true

  try {
    let successCount = 0
    let failCount = 0

    for (const file of importFormDialog.value.files) {
      try {
        const text = await file.raw.text()
        const config = JSON.parse(text)

        // 校验表单配置格式
        if (config.formName && config.fields) {
          const newForm = {
            id: Date.now() + Math.random(),
            formName: config.formName,
            category: config.category || 'other',
            fieldCount: config.fields.length,
            boundFlowCount: 0,
            launchCount: 0,
            status: 'enabled',
            description: config.description || '',
            creator: '当前用户',
            createTime: new Date().toLocaleString(),
            fields: config.fields
          }

          formList.value.unshift(newForm)
          successCount++
        } else {
          failCount++
        }
      } catch (e) {
        console.error('文件解析失败:', e)
        failCount++
      }
    }

    importFormDialog.value.visible = false
    importFormDialog.value.files = []
    importFormDialog.value.loading = false

    if (successCount > 0) {
      ElMessage.success(`成功导入 ${successCount} 个表单${failCount > 0 ? `，${failCount} 个失败` : ''}`)
    } else {
      ElMessage.error('所有文件导入失败，请检查JSON格式')
    }
  } catch (e) {
    ElMessage.error('导入失败，请检查文件格式')
    console.error('导入错误:', e)
    importFormDialog.value.loading = false
  }
}

const handleBatchExportForm = (selectedRows) => {
  if (selectedRows.length === 0) {
    ElMessage.warning('请先选择要导出的表单')
    return
  }

  let exportCount = 0

  selectedRows.forEach(form => {
    try {
      const exportData = {
        formName: form.formName,
        category: form.category,
        description: form.description,
        fields: form.fields || [],
        exportTime: new Date().toLocaleString(),
        version: '1.0'
      }

      const jsonStr = JSON.stringify(exportData, null, 2)
      const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${form.formName}_${Date.now()}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      exportCount++
    } catch (e) {
      console.error('导出失败:', e)
    }
  })

  if (exportCount > 0) {
    ElMessage.success(`已导出 ${exportCount} 个表单`)
  } else {
    ElMessage.error('导出失败')
  }
}

// ==================== 表单模板管理 ====================
const templateSearchForm = ref({
  templateName: '',
  category: '',
  status: ''
})

const templateLoading = ref(false)

const importTemplateDialog = ref({
  visible: false,
  files: [],
  loading: false
})

const previewDialog = ref({
  visible: false,
  title: '',
  currentItem: null
})

const templateList = ref([
  {
    id: 1,
    templateName: '请假申请标准模板',
    category: 'hr',
    fieldCount: 8,
    useCount: 125,
    status: 'enabled',
    description: '包含请假类型、天数、时间、事由等标准字段',
    creator: '系统管理员',
    createTime: '2026-01-10 09:00:00',
    fields: [
      { id: 1, label: '请假类型', type: 'select', required: true },
      { id: 2, label: '请假天数', type: 'number', required: true },
      { id: 3, label: '开始时间', type: 'date', required: true },
      { id: 4, label: '结束时间', type: 'date', required: true },
      { id: 5, label: '请假事由', type: 'textarea', required: true }
    ]
  },
  {
    id: 2,
    templateName: '费用报销标准模板',
    category: 'finance',
    fieldCount: 10,
    useCount: 86,
    status: 'enabled',
    description: '包含报销类型、金额、发票、事由等标准字段',
    creator: '财务管理员',
    createTime: '2026-02-01 10:00:00',
    fields: [
      { id: 1, label: '报销类型', type: 'select', required: true },
      { id: 2, label: '报销金额', type: 'number', required: true },
      { id: 3, label: '发票附件', type: 'upload', required: true },
      { id: 4, label: '报销事由', type: 'textarea', required: true }
    ]
  },
  {
    id: 3,
    templateName: '会议申请标准模板',
    category: 'admin',
    fieldCount: 7,
    useCount: 52,
    status: 'enabled',
    description: '包含会议主题、时间、地点、参会人员等标准字段',
    creator: '行政管理员',
    createTime: '2026-03-01 11:00:00',
    fields: [
      { id: 1, label: '会议主题', type: 'input', required: true },
      { id: 2, label: '会议时间', type: 'date', required: true },
      { id: 3, label: '会议地点', type: 'input', required: true },
      { id: 4, label: '参会人员', type: 'select', required: true }
    ]
  },
  {
    id: 4,
    templateName: '出差申请标准模板',
    category: 'hr',
    fieldCount: 12,
    useCount: 98,
    status: 'enabled',
    description: '包含出差地点、事由、预算、行程等标准字段',
    creator: '系统管理员',
    createTime: '2026-03-15 14:30:00',
    fields: [
      { id: 1, label: '出差地点', type: 'input', required: true },
      { id: 2, label: '出差事由', type: 'textarea', required: true },
      { id: 3, label: '预算金额', type: 'number', required: true }
    ]
  },
  {
    id: 5,
    templateName: '采购申请标准模板',
    category: 'finance',
    fieldCount: 15,
    useCount: 67,
    status: 'enabled',
    description: '包含采购物品、数量、预算、供应商等标准字段',
    creator: '采购管理员',
    createTime: '2026-04-01 09:00:00',
    fields: [
      { id: 1, label: '采购物品', type: 'input', required: true },
      { id: 2, label: '采购数量', type: 'number', required: true },
      { id: 3, label: '预算金额', type: 'number', required: true }
    ]
  },
  {
    id: 6,
    templateName: '加班申请标准模板',
    category: 'hr',
    fieldCount: 6,
    useCount: 156,
    status: 'enabled',
    description: '包含加班日期、时长、事由等标准字段',
    creator: '系统管理员',
    createTime: '2026-04-10 10:00:00',
    fields: [
      { id: 1, label: '加班日期', type: 'date', required: true },
      { id: 2, label: '加班时长', type: 'number', required: true },
      { id: 3, label: '加班事由', type: 'textarea', required: true }
    ]
  },
  {
    id: 7,
    templateName: '用印申请标准模板',
    category: 'admin',
    fieldCount: 8,
    useCount: 43,
    status: 'enabled',
    description: '包含用印类型、文件、事由等标准字段',
    creator: '行政管理员',
    createTime: '2026-05-01 11:00:00',
    fields: [
      { id: 1, label: '用印类型', type: 'select', required: true },
      { id: 2, label: '用印文件', type: 'upload', required: true },
      { id: 3, label: '用印事由', type: 'textarea', required: true }
    ]
  },
  {
    id: 8,
    templateName: '入职申请标准模板',
    category: 'hr',
    fieldCount: 20,
    useCount: 210,
    status: 'enabled',
    description: '包含员工基本信息、教育经历、工作经历等标准字段',
    creator: '人事管理员',
    createTime: '2026-06-01 09:00:00',
    fields: [
      { id: 1, label: '姓名', type: 'input', required: true },
      { id: 2, label: '身份证号', type: 'input', required: true },
      { id: 3, label: '入职日期', type: 'date', required: true }
    ]
  },
  {
    id: 9,
    templateName: '离职申请标准模板',
    category: 'hr',
    fieldCount: 10,
    useCount: 28,
    status: 'disabled',
    description: '包含离职日期、原因、交接事项等标准字段（已停用）',
    creator: '人事管理员',
    createTime: '2026-06-15 10:00:00',
    fields: [
      { id: 1, label: '离职日期', type: 'date', required: true },
      { id: 2, label: '离职原因', type: 'textarea', required: true },
      { id: 3, label: '交接事项', type: 'textarea', required: true }
    ]
  },
  {
    id: 10,
    templateName: '车辆使用标准模板',
    category: 'admin',
    fieldCount: 9,
    useCount: 35,
    status: 'enabled',
    description: '包含用车时间、事由、目的地等标准字段',
    creator: '行政管理员',
    createTime: '2026-07-01 14:00:00',
    fields: [
      { id: 1, label: '用车时间', type: 'date', required: true },
      { id: 2, label: '用车事由', type: 'textarea', required: true },
      { id: 3, label: '目的地', type: 'input', required: true }
    ]
  }
])

const handleTemplateSearch = () => {
  templateLoading.value = true
  setTimeout(() => {
    templateLoading.value = false
    ElMessage.success('查询完成')
  }, 500)
}

const handleTemplateReset = () => {
  templateSearchForm.value = {
    templateName: '',
    category: '',
    status: ''
  }
  ElMessage.success('已重置查询条件')
}

const handleTemplateSelectionChange = (rows) => {
  console.log('选中模板:', rows)
}

// 批量启用模板
const handleBatchEnableTemplates = (rows) => {
  if (rows.length === 0) {
    ElMessage.warning('请先选择要启用的模板')
    return
  }

  ElMessageBox.confirm(
      `确认启用选中的 ${rows.length} 个模板？`,
      '批量启用',
      {
        confirmButtonText: '确认启用',
        cancelButtonText: '取消',
        type: 'info'
      }
  ).then(() => {
    rows.forEach(template => {
      template.status = 'enabled'
    })
    ElMessage.success(`已启用 ${rows.length} 个模板`)
  }).catch(() => {})
}

// 批量禁用模板
const handleBatchDisableTemplates = (rows) => {
  if (rows.length === 0) {
    ElMessage.warning('请先选择要禁用的模板')
    return
  }

  ElMessageBox.confirm(
      `确认禁用选中的 ${rows.length} 个模板？禁用后用户将无法使用这些模板。`,
      '批量禁用',
      {
        confirmButtonText: '确认禁用',
        cancelButtonText: '取消',
        type: 'warning'
      }
  ).then(() => {
    rows.forEach(template => {
      template.status = 'disabled'
    })
    ElMessage.success(`已禁用 ${rows.length} 个模板`)
  }).catch(() => {})
}

// 批量删除模板
const handleBatchDeleteTemplates = (rows) => {
  if (rows.length === 0) {
    ElMessage.warning('请先选择要删除的模板')
    return
  }

  // 检查是否有已使用的模板
  const hasUsed = rows.some(template => template.useCount > 0)

  if (hasUsed) {
    ElMessageBox.confirm(
        `选中的模板中包含已被使用的模板，删除后将无法恢复。是否确认删除？`,
        '批量删除确认',
        {
          confirmButtonText: '确认删除',
          cancelButtonText: '取消',
          type: 'warning'
        }
    ).then(() => {
      const idsToDelete = rows.map(template => template.id)
      templateList.value = templateList.value.filter(template => !idsToDelete.includes(template.id))
      ElMessage.success(`已删除 ${rows.length} 个模板`)
    }).catch(() => {})
  } else {
    ElMessageBox.confirm(
        `确认删除选中的 ${rows.length} 个模板？删除后无法恢复。`,
        '批量删除确认',
        {
          confirmButtonText: '确认删除',
          cancelButtonText: '取消',
          type: 'warning'
        }
    ).then(() => {
      const idsToDelete = rows.map(template => template.id)
      templateList.value = templateList.value.filter(template => !idsToDelete.includes(template.id))
      ElMessage.success(`已删除 ${rows.length} 个模板`)
    }).catch(() => {})
  }
}

const handlePreviewTemplate = (row) => {
  previewDialog.value = {
    visible: true,
    title: '模板预览',
    currentItem: row
  }
}

const handleUseTemplate = (row) => {
  row.useCount++
  router.push({
    path: '/process/design/form/design',
    query: { mode: 'use-template', templateId: row.id }
  })
  ElMessage.success('已开始使用模板，正在加载配置...')
}

const handleEditTemplate = (row) => {
  router.push({
    path: '/process/design/form/design',
    query: { mode: 'edit-template', templateId: row.id }
  })
}

const handleToggleTemplateStatus = (row) => {
  row.status = row.status === 'enabled' ? 'disabled' : 'enabled'
  ElMessage.success(`${row.status === 'enabled' ? '启用' : '禁用'}成功`)
}

const handleDeleteTemplate = (row) => {
  templateList.value = templateList.value.filter(t => t.id !== row.id)
  ElMessage.success('删除成功')
}

const handleBatchImportTemplate = () => {
  importTemplateDialog.value.visible = true
  importTemplateDialog.value.files = []
  importTemplateDialog.value.loading = false
}

const handleImportTemplateFileChange = (file, fileList) => {
  importTemplateDialog.value.files = fileList
}

const handleRemoveImportTemplateFile = (file, fileList) => {
  importTemplateDialog.value.files = fileList
}

const confirmImportTemplate = async () => {
  if (importTemplateDialog.value.files.length === 0) {
    ElMessage.warning('请先选择文件')
    return
  }

  importTemplateDialog.value.loading = true

  try {
    let successCount = 0
    let failCount = 0

    for (const file of importTemplateDialog.value.files) {
      try {
        const text = await file.raw.text()
        const config = JSON.parse(text)

        // 校验模板配置格式
        if (config.templateName && config.fields) {
          const newTemplate = {
            id: Date.now() + Math.random(),
            templateName: config.templateName,
            category: config.category || 'other',
            fieldCount: config.fields.length,
            useCount: 0,
            status: 'enabled',
            description: config.description || '',
            creator: '当前用户',
            createTime: new Date().toLocaleString(),
            fields: config.fields
          }

          templateList.value.unshift(newTemplate)
          successCount++
        } else {
          failCount++
        }
      } catch (e) {
        console.error('文件解析失败:', e)
        failCount++
      }
    }

    importTemplateDialog.value.visible = false
    importTemplateDialog.value.files = []
    importTemplateDialog.value.loading = false

    if (successCount > 0) {
      ElMessage.success(`成功导入 ${successCount} 个模板${failCount > 0 ? `，${failCount} 个失败` : ''}`)
    } else {
      ElMessage.error('所有文件导入失败，请检查JSON格式')
    }
  } catch (e) {
    ElMessage.error('导入失败，请检查文件格式')
    console.error('导入错误:', e)
    importTemplateDialog.value.loading = false
  }
}

const handleBatchExportTemplate = (selectedRows) => {
  if (selectedRows.length === 0) {
    ElMessage.warning('请先选择要导出的模板')
    return
  }

  let exportCount = 0

  selectedRows.forEach(template => {
    try {
      const exportData = {
        templateName: template.templateName,
        category: template.category,
        description: template.description,
        fields: template.fields || [],
        exportTime: new Date().toLocaleString(),
        version: '1.0'
      }

      const jsonStr = JSON.stringify(exportData, null, 2)
      const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${template.templateName}_${Date.now()}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      exportCount++
    } catch (e) {
      console.error('导出失败:', e)
    }
  })

  if (exportCount > 0) {
    ElMessage.success(`已导出 ${exportCount} 个模板`)
  } else {
    ElMessage.error('导出失败')
  }
}

const handleAddTemplate = () => {
  router.push({
    path: '/process/design/form/design',
    query: { mode: 'template', templateId: null }
  })
}

// ==================== 通用方法 ====================
const getCategoryLabel = (category) => {
  const labelMap = {
    hr: '人事类',
    finance: '财务类',
    admin: '行政类',
    other: '其他'
  }
  return labelMap[category] || category
}

const handleTabChange = (tab) => {
  console.log('切换到:', tab)
}
</script>

<style scoped lang="scss">
.form-management {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
  padding: 20px;

  .management-tabs {
    background: #fff;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);

    :deep(.el-tabs__content) {
      padding-top: 16px;
    }
  }

  // 预览弹窗样式
  .preview-container {
    .preview-header {
      padding-bottom: 20px;
      border-bottom: 2px solid #667eea;
      margin-bottom: 24px;

      h3 {
        margin: 0 0 12px 0;
        font-size: 20px;
        color: #303133;
        font-weight: 600;
      }

      .preview-meta {
        display: flex;
        align-items: center;
        gap: 12px;

        .preview-desc {
          font-size: 13px;
          color: #909399;
        }
      }
    }

    .preview-body {
      max-height: 60vh;
      overflow-y: auto;
      padding-right: 8px;

      .preview-fields {
        .preview-field-item {
          margin-bottom: 20px;

          .preview-field-label {
            font-size: 14px;
            color: #606266;
            margin-bottom: 8px;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 4px;

            .required-mark {
              color: #f56c6c;
              font-weight: bold;
            }
          }

          .preview-field-control {
            width: 100%;
          }
        }
      }
    }
  }

  // 绑定流程弹窗
  .bind-flow-content {
    .el-alert {
      border-radius: 6px;
    }
  }

  // 导入弹窗样式
  .import-dialog {
    .upload-area {
      :deep(.el-upload-dragger) {
        padding: 40px 20px;
        border: 2px dashed #dcdfe6;
        border-radius: 8px;
        transition: all 0.3s;
        background: #fafafa;

        &:hover {
          border-color: #667eea;
          background: #f0f2ff;
        }
      }

      .el-icon--upload {
        font-size: 56px;
        color: #c0c4cc;
        margin-bottom: 16px;
      }

      .el-upload__text {
        color: #606266;
        font-size: 14px;
        line-height: 1.5;

        em {
          color: #667eea;
          font-style: normal;
          font-weight: 500;
        }
      }

      .el-upload__tip {
        font-size: 12px;
        color: #909399;
        margin-top: 12px;
        text-align: center;
      }

      :deep(.el-upload-list) {
        margin-top: 16px;

        .el-upload-list__item {
          border-radius: 6px;
          transition: all 0.3s;

          &:hover {
            background: #f5f7fa;
          }
        }
      }
    }
  }
}
</style>
