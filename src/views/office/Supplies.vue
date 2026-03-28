<template>
  <div class="supplies-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>用品申领</span>
          <el-button type="primary" @click="handleApply">
            <el-icon><Plus /></el-icon>
            申请领用
          </el-button>
        </div>
      </template>

      <el-table :data="tableData" v-loading="loading" border>
        <el-table-column prop="items" label="申领物品" min-width="200" />
        <el-table-column prop="quantity" label="数量" width="100" />
        <el-table-column prop="applicant" label="申请人" width="100" />
        <el-table-column prop="department" label="部门" width="120" />
        <el-table-column prop="applyTime" label="申请时间" width="180" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTag(row.status)">
              {{ row.statusText }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="200">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleView(row)">查看</el-button>
            <el-button link type="danger" @click="handleCancel(row)" v-if="row.status === 1">撤销</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px">
      <el-form :model="suppliesForm" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="物品类别" prop="category">
          <el-select v-model="suppliesForm.category" placeholder="请选择类别">
            <el-option label="办公用品" value="office" />
            <el-option label="生活用品" value="daily" />
            <el-option label="清洁用品" value="cleaning" />
          </el-select>
        </el-form-item>
        <el-form-item label="申领物品" prop="items">
          <el-select v-model="suppliesForm.items" multiple placeholder="请选择物品">
            <el-option label="A4 纸" value="paper" />
            <el-option label="签字笔" value="pen" />
            <el-option label="笔记本" value="notebook" />
            <el-option label="文件夹" value="folder" />
            <el-option label="订书机" value="stapler" />
          </el-select>
        </el-form-item>
        <el-form-item label="数量" prop="quantity">
          <el-input-number v-model="suppliesForm.quantity" :min="1" />
        </el-form-item>
        <el-form-item label="用途说明" prop="purpose">
          <el-input v-model="suppliesForm.purpose" type="textarea" :rows="3" placeholder="请输入用途说明" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="suppliesForm.remark" type="textarea" :rows="2" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

const loading = ref(false)
const tableData = ref([])
const dialogVisible = ref(false)
const dialogTitle = ref('申请领用')
const formRef = ref(null)

const suppliesForm = ref({
  category: '',
  items: [],
  quantity: 1,
  purpose: '',
  remark: ''
})

const rules = {
  category: [{ required: true, message: '请选择类别', trigger: 'change' }],
  items: [{ required: true, message: '请选择物品', trigger: 'change' }],
  quantity: [{ required: true, message: '请输入数量', trigger: 'blur' }]
}

onMounted(() => {
  loadData()
})

const loadData = () => {
  loading.value = true
  setTimeout(() => {
    tableData.value = [
      { id: 1, items: 'A4 纸、签字笔', quantity: 10, applicant: '张三', department: '技术部', applyTime: '2024-01-15 10:00', status: 2, statusText: '已发放' },
      { id: 2, items: '笔记本', quantity: 5, applicant: '李四', department: '人事部', applyTime: '2024-01-14 09:00', status: 2, statusText: '已发放' },
      { id: 3, items: '文件夹', quantity: 20, applicant: '王五', department: '财务部', applyTime: '2024-01-13 14:30', status: 1, statusText: '待审批' }
    ]
    loading.value = false
  }, 500)
}

const handleApply = () => {
  suppliesForm.value = { category: '', items: [], quantity: 1, purpose: '', remark: '' }
  dialogTitle.value = '申请领用'
  dialogVisible.value = true
}

const handleView = (row) => {
  ElMessage.info('查看申领详情')
}

const handleCancel = (row) => {
  ElMessage.success('已撤销申领申请')
  loadData()
}

const handleSubmit = () => {
  ElMessage.success('申领已提交')
  dialogVisible.value = false
  loadData()
}

const getStatusTag = (status) => {
  const types = { 1: 'warning', 2: 'success', 3: 'info' }
  return types[status] || 'info'
}
</script>

<style lang="scss" scoped>
.supplies-page {
  padding: 20px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
</style>
