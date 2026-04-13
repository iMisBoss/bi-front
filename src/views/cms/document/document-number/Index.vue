<template>
  <div class="document-number-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h2>文号管理</h2>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="handleApply" icon="Plus">申请文号</el-button>
      </div>
    </div>

    <!-- 搜索筛选区域 -->
    <el-card class="filter-card" shadow="hover">
      <el-form :inline="true" :model="filterForm" size="default">
        <el-form-item label="公文类型">
          <el-select v-model="filterForm.docType" placeholder="全部类型" clearable style="width: 150px">
            <el-option label="全部类型" value="" />
            <el-option label="请示" value="request" />
            <el-option label="报告" value="report" />
            <el-option label="通知" value="notice" />
            <el-option label="通报" value="bulletin" />
            <el-option label="决定" value="decision" />
          </el-select>
        </el-form-item>
        <el-form-item label="使用状态">
          <el-select v-model="filterForm.status" placeholder="全部状态" clearable style="width: 150px">
            <el-option label="全部状态" value="" />
            <el-option label="已使用" value="used" />
            <el-option label="未使用" value="unused" />
          </el-select>
        </el-form-item>
        <el-form-item label="年份">
          <el-select v-model="filterForm.year" placeholder="全部年份" clearable style="width: 120px">
            <el-option label="2024" value="2024" />
            <el-option label="2023" value="2023" />
            <el-option label="2022" value="2022" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleFilter" icon="Search">查询</el-button>
          <el-button @click="handleResetFilter" icon="Refresh">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 文号列表 -->
    <el-card class="tab-card" shadow="never">
      <!-- 统计信息 -->
      <div class="stats-bar">
        <el-statistic title="总文号数" :value="total" />
        <el-statistic title="已使用" :value="usedCount" />
        <el-statistic title="未使用" :value="unusedCount" />
      </div>

      <el-table :data="numberList" border v-loading="loading">
        <el-table-column prop="docNumber" label="文号" width="180" />
        <el-table-column prop="docType" label="公文类型" width="120" />
        <el-table-column prop="year" label="年份" width="100" />
        <el-table-column prop="sequenceNo" label="流水号" width="100" />
        <el-table-column prop="title" label="公文标题" min-width="250" show-overflow-tooltip />
        <el-table-column prop="applicant" label="申请人" width="100" />
        <el-table-column prop="applyDate" label="申请日期" width="120" sortable />
        <el-table-column prop="useDate" label="使用日期" width="120" />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === '已使用' ? 'success' : 'warning'" size="small" effect="plain">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right" align="center">
          <template #default="{ row }">
            <el-button v-if="row.status === '未使用'" link type="primary" size="small" @click="handleUse(row)">使用</el-button>
            <el-button link type="primary" size="small" @click="handleView(row)">查看</el-button>
            <el-button v-if="row.status === '未使用'" link type="danger" size="small" @click="handleCancel(row)">作废</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <span class="total">共 {{ numberList.length }} 条</span>
        <el-select v-model="pageSize" size="small" style="width: 100px; margin: 0 10px;">
          <el-option label="10条/页" :value="10" />
          <el-option label="20条/页" :value="20" />
          <el-option label="50条/页" :value="50" />
        </el-select>
        <el-pagination
            v-model:current-page="currentPage"
            :page-size="pageSize"
            :total="numberList.length"
            layout="prev, pager, next, jumper"
        />
      </div>
    </el-card>

    <!-- 申请文号弹窗 -->
    <el-dialog
        v-model="applyDialogVisible"
        title="申请文号"
        width="600px"
        :close-on-click-modal="false"
    >
      <el-form :model="applyForm" :rules="applyRules" ref="applyFormRef" label-width="120px">
        <el-form-item label="公文类型" prop="docType">
          <el-select v-model="applyForm.docType" placeholder="请选择公文类型" style="width: 100%">
            <el-option label="请示" value="request" />
            <el-option label="报告" value="report" />
            <el-option label="通知" value="notice" />
            <el-option label="通报" value="bulletin" />
            <el-option label="决定" value="decision" />
          </el-select>
        </el-form-item>
        <el-form-item label="公文标题" prop="title">
          <el-input v-model="applyForm.title" placeholder="请输入公文标题" />
        </el-form-item>
        <el-form-item label="紧急程度">
          <el-radio-group v-model="applyForm.urgency">
            <el-radio label="normal">普通</el-radio>
            <el-radio label="urgent">紧急</el-radio>
            <el-radio label="very_urgent">特急</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="申请原因">
          <el-input
              v-model="applyForm.reason"
              type="textarea"
              :rows="3"
              placeholder="请简要说明申请原因"
              maxlength="200"
              show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="applyDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitApply" :loading="submitting">提交申请</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Plus } from '@element-plus/icons-vue'

const loading = ref(false)
const submitting = ref(false)
const applyDialogVisible = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)

// 筛选表单
const filterForm = reactive({
  docType: '',
  status: '',
  year: ''
})

