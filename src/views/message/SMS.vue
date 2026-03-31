<template>
  <div class="sms-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>短信通知</span>
          <el-button type="primary" @click="handleSend">
            <el-icon><Promotion /></el-icon>
            发送短信
          </el-button>
        </div>
      </template>

      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="手机号">
          <el-input v-model="searchForm.phone" placeholder="请输入手机号" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="发送成功" value="success" />
            <el-option label="发送失败" value="failed" />
            <el-option label="发送中" value="sending" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="tableData" v-loading="loading" border>
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column prop="content" label="短信内容" min-width="400" show-overflow-tooltip />
        <el-table-column prop="sender" label="发送人" width="100" />
        <el-table-column prop="sendTime" label="发送时间" width="180" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTag(row.status)">
              {{ row.statusText }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="150">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleView(row)">查看</el-button>
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

    <el-dialog v-model="sendVisible" title="发送短信" width="600px">
      <el-form :model="smsForm" :rules="rules" ref="formRef" label-width="80px">
        <el-form-item label="接收号码" prop="phone">
          <el-input v-model="smsForm.phone" placeholder="请输入手机号，多个号码用逗号分隔" />
        </el-form-item>
        <el-form-item label="短信模板" prop="template">
          <el-select v-model="smsForm.template" placeholder="请选择模板" @change="handleTemplateChange">
            <el-option label="会议通知" value="meeting" />
            <el-option label="请假审批" value="leave" />
            <el-option label="系统提醒" value="system" />
            <el-option label="自定义" value="custom" />
          </el-select>
        </el-form-item>
        <el-form-item label="短信内容" prop="content">
          <el-input
              v-model="smsForm.content"
              type="textarea"
              :rows="6"
              placeholder="请输入短信内容"
              maxlength="500"
              show-word-limit
          />
        </el-form-item>
        <el-alert
            title="短信计费说明"
            type="info"
            :closable="false"
            style="margin-top: 10px"
        >
          70 字以内为 1 条，超过 70 字每 67 字为 1 条
        </el-alert>
      </el-form>
      <template #footer>
        <el-button @click="sendVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSendSubmit">发送</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Promotion } from '@element-plus/icons-vue'

const loading = ref(false)
const searchForm = ref({
  phone: '',
  status: ''
})

const tableData = ref([])
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const sendVisible = ref(false)
const formRef = ref(null)

const smsForm = ref({
  phone: '',
  template: '',
  content: ''
})

const rules = {
  phone: [{ required: true, message: '请输入手机号', trigger: 'blur' }],
  content: [
    { required: true, message: '请输入短信内容', trigger: 'blur' },
    { min: 1, max: 500, message: '长度在 1 到 500 个字符', trigger: 'blur' }
  ]
}

const smsTemplates = {
  meeting: '【会议通知】您好，请于{time}在{location}参加会议，请准时出席。',
  leave: '【请假审批】您的请假申请已提交，请假时间：{date}，请等待审批。',
  system: '【系统提醒】{content}，请及时处理。'
}

onMounted(() => {
  loadData()
})

const loadData = () => {
  loading.value = true
  setTimeout(() => {
    tableData.value = [
      { id: 1, phone: '138****1234', content: '【会议通知】您好，请于明天上午 9 点在公司会议室参加会议，请准时出席。', sender: '张三', sendTime: '2026-01-15 10:00', status: 'success', statusText: '发送成功' },
      { id: 2, phone: '139****5678', content: '【系统提醒】您有待办事项需要处理，请及时登录系统查看。', sender: '系统', sendTime: '2026-01-14 09:00', status: 'success', statusText: '发送成功' },
      { id: 3, phone: '137****9012', content: '测试短信内容', sender: '李四', sendTime: '2026-01-13 14:30', status: 'failed', statusText: '发送失败' }
    ]
    pagination.total = tableData.value.length
    loading.value = false
  }, 500)
}

const handleSearch = () => {
  loadData()
}

const handleReset = () => {
  searchForm.value = { phone: '', status: '' }
  loadData()
}

const handleSend = () => {
  smsForm.value = { phone: '', template: '', content: '' }
  sendVisible.value = true
}

const handleTemplateChange = (value) => {
  if (smsTemplates[value]) {
    smsForm.value.content = smsTemplates[value]
  }
}

const handleView = (row) => {
  ElMessage.info('查看短信详情')
}

const handleDelete = (row) => {
  tableData.value = tableData.value.filter(m => m.id !== row.id)
  pagination.total--
  ElMessage.success('删除成功')
}

const handleSendSubmit = () => {
  ElMessage.success('发送成功')
  sendVisible.value = false
  loadData()
}

const getStatusTag = (status) => {
  const types = { success: 'success', failed: 'danger', sending: 'warning' }
  return types[status] || 'info'
}
</script>

<style lang="scss" scoped>
.sms-page {
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
