<template>
  <div class="leave-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>请假休假</span>
          <el-button type="primary" @click="handleApply">
            <el-icon><Plus /></el-icon>
            申请请假
          </el-button>
        </div>
      </template>

      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="请假申请" name="application" />
        <el-tab-pane label="我的请假" name="myLeave" />
        <el-tab-pane label="年假统计" name="annualLeave" />
      </el-tabs>

      <el-table :data="tableData" v-loading="loading" border>
        <el-table-column prop="type" label="请假类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getTypeTag(row.type)">
              {{ row.typeName }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="reason" label="请假事由" min-width="200" />
        <el-table-column prop="startDate" label="开始时间" width="180" />
        <el-table-column prop="endDate" label="结束时间" width="180" />
        <el-table-column prop="days" label="天数" width="80" />
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
      <el-form :model="leaveForm" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="请假类型" prop="type">
          <el-select v-model="leaveForm.type" placeholder="请选择类型">
            <el-option label="事假" value="personal" />
            <el-option label="病假" value="sick" />
            <el-option label="年假" value="annual" />
            <el-option label="调休" value="compensatory" />
            <el-option label="婚假" value="marriage" />
            <el-option label="产假" value="maternity" />
          </el-select>
        </el-form-item>
        <el-form-item label="请假事由" prop="reason">
          <el-input v-model="leaveForm.reason" type="textarea" :rows="3" placeholder="请输入请假事由" />
        </el-form-item>
        <el-form-item label="开始时间" prop="startDate">
          <el-date-picker
              v-model="leaveForm.startDate"
              type="datetime"
              placeholder="选择开始时间"
              style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="结束时间" prop="endDate">
          <el-date-picker
              v-model="leaveForm.endDate"
              type="datetime"
              placeholder="选择结束时间"
              style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="请假天数" prop="days">
          <el-input-number v-model="leaveForm.days" :min="0.5" :step="0.5" />
        </el-form-item>
        <el-form-item label="工作交接" prop="handover">
          <el-input v-model="leaveForm.handover" type="textarea" :rows="3" placeholder="请输入工作交接事项" />
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
        <el-button type="primary" @click="handleSubmit">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Upload } from '@element-plus/icons-vue'

const loading = ref(false)
const activeTab = ref('application')
const tableData = ref([])
const dialogVisible = ref(false)
const dialogTitle = ref('申请请假')
const formRef = ref(null)

const leaveForm = ref({
  type: '',
  reason: '',
  startDate: null,
  endDate: null,
  days: 1,
  handover: ''
})

const rules = {
  type: [{ required: true, message: '请选择类型', trigger: 'change' }],
  reason: [{ required: true, message: '请输入请假事由', trigger: 'blur' }],
  startDate: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
  endDate: [{ required: true, message: '请选择结束时间', trigger: 'change' }]
}

onMounted(() => {
  loadData()
})

const loadData = () => {
  loading.value = true
  setTimeout(() => {
    tableData.value = [
      { id: 1, type: 'personal', typeName: '事假', reason: '家里有事', startDate: '2024-01-20 09:00', endDate: '2024-01-22 18:00', days: 3, status: 2, statusText: '已批准' },
      { id: 2, type: 'sick', typeName: '病假', reason: '身体不适', startDate: '2024-01-15 09:00', endDate: '2024-01-15 18:00', days: 1, status: 2, statusText: '已批准' },
      { id: 3, type: 'annual', typeName: '年假', reason: '年假休息', startDate: '2024-02-01 09:00', endDate: '2024-02-05 18:00', days: 5, status: 1, statusText: '待审批' }
    ]
    loading.value = false
  }, 500)
}

const handleTabChange = () => {
  loadData()
}

const handleApply = () => {
  leaveForm.value = { type: '', reason: '', startDate: null, endDate: null, days: 1, handover: '' }
  dialogTitle.value = '申请请假'
  dialogVisible.value = true
}

const handleView = (row) => {
  ElMessage.info('查看请假详情')
}

const handleCancel = (row) => {
  ElMessage.success('已撤销请假申请')
  loadData()
}

const handleSubmit = () => {
  ElMessage.success('请假申请已提交')
  dialogVisible.value = false
  loadData()
}

const getTypeTag = (type) => {
  const types = { personal: 'info', sick: 'warning', annual: 'success', compensatory: 'primary', marriage: 'danger', maternity: 'success' }
  return types[type] || 'info'
}

const getStatusTag = (status) => {
  const types = { 1: 'warning', 2: 'success', 3: 'danger', 4: 'info' }
  return types[status] || 'info'
}
</script>

<style lang="scss" scoped>
.leave-page {
  padding: 20px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
</style>
