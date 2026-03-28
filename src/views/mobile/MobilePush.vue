<template>
  <div class="mobile-push-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>消息推送</span>
          <el-button type="primary" @click="handleCreate">
            <el-icon><Plus /></el-icon>
            创建推送
          </el-button>
        </div>
      </template>

      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="推送类型">
          <el-select v-model="searchForm.type" placeholder="请选择类型" clearable>
            <el-option label="系统通知" value="system" />
            <el-option label="审批提醒" value="approval" />
            <el-option label="会议通知" value="meeting" />
            <el-option label="考勤提醒" value="attendance" />
          </el-select>
        </el-form-item>
        <el-form-item label="推送状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="待推送" value="pending" />
            <el-option label="推送中" value="sending" />
            <el-option label="已推送" value="sent" />
            <el-option label="推送失败" value="failed" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="tableData" v-loading="loading" border>
        <el-table-column prop="title" label="推送标题" min-width="250" />
        <el-table-column prop="type" label="类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getTypeTag(row.type)">
              {{ row.typeName }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="target" label="推送对象" width="120" />
        <el-table-column prop="pushTime" label="推送时间" width="180" />
        <el-table-column prop="sentCount" label="已送达" width="100" />
        <el-table-column prop="readCount" label="已阅读" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTag(row.status)">
              {{ row.statusText }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="220">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleView(row)">查看</el-button>
            <el-button link type="primary" @click="handleResend(row)" v-if="row.status === 4">重推</el-button>
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

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="700px">
      <el-form :model="pushForm" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="推送标题" prop="title">
          <el-input v-model="pushForm.title" placeholder="请输入推送标题" />
        </el-form-item>
        <el-form-item label="推送类型" prop="type">
          <el-select v-model="pushForm.type" placeholder="请选择类型">
            <el-option label="系统通知" value="system" />
            <el-option label="审批提醒" value="approval" />
            <el-option label="会议通知" value="meeting" />
            <el-option label="考勤提醒" value="attendance" />
          </el-select>
        </el-form-item>
        <el-form-item label="推送对象" prop="target">
          <el-select v-model="pushForm.target" placeholder="请选择推送对象">
            <el-option label="全体员工" value="all" />
            <el-option label="管理层" value="manager" />
            <el-option label="指定人员" value="specific" />
          </el-select>
        </el-form-item>
        <el-form-item label="指定人员" prop="users" v-if="pushForm.target === 'specific'">
          <el-select v-model="pushForm.users" multiple placeholder="请选择人员">
            <el-option label="张三" value="张三" />
            <el-option label="李四" value="李四" />
            <el-option label="王五" value="王五" />
          </el-select>
        </el-form-item>
        <el-form-item label="推送内容" prop="content">
          <el-input v-model="pushForm.content" type="textarea" :rows="6" placeholder="请输入推送内容" />
        </el-form-item>
        <el-form-item label="跳转链接" prop="link">
          <el-input v-model="pushForm.link" placeholder="请输入点击推送后的跳转链接" />
        </el-form-item>
        <el-form-item label="定时推送" prop="scheduled">
          <el-switch v-model="pushForm.scheduled" />
        </el-form-item>
        <el-form-item label="推送时间" prop="pushTime" v-if="pushForm.scheduled">
          <el-date-picker
              v-model="pushForm.pushTime"
              type="datetime"
              placeholder="选择推送时间"
              style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="viewVisible" title="推送详情" width="600px">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="推送标题">{{ currentPush.title }}</el-descriptions-item>
        <el-descriptions-item label="推送类型">{{ currentPush.typeName }}</el-descriptions-item>
        <el-descriptions-item label="推送对象">{{ currentPush.targetName }}</el-descriptions-item>
        <el-descriptions-item label="推送时间">{{ currentPush.pushTime }}</el-descriptions-item>
        <el-descriptions-item label="推送内容">{{ currentPush.content }}</el-descriptions-item>
        <el-descriptions-item label="统计数据">
          <el-progress :percentage="currentPush.readRate" :format="formatReadRate" />
          <p>已推送：{{ currentPush.sentCount }} | 已阅读：{{ currentPush.readCount }}</p>
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusTag(currentPush.status)">
            {{ currentPush.statusText }}
          </el-tag>
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="viewVisible = false">关闭</el-button>
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
  type: '',
  status: ''
})

const tableData = ref([])
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const dialogVisible = ref(false)
const viewVisible = ref(false)
const dialogTitle = ref('创建推送')
const formRef = ref(null)
const currentPush = ref({})

const pushForm = ref({
  title: '',
  type: '',
  target: 'all',
  users: [],
  content: '',
  link: '',
  scheduled: false,
  pushTime: null
})

const rules = {
  title: [{ required: true, message: '请输入推送标题', trigger: 'blur' }],
  type: [{ required: true, message: '请选择类型', trigger: 'change' }],
  content: [{ required: true, message: '请输入推送内容', trigger: 'blur' }]
}

const typeNames = {
  system: '系统通知',
  approval: '审批提醒',
  meeting: '会议通知',
  attendance: '考勤提醒'
}

onMounted(() => {
  loadData()
})

const loadData = () => {
  loading.value = true
  setTimeout(() => {
    tableData.value = [
      { id: 1, title: '关于 2024 年春节放假的通知', type: 'system', typeName: '系统通知', target: '全体员工', pushTime: '2024-01-15 10:00', sentCount: 1256, readCount: 890, status: 3, statusText: '已推送' },
      { id: 2, title: '您有待审批事项', type: 'approval', typeName: '审批提醒', target: '管理层', pushTime: '2024-01-14 09:00', sentCount: 50, readCount: 45, status: 3, statusText: '已推送' },
      { id: 3, title: '会议通知', type: 'meeting', typeName: '会议通知', target: '指定人员', pushTime: '2024-01-13 14:30', sentCount: 10, readCount: 8, status: 3, statusText: '已推送' }
    ]
    pagination.total = tableData.value.length
    loading.value = false
  }, 500)
}

const handleSearch = () => {
  loadData()
}

const handleReset = () => {
  searchForm.value = { type: '', status: '' }
  loadData()
}

const handleCreate = () => {
  pushForm.value = { title: '', type: '', target: 'all', users: [], content: '', link: '', scheduled: false, pushTime: null }
  dialogTitle.value = '创建推送'
  dialogVisible.value = true
}

const handleView = (row) => {
  currentPush.value = {
    ...row,
    readRate: Math.round((row.readCount / row.sentCount) * 100)
  }
  viewVisible.value = true
}

const handleResend = (row) => {
  ElMessage.success('重新推送成功')
  loadData()
}

const handleDelete = (row) => {
  tableData.value = tableData.value.filter(m => m.id !== row.id)
  pagination.total--
  ElMessage.success('删除成功')
}

const handleSubmit = () => {
  ElMessage.success('推送创建成功')
  dialogVisible.value = false
  loadData()
}

const formatReadRate = (percentage) => {
  return `${percentage}%`
}

const getTypeTag = (type) => {
  const types = { system: 'info', approval: 'warning', meeting: 'primary', attendance: 'success' }
  return types[type] || 'info'
}

const getStatusTag = (status) => {
  const types = { 1: 'info', 2: 'warning', 3: 'success', 4: 'danger' }
  return types[status] || 'info'
}
</script>

<style lang="scss" scoped>
.mobile-push-page {
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
