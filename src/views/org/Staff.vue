<template>
  <div class="staff-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>人员档案管理</span>
          <el-button type="primary" @click="handleAdd">新增档案</el-button>
        </div>
      </template>

      <!-- 搜索栏 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="姓名">
          <el-input v-model="searchForm.name" placeholder="请输入姓名" clearable />
        </el-form-item>
        <el-form-item label="部门">
          <el-select v-model="searchForm.department" placeholder="请选择部门" clearable>
            <el-option label="科技部" value="科技部" />
            <el-option label="资金部" value="资金部" />
            <el-option label="财务部" value="财务部" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 数据表格 -->
      <el-table
          :data="tableData"
          style="width: 100%"
          v-loading="loading"
          border
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="gender" label="性别" width="80" />
        <el-table-column prop="department" label="部门" width="150" />
        <el-table-column prop="position" label="岗位" width="150" />
        <el-table-column prop="entryDate" label="入职日期" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === '在职' ? 'success' : 'warning'">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="200">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleView(row)">查看</el-button>
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
          class="pagination"
      />
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog
        v-model="dialogVisible"
        :title="dialogTitle"
        width="600px"
    >
      <el-form :model="formData" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="姓名" prop="name">
          <el-input v-model="formData.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-radio-group v-model="formData.gender">
            <el-radio label="男">男</el-radio>
            <el-radio label="女">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="部门" prop="department">
          <el-select v-model="formData.department" placeholder="请选择部门">
            <el-option label="科技部" value="科技部" />
            <el-option label="资金部" value="资金部" />
            <el-option label="财务部" value="财务部" />
          </el-select>
        </el-form-item>
        <el-form-item label="岗位" prop="position">
          <el-input v-model="formData.position" placeholder="请输入岗位" />
        </el-form-item>
        <el-form-item label="入职日期" prop="entryDate">
          <el-date-picker
              v-model="formData.entryDate"
              type="date"
              placeholder="选择日期"
              style="width: 100%"
          />
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
import { ElMessage, ElMessageBox } from 'element-plus'

const loading = ref(false)
const searchForm = ref({
  name: '',
  department: ''
})

const tableData = ref([])
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const dialogVisible = ref(false)
const dialogTitle = ref('新增档案')
const formRef = ref(null)
const formData = ref({
  name: '',
  gender: '男',
  department: '',
  position: '',
  entryDate: ''
})

const rules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  department: [{ required: true, message: '请选择部门', trigger: 'change' }],
  position: [{ required: true, message: '请输入岗位', trigger: 'blur' }]
}

// 静态数据
const mockData = [
  {
    id: 1,
    name: '张三',
    gender: '男',
    department: '科技部',
    position: '前端工程师',
    entryDate: '2024-03-15',
    status: '在职'
  },
  {
    id: 2,
    name: '李四',
    gender: '女',
    department: '资金部',
    position: '资金专员',
    entryDate: '2024-05-20',
    status: '在职'
  },
  {
    id: 3,
    name: '王五',
    gender: '男',
    department: '财务部',
    position: '会计',
    entryDate: '2024-01-10',
    status: '在职'
  },
  {
    id: 4,
    name: '赵六',
    gender: '女',
    department: '科技部',
    position: '后端工程师',
    entryDate: '2024-07-01',
    status: '在职'
  },
  {
    id: 5,
    name: '孙七',
    gender: '男',
    department: '资金部',
    position: '风控经理',
    entryDate: '2023-11-15',
    status: '在职'
  },
  {
    id: 6,
    name: '周八',
    gender: '女',
    department: '财务部',
    position: '出纳',
    entryDate: '2024-02-28',
    status: '在职'
  },
  {
    id: 7,
    name: '吴九',
    gender: '男',
    department: '科技部',
    position: '测试工程师',
    entryDate: '2024-06-10',
    status: '在职'
  },
  {
    id: 8,
    name: '郑十',
    gender: '女',
    department: '科技部',
    position: '产品经理',
    entryDate: '2023-09-01',
    status: '在职'
  },
  {
    id: 9,
    name: '钱十一',
    gender: '男',
    department: '资金部',
    position: '投资顾问',
    entryDate: '2024-04-15',
    status: '在职'
  },
  {
    id: 10,
    name: '冯十二',
    gender: '女',
    department: '财务部',
    position: '财务主管',
    entryDate: '2023-08-20',
    status: '在职'
  },
  {
    id: 11,
    name: '陈十三',
    gender: '男',
    department: '科技部',
    position: '架构师',
    entryDate: '2023-05-10',
    status: '在职'
  },
  {
    id: 12,
    name: '褚十四',
    gender: '女',
    department: '资金部',
    position: '结算专员',
    entryDate: '2024-08-01',
    status: '在职'
  }
]

onMounted(() => {
  loadData()
})

const loadData = async () => {
  loading.value = true
  try {
    // 使用静态数据
    await new Promise(resolve => setTimeout(resolve, 300))
    tableData.value = mockData.slice(
        (pagination.page - 1) * pagination.pageSize,
        pagination.page * pagination.pageSize
    )
    pagination.total = mockData.length
  } catch (error) {
    console.error('加载数据失败:', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.page = 1
  loadData()
}

const handleReset = () => {
  searchForm.value = {
    name: '',
    department: ''
  }
  handleSearch()
}

const handleAdd = () => {
  dialogTitle.value = '新增档案'
  formData.value = {
    name: '',
    gender: '男',
    department: '',
    position: '',
    entryDate: ''
  }
  dialogVisible.value = true
}

const handleEdit = (row) => {
  dialogTitle.value = '编辑档案'
  formData.value = { ...row }
  dialogVisible.value = true
}

const handleView = (row) => {
  console.log('查看:', row)
  ElMessage.info(`查看 ${row.name} 的详细信息`)
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除该档案吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    const index = mockData.findIndex(item => item.id === row.id)
    if (index !== -1) {
      mockData.splice(index, 1)
      pagination.total = mockData.length
      loadData()
      ElMessage.success('删除成功')
    }
  } catch {
    // 取消删除
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      if (dialogTitle.value === '新增档案') {
        const newId = mockData.length > 0 ? Math.max(...mockData.map(item => item.id)) + 1 : 1
        mockData.push({
          id: newId,
          ...formData.value,
          entryDate: new Date(formData.value.entryDate).toISOString().split('T')[0],
          status: '在职'
        })
      } else {
        const index = mockData.findIndex(item => item.id === formData.value.id)
        if (index !== -1) {
          mockData[index] = {
            ...mockData[index],
            ...formData.value,
            entryDate: new Date(formData.value.entryDate).toISOString().split('T')[0]
          }
        }
      }
      pagination.total = mockData.length
      ElMessage.success('保存成功')
      dialogVisible.value = false
      loadData()
    }
  })
}

const handleSizeChange = () => {
  loadData()
}

const handlePageChange = () => {
  loadData()
}
</script>

<style lang="scss" scoped>
.staff-page {
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
