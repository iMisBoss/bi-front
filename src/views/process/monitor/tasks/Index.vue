<template>
  <div class="task-monitor">
    <div class="page-header">
      <h2>任务监控中心</h2>
      <p class="subtitle">监控所有待办任务和已办任务的执行情况</p>
    </div>

    <el-tabs v-model="activeTab">
      <el-tab-pane label="待办任务" name="todo">
        <div class="toolbar">
          <div class="toolbar-left">
            <el-input
                v-model="todoSearchKeyword"
                placeholder="搜索任务名称、流程名称"
                clearable
                style="width: 300px"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <el-button type="primary" icon="Search" @click="handleTodoSearch">查询</el-button>
            <el-button icon="Refresh" @click="handleTodoReset">重置</el-button>
          </div>
        </div>

        <el-table :data="filteredTodoList" border style="width: 100%" v-loading="loading">
          <el-table-column prop="taskId" label="任务ID" width="100" align="center" />
          <el-table-column prop="taskName" label="任务名称" min-width="180" />
          <el-table-column prop="processName" label="流程名称" min-width="180" />
          <el-table-column prop="billNo" label="单据编号" width="150" />
          <el-table-column prop="assignee" label="处理人" width="120" />
          <el-table-column prop="priority" label="优先级" width="100" align="center">
            <template #default="{ row }">
              <el-tag size="small" :type="getPriorityTag(row.priority)">
                {{ getPriorityText(row.priority) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="到达时间" width="180" />
          <el-table-column prop="duration" label="停留时长" width="120" />
          <el-table-column label="操作" width="180" align="center" fixed="right">
            <template #default="{ row }">
              <div class="action-buttons">
                <el-button size="small" type="primary" icon="View" @click="handleTodoView(row)">查看</el-button>
                <el-button size="small" type="success" icon="Bell" @click="handleUrge(row)">催办</el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <el-tab-pane label="已办任务" name="done">
        <div class="toolbar">
          <div class="toolbar-left">
            <el-input
                v-model="doneSearchKeyword"
                placeholder="搜索任务名称、流程名称"
                clearable
                style="width: 300px"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <el-button type="primary" icon="Search" @click="handleDoneSearch">查询</el-button>
            <el-button icon="Refresh" @click="handleDoneReset">重置</el-button>
          </div>
        </div>

        <el-table :data="filteredDoneList" border style="width: 100%" v-loading="loading">
          <el-table-column prop="taskId" label="任务ID" width="100" align="center" />
          <el-table-column prop="taskName" label="任务名称" min-width="180" />
          <el-table-column prop="processName" label="流程名称" min-width="180" />
          <el-table-column prop="billNo" label="单据编号" width="150" />
          <el-table-column prop="handler" label="处理人" width="120" />
          <el-table-column prop="handleResult" label="处理结果" width="100" align="center">
            <template #default="{ row }">
              <el-tag size="small" :type="row.handleResult === 'approved' ? 'success' : 'danger'">
                {{ row.handleResult === 'approved' ? '通过' : '驳回' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="handleTime" label="处理时间" width="180" />
          <el-table-column prop="duration" label="处理时长" width="120" />
          <el-table-column label="操作" width="100" align="center" fixed="right">
            <template #default="{ row }">
              <el-button size="small" type="primary" icon="View" @click="handleDoneView(row)">查看</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Refresh, View, Bell } from '@element-plus/icons-vue'

const activeTab = ref('todo')
const loading = ref(false)

// 待办任务
const todoSearchKeyword = ref('')
const todoList = ref([
  {
    taskId: 'T001',
    taskName: '部门经理审批',
    processName: '请假审批流程',
    billNo: 'QJ20240408001',
    assignee: '李四',
    priority: 'high',
    createTime: '2024-04-08 09:00:00',
    duration: '2小时30分'
  },
  {
    taskId: 'T002',
    taskName: '财务审核',
    processName: '费用报销流程',
    billNo: 'BX20240408002',
    assignee: '王五',
    priority: 'normal',
    createTime: '2024-04-08 10:15:00',
    duration: '1小时15分'
  },
  {
    taskId: 'T003',
    taskName: '总经理审批',
    processName: '加班审批流程',
    billNo: 'JB20240408003',
    assignee: '赵六',
    priority: 'urgent',
    createTime: '2024-04-08 11:00:00',
    duration: '30分钟'
  }
])

// 已办任务
const doneSearchKeyword = ref('')
const doneList = ref([
  {
    taskId: 'T004',
    taskName: '部门经理审批',
    processName: '会议申请流程',
    billNo: 'HY20240407004',
    handler: '孙七',
    handleResult: 'approved',
    handleTime: '2024-04-07 15:30:00',
    duration: '1小时'
  },
  {
    taskId: 'T005',
    taskName: 'HR审核',
    processName: '请假审批流程',
    billNo: 'QJ20240407005',
    handler: '周八',
    handleResult: 'rejected',
    handleTime: '2024-04-07 16:45:00',
    duration: '2小时'
  }
])

const filteredTodoList = computed(() => {
  let result = [...todoList.value]
  if (todoSearchKeyword.value) {
    const keyword = todoSearchKeyword.value.toLowerCase()
    result = result.filter(t =>
        t.taskName.toLowerCase().includes(keyword) ||
        t.processName.toLowerCase().includes(keyword)
    )
  }
  return result
})

const filteredDoneList = computed(() => {
  let result = [...doneList.value]
  if (doneSearchKeyword.value) {
    const keyword = doneSearchKeyword.value.toLowerCase()
    result = result.filter(t =>
        t.taskName.toLowerCase().includes(keyword) ||
        t.processName.toLowerCase().includes(keyword)
    )
  }
  return result
})

const handleTodoSearch = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    ElMessage.success('查询完成')
  }, 500)
}

const handleTodoReset = () => {
  todoSearchKeyword.value = ''
  ElMessage.success('已重置查询条件')
}

const handleDoneSearch = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    ElMessage.success('查询完成')
  }, 500)
}

const handleDoneReset = () => {
  doneSearchKeyword.value = ''
  ElMessage.success('已重置查询条件')
}

const handleTodoView = (row) => {
  ElMessage.info(`查看待办任务 ${row.taskId}`)
}

const handleDoneView = (row) => {
  ElMessage.info(`查看已办任务 ${row.taskId}`)
}

const handleUrge = (row) => {
  ElMessage.success(`已向 ${row.assignee} 发送催办通知`)
}

const getPriorityTag = (priority) => {
  const tags = { urgent: 'danger', high: 'warning', normal: 'info', low: 'success' }
  return tags[priority] || 'info'
}

const getPriorityText = (priority) => {
  const texts = { urgent: '紧急', high: '高', normal: '普通', low: '低' }
  return texts[priority] || priority
}
</script>

<style scoped lang="scss">
.task-monitor {
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

    .toolbar-left {
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
}
</style>
