<template>
  <div class="my-meetings-page">
    <el-card shadow="never">
      <!-- 顶部操作栏 -->
      <div class="page-header">
        <div class="header-left">
          <el-tabs v-model="currentView" @tab-change="handleViewChange">
            <el-tab-pane label="全部会议" name="all">
              <template #label>
                <span>全部会议</span>
                <span class="tab-badge">{{ stats.all }}</span>
              </template>
            </el-tab-pane>
            <el-tab-pane label="待我参与" name="pending">
              <template #label>
                <span>待我参与</span>
                <span class="tab-badge">{{ stats.pending }}</span>
              </template>
            </el-tab-pane>
            <el-tab-pane label="我发起的" name="launched">
              <template #label>
                <span>我发起的</span>
                <span class="tab-badge">{{ stats.launched }}</span>
              </template>
            </el-tab-pane>
            <el-tab-pane label="已结束" name="finished">
              <template #label>
                <span>已结束</span>
                <span class="tab-badge">{{ stats.finished }}</span>
              </template>
            </el-tab-pane>
            <el-tab-pane label="已取消" name="cancelled">
              <template #label>
                <span>已取消</span>
                <span class="tab-badge">{{ stats.cancelled }}</span>
              </template>
            </el-tab-pane>
            <el-tab-pane label="我的收藏" name="favorites">
              <template #label>
                <span>我的收藏</span>
                <span class="tab-badge">{{ stats.favorites }}</span>
              </template>
            </el-tab-pane>
          </el-tabs>
        </div>
        <div class="header-right">
          <el-button type="primary" @click="handleCreate" icon="Plus">创建会议</el-button>
          <el-button @click="handleBatchExport" icon="Download" :disabled="selectedRows.length === 0">
            批量导出
          </el-button>
          <el-button @click="handleRefresh" icon="Refresh">刷新</el-button>
        </div>
      </div>

      <!-- 快捷搜索 -->
      <div class="search-bar">
        <el-input
            v-model="searchKeyword"
            placeholder="搜索会议标题/编号/发起人/参会人/会议室"
            clearable
            prefix-icon="Search"
            style="width: 400px"
            @input="handleSearch"
        />
        <el-button @click="showAdvanced = !showAdvanced" icon="Filter">
          {{ showAdvanced ? '收起筛选' : '高级筛选' }}
        </el-button>
      </div>

      <!-- 高级筛选 -->
      <el-collapse-transition>
        <div v-show="showAdvanced" class="advanced-filter">
          <el-form :inline="true" :model="filterForm">
            <el-form-item label="时间范围">
              <el-select v-model="filterForm.timeRange" placeholder="请选择" clearable style="width: 150px">
                <el-option label="今日" value="today" />
                <el-option label="本周" value="week" />
                <el-option label="本月" value="month" />
                <el-option label="近3月" value="3months" />
                <el-option label="近1年" value="year" />
                <el-option label="自定义" value="custom" />
              </el-select>
            </el-form-item>
            <el-form-item v-if="filterForm.timeRange === 'custom'" label="时间">
              <el-date-picker
                  v-model="filterForm.customTime"
                  type="daterange"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  style="width: 240px"
              />
            </el-form-item>
            <el-form-item label="会议类型">
              <el-select v-model="filterForm.meetingType" placeholder="全部类型" clearable style="width: 150px">
                <el-option label="部门例会" value="department" />
                <el-option label="项目会议" value="project" />
                <el-option label="全员大会" value="company" />
                <el-option label="线上会议" value="online" />
                <el-option label="涉密会议" value="secret" />
              </el-select>
            </el-form-item>
            <el-form-item v-if="currentView === 'pending'" label="参会状态">
              <el-select v-model="filterForm.attendStatus" placeholder="全部状态" clearable style="width: 120px">
                <el-option label="待确认" value="pending" />
                <el-option label="已确认" value="confirmed" />
                <el-option label="已拒绝" value="rejected" />
                <el-option label="已请假" value="leave" />
              </el-select>
            </el-form-item>
            <el-form-item label="会议地点">
              <el-select v-model="filterForm.location" placeholder="全部地点" clearable style="width: 150px">
                <el-option label="线上会议" value="online" />
                <el-option label="1号会议室" value="room1" />
                <el-option label="2号会议室" value="room2" />
                <el-option label="3号会议室" value="room3" />
                <el-option label="大会议室" value="big_room" />
              </el-select>
            </el-form-item>
            <el-form-item label="发起人" v-if="canFilterByInitiator">
              <el-select v-model="filterForm.initiator" placeholder="选择发起人" clearable filterable style="width: 150px">
                <el-option label="张三" value="zhangsan" />
                <el-option label="李四" value="lisi" />
                <el-option label="王五" value="wangwu" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleFilter">查询</el-button>
              <el-button @click="handleResetFilter">重置</el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-collapse-transition>

      <!-- 会议列表 -->
      <div class="meeting-table">
        <el-table
            :data="filteredMeetings"
            v-loading="loading"
            border
            stripe
            @selection-change="handleSelectionChange"
            @row-click="handleRowClick"
            highlight-current-row
            :row-style="{ cursor: 'pointer' }"
        >
          <el-table-column v-if="showCheckbox" type="selection" width="55" fixed="left" />
          <el-table-column label="会议状态" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)" size="small">{{ row.statusName }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="title" label="会议标题" min-width="200" show-overflow-tooltip>
            <template #default="{ row }">
              <span>{{ row.title }}</span>
              <el-tag v-if="row.isSecret" type="danger" size="small" style="margin-left: 8px">涉密</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="type" label="会议类型" width="120" align="center">
            <template #default="{ row }">
              <el-tag :type="getTypeColor(row.type)" size="small">{{ row.typeName }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="time" label="时间" width="160" sortable />
          <el-table-column prop="location" label="地点" width="150" show-overflow-tooltip>
            <template #default="{ row }">
              <span v-if="row.isOnline">🎥 线上会议</span>
              <span v-else>{{ row.location }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="initiator" label="发起人" width="120" />
          <el-table-column prop="attendees" label="参会人数" width="100" align="center">
            <template #default="{ row }">
              <span>{{ row.confirmedCount }}/{{ row.totalCount }}</span>
            </template>
          </el-table-column>
          <el-table-column v-if="currentView === 'pending'" label="参会状态" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="getAttendStatusType(row.attendStatus)" size="small">{{ row.attendStatusName }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column v-if="currentView === 'cancelled'" label="取消原因" min-width="150" show-overflow-tooltip>
            <template #default="{ row }">
              {{ row.cancelReason }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="300" align="center" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" size="small" @click.stop="handleView(row)">查看</el-button>
              <el-button
                  v-if="currentView === 'pending' && !row.isConfirmed"
                  link
                  type="success"
                  size="small"
                  @click.stop="handleConfirmAttend(row)"
              >确认参会</el-button>
              <el-button
                  v-if="currentView === 'launched' && row.status === 'upcoming'"
                  link
                  type="warning"
                  size="small"
                  @click.stop="handleEdit(row)"
              >编辑</el-button>
              <el-button
                  v-if="currentView === 'launched' && row.status === 'upcoming'"
                  link
                  type="danger"
                  size="small"
                  @click.stop="handleCancelMeeting(row)"
              >取消</el-button>
              <el-button
                  v-if="row.status === 'ongoing'"
                  link
                  type="success"
                  size="small"
                  @click.stop="handleJoinMeeting(row)"
              >进入会议</el-button>
              <el-button
                  v-if="row.status === 'finished'"
                  link
                  type="primary"
                  size="small"
                  @click.stop="handleViewMinutes(row)"
              >查看纪要</el-button>
              <el-button
                  link
                  type="warning"
                  size="small"
                  @click.stop="handleToggleFavorite(row)"
              >{{ row.isFavorite ? '取消收藏' : '收藏' }}</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
            v-model:current-page="pagination.page"
            v-model:page-size="pagination.pageSize"
            :total="pagination.total"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <!-- 会议详情弹窗 -->
    <el-dialog
        v-model="detailVisible"
        title="会议详情"
        width="800px"
        top="5vh"
        :close-on-click-modal="false"
    >
      <div class="meeting-detail" v-if="currentMeeting">
        <!-- 基本信息 -->
        <el-card shadow="never" class="detail-section">
          <template #header>
            <div class="section-title">
              <el-icon><InfoFilled /></el-icon>
              <span>基本信息</span>
            </div>
          </template>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="会议编号">{{ currentMeeting.meetingNo }}</el-descriptions-item>
            <el-descriptions-item label="会议标题">{{ currentMeeting.title }}</el-descriptions-item>
            <el-descriptions-item label="会议类型">{{ currentMeeting.typeName }}</el-descriptions-item>
            <el-descriptions-item label="会议状态">
              <el-tag :type="getStatusType(currentMeeting.status)">{{ currentMeeting.statusName }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="开始时间">{{ currentMeeting.startTime }}</el-descriptions-item>
            <el-descriptions-item label="结束时间">{{ currentMeeting.endTime }}</el-descriptions-item>
            <el-descriptions-item label="会议地点" :span="2">
              <span v-if="currentMeeting.isOnline">🎥 线上会议（{{ currentMeeting.onlineUrl }}）</span>
              <span v-else>{{ currentMeeting.location }}（{{ currentMeeting.locationDetail }}）</span>
            </el-descriptions-item>
            <el-descriptions-item label="发起人">{{ currentMeeting.initiator }}</el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ currentMeeting.createTime }}</el-descriptions-item>
            <el-descriptions-item label="会议描述" :span="2">
              <div class="description-content">{{ currentMeeting.description }}</div>
            </el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- 参会人员 -->
        <el-card shadow="never" class="detail-section">
          <template #header>
            <div class="section-title">
              <el-icon><UserFilled /></el-icon>
              <span>参会人员（{{ currentMeeting.totalCount }}人）</span>
            </div>
          </template>
          <div class="attendees-list">
            <div class="attendee-item" v-for="attendee in currentMeeting.attendees" :key="attendee.id">
              <el-avatar :size="32" :src="attendee.avatar">{{ attendee.name.charAt(0) }}</el-avatar>
              <div class="attendee-info">
                <div class="attendee-name">{{ attendee.name }} - {{ attendee.department }}</div>
                <div class="attendee-status">
                  <el-tag :type="getAttendStatusType(attendee.status)" size="small">{{ attendee.statusName }}</el-tag>
                  <span v-if="attendee.reason" class="attendee-reason">（{{ attendee.reason }}）</span>
                </div>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 会议纪要 -->
        <el-card shadow="never" class="detail-section" v-if="currentMeeting.minutes">
          <template #header>
            <div class="section-title">
              <el-icon><Document /></el-icon>
              <span>会议纪要</span>
            </div>
          </template>
          <div class="minutes-content">{{ currentMeeting.minutes }}</div>
        </el-card>

        <!-- 会议附件 -->
        <el-card shadow="never" class="detail-section" v-if="currentMeeting.attachments && currentMeeting.attachments.length > 0">
          <template #header>
            <div class="section-title">
              <el-icon><Paperclip /></el-icon>
              <span>会议附件</span>
            </div>
          </template>
          <el-table :data="currentMeeting.attachments" border size="small">
            <el-table-column prop="name" label="文件名称" min-width="200" />
            <el-table-column prop="size" label="文件大小" width="100" />
            <el-table-column prop="uploader" label="上传人" width="100" />
            <el-table-column label="操作" width="100" align="center">
              <template #default="{ row }">
                <el-button link type="primary" size="small" @click="handleDownloadAttachment(row)">下载</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </div>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 创建/编辑会议弹窗 -->
    <el-dialog
        v-model="createVisible"
        :title="isEditMode ? '编辑会议' : '创建会议'"
        width="700px"
        top="5vh"
        :close-on-click-modal="false"
    >
      <el-form :model="meetingForm" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="会议标题" prop="title">
          <el-input v-model="meetingForm.title" placeholder="请输入会议标题" maxlength="50" show-word-limit />
        </el-form-item>
        <el-form-item label="会议类型" prop="type">
          <el-select v-model="meetingForm.type" placeholder="请选择会议类型" style="width: 100%">
            <el-option label="部门例会" value="department" />
            <el-option label="项目会议" value="project" />
            <el-option label="全员大会" value="company" />
            <el-option label="线上会议" value="online" />
            <el-option label="涉密会议" value="secret" />
          </el-select>
        </el-form-item>
        <el-form-item label="会议时间" prop="timeRange">
          <el-date-picker
              v-model="meetingForm.timeRange"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="会议地点" prop="locationType">
          <el-radio-group v-model="meetingForm.locationType">
            <el-radio label="offline">线下会议室</el-radio>
            <el-radio label="online">线上会议</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="meetingForm.locationType === 'offline'" label="会议室" prop="room">
          <el-select v-model="meetingForm.room" placeholder="请选择会议室" style="width: 100%">
            <el-option label="1号会议室（10人）" value="room1" />
            <el-option label="2号会议室（20人）" value="room2" />
            <el-option label="3号会议室（30人）" value="room3" />
            <el-option label="大会议室（50人）" value="big_room" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="meetingForm.locationType === 'online'" label="会议链接" prop="onlineUrl">
          <el-input v-model="meetingForm.onlineUrl" placeholder="请输入内网会议链接" />
        </el-form-item>
        <el-form-item label="参会人员" prop="attendees">
          <el-select v-model="meetingForm.attendees" placeholder="请选择参会人员" multiple style="width: 100%">
            <el-option label="张三 - 技术部" value="zhangsan" />
            <el-option label="李四 - 销售部" value="lisi" />
            <el-option label="王五 - 行政部" value="wangwu" />
            <el-option label="赵六 - 财务部" value="zhaoliu" />
          </el-select>
        </el-form-item>
        <el-form-item label="抄送人">
          <el-select v-model="meetingForm.ccUsers" placeholder="请选择抄送人" multiple style="width: 100%">
            <el-option label="孙七 - 人事部" value="sunqi" />
            <el-option label="周八 - 法务部" value="zhouba" />
          </el-select>
        </el-form-item>
        <el-form-item label="会议描述">
          <el-input v-model="meetingForm.description" type="textarea" :rows="4" placeholder="请输入会议议程、注意事项等" />
        </el-form-item>
        <el-form-item label="会议优先级">
          <el-select v-model="meetingForm.priority" placeholder="请选择优先级" style="width: 100%">
            <el-option label="高" value="high" />
            <el-option label="中" value="medium" />
            <el-option label="低" value="low" />
          </el-select>
        </el-form-item>
        <el-form-item label="重复设置">
          <el-select v-model="meetingForm.repeatType" placeholder="请选择重复方式" style="width: 100%">
            <el-option label="不重复" value="none" />
            <el-option label="每日" value="daily" />
            <el-option label="每周" value="weekly" />
            <el-option label="每月" value="monthly" />
          </el-select>
        </el-form-item>
        <el-form-item label="提醒设置">
          <el-select v-model="meetingForm.remindTime" placeholder="请选择提醒时间" style="width: 100%">
            <el-option label="不提醒" value="none" />
            <el-option label="提前10分钟" value="10min" />
            <el-option label="提前30分钟" value="30min" />
            <el-option label="提前1小时" value="1hour" />
            <el-option label="提前1天" value="1day" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitMeeting">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import {
  InfoFilled, UserFilled, Document, Paperclip,
  Plus, Download, Refresh, DataAnalysis, Filter, Search
} from '@element-plus/icons-vue'

const router = useRouter()

// 角色权限控制（实际项目应从后端获取）
const canViewStatistics = ref(true) // 部门负责人/管理员可见
const canFilterByInitiator = ref(true) // 部门负责人/管理员可见
const isInitiator = ref(true) // 是否为会议发起人

const currentView = ref('all')
const loading = ref(false)
const showAdvanced = ref(false)
const detailVisible = ref(false)
const createVisible = ref(false)
const isEditMode = ref(false)
const formRef = ref(null)
const currentMeeting = ref(null)
const selectedRows = ref([])
const searchKeyword = ref('')

const stats = reactive({
  all: 0,
  pending: 0,
  launched: 0,
  finished: 0,
  cancelled: 0,
  favorites: 0
})

const filterForm = reactive({
  timeRange: '',
  customTime: [],
  meetingType: '',
  attendStatus: '',
  location: '',
  initiator: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

const meetingForm = reactive({
  title: '',
  type: '',
  timeRange: [],
  locationType: 'offline',
  room: '',
  onlineUrl: '',
  attendees: [],
  ccUsers: [],
  description: '',
  priority: 'medium',
  repeatType: 'none',
  remindTime: '30min'
})

const rules = {
  title: [{ required: true, message: '请输入会议标题', trigger: 'blur' }],
  type: [{ required: true, message: '请选择会议类型', trigger: 'change' }],
  timeRange: [{ required: true, message: '请选择会议时间', trigger: 'change' }],
  locationType: [{ required: true, message: '请选择会议地点类型', trigger: 'change' }]
}

// 示例数据
const allMeetings = ref([
  {
    id: 1,
    meetingNo: 'MTG20260415001',
    title: '技术部周例会',
    type: 'department',
    typeName: '部门例会',
    status: 'upcoming',
    statusName: '待开',
    startTime: '2026-04-15 14:30',
    endTime: '2026-04-15 15:30',
    time: '2026-04-15 14:30',
    location: '2号会议室',
    locationDetail: '3楼201室',
    isOnline: false,
    onlineUrl: '',
    initiator: '张三 - 技术部',
    totalCount: 8,
    confirmedCount: 5,
    isConfirmed: false,
    isFavorite: false,
    isSecret: false,
    description: '本周工作进度汇报及下周计划安排',
    attendees: [
      { id: 1, name: '张三', department: '技术部', status: 'confirmed', statusName: '已确认' },
      { id: 2, name: '李四', department: '技术部', status: 'confirmed', statusName: '已确认' },
      { id: 3, name: '王五', department: '技术部', status: 'pending', statusName: '待确认' }
    ],
    minutes: '',
    attachments: []
  },
  {
    id: 2,
    meetingNo: 'MTG20260415002',
    title: '项目启动会 - 新系统开发',
    type: 'project',
    typeName: '项目会议',
    status: 'upcoming',
    statusName: '待开',
    startTime: '2026-04-16 10:00',
    endTime: '2026-04-16 11:30',
    time: '2026-04-16 10:00',
    location: '',
    locationDetail: '',
    isOnline: true,
    onlineUrl: 'http://meeting.internal.com/room/12345',
    initiator: '李四 - 产品部',
    totalCount: 12,
    confirmedCount: 10,
    isConfirmed: true,
    isFavorite: true,
    isSecret: false,
    description: '新系统开发项目启动，讨论需求和技术方案',
    attendees: [
      { id: 4, name: '李四', department: '产品部', status: 'confirmed', statusName: '已确认' },
      { id: 5, name: '赵六', department: '开发部', status: 'confirmed', statusName: '已确认' }
    ],
    minutes: '',
    attachments: []
  },
  {
    id: 3,
    meetingNo: 'MTG20260415003',
    title: 'Q2季度总结大会',
    type: 'company',
    typeName: '全员大会',
    status: 'finished',
    statusName: '已结束',
    startTime: '2026-04-10 14:00',
    endTime: '2026-04-10 16:00',
    time: '2026-04-10 16:00',
    location: '大会议室',
    locationDetail: '1楼大厅',
    isOnline: false,
    onlineUrl: '',
    initiator: '王五 - 行政部',
    totalCount: 50,
    confirmedCount: 48,
    isConfirmed: true,
    isFavorite: false,
    isSecret: false,
    description: 'Q2季度工作总结及Q3计划部署',
    attendees: [],
    minutes: '会议主要内容：1. Q2业绩汇报 2. 问题分析 3. Q3目标设定',
    attachments: [
      { id: 1, name: 'Q2季度报告.pdf', size: '2.5MB', uploader: '王五' }
    ]
  },
  {
    id: 4,
    meetingNo: 'MTG20260415004',
    title: '技术架构评审会',
    type: 'secret',
    typeName: '涉密会议',
    status: 'upcoming',
    statusName: '待开',
    startTime: '2026-04-17 09:00',
    endTime: '2026-04-17 10:30',
    time: '2026-04-17 09:00',
    location: '3号会议室',
    locationDetail: '3楼303室',
    isOnline: false,
    onlineUrl: '',
    initiator: '赵六 - 架构部',
    totalCount: 5,
    confirmedCount: 5,
    isConfirmed: false,
    isFavorite: false,
    isSecret: true,
    description: '新系统技术架构方案评审',
    attendees: [],
    minutes: '',
    attachments: []
  },
  {
    id: 5,
    meetingNo: 'MTG20260415005',
    title: '团队建设活动讨论会',
    type: 'department',
    typeName: '部门例会',
    status: 'cancelled',
    statusName: '已取消',
    startTime: '2026-04-12 15:00',
    endTime: '2026-04-12 16:00',
    time: '2026-04-12 15:00',
    location: '1号会议室',
    locationDetail: '3楼101室',
    isOnline: false,
    onlineUrl: '',
    initiator: '张三 - 技术部',
    totalCount: 10,
    confirmedCount: 8,
    isConfirmed: false,
    isFavorite: false,
    isSecret: false,
    cancelReason: '因部分参会人员出差，会议延期',
    description: '讨论团队建设活动方案',
    attendees: [],
    minutes: '',
    attachments: []
  }
])

const filteredMeetings = computed(() => {
  let meetings = allMeetings.value

  // 视图过滤
  switch (currentView.value) {
    case 'pending':
      meetings = meetings.filter(m => m.status === 'upcoming' && !m.isInitiator)
      break
    case 'launched':
      meetings = meetings.filter(m => m.isInitiator)
      break
    case 'finished':
      meetings = meetings.filter(m => m.status === 'finished')
      break
    case 'cancelled':
      meetings = meetings.filter(m => m.status === 'cancelled')
      break
    case 'favorites':
      meetings = meetings.filter(m => m.isFavorite)
      break
  }

  // 关键词搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    meetings = meetings.filter(m =>
        m.title.toLowerCase().includes(keyword) ||
        m.meetingNo.toLowerCase().includes(keyword) ||
        m.initiator.toLowerCase().includes(keyword)
    )
  }

  // 高级筛选
  if (filterForm.meetingType) {
    meetings = meetings.filter(m => m.type === filterForm.meetingType)
  }
  if (filterForm.location) {
    if (filterForm.location === 'online') {
      meetings = meetings.filter(m => m.isOnline)
    } else {
      meetings = meetings.filter(m => m.location && m.location.includes(filterForm.location))
    }
  }

  return meetings
})

const showCheckbox = computed(() => {
  return currentView.value === 'all' || currentView.value === 'launched'
})

onMounted(() => {
  loadData()
})

const loadData = () => {
  loading.value = true
  setTimeout(() => {
    stats.all = allMeetings.value.length
    stats.pending = allMeetings.value.filter(m => m.status === 'upcoming' && !m.isInitiator).length
    stats.launched = allMeetings.value.filter(m => m.isInitiator).length
    stats.finished = allMeetings.value.filter(m => m.status === 'finished').length
    stats.cancelled = allMeetings.value.filter(m => m.status === 'cancelled').length
    stats.favorites = allMeetings.value.filter(m => m.isFavorite).length
    pagination.total = filteredMeetings.value.length
    loading.value = false
  }, 300)
}

const handleViewChange = () => {
  pagination.page = 1
  loadData()
}

const handleSearch = () => {
  pagination.page = 1
  loadData()
}

const handleFilter = () => {
  pagination.page = 1
  loadData()
  ElMessage.success('筛选成功')
}

const handleResetFilter = () => {
  filterForm.timeRange = ''
  filterForm.customTime = []
  filterForm.meetingType = ''
  filterForm.attendStatus = ''
  filterForm.location = ''
  filterForm.initiator = ''
  handleFilter()
}

const handleRefresh = () => {
  loadData()
  ElMessage.success('刷新成功')
}

const handleSelectionChange = (selection) => {
  selectedRows.value = selection
}

const handleRowClick = (row) => {
  handleView(row)
}

const handleView = (row) => {
  currentMeeting.value = row
  detailVisible.value = true
}

const handleCreate = () => {
  router.push('/office/meeting/create-meeting')
}

const handleEdit = (row) => {
  isEditMode.value = true
  currentMeeting.value = row
  // 填充表单数据
  meetingForm.title = row.title
  meetingForm.type = row.type
  meetingForm.description = row.description
  createVisible.value = true
}

const handleCancelMeeting = (row) => {
  ElMessageBox.prompt('请填写取消原因', '取消会议', {
    confirmButtonText: '确认取消',
    cancelButtonText: '取消',
    inputPattern: /.+/,
    inputErrorMessage: '取消原因不能为空'
  }).then(({ value }) => {
    row.status = 'cancelled'
    row.statusName = '已取消'
    row.cancelReason = value
    ElMessage.success('会议已取消')
    loadData()
  }).catch(() => {})
}

const handleConfirmAttend = (row) => {
  ElMessageBox.confirm('确认参加此会议吗？', '参会确认', {
    confirmButtonText: '确认参会',
    cancelButtonText: '拒绝参会',
    type: 'info'
  }).then(() => {
    row.isConfirmed = true
    ElMessage.success('已确认参会')
  }).catch(() => {
    ElMessageBox.prompt('请填写拒绝原因', '拒绝参会', {
      confirmButtonText: '提交',
      cancelButtonText: '取消',
      inputPattern: /.+/,
      inputErrorMessage: '拒绝原因不能为空'
    }).then(({ value }) => {
      ElMessage.success('已拒绝参会')
    }).catch(() => {})
  })
}

const handleJoinMeeting = (row) => {
  if (row.isOnline && row.onlineUrl) {
    window.open(row.onlineUrl, '_blank')
  } else {
    ElMessage.info(`会议室：${row.location}`)
  }
}

const handleViewMinutes = (row) => {
  currentMeeting.value = row
  detailVisible.value = true
}

const handleToggleFavorite = (row) => {
  row.isFavorite = !row.isFavorite
  ElMessage.success(row.isFavorite ? '已收藏' : '已取消收藏')
  loadData()
}

const handleBatchExport = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请选择要导出的会议')
    return
  }
  ElMessage.success('导出成功')
}

