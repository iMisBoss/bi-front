<template>
  <div class="notification-template">
    <div class="page-header">
      <h2>通知模板管理</h2>
      <p class="subtitle">配置流程节点的通知模板，支持邮件、短信、系统通知</p>
    </div>

    <div class="toolbar">
      <div class="toolbar-left">
        <el-input
            v-model="searchKeyword"
            placeholder="搜索模板名称"
            clearable
            style="width: 300px"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-select v-model="filterType" placeholder="通知类型" clearable style="width: 150px">
          <el-option label="邮件通知" value="email" />
          <el-option label="短信通知" value="sms" />
          <el-option label="系统通知" value="system" />
        </el-select>
        <el-button type="primary" icon="Search" @click="handleSearch">查询</el-button>
        <el-button icon="Refresh" @click="handleReset">重置</el-button>
      </div>
      <div class="toolbar-right">
        <el-button type="primary" icon="Plus" @click="handleAdd">新增模板</el-button>
      </div>
    </div>

    <el-table
        :data="filteredTemplateList"
        border
        style="width: 100%"
        v-loading="loading"
    >
      <el-table-column prop="templateName" label="模板名称" min-width="180" />
      <el-table-column prop="notifyType" label="通知类型" width="120">
        <template #default="{ row }">
          <el-tag size="small" :type="getNotifyTypeTag(row.notifyType)">
            {{ getNotifyTypeText(row.notifyType) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="triggerScene" label="触发场景" min-width="150" />
      <el-table-column prop="templateContent" label="模板内容" min-width="250" show-overflow-tooltip />
      <el-table-column label="模板状态" width="100" align="center">
        <template #default="{ row }">
          <el-switch
              v-model="row.status"
              active-value="enabled"
              inactive-value="disabled"
              @change="handleStatusChange(row)"
          />
        </template>
      </el-table-column>
      <el-table-column prop="creator" label="创建人" width="120" />
      <el-table-column prop="createTime" label="创建时间" width="180" />
      <el-table-column label="操作" width="280" align="center" fixed="right">
        <template #default="{ row }">
          <div class="action-buttons">
            <el-button size="small" type="primary" icon="Edit" @click="handleEdit(row)">编辑</el-button>
            <el-button size="small" type="success" icon="View" @click="handlePreview(row)">预览</el-button>
            <el-button size="small" type="danger" icon="Delete" @click="handleDelete(row)">删除</el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <!-- 新增/编辑对话框 -->
    <el-dialog
        v-model="dialogVisible"
        :title="dialogTitle"
        width="800px"
        :close-on-click-modal="false"
    >
      <el-form :model="templateForm" :rules="formRules" ref="formRef" label-width="100px">
        <el-form-item label="模板名称" prop="templateName">
          <el-input v-model="templateForm.templateName" placeholder="请输入模板名称" />
        </el-form-item>

        <el-form-item label="通知类型" prop="notifyType">
          <el-select v-model="templateForm.notifyType" placeholder="请选择通知类型" style="width: 100%">
            <el-option label="邮件通知" value="email" />
            <el-option label="短信通知" value="sms" />
            <el-option label="系统通知" value="system" />
          </el-select>
        </el-form-item>

        <el-form-item label="触发场景" prop="triggerScene">
          <el-select v-model="templateForm.triggerScene" placeholder="请选择触发场景" style="width: 100%">
            <el-option label="流程发起" value="process_start" />
            <el-option label="待办通知" value="todo_notify" />
            <el-option label="审批通过" value="approved" />
            <el-option label="审批驳回" value="rejected" />
            <el-option label="流程结束" value="process_end" />
            <el-option label="超时提醒" value="timeout_remind" />
          </el-select>
        </el-form-item>

        <el-form-item label="邮件主题" v-if="templateForm.notifyType === 'email'" prop="emailSubject">
          <el-input v-model="templateForm.emailSubject" placeholder="请输入邮件主题" />
        </el-form-item>

        <el-form-item label="模板内容" prop="templateContent">
          <el-input
              v-model="templateForm.templateContent"
              type="textarea"
              :rows="6"
              placeholder="请输入模板内容，支持变量：{申请人}、{流程名称}、{审批意见}等"
          />
          <div class="tip">
            <p>可用变量：</p>
            <div class="variable-tags">
              <el-tag size="small" style="margin: 4px">{申请人}</el-tag>
              <el-tag size="small" style="margin: 4px">{流程名称}</el-tag>
              <el-tag size="small" style="margin: 4px">{单据编号}</el-tag>
              <el-tag size="small" style="margin: 4px">{审批意见}</el-tag>
              <el-tag size="small" style="margin: 4px">{提交时间}</el-tag>
            </div>
          </div>
        </el-form-item>

        <el-form-item label="模板说明" prop="description">
          <el-input
              v-model="templateForm.description"
              type="textarea"
              :rows="2"
              placeholder="请输入模板说明"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="saving">确定</el-button>
      </template>
    </el-dialog>

    <!-- 预览对话框 -->
    <el-dialog
        v-model="previewVisible"
        title="通知预览"
        width="600px"
        :close-on-click-modal="false"
    >
      <div class="preview-content" v-if="previewTemplate">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="模板名称">{{ previewTemplate.templateName }}</el-descriptions-item>
          <el-descriptions-item label="通知类型">
            <el-tag :type="getNotifyTypeTag(previewTemplate.notifyType)">
              {{ getNotifyTypeText(previewTemplate.notifyType) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="触发场景">{{ previewTemplate.triggerScene }}</el-descriptions-item>
          <el-descriptions-item label="模板内容" v-if="previewTemplate.emailSubject">
            <div><strong>主题：</strong>{{ previewTemplate.emailSubject }}</div>
          </el-descriptions-item>
          <el-descriptions-item label="模板内容">
            <div class="preview-text">{{ previewTemplate.templateContent }}</div>
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <template #footer>
        <el-button @click="previewVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Plus, Edit, View, Delete } from '@element-plus/icons-vue'

const searchKeyword = ref('')
const filterType = ref('')
const loading = ref(false)
const saving = ref(false)

const templateList = ref([
  {
    id: 1,
    templateName: '待办通知-邮件',
    notifyType: 'email',
    triggerScene: '待办通知',
    emailSubject: '您有一个新的待办事项：{流程名称}',
    templateContent: '尊敬的{申请人}：\n\n您有一个新的待办事项需要处理。\n\n流程名称：{流程名称}\n单据编号：{单据编号}\n提交时间：{提交时间}\n\n请及时处理。',
    status: 'enabled',
    description: '待办事项邮件通知模板',
    creator: '系统管理员',
    createTime: '2024-01-10 09:00:00'
  },
  {
    id: 2,
    templateName: '审批通过-短信',
    notifyType: 'sms',
    triggerScene: '审批通过',
    templateContent: '【OA系统】您的{流程名称}申请已通过审批，单据编号：{单据编号}，请及时查看。',
    status: 'enabled',
    description: '审批通过短信通知模板',
    creator: '系统管理员',
    createTime: '2024-01-10 09:30:00'
  },
  {
    id: 3,
    templateName: '审批驳回-系统通知',
    notifyType: 'system',
    triggerScene: '审批驳回',
    templateContent: '您的{流程名称}申请已被驳回。\n\n驳回意见：{审批意见}\n\n请修改后重新提交。',
    status: 'enabled',
    description: '审批驳回系统通知模板',
    creator: '流程管理员',
    createTime: '2024-02-01 10:00:00'
  },
  {
    id: 4,
    templateName: '超时提醒-邮件',
    notifyType: 'email',
    triggerScene: '超时提醒',
    emailSubject: '【超时提醒】您有待处理的审批任务',
    templateContent: '尊敬的审批人：\n\n您有待处理的审批任务已超时。\n\n流程名称：{流程名称}\n单据编号：{单据编号}\n\n请尽快处理。',
    status: 'disabled',
    description: '审批超时邮件提醒模板',
    creator: '系统管理员',
    createTime: '2024-03-01 11:00:00'
  }
])

const dialogVisible = ref(false)
const dialogTitle = ref('新增模板')
const formRef = ref(null)
const templateForm = ref({
  templateName: '',
  notifyType: 'email',
  triggerScene: '',
  emailSubject: '',
  templateContent: '',
  description: ''
})

const formRules = {
  templateName: [{ required: true, message: '请输入模板名称', trigger: 'blur' }],
  notifyType: [{ required: true, message: '请选择通知类型', trigger: 'change' }],
  triggerScene: [{ required: true, message: '请选择触发场景', trigger: 'change' }],
  templateContent: [{ required: true, message: '请输入模板内容', trigger: 'blur' }]
}

const previewVisible = ref(false)
const previewTemplate = ref(null)

const filteredTemplateList = computed(() => {
  let result = [...templateList.value]

  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(t => t.templateName.toLowerCase().includes(keyword))
  }

  if (filterType.value) {
    result = result.filter(t => t.notifyType === filterType.value)
  }

  return result
})

const handleSearch = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    ElMessage.success('查询完成')
  }, 500)
}

