<template>
  <div class="document-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>公文管理</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新建公文
          </el-button>
        </div>
      </template>

      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="待办公文" name="pending" />
        <el-tab-pane label="已办公文" name="processed" />
        <el-tab-pane label="我的发文" name="sent" />
        <el-tab-pane label="公文归档" name="archived" />
      </el-tabs>

      <el-table :data="tableData" v-loading="loading" border>
        <el-table-column prop="docNumber" label="文号" width="150" />
        <el-table-column prop="title" label="标题" min-width="300" />
        <el-table-column prop="type" label="公文类型" width="120" />
        <el-table-column prop="department" label="部门" width="120" />
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ row.statusText }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="250">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleView(row)">查看</el-button>
            <el-button link type="primary" @click="handleProcess(row)" v-if="activeTab === 'pending'">办理</el-button>
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

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="900px">
      <el-form :model="formData" :rules="rules" ref="formRef" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="公文标题" prop="title">
              <el-input v-model="formData.title" placeholder="请输入公文标题" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="公文类型" prop="type">
              <el-select v-model="formData.type" placeholder="请选择公文类型">
                <el-option label="通知" value="notice" />
                <el-option label="通报" value="bulletin" />
                <el-option label="报告" value="report" />
                <el-option label="请示" value="request" />
                <el-option label="批复" value="reply" />
                <el-option label="函" value="letter" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="发文单位" prop="department">
              <el-select v-model="formData.department" placeholder="请选择部门">
                <el-option label="办公室" value="办公室" />
                <el-option label="科技部" value="科技部" />
                <el-option label="资金部" value="资金部" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="紧急程度" prop="urgency">
              <el-radio-group v-model="formData.urgency">
                <el-radio label="normal">普通</el-radio>
                <el-radio label="urgent">紧急</el-radio>
                <el-radio label="veryUrgent">特急</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="主送单位" prop="mainSend">
          <el-select v-model="formData.mainSend" multiple placeholder="请选择主送单位">
            <el-option label="各部门" value="all" />
            <el-option label="科技部" value="tech" />
            <el-option label="资金部" value="hr" />
          </el-select>
        </el-form-item>

        <el-form-item label="抄送单位" prop="copySend">
          <el-select v-model="formData.copySend" multiple placeholder="请选择抄送单位">
            <el-option label="公司领导" value="leaders" />
            <el-option label="各部门负责人" value="managers" />
          </el-select>
        </el-form-item>

        <el-form-item label="公文内容" prop="content">
          <el-input v-model="formData.content" type="textarea" :rows="10" placeholder="请输入公文内容" />
        </el-form-item>

        <el-form-item label="附件">
          <el-upload
              action="#"
              :auto-upload="false"
              :limit="5"
              multiple
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
const activeTab = ref('pending')
const tableData = ref([])
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const dialogVisible = ref(false)
const dialogTitle = ref('新建公文')
const formRef = ref(null)

const formData = ref({
  id: null,
  docNumber: '',
  title: '',
  type: '',
  department: '',
  urgency: 'normal',
  mainSend: [],
  copySend: [],
  content: '',
  status: 1
})

const rules = {
  title: [{ required: true, message: '请输入公文标题', trigger: 'blur' }],
  type: [{ required: true, message: '请选择公文类型', trigger: 'change' }],
  department: [{ required: true, message: '请选择发文单位', trigger: 'change' }]
}

const statusMap = {
  pending: { text: '待办理', type: 'warning' },
  processed: { text: '已办理', type: 'success' },
  sent: { text: '已发送', type: 'primary' },
  archived: { text: '已归档', type: 'info' }
}

onMounted(() => {
  loadData()
})

const loadData = () => {
  loading.value = true
  setTimeout(() => {
    tableData.value = [
      { id: 1, docNumber: '公司发〔2026〕1 号', title: '关于 2026 年工作安排的通知', type: '通知', department: '办公室', createTime: '2026-01-15 10:00', status: 1, statusText: '待办理' },
      { id: 2, docNumber: '公司发〔2026〕2 号', title: '第一季度工作报告', type: '报告', department: '科技部', createTime: '2026-01-14 09:00', status: 1, statusText: '已办理' }
    ]
    pagination.total = tableData.value.length
    loading.value = false
  }, 500)
}

const handleTabChange = () => {
  loadData()
}

const handleAdd = () => {
  dialogTitle.value = '新建公文'
  formData.value = { id: null, docNumber: '', title: '', type: '', department: '', urgency: 'normal', mainSend: [], copySend: [], content: '', status: 1 }
  dialogVisible.value = true
}

const handleView = (row) => {
  ElMessage.info('查看公文详情')
}

const handleProcess = (row) => {
  ElMessage.info('办理公文功能开发中')
}

const handleDelete = (row) => {
  ElMessage.success('删除成功')
  loadData()
}

const handleSubmit = () => {
  ElMessage.success('公文创建成功')
  dialogVisible.value = false
  loadData()
}

const getStatusType = (status) => {
  const types = { 1: 'warning', 2: 'success', 3: 'primary', 4: 'info' }
  return types[status] || 'info'
}
</script>

<style lang="scss" scoped>
.document-page {
  padding: 20px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .pagination {
    margin-top: 20px;
    justify-content: flex-end;
  }
}
</style>
