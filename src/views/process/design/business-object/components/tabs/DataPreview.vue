<template>
  <div class="data-preview">
    <div class="tab-toolbar">
      <div class="toolbar-left">
        <el-input v-model="previewSearch" placeholder="搜索" style="width: 200px" clearable />
        <el-select v-model="previewStatusFilter" placeholder="状态" style="width: 120px" clearable>
          <el-option label="草稿" value="draft" />
          <el-option label="审批中" value="approving" />
          <el-option label="已通过" value="approved" />
          <el-option label="已驳回" value="rejected" />
        </el-select>
        <el-date-picker v-model="previewDateRange" type="daterange" range-separator="~" start-placeholder="开始日期" end-placeholder="结束日期" style="width: 260px" />
        <el-button type="primary" icon="Search">查询</el-button>
        <el-button icon="Refresh">重置</el-button>
      </div>
      <div class="toolbar-right">
        <el-button type="primary" size="default" icon="Download">导出 Excel</el-button>
        <el-button size="default" icon="Edit">在线编辑</el-button>
      </div>
    </div>

    <el-table :data="previewList" border style="width: 100%" max-height="400">
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
      <el-table-column label="操作" width="200" align="center">
        <template #default="{ row }">
          <el-button size="small" type="primary" icon="View" @click="handleViewDetail(row)">查看详情</el-button>
          <el-button v-if="row.status === 'draft'" size="small" type="warning" icon="Edit" @click="handleEditData(row)">编辑</el-button>
          <el-button v-if="row.status === 'draft'" size="small" type="danger" icon="Delete" @click="handleDeleteData(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-bar">
      <span>共 100 条记录</span>
      <el-pagination layout="total, sizes, prev, pager, next, jumper" :total="100" :page-sizes="[10, 20, 50]" :page-size="10" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const previewSearch = ref('')
const previewStatusFilter = ref('')
const previewDateRange = ref(null)

const previewList = ref([
  { billNo: 'QJ20240115001', initiator: '张三', department: '技术部', field1: '事假', field2: '2 天', status: 'approved' },
  { billNo: 'QJ20240115002', initiator: '李四', department: '财务部', field1: '年假', field2: '5 天', status: 'approving' },
  { billNo: 'QJ20240115003', initiator: '王五', department: '人事部', field1: '病假', field2: '3 天', status: 'draft' }
])

const getStatusType = (status) => {
  const types = { draft: 'info', approving: 'warning', approved: 'success', rejected: 'danger' }
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = { draft: '草稿', approving: '审批中', approved: '已通过', rejected: '已驳回' }
  return texts[status] || status
}

const handleViewDetail = (row) => {
  ElMessage.info('查看详情功能开发中...')
}

const handleEditData = (row) => {
  ElMessage.info('在线编辑功能开发中...')
}

const handleDeleteData = (row) => {
  ElMessageBox.confirm(`确定要删除数据"${row.billNo}"吗？`, '删除确认', { type: 'warning' }).then(() => {
    previewList.value = previewList.value.filter(d => d.billNo !== row.billNo)
    ElMessage.success('删除成功')
  }).catch(() => {})
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
}
</style>
