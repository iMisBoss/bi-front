<template>
  <div class="room-booking-page">
    <!-- 顶部操作栏 -->
    <PageHeader
        v-model:currentView="currentView"
        v-model:searchKeyword="searchKeyword"
        v-model:floorFilter="floorFilter"
        v-model:capacityFilter="capacityFilter"
        :myBookingsCount="myBookings.length"
        :pendingBookingsCount="pendingBookings.length"
        :isAdmin="isAdmin"
        @view-change="handleViewChange"
        @search="handleSearch"
        @book-now="handleBookNow"
        @refresh="handleRefresh"
        @room-manage="handleRoomManage"
        @export-report="handleExportReport"
    />

    <!-- 主内容区 -->
    <div class="main-content">
      <!-- 左侧会议室资源栏 -->
      <RoomResourceList
          v-if="currentView === 'all'"
          :roomGroups="roomGroups"
          :selectedRoom="selectedRoom"
          :floorFilter="floorFilter"
          :capacityFilter="capacityFilter"
          @select-room="selectRoom"
      />

      <!-- 中间核心日历区 -->
      <CalendarView
          v-if="currentView === 'all'"
          v-model:calendarView="calendarView"
          :currentDate="currentDate"
          :filteredAllRooms="filteredAllRooms"
          :selectedRoom="selectedRoom"
          :weekDays="weekDays"
          :dayHours="dayHours"
          :bookings="bookings"
          @navigate-date="navigateDate"
          @go-to-today="goToToday"
          @slot-click="handleSlotClick"
          @select-room="selectRoom"
      />

      <!-- 我的预约列表 -->
      <MyBookingsList
          v-if="currentView === 'my'"
          :myBookings="myBookings"
          :loading="loading"
          @view-detail="viewBookingDetail"
          @edit-booking="editBooking"
          @cancel-booking="cancelBooking"
          @withdraw-booking="withdrawBooking"
      />

      <!-- 待审批列表 -->
      <PendingApprovalList
          v-if="currentView === 'pending'"
          :pendingBookings="pendingBookings"
          :loading="loading"
          :selectedRows="selectedRows"
          @selection-change="handleSelectionChange"
          @view-detail="viewBookingDetail"
          @approve-booking="approveBooking"
          @batch-approve="batchApprove"
      />
    </div>

    <!-- 右侧侧边抽屉 -->
    <BookingDrawer
        v-model:visible="drawerVisible"
        :drawerMode="drawerMode"
        :drawerTitle="drawerTitle"
        :bookingForm="bookingForm"
        :bookingRules="bookingRules"
        :fileList="fileList"
        :currentBooking="currentBooking"
        :canApprove="canApprove"
        v-model:approvalComment="approvalComment"
        @file-change="handleFileChange"
        @file-remove="handleFileRemove"
        @submit-booking="handleSubmitBooking"
        @update-booking="handleUpdateBooking"
        @submit-approval="submitApproval"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import PageHeader from './components/PageHeader.vue'
import RoomResourceList from './components/RoomResourceList.vue'
import CalendarView from './components/CalendarView.vue'
import MyBookingsList from './components/MyBookingsList.vue'
import PendingApprovalList from './components/PendingApprovalList.vue'
import BookingDrawer from './components/BookingDrawer.vue'

// 角色权限
const isAdmin = ref(true)
const canApprove = ref(true)

const currentView = ref('all')
const calendarView = ref('week')
const currentDate = ref(new Date())
const selectedRoom = ref(null)
const drawerVisible = ref(false)
const drawerMode = ref('create')
const drawerTitle = ref('新建预约')
const loading = ref(false)
const searchKeyword = ref('')
const floorFilter = ref('')
const capacityFilter = ref('')
const fileList = ref([])
const selectedRows = ref([])
const approvalComment = ref('')

const currentBooking = ref({})

// 会议室数据
const roomGroups = ref([
  {
    id: '1f',
    name: '1楼 公共会议室',
    rooms: [
      {
        id: 'room101',
        name: '大会议室-A101',
        capacity: 20,
        location: '1楼东侧',
        status: 'available',
        floor: '1F',
        equipments: ['投影仪', '视频会议', '白板']
      },
      {
        id: 'room102',
        name: '小会议室-A102',
        capacity: 8,
        location: '1楼西侧',
        status: 'occupied',
        floor: '1F',
        equipments: ['投影仪', '白板']
      }
    ]
  },
  {
    id: '2f',
    name: '2楼 部门会议室',
    rooms: [
      {
        id: 'room201',
        name: '研发部会议室',
        capacity: 15,
        location: '2楼201',
        status: 'available',
        floor: '2F',
        equipments: ['投影仪', '白板', '无线麦']
      },
      {
        id: 'room202',
        name: '财务部会议室',
        capacity: 10,
        location: '2楼202',
        status: 'maintenance',
        floor: '2F',
        equipments: ['投影仪']
      }
    ]
  },
  {
    id: '3f',
    name: '3楼 大型报告厅',
    rooms: [
      {
        id: 'room301',
        name: '大报告厅',
        capacity: 100,
        location: '3楼东侧',
        status: 'available',
        floor: '3F',
        equipments: ['投影仪', '视频会议', '直播设备', '无线麦', '白板']
      }
    ]
  },
  {
    id: 'executive',
    name: '高管层 专属会议室',
    rooms: [
      {
        id: 'room_exec1',
        name: '高管会议室-E01',
        capacity: 12,
        location: '高管层',
        status: 'locked',
        floor: 'executive',
        equipments: ['投影仪', '视频会议', '白板', '无线麦']
      }
    ]
  }
])