// 文号列表数据
const numberList = ref([
  {
    id: 1,
    docNumber: '建信发〔2024〕1号',
    docType: '通知',
    year: '2024',
    sequenceNo: '001',
    title: '关于加强春节放假期间安全管理的通知',
    applicant: '张三',
    applyDate: '2024-01-10',
    useDate: '2024-01-15',
    status: '已使用'
  },
  {
    id: 2,
    docNumber: '建信发〔2024〕2号',
    docType: '通知',
    year: '2024',
    sequenceNo: '002',
    title: '',
    applicant: '李四',
    applyDate: '2024-01-12',
    useDate: '',
    status: '未使用'
  },
  {
    id: 3,
    docNumber: '建信报〔2024〕1号',
    docType: '报告',
    year: '2024',
    sequenceNo: '001',
    title: '关于2024年度工作计划的报告',
    applicant: '王五',
    applyDate: '2024-01-08',
    useDate: '2024-01-14',
    status: '已使用'
  },
  {
    id: 4,
    docNumber: '建信请〔2024〕1号',
    docType: '请示',
    year: '2024',
    sequenceNo: '001',
    title: '',
    applicant: '赵六',
    applyDate: '2024-01-14',
    useDate: '',
    status: '未使用'
  },
  {
    id: 5,
    docNumber: '建信通〔2024〕1号',
    docType: '通报',
    year: '2024',
    sequenceNo: '001',
    title: '关于2023年度工作考核情况的通报',
    applicant: '孙七',
    applyDate: '2024-01-05',
    useDate: '2024-01-12',
    status: '已使用'
  }
])

// 统计数据
const total = computed(() => numberList.value.length)
const usedCount = computed(() => numberList.value.filter(item => item.status === '已使用').length)
const unusedCount = computed(() => numberList.value.filter(item => item.status === '未使用').length)

// 申请表单
const applyFormRef = ref(null)
const applyForm = reactive({
  docType: '',
  title: '',
  urgency: 'normal',
  reason: ''
})

const applyRules = {
  docType: [{ required: true, message: '请选择公文类型', trigger: 'change' }],
  title: [{ required: true, message: '请输入公文标题', trigger: 'blur' }]
}

// 查询
const handleFilter = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 500)
}

// 重置筛选
const handleResetFilter = () => {
  filterForm.docType = ''
  filterForm.status = ''
  filterForm.year = ''
  handleFilter()
}

// 申请文号
const handleApply = () => {
  applyDialogVisible.value = true
  applyForm.docType = ''
  applyForm.title = ''
  applyForm.urgency = 'normal'
  applyForm.reason = ''
}

// 提交申请
const handleSubmitApply = () => {
  applyFormRef.value.validate((valid) => {
    if (valid) {
      submitting.value = true
      setTimeout(() => {
        submitting.value = false
        applyDialogVisible.value = false
        ElMessage.success('文号申请已提交')
        // 添加新文号
        const newNumber = {
          id: numberList.value.length + 1,
          docNumber: `建信${getDocTypePrefix(applyForm.docType)}〔2024〕${String(numberList.value.filter(item => item.docType === applyForm.docType).length + 1).padStart(3, '0')}号`,
          docType: getDocTypeName(applyForm.docType),
          year: '2024',
          sequenceNo: String(numberList.value.filter(item => item.docType === applyForm.docType).length + 1).padStart(3, '0'),
          title: '',
          applicant: '当前用户',
          applyDate: new Date().toISOString().split('T')[0],
          useDate: '',
          status: '未使用'
        }
        numberList.value.unshift(newNumber)
      }, 1000)
    }
  })
}

// 使用文号
const handleUse = (row) => {
  ElMessageBox.prompt('请输入公文标题', '使用文号', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPattern: /.+/,
    inputErrorMessage: '请输入公文标题'
  }).then(({ value }) => {
    row.title = value
    row.useDate = new Date().toISOString().split('T')[0]
    row.status = '已使用'
    ElMessage.success('文号已使用')
  }).catch(() => {})
}

// 查看
const handleView = (row) => {
  ElMessage.info(`查看文号：${row.docNumber}`)
}

// 作废
const handleCancel = (row) => {
  ElMessageBox.confirm(`确认作废文号"${row.docNumber}"吗？`, '作废确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = numberList.value.findIndex(item => item.id === row.id)
    if (index > -1) {
      numberList.value.splice(index, 1)
    }
    ElMessage.success('文号已作废')
  }).catch(() => {})
}

// 获取公文类型前缀
const getDocTypePrefix = (type) => {
  const map = {
    'request': '请',
    'report': '报',
    'notice': '发',
    'bulletin': '通',
    'decision': '决'
  }
  return map[type] || '发'
}

// 获取公文类型名称
const getDocTypeName = (type) => {
  const map = {
    'request': '请示',
    'report': '报告',
    'notice': '通知',
    'bulletin': '通报',
    'decision': '决定'
  }
  return map[type] || '通知'
}

onMounted(() => {
  console.log('文号管理加载')
})
</script>

<style scoped lang="scss">
.document-number-page {
  padding: 20px;
  background: #f0f2f5;
  min-height: calc(100vh - 60px);

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    background: #fff;
    padding: 16px 20px;
    border-radius: 4px;

    .header-left h2 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #303133;
    }
  }

  .filter-card {
    margin-bottom: 16px;

    :deep(.el-form-item) {
      margin-bottom: 0;
      margin-right: 16px;
    }
  }

  .tab-card {
    :deep(.el-card__body) {
      padding: 20px;
    }

    .stats-bar {
      display: flex;
      gap: 40px;
      margin-bottom: 20px;
      padding-bottom: 20px;
      border-bottom: 1px solid #e8e8e8;
    }

    .pagination {
      margin-top: 16px;
      display: flex;
      justify-content: flex-end;
      align-items: center;

      .total {
        font-size: 14px;
        color: #606266;
      }
    }
  }
}
</style>
