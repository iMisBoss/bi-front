<template>
  <div class="cced-container">
    <div class="page-header">
      <div class="header-left">
        <h2>抄送我的</h2>
        <div class="stat-tags">
          <el-tag type="warning" effect="dark" style="margin-right: 8px">
            未读：{{ unreadCount }}
          </el-tag>
          <el-tag type="success" effect="plain" style="margin-right: 8px">
            已读：{{ readCount }}
          </el-tag>
        </div>
      </div>
      <div class="header-right">
        <el-input
            v-model="searchText"
            placeholder="搜索抄送流程"
            style="width: 300px"
            clearable
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>
    </div>

    <!-- 筛选区域 -->
    <el-card class="filter-card" shadow="hover">
      <el-form :inline="true" :model="filterForm" size="default">
        <el-form-item label="流程类型">
          <el-select v-model="filterForm.processType" placeholder="全部流程" clearable style="width: 180px">
            <el-option label="请假审批流程" value="leave" />
            <el-option label="会议申请流程" value="meeting" />
            <el-option label="用车申请流程" value="vehicle" />
            <el-option label="采购申请流程" value="purchase" />
            <el-option label="费用报销流程" value="expense" />
          </el-select>
        </el-form-item>
        <el-form-item label="阅读状态">
          <el-select v-model="filterForm.readStatus" placeholder="全部状态" clearable style="width: 150px">
            <el-option label="已读" value="read" />
            <el-option label="未读" value="unread" />
          </el-select>
        </el-form-item>
        <el-form-item label="抄送时间">
          <el-date-picker
              v-model="filterForm.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="YYYY-MM-DD"
              style="width: 240px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleFilter" icon="Search">
            查询
          </el-button>
          <el-button @click="handleResetFilter" icon="Refresh">
            重置
          </el-button>
          <el-button
              v-if="selectedRows.length > 0"
              type="success"
              @click="handleBatchMarkRead"
              icon="CircleCheck"
          >
            批量标记已读
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 数据表格 -->
    <el-table
        :data="filteredTableData"
        style="width: 100%"
        border
        @selection-change="handleSelectionChange"
        :row-class-name="tableRowClassName"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip>
        <template #default="{ row }">
          <div class="task-title">
            <el-tag v-if="row.isUrgent" type="danger" size="small" effect="dark" style="margin-right: 6px">
              紧急
            </el-tag>
            <span>{{ row.title }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="processName" label="流程名称" width="160" show-overflow-tooltip />
      <el-table-column prop="applicant" label="申请人" width="100" />
      <el-table-column prop="applyTime" label="发起时间" width="160" sortable />
      <el-table-column prop="ccTime" label="抄送时间" width="160" sortable />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)" size="small" effect="plain">
            {{ getStatusText(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="isRead" label="阅读状态" width="90">
        <template #default="{ row }">
          <el-tag :type="row.isRead ? 'success' : 'warning'" size="small" effect="plain">
            {{ row.isRead ? '已读' : '未读' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="280" fixed="right">
        <template #default="scope">
          <el-button size="small" type="primary" @click="handleView(scope.row)" icon="View">
            详情
          </el-button>
          <el-button
              size="small"
              :type="scope.row.isRead ? 'info' : 'success'"
              @click="handleMarkRead(scope.row)"
              icon="Check"
          >
            {{ scope.row.isRead ? '标记未读' : '标记已读' }}
          </el-button>
          <el-button size="small" type="warning" @click="handleComment(scope.row)" icon="ChatDotRound">
            评论
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="table-footer">
      <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
      />
    </div>

    <!-- 查看详情对话框 - 嵌入 Detail.vue 组件（只读模式） -->
    <el-dialog
        v-model="viewDialogVisible"
        title=""
        width="95%"
        :close-on-click-modal="false"
        :fullscreen="true"
        destroy-on-close
    >
      <template #header>
        <div style="display: none;">
          <!-- 隐藏标题，使用组件内部的头部 -->
        </div>
      </template>

      <!-- 嵌入 Detail 组件，通过 props 传递审批 ID -->
      <DetailComponent
          v-if="viewDialogVisible"
          :approval-id="currentViewId"
          :embedded-in-dialog="true"
          :readonly="true"
          @close="handleDialogClose"
      />
    </el-dialog>

    <!-- 评论/协同沟通对话框 -->
    <el-dialog
        v-model="commentDialogVisible"
        title="评论与协同沟通"
        width="800px"
        :close-on-click-modal="false"
    >
      <div class="comment-container" v-if="currentCommentRow">
        <!-- 流程信息摘要 -->
        <div class="process-summary">
          <el-descriptions :column="2" border size="small">
            <el-descriptions-item label="流程标题">{{ currentCommentRow.title }}</el-descriptions-item>
            <el-descriptions-item label="申请人">{{ currentCommentRow.applicant }}</el-descriptions-item>
            <el-descriptions-item label="流程名称">{{ currentCommentRow.processName }}</el-descriptions-item>
            <el-descriptions-item label="抄送时间">{{ currentCommentRow.ccTime }}</el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 评论区 -->
        <div class="comment-section">
          <h4 style="margin-bottom: 12px">评论列表</h4>
          <div class="comment-list">
            <div v-for="(comment, index) in commentList" :key="index" class="comment-item">
              <div class="comment-avatar">
                <el-avatar :size="40" :src="comment.avatar">
                  {{ comment.userName.charAt(0) }}
                </el-avatar>
              </div>
              <div class="comment-content">
                <div class="comment-header">
                  <span class="comment-user">{{ comment.userName }}</span>
                  <span class="comment-time">{{ comment.time }}</span>
                </div>
                <div class="comment-text">{{ comment.content }}</div>
                <div class="comment-actions">
                  <el-button type="primary" link size="small" @click="handleReply(comment)">
                    回复
                  </el-button>
                  <el-button
                      v-if="comment.userId === currentUserId"
                      type="danger"
                      link
                      size="small"
                      @click="handleDeleteComment(comment)"
                  >
                    删除
                  </el-button>
                </div>
                <!-- 回复列表 -->
                <div v-if="comment.replies && comment.replies.length > 0" class="reply-list">
                  <div v-for="(reply, rIndex) in comment.replies" :key="rIndex" class="reply-item">
                    <div class="reply-header">
                      <span class="reply-user">{{ reply.userName }}</span>
                      <span class="reply-time">{{ reply.time }}</span>
                    </div>
                    <div class="reply-text">{{ reply.content }}</div>
                  </div>
                </div>
              </div>
            </div>
            <el-empty v-if="commentList.length === 0" description="暂无评论" :image-size="80" />
          </div>
        </div>

        <!-- 发表评论 -->
        <div class="comment-input-section">
          <el-input
              v-model="commentForm.content"
              type="textarea"
              :rows="3"
              placeholder="请输入评论内容..."
              maxlength="500"
              show-word-limit
          />
          <div class="input-actions">
            <el-upload
                action="#"
                :limit="3"
                multiple
                :file-list="commentForm.files"
                :on-change="handleCommentFileChange"
                :on-remove="handleCommentFileRemove"
                :auto-upload="false"
            >
              <el-button size="small" icon="Paperclip">
                添加附件
              </el-button>
            </el-upload>
            <el-button type="primary" @click="confirmComment" icon="Check" :loading="commenting">
              发表评论
            </el-button>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="commentDialogVisible = false" icon="Close">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search, Refresh, View, Check, ChatDotRound, CircleCheck, Paperclip
} from '@element-plus/icons-vue'
import DetailComponent from '../Detail.vue'

const searchText = ref('')

// 统计数据
const unreadCount = ref(5)
const readCount = ref(12)

// 筛选表单
const filterForm = reactive({
  processType: '',
  readStatus: '',
  dateRange: []
})

const tableData = ref([
  {
    id: 1,
    title: '张三 - 请假申请',
    processName: '请假审批流程',
    applicant: '张三',
    department: '信息技术部',
    applyTime: '2024-01-15 09:30',
    ccTime: '2024-01-15 14:30',
    status: 'processing',
    isRead: false,
    isUrgent: true,
    ccReason: '您需要知晓该流程'
  },
  {
    id: 2,
    title: '李四 - 会议申请',
    processName: '会议申请流程',
    applicant: '李四',
    department: '市场部',
    applyTime: '2024-01-14 10:20',
    ccTime: '2024-01-14 16:30',
    status: 'passed',
    isRead: true,
    isUrgent: false,
    ccReason: '邀请您参加会议'
  },
  {
    id: 3,
    title: '王五 - 用车申请',
    processName: '用车申请流程',
    applicant: '王五',
    department: '销售部',
    applyTime: '2024-01-13 11:15',
    ccTime: '2024-01-13 15:45',
    status: 'processing',
    isRead: false,
    isUrgent: false,
    ccReason: '车辆调度需要您知晓'
  },
  {
    id: 4,
    title: '赵六 - 采购申请',
    processName: '采购申请流程',
    applicant: '赵六',
    department: '行政部',
    applyTime: '2024-01-12 14:00',
    ccTime: '2024-01-12 17:30',
    status: 'passed',
    isRead: true,
    isUrgent: false,
    ccReason: '采购备案'
  }
])

const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(4)
const selectedRows = ref([])

// 对话框控制
const viewDialogVisible = ref(false)
const currentViewId = ref('')
const commentDialogVisible = ref(false)
const currentCommentRow = ref(null)
const currentUserId = ref('user123') // 当前用户 ID

// 评论相关
const commentList = ref([
  {
    id: 1,
    userId: 'user456',
    userName: '李四',
    avatar: '',
    content: '这个会议很重要，请大家准时参加。',
    time: '2024-01-14 17:00',
    replies: [
      {
        userId: 'user789',
        userName: '王五',
        content: '收到，会准时参加。',
        time: '2024-01-14 17:30'
      }
    ]
  }
])

const commentForm = reactive({
  content: '',
  files: [],
  parentId: null,
  replyingTo: null
})

const commenting = ref(false)

const filteredTableData = computed(() => {
  let result = [...tableData.value]

  // 搜索过滤
  if (searchText.value) {
    result = result.filter(item =>
        item.title.includes(searchText.value) ||
        item.processName.includes(searchText.value) ||
        item.applicant.includes(searchText.value)
    )
  }

  // 流程类型过滤
  if (filterForm.processType) {
    result = result.filter(item => item.processName.includes(filterForm.processType))
  }

  // 阅读状态过滤
  if (filterForm.readStatus === 'read') {
    result = result.filter(item => item.isRead)
  } else if (filterForm.readStatus === 'unread') {
    result = result.filter(item => !item.isRead)
  }

  // 日期范围过滤
  if (filterForm.dateRange && filterForm.dateRange.length === 2) {
    const startDate = new Date(filterForm.dateRange[0])
    const endDate = new Date(filterForm.dateRange[1])
    endDate.setHours(23, 59, 59, 999)

    result = result.filter(item => {
      const itemDate = new Date(item.ccTime)
      return itemDate >= startDate && itemDate <= endDate
    })
  }

  return result
})

const getStatusType = (status) => {
  const typeMap = {
    'processing': 'warning',
    'passed': 'success',
    'rejected': 'danger',
    'withdrawn': 'info'
  }
  return typeMap[status] || 'info'
}

const getStatusText = (status) => {
  const textMap = {
    'processing': '审批中',
    'passed': '已通过',
    'rejected': '已驳回',
    'withdrawn': '已撤回'
  }
  return textMap[status] || '未知'
}

const tableRowClassName = ({ row }) => {
  if (!row.isRead) {
    return 'unread-row'
  }
  return ''
}

const handleSelectionChange = (selection) => {
  selectedRows.value = selection
}

// 筛选操作
const handleFilter = () => {
  console.log('执行筛选', filterForm)
  ElMessage.success('筛选完成')
}

const handleResetFilter = () => {
  filterForm.processType = ''
  filterForm.readStatus = ''
  filterForm.dateRange = []
  searchText.value = ''
}

// 查看详情
const handleView = (row) => {
  currentViewId.value = row.id.toString()
  viewDialogVisible.value = true
  // 查看时自动标记为已读
  if (!row.isRead) {
    row.isRead = true
    updateReadCount()
  }
}

// 关闭对话框回调
const handleDialogClose = () => {
  viewDialogVisible.value = false
}

// 标记已读/未读
const handleMarkRead = (row) => {
  row.isRead = !row.isRead
  ElMessage.success(row.isRead ? '已标记为已读' : '已标记为未读')
  updateReadCount()
}

// 批量标记已读
const handleBatchMarkRead = () => {
  ElMessageBox.confirm(`确认将选中的 ${selectedRows.value.length} 条记录标记为已读吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    selectedRows.value.forEach(row => {
      row.isRead = true
    })
    ElMessage.success('批量标记成功')
    updateReadCount()
    selectedRows.value = []
  }).catch(() => {})
}

// 打开评论对话框
const handleComment = (row) => {
  currentCommentRow.value = row
  commentForm.content = ''
  commentForm.files = []
  commentForm.parentId = null
  commentForm.replyingTo = null
  commentDialogVisible.value = true
  // 加载评论列表（实际项目中从 API 获取）
  loadComments(row.id)
}

// 加载评论
const loadComments = (processId) => {
  console.log('加载评论', processId)
  // 实际项目中调用 API 获取评论列表
}

// 发表评论
const confirmComment = () => {
  if (!commentForm.content.trim()) {
    ElMessage.warning('请输入评论内容')
    return
  }

  commenting.value = true

  setTimeout(() => {
    const newComment = {
      id: commentList.value.length + 1,
      userId: currentUserId.value,
      userName: '当前用户',
      avatar: '',
      content: commentForm.content,
      time: new Date().toLocaleString('zh-CN'),
      replies: []
    }

    if (commentForm.parentId) {
      // 回复评论
      const parentComment = commentList.value.find(c => c.id === commentForm.parentId)
      if (parentComment) {
        parentComment.replies.push({
          userId: currentUserId.value,
          userName: '当前用户',
          content: commentForm.content,
          time: new Date().toLocaleString('zh-CN'),
          replyTo: commentForm.replyingTo
        })
      }
    } else {
      // 新评论
      commentList.value.unshift(newComment)
    }

    ElMessage.success('评论成功')
    commentForm.content = ''
    commentForm.files = []
    commentForm.parentId = null
    commentForm.replyingTo = null
    commenting.value = false
  }, 500)
}

// 回复评论
const handleReply = (comment) => {
  commentForm.parentId = comment.id
  commentForm.replyingTo = comment.userName
  ElMessage.info(`回复 @${comment.userName}`)
}

// 删除评论
const handleDeleteComment = (comment) => {
  ElMessageBox.confirm('确认删除该评论吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = commentList.value.findIndex(c => c.id === comment.id)
    if (index > -1) {
      commentList.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
  }).catch(() => {})
}

// 文件上传处理
const handleCommentFileChange = (file, fileList) => {
  commentForm.files = fileList
}

const handleCommentFileRemove = (file, fileList) => {
  commentForm.files = fileList
}

// 更新阅读统计
const updateReadCount = () => {
  unreadCount.value = tableData.value.filter(item => !item.isRead).length
  readCount.value = tableData.value.filter(item => item.isRead).length
}

onMounted(() => {
  updateReadCount()
})
</script>

<style scoped lang="scss">
.cced-container {
  padding: 20px;
  background: #fff;
  border-radius: 4px;
  min-height: calc(100vh - 140px);

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    flex-wrap: wrap;
    gap: 10px;

    .header-left {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;

      h2 {
        font-size: 20px;
        color: #333;
        margin: 0;
        font-weight: 600;
      }

      .stat-tags {
        display: flex;
        align-items: center;
      }
    }

    .header-right {
      display: flex;
      gap: 12px;
    }
  }

  .filter-card {
    margin-bottom: 20px;

    :deep(.el-card__body) {
      padding: 16px;
    }
  }

  .task-title {
    display: flex;
    align-items: center;
  }

  .table-footer {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}

// 未读行样式
:deep(.el-table__body tr.unread-row) {
  background-color: #f0f7ff !important;

  &:hover {
    td {
      background-color: #e6f4ff !important;
    }
  }
}

// 对话框样式优化
:deep(.el-dialog) {
  .el-dialog__body {
    padding: 0;
    overflow: hidden;
  }
}

// 评论容器
.comment-container {
  padding: 20px;
  max-height: 70vh;
  overflow-y: auto;

  .process-summary {
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid #e8e8e8;
  }

  .comment-section {
    margin-bottom: 20px;

    h4 {
      font-size: 16px;
      color: #333;
      margin: 0 0 12px;
      font-weight: 600;
    }

    .comment-list {
      max-height: 400px;
      overflow-y: auto;

      .comment-item {
        display: flex;
        gap: 12px;
        padding: 16px 0;
        border-bottom: 1px solid #f0f0f0;

        &:last-child {
          border-bottom: none;
        }

        .comment-avatar {
          flex-shrink: 0;
        }

        .comment-content {
          flex: 1;

          .comment-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;

            .comment-user {
              font-weight: 600;
              color: #333;
              font-size: 14px;
            }

            .comment-time {
              font-size: 12px;
              color: #999;
            }
          }

          .comment-text {
            font-size: 14px;
            color: #666;
            line-height: 1.6;
            margin-bottom: 8px;
          }

          .comment-actions {
            display: flex;
            gap: 12px;
          }

          .reply-list {
            margin-top: 12px;
            padding-left: 12px;
            border-left: 2px solid #f0f0f0;

            .reply-item {
              padding: 8px 12px;
              background-color: #fafafa;
              border-radius: 4px;
              margin-bottom: 8px;

              &:last-child {
                margin-bottom: 0;
              }

              .reply-header {
                display: flex;
                justify-content: space-between;
                margin-bottom: 4px;

                .reply-user {
                  font-size: 13px;
                  font-weight: 600;
                  color: #333;
                }

                .reply-time {
                  font-size: 12px;
                  color: #999;
                }
              }

              .reply-text {
                font-size: 13px;
                color: #666;
                line-height: 1.5;
              }
            }
          }
        }
      }
    }
  }

  .comment-input-section {
    border-top: 1px solid #e8e8e8;
    padding-top: 16px;

    .input-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 12px;
    }
  }
}
</style>
