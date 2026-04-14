<template>
  <div class="meeting-record-detail">
    <el-tabs v-model="activeTab">
      <!-- 会议详情 -->
      <el-tab-pane label="会议详情" name="detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="会议主题">{{ recordData.title }}</el-descriptions-item>
          <el-descriptions-item label="会议室">{{ recordData.roomName }}</el-descriptions-item>
          <el-descriptions-item label="会议时间">{{ recordData.time }}</el-descriptions-item>
          <el-descriptions-item label="发起人">{{ recordData.initiator }}</el-descriptions-item>
          <el-descriptions-item label="参会人数">{{ recordData.participantCount }}人</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(recordData.status)" size="small">
              {{ getStatusText(recordData.status) }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>
      </el-tab-pane>

      <!-- 参会人员 -->
      <el-tab-pane label="参会人员" name="participants">
        <el-table :data="participants" border>
          <el-table-column prop="name" label="姓名" width="120" />
          <el-table-column prop="department" label="部门" />
          <el-table-column prop="position" label="职位" />
        </el-table>
      </el-tab-pane>

      <!-- 操作日志 -->
      <el-tab-pane label="操作日志" name="logs">
        <el-timeline>
          <el-timeline-item
              v-for="log in operationLogs"
              :key="log.id"
              :timestamp="log.time"
              placement="top"
          >
            <el-card>
              <p>{{ log.action }}</p>
              <p class="log-operator">操作人：{{ log.operator }}</p>
            </el-card>
          </el-timeline-item>
        </el-timeline>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  recordData: {
    type: Object,
    default: () => ({})
  }
})

defineEmits(['close'])

const activeTab = ref('detail')

const participants = ref([
  { name: '张三', department: '技术部', position: '工程师' },
  { name: '李四', department: '产品部', position: '产品经理' },
  { name: '王五', department: '设计部', position: 'UI设计师' }
])

const operationLogs = ref([
  { id: 1, action: '创建会议', operator: '张三', time: '2026-04-15 10:00:00' },
  { id: 2, action: '修改会议时间', operator: '张三', time: '2026-04-15 10:30:00' },
  { id: 3, action: '添加参会人员', operator: '李四', time: '2026-04-15 11:00:00' },
  { id: 4, action: '完成会议', operator: '系统', time: '2026-04-15 16:00:00' }
])

const getStatusType = (status) => {
  const typeMap = {
    completed: 'info',
    cancelled: 'danger',
    ongoing: 'warning'
  }
  return typeMap[status] || 'info'
}

const getStatusText = (status) => {
  const textMap = {
    completed: '已完成',
    cancelled: '已取消',
    ongoing: '进行中'
  }
  return textMap[status] || '未知'
}
</script>

<style scoped lang="scss">
.meeting-record-detail {
  padding: 20px;

  .log-operator {
    font-size: 12px;
    color: #909399;
    margin-top: 4px;
  }
}
</style>
