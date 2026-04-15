<template>
  <div class="create-meeting-page">
    <!-- 顶部操作栏 -->
    <PageHeader
        @close="handleClose"
        @save-draft="handleSaveDraft"
        @preview="handlePreview"
        @submit="handleSubmit"
        :submitting="submitting"
    />

    <!-- 主内容区 -->
    <div class="main-content">
      <!-- 中间表单核心区 -->
      <div class="form-section">
        <el-form :model="meetingForm" :rules="rules" ref="formRef" label-width="120px" label-position="right">

          <!-- 第一区域：基础信息 -->
          <BasicInfoCard
              v-model:form="meetingForm"
              @select-room="showRoomSelector = true"
              @apply-template="applyTemplate"
              @show-history="showHistoryTitles = true"
          />

          <!-- 第二区域：参会信息 -->
          <AttendeeInfoCard
              v-model:form="meetingForm"
              @select-attendees="showAttendeeSelector = true"
              @select-cc="showCCSelector = true"
              @remove-attendee="removeAttendee"
              @remove-cc="removeCCUser"
          />

          <!-- 第三区域：高级设置 -->
          <AdvancedSettingsCard
              v-model:form="meetingForm"
              :is-admin="isAdmin"
              :is-executive="isExecutive"
          />

          <!-- 第四区域：关联资源 -->
          <ResourceCard
              v-model:form="meetingForm"
              v-model:file-list="fileList"
              @file-change="handleFileChange"
              @file-remove="handleFileRemove"
          />
        </el-form>
      </div>

      <!-- 右侧辅助栏 -->
      <div class="sidebar">
        <Sidebar
            :templates="templates"
            :faqs="faqs"
            :is-admin="isAdmin"
            :is-department-head="isDepartmentHead"
            @apply-template="applyTemplate"
            @sync-calendar="handleSyncToCalendar"
            @batch-import="handleBatchImport"
            @view-rooms="handleViewRoomBooking"
        />
      </div>
    </div>

    <!-- 会议室选择弹窗 -->
    <RoomSelector
        v-model="showRoomSelector"
        :rooms="rooms"
        @confirm="handleConfirmRoom"
    />

    <!-- 参会人选择弹窗 -->
    <AttendeeSelector
        v-model="showAttendeeSelector"
        :all-attendees="allAttendees"
        @confirm="handleConfirmAttendees"
    />

    <!-- 抄送人选择弹窗 -->
    <CCSelector
        v-model="showCCSelector"
        :all-users="allAttendees"
        @confirm="handleConfirmCC"
    />

    <!-- 历史标题弹窗 -->
    <HistoryTitlesDialog
        v-model="showHistoryTitles"
        :history-titles="historyTitles"
        @select="handleSelectHistoryTitle"
    />

    <!-- 预览弹窗 -->
    <PreviewDialog
        v-model="showPreview"
        :form="meetingForm"
        @submit="handleSubmit"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import PageHeader from './components/PageHeader.vue'
import BasicInfoCard from './components/BasicInfoCard.vue'
import AttendeeInfoCard from './components/AttendeeInfoCard.vue'
import AdvancedSettingsCard from './components/AdvancedSettingsCard.vue'
import ResourceCard from './components/ResourceCard.vue'
import Sidebar from './components/Sidebar.vue'
import RoomSelector from './components/RoomSelector.vue'
import AttendeeSelector from './components/AttendeeSelector.vue'
import CCSelector from './components/CCSelector.vue'
import HistoryTitlesDialog from './components/HistoryTitlesDialog.vue'
import PreviewDialog from './components/PreviewDialog.vue'

// 角色权限
const isAdmin = ref(true)
const isExecutive = ref(false)
const isDepartmentHead = ref(true)

const formRef = ref(null)
const submitting = ref(false)

