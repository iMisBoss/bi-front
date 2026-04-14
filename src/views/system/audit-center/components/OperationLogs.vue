<template>
  <div class="operation-logs">
    <!-- 统计卡片 -->
    <el-row :gutter="16" style="margin-bottom: 20px">
      <el-col :span="6">
        <el-card shadow="never" class="stat-card">
          <div class="stat-content">
            <div class="stat-value">{{ stats.totalLogs }}</div>
            <div class="stat-label">日志总数</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never" class="stat-card">
          <div class="stat-content">
            <div class="stat-value">{{ stats.todayLogs }}</div>
            <div class="stat-label">今日新增</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never" class="stat-card">
          <div class="stat-content">
            <div class="stat-value" style="color: #f56c6c">{{ stats.failCount }}</div>
            <div class="stat-label">失败操作</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never" class="stat-card">
          <div class="stat-content">
            <div class="stat-value" style="color: #e6a23c">{{ stats.adminOps }}</div>
            <div class="stat-label">管理员操作</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 高级筛选区 -->
    <div class="filter-bar">
      <el-input v-model="searchKeyword" placeholder="搜索操作人/操作内容/模块" prefix-icon="Search" clearable style="width: 280px" />
      <el-select v-model="filterUser" placeholder="操作人" clearable style="width: 150px">
        <el-option label="张三" value="张三" />
        <el-option label="李四" value="李四" />
        <el-option label="王五" value="王五" />
      </el-select>
      <el-select v-model="filterModule" placeholder="操作模块" clearable style="width: 150px">
        <el-option label="权限管理" value="permission" />
        <el-option label="内容管理" value="content" />
        <el-option label="AI管理" value="ai" />
        <el-option label="系统配置" value="config" />
      </el-select>
      <el-select v-model="filterAction" placeholder="操作类型" clearable style="width: 150px">
        <el-option label="新增" value="add" />
        <el-option label="编辑" value="edit" />
        <el-option label="删除" value="delete" />
        <el-option label="导出" value="export" />
      </el-select>
      <el-select v-model="filterStatus" placeholder="操作状态" clearable style="width: 120px">
        <el-option label="成功" value="success" />
        <el-option label="失败" value="fail" />
      </el-select>
      <el-date-picker v-model="dateRange" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" style="width: 240px" />
      <el-button-group>
        <el-button @click="handleExport" icon="Download">导出日志</el-button>
        <el-button @click="handleRefresh" icon="Refresh">刷新</el-button>
      </el-button-group>
    </div>

    <!-- 日志列表 -->
    <el-table
        :data="operationLogs"
        border
        row-key="id"
        :header-cell-style="{ background: '#fafafa', color: '#333', fontWeight: '600' }"
        style="flex: 1"
    >
      <el-table-column prop="time" label="操作时间" width="160" fixed />
      <el-table-column prop="userId" label="用户ID" width="100" />
      <el-table-column prop="userName" label="姓名" width="100" />
      <el-table-column prop="department" label="所属部门" width="120" />
      <el-table-column prop="module" label="操作模块" width="120" />
      <el-table-column prop="action" label="操作行为" width="100" />
      <el-table-column prop="content" label="操作内容" min-width="250" show-overflow-tooltip />
      <el-table-column prop="ip" label="客户端IP" width="140" />
      <el-table-column prop="status" label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="row.status === 'success' ? 'success' : 'danger'" size="small">
            {{ row.status === 'success' ? '成功' : '失败' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="100" align="center" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click="handleViewDetail(row)">详情</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-wrapper">
      <el-pagination
          :total="operationLogs.length"
          :page-size="20"
          layout="total, prev, pager, next, jumper"
      />
    </div>

    <!-- 详情抽屉 -->
    <el-drawer v-model="showDetailDrawer" title="操作日志详情" size="600px">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="操作时间">{{ currentLog?.time }}</el-descriptions-item>
        <el-descriptions-item label="用户ID">{{ currentLog?.userId }}</el-descriptions-item>
        <el-descriptions-item label="姓名">{{ currentLog?.userName }}</el-descriptions-item>
        <el-descriptions-item label="所属部门">{{ currentLog?.department }}</el-descriptions-item>
        <el-descriptions-item label="操作模块">{{ currentLog?.module }}</el-descriptions-item>
        <el-descriptions-item label="操作行为">{{ currentLog?.action }}</el-descriptions-item>
        <el-descriptions-item label="操作内容">{{ currentLog?.content }}</el-descriptions-item>
        <el-descriptions-item label="请求参数">
          <el-input type="textarea" :rows="4" :model-value="JSON.stringify(currentLog?.params, null, 2)" readonly />
        </el-descriptions-item>
        <el-descriptions-item label="客户端IP">{{ currentLog?.ip }}</el-descriptions-item>
        <el-descriptions-item label="设备信息">{{ currentLog?.device }}</el-descriptions-item>
        <el-descriptions-item label="操作状态">
          <el-tag :type="currentLog?.status === 'success' ? 'success' : 'danger'">
            {{ currentLog?.status === 'success' ? '成功' : '失败' }}
          </el-tag>
        </el-descriptions-item>
      </el-descriptions>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'

const searchKeyword = ref('')
const filterUser = ref('')
const filterModule = ref('')
const filterAction = ref('')
const filterStatus = ref('')
const dateRange = ref(null)
const showDetailDrawer = ref(false)
const currentLog = ref(null)

const stats = reactive({
  totalLogs: 125680,
  todayLogs: 328,
  failCount: 12,
  adminOps: 45
})

const operationLogs = ref([
  { id: 1, time: '2026-04-15 10:30:25', userId: 'U001', userName: '张三', department: '技术部', module: '权限管理', action: '编辑', content: '为角色「部门管理员」新增菜单权限「AI管理」', params: { roleId: 3, menuId: 15 }, ip: '192.168.1.100', device: 'Chrome 120 / Windows 10', status: 'success' },
  { id: 2, time: '2026-04-15 09:15:10', userId: 'U002', userName: '李四', department: '产品部', module: '内容管理', action: '新增', content: '发布内容「关于召开2026年度第一次全员大会的通知」', params: { contentId: 156 }, ip: '192.168.1.101', device: 'Edge 120 / Windows 11', status: 'success' },
  { id: 3, time: '2026-04-14 16:20:35', userId: 'U003', userName: '王五', department: '财务部', module: '系统配置', action: '删除', content: '尝试删除系统菜单「工作台」', params: { menuId: 1 }, ip: '192.168.1.102', device: 'Chrome 119 / macOS', status: 'fail' },
  { id: 4, time: '2026-04-14 14:10:20', userId: 'U001', userName: '张三', department: '技术部', module: 'AI管理', action: '编辑', content: '修改AI模型配置参数', params: { modelId: 1, contextRounds: 5 }, ip: '192.168.1.100', device: 'Chrome 120 / Windows 10', status: 'success' },
  { id: 5, time: '2026-04-14 11:30:15', userId: 'U004', userName: '赵六', department: '行政部', module: '权限管理', action: '导出', content: '导出权限配置报表', params: {}, ip: '192.168.1.103', device: 'Chrome 120 / Windows 10', status: 'success' }
])

const handleViewDetail = (row) => {
  currentLog.value = row
  showDetailDrawer.value = true
}

const handleExport = () => {
  ElMessage.success('日志导出成功')
}

const handleRefresh = () => {
  ElMessage.success('刷新成功')
}
</script>

<style lang="scss" scoped>
.operation-logs {
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
