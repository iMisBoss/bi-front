<template>
  <div class="regulation-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>规章制度</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增制度
          </el-button>
        </div>
      </template>

      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="制度名称">
          <el-input v-model="searchForm.name" placeholder="请输入名称" clearable />
        </el-form-item>
        <el-form-item label="制度类型">
          <el-select v-model="searchForm.type" placeholder="请选择类型" clearable>
            <el-option label="行政管理" value="admin" />
            <el-option label="人事管理" value="hr" />
            <el-option label="财务管理" value="finance" />
            <el-option label="业务管理" value="business" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="tableData" v-loading="loading" border row-key="id">
        <el-table-column prop="name" label="制度名称" min-width="300" />
        <el-table-column prop="code" label="制度编号" width="150" />
        <el-table-column prop="type" label="类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getTypeTag(row.type)">
              {{ row.typeName }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="version" label="版本" width="100" />
        <el-table-column prop="effectiveDate" label="生效日期" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'">
              {{ row.status === 1 ? '生效' : '废止' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="250">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleView(row)">查看</el-button>
            <el-button link type="primary" @click="handleDownload(row)">下载</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          class="pagination"
      />
    </el-card>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="800px">
      <el-form :model="formData" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="制度名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入制度名称" />
        </el-form-item>
        <el-form-item label="制度编号" prop="code">
          <el-input v-model="formData.code" placeholder="请输入制度编号" />
        </el-form-item>
        <el-form-item label="制度类型" prop="type">
          <el-select v-model="formData.type" placeholder="请选择类型">
            <el-option label="行政管理" value="admin" />
            <el-option label="人事管理" value="hr" />
            <el-option label="财务管理" value="finance" />
            <el-option label="业务管理" value="business" />
          </el-select>
        </el-form-item>
        <el-form-item label="版本号" prop="version">
          <el-input v-model="formData.version" placeholder="请输入版本号，如 V1.0" />
        </el-form-item>
        <el-form-item label="生效日期" prop="effectiveDate">
          <el-date-picker
              v-model="formData.effectiveDate"
              type="date"
              placeholder="选择日期"
              style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="制度内容" prop="content">
          <el-input v-model="formData.content" type="textarea" :rows="10" placeholder="请输入制度内容" />
        </el-form-item>
        <el-form-item label="附件">
          <el-upload
              action="#"
              :auto-upload="false"
              :limit="3"
          >
            <el-button type="primary">
              <el-icon><Upload /></el-icon>
              上传附件
            </el-button>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Upload } from '@element-plus/icons-vue'

const loading = ref(false)
const searchForm = ref({
  name: '',
  type: ''
})

const tableData = ref([])
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const dialogVisible = ref(false)
const dialogTitle = ref('新增制度')
const formRef = ref(null)

const formData = ref({
  id: null,
  name: '',
  code: '',
  type: '',
  version: '',
  effectiveDate: '',
  content: '',
  status: 1
})

const rules = {
  name: [{ required: true, message: '请输入制度名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入制度编号', trigger: 'blur' }],
  type: [{ required: true, message: '请选择类型', trigger: 'change' }]
}

const typeNames = {
  admin: '行政管理',
  hr: '人事管理',
  finance: '财务管理',
  business: '业务管理'
}

onMounted(() => {
  loadData()
})

const loadData = () => {
  loading.value = true
  setTimeout(() => {
    tableData.value = [
      { id: 1, name: '员工考勤管理制度', code: 'HR-2026-001', type: 'hr', typeName: '人事管理', version: 'V1.0', effectiveDate: '2026-01-01', status: 1 },
      { id: 2, name: '财务报销管理办法', code: 'FIN-2026-001', type: 'finance', typeName: '财务管理', version: 'V1.0', effectiveDate: '2026-01-01', status: 1 },
      { id: 3, name: '行政办公管理制度', code: 'ADM-2026-001', type: 'admin', typeName: '行政管理', version: 'V1.0', effectiveDate: '2026-01-01', status: 1 }
    ]
    pagination.total = tableData.value.length
    loading.value = false
  }, 500)
}

const handleSearch = () => {
  loadData()
}

const handleReset = () => {
  searchForm.value = { name: '', type: '' }
  loadData()
}

const handleAdd = () => {
  dialogTitle.value = '新增制度'
  formData.value = { id: null, name: '', code: '', type: '', version: '', effectiveDate: '', content: '', status: 1 }
  dialogVisible.value = true
}

const handleView = (row) => {
  ElMessage.info('查看制度详情')
}

const handleDownload = (row) => {
  ElMessage.success('下载成功')
}

const handleDelete = (row) => {
  ElMessage.success('删除成功')
  loadData()
}

const handleSubmit = () => {
  ElMessage.success('保存成功')
  dialogVisible.value = false
  loadData()
}

const getTypeTag = (type) => {
  const types = { admin: '', hr: 'warning', finance: 'success', business: 'primary' }
  return types[type] || 'info'
}
</script>

<style lang="scss" scoped>
.regulation-page {
  padding: 20px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .search-form {
    margin-bottom: 20px;
  }

  .pagination {
    margin-top: 20px;
    justify-content: flex-end;
  }
}
</style>
