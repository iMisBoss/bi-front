<template>
  <div class="portal-category-management">
    <!-- 面包屑 -->
    <el-breadcrumb separator="/" class="breadcrumb">
      <el-breadcrumb-item :to="{ path: '/admin/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>门户中心</el-breadcrumb-item>
      <el-breadcrumb-item>基础配置</el-breadcrumb-item>
      <el-breadcrumb-item>门户分类管理</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 顶部操作栏 -->
    <div class="top-actions">
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>新增分类
      </el-button>
      <el-button @click="handleBatchEnable" :disabled="selectedRows.length === 0">
        <el-icon><CircleCheck /></el-icon>批量启用
      </el-button>
      <el-button @click="handleBatchDisable" :disabled="selectedRows.length === 0">
        <el-icon><CircleClose /></el-icon>批量禁用
      </el-button>
      <el-button @click="refreshData">
        <el-icon><Refresh /></el-icon>刷新
      </el-button>
    </div>

    <!-- 筛选区 -->
    <el-card class="filter-card" shadow="never">
      <el-form :inline="true" :model="searchForm" size="default">
        <el-form-item label="分类名称">
          <el-input
              v-model="searchForm.name"
              placeholder="请输入分类名称"
              clearable
              style="width: 200px"
              @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="分类状态">
          <el-select v-model="searchForm.status" placeholder="请选择" clearable style="width: 140px">
            <el-option label="启用" value="enabled" />
            <el-option label="禁用" value="disabled" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 核心列表区 -->
    <el-card class="main-card" shadow="never">
      <el-table
          :data="tableData"
          v-loading="loading"
          @selection-change="handleSelectionChange"
          stripe
          border
          row-key="id"
      >
        <el-table-column type="selection" width="50" align="center" />
        <el-table-column prop="name" label="分类名称" min-width="180">
          <template #default="{ row }">
            <el-link type="primary" @click="handleEdit(row)">{{ row.name }}</el-link>
          </template>
        </el-table-column>
        <el-table-column prop="code" label="分类编码" width="140" />
        <el-table-column prop="sort" label="排序号" width="120" align="center">
          <template #default="{ row }">
            <el-input-number
                v-model="row.sort"
                :min="1"
                :max="999"
                size="small"
                controls-position="right"
                style="width: 100px"
                @change="handleSortChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="portalCount" label="关联门户数" width="120" align="center">
          <template #default="{ row }">
            <el-link
                v-if="row.portalCount > 0"
                type="primary"
                @click="handleViewPortals(row)"
            >
              {{ row.portalCount }}
            </el-link>
            <span v-else class="zero-count">{{ row.portalCount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="分类状态" width="100" align="center">
          <template #default="{ row }">
            <el-tooltip :content="row.status === 'enabled' ? '该分类可正常使用' : '该分类已禁用，不可选择'" placement="top">
              <el-tag :type="row.status === 'enabled' ? 'success' : 'info'" size="small">
                {{ row.status === 'enabled' ? '启用' : '禁用' }}
              </el-tag>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column prop="creator" label="创建人" width="140" />
        <el-table-column prop="createTime" label="创建时间" width="160" />
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button
                v-if="row.status === 'enabled'"
                link
                type="warning"
                size="small"
                @click="handleDisable(row)"
            >
              禁用
            </el-button>
            <el-button
                v-else
                link
                type="success"
                size="small"
                @click="handleEnable(row)"
            >
              启用
            </el-button>
            <el-button link type="danger" size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          class="pagination"
          @size-change="fetchData"
          @current-change="fetchData"
      />
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <el-dialog
        v-model="dialogVisible"
        :title="dialogTitle"
        width="600px"
        :close-on-click-modal="false"
    >
      <el-form
          ref="formRef"
          :model="formData"
          :rules="formRules"
          label-width="100px"
      >
        <el-form-item label="分类名称" prop="name">
          <el-input
              v-model="formData.name"
              placeholder="请输入分类名称"
              maxlength="20"
              show-word-limit
          />
        </el-form-item>
        <el-form-item label="分类编码" prop="code">
          <el-input
              v-model="formData.code"
              placeholder="请输入分类编码"
              maxlength="10"
              :disabled="isEdit"
          />
          <div class="form-tip">仅支持英文+数字，长度1-10位</div>
        </el-form-item>
        <el-form-item label="排序号" prop="sort">
          <el-input-number
              v-model="formData.sort"
              :min="1"
              :max="999"
              controls-position="right"
              style="width: 100%"
          />
          <div class="form-tip">数字越小越靠前，默认99</div>
        </el-form-item>
        <el-form-item label="分类状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio value="enabled">启用</el-radio>
            <el-radio value="disabled">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="分类备注" prop="remark">
          <el-input
              v-model="formData.remark"
              type="textarea"
              :rows="3"
              placeholder="请输入分类备注"
              maxlength="50"
              show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, CircleCheck, CircleClose, Refresh } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 状态管理
const loading = ref(false)
const submitting = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const dialogTitle = ref('新增分类')
const formRef = ref(null)

// 搜索表单
const searchForm = reactive({
  name: '',
  status: ''
})

// 分页
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 表格数据
const tableData = ref([])
const selectedRows = ref([])

// 表单数据
const formData = reactive({
  id: null,
  name: '',
  code: '',
  sort: 99,
  status: 'enabled',
  remark: ''
})

// 表单校验规则
const formRules = {
  name: [
    { required: true, message: '请输入分类名称', trigger: 'blur' },
    { min: 1, max: 20, message: '长度限制1-20字', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入分类编码', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9]{1,10}$/, message: '仅支持英文+数字，长度1-10位', trigger: 'blur' }
  ],
  sort: [
    { required: true, message: '请输入排序号', trigger: 'blur' },
    { type: 'number', min: 1, max: 999, message: '请输入1-999的有效数字', trigger: 'blur' }
  ]
}

// 获取数据
const fetchData = () => {
  loading.value = true
  setTimeout(() => {
    tableData.value = [
      {
        id: 1,
        name: '办公门户',
        code: 'PORTAL_OFFICE',
        sort: 1,
        portalCount: 5,
        status: 'enabled',
        creator: '系统管理员',
        createTime: '2024-01-10 10:00'
      },
      {
        id: 2,
        name: '数据门户',
        code: 'PORTAL_DATA',
        sort: 2,
        portalCount: 3,
        status: 'enabled',
        creator: '系统管理员',
        createTime: '2024-01-10 10:05'
      },
      {
        id: 3,
        name: '管理门户',
        code: 'PORTAL_ADMIN',
        sort: 3,
        portalCount: 2,
        status: 'enabled',
        creator: '系统管理员',
        createTime: '2024-01-10 10:10'
      },
      {
        id: 4,
        name: '金融行业门户',
        code: 'PORTAL_FINANCE',
        sort: 4,
        portalCount: 0,
        status: 'disabled',
        creator: '张三',
        createTime: '2024-01-12 14:30'
      }
    ]
    pagination.total = 4
    loading.value = false
  }, 500)
}

// 事件处理
const handleSearch = () => {
  pagination.currentPage = 1
  fetchData()
}

const handleReset = () => {
  Object.assign(searchForm, {
    name: '',
    status: ''
  })
  handleSearch()
}

const handleSelectionChange = (rows) => {
  selectedRows.value = rows
}

const handleAdd = () => {
  isEdit.value = false
  dialogTitle.value = '新增分类'
  resetForm()
  // 自动生成编码
  formData.code = 'PORTAL_'
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  dialogTitle.value = '编辑分类'
  Object.assign(formData, {
    id: row.id,
    name: row.name,
    code: row.code,
    sort: row.sort,
    status: row.status,
    remark: ''
  })
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate((valid) => {
    if (valid) {
      submitting.value = true
      setTimeout(() => {
        submitting.value = false
        dialogVisible.value = false
        ElMessage.success(isEdit.value ? '编辑成功' : '新增成功')
        fetchData()
      }, 500)
    }
  })
}

const handleEnable = (row) => {
  ElMessageBox.confirm(`确定要启用分类"${row.name}"吗？`, '启用确认', { type: 'info' }).then(() => {
    ElMessage.success('启用成功')
    fetchData()
  }).catch(() => {})
}

const handleDisable = (row) => {
  if (row.portalCount > 0) {
    ElMessage.warning('该分类下存在已发布门户，请先停用关联门户再禁用分类')
    return
  }

  ElMessageBox.confirm(
      '确定要禁用该分类吗？禁用后，该分类下的门户将无法在前台展示，设计器/管理中心不可选择该分类',
      '禁用确认',
      { type: 'warning' }
  ).then(() => {
    ElMessage.success('禁用成功')
    fetchData()
  }).catch(() => {})
}

const handleDelete = (row) => {
  if (row.portalCount > 0) {
    ElMessage.warning('该分类已关联门户，请先修改门户分类再删除')
    return
  }

  ElMessageBox.confirm(
      '确定要删除该分类吗？删除后不可恢复，若存在关联门户，请先解绑分类',
      '删除确认',
      { type: 'error' }
  ).then(() => {
    ElMessage.success('删除成功')
    fetchData()
  }).catch(() => {})
}

const handleBatchEnable = () => {
  const disabledRows = selectedRows.value.filter(row => row.status === 'disabled')
  if (disabledRows.length === 0) {
    ElMessage.warning('请选择需要启用的分类')
    return
  }

  ElMessageBox.confirm(`确定要启用选中的 ${disabledRows.length} 个分类吗？`, '批量启用', { type: 'info' }).then(() => {
    ElMessage.success('批量启用成功')
    fetchData()
  }).catch(() => {})
}

const handleBatchDisable = () => {
  const enabledRows = selectedRows.value.filter(row => row.status === 'enabled')
  if (enabledRows.length === 0) {
    ElMessage.warning('请选择需要禁用的分类')
    return
  }

  const hasPortalRows = enabledRows.filter(row => row.portalCount > 0)
  if (hasPortalRows.length > 0) {
    ElMessage.warning('部分分类下存在已发布门户，请先停用关联门户再禁用分类')
    return
  }

  ElMessageBox.confirm(
      `确定要禁用选中的 ${enabledRows.length} 个分类吗？禁用后，这些分类下的门户将无法在前台展示`,
      '批量禁用',
      { type: 'warning' }
  ).then(() => {
    ElMessage.success('批量禁用成功')
    fetchData()
  }).catch(() => {})
}

const handleSortChange = (row) => {
  ElMessage.success('排序已更新')
  // 实际项目中应调用API保存
}

const handleViewPortals = (row) => {
  router.push({
    path: '/portal/management',
    query: { category: row.code }
  })
}

const refreshData = () => {
  fetchData()
  ElMessage.success('刷新成功')
}

const resetForm = () => {
  Object.assign(formData, {
    id: null,
    name: '',
    code: 'PORTAL_',
    sort: 99,
    status: 'enabled',
    remark: ''
  })
  if (formRef.value) {
    formRef.value.clearValidate()
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped lang="scss">
.portal-category-management {
  padding: 16px;
  background: #f0f2f5;
  min-height: calc(100vh - 50px);

  .breadcrumb {
    margin-bottom: 16px;
  }

  .top-actions {
    margin-bottom: 16px;
    display: flex;
    gap: 8px;
  }

  .filter-card {
    margin-bottom: 16px;

    :deep(.el-card__body) {
      padding: 16px;
    }
  }

  .main-card {
    :deep(.el-card__body) {
      padding: 16px;
    }
  }

  .zero-count {
    color: #909399;
  }

  .pagination {
    margin-top: 16px;
    display: flex;
    justify-content: flex-end;
  }

  .form-tip {
    font-size: 12px;
    color: #909399;
    margin-top: 4px;
  }
}
</style>
