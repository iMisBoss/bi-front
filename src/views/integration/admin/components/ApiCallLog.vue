<template>
  <div class="api-call-log">
    <!-- 筛选栏 -->
    <div class="filter-bar">
      <el-input placeholder="搜索接口路径/调用方" clearable style="width: 200px" />
      <el-select placeholder="请求方法" clearable style="width: 140px">
        <el-option label="GET" value="GET" />
        <el-option label="POST" value="POST" />
        <el-option label="PUT" value="PUT" />
        <el-option label="DELETE" value="DELETE" />
      </el-select>
      <el-select placeholder="响应状态" clearable style="width: 140px">
        <el-option label="200 成功" value="200" />
        <el-option label="4xx 客户端错误" value="4xx" />
        <el-option label="5xx 服务端错误" value="5xx" />
      </el-select>
      <el-date-picker type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" style="width: 220px" />
      <el-button type="primary" icon="Search">查询</el-button>
      <el-button icon="Refresh">重置</el-button>
      <el-button type="success" icon="Download" style="margin-left: auto">导出日志</el-button>
    </div>

    <!-- 接口调用日志表格 -->
    <el-table :data="apiLogs" border style="margin-top: 16px" :header-cell-style="{background: '#f5f7fa', color: '#606266'}">
      <el-table-column prop="time" label="调用时间" width="160" />
      <el-table-column prop="method" label="请求方法" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="getMethodType(row.method)" size="small">{{ row.method }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="path" label="接口路径" min-width="200" show-overflow-tooltip />
      <el-table-column prop="caller" label="调用方" width="120" />
      <el-table-column prop="responseTime" label="响应时间" width="120" align="center">
        <template #default="{ row }">
          <span :class="{ 'danger-text': row.responseTime > 1000 }">{{ row.responseTime }}ms</span>
        </template>
      </el-table-column>
      <el-table-column prop="statusCode" label="状态码" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="row.statusCode === 200 ? 'success' : 'danger'" size="small">{{ row.statusCode }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="140" align="center">
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click="handleViewDetail(row)">查看详情</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[20, 50, 100, 200]"
        layout="total, sizes, prev, pager, next, jumper"
        style="margin-top: 16px; justify-content: flex-end"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(128)

const apiLogs = ref([
  { id: 1, time: '2026-04-15 10:30:25', method: 'GET', path: '/api/document/export', caller: '文档服务', responseTime: 1250, statusCode: 200 },
  { id: 2, time: '2026-04-15 10:28:12', method: 'POST', path: '/api/ai/generate', caller: 'AI助手', responseTime: 980, statusCode: 200 },
  { id: 3, time: '2026-04-15 10:25:33', method: 'GET', path: '/api/audit/logs/query', caller: '审计服务', responseTime: 850, statusCode: 200 },
  { id: 4, time: '2026-04-15 10:22:45', method: 'POST', path: '/api/process/start', caller: '流程服务', responseTime: 720, statusCode: 200 },
  { id: 5, time: '2026-04-15 10:20:18', method: 'GET', path: '/api/file/upload', caller: '文件服务', responseTime: 650, statusCode: 200 },
  { id: 6, time: '2026-04-15 10:18:05', method: 'POST', path: '/api/user/query', caller: '用户服务', responseTime: 450, statusCode: 200 },
  { id: 7, time: '2026-04-15 10:15:42', method: 'DELETE', path: '/api/document/delete', caller: '文档服务', responseTime: 320, statusCode: 200 },
  { id: 8, time: '2026-04-15 10:12:30', method: 'PUT', path: '/api/user/update', caller: '用户服务', responseTime: 380, statusCode: 400 }
])

const getMethodType = (method) => {
  const types = {
    'GET': '',
    'POST': 'success',
    'PUT': 'warning',
    'DELETE': 'danger'
  }
  return types[method] || ''
}

const handleViewDetail = (row) => {
  ElMessage.info('查看接口调用详情功能')
}
</script>

<style lang="scss" scoped>
.api-call-log {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
  padding-bottom: 20px;

  .filter-bar {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    align-items: center;
  }

  .danger-text {
    color: #f56c6c;
    font-weight: 600;
  }
}
</style>
