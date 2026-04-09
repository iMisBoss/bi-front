<template>
  <div class="print-template">
    <div class="page-header">
      <h2>打印模板管理</h2>
      <p class="subtitle">配置流程单据的打印模板，支持自定义布局和字段</p>
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
        <el-select v-model="filterProcess" placeholder="适用流程" clearable style="width: 200px">
          <el-option label="请假审批流程" value="leave_approval" />
          <el-option label="加班审批流程" value="overtime_approval" />
          <el-option label="费用报销流程" value="expense_approval" />
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
      <el-table-column prop="processName" label="适用流程" min-width="150" />
      <el-table-column prop="pageSize" label="纸张大小" width="100" align="center">
        <template #default="{ row }">
          <el-tag size="small">{{ row.pageSize }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="orientation" label="纸张方向" width="100" align="center">
        <template #default="{ row }">
          <el-tag size="small" :type="row.orientation === 'portrait' ? 'success' : 'warning'">
            {{ row.orientation === 'portrait' ? '纵向' : '横向' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="header" label="页眉内容" min-width="150" show-overflow-tooltip />
      <el-table-column prop="creator" label="创建人" width="120" />
      <el-table-column prop="createTime" label="创建时间" width="180" />
      <el-table-column label="操作" width="320" align="center" fixed="right">
        <template #default="{ row }">
          <div class="action-buttons">
            <el-button size="small" type="primary" icon="Edit" @click="handleEdit(row)">编辑</el-button>
            <el-button size="small" type="success" icon="Printer" @click="handlePrint(row)">打印预览</el-button>
            <el-button size="small" type="info" icon="View" @click="handleView(row)">查看</el-button>
            <el-button size="small" type="danger" icon="Delete" @click="handleDelete(row)">删除</el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <!-- 新增/编辑对话框 -->
    <el-dialog
        v-model="dialogVisible"
        :title="dialogTitle"
        width="900px"
        :close-on-click-modal="false"
    >
      <el-form :model="templateForm" :rules="formRules" ref="formRef" label-width="100px">
        <el-form-item label="模板名称" prop="templateName">
          <el-input v-model="templateForm.templateName" placeholder="请输入模板名称" />
        </el-form-item>

        <el-form-item label="适用流程" prop="processName">
          <el-select v-model="templateForm.processName" placeholder="请选择适用流程" style="width: 100%">
            <el-option label="请假审批流程" value="请假审批流程" />
            <el-option label="加班审批流程" value="加班审批流程" />
            <el-option label="费用报销流程" value="费用报销流程" />
            <el-option label="会议申请流程" value="会议申请流程" />
          </el-select>
        </el-form-item>

        <el-form-item label="纸张大小" prop="pageSize">
          <el-select v-model="templateForm.pageSize" style="width: 100%">
            <el-option label="A4" value="A4" />
            <el-option label="A3" value="A3" />
            <el-option label="B5" value="B5" />
            <el-option label="Letter" value="Letter" />
          </el-select>
        </el-form-item>

        <el-form-item label="纸张方向" prop="orientation">
          <el-radio-group v-model="templateForm.orientation">
            <el-radio label="portrait">纵向</el-radio>
            <el-radio label="landscape">横向</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="页眉内容" prop="header">
          <el-input v-model="templateForm.header" placeholder="请输入页眉内容" />
        </el-form-item>

        <el-form-item label="页脚内容" prop="footer">
          <el-input v-model="templateForm.footer" placeholder="请输入页脚内容" />
        </el-form-item>

        <el-form-item label="显示字段">
          <el-checkbox-group v-model="templateForm.displayFields">
            <el-checkbox label="单据编号">单据编号</el-checkbox>
            <el-checkbox label="申请人">申请人</el-checkbox>
            <el-checkbox label="申请时间">申请时间</el-checkbox>
            <el-checkbox label="审批状态">审批状态</el-checkbox>
            <el-checkbox label="审批意见">审批意见</el-checkbox>
            <el-checkbox label="审批时间">审批时间</el-checkbox>
          </el-checkbox-group>
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

    <!-- 打印预览对话框 -->
    <el-dialog
        v-model="printPreviewVisible"
        title="打印预览"
        width="800px"
        :close-on-click-modal="false"
    >
      <div class="print-preview" v-if="previewTemplate">
        <div class="print-header">
          <h3>{{ previewTemplate.header || previewTemplate.processName + '打印单' }}</h3>
        </div>
        <div class="print-body">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="单据编号">QJ20240408001</el-descriptions-item>
            <el-descriptions-item label="申请人">张三</el-descriptions-item>
            <el-descriptions-item label="申请时间">2024-04-08 09:00:00</el-descriptions-item>
            <el-descriptions-item label="审批状态">已通过</el-descriptions-item>
            <el-descriptions-item label="审批意见" :span="2">同意。</el-descriptions-item>
            <el-descriptions-item label="审批时间">2024-04-08 10:30:00</el-descriptions-item>
          </el-descriptions>
        </div>
        <div class="print-footer">
          <p>{{ previewTemplate.footer || '打印时间：' + new Date().toLocaleString('zh-CN') }}</p>
        </div>
      </div>

      <template #footer>
        <el-button @click="printPreviewVisible = false">关闭</el-button>
        <el-button type="primary" icon="Printer" @click="handleConfirmPrint">打印</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Plus, Edit, Printer, View, Delete } from '@element-plus/icons-vue'

const searchKeyword = ref('')
const filterProcess = ref('')
const loading = ref(false)
const saving = ref(false)

const templateList = ref([
  {
    id: 1,
    templateName: '请假申请打印模板',
    processName: '请假审批流程',
    pageSize: 'A4',
    orientation: 'portrait',
    header: '请假申请单',
    footer: '打印时间：{print_time}',
    displayFields: ['单据编号', '申请人', '申请时间', '审批状态', '审批意见'],
    description: '请假申请标准打印模板',
    creator: '系统管理员',
    createTime: '2024-01-10 09:00:00'
  },
  {
    id: 2,
    templateName: '费用报销打印模板',
    processName: '费用报销流程',
    pageSize: 'A4',
    orientation: 'portrait',
    header: '费用报销单',
    footer: '第{page}页 共{total}页',
    displayFields: ['单据编号', '申请人', '申请时间', '审批状态', '审批意见', '审批时间'],
    description: '费用报销标准打印模板',
    creator: '财务管理员',
    createTime: '2024-02-01 10:00:00'
  },
  {
    id: 3,
    templateName: '会议申请横向模板',
    processName: '会议申请流程',
    pageSize: 'A4',
    orientation: 'landscape',
    header: '会议申请审批单',
    footer: '',
    displayFields: ['单据编号', '申请人', '申请时间', '审批状态'],
    description: '会议申请横向打印模板',
    creator: '行政管理员',
    createTime: '2024-03-01 11:00:00'
  }
])

const dialogVisible = ref(false)
const dialogTitle = ref('新增模板')
const formRef = ref(null)
const templateForm = ref({
  templateName: '',
  processName: '',
  pageSize: 'A4',
  orientation: 'portrait',
  header: '',
  footer: '',
  displayFields: ['单据编号', '申请人', '申请时间'],
  description: ''
})

const formRules = {
  templateName: [{ required: true, message: '请输入模板名称', trigger: 'blur' }],
  processName: [{ required: true, message: '请选择适用流程', trigger: 'change' }],
  pageSize: [{ required: true, message: '请选择纸张大小', trigger: 'change' }]
}

const printPreviewVisible = ref(false)
const previewTemplate = ref(null)

const filteredTemplateList = computed(() => {
  let result = [...templateList.value]

  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(t => t.templateName.toLowerCase().includes(keyword))
  }

  if (filterProcess.value) {
    result = result.filter(t => t.processName.toLowerCase().includes(filterProcess.value))
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
  filterProcess.value = ''
  ElMessage.success('已重置查询条件')
}

const handleAdd = () => {
  dialogTitle.value = '新增模板'
  templateForm.value = {
    templateName: '',
    processName: '',
    pageSize: 'A4',
    orientation: 'portrait',
    header: '',
    footer: '',
    displayFields: ['单据编号', '申请人', '申请时间'],
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

const handlePrint = (row) => {
  previewTemplate.value = { ...row }
  printPreviewVisible.value = true
}

const handleConfirmPrint = () => {
  window.print()
  printPreviewVisible.value = false
  ElMessage.success('打印任务已发送')
}

const handleView = (row) => {
  ElMessage.info(`查看模板"${row.templateName}"`)
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
</script>

<style scoped lang="scss">
.print-template {
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

  .print-preview {
    padding: 20px;
    border: 1px solid #dcdfe6;
    background: #fff;

    .print-header {
      text-align: center;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 2px solid #303133;

      h3 {
        margin: 0;
      }
    }

    .print-body {
      min-height: 400px;
    }

    .print-footer {
      margin-top: 20px;
      padding-top: 10px;
      border-top: 1px solid #dcdfe6;
      text-align: right;
      font-size: 12px;
      color: #909399;
    }
  }
}
</style>
