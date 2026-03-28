<template>
  <div class="supervise-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>超时督办</span>
        </div>
      </template>

      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="待督办" name="pending" />
        <el-tab-pane label="已督办" name="supervised" />
      </el-tabs>

      <el-table :data="tableData" v-loading="loading" border>
        <el-table-column prop="processName" label="流程名称" min-width="250" />
        <el-table-column prop="processNo" label="流程编号" width="150" />
        <el-table-column prop="currentNode" label="当前节点" width="150" />
        <el-table-column prop="handler" label="当前处理人" width="100" />
        <el-table-column prop="stayTime" label="停留时长" width="120">
          <template #default="{ row }">
            <el-tag :type="getUrgencyTag(row.stayHours)">
              {{ row.stayTime }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="limitTime" label="规定时限" width="120" />
        <el-table-column prop="overTime" label="超时时长" width="120">
          <template #default="{ row }">
            <span :style="{ color: row.overHours > 0 ? '#f56c6c' : '#606266' }">
              {{ row.overTimeText }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="200">
          <template #default="{ row }">
            <el-button link type="warning" @click="handleSupervise(row)" v-if="activeTab === 'pending'">督办</el-button>
            <el-button link type="primary" @click="handleView(row)">查看</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="superviseVisible" title="发送督办" width="500px">
      <el-form :model="superviseForm" label-width="100px">
        <el-form-item label="督办对象">
          <el-input v-model="superviseForm.handler" disabled />
        </el-form-item>
        <el-form-item label="督办内容">
          <el-input v-model="superviseForm.content" type="textarea" :rows="4" placeholder="请输入督办内容" />
        </el-form-item>
        <el-form-item label="要求完成时间">
          <el-date-picker
              v-model="superviseForm.deadline"
              type="datetime"
              placeholder="选择时间"
              style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="superviseVisible = false">取消</el-button>
        <el-button type="warning" @click="handleSuperviseSubmit">发送督办</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

const loading = ref(false)
const activeTab = ref('pending')
const tableData = ref([])
const superviseVisible = ref(false)
const superviseForm = ref({
  handler: '',
  content: '',
  deadline: null
})

onMounted(() => {
  loadData()
})

const loadData = () => {
  loading.value = true
  setTimeout(() => {
    tableData.value = [
      { id: 1, processName: '请假审批流程', processNo: 'PROC-2024-001', currentNode: '部门经理审批', handler: '李四', stayTime: '2 天 3 小时', stayHours: 51, limitTime: '24 小时', overTime: '1 天 3 小时', overHours: 27, status: 1 },
      { id: 2, processName: '用车申请流程', processNo: 'PROC-2024-002', currentNode: '行政审批', handler: '王五', stayTime: '5 小时', stayHours: 5, limitTime: '24 小时', overTime: '未超时', overHours: 0, status: 1 },
      { id: 3, processName: '会议预定流程', processNo: 'PROC-2024-003', currentNode: '已完成', handler: '赵六', stayTime: '1 天', stayHours: 24, limitTime: '12 小时', overTime: '12 小时', overHours: 12, status: 2 }
    ]
    loading.value = false
  }, 500)
}

const handleTabChange = () => {
  loadData()
}

const handleView = (row) => {
  ElMessage.info('查看流程详情')
}

const handleSupervise = (row) => {
  superviseForm.value = {
    handler: row.handler,
    content: `您有待处理事项：${row.processName}，请及时处理。`,
    deadline: null
  }
  superviseVisible.value = true
}

const handleSuperviseSubmit = () => {
  ElMessage.success('督办通知已发送')
  superviseVisible.value = false
  loadData()
}

const getUrgencyTag = (hours) => {
  if (hours > 48) return 'danger'
  if (hours > 24) return 'warning'
  return 'info'
}
</script>

<style lang="scss" scoped>
.supervise-page {
  padding: 20px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
</style>
