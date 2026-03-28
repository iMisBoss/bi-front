<template>
  <div class="seal-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>用印申请</span>
          <el-button type="primary" @click="handleApply">
            <el-icon><Plus /></el-icon>
            申请用印
          </el-button>
        </div>
      </template>

      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="我的申请" name="my" />
        <el-tab-pane label="待审批" name="pending" />
        <el-tab-pane label="全部记录" name="all" />
      </el-tabs>

      <el-table :data="tableData" v-loading="loading" border>
        <el-table-column prop="sealType" label="印章类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getTypeTag(row.sealType)">
              {{ row.sealTypeName }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="purpose" label="用印事由" min-width="200" />
        <el-table-column prop="fileCount" label="文件数量" width="100" />
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
        <el-table-column label="操作" fixed="right" width="250">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleView(row)">查看</el-button>
            <el-button link type="primary" @click="handleApprove(row)" v-if="activeTab === 'pending'">审批</el-button>
            <el-button link type="danger" @click="handleCancel(row)" v-if="row.status === 1">撤销</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="700px">
      <el-form :model="sealForm" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="印章类型" prop="sealType">
          <el-select v-model="sealForm.sealType" placeholder="请选择类型">
            <el-option label="公章" value="official" />
            <el-option label="合同章" value="contract" />
            <el-option label="财务章" value="finance" />
            <el-option label="法人章" value="legal" />
            <el-option label="发票章" value="invoice" />
          </el-select>
        </el-form-item>
        <el-form-item label="用印事由" prop="purpose">
          <el-input v-model="sealForm.purpose" type="textarea" :rows="3" placeholder="请输入用印事由" />
        </el-form-item>
        <el-form-item label="文件名称" prop="fileName">
          <el-input v-model="sealForm.fileName" placeholder="请输入文件名称" />
        </el-form-item>
        <el-form-item label="文件数量" prop="fileCount">
          <el-input-number v-model="sealForm.fileCount" :min="1" />
        </el-form-item>
        <el-form-item label="用印时间" prop="sealTime">
          <el-date-picker
              v-model="sealForm.sealTime"
              type="datetime"
              placeholder="选择用印时间"
              style="width: 100%"
          />
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
              上传文件
            </el-button>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">提交</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="approveVisible" title="用印审批" width="600px">
      <el-form :model="approveForm" label-width="100px">
        <el-form-item label="审批意见">
          <el-radio-group v-model="approveForm.result">
            <el-radio label="agree">同意</el-radio>
            <el-radio label="reject">拒绝</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="approveForm.comment" type="textarea" :rows="3" placeholder="请输入审批意见" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="approveVisible = false">取消</el-button>
        <el-button type="primary" @click="handleApproveSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Upload } from '@element-plus/icons-vue'

const loading = ref(false)
const activeTab = ref('my')
const tableData = ref([])
const dialogVisible = ref(false)
const approveVisible = ref(false)
const dialogTitle = ref('申请用印')
const formRef = ref(null)

const sealForm = ref({
  sealType: '',
  purpose: '',
  fileName: '',
  fileCount: 1,
  sealTime: null
})

const approveForm = ref({
  result: 'agree',
  comment: ''
})

const rules = {
  sealType: [{ required: true, message: '请选择类型', trigger: 'change' }],
  purpose: [{ required: true, message: '请输入用印事由', trigger: 'blur' }],
  fileName: [{ required: true, message: '请输入文件名称', trigger: 'blur' }],
  sealTime: [{ required: true, message: '请选择用印时间', trigger: 'change' }]
}

onMounted(() => {
  loadData()
})

const loadData = () => {
  loading.value = true
  setTimeout(() => {
    tableData.value = [
      { id: 1, sealType: 'official', sealTypeName: '公章', purpose: '签订合同', fileName: '业务合同.pdf', fileCount: 3, applicant: '张三', department: '技术部', applyTime: '2024-01-15 10:00', status: 2, statusText: '已批准' },
      { id: 2, sealType: 'contract', sealTypeName: '合同章', purpose: '合作协议盖章', fileName: '合作协议.pdf', fileCount: 2, applicant: '李四', department: '市场部', applyTime: '2024-01-14 09:00', status: 1, statusText: '待审批' },
      { id: 3, sealType: 'finance', sealTypeName: '财务章', purpose: '财务报表', fileName: '财务报表.xlsx', fileCount: 1, applicant: '王五', department: '财务部', applyTime: '2024-01-13 14:30', status: 2, statusText: '已批准' }
    ]
    loading.value = false
  }, 500)
}

const handleTabChange = () => {
  loadData()
}

const handleApply = () => {
  sealForm.value = { sealType: '', purpose: '', fileName: '', fileCount: 1, sealTime: null }
  dialogTitle.value = '申请用印'
  dialogVisible.value = true
}

const handleView = (row) => {
  ElMessage.info('查看用印详情')
}

const handleApprove = (row) => {
  approveForm.value = { result: 'agree', comment: '' }
  approveVisible.value = true
}

const handleCancel = (row) => {
  ElMessage.success('已撤销用印申请')
  loadData()
}

const handleSubmit = () => {
  ElMessage.success('用印申请已提交')
  dialogVisible.value = false
  loadData()
}

const handleApproveSubmit = () => {
  ElMessage.success('审批完成')
  approveVisible.value = false
  loadData()
}

const getTypeTag = (type) => {
  const types = { official: 'primary', contract: 'success', finance: 'warning', legal: 'danger', invoice: 'info' }
  return types[type] || 'info'
}

const getStatusTag = (status) => {
  const types = { 1: 'warning', 2: 'success', 3: 'danger', 4: 'info' }
  return types[status] || 'info'
}
</script>

<style lang="scss" scoped>
.seal-page {
  padding: 20px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
</style>
