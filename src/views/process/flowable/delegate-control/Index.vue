<template>
  <div class="delegate-control">
    <!-- 面包屑 -->
    <div class="page-header">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/admin/home' }">后台首页</el-breadcrumb-item>
        <el-breadcrumb-item>流程中心</el-breadcrumb-item>
        <el-breadcrumb-item>审批委托管控</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <!-- 查询区 -->
    <div class="search-area">
      <el-form :inline="true" :model="query">
        <el-form-item label="委托人">
          <el-input v-model="query.truster" placeholder="搜索委托人" clearable style="width: 160px">
            <template #prefix><el-icon><Search /></el-icon></template>
          </el-input>
        </el-form-item>
        <el-form-item label="受托人">
          <el-input v-model="query.trustee" placeholder="搜索受托人" clearable style="width: 160px">
            <template #prefix><el-icon><Search /></el-icon></template>
          </el-input>
        </el-form-item>
        <el-form-item label="委托状态">
          <el-select v-model="query.status" placeholder="全部" clearable style="width: 130px">
            <el-option label="生效中" value="active" />
            <el-option label="已失效" value="expired" />
            <el-option label="已撤销" value="revoked" />
          </el-select>
        </el-form-item>
        <el-form-item label="生效时间">
          <el-date-picker
              v-model="query.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="YYYY-MM-DD"
              style="width: 240px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>查询
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>重置
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 操作栏 -->
    <div class="action-bar">
      <div class="action-left">
        <el-button type="danger" plain :disabled="selection.length === 0" @click="handleBatchRevoke">
          <el-icon><Close /></el-icon>批量撤销
        </el-button>
      </div>
      <div class="action-right">
        <el-button @click="handleExport">
          <el-icon><Download /></el-icon>导出 Excel
        </el-button>
        <el-button @click="handleRefresh">
          <el-icon><Refresh /></el-icon>刷新
        </el-button>
      </div>
    </div>

    <!-- 数据表格 -->
    <div class="table-container" v-loading="loading">
      <el-table
          :data="tableData"
          border
          row-key="id"
          style="width: 100%"
          @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="50" align="center" />
        <el-table-column label="委托人" min-width="150">
          <template #default="{ row }">
            <div class="user-info">
              <span class="user-name">{{ row.truster }}</span>
              <span class="user-dept">{{ row.trusterDept }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="受托人" min-width="150">
          <template #default="{ row }">
            <div class="user-info">
              <span class="user-name">{{ row.trustee }}</span>
              <span class="user-dept">{{ row.trusteeDept }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="委托范围" min-width="160">
          <template #default="{ row }">
            <el-tag v-if="row.scope === 'all'" size="small" type="info">全部流程</el-tag>
            <el-tag v-else v-for="item in row.scopeNames" :key="item" size="small" style="margin-right: 4px">{{ item }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="生效时间" width="170" align="center" prop="startTime" />
        <el-table-column label="失效时间" width="170" align="center" prop="endTime" />
        <el-table-column label="委托状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="170" align="center" prop="createTime" />
        <el-table-column label="操作人" width="120" align="center" prop="operator" />
        <el-table-column label="操作" width="160" align="center" fixed="right">
          <template #default="{ row }">
            <div class="action-group">
              <el-button size="small" type="primary" link @click="handleView(row)">查看</el-button>
              <el-button v-if="row.status === 'active'" size="small" type="danger" link @click="handleRevoke(row)">撤销</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-bar">
        <el-pagination
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
            :page-sizes="[10, 20, 50, 100]"
            v-model:page-size="pageSize"
            v-model:current-page="currentPage"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 查看弹窗（只读） -->
    <el-dialog v-model="viewVisible" title="委托详情" width="600px">
      <el-descriptions :column="2" border v-if="currentRow">
        <el-descriptions-item label="委托人">{{ currentRow.truster }}</el-descriptions-item>
        <el-descriptions-item label="所属部门">{{ currentRow.trusterDept }}</el-descriptions-item>
        <el-descriptions-item label="受托人">{{ currentRow.trustee }}</el-descriptions-item>
        <el-descriptions-item label="所属部门">{{ currentRow.trusteeDept }}</el-descriptions-item>
        <el-descriptions-item label="委托范围" :span="2">
          <el-tag v-if="currentRow.scope === 'all'" type="info">全部流程</el-tag>
          <el-tag v-else v-for="item in currentRow.scopeNames" :key="item" style="margin-right: 6px">{{ item }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="生效时间">{{ currentRow.startTime }}</el-descriptions-item>
        <el-descriptions-item label="失效时间">{{ currentRow.endTime }}</el-descriptions-item>
        <el-descriptions-item label="委托状态">
          <el-tag :type="getStatusType(currentRow.status)">{{ getStatusText(currentRow.status) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="操作人">{{ currentRow.operator }}</el-descriptions-item>
        <el-descriptions-item label="创建时间" :span="2">{{ currentRow.createTime }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ currentRow.remark || '无' }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="viewVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Close, Download } from '@element-plus/icons-vue'

const loading = ref(false)
const selection = ref([])
const viewVisible = ref(false)
const currentRow = ref(null)

// 查询条件
const query = reactive({
  truster: '',
  trustee: '',
  status: '',
  dateRange: []
})

// 分页
const pageSize = ref(10)
const currentPage = ref(1)
const total = ref(25)

// 模拟数据
const tableData = ref([
  {
    id: 1,
    truster: '张三',
    trusterDept: '技术部',
    trustee: '李四',
    trusteeDept: '技术部',
    scope: 'all',
    scopeNames: [],
    startTime: '2024-04-01 09:00',
    endTime: '2024-04-05 18:00',
    status: 'active',
    createTime: '2024-03-31 10:00',
    operator: '系统',
    remark: '出差代审批'
  },
  {
    id: 2,
    truster: '王五',
    trusterDept: '财务部',
    trustee: '赵六',
    trusteeDept: '财务部',
    scope: 'specific',
    scopeNames: ['财务类'],
    startTime: '2024-04-02 09:00',
    endTime: '2024-04-06 18:00',
    status: 'active',
    createTime: '2024-04-01 14:00',
    operator: '系统',
    remark: '请假代审批'
  },
  {
    id: 3,
    truster: '孙七',
    trusterDept: '人事部',
    trustee: '周八',
    trusteeDept: '人事部',
    scope: 'all',
    scopeNames: [],
    startTime: '2024-03-01 09:00',
    endTime: '2024-03-05 18:00',
    status: 'expired',
    createTime: '2024-02-28 10:00',
    operator: '系统',
    remark: ''
  },
  {
    id: 4,
    truster: '吴九',
    trusterDept: '行政部',
    trustee: '郑十',
    trusteeDept: '行政部',
    scope: 'specific',
    scopeNames: ['行政类'],
    startTime: '2024-04-01 09:00',
    endTime: '2024-04-10 18:00',
    status: 'revoked',
    createTime: '2024-03-30 15:00',
    operator: '管理员',
    remark: '违规委托'
  }
])

const getStatusType = (status) => {
  return status === 'active' ? 'success' : status === 'expired' ? 'info' : 'danger'
}

const getStatusText = (status) => {
  return status === 'active' ? '生效中' : status === 'expired' ? '已失效' : '已撤销'
}

// 查询
const handleSearch = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    ElMessage.success('查询完成')
  }, 500)
}

// 重置
const handleReset = () => {
  query.truster = ''
  query.trustee = ''
  query.status = ''
  query.dateRange = []
  currentPage.value = 1
  ElMessage.success('已重置查询条件')
}

// 刷新
const handleRefresh = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    ElMessage.success('刷新成功')
  }, 500)
}