const handleReset = () => {
  searchKeyword.value = ''
  filterType.value = ''
  ElMessage.success('已重置查询条件')
}

const handleAdd = () => {
  dialogTitle.value = '新增模板'
  templateForm.value = {
    templateName: '',
    notifyType: 'email',
    triggerScene: '',
    emailSubject: '',
    templateContent: '',
    description: ''
  }
  dialogVisible.value = true
}

const handleEdit = (row) => {
  dialogTitle.value = '编辑模板'
  templateForm.value = { ...row }
  dialogVisible.value = true
}

const handleSubmit = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      saving.value = true
      setTimeout(() => {
        if (templateForm.value.id) {
          const index = templateList.value.findIndex(t => t.id === templateForm.value.id)
          if (index !== -1) {
            templateList.value[index] = { ...templateForm.value }
          }
          ElMessage.success('模板修改成功')
        } else {
          templateList.value.unshift({
            ...templateForm.value,
            id: Date.now(),
            creator: '当前用户',
            createTime: new Date().toLocaleString('zh-CN')
          })
          ElMessage.success('模板新增成功')
        }
        saving.value = false
        dialogVisible.value = false
      }, 500)
    }
  })
}

const handleStatusChange = (row) => {
  const action = row.status === 'enabled' ? '启用' : '停用'
  ElMessage.success(`已${action}模板"${row.templateName}"`)
}

