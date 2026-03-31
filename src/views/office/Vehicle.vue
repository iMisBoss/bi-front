<template>
  <div class="vehicle-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>车辆申请</span>
          <el-button type="primary" @click="handleApply">
            <el-icon><Plus /></el-icon>
            申请用车
          </el-button>
        </div>
      </template>

      <el-table :data="tableData" v-loading="loading" border>
        <el-table-column prop="purpose" label="用车事由" min-width="200" />
        <el-table-column prop="car" label="车辆" width="150" />
        <el-table-column prop="driver" label="司机" width="100" />
        <el-table-column prop="startTime" label="开始时间" width="180" />
        <el-table-column prop="endTime" label="结束时间" width="180" />
        <el-table-column prop="destination" label="目的地" width="150" />
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
      <el-form :model="vehicleForm" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="用车事由" prop="purpose">
          <el-input v-model="vehicleForm.purpose" placeholder="请输入用车事由" />
        </el-form-item>
        <el-form-item label="用车类型" prop="type">
          <el-select v-model="vehicleForm.type" placeholder="请选择类型">
            <el-option label="公务出行" value="business" />
            <el-option label="客户接待" value="reception" />
            <el-option label="会议活动" value="meeting" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="目的地" prop="destination">
          <el-input v-model="vehicleForm.destination" placeholder="请输入目的地" />
        </el-form-item>
        <el-form-item label="开始时间" prop="startTime">
          <el-date-picker
              v-model="vehicleForm.startTime"
              type="datetime"
              placeholder="选择开始时间"
              style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="结束时间" prop="endTime">
          <el-date-picker
              v-model="vehicleForm.endTime"
              type="datetime"
              placeholder="选择结束时间"
              style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="乘车人数" prop="passengers">
          <el-input-number v-model="vehicleForm.passengers" :min="1" :max="50" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="vehicleForm.remark" type="textarea" :rows="3" placeholder="请输入备注" />
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
const dialogTitle = ref('申请用车')
const formRef = ref(null)

const vehicleForm = ref({
  purpose: '',
  type: '',
  destination: '',
  startTime: null,
  endTime: null,
  passengers: 1,
  remark: ''
})

const rules = {
  purpose: [{ required: true, message: '请输入用车事由', trigger: 'blur' }],
  type: [{ required: true, message: '请选择类型', trigger: 'change' }],
  destination: [{ required: true, message: '请输入目的地', trigger: 'blur' }],
  startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
  endTime: [{ required: true, message: '请选择结束时间', trigger: 'change' }]
}

onMounted(() => {
  loadData()
})

const loadData = () => {
  loading.value = true
  setTimeout(() => {
    tableData.value = [
      { id: 1, purpose: '拜访客户', car: '京 A·12345', driver: '张师傅', startTime: '2026-01-15 09:00', endTime: '2026-01-15 17:00', destination: '北京市朝阳区', status: 2, statusText: '已完成' },
      { id: 2, purpose: '参加会议', car: '京 A·67890', driver: '李师傅', startTime: '2026-01-16 08:00', endTime: '2026-01-16 18:00', destination: '北京市海淀区', status: 1, statusText: '已批准' },
      { id: 3, purpose: '公务出行', car: '京 A·11111', driver: '王师傅', startTime: '2026-01-17 10:00', endTime: '2026-01-17 15:00', destination: '北京市东城区', status: 1, statusText: '待审批' }
    ]
    loading.value = false
  }, 500)
}

const handleApply = () => {
  vehicleForm.value = { purpose: '', type: '', destination: '', startTime: null, endTime: null, passengers: 1, remark: '' }
  dialogTitle.value = '申请用车'
  dialogVisible.value = true
}

const handleView = (row) => {
  ElMessage.info('查看用车详情')
}

const handleCancel = (row) => {
  ElMessage.success('已撤销用车申请')
  loadData()
}

const handleSubmit = () => {
  ElMessage.success('用车申请已提交')
  dialogVisible.value = false
  loadData()
}

const getStatusTag = (status) => {
  const types = { 1: 'warning', 2: 'success', 3: 'info' }
  return types[status] || 'info'
}
</script>

<style lang="scss" scoped>
.vehicle-page {
  padding: 20px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
</style>
