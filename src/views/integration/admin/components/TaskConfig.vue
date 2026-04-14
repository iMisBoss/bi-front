<template>
  <div class="task-config">
    <!-- 工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <el-input v-model="searchKeyword" placeholder="搜索任务名称/编码" prefix-icon="Search" clearable style="width: 280px" />
        <el-select v-model="filterGroup" placeholder="任务分组" clearable style="width: 150px">
          <el-option label="系统任务" value="system" />
          <el-option label="业务任务" value="business" />
          <el-option label="集成任务" value="integration" />
        </el-select>
        <el-select v-model="filterStatus" placeholder="运行状态" clearable style="width: 150px">
          <el-option label="运行中" value="running" />
          <el-option label="已暂停" value="paused" />
        </el-select>
      </div>
      <div class="toolbar-right">
        <el-button type="primary" @click="handleAdd" icon="Plus">新增定时任务</el-button>
      </div>
    </div>

    <!-- 任务列表 -->
    <el-table
        :data="tasks"
        border
        row-key="id"
        :header-cell-style="{ background: '#fafafa', color: '#333', fontWeight: '600' }"
        style="flex: 1"
    >
      <el-table-column prop="code" label="任务编码" width="150" />
      <el-table-column prop="name" label="任务名称" min-width="180" />
      <el-table-column prop="className" label="任务类名" min-width="250" show-overflow-tooltip />
      <el-table-column prop="cron" label="Cron表达式" width="150" />
      <el-table-column prop="group" label="分组" width="120" align="center">
        <template #default="{ row }">
          <el-tag size="small">{{ getGroupText(row.group) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="row.status === 'running' ? 'success' : 'warning'" size="small">
            {{ row.status === 'running' ? '运行中' : '已暂停' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="240" align="center" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
          <el-button link type="success" size="small" @click="handleRunNow(row)">立即执行</el-button>
          <el-button link :type="row.status === 'running' ? 'warning' : 'success'" size="small" @click="handleToggle(row)">
            {{ row.status === 'running' ? '暂停' : '启动' }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-wrapper">
      <el-pagination
          :total="tasks.length"
          :page-size="20"
          layout="total, prev, pager, next, jumper"
      />
    </div>

    <!-- 任务编辑对话框 -->
    <TaskDialog
        v-model="showDialog"
        :type="dialogType"
        :data="currentTask"
        @confirm="handleConfirmSave"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import TaskDialog from './TaskDialog.vue'

const searchKeyword = ref('')
const filterGroup = ref('')
const filterStatus = ref('')
const showDialog = ref(false)
const dialogType = ref('add')
const currentTask = ref(null)

const tasks = ref([
  { id: 1, code: 'TASK_LOG_ARCHIVE', name: '日志归档任务', className: 'com.oa.task.LogArchiveTask', cron: '0 0 2 * * ?', group: 'system', status: 'running', params: '{}' },
  { id: 2, code: 'TASK_DATA_BACKUP', name: '数据备份任务', className: 'com.oa.task.DataBackupTask', cron: '0 0 3 * * ?', group: 'system', status: 'running', params: '{}' },
  { id: 3, code: 'TASK_HR_SYNC', name: 'HR人员同步', className: 'com.oa.task.HrSyncTask', cron: '0 0 */4 * * ?', group: 'integration', status: 'running', params: '{}' },
  { id: 4, code: 'TASK_STATS', name: '数据统计任务', className: 'com.oa.task.StatsTask', cron: '0 0 1 * * ?', group: 'business', status: 'paused', params: '{}' }
])

const getGroupText = (group) => {
  const texts = {
    'system': '系统任务',
    'business': '业务任务',
    'integration': '集成任务'
  }
  return texts[group] || group
}

const handleAdd = () => {
  dialogType.value = 'add'
  currentTask.value = null
  showDialog.value = true
}

const handleEdit = (row) => {
  dialogType.value = 'edit'
  currentTask.value = { ...row }
  showDialog.value = true
}

const handleRunNow = (row) => {
  ElMessageBox.confirm(`确定要立即执行任务「${row.name}」吗？`, '立即执行', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'info'
  }).then(() => {
    ElMessage.success('任务已提交执行')
  }).catch(() => {})
}

const handleToggle = (row) => {
  const action = row.status === 'running' ? '暂停' : '启动'
  ElMessageBox.confirm(`确定要${action}任务「${row.name}」吗？`, `${action}确认`, {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    row.status = row.status === 'running' ? 'paused' : 'running'
    ElMessage.success(`${action}成功`)
  }).catch(() => {})
}

const handleConfirmSave = (formData) => {
  if (formData.id) {
    const index = tasks.value.findIndex(item => item.id === formData.id)
    if (index !== -1) {
      tasks.value[index] = { ...tasks.value[index], ...formData }
    }
    ElMessage.success('编辑成功')
  } else {
    formData.id = Date.now()
    tasks.value.push(formData)
    ElMessage.success('新增成功')
  }
  showDialog.value = false
}
</script>

<style lang="scss" scoped>
.task-config {
  display: flex;
  flex-direction: column;
  height: 100%;

  .toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    .toolbar-left,
    .toolbar-right {
      display: flex;
      gap: 8px;
      align-items: center;
    }
  }

  .pagination-wrapper {
    margin-top: 16px;
    display: flex;
    justify-content: flex-end;
    flex-shrink: 0;
  }
}
</style>