const handlePreview = (row) => {
  previewTemplate.value = { ...row }
  previewVisible.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm(
      `确定要删除模板"${row.templateName}"吗？`,
      '删除确认',
      {
        confirmButtonText: '确认删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
  ).then(() => {
    templateList.value = templateList.value.filter(t => t.id !== row.id)
    ElMessage.success('删除成功')
  }).catch(() => {})
}

const getNotifyTypeTag = (type) => {
  const tags = { email: 'success', sms: 'warning', system: 'primary' }
  return tags[type] || 'info'
}

const getNotifyTypeText = (type) => {
  const texts = { email: '邮件通知', sms: '短信通知', system: '系统通知' }
  return texts[type] || type
}
</script>

<style scoped lang="scss">
.notification-template {
  padding: 20px;

  .page-header {
    margin-bottom: 24px;

    h2 {
      margin: 0 0 8px;
      font-size: 20px;
    }

    .subtitle {
      margin: 0;
      font-size: 14px;
      color: #909399;
    }
  }

  .toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    .toolbar-left,
    .toolbar-right {
      display: flex;
      gap: 12px;
    }
  }

  :deep(.el-table__cell) {
    .action-buttons {
      display: inline-flex !important;
      gap: 8px;
      justify-content: center;
      align-items: center;
      flex-wrap: nowrap !important;
      white-space: nowrap !important;

      .el-button {
        margin: 0 !important;
        white-space: nowrap !important;
      }
    }
  }

  .tip {
    margin-top: 8px;

    p {
      margin: 0 0 8px;
      font-size: 12px;
      color: #909399;
    }

    .variable-tags {
      display: flex;
      flex-wrap: wrap;
    }
  }

  .preview-content {
    .preview-text {
      white-space: pre-wrap;
      line-height: 1.8;
    }
  }
}
</style>
