<template>
  <div class="station-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>站内消息</span>
          <div class="header-actions">
            <el-button type="primary" @click="handleSend">
              <el-icon><Edit /></el-icon>
              发消息
            </el-button>
            <el-button @click="handleReadAll" :disabled="!hasUnread">
              <el-icon><Select /></el-icon>
              全部已读
            </el-button>
            <el-button @click="handleDeleteAll">
              <el-icon><Delete /></el-icon>
              清空
            </el-button>
          </div>
        </div>
      </template>

      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="全部消息" name="all">
          <span class="tab-badge">{{ totalCount }}</span>
        </el-tab-pane>
        <el-tab-pane label="未读消息" name="unread">
          <span class="tab-badge">{{ unreadCount }}</span>
        </el-tab-pane>
        <el-tab-pane label="已读消息" name="read" />
      </el-tabs>

      <el-table :data="tableData" v-loading="loading" border>
        <el-table-column prop="title" label="标题" min-width="300">
          <template #default="{ row }">
            <el-icon v-if="!row.isRead" :size="16" color="#f56c6c"><BellFilled /></el-icon>
            <span :class="{ 'unread-title': !row.isRead }">{{ row.title }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="sender" label="发送人" width="100" />
        <el-table-column prop="sendTime" label="发送时间" width="180" />
        <el-table-column prop="type" label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="getTypeTag(row.type)" size="small">
              {{ row.typeName }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="200">
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

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px">
      <div class="message-content">
        <div class="message-header">
          <div class="message-title">{{ currentMessage.title }}</div>
          <div class="message-meta">
            <span>发送人：{{ currentMessage.sender }}</span>
            <span>时间：{{ currentMessage.sendTime }}</span>
          </div>
        </div>
        <el-divider />
        <div class="message-body">
          {{ currentMessage.content }}
        </div>
      </div>
      <template #footer>
        <el-button @click="dialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="handleReply">回复</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="sendVisible" title="发送消息" width="600px">
      <el-form :model="sendForm" :rules="rules" ref="formRef" label-width="80px">
        <el-form-item label="收件人" prop="receiver">
          <el-select v-model="sendForm.receiver" placeholder="请选择收件人" multiple>
            <el-option label="张三" value="张三" />
            <el-option label="李四" value="李四" />
            <el-option label="王五" value="王五" />
          </el-select>
        </el-form-item>
        <el-form-item label="消息类型" prop="type">
          <el-select v-model="sendForm.type" placeholder="请选择类型">
            <el-option label="通知" value="notice" />
            <el-option label="提醒" value="remind" />
            <el-option label="普通" value="normal" />
          </el-select>
        </el-form-item>
        <el-form-item label="消息标题" prop="title">
          <el-input v-model="sendForm.title" placeholder="请输入标题" />
        </el-form-item>
        <el-form-item label="消息内容" prop="content">
          <el-input v-model="sendForm.content" type="textarea" :rows="6" placeholder="请输入内容" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="sendVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSendSubmit">发送</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Edit, Select, Delete, BellFilled } from '@element-plus/icons-vue'

const loading = ref(false)
const activeTab = ref('all')
const tableData = ref([])
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const dialogVisible = ref(false)
const sendVisible = ref(false)
const dialogTitle = ref('消息详情')
const formRef = ref(null)
const currentMessage = ref({})

const sendForm = ref({
  receiver: [],
  type: 'normal',
  title: '',
  content: ''
})

const rules = {
  receiver: [{ required: true, message: '请选择收件人', trigger: 'change' }],
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  content: [{ required: true, message: '请输入内容', trigger: 'blur' }]
}

const totalCount = computed(() => pagination.total)
const unreadCount = computed(() => tableData.value.filter(m => !m.isRead).length)
const hasUnread = computed(() => unreadCount.value > 0)

onMounted(() => {
  loadData()
})

const loadData = () => {
  loading.value = true
  setTimeout(() => {
    tableData.value = [
      { id: 1, title: '关于 2026 年春节放假的通知', sender: '办公室', sendTime: '2026-01-15 10:00', type: 'notice', typeName: '通知', isRead: false, content: '根据公司安排，2026 年春节放假时间为...' },
      { id: 2, title: '系统升级维护通知', sender: '科技部', sendTime: '2026-01-14 09:00', type: 'remind', typeName: '提醒', isRead: false, content: '系统将于本周末进行升级维护...' },
      { id: 3, title: '会议通知', sender: '资金部', sendTime: '2026-01-13 14:30', type: 'normal', typeName: '普通', isRead: true, content: '请于明天上午 9 点参加月度工作会议...' }
    ]
    pagination.total = tableData.value.length
    loading.value = false
  }, 500)
}

const handleTabChange = () => {
  loadData()
}

const handleSend = () => {
  sendForm.value = { receiver: [], type: 'normal', title: '', content: '' }
  sendVisible.value = true
}

const handleReadAll = () => {
  tableData.value.forEach(m => m.isRead = true)
  ElMessage.success('已全部标记为已读')
}

const handleDeleteAll = () => {
  tableData.value = []
  pagination.total = 0
  ElMessage.success('已清空所有消息')
}

const handleView = (row) => {
  currentMessage.value = row
  row.isRead = true
  dialogTitle.value = '消息详情'
  dialogVisible.value = true
}

const handleDelete = (row) => {
  tableData.value = tableData.value.filter(m => m.id !== row.id)
  pagination.total--
  ElMessage.success('删除成功')
}

const handleReply = () => {
  sendForm.value = {
    receiver: [currentMessage.value.sender],
    type: 'normal',
    title: `回复：${currentMessage.value.title}`,
    content: ''
  }
  dialogVisible.value = false
  sendVisible.value = true
}

const handleSendSubmit = () => {
  ElMessage.success('发送成功')
  sendVisible.value = false
  loadData()
}

const getTypeTag = (type) => {
  const types = { notice: 'warning', remind: 'danger', normal: 'info' }
  return types[type] || 'info'
}
</script>

<style lang="scss" scoped>
.station-page {
  padding: 20px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .header-actions {
      display: flex;
      gap: 10px;
    }
  }

  .tab-badge {
    margin-left: 8px;
    color: #409eff;
    font-size: 12px;
  }

  .pagination {
    margin-top: 20px;
    justify-content: flex-end;
  }

  .message-content {
    .message-header {
      .message-title {
        font-size: 18px;
        font-weight: 600;
        color: #333;
        margin-bottom: 10px;
      }

      .message-meta {
        display: flex;
        gap: 20px;
        font-size: 13px;
        color: #999;
      }
    }

    .message-body {
      line-height: 1.8;
      color: #606266;
      white-space: pre-wrap;
      padding: 20px 0;
    }
  }

  .unread-title {
    font-weight: 600;
    color: #333;
  }
}
</style>
