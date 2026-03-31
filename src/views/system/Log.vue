<template>
  <div class="log-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>系统日志</span>
          <div class="header-actions">
            <el-date-picker
                v-model="dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                style="margin-right: 10px"
                @change="handleDateChange"
            />
            <el-button @click="handleExport">
              <el-icon><Download /></el-icon>
              导出
            </el-button>
            <el-button @click="handleRefresh">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
            <el-button type="danger" @click="handleClear">
              <el-icon><Delete /></el-icon>
              清空
            </el-button>
          </div>
        </div>
      </template>

      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="日志级别">
          <el-select v-model="searchForm.level" placeholder="全部" clearable>
            <el-option label="DEBUG" value="DEBUG" />
            <el-option label="INFO" value="INFO" />
            <el-option label="WARN" value="WARN" />
            <el-option label="ERROR" value="ERROR" />
          </el-select>
        </el-form-item>
        <el-form-item label="模块">
          <el-select v-model="searchForm.module" placeholder="全部" clearable>
            <el-option label="用户管理" value="user" />
            <el-option label="权限管理" value="auth" />
            <el-option label="系统配置" value="system" />
            <el-option label="工作流" value="workflow" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="关键字">
          <el-input
              v-model="searchForm.keyword"
              placeholder="搜索日志内容"
              clearable
              @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="logList" style="width: 100%" v-loading="loading" height="500">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="level" label="级别" width="80">
          <template #default="{ row }">
            <el-tag :type="getLevelType(row.level)">
              {{ row.level }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="module" label="模块" width="100" />
        <el-table-column prop="content" label="内容" min-width="300" show-overflow-tooltip />
        <el-table-column prop="ip" label="IP 地址" width="140" />
        <el-table-column prop="operator" label="操作人" width="100" />
        <el-table-column prop="createTime" label="时间" width="180" />
        <el-table-column label="操作" width="100">
          <template #default="{ row }">
            <el-button size="small" @click="handleViewDetail(row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[20, 50, 100, 200]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <el-dialog v-model="detailDialogVisible" title="日志详情" width="800px">
      <el-descriptions :column="2" border v-if="selectedLog">
        <el-descriptions-item label="日志 ID">{{ selectedLog.id }}</el-descriptions-item>
        <el-descriptions-item label="日志级别">
          <el-tag :type="getLevelType(selectedLog.level)">
            {{ selectedLog.level }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="所属模块">{{ selectedLog.module }}</el-descriptions-item>
        <el-descriptions-item label="操作人">{{ selectedLog.operator }}</el-descriptions-item>
        <el-descriptions-item label="IP 地址">{{ selectedLog.ip }}</el-descriptions-item>
        <el-descriptions-item label="操作时间">{{ selectedLog.createTime }}</el-descriptions-item>
        <el-descriptions-item label="详细内容" :span="2">
          <pre style="white-space: pre-wrap; word-wrap: break-word">{{ selectedLog.detail }}</pre>
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Download, Refresh, Delete } from '@element-plus/icons-vue'

const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)
const detailDialogVisible = ref(false)
const selectedLog = ref(null)
const dateRange = ref([])

const searchForm = reactive({
  level: '',
  module: '',
  keyword: ''
})

const logList = ref([
  {
    id: 1,
    level: 'INFO',
    module: '用户管理',
    content: '用户 admin 登录系统',
    ip: '192.168.1.100',
    operator: 'admin',
    createTime: '2026-03-30 09:30:00',
    detail: '用户 admin 于 2026-03-30 09:30:00 成功登录系统，IP 地址：192.168.1.100'
  },
  {
    id: 2,
    level: 'WARN',
    module: '权限管理',
    content: '用户 test 尝试访问未授权资源',
    ip: '192.168.1.101',
    operator: 'test',
    createTime: '2026-03-30 09:25:00',
    detail: '用户 test 尝试访问 /api/admin/users 接口，但权限不足'
  },
  {
    id: 3,
    level: 'ERROR',
    module: '系统配置',
    content: '数据库连接失败',
    ip: '127.0.0.1',
    operator: 'system',
    createTime: '2026-03-30 09:20:00',
    detail: '数据库连接超时，请检查数据库服务状态'
  },
  {
    id: 4,
    level: 'DEBUG',
    module: '工作流',
    content: '流程实例启动成功',
    ip: '192.168.1.102',
    operator: 'user1',
    createTime: '2026-03-30 09:15:00',
    detail: '流程实例 ID: 12345，流程定义：请假审批流程'
  }
])

const getLevelType = (level) => {
  const typeMap = {
    'DEBUG': 'info',
    'INFO': 'success',
    'WARN': 'warning',
    'ERROR': 'danger'
  }
  return typeMap[level] || 'info'
}

const handleSearch = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    ElMessage.success('查询完成')
  }, 500)
}

const handleReset = () => {
  searchForm.level = ''
  searchForm.module = ''
  searchForm.keyword = ''
  dateRange.value = []
  handleSearch()
}

const handleDateChange = () => {
  handleSearch()
}

const handleRefresh = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    ElMessage.success('刷新成功')
  }, 500)
}

const handleExport = () => {
  ElMessage.info('正在导出日志数据...')
}

const handleClear = () => {
  ElMessageBox.confirm(
      '确定要清空所有日志吗？此操作不可恢复！',
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
  ).then(() => {
    ElMessage.success('日志已清空')
  }).catch(() => {})
}

const handleViewDetail = (row) => {
  selectedLog.value = row
  detailDialogVisible.value = true
}

const handleSizeChange = () => {
  // 处理分页变化
}

const handleCurrentChange = () => {
  // 处理分页变化
}

onMounted(() => {
  // 加载日志列表
})
</script>

<style scoped lang="scss">
.log-container {
  padding: 20px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .header-actions {
      display: flex;
      align-items: center;
    }
  }

  .search-form {
    margin-bottom: 20px;
  }

  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>
