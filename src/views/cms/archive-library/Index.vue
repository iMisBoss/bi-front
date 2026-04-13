<template>
  <div class="archive-library-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>档案库</span>
          <div class="header-actions">
            <el-input
                v-model="searchText"
                placeholder="搜索档案"
                clearable
                style="width: 200px"
            />
            <el-button type="primary" @click="handleUpload">
              <el-icon><Upload /></el-icon>
              归档文件
            </el-button>
          </div>
        </div>
      </template>

      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="档案类型">
          <el-select v-model="searchForm.type" placeholder="请选择类型" clearable>
            <el-option label="合同协议" value="contract" />
            <el-option label="资质证书" value="certificate" />
            <el-option label="项目档案" value="project" />
            <el-option label="人事档案" value="hr" />
            <el-option label="财务档案" value="finance" />
          </el-select>
        </el-form-item>
        <el-form-item label="归档时间">
          <el-date-picker
              v-model="searchForm.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              style="width: 240px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="tableData" v-loading="loading" border>
        <el-table-column prop="archiveNumber" label="档案编号" width="150" />
        <el-table-column prop="name" label="档案名称" min-width="250" />
        <el-table-column prop="type" label="类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getTypeTag(row.type)">
              {{ row.typeName }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="department" label="归档部门" width="120" />
        <el-table-column prop="keeper" label="保管人" width="100" />
        <el-table-column prop="archiveTime" label="归档时间" width="180" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'warning'">
              {{ row.status === 1 ? '在库' : '借出' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="280">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleView(row)">查看</el-button>
            <el-button link type="primary" @click="handleDownload(row)">下载</el-button>
            <el-button link type="primary" @click="handleBorrow(row)" v-if="row.status === 1">借阅</el-button>
            <el-button link type="danger" @click="handleDelete(row)">销毁</el-button>
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

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="700px">
      <el-form :model="formData" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="档案名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入档案名称" />
        </el-form-item>
        <el-form-item label="档案编号" prop="archiveNumber">
          <el-input v-model="formData.archiveNumber" placeholder="请输入档案编号" />
        </el-form-item>
        <el-form-item label="档案类型" prop="type">
          <el-select v-model="formData.type" placeholder="请选择类型">
            <el-option label="合同协议" value="contract" />
            <el-option label="资质证书" value="certificate" />
            <el-option label="项目档案" value="project" />
            <el-option label="人事档案" value="hr" />
            <el-option label="财务档案" value="finance" />
          </el-select>
        </el-form-item>
        <el-form-item label="保管期限" prop="period">
          <el-select v-model="formData.period" placeholder="请选择保管期限">
            <el-option label="永久" value="permanent" />
            <el-option label="30 年" value="30years" />
            <el-option label="10 年" value="10years" />
            <el-option label="5 年" value="5years" />
          </el-select>
        </el-form-item>
        <el-form-item label="密级" prop="securityLevel">
          <el-radio-group v-model="formData.securityLevel">
            <el-radio label="public">公开</el-radio>
            <el-radio label="internal">内部</el-radio>
            <el-radio label="secret">秘密</el-radio>
            <el-radio label="topSecret">机密</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="归档部门" prop="department">
          <el-select v-model="formData.department" placeholder="请选择部门">
            <el-option label="办公室" value="办公室" />
            <el-option label="科技部" value="科技部" />
            <el-option label="资金部" value="资金部" />
            <el-option label="财务部" value="财务部" />
          </el-select>
        </el-form-item>
        <el-form-item label="保管人" prop="keeper">
          <el-input v-model="formData.keeper" placeholder="请输入保管人" />
        </el-form-item>
        <el-form-item label="档案摘要" prop="summary">
          <el-input v-model="formData.summary" type="textarea" :rows="3" placeholder="请输入档案摘要" />
        </el-form-item>
        <el-form-item label="附件">
          <el-upload
              action="#"
              :auto-upload="false"
              :limit="10"
              multiple
          >
            <el-button type="primary">
              <el-icon><Upload /></el-icon>
              上传文件
            </el-button>
            <template #tip>
              <div class="el-upload__tip">
                支持 pdf、doc、docx、xls、xlsx、jpg、png 等格式
              </div>
            </template>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="borrowVisible" title="借阅申请" width="500px">
      <el-form :model="borrowForm" label-width="100px">
        <el-form-item label="借阅人">
          <el-input v-model="borrowForm.borrower" placeholder="请输入借阅人" />
        </el-form-item>
        <el-form-item label="借阅部门">
          <el-select v-model="borrowForm.department" placeholder="请选择部门">
            <el-option label="办公室" value="办公室" />
            <el-option label="科技部" value="科技部" />
            <el-option label="资金部" value="资金部" />
          </el-select>
        </el-form-item>
        <el-form-item label="借阅用途">
          <el-input v-model="borrowForm.reason" type="textarea" :rows="3" placeholder="请输入借阅用途" />
        </el-form-item>
        <el-form-item label="预计归还">
          <el-date-picker
              v-model="borrowForm.returnDate"
              type="date"
              placeholder="选择日期"
              style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="borrowVisible = false">取消</el-button>
        <el-button type="primary" @click="handleBorrowSubmit">提交申请</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Upload } from '@element-plus/icons-vue'

const loading = ref(false)
const searchText = ref('')
const searchForm = ref({
  type: '',
  dateRange: []
})

const tableData = ref([])
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const dialogVisible = ref(false)
const dialogTitle = ref('归档文件')
const formRef = ref(null)

const borrowVisible = ref(false)
const borrowData = ref(null)
const borrowForm = ref({
  borrower: '',
  department: '',
  reason: '',
  returnDate: ''
})

const formData = ref({
  id: null,
  archiveNumber: '',
  name: '',
  type: '',
  period: '',
  securityLevel: 'internal',
  department: '',
  keeper: '',
  summary: '',
  status: 1
})

const rules = {
  name: [{ required: true, message: '请输入档案名称', trigger: 'blur' }],
  archiveNumber: [{ required: true, message: '请输入档案编号', trigger: 'blur' }],
  type: [{ required: true, message: '请选择类型', trigger: 'change' }],
  period: [{ required: true, message: '请选择保管期限', trigger: 'change' }],
  department: [{ required: true, message: '请选择归档部门', trigger: 'change' }],
  keeper: [{ required: true, message: '请输入保管人', trigger: 'blur' }]
}

const typeNames = {
  contract: '合同协议',
  certificate: '资质证书',
  project: '项目档案',
  hr: '人事档案',
  finance: '财务档案'
}

onMounted(() => {
  loadData()
})

const loadData = () => {
  loading.value = true
  setTimeout(() => {
    tableData.value = [
      {
        id: 1,
        archiveNumber: 'DA-2026-001',
        name: '公司营业执照及资质证书',
        type: 'certificate',
        typeName: '资质证书',
        department: '办公室',
        keeper: '张三',
        archiveTime: '2026-01-15 10:00',
        status: 1
      },
      {
        id: 2,
        archiveNumber: 'DA-2026-002',
        name: 'XX 项目合同协议',
        type: 'contract',
        typeName: '合同协议',
        department: '科技部',
        keeper: '李四',
        archiveTime: '2026-01-14 09:00',
        status: 1
      },
      {
        id: 3,
        archiveNumber: 'DA-2026-003',
        name: '2023 年度财务报表',
        type: 'finance',
        typeName: '财务档案',
        department: '财务部',
        keeper: '王五',
        archiveTime: '2026-01-10 14:30',
        status: 2
      }
    ]
    pagination.total = tableData.value.length
    loading.value = false
  }, 500)
}

const handleSearch = () => {
  loadData()
}

const handleReset = () => {
  searchForm.value = { type: '', dateRange: [] }
  searchText.value = ''
  loadData()
}

const handleUpload = () => {
  dialogTitle.value = '归档文件'
  formData.value = {
    id: null,
    archiveNumber: '',
    name: '',
    type: '',
    period: '',
    securityLevel: 'internal',
    department: '',
    keeper: '',
    summary: '',
    status: 1
  }
  dialogVisible.value = true
}

const handleView = (row) => {
  ElMessage.info('查看档案详情')
}

const handleDownload = (row) => {
  ElMessage.success('下载成功')
}

const handleBorrow = (row) => {
  borrowData.value = row
  borrowForm.value = { borrower: '', department: '', reason: '', returnDate: '' }
  borrowVisible.value = true
}

const handleBorrowSubmit = () => {
  ElMessage.success('借阅申请已提交，等待审批')
  borrowVisible.value = false
}

const handleDelete = (row) => {
  ElMessage.warning('档案销毁功能需要特殊权限')
}

const handleSubmit = () => {
  ElMessage.success('归档成功')
  dialogVisible.value = false
  loadData()
}

const getTypeTag = (type) => {
  const types = {
    contract: 'primary',
    certificate: 'success',
    project: 'warning',
    hr: 'danger',
    finance: 'info'
  }
  return types[type] || 'info'
}
</script>

<style lang="scss" scoped>
.archive-library-page {
  padding: 20px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .header-actions {
      display: flex;
      gap: 10px;
      align-items: center;
    }
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