// 预约数据
const bookings = ref([
  {
    id: 1,
    roomId: 'room101',
    roomName: '大会议室-A101',
    title: '技术部周例会',
    booker: '张三',
    department: '技术部',
    startTime: '2026-04-15 14:00',
    endTime: '2026-04-15 15:30',
    attendeeCount: 8,
    attendees: ['张三', '李四', '王五'],
    reason: '本周工作进度汇报',
    approvalStatus: 'approved',
    approvalStatusName: '已通过',
    isMine: true,
    approvalFlow: [
      { id: 1, node: '提交申请', approver: '张三', result: '已提交', time: '2026-04-14 10:00', type: 'success' },
      { id: 2, node: '部门审批', approver: '李经理', result: '通过', time: '2026-04-14 11:30', type: 'success', comment: '同意' }
    ],
    logs: [
      { id: 1, time: '2026-04-14 10:00', content: '张三 创建预约' },
      { id: 2, time: '2026-04-14 11:30', content: '李经理 审批通过' }
    ]
  },
  {
    id: 2,
    roomId: 'room201',
    roomName: '研发部会议室',
    title: '产品需求评审',
    booker: '李四',
    department: '产品部',
    startTime: '2026-04-16 10:00',
    endTime: '2026-04-16 11:30',
    attendeeCount: 6,
    attendees: ['李四', '赵六'],
    reason: 'Q2产品需求评审',
    approvalStatus: 'pending',
    approvalStatusName: '待审批',
    isMine: false,
    approvalFlow: [
      { id: 1, node: '提交申请', approver: '李四', result: '已提交', time: '2026-04-15 09:00', type: 'warning' }
    ],
    logs: [
      { id: 1, time: '2026-04-15 09:00', content: '李四 创建预约' }
    ]
  }
])

const myBookings = ref([
  {
    id: 1,
    roomName: '大会议室-A101',
    title: '技术部周例会',
    startTime: '2026-04-15 14:00',
    endTime: '2026-04-15 15:30',
    approvalStatus: 'approved',
    approvalStatusName: '已通过',
    isMine: true
  },
  {
    id: 2,
    roomName: '研发部会议室',
    title: '项目启动会',
    startTime: '2026-04-16 10:00',
    endTime: '2026-04-16 11:30',
    approvalStatus: 'pending',
    approvalStatusName: '待审批',
    isMine: true
  }
])

const pendingBookings = ref([
  {
    id: 2,
    booker: '李四',
    roomName: '研发部会议室',
    title: '产品需求评审',
    startTime: '2026-04-16 10:00',
    endTime: '2026-04-16 11:30',
    approvalStatus: 'pending',
    approvalStatusName: '待审批'
  }
])

const bookingForm = reactive({
  roomId: '',
  roomName: '',
  title: '',
  department: '技术部',
  timeRange: [],
  attendeeCount: 1,
  attendees: [],
  reason: '',
  repeatType: 'none',
  remindTime: '30min',
  requireCheckin: false,
  autoReleaseMinutes: 15,
  needApproval: 'none'
})

const bookingRules = {
  roomId: [{ required: true, message: '请选择会议室', trigger: 'change' }],
  title: [{ required: true, message: '请输入预约主题', trigger: 'blur' }],
  timeRange: [{ required: true, message: '请选择使用时间', trigger: 'change' }]
}

const weekDays = computed(() => {
  const days = []
  const current = new Date(currentDate.value)
  const dayOfWeek = current.getDay()
  const monday = new Date(current)
  monday.setDate(current.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))

  for (let i = 0; i < 7; i++) {
    const date = new Date(monday)
    date.setDate(monday.getDate() + i)
    const isToday = date.toDateString() === new Date().toDateString()
    days.push({
      date: date.toISOString().split('T')[0],
      name: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'][i],
      isToday
    })
  }
  return days
})

const dayHours = computed(() => {
  const hours = []
  for (let i = 8; i <= 20; i++) {
    hours.push(i)
  }
  return hours
})

const filteredAllRooms = computed(() => {
  let rooms = []
  roomGroups.value.forEach(group => {
    rooms = rooms.concat(group.rooms)
  })

  if (floorFilter.value) {
    rooms = rooms.filter(room => room.floor === floorFilter.value)
  }

  if (capacityFilter.value) {
    const cap = parseInt(capacityFilter.value)
    rooms = rooms.filter(room => {
      if (cap === 5) return room.capacity <= 5
      if (cap === 10) return room.capacity > 5 && room.capacity <= 10
      if (cap === 20) return room.capacity > 10 && room.capacity <= 20
      return room.capacity > 20
    })
  }

  return rooms
})

