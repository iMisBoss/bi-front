<template>
  <div class="list-view">
    <!-- 筛选栏 -->
    <div class="filter-bar">
      <el-select v-model="filterTime" placeholder="时间范围" clearable style="width: 150px">
        <el-option label="今日" value="today" />
        <el-option label="本周" value="week" />
        <el-option label="本月" value="month" />
        <el-option label="自定义" value="custom" />
      </el-select>
      <el-select v-model="filterType" placeholder="日程类型" clearable style="width: 150px">
        <el-option label="个人日程" value="personal" />
        <el-option label="会议日程" value="meeting" />
        <el-option label="共享日程" value="shared" />
        <el-option label="待办关联" value="todo" />
      </el-select>
      <el-select v-model="filterStatus" placeholder="状态" clearable style="width: 120px">
        <el-option label="未开始" value="pending" />
        <el-option label="进行中" value="ongoing" />
        <el-option label="已完成" value="completed" />
        <el-option label="已取消" value="cancelled" />
      </el-select>
      <el-select v-model="filterPriority" placeholder="优先级" clearable style="width: 120px">
        <el-option label="高" value="high" />
        <el-option label="中" value="medium" />
        <el-option label="低" value="low" />
      </el-select>
      <el-date-picker v-if="filterTime === 'custom'" v-model="dateRange" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" style="width: 240px" />
      <div class="filter-actions">
        <el-button @click="handleRefresh" icon="Refresh">刷新</el-button>
      </div>
    </div>

    <!-- 批量操作栏 -->
    <div v-if="selectedRows.length > 0" class="batch-bar">
      <span class="selected-count">已选择 {{ selectedRows.length }} 项</span>
      <el-button size="small" type="success" @click="$emit('batch-complete')" icon="CircleCheck">批量完成</el-button>
      <el-button size="small" type="danger" @click="$emit('batch-delete')" icon="Delete">批量删除</el-button>
      <el-button size="small" @click="clearSelection" icon="Close">取消选择</el-button>
    </div>

    <!-- 日程列表 -->
    <el-table
        :data="filteredSchedules"
        border
        @selection-change="handleSelectionChange"
        :header-cell-style="{ background: '#fafafa', color: '#333', fontWeight: '600' }"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="title" label="日程标题" min-width="200" show-overflow-tooltip>
        <template #default="{ row }">
          <div class="title-cell">
            <span class="priority-dot" :class="row.priority"></span>
            <span>{{ row.title }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="startTime" label="开始时间" width="160" sortable />
      <el-table-column prop="endTime" label="结束时间" width="160" />
      <el-table-column prop="location" label="地点" width="150" show-overflow-tooltip />
      <el-table-column prop="participants" label="参与人" width="200">
        <template #default="{ row }">
          <el-tag v-for="person in row.participants" :key="person" size="small" style="margin-right: 4px">
            {{ person }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)" size="small">{{ getStatusText(row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="priority" label="优先级" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="getPriorityType(row.priority)" size="small">{{ getPriorityText(row.priority) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180" align="center" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click="$emit('edit', row)">编辑</el-button>
          <el-button link type="success" size="small" @click="handleComplete(row)" v-if="row.status !== 'completed'">完成</el-button>
          <el-button link type="danger" size="small" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-wrapper">
      <el-pagination
          :total="filteredSchedules.length"
          :page-size="20"
          layout="total, prev, pager, next, jumper"
      />
      <div class="export-btn">
        <el-button @click="$emit('export')" icon="Download">导出Excel</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const props = defineProps({
  schedules: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['edit', 'batch-delete', 'batch-complete', 'export'])

const filterTime = ref('')
const filterType = ref('')
const filterStatus = ref('')
const filterPriority = ref('')
const dateRange = ref([])
const selectedRows = ref([])

const filteredSchedules = computed(() => {
  let result = [...props.schedules]

  if (filterStatus.value) {
    result = result.filter(item => item.status === filterStatus.value)
  }

  if (filterPriority.value) {
    result = result.filter(item => item.priority === filterPriority.value)
  }

  if (filterType.value === 'shared') {
    result = result.filter(item => item.shared)
  }

  return result
})

const getStatusType = (status) => {
  const types = {
    'pending': 'info',
    'ongoing': 'success',
    'completed': '',
    'cancelled': 'danger'
  }
  return types[status] || ''
}

const getStatusText = (status) => {
  const texts = {
    'pending': '未开始',
    'ongoing': '进行中',
    'completed': '已完成',
    'cancelled': '已取消'
  }
  return texts[status] || status
}

const getPriorityType = (priority) => {
  const types = {
    'high': 'danger',
    'medium': 'warning',
    'low': 'info'
  }
  return types[priority] || ''
}

const getPriorityText = (priority) => {
  const texts = {
    'high': '高',
    'medium': '中',
    'low': '低'
  }
  return texts[priority] || priority
}

const handleSelectionChange = (selection) => {
  selectedRows.value = selection
}

const clearSelection = () => {
  selectedRows.value = []
}

const handleComplete = (row) => {
  ElMessageBox.confirm(`确定要标记「${row.title}」为已完成吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'info'
  }).then(() => {
    ElMessage.success('操作成功')
  }).catch(() => {})
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除「${row.title}」吗？`, '删除确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('删除成功')
  }).catch(() => {})
}

const handleRefresh = () => {
  ElMessage.success('刷新成功')
}
</script>

<style lang="scss" scoped>
.list-view {
  .filter-bar {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;
    flex-wrap: wrap;
    align-items: center;

    .filter-actions {
      margin-left: auto;
    }
  }

  .batch-bar {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    margin-bottom: 16px;
    background: #f0f9ff;
    border: 1px solid #d9ecff;
    border-radius: 4px;

    .selected-count {
      font-weight: 600;
      color: #409eff;
      margin-right: auto;
    }
  }

  .title-cell {
    display: flex;
    align-items: center;
    gap: 8px;

    .priority-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      flex-shrink: 0;

      &.high {
        background: #f56c6c;
      }

      &.medium {
        background: #e6a23c;
      }

      &.low {
        background: #909399;
      }
    }
  }

  .pagination-wrapper {
    margin-top: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
</style>