const handleSubmitMeeting = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      ElMessage.success(isEditMode.value ? '编辑成功' : '创建成功')
      createVisible.value = false
      loadData()
    }
  })
}

const handleDownloadAttachment = (file) => {
  ElMessage.success('下载成功')
}

const handleSizeChange = (size) => {
  pagination.pageSize = size
  loadData()
}

const handlePageChange = (page) => {
  pagination.page = page
  loadData()
}

const resetForm = () => {
  meetingForm.title = ''
  meetingForm.type = ''
  meetingForm.timeRange = []
  meetingForm.locationType = 'offline'
  meetingForm.room = ''
  meetingForm.onlineUrl = ''
  meetingForm.attendees = []
  meetingForm.ccUsers = []
  meetingForm.description = ''
  meetingForm.priority = 'medium'
  meetingForm.repeatType = 'none'
  meetingForm.remindTime = '30min'
}

const getStatusType = (status) => {
  const types = {
    upcoming: 'primary',
    ongoing: 'success',
    finished: 'info',
    cancelled: 'warning'
  }
  return types[status] || 'info'
}

const getTypeColor = (type) => {
  const colors = {
    department: 'primary',
    project: 'success',
    company: 'warning',
    online: 'info',
    secret: 'danger'
  }
  return colors[type] || 'info'
}

