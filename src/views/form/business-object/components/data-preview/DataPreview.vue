<template>
  <div class="data-preview">
    <div class="tab-toolbar">
      <div class="toolbar-left">
        <el-input v-model="previewSearch" placeholder="搜索" style="width: 200px" clearable @keyup.enter="handleSearch" />
        <el-select v-model="previewStatusFilter" placeholder="状态" style="width: 120px" clearable>
          <el-option label="草稿" value="draft" />
          <el-option label="审批中" value="approving" />
          <el-option label="已通过" value="approved" />
          <el-option label="已驳回" value="rejected" />
        </el-select>
        <el-date-picker v-model="previewDateRange" type="daterange" range-separator="~" start-placeholder="开始日期" end-placeholder="结束日期" style="width: 260px" />
        <el-button type="primary" icon="Search" @click="handleSearch" :loading="searching">查询</el-button>
        <el-button icon="Refresh" @click="handleReset">重置</el-button>
      </div>
      <div class="toolbar-right">
        <el-button type="primary" size="default" icon="Download" @click="handleExport">导出 Excel</el-button>
        <el-button size="default" icon="Edit" @click="handleOnlineEdit">在线编辑</el-button>
      </div>
    </div>

    <el-table :data="filteredPreviewList" border style="width: 100%" max-height="400" v-loading="loading">
      <el-table-column prop="billNo" label="单据号" min-width="150" />
      <el-table-column prop="initiator" label="发起人" min-width="100" />
      <el-table-column prop="department" label="发起部门" min-width="120" />
      <el-table-column prop="field1" label="核心字段 1" min-width="150" />
      <el-table-column prop="field2" label="核心字段 2" min-width="150" />
      <el-table-column prop="status" label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag size="small" :type="getStatusType(row.status)">
            {{ getStatusText(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="220" align="center">
        <template #default="{ row }">
          <div class="action-buttons">
            <el-button size="small" type="primary" icon="View" @click="handleViewDetail(row)">查看详情</el-button>
            <el-button v-if="row.status === 'draft'" size="small" type="warning" icon="Edit" @click="handleEditData(row)">编辑</el-button>
            <el-button v-if="row.status === 'draft'" size="small" type="danger" icon="Delete" @click="handleDeleteData(row)">删除</el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-bar">
      <span>共 {{ filteredPreviewList.length }} 条记录</span>
      <el-pagination
          layout="total, sizes, prev, pager, next, jumper"
          :total="filteredPreviewList.length"
          :page-sizes="[10, 20, 50]"
          v-model:page-size="pageSize"
          v-model:current-page="currentPage"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
      />
    </div>

    <!-- 查看详情对话框 -->
    <el-dialog
        v-model="detailDialogVisible"
        title="数据详情"
        width="600px"
        :close-on-click-modal="false"
    >
      <el-descriptions :column="1" border v-if="currentDetail">
        <el-descriptions-item label="单据号">{{ currentDetail.billNo }}</el-descriptions-item>
        <el-descriptions-item label="发起人">{{ currentDetail.initiator }}</el-descriptions-item>
        <el-descriptions-item label="发起部门">{{ currentDetail.department }}</el-descriptions-item>
        <el-descriptions-item label="核心字段 1">{{ currentDetail.field1 }}</el-descriptions-item>
        <el-descriptions-item label="核心字段 2">{{ currentDetail.field2 }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(currentDetail.status)">
            {{ getStatusText(currentDetail.status) }}
          </el-tag>
        </el-descriptions-item>
      </el-descriptions>

      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 在线编辑对话框 -->
    <el-dialog
        v-model="editDialogVisible"
        title="在线编辑"
        width="700px"
        :close-on-click-modal="false"
    >
      <el-form :model="editForm" label-width="100px">
        <el-form-item label="单据号">
          <el-input v-model="editForm.billNo" disabled />
        </el-form-item>
        <el-form-item label="发起人">
          <el-input v-model="editForm.initiator" disabled />
        </el-form-item>
        <el-form-item label="发起部门">
          <el-input v-model="editForm.department" disabled />
        </el-form-item>
        <el-form-item label="核心字段 1">
          <el-input v-model="editForm.field1" />
        </el-form-item>
        <el-form-item label="核心字段 2">
          <el-input v-model="editForm.field2" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveEdit" :loading="saving">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const previewSearch = ref('')
const previewStatusFilter = ref('')
const previewDateRange = ref(null)
const searching = ref(false)
const loading = ref(false)
const saving = ref(false)

const previewList = ref([
  { billNo: 'QJ20240115001', initiator: '张三', department: '技术部', field1: '事假', field2: '2 天', status: 'approved' },
  { billNo: 'QJ20240115002', initiator: '李四', department: '财务部', field1: '年假', field2: '5 天', status: 'approving' },
  { billNo: 'QJ20240115003', initiator: '王五', department: '人事部', field1: '病假', field2: '3 天', status: 'draft' },
  { billNo: 'QJ20240115004', initiator: '赵六', department: '市场部', field1: '调休', field2: '1 天', status: 'rejected' },
  { billNo: 'QJ20240115005', initiator: '钱七', department: '运营部', field1: '婚假', field2: '10 天', status: 'draft' }
])

const pageSize = ref(10)
const currentPage = ref(1)

// 过滤后的列表
const filteredPreviewList = computed(() => {
  let result = [...previewList.value]

  // 搜索过滤
  if (previewSearch.value) {
    const search = previewSearch.value.toLowerCase()
    result = result.filter(item =>
        item.billNo.toLowerCase().includes(search) ||
        item.initiator.toLowerCase().includes(search) ||
        item.department.toLowerCase().includes(search)
    )
  }

  // 状态过滤
  if (previewStatusFilter.value) {
    result = result.filter(item => item.status === previewStatusFilter.value)
  }

  // 日期过滤（简化实现）
  if (previewDateRange.value && previewDateRange.value.length === 2) {
    // 这里可以添加日期过滤逻辑
  }

  return result
})

// 对话框状态
const detailDialogVisible = ref(false)
const editDialogVisible = ref(false)
const currentDetail = ref(null)
const editForm = ref({})

const getStatusType = (status) => {
  const types = { draft: 'info', approving: 'warning', approved: 'success', rejected: 'danger' }
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = { draft: '草稿', approving: '审批中', approved: '已通过', rejected: '已驳回' }
  return texts[status] || status
}

// 查询
const handleSearch = () => {
  searching.value = true
  loading.value = true

  setTimeout(() => {
    searching.value = false
    loading.value = false
    ElMessage.success('查询完成')
  }, 500)
}

// 重置
const handleReset = () => {
  previewSearch.value = ''
  previewStatusFilter.value = ''
  previewDateRange.value = null
  currentPage.value = 1
  ElMessage.success('已重置查询条件')
}

// 导出 Excel
const handleExport = () => {
  ElMessageBox.confirm('确定要导出当前查询结果吗？', '导出确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'info'
  }).then(() => {
    // 构建导出数据
    const headers = ['单据号', '发起人', '发起部门', '核心字段 1', '核心字段 2', '状态']
    const csvContent = [
      headers.join(','),
      ...filteredPreviewList.value.map(item => [
        item.billNo,
        item.initiator,
        item.department,
        item.field1,
        item.field2,
        getStatusText(item.status)
      ].join(','))
    ].join('\n')

    // 下载文件
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `数据预览_${new Date().getTime()}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    ElMessage.success(`成功导出 ${filteredPreviewList.value.length} 条记录`)
  }).catch(() => {})
}

// 在线编辑
const handleOnlineEdit = () => {
  ElMessage.info('在线编辑功能需要后端支持，当前仅支持单条编辑')
}

// 查看详情
const handleViewDetail = (row) => {
  currentDetail.value = { ...row }
  detailDialogVisible.value = true
}

// 编辑数据
const handleEditData = (row) => {
  editForm.value = { ...row }
  editDialogVisible.value = true
}

// 保存编辑
const handleSaveEdit = () => {
  saving.value = true

  setTimeout(() => {
    const index = previewList.value.findIndex(item => item.billNo === editForm.value.billNo)
    if (index !== -1) {
      previewList.value[index] = { ...editForm.value }
    }

    saving.value = false
    editDialogVisible.value = false
    ElMessage.success('保存成功')
  }, 500)
}

// 删除数据
const handleDeleteData = (row) => {
  ElMessageBox.confirm(`确定要删除数据"${row.billNo}"吗？此操作不可恢复。`, '删除确认', {
    confirmButtonText: '确认删除',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    previewList.value = previewList.value.filter(d => d.billNo !== row.billNo)
    ElMessage.success('删除成功')
  }).catch(() => {})
}

// 分页相关
const handleSizeChange = (size) => {
  pageSize.value = size
}

const handleCurrentChange = (page) => {
  currentPage.value = page
}
</script>

<style scoped lang="scss">
.data-preview {
  .tab-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    .toolbar-left {
      display: flex;
      gap: 12px;
    }
  }

  .pagination-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 16px;
    padding: 12px 0;
  }

  // 操作按钮组不换行
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
}
</style>
