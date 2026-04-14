<template>
  <div class="api-management">
    <!-- 工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <el-input v-model="searchKeyword" placeholder="搜索接口名称/路径" prefix-icon="Search" clearable style="width: 280px" />
        <el-select v-model="filterCategory" placeholder="接口分类" clearable style="width: 150px">
          <el-option label="系统接口" value="system" />
          <el-option label="业务接口" value="business" />
          <el-option label="集成接口" value="integration" />
        </el-select>
        <el-select v-model="filterStatus" placeholder="接口状态" clearable style="width: 150px">
          <el-option label="启用" value="enabled" />
          <el-option label="禁用" value="disabled" />
        </el-select>
      </div>
      <div class="toolbar-right">
        <el-button type="primary" @click="handleAdd" icon="Plus">新增接口</el-button>
      </div>
    </div>

    <!-- 接口列表 -->
    <el-table
        :data="apis"
        border
        row-key="id"
        :header-cell-style="{ background: '#fafafa', color: '#333', fontWeight: '600' }"
        style="flex: 1"
    >
      <el-table-column prop="name" label="接口名称" min-width="180" />
      <el-table-column prop="path" label="请求路径" min-width="250" show-overflow-tooltip />
      <el-table-column prop="method" label="请求方式" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="getMethodType(row.method)" size="small">{{ row.method }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="category" label="分类" width="120" align="center">
        <template #default="{ row }">
          <el-tag size="small">{{ getCategoryText(row.category) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="authType" label="鉴权方式" width="120" align="center">
        <template #default="{ row }">
          <el-tag size="small">{{ row.authType }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="rateLimit" label="限流阈值" width="120" align="center">
        <template #default="{ row }">
          {{ row.rateLimit }}次/日
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="row.status === 'enabled' ? 'success' : 'info'" size="small">
            {{ row.status === 'enabled' ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="220" align="center" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
          <el-button link type="success" size="small" @click="handleViewDoc(row)">文档</el-button>
          <el-button link :type="row.status === 'enabled' ? 'warning' : 'success'" size="small" @click="handleToggle(row)">
            {{ row.status === 'enabled' ? '禁用' : '启用' }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-wrapper">
      <el-pagination
          :total="apis.length"
          :page-size="20"
          layout="total, prev, pager, next, jumper"
      />
    </div>

    <!-- 接口编辑对话框 -->
    <ApiDialog
        v-model="showDialog"
        :type="dialogType"
        :data="currentApi"
        @confirm="handleConfirmSave"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import ApiDialog from './ApiDialog.vue'

const searchKeyword = ref('')
const filterCategory = ref('')
const filterStatus = ref('')
const showDialog = ref(false)
const dialogType = ref('add')
const currentApi = ref(null)

const apis = ref([
  { id: 1, name: '获取组织人员列表', path: '/api/v1/org/users', method: 'GET', category: 'system', authType: 'Token', rateLimit: 1000, status: 'enabled', version: 'v1' },
  { id: 2, name: '创建审批流程', path: '/api/v1/process/create', method: 'POST', category: 'business', authType: '密钥', rateLimit: 500, status: 'enabled', version: 'v1' },
  { id: 3, name: '查询考勤数据', path: '/api/v1/attendance/query', method: 'POST', category: 'integration', authType: 'Token', rateLimit: 2000, status: 'enabled', version: 'v1' },
  { id: 4, name: '同步财务数据', path: '/api/v2/finance/sync', method: 'POST', category: 'integration', authType: '密钥', rateLimit: 100, status: 'disabled', version: 'v2' }
])

const getMethodType = (method) => {
  const types = {
    'GET': '',
    'POST': 'success',
    'PUT': 'warning',
    'DELETE': 'danger'
  }
  return types[method] || ''
}

const getCategoryText = (category) => {
  const texts = {
    'system': '系统接口',
    'business': '业务接口',
    'integration': '集成接口'
  }
  return texts[category] || category
}

const handleAdd = () => {
  dialogType.value = 'add'
  currentApi.value = null
  showDialog.value = true
}

const handleEdit = (row) => {
  dialogType.value = 'edit'
  currentApi.value = { ...row }
  showDialog.value = true
}

const handleViewDoc = (row) => {
  ElMessage.info(`查看接口文档：${row.path}`)
}

const handleToggle = (row) => {
  const action = row.status === 'enabled' ? '禁用' : '启用'
  ElMessageBox.confirm(`确定要${action}接口「${row.name}」吗？${action === '禁用' ? '禁用后所有调用将被拦截拒绝。' : ''}`, `${action}确认`, {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    row.status = row.status === 'enabled' ? 'disabled' : 'enabled'
    ElMessage.success(`${action}成功`)
  }).catch(() => {})
}

const handleConfirmSave = (formData) => {
  if (formData.id) {
    const index = apis.value.findIndex(item => item.id === formData.id)
    if (index !== -1) {
      apis.value[index] = { ...apis.value[index], ...formData }
    }
    ElMessage.success('编辑成功')
  } else {
    formData.id = Date.now()
    apis.value.push(formData)
    ElMessage.success('新增成功')
  }
  showDialog.value = false
}
</script>

<style lang="scss" scoped>
.api-management {
  display: flex;
  flex-direction: column;
  height: 100%;

  .toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    .toolbar-left,
    .toolbar-right {
      display: flex;
      gap: 8px;
      align-items: center;
    }
  }

  .pagination-wrapper {
    margin-top: 16px;
    display: flex;
    justify-content: flex-end;
    flex-shrink: 0;
  }
}
</style>
