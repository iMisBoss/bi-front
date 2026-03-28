<template>
  <div class="email-page">
    <el-row :gutter="20">
      <el-col :span="4">
        <el-card class="folder-card">
          <el-menu :default-active="activeFolder" @select="handleFolderSelect">
            <el-menu-item index="inbox">
              <el-icon><Message /></el-icon>
              <span>收件箱</span>
              <el-badge :value="unreadCount" style="margin-left: auto" />
            </el-menu-item>
            <el-menu-item index="sent">
              <el-icon><Position /></el-icon>
              <span>已发送</span>
            </el-menu-item>
            <el-menu-item index="draft">
              <el-icon><Edit /></el-icon>
              <span>草稿箱</span>
            </el-menu-item>
            <el-menu-item index="trash">
              <el-icon><Delete /></el-icon>
              <span>已删除</span>
            </el-menu-item>
          </el-menu>
        </el-card>
      </el-col>

      <el-col :span="20">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>{{ folderName }}</span>
              <div class="header-actions">
                <el-input
                    v-model="searchText"
                    placeholder="搜索邮件"
                    clearable
                    style="width: 200px"
                />
                <el-button type="primary" @click="handleWrite">
                  <el-icon><Edit /></el-icon>
                  写邮件
                </el-button>
              </div>
            </div>
          </template>

          <el-table :data="tableData" v-loading="loading" border>
            <el-table-column prop="star" label="星标" width="60">
              <template #default="{ row }">
                <el-icon
                    :size="20"
                    :color="row.star ? '#f56c6c' : '#dcdfe6'"
                    @click="toggleStar(row)"
                >
                  <Star />
                </el-icon>
              </template>
            </el-table-column>
            <el-table-column prop="title" label="邮件标题" min-width="300">
              <template #default="{ row }">
                <span :class="{ 'unread': !row.isRead }">{{ row.title }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="sender" label="发件人" width="120" />
            <el-table-column prop="sendTime" label="时间" width="160" />
            <el-table-column prop="hasAttachment" label="附件" width="80">
              <template #default="{ row }">
                <el-icon v-if="row.hasAttachment"><Paperclip /></el-icon>
              </template>
            </el-table-column>
            <el-table-column label="操作" fixed="right" width="180">
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
      </el-col>
    </el-row>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="800px">
      <div class="email-content">
        <div class="email-header">
          <h3>{{ currentEmail.title }}</h3>
          <div class="email-meta">
            <p><strong>发件人：</strong>{{ currentEmail.sender }}</p>
            <p><strong>收件人：</strong>{{ currentEmail.receiver }}</p>
            <p><strong>时间：</strong>{{ currentEmail.sendTime }}</p>
          </div>
        </div>
        <el-divider />
        <div class="email-body">
          {{ currentEmail.content }}
        </div>
        <div v-if="currentEmail.hasAttachment" class="email-attachments">
          <h4>附件</h4>
          <div class="attachment-list">
            <el-tag v-for="(file, index) in currentEmail.attachments" :key="index" style="margin-right: 10px">
              <el-icon><Document /></el-icon>
              {{ file }}
            </el-tag>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="dialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="handleReply">回复</el-button>
        <el-button @click="handleForward">转发</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="writeVisible" title="写邮件" width="800px">
      <el-form :model="emailForm" :rules="rules" ref="formRef" label-width="80px">
        <el-form-item label="收件人" prop="receiver">
          <el-input v-model="emailForm.receiver" placeholder="请输入收件人邮箱" />
        </el-form-item>
        <el-form-item label="抄送" prop="cc">
          <el-input v-model="emailForm.cc" placeholder="请输入抄送人邮箱，多个用分号分隔" />
        </el-form-item>
        <el-form-item label="主题" prop="subject">
          <el-input v-model="emailForm.subject" placeholder="请输入邮件主题" />
        </el-form-item>
        <el-form-item label="正文" prop="content">
          <el-input v-model="emailForm.content" type="textarea" :rows="10" placeholder="请输入邮件内容" />
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
              添加附件
            </el-button>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="writeVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSendEmail">发送</el-button>
        <el-button @click="handleSaveDraft">存草稿</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Message, Position, Edit, Delete, Star, Paperclip, Document, Upload } from '@element-plus/icons-vue'