// 表单数据
const meetingForm = reactive({
  title: '',
  type: '',
  meetingFormat: 'offline',
  roomId: '',
  roomName: '',
  roomCapacity: '',
  roomLocation: '',
  onlineUrl: '',
  timeRange: [],
  department: '技术部',
  description: '',
  attendees: [],
  ccUsers: [],
  hostId: '',
  remindTime: '30min',
  repeatType: 'none',
  repeatEndType: 'count',
  repeatCount: 1,
  repeatEndDate: '',
  skipHolidays: false,
  priority: 'medium',
  requireCheckin: false,
  checkinStartTime: '',
  checkinEndTime: '',
  minutesOwner: '',
  minutesDeadline: 1,
  minutesVisibility: 'attendees',
  allowCrossDay: false,
  isSecret: false,
  syncToCalendar: true,
  equipments: []
})

const rules = {
  title: [{ required: true, message: '请输入会议标题', trigger: 'blur' }],
  type: [{ required: true, message: '请选择会议类型', trigger: 'change' }],
  meetingFormat: [{ required: true, message: '请选择会议形式', trigger: 'change' }],
  timeRange: [{ required: true, message: '请选择会议时间', trigger: 'change' }],
  department: [{ required: true, message: '请选择发起部门', trigger: 'change' }],
  attendees: [
    {
      required: true,
      message: '请选择至少1位参会人',
      trigger: 'change',
      validator: (rule, value, callback) => {
        if (value.length === 0) {
          callback(new Error('请选择至少1位参会人'))
        } else {
          callback()
        }
      }
    }
  ]
}

// 会议室数据
const rooms = ref([
  {
    id: 'room101',
    name: '会议室-101',
    capacity: 10,
    location: '1楼东侧',
    status: 'available',
    floor: '1F',
    equipments: ['投影仪', '白板']
  },
  {
    id: 'room201',
    name: '技术部会议室',
    capacity: 15,
    location: '2楼201',
    status: 'occupied',
    floor: '2F',
    equipments: ['投影仪', '白板', '无线麦']
  },
  {
    id: 'room301',
    name: '大报告厅',
    capacity: 50,
    location: '3楼东侧',
    status: 'available',
    floor: '3F',
    equipments: ['投影仪', '视频会议', '直播设备', '无线麦']
  }
])

// 参会人数据
const allAttendees = ref([
  { id: 'u1', name: '张三', department: '技术部', position: '前端工程师', status: 'online', selected: false, attendeeType: 'optional' },
  { id: 'u2', name: '李四', department: '技术部', position: '后端工程师', status: 'online', selected: false, attendeeType: 'optional' },
  { id: 'u3', name: '王五', department: '产品部', position: '产品经理', status: 'offline', selected: false, attendeeType: 'optional' },
  { id: 'u4', name: '赵六', department: '销售部', position: '销售经理', status: 'online', selected: false, attendeeType: 'optional' },
  { id: 'u5', name: '孙七', department: '行政部', position: '行政专员', status: 'online', selected: false, attendeeType: 'optional' }
])

// 其他状态
const showRoomSelector = ref(false)
const showAttendeeSelector = ref(false)
const showCCSelector = ref(false)
const showHistoryTitles = ref(false)
const showPreview = ref(false)
const fileList = ref([])

const historyTitles = ref([
  '2026年4月技术部周例会',
  'Q2产品需求评审会',
  '新员工培训会议',
  '年度总结大会'
])

// 模板数据
const templates = ref([
  { id: 't1', name: '部门例会模板', description: '每周固定时间召开，包含工作汇报、问题讨论' },
  { id: 't2', name: '项目评审会模板', description: '包含需求评审、技术方案、风险评估' },
  { id: 't3', name: '培训会议模板', description: '包含培训主题、讲师、培训材料' },
  { id: 't4', name: '高管会议模板', description: '包含高管专属议题、涉密信息' }
])