const getAttendStatusType = (status) => {
  const types = {
    confirmed: 'success',
    pending: 'warning',
    rejected: 'danger',
    leave: 'info'
  }
  return types[status] || 'info'
}
</script>

<style lang="scss" scoped>
.my-meetings-page {
  padding: 20px;
  background: #f5f7fa;
  min-height: calc(100vh - 60px);

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 16px;
    border-bottom: 1px solid #ebeef5;

    .header-left {
      flex: 1;

      :deep(.el-tabs__header) {
        margin: 0;
      }

      .tab-badge {
        margin-left: 6px;
        color: #409eff;
        font-size: 12px;
      }
    }

    .header-right {
      display: flex;
      gap: 8px;
    }
  }

  .search-bar {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
  }

  .advanced-filter {
    padding: 16px;
    background: #f9fafc;
    border-radius: 4px;
    margin-bottom: 16px;

    :deep(.el-form-item) {
      margin-bottom: 12px;
    }
  }

  .meeting-table {
    margin-bottom: 20px;
  }

  .pagination {
    display: flex;
    justify-content: flex-end;
  }

  .meeting-detail {
    max-height: calc(100vh - 200px);
    overflow-y: auto;

    .detail-section {
      margin-bottom: 16px;

      :deep(.el-card__header) {
        padding: 12px 20px;
        background: #fafafa;
      }

      .section-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 15px;
        font-weight: 600;
        color: #303133;
      }

      .description-content {
        line-height: 1.8;
        white-space: pre-wrap;
      }

      .attendees-list {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 12px;

        .attendee-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: #f5f7fa;
          border-radius: 4px;

          .attendee-info {
            flex: 1;

            .attendee-name {
              font-weight: 600;
              margin-bottom: 4px;
            }

            .attendee-status {
              display: flex;
              align-items: center;
              gap: 8px;
              font-size: 12px;

              .attendee-reason {
                color: #909399;
              }
            }
          }
        }
      }

      .minutes-content {
        line-height: 1.8;
        white-space: pre-wrap;
        padding: 12px;
        background: #f5f7fa;
        border-radius: 4px;
      }
    }
  }
}
</style>
