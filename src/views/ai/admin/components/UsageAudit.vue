<template>
  <div class="usage-audit">
    <!-- 高级筛选区 -->
    <div class="filter-bar">
      <el-input v-model="filters.keyword" placeholder="搜索用户/提问内容" prefix-icon="Search" clearable style="width: 240px" />
      <el-select v-model="filters.department" placeholder="所属部门" clearable style="width: 150px">
        <el-option label="技术部" value="技术部" />
        <el-option label="产品部" value="产品部" />
        <el-option label="财务部" value="财务部" />
      </el-select>
      <el-select v-model="filters.function" placeholder="AI功能" clearable style="width: 150px">
        <el-option label="智能问答" value="qa" />
        <el-option label="文档总结" value="summary" />
        <el-option label="文案生成" value="writing" />
      </el-select>
      <el-select v-model="filters.status" placeholder="操作状态" clearable style="width: 120px">
      <el-option label="正常" value="normal" />
      <el-option label="拦截" value="intercepted" />
      <el-option label="异常" value="error" />
      </el-select>
      <el-date-picker
          v-model="filters.dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          style="width: 240px"
      />
      <el-button @click="handleSearch" icon="Search">搜索</el-button>
      <el-button @click="handleReset" icon="Refresh">重置</el-button>
    </div>

    <!-- 审计日志列表 -->
    <el-table
        :data="auditLogs"
        border
        row-key="id"
        :header-cell-style="{ background: '#fafafa', color: '#333', fontWeight: '600' }"
        style="flex: 1"
    >
      <el-table-column prop="time" label="使用时间" width="160" />
      <el-table-column prop="userId" label="用户ID" width="100" />
      <el-table-column prop="userName" label="姓名" width="100" />
      <el-table-column prop="department" label="部门" width="120" />
      <el-table-column prop="function" label="AI功能" width="120">
        <template #default="{ row }">
          <el-tag size="small">{{ getFunctionText(row.function) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="question" label="提问内容" min-width="200" show-overflow-tooltip />
      <el-table-column prop="response" label="AI响应" min-width="200" show-overflow-tooltip />
      <el-table-column prop="ip" label="客户端IP" width="140" />
      <el-table-column prop="status" label="操作状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)" size="small">{{ getStatusText(row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="100" align="center" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click="handleViewDetail(row)">详情</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 统计汇总 -->
    <el-card class="statistics-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>统计汇总</span>
          <el-button type="primary" @click="handleExport" icon="Download">导出Excel</el-button>
        </div>
      </template>
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="stat-item">
            <div class="stat-label">今日调用量</div>
            <div class="stat-value">1,234</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-item">
            <div class="stat-label">本周调用量</div>
            <div class="stat-value">8,567</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-item">
            <div class="stat-label">异常次数</div>
            <div class="stat-value" style="color: #f56c6c">12</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-item">
            <div class="stat-label">拦截次数</div>
            <div class="stat-value" style="color: #e6a23c">45</div>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 详情对话框 -->
    <AuditDetailDialog v-model="showDetailDialog" :data="currentLog" />
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import AuditDetailDialog from './AuditDetailDialog.vue'

const showDetailDialog = ref(false)
const currentLog = ref(null)

const filters = reactive({
  keyword: '',
  department: '',
  function: '',
  status: '',
  dateRange: null
})

const auditLogs = ref([
  { id: 1, time: '2026-04-15 10:30:25', userId: 'E001', userName: '张三', department: '技术部', function: 'qa', question: '如何配置Vue3项目？', response: 'Vue3项目配置步骤如下...', ip: '192.168.1.100', status: 'normal' },
  { id: 2, time: '2026-04-15 10:28:15', userId: 'E002', userName: '李四', department: '产品部', function: 'summary', question: '总结这份文档', response: '文档核心内容为...', ip: '192.168.1.101', status: 'normal' },
  { id: 3, time: '2026-04-15 10:25:40', userId: 'E003', userName: '王五', department: '财务部', function: 'writing', question: '生成项目代号A的报告', response: '', ip: '192.168.1.102', status: 'intercepted' },
  { id: 4, time: '2026-04-15 10:20:10', userId: 'E004', userName: '赵六', department: '技术部', function: 'qa', question: '系统异常查询', response: '', ip: '192.168.1.103', status: 'error' }
])

const getFunctionText = (func) => {
  const texts = {
    'qa': '智能问答',
    'summary': '文档总结',
    'writing': '文案生成',
    'assistant': '流程咨询',
    'knowledge': '知识库检索'
  }
  return texts[func] || func
}

const getStatusType = (status) => {
  const types = {
    'normal': 'success',
    'intercepted': 'warning',
    'error': 'danger'
  }
  return types[status] || ''
}

const getStatusText = (status) => {
  const texts = {
    'normal': '正常',
    'intercepted': '拦截',
    'error': '异常'
  }
  return texts[status] || status
}

const handleSearch = () => {
  ElMessage.success('搜索完成')
}

const handleReset = () => {
  Object.assign(filters, {
    keyword: '',
    department: '',
    function: '',
    status: '',
    dateRange: null
  })
  ElMessage.success('已重置筛选条件')
}

const handleViewDetail = (row) => {
  currentLog.value = row
  showDetailDialog.value = true
}

const handleExport = () => {
  ElMessage.success('导出成功')
}
</script>

<style lang="scss" scoped>
.usage-audit {
  display: flex;
  flex-direction: column;
  height: 100%;

  .filter-bar {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;
    flex-wrap: wrap;
  }

  .statistics-card {
    margin-top: 16px;
    flex-shrink: 0;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .stat-item {
      text-align: center;
      padding: 10px;

      .stat-label {
        font-size: 14px;
        color: #606266;
        margin-bottom: 8px;
      }

      .stat-value {
        font-size: 24px;
        font-weight: 600;
        color: #409eff;
      }
    }
  }
}
</style>
