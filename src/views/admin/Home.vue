<template>
  <div class="admin-home">
    <!-- 欢迎横幅 -->
    <div class="admin-banner">
      <div class="banner-content">
        <div class="welcome-text">
          <h2>系统管理控制台</h2>
          <p>{{ greetingMessage }}，{{ currentUser?.name || '管理员' }} | 今天是 {{ currentDate }}</p>
        </div>
        <div class="system-status">
          <el-tag type="success" effect="dark" size="large">
            <el-icon><CircleCheckFilled /></el-icon> 系统运行正常
          </el-tag>
        </div>
      </div>
    </div>

    <!-- 核心指标 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6" v-for="stat in systemStats" :key="stat.label">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" :style="{ background: stat.bgColor }">
              <el-icon :size="28" :color="stat.color"><component :is="stat.icon" /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stat.value }}</div>
              <div class="stat-label">{{ stat.label }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="main-content">
      <!-- 左侧：快捷管理与监控 -->
      <el-col :span="16">
        <!-- 管理功能快捷入口 -->
        <el-card class="content-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="header-title">
                <el-icon><Grid /></el-icon>
                管理功能
              </span>
            </div>
          </template>
          <div class="quick-grid">
            <div
                class="grid-item"
                v-for="item in adminQuickAccess"
                :key="item.path"
                @click="navigateTo(item.path)"
            >
              <div class="item-icon" :style="{ background: item.bgColor }">
                <el-icon :size="24" :color="item.color"><component :is="item.icon" /></el-icon>
              </div>
              <span class="item-name">{{ item.name }}</span>
              <span class="item-desc">{{ item.desc }}</span>
            </div>
          </div>
        </el-card>

        <!-- 最近操作日志 -->
        <el-card class="content-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="header-title">
                <el-icon><Document /></el-icon>
                最近操作日志
              </span>
              <el-button link type="primary" @click="navigateTo('/system/log')">查看全部</el-button>
            </div>
          </template>
          <el-table :data="recentLogs" style="width: 100%" :show-header="false" stripe>
            <el-table-column prop="time" label="时间" width="160">
              <template #default="{ row }">
                <span class="log-time">{{ row.time }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="user" label="操作人" width="100" />
            <el-table-column prop="action" label="操作内容" />
            <el-table-column prop="result" label="结果" width="80">
              <template #default="{ row }">
                <el-tag :type="row.result === '成功' ? 'success' : 'danger'" size="small">
                  {{ row.result }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <!-- 右侧：系统状态与维护 -->
      <el-col :span="8">
        <!-- 系统组件状态 -->
        <el-card class="content-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="header-title">
                <el-icon><Monitor /></el-icon>
                组件状态
              </span>
            </div>
          </template>
          <div class="status-list">
            <div class="status-item" v-for="s in componentStatus" :key="s.name">
              <div class="status-left">
                <span class="status-dot" :class="{ 'active': s.status === 'online' }"></span>
                <span class="status-name">{{ s.name }}</span>
              </div>
              <el-tag :type="s.status === 'online' ? 'success' : 'danger'" size="small">
                {{ s.status === 'online' ? '运行中' : '异常' }}
              </el-tag>
            </div>
          </div>
        </el-card>

        <!-- 系统维护 -->
        <el-card class="content-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="header-title">
                <el-icon><Setting /></el-icon>
                系统维护
              </span>
            </div>
          </template>
          <div class="maintenance-list">
            <div
                class="maintenance-item"
                v-for="m in maintenanceTools"
                :key="m.path"
                @click="navigateTo(m.path)"
            >
              <el-icon :size="20" color="#409eff"><component :is="m.icon" /></el-icon>
              <span>{{ m.name }}</span>
            </div>
          </div>
        </el-card>

        <!-- 存储使用情况 -->
        <el-card class="content-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="header-title">
                <el-icon><Coin /></el-icon>
                存储使用
              </span>
            </div>
          </template>
          <div class="storage-info">
            <div class="storage-item">
              <span>数据库</span>
              <el-progress :percentage="65" :stroke-width="8" />
            </div>
            <div class="storage-item">
              <span>文件存储</span>
              <el-progress :percentage="42" :stroke-width="8" status="success" />
            </div>
            <div class="storage-item">
              <span>日志空间</span>
              <el-progress :percentage="88" :stroke-width="8" status="exception" />
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user.js'
import {
  CircleCheckFilled, Grid, Document, Monitor, Setting, Coin,
  User, List, Files, DataAnalysis, Management, Bell, Tools,
  Timer, Connection, Cpu, Odometer
} from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()
const currentUser = computed(() => userStore.currentUser)

const greetingMessage = computed(() => {
  const hour = new Date().getHours()
  if (hour < 9) return '早上好'
  if (hour < 12) return '上午好'
  if (hour < 14) return '中午好'
  if (hour < 18) return '下午好'
  return '晚上好'
})

const currentDate = computed(() => {
  const now = new Date()
  return `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`
})

// 核心指标
const systemStats = ref([
  { label: '系统用户', value: '1,248', icon: 'User', color: '#409EFF', bgColor: '#ecf5ff' },
  { label: '在线用户', value: '86', icon: 'Connection', color: '#67C23A', bgColor: '#f0f9ff' },
  { label: '流程实例', value: '3,562', icon: 'List', color: '#E6A23C', bgColor: '#fdf6ec' },
  { label: '今日日志', value: '12,405', icon: 'DataAnalysis', color: '#F56C6C', bgColor: '#fef0f0' }
])

// 管理快捷入口
const adminQuickAccess = ref([
  { name: '组织架构', path: '/org/staff', icon: 'User', color: '#409EFF', bgColor: '#ecf5ff', desc: '部门/岗位/角色' },
  { name: '流程设计', path: '/process/design/business-object', icon: 'Management', color: '#67C23A', bgColor: '#f0f9ff', desc: '业务对象/表单/流程' },
  { name: '系统配置', path: '/system/config', icon: 'Setting', color: '#E6A23C', bgColor: '#fdf6ec', desc: '参数/菜单/字典' },
  { name: '审计日志', path: '/system/log', icon: 'Document', color: '#F56C6C', bgColor: '#fef0f0', desc: '登录/操作/异常' },
  { name: '系统备份', path: '/system/backup', icon: 'Files', color: '#909399', bgColor: '#f4f4f5', desc: '备份/恢复/策略' },
  { name: '集成中心', path: '/integration/apps', icon: 'Connection', color: '#1890ff', bgColor: '#ecf5ff', desc: '接口/定时任务/数据源' },
  { name: '消息管理', path: '/message/station', icon: 'Bell', color: '#67C23A', bgColor: '#f0f9ff', desc: '站内信/邮件/短信' },
  { name: '公文管理', path: '/cms/document', icon: 'Files', color: '#409EFF', bgColor: '#ecf5ff', desc: '发文/收文/流转' }
])

// 最近日志
const recentLogs = ref([
  { time: '2026-04-07 10:23:15', user: 'Admin', action: '修改系统参数 [系统名称]', result: '成功' },
  { time: '2026-04-07 09:45:30', user: 'Admin', action: '新增业务对象 [请假申请]', result: '成功' },
  { time: '2026-04-07 08:12:05', user: 'Admin', action: '执行系统备份 [自动备份]', result: '成功' },
  { time: '2026-04-06 18:30:22', user: 'Admin', action: '清理过期日志 [30天前]', result: '成功' },
  { time: '2026-04-06 14:20:10', user: 'Admin', action: '修改菜单权限 [流程审批中心]', result: '成功' }
])

// 组件状态
const componentStatus = ref([
  { name: '主数据库', status: 'online' },
  { name: '缓存服务 (Redis)', status: 'online' },
  { name: '消息队列 (RabbitMQ)', status: 'online' },
  { name: '文件服务 (MinIO)', status: 'online' },
  { name: '搜索引擎 (ES)', status: 'online' }
])

// 维护工具
const maintenanceTools = ref([
  { name: '缓存清理', path: '/system/config', icon: 'Timer' },
  { name: '日志归档', path: '/system/log', icon: 'Files' },
  { name: '服务重启', path: '/system/monitor/services', icon: 'Cpu' },
  { name: '性能监控', path: '/system/monitor/log-collection', icon: 'Odometer' }
])

const navigateTo = (path) => {
  router.push(path)
}
</script>

<style lang="scss" scoped>
.admin-home {
  padding: 0;
  background: #f0f2f5;
  min-height: calc(100vh - 60px);

  .admin-banner {
    background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
    padding: 30px 40px;
    margin-bottom: 20px;
    color: #fff;

    .banner-content {
      max-width: 1400px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .welcome-text {
        h2 { margin: 0 0 8px 0; font-weight: 500; }
        p { margin: 0; opacity: 0.9; font-size: 14px; }
      }
    }
  }

  .stats-row {
    max-width: 1400px;
    margin: 0 auto 20px;
    padding: 0 20px;

    .stat-card {
      border-radius: 8px;
      border: none;

      .stat-content {
        display: flex;
        align-items: center;
        gap: 16px;

        .stat-icon {
          width: 56px;
          height: 56px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stat-info {
          .stat-value {
            font-size: 24px;
            font-weight: 600;
            color: #303133;
          }
          .stat-label {
            font-size: 14px;
            color: #909399;
            margin-top: 4px;
          }
        }
      }
    }
  }

  .main-content {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 20px 20px;

    .content-card {
      margin-bottom: 20px;
      border-radius: 8px;

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
        }
      }
    }

    // 快捷网格
    .quick-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      padding: 16px;

      .grid-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 20px;
        border-radius: 8px;
        background: #fafafa;
        cursor: pointer;
        transition: all 0.3s;
        gap: 10px;

        &:hover {
          background: #fff;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          transform: translateY(-2px);
        }

        .item-icon {
          width: 48px;
          height: 48px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .item-name {
          font-size: 14px;
          font-weight: 600;
          color: #303133;
        }

        .item-desc {
          font-size: 12px;
          color: #909399;
        }
      }
    }

    // 日志时间
    .log-time {
      font-family: monospace;
      color: #606266;
    }

    // 组件状态列表
    .status-list {
      padding: 12px 20px;

      .status-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 0;
        border-bottom: 1px dashed #ebeef5;

        &:last-child { border-bottom: none; }

        .status-left {
          display: flex;
          align-items: center;
          gap: 8px;

          .status-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #f56c6c;
          }

          .status-dot.active {
            background: #67c23a;
            box-shadow: 0 0 4px #67c23a;
          }
        }
      }
    }

    // 维护工具列表
    .maintenance-list {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
      padding: 16px 20px;

      .maintenance-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px;
        border-radius: 6px;
        background: #fafafa;
        cursor: pointer;
        transition: all 0.3s;
        font-size: 13px;
        color: #606266;

        &:hover {
          background: #ecf5ff;
          color: #409eff;
        }
      }
    }

    // 存储信息
    .storage-info {
      padding: 16px 20px;

      .storage-item {
        margin-bottom: 16px;
        display: flex;
        align-items: center;
        gap: 12px;

        &:last-child { margin-bottom: 0; }

        span { min-width: 60px; font-size: 13px; color: #606266; }
      }
    }
  }
}
</style>
