<template>
  <div class="login-log-page">
    <el-card shadow="never">
      <template #header>
        <div class="page-header">
          <h2>个人登录日志</h2>
          <el-tag type="info" size="small">查看您的登录记录</el-tag>
        </div>
      </template>

      <div class="filter-bar">
        <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            style="width: 240px"
        />
        <el-select v-model="status" placeholder="登录状态" clearable style="width: 150px">
          <el-option label="成功" value="success" />
          <el-option label="失败" value="failed" />
        </el-select>
        <el-button type="primary" @click="handleQuery" icon="Search">查询</el-button>
        <el-button @click="handleReset" icon="Refresh">重置</el-button>
      </div>

      <el-table :data="logList" border v-loading="loading">
        <el-table-column prop="loginTime" label="登录时间" width="180" sortable />
        <el-table-column prop="ip" label="IP地址" width="150" />
        <el-table-column prop="location" label="登录地点" width="150" />
        <el-table-column prop="device" label="设备信息" min-width="200" show-overflow-tooltip />
        <el-table-column prop="browser" label="浏览器" width="150" />
        <el-table-column prop="status" label="登录状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === '成功' ? 'success' : 'danger'" size="small">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="failReason" label="失败原因" width="150" show-overflow-tooltip>
          <template #default="{ row }">
            <span v-if="row.failReason">{{ row.failReason }}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <span class="total">共 {{ logList.length }} 条</span>
        <el-pagination layout="prev, pager, next" :total="logList.length" />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

const loading = ref(false)
const dateRange = ref(null)
const status = ref('')

const logList = ref([
  {
    loginTime: '2026-01-15 09:30:00',
    ip: '192.168.1.100',
    location: '北京市',
    device: 'Windows 10',
    browser: 'Chrome 120',
    status: '成功',
    failReason: ''
  },
  {
    loginTime: '2026-01-14 18:20:00',
    ip: '192.168.1.101',
    location: '北京市',
    device: 'MacOS',
    browser: 'Safari 17',
    status: '成功',
    failReason: ''
  },
  {
    loginTime: '2026-01-14 14:15:00',
    ip: '10.0.0.50',
    location: '未知',
    device: 'Windows 11',
    browser: 'Edge 120',
    status: '失败',
    failReason: '密码错误'
  },
  {
    loginTime: '2026-01-13 08:45:00',
    ip: '192.168.1.100',
    location: '北京市',
    device: 'Windows 10',
    browser: 'Chrome 120',
    status: '成功',
    failReason: ''
  }
])

const handleQuery = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    ElMessage.success('查询成功')
  }, 500)
}

const handleReset = () => {
  dateRange.value = null
  status.value = ''
  handleQuery()
}

onMounted(() => {
  console.log('个人登录日志加载')
})
</script>

<style scoped lang="scss">
.login-log-page {
  padding: 20px;

  .page-header {
    display: flex;
    align-items: center;
    gap: 12px;

    h2 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
    }
  }

  .filter-bar {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;
  }

  .pagination {
    margin-top: 16px;
    display: flex;
    justify-content: flex-end;
    align-items: center;

    .total {
      font-size: 14px;
      color: #606266;
    }
  }
}
</style>
