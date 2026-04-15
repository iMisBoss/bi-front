<template>
  <div class="meeting-notification-container">
    <!-- 顶部操作栏 -->
    <div class="page-header">
      <div class="header-left">
        <el-input
            v-model="searchForm.keyword"
            placeholder="搜索会议标题、发起人、会议室"
            prefix-icon="Search"
            clearable
            style="width: 280px"
            @input="handleSearch"
        />
        <el-select
            v-model="searchForm.timeRange"
            placeholder="时间筛选"
            clearable
            style="width: 120px; margin-left: 12px"
            @change="handleSearch"
        >
          <el-option label="今日" value="today" />
          <el-option label="本周" value="week" />
          <el-option label="本月" value="month" />
          <el-option label="近3月" value="quarter" />
        </el-select>
        <el-select
            v-model="searchForm.status"
            placeholder="状态筛选"
            clearable
            style="width: 120px; margin-left: 12px"
            @change="handleSearch"
        >
          <el-option label="待确认" value="pending" />
          <el-option label="已确认" value="confirmed" />
          <el-option label="已拒绝" value="rejected" />
          <el-option label="已取消" value="cancelled" />
          <el-option label="已结束" value="ended" />
        </el-select>
        <el-select
            v-model="searchForm.type"
            placeholder="会议类型"
            clearable
            style="width: 120px; margin-left: 12px"
            @change="handleSearch"
        >
          <el-option label="线下会议" value="offline" />
          <el-option label="线上会议" value="online" />
          <el-option label="涉密会议" value="secret" />
        </el-select>
      </div>
      <div class="header-right">
        <el-button @click="handleBatchMarkRead" :disabled="selectedNotifications.length === 0">
          批量标记已读
        </el-button>
        <el-button type="primary" @click="handleBatchConfirm" :disabled="selectedNotifications.length === 0">
          批量回执确认
        </el-button>
        <el-button v-if="isAdmin" @click="handleExport">
          导出通知记录
        </el-button>
        <el-button @click="handleClearRead">
          清空已读
        </el-button>
        <el-button icon="Setting" @click="showSettings = true">
          通知设置
        </el-button>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="main-content">
      <!-- 左侧分类导航 -->
      <CategoryNavigation
          :categories="categories"
          :activeCategory="activeCategory"
          @change="handleCategoryChange"
      />

      <!-- 中间通知列表 -->
      <div class="center-panel">
        <div class="list-toolbar">
          <div class="view-switch">
            <el-radio-group v-model="viewMode" size="small">
              <el-radio-button value="card">卡片视图</el-radio-button>
              <el-radio-button value="list">列表视图</el-radio-button>
            </el-radio-group>
          </div>
          <div class="sort-options">
            <el-select v-model="sortBy" size="small" style="width: 120px">
              <el-option label="按时间倒序" value="time_desc" />
              <el-option label="按时间正序" value="time_asc" />
              <el-option label="按优先级" value="priority" />
            </el-select>
          </div>
        </div>

        <!-- 卡片视图 -->
        <CardView
            v-if="viewMode === 'card'"
            :notifications="filteredNotifications"
            :selected-ids="selectedNotificationIds"
            @select="handleSelectNotification"
            @click="handleViewDetail"
            @confirm="handleConfirm"
            @reject="handleReject"
            @leave="handleLeave"
            @checkin="handleCheckin"
            @view-agenda="handleViewAgenda"
            @download="handleDownload"
        />

        <!-- 列表视图 -->
        <ListView
            v-if="viewMode === 'list'"
            :notifications="filteredNotifications"
            :selected-ids="selectedNotificationIds"
            @select="handleSelectNotification"
            @click="handleViewDetail"
            @confirm="handleConfirm"
            @reject="handleReject"
            @leave="handleLeave"
        />

        <!-- 分页 -->
        <div class="pagination-bar">
          <el-pagination
              v-model:current-page="pagination.page"
              v-model:page-size="pagination.pageSize"
              :total="pagination.total"
              :page-sizes="[10, 20, 50, 100]"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleSearch"
              @current-change="handleSearch"
          />
          <div class="stats-info">
            共 {{ pagination.total }} 条通知，未读 {{ unreadCount }} 条
          </div>
        </div>
      </div>

      <!-- 右侧详情抽屉 -->
      <DetailDrawer
          v-model="drawerVisible"
          :notification="currentNotification"
          :user-role="userRole"
          :is-initiator="isInitiator"
          @confirm="handleConfirm"
          @reject="handleReject"
          @leave="handleLeave"
          @checkin="handleCheckin"
          @view-agenda="handleViewAgenda"
          @download="handleDownload"
          @snooze="handleSnooze"
          @comment="handleComment"
          @close="drawerVisible = false"
      />
    </div>

    <!-- 通知设置对话框 -->
    <NotificationSettings
        v-model="showSettings"
        @save="handleSaveSettings"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Setting } from '@element-plus/icons-vue'
