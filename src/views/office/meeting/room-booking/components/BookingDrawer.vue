<template>
  <el-drawer
      :model-value="visible"
      @update:model-value="$emit('update:visible', $event)"
      :title="drawerTitle"
      size="700px"
      :close-on-click-modal="false"
  >
    <div class="drawer-content">
      <el-alert
          v-if="drawerMode === 'create' || drawerMode === 'edit'"
          title="* 为必填项"
          type="info"
          :closable="false"
          show-icon
          style="margin-bottom: 16px"
      />

      <!-- 新建预约表单 -->
      <el-form
          v-if="drawerMode === 'create' || drawerMode === 'edit'"
          :model="bookingForm"
          :rules="bookingRules"
          ref="bookingFormRef"
          label-width="110px"
          class="booking-form"
      >
        <el-divider content-position="left">基础信息（必填）</el-divider>

        <el-form-item label="会议室" prop="roomId">
          <el-select
              v-model="bookingForm.roomId"
              placeholder="请选择会议室"
              style="width: 100%"
              @change="handleRoomChange"
          >
            <el-option
                v-for="room in availableRooms"
                :key="room.id"
                :label="`${room.name}（${room.capacity}人）`"
                :value="room.id"
                :disabled="room.status === 'maintenance' || room.status === 'locked'"
            >
              <span>{{ room.name }}</span>
              <span style="float: right; color: #8492a6; font-size: 13px">{{ room.capacity }}人</span>
            </el-option>
          </el-select>
        </el-form-item>

        <!-- 冲突提示 -->
        <el-alert
            v-if="hasConflict"
            :title="conflictMessage"
            type="error"
            :closable="false"
            show-icon
            style="margin-bottom: 16px"
        />

        <el-form-item label="预约主题" prop="title">
          <el-input
              v-model="bookingForm.title"
              placeholder="请输入使用事由（如：部门例会/面试）"
              maxlength="50"
              show-word-limit
          />
        </el-form-item>

        <el-form-item label="使用类型" prop="usageType">
          <el-select v-model="bookingForm.usageType" placeholder="请选择" style="width: 100%">
            <el-option label="会议" value="meeting" />
            <el-option label="面试" value="interview" />
            <el-option label="培训" value="training" />
            <el-option label="临时讨论" value="discussion" />
            <el-option label="活动" value="activity" />
          </el-select>
        </el-form-item>

        <el-form-item label="使用部门" prop="department">
          <el-select v-model="bookingForm.department" placeholder="请选择" style="width: 100%">
            <el-option label="技术部" value="技术部" />
            <el-option label="产品部" value="产品部" />
            <el-option label="行政部" value="行政部" />
            <el-option label="财务部" value="财务部" />
            <el-option label="市场部" value="市场部" />
          </el-select>
        </el-form-item>

        <el-form-item label="预约人" prop="booker">
          <el-input v-model="bookingForm.booker" placeholder="默认为当前用户" />
        </el-form-item>

        <el-form-item label="时间范围" prop="timeRange">
          <el-date-picker
              v-model="bookingForm.timeRange"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              :disabled-date="disabledDate"
              :default-time="defaultTime"
              style="width: 100%"
              @change="handleTimeChange"
          />
        </el-form-item>

        <el-form-item label="时长限制" v-if="bookingForm.timeRange && bookingForm.timeRange.length === 2">
          <el-tag :type="durationWarning ? 'warning' : 'success'">
            {{ durationText }}
          </el-tag>
        </el-form-item>

        <el-divider content-position="left">参会信息</el-divider>

        <el-form-item label="参会人" prop="attendees">
          <el-button type="primary" plain @click="showAttendeeDialog = true">
            <el-icon><User /></el-icon>
            选择参会人
          </el-button>
          <el-tag
              v-for="attendee in bookingForm.attendees"
              :key="attendee.id"
              closable
              @close="removeAttendee(attendee.id)"
              style="margin: 4px"
          >
            {{ attendee.name }}
          </el-tag>
          <div class="attendee-count" v-if="bookingForm.attendees.length > 0">
            共 {{ bookingForm.attendees.length }} 人
          </div>
        </el-form-item>

        <el-form-item label="会议说明">
          <el-input
              v-model="bookingForm.reason"
              type="textarea"
              :rows="4"
              placeholder="填写会议议程、面试详情等（选填）"
          />
        </el-form-item>

        <el-form-item label="附件上传">
          <el-upload
              action="#"
              :auto-upload="false"
              :on-change="handleFileChange"
              :on-remove="handleFileRemove"
              :file-list="fileList"
              :limit="3"
          >
            <el-button size="small" type="primary">
              <el-icon><Upload /></el-icon>
              选择文件
            </el-button>
            <template #tip>
              <div style="font-size: 12px; color: #909399">支持内网本地存储，最多3个文件</div>
            </template>
          </el-upload>
        </el-form-item>

        <el-divider content-position="left">高级设置</el-divider>

        <el-form-item label="是否重复">
          <el-select v-model="bookingForm.repeatType" placeholder="请选择" style="width: 100%">
            <el-option label="单次预约" value="none" />
            <el-option label="每日重复" value="daily" />
            <el-option label="每周重复" value="weekly" />
            <el-option label="每月重复" value="monthly" />
          </el-select>
        </el-form-item>

        <el-form-item label="重复结束" v-if="bookingForm.repeatType !== 'none'">
          <el-radio-group v-model="bookingForm.repeatEndType">
            <el-radio value="count">重复次数</el-radio>
            <el-radio value="date">截止日期</el-radio>
          </el-radio-group>
          <el-input-number
              v-if="bookingForm.repeatEndType === 'count'"
              v-model="bookingForm.repeatCount"
              :min="1"
              :max="100"
              style="margin-left: 12px"
          />
          <el-date-picker
              v-if="bookingForm.repeatEndType === 'date'"
              v-model="bookingForm.repeatEndDate"
              type="date"
              placeholder="选择截止日期"
              style="margin-left: 12px"
          />
        </el-form-item>

        <el-form-item label="跳过节假日" v-if="bookingForm.repeatType !== 'none'">
          <el-switch v-model="bookingForm.skipHoliday" />
        </el-form-item>

        <el-form-item label="提前提醒">
          <el-select v-model="bookingForm.remindTime" placeholder="请选择" style="width: 100%">
            <el-option label="不提醒" value="none" />
            <el-option label="提前5分钟" value="5min" />
            <el-option label="提前10分钟" value="10min" />
            <el-option label="提前30分钟" value="30min" />
            <el-option label="提前1小时" value="1hour" />
            <el-option label="提前1天" value="1day" />
          </el-select>
        </el-form-item>

        <el-form-item label="签到设置">
          <el-switch v-model="bookingForm.requireCheckin" />
          <span style="margin-left: 8px; font-size: 12px; color: #909399">开启签到功能</span>
        </el-form-item>

        <el-form-item label="签到配置" v-if="bookingForm.requireCheckin">
          <div class="checkin-config">
            <div class="config-item">
              <span class="label">签到开始：</span>
              <el-select v-model="bookingForm.checkinStartTime" placeholder="请选择" style="width: 140px">
                <el-option label="提前5分钟" value="5" />
                <el-option label="提前10分钟" value="10" />
                <el-option label="提前15分钟" value="15" />
                <el-option label="提前30分钟" value="30" />
              </el-select>
            </div>
            <div class="config-item">
              <span class="label">迟到禁签：</span>
              <el-select v-model="bookingForm.checkinLateLimit" placeholder="请选择" style="width: 140px">
                <el-option label="迟到5分钟" value="5" />
                <el-option label="迟到10分钟" value="10" />
                <el-option label="迟到15分钟" value="15" />
                <el-option label="迟到30分钟" value="30" />
              </el-select>
            </div>
            <div class="config-item">
              <span class="label">签到方式：</span>
              <el-radio-group v-model="bookingForm.checkinMethod">
                <el-radio value="qrcode">二维码</el-radio>
                <el-radio value="manual">手动签到</el-radio>
              </el-radio-group>
            </div>
          </div>
        </el-form-item>

        <el-form-item label="自动释放" v-if="bookingForm.requireCheckin">
          <el-alert
              title="15分钟未签到自动释放会议室，避免资源浪费"
              type="warning"
              :closable="false"
              show-icon
          />
        </el-form-item>

        <el-form-item label="审批信息">
          <el-alert
              :title="approvalInfoText"
              :type="needApproval ? 'warning' : 'success'"
              :closable="false"
              show-icon
          />
        </el-form-item>
      </el-form>

      <!-- 查看详情 -->
      <div v-if="drawerMode === 'view'" class="booking-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="会议室">{{ currentBooking.roomName }}</el-descriptions-item>
          <el-descriptions-item label="预约主题">{{ currentBooking.title }}</el-descriptions-item>
          <el-descriptions-item label="使用类型">{{ usageTypeText(currentBooking.usageType) }}</el-descriptions-item>
          <el-descriptions-item label="使用部门">{{ currentBooking.department }}</el-descriptions-item>
          <el-descriptions-item label="预约人">{{ currentBooking.booker }}</el-descriptions-item>
          <el-descriptions-item label="参会人数">{{ currentBooking.attendeeCount }}人</el-descriptions-item>
          <el-descriptions-item label="开始时间">{{ currentBooking.startTime }}</el-descriptions-item>
          <el-descriptions-item label="结束时间">{{ currentBooking.endTime }}</el-descriptions-item>
          <el-descriptions-item label="审批状态" :span="2">
            <el-tag :type="getApprovalStatusType(currentBooking.approvalStatus)">
              {{ currentBooking.approvalStatusName }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="使用事由" :span="2">{{ currentBooking.reason }}</el-descriptions-item>
        </el-descriptions>

        <!-- 审批流程 -->
        <div class="approval-flow" v-if="currentBooking.approvalFlow && currentBooking.approvalFlow.length > 0">
          <h4>审批流程</h4>
          <el-timeline>
            <el-timeline-item
                v-for="step in currentBooking.approvalFlow"
                :key="step.id"
                :timestamp="step.time"
                :type="step.type"
            >
              {{ step.node }} - {{ step.approver }} {{ step.result }}
              <div v-if="step.comment" style="margin-top: 4px; color: #909399; font-size: 12px">
                审批意见：{{ step.comment }}
              </div>
            </el-timeline-item>
          </el-timeline>
        </div>

        <!-- 操作日志 -->
        <div class="operation-log" v-if="currentBooking.logs && currentBooking.logs.length > 0">
          <h4>操作日志</h4>
          <div v-for="log in currentBooking.logs" :key="log.id" class="log-item">
            <span class="log-time">{{ log.time }}</span>
            <span class="log-content">{{ log.content }}</span>
          </div>
        </div>

        <!-- 审批面板（管理员/审批人） -->
        <div class="approval-panel" v-if="currentBooking.approvalStatus === 'pending' && canApprove">
          <el-divider />
          <h4>审批操作</h4>
          <el-form label-width="80px">
            <el-form-item label="审批意见">
              <el-input v-model="localApprovalComment" type="textarea" :rows="3" placeholder="请输入审批意见（驳回时必填）" />
            </el-form-item>
            <el-form-item>
              <el-button type="success" @click="$emit('submit-approval', 'approve')">通过</el-button>
              <el-button type="danger" @click="$emit('submit-approval', 'reject')">驳回</el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </div>

    <!-- 参会人选择弹窗 -->
    <el-dialog
        v-model="showAttendeeDialog"
        title="选择参会人"
        width="600px"
    >
      <div class="attendee-selector">
        <el-input
            v-model="attendeeSearch"
            placeholder="搜索姓名/部门"
            prefix-icon="Search"
            clearable
            style="margin-bottom: 16px"
        />
        <el-tabs v-model="attendeeTab">
          <el-tab-pane label="按部门" name="department">
            <el-tree
                :data="departmentTree"
                show-checkbox
                node-key="id"
                :props="{ label: 'name', children: 'children' }"
                @check="handleAttendeeCheck"
            />
          </el-tab-pane>
          <el-tab-pane label="全部人员" name="all">
            <el-checkbox-group v-model="selectedAttendeeIds">
              <el-checkbox
                  v-for="user in filteredUsers"
                  :key="user.id"
                  :label="user.id"
              >
                {{ user.name }} - {{ user.department }}
              </el-checkbox>
            </el-checkbox-group>
          </el-tab-pane>
        </el-tabs>
      </div>
      <template #footer>
        <el-button @click="showAttendeeDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmAttendees">确定</el-button>
      </template>
    </el-dialog>

    <template #footer>
      <div class="drawer-footer">
        <el-button @click="handleCancel">关闭</el-button>
        <el-button
            v-if="drawerMode === 'create'"
            type="primary"
            @click="handleSubmitBooking"
            :disabled="hasConflict"
        >
          提交预约
        </el-button>
        <el-button
            v-if="drawerMode === 'edit'"
            type="warning"
            @click="handleUpdateBooking"
            :disabled="hasConflict"
        >
          保存修改
        </el-button>
      </div>
    </template>
  </el-drawer>
</template>

<script setup>
import { defineProps, defineEmits, ref, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Upload, User, Search } from '@element-plus/icons-vue'

const props = defineProps({
  visible: Boolean,
  drawerMode: String,
  drawerTitle: String,
  bookingForm: Object,
  bookingRules: Object,
  fileList: Array,
  currentBooking: Object,
  canApprove: Boolean,
  approvalComment: String,
  isAdmin: { type: Boolean, default: false },
  userRole: { type: String, default: 'employee' },
  allRooms: { type: Array, default: () => [] }
})

const emit = defineEmits(['update:visible', 'file-change', 'file-remove', 'submit-booking', 'update-booking', 'submit-approval', 'update:approvalComment'])

const bookingFormRef = ref(null)
const localApprovalComment = ref(props.approvalComment || '')
const hasConflict = ref(false)
const conflictMessage = ref('')
const durationWarning = ref(false)
const durationText = ref('')
const showAttendeeDialog = ref(false)
const attendeeSearch = ref('')
const attendeeTab = ref('department')
const selectedAttendeeIds = ref([])

// 可用会议室列表（根据权限过滤）
const availableRooms = computed(() => {
  if (props.isAdmin || props.userRole === 'executive') {
    return props.allRooms
  }
  return props.allRooms.filter(room => room.floor !== 'executive')
})

// 审批信息文本
const approvalInfoText = computed(() => {
  const room = props.allRooms.find(r => r.id === props.bookingForm.roomId)
  if (!room) return '请选择会议室后查看审批要求'

  if (room.floor === 'executive' || room.capacity > 50) {
    return '本会议室需行政审批 + 部门负责人审批，提交后进入审批流程'
  } else if (room.capacity > 20) {
    return '本会议室需部门负责人审批，提交后进入审批流程'
  } else {
    return '本会议室无需审批，提交后立即生效'
  }
})

const needApproval = computed(() => {
  const room = props.allRooms.find(r => r.id === props.bookingForm.roomId)
  if (!room) return false
  return room.floor === 'executive' || room.capacity > 20
})

// 日期禁用（不能选择过去的日期）
const disabledDate = (time) => {
  return time.getTime() < Date.now() - 8.64e7
}

// 默认时间
const defaultTime = [
  new Date(2000, 1, 1, 9, 0, 0),
  new Date(2000, 1, 1, 17, 0, 0)
]

// 部门树数据
const departmentTree = ref([
  {
    id: 'dept1',
    name: '技术部',
    children: [
      { id: 'user1', name: '张三', department: '技术部' },
      { id: 'user2', name: '李四', department: '技术部' }
    ]
  },
  {
    id: 'dept2',
    name: '产品部',
    children: [
      { id: 'user3', name: '王五', department: '产品部' },
      { id: 'user4', name: '赵六', department: '产品部' }
    ]
  }
])

// 所有用户列表
const allUsers = ref([
  { id: 'user1', name: '张三', department: '技术部' },
  { id: 'user2', name: '李四', department: '技术部' },
  { id: 'user3', name: '王五', department: '产品部' },
  { id: 'user4', name: '赵六', department: '产品部' },
  { id: 'user5', name: '孙七', department: '行政部' }
])

// 过滤后的用户列表
const filteredUsers = computed(() => {
  if (!attendeeSearch.value) return allUsers.value
  const keyword = attendeeSearch.value.toLowerCase()
  return allUsers.value.filter(user =>
      user.name.toLowerCase().includes(keyword) ||
      user.department.toLowerCase().includes(keyword)
  )
})

// 监听时间范围变化，校验时长
watch(() => props.bookingForm.timeRange, (newVal) => {
  if (newVal && newVal.length === 2) {
    const [start, end] = newVal
    const diffHours = (end - start) / (1000 * 60 * 60)

    if (diffHours > 2) {
      durationWarning.value = true
      durationText.value = `预约时长 ${diffHours.toFixed(1)} 小时（建议不超过2小时）`
    } else {
      durationWarning.value = false
      durationText.value = `预约时长 ${diffHours.toFixed(1)} 小时`
    }

    // 实时冲突校验
    checkConflict()
  }
}, { deep: true })

// 监听会议室变化
watch(() => props.bookingForm.roomId, () => {
  if (props.bookingForm.timeRange && props.bookingForm.timeRange.length === 2) {
    checkConflict()
  }
})

// 会议室选择变化
const handleRoomChange = (roomId) => {
  const room = props.allRooms.find(r => r.id === roomId)
  if (room && (room.status === 'maintenance' || room.status === 'locked')) {
    ElMessage.warning('该会议室当前不可预约')
    props.bookingForm.roomId = ''
  }
}

// 时间范围变化
const handleTimeChange = () => {
  // 自动触发 watch
}

// 冲突校验
const checkConflict = () => {
  if (!props.bookingForm.roomId || !props.bookingForm.timeRange || props.bookingForm.timeRange.length !== 2) {
    hasConflict.value = false
    return
  }

  const [startTime, endTime] = props.bookingForm.timeRange
  const roomId = props.bookingForm.roomId

  // 模拟冲突检测（实际应调用后端API）
  const mockBookings = [
    { roomId: 'room101', startTime: new Date('2026-04-15 14:00'), endTime: new Date('2026-04-15 15:30') }
  ]

  const conflict = mockBookings.find(booking => {
    return booking.roomId === roomId &&
        ((startTime >= booking.startTime && startTime < booking.endTime) ||
            (endTime > booking.startTime && endTime <= booking.endTime) ||
            (startTime <= booking.startTime && endTime >= booking.endTime))
  })

  if (conflict) {
    hasConflict.value = true
    conflictMessage.value = `该时间段已有预约：${conflict.roomId}，请选择其他时间`
  } else {
    hasConflict.value = false
    conflictMessage.value = ''
  }
}

// 移除参会人
const removeAttendee = (id) => {
  props.bookingForm.attendees = props.bookingForm.attendees.filter(a => a.id !== id)
  props.bookingForm.attendeeCount = props.bookingForm.attendees.length
}

// 参会人选择变化
const handleAttendeeCheck = (data, checkedInfo) => {
  selectedAttendeeIds.value = checkedInfo.checkedKeys
}

// 确认参会人
const confirmAttendees = () => {
  const selectedUsers = allUsers.value.filter(user => selectedAttendeeIds.value.includes(user.id))
  props.bookingForm.attendees = selectedUsers
  props.bookingForm.attendeeCount = selectedUsers.length
  showAttendeeDialog.value = false
  ElMessage.success(`已选择 ${selectedUsers.length} 位参会人`)
}

// 文件处理
const handleFileChange = (file, files) => {
  emit('file-change', file, files)
}

const handleFileRemove = (file, files) => {
  emit('file-remove', file, files)
}

// 取消操作
const handleCancel = () => {
  if (props.drawerMode === 'create' || props.drawerMode === 'edit') {
    ElMessageBox.confirm('关闭后将保存为草稿，下次可继续编辑，是否关闭？', '提示', {
      confirmButtonText: '保存并关闭',
      cancelButtonText: '直接关闭',
      type: 'warning',
      distinguishCancelAndClose: true
    }).then(() => {
      // 保存草稿
      ElMessage.success('草稿已保存')
      emit('update:visible', false)
    }).catch((action) => {
      if (action === 'cancel') {
        emit('update:visible', false)
      }
    })
  } else {
    emit('update:visible', false)
  }
}

// 提交预约
const handleSubmitBooking = () => {
  if (!bookingFormRef.value) return

  bookingFormRef.value.validate((valid) => {
    if (valid) {
      if (hasConflict.value) {
        ElMessage.error('存在时间冲突，请调整预约时间')
        return
      }

      ElMessageBox.confirm('确认提交预约申请？', '二次确认', {
        confirmButtonText: '确认提交',
        cancelButtonText: '取消',
        type: 'info'
      }).then(() => {
        ElMessage.success('预约提交成功')
        emit('update:visible', false)
        emit('submit-booking')
      }).catch(() => {})
    }
  })
}

// 更新预约
const handleUpdateBooking = () => {
  if (!bookingFormRef.value) return

  bookingFormRef.value.validate((valid) => {
    if (valid) {
      if (hasConflict.value) {
        ElMessage.error('存在时间冲突，请调整预约时间')
        return
      }

      ElMessageBox.confirm('确认保存修改？', '二次确认', {
        confirmButtonText: '确认保存',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        ElMessage.success('修改保存成功')
        emit('update:visible', false)
        emit('update-booking')
      }).catch(() => {})
    }
  })
}

// 使用类型文本
const usageTypeText = (type) => {
  const types = {
    meeting: '会议',
    interview: '面试',
    training: '培训',
    discussion: '临时讨论',
    activity: '活动'
  }
  return types[type] || '未知'
}

const getApprovalStatusType = (status) => {
  const types = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger'
  }
  return types[status] || 'info'
}
</script>

<style lang="scss" scoped>
.drawer-content {
  padding: 0 20px;

  .booking-form {
    .checkin-config {
      .config-item {
        display: flex;
        align-items: center;
        margin-bottom: 12px;

        .label {
          width: 80px;
          font-size: 13px;
          color: #606266;
        }
      }
    }

    .attendee-count {
      margin-top: 8px;
      font-size: 12px;
      color: #909399;
    }
  }

  .attendee-selector {
    .el-checkbox-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
  }

  .booking-detail {
    .approval-flow,
    .operation-log {
      margin-top: 20px;

      h4 {
        margin-bottom: 12px;
        color: #303133;
      }

      .log-item {
        display: flex;
        gap: 12px;
        padding: 8px 0;
        border-bottom: 1px solid #f0f0f0;
        font-size: 13px;

        .log-time {
          color: #909399;
          white-space: nowrap;
        }

        .log-content {
          color: #606266;
        }
      }
    }

    .approval-panel {
      margin-top: 20px;

      h4 {
        margin-bottom: 12px;
        color: #303133;
      }
    }
  }
}

.drawer-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