onMounted(() => {
  loadData()
})

const loadData = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 300)
}

const handleViewChange = () => {
  loadData()
}

const handleSearch = () => {
  loadData()
}

const handleRefresh = () => {
  loadData()
  ElMessage.success('刷新成功')
}

const handleBookNow = () => {
  resetBookingForm()
  drawerMode.value = 'create'
  drawerTitle.value = '新建会议室预约'
  drawerVisible.value = true
}

const handleRoomManage = () => {
  ElMessage.info('会议室管理功能开发中')
}

const handleExportReport = () => {
  ElMessage.success('报表导出成功')
}

const navigateDate = (direction) => {
  const date = new Date(currentDate.value)
  if (calendarView.value === 'week') {
    date.setDate(date.getDate() + (direction === 'next' ? 7 : -7))
  } else {
    date.setDate(date.getDate() + (direction === 'next' ? 1 : -1))
  }
  currentDate.value = date
}

const goToToday = () => {
  currentDate.value = new Date()
}

const selectRoom = (room) => {
  selectedRoom.value = selectedRoom.value === room.id ? null : room.id
}

const handleSlotClick = (room, date, time) => {
  bookingForm.roomId = room.id
  bookingForm.roomName = room.name
  bookingForm.timeRange = [new Date(time), new Date(new Date(time).getTime() + 60 * 60 * 1000)]
  drawerMode.value = 'create'
  drawerTitle.value = '新建会议室预约'
  drawerVisible.value = true
}

const viewBookingDetail = (row) => {
  currentBooking.value = row
  drawerMode.value = 'view'
  drawerTitle.value = '预约详情'
  drawerVisible.value = true
}

const editBooking = (row) => {
  currentBooking.value = row
  bookingForm.roomId = row.roomId
  bookingForm.roomName = row.roomName
  bookingForm.title = row.title
  bookingForm.department = row.department
  bookingForm.reason = row.reason
  drawerMode.value = 'edit'
  drawerTitle.value = '编辑预约'
  drawerVisible.value = true
}

const cancelBooking = (row) => {
  ElMessageBox.confirm('确认取消此预约吗？', '提示', {
    confirmButtonText: '确认取消',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('预约已取消')
    loadData()
  }).catch(() => {})
}

const withdrawBooking = (row) => {
  ElMessageBox.confirm('确认撤销此申请吗？', '提示', {
    confirmButtonText: '确认撤销',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('申请已撤销')
    loadData()
  }).catch(() => {})
}

const approveBooking = (row, action) => {
  if (action === 'reject') {
    ElMessageBox.prompt('请填写驳回原因', '驳回预约', {
      confirmButtonText: '确认驳回',
      cancelButtonText: '取消',
      inputPattern: /.+/,
      inputErrorMessage: '驳回原因不能为空'
    }).then(({ value }) => {
      ElMessage.success('已驳回')
      loadData()
    }).catch(() => {})
  } else {
    ElMessageBox.confirm('确认通过此预约吗？', '提示', {
      confirmButtonText: '确认通过',
      cancelButtonText: '取消',
      type: 'info'
    }).then(() => {
      ElMessage.success('已通过')
      loadData()
    }).catch(() => {})
  }
}

const handleSelectionChange = (selection) => {
  selectedRows.value = selection
}

const batchApprove = (action) => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请选择要审批的预约')
    return
  }
  ElMessage.success(`批量${action === 'approve' ? '通过' : '驳回'}成功`)
}

const submitApproval = (action) => {
  if (action === 'reject' && !approvalComment.value) {
    ElMessage.warning('请填写驳回原因')
    return
  }
  ElMessage.success(action === 'approve' ? '审批通过' : '已驳回')
  drawerVisible.value = false
}

const handleSubmitBooking = () => {
  ElMessage.success('预约提交成功')
  drawerVisible.value = false
  loadData()
}

const handleUpdateBooking = () => {
  ElMessage.success('修改保存成功')
  drawerVisible.value = false
  loadData()
}

const handleFileChange = (file) => {
  // 处理文件
}

const handleFileRemove = (file) => {
  // 处理文件移除
}

const resetBookingForm = () => {
  bookingForm.roomId = ''
  bookingForm.roomName = ''
  bookingForm.title = ''
  bookingForm.department = '技术部'
  bookingForm.timeRange = []
  bookingForm.attendeeCount = 1
  bookingForm.attendees = []
  bookingForm.reason = ''
  bookingForm.repeatType = 'none'
  bookingForm.remindTime = '30min'
  bookingForm.requireCheckin = false
  bookingForm.autoReleaseMinutes = 15
  bookingForm.needApproval = 'none'
  fileList.value = []
}
</script>

<style lang="scss" scoped>
.room-booking-page {
  padding: 0;
  background: #f5f7fa;
  height: calc(100vh - 60px);
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .main-content {
    flex: 1;
    display: flex;
    gap: 0;
    overflow: hidden;
    padding: 12px;
  }
}
</style>
