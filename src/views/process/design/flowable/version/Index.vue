<template>
  <div class="flowable-version">
    <div class="page-header">
      <h2>流程版本管理</h2>
      <p class="subtitle">管理流程定义的版本，支持版本对比、回滚和发布</p>
    </div>

    <div class="toolbar">
      <div class="toolbar-left">
        <el-input
            v-model="searchKeyword"
            placeholder="搜索流程名称"
            clearable
            style="width: 300px"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-select v-model="filterStatus" placeholder="流程状态" clearable style="width: 150px">
          <el-option label="草稿" value="draft" />
          <el-option label="已发布" value="published" />
          <el-option label="已停用" value="disabled" />
        </el-select>
        <el-button type="primary" icon="Search" @click="handleSearch">查询</el-button>
        <el-button icon="Refresh" @click="handleReset">重置</el-button>
      </div>
      <div class="toolbar-right">
        <el-button type="primary" icon="Plus" @click="handleAdd">新建流程</el-button>
      </div>
    </div>

    <el-table
        :data="filteredVersionList"
        border
        style="width: 100%"
        v-loading="loading"
    >
      <el-table-column prop="processName" label="流程名称" min-width="180" />
      <el-table-column prop="version" label="版本号" width="100" align="center">
        <template #default="{ row }">
          <el-tag size="small">V{{ row.version }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="流程状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag size="small" :type="getStatusTag(row.status)">
            {{ getStatusText(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="nodeCount" label="节点数" width="80" align="center" />
      <el-table-column prop="deployTime" label="发布时间" width="180" />
      <el-table-column prop="creator" label="创建人" width="120" />
      <el-table-column label="操作" width="380" align="center" fixed="right">
        <template #default="{ row }">
          <div class="action-buttons">
            <el-button size="small" type="primary" icon="Edit" @click="handleEdit(row)">编辑</el-button>
            <el-button size="small" type="success" icon="Upload" @click="handleDeploy(row)">发布</el-button>
            <el-button size="small" type="info" icon="View" @click="handleView(row)">查看</el-button>
            <el-button
                v-if="row.status === 'published'"
                size="small"
                type="warning"
                icon="RefreshLeft"
                @click="handleRollback(row)"
            >
              停用
            </el-button>
            <el-button size="small" type="danger" icon="Delete" @click="handleDelete(row)">删除</el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-bar">
      <span>共 {{ filteredVersionList.length }} 条记录</span>
      <el-pagination
          layout="total, sizes, prev, pager, next, jumper"
          :total="filteredVersionList.length"
          :page-sizes="[10, 20, 50]"
          v-model:page-size="pageSize"
          v-model:current-page="currentPage"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Plus, Edit, Upload, View, RefreshLeft, Delete } from '@element-plus/icons-vue'

const searchKeyword = ref('')
const filterStatus = ref('')
const loading = ref(false)

const versionList = ref([
  {
    id: 1,
    processName: '请假审批流程',
    version: '1.3',
    status: 'published',
    nodeCount: 5,
    deployTime: '2024-03-15 14:20:00',
    creator: '系统管理员'
  },
  {
    id: 2,
    processName: '加班审批流程',
    version: '1.2',
    status: 'published',
    nodeCount: 4,
    deployTime: '2024-02-20 16:45:00',
    creator: '系统管理员'
  },
  {
    id: 3,
    processName: '费用报销流程',
    version: '1.1',
    status: 'published',
    nodeCount: 6,
    deployTime: '2024-01-10 17:30:00',
    creator: '财务管理员'
  },
  {
    id: 4,
    processName: '会议申请流程',
    version: '1.0',
    status: 'draft',
    nodeCount: 3,
    deployTime: '-',
    creator: '行政管理员'
  },
  {
    id: 5,
    processName: '车辆申请流程',
    version: '0.9',
    status: 'disabled',
    nodeCount: 4,
    deployTime: '2023-12-01 18:00:00',
    creator: '系统管理员'
  }
])

const pageSize = ref(10)
const currentPage = ref(1)

const filteredVersionList = computed(() => {
  let result = [...versionList.value]

  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(v => v.processName.toLowerCase().includes(keyword))
  }

  if (filterStatus.value) {
    result = result.filter(v => v.status === filterStatus.value)
  }

  return result
})

const handleSearch = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    ElMessage.success('查询完成')
  }, 500)
}

const handleReset = () => {
  searchKeyword.value = ''
  filterStatus.value = ''
  currentPage.value = 1
  ElMessage.success('已重置查询条件')
}

const handleAdd = () => {
  ElMessage.info('新建流程功能开发中...')
}

const handleEdit = (row) => {
  ElMessage.info(`编辑流程"${row.processName}"`)
}

const handleDeploy = (row) => {
  ElMessageBox.confirm(
      `确定要发布流程"${row.processName}" V${row.version} 吗？`,
      '发布确认',
      {
        confirmButtonText: '确认发布',
        cancelButtonText: '取消',
        type: 'info'
      }
  ).then(() => {
    row.status = 'published'
    row.deployTime = new Date().toLocaleString('zh-CN')
    ElMessage.success('流程发布成功')
  }).catch(() => {})
}

const handleView = (row) => {
  ElMessage.info(`查看流程"${row.processName}"`)
}

const handleRollback = (row) => {
  ElMessageBox.confirm(
      `确定要停用流程"${row.processName}"吗？停用后将无法发起新流程。`,
      '停用确认',
      {
        confirmButtonText: '确认停用',
        cancelButtonText: '取消',
        type: 'warning'
      }
  ).then(() => {
    row.status = 'disabled'
    ElMessage.success('流程已停用')
  }).catch(() => {})
}

const handleDelete = (row) => {
  ElMessageBox.confirm(
      `确定要删除流程"${row.processName}"吗？此操作不可恢复！`,
      '删除确认',
      {
        confirmButtonText: '确认删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
  ).then(() => {
    versionList.value = versionList.value.filter(v => v.id !== row.id)
    ElMessage.success('删除成功')
  }).catch(() => {})
}

const handleSizeChange = (size) => {
  pageSize.value = size
}

const handleCurrentChange = (page) => {
  currentPage.value = page
}

const getStatusTag = (status) => {
  const tags = { draft: 'info', published: 'success', disabled: 'warning' }
  return tags[status] || 'info'
}

const getStatusText = (status) => {
  const texts = { draft: '草稿', published: '已发布', disabled: '已停用' }
  return texts[status] || status
}
</script>

<style scoped lang="scss">
.flowable-version {
  padding: 20px;

  .page-header {
    margin-bottom: 24px;

    h2 {
      margin: 0 0 8px;
      font-size: 20px;
    }

    .subtitle {
      margin: 0;
      font-size: 14px;
      color: #909399;
    }
  }

  .toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    .toolbar-left,
    .toolbar-right {
      display: flex;
      gap: 12px;
    }
  }

  :deep(.el-table__cell) {
    .action-buttons {
      display: inline-flex !important;
      gap: 8px;
      justify-content: center;
      align-items: center;
      flex-wrap: nowrap !important;
      white-space: nowrap !important;

      .el-button {
        margin: 0 !important;
        white-space: nowrap !important;
      }
    }
  }

  .pagination-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 16px;
    padding: 12px 0;
  }
}
</style>