const loading = ref(false)
const activeFolder = ref('inbox')
const searchText = ref('')
const tableData = ref([])
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const dialogVisible = ref(false)
const writeVisible = ref(false)
const dialogTitle = ref('邮件详情')
const formRef = ref(null)
const currentEmail = ref({})

const emailForm = ref({
  receiver: '',
  cc: '',
  subject: '',
  content: ''
})

const rules = {
  receiver: [{ required: true, message: '请输入收件人邮箱', trigger: 'blur' }],
  subject: [{ required: true, message: '请输入邮件主题', trigger: 'blur' }],
  content: [{ required: true, message: '请输入邮件内容', trigger: 'blur' }]
}

const folderNames = {
  inbox: '收件箱',
  sent: '已发送',
  draft: '草稿箱',
  trash: '已删除'
}

const folderName = computed(() => folderNames[activeFolder.value])

const unreadCount = ref(5)

onMounted(() => {
  loadData()
})

const loadData = () => {
  loading.value = true
  setTimeout(() => {
    tableData.value = [
      { id: 1, title: '2026 年工作计划汇报', sender: '张三', receiver: '我', sendTime: '2026-01-15 10:00', isRead: false, star: true, hasAttachment: true, attachments: ['工作计划.docx'] },
      { id: 2, title: '会议通知', sender: '办公室', receiver: '我', sendTime: '2026-01-14 09:00', isRead: true, star: false, hasAttachment: false, attachments: [] },
      { id: 3, title: '项目进度报告', sender: '李四', receiver: '我', sendTime: '2026-01-13 14:30', isRead: true, star: false, hasAttachment: true, attachments: ['进度报告.pdf'] }
    ]
    pagination.total = tableData.value.length
    loading.value = false
  }, 500)
}

const handleFolderSelect = (folder) => {
  activeFolder.value = folder
  loadData()
}

const handleWrite = () => {
  emailForm.value = { receiver: '', cc: '', subject: '', content: '' }
  writeVisible.value = true
}

const handleView = (row) => {
  currentEmail.value = row
  row.isRead = true
  dialogTitle.value = '邮件详情'
  dialogVisible.value = true
}

const handleDelete = (row) => {
  tableData.value = tableData.value.filter(m => m.id !== row.id)
  pagination.total--
  ElMessage.success('删除成功')
}

const toggleStar = (row) => {
  row.star = !row.star
  ElMessage.success(row.star ? '已加星标' : '已取消星标')
}

const handleReply = () => {
  emailForm.value = {
    receiver: currentEmail.value.sender,
    cc: '',
    subject: `回复：${currentEmail.value.title}`,
    content: ''
  }
  dialogVisible.value = false
  writeVisible.value = true
}

const handleForward = () => {
  emailForm.value = {
    receiver: '',
    cc: '',
    subject: `转发：${currentEmail.value.title}`,
    content: `\n\n--- 转发邮件 ---\n发件人：${currentEmail.value.sender}\n时间：${currentEmail.value.sendTime}\n\n${currentEmail.value.content}`
  }
  dialogVisible.value = false
  writeVisible.value = true
}

const handleSendEmail = () => {
  ElMessage.success('发送成功')
  writeVisible.value = false
  loadData()
}

const handleSaveDraft = () => {
  ElMessage.success('已保存到草稿箱')
  writeVisible.value = false
}
</script>

<style lang="scss" scoped>
.email-page {
  padding: 20px;

  .folder-card {
    height: calc(100vh - 160px);

    .el-menu {
      border-right: none;
    }
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .header-actions {
      display: flex;
      gap: 10px;
      align-items: center;
    }
  }

  .pagination {
    margin-top: 20px;
    justify-content: flex-end;
  }

  .email-content {
    .email-header {
      h3 {
        font-size: 18px;
        color: #333;
        margin-bottom: 15px;
      }

      .email-meta {
        p {
          margin: 8px 0;
          color: #606266;
          font-size: 14px;
        }
      }
    }

    .email-body {
      line-height: 1.8;
      color: #606266;
      white-space: pre-wrap;
      padding: 20px 0;
    }

    .email-attachments {
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #ebeef5;

      h4 {
        font-size: 14px;
        color: #606266;
        margin-bottom: 10px;
      }

      .attachment-list {
        display: flex;
        flex-wrap: wrap;
      }
    }
  }

  .unread {
    font-weight: 600;
    color: #333;
  }
}
</style>
