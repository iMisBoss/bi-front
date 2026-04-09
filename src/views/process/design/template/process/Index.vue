<template>
  <div class="process-template">
    <div class="page-header">
      <h2>流程模板管理</h2>
      <p class="subtitle">管理可复用的流程模板，快速创建标准化审批流程</p>
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
        <el-select v-model="filterCategory" placeholder="流程分类" clearable style="width: 150px">
          <el-option label="人事类" value="hr" />
          <el-option label="财务类" value="finance" />
          <el-option label="行政类" value="admin" />
          <el-option label="业务类" value="business" />
        </el-select>
        <el-button type="primary" icon="Search" @click="handleSearch">查询</el-button>
        <el-button icon="Refresh" @click="handleReset">重置</el-button>
      </div>
      <div class="toolbar-right">
        <el-button type="primary" icon="Plus" @click="handleAdd">新增模板</el-button>
        <el-button type="success" icon="Download" @click="handleExport">导出模板</el-button>
      </div>
    </div>

    <el-table
        :data="filteredTemplateList"
        border
        style="width: 100%"
        v-loading="loading"
    >
      <el-table-column prop="templateName" label="模板名称" min-width="180" />
      <el-table-column prop="category" label="流程分类" width="120">
        <template #default="{ row }">
          <el-tag size="small" :type="getCategoryTag(row.category)">
            {{ getCategoryText(row.category) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="nodeCount" label="节点数" width="80" align="center" />
      <el-table-column prop="useCount" label="使用次数" width="100" align="center" />
      <el-table-column prop="description" label="模板说明" min-width="200" show-overflow-tooltip />
      <el-table-column prop="creator" label="创建人" width="120" />
      <el-table-column prop="createTime" label="创建时间" width="180" />
      <el-table-column label="操作" width="340" align="center" fixed="right">
        <template #default="{ row }">
          <div class="action-buttons">
            <el-button size="small" type="primary" icon="Edit" @click="handleEdit(row)">编辑</el-button>
            <el-button size="small" type="success" icon="CircleCheck" @click="handleUse(row)">使用模板</el-button>
            <el-button size="small" type="info" icon="CopyDocument" @click="handleCopy(row)">复制</el-button>
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

        <el-form-item label="流程分类" prop="category">
          <el-select v-model="templateForm.category" placeholder="请选择流程分类" style="width: 100%">
            <el-option label="人事类" value="hr" />
            <el-option label="财务类" value="finance" />
            <el-option label="行政类" value="admin" />
            <el-option label="业务类" value="business" />
          </el-select>
        </el-form-item>

        <el-form-item label="模板说明" prop="description">
          <el-input
              v-model="templateForm.description"
              type="textarea"
              :rows="4"
              placeholder="请输入模板说明"
          />
        </el-form-item>

        <el-form-item label="流程节点配置">
          <div class="node-config-list">
            <div v-for="(node, index) in templateForm.nodes" :key="index" class="node-item">
              <el-input v-model="node.name" placeholder="节点名称" style="width: 200px" />
              <el-select v-model="node.type" placeholder="节点类型" style="width: 150px">
                <el-option label="审批节点" value="approval" />
                <el-option label="抄送节点" value="cc" />
                <el-option label="条件节点" value="condition" />
              </el-select>
              <el-input v-model="node.assignee" placeholder="审批人" style="width: 150px" />
              <el-button type="danger" size="small" icon="Delete" @click="removeNode(index)" />
            </div>
            <el-button type="primary" size="small" icon="Plus" @click="addNode">添加节点</el-button>
          </div>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="saving">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Plus, Download, Edit, CircleCheck, CopyDocument, Delete } from '@element-plus/icons-vue'

const searchKeyword = ref('')
const filterCategory = ref('')
const loading = ref(false)
const saving = ref(false)

const templateList = ref([
  {
    id: 1,
    templateName: '请假审批标准流程',
    category: 'hr',
    nodeCount: 3,
    useCount: 125,
    description: '包含部门经理审批、总经理审批（超过5天）、HR备案节点',
    nodes: [
      { name: '部门经理审批', type: 'approval', assignee: '部门经理' },
      { name: '总经理审批', type: 'approval', assignee: '总经理' },
      { name: 'HR备案', type: 'cc', assignee: 'HR经理' }
    ],
    creator: '系统管理员',
    createTime: '2024-01-10 09:00:00'
  },
  {
    id: 2,
    templateName: '费用报销标准流程',
    category: 'finance',
    nodeCount: 4,
    useCount: 86,
    description: '包含部门经理审批、财务审核、总经理审批（超过1万）、归档节点',
    nodes: [
      { name: '部门经理审批', type: 'approval', assignee: '部门经理' },
      { name: '财务审核', type: 'approval', assignee: '财务经理' },
      { name: '总经理审批', type: 'approval', assignee: '总经理' },
      { name: '归档', type: 'cc', assignee: '财务专员' }
    ],
    creator: '财务管理员',
    createTime: '2024-02-01 10:00:00'
  },
  {
    id: 3,
    templateName: '会议申请标准流程',
    category: 'admin',
    nodeCount: 2,
    useCount: 52,
    description: '包含部门经理审批、行政备案节点',
    nodes: [
      { name: '部门经理审批', type: 'approval', assignee: '部门经理' },
      { name: '行政备案', type: 'cc', assignee: '行政专员' }
    ],
    creator: '行政管理员',
    createTime: '2024-03-01 11:00:00'
  },
  {
    id: 4,
    templateName: '加班审批简化流程',
    category: 'hr',
    nodeCount: 2,
    useCount: 68,
    description: '包含部门经理审批、HR备案节点',
    nodes: [
      { name: '部门经理审批', type: 'approval', assignee: '部门经理' },
      { name: 'HR备案', type: 'cc', assignee: 'HR专员' }
    ],
    creator: '系统管理员',
    createTime: '2024-03-15 14:00:00'
  }
])

const dialogVisible = ref(false)
const dialogTitle = ref('新增模板')
const formRef = ref(null)
const templateForm = ref({
  templateName: '',
  category: '',
  description: '',
  nodes: [
    { name: '', type: 'approval', assignee: '' }
  ]
})

const formRules = {
  templateName: [{ required: true, message: '请输入模板名称', trigger: 'blur' }],
  category: [{ required: true, message: '请选择流程分类', trigger: 'change' }]
}

const filteredTemplateList = computed(() => {
  let result = [...templateList.value]

  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(t => t.templateName.toLowerCase().includes(keyword))
  }

  if (filterCategory.value) {
    result = result.filter(t => t.category === filterCategory.value)
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
  filterCategory.value = ''
  ElMessage.success('已重置查询条件')
}

const handleAdd = () => {
  dialogTitle.value = '新增模板'
  templateForm.value = {
    templateName: '',
    category: '',
    description: '',
    nodes: [
      { name: '', type: 'approval', assignee: '' }
    ]
  }
  dialogVisible.value = true
}

const handleEdit = (row) => {
  dialogTitle.value = '编辑模板'
  templateForm.value = { ...row, nodes: [...row.nodes] }
  dialogVisible.value = true
}

const addNode = () => {
  templateForm.value.nodes.push({ name: '', type: 'approval', assignee: '' })
}

const removeNode = (index) => {
  templateForm.value.nodes.splice(index, 1)
}

const handleSubmit = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      saving.value = true
      setTimeout(() => {
        if (templateForm.value.id) {
          const index = templateList.value.findIndex(t => t.id === templateForm.value.id)
          if (index !== -1) {
            templateList.value[index] = {
              ...templateForm.value,
              nodeCount: templateForm.value.nodes.length
            }
          }
          ElMessage.success('模板修改成功')
        } else {
          templateList.value.unshift({
            ...templateForm.value,
            id: Date.now(),
            nodeCount: templateForm.value.nodes.length,
            useCount: 0,
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

const handleUse = (row) => {
  row.useCount++
  ElMessage.success(`已开始使用模板"${row.templateName}"，使用次数：${row.useCount}`)
}

const handleCopy = (row) => {
  const newTemplate = {
    ...row,
    id: Date.now(),
    templateName: row.templateName + '（复制）',
    useCount: 0,
    nodes: [...row.nodes]
  }
  templateList.value.unshift(newTemplate)
  ElMessage.success('模板复制成功')
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

const handleExport = () => {
  ElMessage.success('导出功能开发中...')
}

const getCategoryTag = (category) => {
  const tags = { hr: 'success', finance: 'warning', admin: 'primary', business: 'info' }
  return tags[category] || 'info'
}

const getCategoryText = (category) => {
  const texts = { hr: '人事类', finance: '财务类', admin: '行政类', business: '业务类' }
  return texts[category] || category
}
</script>

<style scoped lang="scss">
.process-template {
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

  .node-config-list {
    width: 100%;

    .node-item {
      display: flex;
      gap: 12px;
      align-items: center;
      margin-bottom: 12px;
      padding: 12px;
      background: #f5f7fa;
      border-radius: 4px;
    }
  }
}
</style>