// 导出
const handleExport = () => {
  ElMessage.success('导出 Excel 成功，共 ' + total.value + ' 条记录')
}

// 查看
const handleView = (row) => {
  currentRow.value = row
  viewVisible.value = true
}

// 撤销
const handleRevoke = (row) => {
  ElMessageBox.confirm(
      `确定要强制撤销该委托吗？撤销后受托人将无法继续代审批。`,
      '撤销确认',
      {
        confirmButtonText: '确认撤销',
        cancelButtonText: '取消',
        type: 'warning'
      }
  ).then(() => {
    row.status = 'revoked'
    row.operator = '管理员'
    ElMessage.success('委托已强制撤销，受托人审批权限已回收')
  }).catch(() => {})
}

// 批量撤销
const handleBatchRevoke = () => {
  const activeSelection = selection.value.filter(item => item.status === 'active')
  if (activeSelection.length === 0) {
    ElMessage.warning('请选择生效中的委托记录')
    return
  }

  ElMessageBox.confirm(
      `确定要批量撤销选中的 ${activeSelection.length} 条委托吗？撤销后受托人将无法继续代审批。`,
      '批量撤销确认',
      {
        confirmButtonText: '确认批量撤销',
        cancelButtonText: '取消',
        type: 'warning'
      }
  ).then(() => {
    activeSelection.forEach(row => {
      row.status = 'revoked'
      row.operator = '管理员'
    })
    selection.value = []
    ElMessage.success(`已成功撤销 ${activeSelection.length} 条委托，受托人审批权限已回收`)
  }).catch(() => {})
}

// 选择变化
const handleSelectionChange = (val) => {
  selection.value = val
}

// 分页
const handleSizeChange = (size) => {
  pageSize.value = size
}

const handleCurrentChange = (page) => {
  currentPage.value = page
}
</script>

<style scoped lang="scss">
.delegate-control {
  height: calc(100vh - 50px);
  background: #f5f7fa;
  display: flex;
  flex-direction: column;

  .page-header {
    background: #fff;
    border-bottom: 1px solid #dee0e3;
    padding: 12px 24px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);

    :deep(.el-breadcrumb__inner) {
      font-size: 14px;
      color: #646a73;
    }

    :deep(.el-breadcrumb__separator) {
      color: #c0c4cc;
      margin: 0 8px;
    }
  }

  .search-area {
    background: #fff;
    border: 1px solid #dee0e3;
    border-radius: 6px;
    padding: 16px 20px;
    margin: 16px 24px 0;
  }

  .action-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 24px;
    margin-top: 12px;

    .action-left,
    .action-right {
      display: flex;
      gap: 10px;
    }

    :deep(.el-button) {
      height: 36px;
      border-radius: 4px;

      .el-icon {
        margin-right: 6px;
      }
    }
  }

  .table-container {
    flex: 1;
    margin: 0 24px 16px;
    background: #fff;
    border: 1px solid #dee0e3;
    border-radius: 6px;
    overflow: hidden;
    display: flex;
    flex-direction: column;

    :deep(.el-table) {
      flex: 1;
      border-radius: 6px;
      overflow: hidden;
    }

    .user-info {
      display: flex;
      flex-direction: column;
      gap: 2px;

      .user-name {
        font-weight: 500;
        color: #303133;
      }

      .user-dept {
        font-size: 12px;
        color: #909399;
      }
    }

    .action-group {
      display: inline-flex;
      align-items: center;
      gap: 2px;
      flex-wrap: nowrap;

      :deep(.el-button--link) {
        padding: 0 6px;
        margin: 0;
        font-size: 13px;
      }
    }

    .pagination-bar {
      padding: 12px 16px;
      display: flex;
      justify-content: flex-end;
      background: #fff;
      border-top: 1px solid #ebeef5;
    }
  }
}
</style>
