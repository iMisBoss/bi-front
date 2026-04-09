<template>
  <div class="form-template">
    <div class="page-header">
      <h2>表单模板管理</h2>
      <p class="subtitle">管理可复用的表单模板，提高表单设计效率</p>
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
      <el-table-column prop="category" label="模板分类" width="120">
        <template #default="{ row }">
          <el-tag size="small">{{ row.category }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="fieldCount" label="字段数量" width="100" align="center" />
      <el-table-column prop="useCount" label="使用次数" width="100" align="center" />
      <el-table-column prop="description" label="模板说明" min-width="200" show-overflow-tooltip />
      <el-table-column prop="creator" label="创建人" width="120" />
      <el-table-column prop="createTime" label="创建时间" width="180" />
      <el-table-column label="操作" width="280" align="center" fixed="right">
        <template #default="{ row }">
          <div class="action-buttons">
            <el-button size="small" type="primary" icon="Edit" @click="handleEdit(row)">编辑</el-button>
            <el-button size="small" type="success" icon="CopyDocument" @click="handleUse(row)">使用模板</el-button>
            <el-button size="small" type="danger" icon="Delete" @click="handleDelete(row)">删除</el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Plus, Edit, CopyDocument, Delete } from '@element-plus/icons-vue'

const searchKeyword = ref('')
const loading = ref(false)

const templateList = ref([
  {
    id: 1,
    templateName: '请假申请标准模板',
    category: '人事类',
    fieldCount: 8,
    useCount: 125,
    description: '包含请假类型、天数、时间、事由等标准字段',
    creator: '系统管理员',
    createTime: '2024-01-10 09:00:00'
  },
  {
    id: 2,
    templateName: '费用报销标准模板',
    category: '财务类',
    fieldCount: 10,
    useCount: 86,
    description: '包含报销类型、金额、发票、事由等标准字段',
    creator: '财务管理员',
    createTime: '2024-02-01 10:00:00'
  },
  {
    id: 3,
    templateName: '会议申请标准模板',
    category: '行政类',
    fieldCount: 7,
    useCount: 52,
    description: '包含会议主题、时间、地点、参会人员等标准字段',
    creator: '行政管理员',
    createTime: '2024-03-01 11:00:00'
  }
])

const filteredTemplateList = computed(() => {
  let result = [...templateList.value]
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(t => t.templateName.toLowerCase().includes(keyword))
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
  ElMessage.success('已重置查询条件')
}

const handleAdd = () => {
  ElMessage.info('新增模板功能开发中...')
}

const handleEdit = (row) => {
  ElMessage.info('编辑模板功能开发中...')
}

const handleUse = (row) => {
  ElMessage.success(`已开始使用模板"${row.templateName}"`)
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
.form-template {
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
}
</style>
