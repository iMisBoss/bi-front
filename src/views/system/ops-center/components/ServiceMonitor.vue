<template>
  <div class="service-monitor">
    <!-- 操作栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <el-button type="primary" @click="handleHealthCheck" :loading="checking">一键健康检测</el-button>
        <el-button @click="handleExport" icon="Download">导出监控报表</el-button>
      </div>
      <div class="toolbar-right">
        <el-button @click="handleRefresh" icon="Refresh">刷新数据</el-button>
        <span class="update-time">最后更新：{{ updateTime }}</span>
      </div>
    </div>

    <!-- 服务器资源监控 -->
    <el-card class="config-card" shadow="never">
      <template #header>
        <span class="card-title">服务器资源监控</span>
      </template>
      <el-row :gutter="20">
        <el-col :span="6" v-for="resource in serverResources" :key="resource.name">
          <div class="resource-item">
            <div class="resource-label">{{ resource.name }}</div>
            <el-progress
                :percentage="resource.usage"
                :status="resource.usage > 80 ? 'exception' : resource.usage > 60 ? 'warning' : ''"
                :stroke-width="20"
            />
            <div class="resource-value">{{ resource.usage }}%</div>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 核心服务监控 -->
    <el-card class="config-card" shadow="never" style="margin-top: 20px">
      <template #header>
        <span class="card-title">核心服务监控</span>
      </template>
      <el-table :data="coreServices" border>
        <el-table-column prop="name" label="服务名称" min-width="200" />
        <el-table-column prop="status" label="运行状态" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="uptime" label="运行时长" width="150" />
        <el-table-column prop="pid" label="进程ID" width="120" />
        <el-table-column prop="port" label="端口" width="100" align="center" />
        <el-table-column label="操作" width="140" align="center">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleRestart(row)" :disabled="row.status === '正常'">重启</el-button>
            <el-button link type="primary" size="small" @click="handleViewDetail(row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 接口性能监控 -->
    <el-card class="config-card" shadow="never" style="margin-top: 20px">
      <template #header>
        <span class="card-title">接口性能监控（TOP5慢接口）</span>
      </template>
      <el-table :data="slowInterfaces" border>
        <el-table-column prop="name" label="接口名称" min-width="250" />
        <el-table-column prop="avgTime" label="平均响应时间" width="150">
          <template #default="{ row }">
            <span :class="{ 'danger-text': row.avgTime > 1000 }">{{ row.avgTime }}ms</span>
          </template>
        </el-table-column>
        <el-table-column prop="timeoutRate" label="超时率" width="120" align="center">
          <template #default="{ row }">
            <span :class="{ 'danger-text': row.timeoutRate > 5 }">{{ row.timeoutRate }}%</span>
          </template>
        </el-table-column>
        <el-table-column prop="errorRate" label="错误率" width="120" align="center">
          <template #default="{ row }">
            <span :class="{ 'danger-text': row.errorRate > 2 }">{{ row.errorRate }}%</span>
          </template>
        </el-table-column>
        <el-table-column prop="calls" label="调用次数" width="120" align="center" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const checking = ref(false)
const updateTime = ref('2026-04-15 10:30:25')

const serverResources = ref([
  { name: 'CPU使用率', usage: 45 },
  { name: '内存占用', usage: 68 },
  { name: '磁盘空间', usage: 72 },
  { name: '网络带宽', usage: 35 }
])

const coreServices = ref([
  { id: 1, name: 'OA主服务', status: '正常', uptime: '15天8小时', pid: 12345, port: 8088 },
  { id: 2, name: '数据库服务', status: '正常', uptime: '15天8小时', pid: 12346, port: 3306 },
  { id: 3, name: '缓存服务', status: '正常', uptime: '15天8小时', pid: 12347, port: 6379 },
  { id: 4, name: 'AI本地服务', status: '正常', uptime: '10天2小时', pid: 12348, port: 9000 }
])

const slowInterfaces = ref([
  { name: '/api/document/export', avgTime: 1250, timeoutRate: 8, errorRate: 2, calls: 156 },
  { name: '/api/ai/generate', avgTime: 980, timeoutRate: 5, errorRate: 1, calls: 234 },
  { name: '/api/audit/logs/query', avgTime: 850, timeoutRate: 3, errorRate: 0, calls: 567 },
  { name: '/api/process/start', avgTime: 720, timeoutRate: 2, errorRate: 1, calls: 890 },
  { name: '/api/file/upload', avgTime: 650, timeoutRate: 1, errorRate: 0, calls: 345 }
])

const getStatusType = (status) => {
  const types = {
    '正常': 'success',
    '异常': 'danger',
    '离线': 'info'
  }
  return types[status] || ''
}

const handleHealthCheck = () => {
  checking.value = true
  setTimeout(() => {
    checking.value = false
    ElMessage.success('健康检测完成，所有服务正常')
  }, 1500)
}

const handleExport = () => {
  ElMessage.success('监控报表导出成功')
}

const handleRefresh = () => {
  updateTime.value = new Date().toLocaleString()
  ElMessage.success('数据刷新成功')
}

const handleRestart = (row) => {
  ElMessageBox.confirm(`确定要重启服务「${row.name}」吗？重启期间该服务将不可用。`, '重启服务', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success(`服务「${row.name}」重启成功`)
  }).catch(() => {})
}

const handleViewDetail = (row) => {
  ElMessage.info('查看服务详情功能')
}
</script>

<style lang="scss" scoped>
.service-monitor {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;

  .config-card {
    border-radius: 8px;

    .card-title {
      font-size: 16px;
      font-weight: 600;
    }
  }

  .toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 16px;
    border-bottom: 1px solid #ebeef5;

    .toolbar-left,
    .toolbar-right {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .update-time {
      font-size: 12px;
      color: #909399;
      margin-left: 12px;
    }
  }

  .resource-item {
    padding: 16px;
    background: #f5f7fa;
    border-radius: 8px;
    text-align: center;

    .resource-label {
      margin-bottom: 12px;
      font-weight: 600;
      color: #303133;
    }

    .resource-value {
      margin-top: 8px;
      font-size: 18px;
      font-weight: 600;
      color: #303133;
    }
  }

  .danger-text {
    color: #f56c6c;
    font-weight: 600;
  }
}
</style>
