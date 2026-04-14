<template>
  <div class="login-logs">
    <!-- 安全统计看板 -->
    <el-row :gutter="16" style="margin-bottom: 20px">
      <el-col :span="6">
        <el-card shadow="never" class="stat-card">
          <div class="stat-content">
            <div class="stat-value">{{ loginStats.totalLogins }}</div>
            <div class="stat-label">今日登录次数</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never" class="stat-card">
          <div class="stat-content">
            <div class="stat-value" style="color: #f56c6c">{{ loginStats.failLogins }}</div>
            <div class="stat-label">登录失败次数</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never" class="stat-card">
          <div class="stat-content">
            <div class="stat-value" style="color: #e6a23c">{{ loginStats.lockedAccounts }}</div>
            <div class="stat-label">锁定账号数</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never" class="stat-card">
          <div class="stat-content">
            <div class="stat-value">{{ loginStats.abnormalIPs }}</div>
            <div class="stat-label">异常IP数</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 筛选区 -->
    <div class="filter-bar">
      <el-input v-model="searchKeyword" placeholder="搜索用户/IP地址" prefix-icon="Search" clearable style="width: 240px" />
      <el-select v-model="filterStatus" placeholder="登录状态" clearable style="width: 150px">
        <el-option label="成功" value="success" />
        <el-option label="失败" value="fail" />
        <el-option label="锁定" value="locked" />
      </el-select>
      <el-select v-model="filterTerminal" placeholder="登录终端" clearable style="width: 150px">
        <el-option label="PC端" value="pc" />
        <el-option label="移动端" value="mobile" />
      </el-select>
      <el-date-picker v-model="dateRange" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" style="width: 240px" />
      <el-button-group>
        <el-button @click="handleExport" icon="Download">导出报表</el-button>
        <el-button @click="handleRefresh" icon="Refresh">刷新</el-button>
      </el-button-group>
    </div>

    <!-- 登录日志列表 -->
    <el-table
        :data="loginLogs"
        border
        row-key="id"
        :header-cell-style="{ background: '#fafafa', color: '#333', fontWeight: '600' }"
        style="flex: 1"
    >
      <el-table-column prop="time" label="登录时间" width="160" fixed />
      <el-table-column prop="userId" label="用户ID" width="100" />
      <el-table-column prop="userName" label="姓名" width="100" />
      <el-table-column prop="department" label="所属部门" width="120" />
      <el-table-column prop="loginType" label="登录类型" width="120" />
      <el-table-column prop="ip" label="登录IP" width="140" />
      <el-table-column prop="location" label="登录地点" width="120" />
      <el-table-column prop="device" label="设备型号" min-width="150" show-overflow-tooltip />
      <el-table-column prop="status" label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)" size="small">{{ getStatusText(row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="140" align="center" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click="handleForceLogout(row)">强制下线</el-button>
          <el-button link type="danger" size="small" @click="handleBlockIP(row)">加入黑名单</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-wrapper">
      <el-pagination
          :total="loginLogs.length"
          :page-size="20"
          layout="total, prev, pager, next, jumper"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const searchKeyword = ref('')
const filterStatus = ref('')
const filterTerminal = ref('')
const dateRange = ref(null)

const loginStats = reactive({
  totalLogins: 568,
  failLogins: 23,
  lockedAccounts: 3,
  abnormalIPs: 5
})

const loginLogs = ref([
  { id: 1, time: '2026-04-15 10:30', userId: 'U001', userName: '张三', department: '技术部', loginType: '密码登录', ip: '192.168.1.100', location: '内网', device: 'Chrome 120 / Windows 10', status: 'success', logoutTime: '2026-04-15 18:00' },
  { id: 2, time: '2026-04-15 09:15', userId: 'U002', userName: '李四', department: '产品部', loginType: '单点登录', ip: '192.168.1.101', location: '内网', device: 'Edge 120 / Windows 11', status: 'success', logoutTime: '' },
  { id: 3, time: '2026-04-14 16:20', userId: 'U003', userName: '王五', department: '财务部', loginType: '密码登录', ip: '10.0.0.50', location: '外网', device: 'Chrome 119 / macOS', status: 'fail', logoutTime: '' },
  { id: 4, time: '2026-04-14 14:10', userId: 'U005', userName: '钱七', department: '行政部', loginType: '密码登录', ip: '192.168.1.105', location: '内网', device: 'Chrome 120 / Windows 10', status: 'locked', logoutTime: '' }
])

const getStatusType = (status) => {
  const types = {
    'success': 'success',
    'fail': 'danger',
    'locked': 'warning'
  }
  return types[status] || ''
}

const getStatusText = (status) => {
  const texts = {
    'success': '成功',
    'fail': '失败',
    'locked': '锁定'
  }
  return texts[status] || status
}

const handleForceLogout = (row) => {
  ElMessageBox.confirm(`确定要强制用户「${row.userName}」下线吗？`, '强制下线', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('强制下线成功')
  }).catch(() => {})
}

const handleBlockIP = (row) => {
  ElMessageBox.confirm(`确定要将IP「${row.ip}」加入黑名单吗？`, '加入黑名单', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'error'
  }).then(() => {
    ElMessage.success('IP已加入黑名单')
  }).catch(() => {})
}

const handleExport = () => {
  ElMessage.success('安全报表导出成功')
}

const handleRefresh = () => {
  ElMessage.success('刷新成功')
}
</script>

<style lang="scss" scoped>
.login-logs {
  display: flex;
  flex-direction: column;
  height: 100%;

  .stat-card {
    border-radius: 8px;

    .stat-content {
      text-align: center;
      padding: 12px 0;

      .stat-value {
        font-size: 24px;
        font-weight: 600;
        color: #303133;
        margin-bottom: 4px;
      }

      .stat-label {
        font-size: 14px;
        color: #909399;
      }
    }
  }

  .filter-bar {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;
    flex-wrap: wrap;
  }

  .pagination-wrapper {
    margin-top: 16px;
    display: flex;
    justify-content: flex-end;
    flex-shrink: 0;
  }
}
</style>
