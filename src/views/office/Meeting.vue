<template>
  <div class="meeting-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>会议管理</span>
          <el-button type="primary" @click="handleBook">
            <el-icon><Plus /></el-icon>
            预定会议
          </el-button>
        </div>
      </template>

      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="会议室">
          <el-select v-model="searchForm.room" placeholder="请选择会议室" clearable>
            <el-option label="第一会议室" value="room1" />
            <el-option label="第二会议室" value="room2" />
            <el-option label="第三会议室" value="room3" />
          </el-select>
        </el-form-item>
        <el-form-item label="日期">
          <el-date-picker
              v-model="searchForm.date"
              type="date"
              placeholder="选择日期"
              style="width: 180px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="tableData" v-loading="loading" border>
        <el-table-column prop="title" label="会议主题" min-width="200" />
        <el-table-column prop="room" label="会议室" width="120" />
        <el-table-column prop="organizer" label="组织者" width="100" />
        <el-table-column prop="startTime" label="开始时间" width="180" />
        <el-table-column prop="endTime" label="结束时间" width="180" />
        <el-table-column prop="participants" label="参会人数" width="100" />
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
            <el-button link type="danger" @click="handleCancel(row)" v-if="row.status === 1">取消</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="700px">
      <el-form :model="meetingForm" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="会议主题" prop="title">
          <el-input v-model="meetingForm.title" placeholder="请输入会议主题" />
        </el-form-item>
        <el-form-item label="会议室" prop="room">
          <el-select v-model="meetingForm.room" placeholder="请选择会议室">
            <el-option label="第一会议室" value="room1" />
            <el-option label="第二会议室" value="room2" />
            <el-option label="第三会议室" value="room3" />
          </el-select>
        </el-form-item>
        <el-form-item label="开始时间" prop="startTime">
          <el-date-picker
              v-model="meetingForm.startTime"
              type="datetime"
              placeholder="选择开始时间"
              style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="结束时间" prop="endTime">
          <el-date-picker
              v-model="meetingForm.endTime"
              type="datetime"
              placeholder="选择结束时间"
              style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="参会人员" prop="participants">
          <el-select v-model="meetingForm.participants" multiple placeholder="请选择人员">
            <el-option label="张三" value="张三" />
            <el-option label="李四" value="李四" />
            <el-option label="王五" value="王五" />
            <el-option label="赵六" value="赵六" />
          </el-select>
        </el-form-item>
        <el-form-item label="会议内容" prop="content">
          <el-input v-model="meetingForm.content" type="textarea" :rows="4" placeholder="请输入会议内容" />
        </el-form-item>
        <el-form-item label="会议设备">
          <el-checkbox-group v-model="meetingForm.equipment">
            <el-checkbox label="projector">投影仪</el-checkbox>
            <el-checkbox label="video">视频会议</el-checkbox>
            <el-checkbox label="audio">音响</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">预定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

const loading = ref(false)
const searchForm = ref({
  room: '',
  date: null
})

const tableData = ref([])
const dialogVisible = ref(false)
const dialogTitle = ref('预定会议')
const formRef = ref(null)

const meetingForm = ref({
  title: '',
  room: '',
  startTime: null,
  endTime: null,
  participants: [],
  content: '',
  equipment: []
})

const rules = {
  title: [{ required: true, message: '请输入会议主题', trigger: 'blur' }],
  room: [{ required: true, message: '请选择会议室', trigger: 'change' }],
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
      { id: 1, title: '项目进度汇报', room: '第一会议室', organizer: '张三', startTime: '2024-01-15 14:00', endTime: '2024-01-15 16:00', participants: 8, status: 1, statusText: '进行中' },
      { id: 2, title: '部门例会', room: '第二会议室', organizer: '李四', startTime: '2024-01-16 09:00', endTime: '2024-01-16 10:30', participants: 12, status: 1, statusText: '已预定' },
      { id: 3, title: '技术方案评审', room: '第三会议室', organizer: '王五', startTime: '2024-01-14 15:00', endTime: '2024-01-14 17:00', participants: 6, status: 3, statusText: '已结束' }
    ]
    loading.value = false
  }, 500)
}

const handleSearch = () => {
  loadData()
}

const handleReset = () => {
  searchForm.value = { room: '', date: null }
  loadData()
}

const handleBook = () => {
  meetingForm.value = { title: '', room: '', startTime: null, endTime: null, participants: [], content: '', equipment: [] }
  dialogTitle.value = '预定会议'
  dialogVisible.value = true
}

const handleView = (row) => {
  ElMessage.info('查看会议详情')
}

const handleCancel = (row) => {
  ElMessage.success('已取消会议')
  loadData()
}

const handleSubmit = () => {
  ElMessage.success('会议预定成功')
  dialogVisible.value = false
  loadData()
}

const getStatusTag = (status) => {
  const types = { 1: 'success', 2: 'warning', 3: 'info' }
  return types[status] || 'info'
}
</script>

<style lang="scss" scoped>
.meeting-page {
  padding: 20px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .search-form {
    margin-bottom: 20px;
  }
}
</style>