import CategoryNavigation from './components/CategoryNavigation.vue'
import CardView from './components/CardView.vue'
import ListView from './components/ListView.vue'
import DetailDrawer from './components/DetailDrawer.vue'
import NotificationSettings from './components/NotificationSettings.vue'

const isAdmin = ref(false)
const userRole = ref('employee')
const isInitiator = ref(false)
const activeCategory = ref('pending')
const viewMode = ref('card')
const sortBy = ref('time_desc')
const drawerVisible = ref(false)
const showSettings = ref(false)
const currentNotification = ref(null)
const selectedNotifications = ref([])
const selectedNotificationIds = ref([])

const searchForm = reactive({
  keyword: '',
  timeRange: '',
  status: '',
  type: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

// 分类导航
const categories = ref([
  { key: 'pending', label: '待我处理', count: 5, icon: 'Bell' },
  { key: 'reminder', label: '会议提醒', count: 3, icon: 'Clock' },
  { key: 'change', label: '会议变更', count: 2, icon: 'Edit' },
  { key: 'agenda', label: '纪要通知', count: 1, icon: 'Document' },
  { key: 'processed', label: '已处理通知', count: 0, icon: 'Check' },
  { key: 'all', label: '全部通知', count: 0, icon: 'List' }
])

// 通知数据
const allNotifications = ref([
  {
    id: 1,
    type: 'invite',
    typeLabel: '会议邀请',
    typeColor: 'primary',
    title: '技术部Q2季度规划会议',
    initiator: '张经理',
    initiatorDept: '技术部',
    startTime: '2026-04-15 14:00',
    endTime: '2026-04-15 15:30',
    location: '大会议室-A101',
    meetingType: 'offline',
    status: 'pending',
    statusLabel: '待确认',
    sendTime: '2026-04-14 10:00',
    sendTimeDisplay: '10分钟前',
    isSecret: false,
    isRead: false,
    priority: 'high',
    agenda: '1. Q1工作总结\n2. Q2目标设定\n3. 资源分配讨论',
    attachments: [],
    checkinMethod: 'qrcode',
    initiatorId: 'zhang_manager'
  },
  {
    id: 2,
    type: 'reminder',
    typeLabel: '即将开始',
    typeColor: 'warning',
    title: '产品需求评审会',
    initiator: '李总监',
    initiatorDept: '产品部',
    startTime: '2026-04-15 10:00',
    endTime: '2026-04-15 11:30',
    location: '研发部会议室',
    meetingType: 'offline',
    status: 'pending',
    statusLabel: '待签到',
    sendTime: '2026-04-15 09:30',
    sendTimeDisplay: '5分钟前',
    isSecret: false,
    isRead: false,
    priority: 'high',
    agenda: '需求文档评审',
    attachments: [{ name: '需求文档v2.pdf', url: '#' }],
    checkinMethod: 'manual',
    initiatorId: 'li_director'
  },
  {
    id: 3,
    type: 'change',
    typeLabel: '会议变更',
    typeColor: 'danger',
    title: '月度经营分析会（时间调整）',
    initiator: '王主任',
    initiatorDept: '总裁办',
    startTime: '2026-04-16 09:00',
    endTime: '2026-04-16 11:00',
    location: '大报告厅',
    meetingType: 'offline',
    status: 'pending',
    statusLabel: '待确认',
    sendTime: '2026-04-14 16:00',
    sendTimeDisplay: '2小时前',
    isSecret: false,
    isRead: false,
    priority: 'high',
    changeInfo: {
      oldTime: '2026-04-15 14:00',
      newTime: '2026-04-16 09:00',
      oldLocation: '大会议室-A101',
      newLocation: '大报告厅'
    },
    agenda: '月度经营数据分析',
    attachments: [],
    checkinMethod: 'qrcode',
    initiatorId: 'wang_director'
  },
  {
    id: 4,
    type: 'agenda',
    typeLabel: '纪要发布',
    typeColor: 'success',
    title: '项目启动会纪要',
    initiator: '赵秘书',
    initiatorDept: '行政部',
    startTime: '2026-04-10 14:00',
    endTime: '2026-04-10 15:30',
    location: '小会议室-A102',
    meetingType: 'offline',
    status: 'read',
    statusLabel: '已查看',
    sendTime: '2026-04-10 16:00',
    sendTimeDisplay: '5天前',
    isSecret: false,
    isRead: true,
    priority: 'normal',
    agenda: '项目启动会纪要已发布',
    attachments: [{ name: '项目启动会纪要.docx', url: '#' }],
    checkinMethod: 'manual',
    initiatorId: 'zhao_secretary'
  },
  {
    id: 5,
    type: 'cancelled',
    typeLabel: '已取消',
    typeColor: 'info',
    title: '临时讨论会（已取消）',
    initiator: '钱主管',
    initiatorDept: '财务部',
    startTime: '2026-04-12 10:00',
    endTime: '2026-04-12 11:00',
    location: '财务部会议室',
    meetingType: 'offline',
    status: 'cancelled',
    statusLabel: '已取消',
    sendTime: '2026-04-11 17:00',
    sendTimeDisplay: '4天前',
    isSecret: false,
    isRead: true,
    priority: 'low',
    cancelReason: '发起人时间冲突',
    agenda: '',
    attachments: [],
    checkinMethod: 'manual',
    initiatorId: 'qian_manager'
  }
])

// 过滤后的通知
const filteredNotifications = computed(() => {
  let result = allNotifications.value

  // 分类过滤
  if (activeCategory.value === 'pending') {
    result = result.filter(n => n.status === 'pending' && !n.isRead)
  } else if (activeCategory.value === 'reminder') {
    result = result.filter(n => n.type === 'reminder')
  } else if (activeCategory.value === 'change') {
    result = result.filter(n => n.type === 'change')
  } else if (activeCategory.value === 'agenda') {
    result = result.filter(n => n.type === 'agenda')
  } else if (activeCategory.value === 'processed') {
    result = result.filter(n => n.isRead)
  }

  // 关键词搜索
  if (searchForm.keyword) {
    const keyword = searchForm.keyword.toLowerCase()
    result = result.filter(n =>
        n.title.toLowerCase().includes(keyword) ||
        n.initiator.toLowerCase().includes(keyword) ||
        n.location.toLowerCase().includes(keyword)
    )
  }

  // 状态筛选
  if (searchForm.status) {
    result = result.filter(n => n.status === searchForm.status)
  }

  // 类型筛选
  if (searchForm.type) {
    result = result.filter(n => n.meetingType === searchForm.type)
  }

  // 排序
  if (sortBy.value === 'time_desc') {
    result.sort((a, b) => new Date(b.sendTime) - new Date(a.sendTime))
  } else if (sortBy.value === 'time_asc') {
    result.sort((a, b) => new Date(a.sendTime) - new Date(b.sendTime))
  } else if (sortBy.value === 'priority') {
    const priorityMap = { high: 3, normal: 2, low: 1 }
    result.sort((a, b) => priorityMap[b.priority] - priorityMap[a.priority])
  }

  pagination.total = result.length
  return result
})

// 未读数量
const unreadCount = computed(() => {
  return allNotifications.value.filter(n => !n.isRead).length
})

onMounted(() => {
  loadData()
})

const loadData = () => {
  // 加载数据
}

const handleCategoryChange = (category) => {
  activeCategory.value = category
  handleSearch()
}

const handleSearch = () => {
  pagination.page = 1
}

const handleSelectNotification = (id) => {
  const index = selectedNotificationIds.value.indexOf(id)
  if (index > -1) {
    selectedNotificationIds.value.splice(index, 1)
  } else {
    selectedNotificationIds.value.push(id)
  }
  selectedNotifications.value = allNotifications.value.filter(n =>
      selectedNotificationIds.value.includes(n.id)
  )
}

const handleViewDetail = (notification) => {
  currentNotification.value = notification
  drawerVisible.value = true
  markAsRead(notification.id)
}

const handleConfirm = (notification) => {
  ElMessageBox.confirm(`确认参加「${notification.title}」吗？`, '确认参会', {
    confirmButtonText: '确认参加',
    cancelButtonText: '取消',
    type: 'info'
  }).then(() => {
    notification.status = 'confirmed'
    notification.statusLabel = '已确认'
    notification.isRead = true
    ElMessage.success('已确认参会')
    drawerVisible.value = false
    updateCategoryCounts()
  }).catch(() => {})
}

const handleReject = (notification) => {
  ElMessageBox.prompt('请填写拒绝原因', '拒绝参会', {
    confirmButtonText: '确认拒绝',
    cancelButtonText: '取消',
    inputPattern: /.+/,
    inputErrorMessage: '拒绝原因不能为空'
  }).then(({ value }) => {
    notification.status = 'rejected'
    notification.statusLabel = '已拒绝'
    notification.isRead = true
    ElMessage.success('已拒绝参会')
    drawerVisible.value = false
    updateCategoryCounts()
  }).catch(() => {})
}

const handleLeave = (notification) => {
  ElMessageBox.prompt('请填写请假原因', '请假申请', {
    confirmButtonText: '提交请假',
    cancelButtonText: '取消',
    inputPattern: /.+/,
    inputErrorMessage: '请假原因不能为空'
  }).then(({ value }) => {
    notification.status = 'leave'
    notification.statusLabel = '已请假'
    notification.isRead = true
    ElMessage.success('请假申请已提交')
    drawerVisible.value = false
    updateCategoryCounts()
  }).catch(() => {})
}

const handleCheckin = (notification) => {
  ElMessage.success('签到成功')
  notification.status = 'checked'
  notification.statusLabel = '已签到'
}

const handleViewAgenda = (notification) => {
  ElMessage.info('查看纪要功能开发中')
}

const handleDownload = (notification) => {
  ElMessage.success('下载中...')
}

const handleSnooze = () => {
  ElMessage.success('已设置延后15分钟提醒')
}

const handleComment = () => {
  ElMessage.info('评论功能开发中')
}

const handleBatchMarkRead = () => {
  selectedNotifications.value.forEach(n => {
    n.isRead = true
  })
  ElMessage.success(`已标记 ${selectedNotifications.value.length} 条通知为已读`)
  selectedNotifications.value = []
  selectedNotificationIds.value = []
  updateCategoryCounts()
}

const handleBatchConfirm = () => {
  const pendingNotifications = selectedNotifications.value.filter(n => n.status === 'pending')
  if (pendingNotifications.length === 0) {
    ElMessage.warning('请选择待确认的会议邀请')
    return
  }

  ElMessageBox.confirm(`确认参加选中的 ${pendingNotifications.length} 个会议吗？`, '批量回执', {
    confirmButtonText: '确认参加',
    cancelButtonText: '取消',
    type: 'info'
  }).then(() => {
    pendingNotifications.forEach(n => {
      n.status = 'confirmed'
      n.statusLabel = '已确认'
      n.isRead = true
    })
    ElMessage.success('批量确认成功')
    selectedNotifications.value = []
    selectedNotificationIds.value = []
    updateCategoryCounts()
  }).catch(() => {})
}

const handleExport = () => {
  ElMessage.success('导出功能开发中')
}

const handleClearRead = () => {
  ElMessageBox.confirm('确认清空所有已读通知吗？（通知将被归档，可在全部通知中查询）', '提示', {
    confirmButtonText: '确认清空',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const readNotifications = allNotifications.value.filter(n => n.isRead)
    readNotifications.forEach(n => {
      n.isArchived = true
    })
    ElMessage.success('已清空已读通知')
    updateCategoryCounts()
  }).catch(() => {})
}

const handleSaveSettings = (settings) => {
  ElMessage.success('设置已保存')
  showSettings.value = false
}

const markAsRead = (id) => {
  const notification = allNotifications.value.find(n => n.id === id)
  if (notification && !notification.isRead) {
    notification.isRead = true
    updateCategoryCounts()
  }
}

const updateCategoryCounts = () => {
  const pending = allNotifications.value.filter(n => n.status === 'pending' && !n.isRead).length
  const reminder = allNotifications.value.filter(n => n.type === 'reminder').length
  const change = allNotifications.value.filter(n => n.type === 'change').length
  const agenda = allNotifications.value.filter(n => n.type === 'agenda').length
  const processed = allNotifications.value.filter(n => n.isRead).length

  categories.value[0].count = pending
  categories.value[1].count = reminder
  categories.value[2].count = change
  categories.value[3].count = agenda
  categories.value[4].count = processed
  categories.value[5].count = allNotifications.value.length
}
</script>

<style lang="scss" scoped>
.meeting-notification-container {
  padding: 0;
  background: #f5f7fa;
  height: calc(100vh - 60px);
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background: #fff;
    border-bottom: 1px solid #ebeef5;
    flex-shrink: 0;

    .header-left,
    .header-right {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }

  .main-content {
    flex: 1;
    display: flex;
    gap: 0;
    overflow: hidden;

    .center-panel {
      flex: 1;
      background: #fff;
      overflow-y: auto;
      padding: 16px;

      .list-toolbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
        padding-bottom: 16px;
        border-bottom: 1px solid #ebeef5;
      }

      .pagination-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 16px;
        padding-top: 16px;
        border-top: 1px solid #ebeef5;

        .stats-info {
          font-size: 13px;
          color: #909399;
        }
      }
    }
  }
}
</style>