// FAQ数据
const faqs = ref([
  { id: 1, question: '如何关联会议室？', answer: '在"基础信息"中选择"线下会议"或"混合会议"，点击"选择会议室"按钮即可。', expanded: false },
  { id: 2, question: '必填参会人如何设置？', answer: '在选择参会人弹窗中，勾选"必填"即可设置为必填参会人，提交后会反复提醒直至确认。', expanded: false },
  { id: 3, question: '重复会议如何取消？', answer: '取消时可选择"取消单次会议"或"取消所有重复会议"，避免误操作。', expanded: false }
])

onMounted(() => {
  // 初始化数据
})

const handleClose = () => {
  ElMessageBox.confirm('是否保存为草稿？', '提示', {
    confirmButtonText: '保存草稿',
    cancelButtonText: '不保存',
    distinguishCancelAndClose: true,
    type: 'warning'
  }).then(() => {
    handleSaveDraft()
  }).catch((action) => {
    if (action === 'cancel') {
      // 关闭页面
    }
  })
}

const handleSaveDraft = () => {
  ElMessage.success('草稿已保存')
}

const handlePreview = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      showPreview.value = true
    } else {
      ElMessage.warning('请完善必填信息后再预览')
    }
  })
}

const handleSubmit = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      submitting.value = true
      setTimeout(() => {
        ElMessage.success('会议创建成功')
        submitting.value = false
      }, 1000)
    }
  })
}

const handleFileChange = (file, files) => {
  fileList.value = files
}

const handleFileRemove = (file, files) => {
  fileList.value = files
}

const handleConfirmRoom = (room) => {
  meetingForm.roomId = room.id
  meetingForm.roomName = room.name
  meetingForm.roomCapacity = room.capacity
  meetingForm.roomLocation = room.location
  ElMessage.success('会议室选择成功')
}

const handleConfirmAttendees = (selectedAttendees) => {
  meetingForm.attendees = selectedAttendees
  ElMessage.success(`已选择 ${meetingForm.attendees.length} 位参会人`)
}

const handleConfirmCC = (selectedUsers) => {
  meetingForm.ccUsers = selectedUsers
  ElMessage.success(`已选择 ${meetingForm.ccUsers.length} 位抄送人`)
}

const removeAttendee = (attendee) => {
  meetingForm.attendees = meetingForm.attendees.filter(a => a.id !== attendee.id)
}

const removeCCUser = (user) => {
  meetingForm.ccUsers = meetingForm.ccUsers.filter(u => u.id !== user.id)
}

const applyTemplate = (templateId) => {
  const template = templates.value.find(t => t.id === templateId)
  if (template) {
    if (templateId === 'meeting') {
      meetingForm.description = '会议议程：\n1. 上周工作回顾\n2. 本周工作计划\n3. 问题讨论\n4. 其他事项'
    } else if (template.id === 't1') {
      meetingForm.type = 'department'
      meetingForm.description = '会议议程：\n1. 上周工作回顾\n2. 本周工作计划\n3. 问题讨论'
    } else if (template.id === 't2') {
      meetingForm.type = 'project'
      meetingForm.description = '会议议程：\n1. 需求评审\n2. 技术方案讨论\n3. 风险评估'
    }
    ElMessage.success('模板应用成功')
  }
}

const handleSyncToCalendar = () => {
  meetingForm.syncToCalendar = true
  ElMessage.success('已关联我的日程')
}

const handleBatchImport = () => {
  ElMessage.info('批量导入功能开发中')
}

const handleViewRoomBooking = () => {
  ElMessage.info('跳转至会议室预约页面')
}

const handleSelectHistoryTitle = (title) => {
  meetingForm.title = title
  showHistoryTitles.value = false
}
</script>

<style lang="scss" scoped>
.create-meeting-page {
  padding: 20px;
  background: #f5f7fa;
  min-height: calc(100vh - 60px);

  .main-content {
    display: flex;
    gap: 16px;

    .form-section {
      flex: 1;
    }

    .sidebar {
      width: 300px;
    }
  }
}
</style>
