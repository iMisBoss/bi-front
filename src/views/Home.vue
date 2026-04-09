<template>
  <div class="home-page">
    <!-- 欢迎区域 -->
    <div class="welcome-banner">
      <div class="welcome-content">
        <div class="welcome-text">
          <h2>欢迎回来，{{ currentUser?.name || '用户' }}</h2>
          <p>{{ greetingMessage }} | {{ currentDate }}</p>
        </div>
        <div class="quick-stats">
          <div class="stat-item" @click="navigateTo('/process/approval/todo')">
            <div class="stat-value">{{ todoCount }}</div>
            <div class="stat-label">待办事项</div>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item" @click="navigateTo('/process/approval/launched')">
            <div class="stat-value">{{ launchedCount }}</div>
            <div class="stat-label">我发起的</div>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item" @click="navigateTo('/process/approval/cced')">
            <div class="stat-value">{{ ccCount }}</div>
            <div class="stat-label">抄送我的</div>
          </div>
        </div>
      </div>
    </div>

    <el-row :gutter="20" class="content-row">
      <!-- 左侧主区域 -->
      <el-col :span="18">
        <!-- 快捷入口 -->
        <el-card class="portal-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="header-title">
                <el-icon><Grid /></el-icon>
                快捷入口
              </span>
            </div>
          </template>
          <div class="quick-access-grid">
            <div
                class="access-item"
                v-for="item in quickAccessList"
                :key="item.path"
                @click="navigateTo(item.path)"
            >
              <div class="icon-wrapper" :style="{ background: item.bgColor }">
                <el-icon :size="24" :color="item.color">
                  <component :is="item.icon" />
                </el-icon>
              </div>
              <span class="item-name">{{ item.name }}</span>
            </div>
          </div>
        </el-card>

        <!-- 外部系统链接 -->
        <el-card class="portal-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="header-title">
                <el-icon><Link /></el-icon>
                外部系统
              </span>
              <el-tag size="small" type="info">快捷访问</el-tag>
            </div>
          </template>
          <div class="external-systems-grid">
            <div
                class="system-item"
                v-for="system in externalSystems"
                :key="system.url"
                @click="openExternalSystem(system)"
            >
              <div class="system-icon" :style="{ background: system.color }">
                <el-icon :size="28" color="#fff">
                  <component :is="system.icon" />
                </el-icon>
              </div>
              <div class="system-info">
                <div class="system-name">{{ system.name }}</div>
                <div class="system-desc">{{ system.description }}</div>
              </div>
              <el-icon class="arrow-icon"><ArrowRight /></el-icon>
            </div>
          </div>
        </el-card>

        <!-- 流程审批概览 -->
        <el-card class="portal-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="header-title">
                <el-icon><DocumentChecked /></el-icon>
                我的待办
              </span>
              <el-button link type="primary" @click="navigateTo('/process/approval/todo')">
                查看全部
                <el-icon><ArrowRight /></el-icon>
              </el-button>
            </div>
          </template>
          <el-table :data="todoList" style="width: 100%" :show-header="false" class="todo-table">
            <el-table-column prop="title" label="标题" />
            <el-table-column prop="type" label="类型" width="120">
              <template #default="{ row }">
                <el-tag :type="getTypeTag(row.type)" size="small">{{ row.type }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="submitter" label="提交人" width="100" />
            <el-table-column prop="time" label="提交时间" width="160" />
            <el-table-column label="操作" width="80" fixed="right">
              <template #default="{ row }">
                <el-button link type="primary" size="small" @click="handleTodo(row)">处理</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <!-- 右侧辅助区域 -->
      <el-col :span="6">
        <!-- 公告通知 -->
        <el-card class="portal-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="header-title">
                <el-icon><Bell /></el-icon>
                公告通知
              </span>
              <el-button link type="primary" @click="navigateTo('/cms/news')">
                更多
              </el-button>
            </div>
          </template>
          <div class="notice-list">
            <div
                class="notice-item"
                v-for="(notice, index) in noticeList"
                :key="index"
                @click="viewNotice(notice)"
            >
              <el-tag :type="notice.urgent ? 'danger' : 'info'" size="small" class="notice-tag">
                {{ notice.urgent ? '紧急' : '通知' }}
              </el-tag>
              <div class="notice-content">
                <div class="notice-title">{{ notice.title }}</div>
                <div class="notice-date">{{ notice.date }}</div>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 常用工具 -->
        <el-card class="portal-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="header-title">
                <el-icon><Tools /></el-icon>
                常用工具
              </span>
            </div>
          </template>
          <div class="tools-list">
            <div
                class="tool-item"
                v-for="tool in commonTools"
                :key="tool.path"
                @click="navigateTo(tool.path)"
            >
              <el-icon :size="20" color="#409eff"><component :is="tool.icon" /></el-icon>
              <span>{{ tool.name }}</span>
            </div>
          </div>
        </el-card>

        <!-- 我的日程 -->
        <el-card class="portal-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="header-title">
                <el-icon><Calendar /></el-icon>
                今日日程
              </span>
            </div>
          </template>
          <div class="schedule-list">
            <div
                class="schedule-item"
                v-for="(item, index) in todaySchedule"
                :key="index"
                :class="{ 'is-current': item.isCurrent }"
            >
              <div class="time-slot">{{ item.time }}</div>
              <div class="schedule-content">
                <div class="schedule-title">{{ item.title }}</div>
                <div class="schedule-location" v-if="item.location">
                  <el-icon><Location /></el-icon>
                  {{ item.location }}
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import {
  Grid, Link, ArrowRight, DocumentChecked, Bell, Tools, Calendar, Location,
  Plus, Clock, VideoCamera, Folder, ChatDotRound, Money, User, Reading,
  Setting, DataAnalysis, Files, Management
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()
const currentUser = computed(() => userStore.currentUser)

// 问候语
const greetingMessage = computed(() => {
  const hour = new Date().getHours()
  if (hour < 6) return '凌晨好'
  if (hour < 9) return '早上好'
  if (hour < 12) return '上午好'
  if (hour < 14) return '中午好'
  if (hour < 18) return '下午好'
  return '晚上好'
})

const currentDate = computed(() => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const weekDays = ['日', '一', '二', '三', '四', '五', '六']
  const week = weekDays[now.getDay()]
  return `${year}年${month}月${day}日 星期${week}`
})

// 统计数据
const todoCount = ref(12)
const launchedCount = ref(5)
const ccCount = ref(8)

// 快捷入口
const quickAccessList = ref([
  { name: '发起审批', path: '/process/approval/start', icon: 'Plus', color: '#409EFF', bgColor: '#ecf5ff' },
  { name: '我的待办', path: '/process/approval/todo', icon: 'Bell', color: '#67C23A', bgColor: '#f0f9ff' },
  { name: '我已处理', path: '/process/approval/done', icon: 'CircleCheck', color: '#409EFF', bgColor: '#ecf5ff' },
  { name: '我发起的', path: '/process/approval/launched', icon: 'Position', color: '#E6A23C', bgColor: '#fdf6ec' },
  { name: '抄送我的', path: '/process/approval/cced', icon: 'Promotion', color: '#F56C6C', bgColor: '#fef0f0' },
  { name: '审批委托', path: '/process/approval/delegate', icon: 'UserFilled', color: '#909399', bgColor: '#f4f4f5' },
  { name: '会议管理', path: '/office/meeting', icon: 'VideoCamera', color: '#67C23A', bgColor: '#f0f9ff' },
  { name: '组织通讯录', path: '/org/employee', icon: 'User', color: '#1890ff', bgColor: '#ecf5ff' },
  { name: '新闻公告', path: '/cms/news', icon: 'Reading', color: '#E6A23C', bgColor: '#fdf6ec' },
  { name: '公文管理', path: '/cms/document', icon: 'Folder', color: '#F56C6C', bgColor: '#fef0f0' },
  { name: '内部邮件', path: '/message/email', icon: 'Message', color: '#409EFF', bgColor: '#ecf5ff' },
  { name: '站内消息', path: '/message/station', icon: 'ChatDotRound', color: '#909399', bgColor: '#f4f4f5' }
])

// 外部系统
const externalSystems = ref([
  {
    name: '财务管理系统',
    description: '财务报销、预算管理',
    url: 'https://finance.example.com',
    icon: 'Money',
    color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  {
    name: '人力资源系统',
    description: '薪酬福利、绩效考核',
    url: 'https://hr.example.com',
    icon: 'User',
    color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
  },
  {
    name: '档案管理系统',
    description: '电子档案、文档管理',
    url: 'https://archive.example.com',
    icon: 'Files',
    color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
  },
  {
    name: '合同管理系统',
    description: '合同审批、履约跟踪',
    url: 'https://contract.example.com',
    icon: 'Document',
    color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
  },
  {
    name: '数据分析平台',
    description: '业务报表、数据看板',
    url: 'https://data.example.com',
    icon: 'DataAnalysis',
    color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
  },
  {
    name: '项目管理系统',
    description: '项目跟踪、进度管理',
    url: 'https://project.example.com',
    icon: 'Management',
    color: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
  }
])

// 待办列表
const todoList = ref([
  { id: 1, title: '采购申请-办公用品采购', type: '采购申请', submitter: '张三', time: '2026-04-07 09:30' },
  { id: 2, title: '请假申请-年假3天', type: '请假申请', submitter: '李四', time: '2026-04-07 08:45' },
  { id: 3, title: '费用报销-差旅费', type: '费用报销', submitter: '王五', time: '2026-04-06 16:20' },
  { id: 4, title: '用印申请-合同盖章', type: '用印申请', submitter: '赵六', time: '2026-04-06 14:10' },
  { id: 5, title: '会议室预定-项目评审', type: '会议申请', submitter: '钱七', time: '2026-04-06 11:30' }
])

// 公告通知
const noticeList = ref([
  { title: '关于2026年清明节放假安排的通知', date: '2026-04-05', urgent: false },
  { title: '关于系统升级维护的通知', date: '2026-04-04', urgent: true },
  { title: '关于开展2025年度优秀员工评选的通知', date: '2026-04-03', urgent: false },
  { title: '关于规范考勤管理的通知', date: '2026-04-02', urgent: false }
])

// 常用工具
const commonTools = ref([
  { name: '通讯录', path: '/org/employee', icon: 'User' },
  { name: '内部邮件', path: '/message/email', icon: 'Message' },
  { name: '日程管理', path: '/Empty', icon: 'Calendar' },
  { name: '系统设置', path: '/system/config', icon: 'Setting' }
])

// 今日日程
const todaySchedule = ref([
  { time: '09:00', title: '部门周例会', location: '会议室A301', isCurrent: true },
  { time: '14:00', title: '项目评审会议', location: '会议室B205', isCurrent: false },
  { time: '16:30', title: '客户拜访', location: '外部', isCurrent: false }
])

const navigateTo = (path) => {
  router.push(path)
}

const openExternalSystem = (system) => {
  ElMessage.info(`正在跳转至 ${system.name}...`)
  window.open(system.url, '_blank')
}

const handleTodo = (row) => {
  router.push('/process/approval/detail?id=' + row.id)
}

const viewNotice = (notice) => {
  router.push('/cms/news')
}

const getTypeTag = (type) => {
  const typeMap = {
    '采购申请': '',
    '请假申请': 'success',
    '费用报销': 'warning',
    '用印申请': 'danger',
    '会议申请': 'info'
  }
  return typeMap[type] || ''
}
</script>

<style lang="scss" scoped>
.home-page {
  padding: 0;
  background: #f0f2f5;
  min-height: calc(100vh - 60px);

  .welcome-banner {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 30px 40px;
    margin-bottom: 20px;
    color: #fff;

    .welcome-content {
      max-width: 1400px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .welcome-text {
        h2 {
          font-size: 24px;
          margin: 0 0 8px 0;
          font-weight: 500;
        }

        p {
          margin: 0;
          opacity: 0.9;
          font-size: 14px;
        }
      }

      .quick-stats {
        display: flex;
        align-items: center;
        gap: 30px;

        .stat-item {
          cursor: pointer;
          text-align: center;
          transition: transform 0.3s;

          &:hover {
            transform: scale(1.05);
          }

          .stat-value {
            font-size: 32px;
            font-weight: 600;
            margin-bottom: 4px;
          }

          .stat-label {
            font-size: 14px;
            opacity: 0.9;
          }
        }

        .stat-divider {
          width: 1px;
          height: 40px;
          background: rgba(255, 255, 255, 0.3);
        }
      }
    }
  }

  .content-row {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 20px 20px;

    .portal-card {
      margin-bottom: 20px;
      border-radius: 8px;

      :deep(.el-card__header) {
        padding: 16px 20px;
        border-bottom: 1px solid #f0f0f0;
      }

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .header-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 16px;
          font-weight: 600;
          color: #303133;

          .el-icon {
            color: #409eff;
          }
        }
      }
    }

    // 快捷入口网格
    .quick-access-grid {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 16px;
      padding: 20px;

      .access-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        padding: 20px;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s;
        background: #fafafa;

        &:hover {
          transform: translateY(-4px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          background: #fff;
        }

        .icon-wrapper {
          width: 56px;
          height: 56px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .item-name {
          font-size: 14px;
          color: #606266;
          font-weight: 500;
        }
      }
    }

    // 外部系统网格
    .external-systems-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
      padding: 16px 20px;

      .system-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s;
        border: 1px solid #ebeef5;
        background: #fafafa;

        &:hover {
          border-color: #409eff;
          background: #fff;
          box-shadow: 0 2px 8px rgba(64, 158, 255, 0.15);
          transform: translateX(4px);
        }

        .system-icon {
          width: 48px;
          height: 48px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .system-info {
          flex: 1;
          min-width: 0;

          .system-name {
            font-size: 14px;
            font-weight: 600;
            color: #303133;
            margin-bottom: 4px;
          }

          .system-desc {
            font-size: 12px;
            color: #909399;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }

        .arrow-icon {
          color: #c0c4cc;
          font-size: 16px;
          transition: all 0.3s;
        }

        &:hover .arrow-icon {
          color: #409eff;
          transform: translateX(4px);
        }
      }
    }

    // 待办表格
    .todo-table {
      :deep(.el-table__row) {
        cursor: pointer;

        &:hover {
          background: #f5f7fa;
        }
      }
    }

    // 公告列表
    .notice-list {
      padding: 12px 20px;

      .notice-item {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        padding: 12px 0;
        border-bottom: 1px dashed #ebeef5;
        cursor: pointer;
        transition: all 0.3s;

        &:last-child {
          border-bottom: none;
        }

        &:hover {
          background: #f5f7fa;
          margin: 0 -20px;
          padding: 12px 20px;
        }

        .notice-tag {
          flex-shrink: 0;
          margin-top: 2px;
        }

        .notice-content {
          flex: 1;
          min-width: 0;

          .notice-title {
            font-size: 14px;
            color: #303133;
            margin-bottom: 4px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .notice-date {
            font-size: 12px;
            color: #909399;
          }
        }
      }
    }

    // 工具列表
    .tools-list {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
      padding: 16px 20px;

      .tool-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.3s;
        background: #fafafa;
        font-size: 14px;
        color: #606266;

        &:hover {
          background: #ecf5ff;
          color: #409eff;
        }
      }
    }

    // 日程列表
    .schedule-list {
      padding: 12px 20px;

      .schedule-item {
        display: flex;
        gap: 12px;
        padding: 12px 0;
        border-left: 3px solid #e4e7ed;
        padding-left: 16px;
        position: relative;

        &.is-current {
          border-left-color: #409eff;
          background: #ecf5ff;
          margin: 0 -20px;
          padding: 12px 20px 12px 36px;
        }

        .time-slot {
          font-size: 14px;
          font-weight: 600;
          color: #606266;
          min-width: 50px;
        }

        .schedule-content {
          flex: 1;

          .schedule-title {
            font-size: 14px;
            color: #303133;
            margin-bottom: 4px;
          }

          .schedule-location {
            display: flex;
            align-items: center;
            gap: 4px;
            font-size: 12px;
            color: #909399;
          }
        }
      }
    }
  }
}
</style>
